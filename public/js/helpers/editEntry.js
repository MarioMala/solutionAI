const API_URL = window.location.origin + '/api';

export async function editEntry(id) {
    try {
        const response = await fetch(`${API_URL}/entries/${id}`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const entry = await response.json();
        return entry;
    } catch (error) {
        console.error('Błąd w editEntry:', error);
        throw error;
    }
}
