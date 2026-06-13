import { motion } from "motion/react";
import { CurrentWeather } from "../types";
import { Droplets, Wind, Thermometer, CloudRain } from "lucide-react";
import { Lang, translations } from "../utils/i18n";

interface HumidityWindDetailsProps {
  current: CurrentWeather;
  lang: Lang;
}

export function HumidityWindDetails({ current, lang }: HumidityWindDetailsProps) {
  const {
    relative_humidity_2m,
    apparent_temperature,
    wind_speed_10m,
    precipitation,
  } = current;

  const t = translations[lang];

  // Determine wind description
  const getWindDescription = (speed: number) => {
    if (lang === "fi") {
      if (speed < 1) return "Täysin tyyntä";
      if (speed < 4) return "Heikkoa tuulta";
      if (speed < 8) return "Kohtalaista tuulta";
      if (speed < 14) return "Navakkaa tuulta";
      return "Kovaa tuulta";
    } else {
      if (speed < 1) return "Calm";
      if (speed < 4) return "Light breeze";
      if (speed < 8) return "Moderate breeze";
      if (speed < 14) return "Fresh breeze";
      return "Strong wind";
    }
  };

  const bentoItems = [
    {
      title: t.humidityLabel,
      value: `${relative_humidity_2m}%`,
      desc: lang === "fi"
        ? (relative_humidity_2m < 40 ? "Kuiva ilma" : relative_humidity_2m < 70 ? "Miellyttävä" : "Kostea ilma")
        : (relative_humidity_2m < 40 ? "Dry air" : relative_humidity_2m < 70 ? "Comfortable" : "Humid air"),
      icon: <Droplets className="w-5 h-5 text-blue-400" id="detail-humidity-icon" />,
      color: "border-blue-500/10 hover:border-blue-500/20",
    },
    {
      title: t.feelsLabel,
      value: `${apparent_temperature.toFixed(1)}°C`,
      desc: lang === "fi" ? "Lämpötila iholla" : "Skin temperature",
      icon: <Thermometer className="w-5 h-5 text-rose-400" id="detail-feelslike-icon" />,
      color: "border-rose-500/10 hover:border-rose-500/20",
    },
    {
      title: t.windLabel,
      value: `${wind_speed_10m.toFixed(1)} m/s`,
      desc: getWindDescription(wind_speed_10m),
      icon: <Wind className="w-5 h-5 text-teal-400" id="detail-wind-icon" />,
      color: "border-teal-500/10 hover:border-teal-500/20",
    },
    {
      title: t.precipLabel,
      value: `${precipitation.toFixed(1)} mm`,
      desc: lang === "fi" ? "Viimeisin tunti" : "During past hour",
      icon: <CloudRain className="w-5 h-5 text-sky-400" id="detail-precip-icon" />,
      color: "border-sky-500/10 hover:border-sky-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans" id="humidity-wind-bento">
      {bentoItems.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/60 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between min-h-27.5 sm:min-h-30"
          id={`bento-card-${i}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wide">{item.title}</span>
            <div className="p-1.5 rounded-xl bg-slate-800/60 border border-slate-750/30">
              {item.icon}
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight leading-none mb-1">
              {item.value}
            </div>
            <div className="text-[10px] text-slate-500 tracking-wide font-medium truncate">
              {item.desc}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
