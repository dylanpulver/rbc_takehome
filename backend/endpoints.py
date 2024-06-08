import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.auth import ALGORITHM, SECRET_KEY, oauth2_scheme
from backend.database import AuditLog, get_db
from backend.utils import filter_by_date_range, filter_by_field, filter_by_nested_field

router = APIRouter()
logger = logging.getLogger(__name__)

# Load JSON data
with open("backend/data.json", "r") as f:
    data = json.load(f)


@router.get("/records")
def get_records(
    start_date: int = Query(..., description="Start date in epoch format"),
    end_date: int = Query(..., description="End date in epoch format"),
    phone: Optional[str] = Query(None, description="Phone number"),
    voicemail: Optional[str] = Query(None, description="Voicemail"),
    user_id: Optional[str] = Query(None, description="User ID"),
    cluster: Optional[str] = Query(None, description="Cluster ID"),
    token: str = Depends(oauth2_scheme),
) -> List[dict]:
    """
    Retrieve records based on the given parameters.

    :param start_date: Start date in epoch format
    :param end_date: End date in epoch format
    :param phone: Optional phone number to filter by
    :param voicemail: Optional voicemail to filter by
    :param user_id: Optional user ID to filter by
    :param cluster: Optional cluster ID to filter by
    :param token: OAuth2 token for authentication
    :return: List of filtered records
    """
    logger.info(
        f"Request parameters: start_date={start_date}, end_date={end_date}, phone={phone}, voicemail={voicemail}, user_id={user_id}, cluster={cluster}"
    )

    # Validate token
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Filter data by date range
    filtered_data = filter_by_date_range(data, start_date, end_date)

    # Apply additional filters if provided
    if phone:
        filtered_data = filter_by_nested_field(filtered_data, "phone", phone)
    if voicemail:
        filtered_data = filter_by_nested_field(filtered_data, "voicemail", voicemail)
    if user_id:
        filtered_data = filter_by_field(filtered_data, "userId", user_id)
    if cluster:
        filtered_data = filter_by_field(filtered_data, "clusterId", cluster)

    logger.info(f"Filtered data: {filtered_data}")

    if not filtered_data:
        logger.warning("No records found for the given parameters")
        raise HTTPException(
            status_code=404, detail="No records found for the given parameters"
        )

    return filtered_data


@router.get("/audit-logs")
def get_audit_logs(
    skip: int = 0, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    """
    Retrieve audit logs with optional pagination.

    :param skip: Number of records to skip for pagination
    :param db: Database session dependency
    :param token: OAuth2 token for authentication
    :return: List of audit logs
    """
    logger.info(f"Fetching audit logs: skip={skip}")

    # Validate token
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Query audit logs with optional pagination
    audit_logs = db.query(AuditLog).offset(skip).all()
    return audit_logs
