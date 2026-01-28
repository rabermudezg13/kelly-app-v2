"""
Info Session API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.info_session import InfoSession, InfoSessionStep
from app.models.recruiter import Recruiter
from app.services.exclusion_service import check_name_in_exclusion_list, is_in_exclusion_list
from app.models.exclusion_list import ExclusionList
from app.services.recruiter_service import get_next_recruiter, initialize_default_recruiters
from datetime import date

router = APIRouter()

# Pydantic models for request/response
class InfoSessionRegistration(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    zip_code: str
    session_type: str  # new-hire or reactivation
    time_slot: str  # 8:30 AM or 1:30 PM

class ExclusionMatchInfo(BaseModel):
    """Information about exclusion list match"""
    name: str
    code: Optional[str] = None
    ssn: Optional[str] = None

class InfoSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    zip_code: str
    session_type: str
    time_slot: str
    is_in_exclusion_list: bool
    exclusion_warning_shown: bool
    exclusion_match: Optional[ExclusionMatchInfo] = None  # Data from exclusion list if matched
    status: str
    ob365_sent: bool = False
    i9_sent: bool = False
    existing_i9: bool = False
    ineligible: bool = False
    rejected: bool = False
    drug_screen: bool = False
    questions: bool = False
    assigned_recruiter_id: Optional[int] = None
    assigned_recruiter_name: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    question_1_response: Optional[str] = None
    question_2_response: Optional[str] = None
    question_3_response: Optional[str] = None
    question_4_response: Optional[str] = None
    created_at: datetime

class InfoSessionStepModel(BaseModel):
    step_name: str
    step_description: str
    is_completed: bool

class InfoSessionWithSteps(InfoSessionResponse):
    steps: List[InfoSessionStepModel]

def get_exclusion_match_info(db: Session, first_name: str, last_name: str) -> Optional[ExclusionMatchInfo]:
    """Get exclusion match info for a name"""
    exclusion_matches = check_name_in_exclusion_list(db, first_name, last_name)
    if exclusion_matches:
        first_match = exclusion_matches[0]
        return ExclusionMatchInfo(
            name=first_match.name,
            code=first_match.code,
            ssn=first_match.ssn
        )
    return None

# Default steps for Info Session
DEFAULT_STEPS = [
    {
        "step_name": "english_communication",
        "step_description": "For our process you must be able to communicate in English"
    },
    {
        "step_name": "education_proof",
        "step_description": "Education Proof: You can provide it in physical or digital format. If you don't have it available today, you can send it later. However, to be hired, we need your Education Proof. If your Education Proof is not from the U.S., you must have the equivalence. If you don't have it, our representatives will inform you how to do it"
    },
    {
        "step_name": "two_government_ids",
        "step_description": "Two Forms of Government ID such as: Driver's License, Social Security Card, U.S. Passport, Birth Certificate, Permanent Resident Card, Work Permit Card. Documents must be physical originals, not copies, and must not be expired. If you don't have them today, you can bring them during New Hire Orientation or complete part of the process today, but you must come with the physical documents to complete the I-9 section, which is vital for your hiring process. Without completing this section, we cannot hire you"
    }
]

@router.post("/register", response_model=InfoSessionWithSteps, status_code=status.HTTP_201_CREATED)
async def register_info_session(
    registration: InfoSessionRegistration,
    db: Session = Depends(get_db)
):
    """
    Register a new info session
    Checks exclusion list, assigns recruiter, and creates default steps
    """
    # Initialize default recruiters if needed
    initialize_default_recruiters(db)
    
    # Check exclusion list
    print(f"🔍 Checking exclusion list for: {registration.first_name} {registration.last_name}")
    exclusion_matches = check_name_in_exclusion_list(
        db,
        registration.first_name,
        registration.last_name
    )
    is_excluded = len(exclusion_matches) > 0
    print(f"🔍 Exclusion check result: {len(exclusion_matches)} matches found, is_excluded={is_excluded}")
    if exclusion_matches:
        for match in exclusion_matches:
            print(f"   - Match: {match.name} (Code: {match.code}, SSN: {match.ssn})")
    
    # Get exclusion match info (use first match if any)
    exclusion_match_info = None
    if exclusion_matches:
        first_match = exclusion_matches[0]
        exclusion_match_info = ExclusionMatchInfo(
            name=first_match.name,
            code=first_match.code,
            ssn=first_match.ssn
        )
    
    # Assign recruiter equitably - ALWAYS assign a recruiter
    assigned_recruiter = get_next_recruiter(db, registration.time_slot, date.today())
    
    # Ensure we always have a recruiter assigned
    if not assigned_recruiter:
        # Last resort: get the first active recruiter or create one
        initialize_default_recruiters(db)
        assigned_recruiter = db.query(Recruiter).filter(Recruiter.is_active == True).first()
        if not assigned_recruiter:
            # Create a fallback recruiter
            from app.models.recruiter import Recruiter
            assigned_recruiter = Recruiter(
                name="Default Recruiter",
                email="recruiter@kellyeducation.com",
                status="available"
            )
            db.add(assigned_recruiter)
            db.commit()
            db.refresh(assigned_recruiter)
    
    # Debug: Log assignment
    print(f"✅ Info Session created for {registration.first_name} {registration.last_name}")
    print(f"   Assigned to recruiter ID: {assigned_recruiter.id}, Name: {assigned_recruiter.name}, Email: {assigned_recruiter.email}")
    
    # Create info session record - ALWAYS with a recruiter assigned
    print(f"📝 Creating session with status='initiated'")
    info_session = InfoSession(
        first_name=registration.first_name,
        last_name=registration.last_name,
        email=registration.email,
        phone=registration.phone,
        zip_code=registration.zip_code,
        session_type=registration.session_type,
        time_slot=registration.time_slot,
        is_in_exclusion_list=is_excluded,
        exclusion_warning_shown=is_excluded,
        status="initiated",  # New sessions start as initiated, change to answers_submitted when questions are answered
        assigned_recruiter_id=assigned_recruiter.id,  # Always assigned now
        started_at=datetime.utcnow()  # Set started_at when session is created
    )
    print(f"📝 Session object created with status='{info_session.status}'")
    
    db.add(info_session)
    db.commit()
    db.refresh(info_session)
    print(f"📝 Session saved to DB with status='{info_session.status}'")
    
    # Create default steps
    for step_data in DEFAULT_STEPS:
        step = InfoSessionStep(
            info_session_id=info_session.id,
            step_name=step_data["step_name"],
            step_description=step_data["step_description"],
            is_completed=False
        )
        db.add(step)
    
    db.commit()
    db.refresh(info_session)
    print(f"📝 After creating steps, session status='{info_session.status}'")

    # Return with steps
    # Get recruiter name if assigned
    recruiter_name = None
    if assigned_recruiter:
        recruiter_name = assigned_recruiter.name
    
    # Get steps
    steps_data = [
        {
            "step_name": step.step_name,
            "step_description": step.step_description,
            "is_completed": step.is_completed
        }
        for step in info_session.steps
    ]
    
    response_data = InfoSessionResponse.model_validate(info_session).model_dump()
    response_data["assigned_recruiter_name"] = recruiter_name
    response_data["exclusion_match"] = exclusion_match_info.model_dump() if exclusion_match_info else None
    response_data["steps"] = steps_data
    return response_data

@router.get("/live")
async def get_live_info_sessions(db: Session = Depends(get_db)):
    """Get live info sessions (registered, in-progress, initiated, and completed)"""
    sessions = db.query(InfoSession).options(joinedload(InfoSession.steps)).filter(
        InfoSession.status.in_(["registered", "in-progress", "initiated", "completed"])
    ).order_by(InfoSession.created_at.desc()).all()

    # Detect duplicates: find name+email combos that appear more than once (case-insensitive)
    # Check against ALL sessions (not just live ones) to catch duplicates across sessions
    all_sessions = db.query(InfoSession).all()
    name_counts: dict = {}
    for s in all_sessions:
        name_key = f"{s.first_name.strip().lower()}_{s.last_name.strip().lower()}_{s.email.strip().lower()}"
        name_counts[name_key] = name_counts.get(name_key, 0) + 1

    duplicate_names = {k for k, v in name_counts.items() if v > 1}

    result = []
    for session in sessions:
        name_key = f"{session.first_name.strip().lower()}_{session.last_name.strip().lower()}_{session.email.strip().lower()}"
        recruiter_name = None
        if session.assigned_recruiter_id:
            recruiter = db.query(Recruiter).filter(Recruiter.id == session.assigned_recruiter_id).first()
            if recruiter:
                recruiter_name = recruiter.name

        exclusion_match = None
        if session.is_in_exclusion_list:
            try:
                matches = check_name_in_exclusion_list(db, session.first_name, session.last_name)
                if matches and len(matches) > 0:
                    first_match = matches[0]
                    exclusion_match = {
                        "name": first_match.name if first_match.name else None,
                        "code": first_match.code if first_match.code else None,
                        "ssn": first_match.ssn if first_match.ssn else None
                    }
            except Exception as e:
                print(f"Error getting exclusion match: {e}")
                exclusion_match = None

        steps = []
        for step in session.steps:
            steps.append({
                "step_name": step.step_name,
                "step_description": step.step_description if step.step_description else "",
                "is_completed": step.is_completed
            })

        item = {
            "id": session.id,
            "first_name": session.first_name,
            "last_name": session.last_name,
            "email": session.email,
            "phone": session.phone,
            "zip_code": session.zip_code if session.zip_code else "",
            "session_type": session.session_type,
            "time_slot": session.time_slot,
            "is_in_exclusion_list": bool(session.is_in_exclusion_list),
            "exclusion_warning_shown": bool(session.exclusion_warning_shown),
            "status": session.status,
            "ob365_sent": bool(session.ob365_sent) if hasattr(session, 'ob365_sent') and session.ob365_sent is not None else False,
            "i9_sent": bool(session.i9_sent) if hasattr(session, 'i9_sent') and session.i9_sent is not None else False,
            "existing_i9": bool(session.existing_i9) if hasattr(session, 'existing_i9') and session.existing_i9 is not None else False,
            "ineligible": bool(session.ineligible) if hasattr(session, 'ineligible') and session.ineligible is not None else False,
            "rejected": bool(session.rejected) if hasattr(session, 'rejected') and session.rejected is not None else False,
            "drug_screen": bool(session.drug_screen) if hasattr(session, 'drug_screen') and session.drug_screen is not None else False,
            "questions": bool(session.questions) if hasattr(session, 'questions') and session.questions is not None else False,
            "assigned_recruiter_id": session.assigned_recruiter_id,
            "assigned_recruiter_name": recruiter_name,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "duration_minutes": session.duration_minutes,
            "created_at": session.created_at.isoformat(),
            "exclusion_match": exclusion_match,
            "steps": steps,
            "is_duplicate": name_key in duplicate_names,
            "duplicate_count": name_counts.get(name_key, 1),
        }
        result.append(item)

    return result

@router.get("/completed")
async def get_completed_info_sessions(db: Session = Depends(get_db)):
    """Get completed info sessions"""
    sessions = db.query(InfoSession).options(joinedload(InfoSession.steps)).filter(
        InfoSession.status == "completed"
    ).order_by(InfoSession.completed_at.desc()).all()

    # Detect duplicates across ALL sessions (name + email)
    all_sessions = db.query(InfoSession).all()
    name_counts: dict = {}
    for s in all_sessions:
        nk = f"{s.first_name.strip().lower()}_{s.last_name.strip().lower()}_{s.email.strip().lower()}"
        name_counts[nk] = name_counts.get(nk, 0) + 1
    duplicate_names = {k for k, v in name_counts.items() if v > 1}

    result = []
    for session in sessions:
        name_key = f"{session.first_name.strip().lower()}_{session.last_name.strip().lower()}_{session.email.strip().lower()}"
        recruiter_name = None
        if session.assigned_recruiter_id:
            recruiter = db.query(Recruiter).filter(Recruiter.id == session.assigned_recruiter_id).first()
            if recruiter:
                recruiter_name = recruiter.name
        
        exclusion_match = None
        if session.is_in_exclusion_list:
            try:
                matches = check_name_in_exclusion_list(db, session.first_name, session.last_name)
                if matches and len(matches) > 0:
                    first_match = matches[0]
                    exclusion_match = {
                        "name": first_match.name if first_match.name else None,
                        "code": first_match.code if first_match.code else None,
                        "ssn": first_match.ssn if first_match.ssn else None
                    }
            except Exception as e:
                print(f"Error getting exclusion match: {e}")
                exclusion_match = None
        
        steps = []
        for step in session.steps:
            steps.append({
                "step_name": step.step_name,
                "step_description": step.step_description if step.step_description else "",
                "is_completed": step.is_completed
            })
        
        item = {
            "id": session.id,
            "first_name": session.first_name,
            "last_name": session.last_name,
            "email": session.email,
            "phone": session.phone,
            "zip_code": session.zip_code if session.zip_code else "",
            "session_type": session.session_type,
            "time_slot": session.time_slot,
            "is_in_exclusion_list": bool(session.is_in_exclusion_list),
            "exclusion_warning_shown": bool(session.exclusion_warning_shown),
            "status": session.status,
            "ob365_sent": bool(session.ob365_sent) if hasattr(session, 'ob365_sent') and session.ob365_sent is not None else False,
            "i9_sent": bool(session.i9_sent) if hasattr(session, 'i9_sent') and session.i9_sent is not None else False,
            "existing_i9": bool(session.existing_i9) if hasattr(session, 'existing_i9') and session.existing_i9 is not None else False,
            "ineligible": bool(session.ineligible) if hasattr(session, 'ineligible') and session.ineligible is not None else False,
            "rejected": bool(session.rejected) if hasattr(session, 'rejected') and session.rejected is not None else False,
            "drug_screen": bool(session.drug_screen) if hasattr(session, 'drug_screen') and session.drug_screen is not None else False,
            "questions": bool(session.questions) if hasattr(session, 'questions') and session.questions is not None else False,
            "assigned_recruiter_id": session.assigned_recruiter_id,
            "assigned_recruiter_name": recruiter_name,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "duration_minutes": session.duration_minutes,
            "created_at": session.created_at.isoformat(),
            "exclusion_match": exclusion_match,
            "steps": steps,
            "is_duplicate": name_key in duplicate_names,
            "duplicate_count": name_counts.get(name_key, 1),
        }
        result.append(item)

    return result

@router.get("/{session_id}", response_model=InfoSessionWithSteps)
async def get_info_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get info session by ID"""
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not info_session:
        raise HTTPException(status_code=404, detail="Info session not found")
    
    # Get recruiter name if assigned
    recruiter_name = None
    if info_session.assigned_recruiter_id:
        recruiter = db.query(Recruiter).filter(Recruiter.id == info_session.assigned_recruiter_id).first()
        if recruiter:
            recruiter_name = recruiter.name
    
    # Get steps
    steps_data = [
        {
            "step_name": step.step_name,
            "step_description": step.step_description,
            "is_completed": step.is_completed
        }
        for step in info_session.steps
    ]
    
    # Get exclusion match info if in exclusion list
    exclusion_match_info = None
    if info_session.is_in_exclusion_list:
        exclusion_match_info = get_exclusion_match_info(
            db, info_session.first_name, info_session.last_name
        )
    
    response_data = InfoSessionResponse.model_validate(info_session).model_dump()
    response_data["assigned_recruiter_name"] = recruiter_name
    response_data["exclusion_match"] = exclusion_match_info.model_dump() if exclusion_match_info else None
    response_data["steps"] = steps_data
    return response_data

