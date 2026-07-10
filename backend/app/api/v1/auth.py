from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.api import deps
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate
from app.schemas.token import Token
from app.services.email_service import send_welcome_email
from app.services.wallet_service import WalletService

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Register new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize Stake Wallet with Onboarding Grant
    WalletService.initialize_wallet(db, user.id)
    
    # Trigger Welcome Email asynchronously
    username = user.email.split("@")[0].capitalize()
    background_tasks.add_task(send_welcome_email, user.email, username)
    
    return user

@router.get("/me", response_model=UserSchema)
def read_users_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user and evaluate streak.
    """
    from app.services.gamification import evaluate_user_streak
    user = evaluate_user_streak(db, current_user.id)
    return user

@router.post("/repair-streak")
def repair_streak(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Repair a broken streak using StakeCoins.
    """
    REPAIR_COST = 500
    
    wallet = current_user.wallet
    if not wallet or wallet.balance < REPAIR_COST:
        raise HTTPException(status_code=400, detail="Insufficient StakeCoins to repair streak")
        
    if current_user.current_streak > 0:
        raise HTTPException(status_code=400, detail="Your streak is already active")
        
    if current_user.highest_streak == 0:
        raise HTTPException(status_code=400, detail="You do not have a previous streak to repair")
        
    # Deduct coins
    from app.models.wallet import Transaction
    import uuid
    tx = Transaction(
        wallet_id=wallet.id,
        amount=-REPAIR_COST,
        tx_type="streak_repair",
        description="Repaired broken streak"
    )
    wallet.balance -= REPAIR_COST
    db.add(tx)
    
    # Repair streak
    current_user.current_streak = current_user.highest_streak
    # We update last_checkin_date to yesterday so they still need to check in today
    from datetime import datetime, timezone, timedelta
    current_user.last_checkin_date = datetime.now(timezone.utc).date() - timedelta(days=1)
    
    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "message": "Streak repaired successfully!", "current_streak": current_user.current_streak}
