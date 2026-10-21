// ============================================
// 🌸 ANTI-LINK - MEER_xD (FIXED)
// 👑 Developer: SYED MEER
// 🔥 Delete Links Only - No Remove
// ============================================

const { mishu } = require('../mishu');
const config = require('../settings');

// ════════════════════════════════════════════════════════════
// 📁 ANTILINK - In-Memory Storage
// ════════════════════════════════════════════════════════════
const antilinkGroups = new Map();
const antilinkWarnings = new Map();

// ============================================
// 🔗 LINK DETECTION PATTERNS
// ============================================
const linkPatterns = [
    // WhatsApp
    /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
    /https?:\/\/(?:www\.)?whatsapp\.com\/channel\/\S+/gi,
    /wa\.me\/\S+/gi,
    // Telegram
    /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
    // Social Media
    /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
    /https?:\/\/youtu\.be\/\S+/gi,
    /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
    /https?:\/\/fb\.me\/\S+/gi,
    /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?x\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?discord\.gg\/\S+/gi,
    /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
    // Shorteners
    /https?:\/\/bit\.ly\/\S+/gi,
    /https?:\/\/tinyurl\.com\/\S+/gi,
    /https?:\/\/t\.co\/\S+/gi,
    // Generic URL
    /https?:\/\/\S+\.\S{2,6}(\/\S*)?/gi,
];

// ============================================
// 🎀 GIRL STYLE MESSAGE HELPER
// ============================================
function girlMessage(title, value, status) {
    return `
╭────────────────────◇
│  ❦ ${title} ❦
│  ✌︎㋡━━━━━━━✌︎㋡
│♡⪼  📋 ${value}
│♡⪼  ${status}
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
`;
}

// ============================================
// 👑 ANTI-LINK ON/OFF COMMAND
// ============================================
mishu({
    pattern: "antilink",
    alias: ["al", "linkprotect", "nolink"],
    desc: "🌸 Enable/disable antilink (delete links + warn)",
    category: "group",
    react: "🌸",
    use: ".antilink on/off",
    filename: __filename
},
async (mishu, mek, m, { from, args, isGroup, isOwner, isCreator, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply(girlMessage('ANTI-LINK', 'Groups only', '❌'));
        if (!isOwner && !isCreator && !isAdmins) return reply(girlMessage('ANTI-LINK', 'Admin/Owner only', '❌'));
        if (!isBotAdmins) return reply(girlMessage('ANTI-LINK', 'Bot must be admin', '❌'));

        const action = (args[0] || '').toLowerCase();
        if (!['on', 'off', 'status'].includes(action)) {
            const status = antilinkGroups.get(from) ? '🟢 ENABLED' : '🔴 DISABLED';
            return reply(girlMessage('ANTI-LINK STATUS', status, `📌 Use: .antilink on/off`));
        }

        if (action === 'on') {
            antilinkGroups.set(from, true);
            reply(girlMessage('ANTI-LINK', 'Enabled ✅', '🟢 Protection Active'));
        } else if (action === 'off') {
            antilinkGroups.set(from, false);
            for (const key of antilinkWarnings.keys()) {
                if (key.startsWith(from + ':')) antilinkWarnings.delete(key);
            }
            reply(girlMessage('ANTI-LINK', 'Disabled ❌', '🔴 Protection Inactive'));
        } else {
            const status = antilinkGroups.get(from) ? '🟢 ENABLED' : '🔴 DISABLED';
            reply(girlMessage('ANTI-LINK STATUS', status, '📌 Use: .antilink on/off'));
        }

    } catch (e) {
        console.error('🌸 Anti-Link cmd error:', e);
        reply(girlMessage('ANTI-LINK', 'Error occurred', '❌'));
    }
});

