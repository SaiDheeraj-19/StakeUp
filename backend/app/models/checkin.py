import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class CheckIn(Base):
    __tablename__ = "check_ins"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=True, index=True)
    battle_id = Column(UUID(as_uuid=True), ForeignKey("battles.id"), nullable=True, index=True)
    checkin_date = Column(Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    status = Column(String, default="completed") # completed, skipped
    note = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    goal = relationship("Goal", back_populates="check_ins")
