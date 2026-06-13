import { useState, useEffect } from "react";
import { Location, WeatherData } from "./types";
import { getWeatherIcon, getWeatherDescription } from "./components/WeatherIcons";
import { AirQualityIndicator } from "./components/AirQualityIndicator";
import { WeeklyForecast } from "./components/WeeklyForecast";
import { HumidityWindDetails } from "./components/HumidityWindDetails";
import { HourlyTimeline } from "./components/HourlyTimeline";
import { LocationSearch } from "./components/LocationSearch";
import { WeatherLoader } from "./components/WeatherLoader";
import { motion, AnimatePresence } from "motion/react";
import { Lang, translations } from "./utils/i18n";
import {
  MapPin,
  Compass,
  RefreshCw,
  Sun,
  Star,
  Info,
} from "lucide-react";

// Default location (Helsinki, Finland)
const DEFAULT_LOCATION: Location = {
  id: 658225,
  name: "Helsinki",
  latitude: 60.1695,
  longitude: 24.9354,
  country: "Suomi",
  admin1: "Uusimaa",
};

export default function App() {
  // State variables
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("app_lang");
    return saved === "fi" || saved === "en" ? saved : "fi";
  });

  const [currentLocation, setCurrentLocation] = useState<Location>(() => {
    const saved = localStorage.getItem("last_location");
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [favorites, setFavorites] = useState<Location[]>(() => {
    const saved = localStorage.getItem("favorite_locations");
    return saved ? JSON.parse(saved) : [DEFAULT_LOCATION];
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreloader, setShowPreloader] = useState(true);

  // UTC / Local clock formatted by active language
  const [currentTime, setCurrentTime] = useState("");

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem("app_lang", lang);
  }, [lang]);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(
        date.toLocaleTimeString(lang === "fi" ? "fi-FI" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          weekday: "short",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [lang]);

  // Fetch weather data when currentLocation changes
  useEffect(() => {
    let active = true;

    async function fetchAllData() {
      setIsLoading(true);
      setError(null);
      try {
        const { latitude, longitude } = currentLocation;

        // 1. Fetch Forecast data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error(t.dataFetchError);
        const weatherJson = await weatherRes.json();

        // 2. Fetch Air Quality data
        const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,european_aqi`;
        const aqRes = await fetch(aqUrl);
        if (!aqRes.ok) throw new Error(t.airFetchError);
        const aqJson = await aqRes.json();

        if (active) {
          setWeather({
            current: weatherJson.current,
            hourly: weatherJson.hourly,
            daily: weatherJson.daily,
            airQuality: aqJson.current,
            location: currentLocation,
          });
          // Save last viewed location to local storage
          localStorage.setItem("last_location", JSON.stringify(currentLocation));
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || t.fallbackError);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchAllData();

    return () => {
      active = false;
    };
  }, [currentLocation, lang]);

  // Persist favorites to local storage on change
  useEffect(() => {
    localStorage.setItem("favorite_locations", JSON.stringify(favorites));
  }, [favorites]);

  // Favorite toggle function
  const handleToggleFavorite = (loc: Location) => {
    const isAlreadyFav = favorites.some((fav) => fav.id === loc.id);
    if (isAlreadyFav) {
      setFavorites(favorites.filter((fav) => fav.id !== loc.id));
    } else {
      setFavorites([...favorites, loc]);
    }
  };

  // Uses web Geolocation to find player's actual coordinates
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t.locateError);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use reverse geocoding to acquire city name
          const revGeoUrl = `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=658d5dae843e9334053303mve05ef9a`; 
          // Note: Geocode.maps.co free API, fallback is "Oma sijanti" or "My Location" if geocoder is busy
          let cityName = lang === "fi" ? "Oma Sijainti" : "My Location";
          try {
            const geoRes = await fetch(revGeoUrl);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              cityName =
                geoData.address?.city ||
                geoData.address?.town ||
                geoData.address?.municipality ||
                geoData.address?.village ||
                (lang === "fi" ? "Oma Sijainti" : "My Location");
            }
          } catch (e) {
            // silent ignore geocoder errors, use fallback name
          }

          const myLoc: Location = {
            id: Math.floor(Math.random() * 1000000), // temp id
            name: cityName,
            latitude,
            longitude,
            country: lang === "fi" ? "Suomi" : "Finland",
          };
          setCurrentLocation(myLoc);
        } catch (e) {
          setError(t.geoError);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(t.locateDenied);
            break;
          case error.POSITION_UNAVAILABLE:
            alert(t.locateUnavailable);
            break;
          case error.TIMEOUT:
            alert(t.locateTimeout);
            break;
          default:
            alert(t.locateUnspecified);
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Select dynamic weather hero gradient styling
  const getHeroCardGradient = (code: number, isDay: boolean) => {
    if (!isDay) return "from-slate-900 via-slate-950 to-slate-900 border-slate-800/80 text-slate-100";
    switch (code) {
      case 0:
      case 1: // Clear
        return "from-slate-900 via-sky-950/40 to-slate-900 border-sky-500/20 text-slate-50";
      case 2:
      case 3: // Partly cloudy / Overcast
        return "from-slate-900 via-slate-900 to-slate-800/80 border-slate-800/80 text-slate-50";
      case 45:
      case 48: // Foggy
        return "from-slate-900 via-stone-900/60 to-slate-900 border-stone-850/40 text-slate-100";
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65: // Rainy
        return "from-slate-900 via-blue-950/45 to-slate-900 border-blue-800/25 text-slate-50";
      case 71:
      case 73:
      case 75:
      case 77: // Snowy
        return "from-slate-900 via-cyan-950/45 to-slate-900 border-cyan-800/20 text-slate-50";
      case 95:
      case 96:
      case 99: // Storm
        return "from-slate-900 via-indigo-950/45 to-slate-900 border-indigo-850/20 text-slate-50";
      default:
        return "from-slate-900 via-slate-950 to-slate-900 border-slate-800/70 text-slate-100";
    }
  };

  const weatherCode = weather?.current.weather_code ?? 0;
  const isDayStatus = weather?.current.is_day === 1;
  const favIconFilled = favorites.some((fav) => fav.id === currentLocation.id);

  return (
    <div
      className="min-h-screen pb-16 flex flex-col items-center justify-start bg-slate-950 text-slate-50 overflow-x-hidden relative"
      id="app-container"
    >
      {/* Dynamic ambient blur sphere in the background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-sky-500/5 via-sky-500/1 to-transparent blur-3xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {showPreloader ? (
          <WeatherLoader
            key="preloader"
            onComplete={() => setShowPreloader(false)}
            isDataReady={weather !== null || error !== null}
            lang={lang}
          />
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 flex flex-col gap-6 relative z-10"
            id="safe-wrapper"
          >
            {/* Top Header Card */}
            <header className="flex items-center justify-between pb-2" id="app-header-view">
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2 font-sans uppercase">
                  <Sun className="w-5 h-5 text-sky-450 animate-pulse" />
                  {t.title}
                </h1>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-semibold">
                  {currentTime || t.clockError}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher Switch */}
                <div className="flex items-center bg-slate-900/90 border border-slate-800/80 rounded-2xl p-1 gap-1 shadow-md">
                  <button
                    onClick={() => setLang("fi")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                      lang === "fi"
                        ? "bg-sky-500/15 border border-sky-500/30 text-sky-450"
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    FI
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                      lang === "en"
                        ? "bg-sky-500/15 border border-sky-500/30 text-sky-450"
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={handleUseCurrentLocation}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-sky-450 focus:outline-none transition active:scale-95 shadow-md flex items-center gap-1.5"
                  title={t.locate}
                  id="geo-locate-btn"
                >
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-semibold">{t.locate}</span>
                </button>
                <button
                  onClick={() => setCurrentLocation(currentLocation)}
                  className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-sky-450 focus:outline-none transition active:rotate-180 duration-500 shadow-md"
                  title={t.refresh}
                  id="refresh-weather-btn"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Location search dropdown & listing */}
            <div className="relative">
              <LocationSearch
                currentLocation={currentLocation}
                onSelectLocation={setCurrentLocation}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                lang={lang}
              />
            </div>

            {/* Primary Loaders and Errors */}
            {isLoading && !weather && (
              <div className="flex flex-col items-center justify-center py-24 gap-3" id="loading-spinner">
                <RefreshCw className="w-8 h-8 text-sky-450 animate-spin" />
                <p className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase">
                  {lang === "fi" ? "Päivitetään tilastoja..." : "Updating statistics..."}
                </p>
              </div>
            )}

            {error && (
              <div
                className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/25 text-center space-y-4 shadow-xl backdrop-blur-md"
                id="error-msg-box"
              >
                <p className="text-sm text-rose-400/90 leading-relaxed font-sans font-medium">{error}</p>
                <button
                  onClick={() => setCurrentLocation(DEFAULT_LOCATION)}
                  className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all font-sans uppercase tracking-wider"
                  id="error-reset-btn"
                >
                  {t.returnHome}
                </button>
              </div>
            )}

            {/* Weather data display in a high-fidelity responsive Bento Grid layout */}
            {weather && (
              <AnimatePresence mode="wait">
                <motion.main
                  key={weather.location.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 md:gap-6 items-stretch"
                  id="weather-main-view"
                >
                  {/* Giant Weather Core Info - Hero Card */}
                  <section 
                    className={`md:col-span-2 lg:col-span-8 p-5 sm:p-8 rounded-3xl bg-linear-to-br ${getHeroCardGradient(weatherCode, isDayStatus)} border border-slate-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-72.5 sm:min-h-72.5 transition-all`}
                    id="section-core-weather"
                  >
                    {/* Accent glow on top right */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
                    
                    <div className="flex items-center justify-between relative z-10 w-full mb-4">
                      <div className="flex items-center gap-1.5 bg-slate-900/70 border border-slate-800/60 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                        <MapPin className="w-3.5 h-3.5 text-sky-455 animate-pulse" />
                        <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-100 font-sans" id="cur-loc-name">
                          {weather.location.name}
                        </h2>
                        <button
                          onClick={() => handleToggleFavorite(weather.location)}
                          className="p-1 focus:outline-none text-slate-400 hover:text-amber-400 transition ml-1"
                          id="toggle-fav-core-btn"
                        >
                          <Star
                            className="w-3.5 h-3.5"
                            fill={favIconFilled ? "#fbbf24" : "none"}
                            stroke={favIconFilled ? "#fbbf24" : "currentColor"}
                          />
                        </button>
                      </div>
                      
                      <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-extrabold bg-slate-900/70 border border-slate-800/60 px-3 py-1 rounded-full">
                        {t.weatherNow}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 relative z-10 w-full">
                      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <div className="text-7xl font-sans font-black tracking-tighter text-slate-100 flex items-center mb-1 leading-none" id="main-temp-val">
                          {weather.current.temperature_2m.toFixed(0)}
                          <span className="text-4xl font-light text-slate-400 align-super ml-1">°</span>
                        </div>
                        <span className="text-sm font-extrabold text-slate-300 tracking-wide font-sans mt-1">
                          {getWeatherDescription(weather.current.weather_code, lang)}
                        </span>
                      </div>

                      {/* Animated Central Weather Icon */}
                      <div className="flex justify-center p-2 transform hover:scale-105 transition-transform duration-500" id="central-icon-wrapper">
                        {getWeatherIcon(weather.current.weather_code, isDayStatus, 100)}
                      </div>
                    </div>
                  </section>

                  {/* Weekly Forecast (md:col-span-1 lg:col-span-4 lg:row-span-2) */}
                  <section id="weekly-forecast-stats" className="md:col-span-1 lg:col-span-4 lg:row-span-2">
                    <WeeklyForecast data={weather.daily} lang={lang} />
                  </section>

                  {/* Bento Grid layout of Additional Stats */}
                  <section id="bento-grid-atmospheric-stats" className="md:col-span-1 lg:col-span-8">
                    <HumidityWindDetails current={weather.current} lang={lang} />
                  </section>

                  {/* 24-Hour Timeline */}
                  <section id="timeline-stats" className="md:col-span-2 lg:col-span-8">
                    <HourlyTimeline data={weather.hourly} currentLocalTime={weather.current.time} lang={lang} />
                  </section>

                  {/* Air Quality */}
                  <section id="airquality-stats" className="md:col-span-2 lg:col-span-4">
                    <AirQualityIndicator data={weather.airQuality} lang={lang} />
                  </section>

                  {/* Open-Meteo Attribution & Copyright */}
                  <footer className="col-span-1 md:col-span-2 lg:col-span-12 text-center py-6 flex flex-col items-center justify-center gap-2">
                    <div className="text-[9px] text-slate-600 font-mono tracking-wider flex items-center justify-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-600" />
                      <span>{t.dataAttribution}</span>
                    </div>
                    <a
                      href="https://jkiimala.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-sky-400 font-sans tracking-wide transition-colors duration-200 mt-0.5 cursor-pointer hover:underline"
                    >
                      {t.copyright}
                    </a>
                  </footer>
                </motion.main>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
