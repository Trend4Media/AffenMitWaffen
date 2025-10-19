import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function ensureAdminExists() {
  try {
    // Prüfen ob bereits ein Admin existiert
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true }
    });

    if (existingAdmin) {
      console.log('✅ Admin-Account bereits vorhanden');
      return;
    }

    // Kein Admin vorhanden - Erstelle Default-Admin
    const email = 't.o@trend4media.de';
    const password = '02327187';
    const name = 'Admin';

    console.log('⚙️  Kein Admin gefunden. Erstelle Default-Admin...');

    // Prüfen ob User mit dieser Email bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // User existiert, mache ihn zum Admin
      await prisma.user.update({
        where: { email },
        data: {
          isActive: true,
          isAdmin: true
        }
      });
      console.log('✅ Bestehender User wurde zum Admin gemacht');
    } else {
      // Erstelle neuen Admin-User
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isActive: true,
          isAdmin: true
        }
      });
      console.log('✅ Default-Admin-Account erstellt!');
    }

    console.log('📧 Email:', email);
    console.log('🔑 Passwort: 02327187');
    console.log('');
    console.log('⚠️  WICHTIG: Bitte ändere das Passwort nach dem ersten Login!');
    console.log('');

  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Admin-Accounts:', error);
    // Nicht den Server crashen, nur warnen
  }
}
