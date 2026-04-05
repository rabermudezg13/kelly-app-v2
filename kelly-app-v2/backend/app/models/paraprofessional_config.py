from sqlalchemy import Column, Integer, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class ParaprofessionalConfig(Base):
    __tablename__ = "paraprofessional_config"

    id = Column(Integer, primary_key=True, index=True)
    max_sessions_per_day = Column(Integer, default=2)
    time_slots = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
