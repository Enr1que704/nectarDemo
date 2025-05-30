<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { weatherService } from '../services/weatherService';
import type { ZoneForecast } from '../types/weather';

let weather = ref<ZoneForecast[]>([]);
let isLoading = ref<boolean>(true);

onMounted(async () => {
    const weatherData = await weatherService.getWeatherByState('UT');
    weather.value = weatherData;
    isLoading.value = false;
    console.log(weather.value);
})
</script>

<template>
    <div>
        <h1 class="weather-title">Weather</h1>
        <div v-if="isLoading">
            <h1>Loading...</h1>
        </div>
        <div v-else>
            <div class="weather-container">
                <div v-for="zone in weather" :key="zone.zoneId" class="weather-zone">
                    <h2>{{ zone.zoneName }}</h2>
                    <div class="forecast-cards">
                        <div v-for="period in zone.forecast.periods" :key="period.number" class="forecast-card">
                            <h3>{{ period.name }}</h3>
                            <p>{{ period.detailedForecast }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.weather-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: var(--text-color);
}

.weather-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--background-color);
}

.weather-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--accent-color);
    border-radius: var(--border-radius-large);
    padding: 24px;
    margin: 20px;
    width: 100%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    background-color: var(--background-color);
}

.weather-zone h2 {
    color: var(--text-color);
    font-size: 1.5rem;
    margin-bottom: 16px;
    border-bottom: 2px solid var(--accent-color);
    padding-bottom: 8px;
    width: 100%;
    text-align: center;
}

.forecast-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    width: 100%;
    margin-top: 20px;
}

.forecast-card {
    background: #f8fafc;
    border-radius: var(--border-radius-large);
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all var(--transition-normal);
    border: 1px solid var(--secondary-color);
}

.forecast-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
}

.forecast-card h3 {
    margin-top: 0;
    color: var(--text-color);
    font-size: 1.25rem;
    margin-bottom: 12px;
    font-weight: 600;
}

.forecast-card p {
    color: var(--text-color);
    line-height: 1.6;
    margin: 0;
    font-size: 0.95rem;
}

@media (max-width: 768px) {
    .forecast-cards {
        grid-template-columns: 1fr;
    }
    
    .weather-zone {
        padding: 16px;
        margin: 16px;
    }
    
    .forecast-card {
        padding: 16px;
    }
}
</style>