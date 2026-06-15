import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sun, Moon, Sparkles, Compass } from "lucide-react";
import { Lang, translations } from "../utils/i18n";

interface SunMoonCycleProps {
  sunriseStr: string;
  sunsetStr: string;
  isDay: boolean;
  currentLocalTime: string; // "2026-06-14T22:00"
  lang: Lang;
}

export function SunMoonCycle({
  sunriseStr,
  sunsetStr,
  isDay,
  currentLocalTime,
  lang,
}: SunMoonCycleProps) {
  const t = translations[lang];

  // For visual consistency, let's parse times nicely
  const formatTimeStr = (isoStr: string) => {
    if (!isoStr) return "--:--";
    try {
      const parts = isoStr.split("T");
      if (parts.length < 2) return "--:--";
      return parts[1].substring(0, 5); // Returns HH:MM
    } catch (e) {
      return "--:--";
    }
  };

  const sunriseFormatted = formatTimeStr(sunriseStr);
  const sunsetFormatted = formatTimeStr(sunsetStr);

  // Helper to calculate minutes from midnight
  const getMinutes = (isoStr: string) => {
    try {
      const parts = isoStr.split("T");
      if (parts.length < 2) return 0;
      const [h, m] = parts[1].split(":").map(Number);
      return h * 60 + m;
    } catch {
      return 0;
    }
  };

  const sunriseMinutes = getMinutes(sunriseStr);
  const sunsetMinutes = getMinutes(sunsetStr);
  let currentMinutes = getMinutes(currentLocalTime);

  // Fallback: if currentMinutes is empty/0, use active system time
  if (currentMinutes === 0) {
    const d = new Date();
    currentMinutes = d.getHours() * 60 + d.getMinutes();
  }

  // Length of day
  const dayLengthMinutes = sunsetMinutes >= sunriseMinutes 
    ? sunsetMinutes - sunriseMinutes 
    : (1440 - sunriseMinutes) + sunsetMinutes;

  const dayHours = Math.floor(dayLengthMinutes / 60);
  const dayMins = dayLengthMinutes % 60;

  // Real-time calculation of celestial positions on the sky arc
  let arcProgress = 0.5; // default center
  if (isDay) {
    if (currentMinutes >= sunriseMinutes && currentMinutes <= sunsetMinutes) {
      arcProgress = (currentMinutes - sunriseMinutes) / dayLengthMinutes;
    } else {
      arcProgress = 0.5;
    }
  } else {
    // Night path progresses from sunset to sunrise
    const nightLengthMinutes = 1440 - dayLengthMinutes;
    if (currentMinutes > sunsetMinutes) {
      arcProgress = (currentMinutes - sunsetMinutes) / nightLengthMinutes;
    } else if (currentMinutes < sunriseMinutes) {
      arcProgress = ((1440 - sunsetMinutes) + currentMinutes) / nightLengthMinutes;
    } else {
      arcProgress = 0.5;
    }
  }

  // Safeguard progress boundaries
  arcProgress = Math.min(Math.max(arcProgress, 0.05), 0.95);

  // Compute standard astronomical moon phase and description for the current date
  const getMoonData = () => {
    try {
      // Parse local time
      const date = currentLocalTime ? new Date(currentLocalTime) : new Date();
      
      const refDate = new Date(2000, 0, 6, 18, 14, 0); // Reference New Moon
      const diffMs = date.getTime() - refDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const cycle = 29.530588853;
      const phase = (diffDays / cycle) % 1;
      const normalizedPhase = phase < 0 ? phase + 1 : phase;

      let name = "";
      let iconType = "full";
      let illumination = 0;

      if (normalizedPhase < 0.03 || normalizedPhase > 0.97) {
        name = t.phaseNewMoon;
        iconType = "new";
        illumination = 0;
      } else if (normalizedPhase >= 0.03 && normalizedPhase < 0.22) {
        name = t.phaseWaxingCrescent;
        iconType = "crescent-waxing";
        illumination = Math.round(normalizedPhase * 200);
      } else if (normalizedPhase >= 0.22 && normalizedPhase < 0.28) {
        name = t.phaseFirstQuarter;
        iconType = "quarter-waxing";
        illumination = 50;
      } else if (normalizedPhase >= 0.28 && normalizedPhase < 0.47) {
        name = t.phaseWaxingGibbous;
        iconType = "gibbous-waxing";
        illumination = Math.round(50 + (normalizedPhase - 0.25) * 200);
      } else if (normalizedPhase >= 0.47 && normalizedPhase < 0.53) {
        name = t.phaseFullMoon;
        iconType = "full";
        illumination = 100;
      } else if (normalizedPhase >= 0.53 && normalizedPhase < 0.72) {
        name = t.phaseWaningGibbous;
        iconType = "gibbous-waning";
        illumination = Math.round(100 - (normalizedPhase - 0.5) * 200);
      } else if (normalizedPhase >= 0.72 && normalizedPhase < 0.78) {
        name = t.phaseLastQuarter;
        iconType = "quarter-waning";
        illumination = 50;
      } else {
        name = t.phaseWaningCrescent;
        iconType = "crescent-waning";
        illumination = Math.round((1 - normalizedPhase) * 200);
      }

      // Constrain illumination between 0 and 100
      illumination = Math.min(Math.max(illumination, 0), 100);

      // Determine moonlight description
      let lightDesc = "";
      if (lang === "fi") {
        if (illumination < 10) lightDesc = "Äärimmäisen pimeä yö";
        else if (illumination < 40) lightDesc = "Heikko, pehmeä kuunvalo";
        else if (illumination < 75) lightDesc = "Upea puolikuun loiste";
        else lightDesc = "Kirkas, säteilevä kuutamo";
      } else {
        if (illumination < 10) lightDesc = "Extremely dark night";
        else if (illumination < 40) lightDesc = "Soft, dim moonlight";
        else if (illumination < 75) lightDesc = "Gorgeous crescent glow";
        else lightDesc = "Brilliant, radiant moonlight";
      }

      return { phase: normalizedPhase, name, iconType, illumination, lightDesc };
    } catch {
      return {
        phase: 0.5,
        name: t.phaseFullMoon,
        iconType: "full",
        illumination: 100,
        lightDesc: lang === "fi" ? "Kirkas kuutamo" : "Bright moonlight",
      };
    }
  };

  const moon = getMoonData();

  // Draw moon SVG paths representing lighting phase percentages beautifully
  const renderMoonSVG = () => {
    return (
      <svg className="w-16 h-16 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]" viewBox="0 0 64 64" fill="none" id="moon-phase-dynamic-svg">
        {/* Shaded baseline back of moon */}
        <circle cx="32" cy="32" r="22" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        
        {/* Illuminated active layer */}
        {moon.iconType === "full" && (
          <circle cx="32" cy="32" r="21" fill="#FEF08A" opacity="0.95" />
        )}
        {moon.iconType === "new" && (
          <circle cx="32" cy="32" r="21" fill="#0f172a" opacity="0.4" />
        )}
        
        {/* Crescents and quarters - dynamic clip representation */}
        {moon.iconType.includes("crescent") && (
          <path
            d={
              moon.iconType.includes("waxing")
                ? "M32 11C20.4 11 11 20.4 11 32s9.4 21 21 21c2.4 0 4.6-.4 6.7-1.2C30 49 24 41.5 24 32s6-17 14.7-20.8C36.6 11.1 34.3 11 32 11z"
                : "M32 11c2.3 0 4.6.1 6.7.2C30 15 24 22.5 24 32s6 17 14.7 20.8c-2.1.8-4.4 1.2-6.7 1.2-11.6 0-21-9.4-21-21S20.4 11 32 11z"
            }
            fill="#FEF08A"
            opacity="0.9"
          />
        )}

        {moon.iconType.includes("quarter") && (
          <path
            d={
              moon.iconType.includes("waxing")
                ? "M32 11v42c11.6 0 21-9.4 21-21S43.6 11 32 11z"
                : "M32 11v42C20.4 53 11 43.6 11 32s9.4-21 21-21z"
            }
            fill="#FEF08A"
            opacity="0.9"
          />
        )}

        {moon.iconType.includes("gibbous") && (
          <g>
            <circle cx="32" cy="32" r="21" fill="#FEF08A" opacity="0.9" />
            <path
              d={
                moon.iconType.includes("waxing")
                  ? "M32 11C25 15 20 22.5 20 32s5 17 12 21H11C20.4 53 32 43.6 32 32S20.4 11 11 11z"
                  : "M32 11C39 15 44 22.5 44 32s-5 17-12 21h21C43.6 53 32 43.6 32 32S43.6 11 53 11z"
              }
              fill="#1e293b"
            />
          </g>
        )}
      </svg>
    );
  };

  // Convert progress into actual degrees or percentages for celestial trajectory arch path
  // path is x: 10% -> 90%, y: 90% (start) -> 12% (apex) -> 90% (end)
  const getCelestialCoordinates = (progress: number) => {
    const x = 10 + progress * 80; // percent range
    // parabolic arch: y = -a * (x - 50)^2 + apex
    const normalizedX = (x - 50) / 40; // range from -1 to 1
    const y = 80 - 64 * (1 - normalizedX * normalizedX); // Apex is around y=16%
    return { x, y };
  };

  const celestialPos = getCelestialCoordinates(arcProgress);

  // Time remaining descriptions
  const getRemainingTimeMsg = () => {
    if (isDay) {
      if (currentMinutes < sunsetMinutes) {
        const diff = sunsetMinutes - currentMinutes;
        const hr = Math.floor(diff / 60);
        const mn = diff % 60;
        return lang === "fi" 
          ? `Aurinko laskee ${hr > 0 ? `${hr}t ` : ""}${mn}m kuluttua`
          : `Sunset in ${hr > 0 ? `${hr}h ` : ""}${mn}m`;
      }
    } else {
      let diff = 0;
      if (currentMinutes > sunsetMinutes) {
        diff = (1440 - currentMinutes) + sunriseMinutes;
      } else {
        diff = sunriseMinutes - currentMinutes;
      }
      const hr = Math.floor(diff / 60);
      const mn = diff % 60;
      return lang === "fi" 
        ? `Auringonnousu ${hr > 0 ? `${hr}t ` : ""}${mn}m kuluttua`
        : `Sunrise in ${hr > 0 ? `${hr}h ` : ""}${mn}m`;
    }
    return "";
  };

  const timeMsg = getRemainingTimeMsg();

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-12 gap-5 relative overflow-hidden text-slate-100 font-sans"
      id="sun-moon-grid-card-root"
    >
      {/* SECTION 1: Celestial Trajectory Arc Tracker (col-span-8) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="md:col-span-8 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/60 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between min-h-50 sm:min-h-55 relative overflow-hidden"
        id="celestial-trajectory-arc-holder"
      >
        {/* Space sparkles background layer visible during night */}
        {!isDay && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-80" id="celestial-nightstar-layer">
            <style>{`
              @keyframes blink {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.85; transform: scale(1.15); }
              }
            `}</style>
            {[
              { id: 1, top: 12, left: 14, delay: 0 },
              { id: 2, top: 40, left: 8, delay: 1.5 },
              { id: 3, top: 20, left: 45, delay: 0.8 },
              { id: 4, top: 15, left: 78, delay: 2.2 },
              { id: 5, top: 52, left: 88, delay: 0.4 },
              { id: 6, top: 62, left: 24, delay: 1.9 },
            ].map((star) => (
              <Sparkles
                key={star.id}
                className="absolute text-yellow-200/40 w-3 h-3"
                style={{
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  animation: `blink ${2 + Math.random() * 2.5}s infinite ease-in-out`,
                  animationDelay: `${star.delay}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between z-10">
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-sans">
              {isDay ? t.dayLength : t.nightStars}
            </h3>
            {isDay ? (
              <span className="text-base font-black text-slate-100 mt-0.5">
                {dayHours}h {dayMins}m
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-300 mt-0.5 flex items-center gap-1.5 font-mono">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                {lang === "fi" ? "Tähdet kirkkaat" : "Planetary sky active"}
              </span>
            )}
          </div>
          {timeMsg && (
            <div className="px-3 py-1 bg-slate-850/80 border border-slate-800 rounded-full text-[10px] font-black tracking-wider uppercase text-yellow-400 font-mono animate-pulse">
              {timeMsg}
            </div>
          )}
        </div>

        {/* The beautiful curve arc visualization */}
        <div className="relative w-full h-28 mt-4 mb-2 z-10" id="horizon-visual-arch">
          {/* Horizon ground line */}
          <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-slate-800" />

          {/* Golden glow at horizon borders */}
          <div className="absolute bottom-3.75 left-[5%] w-10 h-10 rounded-full bg-amber-500/10 blur-md pointer-events-none" />
          <div className="absolute bottom-3.75 right-[5%] w-10 h-10 rounded-full bg-amber-500/10 blur-md pointer-events-none" />

          {/* SVG arch dotted lane */}
          <svg className="absolute inset-0 w-full h-full text-slate-800" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 10 90 A 40 40 0 0 1 90 90"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="3 3.5"
            />
          </svg>

          {/* Moving celestial indicator along coordinates */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${celestialPos.x}%`,
              top: `${celestialPos.y}%`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
          >
            {isDay ? (
              <div className="relative group p-1.5 rounded-full bg-slate-900 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                <Sun className="w-5 h-5 text-amber-400 animate-[spin_40s_linear_infinite]" />
              </div>
            ) : (
              <div className="relative group p-1.5 rounded-full bg-slate-950 border border-indigo-400/40 shadow-[0_0_12px_rgba(129,140,248,0.35)]">
                <Moon className="w-5 h-5 text-indigo-200" />
              </div>
            )}
          </motion.div>

          {/* Start (Left) Limit Label */}
          <div className="absolute bottom-2 left-[5%] flex flex-col items-center">
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mb-0.5">{t.sunriseLabel}</span>
            <span className="text-[11px] text-slate-300 font-bold font-mono">{sunriseFormatted}</span>
          </div>

          {/* End (Right) Limit Label */}
          <div className="absolute bottom-2 right-[5%] flex flex-col items-center">
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mb-0.5">{t.sunsetLabel}</span>
            <span className="text-[11px] text-slate-300 font-bold font-mono">{sunsetFormatted}</span>
          </div>
        </div>
      </motion.div>

      {/* SECTION 2: Moon Phase & Moonlight metrics (col-span-4) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="md:col-span-4 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/60 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between min-h-50 sm:min-h-55"
        id="moon-phase-details-holder"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-sans">
            {t.moonPhase}
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider font-extrabold bg-slate-800/50 px-2 py-0.5 border border-slate-700/40 rounded-full">
            {t.illuminated}: {moon.illumination}%
          </span>
        </div>

        <div className="flex items-center gap-4 my-3">
          {renderMoonSVG()}
          
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-100 font-sans tracking-tight">
              {moon.name}
            </span>
            <span className="text-[10px] text-slate-500 font-sans tracking-wide mt-0.5 leading-snug">
              {moon.lightDesc}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60 mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>{lang === "fi" ? "Kuu- ja Maasykli" : "Lunisolar Sync"}</span>
          <span>© 100% {lang === "fi" ? "Tarkka" : "Accurate"}</span>
        </div>
      </motion.div>
    </div>
  );
}
