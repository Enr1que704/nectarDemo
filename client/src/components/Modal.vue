<script setup lang="ts">

defineProps<{
    isOpen: boolean;
    title: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();
</script>



<template>
    <Teleport to="body">
        <div v-if="isOpen" class="modal-overlay" @click="emit('close')">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h2>{{ title }}</h2>
                    <button class="close-button" @click="emit('close')">&times;</button>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: var(--background-color);
    border-radius: var(--border-radius-medium);
    padding: var(--spacing-large);
    max-width: 90%;
    width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-medium);
}

.modal-header h2 {
    margin: 0;
    color: var(--text-color);
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-color);
    padding: 0;
    line-height: 1;
}

.close-button:hover {
    color: var(--primary-color);
}

.modal-body {
    color: var(--text-color);
}
</style> 