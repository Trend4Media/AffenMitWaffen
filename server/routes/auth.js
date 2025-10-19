import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Registrierung
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Prüfen ob User existiert
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email bereits registriert' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // User erstellen (standardmäßig inaktiv, muss vom Admin freigeschaltet werden)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isActive: false,  // Standardmäßig inaktiv
        isAdmin: false
      }
    });

    res.json({
      message: 'Registrierung erfolgreich! Dein Account muss noch von einem Administrator freigeschaltet werden.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Registrierungs-Fehler:', error);
    res.status(500).json({ error: 'Serverfehler bei der Registrierung' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // User finden
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Passwort prüfen
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Prüfen ob Account freigeschaltet ist
    if (!user.isActive) {
      return res.status(403).json({ error: 'Dein Account wurde noch nicht freigeschaltet. Bitte warte auf die Freigabe durch einen Administrator.' });
    }

    // Token generieren
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(500).json({ error: 'Serverfehler beim Login' });
  }
});

export default router;
