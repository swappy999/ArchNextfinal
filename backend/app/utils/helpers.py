import uuid
from datetime import datetime

def parse_object_id(id_str: str) -> str:
    try:
        uuid.UUID(id_str)
        return id_str
    except ValueError:
        raise ValueError("Invalid UUID format")

def format_currency(amount: float, currency: str = "INR") -> str:
    if currency == "INR":
        return f"₹{amount:,.2f}"
    return f"${amount:,.2f}"

def calculate_growth(current: float, predicted: float) -> float:
    if current == 0:
        return 0.0
    return ((predicted - current) / current) * 100
