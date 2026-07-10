from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

class AdminPlatformStats(BaseModel):
    total_users: int
    total_active_challenges: int
    total_mock_stakes: int

class AdminUserEntry(BaseModel):
    id: uuid.UUID
    email: str
    commitment_score: int
    is_superuser: bool
    created_at: datetime

class AdminUsersResponse(BaseModel):
    items: List[AdminUserEntry]
    total: int
