from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardResponse
import uuid

def get_global_leaderboard(db: Session, current_user_id: uuid.UUID, limit: int = 100) -> LeaderboardResponse:
    # Get total users
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # We want to rank users by commitment_score DESC.
    # In PostgreSQL, we can use the window function RANK() OVER (ORDER BY commitment_score DESC).
    # Since we need SQLAlchemy cross-compatibility or just standard ORM queries, 
    # we can compute this using a subquery or window function.
    
    rank_column = func.rank().over(order_by=User.commitment_score.desc()).label("rank")
    
    # To fetch top N and also ensure we can find the current user's rank efficiently.
    query = db.query(User.id, User.email, User.commitment_score, User.current_streak, rank_column).order_by(User.commitment_score.desc())
    
    # Get Top N
    top_n = query.limit(limit).all()
    
    entries = []
    current_user_rank = None
    
    for row in top_n:
        is_current = (row.id == current_user_id)
        if is_current:
            current_user_rank = row.rank
            
        entries.append(LeaderboardEntry(
            rank=row.rank,
            user_id=row.id,
            # Create a display username from email (just the part before @ for MVP)
            username=row.email.split('@')[0],
            commitment_score=row.commitment_score,
            current_streak=row.current_streak,
            is_current_user=is_current
        ))
    
    # If current user is not in Top N, we might want to query their rank explicitly.
    if current_user_rank is None:
        # Get just the current user's rank using a subquery
        subq = db.query(User.id, rank_column).subquery()
        user_rank_row = db.query(subq.c.rank).filter(subq.c.id == current_user_id).first()
        if user_rank_row:
            current_user_rank = user_rank_row[0]

    return LeaderboardResponse(
        entries=entries,
        total_users=total_users,
        current_user_rank=current_user_rank
    )
