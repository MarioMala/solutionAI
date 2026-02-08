const API_URL = 'http://localhost:3001/api';

export async function loadModules() {
    try {
        const response = await fetch(`${API_URL}/modules`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modules = await response.json();
        return modules;
    } catch (error) {
        console.error('Błąd w loadModules:', error);
        throw error;
    }
}
