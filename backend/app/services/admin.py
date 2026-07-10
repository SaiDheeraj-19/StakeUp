from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.goal import Goal
from app.schemas.admin import AdminPlatformStats, AdminUsersResponse, AdminUserEntry

def get_platform_stats(db: Session) -> AdminPlatformStats:
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_active_challenges = db.query(func.count(Goal.id)).filter(Goal.status == "active").scalar() or 0
    total_mock_stakes = db.query(func.sum(Goal.mock_stake)).filter(Goal.status == "active").scalar() or 0

    return AdminPlatformStats(
        total_users=total_users,
        total_active_challenges=total_active_challenges,
        total_mock_stakes=total_mock_stakes
    )

def get_paginated_users(db: Session, skip: int = 0, limit: int = 50) -> AdminUsersResponse:
    total = db.query(func.count(User.id)).scalar() or 0
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    items = []
    for u in users:
        items.append(AdminUserEntry(
            id=u.id,
            email=u.email,
            commitment_score=u.commitment_score,
            is_superuser=u.is_superuser,
            created_at=u.created_at
        ))
        
    return AdminUsersResponse(items=items, total=total)
