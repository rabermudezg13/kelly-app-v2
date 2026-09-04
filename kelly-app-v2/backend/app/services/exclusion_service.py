"""
Service for checking exclusion list
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.exclusion_list import ExclusionList
from typing import List


def check_name_in_exclusion_list(db: Session, first_name: str, last_name: str) -> List[ExclusionList]:
    """Return exclusion records containing both first and last name, case-insensitively."""
    if not first_name or not last_name:
        return []

    first_name_upper = first_name.strip().upper()
    last_name_upper = last_name.strip().upper()

    # Do the filtering in SQL instead of loading broad first-name OR last-name
    # matches into Python. Also removes an unnecessary COUNT(*) on every signup.
    return db.query(ExclusionList).filter(
        and_(
            func.upper(ExclusionList.name).like(f"%{first_name_upper}%"),
            func.upper(ExclusionList.name).like(f"%{last_name_upper}%"),
        )
    ).all()


def is_in_exclusion_list(db: Session, first_name: str, last_name: str) -> bool:
    return len(check_name_in_exclusion_list(db, first_name, last_name)) > 0
