import logging
import re
from typing import Dict, List


logger = logging.getLogger(__name__)


class SafetyViolation(Exception):
    """Custom exception for medical safety violations."""
    pass


# Banned keywords with regex patterns for more robust matching
BANNED_PATTERNS: List[tuple] = [
    # Self-harm related
    (r'\b(suicide|kill\s+myself|self.{0,3}harm|cutting|overdose|end\s+my\s+life)\b', 'self-harm content'),
    
    # Violence related  
    (r'\b(kill|murder|explosives|bomb|weapons|terrorism|violent)\b', 'violent content'),
    
    # System/security abuse
    (r'\b(hack|bypass|system\s+prompt|admin|root|jailbreak|penetration)\b', 'system abuse'),
    
    # Illegal content
    (r'\b(illegal|dark\s+web|narcotics|unregulated\s+drugs|cocaine|heroin|meth)\b', 'illegal content'),
    
    # Additional concerning patterns for medical context
    (r'\b(prescription\s+without|fake\s+prescription|drug\s+synthesis)\b', 'prescription abuse'),
]


def check_safety(message: str) -> Dict[str, bool | str]:
    """
    Check if a message violates safety guidelines using pattern matching.
    
    Args:
        message: User message to check
        
    Returns:
        Dict with keys:
            - blocked: bool, True if message violates safety
            - message: str, Reason or success message
    """
    if not message or not isinstance(message, str):
        return {"blocked": False, "message": "Success"}
    
    # Normalize message for checking
    normalized = message.lower().strip()
    
    # Check length to prevent abuse
    if len(normalized) > 10000:
        return {
            "blocked": True,
            "message": "Message is too long. Please keep queries under 1000 characters.",
        }
    
    try:
        # Check against each banned pattern
        for pattern, reason in BANNED_PATTERNS:
            if re.search(pattern, normalized, re.IGNORECASE):
                violation_msg = f"Banned content detected: {reason}"
                logger.warning(f"Safety violation: {violation_msg}")
                raise SafetyViolation(violation_msg)

        return {"blocked": False, "message": "Success"}

    except SafetyViolation as e:
        logger.info(f"Safety check blocked message: {str(e)}")
        return {
            "blocked": True,
            "message": "Sorry, this query cannot be processed due to safety concerns. Please rephrase your question.",
        }
    except Exception as e:
        logger.error(f"Unexpected error in safety check: {e}", exc_info=True)
        # Default to allowing the message if safety check itself fails
        return {"blocked": False, "message": "Success"}