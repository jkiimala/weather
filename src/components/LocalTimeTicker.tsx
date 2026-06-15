import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Lang } from "../utils/i18n";

interface LocalTimeTickerProps {
  timezone?: string;
  fallbackTime: string; // ISO string like "2026-06-14T22:00"
  lang: Lang;
}

export function LocalTimeTicker({ timezone, fallbackTime, lang }: LocalTimeTickerProps) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      try {
        if (timezone) {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat(lang === "fi" ? "fi-FI" : "en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          setTimeStr(formatter.format(now));
        } else {
          // Fallback parsing of static forecast step
          const parts = fallbackTime.split("T");
          if (parts.length >= 2) {
            setTimeStr(parts[1].substring(0, 5));
          } else {
            setTimeStr("--:--");
          }
        }
      } catch (e) {
        // Fallback if formatting fails or timezone is invalid
        const parts = fallbackTime.split("T");
        if (parts.length >= 2) {
          setTimeStr(parts[1].substring(0, 5));
        } else {
          setTimeStr("--:--");
        }
      }
    };

    updateClock();

    // Tick every 5 seconds to keep the displayed minutes accurate and fresh
    const interval = setInterval(updateClock, 5000);
    return () => clearInterval(interval);
  }, [timezone, fallbackTime, lang]);

  return (
    <div 
      className="mt-3.5 bg-slate-900/60 hover:bg-slate-900/80 border border-slate-800/80 px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg select-none transition-all duration-300"
      id="local-time-badge"
    >
      <Clock className="w-3.5 h-3.5 text-sky-455 animate-pulse" />
      <span className="text-xs font-semibold font-sans text-slate-400 tracking-wide">
        {lang === "fi" ? "Aika" : "Time"}
      </span>
      <span className="text-xs font-black font-mono text-slate-100 tracking-wider">
        {timeStr}
      </span>
    </div>
  );
}
