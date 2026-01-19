from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)  # Event name (editable)
    unique_code = Column(String(50), unique=True, nullable=False, index=True)  # Unique code for URL/QR
    qr_code_data = Column(Text, nullable=True)  # Base64 encoded QR code image

    # Status
    is_active = Column(Boolean, default=True)  # Active events can receive registrations

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    attendees = relationship("EventAttendee", back_populates="event", cascade="all, delete-orphan")

class EventAttendee(Base):
    __tablename__ = "event_attendees"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)

    # Personal information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    zip_code = Column(String(10), nullable=False)

    # Requirements checkboxes
    english_communication = Column(Boolean, default=False)  # Speaks English
    education_proof = Column(Boolean, default=False)  # Has proof of education

    # Recruiter assignment
    assigned_recruiter_id = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    assigned_recruiter_name = Column(String(255), nullable=True)  # Denormalized for quick access

    # Status
    is_duplicate = Column(Boolean, default=False)  # Marked as duplicate
    is_checked = Column(Boolean, default=False)  # Checked by staff for assignment

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    event = relationship("Event", back_populates="attendees")
