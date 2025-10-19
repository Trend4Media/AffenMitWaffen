import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Alle Middlewares authentifizieren
router.use(authenticateToken);

// Alle Systeme eines Users abrufen
router.get('/', async (req, res) => {
  try {
    const systems = await prisma.system.findMany({
      where: {
        userId: req.user.userId
      },
      include: {
        planets: true
      }
    });

    res.json(systems);
  } catch (error) {
    console.error('Fehler beim Abrufen der Systeme:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// System erstellen oder aktualisieren
router.post('/', async (req, res) => {
  try {
    const { systemId, recRes, planets } = req.body;
    const userId = req.user.userId;

    // Prüfen ob System existiert
    let system = await prisma.system.findUnique({
      where: {
        userId_systemId: {
          userId,
          systemId
        }
      }
    });

    if (system) {
      // System aktualisieren
      system = await prisma.system.update({
        where: { id: system.id },
        data: {
          recRes,
          lastUpdate: new Date()
        },
        include: {
          planets: true
        }
      });
    } else {
      // Neues System erstellen
      system = await prisma.system.create({
        data: {
          systemId,
          recRes: recRes || false,
          userId,
          planets: {
            create: planets || []
          }
        },
        include: {
          planets: true
        }
      });
    }

    res.json(system);
  } catch (error) {
    console.error('Fehler beim Speichern des Systems:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// System aktualisieren
router.patch('/:systemId', async (req, res) => {
  try {
    const { systemId } = req.params;
    const { recRes } = req.body;
    const userId = req.user.userId;

    const system = await prisma.system.update({
      where: {
        userId_systemId: {
          userId,
          systemId
        }
      },
      data: {
        recRes,
        lastUpdate: new Date()
      },
      include: {
        planets: true
      }
    });

    res.json(system);
  } catch (error) {
    console.error('Fehler beim Aktualisieren:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Planet aktualisieren
router.patch('/:systemId/planets/:planetId', async (req, res) => {
  try {
    const { systemId, planetId } = req.params;
    const { important, notes } = req.body;
    const userId = req.user.userId;

    // System finden
    const system = await prisma.system.findUnique({
      where: {
        userId_systemId: {
          userId,
          systemId
        }
      }
    });

    if (!system) {
      return res.status(404).json({ error: 'System nicht gefunden' });
    }

    // Planet suchen oder erstellen
    let planet = await prisma.planet.findUnique({
      where: {
        systemId_planetId: {
          systemId: system.id,
          planetId
        }
      }
    });

    if (planet) {
      planet = await prisma.planet.update({
        where: { id: planet.id },
        data: { important, notes }
      });
    } else {
      planet = await prisma.planet.create({
        data: {
          planetId,
          important: important || false,
          notes: notes || '',
          systemId: system.id
        }
      });
    }

    // System lastUpdate aktualisieren
    await prisma.system.update({
      where: { id: system.id },
      data: { lastUpdate: new Date() }
    });

    res.json(planet);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Planeten:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Alle Systeme initialisieren (555:111 bis 555:999)
router.post('/initialize', async (req, res) => {
  try {
    const userId = req.user.userId;
    const systemsToCreate = [];

    for (let i = 111; i <= 999; i++) {
      const systemId = `555:${i}`;
      
      // Prüfen ob schon existiert
      const existing = await prisma.system.findUnique({
        where: {
          userId_systemId: {
            userId,
            systemId
          }
        }
      });

      if (!existing) {
        systemsToCreate.push({
          systemId,
          recRes: false,
          userId,
          planets: {
            create: Array.from({ length: 9 }, (_, idx) => ({
              planetId: `555:${i}:${idx + 1}`,
              important: false,
              notes: ''
            }))
          }
        });
      }
    }

    // Batch create (in kleineren Gruppen wegen Performance)
    const batchSize = 50;
    for (let i = 0; i < systemsToCreate.length; i += batchSize) {
      const batch = systemsToCreate.slice(i, i + batchSize);
      await Promise.all(
        batch.map(systemData =>
          prisma.system.create({
            data: systemData
          })
        )
      );
    }

    res.json({ 
      message: 'Systeme erfolgreich initialisiert',
      count: systemsToCreate.length
    });
  } catch (error) {
    console.error('Fehler bei der Initialisierung:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

export default router;
