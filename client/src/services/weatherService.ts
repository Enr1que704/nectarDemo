import type { Forecast, Period, Zone, ZoneForecast } from "@/types/weather";

const API_BASE_URL = 'http://localhost:3001/api';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY_PREFIX = 'weather_cache_';

interface CacheEntry {
    data: ZoneForecast[];
    timestamp: number;
}

interface ZoneFeature {
    properties: {
        id: string;
        name: string;
    };
}

interface ZoneData {
    features: ZoneFeature[];
}

interface ZoneForecastData {
    properties: {
        periods: Array<{
            number: number;
            name: string;
            detailedForecast: string;
        }>;
    };
}

interface ZoneBatchData {
    id: string;
    name: string;
}

/*
WEATHER FLOW:
zones/ - get all state zones
- area (State)
- type (forecast)
- include_geometry (false)
returns:
- id (zone)
- name (area, such as Southeast Utah)

zones/type/zoneId/forecast/
- zoneId (zone)
- type (forecast)
returns:
- periods (array of objects)

*/

export const weatherService = {

    async getStateZones(state: string): Promise<Zone[]> {
        const response = await fetch(`${API_BASE_URL}/weather/stateZones?state=${state}`);
        const zoneData: ZoneData = await response.json();
        return zoneData.features.map(feature => ({
            zoneId: feature.properties.id,
            zoneName: feature.properties.name
        }));
    },

    async getWeatherByZoneBatch(zoneData: ZoneBatchData[]): Promise<ZoneForecast[]> {
        const now = Date.now();
        const zonesToFetch: ZoneBatchData[] = [];
        const cachedResults: ZoneForecast[] = [];

        for (const zone of zoneData) {
            const cacheKey = `${CACHE_KEY_PREFIX}${zone.id}`;
            const cachedData = localStorage.getItem(cacheKey);
            
            if (cachedData) {
                const { data, timestamp }: CacheEntry = JSON.parse(cachedData);
                if (now - timestamp < CACHE_DURATION_MS) {
                    cachedResults.push(data[0]); 
                    continue;
                }
                localStorage.removeItem(cacheKey);
            }
            zonesToFetch.push(zone);
        }

        if (zonesToFetch.length === 0) {
            return cachedResults;
        }

        const zoneIds = zonesToFetch.map(zone => zone.id);
        const response = await fetch(`${API_BASE_URL}/weather/zoneForecast?zoneIds=${zoneIds.join(',')}`);
        const forecasts = await response.json();
        
        const newForecasts = forecasts.map((forecast: any, index: number) => {
            const zoneForecast: ZoneForecast = {
                zoneId: zonesToFetch[index].id,
                zoneName: zonesToFetch[index].name,
                forecast: {
                    periods: forecast.properties.periods.map((period: any) => ({
                        number: period.number,
                        name: period.name,
                        detailedForecast: period.detailedForecast
                    }))
                }
            };

            const cacheKey = `${CACHE_KEY_PREFIX}${zoneForecast.zoneId}`;
            const cacheEntry: CacheEntry = {
                data: [zoneForecast],
                timestamp: now
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

            return zoneForecast;
        });

        return [...cachedResults, ...newForecasts];
    },
    
    // DEPRECATED
    async getWeatherByState(state: string): Promise<ZoneForecast[]> {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}${state}`;
            const cachedData = localStorage.getItem(cacheKey);
            
            if (cachedData) {
                const { data, timestamp }: CacheEntry = JSON.parse(cachedData);
                const now = Date.now();
                
                if (now - timestamp < CACHE_DURATION_MS) {
                    return data;
                }
                
                localStorage.removeItem(cacheKey);
            }

            const zoneResponse = await fetch(`${API_BASE_URL}/weather/stateZones?state=${state}`);
            const zoneData: ZoneData = await zoneResponse.json();
            
            const zones: Zone[] = zoneData.features.map(feature => ({
                zoneId: feature.properties.id,
                zoneName: feature.properties.name
            }));
            
            const zoneForecasts = await Promise.all(
                zones.map(async (zone) => {
                    const response = await fetch(`${API_BASE_URL}/weather/zoneForecast?zoneId=${zone.zoneId}`);
                    const forecastData: ZoneForecastData = await response.json();
                    
                    const periods: Period[] = forecastData.properties.periods.map(period => ({
                        number: period.number,
                        name: period.name,
                        detailedForecast: period.detailedForecast
                    }));

                    return {
                        zoneId: zone.zoneId,
                        zoneName: zone.zoneName,
                        forecast: { periods }
                    };
                })
            );
            
            const cacheEntry: CacheEntry = {
                data: zoneForecasts,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
            
            return zoneForecasts;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    },

    clearCache(state?: string) {
        if (state) {
            localStorage.removeItem(`${CACHE_KEY_PREFIX}${state}`);
        } else {
            Object.keys(localStorage)
                .filter(key => key.startsWith(CACHE_KEY_PREFIX))
                .forEach(key => localStorage.removeItem(key));
        }
    }
}