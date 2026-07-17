import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get shuttle stock
router.get('/stock', authenticateToken, async (req, res) => {
  try {
    const shuttleStock = await prisma.shuttleStock.findFirst();
    
    if (!shuttleStock) {
      return res.json({
        totalStock: 0,
        usedStock: 0,
        remaining: 0
      });
    }

    res.json(shuttleStock);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Use shuttle (decrease stock)
router.post('/use', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    const shuttleStock = await prisma.shuttleStock.findFirst();

    if (!shuttleStock) {
      return res.status(404).json({ error: 'No shuttle stock found' });
    }

    if (shuttleStock.remaining < quantity) {
      return res.status(400).json({ error: 'Insufficient shuttle stock' });
    }

    const updatedStock = await prisma.shuttleStock.update({
      where: { id: shuttleStock.id },
      data: {
        usedStock: shuttleStock.usedStock + quantity,
        remaining: shuttleStock.remaining - quantity
      }
    });

    res.json(updatedStock);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset shuttle stock
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    const shuttleStock = await prisma.shuttleStock.findFirst();

    if (!shuttleStock) {
      return res.status(404).json({ error: 'No shuttle stock found' });
    }

    const updatedStock = await prisma.shuttleStock.update({
      where: { id: shuttleStock.id },
      data: {
        usedStock: 0,
        remaining: shuttleStock.totalStock
      }
    });

    res.json(updatedStock);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;