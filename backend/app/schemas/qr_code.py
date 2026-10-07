from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class QRCodeResponse(BaseModel):
    id: int
    location_id: int
    token: str
    qr_image_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
