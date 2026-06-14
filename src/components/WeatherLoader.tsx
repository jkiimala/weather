import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Activity, Cpu } from "lucide-react";
import { Lang, translations } from "../utils/i18n";

interface WeatherLoaderProps {
  onComplete: () => void;
  isDataReady: boolean;
  lang: Lang;
  key?: string;
}

export function WeatherLoader({ onComplete, isDataReady, lang }: WeatherLoaderProps) {
  // Pidetään tilassa vain se, mikä EI muutu joka millisekunti
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [weatherIconIndex, setWeatherIconIndex] = useState(0);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  const t = translations[lang];

  const loadingSteps = [
    { p: 12, label: t.preloaderStep0 },
    { p: 35, label: t.preloaderStep1 },
    { p: 58, label: t.preloaderStep2 },
    { p: 76, label: t.preloaderStep3 },
    { p: 92, label: t.preloaderStep4 },
    { p: 100, label: t.preloaderStep5 },
  ];

  // Luodaan tehokas MotionValue prosentille (0 -> 100)
  const progressMotion = useMotionValue(0);
  
  // Muutetaan numero merkkijonoksi leveyttä (%) ja tekstiksi varten ilman re-renderöintiä
  const widthString = useTransform(progressMotion, (latest) => `${latest}%`);
  const roundedProgress = useTransform(progressMotion, (latest) => `${Math.round(latest)}%`);

  const iconList = [
    <Sun key="sun" className="w-16 h-16 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />,
    <Cloud key="cloud" className="w-16 h-16 text-slate-300 animate-bounce" style={{ animationDuration: "3s" }} />,
    <CloudRain key="rain" className="w-16 h-16 text-sky-400" />,
    <CloudSnow key="snow" className="w-16 h-16 text-cyan-200 animate-pulse" />,
    <CloudLightning key="storm" className="w-16 h-16 text-violet-400" />,
  ];

  // 1. Sääikonien sykli (hidastettu 500ms, jotta säästää tehoja)
  useEffect(() => {
    const iconInterval = setInterval(() => {
      setWeatherIconIndex((prev) => (prev + 1) % iconList.length);
    }, 500);
    return () => clearInterval(iconInterval);
  }, [iconList.length]);

  // 2. Erittäin sulava animaatio Framer Motionin omalla optimoidulla animointitoiminnolla
  useEffect(() => {
    const controls = animate(progressMotion, 100, {
      duration: 2.2,
      ease: "linear",
      onUpdate: (latest) => {
        // Päivitetään tekstivaihe vain silloin, kun kynnys ylittyy (harvoin)
        const matchStepIdx = loadingSteps.findIndex((s, idx) => {
          const nextStep = loadingSteps[idx + 1];
          return latest >= s.p && (!nextStep || latest < nextStep.p);
        });
        if (matchStepIdx !== -1) {
          setCurrentStepIndex(matchStepIdx);
        }
      },
      onComplete: () => {
        setIsAnimationDone(true);
      }
    });

    return () => controls.stop();
  }, []);

  // 3. Odotetaan animaation valmistumista JA API-dataa
  useEffect(() => {
    if (isAnimationDone && isDataReady) {
      const timeOutVal = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timeOutVal);
    }
  }, [isAnimationDone, isDataReady, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 select-none"
      id="weather-preloader-root"
    >
      {/* Taustaefektit */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="flex flex-col items-center max-w-md w-full text-center space-y-8 z-10" id="loader-content-container">
        {/* Radar / ympyräkuvio */}
        <div className="relative flex items-center justify-center w-36 h-36" id="radar-visualizer">
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

        {/* Otsikot */}
        <div className="space-y-1">
          <h2 
            style={{ backgroundImage: "linear-gradient(to right, #38bdf8, #818cf8, #7dd3fc)" }}
            className="text-2xl font-black tracking-widest text-transparent bg-clip-text uppercase font-sans"
            id="loader-brand-title"
          >
            {t.title}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            {t.subtitle}
          </p>
        </div>

        {/* Edistymisosion palkit */}
        <div className="w-full space-y-4" id="loader-progress-box">
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              {t.statusLabel}
            </span>
            {/* Sulava prosenttiluku motion.spanin avulla ilman re-renderöintiä */}
            <motion.span className="text-sky-400 font-extrabold text-sm">
              {roundedProgress}
            </motion.span>
          </div>

          {/* SULAVA LATAUSPALKKI (Käyttää motion-arvoja suoraan DOM:iin) */}
          <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 relative">
            <motion.div
              className="h-full rounded-full shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              style={{ 
                width: widthString,
                backgroundImage: "linear-gradient(to right, #3b82f6, #6366f1, #38bdf8)" 
              }}
            />
          </div>

          {/* Tekstitila */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStepIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-medium text-slate-300 font-sans tracking-wide"
                id="loader-status-text"
              >
                {loadingSteps[currentStepIndex]?.label || "Loading..."}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Alatunniste */}
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
