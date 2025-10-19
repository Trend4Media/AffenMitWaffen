import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function initDatabase() {
  try {
    console.log('🔧 Initialisiere Datenbank...');
    
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss --skip-generate');
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('✅ Datenbank erfolgreich initialisiert!');
  } catch (error) {
    console.error('❌ Fehler bei der Datenbank-Initialisierung:', error);
    // Nicht den Server crashen, nur warnen
  }
}
