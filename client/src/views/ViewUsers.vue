<script setup lang="ts">
import UserList from '../components/UserList.vue';
import { ref, onMounted } from 'vue';
import { userService } from '../services/userService';
import type { User } from '../types/user';

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | undefined>(undefined);

const fetchUsers = async () => {
    loading.value = true;
    error.value = undefined;
    try {
        users.value = await userService.getUsersByCountry('US');
    } catch (err) {
        error.value = 'Failed to fetch users. Please try again later.';
        console.error('Error fetching users:', err);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchUsers();
});
</script>

<template>
    <div>
        <UserList 
            :users="users" 
            :loading="loading"
            :error="error"
        />
    </div>
</template>
