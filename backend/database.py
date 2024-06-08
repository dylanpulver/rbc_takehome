import datetime
from typing import Generator

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

# Database URL for SQLite database
DATABASE_URL: str = "sqlite:///./backend/test.db"

# Base class for declarative class definitions
Base = declarative_base()


class AuditLog(Base):
    """
    Database model for storing audit logs.

    Attributes:
        id (int): Primary key of the audit log.
        path (str): Request path.
        method (str): HTTP method used.
        status_code (int): HTTP status code of the response.
        timestamp (datetime): Timestamp of the request.
        client_ip (str): Client IP address.
        user_agent (str): User agent string from the client.
    """

    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, index=True)
    method = Column(String, index=True)
    status_code = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    client_ip = Column(String, index=True)
    user_agent = Column(String)


# Create a new SQLAlchemy engine instance
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables in the database
Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Provide a transactional scope around a series of operations.

    Yields:
        Session: A SQLAlchemy session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
