from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

def load_contract_info(filename: str) -> str | None:
    path = os.path.join(os.path.dirname(__file__), "../..", filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return f.read().strip()
    return None

class Settings(BaseSettings):
    APP_NAME: str
    SECRET_KEY: str
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/archnext"
    GOOGLE_CLIENT_ID: str | None = None
    SMTP_EMAIL: str | None = None
    SMTP_PASSWORD: str | None = None
    POLYGON_RPC: str | None = None
    
    CONTRACT_ADDRESS: str | None = os.getenv("CONTRACT_ADDRESS") or load_contract_info("contract_address.txt")
    NFT_CONTRACT_ADDRESS: str | None = os.getenv("NFT_CONTRACT_ADDRESS") or load_contract_info("nft_address.txt")
    MARKETPLACE_ADDRESS: str | None = os.getenv("MARKETPLACE_ADDRESS") or load_contract_info("marketplace_address.txt")
    GEMINI_API_KEY_CHATBOT: str | None = None
    GEMINI_API_KEY_VERIFICATION: str | None = None
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None
    
    WALLET_ADDRESS: str | None = None
    PRIVATE_KEY: str | None = None
    MAPBOX_TOKEN: str = os.getenv("MAPBOX_TOKEN", "")

settings = Settings()
