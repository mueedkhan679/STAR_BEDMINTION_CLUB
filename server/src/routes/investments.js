import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all investments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const investments = await prisma.investment.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create investment/expense
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { expenseType, amount, quantity } = req.body;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const investment = await prisma.investment.create({
      data: {
        expenseType,
        amount,
        quantity,
        date: now,
        time: timeString
      }
    });

    // If expense type is Shuttle, update shuttle stock
    if (expenseType.toLowerCase() === 'shuttle') {
      const shuttleStock = await prisma.shuttleStock.findFirst();
      
      if (shuttleStock) {
        await prisma.shuttleStock.update({
          where: { id: shuttleStock.id },
          data: {
            totalStock: shuttleStock.totalStock + (quantity || 0)
          }
        });
      } else {
        await prisma.shuttleStock.create({
          data: {
            totalStock: quantity || 0
          }
        });
      }
    }

    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update investment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { expenseType, amount, quantity } = req.body;

    const investment = await prisma.investment.update({
      where: { id: req.params.id },
      data: {
        expenseType,
        amount,
        quantity
      }
    });

    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete investment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.investment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all investments
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await prisma.investment.deleteMany();
    res.json({ message: 'All investments deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;