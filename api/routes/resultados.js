
const express = require('express');
const { loadData, saveData } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { getAnimalByNumber } = require('../utils/animals');
const { RESULTS_DB, BETS_DB, USERS_DB } = require('../config');

const router = express.Router();

const drawResultHandler = async (req, res) => {
  try {
    // Generate random number between 1 and 100
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    
    // Get animal for the number
    const animal = getAnimalByNumber(randomNumber);
    
    // Create result
    const result = {
      id: require('uuid').v4(),
      numero: randomNumber,
      animal,
      createdAt: new Date().toISOString()
    };
    
    // Save result
    const results = await loadData(RESULTS_DB);
    results.push(result);
    await saveData(RESULTS_DB, results);
    
    return res.status(201).json({
      message: 'Resultado sorteado com sucesso',
      resultado: result
    });
  } catch (error) {
    console.error('Draw result error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.post('/sortear', authenticateToken, drawResultHandler);

const listResultsHandler = async (req, res) => {
  try {
    const results = await loadData(RESULTS_DB);
    
    // Sort by date (newest first)
    const sortedResults = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.json({
      message: 'Resultados listados com sucesso',
      resultados: sortedResults
    });
  } catch (error) {
    console.error('List results error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.get('/listar', listResultsHandler);

const verifyWinningBetsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get latest result
    const results = await loadData(RESULTS_DB);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Nenhum resultado encontrado' });
    }
    
    // Sort by date (newest first)
    const sortedResults = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestResult = sortedResults[0];
    
    // Get user bets
    const bets = await loadData(BETS_DB);
    const userBets = bets.filter(bet => bet.userId === userId && bet.status === 'pending');
    
    if (userBets.length === 0) {
      return res.json({
        message: 'Nenhuma aposta pendente encontrada',
        apostasGanhadoras: [],
        apostasPerdedoras: []
      });
    }
    
    const winningBets = [];
    const losingBets = [];
    
    // Calculate total winnings
    let totalWinnings = 0;
    
    // Check each bet
    userBets.forEach(bet => {
      // A bet wins if:
      // 1. The bet number matches exactly the draw number
      // 2. The bet number is in the same group (animal) as the draw number
      const exactMatch = bet.numero === latestResult.numero;
      const sameAnimal = bet.animal.group === latestResult.animal.group;
      
      if (exactMatch || sameAnimal) {
        // Win
        bet.status = 'win';
        winningBets.push(bet);
        
        // Calculate winnings (5x for exact match, 2x for same animal)
        const multiplier = exactMatch ? 5 : 2;
        totalWinnings += bet.valor * multiplier;
      } else {
        // Loss
        bet.status = 'loss';
        losingBets.push(bet);
      }
    });
    
    // Update bets status
    await saveData(BETS_DB, bets);
    
    // Update user balance if there are winning bets
    if (winningBets.length > 0) {
      const users = await loadData(USERS_DB);
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].saldo += totalWinnings;
        await saveData(USERS_DB, users);
      }
    }
    
    return res.json({
      message: 'Verificação concluída com sucesso',
      apostasGanhadoras: winningBets,
      apostasPerdedoras: losingBets,
      ganhoTotal: totalWinnings
    });
  } catch (error) {
    console.error('Verify winning bets error:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

router.post('/verificar', authenticateToken, verifyWinningBetsHandler);

module.exports = router;
