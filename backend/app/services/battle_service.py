from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from app.models.battle import Battle, BattleParticipant
from app.models.checkin import CheckIn
from app.models.goal import Goal
from app.services.wallet_service import WalletService
import uuid

class BattleService:
    @staticmethod
    def create_battle(db: Session, creator_id: UUID, title: str, description: str, start_date: datetime, end_date: datetime, stake_amount: int, battle_type: str = "1v1") -> Battle:
        # Create Battle
        battle = Battle(
            creator_id=creator_id,
            title=title,
            description=description,
            battle_type=battle_type,
            start_date=start_date,
            end_date=end_date,
            stake_amount=stake_amount,
            status="pending",
            pot_size=stake_amount # Creator is implicitly in
        )
        db.add(battle)
        db.flush()

        # Add creator as participant
        participant = BattleParticipant(
            battle_id=battle.id,
            user_id=creator_id,
            status="accepted"
        )
        db.add(participant)

        # Lock creator's stake
        if stake_amount > 0:
            success = WalletService.lock_stake(db, creator_id, stake_amount, str(battle.id))
            if not success:
                raise ValueError("Insufficient balance to cover the stake.")

        db.commit()
        db.refresh(battle)
        return battle

    @staticmethod
    def join_battle(db: Session, user_id: UUID, battle_id: UUID) -> BattleParticipant:
        battle = db.query(Battle).filter(Battle.id == battle_id).with_for_update().first()
        if not battle:
            raise ValueError("Battle not found.")
        
        if battle.status != "pending":
            raise ValueError("Battle has already started or completed.")

        # Check if already in battle
        existing = db.query(BattleParticipant).filter(BattleParticipant.battle_id == battle_id, BattleParticipant.user_id == user_id).first()
        if existing and existing.status == "accepted":
            raise ValueError("Already a participant in this battle.")

        # Lock stake
        if battle.stake_amount > 0:
            success = WalletService.lock_stake(db, user_id, battle.stake_amount, str(battle.id))
            if not success:
                raise ValueError("Insufficient balance to cover the stake.")

        if existing:
            existing.status = "accepted"
            participant = existing
        else:
            participant = BattleParticipant(
                battle_id=battle.id,
                user_id=user_id,
                status="accepted"
            )
            db.add(participant)

        db.flush() # Ensure the new participant is visible to the count query
        
        battle.pot_size += battle.stake_amount
        
        # If 1v1 and we have 2 participants, start it (for simplicity in hackathon demo)
        if battle.battle_type == "1v1":
            accepted_count = db.query(BattleParticipant).filter(BattleParticipant.battle_id == battle_id, BattleParticipant.status == "accepted").count()
            if accepted_count == 2:
                battle.status = "active"

        db.commit()
        db.refresh(participant)
        return participant

    @staticmethod
    def referee_battle(db: Session, battle_id: UUID) -> Battle:
        """The AI Referee analyzes checkins and declares a winner."""
        battle = db.query(Battle).filter(Battle.id == battle_id).first()
        if not battle or battle.status == "completed":
            return battle

        participants = db.query(BattleParticipant).filter(BattleParticipant.battle_id == battle_id, BattleParticipant.status == "accepted").all()
        
        if not participants:
            battle.status = "completed"
            db.commit()
            return battle

        user_scores = {}
        for p in participants:
            goals = db.query(Goal).filter(Goal.user_id == p.user_id).all()
            goal_ids = [g.id for g in goals]
            if not goal_ids:
                user_scores[p.user_id] = 0
                continue
                
            checkins = db.query(CheckIn).filter(
                CheckIn.goal_id.in_(goal_ids),
                CheckIn.created_at >= battle.start_date,
                CheckIn.created_at <= battle.end_date,
                CheckIn.image_url != None # ProofIQ only
            ).count()
            user_scores[p.user_id] = checkins

        sorted_scores = sorted(user_scores.items(), key=lambda item: item[1], reverse=True)
        
        is_tie = False
        if len(sorted_scores) > 1 and sorted_scores[0][1] == sorted_scores[1][1]:
            is_tie = True
            
        winner_id = None if is_tie else sorted_scores[0][0]
        
        # Build prompt for LLM Referee
        scores_text = "\n".join([f"User {u_id}: {score} check-ins" for u_id, score in sorted_scores])
        if is_tie:
            prompt = f"You are the ruthless AI Referee of StakeUp. Two users tied in a battle! Here are the scores:\n{scores_text}\nWrite a short, hype-filled, aggressive fighting-game announcer style report declaring it a pathetic draw and mocking both users. Return ONLY the report text."
        else:
            prompt = f"You are the ruthless AI Referee of StakeUp. A battle has concluded! Here are the scores:\n{scores_text}\nWrite a short, hype-filled, aggressive fighting-game announcer style report declaring User {winner_id} the undisputed champion and ruthlessly roasting the loser. Return ONLY the report text."

        ai_report = "AI Referee Error: Failed to generate report."
        try:
            import os
            from app.core.config import settings
            from google import genai
            
            gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            if gemini_key:
                client = genai.Client(api_key=gemini_key)
                resp = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                if resp and resp.text:
                    ai_report = resp.text.strip()
            else:
                ai_report = f"AI Referee (Offline Mode): {'Tie game! Both are weak.' if is_tie else f'User {winner_id} won with {sorted_scores[0][1]} check-ins!'}"
        except Exception as e:
            print(f"AI Referee LLM Error: {e}")
            ai_report = f"AI Referee (Fallback): {'Tie game!' if is_tie else f'User {winner_id} won!'}"

        # Settle Escrow
        if is_tie:
            # Refund all
            for p in participants:
                WalletService.refund_stake(db, p.user_id, battle.stake_amount, str(battle.id))
        else:
            loser_ids = [p.user_id for p in participants if p.user_id != winner_id]
            WalletService.release_escrow_to_winner(db, winner_id, loser_ids, battle.stake_amount, str(battle.id))

        battle.winner_id = winner_id
        battle.ai_report = ai_report
        battle.status = "completed"
        
        db.commit()
        db.refresh(battle)
        return battle
