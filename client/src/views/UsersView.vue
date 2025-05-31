<script setup lang="ts">
import UserList from '../components/UserList.vue';
import { ref, onMounted } from 'vue';
import { userService } from '../services/userService';
import type { User } from '../types/user';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import COUNTRIES from '../data/countries.json';

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | undefined>(undefined);
const country = ref<string>('');

const fetchUsers = async () => {
    loading.value = true;
    error.value = undefined;
    try {
        users.value = await userService.getUsersByCountry(country.value);
    } catch (err) {
        error.value = 'Failed to fetch users. Please try again later.';
        console.error('Error fetching users:', err);
    } finally {
        loading.value = false;
    }
}

const handleCountrySelect = (value: string) => {
    country.value = value;
    console.log(country.value);
    fetchUsers();
}

const clearList = () => {
    console.log('clearing list');
    country.value = '';
    users.value = [];
}

const showDuplicates = async () => {
    loading.value = true;
    error.value = undefined;
    try {
        const duplicates = await userService.getDuplicates();
        for (const duplicate of duplicates) {
            // console.log(duplicate._count.first_name)
            const user: User = {
                ...duplicate,
                // count: duplicate._count.first_name
            }
            console.log(user);
            users.value.push(user);
        }
    } catch (err) {
        error.value = 'Failed to fetch duplicates. Please try again later.';
        console.error('Error fetching duplicates:', err);
    } finally {
        loading.value = false;
    }
}

</script>

<template>
    <div>
        <div class="header-container">
            <h1 class="user-list-title">User List</h1>
            <button class="duplicates-button" @click="showDuplicates">
                Show Duplicates!!
            </button>
        </div>
        <div class="country-selector">
            <div class="dropdown-container">
                <SearchableDropdown
                    v-bind:items="COUNTRIES"
                    v-model="country"
                    @select="handleCountrySelect"
                    prompt="Search by Country..."
                />
                <button class="clear-button" @click="clearList">
                    Clear
                </button>
            </div>
        </div>
        <div v-if="!loading && !error && users.length === 0 && country !== ''" class="no-users">
            {{ country ? `No users found in ${COUNTRIES.find(c => c.value === country)?.label}` : 'No users found' }}
        </div>
        <UserList 
            :users="users" 
            :loading="loading"
            :error="error"
        />
    </div>
</template>

<style scoped>
.header-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
}

.user-list-title {
    color: var(--text-color);
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
}

.duplicates-button {
    padding: 8px 16px;
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.duplicates-button:hover {
    background-color: #e0e0e0;
}

.country-selector {
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

.no-users {
    color: var(--text-color);
    text-align: center;
    padding: var(--spacing-large);
    background-color: rgba(26, 34, 56, 0.1);
    border-radius: var(--border-radius-small);
    margin: var(--spacing-medium) 0;
}
</style>
