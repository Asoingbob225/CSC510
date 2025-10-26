"""Unit tests for encryption/decryption utilities."""

import pytest

from src.eatsential.utils.security import (
    DecryptionError,
    EncryptionError,
    decrypt_sensitive_data,
    encrypt_sensitive_data,
    generate_encryption_key,
)


class TestEncryptionUtilities:
    """Test suite for encryption/decryption functions"""

    def test_encrypt_decrypt_round_trip(self, monkeypatch):
        """Test that encryption and decryption work correctly"""
        # Set a test encryption key
        test_key = "test_encryption_key_for_unit_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        # Test data
        plaintext = "This is sensitive mental wellness data"

        # Encrypt
        encrypted = encrypt_sensitive_data(plaintext)
        assert encrypted is not None
        assert encrypted != plaintext
        assert isinstance(encrypted, str)

        # Decrypt
        decrypted = decrypt_sensitive_data(encrypted)
        assert decrypted == plaintext

    def test_encrypt_none_returns_none(self, monkeypatch):
        """Test that encrypting None returns None"""
        test_key = "test_encryption_key_for_unit_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        assert encrypt_sensitive_data(None) is None
        assert encrypt_sensitive_data("") is None

    def test_decrypt_none_returns_none(self, monkeypatch):
        """Test that decrypting None returns None"""
        test_key = "test_encryption_key_for_unit_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        assert decrypt_sensitive_data(None) is None
        assert decrypt_sensitive_data("") is None

    def test_encrypt_without_key_raises_error(self, monkeypatch):
        """Test that encryption fails without ENCRYPTION_KEY"""
        monkeypatch.delenv("ENCRYPTION_KEY", raising=False)

        with pytest.raises(
            EncryptionError, match="ENCRYPTION_KEY environment variable"
        ):
            encrypt_sensitive_data("test data")

    def test_decrypt_without_key_raises_error(self, monkeypatch):
        """Test that decryption fails without ENCRYPTION_KEY"""
        monkeypatch.delenv("ENCRYPTION_KEY", raising=False)

        with pytest.raises(
            DecryptionError, match="ENCRYPTION_KEY environment variable"
        ):
            decrypt_sensitive_data("encrypted_data")

    def test_decrypt_invalid_token_raises_error(self, monkeypatch):
        """Test that decrypting invalid data raises DecryptionError"""
        test_key = "test_encryption_key_for_unit_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        with pytest.raises(DecryptionError, match="Invalid encryption token"):
            decrypt_sensitive_data("this_is_not_valid_encrypted_data")

    def test_encrypt_unicode_characters(self, monkeypatch):
        """Test encryption/decryption of unicode characters"""
        test_key = "test_encryption_key_for_unit_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        # Test data with unicode characters (accents, emojis, special chars)
        plaintext = "Café résumé naïve 😊 ñoño"

        encrypted = encrypt_sensitive_data(plaintext)
        decrypted = decrypt_sensitive_data(encrypted)

        assert decrypted == plaintext

    def test_encrypt_long_text(self, monkeypatch):
        """Test encryption/decryption of long text"""
        test_key = "test_encryption_key_for_unit_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        # Test long text
        plaintext = "A" * 10000

        encrypted = encrypt_sensitive_data(plaintext)
        decrypted = decrypt_sensitive_data(encrypted)

        assert decrypted == plaintext
        assert len(decrypted) == 10000

    def test_same_plaintext_different_encrypted_output(self, monkeypatch):
        """Test that same plaintext produces different encrypted output (due to IV)"""
        test_key = "test_encryption_key_for_unit_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        plaintext = "test data"

        # Encrypt same data twice
        encrypted1 = encrypt_sensitive_data(plaintext)
        encrypted2 = encrypt_sensitive_data(plaintext)

        # Should produce different ciphertext (Fernet uses timestamp + IV)
        # But both should decrypt to same plaintext
        assert encrypted1 != encrypted2
        assert decrypt_sensitive_data(encrypted1) == plaintext
        assert decrypt_sensitive_data(encrypted2) == plaintext

    def test_decrypt_with_wrong_key_raises_error(self, monkeypatch):
        """Test that decryption with wrong key raises error"""
        # Encrypt with one key
        key1 = "test_key_one_for_encryption_testing_12345"
        monkeypatch.setenv("ENCRYPTION_KEY", key1)

        plaintext = "secret data"
        encrypted = encrypt_sensitive_data(plaintext)

        # Try to decrypt with different key
        key2 = "test_key_two_different_from_first_key_678"
        monkeypatch.setenv("ENCRYPTION_KEY", key2)

        with pytest.raises(DecryptionError):
            decrypt_sensitive_data(encrypted)

    def test_generate_encryption_key(self):
        """Test that generate_encryption_key produces valid keys"""
        key1 = generate_encryption_key()
        key2 = generate_encryption_key()

        # Keys should be different
        assert key1 != key2

        # Keys should be valid base64 strings
        assert isinstance(key1, str)
        assert isinstance(key2, str)
        assert len(key1) > 0
        assert len(key2) > 0

    def test_encryption_is_deterministic_with_pbkdf2(self, monkeypatch):
        """Test that PBKDF2 key derivation is deterministic"""
        test_key = "test_secret_key"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        plaintext = "test data"

        # Multiple encryptions
        encrypted1 = encrypt_sensitive_data(plaintext)
        encrypted2 = encrypt_sensitive_data(plaintext)

        # Both should be decryptable with same key
        assert decrypt_sensitive_data(encrypted1) == plaintext
        assert decrypt_sensitive_data(encrypted2) == plaintext

    def test_encrypt_empty_string_returns_none(self, monkeypatch):
        """Test that empty string is treated as None"""
        test_key = "test_encryption_key"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        assert encrypt_sensitive_data("") is None

    def test_decrypt_empty_string_returns_none(self, monkeypatch):
        """Test that empty string is treated as None"""
        test_key = "test_encryption_key"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        assert decrypt_sensitive_data("") is None

    def test_encrypt_special_characters(self, monkeypatch):
        """Test encryption of special characters"""
        test_key = "test_encryption_key"
        monkeypatch.setenv("ENCRYPTION_KEY", test_key)

        plaintext = "!@#$%^&*()_+-=[]{}|;':\",./<>?\n\t\r"

        encrypted = encrypt_sensitive_data(plaintext)
        decrypted = decrypt_sensitive_data(encrypted)

        assert decrypted == plaintext
