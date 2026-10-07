from typing import Any, Dict
from pydantic import BaseModel


class WebSocketEvent(BaseModel):
    event: str
    data: Dict[str, Any]
