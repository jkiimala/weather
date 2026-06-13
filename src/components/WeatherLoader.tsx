import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Activity, Cpu } from "lucide-react";
import { Lang, translations } from "../utils/i18n";

interface WeatherLoaderProps {
  onComplete: () => void;
  isDataReady: boolean;
  lang: Lang;
  key?: string;
}

export function WeatherLoader({ onComplete, isDataReady, lang }: WeatherLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [weatherIconIndex, setWeatherIconIndex] = useState(0);

  const t = translations[lang];

  const loadingSteps = [
    { p: 12, label: t.preloaderStep0 },
    { p: 35, label: t.preloaderStep1 },
    { p: 58, label: t.preloaderStep2 },
    { p: 76, label: t.preloaderStep3 },
    { p: 92, label: t.preloaderStep4 },
    { p: 100, label: t.preloaderStep5 },
  ];

  // Cycle weather icons during load
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setWeatherIconIndex((prev) => (prev + 1) % 5);
    }, 400);
    return () => clearInterval(iconInterval);
  }, []);

  // Update progress smoothly
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2200; // 2.2 seconds minimum beautiful loading time

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const calcProgress = Math.min((elapsed / duration) * 100, 95); // hold at 95 until real data is ready

      if (calcProgress < 95) {
        setProgress(calcProgress);
        // Find current step label
        const matchStepIdx = loadingSteps.findIndex((s, idx) => {
          const nextStep = loadingSteps[idx + 1];
          return calcProgress >= s.p && (!nextStep || calcProgress < nextStep.p);
        });
        if (matchStepIdx !== -1) {
          setCurrentStepIndex(matchStepIdx);
        }
        requestAnimationFrame(step);
      } else {
        // We are at 95%, waiting for real API data to compile or finish if not already
        if (isDataReady) {
          // Finalize progress to 100%
          let finalStart: number | null = null;
          const finalizeStep = (finalTimestamp: number) => {
            if (!finalStart) finalStart = finalTimestamp;
            const finalElapsed = finalTimestamp - finalStart;
            const finalDuration = 400; // Quick final zip to 100%
            const finalCalc = 95 + (finalElapsed / finalDuration) * 5;

            if (finalCalc < 100) {
              setProgress(finalCalc);
              setCurrentStepIndex(loadingSteps.length - 1); // "Säätiedot ladattu onnistuneesti"
              requestAnimationFrame(finalizeStep);
            } else {
              setProgress(100);
              // Clean transition finish
              const timeOutVal = setTimeout(() => {
                onComplete();
              }, 300);
              return () => clearTimeout(timeOutVal);
            }
          };
          requestAnimationFrame(finalizeStep);
        } else {
          // Stay at 95% searching
          setProgress(95);
          requestAnimationFrame(step);
        }
      }
    };

    requestAnimationFrame(step);
  }, [isDataReady, onComplete]);

  // Icons array to cycle through
  const iconList = [
    <Sun key="sun" className="w-16 h-16 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />,
    <Cloud key="cloud" className="w-16 h-16 text-slate-300 animate-bounce" style={{ animationDuration: "3s" }} />,
    <CloudRain key="rain" className="w-16 h-16 text-sky-400" />,
    <CloudSnow key="snow" className="w-16 h-16 text-cyan-200 animate-pulse" />,
    <CloudLightning key="storm" className="w-16 h-16 text-violet-400" />,
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 select-none"
      id="weather-preloader-root"
    >
      {/* Dynamic starfield atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="flex flex-col items-center max-w-md w-full text-center space-y-8 z-10" id="loader-content-container">
        {/* Animated Radar/Satellite scanning visualizer */}
        <div className="relative flex items-center justify-center w-36 h-36" id="radar-visualizer">
          {/* Outer scanning circle */}
          <motion.div
            className="absolute inset-0 rounded-full border border-sky-500/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-28 h-28 rounded-full border border-indigo-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-4 rounded-full bg-slate-900/90 border border-slate-800/80 shadow-inner flex items-center justify-center">
            {/* Animated weather cycle */}
            <AnimatePresence mode="wait">
              <motion.div
                key={weatherIconIndex}
                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.4, rotate: 20 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center"
              >
                {iconList[weatherIconIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Brand Header */}
        <div className="space-y-1">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-linear-to-r from-sky-450 via-indigo-300 to-sky-300 uppercase font-sans"
            id="loader-brand-title"
          >
            {t.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] text-slate-500 font-mono tracking-widest uppercase"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Outer glowing progress metrics */}
        <div className="w-full space-y-4" id="loader-progress-box">
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              {t.statusLabel}
            </span>
            <span className="text-sky-400 font-extrabold text-sm">{Math.round(progress)}%</span>
          </div>

          {/* Precise loading bar */}
          <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 relative">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-sky-500 via-indigo-500 to-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", damping: 25, stiffness: 80 }}
            />
          </div>

          {/* Cycling Status Text Label */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStepIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-medium text-slate-300 font-sans tracking-wide col-span-1"
                id="loader-status-text"
              >
                {loadingSteps[currentStepIndex]?.label || "Loading..."}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* System parameters decoder simulation */}
        <div className="pt-2 border-t border-slate-900 w-full flex items-center justify-between text-[9px] text-slate-600 font-mono tracking-wider">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-600" />
            HTTP_INIT_STREAMS
          </span>
          <span>LAT_LON_OK</span>
          <span>SSL_SECURE_API</span>
        </div>
      </div>
    </motion.div>
  );
}
