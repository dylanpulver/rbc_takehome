import logging
import os
from typing import Any, List, Optional

import pyodbc
from fastapi import APIRouter, Depends, HTTPException, Query
from jose import JWTError, jwt

from backend.auth import oauth2_scheme

router = APIRouter()
logger = logging.getLogger(__name__)

# SQL Server setup
sql_conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=your_server;"
    "DATABASE=your_database;"
    "UID=your_username;"
    "PWD=your_password"
)
sql_conn = pyodbc.connect(sql_conn_str)
sql_cursor = sql_conn.cursor()

SECRET_KEY = os.getenv("SECRET_KEY", "defaultsecretkey")
ALGORITHM = "HS256"


@router.get("/sqlserver-records")
def get_sqlserver_records(
    start_date: int = Query(..., description="Start date in epoch format"),
    end_date: int = Query(..., description="End date in epoch format"),
    phone: Optional[str] = Query(None, description="Phone number"),
    voicemail: Optional[str] = Query(None, description="Voicemail"),
    user_id: Optional[str] = Query(None, description="User ID"),
    cluster: Optional[str] = Query(None, description="Cluster ID"),
    token: str = Depends(oauth2_scheme),
) -> List[Any]:
    """
    Retrieve records from SQL Server based on the provided query parameters.

    :param start_date: Start date in epoch format
    :param end_date: End date in epoch format
    :param phone: Optional phone number to filter by
    :param voicemail: Optional voicemail to filter by
    :param user_id: Optional user ID to filter by
    :param cluster: Optional cluster ID to filter by
    :param token: OAuth2 token for authentication
    :return: A list of records matching the query parameters
    """
    logger.info(
        f"Request parameters: start_date={start_date}, end_date={end_date}, phone={phone}, voicemail={voicemail}, user_id={user_id}, cluster={cluster}"
    )

    # Validate the token
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Build the SQL query
    query = "SELECT * FROM records WHERE originationTime BETWEEN ? AND ?"
    params = [start_date, end_date]

    if phone:
        query += " AND devices.phone = ?"
        params.append(phone)
    if voicemail:
        query += " AND devices.voicemail = ?"
        params.append(voicemail)
    if user_id:
        query += " AND userId = ?"
        params.append(user_id)
    if cluster:
        query += " AND clusterId = ?"
        params.append(cluster)

    # Execute the SQL query
    sql_cursor.execute(query, params)
    records = sql_cursor.fetchall()
    return records


# Uncomment the line below to include the router when needed
# app.include_router(router)
