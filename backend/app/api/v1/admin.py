from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.api.deps import get_current_active_superuser
from app.models.user import User
from app.schemas.admin import AdminPlatformStats, AdminUsersResponse
from app.services.admin import get_platform_stats, get_paginated_users

router = APIRouter()

@router.get("/stats", response_model=AdminPlatformStats)
def read_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """
    Retrieve global platform statistics.
    Requires is_superuser=True.
    """
    return get_platform_stats(db)

@router.get("/users", response_model=AdminUsersResponse)
def read_admin_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """
    Retrieve paginated list of all users.
    Requires is_superuser=True.
    """
    return get_paginated_users(db=db, skip=skip, limit=limit)
