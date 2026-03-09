import logging
from functools import lru_cache
from pathlib import Path
from typing import Optional

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer


logger = logging.getLogger(__name__)

BASE_MODEL = "Qwen/Qwen2.5-0.5B-Instruct"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Resolve model path relative to project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
ADAPTER_DIR = PROJECT_ROOT / "models" / "medical-lora-model"


def get_adapter_dir() -> Path:
    """Get the adapter directory with proper path resolution."""
    if not ADAPTER_DIR.exists():
        logger.warning(f"Adapter directory not found at {ADAPTER_DIR}")
    return ADAPTER_DIR


@lru_cache(maxsize=1)
def get_tokenizer() -> AutoTokenizer:
    """Load and cache the tokenizer."""
    try:
        tokenizer = AutoTokenizer.from_pretrained(
            BASE_MODEL,
            trust_remote_code=True,
        )
        logger.info(f"Tokenizer loaded from {BASE_MODEL}")
        return tokenizer
    except Exception as e:
        logger.error(f"Failed to load tokenizer: {e}")
        raise


@lru_cache(maxsize=1)
def get_model() -> PeftModel:
    """Load and cache the model with LoRA adapter."""
    try:
        logger.info(f"Loading base model: {BASE_MODEL}")
        base_model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL,
            torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
            trust_remote_code=True,
            device_map="auto" if DEVICE == "cuda" else None,
        )

        logger.info(f"Loading LoRA adapter from {ADAPTER_DIR}")
        model = PeftModel.from_pretrained(base_model, str(ADAPTER_DIR))

        if DEVICE == "cuda":
            model.to("cuda")

        model.eval()
        logger.info(f"Model loaded successfully on device: {DEVICE}")
        return model
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise


def structure_response(raw_output: str) -> str:
    """
    Extract the assistant's reply from the raw model output.
    Handles various chat template formats, cleans up labels, and removes repetition.
    
    Args:
        raw_output: Raw model output with potential system/user/assistant labels
        
    Returns:
        Cleaned assistant response (max 1000 chars)
    """
    if not raw_output or not isinstance(raw_output, str):
        return "I couldn't generate a response. Please try again."
    
    # Remove leading/trailing whitespace
    text = raw_output.strip()
    
    # Try to extract content after "assistant:" label
    if "assistant:" in text.lower():
        parts = text.lower().split("assistant:", 1)
        if len(parts) > 1:
            text = parts[1].strip()
    
    # Remove common role labels that might appear
    for label in ["user:", "system:", "assistant:", "<|im_start|>assistant", "<|im_end|>"]:
        text = text.replace(label, "").replace(label.lower(), "")
    
    # Clean up whitespace
    text = " ".join(text.split())
    
    # Remove common repetitive patterns (safety disclaimers repeated)
    # Split by sentence and deduplicate while preserving order
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    seen = set()
    unique_sentences = []
    for sentence in sentences:
        # Normalize for comparison (lowercase, no extra spaces)
        normalized = " ".join(sentence.lower().split())
        if normalized not in seen:
            seen.add(normalized)
            unique_sentences.append(sentence)
    
    text = ". ".join(unique_sentences)
    if text and not text.endswith("."):
        text += "."
    
    # Truncate to reasonable length
    if len(text) > 1000:
        # Try to truncate at a sentence boundary
        truncated = text[:997]
        last_period = truncated.rfind('.')
        if last_period > 500:  # Make sure we keep a reasonable amount
            text = truncated[:last_period + 1]
        else:
            text = truncated + "..."
    
    return text if text else "I couldn't generate a response. Please try again."


def generate_response(message: str,history:list = None, max_retries: int = 1) -> str:
    """
    Generate a medical response using the fine-tuned model.
    
    Args:
        message: User's medical query
        max_retries: Number of retry attempts on failure
        
    Returns:
        AI-generated response
        
    Raises:
        RuntimeError: If generation fails after retries
    """
    if history is None:
        history = []
        
    try:
        tokenizer = get_tokenizer()
        model = get_model()

        chat_messages = history + [{"role": "user", "content": message}]

        # Apply chat template
        prompt = tokenizer.apply_chat_template(
            chat_messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        # Tokenize input
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
        )

        # Move to device if using GPU
        if DEVICE == "cuda":
            inputs = {k: v.to("cuda") for k, v in inputs.items()}

        # Generate response
        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=200,
                temperature=0.6,
                top_p=0.85,
                repetition_penalty=1.1,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )

        # Remove prompt tokens
        generated_tokens = output_ids[0][inputs["input_ids"].shape[-1]:]

        raw = tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        )

        response = structure_response(raw)
        
        logger.info(f"Generated response for message: {message[:50]}...")
        return response

    except Exception as e:
        raise RuntimeError(f"LLM generation failed: {str(e)}")

