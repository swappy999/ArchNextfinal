from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import settings
from app.repository.user_repo import (
    get_user_by_email,
    get_user_by_wallet
)
from app.services.token_service import is_token_blacklisted

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    if await is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Token revoked")

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        email = payload.get("email")
        wallet = payload.get("wallet_address")

        if email:
            user = await get_user_by_email(email)

        elif wallet:
            user = await get_user_by_wallet(wallet)

        else:
            raise HTTPException(status_code=401, detail="Invalid token")

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_roles(allowed_roles: list):

    def role_checker(current_user: dict = Depends(get_current_user)):

        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        return current_user

    return role_checker
