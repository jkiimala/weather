import { motion } from "motion/react";
import { Lang } from "../utils/i18n";

interface IconProps {
  className?: string;
  size?: number;
}

export function SunIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-sun"
    >
      {/* Glow */}
      <motion.circle
        cx="50"
        cy="50"
        r="20"
        fill="currentColor"
        className="text-amber-400 opacity-30"
        animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "center" }}
      />
      {/* Sun Core */}
      <motion.circle 
        cx="50" 
        cy="50" 
        r="16" 
        fill="currentColor" 
        className="text-amber-500"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "center" }}
      />
      {/* Rays */}
<motion.g
  animate={{ rotate: 360 }}
  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
  style={{ transformOrigin: "center" }}
>
  {[...Array(8)].map((_, index) => {
    const rotation = index * 45;
    return (
      <motion.rect
        key={index}
        x="47"
        y="18"
        width="6"
        // Poistettu: height="10" (Framer Motion hoitaa tämän nyt)
        rx="3"
        fill="currentColor"
        className="text-amber-500"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "50px 50px",
        }}
        initial={{ height: 10 }} // Määritetään alkukorkeus tässä
        animate={{ height: [10, 14, 10] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.15,
          ease: "easeInOut",
        }}
      />
    );
  })}
</motion.g>

    </svg>
  );
}

export function PartlyCloudyIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-partly-cloudy"
    >
      {/* Peeking Sun */}
      <g style={{ transform: "translate(15px, 10px)" }}>
        <motion.circle
          cx="35"
          cy="35"
          r="12"
          fill="currentColor"
          className="text-amber-400"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "35px 35px" }}
        />
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "35px 35px" }}
        >
          {[...Array(6)].map((_, index) => (
            <rect
              key={index}
              x="33"
              y="13"
              width="4"
              height="6"
              rx="2"
              fill="currentColor"
              className="text-amber-400"
              style={{
                transform: `rotate(${index * 60}deg)`,
                transformOrigin: "35px 35px",
              }}
            />
          ))}
        </motion.g>
      </g>

      {/* Cloud */}
      <motion.path
        d="M25,65 C25,55 33,48 43,48 C45,48 47,48.5 49,49.2 C53,43 60,39 67,39 C78,39 87,47 87,57 C87,57.5 87,58 86.9,58.5 C89.3,60.2 91,63 91,66.2 C91,71.6 86.6,76 81.2,76 L25,76 C18.9,76 14,71.1 14,65 C14,59.5 18,55 23.3,54.2 C24.4,54.1 25,54.8 25,55.9 Z"
        fill="currentColor"
        className="text-slate-300"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function CloudyIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-cloudy"
    >
      <g className="text-slate-500 opacity-60">
        <motion.path
          d="M15,55 C15,48 21,43 28,43 C33,43 37,46 39,50 C42,46 47,43 52,43 C60,43 67,49 67,57 L15,57 Z"
          fill="currentColor"
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>
      <motion.path
        d="M25,65 C25,55 33,48 43,48 C45,48 47,48.5 49,49.2 C53,43 60,39 67,39 C78,39 87,47 87,57 C87,57.5 87,58 86.9,58.5 C89.3,60.2 91,63 91,66.2 C91,71.6 86.6,76 81.2,76 L25,76 C18.9,76 14,71.1 14,65 C14,59.5 18,55 23.3,54.2 L25,65 Z"
        fill="currentColor"
        className="text-slate-300"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function RainIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-rain"
    >
      <motion.path
        d="M25,60 C25,50 33,43 43,43 C45,43 47,43.5 49,44.2 C53,38 60,34 67,34 C78,34 87,42 87,52 L14,52"
        fill="currentColor"
        className="text-slate-400"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ display: "none" }} /* Keep main path visually solid */
      />
      <motion.path
        d="M25,55 C25,45 33,38 43,38 C45,38 47,38.5 49,39.2 C53,33 60,29 67,29 C78,29 87,37 87,47 C87,47.5 87,48 86.9,48.5 C89.3,50.2 91,53 91,56.2 C91,61.6 86.6,66 81.2,66 L25,66 C18.9,66 14,61.1 14,55 C14,49.5 18,45 23.3,44.2 L25,55 Z"
        fill="currentColor"
        className="text-slate-400"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Raindrops */}
      <g fill="currentColor" className="text-sky-400">
        {[28, 42, 56, 70, 84].map((x, i) => (
          <motion.path
            key={i}
            d="M 0,0 Q -2,6 -2,8 Q -2,10 0,10 Q 2,10 2,8 Q 2,6 0,0"
            style={{ x }}
            animate={{
              y: [60, 92],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.22,
              ease: "linear",
            }}
          />
        ))}
      </g>
    </svg>
  );
}

