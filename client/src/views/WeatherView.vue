<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { weatherService } from '../services/weatherService';
import type { ZoneForecast, Zone } from '../types/weather';
import US_STATES from '../data/states.json';
import SearchableDropdown from '../components/SearchableDropdown.vue';

let weather = ref<ZoneForecast[]>([]);
let zones = ref<Zone[]>([]);
let isLoading = ref<boolean>(false);
let selectedState = ref('');
let hasSearched = ref<boolean>(false);
let loadingDots = ref(0);
let selectedZones = ref<string[]>([]);
let showZones = ref<boolean>(false);

const loadingText = computed(() => {
    return `Loading${'.'.repeat(loadingDots.value)}`;
});

let loadingInterval: number;

onMounted(() => {
    loadingInterval = window.setInterval(() => {
        loadingDots.value = (loadingDots.value + 1) % 4;
    }, 500);
});

onUnmounted(() => {
    if (loadingInterval) {
        clearInterval(loadingInterval);
    }
});

const getStateZones = async (state: string) => {
    isLoading.value = true;
    try {
        const stateZones = await weatherService.getStateZones(state);
        zones.value = stateZones;
        showZones.value = true;
        weather.value = []; 
    } catch (error) {
        console.error('Error fetching zones:', error);
    } finally {
        isLoading.value = false;
    }
};

const handleStateSelect = async (state: string) => {
    selectedZones.value = []; 
    await getStateZones(state);
};

const handleSelectAll = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
        selectedZones.value = zones.value.map(zone => zone.zoneId);
    } else {
        selectedZones.value = [];
    }
};

const fetchSelectedZonesWeather = async () => {
    if (selectedZones.value.length === 0) return;
    isLoading.value = true;
    hasSearched.value = true;
    try {
        const zoneData = selectedZones.value.map(zoneId => {
            const zone = zones.value.find(z => z.zoneId === zoneId);
            return {
                id: zoneId,
                name: zone?.zoneName || ''
            };
        });
        const weatherData = await weatherService.getWeatherByZoneBatch(zoneData);
        if (!weatherData || weatherData.length === 0) {
            weather.value = [];
            showZones.value = false;
            return;
        }
        weather.value = weatherData;
        showZones.value = false;
    } catch (error) {
        console.error('Error fetching weather:', error);
        weather.value = [];
        showZones.value = false;
    } finally {
        isLoading.value = false;
    }
};

const clearList = () => {
    selectedState.value = '';
    weather.value = [];
    selectedZones.value = [];
    zones.value = [];
    showZones.value = false;
    hasSearched.value = false;
};
</script>

<template>
    <div>
        <h1 class="weather-title">Weather</h1>
        
        <div class="state-selector">
            <div class="dropdown-container">
                <SearchableDropdown
                    v-bind:items="US_STATES"
                    v-model="selectedState"
                    placeholder="Search for a state..."
                    @select="handleStateSelect"
                />
                <button class="clear-button" @click="clearList">
                    Clear
                </button>
            </div>
        </div>

        <div v-if="isLoading">
            <h1 class="loading-text">{{ loadingText }}</h1>
        </div>
        <div v-else-if="showZones && zones.length > 0">
            <div class="zones-container">
                <h2>Select Zones</h2>
                <div class="zones-list">
                    <div class="zone-item select-all">
                        <label class="zone-checkbox">
                            <input
                                type="checkbox"
                                :checked="selectedZones.length === zones.length"
                                @change="handleSelectAll"
                            >
                            <span class="zone-name">Select All</span>
                        </label>
                    </div>
                    <div v-for="zone in zones" :key="zone.zoneId" class="zone-item">
                        <label class="zone-checkbox">
                            <input
                                type="checkbox"
                                v-bind:value="zone.zoneId"
                                v-model="selectedZones"
                            >
                            <span class="zone-name">{{ zone.zoneName }}</span>
                        </label>
                    </div>
                </div>
                <button 
                    class="fetch-weather-button" 
                    @click="fetchSelectedZonesWeather"
                    :disabled="selectedZones.length === 0"
                >
                    Get Weather for Selected Zones
                </button>
            </div>
        </div>
        <div v-else-if="weather.length > 0">
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
        <div v-else-if="hasSearched">
            <h1 class="loading-text">No weather data found.</h1>
            <!-- !! Uncomment for a good time !!-->
            <h1 class="loading-text">Play a game to pass the time!</h1>
            <div class="game-container">
                <iframe 
                    src="/game/index.html" 
                    class="game-frame"
                    title="Chrome Dino Game"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
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

.loading-text {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
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

.state-selector {
    max-width: 400px;
    margin: 0 auto 20px;
}

.dropdown-container {
    display: flex;
    gap: 10px;
    align-items: center;
}

.clear-button {
    padding: 8px 16px;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.clear-button:hover {
    background-color: #e0e0e0;
}

.game-container {
    width: 100%;
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: var(--background-color);
    border-radius: var(--border-radius-large);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.game-frame {
    width: 100%;
    height: 600px;
    border: none;
    border-radius: var(--border-radius-large);
    background-color: #000;
}

@media (max-width: 768px) {
    .game-frame {
        height: 400px;
    }
}

.zones-container {
    max-width: 600px;
    margin: 0 auto 20px;
    padding: 20px;
    background-color: var(--background-color);
    border-radius: var(--border-radius-large);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.zones-container h2 {
    color: var(--text-color);
    font-size: 1.5rem;
    margin-bottom: 16px;
    text-align: center;
}

.zones-list {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid var(--secondary-color);
    border-radius: var(--border-radius-large);
}

.zone-item {
    padding: 8px 0;
}

.zone-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.zone-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.zone-name {
    color: var(--text-color);
    font-size: 1rem;
}

.fetch-weather-button {
    width: 100%;
    padding: 12px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius-large);
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s ease;
}

.fetch-weather-button:hover:not(:disabled) {
    background-color: var(--primary-color-dark);
}

.fetch-weather-button:disabled {
    background-color: var(--secondary-color);
    cursor: not-allowed;
    opacity: 0.7;
}

.select-all {
    border-bottom: 1px solid var(--secondary-color);
    margin-bottom: 8px;
    padding-bottom: 12px;
}

.select-all .zone-name {
    font-weight: 600;
}
</style>