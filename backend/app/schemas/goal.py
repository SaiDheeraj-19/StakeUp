from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

# CheckIn Schemas
class CheckInBase(BaseModel):
    checkin_date: date
    status: str
    note: Optional[str] = None
    image_url: Optional[str] = None
    battle_id: Optional[UUID] = None

class CheckInCreate(CheckInBase):
    pass

class CheckIn(CheckInBase):
    id: UUID
    goal_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Goal Schemas
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    target_frequency: int = 1
    mock_stake: int = 0

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    target_frequency: Optional[int] = None

class Goal(GoalBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime
    check_ins: List[CheckIn] = []

    model_config = ConfigDict(from_attributes=True)
