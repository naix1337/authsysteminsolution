# 🚀 Setup ohne Docker (Lokale Installation)

Dieses Guide zeigt dir, wie du das Projekt **ohne Docker** auf Windows aufsetzt.

---

## 📋 Voraussetzungen

- Node.js 20+ ([Download](https://nodejs.org/))
- PostgreSQL 16+ ([Download](https://www.postgresql.org/download/windows/))
- Redis (Windows) ([Download](https://github.com/tporadowski/redis/releases))
- Git

---

## 1️⃣ PostgreSQL Installation

### Download & Installation

1. Lade PostgreSQL herunter: https://www.postgresql.org/download/windows/
2. Führe den Installer aus
3. Während der Installation:
   - **Port**: 5432 (Standard)
   - **Superuser Password**: Wähle ein sicheres Passwort (z.B. `postgres123`)
   - Notiere das Passwort!

### Datenbank erstellen

Öffne **pgAdmin** (wurde mit PostgreSQL installiert):

1. Rechtsklick auf "Databases" → "Create" → "Database"
2. Name: `authsystem`
3. Owner: `postgres`
4. Klick "Save"

**Oder per Kommandozeile:**

```bash
# Öffne cmd als Administrator
psql -U postgres
# Passwort eingeben

# In psql:
CREATE DATABASE authsystem;
\q
```

---

## 2️⃣ Redis Installation (Windows)

### Download & Installation

1. Lade Redis für Windows herunter:
   - https://github.com/tporadowski/redis/releases
   - Download: `Redis-x64-5.0.14.1.msi`

2. Installiere Redis
   - Standard-Port: 6379
   - "Add Redis to PATH" aktivieren

### Redis starten

**Option 1: Als Windows Service (empfohlen)**
```bash
# Redis ist nach Installation automatisch als Service aktiv
# Überprüfen:
redis-cli ping
# Sollte antworten: PONG
```

**Option 2: Manuell starten**
```bash
redis-server
# Lasse das Fenster offen!
```

---

## 3️⃣ Projekt Setup

### Backend konfigurieren

1. Navigiere zum Backend-Ordner:
```bash
cd "c:/Users/NAIX/Documents/auth system/backend"
```

2. Erstelle `.env` Datei (falls nicht vorhanden):
```bash
notepad .env
```

3. Füge folgende Konfiguration ein:

```env
# Database (Lokale PostgreSQL)
DATABASE_URL="postgresql://postgres:DEIN_PASSWORT@localhost:5432/authsystem?schema=public"

# Redis (Lokal)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets (Generiere eigene!)
JWT_SECRET=dein-super-geheimer-jwt-schluessel-hier
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=dein-super-geheimer-refresh-schluessel-hier
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Crypto
RSA_KEY_SIZE=4096
AES_KEY_SIZE=256

# Session
SESSION_TIMEOUT=3600
HEARTBEAT_INTERVAL=30

# Security
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
MAX_LOGIN_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW=900

# License
LICENSE_KEY_FORMAT=XXX-XXX-XXX-XXX
DEFAULT_TRIAL_DAYS=7
HWID_RESET_COOLDOWN=30

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.gif,.pdf,.txt
```

**⚠️ WICHTIG:** Ersetze `DEIN_PASSWORT` mit deinem PostgreSQL-Passwort!

4. Installiere Dependencies:
```bash
npm install
```

5. Generiere Prisma Client:
```bash
npx prisma generate
```

6. Führe Datenbank-Migrationen aus:
```bash
npx prisma migrate dev --name init
```

7. (Optional) Seed initial data:
```bash
npm run seed
```

### Backend starten

```bash
npm run start:dev
```

✅ Backend läuft auf: **http://localhost:3001**  
✅ API Docs auf: **http://localhost:3001/api/docs**

---

## 4️⃣ Frontend Setup

1. Öffne ein **neues Terminal** und navigiere zum Frontend:
```bash
cd "c:/Users/NAIX/Documents/auth system/frontend"
```

2. Erstelle `.env.local`:
```bash
notepad .env.local
```

3. Füge ein:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Installiere Dependencies:
```bash
npm install
```

5. Starte Frontend:
```bash
npm run dev
```

✅ Frontend läuft auf: **http://localhost:3000**

---

## 5️⃣ Testen

### Backend testen

Öffne http://localhost:3001/api/docs in deinem Browser.

Du solltest die Swagger-Dokumentation sehen mit allen API-Endpoints.

### Datenbank überprüfen

```bash
# pgAdmin öffnen
# Oder per CLI:
psql -U postgres -d authsystem

# In psql:
\dt  # Zeigt alle Tabellen
SELECT * FROM "User";  # Zeigt User-Tabelle
\q   # Beenden
```

### Redis überprüfen

```bash
redis-cli

# In redis-cli:
PING  # Sollte "PONG" zurückgeben
KEYS *  # Zeigt alle Keys
EXIT
```

---

## 6️⃣ Troubleshooting

### PostgreSQL verbindet nicht

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Lösung:**
1. Überprüfe ob PostgreSQL läuft:
   - Windows Services → "postgresql-x64-16" sollte "Running" sein
2. Überprüfe Port:
   ```bash
   netstat -an | findstr 5432
   ```
3. Überprüfe Passwort in `.env`

### Redis verbindet nicht

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Lösung:**
1. Starte Redis Service:
   ```bash
   # Services.msc öffnen
   # "Redis" Service starten
   ```
2. Oder manuell:
   ```bash
   redis-server
   ```

### Prisma Fehler

**Problem:** `Error: P1001: Can't reach database server`

**Lösung:**
1. PostgreSQL muss laufen
2. DATABASE_URL in `.env` überprüfen
3. Datenbank muss existieren:
   ```bash
   psql -U postgres
   CREATE DATABASE authsystem;
   ```

### Port bereits belegt

**Problem:** `Error: listen EADDRINUSE: address already in use :::3001`

**Lösung:**
1. Finde den Prozess:
   ```bash
   netstat -ano | findstr :3001
   ```
2. Beende den Prozess:
   ```bash
   taskkill /PID <PID> /F
   ```

---

## 7️⃣ Production Setup (ohne Docker)

### Als Windows Service einrichten

Du kannst **PM2** oder **NSSM** verwenden, um die Anwendungen als Service zu installieren.

**Mit PM2:**

```bash
# PM2 global installieren
npm install -g pm2

# Backend als Service
cd backend
pm2 start npm --name "auth-backend" -- run start:prod

# Frontend als Service
cd frontend
pm2 start npm --name "auth-frontend" -- start

# Beim Systemstart automatisch starten
pm2 startup
pm2 save
```

---

## 8️⃣ Backup (ohne Docker)

### PostgreSQL Backup

```bash
# Backup erstellen
pg_dump -U postgres authsystem > backup.sql

# Backup wiederherstellen
psql -U postgres authsystem < backup.sql
```

### Redis Backup

```bash
# Redis speichert automatisch in dump.rdb
# Kopiere die Datei für Backup
copy C:\Program Files\Redis\dump.rdb C:\Backups\redis-backup.rdb
```

---

## 🎯 Quick Start Commands

```bash
# Terminal 1: Backend
cd "c:/Users/NAIX/Documents/auth system/backend"
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Terminal 2: Frontend
cd "c:/Users/NAIX/Documents/auth system/frontend"
npm install
npm run dev
```

---

## ✅ Checklist

- [ ] PostgreSQL installiert und läuft
- [ ] Redis installiert und läuft
- [ ] Datenbank `authsystem` erstellt
- [ ] Backend `.env` konfiguriert
- [ ] Backend Dependencies installiert
- [ ] Prisma Migrationen ausgeführt
- [ ] Backend startet ohne Fehler
- [ ] Frontend `.env.local` konfiguriert
- [ ] Frontend Dependencies installiert
- [ ] Frontend startet ohne Fehler
- [ ] http://localhost:3001/api/docs öffnet
- [ ] http://localhost:3000 öffnet

---

**Viel Erfolg! 🚀**

Bei Problemen: Überprüfe die Logs in den Terminals oder schaue ins Windows Event Log.
