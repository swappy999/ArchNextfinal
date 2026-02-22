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
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_FROM=settings.SMTP_EMAIL,
        MAIL_PORT=587,
        MAIL_SERVER="smtp.gmail.com",
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )

    message = MessageSchema(
        subject="Your Verification Code",
        recipients=[email],
        body=f"Your verification code is: {code}",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
