<script setup lang="ts">
import { ref, computed } from 'vue';

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const country = ref('');
const userName = ref('');
const active = ref(true);
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessages = ref<string[]>([]);

// TODO: 1. Investigate zod?
// TODO: 2. Add validation field by field, not at the end (because that's annoying)
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
                username: userName.value,
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
</script>

<template>
    <div class="add-user-container">
        <div class="form-card">
            <h1 class="form-title">Add New User</h1>
            
            <form @submit.prevent="addUser" class="user-form"> <!-- submit form, prevent page refresh which allows for form validation and error handling -->
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
                    <label for="userName">Username</label>
                    <input 
                        id="userName"
                        type="text"
                        v-model="userName"
                    />
                </div>
                <!-- TODO: Add country dropdown -->
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
                <!-- TODO: Disable button until all fields are filled or valid -->
                <button 
                    type="submit" 
                    class="submit-button"
                    v-bind:disabled="isSubmitting"
                >
                    {{ isSubmitting ? 'Adding User...' : 'Add User' }}
                </button>
            </form>

            <div v-if="errorMessages.length > 0" class="error-message">
                <ul>
                    <li v-for="error in errorMessages" v-bind:key="error">
                        {{ error }}
                    </li>
                </ul>
            </div>
            <div v-if="successMessage" class="success-message">
                {{ successMessage }}
            </div>
        </div>
    </div>
    <!-- <UserList /> -->
</template>

<style scoped>
.add-user-container {
    max-width: 600px;
    margin: var(--spacing-large) auto;
    padding: 0 var(--spacing-medium);
}

.form-card {
    background: var(--background-color);
    border-radius: var(--border-radius-medium);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: var(--spacing-large);
}

.form-title {
    color: var(--text-color);
    margin-bottom: var(--spacing-large);
    text-align: center;
    font-size: 1.8rem;
}

.user-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-medium);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-small);
}

label {
    color: var(--text-color);
    font-weight: 500;
    font-size: 0.9rem;
}

input[type="text"],
input[type="email"] {
    padding: var(--spacing-medium);
    border: 1px solid #e2e8f0;
    border-radius: var(--border-radius-small);
    font-size: 1rem;
    transition: border-color var(--transition-fast);
}

input[type="text"]:focus,
input[type="email"]:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(242, 106, 62, 0.1);
}

.checkbox-group {
    margin-top: var(--spacing-small);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-small);
    cursor: pointer;
}

input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
}

.submit-button {
    background-color: var(--primary-color);
    color: white;
    padding: var(--spacing-medium);
    border: none;
    border-radius: var(--border-radius-small);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.submit-button:hover {
    background-color: var(--secondary-color);
}

.submit-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.error-message {
    margin-top: var(--spacing-medium);
    padding: var(--spacing-medium);
    background-color: rgba(242, 106, 62, 0.1);
    border-radius: var(--border-radius-small);
    color: var(--primary-color);
}

.error-message ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.error-message li {
    margin-bottom: var(--spacing-small);
}

.success-message {
    margin-top: var(--spacing-medium);
    padding: var(--spacing-medium);
    background-color: rgba(76, 175, 80, 0.1);
    border-radius: var(--border-radius-small);
    color: var(--success-color);
    text-align: center;
}
</style>
