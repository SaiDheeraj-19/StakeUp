from sqlalchemy import Column, String, Integer, DateTime, Boolean, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
from app.db.base_class import Base
from sqlalchemy.orm import relationship
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    commitment_score = Column(Integer, default=0, index=True)
    current_streak = Column(Integer, default=0)
    highest_streak = Column(Integer, default=0)
    last_checkin_date = Column(Date, nullable=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
