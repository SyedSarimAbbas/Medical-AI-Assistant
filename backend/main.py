import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.chat import router as chat_router
from .api.auth import router as auth_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Medical AI Assistant",
    version="1.0.0",
    description="LLM Powered AI Medical Assistant with Safety Rails and Authentication",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1", tags=["auth"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
# Legacy alias for backward compatibility
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])


@app.get("/")
def root():
    """Root endpoint to verify API is running."""
    return {
        "message": "Medical AI Assistant API working successfully!",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/healthz")
def health_check():
    """Health check endpoint for uptime monitoring."""
    return {"status": "ok", "service": "Medical AI Assistant"}
