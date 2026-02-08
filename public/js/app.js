// API URL - używamy bezwzględnego URL
const API_URL = 'http://localhost:3001/api';

// Elementy DOM
const entryForm = document.getElementById('entry-form');
const entryId = document.getElementById('entry-id');
const moduleInput = document.getElementById('module');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

const filterModule = document.getElementById('filter-module');
const filterSearch = document.getElementById('filter-search');
const clearFilterBtn = document.getElementById('clear-filter-btn');

let searchTimeout = null;

const entriesList = document.getElementById('entries-list');
const addEntryBtn = document.getElementById('add-entry-btn');
const formSection = document.getElementById('form-section');

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    loadModules();
});

// Obsługa formularza
entryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const entryData = {
        module: moduleInput.value,
        title: titleInput.value,
        content: contentInput.value
    };
    
    const id = entryId.value;
    
    try {
        let response;
        if (id) {
            // Edycja
            response = await fetch(`${API_URL}/entries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData)
            });
        } else {
            // Dodawanie
            response = await fetch(`${API_URL}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData)
            });
        }
        
        if (response.ok) {
            resetForm();
            loadEntries();
            loadModules();
        } else {
            const text = await response.text();
            alert('Błąd: ' + (text || 'Nieznany błąd (status: ' + response.status + ')'));
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd połączenia z serwerem: ' + error.message);
    }
});

// Przełączanie formularza
addEntryBtn.addEventListener('click', () => {
    formSection.style.display = 'block';
    addEntryBtn.style.display = 'none';
    entryForm.scrollIntoView({ behavior: 'smooth' });
});

// Anulowanie edycji
cancelBtn.addEventListener('click', () => {
    formSection.style.display = 'none';
    addEntryBtn.style.display = 'inline-block';
    resetForm();
});

// Wyszukiwanie przyrostowe
filterSearch.addEventListener('input', () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        loadEntries();
    }, 300);
});

// Filtrowanie po module
filterModule.addEventListener('change', () => {
    loadEntries();
});

// Czyszczenie filtrów
clearFilterBtn.addEventListener('click', () => {
    filterModule.value = '';
    filterSearch.value = '';
    loadEntries();
});

// Pobieranie wpisów
async function loadEntries() {
    const module = filterModule.value;
    const search = filterSearch.value;
    
    let url = `${API_URL}/entries?`;
    if (module) url += `module=${encodeURIComponent(module)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url);
        const entries = await response.json();
        renderEntries(entries);
    } catch (error) {
        console.error('Błąd:', error);
        entriesList.innerHTML = '<div class="empty-message">Błąd podczas pobierania wpisów</div>';
    }
}

// Pobieranie modułów
async function loadModules() {
    try {
        const response = await fetch(`${API_URL}/modules`);
        const modules = await response.json();
        
        // Zachowaj pierwszą opcję
        const firstOption = filterModule.options[0];
        filterModule.innerHTML = '';
        filterModule.appendChild(firstOption);
        
        modules.forEach(module => {
            const option = document.createElement('option');
            option.value = module;
            option.textContent = module;
            filterModule.appendChild(option);
        });
    } catch (error) {
        console.error('Błąd:', error);
    }
}

// Renderowanie wpisów
function renderEntries(entries) {
    if (entries.length === 0) {
        entriesList.innerHTML = '<div class="empty-message">Brak wpisów do wyświetlenia</div>';
        return;
    }
    
    entriesList.innerHTML = entries.map(entry => `
        <div class="entry-card">
            <div class="entry-header">
                <span class="entry-module">${escapeHtml(entry.module)}</span>
            </div>
            <div class="entry-title">${escapeHtml(entry.title)}</div>
            ${entry.content ? `<div class="entry-content">${escapeHtml(entry.content)}</div>` : ''}
            <div class="entry-meta">
                <span>🕐 Utworzono: ${formatDate(entry.created_at)}</span>
                ${entry.edit_date ? `<span>✏️ Edytowano: ${formatDate(entry.edit_date)}</span>` : ''}
            </div>
            <div class="entry-actions">
                <button class="edit-btn" onclick="editEntry(${entry.id})">Edytuj</button>
                <button class="delete-btn" onclick="deleteEntry(${entry.id})">Usuń</button>
            </div>
        </div>
    `).join('');
}

// Edycja wpisu
window.editEntry = async function(id) {
    try {
        const response = await fetch(`${API_URL}/entries`);
        const entries = await response.json();
        const entry = entries.find(e => e.id === id);
        
        if (entry) {
            entryId.value = entry.id;
            moduleInput.value = entry.module;
            titleInput.value = entry.title;
            contentInput.value = entry.content || '';
            
            formTitle.textContent = 'Edytuj wpis';
            submitBtn.textContent = 'Zapisz';
            cancelBtn.style.display = 'inline-block';
            
            formSection.style.display = 'block';
            addEntryBtn.style.display = 'none';
            
            // Przewiń do formularza
            entryForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd podczas pobierania wpisu');
    }
};

// Usuwanie wpisu
window.deleteEntry = async function(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) return;
    
    try {
        const response = await fetch(`${API_URL}/entries/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadEntries();
            loadModules();
        } else {
            alert('Błąd podczas usuwania wpisu');
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd połączenia z serwerem');
    }
};

// Reset formularza
function resetForm() {
    entryForm.reset();
    entryId.value = '';
    formTitle.textContent = 'Dodaj nowy wpis';
    submitBtn.textContent = 'Dodaj';
    cancelBtn.style.display = 'none';
    formSection.style.display = 'none';
    addEntryBtn.style.display = 'inline-block';
}

// Formatowanie daty
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

// Zabezpieczenie HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
