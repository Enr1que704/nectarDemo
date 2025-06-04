<script setup lang="ts">
import type { User } from '../types/user';

const props = defineProps<{
    data: any;
    count: number;
}>();
</script>

<template>
    <div class="data-card">
        <div class="data-info">
            <h3 class="data-name">{{ props.data }}</h3>
            <p class="data-count">Duplicate Count: {{ props.count }}</p>
        </div>
    </div>
</template>

<style scoped>
.data-card {
    background: var(--background-color);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: var(--spacing-medium);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.data-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.data-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-small);
}

.data-name {
    color: var(--text-color);
    margin: 0 0 var(--spacing-small) 0;
    font-size: 1.2rem;
}

.data-count {
    color: var(--text-color);
    margin: var(--spacing-small) 0;
    font-size: 0.9rem;
    background-color: rgba(242, 106, 62, 0.1);
    color: var(--primary-color);
    padding: var(--spacing-small) var(--spacing-medium);
    border-radius: 999px;
    display: inline-block;
    font-weight: 500;
}
</style>