import { fetchWeatherApi } from 'openmeteo';

export interface WeatherCondition {
  code: number;
  description: string;
  iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudRain' | 'CloudDrizzle' | 'CloudLightning' | 'Snowflake' | 'CloudFog';
}

export interface DayWeather {
  temperature: number;
  minTemp?: number;
  maxTemp?: number;
  weatherCode: number;
  description: string;
  iconName: WeatherCondition['iconName'];
  rain: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  minTemp?: number;
  maxTemp?: number;
  weatherCode: number;
  description: string;
  iconName: WeatherCondition['iconName'];
  isDay: boolean;
  rain: number;
}

export interface LocationConfig {
  latitude: number;
  longitude: number;
  name: string;
  state?: string;
  country?: string;
  isGps?: boolean;
}

export interface WeatherReport {
  current: CurrentWeather;
  daily: Record<string, DayWeather>; // Chave YYYY-MM-DD
  location: LocationConfig;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

// Cidades pré-selecionadas para acesso rápido
export const POPULAR_LOCATIONS: LocationConfig[] = [
  { name: 'São Paulo', state: 'SP', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Rio de Janeiro', state: 'RJ', latitude: -22.9068, longitude: -43.1729 },
  { name: 'Belo Horizonte', state: 'MG', latitude: -19.9167, longitude: -43.9345 },
  { name: 'Brasília', state: 'DF', latitude: -15.7975, longitude: -47.8919 },
  { name: 'Curitiba', state: 'PR', latitude: -25.4284, longitude: -49.2733 },
  { name: 'Porto Alegre', state: 'RS', latitude: -30.0346, longitude: -51.2177 },
  { name: 'Salvador', state: 'BA', latitude: -12.9777, longitude: -38.5016 },
  { name: 'Fortaleza', state: 'CE', latitude: -3.7319, longitude: -38.5267 },
  { name: 'Recife', state: 'PE', latitude: -8.0476, longitude: -34.8770 },
  { name: 'Goiânia', state: 'GO', latitude: -16.6869, longitude: -49.2648 },
  { name: 'Florianópolis', state: 'SC', latitude: -27.5954, longitude: -48.5480 },
  { name: 'Manaus', state: 'AM', latitude: -3.1190, longitude: -60.0217 },
  { name: 'Belém', state: 'PA', latitude: -1.4558, longitude: -48.4902 },
];

const DEFAULT_COORDINATES: LocationConfig = {
  latitude: -23.5505,
  longitude: -46.6333,
  name: 'São Paulo',
  state: 'SP',
};

const STORAGE_KEY = 'easytask_weather_location';
let inMemoryLocationStorage: Record<string, string> = {};

export function getSavedLocation(): LocationConfig | null {
  try {
    const raw = typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : inMemoryLocationStorage[STORAGE_KEY];
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveLocation(location: LocationConfig): void {
  try {
    const serialized = JSON.stringify(location);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, serialized);
    } else {
      inMemoryLocationStorage[STORAGE_KEY] = serialized;
    }
    cachedReport = null; // Invalida o cache
  } catch {
    // ignore
  }
}

export function clearSavedLocation(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    delete inMemoryLocationStorage[STORAGE_KEY];
    cachedReport = null;
  } catch {
    // ignore
  }
}

/**
 * Mapeia códigos meteorológicos WMO para texto em PT-BR e nome do ícone Lucide
 */
export function interpretWeatherCode(code: number): WeatherCondition {
  switch (code) {
    case 0:
      return { code, description: 'Céu Limpo', iconName: 'Sun' };
    case 1:
      return { code, description: 'Predom. Limpo', iconName: 'Sun' };
    case 2:
      return { code, description: 'Parc. Nublado', iconName: 'CloudSun' };
    case 3:
      return { code, description: 'Nublado', iconName: 'Cloud' };
    case 45:
    case 48:
      return { code, description: 'Nevoeiro', iconName: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { code, description: 'Garoa', iconName: 'CloudDrizzle' };
    case 61:
    case 63:
      return { code, description: 'Chuva', iconName: 'CloudRain' };
    case 65:
      return { code, description: 'Chuva Forte', iconName: 'CloudRain' };
    case 71:
    case 73:
    case 75:
      return { code, description: 'Neve', iconName: 'Snowflake' };
    case 80:
    case 81:
    case 82:
      return { code, description: 'Pancadas de Chuva', iconName: 'CloudRain' };
    case 95:
    case 96:
    case 99:
      return { code, description: 'Tempestade', iconName: 'CloudLightning' };
    default:
      return { code, description: 'Instável', iconName: 'CloudSun' };
  }
}

/**
 * Busca cidades pelo nome usando a API de geocodificação gratuita do Open-Meteo
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=pt&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []) as GeocodingResult[];
  } catch (error) {
    console.error('Erro na pesquisa de cidades:', error);
    return [];
  }
}

// Cache simples em memória com expiração de 10 minutos
let cachedReport: { report: WeatherReport; timestamp: number; key: string } | null = null;
const CACHE_DURATION_MS = 10 * 60 * 1000;

/**
 * Obtém a posição geográfica do usuário via GPS
 */
export async function getGpsCoordinates(): Promise<LocationConfig> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return DEFAULT_COORDINATES;
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve(DEFAULT_COORDINATES);
    }, 4000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: 'Minha Localização',
          isGps: true,
        });
      },
      () => {
        clearTimeout(timeoutId);
        resolve(DEFAULT_COORDINATES);
      },
      { timeout: 4000, maximumAge: 60000 }
    );
  });
}

