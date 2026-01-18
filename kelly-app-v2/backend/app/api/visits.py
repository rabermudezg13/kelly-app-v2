"""
Visits API endpoints for different visit types
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.visit import NewHireOrientation, Badge, Fingerprint, TeamVisit
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()

# Pydantic models
class NewHireOrientationCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    zip_code: Optional[str] = None
    time_slot: str

class BadgeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    zip_code: Optional[str] = None
    appointment_time: str

class FingerprintCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    zip_code: Optional[str] = None
    appointment_time: str
    fingerprint_type: str  # regular or dcf

class TeamVisitCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    team_member_id: Optional[int] = None
    reason: str

# Response models
class VisitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    visitor_name: Optional[str] = None
    email: Optional[str] = None
    visitor_email: Optional[str] = None
    phone: Optional[str] = None
    zip_code: Optional[str] = None
    time_slot: Optional[str] = None
    appointment_time: Optional[str] = None
    fingerprint_type: Optional[str] = None
    team: Optional[str] = None
    team_member_id: Optional[int] = None
    team_member_name: Optional[str] = None
    team_member_email: Optional[str] = None
    reason: Optional[str] = None
    status: str
    created_at: datetime

# New Hire Orientation
@router.post("/new-hire-orientation", response_model=VisitResponse)
async def register_new_hire_orientation(
    data: NewHireOrientationCreate,
    db: Session = Depends(get_db)
):
    """Register a new hire orientation"""
    orientation = NewHireOrientation(**data.dict())
    db.add(orientation)
    db.commit()
    db.refresh(orientation)
    return VisitResponse.model_validate(orientation).model_dump()

@router.get("/new-hire-orientation", response_model=List[VisitResponse])
async def list_new_hire_orientations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all new hire orientations (staff only)"""
    orientations = db.query(NewHireOrientation).order_by(NewHireOrientation.created_at.desc()).all()
    return [VisitResponse.model_validate(o).model_dump() for o in orientations]

# Badges
@router.post("/badges", response_model=VisitResponse)
async def register_badge(
    data: BadgeCreate,
    db: Session = Depends(get_db)
):
    """Register a badge appointment"""
    badge = Badge(**data.dict())
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return VisitResponse.model_validate(badge).model_dump()

@router.get("/badges", response_model=List[VisitResponse])
async def list_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all badge appointments (staff only)"""
    badges = db.query(Badge).order_by(Badge.created_at.desc()).all()
    return [VisitResponse.model_validate(b).model_dump() for b in badges]

# Fingerprints
@router.post("/fingerprints", response_model=VisitResponse)
async def register_fingerprint(
    data: FingerprintCreate,
    db: Session = Depends(get_db)
):
    """Register a fingerprint appointment"""
    fingerprint = Fingerprint(**data.dict())
    db.add(fingerprint)
    db.commit()
    db.refresh(fingerprint)
    return VisitResponse.model_validate(fingerprint).model_dump()

@router.get("/fingerprints", response_model=List[VisitResponse])
async def list_fingerprints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all fingerprint appointments (staff only)"""
    fingerprints = db.query(Fingerprint).order_by(Fingerprint.created_at.desc()).all()
    return [VisitResponse.model_validate(f).model_dump() for f in fingerprints]

# Team Visits
@router.post("/team-visit", response_model=VisitResponse)
async def register_team_visit(
    data: TeamVisitCreate,
    db: Session = Depends(get_db)
):
    """Register a team visit"""
    # Get team member info if team_member_id is provided
    team_member_name = None
    team_member_email = None
    if data.team_member_id:
        from app.models.user import User
        team_member = db.query(User).filter(User.id == data.team_member_id).first()
        if team_member:
            team_member_name = team_member.full_name
            team_member_email = team_member.email
    
    # Create team visit with visitor_name as full name
    team_visit = TeamVisit(
        visitor_name=f"{data.first_name} {data.last_name}",
        visitor_email=data.email,
        team="Staff Visit",  # Default team name
        team_member_id=data.team_member_id,
        team_member_name=team_member_name,
        team_member_email=team_member_email,
        reason=data.reason,
        status="pending"  # Will be marked as notified when staff member is notified
    )
    db.add(team_visit)
    db.commit()
    db.refresh(team_visit)
    
    # Automatically mark as notified when team member is assigned (notification sent)
    if team_visit.team_member_id:
        print(f"🔔 New team visit registered: {team_visit.visitor_name} for {team_member_name} ({team_member_email})")
        print(f"   Visit ID: {team_visit.id}, Reason: {team_visit.reason}")
        # The frontend should handle notification display, but we log it here
        # Optionally, you could mark it as notified automatically, but typically you want the staff member to acknowledge it
    
    return VisitResponse.model_validate(team_visit).model_dump()

@router.get("/team-visit/my-visits", response_model=List[VisitResponse])
async def get_my_visits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get team visits assigned to current staff member"""
    # Debug: Log current user info
    print(f"🔍 Getting visits for user ID: {current_user.id}, Email: {current_user.email}, Name: {current_user.full_name}")
    
    visits = db.query(TeamVisit).filter(
        TeamVisit.team_member_id == current_user.id
    ).order_by(TeamVisit.created_at.desc()).all()
    
    # Debug: Log visit count and details
    print(f"📋 Found {len(visits)} visits for user {current_user.id}")
    for visit in visits:
        print(f"   - Visit ID: {visit.id}, Visitor: {visit.visitor_name}, Team Member ID: {visit.team_member_id}, Status: {visit.status}")
    
    return [VisitResponse.model_validate(v).model_dump() for v in visits]

@router.get("/team-visit/staff-members", response_model=List[dict])
async def get_staff_members(
    db: Session = Depends(get_db)
):
    """Get list of staff members for team visit selection (public endpoint)"""
    from app.models.user import User
    # Only show recruiter, management, and talent advisor roles (exclude admin)
    staff_members = db.query(User).filter(
        User.role.in_(["recruiter", "management", "talent"])
    ).filter(User.is_active == True).order_by(User.full_name).all()
    return [
        {
            "id": user.id,
            "name": user.full_name,
            "email": user.email
        }
        for user in staff_members
    ]

@router.get("/team-visit", response_model=List[VisitResponse])
async def list_team_visits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all team visits (staff only)"""
    visits = db.query(TeamVisit).order_by(TeamVisit.created_at.desc()).all()
    return [VisitResponse.model_validate(v).model_dump() for v in visits]

@router.patch("/team-visit/{visit_id}/notify")
async def notify_team_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark team visit as notified"""
    visit = db.query(TeamVisit).filter(TeamVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    visit.status = "notified"
    visit.notified_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Visit marked as notified"}

