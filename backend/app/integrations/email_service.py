from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings

async def send_verification_email(email: str, code: str):
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        print("\n" + "="*50)
        print(f" [EMAIL_MOCK] OTP FOR {email}: {code} ")
        print("="*50 + "\n", flush=True)
        return

    conf = ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_EMAIL,
        MAIL_PASSWORD=settings.SMTP_PASSWORD.replace(" ", ""), # Clean spaces
        MAIL_FROM=settings.SMTP_EMAIL,
        MAIL_PORT=587,
        MAIL_SERVER="smtp.gmail.com",
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
        TIMEOUT=10
    )

    message = MessageSchema(
        subject="ArchNext — Verification Code",
        recipients=[email],
        body=f"Your ArchNext verification code is: {code}",
        subtype="plain"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[EMAIL] Verification sent to {email}")
    except Exception as e:
        print(f"[EMAIL_ERROR] Failed to send to {email}: {e}")

async def send_recovery_email(email: str, reset_link: str):
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        print("\n" + "="*50)
        print(f" [EMAIL_MOCK] RECOVERY LINK FOR {email}: {reset_link} ")
        print("="*50 + "\n", flush=True)
        return

    conf = ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_EMAIL,
        MAIL_PASSWORD=settings.SMTP_PASSWORD.replace(" ", ""), # Clean spaces
        MAIL_FROM=settings.SMTP_EMAIL,
        MAIL_PORT=587,
        MAIL_SERVER="smtp.gmail.com",
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
        TIMEOUT=10
    )

    message = MessageSchema(
        subject="ArchNext — Reset Your Password",
        recipients=[email],
        body=f"Click the link below to reset your password:\n\n{reset_link}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this email.",
        subtype="plain"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"[EMAIL] Recovery link sent to {email}")
    except Exception as e:
        print(f"[EMAIL_ERROR] Recovery failure for {email}: {e}")
