from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.api.deps import get_db
from app.models.goal import Goal
from app.models.checkin import CheckIn
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import AnalyticsSummary, DailyConsistency

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Total Staked (Active Goals)
    total_staked = db.query(func.sum(Goal.mock_stake)).filter(
        Goal.user_id == current_user.id,
        Goal.status == "active"
    ).scalar() or 0

    # 2. Total Won (Completed Goals)
    total_won = db.query(func.sum(Goal.mock_stake)).filter(
        Goal.user_id == current_user.id,
        Goal.status == "completed"
    ).scalar() or 0

    # 3. Total Lost (Abandoned Goals)
    total_lost = db.query(func.sum(Goal.mock_stake)).filter(
        Goal.user_id == current_user.id,
        Goal.status == "abandoned"
    ).scalar() or 0

    # 4. Weekly Consistency
    # We fetch check-ins for the last 7 days.
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=6)
    
    # Simple query for all check-ins belonging to the user's goals in the last 7 days
    recent_checkins = db.query(CheckIn.created_at).join(Goal).filter(
        Goal.user_id == current_user.id,
        CheckIn.created_at >= start_date
    ).all()

    # Group by date locally since SQLite/PostgreSQL date_trunc syntax differs significantly and this is a fast loop
    # We create a dictionary of the last 7 days initialized to 0
    date_counts = {}
    for i in range(7):
        day = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        date_counts[day] = 0
    
    for (created_at,) in recent_checkins:
        day_str = created_at.strftime("%Y-%m-%d")
        if day_str in date_counts:
            date_counts[day_str] += 1
            
    weekly_consistency = [
        DailyConsistency(date=date, count=count) 
        for date, count in sorted(date_counts.items())
    ]

    # 5. Completion Rate
    # Just a simple heuristic: what percentage of days in the last 7 days had at least one checkin?
    days_active = sum(1 for count in date_counts.values() if count > 0)
    completion_rate = round((days_active / 7) * 100, 1) if date_counts else 0.0

    return AnalyticsSummary(
        total_staked=total_staked,
        total_won=total_won,
        total_lost=total_lost,
        completion_rate=completion_rate,
        weekly_consistency=weekly_consistency
    )
