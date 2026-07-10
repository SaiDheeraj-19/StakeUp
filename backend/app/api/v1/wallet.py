from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.wallet import Wallet, Transaction
from pydantic import BaseModel, UUID4
from typing import List
from datetime import datetime

router = APIRouter()

class TransactionSchema(BaseModel):
    id: UUID4
    amount: int
    tx_type: str
    reference_id: str | None = None
    description: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class WalletSchema(BaseModel):
    id: UUID4
    balance: int
    locked_balance: int
    transactions: List[TransactionSchema]

    class Config:
        from_attributes = True

@router.get("/", response_model=WalletSchema)
def get_my_wallet(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get current user's wallet and transaction history.
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        # Fallback if somehow they don't have one
        from app.services.wallet_service import WalletService
        wallet = WalletService.initialize_wallet(db, current_user.id)
    
    # Preload transactions sorted by newest
    transactions = db.query(Transaction).filter(Transaction.wallet_id == wallet.id).order_by(Transaction.created_at.desc()).all()
    
    return {
        "id": wallet.id,
        "balance": wallet.balance,
        "locked_balance": wallet.locked_balance,
        "transactions": transactions
    }
