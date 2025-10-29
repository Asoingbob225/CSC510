from typing import Dict, List

# Simple in-memory mailer for tests/dev. Records sent emails to `sent_emails` list.
sent_emails: List[Dict] = []


def send_verification_email(to_email: str, username: str, verify_token: str, frontend_origin: str = "http://localhost:5173"):
    link = f"{frontend_origin}/verify?token={verify_token}&email={to_email}"
    subject = "Verify your email"
    body = f"Hello {username},\n\nPlease verify your email by visiting: {link}\n\nIf this wasn't you, ignore."
    sent = {"to": to_email, "subject": subject, "body": body, "link": link}
    sent_emails.append(sent)
    return sent
