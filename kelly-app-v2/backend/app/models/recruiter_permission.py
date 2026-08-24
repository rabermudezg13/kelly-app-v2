from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func

from app.database import Base


class RecruiterPermission(Base):
    """Global permissions that an administrator can grant to recruiters."""

    __tablename__ = "recruiter_reassignment_permissions"

    recruiter_id = Column(Integer, ForeignKey("recruiters.id"), primary_key=True)
    allow_reassignments = Column(Boolean, nullable=False, default=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
