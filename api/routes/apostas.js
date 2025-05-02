
const express = require('express');
const { loadData, saveData } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { getAnimalByNumber } = require('../utils/animals');
const { BETS_DB, USERS_DB } = require('../config');

const router = express.Router();

const createBetHandler = async (req, res) => {
  try {
    const { valor, numero } = req.body;
    
    if (!valor || !numero) {
      return res.status(400).json({ message: 'Valor e número são obrigatórios' });
    }
    
    // Validate bet value
    const betValue = parseFloat(valor);
    if (isNaN(betValue) || betValue <= 0) {
      return res.status(400).json({ message: 'Valor da aposta deve ser positivo' });
    }
    
    // Validate bet number
    const betNumber = parseInt(numero);
    if (isNaN(betNumber) || betNumber < 1 || betNumber > 100) {
      return res.status(400).json({ message: 'Número da aposta deve estar entre 1 e 100' });
    }
    
    // Get user
    const users = await loadData(USERS_DB);
    const userIndex = users.findIndex(user => user.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const user = users[userIndex];
    
    // Check if user has enough balance
    if (user.saldo < betValue) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }
    
    // Get animal for the bet
    const animal = getAnimalByNumber(betNumber);
    
    if (!animal) {
      return res.status(400).json({ message: 'Animal não encontrado para este número' });
    }
    
    // Create bet
    const bet = {
      id: require('uuid').v4(),
      userId: user.id,
      valor: betValue,
      numero: betNumber,
      animal,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending, win, loss
    };
    
    // Update user balance
    user.saldo -= betValue;
    users[userIndex] = user;
    await saveData(USERS_DB, users);
    
    // Save bet
    const bets = await loadData(BETS_DB);
    bets.push(bet);
    await saveData(BETS_DB, bets);
    
    return res.status(201).json({
      message: 'Aposta criada com sucesso',
      aposta: bet
    });
  } catch (error) {
    console.error('Create bet error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.post('/criar', authenticateToken, createBetHandler);

const listBetsHandler = async (req, res) => {
  try {
    const bets = await loadData(BETS_DB);
    const userBets = bets.filter(bet => bet.userId === req.user.id);
    
    return res.json({
      message: 'Apostas listadas com sucesso',
      apostas: userBets
    });
  } catch (error) {
    console.error('List bets error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.get('/listar', authenticateToken, listBetsHandler);

const listBetsByUserIdHandler = async (req, res) => {
  try {
    // Check if user ID in token matches requested user ID
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }
    
    const bets = await loadData(BETS_DB);
    const userBets = bets.filter(bet => bet.userId === req.params.userId);
    
    return res.json({
      message: 'Apostas listadas com sucesso',
      apostas: userBets
    });
  } catch (error) {
    console.error('List bets error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.get('/listar/:userId', authenticateToken, listBetsByUserIdHandler);

module.exports = router;
