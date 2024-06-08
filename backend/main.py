import logging

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from backend.auth import router as auth_router
from backend.endpoints import router as api_router
from backend.middleware import AuditLogMiddleware

# Uncomment these lines to include the MongoDB and SQL Server routers
# from mongodb_endpoints import router as mongodb_router
# from sqlserver_endpoints import router as sqlserver_router

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """
    Handle rate limit exceeded errors.

    :param request: The incoming request
    :param exc: The rate limit exceeded exception
    :return: JSON response indicating rate limit has been exceeded
    """
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded"},
    )

# Add middleware for logging audit logs
app.add_middleware(AuditLogMiddleware)

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication and API routers
app.include_router(auth_router)
app.include_router(api_router)

# Uncomment these lines to include the MongoDB and SQL Server routers
# app.include_router(mongodb_router)
# app.include_router(sqlserver_router)

if __name__ == "__main__":
    # Only run uvicorn when this script is executed directly
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
