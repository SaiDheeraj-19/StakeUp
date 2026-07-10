from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.models.user import User
from app.models.goal import Goal
from app.models.battle import Battle
from app.models.checkin import CheckIn
from app.schemas.goal import CheckIn as CheckInSchema, CheckInCreate
from app.services.gamification import process_checkin_gamification

router = APIRouter()

@router.get("/goal/{goal_id}", response_model=List[CheckInSchema])
def get_goal_checkins(
    goal_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    return db.query(CheckIn).filter(CheckIn.goal_id == goal_id).all()

@router.get("/battle/{battle_id}", response_model=List[CheckInSchema])
def get_battle_checkins(
    battle_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    return db.query(CheckIn).filter(CheckIn.battle_id == battle_id).all()

@router.post("/", response_model=CheckInSchema)
def create_checkin(
    checkin_in: CheckInCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Log a check-in for a goal or battle.
    """
    if checkin_in.goal_id:
        target = db.query(Goal).filter(Goal.id == checkin_in.goal_id, Goal.user_id == current_user.id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Goal not found")
    elif checkin_in.battle_id:
        target = db.query(Battle).filter(Battle.id == checkin_in.battle_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Battle not found")
    else:
        raise HTTPException(status_code=400, detail="Must provide goal_id or battle_id")

    checkin = CheckIn(**checkin_in.model_dump())
    db.add(checkin)
    
    # Process Gamification
    process_checkin_gamification(db, current_user.id)
    
    db.commit()
    db.refresh(checkin)
    return checkin
