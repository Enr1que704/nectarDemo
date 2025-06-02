import type { Forecast, Period, Zone, ZoneForecast } from "@/types/weather";

const API_BASE_URL = 'http://localhost:3001/api';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY_PREFIX = 'weather_cache_';

interface CacheEntry {
    data: ZoneForecast[];
    timestamp: number;
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
    async getWeatherByState(state: string): Promise<any> {
        try {
            // Check cache first
            const cacheKey = `${CACHE_KEY_PREFIX}${state}`;
            const cachedData = localStorage.getItem(cacheKey);
            
            if (cachedData) {
                const { data, timestamp }: CacheEntry = JSON.parse(cachedData);
                const now = Date.now();
                
                // If cache is still valid, return cached data
                if (now - timestamp < CACHE_DURATION_MS) {
                    return data;
                }
                
                // If cache is expired, remove it
                localStorage.removeItem(cacheKey);
            }

            // If no cache or expired, fetch new data
            const zoneResponse = await fetch(`${API_BASE_URL}/weather/stateZones?state=${state}`);
            const zoneData = await zoneResponse.json();
            let zoneIds: Zone[] = []
            let zoneForecasts: ZoneForecast[] = []
            
            for (let i = 0; i < zoneData.features.length; i++) {
                const zone: Zone = {
                    zoneId: zoneData.features[i].properties.id,
                    zoneName: zoneData.features[i].properties.name
                }
                zoneIds.push(zone);
            }
            
            for (let i = 0; i < zoneIds.length; i++) {
                const zoneForecastResponse = await fetch(`${API_BASE_URL}/weather/zoneForecast?zoneId=${zoneIds[i].zoneId}`);
                const zoneForecastData = await zoneForecastResponse.json();
                let periods: Period[] = []
                for (let j = 0; j < zoneForecastData.properties.periods.length; j++) {
                    let period: Period = {
                        number: zoneForecastData.properties.periods[j].number,
                        name: zoneForecastData.properties.periods[j].name,
                        detailedForecast: zoneForecastData.properties.periods[j].detailedForecast
                    }
                    periods.push(period);
                }
                let forecast: Forecast = {
                    periods: periods
                }
                let data: ZoneForecast = {
                    zoneId: zoneIds[i].zoneId,
                    zoneName: zoneIds[i].zoneName,
                    forecast: forecast
                }
                zoneForecasts.push(data);
            }
            
            // Cache the new data
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

    // Optional: Add a method to clear the cache
    clearCache(state?: string) {
        if (state) {
            localStorage.removeItem(`${CACHE_KEY_PREFIX}${state}`);
        } else {
            // Clear all weather cache entries
            Object.keys(localStorage)
                .filter(key => key.startsWith(CACHE_KEY_PREFIX))
                .forEach(key => localStorage.removeItem(key));
        }
    }
}