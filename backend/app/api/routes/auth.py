from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth_schema import EmailSignup, EmailLogin, VerifyEmailCode, ForgotPassword
from app.services.auth_service import (
    email_signup, email_login, verify_email_code_service,
    google_login_service, generate_nonce, forgot_password_service
)
from app.services.token_service import blacklist_token
from app.repository.user_repo import get_user_by_email, update_user, get_user_by_wallet, create_user
from app.integrations.metamask import verify_wallet_signature
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.core.dependencies import get_current_user
from pydantic import BaseModel
from jose import jwt

security = HTTPBearer()
router = APIRouter()

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
async def refresh_token(data: RefreshRequest):
    try:
        payload = jwt.decode(
            data.refresh_token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        if payload.get("type") != "refresh":
            return {"error": "Invalid token"}

        # Extract only necessary fields to avoid polluting the new token
        user_data = {}
        if "email" in payload:
            user_data["email"] = payload["email"]
        if "wallet_address" in payload:
             user_data["wallet_address"] = payload["wallet_address"]

        new_access = create_access_token(user_data)

        return {"access_token": new_access}

    except Exception as e:
        return {"error": "Invalid refresh token"}

@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    await blacklist_token(token)
    return {"message": "Logged out successfully"}

@router.post("/signup")
async def signup(data: EmailSignup):
    return await email_signup(data)

@router.post("/login")
async def login(data: EmailLogin):
    return await email_login(data)

@router.post("/verify-email")
async def verify_email(data: VerifyEmailCode):
    return await verify_email_code_service(data)

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    return await forgot_password_service(data.email)

class GoogleLogin(BaseModel):
    token: str

@router.post("/google-login")
async def google_login(data: GoogleLogin):
    return await google_login_service(data.token)

class WalletRequest(BaseModel):
    wallet_address: str

@router.post("/wallet-nonce")
async def wallet_nonce(data: WalletRequest):

    nonce = generate_nonce()

    user = await get_user_by_wallet(data.wallet_address)

    if not user:
        await create_user({
            "wallet_address": data.wallet_address,
            "nonce": nonce,
            "email_verified": True,
            "role": "user"
        })
    else:
        await update_user(
            {"wallet_address": data.wallet_address},
            {"nonce": nonce}
        )

    return {"nonce": nonce}

class WalletVerify(BaseModel):
    wallet_address: str
    signature: str
    message: str

@router.post("/wallet-verify")
async def wallet_verify(data: WalletVerify):

    # Verify signature
    recovered = verify_wallet_signature(
        data.message,
        data.signature
    )

    if recovered.lower() != data.wallet_address.lower():
        return {"error": "Invalid signature"}

    # Verify nonce from database
    user = await get_user_by_wallet(data.wallet_address)

    if not user:
        return {"error": "User not found"}

    # Check if the signed message contains the correct nonce
    expected_nonce = user.get("nonce")
    if not expected_nonce or expected_nonce not in data.message:
        return {"error": "Invalid nonce or nonce expired"}

    # Clear nonce after successful login
    await update_user(
        {"wallet_address": data.wallet_address},
        {"nonce": None}
    )

    token = create_access_token({
        "wallet_address": data.wallet_address
    })
    refresh_token = create_refresh_token({
        "wallet_address": data.wallet_address
    })

    return {
        "access_token": token,
        "refresh_token": refresh_token
    }

@router.get("/protected-test")
async def protected_test(current_user=Depends(get_current_user)):
    return {
        "message": "Access granted",
        "user": str(current_user)
    }