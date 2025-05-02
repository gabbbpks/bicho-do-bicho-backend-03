
const path = require('path');

// Database paths
const DB_DIR = path.join(process.cwd(), 'db');
const USERS_DB = path.join(DB_DIR, 'users.json');
const BETS_DB = path.join(DB_DIR, 'bets.json');
const RESULTS_DB = path.join(DB_DIR, 'results.json');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'jogo-do-bicho-secret-key';

module.exports = {
  DB_DIR,
  USERS_DB,
  BETS_DB,
  RESULTS_DB,
  JWT_SECRET
};
