# Deployment projektu na iqhost.pl

## Krok 1: Przygotowanie plików

### 1.1 Skonfiguruj plik .env
Skopiuj plik `.env.example` do `.env` i uzupełnij dane:
```bash
cp .env.example .env
```

Edytuj `.env` i podaj dane bazy danych z panelu iqhost:
```
DB_HOST=nazwa_hosta_mysql
DB_PORT=3306
DB_USER=nazwa_użytkownika_bazy
DB_PASSWORD=twoje_hasło_bazy
DB_NAME=nazwa_bazy
PORT=3001
```

### 1.2 Zainstaluj zależności lokalnie
```bash
npm install
```

## Krok 2: Konfiguracja w panelu iqhost

### 2.1 Utwórz bazę danych MySQL
1. Zaloguj się do panelu iqhost.pl
2. Przejdź do sekcji **Bazy danych MySQL**
3. Utwórz nową bazę danych (np. `mari6658_solucje`)
4. Zapamiętaj:
   - Nazwę bazy
   - Użytkownika
   - Hasło

### 2.2 Utwórz konto FTP/SSH
1. Przejdź do **Konta FTP** lub **SSH**
2. Utwórz nowe konto z dostępem do katalogu głównego domeny
3. Zapamiętaj dane logowania

## Krok 3: Przesłanie plików na serwer

### Opcja A: Przez FTP (FileZilla)
1. Pobierz **FileZilla Client** (free)
2. Połącz się używając danych FTP z panelu iqhost
3. Prześlij wszystkie pliki projektu (oprócz `node_modules`) do katalogu:
   ```
   /domains/twojadomena.pl/public_html/
   ```

### Opcja B: Przez Git (zalecane)
Jeśli masz dostęp SSH:
```bash
# Połącz się przez SSH
ssh użytkownik@twoj-serwer.iqhost.pl

# Przejdź do katalogu domeny
cd domains/twojadomena.pl/public_html/

# Sklonuj repozytorium
git clone https://github.com/MarioMala/solutionAI.git .

# Zainstaluj zależności
npm install
```

## Krok 4: Konfiguracja bazy danych

### 4.1 Utwórz tabelę
Utwórz tabelę `entries` w bazie danych przez phpMyAdmin:

```sql
CREATE TABLE IF NOT EXISTS entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    at_date DATETIME,
    edit_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Uruchom skrypt inicjalizacji (opcjonalnie)
Jeśli masz dostęp SSH:
```bash
node init_db.js
```

## Krok 5: Konfiguracja Node.js w iqhost

### 5.1 Włącz Node.js
1. W panelu iqhost przejdź do **Domeny** → **Zarządzanie**
2. Znajdź opcję **Node.js** i włącz ją
3. Ustaw wersję Node.js (zalecana: 18.x lub 20.x)
4. Ustaw katalog aplikacji: `public_html`
5. Ustaw plik startowy: `server.js`
6. Włącz tryb produkcyjny (production mode)

### 5.2 Restart aplikacji
Po przesłaniu plików, zrestartuj aplikację w panelu iqhost.

## Krok 6: Konfiguracja PHP (jeśli potrzebna)

Jeśli iqhost wymaga pliku `index.php` do obsługi Node.js, utwórz:

```php
<?php
// public_html/index.php
header("HTTP/1.1 200 OK");
header("Content-Type: text/html; charset=utf-8");
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=/">
    <title>Przekierowanie</title>
</head>
<body>
    <p>Jeśli nie zostaniesz przekierowany, <a href="/">kliknij tutaj</a>.</p>
</body>
</html>
```

## Krok 7: Testowanie

1. Otwórz przeglądarkę i wejdź na `https://twojadomena.pl`
2. Powinieneś zobaczyć aplikację
3. Sprawdź czy:
   - Wpisy się ładują
   - Dodawanie wpisów działa
   - Filtrowanie modułów działa

## Rozwiązywanie problemów

### Błąd połączenia z bazą danych
- Sprawdź czy dane w `.env` są poprawne
- Upewnij się że host bazy to `localhost` lub poprawny adres z panelu
- Sprawdź czy użytkownik ma uprawnienia do bazy

### Błąd 503 (Service Unavailable)
- Sprawdź czy Node.js jest włączony w panelu
- Sprawdź logi błędów w panelu iqhost
- Upewnij się że port 3001 jest otwarty

### Pliki się nie otwierają
- Sprawdź strukturę plików na serwerze
- Upewnij się że `public/` jest w głównym katalogu
- Sprawdź uprawnienia plików (755 dla katalogów, 644 dla plików)

## Struktura katalogów na serwerze

```
public_html/
├── .env                 # Plik z danymi (nie wersjonuj!)
├── server.js            # Główny plik aplikacji
├── package.json         # Konfiguracja npm
├── database/
│   └── mysql.js         # Połączenie z bazą
├── public/              # Pliki frontendowe
│   ├── index.html
│   ├── css/
│   └── js/
└── node_modules/        # Instalowane przez npm install
```

## Ważne!

1. **Nie commituj pliku `.env`** - dodaj go do `.gitignore`
2. **Regularnie rób backup** bazy danych
3. **Monitoruj logi** w panelu iqhost
