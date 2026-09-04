"""
Info Session Configuration API endpoints
Admin endpoints for managing info session settings
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List
from app.database import get_db
from app.models.info_session_config import InfoSessionConfig, InfoSessionInterest, apply_interests_to_generated_row
from app.models.info_session import InfoSession
import json

router = APIRouter()

class InfoSessionConfigCreate(BaseModel):
    max_sessions_per_day: int = 2
    time_slots: List[str] = ["8:30 AM", "1:30 PM"]
    is_active: bool = True

class InfoSessionConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    max_sessions_per_day: int
    time_slots: List[str]
    is_active: bool

class CandidateInterestUpdate(BaseModel):
    special_ed_head_start_interest: bool = False
    paraprofessional_interest: bool = False

@router.get("/", response_model=InfoSessionConfigResponse)
async def get_info_session_config(db: Session = Depends(get_db)):
    """Get current info session configuration"""
    config = db.query(InfoSessionConfig).filter(InfoSessionConfig.is_active == True).first()
    
    if not config:
        default_config = InfoSessionConfig(
            max_sessions_per_day=2,
            time_slots=["8:30 AM", "1:30 PM"],
            is_active=True
        )
        db.add(default_config)
        db.commit()
        db.refresh(default_config)
        return InfoSessionConfigResponse.model_validate(default_config).model_dump()
    
    config_data = InfoSessionConfigResponse.model_validate(config).model_dump()
    if isinstance(config_data.get('time_slots'), str):
        config_data['time_slots'] = json.loads(config_data['time_slots'])
    return config_data

@router.put("/", response_model=InfoSessionConfigResponse)
async def update_info_session_config(
    config_data: InfoSessionConfigCreate,
    db: Session = Depends(get_db)
):
    """Update info session configuration (admin only)"""
    db.query(InfoSessionConfig).update({InfoSessionConfig.is_active: False})
    time_slots_json = json.dumps(config_data.time_slots) if isinstance(config_data.time_slots, list) else config_data.time_slots
    new_config = InfoSessionConfig(
        max_sessions_per_day=config_data.max_sessions_per_day,
        time_slots=time_slots_json,
        is_active=True
    )
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    return InfoSessionConfigResponse.model_validate(new_config).model_dump()

@router.get("/time-slots", response_model=List[str])
async def get_available_time_slots(db: Session = Depends(get_db)):
    """Get available time slots for info sessions"""
    config = db.query(InfoSessionConfig).filter(InfoSessionConfig.is_active == True).first()
    if not config:
        return ["8:30 AM", "1:30 PM"]
    if isinstance(config.time_slots, str):
        return json.loads(config.time_slots)
    return config.time_slots

@router.get("/{session_id}/interests")
async def get_candidate_interests(session_id: int, db: Session = Depends(get_db)):
    """Return the two optional interest answers for an Info Session visitor."""
    session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Info session not found")
    interest = db.query(InfoSessionInterest).filter(InfoSessionInterest.info_session_id == session_id).first()
    return {
        "special_ed_head_start_interest": bool(interest.special_ed_head_start_interest) if interest else False,
        "paraprofessional_interest": bool(interest.paraprofessional_interest) if interest else False,
    }

@router.put("/{session_id}/interests")
async def update_candidate_interests(session_id: int, data: CandidateInterestUpdate, db: Session = Depends(get_db)):
    """Persist post-interview interests and apply them to an existing generated row, if present."""
    session = db.query(InfoSession).filter(InfoSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Info session not found")

    interest = db.query(InfoSessionInterest).filter(InfoSessionInterest.info_session_id == session_id).first()
    if not interest:
        interest = InfoSessionInterest(info_session_id=session_id)
        db.add(interest)

    interest.special_ed_head_start_interest = data.special_ed_head_start_interest
    interest.paraprofessional_interest = data.paraprofessional_interest
    db.flush()

    if session.generated_row:
        session.generated_row = apply_interests_to_generated_row(db, session, session.generated_row)

    db.commit()
    return {
        "message": "Candidate interests saved",
        "special_ed_head_start_interest": interest.special_ed_head_start_interest,
        "paraprofessional_interest": interest.paraprofessional_interest,
    }
