import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: Nur für Admins
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Nur Administratoren haben Zugriff auf diese Funktion' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler' });
  }
};

// Alle Middlewares authentifizieren
router.use(authenticateToken);
router.use(requireAdmin);

// Alle User abrufen (mit Freigabe-Status)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { systems: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen der User:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// User freischalten/deaktivieren
router.patch('/users/:userId/activate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isAdmin: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Fehler beim Aktivieren des Users:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// User Admin-Rechte geben/entziehen
router.patch('/users/:userId/admin', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isAdmin: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Fehler beim Setzen der Admin-Rechte:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// User löschen
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verhindere, dass sich ein Admin selbst löscht
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Du kannst dich nicht selbst löschen' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Users:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

export default router;
