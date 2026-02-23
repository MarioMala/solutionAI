export function formatDate(dateStr) {
    if (!dateStr) return '';
    
    let date;
    
    // Obsługa różnych formatów dat z MySQL i SQLite
    if (typeof dateStr === 'string') {
        // MySQL format: "2024-01-15 10:30:00"
        // SQLite format: "2024-01-15T10:30:00.000Z" lub "2024-01-15 10:30:00"
        
        // Jeśli string zawiera 'Z' i 'T', parsuj jako UTC
        if (dateStr.includes('T') && dateStr.endsWith('Z')) {
            date = new Date(dateStr);
        } 
        // Jeśli string zawiera 'T' ale nie 'Z', dodaj Z dla UTC
        else if (dateStr.includes('T')) {
            date = new Date(dateStr + 'Z');
        }
        // MySQL format "YYYY-MM-DD HH:MM:SS" - zamień spację na T i dodaj Z
        else if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
            date = new Date(dateStr.replace(' ', 'T') + 'Z');
        }
        // Inny format - spróbuj bezpośrednio
        else {
            date = new Date(dateStr);
        }
    } else {
        date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    
    return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
}
