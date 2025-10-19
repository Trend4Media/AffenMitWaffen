import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 't.o@trend4media.de';
    const password = '02327187';
    const name = 'Admin';

    // Prüfen ob User bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('⚠️  User existiert bereits. Update zu Admin...');
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          isActive: true,
          isAdmin: true
        }
      });

      console.log('✅ User wurde zum Admin gemacht!');
      console.log('📧 Email:', updatedUser.email);
      console.log('👑 Admin:', updatedUser.isAdmin);
      console.log('✓ Aktiv:', updatedUser.isActive);
    } else {
      // Passwort hashen
      const hashedPassword = await bcrypt.hash(password, 10);

      // Admin-User erstellen
      const adminUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isActive: true,
          isAdmin: true
        }
      });

      console.log('✅ Admin-Account erfolgreich erstellt!');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('👑 Admin:', adminUser.isAdmin);
      console.log('✓ Aktiv:', adminUser.isActive);
    }

    console.log('\n🎉 Du kannst dich jetzt einloggen!');
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Admin-Accounts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
