"""
Email service implementation using AWS SES.
"""

import os
from typing import Optional
import boto3
from botocore.exceptions import ClientError

# Initialize AWS SES client
ses_client = boto3.client(
    "ses",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)

SENDER = "Eatsential <noreply@eatsential.com>"
VERIFICATION_TEMPLATE = """
Welcome to Eatsential!

Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

Best regards,
The Eatsential Team
"""


async def send_verification_email(email: str, token: str) -> bool:
    """
    Send verification email using AWS SES

    Args:
        email: Recipient email address
        token: Verification token

    Returns:
        True if email was sent successfully

    Raises:
        ClientError: If email sending fails
    """
    verification_url = f"{os.getenv('FRONTEND_URL')}/verify-email?token={token}"

    try:
        response = ses_client.send_email(
            Source=SENDER,
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": "Please verify your Eatsential email address"},
                "Body": {
                    "Text": {
                        "Data": VERIFICATION_TEMPLATE.format(
                            verification_url=verification_url
                        )
                    }
                },
            },
        )
    except ClientError as e:
        print(f"Failed to send email: {str(e)}")
        return False

    return True
