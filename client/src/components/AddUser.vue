<script setup lang="ts">
import { ref } from 'vue';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    active: boolean;
}

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const country = ref('');
const active = ref(true);
const users = ref<User[]>([]);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessages = ref<string[]>([]);

const validateInput = () => {
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const countryRegex = /^[A-Za-z]{2}$/;
    const errors: string[] = [];

    if (!nameRegex.test(firstName.value)) {
        errors.push('First name must contain only alphabetic characters');
    }
    if (!nameRegex.test(lastName.value)) {
        errors.push('Last name must contain only alphabetic characters');
    }
    if (!emailRegex.test(email.value)) {
        errors.push('Invalid email format');
    }
    if (!countryRegex.test(country.value)) {
        errors.push('Country must be exactly 2 alphabetic characters');
    }
    if (typeof active.value !== 'boolean') {
        errors.push('Active must be true or false');
    }

    if (errors.length > 0) {
        errorMessages.value = errors;
        return false;
    }
    return true;
}

const addUser = async () => {
    isSubmitting.value = true;
    successMessage.value = '';
    errorMessages.value = [];
    
    try {
        if (!validateInput()) {
            return;
        }

        const response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                first_name: firstName.value,
                last_name: lastName.value, 
                email: email.value,
                country: country.value,
                active: active.value
            }),
        });
        
        const data = await response.json();
        console.log(data);
        
        // Reset form
        firstName.value = '';
        lastName.value = '';
        email.value = '';
        country.value = '';
        active.value = true;
        
        successMessage.value = 'User added successfully!';
    } catch (error: any) {
        console.error('Error adding user:', error);
        errorMessages.value = error.message || ['Error adding user'];
    } finally {
        isSubmitting.value = false;
    }
}

const getUsers = () => {
    fetch('http://localhost:3001/api/countryUsers?country=US')
    .then(response => response.json())
    .then(data => {
        users.value = data;
    })
}
</script>

<template>
    <div class="add-user-container">
        <div class="form-card">
            <h1 class="form-title">Add New User</h1>
            
            <form @submit.prevent="addUser" class="user-form">
                <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input 
                        id="firstName"
                        type="text" 
                        v-model="firstName" 
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input 
                        id="lastName"
                        type="text" 
                        v-model="lastName" 
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        id="email"
                        type="email" 
                        v-model="email" 
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="country">Country</label>
                    <input 
                        id="country"
                        type="text" 
                        v-model="country" 
                        required
                    />
                </div>

                <div class="form-group checkbox-group">
                    <label for="active" class="checkbox-label">
                        <input 
                            id="active"
                            type="checkbox" 
                            v-model="active"
                        />
                        <span>Active User</span>
                    </label>
                </div>

                <button 
                    type="submit" 
                    class="submit-button"
                    :disabled="isSubmitting"
                >
                    {{ isSubmitting ? 'Adding User...' : 'Add User' }}
                </button>
            </form>

            <div v-if="errorMessages.length > 0" class="error-message">
                <ul>
                    <li v-for="error in errorMessages" :key="error">
                        {{ error }}
                    </li>
                </ul>
            </div>
            <div v-if="successMessage" class="success-message">
                {{ successMessage }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.add-user-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.form-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

.form-title {
    color: #1A2238;  /* Nectar Navy */
    margin-bottom: 2rem;
    text-align: center;
    font-size: 1.8rem;
}

.user-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

label {
    color: #1A2238;  /* Nectar Navy */
    font-weight: 500;
    font-size: 0.9rem;
}

input[type="text"],
input[type="email"] {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

input[type="text"]:focus,
input[type="email"]:focus {
    outline: none;
    border-color: #F26A3E;  /* Nectar Orange 1 */
    box-shadow: 0 0 0 3px rgba(242, 106, 62, 0.1);
}

.checkbox-group {
    margin-top: 0.5rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
}

.submit-button {
    background-color: #F26A3E;  /* Nectar Orange 1 */
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
}

.submit-button:hover {
    background-color: #F47C4E;  /* Nectar Orange 2 */
}

.submit-button:disabled {
    background-color: #F6956C;  /* Nectar Peach */
    cursor: not-allowed;
}

.success-message {
    color: #1A2238;  /* Nectar Navy */
    margin-top: 1rem;
    padding: 1rem;
    background-color: rgba(26, 34, 56, 0.1);
    border-radius: 4px;
}

.error-message {
    color: #F26A3E;  /* Nectar Orange 1 */
    margin-top: 1rem;
    padding: 1rem;
    background-color: rgba(242, 106, 62, 0.1);
    border-radius: 4px;
}
</style>
