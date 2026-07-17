import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import playerRoutes from './routes/players.js';
import paymentRoutes from './routes/payments.js';
import investmentRoutes from './routes/investments.js';
import shuttleRoutes from './routes/shuttle.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/shuttle', shuttleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Star Badminton Club API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});