export function StormIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-storm"
    >
      <motion.path
        d="M25,55 C25,45 33,38 43,38 C45,38 47,38.5 49,39.2 C53,33 60,29 67,29 C78,29 87,37 87,47 C87,47.5 87,48 86.9,48.5 C89.3,50.2 91,53 91,56.2 C91,61.6 86.6,66 81.2,66 L25,66 C18.9,66 14,61.1 14,55 C14,49.5 18,45 23.3,44.2 L25,55 Z"
        fill="currentColor"
        className="text-slate-500"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Lightning bolt */}
      <motion.polygon
        points="52,60 40,75 48,75 42,92 58,74 50,74"
        fill="currentColor"
        className="text-amber-400"
        animate={{
          opacity: [0, 0, 1, 0, 1, 0, 0, 0],
          scale: [0.95, 0.95, 1.05, 1, 1, 0.95, 0.95, 0.95],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "50px 75px" }}
      />

      {/* Soft raindrops */}
      <g fill="currentColor" className="text-sky-500">
        {[32, 48, 64, 80].map((x, i) => (
          <motion.path
            key={i}
            d="M 0,0 Q -1,4 -1,6 Q -1,7 0,7 Q 1,7 1,6 Q 1,4 0,0"
            style={{ x }}
            animate={{
              y: [62, 85],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.25,
              ease: "linear",
            }}
          />
        ))}
      </g>
    </svg>
  );
}

export function SnowIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-snow"
    >
      <motion.path
        d="M25,55 C25,45 33,38 43,38 C45,38 47,38.5 49,39.2 C53,33 60,29 67,29 C78,29 87,37 87,47 C87,47.5 87,48 86.9,48.5 C89.3,50.2 91,53 91,56.2 C91,61.6 86.6,66 81.2,66 L25,66 C18.9,66 14,61.1 14,55 C14,49.5 18,45 23.3,44.2 L25,55 Z"
        fill="currentColor"
        className="text-zinc-400"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Falling snowflakes */}
      <g className="text-sky-100">
        {[28, 44, 60, 76].map((x, i) => (
          <motion.g
            key={i}
            style={{ x, y: 64 }}
            animate={{
              y: [64, 90],
              opacity: [0, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.45,
              ease: "linear",
            }}
          >
            {/* Minimal asterisk snowflake */}
            <circle cx="0" cy="0" r="2" fill="currentColor" />
            <path
              d="M -4,0 L 4,0 M 0,-4 L 0,4 M -3,-3 L 3,3 M -3,3 L 3,-3"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </motion.g>
        ))}
      </g>
    </svg>
  );
}

