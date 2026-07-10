from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.battle import Battle, BattleParticipant
from app.services.battle_service import BattleService
from pydantic import BaseModel, UUID4
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class BattleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    stake_amount: int
    battle_type: str = "1v1"

class BattleParticipantSchema(BaseModel):
    id: UUID4
    user_id: UUID4
    status: str
    team_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class BattleSchema(BaseModel):
    id: UUID4
    creator_id: UUID4
    title: str
    description: Optional[str] = None
    battle_type: str
    status: str
    start_date: datetime
    end_date: datetime
    stake_amount: int
    pot_size: int
    winner_id: Optional[UUID4] = None
    ai_report: Optional[str] = None
    participants: List[BattleParticipantSchema] = []

    class Config:
        from_attributes = True

@router.post("/", response_model=BattleSchema)
def create_battle(
    battle_in: BattleCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Create a new battle and lock creator's stake.
    """
    try:
        battle = BattleService.create_battle(
            db=db,
            creator_id=current_user.id,
            title=battle_in.title,
            description=battle_in.description,
            start_date=battle_in.start_date,
            end_date=battle_in.end_date,
            stake_amount=battle_in.stake_amount,
            battle_type=battle_in.battle_type
        )
        return battle
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{battle_id}/join")
def join_battle(
    battle_id: UUID4,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Accept invite to battle and lock stake.
    """
    try:
        participant = BattleService.join_battle(db, current_user.id, battle_id)
        return {"status": "success", "participant_id": participant.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

class InviteRequest(BaseModel):
    email: str

@router.post("/{battle_id}/invite")
def invite_to_battle(
    battle_id: UUID4,
    invite_req: InviteRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Invite a user to a battle by email.
    """
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
        
    if battle.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the battle creator can invite users")
        
    invited_user = db.query(User).filter(User.email == invite_req.email).first()
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found with this email")
        
    existing_participant = db.query(BattleParticipant).filter(
        BattleParticipant.battle_id == battle_id,
        BattleParticipant.user_id == invited_user.id
    ).first()
    
    if existing_participant:
        raise HTTPException(status_code=400, detail="User is already in this battle or has been invited")
        
    participant = BattleParticipant(
        battle_id=battle_id,
        user_id=invited_user.id,
        status="invited"
    )
    db.add(participant)
    db.commit()
    return {"status": "success", "message": f"Invited {invited_user.email} to battle"}


@router.get("/", response_model=List[BattleSchema])
def list_my_battles(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    List battles the current user is participating in.
    """
    # Find battles where user is a participant
    participants = db.query(BattleParticipant).filter(BattleParticipant.user_id == current_user.id).all()
    battle_ids = [p.battle_id for p in participants]
    battles = db.query(Battle).filter(Battle.id.in_(battle_ids)).order_by(Battle.created_at.desc()).all()
    return battles

@router.get("/{battle_id}", response_model=BattleSchema)
def get_battle(
    battle_id: UUID4,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get battle details.
    """
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    return battle

@router.post("/{battle_id}/referee")
def trigger_referee(
    battle_id: UUID4,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Trigger the AI Referee manually for demo purposes.
    (In production, this would be a cron job checking end_date).
    """
    battle = BattleService.referee_battle(db, battle_id)
    return {"status": "success", "winner_id": battle.winner_id, "ai_report": battle.ai_report}


@router.delete("/{battle_id}")
def revoke_battle(
    battle_id: UUID4,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Revoke/Cancel a battle. Only the creator can do this.
    Refunds all locked stakes to the participants.
    """
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
        
    if battle.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the battle creator can revoke this battle")
        
    if battle.status == "completed" or battle.status == "cancelled":
        raise HTTPException(status_code=400, detail=f"Cannot revoke a battle that is {battle.status}")
        
    # Refund all accepted participants
    participants = db.query(BattleParticipant).filter(
        BattleParticipant.battle_id == battle_id,
        BattleParticipant.status == "accepted"
    ).all()
    
    from app.services.wallet_service import WalletService
    for p in participants:
        WalletService.refund_stake(db, p.user_id, battle.stake_amount, str(battle.id))
        
    battle.status = "cancelled"
    db.commit()
    
    return {"status": "success", "message": "Battle revoked and stakes refunded."}

class InteractRequest(BaseModel):
    action: str  # 'cheer' or 'sabotage'
    target_user_id: UUID4

@router.post("/{battle_id}/interact")
def interact_with_opponent(
    battle_id: UUID4,
    req: InteractRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Spend 50 StakeCoins to cheer or sabotage an opponent.
    """
    # 1. Verify battle exists
    battle = db.query(Battle).filter(Battle.id == battle_id).first()
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")

    # 2. Verify user has enough coins
    from app.models.wallet import Wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < 50:
        raise HTTPException(status_code=400, detail="Not enough StakeCoins (costs 50)")

    # 3. Deduct coins and log transaction
    from app.models.wallet import WalletTransaction
    wallet.balance -= 50
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=-50,
        transaction_type="battle_interaction",
        description=f"Used {req.action} in battle {battle.title}"
    )
    db.add(tx)
    db.commit()
    return {"status": "success", "message": f"Successfully sent {req.action}!"}
