import sys, os
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core import security
from datetime import timedelta
from app.core.config import settings

db = SessionLocal()
user = db.query(User).filter(User.email == "test@gmail.com").first()
access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
token = security.create_access_token(
    user.id, expires_delta=access_token_expires
)
print("Token:", token)
