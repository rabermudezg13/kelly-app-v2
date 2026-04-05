from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.database import Base
import uuid

class StorageLocation(Base):
    __tablename__ = "storage_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    storage_type = Column(String(50), nullable=False, default="box")  # box, storage-room, shelf, other
    items = Column(JSON, nullable=True)  # list of item strings
    notes = Column(Text, nullable=True)
    unique_code = Column(String(64), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
