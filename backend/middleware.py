from fastapi import Request
from sqlalchemy.orm import Session
from starlette.middleware.base import BaseHTTPMiddleware

from backend.database import AuditLog, SessionLocal


class AuditLogMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log incoming requests and responses to the database.
    """

    async def dispatch(self, request: Request, call_next):
        """
        Handles the incoming request, logs the request and response details, and then proceeds to the next middleware or endpoint.

        :param request: The incoming HTTP request
        :param call_next: The next middleware or endpoint handler
        :return: The HTTP response
        """
        response = await call_next(request)

        # Create an audit log entry
        log_entry = AuditLog(
            path=request.url.path,
            method=request.method,
            status_code=response.status_code,
            client_ip=request.client.host,
            user_agent=request.headers.get('user-agent', 'unknown')
        )

        # Save the audit log entry to the database
        db: Session = SessionLocal()
        try:
            db.add(log_entry)
            db.commit()
        finally:
            db.close()

        return response
