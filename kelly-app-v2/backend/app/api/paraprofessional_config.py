"""
Paraprofessional Configuration API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List
from app.database import get_db
from app.models.paraprofessional_config import ParaprofessionalConfig
import json

router = APIRouter()

DEFAULT_SLOTS = ["9:00 AM", "1:00 PM"]

class ParaprofessionalConfigCreate(BaseModel):
    max_sessions_per_day: int = 2
    time_slots: List[str] = DEFAULT_SLOTS
    is_active: bool = True

class ParaprofessionalConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    max_sessions_per_day: int
    time_slots: List[str]
    is_active: bool

def _parse_slots(raw) -> List[str]:
    if raw is None:
        return DEFAULT_SLOTS
    if isinstance(raw, str):
        try:
            parsed = json.loads(raw)
            return [str(s) for s in parsed if s] if isinstance(parsed, list) else DEFAULT_SLOTS
        except Exception:
            return DEFAULT_SLOTS
    if isinstance(raw, list):
        return [str(s) for s in raw if s]
    return DEFAULT_SLOTS

def _get_or_create(db: Session) -> ParaprofessionalConfig:
    config = db.query(ParaprofessionalConfig).filter(ParaprofessionalConfig.is_active == True).first()
    if not config:
        config = ParaprofessionalConfig(
            max_sessions_per_day=2,
            time_slots=json.dumps(DEFAULT_SLOTS),
            is_active=True,
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.get("/", response_model=ParaprofessionalConfigResponse)
async def get_paraprofessional_config(db: Session = Depends(get_db)):
    config = _get_or_create(db)
    return ParaprofessionalConfigResponse(
        id=config.id,
        max_sessions_per_day=config.max_sessions_per_day,
        time_slots=_parse_slots(config.time_slots),
        is_active=config.is_active,
    )

@router.put("/", response_model=ParaprofessionalConfigResponse)
async def update_paraprofessional_config(
    config_data: ParaprofessionalConfigCreate,
    db: Session = Depends(get_db),
):
    try:
        db.query(ParaprofessionalConfig).update({ParaprofessionalConfig.is_active: False})
        db.commit()
        new_config = ParaprofessionalConfig(
            max_sessions_per_day=config_data.max_sessions_per_day,
            time_slots=json.dumps(config_data.time_slots),
            is_active=True,
        )
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        return ParaprofessionalConfigResponse(
            id=new_config.id,
            max_sessions_per_day=new_config.max_sessions_per_day,
            time_slots=_parse_slots(new_config.time_slots),
            is_active=new_config.is_active,
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/time-slots")
async def get_time_slots(db: Session = Depends(get_db)):
    config = _get_or_create(db)
    return _parse_slots(config.time_slots)
