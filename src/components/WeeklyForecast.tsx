import { motion } from "motion/react";
import { DailyWeather } from "../types";
import { getWeatherIcon } from "./WeatherIcons";
import { Sun } from "lucide-react";
import { Lang, getFinnishWeekday } from "../utils/i18n";

interface WeeklyForecastProps {
  data: DailyWeather;
  lang: Lang;
}

export function WeeklyForecast({ data, lang }: WeeklyForecastProps) {
  const getUvLevel = (uv: number) => {
    if (uv <= 2) return { label: lang === "fi" ? "Kevyt" : "Low", color: "text-emerald-400" };
    if (uv <= 5) return { label: lang === "fi" ? "Kohtalainen" : "Moderate", color: "text-amber-400" };
    if (uv <= 7) return { label: lang === "fi" ? "Voimakas" : "High", color: "text-orange-400" };
    return { label: lang === "fi" ? "Erittäin voimakas" : "Very high", color: "text-rose-500" };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl flex flex-col h-full"
      id="weekly-forecast-card"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          {lang === "fi" ? "7 Päivän Ennuste" : "7-Day Forecast"}
        </h3>
        <span className="text-[10px] text-slate-500 font-mono font-medium">
          {lang === "fi" ? "Viikko" : "Week"}
        </span>
      </div>

      <div className="divide-y divide-slate-800/50 space-y-1.5 flex-1 flex flex-col justify-between">
        {data.time.map((dayStr, index) => {
          const maxTemp = data.temperature_2m_max[index];
          const minTemp = data.temperature_2m_min[index];
          const code = data.weather_code[index];
          const uv = data.uv_index_max[index];

          return (
            <div
              key={dayStr}
              className="flex items-center justify-between py-2 first:pt-0 last:pb-0 font-sans hover:bg-slate-800/20 px-2 -mx-2 rounded-xl transition-all"
              id={`forecast-row-${index}`}
            >
              {/* Day Name */}
              <div className="w-20 sm:w-24 leading-tight">
                <div className="text-sm font-semibold text-slate-200 truncate">
                  {getFinnishWeekday(dayStr, index, lang)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(dayStr).toLocaleDateString(lang === "fi" ? "fi-FI" : "en-US", {
                    day: "numeric",
                    month: "numeric",
                  })}
                </div>
              </div>

              {/* Weather icon & UV index */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                  {getWeatherIcon(code, true, 30)}
                </div>
                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/40 border border-slate-700/30 text-[9px] text-slate-400 font-mono" title={getUvLevel(uv).label}>
                  <Sun className="w-2.5 h-2.5 text-amber-500" />
                  <span>UV {uv.toFixed(0)}</span>
                </div>
              </div>

              {/* Min - Max Temperature bars / representation */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 w-24 sm:w-28 text-right shrink-0">
                <span className="text-xs text-slate-500 font-mono">
                  {minTemp.toFixed(0)}°
                </span>
                
                {/* Micro temperature bar chart visualizer */}
                <div className="relative w-8 sm:w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="absolute left-1/4 right-1/4 h-full bg-linear-to-r from-sky-400 to-amber-400 rounded-full" />
                </div>

                <span className="text-sm font-bold text-slate-200 font-mono">
                  {maxTemp.toFixed(0)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