@router.patch("/{session_id}/steps/{step_name}/complete")
async def complete_step(
    session_id: int,
    step_name: str,
    db: Session = Depends(get_db)
):
    """Mark a step as completed"""
    print(f"📋 Completing step '{step_name}' for session {session_id}")
    step = db.query(InfoSessionStep).filter(
        InfoSessionStep.info_session_id == session_id,
        InfoSessionStep.step_name == step_name
    ).first()

    if not step:
        raise HTTPException(status_code=404, detail="Step not found")

    step.is_completed = True
    step.completed_at = datetime.utcnow()
    print(f"📋 Step '{step_name}' marked as completed")

    # NOTE: Completing steps (checkboxes) does NOT change status to 'answers_submitted'
    # Status only changes to 'answers_submitted' when user submits question responses
    # This is handled in the POST /{session_id}/questions endpoint

    # Assign recruiter if not assigned (try to assign after first step completion)
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if info_session:
        total_steps = len(info_session.steps)
        completed_steps = sum(1 for s in info_session.steps if s.is_completed)
        print(f"📋 Steps status: {completed_steps}/{total_steps} completed (status remains '{info_session.status}')")

        if not info_session.assigned_recruiter_id:
                from app.services.recruiter_service import get_next_recruiter, initialize_default_recruiters
                from datetime import date
                initialize_default_recruiters(db)
                recruiter = get_next_recruiter(db, info_session.time_slot, date.today())
                if recruiter:
                    info_session.assigned_recruiter_id = recruiter.id
                    print(f"✅ Recruiter {recruiter.name} assigned to session {session_id}")
    
    db.commit()
    
    return {"message": "Step completed successfully", "step": step_name}

