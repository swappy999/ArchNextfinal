import asyncio
import logging
from typing import Callable, Dict, List, Any
from .property_state_machine import PropertyEvent

logger = logging.getLogger(__name__)

# Very simple in-memory Event Bus mimicking Node.js EventEmitter
class EventEmitter:
    def __init__(self):
        self._listeners: Dict[PropertyEvent, List[Callable]] = {}

    def on(self, event: PropertyEvent, listener: Callable) -> None:
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(listener)

    def emit(self, event: PropertyEvent, payload: dict) -> None:
        listeners = self._listeners.get(event, [])
        for listener in listeners:
            try:
                # We can fire these asynchronously 
                asyncio.create_task(self._async_execute(listener, event, payload))
            except Exception as e:
                logger.error(f"Error dispatching event {event.value}: {e}")

    async def _async_execute(self, listener: Callable, event: PropertyEvent, payload: dict):
        try:
            if asyncio.iscoroutinefunction(listener):
                await listener(payload)
            else:
                listener(payload)
        except Exception as e:
            logger.error(f"Event handler failed for {event.value}: {e}")

property_bus = EventEmitter()
