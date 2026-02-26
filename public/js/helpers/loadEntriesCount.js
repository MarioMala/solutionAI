const API_URL = window.location.origin + '/api';

export async function loadEntriesCount() {
    console.log('loadEntriesCount wywołane');
    try {
        const url = `${API_URL}/entries/count`;
        console.log('loadEntriesCount URL:', url);
        const response = await fetch(url, { credentials: 'include' });
        console.log('loadEntriesCount response status:', response.status);
        console.log('loadEntriesCount response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('loadEntriesCount błąd response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('loadEntriesCount data:', data);
        return data.count;
    } catch (error) {
        console.error('loadEntriesCount catch error:', error);
        throw error;
    }
}
