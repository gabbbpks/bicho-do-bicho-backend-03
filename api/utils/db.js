
const fs = require('fs').promises;
const path = require('path');
const { DB_DIR } = require('../config');

// Helper functions for data management
const ensureDbExists = async () => {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    
    // Initialize users.json if it doesn't exist
    try {
      await fs.access(path.join(DB_DIR, 'users.json'));
    } catch (error) {
      await fs.writeFile(path.join(DB_DIR, 'users.json'), JSON.stringify([]));
    }
    
    // Initialize bets.json if it doesn't exist
    try {
      await fs.access(path.join(DB_DIR, 'bets.json'));
    } catch (error) {
      await fs.writeFile(path.join(DB_DIR, 'bets.json'), JSON.stringify([]));
    }
    
    // Initialize results.json if it doesn't exist
    try {
      await fs.access(path.join(DB_DIR, 'results.json'));
    } catch (error) {
      await fs.writeFile(path.join(DB_DIR, 'results.json'), JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Load data
const loadData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
};

// Save data
const saveData = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
};

module.exports = {
  ensureDbExists,
  loadData,
  saveData
};
