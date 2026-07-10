"use client";

import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Loader2, MapPin } from "lucide-react";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

export function WeatherWidget() {
  const { lat, lon, loading: geoLoading, error: geoError } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat && lon) {
      const fetchWeather = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/weather?lat=${lat}&lon=${lon}`);
          setWeather(res.data);
        } catch (err) {
          setError("Failed to fetch weather");
        } finally {
          setLoading(false);
        }
      };
      fetchWeather();
    }
  }, [lat, lon]);

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes("01")) return <Sun className="w-10 h-10 text-yellow-500" />;
    if (iconCode.includes("09") || iconCode.includes("10")) return <CloudRain className="w-10 h-10 text-blue-400" />;
    if (iconCode.includes("11")) return <CloudLightning className="w-10 h-10 text-yellow-600" />;
    if (iconCode.includes("13")) return <CloudSnow className="w-10 h-10 text-sky-200" />;
    return <Cloud className="w-10 h-10 text-gray-400" />;
  };

  if (geoError || error) return null; // Fail silently to not clutter dashboard

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between h-full border border-black/5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-[30px] pointer-events-none"></div>

      <div className="flex justify-between items-start z-10 relative">
        <div className="flex items-center gap-1 text-[#1a1a1a]/40 text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>{weather?.city || "Locating..."}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 z-10 relative">
        {geoLoading || loading ? (
          <div className="flex items-center gap-2 text-[#1a1a1a]/40">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Fetching skies...</span>
          </div>
        ) : weather ? (
          <>
            <div className="shrink-0 drop-shadow-sm">
              {getWeatherIcon(weather.icon)}
            </div>
            <div>
              <div className="text-3xl font-bold text-[#1a1a1a] tracking-tighter">
                {Math.round(weather.temp)}°
              </div>
              <div className="text-sm font-medium text-[#1a1a1a]/60 capitalize">
                {weather.description}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
