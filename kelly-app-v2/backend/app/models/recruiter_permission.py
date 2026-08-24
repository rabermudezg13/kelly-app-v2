from sqlalchemy import Boolean, Column, DateTime, Integer
from sqlalchemy.sql import func

from app.database import Base


class RecruiterPermission(Base):
    """Global permissions that an administrator can grant to recruiters."""

    __tablename__ = "recruiter_permissions"

    id = Column(Integer, primary_key=True, default=1)
    allow_reassignments = Column(Boolean, nullable=False, default=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
