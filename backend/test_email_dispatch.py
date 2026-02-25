import asyncio, sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.integrations.email_service import send_verification_email, send_recovery_email
from app.core.config import settings

async def test():
    print(f"SMTP: {settings.SMTP_EMAIL}")
    
    # Test 1: Recovery link email
    print("\n--- TEST 1: Recovery Link Email ---")
    try:
        link = "http://localhost:3000/auth/reset-password?token=TEST_TOKEN_123"
        await send_recovery_email("swapranit956@gmail.com", link)
        print("SUCCESS: Recovery LINK email sent!")
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {e}")
    
    # Test 2: OTP verification email
    print("\n--- TEST 2: OTP Verification Email ---")
    try:
        await send_verification_email("swapranit956@gmail.com", "654321")
        print("SUCCESS: OTP email sent!")
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test())
