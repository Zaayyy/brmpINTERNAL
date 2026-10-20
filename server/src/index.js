import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import absensiRoutes from './routes/absensi.js';
import cutiRoutes from './routes/cuti.js';
import sptRoutes from './routes/spt.js';
import usersRoutes from './routes/users.js';
import admsRoutes from './routes/adms.js';
import adminRoutes from './routes/admin.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Support JSON (with up to 25mb for photo avatars), Text (ADMS machines send raw text), and URL-Encoded
app.use(express.json({ limit: '25mb' }));
app.use(express.text({ type: ['text/*', 'application/octet-stream', ''] }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve brmpSPT static web app
const brmpSptPath = path.resolve(__dirname, '../../brmpSPT');
app.use('/spt-portal', express.static(brmpSptPath));
app.use('/brmpSPT', express.static(brmpSptPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BRMP DIY Backend API', timestamp: new Date() });
});

// ADMS Receiver Protocol Routes (handles /iclock/cdata, /cdata, /getrequest, /devicecmd)
app.use('/iclock', admsRoutes);
app.use('/api/adms', admsRoutes);
app.use('/', admsRoutes);

// Regular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/cuti', cutiRoutes);
app.use('/api/spt', sptRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('BRMP DIY API Server & ADMS Receiver is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 BRMP DIY Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`========================================`);
});
