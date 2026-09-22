import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import {
  fetchCurrentAndForecastWeather,
  WeatherReport,
  WeatherCondition,
  LocationConfig,
  saveLocation,
  getSavedLocation,
  getGpsCoordinates,
} from '../services/weatherService';
import { LocationPickerModal } from './LocationPickerModal';

interface CalendarStripProps {
  selectedDate: string; // 'YYYY-MM-DD' ou 'all'
  onSelectDate: (date: string) => void;
}

/**
 * Renderiza o ícone apropriado do Lucide conforme a condição climática
 */
function renderWeatherIcon(iconName: WeatherCondition['iconName'], className: string = 'w-3 h-3') {
  switch (iconName) {
    case 'Sun':
      return <Sun className={className} />;
    case 'CloudSun':
      return <CloudSun className={className} />;
    case 'Cloud':
      return <Cloud className={className} />;
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={className} />;
    case 'CloudLightning':
      return <CloudLightning className={className} />;
    case 'Snowflake':
      return <Snowflake className={className} />;
    case 'CloudFog':
      return <CloudFog className={className} />;
    default:
      return <CloudSun className={className} />;
  }
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [weatherReport, setWeatherReport] = useState<WeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isLoadingGps, setIsLoadingGps] = useState<boolean>(false);

  // Carrega os dados meteorológicos utilizando a API Open-Meteo
  const loadWeather = useCallback(async (locationToUse?: LocationConfig, force = false) => {
    try {
      setIsLoadingWeather(true);
      const report = await fetchCurrentAndForecastWeather(locationToUse, force);
      setWeatherReport(report);
    } catch (err) {
      console.error('Não foi possível carregar os dados meteorológicos:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Manipulador para quando o usuário seleciona uma nova cidade
  const handleSelectLocation = async (newLocation: LocationConfig) => {
    saveLocation(newLocation);
    await loadWeather(newLocation, true);
  };

  // Manipulador para quando o usuário opta pelo GPS
  const handleUseGps = async () => {
    try {
      setIsLoadingGps(true);
      const gpsLocation = await getGpsCoordinates();
      saveLocation(gpsLocation);
      await loadWeather(gpsLocation, true);
    } finally {
      setIsLoadingGps(false);
    }
  };

  const days = useMemo(() => {
    const list = [];
    const today = new Date();
    // Gera 7 dias: 2 antes de hoje, hoje, e 4 dias seguintes
    for (let i = -2; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const weekdayShort = d
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .replace('.', '')
        .toUpperCase();

      list.push({
        dateString,
        dayNumber: d.getDate(),
        weekdayShort,
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  // Dados climáticos do dia atualmente selecionado (se houver)
  const selectedDayWeather = useMemo(() => {
    if (selectedDate === 'all' || !weatherReport) return null;
    return weatherReport.daily[selectedDate] || null;
  }, [selectedDate, weatherReport]);

  return (
    <div
      id="calendar-strip-container"
      aria-label="Filtro de tarefas por data e previsão do tempo"
      className="w-full space-y-2.5"
    >
      {/* Cabeçalho com Filtro de Data e Seletor Interativo de Localização */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
            <span>Filtrar por Data</span>
          </div>

          {/* Botão para escolher a localização e ver a temperatura atual com mín/máx */}
          <button
            id="open-location-selector-btn"
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#132032] px-2.5 py-1 rounded-full border border-[#d8f0f3] dark:border-[#1e334a] shadow-2xs hover:border-[#2ad0ca] hover:shadow-xs transition-all cursor-pointer group"
            title="Clique para escolher outra cidade ou usar GPS"
            aria-label="Alterar localização do clima"
          >
            <MapPin className="w-3 h-3 text-[#0284c7] dark:text-[#38bdf8] group-hover:scale-110 transition-transform" />
            <span className="font-extrabold max-w-[120px] sm:max-w-[170px] truncate text-slate-800 dark:text-slate-100">
              {weatherReport?.location?.name || 'Localização'}
              {weatherReport?.location?.state ? `, ${weatherReport.location.state}` : ''}
            </span>

            {isLoadingWeather ? (
              <span className="w-2.5 h-2.5 rounded-full border border-cyan-500 border-t-transparent animate-spin ml-0.5" />
            ) : weatherReport?.current ? (
              <div className="flex items-center gap-1">
                <span className="text-slate-300 dark:text-slate-600">•</span>
                {renderWeatherIcon(weatherReport.current.iconName, 'w-3 h-3 text-amber-500 animate-float')}
                <span className="font-black text-[#0284c7] dark:text-[#38bdf8]">
                  {weatherReport.current.temperature}°C
                </span>
                {weatherReport.current.minTemp !== undefined && weatherReport.current.maxTemp !== undefined && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
                    <span className="text-cyan-600 dark:text-cyan-400">↓{weatherReport.current.minTemp}°</span>
                    <span className="mx-0.5">/</span>
                    <span className="text-amber-600 dark:text-amber-400">↑{weatherReport.current.maxTemp}°</span>
                  </span>
                )}
              </div>
            ) : null}

            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
          </button>
        </div>

        {selectedDate !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectDate('all')}
            className="text-[11px] font-bold text-[#0284c7] dark:text-[#38bdf8] hover:underline cursor-pointer"
          >
            Mostrar todas as datas
          </button>
        )}
      </div>

      {/* Faixa Horizontal de Dias */}
      <div className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        {/* Opção 'Todas' para desativar o filtro de data */}
        <button
          type="button"
          onClick={() => onSelectDate('all')}
          className={`flex-shrink-0 min-w-[56px] sm:min-w-[64px] py-2.5 sm:py-3 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none ${
            selectedDate === 'all'
              ? 'gradient-cyan-sky text-white shadow-lg shadow-cyan-400/35 scale-[1.03] font-bold'
              : 'bg-white dark:bg-[#132032] text-slate-600 dark:text-slate-300 border border-[#e0f2f4] dark:border-[#1e334a] hover:border-[#2ad0ca] hover:shadow-xs'
          }`}
        >
          <span
            className={`text-[10px] uppercase tracking-wider mb-0.5 ${
              selectedDate === 'all'
                ? 'text-white/90 font-bold'
                : 'text-slate-400 dark:text-slate-400 font-medium'
            }`}
          >
            Datas
          </span>
          <span className="text-xs sm:text-sm font-extrabold leading-tight">
            Todas
          </span>
        </button>

        {/* Dias da semana com temperatura, máxima e mínima */}
        {days.map((item) => {
          const isSelected = selectedDate === item.dateString;

          // Clima para o dia
          const dayWeather = item.isToday
            ? weatherReport?.current
            : weatherReport?.daily[item.dateString] || weatherReport?.current;

          return (
            <button
              key={item.dateString}
              type="button"
              onClick={() => onSelectDate(isSelected ? 'all' : item.dateString)}
              className={`flex-1 min-w-[54px] sm:min-w-[64px] py-2 sm:py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none ${
                isSelected
                  ? 'gradient-cyan-sky text-white shadow-lg shadow-cyan-400/35 scale-[1.03] font-bold'
                  : 'bg-white dark:bg-[#132032] text-slate-600 dark:text-slate-300 border border-[#e0f2f4] dark:border-[#1e334a] hover:border-[#2ad0ca] hover:shadow-xs'
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wider mb-0.5 ${
                  isSelected
                    ? 'text-white/90 font-bold'
                    : 'text-slate-400 dark:text-slate-400 font-medium'
                }`}
              >
                {item.weekdayShort}
              </span>

              {/* Número do dia */}
              <span className="text-sm sm:text-base font-extrabold leading-tight">
                {item.dayNumber}
              </span>

              {/* Informações do clima (Temperatura, Máxima e Mínima) no botão selecionado */}
              {isSelected && (
                <div
                  id={`weather-info-${item.dateString}`}
                  className="mt-1 flex flex-col items-center justify-center animate-weather-pop tracking-tight"
                  title={
                    dayWeather
                      ? `${dayWeather.description} • Média: ${dayWeather.temperature}°C (Mín: ${dayWeather.minTemp ?? '--'}°C, Máx: ${dayWeather.maxTemp ?? '--'}°C)`
                      : 'Carregando previsão...'
                  }
                >
                  {isLoadingWeather ? (
                    <span className="w-2.5 h-2.5 rounded-full border border-white/80 border-t-transparent animate-spin inline-block" />
                  ) : dayWeather ? (
                    <>
                      {/* Badge com Ícone e Temperatura Principal */}
                      <span className="flex items-center gap-0.5 bg-black/15 dark:bg-black/25 px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black text-white/95 leading-none">
                        {renderWeatherIcon(dayWeather.iconName, 'w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-200 drop-shadow-xs')}
                        <span>{dayWeather.temperature}°</span>
                      </span>

                      {/* Mínima e Máxima logo abaixo */}
                      {dayWeather.minTemp !== undefined && dayWeather.maxTemp !== undefined && (
                        <div className="flex items-center gap-1 text-[9px] font-black mt-0.5 leading-none">
                          <span className="text-cyan-100" title="Mínima">
                            ↓{dayWeather.minTemp}°
                          </span>
                          <span className="text-amber-100" title="Máxima">
                            ↑{dayWeather.maxTemp}°
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span>--°</span>
                  )}
                </div>
              )}

              {/* Ponto indicador de Hoje quando o botão não estiver selecionado */}
              {item.isToday && !isSelected && (
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 bg-[#2ad0ca]"
                  title="Hoje"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Cartão de Detalhes da Previsão para o Dia Selecionado com Mínima e Máxima */}
      {selectedDate !== 'all' && selectedDayWeather && (
        <div
          id="selected-day-weather-card"
          className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white dark:bg-[#132032] border border-[#d8f0f3] dark:border-[#1e334a] text-xs text-slate-700 dark:text-slate-200 animate-slide-down shadow-2xs"
        >
          <div className="flex items-center gap-2">
            {renderWeatherIcon(selectedDayWeather.iconName, 'w-4 h-4 text-amber-500 animate-float')}
            <span className="font-bold text-slate-800 dark:text-white">
              {selectedDayWeather.description}
            </span>
            {weatherReport?.location?.name && (
              <span className="text-slate-400 dark:text-slate-500 text-[11px] hidden sm:inline">
                em {weatherReport.location.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-extrabold text-[11px] sm:text-xs">
            {selectedDayWeather.minTemp !== undefined && (
              <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400" title="Temperatura Mínima">
                <span className="text-[10px] font-semibold text-slate-400">Mín:</span>
                <span>↓{selectedDayWeather.minTemp}°C</span>
              </span>
            )}
            {selectedDayWeather.maxTemp !== undefined && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Temperatura Máxima">
                <span className="text-[10px] font-semibold text-slate-400">Máx:</span>
                <span>↑{selectedDayWeather.maxTemp}°C</span>
              </span>
            )}
            {selectedDayWeather.rain > 0 && (
              <span className="text-blue-500 font-semibold hidden md:inline">
                ☔ {selectedDayWeather.rain}mm
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal para Escolher Localização */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={weatherReport?.location}
        onSelectLocation={handleSelectLocation}
        onUseGps={handleUseGps}
        isLoadingGps={isLoadingGps}
      />
    </div>
  );
};
