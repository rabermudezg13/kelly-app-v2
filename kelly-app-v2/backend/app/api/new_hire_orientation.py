"""
New Hire Orientation API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.models.visit import NewHireOrientation, NewHireOrientationStep
from app.models.new_hire_orientation_config import NewHireOrientationConfig
from app.services.recruiter_service import get_next_recruiter, initialize_default_recruiters
import json

router = APIRouter()

# Pydantic models
class NewHireOrientationRegistration(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    time_slot: str

class NewHireOrientationStepModel(BaseModel):
    step_name: str
    step_description: str
    is_completed: bool

class NewHireOrientationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    time_slot: str
    status: str
    assigned_recruiter_id: Optional[int] = None
    process_status: Optional[str] = None
    badge_status: Optional[str] = None
    missing_steps: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    created_at: datetime

class NewHireOrientationWithSteps(NewHireOrientationResponse):
    steps: List[NewHireOrientationStepModel]

# Default steps for New Hire Orientation
DEFAULT_STEPS = [
    {
        "step_name": "dress_code",
        "step_description": "You must attend the info session with dress code: business casual."
    },
    {
        "step_name": "no_accompaniments",
        "step_description": "No accompaniments."
    },
    {
        "step_name": "phones_silent",
        "step_description": "In the info session, phones must be on silent."
    },
    {
        "step_name": "no_personal_devices",
        "step_description": "Remember that when you are in class in the schools, you must not use any personal devices inside the classroom, always use dress code, and always arrive on time at least 15 minutes before."
    }
]

@router.get("/time-slots", response_model=List[str])
async def get_available_time_slots(db: Session = Depends(get_db)):
    """Get available time slots for new hire orientations"""
    try:
        config = db.query(NewHireOrientationConfig).filter(NewHireOrientationConfig.is_active == True).first()
        
        if not config:
            # Return default time slots
            return ["9:00 AM", "2:00 PM"]
        
        # Handle both JSON string and list
        if isinstance(config.time_slots, str):
            try:
                return json.loads(config.time_slots)
            except (json.JSONDecodeError, TypeError, ValueError):
                return ["9:00 AM", "2:00 PM"]
        elif isinstance(config.time_slots, list):
            return config.time_slots
        else:
            return ["9:00 AM", "2:00 PM"]
    except Exception as e:
        print(f"Error in get_available_time_slots: {e}")
        import traceback
        traceback.print_exc()
        # Return default on any error
        return ["9:00 AM", "2:00 PM"]

@router.post("/register", response_model=NewHireOrientationWithSteps, status_code=status.HTTP_201_CREATED)
async def register_new_hire_orientation(
    registration: NewHireOrientationRegistration,
    db: Session = Depends(get_db)
):
    """Register a new hire orientation"""
    try:
        # Initialize default recruiters if needed
        initialize_default_recruiters(db)
        
        # Get steps from config or use defaults
        config = db.query(NewHireOrientationConfig).filter(NewHireOrientationConfig.is_active == True).first()
        steps_to_create = DEFAULT_STEPS
        
        if config and config.steps:
            # If config has steps, use them
            try:
                if isinstance(config.steps, str):
                    steps_to_create = json.loads(config.steps)
                else:
                    steps_to_create = config.steps
            except (json.JSONDecodeError, TypeError, ValueError) as e:
                print(f"Error parsing steps from config: {e}")
                steps_to_create = DEFAULT_STEPS
        
        # Assign recruiter equitably
        assigned_recruiter = get_next_recruiter(db, registration.time_slot, date.today())
        
        # Create orientation record
        orientation = NewHireOrientation(
            first_name=registration.first_name,
            last_name=registration.last_name,
            email=registration.email,
            phone=registration.phone,
            time_slot=registration.time_slot,
            status="in-progress",
            assigned_recruiter_id=assigned_recruiter.id if assigned_recruiter else None,
            badge_status="pending",  # Set default badge status
        )
        
        db.add(orientation)
        db.commit()
        db.refresh(orientation)
        
        # Create default steps
        for step_data in steps_to_create:
            try:
                step = NewHireOrientationStep(
                    orientation_id=orientation.id,
                    step_name=step_data.get("step_name", ""),
                    step_description=step_data.get("step_description", ""),
                    is_completed=False
                )
                db.add(step)
            except Exception as e:
                print(f"Error creating step {step_data}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        db.commit()
        db.refresh(orientation)
        
        # Return with steps
        recruiter_name = None
        if assigned_recruiter:
            recruiter_name = assigned_recruiter.name
        
        steps_data = [
            {
                "step_name": step.step_name,
                "step_description": step.step_description,
                "is_completed": step.is_completed
            }
            for step in orientation.steps
        ]
        
        response_data = NewHireOrientationResponse.model_validate(orientation).model_dump()
        response_data["assigned_recruiter_name"] = recruiter_name
        response_data["steps"] = steps_data
        return response_data
    except Exception as e:
        db.rollback()
        print(f"Error registering new hire orientation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error registering new hire orientation: {str(e)}"
        )

@router.get("/{orientation_id}", response_model=NewHireOrientationWithSteps)
async def get_new_hire_orientation(
    orientation_id: int,
    db: Session = Depends(get_db)
):
    """Get new hire orientation by ID"""
    orientation = db.query(NewHireOrientation).options(joinedload(NewHireOrientation.steps)).filter(
        NewHireOrientation.id == orientation_id
    ).first()
    
    if not orientation:
        raise HTTPException(status_code=404, detail="New hire orientation not found")
    
    # Get recruiter name if assigned
    recruiter_name = None
    if orientation.assigned_recruiter_id:
        from app.models.recruiter import Recruiter
        recruiter = db.query(Recruiter).filter(Recruiter.id == orientation.assigned_recruiter_id).first()
        if recruiter:
            recruiter_name = recruiter.name
    
    steps_data = [
        {
            "step_name": step.step_name,
            "step_description": step.step_description,
            "is_completed": step.is_completed
        }
        for step in orientation.steps
    ]
    
    response_data = NewHireOrientationResponse.model_validate(orientation).model_dump()
    response_data["assigned_recruiter_name"] = recruiter_name
    response_data["steps"] = steps_data
    return response_data

@router.patch("/{orientation_id}/steps/{step_name}/complete")
async def complete_step(
    orientation_id: int,
    step_name: str,
    db: Session = Depends(get_db)
):
    """Mark a step as completed"""
    step = db.query(NewHireOrientationStep).filter(
        NewHireOrientationStep.orientation_id == orientation_id,
        NewHireOrientationStep.step_name == step_name
    ).first()
    
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    
    step.is_completed = True
    step.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Step completed successfully", "step": step_name}

@router.post("/{orientation_id}/complete")
async def complete_new_hire_orientation(
    orientation_id: int,
    db: Session = Depends(get_db)
):
    """Mark new hire orientation as completed"""
    orientation = db.query(NewHireOrientation).filter(NewHireOrientation.id == orientation_id).first()
    if not orientation:
        raise HTTPException(status_code=404, detail="New hire orientation not found")
    
    if orientation.status == "completed":
        return {"message": "Orientation already completed", "orientation_id": orientation_id}
    
    # Mark as completed
    orientation.status = "completed"
    orientation.completed_at = datetime.utcnow()

    # Calculate duration from registration (created_at) to completion (completed_at)
    try:
        if orientation.created_at:
            # Handle both timezone-aware and naive datetimes
            created = orientation.created_at.replace(tzinfo=None) if orientation.created_at.tzinfo else orientation.created_at
            completed = orientation.completed_at.replace(tzinfo=None) if orientation.completed_at.tzinfo else orientation.completed_at
            duration = completed - created
            orientation.duration_minutes = int(duration.total_seconds() / 60)
    except Exception as e:
        print(f"Warning: Could not calculate duration: {e}")
        # Continue without duration - not critical

    db.commit()
    db.refresh(orientation)
    
    return {"message": "New hire orientation completed successfully", "orientation_id": orientation_id}

@router.get("/", response_model=List[NewHireOrientationResponse])
async def list_new_hire_orientations(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all new hire orientations (for staff dashboard)"""
    query = db.query(NewHireOrientation)
    
    if status:
        query = query.filter(NewHireOrientation.status == status)
    
    orientations = query.order_by(NewHireOrientation.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for orientation in orientations:
        orientation_data = NewHireOrientationResponse.model_validate(orientation).model_dump()
        # Get recruiter name if assigned
        if orientation.assigned_recruiter_id:
            from app.models.recruiter import Recruiter
            recruiter = db.query(Recruiter).filter(Recruiter.id == orientation.assigned_recruiter_id).first()
            if recruiter:
                orientation_data["assigned_recruiter_name"] = recruiter.name
        result.append(orientation_data)
    
    return result

class NewHireOrientationUpdate(BaseModel):
    process_status: Optional[str] = None
    badge_status: Optional[str] = None
    missing_steps: Optional[str] = None
    status: Optional[str] = None

@router.patch("/{orientation_id}", response_model=NewHireOrientationResponse)
async def update_new_hire_orientation(
    orientation_id: int,
    update_data: NewHireOrientationUpdate,
    db: Session = Depends(get_db)
):
    """Update new hire orientation details"""
    orientation = db.query(NewHireOrientation).filter(NewHireOrientation.id == orientation_id).first()
    if not orientation:
        raise HTTPException(status_code=404, detail="New hire orientation not found")
    
    if update_data.process_status is not None:
        orientation.process_status = update_data.process_status
    if update_data.badge_status is not None:
        orientation.badge_status = update_data.badge_status
    if update_data.missing_steps is not None:
        orientation.missing_steps = update_data.missing_steps
    if update_data.status is not None:
        orientation.status = update_data.status
    
    db.commit()
    db.refresh(orientation)
    
    orientation_data = NewHireOrientationResponse.model_validate(orientation).model_dump()
    # Get recruiter name if assigned
    if orientation.assigned_recruiter_id:
        from app.models.recruiter import Recruiter
        recruiter = db.query(Recruiter).filter(Recruiter.id == orientation.assigned_recruiter_id).first()
        if recruiter:
            orientation_data["assigned_recruiter_name"] = recruiter.name
    
    return orientation_data
