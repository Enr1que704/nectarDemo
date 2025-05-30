import type { Zone, ZoneForecast } from "@/types/weather";

const API_BASE_URL = 'http://localhost:3001/api';

//TODO: Investigate the weather API results to create a type for the weather data

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
                let data: ZoneForecast = {
                    zoneId: zoneIds[i].zoneId,
                    zoneName: zoneIds[i].zoneName,
                    forecast: zoneForecastData.properties.periods
                }
                zoneForecasts.push(data);
            }
            return zoneForecasts;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

}