export function FogIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-fog"
    >
      <motion.rect
        x="20"
        y="32"
        width="60"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-slate-400"
        animate={{ x: [-6, 6, -6], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.rect
        x="15"
        y="46"
        width="70"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-slate-300"
        animate={{ x: [4, -4, 4], opacity: [0.8, 0.5, 0.8] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.rect
        x="25"
        y="60"
        width="50"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-slate-400"
        animate={{ x: [-4, 4, -4], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.rect
        x="18"
        y="74"
        width="64"
        height="6"
        rx="3"
        fill="currentColor"
        className="text-slate-300"
        animate={{ x: [5, -5, 5], opacity: [0.7, 0.4, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function WindIcon({ className = "", size = 64 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      id="icon-wind"
    >
      <motion.path
        d="M 15 35 L 65 35 A 8 8 0 1 1 57 43"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-teal-300"
        animate={{
          strokeDasharray: ["0, 300", "150, 150", "0, 300"],
          strokeDashoffset: [0, -150, -300],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.path
        d="M 25 50 L 75 50 A 6 6 0 1 0 69 44"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-sky-200"
        animate={{
          strokeDasharray: ["0, 300", "120, 180", "0, 300"],
          strokeDashoffset: [100, -100, -300],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <motion.path
        d="M 10 65 L 55 65 A 7 7 0 1 1 48 72"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-teal-200"
        animate={{
          strokeDasharray: ["0, 300", "130, 170", "0, 300"],
          strokeDashoffset: [200, 0, -200],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

export function getWeatherIcon(code: number, isDay: boolean = true, size = 64) {
  // Map WMO codes to gorgeous vector components
  switch (code) {
    case 0: // Clear
      return <SunIcon size={size} />;
    case 1:
    case 2: // Mainly clear, partly cloudy
      return <PartlyCloudyIcon size={size} />;
    case 3: // Overcast
      return <CloudyIcon size={size} />;
    case 45:
    case 48: // Fog
      return <FogIcon size={size} />;
    case 51:
    case 53:
    case 55: // Drizzle
    case 61:
    case 63:
    case 65: // Rain
    case 80:
    case 81:
    case 82: // Rain showers
      return <RainIcon size={size} />;
    case 56:
    case 57: // Freezing drizzle
    case 66:
    case 67: // Freezing rain
    case 71:
    case 73:
    case 75: // Snow fall
    case 77: // Snow grains
    case 85:
    case 86: // Snow showers
      return <SnowIcon size={size} />;
    case 95:
    case 96:
    case 99: // Thunderstorm
      return <StormIcon size={size} />;
    default:
      return <PartlyCloudyIcon size={size} />;
  }
}

export function getWeatherDescription(code: number, lang: Lang = "fi"): string {
  if (lang === "fi") {
    switch (code) {
      case 0:
        return "Selkeää";
      case 1:
        return "Melko selkeää";
      case 2:
        return "Puolipilvistä";
      case 3:
        return "Pilvistä";
      case 45:
        return "Sumua";
      case 48:
        return "Huurre-sumua";
      case 51:
        return "Kevyttä tihkusadetta";
      case 53:
        return "Kohtalaista tihkusadetta";
      case 55:
        return "Tiheää tihkusadetta";
      case 56:
        return "Kevyttä jäätävää tihkusadetta";
      case 57:
        return "Tiheää jäätävää tihkusadetta";
      case 61:
        return "Kevyttä vesisadetta";
      case 63:
        return "Kohtalaista vesisadetta";
      case 65:
        return "Rankkaa vesisadetta";
      case 66:
        return "Kevyttä jäätävää sadetta";
      case 67:
        return "Rankkaa ja jäätävää sadetta";
      case 71:
        return "Kevyttä lumisadetta";
      case 73:
        return "Kohtalaista lumisadetta";
      case 75:
        return "Tiheää lumisadetta";
      case 77:
        return "Lumijyviä";
      case 80:
        return "Kevyitä sadekuuroja";
      case 81:
        return "Kohtalaisia sadekuuroja";
      case 82:
        return "Rajujakin sadekuuroja";
      case 85:
        return "Heikkoja lumikuuroja";
      case 86:
        return "Voimakkaita lumikuuroja";
      case 95:
        return "Ukkosta";
      case 96:
        return "Ukkosta ja kevyttä raesadetta";
      case 99:
        return "Ukkosta ja rankkaa raesadetta";
      default:
        return "Tuntematon sääilmiö";
    }
  } else {
    switch (code) {
      case 0:
        return "Clear sky";
      case 1:
        return "Mainly clear";
      case 2:
        return "Partly cloudy";
      case 3:
        return "Overcast";
      case 45:
        return "Fog";
      case 48:
        return "Depositing rime fog";
      case 51:
        return "Light drizzle";
      case 53:
        return "Moderate drizzle";
      case 55:
        return "Dense drizzle";
      case 56:
        return "Light freezing drizzle";
      case 57:
        return "Dense freezing drizzle";
      case 61:
        return "Slight rain";
      case 63:
        return "Moderate rain";
      case 65:
        return "Heavy rain";
      case 66:
        return "Light freezing rain";
      case 67:
        return "Heavy freezing rain";
      case 71:
        return "Slight snow fall";
      case 73:
        return "Moderate snow fall";
      case 75:
        return "Heavy snow fall";
      case 77:
        return "Snow grains";
      case 80:
        return "Slight rain showers";
      case 81:
        return "Moderate rain showers";
      case 82:
        return "Violent rain showers";
      case 85:
        return "Slight snow showers";
      case 86:
        return "Heavy snow showers";
      case 95:
        return "Thunderstorm";
      case 96:
        return "Thunderstorm with slight hail";
      case 99:
        return "Thunderstorm with heavy hail";
      default:
        return "Unknown weather";
    }
  }
}
