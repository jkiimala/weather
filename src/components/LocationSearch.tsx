import { useState, useEffect } from "react";
import { Location } from "../types";
import { Search, MapPin, Star, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Lang, translations } from "../utils/i18n";

interface LocationSearchProps {
  currentLocation: Location;
  onSelectLocation: (loc: Location) => void;
  favorites: Location[];
  onToggleFavorite: (loc: Location) => void;
  lang: Lang;
}

export function LocationSearch({
  currentLocation,
  onSelectLocation,
  favorites,
  onToggleFavorite,
  lang,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const t = translations[lang];

  // Trigger search on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=6&language=${lang}&format=json`
        );
        if (!response.ok) {
          throw new Error(lang === "fi" ? "Hakupalveluun ei saatu yhteyttä." : "Could not reach geocoding service.");
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // Map to match Location type
          const mappedResults: Location[] = data.results.map((item: any) => ({
            id: item.id,
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            country: item.country || (lang === "fi" ? "Tuntematon" : "Unknown"),
            admin1: item.admin1,
          }));
          setResults(mappedResults);
        } else {
          setResults([]);
          setError(lang === "fi" ? "Paikkoja ei löytynyt." : "No locations found.");
        }
      } catch (err) {
        setResults([]);
        setError(lang === "fi" ? "Virhe haettaessa paikkoja." : "Error retrieving locations.");
      } finally {
        setIsLoading(false);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query, lang]);

  const handleSelect = (loc: Location) => {
    onSelectLocation(loc);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const isFavorite = (locId: number) => {
    return favorites.some((fav) => fav.id === locId);
  };

  return (
    <div className="w-full font-sans" id="location-search-container">
      {/* Search Input Bar */}
      <div className="relative flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-slate-700 transition"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            id="location-search-input"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition"
              id="clear-search-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Search Results Overlay */}
      <AnimatePresence>
        {showResults && (query.trim().length >= 2 || isLoading || error) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800/80 p-2 shadow-2xl backdrop-blur-2xl"
            id="search-results-overlay"
          >
            {isLoading && (
              <div className="flex items-center justify-center py-6 text-slate-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span className="text-xs">{lang === "fi" ? "Haetaan..." : "Searching..."}</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="text-center py-6 text-xs text-slate-500">
                {error}
              </div>
            )}

            {!isLoading && !error && results.length > 0 && (
              <div className="space-y-0.5">
                {results.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900/60 transition cursor-pointer"
                    id={`search-result-${loc.id}`}
                  >
                    <div
                      className="flex-1 flex items-start gap-2.5 py-1"
                      onClick={() => handleSelect(loc)}
                    >
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          {loc.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {loc.admin1 ? `${loc.admin1}, ` : ""}
                          {loc.country}
                        </div>
                      </div>
                    </div>

                    {/* Star toggle button on search dropdown directly */}
                    <button
                      onClick={() => onToggleFavorite(loc)}
                      className={`p-2 rounded-lg transition hover:bg-slate-800/80 ${
                        isFavorite(loc.id)
                          ? "text-amber-400"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                      title={isFavorite(loc.id) ? (lang === "fi" ? "Poista suosikeista" : "Remove from favorites") : (lang === "fi" ? "Lisää suosikkeihin" : "Save to favorites")}
                      id={`fav-btn-search-${loc.id}`}
                    >
                      <Star
                        className="w-4 h-4"
                        fill={isFavorite(loc.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable or horizontal lists of Favorites */}
      {favorites.length > 0 && (
        <div className="mb-1" id="favorites-list">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">
            <span>{t.favoritesTitle} ({favorites.length})</span>
          </div>
          <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
            {favorites.map((fav) => (
              <motion.div
                key={fav.id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border text-xs font-semibold cursor-pointer transition select-none shrink-0 ${
                  currentLocation.id === fav.id
                    ? "bg-slate-800 border-slate-700 text-sky-400 shadow-md"
                    : "bg-slate-900 hover:bg-slate-850 border-slate-800/80 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => onSelectLocation(fav)}
                id={`favorite-item-${fav.id}`}
              >
                <MapPin
                  className={`w-3 h-3 ${
                    currentLocation.id === fav.id ? "text-sky-400 animate-pulse" : "text-slate-500"
                  }`}
                />
                <span className="truncate max-w-22.5">{fav.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(fav);
                  }}
                  className="p-0.5 rounded-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition ml-0.5"
                  title={lang === "fi" ? "Poista suosikeista" : "Remove from favorites"}
                  id={`remove-fav-btn-${fav.id}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
