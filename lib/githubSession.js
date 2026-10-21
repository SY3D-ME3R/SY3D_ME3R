// ============================================
// 📁 lib/githubSession.js - GITHUB SESSION MANAGER
// 👑 Developer: SYED MEER
// 🔥 No MongoDB - Pure GitHub API
// ============================================

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// ========== LOAD CONFIG ==========
const config = require('../config');

// ========== GITHUB CONFIGURATION ==========
const GITHUB_TOKEN = config.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const GITHUB_REPO = config.GITHUB_REPO || process.env.GITHUB_REPO;
const GITHUB_BRANCH = config.GITHUB_BRANCH || process.env.GITHUB_BRANCH || 'main';

// ========== GITHUB API HELPER ==========
const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }
});

/**
 * 📁 Get file from GitHub
 * @param {string} path - File path in repo (e.g., "users/923XX/creds.json")
 * @returns {object|null} - Parsed JSON data or null
 */
async function getGitHubFile(path) {
    try {
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const response = await githubApi.get(url, {
            params: { ref: GITHUB_BRANCH }
        });
        
        if (response.data && response.data.content) {
            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            return JSON.parse(content);
        }
        return null;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error('[GitHub] Get file error:', error.response?.data?.message || error.message);
        return null;
    }
}

/**
 * 📁 Save file to GitHub (Create or Update)
 * @param {string} path - File path in repo
 * @param {object} data - Data to save
 * @param {string} message - Commit message
 * @returns {object|null} - GitHub API response
 */
async function saveGitHubFile(path, data, message) {
    try {
        // Get current file SHA if exists (for update)
        let sha = null;
        try {
            const url = `/repos/${GITHUB_REPO}/contents/${path}`;
            const response = await githubApi.get(url, {
                params: { ref: GITHUB_BRANCH }
            });
            sha = response.data.sha;
        } catch (e) {
            // File doesn't exist, will create new
        }

        const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
        
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const payload = {
            message: message || `Update ${path}`,
            content: content,
            branch: GITHUB_BRANCH
        };
        if (sha) payload.sha = sha;

        const response = await githubApi.put(url, payload);
        
        if (response.status === 200 || response.status === 201) {
            console.log(`[GitHub] ✅ File saved: ${path}`);
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('[GitHub] Save file error:', error.response?.data?.message || error.message);
        return null;
    }
}

/**
 * 📁 Delete file from GitHub
 * @param {string} path - File path in repo
 * @param {string} message - Commit message
 * @returns {boolean} - Success status
 */
async function deleteGitHubFile(path, message) {
    try {
        // Get current file SHA
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const response = await githubApi.get(url, {
            params: { ref: GITHUB_BRANCH }
        });

        if (!response.data || !response.data.sha) {
            console.log(`[GitHub] File not found: ${path}`);
            return false;
        }

        const payload = {
            message: message || `Delete ${path}`,
            sha: response.data.sha,
            branch: GITHUB_BRANCH
        };

        await githubApi.delete(url, { data: payload });
        console.log(`[GitHub] ✅ File deleted: ${path}`);
        return true;
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`[GitHub] File already deleted: ${path}`);
            return true;
        }
        console.error('[GitHub] Delete file error:', error.response?.data?.message || error.message);
        return false;
    }
}

/**
 * 📁 List files in a directory
 * @param {string} directory - Directory path in repo
 * @returns {array} - List of files
 */
async function listGitHubFiles(directory) {
    try {
        const url = `/repos/${GITHUB_REPO}/contents/${directory}`;
        const response = await githubApi.get(url, {
            params: { ref: GITHUB_BRANCH }
        });
        
        if (Array.isArray(response.data)) {
            return response.data.filter(item => item.type === 'file');
        }
        return [];
    } catch (error) {
        if (error.response?.status === 404) {
            return [];
        }
        console.error('[GitHub] List files error:', error.response?.data?.message || error.message);
        return [];
    }
}

/**
 * 📁 Create directory (by creating a .gitkeep file)
 * @param {string} directory - Directory path
 * @returns {boolean} - Success status
 */
async function createGitHubDirectory(directory) {
    try {
        const path = `${directory}/.gitkeep`;
        const content = Buffer.from('').toString('base64');
        
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const payload = {
            message: `Create directory: ${directory}`,
            content: content,
            branch: GITHUB_BRANCH
        };

        await githubApi.put(url, payload);
        return true;
    } catch (error) {
        console.error('[GitHub] Create directory error:', error.message);
        return false;
    }
}

// ============================================
// 🔥 SESSION FUNCTIONS
// ============================================

/**
 * 💾 Save session to GitHub
 * @param {string} number - WhatsApp number
 * @param {object} creds - Credentials object
 * @returns {boolean} - Success status
 */
