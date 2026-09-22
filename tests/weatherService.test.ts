import { describe, it, expect, beforeEach } from 'vitest';
import {
  interpretWeatherCode,
  saveLocation,
  getSavedLocation,
  clearSavedLocation,
  POPULAR_LOCATIONS,
  LocationConfig,
} from '../src/services/weatherService';

describe('Serviço de Clima (interpretWeatherCode)', () => {
  it('deve interpretar código 0 como Céu Limpo com ícone Sun', () => {
    const result = interpretWeatherCode(0);
    expect(result.description).toBe('Céu Limpo');
    expect(result.iconName).toBe('Sun');
  });

  it('deve interpretar código 2 como Parc. Nublado com ícone CloudSun', () => {
    const result = interpretWeatherCode(2);
    expect(result.description).toBe('Parc. Nublado');
    expect(result.iconName).toBe('CloudSun');
  });

  it('deve interpretar código 3 como Nublado com ícone Cloud', () => {
    const result = interpretWeatherCode(3);
    expect(result.description).toBe('Nublado');
    expect(result.iconName).toBe('Cloud');
  });

  it('deve interpretar código 61 e 65 como Chuva e Chuva Forte com ícone CloudRain', () => {
    const r61 = interpretWeatherCode(61);
    expect(r61.description).toBe('Chuva');
    expect(r61.iconName).toBe('CloudRain');

    const r65 = interpretWeatherCode(65);
    expect(r65.description).toBe('Chuva Forte');
    expect(r65.iconName).toBe('CloudRain');
  });

  it('deve interpretar código 95 como Tempestade com ícone CloudLightning', () => {
    const result = interpretWeatherCode(95);
    expect(result.description).toBe('Tempestade');
    expect(result.iconName).toBe('CloudLightning');
  });

  it('deve fornecer fallback seguro para códigos não mapeados', () => {
    const result = interpretWeatherCode(999);
    expect(result.description).toBe('Instável');
    expect(result.iconName).toBe('CloudSun');
  });
});

describe('Gerenciamento de Localização', () => {
  beforeEach(() => {
    clearSavedLocation();
  });

  it('deve conter lista de capitais populares com dados válidos', () => {
    expect(POPULAR_LOCATIONS.length).toBeGreaterThan(5);
    const sp = POPULAR_LOCATIONS.find((l) => l.name === 'São Paulo');
    expect(sp).toBeDefined();
    expect(sp?.latitude).toBeCloseTo(-23.55, 1);
    expect(sp?.longitude).toBeCloseTo(-46.63, 1);
  });

  it('deve salvar e recuperar a localização no localStorage', () => {
    const mockLocation: LocationConfig = {
      name: 'Curitiba',
      state: 'PR',
      latitude: -25.4284,
      longitude: -49.2733,
    };

    saveLocation(mockLocation);
    const saved = getSavedLocation();
    expect(saved).toEqual(mockLocation);
  });

  it('deve limpar a localização salva', () => {
    const mockLocation: LocationConfig = {
      name: 'Salvador',
      state: 'BA',
      latitude: -12.9777,
      longitude: -38.5016,
    };

    saveLocation(mockLocation);
    clearSavedLocation();
    expect(getSavedLocation()).toBeNull();
  });
});
