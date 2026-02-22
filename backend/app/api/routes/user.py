from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, require_roles

router = APIRouter()

@router.get("/admin-dashboard")
async def admin_dashboard(
    current_user=Depends(get_current_user),
    role_check=Depends(require_roles(["admin"]))
):
    return {"message": "Admin access granted"}

@router.get("/dashboard")
async def dashboard(current_user=Depends(get_current_user)):

    return {
        "email": current_user.get("email"),
        "wallet": current_user.get("wallet_address")
    }

@router.get("/me")
async def get_my_profile(current_user=Depends(get_current_user)):
    # Remove sensitive data like password_hash
    current_user.pop("password_hash", None)
    
    return {
        "user": current_user
    }
