import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { hashPassword, comparePassword } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize default admin
router.post('/init', async (req, res) => {
  try {
    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      return res.json({ message: 'Admin already exists' });
    }

    const hashedPassword = await hashPassword('yahya123');

    const admin = await prisma.admin.create({
      data: {
        username: 'yahya',
        password: hashedPassword
      }
    });

    res.json({ message: 'Admin created successfully', user: { username: admin.username } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;