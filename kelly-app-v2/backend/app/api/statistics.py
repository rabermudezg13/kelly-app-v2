"""
Statistics API endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
import pytz

from app.database import get_db
from app.models.info_session import InfoSession
from app.models.visit import NewHireOrientation, Badge, Fingerprint, TeamVisit
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()

# Pydantic models
class StatisticsResponse(BaseModel):
    total_info_sessions: int
    total_new_hire_orientations: int
    total_visits: int
    total_badges: int
    total_fingerprints: int
    info_sessions_by_status: Dict[str, int]
    new_hire_orientations_by_status: Dict[str, int]
    visits_by_status: Dict[str, int]
    average_completion_time_info_sessions: Optional[float]  # in minutes
    average_completion_time_new_hire: Optional[float]  # in minutes
    daily_stats: List[Dict[str, Any]]
    weekly_stats: List[Dict[str, Any]]
    monthly_stats: List[Dict[str, Any]]
    heatmap_data: List[Dict[str, Any]]  # For calendar heatmap
    time_slot_distribution: Dict[str, int]
    recruiter_performance: List[Dict[str, Any]]

# Helper function to convert UTC to Miami timezone
def to_miami_timezone(dt: datetime) -> datetime:
    """Convert UTC datetime to Miami timezone (America/New_York)"""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = pytz.UTC.localize(dt)
    miami_tz = pytz.timezone('America/New_York')
    return dt.astimezone(miami_tz)

def get_date_range(period: str) -> tuple:
    """Get start and end dates based on period"""
    today = date.today()
    miami_tz = pytz.timezone('America/New_York')
    now_miami = datetime.now(miami_tz)
    today_miami = now_miami.date()
    
    if period == 'day':
        start = today_miami
        end = today_miami
    elif period == 'week':
        start = today_miami - timedelta(days=today_miami.weekday())
        end = today_miami
    elif period == 'month':
        start = today_miami.replace(day=1)
        end = today_miami
    elif period == 'year':
        start = today_miami.replace(month=1, day=1)
        end = today_miami
    else:  # all - limit to last 2 years for performance
        start = today_miami - timedelta(days=730)  # Last 2 years
        end = today_miami
    
    return start, end

@router.get("/", response_model=StatisticsResponse)
async def get_statistics(
    period: str = Query("all", regex="^(day|week|month|year|all)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive statistics for all visit types"""
    
    # Check if user has permission (staff, recruiter, management, admin)
    if current_user.role not in ['admin', 'staff', 'recruiter', 'management', 'frontdesk']:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view statistics"
        )
    
    start_date, end_date = get_date_range(period)
    
    # Convert to datetime for querying
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    # Total counts
    total_info_sessions = db.query(InfoSession).filter(
        func.date(InfoSession.created_at) >= start_date,
        func.date(InfoSession.created_at) <= end_date
    ).count()
    
    total_new_hire_orientations = db.query(NewHireOrientation).filter(
        func.date(NewHireOrientation.created_at) >= start_date,
        func.date(NewHireOrientation.created_at) <= end_date
    ).count()
    
    total_visits = db.query(TeamVisit).filter(
        func.date(TeamVisit.created_at) >= start_date,
        func.date(TeamVisit.created_at) <= end_date
    ).count()
    
    total_badges = db.query(Badge).filter(
        func.date(Badge.created_at) >= start_date,
        func.date(Badge.created_at) <= end_date
    ).count()
    
    total_fingerprints = db.query(Fingerprint).filter(
        func.date(Fingerprint.created_at) >= start_date,
        func.date(Fingerprint.created_at) <= end_date
    ).count()
    
    # Status distributions
    info_sessions_by_status = {}
    status_counts = db.query(
        InfoSession.status,
        func.count(InfoSession.id).label('count')
    ).filter(
        func.date(InfoSession.created_at) >= start_date,
        func.date(InfoSession.created_at) <= end_date
    ).group_by(InfoSession.status).all()
    for status, count in status_counts:
        info_sessions_by_status[status or 'unknown'] = count
    
    new_hire_orientations_by_status = {}
    nho_status_counts = db.query(
        NewHireOrientation.status,
        func.count(NewHireOrientation.id).label('count')
    ).filter(
        func.date(NewHireOrientation.created_at) >= start_date,
        func.date(NewHireOrientation.created_at) <= end_date
    ).group_by(NewHireOrientation.status).all()
    for status, count in nho_status_counts:
        new_hire_orientations_by_status[status or 'unknown'] = count
    
    visits_by_status = {}
    visit_status_counts = db.query(
        TeamVisit.status,
        func.count(TeamVisit.id).label('count')
    ).filter(
        func.date(TeamVisit.created_at) >= start_date,
        func.date(TeamVisit.created_at) <= end_date
    ).group_by(TeamVisit.status).all()
    for status, count in visit_status_counts:
        visits_by_status[status or 'unknown'] = count
    
    # Average completion times - optimized query
    completed_info_sessions_query = db.query(
        InfoSession.started_at,
        InfoSession.completed_at
    ).filter(
        InfoSession.status == 'completed',
        InfoSession.started_at.isnot(None),
        InfoSession.completed_at.isnot(None),
        func.date(InfoSession.created_at) >= start_date,
        func.date(InfoSession.created_at) <= end_date
    ).all()
    
    avg_completion_info = None
    if completed_info_sessions_query:
        durations = [
            (to_miami_timezone(s.completed_at) - to_miami_timezone(s.started_at)).total_seconds() / 60
            for s in completed_info_sessions_query
            if s.started_at and s.completed_at
        ]
        if durations:
            avg_completion_info = sum(durations) / len(durations)
    
    completed_nho_query = db.query(
        NewHireOrientation.started_at,
        NewHireOrientation.completed_at
    ).filter(
        NewHireOrientation.status == 'completed',
        NewHireOrientation.started_at.isnot(None),
        NewHireOrientation.completed_at.isnot(None),
        func.date(NewHireOrientation.created_at) >= start_date,
        func.date(NewHireOrientation.created_at) <= end_date
    ).all()
    
    avg_completion_nho = None
    if completed_nho_query:
        durations = [
            (to_miami_timezone(n.completed_at) - to_miami_timezone(n.started_at)).total_seconds() / 60
            for n in completed_nho_query
            if n.started_at and n.completed_at
        ]
        if durations:
            avg_completion_nho = sum(durations) / len(durations)
    
    # Daily stats - optimized with single query per table
    daily_stats = []
    # Limit to last 90 days for performance
    max_days = 90
    days_diff = (end_date - start_date).days
    if days_diff > max_days:
        start_date = end_date - timedelta(days=max_days)
    
    # Get all daily counts in one query per table
    info_sessions_daily = db.query(
        func.date(InfoSession.created_at).label('day'),
        func.count(InfoSession.id).label('count')
    ).filter(
        func.date(InfoSession.created_at) >= start_date,
        func.date(InfoSession.created_at) <= end_date
    ).group_by(func.date(InfoSession.created_at)).all()
    
    nho_daily = db.query(
        func.date(NewHireOrientation.created_at).label('day'),
        func.count(NewHireOrientation.id).label('count')
    ).filter(
        func.date(NewHireOrientation.created_at) >= start_date,
        func.date(NewHireOrientation.created_at) <= end_date
    ).group_by(func.date(NewHireOrientation.created_at)).all()
    
    visits_daily = db.query(
        func.date(TeamVisit.created_at).label('day'),
        func.count(TeamVisit.id).label('count')
    ).filter(
        func.date(TeamVisit.created_at) >= start_date,
        func.date(TeamVisit.created_at) <= end_date
    ).group_by(func.date(TeamVisit.created_at)).all()
    
    badges_daily = db.query(
        func.date(Badge.created_at).label('day'),
        func.count(Badge.id).label('count')
    ).filter(
        func.date(Badge.created_at) >= start_date,
        func.date(Badge.created_at) <= end_date
    ).group_by(func.date(Badge.created_at)).all()
    
    fingerprints_daily = db.query(
        func.date(Fingerprint.created_at).label('day'),
        func.count(Fingerprint.id).label('count')
    ).filter(
        func.date(Fingerprint.created_at) >= start_date,
        func.date(Fingerprint.created_at) <= end_date
    ).group_by(func.date(Fingerprint.created_at)).all()
    
    # Create dictionaries for quick lookup
    info_sessions_dict = {str(row.day): row.count for row in info_sessions_daily}
    nho_dict = {str(row.day): row.count for row in nho_daily}
    visits_dict = {str(row.day): row.count for row in visits_daily}
    badges_dict = {str(row.day): row.count for row in badges_daily}
    fingerprints_dict = {str(row.day): row.count for row in fingerprints_daily}
    
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        day_info_sessions = info_sessions_dict.get(date_str, 0)
        day_nho = nho_dict.get(date_str, 0)
        day_visits = visits_dict.get(date_str, 0)
        day_badges = badges_dict.get(date_str, 0)
        day_fingerprints = fingerprints_dict.get(date_str, 0)
        
        daily_stats.append({
            "date": date_str,
            "info_sessions": day_info_sessions,
            "new_hire_orientations": day_nho,
            "visits": day_visits,
            "badges": day_badges,
            "fingerprints": day_fingerprints,
            "total": day_info_sessions + day_nho + day_visits + day_badges + day_fingerprints
        })
        current_date += timedelta(days=1)
    
    # Weekly stats (group by week) - optimized
    weekly_stats = []
    week_start = start_date - timedelta(days=start_date.weekday())
    # Limit to last 52 weeks for performance
    max_weeks = 52
    weeks_count = 0
    while week_start <= end_date and weeks_count < max_weeks:
        week_end = min(week_start + timedelta(days=6), end_date)
        week_info_sessions = db.query(InfoSession).filter(
            func.date(InfoSession.created_at) >= week_start,
            func.date(InfoSession.created_at) <= week_end
        ).count()
        week_nho = db.query(NewHireOrientation).filter(
            func.date(NewHireOrientation.created_at) >= week_start,
            func.date(NewHireOrientation.created_at) <= week_end
        ).count()
        week_visits = db.query(TeamVisit).filter(
            func.date(TeamVisit.created_at) >= week_start,
            func.date(TeamVisit.created_at) <= week_end
        ).count()
        week_badges = db.query(Badge).filter(
            func.date(Badge.created_at) >= week_start,
            func.date(Badge.created_at) <= week_end
        ).count()
        week_fingerprints = db.query(Fingerprint).filter(
            func.date(Fingerprint.created_at) >= week_start,
            func.date(Fingerprint.created_at) <= week_end
        ).count()
        
        weekly_stats.append({
            "week_start": week_start.isoformat(),
            "week_end": week_end.isoformat(),
            "info_sessions": week_info_sessions,
            "new_hire_orientations": week_nho,
            "visits": week_visits,
            "badges": week_badges,
            "fingerprints": week_fingerprints,
            "total": week_info_sessions + week_nho + week_visits + week_badges + week_fingerprints
        })
        week_start += timedelta(days=7)
        weeks_count += 1
    
    # Monthly stats
    monthly_stats = []
    month_start = start_date.replace(day=1)
    while month_start <= end_date:
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1) - timedelta(days=1)
        
        if month_end > end_date:
            month_end = end_date
        
        month_info_sessions = db.query(InfoSession).filter(
            func.date(InfoSession.created_at) >= month_start,
            func.date(InfoSession.created_at) <= month_end
        ).count()
        month_nho = db.query(NewHireOrientation).filter(
            func.date(NewHireOrientation.created_at) >= month_start,
            func.date(NewHireOrientation.created_at) <= month_end
        ).count()
        month_visits = db.query(TeamVisit).filter(
            func.date(TeamVisit.created_at) >= month_start,
            func.date(TeamVisit.created_at) <= month_end
        ).count()
        month_badges = db.query(Badge).filter(
            func.date(Badge.created_at) >= month_start,
            func.date(Badge.created_at) <= month_end
        ).count()
        month_fingerprints = db.query(Fingerprint).filter(
            func.date(Fingerprint.created_at) >= month_start,
            func.date(Fingerprint.created_at) <= month_end
        ).count()
        
        monthly_stats.append({
            "month": month_start.strftime("%Y-%m"),
            "month_start": month_start.isoformat(),
            "month_end": month_end.isoformat(),
            "info_sessions": month_info_sessions,
            "new_hire_orientations": month_nho,
            "visits": month_visits,
            "badges": month_badges,
            "fingerprints": month_fingerprints,
            "total": month_info_sessions + month_nho + month_visits + month_badges + month_fingerprints
        })
        
        if month_start.month == 12:
            month_start = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_start = month_start.replace(month=month_start.month + 1)
    
    # Heatmap data (for calendar view) - reuse daily_stats data
    heatmap_data = []
    for day_stat in daily_stats:
        heatmap_data.append({
            "date": day_stat["date"],
            "value": day_stat["total"],
            "info_sessions": day_stat["info_sessions"],
            "new_hire_orientations": day_stat["new_hire_orientations"],
            "visits": day_stat["visits"],
            "badges": day_stat["badges"],
            "fingerprints": day_stat["fingerprints"]
        })
    
    # Time slot distribution
    time_slot_distribution = {}
    time_slots = db.query(
        InfoSession.time_slot,
        func.count(InfoSession.id).label('count')
    ).filter(
        func.date(InfoSession.created_at) >= start_date,
        func.date(InfoSession.created_at) <= end_date
    ).group_by(InfoSession.time_slot).all()
    for slot, count in time_slots:
        time_slot_distribution[slot or 'unknown'] = count
    
    # Recruiter performance
    recruiter_performance = []
    from app.models.recruiter import Recruiter
    recruiters = db.query(Recruiter).all()
    for recruiter in recruiters:
        assigned_sessions = db.query(InfoSession).filter(
            InfoSession.assigned_recruiter_id == recruiter.id,
            func.date(InfoSession.created_at) >= start_date,
            func.date(InfoSession.created_at) <= end_date
        ).count()
        completed_sessions = db.query(InfoSession).filter(
            InfoSession.assigned_recruiter_id == recruiter.id,
            InfoSession.status == 'completed',
            func.date(InfoSession.created_at) >= start_date,
            func.date(InfoSession.created_at) <= end_date
        ).count()
        
        recruiter_performance.append({
            "recruiter_id": recruiter.id,
            "recruiter_name": recruiter.name,
            "assigned_sessions": assigned_sessions,
            "completed_sessions": completed_sessions,
            "completion_rate": (completed_sessions / assigned_sessions * 100) if assigned_sessions > 0 else 0
        })
    
    return StatisticsResponse(
        total_info_sessions=total_info_sessions,
        total_new_hire_orientations=total_new_hire_orientations,
        total_visits=total_visits,
        total_badges=total_badges,
        total_fingerprints=total_fingerprints,
        info_sessions_by_status=info_sessions_by_status,
        new_hire_orientations_by_status=new_hire_orientations_by_status,
        visits_by_status=visits_by_status,
        average_completion_time_info_sessions=avg_completion_info,
        average_completion_time_new_hire=avg_completion_nho,
        daily_stats=daily_stats,
        weekly_stats=weekly_stats,
        monthly_stats=monthly_stats,
        heatmap_data=heatmap_data,
        time_slot_distribution=time_slot_distribution,
        recruiter_performance=recruiter_performance
    )

@router.post("/statistics/backup")
async def create_statistics_backup(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a backup of current statistics"""
    if current_user.role not in ['admin', 'management']:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create backups"
        )
    
    # Get all statistics
    stats = await get_statistics(period="all", db=db, current_user=current_user)
    
    # Create backup file
    import json
    from pathlib import Path
    backup_dir = Path(__file__).parent.parent.parent / "backups"
    backup_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"statistics_backup_{timestamp}.json"
    
    with open(backup_file, 'w') as f:
        json.dump(stats.model_dump(), f, indent=2, default=str)
    
    return {
        "message": "Backup created successfully",
        "backup_file": str(backup_file),
        "timestamp": timestamp
    }
