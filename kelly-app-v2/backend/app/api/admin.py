"""Admin API endpoints."""
from datetime import datetime, timezone
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.auth import get_current_admin
from app.database import get_db
from app.models.chr import CHR
from app.models.event import Event, EventAttendee
from app.models.exclusion_list import ExclusionList
from app.models.info_session import InfoSession, InfoSessionStep
from app.models.recruiter import Recruiter
from app.models.storage import StorageLocation
from app.models.user import User
from app.models.visit import Badge, Fingerprint, MeetGreet, NewHireOrientation, NewHireOrientationStep, TeamVisit

router = APIRouter()

@router.get("/dashboard/info-sessions")
async def get_info_sessions_dashboard(db: Session = Depends(get_db)):
    """Get info sessions for staff dashboard"""
    # This will be implemented to show all info sessions
    return {"message": "Info sessions dashboard endpoint"}


ARCHIVE_MODELS = [
    ("Info Sessions", InfoSession),
    ("Info Session Steps", InfoSessionStep),
    ("New Hire Orientation", NewHireOrientation),
    ("NHO Steps", NewHireOrientationStep),
    ("Badges", Badge),
    ("Fingerprints", Fingerprint),
    ("Team Visits", TeamVisit),
    ("Meet and Greet", MeetGreet),
    ("CHR", CHR),
    ("Events", Event),
    ("Event Attendees", EventAttendee),
]

PROTECTED_SNAPSHOT_MODELS = [
    ("Recruiters Snapshot", Recruiter),
    ("Storage Snapshot", StorageLocation),
    ("PC List Snapshot", ExclusionList),
]


def _year_bounds(year: int):
    current_year = datetime.now(timezone.utc).year
    if year < 2000 or year > current_year:
        raise HTTPException(status_code=400, detail="Please select a valid archive year")
    return (
        datetime(year, 1, 1, tzinfo=timezone.utc),
        datetime(year + 1, 1, 1, tzinfo=timezone.utc),
    )


def _dated_query(db: Session, model, start: datetime, end: datetime):
    return db.query(model).filter(model.created_at >= start, model.created_at < end)


def _archive_query(db: Session, model, start: datetime, end: datetime):
    """Include child records belonging to parents created in the selected year."""
    if model is InfoSessionStep:
        parent_ids = _dated_query(db, InfoSession, start, end).with_entities(InfoSession.id)
        return db.query(InfoSessionStep).filter(InfoSessionStep.info_session_id.in_(parent_ids))
    if model is NewHireOrientationStep:
        parent_ids = _dated_query(db, NewHireOrientation, start, end).with_entities(NewHireOrientation.id)
        return db.query(NewHireOrientationStep).filter(NewHireOrientationStep.orientation_id.in_(parent_ids))
    if model is EventAttendee:
        event_ids = _dated_query(db, Event, start, end).with_entities(Event.id)
        return db.query(EventAttendee).filter(
            ((EventAttendee.created_at >= start) & (EventAttendee.created_at < end))
            | EventAttendee.event_id.in_(event_ids)
        )
    return _dated_query(db, model, start, end)


def _serialize_value(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (datetime,)):
        return value.isoformat()
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _model_rows(records, model):
    columns = [column.name for column in model.__table__.columns]
    return [
        {column: _serialize_value(getattr(record, column)) for column in columns}
        for record in records
    ], columns


@router.get("/data-archive/summary")
def get_archive_summary(
    year: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Preview how many historical records each tab contains for a year."""
    start, end = _year_bounds(year)
    counts = {
        sheet_name: _archive_query(db, model, start, end).count()
        for sheet_name, model in ARCHIVE_MODELS
    }
    return {
        "year": year,
        "counts": counts,
        "total_deletable": sum(counts.values()),
        "protected": [name for name, _ in PROTECTED_SNAPSHOT_MODELS],
    }


@router.get("/data-archive/export")
def export_complete_archive(
    year: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Export all dated tabs plus protected current-state snapshots to one workbook."""
    import pandas as pd

    start, end = _year_bounds(year)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        for sheet_name, model in ARCHIVE_MODELS:
            records = _archive_query(db, model, start, end).order_by(model.created_at.asc()).all()
            rows, columns = _model_rows(records, model)
            pd.DataFrame(rows, columns=columns).to_excel(writer, index=False, sheet_name=sheet_name[:31])

        for sheet_name, model in PROTECTED_SNAPSHOT_MODELS:
            records = db.query(model).all()
            rows, columns = _model_rows(records, model)
            pd.DataFrame(rows, columns=columns).to_excel(writer, index=False, sheet_name=sheet_name[:31])

    buffer.seek(0)
    filename = f"kelly_complete_archive_{year}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.delete("/data-archive/{year}")
def delete_archived_year(
    year: int,
    confirmation: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Permanently delete dated operational records after explicit confirmation."""
    if confirmation != f"DELETE {year}":
        raise HTTPException(status_code=400, detail=f'Type "DELETE {year}" to confirm')

    start, end = _year_bounds(year)
    counts = {}

    info_ids = [row[0] for row in _dated_query(db, InfoSession, start, end).with_entities(InfoSession.id).all()]
    counts["Info Session Steps"] = db.query(InfoSessionStep).filter(InfoSessionStep.info_session_id.in_(info_ids)).delete(synchronize_session=False) if info_ids else 0
    counts["Info Sessions"] = _dated_query(db, InfoSession, start, end).delete(synchronize_session=False)

    nho_ids = [row[0] for row in _dated_query(db, NewHireOrientation, start, end).with_entities(NewHireOrientation.id).all()]
    counts["NHO Steps"] = db.query(NewHireOrientationStep).filter(NewHireOrientationStep.orientation_id.in_(nho_ids)).delete(synchronize_session=False) if nho_ids else 0
    counts["New Hire Orientation"] = _dated_query(db, NewHireOrientation, start, end).delete(synchronize_session=False)

    event_ids = [row[0] for row in _dated_query(db, Event, start, end).with_entities(Event.id).all()]
    event_attendee_filter = (EventAttendee.created_at >= start) & (EventAttendee.created_at < end)
    if event_ids:
        event_attendee_filter = event_attendee_filter | EventAttendee.event_id.in_(event_ids)
    counts["Event Attendees"] = db.query(EventAttendee).filter(event_attendee_filter).delete(synchronize_session=False)
    counts["Events"] = _dated_query(db, Event, start, end).delete(synchronize_session=False)

    for sheet_name, model in [
        ("Badges", Badge),
        ("Fingerprints", Fingerprint),
        ("Team Visits", TeamVisit),
        ("Meet and Greet", MeetGreet),
        ("CHR", CHR),
    ]:
        counts[sheet_name] = _dated_query(db, model, start, end).delete(synchronize_session=False)

    db.commit()
    return {
        "message": f"Historical records for {year} were deleted successfully",
        "year": year,
        "deleted": counts,
        "total_deleted": sum(counts.values()),
        "protected": [name for name, _ in PROTECTED_SNAPSHOT_MODELS],
    }
