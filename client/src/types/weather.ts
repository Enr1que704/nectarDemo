export interface Zone {
    zoneId: string;
    zoneName: string;
}

export interface ZoneForecast {
    zoneId: string;
    zoneName: string;
    forecast: Forecast;
}

export interface Forecast {
    periods: Period[];
}

export interface Period {
    number: number;
    name: string
    detailedForecast: string;
}

