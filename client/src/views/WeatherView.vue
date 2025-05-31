<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { weatherService } from '../services/weatherService';
import type { ZoneForecast } from '../types/weather';

const US_STATES = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
];

let weather = ref<ZoneForecast[]>([]);
let isLoading = ref<boolean>(false);
let selectedState = ref('');
let searchQuery = ref('');
let isDropdownOpen = ref(false);

const filteredStates = computed(() => {
    return US_STATES.filter(state => 
        state.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        state.value.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const fetchWeather = async (state: string) => {
    isLoading.value = true;
    try {
        const weatherData = await weatherService.getWeatherByState(state);
        weather.value = weatherData;
    } catch (error) {
        console.error('Error fetching weather:', error);
    } finally {
        isLoading.value = false;
    }
};

const selectState = (state: string) => {
    selectedState.value = state;
    isDropdownOpen.value = false;
    searchQuery.value = '';
    fetchWeather(state);
};

// ensures the selected dropdown value gets stored before the dropdown closes
const handleBlur = () => {
    setTimeout(() => {
        isDropdownOpen.value = false;
    }, 200);
};

// onMounted(() => {
//     fetchWeather(selectedState.value);
// });
</script>

<template>
    <div>
        <h1 class="weather-title">Weather</h1>
        
        <div class="state-selector">
            <div class="dropdown-container">
                <input
                    type="text"
                    v-model="searchQuery"
                    @focus="isDropdownOpen = true"
                    @blur="handleBlur" 
                    placeholder="Search for a state..."
                    class="state-input"
                />
                <div v-if="isDropdownOpen" class="dropdown-list">
                    <div
                        v-for="state in filteredStates"
                        :key="state.value"
                        @mousedown="selectState(state.value)"
                        class="dropdown-item"
                    >
                        {{ state.label }} ({{ state.value }})
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isLoading">
            <h1 class="loading-text">Loading...</h1>
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
    position: relative;
}

.dropdown-container {
    position: relative;
}

.state-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--accent-color);
    border-radius: var(--border-radius-large);
    font-size: 1rem;
    background-color: var(--background-color);
    color: var(--text-color);
}

.state-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

.dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 300px;
    overflow-y: auto;
    background-color: var(--background-color);
    border: 1px solid var(--accent-color);
    border-radius: var(--border-radius-large);
    margin-top: 4px;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
    padding: 10px 12px;
    cursor: pointer;
    transition: background-color var(--transition-normal);
}

.dropdown-item:hover {
    background-color: var(--secondary-color);
}

.dropdown-item:active {
    background-color: var(--accent-color);
}
</style>