// ============================================
// 🛡️ ANTI-LINK DETECTOR (Delete Only - No Remove)
// ============================================
mishu({
    on: "body"
},
async (mishu, mek, m, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply, isOwner }) => {
    try {
        // ── Skip if not group ──
        if (!isGroup) return;
        
        // ── Skip if sender is admin ──
        if (isAdmins) return;
        
        // ── Skip if bot is not admin ──
        if (!isBotAdmins) return;
        
        // ── Skip if antilink is not enabled ──
        if (!antilinkGroups.get(from)) return;

        // ── Check if body exists ──
        const msgText = (body || '').toString();
        if (!msgText) return;

        // ── Check for links ──
        let hasLink = false;
        for (const pattern of linkPatterns) {
            pattern.lastIndex = 0;
            if (pattern.test(msgText)) {
                hasLink = true;
                break;
            }
        }

        if (!hasLink) return;

        // ── Get sender JID ──
        const senderJid = sender || mek.key?.participant || mek.key?.remoteJid;
        if (!senderJid) return;

        // ═══════════════════════════════════════════
        // 🔥 FIXED: Delete Only - No Remove
        // ═══════════════════════════════════════════

        // ── Delete the message ──
        try { 
            await mishu.sendMessage(from, { delete: mek.key }); 
            console.log(`[AntiLink] Deleted link from ${senderJid.split('@')[0]}`);
        } catch (e) {
            console.error('[AntiLink] Delete error:', e.message);
        }

        // ── Send warning (without remove threat) ──
        const warnKey = `${from}:${senderJid}`;
        const userWarnings = antilinkWarnings.get(warnKey) || 0;
        antilinkWarnings.set(warnKey, userWarnings + 1);

        let warningText = '';
        if (userWarnings === 0) {
            warningText = `⚠️ Warning ${userWarnings + 1}/3`;
        } else if (userWarnings === 1) {
            warningText = `⚠️⚠️ Warning ${userWarnings + 1}/3`;
        } else {
            warningText = `⚠️⚠️⚠️ Warning ${userWarnings + 1}/3 (Final Warning!)`;
        }

        await mishu.sendMessage(from, {
            text: `╭────────────────────◇
│  ✿ ⚠️ 𝗟𝗜𝗡𝗞 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗗 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👤 @${senderJid.split('@')[0]}
│  ✿ 🔗 Links are not allowed!
│  ✿ 🗑️ Message deleted
│  ✿ ${warningText}
│  ✿ ━━━━━━━━━━━━━━━✿
│  ✿ 💡 Please avoid sending links
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐`,
            mentions: [senderJid]
        });

    } catch (e) {
        console.error('🌸 Anti-Link detect error:', e);
    }
});

// ============================================
// 🔄 RESET WARNINGS COMMAND
// ============================================
mishu({
    pattern: "resetwarnings",
    alias: ["resetwarn", "clearwarn", "rw"],
    desc: "🌸 Reset user warnings in group",
    category: "group",
    react: "🔄",
    filename: __filename
},
async (mishu, mek, m, { from, reply, isGroup, isAdmins, isOwner, isCreator, sender, isReply, quoted }) => {
    try {
        if (!isGroup) return reply(girlMessage('RESET WARNINGS', 'Groups only', '❌'));
        if (!isOwner && !isCreator && !isAdmins) return reply(girlMessage('RESET WARNINGS', 'Admin/Owner only', '❌'));

        let targetUser = sender;
        
        // ── Check if replying to someone ──
        if (isReply && quoted) {
            const quotedMsg = quoted.msg || quoted;
            if (quotedMsg?.sender) {
                targetUser = quotedMsg.sender;
            } else if (quotedMsg?.key?.participant) {
                targetUser = quotedMsg.key.participant;
            }
        } else {
            // ── Check if mentioned someone ──
            const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (mentioned && mentioned.length > 0) {
                targetUser = mentioned[0];
            }
        }

        const warnKey = `${from}:${targetUser}`;
        if (antilinkWarnings.has(warnKey)) {
            antilinkWarnings.delete(warnKey);
            await mishu.sendMessage(from, {
                text: `╭────────────────────◇
│  ✿ 🔄 𝗪𝗔𝗥𝗡𝗜𝗡𝗚𝗦 𝗥𝗘𝗦𝗘𝗧 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👤 @${targetUser.split('@')[0]}
│  ✿ ✅ Warnings cleared
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐`,
                mentions: [targetUser]
            });
        } else {
            await mishu.sendMessage(from, {
                text: `🌸 @${targetUser.split('@')[0]} has no warnings! 💕`,
                mentions: [targetUser]
            });
        }

    } catch (error) {
        console.error("🌸 Reset Warnings Error:", error);
        reply(`🌸 Error: ${error.message} 💕`);
    }
});

// ============================================
// 📊 ANTI-LINK STATUS COMMAND
// ============================================
mishu({
    pattern: "antilinkstatus",
    alias: ["alstatus", "alcheck"],
    desc: "🌸 Check antilink status in group",
    category: "group",
    react: "📊",
    filename: __filename
},
async (mishu, mek, m, { from, reply, isGroup, isAdmins, isOwner, isCreator }) => {
    try {
        if (!isGroup) return reply(girlMessage('ANTI-LINK STATUS', 'Groups only', '❌'));
        if (!isOwner && !isCreator && !isAdmins) return reply(girlMessage('ANTI-LINK STATUS', 'Admin/Owner only', '❌'));

        const isEnabled = antilinkGroups.get(from) || false;
        const status = isEnabled ? '🟢 ENABLED' : '🔴 DISABLED';
        
        let warnCount = 0;
        for (const key of antilinkWarnings.keys()) {
            if (key.startsWith(from + ':')) warnCount++;
        }

        reply(`╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ${status}
│  ✿ ⚠️ Active Warnings: ${warnCount}
│  ✿ 🔗 Links: Blocked & Deleted
│  ✿ 🚫 Remove: DISABLED (Only Warnings)
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐`);

    } catch (error) {
        console.error("🌸 Anti-Link Status Error:", error);
        reply(`🌸 Error: ${error.message} 💕`);
    }
});

console.log('🌸 ANTI-LINK plugin loaded! (Delete Only - No Remove) 💖');
