export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  uv_index_max: number[];
}

export interface AirQuality {
  pm10: number;
  pm2_5: number;
  european_aqi: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
  airQuality: AirQuality;
  location: Location;
}
