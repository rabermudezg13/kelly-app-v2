"""
Event API endpoints for event registration and management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime
import secrets
import qrcode
import io
import base64
import os

from app.database import get_db
from app.models.event import Event, EventAttendee
from app.models.recruiter import Recruiter
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()

# Pydantic models
class EventCreate(BaseModel):
    name: str

class EventUpdate(BaseModel):
    name: str

class EventAttendeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    zip_code: str
    english_communication: bool
    education_proof: bool

class EventAttendeeUpdate(BaseModel):
    is_checked: Optional[bool] = None
    is_duplicate: Optional[bool] = None
    assigned_recruiter_id: Optional[int] = None

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    unique_code: str
    qr_code_data: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    attendee_count: Optional[int] = 0

class EventAttendeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    zip_code: str
    english_communication: bool
    education_proof: bool
    assigned_recruiter_id: Optional[int] = None
    assigned_recruiter_name: Optional[str] = None
    is_duplicate: bool
    is_checked: bool
    created_at: datetime

class RecruiterListResponse(BaseModel):
    recruiter_id: int
    recruiter_name: str
    attendees: List[EventAttendeeResponse]

# Helper function to generate QR code
def generate_qr_code(data: str) -> str:
    """Generate QR code as base64 encoded PNG"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode()

    return f"data:image/png;base64,{img_base64}"

# Create Event
@router.post("/events", response_model=EventResponse)
async def create_event(
    data: EventCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new event (staff only)"""
    # Generate unique code
    unique_code = secrets.token_urlsafe(16)

    # Generate QR code with registration URL
    # Priority: FRONTEND_URL env var > detected from request origin
    frontend_url = os.getenv('FRONTEND_URL')

    if not frontend_url:
        # Try to get from request headers (Referer or Origin)
        referer = request.headers.get('referer', '')
        origin = request.headers.get('origin', '')

        if origin:
            frontend_url = origin
        elif referer:
            # Extract base URL from referer
            from urllib.parse import urlparse
            parsed = urlparse(referer)
            frontend_url = f"{parsed.scheme}://{parsed.netloc}"
        else:
            # Fallback
            frontend_url = 'http://localhost:3025'

    registration_url = f"{frontend_url}/event/{unique_code}/register"
    qr_code_data = generate_qr_code(registration_url)

    event = Event(
        name=data.name,
        unique_code=unique_code,
        qr_code_data=qr_code_data,
        is_active=True
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    # Get attendee count
    attendee_count = db.query(func.count(EventAttendee.id)).filter(
        EventAttendee.event_id == event.id
    ).scalar()

    response_data = EventResponse.model_validate(event).model_dump()
    response_data['attendee_count'] = attendee_count

    return response_data

# Get all events
@router.get("/events", response_model=List[EventResponse])
async def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all events (staff only)"""
    events = db.query(Event).order_by(Event.created_at.desc()).all()

    response = []
    for event in events:
        attendee_count = db.query(func.count(EventAttendee.id)).filter(
            EventAttendee.event_id == event.id
        ).scalar()

        event_data = EventResponse.model_validate(event).model_dump()
        event_data['attendee_count'] = attendee_count
        response.append(event_data)

    return response

# Get single event by code (public - for registration page)
@router.get("/events/code/{unique_code}", response_model=EventResponse)
async def get_event_by_code(
    unique_code: str,
    db: Session = Depends(get_db)
):
    """Get event by unique code (public endpoint for registration)"""
    event = db.query(Event).filter(Event.unique_code == unique_code).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    if not event.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is no longer accepting registrations"
        )

    attendee_count = db.query(func.count(EventAttendee.id)).filter(
        EventAttendee.event_id == event.id
    ).scalar()

    response_data = EventResponse.model_validate(event).model_dump()
    response_data['attendee_count'] = attendee_count

    return response_data

# Update event
@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update event name (staff only)"""
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    event.name = data.name
    db.commit()
    db.refresh(event)

    attendee_count = db.query(func.count(EventAttendee.id)).filter(
        EventAttendee.event_id == event.id
    ).scalar()

    response_data = EventResponse.model_validate(event).model_dump()
    response_data['attendee_count'] = attendee_count

    return response_data

# Toggle event active status
@router.patch("/events/{event_id}/toggle-active")
async def toggle_event_active(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle event active status (staff only)"""
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    event.is_active = not event.is_active
    db.commit()

    return {"message": "Event status updated", "is_active": event.is_active}

