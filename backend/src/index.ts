import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

dotenv.config({ path: './backend/.env' });

const app = express();
const port = parseInt(process.env.BACKEND_PORT || '3001', 10);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080'
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});