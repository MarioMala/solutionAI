---
applyTo: **
---

<!-- @format -->

## 1. Ogólne zasady

- Preferuj **prostotę nad spryt**
- Kod ma być **czytelny dla juniora**
- Unikaj nadmiernej abstrakcji
- Jedna funkcja = jedna odpowiedzialność
- Najpierw poprawność i bezpieczeństwo, potem optymalizacja

## 2. Styl JavaScript

- Używaj **ES2020+**
- `const` domyślnie, `let` gdy konieczne, **nigdy `var`**
- Arrow functions tylko gdy poprawiają czytelność
- Maks. 20–30 linii na funkcję
- Wczesne `return` zamiast głębokich `if`

### Nazewnictwo

- `camelCase` – zmienne i funkcje
- Nazwy opisowe, bez skrótów typu `data1`, `tmp`
- Funkcje: czasownik (`getCvById`, `renderPdf`)
- Boolean: `is`, `has`, `can`

## 3. Struktura plików

- Jeden moduł = jeden plik
- Eksportuj tylko to, co potrzebne
- Brak logiki biznesowej w:
    - routerach
    - szablonach (EJS / Handlebars)

## 4. Funkcje i logika

- Funkcje **czyste**, jeśli to możliwe
- Brak efektów ubocznych bez potrzeby
- Walidacja danych **zawsze na wejściu**
- Nie ufaj danym z:
    - req.body
    - req.query
    - req.params

## 5. Obsługa błędów

- Nie ignoruj błędów
- `try/catch` tylko tam, gdzie ma sens
- Rzucaj błędy z jasnym komunikatem
- Nie ujawniaj szczegółów systemowych użytkownikowi
- Logi techniczne ≠ komunikaty dla użytkownika

## 6. Bezpieczeństwo

- Escapuj dane renderowane w HTML
- Nigdy nie renderuj surowego HTML od użytkownika
- Brak `eval`, `Function`, dynamicznych `require`
- Sprawdzaj typy i długości stringów
- Ogranicz rozmiar danych wejściowych
- Dane osobowe traktuj jak wrażliwe

## 7. Asynchroniczność

- Preferuj `async/await`
- Unikaj zagnieżdżonych promise chains
- Zawsze obsługuj błędy async
- Nie blokuj event loop

## 8. Baza danych / persystencja

- Warstwa dostępu do danych (DAO / repository)
- Brak SQL / zapisu plików w kontrolerach
- Zapytania czytelne, bez „magii”
- Jedno źródło prawdy dla struktury danych

<!-- ## 9. Szablony (EJS / Handlebars)
- Zero logiki biznesowej
- Tylko:
  - warunki prezentacyjne
  - pętle renderujące
- Dane przygotowane wcześniej w backendzie -->

## 10. Komentarze

- Komentuj **dlaczego**, nie **co**
- Brak oczywistych komentarzy
- TODO tylko z jasnym kontekstem

## 11. Testowalność

- Kod pisz tak, aby dało się go przetestować
- Unikaj twardych zależności (np. fs bez wrappera)
- Funkcje deterministyczne > proceduralne

## 12. Zakazy

- ❌ globalny stan bez potrzeby
- ❌ magiczne liczby i stringi
- ❌ kopiuj–wklej logiki
- ❌ mieszanie warstw (DB ↔ widok)

## 13. Preferencje projektu

- Node.js + Express (bez frontend frameworków)
- SQLite + Prisma
- HTML + CSS (bez frameworków CSS) + JS (bez frameworków frontendowych)
- Kod ma być gotowy do rozbudowy

## 14. Commitowanie

- krótkie commity po angielsku jako czasownik z przedrostkiem "feat/bug", np. "feat: add authorization"
