import { motion } from "motion/react";
import { HourlyWeather } from "../types";
import { getWeatherIcon } from "./WeatherIcons";
import { Lang, translations } from "../utils/i18n";

interface HourlyTimelineProps {
  data: HourlyWeather;
  currentLocalTime?: string;
  lang: Lang;
}

export function HourlyTimeline({ data, currentLocalTime, lang }: HourlyTimelineProps) {
  const t = translations[lang];

  // Find the index of the hour closest to the current local time
  let startIndex = 0;
  if (currentLocalTime) {
    const currentDate = new Date(currentLocalTime);
    let minDiff = Infinity;
    for (let i = 0; i < data.time.length; i++) {
      const hourlyDate = new Date(data.time[i]);
      const diff = Math.abs(hourlyDate.getTime() - currentDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        startIndex = i;
      }
    }
  }

  // Take next 24 hours of data starting from the current local time
  const next24Hours = data.time.slice(startIndex, startIndex + 24).map((timeStr, offset) => {
    const index = startIndex + offset;
    const time = new Date(timeStr);
    const temp = data.temperature_2m[index];
    const code = data.weather_code[index];

    // Format hours: e.g. "14:00"
    const formattedHour = time.toLocaleTimeString(lang === "fi" ? "fi-FI" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isCurrent = offset === 0;

    return {
      formattedHour,
      temp,
      code,
      isCurrent,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-between"
      id="hourly-timeline-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          {lang === "fi" ? "Tuntiennuste (24h)" : "Hourly Forecast (24h)"}
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">
          {lang === "fi" ? "Pyyhkäise sivulle" : "Swipe to scroll"}
        </span>
      </div>

      {/* Horizontal scroll timeline */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent scroll-smooth snap-x">
        {next24Hours.map((hour, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-between py-3.5 px-3.5 rounded-2xl border snap-start min-w-18 transition duration-300 select-none ${
              hour.isCurrent
                ? "bg-sky-500/15 border-sky-500/40 text-sky-400 font-bold scale-105 shadow-md"
                : "bg-slate-800/30 border-slate-800/80 text-slate-300 hover:border-slate-700/60 hover:bg-slate-800/60"
            }`}
            id={`hourly-col-${index}`}
          >
            <span className="text-[11px] font-mono mb-1 text-slate-400">
              {hour.isCurrent ? t.now : hour.formattedHour}
            </span>
            <div className="w-10 h-10 my-1 flex items-center justify-center">
              {getWeatherIcon(hour.code, true, 32)}
            </div>
            <span className="text-sm font-extrabold font-mono mt-1 text-slate-100">
              {hour.temp.toFixed(0)}°
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