# Delete event
@router.delete("/events/{event_id}")
async def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an event and all its attendees (staff only)"""
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Delete event (cascade will delete all attendees)
    db.delete(event)
    db.commit()

    return {"message": "Event deleted successfully"}

# Register attendee (public endpoint)
@router.post("/events/{unique_code}/register", response_model=EventAttendeeResponse)
async def register_attendee(
    unique_code: str,
    data: EventAttendeeCreate,
    db: Session = Depends(get_db)
):
    """Register an attendee for an event (public endpoint)"""
    # Find event
    event = db.query(Event).filter(Event.unique_code == unique_code).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    if not event.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is no longer accepting registrations"
        )

    # Create attendee
    attendee = EventAttendee(
        event_id=event.id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        zip_code=data.zip_code,
        english_communication=data.english_communication,
        education_proof=data.education_proof
    )

    db.add(attendee)
    db.commit()
    db.refresh(attendee)

    return EventAttendeeResponse.model_validate(attendee).model_dump()

# Get attendees for an event
@router.get("/events/{event_id}/attendees", response_model=List[EventAttendeeResponse])
async def get_event_attendees(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all attendees for an event (staff only)"""
    attendees = db.query(EventAttendee).filter(
        EventAttendee.event_id == event_id
    ).order_by(EventAttendee.created_at.desc()).all()

    return [EventAttendeeResponse.model_validate(a).model_dump() for a in attendees]

# Update attendee (check, duplicate, assign recruiter)
@router.patch("/attendees/{attendee_id}", response_model=EventAttendeeResponse)
async def update_attendee(
    attendee_id: int,
    data: EventAttendeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update attendee (staff only)"""
    attendee = db.query(EventAttendee).filter(EventAttendee.id == attendee_id).first()

    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendee not found"
        )

    # Update fields
    if data.is_checked is not None:
        attendee.is_checked = data.is_checked

    if data.is_duplicate is not None:
        attendee.is_duplicate = data.is_duplicate

    if data.assigned_recruiter_id is not None:
        recruiter = db.query(Recruiter).filter(Recruiter.id == data.assigned_recruiter_id).first()
        if recruiter:
            attendee.assigned_recruiter_id = data.assigned_recruiter_id
            attendee.assigned_recruiter_name = recruiter.name
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recruiter not found"
            )

    db.commit()
    db.refresh(attendee)

    return EventAttendeeResponse.model_validate(attendee).model_dump()

# Bulk update request model
class BulkUpdateRequest(BaseModel):
    attendee_ids: List[int]
    is_checked: Optional[bool] = None
    is_duplicate: Optional[bool] = None
    assigned_recruiter_id: Optional[int] = None

# Bulk update attendees
@router.post("/attendees/bulk-update")
async def bulk_update_attendees(
    request: BulkUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk update multiple attendees (staff only)"""
    attendees = db.query(EventAttendee).filter(EventAttendee.id.in_(request.attendee_ids)).all()

    if not attendees:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No attendees found"
        )

    # Get recruiter name if assigning
    recruiter_name = None
    if request.assigned_recruiter_id is not None:
        recruiter = db.query(Recruiter).filter(Recruiter.id == request.assigned_recruiter_id).first()
        if recruiter:
            recruiter_name = recruiter.name
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recruiter not found"
            )

    # Update all attendees
    for attendee in attendees:
        if request.is_checked is not None:
            attendee.is_checked = request.is_checked

        if request.is_duplicate is not None:
            attendee.is_duplicate = request.is_duplicate

        if request.assigned_recruiter_id is not None:
            attendee.assigned_recruiter_id = request.assigned_recruiter_id
            attendee.assigned_recruiter_name = recruiter_name

    db.commit()

    return {"message": f"Updated {len(attendees)} attendees"}

# Delete duplicates
@router.delete("/events/{event_id}/remove-duplicates")
async def remove_duplicates(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove attendees marked as duplicates (staff only)"""
    deleted_count = db.query(EventAttendee).filter(
        EventAttendee.event_id == event_id,
        EventAttendee.is_duplicate == True
    ).delete()

    db.commit()

    return {"message": f"Removed {deleted_count} duplicate attendees"}

# Get recruiter lists
@router.get("/events/{event_id}/recruiter-lists", response_model=List[RecruiterListResponse])
async def get_recruiter_lists(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attendees grouped by assigned recruiter (staff only)"""
    # Get all attendees assigned to recruiters
    attendees = db.query(EventAttendee).filter(
        EventAttendee.event_id == event_id,
        EventAttendee.assigned_recruiter_id.isnot(None),
        EventAttendee.is_duplicate == False
    ).order_by(EventAttendee.assigned_recruiter_id, EventAttendee.created_at).all()

    # Group by recruiter
    recruiter_map = {}
    for attendee in attendees:
        if attendee.assigned_recruiter_id not in recruiter_map:
            recruiter_map[attendee.assigned_recruiter_id] = {
                "recruiter_id": attendee.assigned_recruiter_id,
                "recruiter_name": attendee.assigned_recruiter_name or "Unknown",
                "attendees": []
            }
        recruiter_map[attendee.assigned_recruiter_id]["attendees"].append(
            EventAttendeeResponse.model_validate(attendee).model_dump()
        )

    return list(recruiter_map.values())

# Delete attendee
@router.delete("/attendees/{attendee_id}")
async def delete_attendee(
    attendee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an attendee (staff only)"""
    attendee = db.query(EventAttendee).filter(EventAttendee.id == attendee_id).first()

    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendee not found"
        )

    db.delete(attendee)
    db.commit()

    return {"message": "Attendee deleted successfully"}
