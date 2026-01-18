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
    
    # Get all active recruiters for fair distribution
    # Use ALL active recruiters, not just "available" ones, to ensure fair rotation
    available_recruiters = db.query(Recruiter).filter(
        Recruiter.is_active == True
    ).order_by(Recruiter.id).all()  # Order by ID for consistent sorting
    
    print(f"📊 Found {len(available_recruiters)} active recruiters for assignment")
    
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
    
    # If still multiple candidates with same assignments, use round-robin
    # Sort consistently by ID to ensure fair rotation
    if len(candidates) > 1:
        candidates.sort(key=lambda r: r.id)
        
        # Count all sessions for today (including completed) to determine round-robin position
        # This ensures fair rotation even when all have same active assignments
        all_sessions_today = db.query(InfoSession).filter(
            func.date(InfoSession.created_at) == session_date
        ).count()
        
        # Use modulo to rotate through candidates
        selected_index = all_sessions_today % len(candidates)
        selected_recruiter = candidates[selected_index]
        
        print(f"🔄 Round-robin selection: {len(candidates)} candidates, total sessions today: {all_sessions_today}, selected index: {selected_index}, recruiter: {selected_recruiter.name}")
        return selected_recruiter
    
    # Return the single candidate or first available recruiter
    return candidates[0] if candidates else available_recruiters[0]

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

