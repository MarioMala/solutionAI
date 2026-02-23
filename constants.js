// Stałe projektu

export const ALLOWED_MODULES = [
    'SRS', 'SCM', 'KDW', 'SQL', 'ERU', 'SCD', 'SOK', 'SEK', 'SKJ', 'SLAB', 'SOP', 'SZYK3', 'WADM'
];

export const MAX_LENGTHS = {
    MODULE: 50,
    TITLE: 255,
    CONTENT: 65000,
    SEARCH: 100
};

export const ERROR_MESSAGES = {
    INVALID_ID: 'Nieprawidłowe ID',
    INVALID_MODULE_PARAM: 'Nieprawidłowy parametr moduł',
    INVALID_SEARCH_PARAM: 'Nieprawidłowy parametr wyszukiwania',
    INTERNAL_ERROR: 'Wewnętrzny błąd serwera'
};
