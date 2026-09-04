"""
Service for recruiter assignment
Implements equitable distribution among recruiters
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.recruiter import Recruiter
from app.models.info_session import InfoSession
from typing import Optional
from datetime import date


def get_next_recruiter(db: Session, time_slot: str, session_date: date = None) -> Optional[Recruiter]:
    """Assign the next available recruiter with a small, constant number of queries."""
    if session_date is None:
        session_date = date.today()

    available_recruiters = db.query(Recruiter).filter(
        Recruiter.is_active == True,
        Recruiter.status == "available"
    ).order_by(Recruiter.id).all()

    if not available_recruiters:
        initialize_default_recruiters(db)
        available_recruiters = db.query(Recruiter).filter(
            Recruiter.is_active == True,
            Recruiter.status == "available"
        ).order_by(Recruiter.id).all()

    if not available_recruiters:
        fallback_recruiter = Recruiter(
            name="Default Recruiter",
            email="recruiter@kellyeducation.com",
            status="available"
        )
        db.add(fallback_recruiter)
        db.flush()
        return fallback_recruiter

    recruiter_ids = [r.id for r in available_recruiters]

    # One grouped query replaces one COUNT query per recruiter.
    slot_rows = db.query(
        InfoSession.assigned_recruiter_id,
        func.count(InfoSession.id)
    ).filter(
        InfoSession.assigned_recruiter_id.in_(recruiter_ids),
        InfoSession.time_slot == time_slot,
        func.date(InfoSession.created_at) == session_date,
    ).group_by(InfoSession.assigned_recruiter_id).all()
    slot_counts = {rid: count for rid, count in slot_rows}

    min_slot = min(slot_counts.get(r.id, 0) for r in available_recruiters)
    candidates = [r for r in available_recruiters if slot_counts.get(r.id, 0) == min_slot]

    if len(candidates) > 1:
        candidate_ids = [r.id for r in candidates]
        total_rows = db.query(
            InfoSession.assigned_recruiter_id,
            func.count(InfoSession.id)
        ).filter(
            InfoSession.assigned_recruiter_id.in_(candidate_ids),
            func.date(InfoSession.created_at) == session_date,
        ).group_by(InfoSession.assigned_recruiter_id).all()
        total_counts = {rid: count for rid, count in total_rows}
        min_total = min(total_counts.get(r.id, 0) for r in candidates)
        candidates = [r for r in candidates if total_counts.get(r.id, 0) == min_total]

    if len(candidates) > 1:
        candidate_ids = [r.id for r in candidates]
        last_assignment = db.query(InfoSession.assigned_recruiter_id).filter(
            InfoSession.assigned_recruiter_id.in_(candidate_ids),
            func.date(InfoSession.created_at) == session_date,
        ).order_by(InfoSession.created_at.desc(), InfoSession.id.desc()).first()
        candidates.sort(key=lambda r: r.id)
        if last_assignment and last_assignment[0] in candidate_ids:
            last_index = next(i for i, recruiter in enumerate(candidates) if recruiter.id == last_assignment[0])
            return candidates[(last_index + 1) % len(candidates)]

    return candidates[0] if candidates else available_recruiters[0]


def initialize_default_recruiters(db: Session):
    """Initialize default recruiters only when the recruiter table is empty."""
    # EXISTS is cheaper than COUNT(*) and this function should rarely need to write.
    if db.query(Recruiter.id).first() is not None:
        return

    default_recruiters = [
        {"name": "Nicolette Rose", "email": "nicolette.rose@kellyeducation.com", "status": "available"},
        {"name": "Rodrigo Bermudez", "email": "rodrigo.bermudez@kellyeducation.com", "status": "available"},
        {"name": "Miccael Val", "email": "miccael.val@kellyeducation.com", "status": "available"},
        {"name": "Demetrius Lee", "email": "demetrius.lee@kellyeducation.com", "status": "available"},
        {"name": "Jorge Silva", "email": "jorge.silva@kellyeducation.com", "status": "available"},
    ]
    for recruiter_data in default_recruiters:
        db.add(Recruiter(**recruiter_data))
    # Flush makes them available in this transaction; caller owns the commit.
    db.flush()
