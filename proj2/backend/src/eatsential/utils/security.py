"""Security utilities for data encryption and decryption.

This module provides AES-256 encryption/decryption for sensitive mental wellness data.
The encryption key is managed via environment variable ENCRYPTION_KEY.
"""

import base64
import os
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class EncryptionError(Exception):
    """Exception raised for encryption-related errors."""

    pass


class DecryptionError(Exception):
    """Exception raised for decryption-related errors."""

    pass


def _get_encryption_key() -> bytes:
    """Get or generate encryption key from environment variable.

    Returns:
        bytes: The encryption key derived from the environment variable

    Raises:
        EncryptionError: If ENCRYPTION_KEY environment variable is not set

    """
    secret_key = os.getenv("ENCRYPTION_KEY")
    if not secret_key:
        raise EncryptionError(
            "ENCRYPTION_KEY environment variable not set. "
            "Please set it to a secure random string."
        )

    # Use PBKDF2 to derive a proper Fernet key from the secret
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"eatsential_wellness_salt",  # Static salt for consistency
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(secret_key.encode()))
    return key


def encrypt_sensitive_data(plaintext: Optional[str]) -> Optional[str]:
    """Encrypt sensitive data using AES-256 (via Fernet).

    Args:
        plaintext: The plain text to encrypt. Can be None or empty.

    Returns:
        str: Base64-encoded encrypted text, or None if input is None/empty

    Raises:
        EncryptionError: If encryption fails

    Example:
        >>> encrypted = encrypt_sensitive_data("I feel anxious today")
        >>> # Returns encrypted base64 string

    """
    if not plaintext:
        return None

    try:
        key = _get_encryption_key()
        fernet = Fernet(key)
        encrypted_bytes = fernet.encrypt(plaintext.encode("utf-8"))
        return encrypted_bytes.decode("utf-8")
    except Exception as e:
        raise EncryptionError(f"Failed to encrypt data: {e!s}") from e


def decrypt_sensitive_data(encrypted_text: Optional[str]) -> Optional[str]:
    """Decrypt sensitive data that was encrypted with encrypt_sensitive_data.

    Args:
        encrypted_text: The encrypted text to decrypt. Can be None or empty.

    Returns:
        str: The decrypted plain text, or None if input is None/empty

    Raises:
        DecryptionError: If decryption fails (invalid key, corrupted data, etc.)

    Example:
        >>> decrypted = decrypt_sensitive_data(encrypted_text)
        >>> # Returns original plain text

    """
    if not encrypted_text:
        return None

    try:
        key = _get_encryption_key()
        fernet = Fernet(key)
        decrypted_bytes = fernet.decrypt(encrypted_text.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except InvalidToken as e:
        raise DecryptionError("Invalid encryption token or corrupted data") from e
    except Exception as e:
        raise DecryptionError(f"Failed to decrypt data: {e!s}") from e


def generate_encryption_key() -> str:
    """Generate a new random encryption key for ENCRYPTION_KEY environment variable.

    This is a utility function for setting up new environments.

    Returns:
        str: A secure random key suitable for use as ENCRYPTION_KEY

    Example:
        >>> key = generate_encryption_key()
        >>> # Save this to your .env file: ENCRYPTION_KEY=<key>

    """
    return base64.urlsafe_b64encode(os.urandom(32)).decode("utf-8")
