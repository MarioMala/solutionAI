// Imports from helpers
import { loadEntries } from './helpers/loadEntries.js';
import { loadEntriesCount } from './helpers/loadEntriesCount.js';
import { loadModules } from './helpers/loadModules.js';
import { renderEntries } from './helpers/renderEntries.js';
import { editEntry } from './helpers/editEntry.js';
import { deleteEntry } from './helpers/deleteEntry.js';
import { saveEntry } from './helpers/saveEntry.js';
import { resetForm } from './helpers/resetForm.js';

// API URL
import { API_URL } from './constans/constants.js';

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

// Elementy użytkownika
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const loginTime = document.getElementById('login-time');
const entriesCount = document.getElementById('entries-count');
const logoutBtn = document.getElementById('logout-btn');

// Elementy admina
const adminSection = document.getElementById('admin-section');
const createUserForm = document.getElementById('create-user-form');
const createUserMessage = document.getElementById('create-user-message');
const toggleAdminBtn = document.getElementById('toggle-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');

// Admin email
const ADMIN_EMAIL = 'malasiewicz.mariusz@gmail.com';

// API URL z obsługą sesji
const API_URL_WITH_CREDS = window.location.origin + '/api';

// Zmienna do przechowywania danych użytkownika
let currentUser = null;

// Sprawdzenie statusu autoryzacji
async function checkAuth() {
    try {
        const response = await fetch(API_URL_WITH_CREDS + '/auth/status', { 
            credentials: 'include' 
        });
        const data = await response.json();
        
        if (!data.isAuthenticated) {
            // Przekieruj do logowania
            window.location.href = 'login.html';
            return false;
        }
        
        // Zapisanie danych użytkownika
        currentUser = data.user;
        
        // Wyświetl informacje o użytkowniku
        userName.textContent = data.user.mail;
        
        // Formatowanie czasu logowania
        const loginDate = new Date(data.user.loginTime);
        loginTime.textContent = 'Zalogowany: ' + loginDate.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        userInfo.style.display = 'flex';
        
        // Sprawdź czy użytkownik jest adminem - pokaż przycisk do panelu admina
        if (data.user.mail === ADMIN_EMAIL) {
            toggleAdminBtn.style.display = 'inline-block';
        }
        
        return true;
    } catch (error) {
        console.error('Błąd sprawdzania autoryzacji:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// Obsługa wylogowania
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch(API_URL_WITH_CREDS + '/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Błąd wylogowania:', error);
    }
});

// Obsługa formularza tworzenia użytkownika (tylko dla admina)
if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const mail = document.getElementById('new-user-mail').value;
        const password = document.getElementById('new-user-password').value;
        const createUserBtn = document.getElementById('create-user-btn');
        
        createUserBtn.disabled = true;
        createUserBtn.textContent = 'Tworzenie...';
        createUserMessage.style.display = 'none';
        
        try {
            const response = await fetch(API_URL_WITH_CREDS + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mail, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                createUserMessage.textContent = 'Użytkownik utworzony pomyślnie!';
                createUserMessage.style.color = 'green';
                createUserMessage.style.display = 'block';
                createUserForm.reset();
            } else {
                createUserMessage.textContent = data.error || 'Błąd podczas tworzenia użytkownika';
                createUserMessage.style.color = 'red';
                createUserMessage.style.display = 'block';
            }
        } catch (error) {
            createUserMessage.textContent = 'Błąd połączenia z serwerem';
            createUserMessage.style.color = 'red';
            createUserMessage.style.display = 'block';
        } finally {
            createUserBtn.disabled = false;
            createUserBtn.textContent = 'Utwórz użytkownika';
        }
    });
}

// Obsługa przycisku pokazywania panelu admina
if (toggleAdminBtn) {
    toggleAdminBtn.addEventListener('click', () => {
        adminSection.style.display = 'block';
        toggleAdminBtn.style.display = 'none';
        adminSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Obsługa przycisku zamykania panelu admina
if (closeAdminBtn) {
    closeAdminBtn.addEventListener('click', () => {
        adminSection.style.display = 'none';
        toggleAdminBtn.style.display = 'inline-block';
    });
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        loadEntriesData();
        loadModulesData();
        loadEntriesCountData();
    }
});

// Pobieranie i wyświetlanie liczby wpisów
async function loadEntriesCountData() {
    console.log('loadEntriesCountData wywołane - entriesCount element:', entriesCount);
    try {
        const count = await loadEntriesCount();
        console.log('loadEntriesCountData otrzymało count:', count, 'typ:', typeof count);
        // Wyświetl zawsze, nawet jeśli 0
        const displayCount = (count !== undefined && count !== null) ? count : 0;
        console.log('loadEntriesCountData displayCount:', displayCount);
        entriesCount.textContent = ` | Wpisów: ${displayCount}`;
        console.log('loadEntriesCountData ustawiono tekst na:', entriesCount.textContent);
    } catch (error) {
        console.error('loadEntriesCountData Błąd:', error);
        entriesCount.textContent = ' | Błąd licznika';
    }
}

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
        loadEntriesCountData();
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
            loadEntriesCountData();
        } else {
            alert('Błąd podczas usuwania wpisu');
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd połączenia z serwerem');
    }
};
