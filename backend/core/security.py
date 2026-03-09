"""
Security utilities for JWT token generation, validation, and password hashing.
"""

import base64
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = "your-secret-key-change-this-in-production-use-strong-random-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context - using bcrypt as configured in requirements
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _hash_password_sha256(password: str) -> str:
    """
    Pre-hash password with SHA256 to handle password length normalization.
    
    Uses base64 encoding to keep the result under bcrypt's 72-byte limit.
    
    Args:
        password: Plain text password
        
    Returns:
        Base64-encoded SHA256 hash of password
    """
    sha256_hash = hashlib.sha256(password.encode('utf-8')).digest()
    return base64.b64encode(sha256_hash).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: Plain text password from user
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        # Pre-hash with SHA256 to match what was stored
        sha256_hash = _hash_password_sha256(plain_password)
        return pwd_context.verify(sha256_hash, hashed_password)
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a plain password using SHA256 + bcrypt.
    
    First hashes with SHA256 (to handle bcrypt's 72-byte limit),
    then hashes with bcrypt for secure storage.
    
    Args:
        password: Plain text password
        
    Returns:
        Bcrypt hashed password (safe for storage)
    """
    try:
        # Pre-hash with SHA256 to normalize length and avoid bcrypt's 72-byte limit
        sha256_hash = _hash_password_sha256(password)
        # Then hash with bcrypt
        bcrypt_hash = pwd_context.hash(sha256_hash)
        return bcrypt_hash
    except Exception as e:
        logger.error(f"Error hashing password: {e}")
        raise


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary to encode in token (e.g., {"sub": "username"})
        expires_delta: Token expiration time delta. If None, uses ACCESS_TOKEN_EXPIRE_MINUTES
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Created access token for user: {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {e}")
        raise


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token claims if valid, None if invalid or expired
        
    Raises:
        JWTError: If token is invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        
        if username is None:
            logger.warning("Token missing 'sub' claim")
            return None
            
        return payload
    except JWTError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error decoding token: {e}")
        return None
