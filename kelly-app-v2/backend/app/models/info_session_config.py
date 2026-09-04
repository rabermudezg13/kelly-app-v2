from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, event
from sqlalchemy.sql import func
from sqlalchemy.orm import object_session, attributes
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
    """Apply session-type and interest rules to a tab-separated generated row."""
    if not generated_row or not db or not info_session:
        return generated_row

    from app.models.row_template import RowTemplate
    template = db.query(RowTemplate).filter(RowTemplate.is_active == True).order_by(RowTemplate.id.asc()).first()
    if not template or not template.columns:
        return generated_row

    interest = db.query(InfoSessionInterest).filter(
        InfoSessionInterest.info_session_id == info_session.id
    ).first()

    values = generated_row.split("\t")
    columns = sorted(template.columns, key=lambda c: c.order)
    if len(values) < len(columns):
        values.extend([""] * (len(columns) - len(values)))

    session_type = (getattr(info_session, "session_type", "") or "").strip().lower()

    for idx, column in enumerate(columns):
        name = (column.name or "").strip().lower()

        # Talent Type rule is independent of the optional interest questions.
        if name == "talent type":
            if session_type == "reactivation":
                values[idx] = "Re-Activation"
            elif session_type == "new-hire":
                values[idx] = "New"

        if interest and interest.special_ed_head_start_interest and name == "job title":
            values[idx] = "ECE. Birth 3"

        if interest and interest.paraprofessional_interest and name == "notes":
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
            print(f"⚠️ Could not apply candidate/session rules to generated row: {exc}")
            return value

    @event.listens_for(InfoSession, "load")
    def _apply_rules_to_loaded_generated_row(target, context):
        """Expose corrected legacy rows to the recruiter UI without overwriting DB data on read."""
        db = object_session(target)
        if not db or not target.generated_row:
            return
        try:
            corrected = apply_interests_to_generated_row(db, target, target.generated_row)
            if corrected != target.generated_row:
                attributes.set_committed_value(target, "generated_row", corrected)
        except Exception as exc:
            print(f"⚠️ Could not apply candidate/session rules while loading row: {exc}")
except Exception as exc:
    print(f"⚠️ Could not register generated-row rule listeners: {exc}")
