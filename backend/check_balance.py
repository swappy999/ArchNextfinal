import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv('.env')

w3 = Web3(Web3.HTTPProvider(os.getenv('POLYGON_RPC')))
address = '0x63E12831dAb770dE14592da03a19aD16f312dc27'

try:
    balance = w3.eth.get_balance(address)
    print(f"Balance: {w3.from_wei(balance, 'ether')} POL")
except Exception as e:
    print(f"Error: {e}")
