<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    active: boolean;
}

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');

const fetchUsers = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/users');
        const data = await response.json();
        users.value = data;
    } catch (err) {
        error.value = 'Failed to fetch users';
        console.error('Error fetching users:', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUsers();
});
</script>

<template>
    <div class="user-list-container">
        <h1 class="list-title">User List</h1>
        
        <div v-if="loading" class="loading">
            Loading users...
        </div>
        
        <div v-else-if="error" class="error-message">
            {{ error }}
        </div>
        
        <div v-else-if="users.length === 0" class="no-users">
            No users found
        </div>
        
        <div v-else class="user-grid">
            <div v-for="user in users" :key="user.id" class="user-card">
                <div class="user-info">
                    <h3 class="user-name">{{ user.first_name }} {{ user.last_name }}</h3>
                    <p class="user-email">{{ user.email }}</p>
                    <p class="user-country">Country: {{ user.country }}</p>
                    <span :class="['status-badge', user.active ? 'active' : 'inactive']">
                        {{ user.active ? 'Active' : 'Inactive' }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-list-container {
    max-width: 1200px;
    margin: var(--spacing-large) auto;
    padding: 0 var(--spacing-medium);
}

.list-title {
    color: var(--text-color);
    margin-bottom: var(--spacing-large);
    font-size: 1.8rem;
}

.user-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-medium);
}

.user-card {
    background: var(--background-color);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: var(--spacing-medium);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.user-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.user-name {
    color: var(--text-color);
    margin: 0 0 var(--spacing-small) 0;
    font-size: 1.2rem;
}

.user-email {
    color: var(--text-color);
    margin: var(--spacing-small) 0;
    font-size: 0.9rem;
}

.user-country {
    color: var(--text-color);
    margin: var(--spacing-small) 0;
    font-size: 0.9rem;
}

.status-badge {
    display: inline-block;
    padding: var(--spacing-small) var(--spacing-medium);
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
}

.status-badge.active {
    background-color: rgba(242, 106, 62, 0.1);
    color: var(--primary-color);
}

.status-badge.inactive {
    background-color: rgba(26, 34, 56, 0.1);
    color: var(--text-color);
}

.loading {
    color: var(--text-color);
    text-align: center;
    padding: var(--spacing-large);
}

.error-message {
    color: var(--primary-color);
    background-color: rgba(242, 106, 62, 0.1);
    padding: var(--spacing-medium);
    border-radius: var(--border-radius-small);
    text-align: center;
}

.no-users {
    color: var(--text-color);
    text-align: center;
    padding: var(--spacing-large);
    background-color: rgba(26, 34, 56, 0.1);
    border-radius: var(--border-radius-small);
}
</style>
