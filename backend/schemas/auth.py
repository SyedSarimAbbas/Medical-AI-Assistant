import pydantic
from pydantic import BaseModel, Field

"""
Authentication request and response schemas.
"""



class RegisterRequest(BaseModel):
    """User registration request."""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=100, description="Password (minimum 8 characters)")
    
    class Config:
        examples = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "SecurePass123"
            }
        }


class LoginRequest(BaseModel):
    """Login request with username and password."""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=6, max_length=100, description="Password")


class TokenResponse(BaseModel):
    """Access token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    expires_in: int = Field(..., description="Token expiration time in seconds")


class RegistrationResponse(BaseModel):
    """User registration response."""
    username: str = Field(..., description="Username of registered user")
    email: str = Field(..., description="Email of registered user")
    message: str = Field(..., description="Registration success message")
    is_active: bool = Field(default=True, description="Whether user is active")


class UserResponse(BaseModel):
    """User data response."""
    username: str = Field(..., description="Username")
    email: str = Field(default=None, description="User email")
    is_active: bool = Field(default=True, description="Whether user is active")
