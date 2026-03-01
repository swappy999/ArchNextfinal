import logging
from .property_events import property_bus
from .property_state_machine import PropertyEvent

logger = logging.getLogger(__name__)

async def broadcast_property_update(payload: dict):
    """
    Subscribes to ALL state machine events and broadcasts a universal `property:update`
    over WebSockets to instantly sync all connected UI modules (Marketplace, Portfolio, Map).
    """
    from app.api.ws import manager
    
    property_id = payload.get("property_id")
    event_type = payload.get("event")
    new_status = payload.get("new_status")
    
    logger.info(f"SYNCHRONIZATION SERVICE: Broadcasting {event_type} (Status: {new_status}) for property {property_id}")
    
    message = {
        "topic": "property:update",
        "data": {
            "property_id": property_id,
            "event": event_type,
            "status": new_status,
            **payload
        }
    }
    
    await manager.broadcast(message)

# Subscribe to all lifecycle events
def register_sync_listeners():
    for event in PropertyEvent:
        property_bus.on(event, broadcast_property_update)
