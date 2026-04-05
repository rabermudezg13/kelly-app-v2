"""
Storage Locations API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.database import get_db
from app.models.storage import StorageLocation
import uuid

router = APIRouter()

VALID_TYPES = {"box", "storage-room", "shelf", "other"}

class StorageCreate(BaseModel):
    name: str
    storage_type: str = "box"
    items: Optional[List[str]] = []
    notes: Optional[str] = None

class StorageUpdate(BaseModel):
    name: Optional[str] = None
    storage_type: Optional[str] = None
    items: Optional[List[str]] = None
    notes: Optional[str] = None

class StorageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    storage_type: str
    items: Optional[List[str]] = []
    notes: Optional[str] = None
    unique_code: str
    is_active: bool
    created_at: Optional[str] = None

    @classmethod
    def from_orm_obj(cls, obj: StorageLocation) -> "StorageResponse":
        items = obj.items or []
        if isinstance(items, str):
            import json
            try:
                items = json.loads(items)
            except Exception:
                items = []
        return cls(
            id=obj.id,
            name=obj.name,
            storage_type=obj.storage_type,
            items=items,
            notes=obj.notes,
            unique_code=obj.unique_code,
            is_active=obj.is_active,
            created_at=obj.created_at.isoformat() if obj.created_at else None,
        )


@router.get("/", response_model=List[StorageResponse])
def list_storage(db: Session = Depends(get_db)):
    locations = db.query(StorageLocation).filter(StorageLocation.is_active == True).order_by(StorageLocation.name).all()
    return [StorageResponse.from_orm_obj(loc) for loc in locations]


@router.post("/", response_model=StorageResponse, status_code=201)
def create_storage(payload: StorageCreate, db: Session = Depends(get_db)):
    if payload.storage_type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid type. Use: {', '.join(VALID_TYPES)}")
    loc = StorageLocation(
        name=payload.name.strip(),
        storage_type=payload.storage_type,
        items=payload.items or [],
        notes=payload.notes,
        unique_code=str(uuid.uuid4()),
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return StorageResponse.from_orm_obj(loc)


@router.get("/scan/{unique_code}")
def scan_storage(unique_code: str, db: Session = Depends(get_db)):
    """Public endpoint — called when a QR code is scanned."""
    loc = db.query(StorageLocation).filter(
        StorageLocation.unique_code == unique_code,
        StorageLocation.is_active == True,
    ).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Storage location not found")
    return StorageResponse.from_orm_obj(loc)


@router.get("/{storage_id}", response_model=StorageResponse)
def get_storage(storage_id: int, db: Session = Depends(get_db)):
    loc = db.query(StorageLocation).filter(StorageLocation.id == storage_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Not found")
    return StorageResponse.from_orm_obj(loc)


@router.put("/{storage_id}", response_model=StorageResponse)
def update_storage(storage_id: int, payload: StorageUpdate, db: Session = Depends(get_db)):
    loc = db.query(StorageLocation).filter(StorageLocation.id == storage_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Not found")
    if payload.name is not None:
        loc.name = payload.name.strip()
    if payload.storage_type is not None:
        if payload.storage_type not in VALID_TYPES:
            raise HTTPException(status_code=400, detail=f"Invalid type")
        loc.storage_type = payload.storage_type
    if payload.items is not None:
        loc.items = payload.items
    if payload.notes is not None:
        loc.notes = payload.notes
    db.commit()
    db.refresh(loc)
    return StorageResponse.from_orm_obj(loc)


@router.delete("/{storage_id}", status_code=204)
def delete_storage(storage_id: int, db: Session = Depends(get_db)):
    loc = db.query(StorageLocation).filter(StorageLocation.id == storage_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Not found")
    loc.is_active = False
    db.commit()
