from app.repository.user_repo import get_user_by_email, create_user, update_user
from app.core.security import hash_password, create_access_token
from app.integrations.email_service import send_verification_email
from app.integrations.google_oauth import verify_google_token


import random

def generate_verification_code():
    return str(random.randint(100000, 999999))

def generate_nonce():
    return str(random.randint(100000, 999999))

from app.core.security import verify_password, create_refresh_token

async def email_login(data):
    user = await get_user_by_email(data.email)
    if not user:
        return {"error": "Invalid email or password"}
    
    if not verify_password(data.password, user["password_hash"]):
        return {"error": "Invalid email or password"}
        
    token = create_access_token({"email": data.email})
    refresh_token = create_refresh_token({"email": data.email})
    
    return {
        "message": "Login successful",
        "access_token": token,
        "refresh_token": refresh_token
    }

async def email_signup(data):
    # Check if user exists
    existing_user = await get_user_by_email(data.email)
    if existing_user:
        return {"error": "User already exists"}

    # Generate verification code
    code = generate_verification_code()

    # Hash password
    hashed_pw = hash_password(data.password)

    user_data = {
        "email": data.email,
        "username": data.username,
        "password_hash": hashed_pw,
        "email_verified": False,
        "verification_code": code,
        "role": "user"
    }

    # Save to DB
    user_id = await create_user(user_data)

    # Create JWT token
    token = create_access_token({"email": data.email})
    refresh_token = create_refresh_token({"email": data.email})

    # Send verification email
    try:
        await send_verification_email(data.email, code)
    except Exception as e:
        print(f"Error sending email: {e}")

    return {
        "message": "Signup successful",
        "access_token": token,
        "refresh_token": refresh_token
    }
async def verify_email_code_service(data):

    user = await get_user_by_email(data.email)

    if not user:
        return {"error": "User not found"}

    if user.get("verification_code") != data.code:
        return {"error": "Invalid verification code"}

    await update_user(
        {"email": data.email},
        {
            "email_verified": True,
            "verification_code": None
        }
    )

    return {"message": "Email verified successfully"}

async def forgot_password_service(email: str):
    user = await get_user_by_email(email)
    if not user:
        # Return success even if user doesn't exist for security
        return {"message": "If that email is registered, a recovery link has been sent."}

    # Generate a recovery code
    code = generate_verification_code()
    
    # Store the code in the DB (can reuse verification_code for now)
    await update_user(
        {"email": email},
        {"verification_code": code}
    )

    try:
        await send_verification_email(email, code)
    except Exception as e:
        print(f"Error sending recovery email: {e}")

    return {"message": "If that email is registered, a recovery link has been sent."}
async def google_login_service(google_token):

    user_info = verify_google_token(google_token)

    email = user_info["email"]
    google_id = user_info["sub"]

    user = await get_user_by_email(email)

    if not user:
        await create_user({
            "email": email,
            "google_id": google_id,
            "email_verified": True,
            "role": "user"
        })

    token = create_access_token({"email": email})
    refresh_token = create_refresh_token({"email": email})

    return {
        "access_token": token,
        "refresh_token": refresh_token
    }