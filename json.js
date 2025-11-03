const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
const crypto = require('crypto');

async function loadJSON(filePath, defaultData = {}) {
  try {
    const data = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    throw e;
  }
}

async function saveJSON(filePath, data) {
  try {
    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = filePath + '.tmp';
    await fsPromises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    await fsPromises.rename(tempPath, filePath);
  } catch (error) {
    console.error(`[ERROR] Failed to save JSON file ${filePath}:`, error);
    throw error;
  }
}

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

module.exports = {
  loadJSON,
  saveJSON,
  generateId
};