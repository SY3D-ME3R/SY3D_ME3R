// ============================================
// 📁 lib/userConfig.js - PER-USER CONFIG
// 👑 Developer: SYED MEER
// 🔥 Each user has their own settings
// ============================================

const { getGitHubFile, saveGitHubFile } = require('./githubSession');

// ========== DEFAULT SETTINGS (From settings.js) ==========
const DEFAULT_CONFIG = {
    MODE: 'public',
    AUTO_REACT: 'false',
    CUSTOM_REACT_EMOJIS: '💕,👑,♥️,🇵🇰,👑,😘,❤️,🦁,☺️,💫,👍🏻,🙂',
    READ_MESSAGE: 'false',
    AUTO_STATUS_SEEN: 'true',
    AUTO_STATUS_REACT: 'true',
    AUTO_STATUS_REPLY: 'false',
    AUTO_STATUS_MSG: '❤️ Nice status!',
    AUTO_STATUS_EMOJIS: ['❤️', '🔥', '👑', '💯', '😍', '💖', '✨'],
    ANTI_CALL: 'false',
    REJECT_MSG: '📵 Call rejected by bot',
    ANTIDELETE: 'false',
    ANTIDELETE_NOTIFY: 'false',
    AUTO_CHANNEL_REACT: 'true',
    AUTO_CHANNEL_REACT_EMOJIS: ['❤️', '🔥', '👑', '💯', '😍', '💖', '✨'],
    GROUP_WELCOME: 'false',
    GROUP_GOODBYE: 'false',
    WELCOME_MESSAGE: '👋 Welcome to the group!',
    GOODBYE_MESSAGE: '👋 Goodbye!',
    AUTO_TYPING: 'false',
    AUTO_RECORDING: 'false',
    BOT_ONLINE: 'true',
    KEEP_ONLINE: 'true'
};

/**
 * 📥 Get user config from GitHub
 */
async function getUserConfig(number) {
    try {
        const path = `users/${number}/config.json`;
        const data = await getGitHubFile(path);
        if (data) {
            return { ...DEFAULT_CONFIG, ...data };
        }
        return { ...DEFAULT_CONFIG };
    } catch (error) {
        console.error(`[UserConfig] Get error for ${number}:`, error.message);
        return { ...DEFAULT_CONFIG };
    }
}

/**
 * 📤 Save user config to GitHub
 */
async function saveUserConfig(number, config) {
    try {
        const path = `users/${number}/config.json`;
        const result = await saveGitHubFile(path, config, `Update config for ${number}`);
        return !!result;
    } catch (error) {
        console.error(`[UserConfig] Save error for ${number}:`, error.message);
        return false;
    }
}

/**
 * 🔄 Update single setting for user
 */
async function updateUserSetting(number, key, value) {
    try {
        const config = await getUserConfig(number);
        config[key] = value;
        return await saveUserConfig(number, config);
    } catch (error) {
        console.error(`[UserConfig] Update error for ${number}:`, error.message);
        return false;
    }
}

/**
 * 📋 Get user's current mode
 */
async function getUserMode(number) {
    const config = await getUserConfig(number);
    return config.MODE || 'public';
}

/**
 * 🔄 Update user's mode
 */
async function updateUserMode(number, mode) {
    return await updateUserSetting(number, 'MODE', mode);
}

/**
 * 📋 Get user's auto react setting
 */
async function getUserAutoReact(number) {
    const config = await getUserConfig(number);
    return config.AUTO_REACT || 'false';
}

/**
 * 🔄 Update user's auto react setting
 */
async function updateUserAutoReact(number, value) {
    return await updateUserSetting(number, 'AUTO_REACT', value);
}

module.exports = {
    DEFAULT_CONFIG,
    getUserConfig,
    saveUserConfig,
    updateUserSetting,
    getUserMode,
    updateUserMode,
    getUserAutoReact,
    updateUserAutoReact
};
