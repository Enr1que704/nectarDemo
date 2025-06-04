<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userService } from '../services/userService';
import type { User } from '../types/user';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import COUNTRIES from '../data/countries.json';
import DataCard from '@/components/DataCard.vue';
import UserCard from '@/components/UserCard.vue';
import Modal from '@/components/Modal.vue';

const users = ref<User[]>([]);
const duplicates = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | undefined>(undefined);
const country = ref<string>('');
const isModalOpen = ref(false);
const count = ref('');
const active = ref(true);
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
        if (users.value.length === 0) {
            error.value = 'No users found';
        }
    }
}

const handleCountrySelect = (value: string) => {
    country.value = value;
    fetchUsers();
}

const clearList = () => {
    country.value = '';
    users.value = [];
    error.value = undefined;
    duplicates.value = [];
    count.value = '';
}

const showDuplicates = async () => {
    isModalOpen.value = true;
    if (count.value === '') {
        return;
    }
    loading.value = true;
    error.value = undefined;
    try {
        const users = await userService.getDuplicateUsers(parseInt(count.value), active.value);
        duplicates.value = users;
        // duplicates.value = users.map((user: { first_name: string; last_name: string; _count: { first_name: number } }) => ({
        //     name: user.first_name + ' ' + user.last_name,
        //     count: user._count.first_name
        // }));
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
                Show Duplicates
            </button>
        </div>
        <div class="country-selector">
            <div class="dropdown-container">
                <SearchableDropdown
                    v-bind:items="COUNTRIES"
                    v-model="country"
                    @select="handleCountrySelect"
                    placeholder="Search by Country..."
                />
                <button class="clear-button" @click="clearList">
                    Clear
                </button>
            </div>
        </div>
        <div v-if="error" class="error-message">
            {{ error }}
        </div>
        <div v-else-if="users.length > 0" class="user-grid">
            <UserCard
                v-for="user in users"
                v-bind:key="user.id"
                v-bind:user="user"
            />
        </div>

        <Modal 
            v-bind:is-open="isModalOpen" 
            title="Duplicate Users"
            @close="isModalOpen = false"
        >
            <div>
                <input v-model="count" placeholder="More than X duplicates..." @blur="showDuplicates"/>
                <input type="checkbox" v-model="active" @change="showDuplicates" class="active-checkbox"> Active Users Only</input>
            </div>
            <div v-if="error" class="error-message">
                {{ error }}
            </div>
            <div v-else-if="duplicates.length > 0" class="user-grid">
                <DataCard
                    v-for="duplicate in duplicates"
                    v-bind:key="duplicate[0]"
                    v-bind:data="duplicate[0]"
                    v-bind:count="duplicate[1]"
                />
            </div>
            <div v-else class="no-duplicates">
                No duplicates found
            </div>
        </Modal>
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

.error-message {
    color: var(--text-color);
    text-align: center;
    padding: var(--spacing-large);
    background-color: rgba(26, 34, 56, 0.1);
    border-radius: var(--border-radius-small);
    margin: var(--spacing-medium) 0;
}

.user-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-medium);
    max-width: 1200px;
    margin: var(--spacing-large) auto;
    padding: 0 var(--spacing-medium);
}

.loading-message {
    text-align: center;
    padding: var(--spacing-large);
    color: var(--text-color);
}

.no-duplicates {
    text-align: center;
    padding: var(--spacing-large);
    color: var(--text-color);
}

.active-checkbox {
    margin-left: 10px;
    accent-color: var(--primary-color);
}


</style>
