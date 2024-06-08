import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# Initialize the API router
router = APIRouter()

# Load environment variables for secret key and algorithm
SECRET_KEY: str = os.getenv("SECRET_KEY", "defaultsecretkey")
ALGORITHM: str = "HS256"

# OAuth2 password bearer scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Password context for hashing and verifying passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Mock database of users for demonstration purposes
fake_users_db = {
    "user@example.com": {
        "username": "user@example.com",
        "full_name": "User Example",
        "email": "user@example.com",
        "hashed_password": pwd_context.hash("password"),
    }
}


class User(BaseModel):
    """Model for user credentials."""

    username: str
    password: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password (str): The plain password to verify.
        hashed_password (str): The hashed password to verify against.

    Returns:
        bool: True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> dict:
    """
    Authenticate a user and return a JWT token.

    Args:
        form_data (OAuth2PasswordRequestForm): The user login form data.

    Raises:
        HTTPException: If the username or password is incorrect.

    Returns:
        dict: A dictionary containing the access token and token type.
    """
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = jwt.encode({"sub": user["username"]}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/validate-token")
async def validate_token(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Validate a JWT token.

    Args:
        token (str): The JWT token to validate.

    Raises:
        HTTPException: If the token is invalid.

    Returns:
        dict: A dictionary indicating whether the token is valid.
    """
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
