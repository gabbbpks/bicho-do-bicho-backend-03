
const express = require('express');
const { loadData } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { USERS_DB } = require('../config');

const router = express.Router();

// Get user balance
const getBalanceHandler = async (req, res) => {
  try {
    const users = await loadData(USERS_DB);
    const user = users.find(user => user.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    return res.json({
      message: 'Saldo recuperado com sucesso',
      saldo: user.saldo
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.get('/saldo/:userId', authenticateToken, getBalanceHandler);

module.exports = router;
