"""
Authentication router with JWT token generation and protected routes.
"""

import logging
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from ..core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from ..schemas.auth import LoginRequest, RegisterRequest, RegistrationResponse, TokenResponse, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])

# OAuth2 scheme for Bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Generate demo user hash using the same SHA256+bcrypt method as new users
# This ensures consistency across all password hashing
_DEMO_PASSWORD = "demo123"
_DEMO_PASSWORD_HASH = get_password_hash(_DEMO_PASSWORD)

# Temporary in-memory user database (replace with real database in production)
fake_users_db = {
    "demo": {
        "username": "demo",
        "email": "demo@medical-ai.local",
        "hashed_password": _DEMO_PASSWORD_HASH,
        "is_active": True,
    }
}


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Validate JWT token and return current user.
    
    This is a dependency that validates the Bearer token from the Authorization header.
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        User dictionary if token is valid
        
    Raises:
        HTTPException(401): If token is invalid, expired, or missing
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        if payload is None:
            logger.warning("Failed to decode token")
            raise credentials_exception
        
        username: str = payload.get("sub")
        if username is None:
            logger.warning("Token missing username claim")
            raise credentials_exception
        
        user = fake_users_db.get(username)
        if user is None:
            logger.warning(f"User not found: {username}")
            raise credentials_exception
        
        if not user.get("is_active"):
            logger.warning(f"Inactive user attempted access: {username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating token: {e}")
        raise credentials_exception


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest) -> RegistrationResponse:
    """
    User registration endpoint - creates a new user account.
    
    This endpoint allows users to create a new account with a username, email, and password.
    The password is hashed using bcrypt before storage. Usernames and emails must be unique.
    
    Args:
        request: RegisterRequest with username, email, and password
        
    Returns:
        RegistrationResponse with user information and success message
        
    Raises:
        HTTPException(400): If username or email already exists
    """
    logger.info(f"Registration attempt: {request.username} with email {request.email}")
    
    # Validate that username doesn't already exist
    if request.username in fake_users_db:
        logger.warning(f"Registration failed: username already exists - {request.username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{request.username}' is already registered. Please choose a different username.",
        )
    
    # Validate that email doesn't already exist
    for user in fake_users_db.values():
        if user.get("email", "").lower() == request.email.lower():
            logger.warning(f"Registration failed: email already exists - {request.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{request.email}' is already registered. Please use a different email.",
            )
    
    # Validate email format (basic check)
    if "@" not in request.email or "." not in request.email:
        logger.warning(f"Registration failed: invalid email format - {request.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format. Please provide a valid email address.",
        )
    
    # Hash the password
    hashed_password = get_password_hash(request.password)
    
    # Create new user
    new_user = {
        "username": request.username,
        "email": request.email,
        "hashed_password": hashed_password,
        "is_active": True,
    }
    
    # Store user in database
    fake_users_db[request.username] = new_user
    
    logger.info(f"User registered successfully: {request.username}")
    
    return RegistrationResponse(
        username=request.username,
        email=request.email,
        is_active=True,
        message=f"User '{request.username}' registered successfully. You can now login with your credentials.",
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest) -> TokenResponse:
    """
    Login endpoint - authenticates user and returns JWT access token.
    
    Args:
        request: LoginRequest with username and password
        
    Returns:
        TokenResponse with access_token, token_type, and expires_in
        
    Raises:
        HTTPException(401): If credentials are invalid
    """
    logger.info(f"Login attempt for user: {request.username}")
    
    # Get user from database
    user = fake_users_db.get(request.username)
    if user is None:
        logger.warning(f"Login failed: user not found - {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password using consistent SHA256+bcrypt method
    password_ok = verify_password(request.password, user["hashed_password"])

    if not password_ok:
        logger.warning(f"Login failed: invalid password - {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active"):
        logger.warning(f"Login failed: inactive user - {request.username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.username},
        expires_delta=access_token_expires,
    )
    
    logger.info(f"Login successful: {request.username}")
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
    )


@router.post("/login-form", response_model=TokenResponse)
def login_form(form_data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    """
    Login endpoint using standard OAuth2 PasswordRequestForm.
    
    This variant uses the standard HTML form with username and password fields.
    Useful for form-based login flows.
    
    Args:
        form_data: OAuth2PasswordRequestForm with username and password
        
    Returns:
        TokenResponse with access_token, token_type, and expires_in
        
    Raises:
        HTTPException(401): If credentials are invalid
    """
    # Create LoginRequest from form data and delegate to main login
    login_request = LoginRequest(
        username=form_data.username,
        password=form_data.password,
    )
    return login(login_request)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: dict = Depends(get_current_user)) -> UserResponse:
    """
    Protected endpoint - returns current authenticated user information.
    
    This endpoint requires a valid JWT token in the Authorization header:
    Authorization: Bearer <token>
    
    Args:
        current_user: Current user from authentication dependency
        
    Returns:
        UserResponse with user information
    """
    logger.info(f"User info request: {current_user['username']}")
    
    return UserResponse(
        username=current_user["username"],
        email=current_user.get("email"),
        is_active=current_user.get("is_active", True),
    )


@router.post("/protected-example")
def protected_example(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Example protected endpoint that requires authentication.
    
    This shows how to use get_current_user dependency on any route
    to require authentication.
    
    Args:
        current_user: Injected by get_current_user dependency
        
    Returns:
        Sample response with user data
    """
    logger.info(f"Protected endpoint accessed by: {current_user['username']}")
    
    return {
        "message": "This is a protected endpoint",
        "username": current_user["username"],
        "email": current_user.get("email"),
    }
