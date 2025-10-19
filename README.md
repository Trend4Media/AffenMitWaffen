# 🪐 Galaxy 555 System Tracker

Ein React-basiertes Tool mit Backend zum Tracken von Spielsystemen in Galaxy 555.

## Features

- 🔐 **Echter Login mit JWT** - Sicherer Zugang mit Email & Passwort
- 👥 **Multi-User** - Jeder User hat seine eigenen Daten
- 📊 **889 Systeme** - Vollständige Abdeckung von System 555:111 bis 555:999
- 🪐 **9 Planeten pro System** - Detaillierte Tracking-Möglichkeit für jeden Planeten
- 💾 **PostgreSQL Datenbank** - Alle Daten werden in einer echten Datenbank gespeichert
- 🔍 **Suchfunktion** - Schnelles Finden von spezifischen Systemen
- ⭐ **Markierungen** - Wichtige Planeten können markiert werden
- 📝 **Notizen** - Freie Notizen oder Links für jeden Planeten
- ✅ **RecRes Status** - Tracking ob RecRes in einem System aktiv ist
- 📄 **Pagination** - Übersichtliche Darstellung mit 20 Systemen pro Seite

## Technologie-Stack

### Frontend
- **React 18** - UI Framework
- **Vite** - Build Tool & Dev Server
- **TailwindCSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js + Express** - REST API
- **Prisma** - ORM für Datenbank-Zugriff
- **PostgreSQL** - Datenbank
- **JWT** - Authentifizierung
- **bcryptjs** - Passwort-Hashing

## Installation & Entwicklung

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL Datenbank
- npm oder yarn

### 1. Repository klonen
```bash
git clone https://github.com/Trend4Media/AffenMitWaffen.git
cd AffenMitWaffen
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
Erstelle eine `.env` Datei im Root-Verzeichnis:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/galaxy555"
JWT_SECRET="dein-super-geheimer-jwt-secret"
NODE_ENV="development"
PORT=3001
```

### 4. Datenbank einrichten
```bash
# Prisma Client generieren
npm run prisma:generate

# Datenbank-Schema erstellen
npm run prisma:push

# Optional: Prisma Studio öffnen
npx prisma studio
```

### 5. Entwicklungsserver starten

**Option A: Backend und Frontend separat**
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev
```

**Option B: Beide zusammen**
```bash
npm run dev:all
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Production Build

```bash
# Build erstellen
npm run build

# Production Server starten
npm start
```

## Railway Deployment

Das Projekt ist für Railway vorkonfiguriert:

### 1. PostgreSQL Datenbank hinzufügen
- Gehe zu deinem Railway Projekt
- Füge eine PostgreSQL Datenbank hinzu
- Die `DATABASE_URL` wird automatisch gesetzt

### 2. Umgebungsvariablen setzen
Setze in Railway:
- `JWT_SECRET`: Ein langer, zufälliger String
- `NODE_ENV`: `production`

### 3. Deploy
Railway deployed automatisch bei jedem Push zum Main-Branch.

## API Endpunkte

### Authentifizierung
- `POST /api/auth/register` - Registrierung
- `POST /api/auth/login` - Login

### Systeme (benötigt JWT Token)
- `GET /api/systems` - Alle Systeme abrufen
- `POST /api/systems` - System erstellen/aktualisieren
- `PATCH /api/systems/:systemId` - System aktualisieren
- `PATCH /api/systems/:systemId/planets/:planetId` - Planet aktualisieren
- `POST /api/systems/initialize` - Alle 889 Systeme initialisieren

## Verwendung

1. **Registrierung**: Erstelle einen Account mit Email & Passwort
2. **Login**: Melde dich an
3. **Systeme werden automatisch initialisiert** beim ersten Login
4. **Systemübersicht**: Siehst du alle 889 Systeme in einer Tabelle
5. **Suche**: Nutze die Suchfunktion, um schnell ein bestimmtes System zu finden
6. **Details**: Klicke auf "Details" bei einem System, um die 9 Planeten zu sehen
7. **RecRes Status**: Markiere Systeme als "RecRes aktiv"
8. **Planeten markieren**: Markiere wichtige Planeten mit einem Stern ⭐
9. **Notizen**: Füge Notizen oder Links für einzelne Planeten hinzu

## Datenspeicherung

Alle Daten werden in einer PostgreSQL-Datenbank gespeichert:
- **Users**: Email, Passwort (gehasht), Name
- **Systems**: System-ID, RecRes Status, Zuordnung zum User
- **Planets**: Planet-ID, Important-Flag, Notizen, Zuordnung zum System

Jeder User hat seine eigenen isolierten Daten. Die Authentifizierung erfolgt über JWT Tokens.

## Lizenz

Private Use - Trend4Media
