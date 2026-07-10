from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.models.checkin import CheckIn
from app.services.cloudinary_service import upload_proof_image
from app.services.vision_service import verify_proof_with_gemini
import uuid

router = APIRouter()

@router.post("/verify")
async def verify_proof(
    goal_id: str = Form(None),
    battle_id: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify Goal or Battle exists
    if goal_id:
        try:
            g_uuid = uuid.UUID(str(goal_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid goal ID format")
        target = db.query(Goal).filter(Goal.id == g_uuid, Goal.user_id == current_user.id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Goal not found")
        task_title = target.title
    elif battle_id:
        try:
            b_uuid = uuid.UUID(str(battle_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid battle ID format")
        # Check if user is participant
        from app.models.battle import Battle, BattleParticipant
        participant = db.query(BattleParticipant).filter(
            BattleParticipant.battle_id == b_uuid, 
            BattleParticipant.user_id == current_user.id
        ).first()
        if not participant:
            raise HTTPException(status_code=403, detail="Not a participant in this battle")
        target = db.query(Battle).filter(Battle.id == b_uuid).first()
        if not target:
            raise HTTPException(status_code=404, detail="Battle not found")
        task_title = target.title
    else:
        raise HTTPException(status_code=400, detail="Must provide goal_id or battle_id")

    # 2. Read file bytes
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid file upload")
        
    # 3. Upload to Cloudinary
    try:
        filename = f"proof_{current_user.id}_{uuid.uuid4().hex}"
        image_url = upload_proof_image(file_bytes, filename)
    except Exception as e:
        print(f"Cloudinary error: {e}")
        # Fallback to mock URL if Cloudinary fails (for hackathon demo)
        image_url = "https://example.com/mock-proof.jpg"
        
    # 4. Verify with Gemini Vision
    try:
        verification_result = verify_proof_with_gemini(file_bytes, task_title)
    except Exception as e:
        print(f"Gemini error: {e}")
        # Fallback to false if Gemini fails (for hackathon demo)
        verification_result = {"verified": False, "comment": "AI Verification failed due to an error processing your image."}
        
    # 5. Process result
    if verification_result["verified"]:
        # Record CheckIn
        new_checkin = CheckIn(
            goal_id=goal_id if goal_id else None,
            battle_id=battle_id if battle_id else None,
            note=f"ProofIQ Verified: {verification_result['comment']}",
            image_url=image_url
        )
        db.add(new_checkin)
        
        # Process Gamification
        from app.services.gamification import process_checkin_gamification
        process_checkin_gamification(db, current_user.id)
        
        # Check if daily target is met to reward SC
        if goal_id:
            from datetime import datetime, timezone
            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            # Count existing checkins for today (before committing the new one)
            existing_today = db.query(CheckIn).filter(
                CheckIn.goal_id == goal_id, 
                CheckIn.created_at >= today_start
            ).count()
            
            if existing_today + 1 == target.target_frequency:
                from app.services.wallet_service import WalletService
                reward_amount = target.mock_stake if target.mock_stake > 0 else 100
                WalletService.reward_coins(
                    db=db, 
                    user_id=current_user.id, 
                    amount=reward_amount, 
                    reference_id=str(target.id), 
                    description=f"Completed daily target for {target.title}!"
                )
        
        db.commit()
        db.refresh(new_checkin)
        
    return {
        "verified": verification_result["verified"],
        "comment": verification_result["comment"],
        "image_url": image_url
    }
