const API_URL = 'http://localhost:3001/api';

export async function deleteEntry(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return false;
    
    try {
        const response = await fetch(`${API_URL}/entries/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Błąd w deleteEntry:', error);
        throw error;
    }
}
