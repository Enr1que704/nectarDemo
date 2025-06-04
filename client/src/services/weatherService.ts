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
        console.log("zoneData", zoneData);
        const zoneIds = zoneData.map(zone => zone.id);
        const response = await fetch(`${API_BASE_URL}/weather/zoneForecast?zoneIds=${zoneIds.join(',')}`);
        const forecasts = await response.json();
        
        return forecasts.map((forecast: any, index: number) => ({
            zoneId: zoneData[index].id,
            zoneName: zoneData[index].name,
            forecast: {
                periods: forecast.properties.periods.map((period: any) => ({
                    number: period.number,
                    name: period.name,
                    detailedForecast: period.detailedForecast
                }))
            }
        }));
    },
    

    async getWeatherByState(state: string): Promise<ZoneForecast[]> {
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
            const zoneData: ZoneData = await zoneResponse.json();
            
            // Transform features into zones
            const zones: Zone[] = zoneData.features.map(feature => ({
                zoneId: feature.properties.id,
                zoneName: feature.properties.name
            }));
            
            // Fetch all zone forecasts in parallel
            const zoneForecasts = await Promise.all(
                zones.map(async (zone) => {
                    const response = await fetch(`${API_BASE_URL}/weather/zoneForecast?zoneId=${zone.zoneId}`);
                    const forecastData: ZoneForecastData = await response.json();
                    
                    // Transform periods data
                    const periods: Period[] = forecastData.properties.periods.map(period => ({
                        number: period.number,
                        name: period.name,
                        detailedForecast: period.detailedForecast
                    }));

                    // Create the zone forecast object
                    return {
                        zoneId: zone.zoneId,
                        zoneName: zone.zoneName,
                        forecast: { periods }
                    };
                })
            );
            
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