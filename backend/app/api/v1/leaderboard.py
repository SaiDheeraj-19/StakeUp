from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.leaderboard import LeaderboardResponse
from app.services.leaderboard import get_global_leaderboard

router = APIRouter()

@router.get("/", response_model=LeaderboardResponse)
def read_leaderboard(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the global social leaderboard.
    Separated strictly into the Application Layer, passing off to Domain Services.
    """
    return get_global_leaderboard(db=db, current_user_id=current_user.id, limit=limit)
