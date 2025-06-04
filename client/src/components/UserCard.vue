<script setup lang="ts">
import type { User } from '../types/user';

defineProps<{
    user: User;
}>();
</script>

<template>
    <div class="user-card">
        <div :class="['status-banner', user.active ? 'active' : 'inactive']">
            {{ user.active ? 'Active' : 'Inactive' }}
        </div>
        <div class="user-info">
            <h3 class="user-name">{{ user.first_name }} {{ user.last_name }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <p class="user-country">Country: {{ user.country }}</p>
            <p class="user-username">Username: {{ user.username ? user.username : 'N/A' }}</p>
        </div>
    </div>
</template>

<style scoped>
.user-card {
    background: var(--background-color);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 0;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    overflow: hidden;
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

.status-banner {
    width: 100%;
    padding: var(--spacing-small) var(--spacing-medium);
    font-size: 0.8rem;
    font-weight: 500;
    text-align: center;
}

.status-banner.active {
    background-color: rgba(242, 106, 62, 0.1);
    color: var(--primary-color);
}

.status-banner.inactive {
    background-color: rgba(26, 34, 56, 0.1);
    color: var(--text-color);
}

.user-info {
    padding: var(--spacing-medium);
}
</style> 