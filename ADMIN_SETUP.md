# Admin Account erstellen

Da neue Registrierungen jetzt standardmäßig inaktiv sind und ein Admin sie freischalten muss, benötigst du einen initialen Admin-Account.

## Methode 1: Direkt in der Datenbank (empfohlen)

1. **Verbinde dich mit der PostgreSQL-Datenbank:**
   - Öffne Prisma Studio: `npx prisma studio`
   - Oder nutze Railway's PostgreSQL-Interface

2. **Erstelle einen Admin-User:**
   - Gehe zur `User` Tabelle
   - Erstelle einen neuen User oder bearbeite einen existierenden
   - Setze folgende Felder:
     - `isActive`: `true`
     - `isAdmin`: `true`

## Methode 2: Via SQL (Railway PostgreSQL)

In Railway kannst du direkt SQL ausführen:

```sql
-- Finde einen existierenden User
SELECT id, email, name, "isActive", "isAdmin" FROM "User";

-- Mache einen User zum Admin und aktiviere ihn
UPDATE "User" 
SET "isActive" = true, "isAdmin" = true 
WHERE email = 'deine@email.de';
```

## Methode 3: Temporäres Admin-Registrierungs-Passwort

Erstelle eine `.env` Datei mit:
```
ADMIN_REGISTRATION_SECRET="geheimer-admin-code-123"
```

Dann kann man sich mit diesem Code als Admin registrieren (siehe Code-Kommentar in auth.js).

## Wichtig!

⚠️ **Sichere deinen ersten Admin-Account ab**, da er volle Kontrolle über alle User hat!

## Admin-Funktionen

Sobald du als Admin eingeloggt bist, kannst du:

1. **Alle User sehen**: `GET /api/admin/users`
2. **User freischalten**: `PATCH /api/admin/users/:userId/activate`
   ```json
   { "isActive": true }
   ```
3. **Admin-Rechte vergeben**: `PATCH /api/admin/users/:userId/admin`
   ```json
   { "isAdmin": true }
   ```
4. **User löschen**: `DELETE /api/admin/users/:userId`

## Workflow

1. Ein neuer User registriert sich → Account ist **inaktiv**
2. Admin sieht alle inaktiven Accounts im Admin-Panel
3. Admin schaltet den Account **frei** → User kann sich einloggen
4. Optional: Admin kann anderen Usern auch Admin-Rechte geben
