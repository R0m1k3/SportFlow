import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

// Charger les variables d'environnement du fichier backend/.env
dotenv.config({ path: './backend/.env' });

const app = express();
const port = parseInt(process.env.BACKEND_PORT || '3001', 10);

// Configurer CORS pour autoriser les requêtes depuis le frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080'
}));

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Routes de l'API
app.use('/api/auth', authRoutes);

// Une route "health check" pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});