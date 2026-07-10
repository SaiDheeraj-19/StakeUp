from pydantic import BaseModel
from typing import List

class DailyConsistency(BaseModel):
    date: str
    count: int

class AnalyticsSummary(BaseModel):
    total_staked: int
    total_won: int
    total_lost: int
    completion_rate: float
    weekly_consistency: List[DailyConsistency]
