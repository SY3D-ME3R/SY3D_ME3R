// ============================================
// 📁 lib/antidelete.js - ANTI-DELETE SYSTEM (FIXED)
// 👑 Developer: SYED MEER
// 🔥 Fixed: handleAntidelete function export
// ============================================

const config = require('../config');

/**
 * 🗑️ Handle Anti-Delete
 */
async function handleAntidelete(conn, updates, store, botNumber) {
    try {
        if (!updates || !Array.isArray(updates)) return;
        
        // Check if antidelete is enabled
        if (config.ANTIDELETE !== 'true') return;
        
        for (const update of updates) {
            if (!update || !update.key) continue;
            
            // Check if message was deleted
            if (update.update && update.update.message && update.update.message.protocolMessage) {
                const protocolMsg = update.update.message.protocolMessage;
                
                // Type 0 = delete message
                if (protocolMsg.type === 0) {
                    const deletedMsgId = protocolMsg.key.id;
                    const deletedMsgJid = protocolMsg.key.remoteJid;
                    
                    // Get deleted message from store
                    let deletedMsg = null;
                    if (store && store.messages && store.messages[deletedMsgJid]) {
                        deletedMsg = store.messages[deletedMsgJid].find(
                            m => m.key && m.key.id === deletedMsgId
                        );
                    }
                    
                    if (deletedMsg && deletedMsg.message) {
                        // Extract deleted message content
                        let content = 'Unknown';
                        const msg = deletedMsg.message;
                        
                        if (msg.conversation) content = msg.conversation;
                        else if (msg.extendedTextMessage?.text) content = msg.extendedTextMessage.text;
                        else if (msg.imageMessage?.caption) content = msg.imageMessage.caption + ' (Image)';
                        else if (msg.videoMessage?.caption) content = msg.videoMessage.caption + ' (Video)';
                        else if (msg.documentMessage?.caption) content = msg.documentMessage.caption + ' (Document)';
                        else if (msg.stickerMessage) content = '(Sticker)';
                        else content = '(Media)';
                        
                        const sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;
                        const senderName = sender.split('@')[0];
                        
                        console.log(`[AntiDelete] ${senderName} deleted: ${content}`);
                        
                        // Send notification to owner
                        if (config.ANTIDELETE_NOTIFY === 'true') {
                            const ownerJid = config.OWNER_NUMBER ? 
                                config.OWNER_NUMBER[0] + '@s.whatsapp.net' : 
                                null;
                            
                            if (ownerJid) {
                                try {
                                    await conn.sendMessage(ownerJid, {
                                        text: `🗑️ *Message Deleted*\n\nSender: ${senderName}\nContent: ${content}\nGroup: ${deletedMsgJid}`
                                    });
                                } catch (e) {
                                    console.error('[AntiDelete] Notify error:', e.message);
                                }
                            }
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('[AntiDelete] Error:', error.message);
    }
}

// ========== FIXED: Correct Export ==========
module.exports = { 
    handleAntidelete 
};
