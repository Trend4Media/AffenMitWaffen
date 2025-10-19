# 🪐 Galaxy 555 System Tracker

Ein React-basiertes Tool zum Tracken von Spielsystemen in Galaxy 555.

## Features

- 🔐 **Passwort-geschützt** - Zugang nur mit dem richtigen Passwort (RecRes555)
- 📊 **889 Systeme** - Vollständige Abdeckung von System 555:111 bis 555:999
- 🪐 **9 Planeten pro System** - Detaillierte Tracking-Möglichkeit für jeden Planeten
- 💾 **Lokaler Speicher** - Alle Daten werden im Browser gespeichert (localStorage)
- 🔍 **Suchfunktion** - Schnelles Finden von spezifischen Systemen
- ⭐ **Markierungen** - Wichtige Planeten können markiert werden
- 📝 **Notizen** - Freie Notizen oder Links für jeden Planeten
- ✅ **RecRes Status** - Tracking ob RecRes in einem System aktiv ist
- 📄 **Pagination** - Übersichtliche Darstellung mit 20 Systemen pro Seite

## Installation

1. Dependencies installieren:
```bash
npm install
```

## Entwicklung

Entwicklungsserver starten:
```bash
npm run dev
```

Die Anwendung ist dann unter `http://localhost:5173` erreichbar.

## Production Build

Production Build erstellen:
```bash
npm run build
```

Build Vorschau ansehen:
```bash
npm run preview
```

## Verwendung

1. **Login**: Gib das Passwort `RecRes555` ein
2. **Systemübersicht**: Siehst du alle 889 Systeme in einer Tabelle
3. **Suche**: Nutze die Suchfunktion, um schnell ein bestimmtes System zu finden
4. **Details**: Klicke auf "Details" bei einem System, um die 9 Planeten zu sehen
5. **RecRes Status**: Markiere Systeme als "RecRes aktiv"
6. **Planeten markieren**: Markiere wichtige Planeten mit einem Stern ⭐
7. **Notizen**: Füge Notizen oder Links für einzelne Planeten hinzu

## Technologie-Stack

- **React 18** - UI Framework
- **Vite** - Build Tool & Dev Server
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **LocalStorage** - Datenpersistierung

## Datenspeicherung

Alle Daten werden lokal im Browser gespeichert:
- **sessionStorage**: Login-Status
- **localStorage**: System- und Planetendaten

Die Daten bleiben auch nach einem Browser-Neustart erhalten (localStorage), der Login-Status wird aber bei jedem neuen Tab zurückgesetzt (sessionStorage).
