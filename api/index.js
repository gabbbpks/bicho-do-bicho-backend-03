
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import middleware
const { requestLogger } = require('./middleware/logger');

// Import routes
const authRoutes = require('./routes/auth');
const apostasRoutes = require('./routes/apostas');
const resultadosRoutes = require('./routes/resultados');
const usuariosRoutes = require('./routes/usuarios');

// Import database utils
const { ensureDbExists } = require('./utils/db');

const app = express();

// Apply middleware
app.use(requestLogger);
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Ensure the database is ready before starting the server
ensureDbExists();

// Base route for API health check
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API do Jogo do Bicho funcionando!' });
});

// All auth routes
app.use('/api/auth', authRoutes);

// Apostas routes
app.use('/api/apostas', apostasRoutes);

// Resultados routes
app.use('/api/resultados', resultadosRoutes);

// Usuarios routes
app.use('/api/usuarios', usuariosRoutes);

// Debug endpoint to check what's being received
app.post('/api/debug', (req, res) => {
  console.log('Debug endpoint hit with body:', req.body);
  console.log('Headers:', req.headers);
  return res.status(200).json({
    message: 'Debug endpoint hit',
    body: req.body,
    headers: req.headers
  });
});

// Enhanced catch-all route handler to log unmatched routes
app.use('/api/*', (req, res) => {
  console.log(`❌ API ROUTE NOT FOUND: ${req.method} ${req.originalUrl}`);
  console.log('📋 HEADERS:', JSON.stringify(req.headers, null, 2));
  if (req.body) console.log('📦 BODY:', JSON.stringify(req.body, null, 2));
  res.status(404).json({ 
    message: 'Rota não encontrada',
    requestedMethod: req.method,
    requestedPath: req.originalUrl
  });
});

// Make sure the server port is set for deployment
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Export for Vercel serverless function
module.exports = app;
