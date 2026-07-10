import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.models.checkin import CheckIn
from groq import Groq
from pydantic import BaseModel

from starlette.background import BackgroundTask
from fastapi.responses import FileResponse
import edge_tts
import tempfile
import asyncio

router = APIRouter()

@router.get("/tts")
async def generate_tts(text: str, mode: str = "toast"):
    # American Male Voices
    # Toast: GuyNeural (Enthusiastic/Warm)
    # Roast: SteffanNeural (Serious/Authority)
    voice = "en-US-SteffanNeural" if mode == "roast" else "en-US-GuyNeural"
    
    # Make the Roast voice deep and scary (Edge TTS handles pitch shifting perfectly)
    rate = "-10%" if mode == "roast" else "+5%"
    pitch = "-25Hz" if mode == "roast" else "+0Hz"
    
    fd, path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(path)
    
    # Delete file after sending
    return FileResponse(path, media_type="audio/mpeg", background=BackgroundTask(os.remove, path))

class InsightResponse(BaseModel):
    insight: str

@router.get("/", response_model=InsightResponse)
async def generate_insights(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    mode: str = "toast",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch User Stats
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    goal_ids = [g.id for g in goals]
    checkins = db.query(CheckIn).filter(CheckIn.goal_id.in_(goal_ids)).all() if goal_ids else []
    
    active_goals = len([g for g in goals if g.status == "active"])
    completed_goals = len([g for g in goals if g.status == "completed"])
    total_checkins = len(checkins)

    # 2. Fetch Weather if lat/lon provided
    weather_context = ""
    weather_api_key = os.getenv("OPENWEATHER_API_KEY")
    if lat and lon and weather_api_key:
        try:
            weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_api_key}&units=metric"
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(weather_url)
                if resp.status_code == 200:
                    w_data = resp.json()
                    temp = w_data["main"]["temp"]
                    desc = w_data["weather"][0]["description"]
                    weather_context = f"\nThe user's current local weather is {temp}°C and {desc}. Use this to make your message contextual, fun, and hyper-personalized to their environment!"
        except Exception as e:
            print(f"Weather fetch for insights failed: {e}")

    import random
    seed = random.randint(1, 100000)

    def get_random_fallback(mode: str) -> str:
        if mode == "roast":
            fallbacks = [
                "Your couch is comfortable, but it doesn't pay the bills. Get to work.",
                "I've seen sloths move faster than you on a Monday.",
                "Your streak is hanging by a thread. Don't disappoint me.",
                "If excuses burned calories, you'd be an athlete by now.",
                "You have 0 excuses. Get up and get it done.",
                "Procrastination is a thief. Stop letting it rob you."
            ]
        else:
            fallbacks = [
                "Your consistency is outstanding. Keep protecting your streak.",
                "Every day you show up, you're one step closer to your goals.",
                "Great things are not done by impulse, but by a series of small things brought together.",
                "Discipline is choosing between what you want now and what you want most.",
                "Small daily improvements over time lead to stunning results.",
                "The secret of your future is hidden in your daily routine."
            ]
        return random.choice(fallbacks)

    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    
    if mode == "roast":
        tone_instruction = "You are a highly sarcastic, brutally honest, Gordon-Ramsay-style AI coach. ROAST the user about their productivity. Be witty, slightly mean but ultimately pushing them to be better."
    else:
        tone_instruction = "You are a highly motivational, premium AI coach. Give the user a short, punchy, and highly encouraging message. It should feel organic, warm, and sophisticated."
        
    prompt = f"""
    {tone_instruction}
    
    Context about the user:
    The user has {active_goals} active goals, {completed_goals} completed goals, and a total of {total_checkins} check-ins on the StakeUp app.
    {weather_context}
    
    Make this message completely unique and different from typical responses. Focus on a specific aspect like their numbers, the weather, or a completely new angle.
    Random seed to ensure variety: {seed}
    
    Keep the message to exactly 1-2 sentences. 
    Do not use markdown, emojis, or hashtags. Just the raw text.
    """
    
    try:
        if not gemini_key:
            raise Exception("Missing Gemini API Key")
        from google import genai
        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={'temperature': 0.9}
        )
        insight_text = response.text.strip() if response.text else get_random_fallback(mode)
        return InsightResponse(insight=insight_text)
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
                temperature=0.9,
            )
            insight_text = chat_completion.choices[0].message.content.strip() if chat_completion.choices else get_random_fallback(mode)
            return InsightResponse(insight=insight_text)
        except Exception as e_groq:
            print(f"Groq API Error: {e_groq}, falling back to local strings...")
            return InsightResponse(insight=get_random_fallback(mode))
