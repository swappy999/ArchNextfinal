from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        return idinfo
    except Exception as e:
        print(f"[Google OAuth] Token verification failed: {e}")
        return None
