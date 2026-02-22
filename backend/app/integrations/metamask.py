from eth_account.messages import encode_defunct
from web3 import Web3

def verify_wallet_signature(wallet_address: str, message: str, signature: str) -> bool:
    """
    Verifies that a message was signed by the owner of the wallet_address.
    Used for wallet-based authentication.
    """
    try:
        w3 = Web3()
        encoded_message = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(encoded_message, signature=signature)
        
        return recovered_address.lower() == wallet_address.lower()
    except Exception:
        return False
