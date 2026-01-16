"""
Service for recruiter assignment
Implements equitable distribution among recruiters
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.recruiter import Recruiter
from app.models.info_session import InfoSession
from typing import Optional
from datetime import datetime, date

def get_next_recruiter(db: Session, time_slot: str, session_date: date = None) -> Optional[Recruiter]:
    """
    Get the next recruiter to assign based on equitable distribution
    First tries available recruiters, but if none are available, uses all active recruiters
    Uses round-robin approach based on current assignments for the same time slot
    ALWAYS returns a recruiter - creates default recruiters if none exist
    """
    if session_date is None:
        session_date = date.today()
    
    # Ensure default recruiters exist
    initialize_default_recruiters(db)
    
    # First, try to get all active AND available recruiters (not busy)
    available_recruiters = db.query(Recruiter).filter(
        Recruiter.is_active == True,
        Recruiter.status == "available"
    ).all()
    
    # If no available recruiters, use all active recruiters (including busy ones)
    if not available_recruiters:
        available_recruiters = db.query(Recruiter).filter(
            Recruiter.is_active == True
        ).all()
    
    # If still no recruiters, get ANY recruiter (even inactive ones) - we need to assign someone
    if not available_recruiters:
        available_recruiters = db.query(Recruiter).all()
    
    # If STILL no recruiters exist (shouldn't happen after initialize_default_recruiters), 
    # create a fallback recruiter
    if not available_recruiters:
        print("⚠️ No recruiters found, creating fallback recruiter")
        fallback_recruiter = Recruiter(
            name="Default Recruiter",
            email="recruiter@kellyeducation.com",
            status="available"
        )
        db.add(fallback_recruiter)
        db.commit()
        db.refresh(fallback_recruiter)
        return fallback_recruiter
    
    # Count assignments per recruiter for this time slot and date
    # Only count active sessions (in-progress or registered), not completed ones
    assignments = {}
    for recruiter in available_recruiters:
        count = db.query(InfoSession).filter(
            InfoSession.assigned_recruiter_id == recruiter.id,
            InfoSession.time_slot == time_slot,
            func.date(InfoSession.created_at) == session_date,
            InfoSession.status.in_(["registered", "in-progress"])  # Only count active sessions
        ).count()
        assignments[recruiter.id] = count
    
    # Find recruiter with minimum assignments (equitable distribution)
    min_assignments = min(assignments.values()) if assignments else 0
    candidates = [
        recruiter for recruiter in available_recruiters
        if assignments.get(recruiter.id, 0) == min_assignments
    ]
    
    # If multiple candidates, use round-robin based on total assignments
    if len(candidates) > 1:
        # Get total assignments across all time slots for today
        # Only count active sessions (in-progress or registered), not completed ones
        total_assignments = {}
        for recruiter in candidates:
            total = db.query(InfoSession).filter(
                InfoSession.assigned_recruiter_id == recruiter.id,
                func.date(InfoSession.created_at) == session_date,
                InfoSession.status.in_(["registered", "in-progress"])  # Only count active sessions
            ).count()
            total_assignments[recruiter.id] = total
        
        # Select recruiter with minimum total assignments
        min_total = min(total_assignments.values())
        candidates = [
            recruiter for recruiter in candidates
            if total_assignments.get(recruiter.id, 0) == min_total
        ]
    
    # Return first candidate (or random if still multiple)
    import random
    return random.choice(candidates) if candidates else available_recruiters[0]

def initialize_default_recruiters(db: Session):
    """
    Initialize 5 default recruiters if they don't exist
    All start as available
    """
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

