import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface WeatherAnimationBackgroundProps {
  code: number;
  isDay: boolean;
}

export function WeatherAnimationBackground({ code, isDay }: WeatherAnimationBackgroundProps) {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; duration: number; size: number }[]>([]);

  // Generate randomized particle spec once on mount / code change to keep it stable and avoid hydration mismatch
  useEffect(() => {
    const pArray = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      delay: Math.random() * 4,  // seconds
      duration: 1 + Math.random() * 1.5, // seconds for falling / drifting
      size: 1 + Math.random() * 3, // pixels
    }));
    setParticles(pArray);
  }, [code]);

  // Determine weather type grouping
  const isSunny = code === 0;
  const isPartlyCloudy = code === 1 || code === 2;
  const isCloudy = code === 3;
  const isFog = code === 45 || code === 48;
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 56, 57, 66, 67].includes(code);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(code);
  const isStorm = [95, 96, 99].includes(code);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none" id="weather-ambient-fx-root">
      {/* Dynamic Keyframes injected safely to avoid HMR / Tailwind purge issues and ensure flawless hardware acceleration */}
      <style>{`
        @keyframes fx-rain-fall {
          0% {
            transform: translateY(-50px) translateX(0px) rotate(15deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(320px) translateX(80px) rotate(15deg);
            opacity: 0;
          }
        }

        @keyframes fx-snow-drift {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          50% {
            transform: translateY(150px) translateX(20px) rotate(180deg);
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(320px) translateX(-10px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fx-lightning-flash {
          0%, 94%, 100% {
            background-color: rgba(255, 255, 255, 0);
          }
          95% {
            background-color: rgba(255, 255, 255, 0.28);
          }
          96% {
            background-color: rgba(255, 255, 255, 0.05);
          }
          97% {
            background-color: rgba(255, 255, 255, 0.35);
          }
          98% {
            background-color: rgba(255, 255, 255, 0);
          }
        }

        @keyframes fx-mist-horizontal {
          0% {
            transform: translateX(-15%);
          }
          50% {
            transform: translateX(15%);
          }
          100% {
            transform: translateX(-15%);
          }
        }

        @keyframes fx-aurora-sweep {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.15;
          }
          50% {
            transform: rotate(180deg) scale(1.15);
            opacity: 0.35;
          }
        }

        @keyframes fx-solar-sparkle {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) scale(1.4);
            opacity: 0.6;
          }
        }
      `}</style>

      {/* ----------------- SUNNY / CLEAR ----------------- */}
      {isSunny && (
        <div className="absolute inset-0" id="fx-sunny-container">
          {/* Subtle rotating glow core in back */}
          <motion.div
            className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Solar sparkles floating slowly */}
          {particles.slice(0, 10).map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-amber-300/30"
              style={{
                left: `${p.left}%`,
                top: `${40 + (p.left % 50)}%`,
                width: `${p.size + 2}px`,
                height: `${p.size + 2}px`,
                animation: `fx-solar-sparkle ${p.duration * 4}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                filter: "blur(0.5px)",
              }}
            />
          ))}
          {/* Sunbeams sweeping across the scene */}
          <div 
            className="absolute top-0 right-0 w-100 h-100 origin-top-right opacity-[0.06] bg-conic-grad from-transparent via-amber-300 to-transparent blur-md"
            style={{
              animation: "fx-aurora-sweep 18s linear infinite",
            }}
          />
        </div>
      )}

      {/* ----------------- PARTLY CLOUDY ----------------- */}
      {isPartlyCloudy && (
        <div className="absolute inset-0" id="fx-partlycloudy-container">
          {/* Background cloud particles crawling */}
          <motion.div
            className="absolute top-8 left-0 w-36 h-14 bg-sky-200/5 rounded-full blur-xl"
            animate={{ x: [-80, 480] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-12 right-0 w-48 h-16 bg-slate-300/5 rounded-full blur-2xl"
            animate={{ x: [80, -480] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          />
          {/* Little wind vectors sliding by */}
          {particles.slice(0, 4).map((p) => (
            <motion.div
              key={p.id}
              className="absolute h-1px bg-slate-100/15"
              style={{
                left: `${p.left}%`,
                top: `${20 + p.id * 18}%`,
                width: `${40 + p.size * 12}px`,
              }}
              animate={{ x: [-150, 400], opacity: [0, 0.4, 0.4, 0] }}
              transition={{
                duration: p.duration * 3,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* ----------------- CLOUDY / OVERCAST ----------------- */}
      {isCloudy && (
        <div className="absolute inset-0" id="fx-cloudy-container">
          {/* Overlapping horizontal cloud masses for realistic look */}
          <motion.div
            className="absolute inset-x-0 top-0 h-28 bg-slate-500/10 rounded-full blur-3xl"
            animate={{ scaleY: [1, 1.15, 1], y: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-4 h-24 bg-slate-700/5 rounded-full blur-3xl"
            animate={{ scaleY: [1, 1.1, 1], y: [0, -10, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Slow drift */}
          <div
            className="absolute inset-0 opacity-[0.04] bg-radial-grad from-slate-200 to-transparent blur-xl"
            style={{
              animation: "fx-mist-horizontal 20s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* ----------------- FOG ----------------- */}
      {isFog && (
        <div className="absolute inset-0" id="fx-fog-container">
          {/* Volumetric horizontal mist bars cross-drifting */}
          <div
            className="absolute inset-x-0 top-1/4 h-8 bg-zinc-200/10 blur-md"
            style={{
              animation: "fx-mist-horizontal 12s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-1/4 h-12 bg-zinc-300/8 blur-xl"
            style={{
              animation: "fx-mist-horizontal 16s ease-in-out infinite",
              animationDelay: "1.5s",
            }}
          />
          <div
            className="absolute inset-x-0 top-2/3 h-10 bg-slate-400/8 blur-lg"
            style={{
              animation: "fx-mist-horizontal 10s ease-in-out infinite",
              animationDelay: "-2s",
            }}
          />
        </div>
      )}

      {/* ----------------- RAIN / DRIZZLE ----------------- */}
      {isRain && (
        <div className="absolute inset-0" id="fx-rain-container">
          {/* 20 synchronized fast-falling physical drops */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-[1.5px] rounded-full bg-sky-400/35"
              style={{
                left: `${p.left}%`,
                top: `-50px`,
                height: `${15 + p.size * 6}px`,
                animation: `fx-rain-fall ${p.duration * 0.8}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
          {/* Ambient blue overlay hum */}
          <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay" />
        </div>
      )}

      {/* ----------------- SNOW ----------------- */}
      {isSnow && (
        <div className="absolute inset-0" id="fx-snow-container">
          {/* Gentle, swaying and floating snowflakes */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white/60"
              style={{
                left: `${p.left}%`,
                top: `-20px`,
                width: `${p.size + 1.5}px`,
                height: `${p.size + 1.5}px`,
                animation: `fx-snow-drift ${p.duration * 3 + 1.5}s linear infinite`,
                animationDelay: `${p.delay}s`,
                filter: "blur(0.3px)",
              }}
            />
          ))}
        </div>
      )}

      {/* ----------------- STORM / THUNDERSTORM ----------------- */}
      {isStorm && (
        <div className="absolute inset-0" id="fx-storm-container">
          {/* Intense lightning simulation flickering the card background */}
          <div
            className="absolute inset-0 mix-blend-color-dodge pointer-events-none"
            style={{
              animation: "fx-lightning-flash 6.5s ease-in-out infinite",
              animationDelay: "1s",
            }}
          />

          {/* Heavy slanted storm rain */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-[1.8px] rounded-full bg-indigo-300/40"
              style={{
                left: `${p.left}%`,
                top: `-50px`,
                height: `${20 + p.size * 8}px`,
                animation: `fx-rain-fall ${p.duration * 0.6}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}

          {/* Extra brooding storm cloud shadow */}
          <motion.div
            className="absolute inset-0 bg-slate-950/20"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  );
}
