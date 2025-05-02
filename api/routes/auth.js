
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loadData, saveData } = require('../utils/db');
const { JWT_SECRET } = require('../config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const USERS_DB = require('../config').USERS_DB;

// User registration endpoint with detailed logging
const registerHandler = async (req, res) => {
  try {
    console.log("🔵 REGISTER HANDLER CALLED");
    console.log("📥 Registration request received");
    console.log("📋 Registration request headers:", JSON.stringify(req.headers, null, 2));
    console.log("📦 Registration request body:", JSON.stringify(req.body, null, 2));
    
    const { nome, email, senha } = req.body;
    
    // Validate required fields
    if (!nome || !email || !senha) {
      console.log("❌ Registration failed: Missing required fields");
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    
    const users = await loadData(USERS_DB);
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      console.log("❌ Registration failed: Email already in use");
      return res.status(400).json({ message: 'Este email já está em uso' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);
    
    // Create new user
    const newUser = {
      id: require('uuid').v4(),
      nome,
      email,
      senha: hashedPassword,
      saldo: 1000, // Initial balance
      createdAt: new Date().toISOString()
    };
    
    // Add user to database
    users.push(newUser);
    await saveData(USERS_DB, users);
    
    // Create and send JWT token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const { senha: _, ...userWithoutPassword } = newUser;
    
    console.log("✅ Usuário criado com sucesso:", userWithoutPassword);
    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

// Register endpoint
router.post('/register', registerHandler);

// User login
const loginHandler = async (req, res) => {
  try {
    console.log("🔵 LOGIN HANDLER CALLED");
    console.log("Recebendo requisição de login:", req.body);
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    const users = await loadData(USERS_DB);
    
    // Find user
    const user = users.find(user => user.email === email);
    
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(senha, user.senha);
    
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }
    
    // Create and send JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const { senha: _, ...userWithoutPassword } = user;
    
    console.log("Login realizado com sucesso:", userWithoutPassword);
    return res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.post('/login', loginHandler);

// Get user data
const getUserHandler = async (req, res) => {
  try {
    const users = await loadData(USERS_DB);
    const user = users.find(user => user.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Remove password from response
    const { senha, ...userWithoutPassword } = user;
    
    return res.json({
      message: 'Dados do usuário recuperados com sucesso',
      usuario: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.get('/usuario', authenticateToken, getUserHandler);

module.exports = router;
