from pydantic import BaseModel
from typing import List, Optional
import uuid

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: uuid.UUID
    username: str
    commitment_score: int
    current_streak: int
    is_current_user: bool = False

class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total_users: int
    current_user_rank: Optional[int] = None
