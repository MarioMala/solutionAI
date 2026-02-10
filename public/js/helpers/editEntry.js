import { API_URL } from '../constants.js';

export async function editEntry(id) {
    try {
        const response = await fetch(`${API_URL}/entries`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const entries = await response.json();
        const entry = entries.find(e => e.id === id);
        return entry;
    } catch (error) {
        console.error('Błąd w editEntry:', error);
        throw error;
    }
}
