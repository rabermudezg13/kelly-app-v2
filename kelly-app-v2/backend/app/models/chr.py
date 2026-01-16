"""
CHR (Candidate Hiring Request) Model
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum

class SubmittedToDistrict(str, enum.Enum):
    YES = "yes"
    NO = "no"

class DistrictNotified(str, enum.Enum):
    YES = "yes"
    NO = "no"

class CurrentStatus(str, enum.Enum):
    WAITING_DOCUMENTS = "waiting_documents"
    IN_REVIEW = "in_review"

class FinalDecision(str, enum.Enum):
    REJECTED = "rejected"
    APPROVED = "approved"
    NOT_APPROVED = "not_approved"
    PENDING = "pending"  # For cases without final decision yet

class CHR(Base):
    __tablename__ = "chr_cases"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_full_name = Column(String(255), nullable=False)
    bullhorn_id = Column(String(100), nullable=True)
    ssn = Column(String(11), nullable=True)  # Format: XXX-XX-XXXX
    dob = Column(Date, nullable=True)  # Date of Birth
    info_requested_sent_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)  # Calculated: info_requested_sent_date + 15 days
    submitted_to_district = Column(String(10), nullable=True)  # "yes" or "no"
    submission_date = Column(Date, nullable=True)
    district_notified = Column(String(10), nullable=True)  # "yes" or "no"
    current_status = Column(String(50), nullable=True)  # "waiting_documents" or "in_review"
    final_decision = Column(String(50), default="pending", nullable=True)  # "rejected", "approved", "not_approved", "pending"
    notes = Column(Text, nullable=True)
    days_since_review = Column(Integer, nullable=True)  # Calculated field
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
