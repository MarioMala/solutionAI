export function formatDate(dateStr) {
    if (!dateStr) return '';
    // SQLite stores dates in UTC, parse as UTC and convert to local time (Poland is UTC+1)
    const date = new Date(dateStr + 'Z');
    return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
}
