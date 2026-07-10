from sqlalchemy.orm import Session
from uuid import UUID
from app.models.wallet import Wallet, Transaction
from app.models.user import User

class WalletService:
    @staticmethod
    def get_wallet(db: Session, user_id: UUID) -> Wallet:
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        return wallet

    @staticmethod
    def initialize_wallet(db: Session, user_id: UUID) -> Wallet:
        # Check if wallet already exists
        existing = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if existing:
            return existing

        # Create new wallet with onboarding grant
        wallet = Wallet(
            user_id=user_id,
            balance=1000,
            locked_balance=0
        )
        db.add(wallet)
        db.flush() # Flush to get wallet.id

        # Record onboarding transaction
        tx = Transaction(
            wallet_id=wallet.id,
            amount=1000,
            tx_type="onboarding_grant",
            description="Welcome to StakeUp! Here are 1,000 StakeCoins to start battling."
        )
        db.add(tx)
        db.commit()
        db.refresh(wallet)
        return wallet

    @staticmethod
    def lock_stake(db: Session, user_id: UUID, amount: int, battle_id: str) -> bool:
        """Lock coins in escrow for a battle."""
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).with_for_update().first()
        if not wallet or wallet.balance < amount:
            return False

        wallet.balance -= amount
        wallet.locked_balance += amount
        
        tx = Transaction(
            wallet_id=wallet.id,
            amount=-amount,
            tx_type="stake_locked",
            reference_id=battle_id,
            description=f"Locked {amount} coins in escrow for battle."
        )
        db.add(tx)
        db.commit()
        return True

    @staticmethod
    def release_escrow_to_winner(db: Session, winner_id: UUID, loser_ids: list[UUID], stake_amount: int, battle_id: str):
        """Release the entire pot to the winner and forfeit losers' escrow."""
        # 1. Winner gets their stake back PLUS losers' stakes
        winner_wallet = db.query(Wallet).filter(Wallet.user_id == winner_id).with_for_update().first()
        if not winner_wallet:
            return
            
        total_pot = stake_amount * (len(loser_ids) + 1)
        
        # Move winner's stake out of escrow, plus reward
        winner_wallet.locked_balance -= stake_amount
        winner_wallet.balance += total_pot
        
        db.add(Transaction(
            wallet_id=winner_wallet.id,
            amount=total_pot,
            tx_type="battle_reward",
            reference_id=battle_id,
            description=f"Won battle! Claimed the pot of {total_pot} coins."
        ))

        # 2. Losers forfeit their escrow
        for loser_id in loser_ids:
            loser_wallet = db.query(Wallet).filter(Wallet.user_id == loser_id).with_for_update().first()
            if loser_wallet:
                loser_wallet.locked_balance -= stake_amount
                db.add(Transaction(
                    wallet_id=loser_wallet.id,
                    amount=0, # Balance doesn't change here since it was removed at lock
                    tx_type="battle_forfeit",
                    reference_id=battle_id,
                    description=f"Lost battle. Forfeited {stake_amount} coins from escrow."
                ))
        
        db.commit()

    @staticmethod
    def refund_stake(db: Session, user_id: UUID, amount: int, battle_id: str):
        """Refund a stake if a battle is cancelled."""
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).with_for_update().first()
        if not wallet or wallet.locked_balance < amount:
            return
            
        wallet.locked_balance -= amount
        wallet.balance += amount
        
        tx = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            tx_type="refund",
            reference_id=battle_id,
            description="Battle cancelled. Stake refunded."
        )
        db.add(tx)
        db.commit()

    @staticmethod
    def reward_coins(db: Session, user_id: UUID, amount: int, reference_id: str, description: str):
        """Reward coins to a user's wallet for completing a challenge or milestone."""
        if amount <= 0:
            return
            
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).with_for_update().first()
        if not wallet:
            return
            
        wallet.balance += amount
        
        tx = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            tx_type="challenge_reward",
            reference_id=reference_id,
            description=description
        )
        db.add(tx)
        db.commit()
