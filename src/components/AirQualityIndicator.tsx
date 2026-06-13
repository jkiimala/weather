import { motion } from "motion/react";
import { AirQuality } from "../types";
import { ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { Lang, translations } from "../utils/i18n";

interface AirQualityIndicatorProps {
  data: AirQuality;
  lang: Lang;
}

export function AirQualityIndicator({ data, lang }: AirQualityIndicatorProps) {
  const { european_aqi, pm10, pm2_5 } = data;
  const t = translations[lang];

  // Determine AQI level info
  // European AQI usually ranges 0 to 100+ using EEA/CAQI scales
  const getAqiInfo = (aqi: number) => {
    if (aqi <= 20) {
      return {
        label: t.goodAqi,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        barColor: "bg-emerald-400",
        desc: t.goodAqiDesc,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" id="aqi-good-icon" />,
      };
    } else if (aqi <= 40) {
      return {
        label: t.fairAqi,
        color: "text-lime-400 bg-lime-500/10 border-lime-500/20",
        barColor: "bg-lime-450",
        desc: t.fairAqiDesc,
        icon: <CheckCircle2 className="w-5 h-5 text-lime-400" id="aqi-fair-icon" />,
      };
    } else if (aqi <= 60) {
      return {
        label: t.moderateAqi,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        barColor: "bg-amber-400",
        desc: t.moderateAqiDesc,
        icon: <AlertCircle className="w-5 h-5 text-amber-400" id="aqi-moderate-icon" />,
      };
    } else if (aqi <= 80) {
      return {
        label: t.poorAqi,
        color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
        barColor: "bg-orange-400",
        desc: t.poorAqiDesc,
        icon: <ShieldAlert className="w-5 h-5 text-orange-400" id="aqi-poor-icon" />,
      };
    } else if (aqi <= 100) {
      return {
        label: t.veryPoorAqi,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        barColor: "bg-rose-400",
        desc: t.veryPoorAqiDesc,
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" id="aqi-verypoor-icon" />,
      };
    } else {
      return {
        label: t.extremeAqi,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        barColor: "bg-purple-400",
        desc: t.extremeAqiDesc,
        icon: <ShieldAlert className="w-5 h-5 text-purple-400" id="aqi-extreme-icon" />,
      };
    }
  };

  const aqiValue = european_aqi !== undefined ? european_aqi : 15; // Fallback to a mid-good clean level if missing
  const info = getAqiInfo(aqiValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-between"
      id="air-quality-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          {t.airQualityTitle}
        </h3>
        <span
          className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full border ${info.color} flex items-center gap-1 w-fit`}
          id="aqi-badge"
        >
          {info.icon}
          <span className="truncate">{info.label} ({aqiValue})</span>
        </span>
      </div>

      {/* Progress scale */}
      <div className="relative h-2 w-full bg-slate-850 rounded-full overflow-hidden mb-3 border border-slate-800/40">
        <motion.div
          className={`absolute left-0 top-0 h-full ${info.barColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((aqiValue / 100) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          id="aqi-progress-bar"
        />
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
        {info.desc}
      </p>

      {/* Grid of particulate values */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="p-3.5 rounded-2xl bg-slate-800/45 border border-slate-700/40">
          <div className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-0.5">
            PM2.5
          </div>
          <div className="flex items-baseline gap-1" id="pm25-val">
            <span className="text-sm font-bold font-mono text-slate-200">
              {pm2_5 ? pm2_5.toFixed(1) : "—"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">µg/m³</span>
          </div>
          {/* Status color indicator point */}
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                pm2_5 < 10
                  ? "bg-emerald-400"
                  : pm2_5 < 20
                  ? "bg-lime-400"
                  : pm2_5 < 25
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
            />
            <span className="text-[9px] text-slate-400 font-sans">
              {pm2_5 < 10
                ? t.excellentPm
                : pm2_5 < 20
                ? t.goodPm
                : pm2_5 < 25
                ? t.fairPm
                : t.weakPm}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/45 border border-slate-700/40">
          <div className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-0.5">
            PM10
          </div>
          <div className="flex items-baseline gap-1" id="pm10-val">
            <span className="text-sm font-bold font-mono text-slate-200">
              {pm10 ? pm10.toFixed(1) : "—"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">µg/m³</span>
          </div>
          {/* Status color indicator point */}
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                pm10 < 20
                  ? "bg-emerald-400"
                  : pm10 < 40
                  ? "bg-lime-400"
                  : pm10 < 50
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
            />
            <span className="text-[9px] text-slate-400 font-sans">
              {pm10 < 20
                ? t.excellentPm
                : pm10 < 40
                ? t.goodPm
                : pm10 < 50
                ? t.fairPm
                : t.weakPm}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
