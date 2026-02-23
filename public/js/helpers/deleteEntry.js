const API_URL = window.location.origin + '/api';

export async function deleteEntry(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return false;
    
    try {
        const response = await fetch(`${API_URL}/entries/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Błąd w deleteEntry:', error);
        throw error;
    }
}
