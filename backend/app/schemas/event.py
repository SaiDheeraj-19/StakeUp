from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    color: Optional[str] = None

class EventCreate(EventBase):
    is_ai_scheduled: Optional[bool] = False

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    color: Optional[str] = None

class Event(EventBase):
    id: UUID
    user_id: UUID
    is_ai_scheduled: bool

    model_config = ConfigDict(from_attributes=True)
