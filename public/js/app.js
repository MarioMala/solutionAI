// Imports from helpers
import { loadEntries } from './helpers/loadEntries.js';
import { loadModules } from './helpers/loadModules.js';
import { renderEntries } from './helpers/renderEntries.js';
import { editEntry } from './helpers/editEntry.js';
import { deleteEntry } from './helpers/deleteEntry.js';
import { saveEntry } from './helpers/saveEntry.js';
import { resetForm } from './helpers/resetForm.js';

// API URL
import { API_URL } from './constants.js';

// Elementy DOM
const entryForm = document.getElementById('entry-form');
const entryId = document.getElementById('entry-id');
const moduleInput = document.getElementById('module');
const moduleSelectGroup = document.getElementById('module-select-group');
const moduleDisplayGroup = document.getElementById('module-display-group');
const moduleDisplay = document.getElementById('module-display');
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
    loadEntriesData();
    loadModulesData();
});

// Pobieranie wpisów i renderowanie
async function loadEntriesData() {
    try {
        const entries = await loadEntries(filterModule.value, filterSearch.value);
        renderEntries(entries, entriesList);
    } catch (error) {
        console.error('Błąd:', error);
        entriesList.innerHTML = '<div class="empty-message">Błąd podczas pobierania wpisów</div>';
    }
}

// Pobieranie modułów i aktualizacja selecta
async function loadModulesData() {
    try {
        const modules = await loadModules();
        
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

// Obsługa formularza
entryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = entryId.value;
    const moduleValue = moduleSelectGroup.style.display !== 'none' ? moduleInput.value : moduleDisplay.textContent;
    
    const entryData = {
        module: moduleValue,
        title: titleInput.value,
        content: contentInput.value
    };
    
    try {
        await saveEntry(entryData, id || null);
        resetForm(entryForm, entryId, formTitle, submitBtn, cancelBtn, formSection, addEntryBtn, moduleSelectGroup, moduleDisplayGroup);
        loadEntriesData();
        loadModulesData();
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd: ' + error.message);
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
    resetForm(entryForm, entryId, formTitle, submitBtn, cancelBtn, formSection, addEntryBtn, moduleSelectGroup, moduleDisplayGroup);
});

// Wyszukiwanie przyrostowe
filterSearch.addEventListener('input', () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        loadEntriesData();
    }, 300);
});

// Filtrowanie po module
filterModule.addEventListener('change', () => {
    loadEntriesData();
});

// Czyszczenie filtrów
clearFilterBtn.addEventListener('click', () => {
    filterModule.value = '';
    filterSearch.value = '';
    loadEntriesData();
});

// Edycja wpisu
window.editEntry = async function(id) {
    try {
        const entry = await editEntry(id);
        if (entry) {
            entryId.value = entry.id;
            moduleInput.value = entry.module;
            moduleDisplay.textContent = entry.module;
            titleInput.value = entry.title;
            contentInput.value = entry.content || '';
            
            // Pokaż wyświetlanie modułu (tylko do odczytu), ukryj select i usuń required
            moduleSelectGroup.style.display = 'none';
            moduleDisplayGroup.style.display = 'block';
            moduleInput.removeAttribute('required');
            
            formTitle.textContent = 'Edytuj wpis';
            submitBtn.textContent = 'Zapisz';
            cancelBtn.style.display = 'inline-block';
            
            formSection.style.display = 'block';
            addEntryBtn.style.display = 'none';
            
            entryForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd podczas pobierania wpisu');
    }
};

// Usuwanie wpisu
window.deleteEntry = async function(id) {
    try {
        const success = await deleteEntry(id);
        if (success) {
            loadEntriesData();
            loadModulesData();
        } else {
            alert('Błąd podczas usuwania wpisu');
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd połączenia z serwerem');
    }
};
