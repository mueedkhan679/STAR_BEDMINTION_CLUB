import express from 'express';
import prisma from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        player: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment for single player
router.post('/single', authenticateToken, async (req, res) => {
  try {
    const { playerId, amount } = req.body;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const payment = await prisma.payment.create({
      data: {
        playerId,
        amount,
        date: now,
        time: timeString
      },
      include: {
        player: true
      }
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payments for multiple players
router.post('/multiple', authenticateToken, async (req, res) => {
  try {
    const { playerIds, amount } = req.body;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const payments = await prisma.payment.createMany({
      data: playerIds.map(playerId => ({
        playerId,
        amount,
        date: now,
        time: timeString
      }))
    });

    res.json({ 
      message: 'Payments created successfully',
      count: payments.count 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payments for all players
router.post('/all', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    const players = await prisma.player.findMany();

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const payments = await prisma.payment.createMany({
      data: players.map(player => ({
        playerId: player.id,
        amount,
        date: now,
        time: timeString
      }))
    });

    res.json({ 
      message: 'Payments created for all players',
      count: payments.count 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { amount },
      include: {
        player: true
      }
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete payment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.payment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all payments for a player
router.delete('/player/:playerId', authenticateToken, async (req, res) => {
  try {
    await prisma.payment.deleteMany({
      where: { playerId: req.params.playerId }
    });

    res.json({ message: 'All payments deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;