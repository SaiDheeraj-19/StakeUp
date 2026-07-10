from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, goals, checkins, leaderboard, admin, analytics, insights, events, research, weather, proofiq, wallet, battles

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(goals.router, prefix=f"{settings.API_V1_STR}/goals", tags=["goals"])
app.include_router(checkins.router, prefix=f"{settings.API_V1_STR}/check-ins", tags=["check-ins"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(leaderboard.router, prefix=f"{settings.API_V1_STR}/leaderboard", tags=["leaderboard"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(insights.router, prefix=f"{settings.API_V1_STR}/insights", tags=["insights"])
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(research.router, prefix=f"{settings.API_V1_STR}/research", tags=["research"])
app.include_router(weather.router, prefix=f"{settings.API_V1_STR}/weather", tags=["weather"])
app.include_router(proofiq.router, prefix=f"{settings.API_V1_STR}/proofiq", tags=["proofiq"])
app.include_router(wallet.router, prefix=f"{settings.API_V1_STR}/wallet", tags=["wallet"])
app.include_router(battles.router, prefix=f"{settings.API_V1_STR}/battles", tags=["battles"])

@app.get("/health-check")
def health_check():
    return {"status": "ok"}