async function saveSessionToGitHub(number, creds) {
    try {
        const userDir = `users/${number}`;
        const path = `${userDir}/creds.json`;
        
        // Create directory first
        await createGitHubDirectory(userDir);
        
        // Save creds
        const result = await saveGitHubFile(path, creds, `Update session for ${number}`);
        
        if (result) {
            console.log(`[GitHub] 💾 Session saved for ${number}`);
            
            // Update active sessions list
            await updateActiveSessions(number);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[GitHub] Save session error:', error.message);
        return false;
    }
}

/**
 * 📥 Get session from GitHub
 * @param {string} number - WhatsApp number
 * @returns {object|null} - Credentials object or null
 */
async function getSessionFromGitHub(number) {
    try {
        const path = `users/${number}/creds.json`;
        const data = await getGitHubFile(path);
        if (data) {
            console.log(`[GitHub] 📥 Session loaded for ${number}`);
            return data;
        }
        return null;
    } catch (error) {
        console.error('[GitHub] Get session error:', error.message);
        return null;
    }
}

/**
 * 🗑️ Delete session from GitHub
 * @param {string} number - WhatsApp number
 * @returns {boolean} - Success status
 */
async function deleteSessionFromGitHub(number) {
    try {
        const path = `users/${number}/creds.json`;
        const result = await deleteGitHubFile(path, `Delete session for ${number}`);
        
        if (result) {
            console.log(`[GitHub] 🗑️ Session deleted for ${number}`);
            await removeFromActiveSessions(number);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[GitHub] Delete session error:', error.message);
        return false;
    }
}

/**
 * 📋 Update active sessions list
 * @param {string} number - WhatsApp number
 * @returns {boolean} - Success status
 */
async function updateActiveSessions(number) {
    try {
        let sessions = await getGitHubFile('sessions.json') || [];
        if (!Array.isArray(sessions)) sessions = [];
        
        if (!sessions.includes(number)) {
            sessions.push(number);
            await saveGitHubFile('sessions.json', sessions, `Add ${number} to active sessions`);
        }
        return true;
    } catch (error) {
        console.error('[GitHub] Update sessions error:', error.message);
        return false;
    }
}

/**
 * 📋 Remove from active sessions
 * @param {string} number - WhatsApp number
 * @returns {boolean} - Success status
 */
async function removeFromActiveSessions(number) {
    try {
        let sessions = await getGitHubFile('sessions.json') || [];
        if (!Array.isArray(sessions)) sessions = [];
        
        sessions = sessions.filter(n => n !== number);
        await saveGitHubFile('sessions.json', sessions, `Remove ${number} from active sessions`);
        return true;
    } catch (error) {
        console.error('[GitHub] Remove sessions error:', error.message);
        return false;
    }
}

/**
 * 📋 Get all active sessions
 * @returns {array} - List of numbers
 */
async function getAllSessionsFromGitHub() {
    try {
        const sessions = await getGitHubFile('sessions.json') || [];
        return Array.isArray(sessions) ? sessions : [];
    } catch (error) {
        console.error('[GitHub] Get sessions error:', error.message);
        return [];
    }
}

/**
 * 🔄 Auto reconnect all sessions
 * @returns {array} - List of numbers to reconnect
 */
async function autoReconnectAllSessions() {
    try {
        const numbers = await getAllSessionsFromGitHub();
        console.log(`[GitHub] 🔄 Found ${numbers.length} sessions to reconnect`);
        return numbers;
    } catch (error) {
        console.error('[GitHub] Auto reconnect error:', error.message);
        return [];
    }
}

/**
 * 📊 Get GitHub rate limit status
 * @returns {object} - Rate limit info
 */
async function getGitHubRateLimit() {
    try {
        const response = await githubApi.get('/rate_limit');
        return response.data;
    } catch (error) {
        console.error('[GitHub] Rate limit error:', error.message);
        return null;
    }
}

/**
 * 🧹 Cleanup old sessions (optional)
 * @param {number} days - Days to keep
 * @returns {boolean} - Success status
 */
async function cleanupOldSessions(days = 30) {
    try {
        const files = await listGitHubFiles('users');
        const now = Date.now();
        const cutoff = now - (days * 24 * 60 * 60 * 1000);
        let deleted = 0;

        for (const file of files) {
            if (file.type === 'dir') {
                const number = file.name;
                const credsPath = `users/${number}/creds.json`;
                const creds = await getGitHubFile(credsPath);
                
                if (creds && creds.timestamp) {
                    const fileTime = new Date(creds.timestamp).getTime();
                    if (fileTime < cutoff) {
                        await deleteSessionFromGitHub(number);
                        deleted++;
                    }
                }
            }
        }

        console.log(`[GitHub] 🧹 Cleaned up ${deleted} old sessions`);
        return true;
    } catch (error) {
        console.error('[GitHub] Cleanup error:', error.message);
        return false;
    }
}

// ============================================
// 📤 EXPORT
// ============================================

module.exports = {
    // ── Session Functions ──
    saveSessionToGitHub,
    getSessionFromGitHub,
    deleteSessionFromGitHub,
    getAllSessionsFromGitHub,
    autoReconnectAllSessions,
    
    // ── File Functions ──
    getGitHubFile,
    saveGitHubFile,
    deleteGitHubFile,
    listGitHubFiles,
    createGitHubDirectory,
    
    // ── Utility Functions ──
    updateActiveSessions,
    removeFromActiveSessions,
    getGitHubRateLimit,
    cleanupOldSessions
};

console.log('📁 GitHub Session Manager Loaded!');
