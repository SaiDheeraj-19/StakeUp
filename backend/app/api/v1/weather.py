from fastapi import APIRouter, Depends, HTTPException
import httpx
import os
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

class WeatherResponse(BaseModel):
    temp: float
    description: str
    icon: str
    city: str

@router.get("/", response_model=WeatherResponse)
async def get_weather(
    lat: float,
    lon: float,
    current_user: User = Depends(get_current_user),
):
    # Using Open-Meteo for weather (no API key required)
    # Using Nominatim (OpenStreetMap) for reverse geocoding (city name)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Reverse Geocode for City Name
            city_name = "Your Location"
            try:
                geo_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10"
                geo_resp = await client.get(geo_url, headers={"User-Agent": "StakeUp/1.0"})
                if geo_resp.status_code == 200:
                    geo_data = geo_resp.json()
                    address = geo_data.get("address", {})
                    city_name = address.get("city") or address.get("town") or address.get("village") or address.get("county") or "Your Location"
            except Exception as ge:
                print(f"Reverse geocode failed: {ge}")

            # 2. Fetch Weather Data
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
            resp = await client.get(weather_url)
            resp.raise_for_status()
            data = resp.json()
            
            current = data.get("current_weather", {})
            temp = current.get("temperature", 22.5)
            weathercode = current.get("weathercode", 0)
            
            # Map WMO Weather codes to descriptions and simple icon codes
            # 0: Clear sky, 1-3: Cloudy, 45-48: Fog, 51-67: Rain/Drizzle, 71-77: Snow, 95-99: Thunderstorm
            desc = "Clear sky"
            icon = "01d"
            if weathercode in [1, 2, 3]:
                desc = "Cloudy"
                icon = "03d"
            elif weathercode in [45, 48]:
                desc = "Fog"
                icon = "50d"
            elif weathercode >= 51 and weathercode <= 67:
                desc = "Rain"
                icon = "09d"
            elif weathercode >= 71 and weathercode <= 77:
                desc = "Snow"
                icon = "13d"
            elif weathercode >= 95:
                desc = "Thunderstorm"
                icon = "11d"
                
            return {
                "temp": temp,
                "description": desc,
                "icon": icon,
                "city": city_name
            }
    except Exception as e:
        print(f"Weather Fetch Error: {e}")
        return {
            "temp": 22.5,
            "description": "clear sky",
            "icon": "01d",
            "city": "Unknown"
        }
