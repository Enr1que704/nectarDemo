<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface DropdownItem {
    value: string;
    label: string;
}

interface Props {
    items: DropdownItem[];
    placeholder?: string;
    modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Search...',
    modelValue: ''
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'select', value: string): void;
}>();

const searchQuery = ref('');
const isDropdownOpen = ref(false);

watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
        searchQuery.value = '';
    } else {
        searchQuery.value = props.items.find(item => item.value === newValue)?.label || newValue;
    }
}, { immediate: true });

const filteredItems = computed(() => {
    return props.items.filter(item => 
        item.label.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.value.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const selectItem = (value: string) => {
    emit('update:modelValue', value);
    emit('select', value);
    isDropdownOpen.value = false;
    searchQuery.value = props.items.find(item => item.value === value)?.label || value;
};

const handleBlur = () => {
    setTimeout(() => {
        isDropdownOpen.value = false;
    }, 200);
};
</script>

<template>
    <div class="dropdown-container">
        <input
            type="text"
            v-model="searchQuery"
            @focus="isDropdownOpen = true"
            @blur="handleBlur"
            :placeholder="placeholder"
            class="dropdown-input"
        />
        <div v-if="isDropdownOpen" class="dropdown-list">
            <div
                v-for="item in filteredItems"
                :key="item.value"
                @mousedown="selectItem(item.value)"
                class="dropdown-item"
            >
                {{ item.label }} ({{ item.value }})
            </div>
        </div>
    </div>
</template>

<style scoped>
.dropdown-container {
    position: relative;
    width: 100%;
}

.dropdown-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--accent-color);
    border-radius: var(--border-radius-large);
    font-size: 1rem;
    background-color: var(--background-color);
    color: var(--text-color);
}

.dropdown-input:focus {
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