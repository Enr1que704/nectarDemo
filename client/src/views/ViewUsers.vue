<script setup lang="ts">
import UserList from '../components/UserList.vue';
import { ref, onMounted } from 'vue';
import { userService } from '../services/userService';
import type { User } from '../types/user';
import SearchableDropdown from '@/components/SearchableDropdown.vue';
import COUNTRIES from '../data/countries.json';

const users = ref<User[]>([]);
const loading = ref(true);
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

</script>

<template>
    <div>
        <h1 class="user-list-title">User List</h1>
        <div class="country-selector">
            <SearchableDropdown
                v-bind:items="COUNTRIES"
                v-model="country"
                @select="handleCountrySelect"
            />
        </div>
        <UserList 
            :users="users" 
            :loading="loading"
            :error="error"
        />
    </div>
</template>

<style scoped>
.user-list-title {
    color: var(--text-color);
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
}

.country-selector {
    max-width: 400px;
    margin: 0 auto 20px;
}

</style>
