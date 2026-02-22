from app.core.config import settings

class PolygonNetwork:
    """
    Helper class for Polygon network configuration and constants.
    """
    RPC_URL = settings.POLYGON_RPC
    CHAIN_ID = 80002  # Amoy Testnet (or 80001 for Mumbai)
    EXPLORER_URL = "https://amoy.polygonscan.com"

    @staticmethod
    def get_tx_url(tx_hash: str) -> str:
        return f"{PolygonNetwork.EXPLORER_URL}/tx/{tx_hash}"

    @staticmethod
    def get_address_url(address: str) -> str:
        return f"{PolygonNetwork.EXPLORER_URL}/address/{address}"

polygon_client = PolygonNetwork()
