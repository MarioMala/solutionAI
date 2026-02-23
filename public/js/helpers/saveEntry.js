const API_URL = window.location.origin + '/api';

export async function saveEntry(entryData, id = null) {
    let url = id ? `${API_URL}/entries/${id}` : `${API_URL}/entries`;
    let method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Błąd (status: ${response.status})`);
        }
        
        return true;
    } catch (error) {
        console.error('Błąd w saveEntry:', error);
        throw error;
    }
}
