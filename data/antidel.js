// ============================================
// 🌸 ANTI-DELETE DATA HANDLER - MEER_xD
// 👑 Developer: SYED MEER
// ============================================

const fs = require('fs');
const path = require('path');

const antiFilePath = path.join(__dirname, 'antidel.json');

// Default anti-delete status
let antiDeleteStatus = false;

// Load anti-delete status from file
function loadAntiStatus() {
    try {
        if (fs.existsSync(antiFilePath)) {
            const data = fs.readFileSync(antiFilePath, 'utf8');
            const json = JSON.parse(data);
            antiDeleteStatus = json.enabled || false;
            return antiDeleteStatus;
        }
        return false;
    } catch (error) {
        console.error('🌸 Error loading anti-delete status:', error);
        return false;
    }
}

// Save anti-delete status to file
function saveAntiStatus(status) {
    try {
        const data = JSON.stringify({ enabled: status }, null, 2);
        fs.writeFileSync(antiFilePath, data, 'utf8');
        antiDeleteStatus = status;
        return true;
    } catch (error) {
        console.error('🌸 Error saving anti-delete status:', error);
        return false;
    }
}

// Get current anti-delete status
function getAnti() {
    return loadAntiStatus();
}

// Set anti-delete status
function setAnti(status) {
    return saveAntiStatus(status);
}

// Initialize
loadAntiStatus();

module.exports = {
    getAnti,
    setAnti
};
