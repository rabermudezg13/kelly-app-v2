"""
Meet & Greet API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.visit import MeetGreet
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()

class MeetGreetCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    inquiry_type: str  # payroll, frontline, other
    inquiry_detail: Optional[str] = None
    subparty_suggestion: Optional[str] = None

class MeetGreetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    inquiry_type: str
    inquiry_detail: Optional[str] = None
    subparty_suggestion: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

@router.post("/register", response_model=MeetGreetResponse)
async def register_meet_greet(
    data: MeetGreetCreate,
    db: Session = Depends(get_db)
):
    """Register for Meet and Greet Feb 2026"""
    meet_greet = MeetGreet(**data.model_dump())
    db.add(meet_greet)
    db.commit()
    db.refresh(meet_greet)
    return MeetGreetResponse.model_validate(meet_greet)

@router.get("/", response_model=List[MeetGreetResponse])
async def list_meet_greets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all Meet & Greet registrations (staff only)"""
    registrations = db.query(MeetGreet).order_by(MeetGreet.created_at.desc()).all()
    return [MeetGreetResponse.model_validate(r) for r in registrations]

@router.delete("/{meet_greet_id}")
async def delete_meet_greet(
    meet_greet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a Meet & Greet registration"""
    registration = db.query(MeetGreet).filter(MeetGreet.id == meet_greet_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    db.delete(registration)
    db.commit()
    return {"message": "Registration deleted", "id": meet_greet_id}

@router.patch("/{meet_greet_id}/status")
async def update_meet_greet_status(
    meet_greet_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update Meet & Greet registration status"""
    registration = db.query(MeetGreet).filter(MeetGreet.id == meet_greet_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    registration.status = status
    db.commit()
    return {"message": "Status updated", "id": meet_greet_id, "status": status}
