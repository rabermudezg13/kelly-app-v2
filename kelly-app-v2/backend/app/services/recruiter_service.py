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
    """
    Assign the next available recruiter using the number of assignments already
    made for the same Info Session date/time slot.

    Important: assignment history is counted regardless of whether a visitor has
    already completed the session. Otherwise a completed visitor would disappear
    from the load count and could make the distribution uneven later in the day.
    Busy recruiters are never candidates for a new assignment.
    """
    if session_date is None:
        session_date = date.today()

    initialize_default_recruiters(db)

    available_recruiters = db.query(Recruiter).filter(
        Recruiter.is_active == True,
        Recruiter.status == "available"
    ).order_by(Recruiter.id).all()

    print(f"📊 Found {len(available_recruiters)} available recruiters for assignment")

    if not available_recruiters:
        print("⚠️ No available recruiters found, creating fallback recruiter")
        fallback_recruiter = Recruiter(
            name="Default Recruiter",
            email="recruiter@kellyeducation.com",
            status="available"
        )
        db.add(fallback_recruiter)
        db.commit()
        db.refresh(fallback_recruiter)
        return fallback_recruiter

    # Count every assignment already made for this date/time slot. We intentionally
    # do NOT filter by session status: initiated, answers_submitted, in-progress and
    # completed visitors all represent work that was assigned to that recruiter.
    assignments = {}
    for recruiter in available_recruiters:
        assignments[recruiter.id] = db.query(InfoSession).filter(
            InfoSession.assigned_recruiter_id == recruiter.id,
            InfoSession.time_slot == time_slot,
            func.date(InfoSession.created_at) == session_date,
        ).count()

    min_assignments = min(assignments.values()) if assignments else 0
    candidates = [
        recruiter for recruiter in available_recruiters
        if assignments.get(recruiter.id, 0) == min_assignments
    ]

    # If the time-slot counts tie, use total assignments for that day as a second
    # fairness check (again including completed visitors).
    if len(candidates) > 1:
        total_assignments = {}
        for recruiter in candidates:
            total_assignments[recruiter.id] = db.query(InfoSession).filter(
                InfoSession.assigned_recruiter_id == recruiter.id,
                func.date(InfoSession.created_at) == session_date,
            ).count()

        min_total = min(total_assignments.values())
        candidates = [
            recruiter for recruiter in candidates
            if total_assignments.get(recruiter.id, 0) == min_total
        ]

    # Final tie-breaker: continue after the recruiter who most recently received a
    # visitor among the tied candidates. This is a true round-robin tie-break and
    # does not depend on unrelated sessions assigned to other recruiters.
    if len(candidates) > 1:
        candidate_ids = [r.id for r in candidates]
        last_assignment = db.query(InfoSession).filter(
            InfoSession.assigned_recruiter_id.in_(candidate_ids),
            func.date(InfoSession.created_at) == session_date,
        ).order_by(InfoSession.created_at.desc(), InfoSession.id.desc()).first()

        candidates.sort(key=lambda r: r.id)
        if last_assignment and last_assignment.assigned_recruiter_id in candidate_ids:
            last_index = next(
                i for i, recruiter in enumerate(candidates)
                if recruiter.id == last_assignment.assigned_recruiter_id
            )
            selected = candidates[(last_index + 1) % len(candidates)]
        else:
            selected = candidates[0]

        print(
            f"🔄 Round-robin tie-break: {len(candidates)} candidates, "
            f"selected recruiter: {selected.name}"
        )
        return selected

    return candidates[0] if candidates else available_recruiters[0]


def initialize_default_recruiters(db: Session):
    """Initialize 5 default recruiters if they don't exist."""
    existing_count = db.query(Recruiter).count()

    if existing_count == 0:
        default_recruiters = [
            {"name": "Nicolette Rose", "email": "nicolette.rose@kellyeducation.com", "status": "available"},
            {"name": "Rodrigo Bermudez", "email": "rodrigo.bermudez@kellyeducation.com", "status": "available"},
            {"name": "Miccael Val", "email": "miccael.val@kellyeducation.com", "status": "available"},
            {"name": "Demetrius Lee", "email": "demetrius.lee@kellyeducation.com", "status": "available"},
            {"name": "Jorge Silva", "email": "jorge.silva@kellyeducation.com", "status": "available"},
        ]

        for recruiter_data in default_recruiters:
            recruiter = Recruiter(**recruiter_data)
            db.add(recruiter)

        db.commit()
