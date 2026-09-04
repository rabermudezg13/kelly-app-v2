from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, event
from sqlalchemy.sql import func
from sqlalchemy.orm import object_session
from app.database import Base

class InfoSessionConfig(Base):
    __tablename__ = "info_session_config"
    
    id = Column(Integer, primary_key=True, index=True)
    max_sessions_per_day = Column(Integer, default=2)  # Default: 2 sessions (morning and afternoon)
    time_slots = Column(JSON, nullable=False)  # Array of time slots, e.g., ["8:30 AM", "1:30 PM"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class InfoSessionInterest(Base):
    """Optional post-interview interests. Separate table preserves all legacy InfoSession rows."""
    __tablename__ = "info_session_interests"

    id = Column(Integer, primary_key=True, index=True)
    info_session_id = Column(Integer, ForeignKey("info_sessions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    special_ed_head_start_interest = Column(Boolean, nullable=False, default=False)
    paraprofessional_interest = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


def apply_interests_to_generated_row(db, info_session, generated_row):
    """Apply interest rules to a tab-separated generated row without changing template structure."""
    if not generated_row or not db or not info_session:
        return generated_row

    interest = db.query(InfoSessionInterest).filter(
        InfoSessionInterest.info_session_id == info_session.id
    ).first()
    if not interest:
        return generated_row

    from app.models.row_template import RowTemplate
    template = db.query(RowTemplate).filter(RowTemplate.is_active == True).order_by(RowTemplate.id.asc()).first()
    if not template or not template.columns:
        return generated_row

    values = generated_row.split("\t")
    columns = sorted(template.columns, key=lambda c: c.order)
    if len(values) < len(columns):
        values.extend([""] * (len(columns) - len(values)))

    for idx, column in enumerate(columns):
        name = (column.name or "").strip().lower()
        if interest.special_ed_head_start_interest and name == "job title":
            values[idx] = "ECE. Birth 3"
        if interest.paraprofessional_interest and name == "notes":
            existing = (values[idx] or "").strip()
            phrase = "Paraprofessional interested"
            if phrase.lower() not in existing.lower():
                values[idx] = f"{existing}; {phrase}" if existing else phrase

    return "\t".join(values)


try:
    from app.models.info_session import InfoSession

    @event.listens_for(InfoSession.generated_row, "set", retval=True)
    def _apply_interest_rules_when_row_is_generated(target, value, oldvalue, initiator):
        db = object_session(target)
        try:
            return apply_interests_to_generated_row(db, target, value)
        except Exception as exc:
            print(f"⚠️ Could not apply candidate interests to generated row: {exc}")
            return value
except Exception as exc:
    print(f"⚠️ Could not register generated-row interest listener: {exc}")
