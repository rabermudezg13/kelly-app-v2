"""
CHR (Candidate Hiring Request) API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models.chr import CHR, CurrentStatus, FinalDecision, SubmittedToDistrict, DistrictNotified
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()

class CHRCreate(BaseModel):
    candidate_full_name: str
    bullhorn_id: Optional[str] = None
    ssn: Optional[str] = None
    dob: Optional[date] = None
    info_requested_sent_date: Optional[date] = None
    submitted_to_district: Optional[str] = None
    submission_date: Optional[date] = None
    district_notified: Optional[str] = None
    current_status: Optional[str] = None
    final_decision: Optional[str] = None
    notes: Optional[str] = None

class CHRUpdate(BaseModel):
    candidate_full_name: Optional[str] = None
    bullhorn_id: Optional[str] = None
    ssn: Optional[str] = None
    dob: Optional[date] = None
    info_requested_sent_date: Optional[date] = None
    submitted_to_district: Optional[str] = None
    submission_date: Optional[date] = None
    district_notified: Optional[str] = None
    current_status: Optional[str] = None
    final_decision: Optional[str] = None
    notes: Optional[str] = None

class CHRResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    candidate_full_name: str
    bullhorn_id: Optional[str] = None
    ssn: Optional[str] = None
    dob: Optional[date] = None
    info_requested_sent_date: Optional[date] = None
    deadline: Optional[date] = None
    submitted_to_district: Optional[str] = None
    submission_date: Optional[date] = None
    district_notified: Optional[str] = None
    current_status: Optional[str] = None
    final_decision: Optional[str] = None
    notes: Optional[str] = None
    days_since_review: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class CHRDashboardStats(BaseModel):
    total_cases: int
    open_cases: int
    overdue: int
    approved: int
    denied: int
    pending_decision: int

class CHRStatusBreakdown(BaseModel):
    waiting_documents: int
    in_review: int
    approved: int
    rejected: int
    not_approved: int
    pending: int

def calculate_deadline(info_requested_date: Optional[date]) -> Optional[date]:
    """Calculate deadline as info_requested_date + 15 days"""
    if info_requested_date:
        return info_requested_date + timedelta(days=15)
    return None

def calculate_days_since_review(created_at: datetime) -> int:
    """Calculate days since the case was created (in review)"""
    if created_at:
        try:
            if isinstance(created_at, datetime):
                created_date = created_at.date()
            elif isinstance(created_at, str):
                created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00')).date()
            else:
                created_date = created_at
            delta = date.today() - created_date
            return max(0, delta.days)  # Ensure non-negative
        except Exception as e:
            print(f"Error calculating days_since_review: {e}")
            return 0
    return 0

def is_overdue(deadline: Optional[date], final_decision: Optional[str]) -> bool:
    """Check if case is overdue (deadline passed and not finalized)"""
    if not deadline or final_decision in ["approved", "rejected", "not_approved"]:
        return False
    return deadline < date.today()

@router.post("/", response_model=CHRResponse, status_code=status.HTTP_201_CREATED)
async def create_chr_case(
    chr_data: CHRCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new CHR case"""
    # Calculate deadline
    deadline = calculate_deadline(chr_data.info_requested_sent_date)
    
    # Create CHR case
    chr_case = CHR(
        candidate_full_name=chr_data.candidate_full_name,
        bullhorn_id=chr_data.bullhorn_id,
        ssn=chr_data.ssn,
        dob=chr_data.dob,
        info_requested_sent_date=chr_data.info_requested_sent_date,
        deadline=deadline,
        submitted_to_district=chr_data.submitted_to_district if chr_data.submitted_to_district else None,
        submission_date=chr_data.submission_date if chr_data.submission_date else None,
        district_notified=chr_data.district_notified if chr_data.district_notified else None,
        current_status=chr_data.current_status if chr_data.current_status else None,
        final_decision=chr_data.final_decision if chr_data.final_decision else None,  # Allow None instead of defaulting to "pending"
        notes=chr_data.notes if chr_data.notes else None
    )
    
    db.add(chr_case)
    db.commit()
    db.refresh(chr_case)
    
    # Calculate days since review
    chr_case.days_since_review = calculate_days_since_review(chr_case.created_at)
    db.commit()
    db.refresh(chr_case)
    
    return CHRResponse.model_validate(chr_case)

