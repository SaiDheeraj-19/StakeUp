from datetime import datetime, timezone, date, timedelta
from sqlalchemy.orm import Session
from app.models.user import User

def process_checkin_gamification(db: Session, user_id: str) -> User:
    """
    Updates the user's streak and commitment score after a successful check-in.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        today = datetime.now(timezone.utc).date()
        
        if user.last_checkin_date == today:
            # Already checked in today, just add score
            user.commitment_score += 10
        else:
            if user.last_checkin_date == today - timedelta(days=1):
                # Checked in yesterday, continue streak
                user.current_streak += 1
            else:
                # Missed a day (or first checkin), reset streak
                user.current_streak = 1
                
            user.commitment_score += 10
            user.last_checkin_date = today
            
            if user.current_streak > (user.highest_streak or 0):
                user.highest_streak = user.current_streak
                
        db.commit()
        db.refresh(user)
    return user

def evaluate_user_streak(db: Session, user_id: str) -> User:
    """
    Called on user login/fetch to determine if they lost their streak.
    If they missed yesterday, current_streak becomes 0.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.current_streak > 0 and user.last_checkin_date:
        today = datetime.now(timezone.utc).date()
        if today > user.last_checkin_date + timedelta(days=1):
            # Streak lost!
            user.current_streak = 0
            db.commit()
            db.refresh(user)
    return user
