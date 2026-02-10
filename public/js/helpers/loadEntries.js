import { API_URL } from '../constants.js';

export async function loadEntries(filterModule, filterSearch) {
    const module = filterModule;
    const search = filterSearch;
    
    let url = `${API_URL}/entries?`;
    if (module && module !== '') url += `module=${encodeURIComponent(module)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const entries = await response.json();
        return entries;
    } catch (error) {
        console.error('Błąd w loadEntries:', error);
        throw error;
    }
}
