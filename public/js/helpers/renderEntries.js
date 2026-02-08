import { escapeHtml } from './escapeHtml.js';
import { formatDate } from './formatDate.js';

export function renderEntries(entries, entriesList) {
    if (!entriesList) {
        console.error('entriesList element not found');
        return;
    }
    
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
