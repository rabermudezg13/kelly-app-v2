from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from app.database import Base


class InfoSessionProgress(Base):
    __tablename__ = "info_session_progress"

    id = Column(Integer, primary_key=True, index=True)
    info_session_id = Column(Integer, ForeignKey("info_sessions.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    ob_sent = Column(Boolean, default=False, nullable=False)
    ob_completed = Column(Boolean, default=False, nullable=False)
    i9_sent = Column(Boolean, default=False, nullable=False)
    i9_completed = Column(Boolean, default=False, nullable=False)
    existing_i9 = Column(Boolean, default=False, nullable=False)
    needs_schedule_fp = Column(Boolean, default=False, nullable=False)
    existing_fp = Column(Boolean, default=False, nullable=False)
    pending_drug_screening = Column(Boolean, default=False, nullable=False)
    drug_screening_complete = Column(Boolean, default=False, nullable=False)
    trainings_sent = Column(Boolean, default=False, nullable=False)
    nho_scheduled = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
