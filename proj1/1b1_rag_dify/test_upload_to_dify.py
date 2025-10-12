import pytest
from unittest.mock import patch, MagicMock
import os


# Test without actual API calls
@patch.dict(os.environ, {
    "DIFY_API_KEY": "test-key",
    "DATASET_ID": "test-dataset-id",
    "DIFY_BASE_URL": "https://test.local"
})
def test_environment_variables():
    """Test that environment variables are loaded correctly"""
    from upload_to_dify import DIFY_API_KEY, DATASET_ID, DIFY_BASE_URL
    
    assert DIFY_API_KEY == "test-key"
    assert DATASET_ID == "test-dataset-id"
    assert DIFY_BASE_URL == "https://test.local"


@patch.dict(os.environ, {
    "DIFY_API_KEY": "test-key",
    "DATASET_ID": "test-dataset-id"
})
def test_upload_files_from_directory_nonexistent():
    """Test upload_files_from_directory with non-existent directory"""
    from upload_to_dify import upload_files_from_directory
    
    # Should handle non-existent directory gracefully
    result = upload_files_from_directory("/nonexistent/path", ".md")
    assert result is None