/**
 * Busca dados meteorológicos atualizados utilizando o pacote oficial openmeteo
 */
export async function fetchCurrentAndForecastWeather(
  targetLocation?: LocationConfig,
  forceRefresh = false
): Promise<WeatherReport> {
  const now = Date.now();

  // Determina qual localização usar: passada explicitamente > salva no storage > GPS/Padrão
  let activeLocation: LocationConfig;
  if (targetLocation) {
    activeLocation = targetLocation;
  } else {
    const saved = getSavedLocation();
    if (saved) {
      activeLocation = saved;
    } else {
      activeLocation = await getGpsCoordinates();
    }
  }

  const cacheKey = `${activeLocation.latitude.toFixed(3)}_${activeLocation.longitude.toFixed(3)}`;

  if (!forceRefresh && cachedReport && cachedReport.key === cacheKey && now - cachedReport.timestamp < CACHE_DURATION_MS) {
    return cachedReport.report;
  }

  const url = 'https://api.open-meteo.com/v1/forecast';

  const params = {
    latitude: activeLocation.latitude,
    longitude: activeLocation.longitude,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'is_day',
      'precipitation',
    ],
    hourly: ['temperature_2m', 'rain', 'weather_code'],
    timezone: 'auto',
  };

  const responses = await fetchWeatherApi(url, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const currentVars = response.current();

  let currentWeather: CurrentWeather;
  if (currentVars) {
    const rawTemp = currentVars.variables(0)?.value() ?? 22;
    const apparentTemp = currentVars.variables(1)?.value() ?? rawTemp;
    const weatherCode = Math.round(currentVars.variables(2)?.value() ?? 0);
    const isDayVal = Boolean(currentVars.variables(3)?.value() ?? 1);
    const rainVal = currentVars.variables(4)?.value() ?? 0;

    const condition = interpretWeatherCode(weatherCode);

    currentWeather = {
      temperature: Math.round(rawTemp),
      apparentTemperature: Math.round(apparentTemp),
      weatherCode,
      description: condition.description,
      iconName: condition.iconName,
      isDay: isDayVal,
      rain: Number(rainVal.toFixed(1)),
    };
  } else {
    currentWeather = {
      temperature: 22,
      apparentTemperature: 22,
      weatherCode: 1,
      description: 'Predom. Limpo',
      iconName: 'Sun',
      isDay: true,
      rain: 0,
    };
  }

  // Agrupa os dados horários por dia (formato YYYY-MM-DD)
  const hourly = response.hourly();
  const dailyMap: Record<string, DayWeather> = {};

  if (hourly) {
    const timeStart = Number(hourly.time());
    const timeEnd = Number(hourly.timeEnd());
    const interval = hourly.interval();
    const count = Math.floor((timeEnd - timeStart) / interval);

    const tempArray = hourly.variables(0)?.valuesArray() || [];
    const rainArray = hourly.variables(1)?.valuesArray() || [];
    const codeArray = hourly.variables(2)?.valuesArray() || [];

    const dayStats: Record<string, { temps: number[]; rains: number[]; codes: number[] }> = {};

    for (let i = 0; i < count; i++) {
      const date = new Date((timeStart + i * interval + utcOffsetSeconds) * 1000);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!dayStats[dateKey]) {
        dayStats[dateKey] = { temps: [], rains: [], codes: [] };
      }

      if (tempArray[i] !== undefined) dayStats[dateKey].temps.push(tempArray[i]);
      if (rainArray[i] !== undefined) dayStats[dateKey].rains.push(rainArray[i]);
      if (codeArray[i] !== undefined) dayStats[dateKey].codes.push(codeArray[i]);
    }

    for (const [dateKey, stats] of Object.entries(dayStats)) {
      const minTemp = stats.temps.length ? Math.round(Math.min(...stats.temps)) : currentWeather.temperature;
      const maxTemp = stats.temps.length ? Math.round(Math.max(...stats.temps)) : currentWeather.temperature;
      const avgTemp = stats.temps.length
        ? Math.round(stats.temps.reduce((a, b) => a + b, 0) / stats.temps.length)
        : currentWeather.temperature;
      const totalRain = stats.rains.length ? stats.rains.reduce((a, b) => a + b, 0) : 0;

      const midDayIndex = Math.floor(stats.codes.length / 2);
      const weatherCode = stats.codes.length ? Math.round(stats.codes[midDayIndex] || stats.codes[0]) : 0;
      const condition = interpretWeatherCode(weatherCode);

      dailyMap[dateKey] = {
        temperature: avgTemp,
        minTemp,
        maxTemp,
        weatherCode,
        description: condition.description,
        iconName: condition.iconName,
        rain: Number(totalRain.toFixed(1)),
      };
    }

    // Vincula minTemp e maxTemp ao currentWeather baseando-se no primeiro dia retornado
    const firstDateKey = Object.keys(dailyMap)[0];
    if (firstDateKey && dailyMap[firstDateKey]) {
      currentWeather.minTemp = dailyMap[firstDateKey].minTemp;
      currentWeather.maxTemp = dailyMap[firstDateKey].maxTemp;
    }
  }

  const report: WeatherReport = {
    current: currentWeather,
    daily: dailyMap,
    location: activeLocation,
  };

  cachedReport = {
    report,
    timestamp: now,
    key: cacheKey,
  };

  return report;
}
