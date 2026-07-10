import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timedelta

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.event import Event
from app.schemas.event import Event as EventSchema, EventCreate, EventUpdate
from pydantic import BaseModel
from google import genai
import json

router = APIRouter()

@router.get("/", response_model=List[EventSchema])
def get_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Event).filter(Event.user_id == current_user.id).all()

@router.post("/", response_model=EventSchema, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = Event(**event_in.model_dump(), user_id=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    event_id: UUID,
    event_in: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    update_data = event_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
        
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    db.delete(event)
    db.commit()

class AutoScheduleRequest(BaseModel):
    tasks: List[str]

@router.post("/auto-schedule", response_model=List[EventSchema])
def auto_schedule(
    request: AutoScheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get current events to avoid overlap
    from datetime import timezone
    now = datetime.now(timezone.utc)
    # Simple algorithm: just schedule tasks sequentially starting from now + 1 hour, each taking 1 hour
    # We will invoke Gemini to be smart
    from dotenv import load_dotenv
    from groq import Groq
    load_dotenv(override=True)
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    prompt = f"""
    You are an AI scheduler. 
    The current time is {now.isoformat()}.
    Please schedule the following loose tasks:
    {json.dumps(request.tasks)}
    
    Return ONLY a JSON array of objects with 'title', 'start_time' (ISO 8601 string), 'end_time' (ISO 8601 string).
    Space them out reasonably throughout the next 24 hours. Do not use markdown blocks, just raw JSON.
    """
    
    raw_output = ""
    
    try:
        if not gemini_key:
            raise Exception("Missing Gemini API Key")
        client = genai.Client(api_key=gemini_key)
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'temperature': 0.7}
        )
        raw_output = response.text.strip()
        
    except Exception as e_gem:
        print(f"Gemini API Error: {e_gem}, falling back to Groq...")
        try:
            if not groq_key:
                raise Exception("Missing Groq API Key")
            client = Groq(api_key=groq_key)
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
            )
            raw_output = chat_completion.choices[0].message.content.strip() if chat_completion.choices else ""
        except Exception as e_groq:
            print(f"Groq API Error: {e_groq}, falling back to simple schedule...")
            
    try:
        if not raw_output:
            raise Exception("No output from AI models")
            
        # Parse output
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3]
        if raw_output.startswith("```"):
            raw_output = raw_output[3:-3]
            
        schedule = json.loads(raw_output)
        
        # Save to DB
        created_events = []
        for slot in schedule:
            event = Event(
                user_id=current_user.id,
                title=slot["title"],
                start_time=datetime.fromisoformat(slot["start_time"].replace("Z", "+00:00")),
                end_time=datetime.fromisoformat(slot["end_time"].replace("Z", "+00:00")),
                is_ai_scheduled=True,
                color="#e8f5e9" # Light green for AI
            )
            db.add(event)
            created_events.append(event)
            
        db.commit()
        for e in created_events:
            db.refresh(e)
            
        return created_events
        
    except Exception as e:
        print(f"Scheduling Error: {e}")
        # Fallback simplistic scheduling
        created_events = []
        base_time = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        for i, task in enumerate(request.tasks):
            event = Event(
                user_id=current_user.id,
                title=task,
                start_time=base_time + timedelta(hours=i*2),
                end_time=base_time + timedelta(hours=i*2 + 1),
                is_ai_scheduled=True,
                color="#e8f5e9"
            )
            db.add(event)
            created_events.append(event)
        
        db.commit()
        for e in created_events:
            db.refresh(e)
        return created_events
