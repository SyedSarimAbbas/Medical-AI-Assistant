import logging
from fastapi import APIRouter, Depends, HTTPException
from ..schemas.chat import ChatRequest, ChatResponse
from .llm import generate_response
from .safety import check_safety
from .auth import get_current_user


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
) -> ChatResponse:
    """
    Process a chat message with safety checks and AI response generation.
    
    Args:
        request: ChatRequest with message field
        
    Returns:
        ChatResponse with AI response and safety flag
        
    Raises:
        HTTPException: On validation or processing errors
    """
    try:
        # Log incoming request
        logger.info(f"Received chat request: {request.message[:50]}...")
        
        # Perform safety check
        safety_result = check_safety(request.message)
        if safety_result.get("blocked"):
            logger.warning("Message blocked by safety check")
            return ChatResponse(
                response=safety_result.get("message", "Message blocked by safety filters"),
                blocked=True,
            )

        # Generate AI response
        try:
            ai_response = generate_response(request.message,history=request.history)
            logger.info("Response generated successfully")
            return ChatResponse(response=ai_response, blocked=False)
        except Exception as e:
            logger.error(f"Error generating response: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="Failed to generate response. Please try again later.",
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again.",
        )
