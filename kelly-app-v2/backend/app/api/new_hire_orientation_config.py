"""
New Hire Orientation Configuration API endpoints
Admin endpoints for managing new hire orientation settings
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.database import get_db
from app.models.new_hire_orientation_config import NewHireOrientationConfig
import json

router = APIRouter()

class StepConfig(BaseModel):
    step_name: str
    step_description: str

class NewHireOrientationConfigCreate(BaseModel):
    max_sessions_per_day: int = 2
    time_slots: List[str] = ["9:00 AM", "2:00 PM"]
    is_active: bool = True

class NewHireOrientationConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    max_sessions_per_day: int
    time_slots: List[str]
    steps: Optional[List[StepConfig]] = None
    is_active: bool

@router.get("/", response_model=NewHireOrientationConfigResponse)
async def get_new_hire_orientation_config(db: Session = Depends(get_db)):
    """Get current new hire orientation configuration"""
    try:
        config = db.query(NewHireOrientationConfig).filter(NewHireOrientationConfig.is_active == True).first()
        
        if not config:
            # Create default config if none exists
            default_config = NewHireOrientationConfig(
                max_sessions_per_day=2,
                time_slots=["9:00 AM", "2:00 PM"],
                is_active=True
            )
            db.add(default_config)
            db.commit()
            db.refresh(default_config)
            # Build response manually
            return {
                "id": default_config.id,
                "max_sessions_per_day": default_config.max_sessions_per_day,
                "time_slots": json.loads(default_config.time_slots) if isinstance(default_config.time_slots, str) else default_config.time_slots,
                "is_active": default_config.is_active,
                "steps": None
            }
        
        # Build response manually to handle JSON conversion
        config_data = {
            "id": config.id,
            "max_sessions_per_day": config.max_sessions_per_day,
            "time_slots": json.loads(config.time_slots) if isinstance(config.time_slots, str) else config.time_slots,
            "is_active": config.is_active,
        }
        
        # Handle steps if they exist (column might not exist in old databases)
        try:
            if hasattr(config, 'steps') and config.steps:
                if isinstance(config.steps, str):
                    config_data['steps'] = json.loads(config.steps)
                else:
                    config_data['steps'] = config.steps
            else:
                config_data['steps'] = None
        except AttributeError:
            config_data['steps'] = None
        
        return NewHireOrientationConfigResponse.model_validate(config_data)
    except Exception as e:
        print(f"Error getting new hire orientation config: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error loading configuration: {str(e)}")

@router.put("/", response_model=NewHireOrientationConfigResponse)
async def update_new_hire_orientation_config(
    config_data: NewHireOrientationConfigCreate,
    db: Session = Depends(get_db)
):
    """Update new hire orientation configuration (admin only)"""
    try:
        # Get existing steps from current config BEFORE deactivating
        existing_config = db.query(NewHireOrientationConfig).filter(NewHireOrientationConfig.is_active == True).first()
        steps_json = None
        if existing_config:
            try:
                steps_json = existing_config.steps if hasattr(existing_config, 'steps') and existing_config.steps else None
            except AttributeError:
                steps_json = None
        
        # Deactivate all existing configs
        db.query(NewHireOrientationConfig).update({NewHireOrientationConfig.is_active: False})
        db.commit()
        
        # Create new active config
        # Convert list to JSON string for storage
        time_slots_json = json.dumps(config_data.time_slots) if isinstance(config_data.time_slots, list) else config_data.time_slots
        
        new_config = NewHireOrientationConfig(
            max_sessions_per_day=config_data.max_sessions_per_day,
            time_slots=time_slots_json,
            steps=steps_json,  # Keep existing steps or None (backend will use defaults)
            is_active=True
        )
        db.add(new_config)
        db.commit()
        db.refresh(new_config)
        
        # Build response manually to handle JSON conversion
        config_response = {
            "id": new_config.id,
            "max_sessions_per_day": new_config.max_sessions_per_day,
            "time_slots": json.loads(new_config.time_slots) if isinstance(new_config.time_slots, str) else new_config.time_slots,
            "is_active": new_config.is_active,
        }
        
        # Handle steps if they exist
        if new_config.steps:
            if isinstance(new_config.steps, str):
                config_response['steps'] = json.loads(new_config.steps)
            else:
                config_response['steps'] = new_config.steps
        
        return NewHireOrientationConfigResponse.model_validate(config_response)
    except Exception as e:
        db.rollback()
        print(f"Error updating new hire orientation config: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating configuration: {str(e)}")

@router.get("/time-slots")
async def get_available_time_slots(db: Session = Depends(get_db)):
    """Get available time slots for new hire orientations"""
    try:
        config = db.query(NewHireOrientationConfig).filter(NewHireOrientationConfig.is_active == True).first()
        
        if not config:
            # Return default time slots
            return ["9:00 AM", "2:00 PM"]
        
        # Handle both JSON string and list
        time_slots = config.time_slots
        
        if time_slots is None:
            return ["9:00 AM", "2:00 PM"]
        
        if isinstance(time_slots, str):
            try:
                parsed = json.loads(time_slots)
                if isinstance(parsed, list):
                    return [str(slot) for slot in parsed if slot]
                return ["9:00 AM", "2:00 PM"]
            except (json.JSONDecodeError, TypeError, ValueError):
                return ["9:00 AM", "2:00 PM"]
        elif isinstance(time_slots, list):
            return [str(slot) for slot in time_slots if slot]
        else:
            return ["9:00 AM", "2:00 PM"]
    except Exception as e:
        print(f"Error in get_available_time_slots: {e}")
        return ["9:00 AM", "2:00 PM"]


