// Walidacja danych wejściowych dla wpisów
import { ALLOWED_MODULES, MAX_LENGTHS } from '../constants.js';

/**
 * Sprawdza czy wartość jest prawidłowym stringiem
 */
function isValidString(value, maxLength) {
    if (value === undefined || value === null) return false;
    if (typeof value !== 'string') return false;
    if (value.length > maxLength) return false;
    return true;
}

/**
 * Waliduje dane dla nowego wpisu (POST)
 */
export function validateCreateEntry(data) {
    const errors = [];

    // Walidacja module
    if (!isValidString(data.module, MAX_LENGTHS.MODULE)) {
        errors.push('Moduł jest wymagany (max 50 znaków)');
    } else if (!ALLOWED_MODULES.includes(data.module.toUpperCase())) {
        errors.push('Nieprawidłowy moduł');
    }

    // Walidacja title
    if (!isValidString(data.title, MAX_LENGTHS.TITLE)) {
        errors.push('Tytuł jest wymagany (max 255 znaków)');
    }

    // Walidacja content (opcjonalne)
    if (data.content !== undefined && data.content !== null) {
        if (typeof data.content !== 'string') {
            errors.push('Treść musi być tekstem');
        } else if (data.content.length > MAX_LENGTHS.CONTENT) {
            errors.push('Treść jest zbyt długa (max 65000 znaków)');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Waliduje dane dla edycji wpisu (PUT)
 */
export function validateUpdateEntry(data) {
    const errors = [];

    // module jest opcjonalne przy edycji, ale jeśli podane to musi być poprawne
    if (data.module !== undefined && data.module !== null) {
        if (!isValidString(data.module, MAX_LENGTHS.MODULE)) {
            errors.push('Nieprawidłowy moduł');
        } else if (!ALLOWED_MODULES.includes(data.module.toUpperCase())) {
            errors.push('Nieprawidłowy moduł');
        }
    }

    // title jest opcjonalne przy edycji
    if (data.title !== undefined && data.title !== null) {
        if (!isValidString(data.title, MAX_LENGTHS.TITLE)) {
            errors.push('Tytuł jest zbyt długi (max 255 znaków)');
        }
    }

    // content jest opcjonalne
    if (data.content !== undefined && data.content !== null) {
        if (typeof data.content !== 'string') {
            errors.push('Treść musi być tekstem');
        } else if (data.content.length > MAX_LENGTHS.CONTENT) {
            errors.push('Treść jest zbyt długa (max 65000 znaków)');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Waliduje ID wpisu
 */
export function validateId(id) {
    if (!id) return false;
    const numId = parseInt(id, 10);
    return !isNaN(numId) && numId > 0;
}
