#!/usr/bin/env python3
"""
Script to assign recruiters to info sessions that don't have one assigned
Run this to fix existing sessions without assigned recruiters
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.info_session import InfoSession
from app.models.recruiter import Recruiter
from app.services.recruiter_service import get_next_recruiter, initialize_default_recruiters
from datetime import date

def assign_missing_recruiters():
    """Assign recruiters to all info sessions that don't have one"""
    db = SessionLocal()
    try:
        # Initialize default recruiters if needed
        initialize_default_recruiters(db)
        
        # Find all sessions without assigned recruiter
        unassigned_sessions = db.query(InfoSession).filter(
            InfoSession.assigned_recruiter_id == None
        ).all()
        
        print(f"Found {len(unassigned_sessions)} sessions without assigned recruiter")
        
        assigned_count = 0
        for session in unassigned_sessions:
            # Get recruiter for this session's time slot
            session_date = session.created_at.date() if session.created_at else date.today()
            recruiter = get_next_recruiter(db, session.time_slot, session_date)
            
            if recruiter:
                session.assigned_recruiter_id = recruiter.id
                assigned_count += 1
                print(f"✅ Assigned session {session.id} ({session.first_name} {session.last_name}) to {recruiter.name}")
            else:
                # Fallback: get first active recruiter
                fallback_recruiter = db.query(Recruiter).filter(Recruiter.is_active == True).first()
                if fallback_recruiter:
                    session.assigned_recruiter_id = fallback_recruiter.id
                    assigned_count += 1
                    print(f"✅ Assigned session {session.id} ({session.first_name} {session.last_name}) to {fallback_recruiter.name} (fallback)")
                else:
                    print(f"❌ Could not assign session {session.id} ({session.first_name} {session.last_name}) - no recruiters available")
        
        if assigned_count > 0:
            db.commit()
            print(f"\n✅ Successfully assigned {assigned_count} sessions to recruiters")
        else:
            print("\n✅ No sessions needed assignment")
            
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    assign_missing_recruiters()
