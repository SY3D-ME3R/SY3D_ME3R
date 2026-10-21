// ============================================
// 🌸 ANTI-DELETE - MEER_xD (FULLY FIXED)
// 👑 Developer: SYED MEER
// 🔥 Complete Working with Main.js Integration
// ============================================

const { mishu } = require('../mishu');
const config = require('../settings');
const fs = require('fs-extra');
const path = require('path');

// ════════════════════════════════════════════════════════════
// 📁 ANTI-DELETE - Storage
// ════════════════════════════════════════════════════════════
let antiDeleteEnabled = false;
const deletedMessages = new Map(); // Store deleted messages
const DELETED_LOG_FILE = path.join(__dirname, '../data/deleted_messages.json');

// ============================================
// 💾 Save deleted messages to file
// ============================================
async function saveDeletedToFile() {
    try {
        const data = Array.from(deletedMessages.entries()).map(([key, value]) => ({
            key,
            ...value
        }));
        
        const dir = path.join(__dirname, '../data');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        await fs.writeJson(DELETED_LOG_FILE, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('[AntiDelete] Save to file error:', error.message);
        return false;
    }
}

// ============================================
// 📥 Load deleted messages from file
// ============================================
async function loadDeletedFromFile() {
    try {
        if (fs.existsSync(DELETED_LOG_FILE)) {
            const data = await fs.readJson(DELETED_LOG_FILE);
            for (const item of data) {
                deletedMessages.set(item.key, item);
            }
            console.log(`[AntiDelete] Loaded ${deletedMessages.size} deleted messages`);
        }
        return true;
    } catch (error) {
        console.error('[AntiDelete] Load from file error:', error.message);
        return false;
    }
}

// Load on startup
loadDeletedFromFile();

// ============================================
// 🎀 GIRL STYLE MESSAGE HELPER
// ============================================
function girlBox(title, rows) {
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
`;
}

// ============================================
// 🛡️ ANTI-DELETE DETECTOR - FIXED
// ============================================

async function handleAntiDelete(conn, updates, store, botNumber) {
    try {
        if (!antiDeleteEnabled) return;
        if (!updates || !Array.isArray(updates)) return;

        for (const update of updates) {
            try {
                if (!update || !update.key) continue;
                
                // 🔥 FIXED: Check for message deletion properly
                const isDeleted = update.update?.message?.protocolMessage?.type === 0;
                
                if (isDeleted) {
                    const protocolMsg = update.update.message.protocolMessage;
                    const deletedMsgId = protocolMsg.key?.id;
                    const deletedMsgJid = protocolMsg.key?.remoteJid;
                    
                    if (!deletedMsgId || !deletedMsgJid) continue;
                    
                    // 🔥 FIXED: Try multiple ways to get deleted message
                    let deletedMsg = null;
                    
                    // Method 1: From store
                    if (store && store.messages && store.messages[deletedMsgJid]) {
                        deletedMsg = store.messages[deletedMsgJid].find(
                            m => m.key && m.key.id === deletedMsgId
                        );
                    }
                    
                    // Method 2: From global cache
                    if (!deletedMsg && global.messageCache) {
                        deletedMsg = global.messageCache.get(deletedMsgId);
                    }
                    
                    // Method 3: From store.loadMessage
                    if (!deletedMsg && store && typeof store.loadMessage === 'function') {
                        try {
                            deletedMsg = await store.loadMessage(deletedMsgJid, deletedMsgId);
                        } catch (e) {}
                    }
                    
                    if (!deletedMsg || !deletedMsg.message) {
                        console.log(`[AntiDelete] ⚠️ Could not retrieve message: ${deletedMsgId}`);
                        continue;
                    }
                    
                    // Extract deleted message content
                    let content = 'Unknown';
                    let msgType = 'text';
                    let mediaType = '';
                    const msg = deletedMsg.message;
                    
                    if (msg.conversation) {
                        content = msg.conversation;
                        msgType = 'text';
                    } else if (msg.extendedTextMessage?.text) {
                        content = msg.extendedTextMessage.text;
                        msgType = 'text';
                    } else if (msg.imageMessage) {
                        content = msg.imageMessage.caption || '📷 Image';
                        msgType = 'image';
                        mediaType = 'Image';
                    } else if (msg.videoMessage) {
                        content = msg.videoMessage.caption || '🎬 Video';
                        msgType = 'video';
                        mediaType = 'Video';
                    } else if (msg.audioMessage) {
                        content = '🎵 Audio';
                        msgType = 'audio';
                        mediaType = 'Audio';
                    } else if (msg.documentMessage) {
                        content = msg.documentMessage.fileName || '📄 Document';
                        msgType = 'document';
                        mediaType = 'Document';
                    } else if (msg.stickerMessage) {
                        content = '🎨 Sticker';
                        msgType = 'sticker';
                        mediaType = 'Sticker';
                    } else if (msg.pollCreationMessage) {
                        content = '📊 Poll: ' + (msg.pollCreationMessage.name || '');
                        msgType = 'poll';
                        mediaType = 'Poll';
                    } else if (msg.contactMessage) {
                        content = '👤 Contact: ' + (msg.contactMessage.displayName || '');
                        msgType = 'contact';
                        mediaType = 'Contact';
                    } else if (msg.locationMessage) {
                        content = '📍 Location';
                        msgType = 'location';
                        mediaType = 'Location';
                    } else {
                        content = '📨 Unknown type';
                        msgType = 'unknown';
                        mediaType = 'Unknown';
                    }
                    
                    const sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;
                    const senderName = sender ? sender.split('@')[0] : 'Unknown';
                    const groupJid = deletedMsg.key.remoteJid;
                    const groupName = groupJid ? groupJid.split('@')[0] : 'Unknown';
                    const isGroup = groupJid?.endsWith('@g.us') || false;
                    
                    console.log(`[AntiDelete] 🗑️ ${senderName} deleted: ${content.substring(0, 30)}`);
                    
                    // Store for later
                    const deleteInfo = {
                        sender,
                        senderName,
                        content,
                        msgType,
                        mediaType,
                        groupJid,
                        groupName,
                        isGroup,
                        deletedMsgId,
                        timestamp: new Date().toISOString(),
                        fullMessage: deletedMsg.message
                    };
                    
                    const key = `${deletedMsgJid}_${deletedMsgId}`;
                    deletedMessages.set(key, deleteInfo);
                    
                    // Save to file
                    await saveDeletedToFile();
                    
                    // 🔥 FIXED: Send notification to group
                    if (config.ANTIDELETE_NOTIFY === 'true') {
                        try {
                            const notifMsg = `
╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👤 Sender: ${senderName}
│  ✿ 📝 Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}
│  ✿ 📁 Type: ${msgType}${mediaType ? ` (${mediaType})` : ''}
│  ✿ 👥 Group: ${isGroup ? groupName : 'Private Chat'}
│  ✿ 🕐 Time: ${new Date().toLocaleString()}
│  ✿ ━━━━━━━━━━━━━━━✿
│🦋⃟ MEER_xD 🦋⃟‌💙
╰────────────────────○`;
                            
                            await conn.sendMessage(groupJid, { text: notifMsg });
                            console.log(`[AntiDelete] ✅ Notification sent to ${groupJid}`);
                        } catch (e) {
                            console.error('[AntiDelete] Group notification error:', e.message);
                        }
                    }
                    
                    // 🔥 FIXED: Send to owner
                    if (config.ANTIDELETE_FORWARD === 'true' || config.FORWARD_DELETED === 'true') {
                        try {
                            const ownerJid = config.OWNER_NUMBER ? 
                                config.OWNER_NUMBER[0] + '@s.whatsapp.net' : 
                                null;
                            
                            if (ownerJid) {
                                const ownerMsg = `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👤 Sender: ${senderName}
│  ✿ 📝 Content: ${content}
│  ✿ 📁 Type: ${msgType}${mediaType ? ` (${mediaType})` : ''}
│  ✿ 👥 Group: ${isGroup ? groupName : 'Private Chat'}
│  ✿ 🆔 ID: ${deletedMsgId}
│  ✿ 🕐 Time: ${new Date().toLocaleString()}
│  ✿ ━━━━━━━━━━━━━━━✿
│🦋⃟ MEER_xD 🦋⃟‌💙
╰────────────────────○`;
                                
                                await conn.sendMessage(ownerJid, { text: ownerMsg });
                                console.log(`[AntiDelete] ✅ Forwarded to owner`);
                            }
                        } catch (e) {
                            console.error('[AntiDelete] Forward error:', e.message);
                        }
                    }
                }
            } catch (updateError) {
                console.error('[AntiDelete] Update error:', updateError.message);
            }
        }
        
    } catch (error) {
        console.error('[AntiDelete] Fatal error:', error.message);
    }
}

// ============================================
// 📊 GET DELETED MESSAGES
// ============================================
function getDeletedMessages(limit = 20) {
    const entries = Array.from(deletedMessages.entries());
    const recent = entries.slice(-limit).reverse();
    return recent.map(([key, value]) => ({ key, ...value }));
}

// ============================================
// 🗑️ CLEAR DELETED MESSAGES
// ============================================
async function clearDeletedMessages() {
    deletedMessages.clear();
    await saveDeletedToFile();
    return true;
}

// ============================================
// 👑 ANTI-DELETE COMMAND
// ============================================

mishu({
    pattern: "antidelete",
    alias: ['antidel', 'ad', 'adel'],
    react: "🌸",
    desc: "🌸 Toggle anti-delete feature",
    category: "security",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text, isOwner, isCreator }) => {
    try {
        // 👑 Only Queen/Owner can use
        if (!isOwner && !isCreator) {
            return reply(`🌸 Only my Queen can use this! 👸💖`);
        }
        
        const action = (text || '').toLowerCase().trim();
        
        // 📊 STATUS CHECK
        if (!action || action === 'status') {
            const statusEmoji = antiDeleteEnabled ? '🟢' : '🔴';
            const statusText = antiDeleteEnabled ? '✅ ENABLED' : '❌ DISABLED';
            
            return reply(girlBox('𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 𝗦𝗧𝗔𝗧𝗨𝗦', [
                [statusEmoji, 'Status', statusText],
                ['🛡️', 'Protection', antiDeleteEnabled ? 'Active' : 'Inactive'],
                ['💾', 'Deleted Msgs', `${deletedMessages.size} saved`],
                ['👑', 'Managed by', 'Queen']
            ]));
        }
        
        // ✅ ENABLE
        if (action === 'on' || action === 'enable' || action === 'true') {
            antiDeleteEnabled = true;
            return reply(girlBox('𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 𝗘𝗡𝗔𝗕𝗟𝗘𝗗', [
                ['✅', 'Status', 'Protection Activated'],
                ['🛡️', 'Action', 'Deleted messages will be saved'],
                ['💾', 'Delivery', 'Sent to owner DM'],
                ['👑', 'By', 'MEER_xD']
            ]));
        } 
        
        // ❌ DISABLE
        if (action === 'off' || action === 'disable' || action === 'false') {
            antiDeleteEnabled = false;
            return reply(girlBox('𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗', [
                ['❌', 'Status', 'Protection Deactivated'],
                ['🛡️', 'Action', 'Deleted messages will NOT be saved'],
                ['👑', 'By', 'MEER_xD']
            ]));
        } 
        
        // 📋 VIEW DELETED MESSAGES
        if (action === 'list' || action === 'view') {
            if (deletedMessages.size === 0) {
                return reply(`🌸 No deleted messages saved yet! 💕`);
            }
            
            let list = `📋 *Deleted Messages* (${deletedMessages.size})\n\n`;
            let count = 0;
            for (const [key, info] of deletedMessages) {
                count++;
                list += `${count}. ${info.senderName}: ${info.content.substring(0, 50)}${info.content.length > 50 ? '...' : ''}\n`;
                if (count >= 10) break;
            }
            list += `\n📌 Use .antidelete clear to clear all`;
            
            return reply(list);
        }
        
        // 🗑️ CLEAR DELETED MESSAGES
        if (action === 'clear') {
            await clearDeletedMessages();
            return reply(`🌸 All deleted messages cleared! 💖`);
        }
        
        // ❓ HELP
        return reply(girlBox('𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 𝗛𝗘𝗟𝗣', [
            ['📌', 'Commands', ''],
            ['🟢', 'Enable', '.antidelete on'],
            ['🔴', 'Disable', '.antidelete off'],
            ['📊', 'Status', '.antidelete status'],
            ['📋', 'List', '.antidelete list'],
            ['🗑️', 'Clear', '.antidelete clear']
        ]));
        
    } catch (error) {
        console.error("🌸 Anti-Delete Error:", error);
        return reply(`🌸 Error: ${error.message} 💕`);
    }
});

// ============================================
// 🔥 API ROUTES FOR ANTI-DELETE
// ============================================

// These will be added to main.js routes
const antiDeleteRoutes = {
    // Get deleted messages
    getLogs: (req, res) => {
        const limit = parseInt(req.query.limit) || 20;
        const logs = getDeletedMessages(limit);
        res.json({
            status: true,
            data: {
                total: deletedMessages.size,
                messages: logs
            }
        });
    },
    
    // Clear deleted messages
    clearLogs: async (req, res) => {
        await clearDeletedMessages();
        res.json({
            status: true,
            message: 'Deleted messages cleared successfully'
        });
    },
    
    // Toggle anti-delete
    toggle: (req, res) => {
        const { enable } = req.query;
        if (enable === 'true') {
            antiDeleteEnabled = true;
        } else if (enable === 'false') {
            antiDeleteEnabled = false;
        }
        res.json({
            status: true,
            data: {
                enabled: antiDeleteEnabled,
                deletedCount: deletedMessages.size
            }
        });
    }
};

// ============================================
// 📤 EXPORT
// ============================================

module.exports = {
    handleAntiDelete,
    antiDeleteEnabled,
    getDeletedMessages,
    clearDeletedMessages,
    antiDeleteRoutes,
    deletedMessages
};

console.log('🌸 ANTI-DELETE plugin loaded successfully! 💖');
