from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.api import deps
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import Goal as GoalSchema, GoalCreate, GoalUpdate

router = APIRouter()

@router.get("/", response_model=List[GoalSchema])
def read_goals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve goals for current user.
    """
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).offset(skip).limit(limit).all()
    return goals

@router.post("/", response_model=GoalSchema)
def create_goal(
    *,
    db: Session = Depends(deps.get_db),
    goal_in: GoalCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new goal.
    """
    goal = Goal(
        **goal_in.model_dump(),
        user_id=current_user.id,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.get("/history", response_model=List[GoalSchema])
def read_goal_history(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve goal history (completed or abandoned) for current user.
    """
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.status != "active"
    ).order_by(Goal.created_at.desc()).offset(skip).limit(limit).all()
    return goals

@router.get("/{id}", response_model=GoalSchema)
def read_goal(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get goal by ID.
    """
    goal = db.query(Goal).filter(Goal.id == id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.put("/{id}", response_model=GoalSchema)
def update_goal(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    goal_in: GoalUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update goal by ID.
    """
    goal = db.query(Goal).filter(Goal.id == id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    update_data = goal_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)
        
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{id}")
def delete_goal(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete goal by ID.
    """
    goal = db.query(Goal).filter(Goal.id == id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"success": True}
