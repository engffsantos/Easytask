import React, { useState, useEffect, useTransition } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Check,
  Loader2,
  Building2,
  Sparkles,
} from 'lucide-react';
import {
  LocationConfig,
  POPULAR_LOCATIONS,
  searchCities,
  GeocodingResult,
} from '../services/weatherService';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: LocationConfig;
  onSelectLocation: (location: LocationConfig) => void;
  onUseGps: () => void;
  isLoadingGps?: boolean;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onUseGps,
  isLoadingGps = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, startTransition] = useTransition();

  // Fecha com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounce na busca de cidades
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchCities(query);
        startTransition(() => {
          setSearchResults(results);
          setIsSearching(false);
        });
      } catch {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Limpa estados ao fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSearchResult = (res: GeocodingResult) => {
    const newLocation: LocationConfig = {
      name: res.name,
      state: res.admin1,
      country: res.country,
      latitude: res.latitude,
      longitude: res.longitude,
      isGps: false,
    };
    onSelectLocation(newLocation);
    onClose();
  };

  const handleSelectPopular = (loc: LocationConfig) => {
    onSelectLocation(loc);
    onClose();
  };

  const isCurrentActive = (loc: LocationConfig) => {
    if (!currentLocation) return false;
    if (loc.isGps && currentLocation.isGps) return true;
    return (
      Math.abs(loc.latitude - currentLocation.latitude) < 0.05 &&
      Math.abs(loc.longitude - currentLocation.longitude) < 0.05
    );
  };

  return (
    <div
      id="location-picker-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="location-picker-card"
        className="w-full max-w-lg bg-white dark:bg-[#132032] rounded-3xl p-5 sm:p-6 border border-[#d8f0f3] dark:border-[#1e334a] modern-shadow space-y-4 max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-cyan-sky text-white flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="location-picker-title"
                className="text-lg font-black text-slate-800 dark:text-white"
              >
                Escolher Localização
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione sua cidade para ver o clima e as previsões
              </p>
            </div>
          </div>
          <button
            id="close-location-modal-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botão de Localização Automática (GPS) */}
        <button
          id="btn-use-current-gps"
          type="button"
          onClick={() => {
            onUseGps();
            onClose();
          }}
          disabled={isLoadingGps}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between border transition-all duration-200 cursor-pointer ${
            currentLocation?.isGps
              ? 'gradient-cyan-sky text-white border-transparent shadow-md shadow-cyan-500/25'
              : 'bg-[#f0fafb] dark:bg-[#0e1b2a] text-slate-700 dark:text-slate-200 border-[#d8f0f3] dark:border-[#1e334a] hover:border-[#2ad0ca]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                currentLocation?.isGps
                  ? 'bg-white/20 text-white'
                  : 'bg-[#2ad0ca]/15 text-[#0284c7] dark:text-[#38bdf8]'
              }`}
            >
              {isLoadingGps ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">
                Minha Localização Atual (GPS)
              </p>
              <p
                className={`text-[11px] ${
                  currentLocation?.isGps
                    ? 'text-white/80'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                Detectar automaticamente via GPS do navegador
              </p>
            </div>
          </div>
          {currentLocation?.isGps && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Campo de Busca em Tempo Real */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-city-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar qualquer cidade (ex: Campinas, Santos, Lisboa)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0c1826] text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-[#1e334a] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2ad0ca] focus:border-transparent transition-all"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
          )}
          {searchQuery && !isSearching && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Resultados da Busca (se houver pesquisa ativa) */}
        {searchQuery.trim().length >= 2 && (
          <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Resultados da Pesquisa
            </p>
            {searchResults.length === 0 && !isSearching ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">
                Nenhuma cidade encontrada para &quot;{searchQuery}&quot;.
              </p>
            ) : (
              searchResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full p-2.5 rounded-xl text-left flex items-center justify-between hover:bg-[#f0fafb] dark:hover:bg-[#0e1b2a] border border-transparent hover:border-[#d8f0f3] dark:hover:border-[#1e334a] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {res.name}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        {res.admin1 ? `${res.admin1}, ` : ''}
                        {res.country || ''}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Cidades Mais Populares */}
        <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 px-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Capitais e Principais Cidades</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {POPULAR_LOCATIONS.map((loc) => {
              const active = isCurrentActive(loc);
              return (
                <button
                  key={`${loc.name}-${loc.state}`}
                  type="button"
                  onClick={() => handleSelectPopular(loc)}
                  className={`p-2.5 rounded-xl text-left flex items-center justify-between border transition-all duration-150 cursor-pointer text-xs ${
                    active
                      ? 'bg-[#e0f7f8] dark:bg-[#163348] border-[#2ad0ca] text-[#0284c7] dark:text-[#38bdf8] font-bold shadow-2xs'
                      : 'bg-slate-50 dark:bg-[#0c1826] text-slate-700 dark:text-slate-300 border-slate-100 dark:border-[#1a2d42] hover:border-[#2ad0ca]/60'
                  }`}
                >
                  <span className="truncate">
                    {loc.name}, {loc.state}
                  </span>
                  {active && <Check className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
