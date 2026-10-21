// ============================================
// 🌸 MEER_xD - STYLE HELPER
// 👑 Developer: SYED MEER
// 🔥 Consistent styling across all plugins
// ============================================

const config = require('../settings');

/**
 * 🎀 Girl Style Box
 * @param {string} title - Box title
 * @param {Array} rows - Array of [emoji, label, value]
 * @param {string} footer - Custom footer (optional)
 * @returns {string} Formatted message
 */
function girlBox(title, rows, footer = null) {
    const body = rows.map(([emoji, label, value]) => 
        `│  ✿ ${emoji} ${label}: ${value || ''}`
    ).join('\n');
    
    return `
╭────────────────────◇
│  ✿ ${title} ✿
│  ✌︎㋡━━━━━━━━━✌︎㋡
${body}
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
`.trim();
}

/**
 * 🎀 Girl Style Box - Alternative
 */
function girlBoxAlt(title, rows) {
    const body = rows.map(([emoji, label, value]) => 
        `│  ✿ ${emoji} ${label}: ${value || ''}`
    ).join('\n');
    
    return `
╭────────────────────◇
│ 💕⃝🕊️ ${title} 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
${body}
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
`.trim();
}

/**
 * 🎀 Simple Message with Style
 */
function girlMessage(text, title = null) {
    const titleLine = title ? `│  ✿ ${title} ✿\n│  ✌︎㋡━━━━━━━━━✌︎㋡\n` : '';
    return `
╭────────────────────◇
${titleLine}${text.split('\n').map(line => `│  ✿ ${line}`).join('\n')}
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙
`.trim();
}

/**
 * 🎀 Success Message
 */
function girlSuccess(message) {
    return girlMessage(`✅ ${message}`, '✅ Sᴜᴄᴄᴇss');
}

/**
 * 🎀 Error Message
 */
function girlError(message) {
    return girlMessage(`❌ ${message}`, '❌ Eʀʀᴏʀ');
}

/**
 * 🎀 Warning Message
 */
function girlWarning(message) {
    return girlMessage(`⚠️ ${message}`, '⚠️ Wᴀʀɴɪɴɢ');
}

/**
 * 🎀 Info Message
 */
function girlInfo(message) {
    return girlMessage(`📌 ${message}`, '📌 Iɴғᴏ');
}

/**
 * 🎀 Help Message
 */
function girlHelp(title, rows) {
    const body = rows.map(([emoji, label, value]) => 
        `│  ✿ ${emoji} ${label}: ${value || ''}`
    ).join('\n');
    
    return `
╭────────────────────◇
│  ✿ ${title} ✿
│  ✌︎㋡━━━━━━━━━✌︎㋡
${body}
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙
`.trim();
}

module.exports = {
    girlBox,
    girlBoxAlt,
    girlMessage,
    girlSuccess,
    girlError,
    girlWarning,
    girlInfo,
    girlHelp
};
