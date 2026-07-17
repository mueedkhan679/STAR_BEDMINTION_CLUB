import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all players
router.get('/', authenticateToken, async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        payments: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single player
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: req.params.id },
      include: {
        payments: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create player
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, fatherName, address, email, picture } = req.body;

    // Generate unique player code
    const lastPlayer = await prisma.player.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    let playerCode = 'SB001';
    if (lastPlayer) {
      const lastCode = parseInt(lastPlayer.playerCode.replace('SB', ''));
      playerCode = `SB${String(lastCode + 1).padStart(3, '0')}`;
    }

    const player = await prisma.player.create({
      data: {
        playerCode,
        name,
        fatherName,
        address,
        email,
        picture
      }
    });

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update player
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, fatherName, address, email, picture } = req.body;

    const player = await prisma.player.update({
      where: { id: req.params.id },
      data: {
        name,
        fatherName,
        address,
        email,
        picture
      }
    });

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete player
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.player.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search players
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const query = req.params.query;
    
    const players = await prisma.player.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { fatherName: { contains: query } },
          { playerCode: { contains: query } }
        ]
      },
      include: {
        payments: {
          orderBy: { date: 'desc' }
        }
      }
    });

    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;