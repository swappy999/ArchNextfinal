import asyncio
import os
from dotenv import load_dotenv
from app.integrations.email_service import send_verification_email

async def test_email():
    load_dotenv('.env')
    email = "swapranit956@gmail.com" # Testing with the same email or user's email if I had it
    code = "123456"
    
    print(f"Attempting to send test email to {email}...")
    try:
        await send_verification_email(email, code)
        print("Success: Email dispatch initiated.")
    except Exception as e:
        print(f"Failure: {e}")

if __name__ == "__main__":
    asyncio.run(test_email())
