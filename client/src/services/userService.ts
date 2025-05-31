import type { User } from '../types/user';

const API_BASE_URL = 'http://localhost:3001/api';

export const userService = {
    async getUsersByCountry(country: string): Promise<User[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/user/country?country=${country}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async addUser(user: Omit<User, 'id'>): Promise<User> {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    },

    async getDuplicateUsers(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/user/duplicate`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error getting duplicate users:', error);
            throw error;
        }
    }
}; 