@router.get("/", response_model=List[CHRResponse])
async def get_all_chr_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all CHR cases"""
    cases = db.query(CHR).order_by(CHR.created_at.desc()).all()
    
    # Update days_since_review for all cases
    for case in cases:
        try:
            case.days_since_review = calculate_days_since_review(case.created_at)
        except Exception as e:
            print(f"Error calculating days_since_review for case {case.id}: {e}")
            case.days_since_review = 0
    
    try:
        db.commit()
    except Exception as e:
        print(f"Error committing days_since_review updates: {e}")
        db.rollback()
    
    return [CHRResponse.model_validate(case) for case in cases]

@router.get("/{chr_id}", response_model=CHRResponse)
async def get_chr_case(
    chr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific CHR case"""
    chr_case = db.query(CHR).filter(CHR.id == chr_id).first()
    if not chr_case:
        raise HTTPException(status_code=404, detail="CHR case not found")
    
    # Update days_since_review
    chr_case.days_since_review = calculate_days_since_review(chr_case.created_at)
    db.commit()
    db.refresh(chr_case)
    
    return CHRResponse.model_validate(chr_case)

@router.patch("/{chr_id}", response_model=CHRResponse)
async def update_chr_case(
    chr_id: int,
    chr_data: CHRUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a CHR case"""
    chr_case = db.query(CHR).filter(CHR.id == chr_id).first()
    if not chr_case:
        raise HTTPException(status_code=404, detail="CHR case not found")
    
    # Update fields
    update_data = chr_data.model_dump(exclude_unset=True)
    
    # Convert empty strings to None for optional fields
    optional_fields = ['submitted_to_district', 'submission_date', 'district_notified', 
                       'current_status', 'final_decision', 'notes', 'bullhorn_id', 'ssn']
    for field in optional_fields:
        if field in update_data and update_data[field] == '':
            update_data[field] = None
    
    # Recalculate deadline if info_requested_sent_date is updated
    if "info_requested_sent_date" in update_data:
        new_date = update_data["info_requested_sent_date"]
        chr_case.deadline = calculate_deadline(new_date)
        update_data.pop("info_requested_sent_date", None)
    
    for field, value in update_data.items():
        setattr(chr_case, field, value)
    
    # Recalculate deadline if needed
    if chr_case.info_requested_sent_date and not chr_case.deadline:
        chr_case.deadline = calculate_deadline(chr_case.info_requested_sent_date)
    
    # Update days_since_review
    chr_case.days_since_review = calculate_days_since_review(chr_case.created_at)
    
    db.commit()
    db.refresh(chr_case)
    
    return CHRResponse.model_validate(chr_case)

@router.delete("/{chr_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chr_case(
    chr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a CHR case"""
    chr_case = db.query(CHR).filter(CHR.id == chr_id).first()
    if not chr_case:
        raise HTTPException(status_code=404, detail="CHR case not found")
    
    db.delete(chr_case)
    db.commit()
    return None

@router.get("/dashboard/stats", response_model=CHRDashboardStats)
async def get_chr_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get CHR dashboard statistics"""
    all_cases = db.query(CHR).all()
    
    total_cases = len(all_cases)
    # Convert enum values to strings for comparison (model stores as strings)
    open_cases = len([c for c in all_cases if (c.final_decision is None or str(c.final_decision).lower() == "pending")])
    overdue = len([c for c in all_cases if is_overdue(c.deadline, str(c.final_decision) if c.final_decision else None)])
    approved = len([c for c in all_cases if str(c.final_decision).lower() == "approved"])
    denied = len([c for c in all_cases if str(c.final_decision).lower() in ["rejected", "not_approved"]])
    pending_decision = len([c for c in all_cases if (c.final_decision is None or str(c.final_decision).lower() == "pending")])
    
    return CHRDashboardStats(
        total_cases=total_cases,
        open_cases=open_cases,
        overdue=overdue,
        approved=approved,
        denied=denied,
        pending_decision=pending_decision
    )

@router.get("/dashboard/status-breakdown", response_model=CHRStatusBreakdown)
async def get_chr_status_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get CHR cases breakdown by current status"""
    all_cases = db.query(CHR).all()
    
    # Convert enum values to strings for comparison (model stores as strings)
    waiting_documents = len([c for c in all_cases if str(c.current_status).lower() == "waiting_documents"])
    in_review = len([c for c in all_cases if str(c.current_status).lower() == "in_review"])
    approved = len([c for c in all_cases if str(c.final_decision).lower() == "approved"])
    rejected = len([c for c in all_cases if str(c.final_decision).lower() == "rejected"])
    not_approved = len([c for c in all_cases if str(c.final_decision).lower() == "not_approved"])
    
    # Add pending count (cases without final_decision)
    pending = len([c for c in all_cases if (c.final_decision is None or str(c.final_decision).lower() == "pending")])
    
    return CHRStatusBreakdown(
        waiting_documents=waiting_documents,
        in_review=in_review,
        approved=approved,
        rejected=rejected,
        not_approved=not_approved,
        pending=pending
    )
