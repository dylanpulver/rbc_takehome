import logging
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from jose import JWTError, jwt
from pymongo import MongoClient

from backend.auth import oauth2_scheme

router = APIRouter()
logger = logging.getLogger(__name__)

# MongoDB setup
mongo_client = MongoClient("mongodb://localhost:27017/")
mongo_db = mongo_client["your_database_name"]
mongo_collection = mongo_db["your_collection_name"]

SECRET_KEY = os.getenv("SECRET_KEY", "defaultsecretkey")
ALGORITHM = "HS256"


@router.get("/mongodb-records")
def get_mongodb_records(
    start_date: int = Query(..., description="Start date in epoch format"),
    end_date: int = Query(..., description="End date in epoch format"),
    phone: Optional[str] = Query(None, description="Phone number"),
    voicemail: Optional[str] = Query(None, description="Voicemail"),
    user_id: Optional[str] = Query(None, description="User ID"),
    cluster: Optional[str] = Query(None, description="Cluster ID"),
    token: str = Depends(oauth2_scheme),
) -> List[dict]:
    """
    Retrieve records from MongoDB based on the provided query parameters.

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

    # Build the query
    query = {"originationTime": {"$gte": start_date, "$lte": end_date}}
    if phone:
        query["devices.phone"] = phone
    if voicemail:
        query["devices.voicemail"] = voicemail
    if user_id:
        query["userId"] = user_id
    if cluster:
        query["clusterId"] = cluster

    # Retrieve records from MongoDB
    records = list(mongo_collection.find(query))
    return records


# Uncomment the line below to include the router when needed
# app.include_router(router)