@router.post("/{session_id}/complete")
async def complete_info_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Mark info session as answers_submitted (applicant has finished the info session steps)"""
    try:
        info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
        if not info_session:
            raise HTTPException(status_code=404, detail="Info session not found")

        # Don't change status if already completed by recruiter
        if info_session.status == "completed":
            return {"message": "Session already completed by recruiter", "session_id": session_id}

        # Mark as answers_submitted - the applicant has finished the info session steps
        # "completed" status is only set when recruiter completes the session
        info_session.status = "answers_submitted"
        # Don't set completed_at here - that's only set when recruiter completes
        print(f"✅ Info session {session_id} marked as 'answers_submitted' (user completed steps)")

        # Note: duration_minutes is only calculated when recruiter completes the session

        # Try to assign recruiter (non-critical)
        try:
            if not info_session.assigned_recruiter_id:
                initialize_default_recruiters(db)
                recruiter = get_next_recruiter(db, info_session.time_slot, date.today())
                if recruiter:
                    info_session.assigned_recruiter_id = recruiter.id
        except:
            pass

        db.commit()
        db.refresh(info_session)

        return {"message": "Info session completed successfully", "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR completing session {session_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

class InterviewQuestionsUpdate(BaseModel):
    question_1_response: Optional[str] = None
    question_2_response: Optional[str] = None
    question_3_response: Optional[str] = None
    question_4_response: Optional[str] = None

@router.patch("/{session_id}/interview-questions")
async def update_interview_questions(
    session_id: int,
    questions_data: InterviewQuestionsUpdate,
    db: Session = Depends(get_db)
):
    """Update interview questions responses for an info session"""
    print(f"💾 Saving interview questions for session {session_id}")
    print(f"   Question 1: {questions_data.question_1_response[:50] if questions_data.question_1_response else 'None'}...")
    print(f"   Question 2: {questions_data.question_2_response[:50] if questions_data.question_2_response else 'None'}...")
    print(f"   Question 3: {questions_data.question_3_response[:50] if questions_data.question_3_response else 'None'}...")
    print(f"   Question 4: {questions_data.question_4_response[:50] if questions_data.question_4_response else 'None'}...")
    
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not info_session:
        print(f"❌ Session {session_id} not found")
        raise HTTPException(status_code=404, detail="Info session not found")
    
    # Update responses - convert empty strings to None
    if questions_data.question_1_response is not None:
        info_session.question_1_response = questions_data.question_1_response.strip() if questions_data.question_1_response.strip() else None
    if questions_data.question_2_response is not None:
        info_session.question_2_response = questions_data.question_2_response.strip() if questions_data.question_2_response.strip() else None
    if questions_data.question_3_response is not None:
        info_session.question_3_response = questions_data.question_3_response.strip() if questions_data.question_3_response.strip() else None
    if questions_data.question_4_response is not None:
        info_session.question_4_response = questions_data.question_4_response.strip() if questions_data.question_4_response.strip() else None

    # Change status to 'answers_submitted' when answers are saved
    if info_session.status == 'initiated':
        info_session.status = 'answers_submitted'
        print(f"✅ Status changed to 'answers_submitted' for session {session_id}")

    db.commit()
    db.refresh(info_session)
    
    print(f"✅ Saved responses for session {session_id}:")
    print(f"   Q1: {info_session.question_1_response[:50] if info_session.question_1_response else 'None'}...")
    print(f"   Q2: {info_session.question_2_response[:50] if info_session.question_2_response else 'None'}...")
    print(f"   Q3: {info_session.question_3_response[:50] if info_session.question_3_response else 'None'}...")
    print(f"   Q4: {info_session.question_4_response[:50] if info_session.question_4_response else 'None'}...")
    
    return {"message": "Interview questions updated successfully", "session_id": session_id}

@router.get("/{session_id}/answers-pdf")
async def get_answers_pdf(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Generate and download PDF with interview answers"""
    # Import reportlab only when needed
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.enums import TA_LEFT
        from io import BytesIO
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF generation library (reportlab) is not installed. Please install it with: pip install reportlab"
        )
    
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not info_session:
        raise HTTPException(status_code=404, detail="Info session not found")
    
    # Create PDF in memory
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor='#1a472a',
        spaceAfter=12,
        alignment=TA_LEFT
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor='#2d5016',
        spaceAfter=6,
        spaceBefore=12,
        alignment=TA_LEFT
    )
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=12,
        alignment=TA_LEFT,
        leading=14
    )
    
    # Title
    full_name = f"{info_session.first_name} {info_session.last_name}"
    title = Paragraph(f"Interview Answers - {full_name}", title_style)
    story.append(title)
    story.append(Spacer(1, 0.2*inch))
    
    # Questions and answers
    questions = [
        ("1. Tell me about a time where you were asked to sub for another instructor or were asked to fill in for someone and the instructions were either missing or illegible. What did you do in this situation? What was the outcome? Would you handle this situation differently and why?",
         info_session.question_1_response),
        ("2. Tell me about a time when you lost order or control either in a classroom or similar environment. What did you do to regain the students' or group's attention? What was the outcome of your efforts? How would you handle this situation differently based on the outcome and why?",
         info_session.question_2_response),
        ("3. What would you do if you had warned a student about his/her behavior and the student continued to misbehave?",
         info_session.question_3_response),
        ("4. If you disagreed with the policies or procedures of the school/school district/Center in which you were working, what would you do?",
         info_session.question_4_response),
    ]
    
    for question, answer in questions:
        if answer:
            q_para = Paragraph(f"<b>{question}</b>", heading_style)
            story.append(q_para)
            a_para = Paragraph(answer.replace('\n', '<br/>'), normal_style)
            story.append(a_para)
            story.append(Spacer(1, 0.2*inch))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    # Generate filename
    filename = f"{info_session.first_name}_{info_session.last_name}_answers.pdf"
    # Replace spaces and special characters for filename
    filename = filename.replace(' ', '_').replace('/', '_')
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.get("/", response_model=List[InfoSessionResponse])
async def list_info_sessions(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all info sessions (for staff dashboard)"""
    # First, assign recruiters to any unassigned sessions
    from app.services.recruiter_service import get_next_recruiter, initialize_default_recruiters
    from datetime import date
    
    initialize_default_recruiters(db)
    
    # Find all unassigned sessions and assign them
    unassigned_sessions = db.query(InfoSession).filter(
        InfoSession.assigned_recruiter_id == None
    ).all()
    
    for session in unassigned_sessions:
        session_date = session.created_at.date() if session.created_at else date.today()
        assigned_recruiter = get_next_recruiter(db, session.time_slot, session_date)
        
        if assigned_recruiter:
            session.assigned_recruiter_id = assigned_recruiter.id
            print(f"✅ Auto-assigned session {session.id} ({session.first_name} {session.last_name}) to {assigned_recruiter.name}")
        else:
            # Fallback: get first active recruiter
            fallback_recruiter = db.query(Recruiter).filter(Recruiter.is_active == True).first()
            if fallback_recruiter:
                session.assigned_recruiter_id = fallback_recruiter.id
                print(f"✅ Auto-assigned session {session.id} ({session.first_name} {session.last_name}) to {fallback_recruiter.name} (fallback)")
    
    if unassigned_sessions:
        db.commit()
        print(f"✅ Auto-assigned {len(unassigned_sessions)} unassigned sessions")
    
    query = db.query(InfoSession)
    
    if status:
        query = query.filter(InfoSession.status == status)
    
    sessions = query.order_by(InfoSession.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for session in sessions:
        session_data = InfoSessionResponse.model_validate(session).model_dump()
        # Get recruiter name if assigned
        if session.assigned_recruiter_id:
            recruiter = db.query(Recruiter).filter(Recruiter.id == session.assigned_recruiter_id).first()
            if recruiter:
                session_data["assigned_recruiter_name"] = recruiter.name
        # Get exclusion match info if in exclusion list
        if session.is_in_exclusion_list:
            exclusion_match_info = get_exclusion_match_info(db, session.first_name, session.last_name)
            session_data["exclusion_match"] = exclusion_match_info.model_dump() if exclusion_match_info else None
        # Include all new fields
        session_data["rejected"] = session.rejected
        session_data["drug_screen"] = session.drug_screen
        session_data["questions"] = session.questions
        session_data["started_at"] = session.started_at.isoformat() if session.started_at else None
        session_data["completed_at"] = session.completed_at.isoformat() if session.completed_at else None
        session_data["duration_minutes"] = session.duration_minutes
        result.append(session_data)
    return result


@router.delete("/{session_id}")
async def delete_info_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Delete an info session"""
    info_session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not info_session:
        raise HTTPException(status_code=404, detail="Info session not found")
    
    # Delete associated steps (cascade should handle this, but being explicit)
    db.query(InfoSessionStep).filter(InfoSessionStep.info_session_id == session_id).delete()
    
    # Delete the session
    db.delete(info_session)
    db.commit()
    
    return {"message": "Info session deleted successfully", "session_id": session_id}

@router.get("/exclusion-check/{first_name}/{last_name}")
async def check_exclusion(
    first_name: str,
    last_name: str,
    db: Session = Depends(get_db)
):
    """Check if a name is in exclusion list"""
    try:
        matches = check_name_in_exclusion_list(db, first_name, last_name)
        is_excluded = len(matches) > 0
        
        return {
            "is_in_exclusion_list": is_excluded,
            "matches": [
                {
                    "id": match.id,
                    "name": match.name,
                    "code": match.code,
                    "ssn": match.ssn,
                    "dob": match.dob.isoformat() if match.dob else None,
                    "notes": match.notes
                }
                for match in matches
            ],
            "warning_message": "Please verify social and data to verify that this person is on the PC or RR list" if is_excluded else None
        }
    except Exception as e:
        import traceback
        print(f"Error in check_exclusion: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error checking exclusion list: {str(e)}")

