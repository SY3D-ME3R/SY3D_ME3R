// ============================================
// 🌸 VIEW ONCE PLUGIN - MEER_xD (FINAL)
// 👑 Developer: SYED MEER
// 🔥 Fixed: Unsupported media type error
// ============================================

const { fakevCard } = require('../lib/fakevCard');
const { mishu } = require('../mishu');
const config = require('../settings');

// ============================================
// 🎀 GIRL THEME KEYWORDS
// ============================================
const positiveKeywords = [
  "🌸", "💖", "✨", "🎀", "💕", "💝", "🌺", "🦋", "👸", "💗",
  "nice", "good", "cute", "beautiful", "gorgeous", "lovely",
  "wow", "super", "amazing", "queen", "princess", "😍", "🥰",
  "🌝", "🥵", "💋", "👍", "🌚", "😩"
];

// ============================================
// 🔥 VIEW ONCE HANDLER (FULLY FIXED)
// ============================================

async function handleViewOnce(client, mek, m, context) {
    try {
        const { from, reply, quoted, isReply, repliedType, sender } = context;

        // ============================================
        // 🔥 CHECK REPLY
        // ============================================

        let viewOnceContent = null;
        let isViewOnce = false;
        let buffer = null;
        let mtype = null;
        let originalCaption = '';
        let mimetype = '';
        let ptt = false;

        // ── Get quoted message ──
        const quotedMsg = quoted?.msg || 
                          quoted || 
                          mek?.quoted || 
                          mek?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quotedMsg) {
            return reply(`🌸 Please reply to a *view once* image/video/audio message.\n\n*Use:* .vv [reply]`);
        }

        // ── Check if view once ──
        if (quotedMsg.viewOnce) {
            isViewOnce = true;
            viewOnceContent = quotedMsg;
        } else if (quotedMsg.viewOnceMessage) {
            isViewOnce = true;
            viewOnceContent = quotedMsg.viewOnceMessage.message;
        } else if (quotedMsg.viewOnceMessageV2) {
            isViewOnce = true;
            viewOnceContent = quotedMsg.viewOnceMessageV2.message;
        } else if (quotedMsg.viewOnceMessageV2Extension) {
            isViewOnce = true;
            viewOnceContent = quotedMsg.viewOnceMessageV2Extension.message;
        } else if (quotedMsg.imageMessage?.viewOnce) {
            isViewOnce = true;
            viewOnceContent = quotedMsg.imageMessage;
        } else if (quotedMsg.videoMessage?.viewOnce) {
            isViewOnce = true;
            viewOnceContent = quotedMsg.videoMessage;
        }

        if (!isViewOnce || !viewOnceContent) {
            return reply(`🌸 Please reply to a *view once* image/video/audio message! 💕`);
        }

        // ── Get caption ──
        if (viewOnceContent.imageMessage) {
            originalCaption = viewOnceContent.imageMessage.caption || '';
            mimetype = viewOnceContent.imageMessage.mimetype || 'image/jpeg';
            mtype = 'image';
        } else if (viewOnceContent.videoMessage) {
            originalCaption = viewOnceContent.videoMessage.caption || '';
            mimetype = viewOnceContent.videoMessage.mimetype || 'video/mp4';
            mtype = 'video';
        } else if (viewOnceContent.audioMessage) {
            mimetype = viewOnceContent.audioMessage.mimetype || 'audio/mpeg';
            ptt = viewOnceContent.audioMessage.ptt || false;
            mtype = 'audio';
        } else {
            // Try to detect from content
            if (viewOnceContent.mimetype) {
                if (viewOnceContent.mimetype.startsWith('image')) {
                    mtype = 'image';
                } else if (viewOnceContent.mimetype.startsWith('video')) {
                    mtype = 'video';
                } else if (viewOnceContent.mimetype.startsWith('audio')) {
                    mtype = 'audio';
                }
            }
        }

        // ── If still no mtype ──
        if (!mtype) {
            return reply(`🌸 Unsupported media type! Please reply to image/video/audio view once. 💕`);
        }

        // ── Download ──
        try {
            let msgToDownload = viewOnceContent;
            
            // ── Handle different view once formats ──
            if (viewOnceContent.imageMessage) {
                msgToDownload = viewOnceContent.imageMessage;
            } else if (viewOnceContent.videoMessage) {
                msgToDownload = viewOnceContent.videoMessage;
            } else if (viewOnceContent.audioMessage) {
                msgToDownload = viewOnceContent.audioMessage;
            }

            const stream = await downloadContentFromMessage(msgToDownload, mtype);
            let chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            buffer = Buffer.concat(chunks);

        } catch (e) {
            console.error('[ViewOnce] Download error:', e.message);
            
            // ── Fallback: Try quoted.download() ──
            try {
                if (typeof quoted?.download === 'function') {
                    buffer = await quoted.download();
                } else if (typeof mek?.quoted?.download === 'function') {
                    buffer = await mek.quoted.download();
                }
            } catch (e2) {
                console.error('[ViewOnce] Fallback download error:', e2.message);
            }
        }

        if (!buffer || buffer.length === 0) {
            return reply('❌ Failed to download media. Please try again.');
        }

        // ── Send processing reaction ──
        await client.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const DESCRIPTION = config.DESCRIPTION || "🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖";

        // ── Build caption ──
        let captionText = `🌸 *View Once Retrieved*\n\n`;

        if (originalCaption) {
            captionText += `📝 *Caption:* ${originalCaption}\n`;
        }

        captionText += `📁 *Type:* ${mtype.charAt(0).toUpperCase() + mtype.slice(1)}\n`;
        captionText += `📦 *Size:* ${formatBytes(buffer.length)}\n\n`;
        captionText += `> *© ${DESCRIPTION}*`;

        let messageContent = {};
        
        if (mtype === 'image') {
            messageContent = {
                image: buffer,
                caption: captionText,
                mimetype: mimetype || 'image/jpeg',
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363429164571310@newsletter',
                        newsletterName: '🌸 MEER_xD 🌸',
                        serverMessageId: 143
                    }
                }
            };
        } else if (mtype === 'video') {
            messageContent = {
                video: buffer,
                caption: captionText,
                mimetype: mimetype || 'video/mp4',
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363429164571310@newsletter',
                        newsletterName: '🌸 MEER_xD 🌸',
                        serverMessageId: 143
                    }
                }
            };
        } else if (mtype === 'audio') {
            messageContent = {
                audio: buffer,
                mimetype: mimetype || 'audio/mpeg',
                ptt: ptt
            };
        } else {
            return reply(`🌸 Unsupported media type: ${mtype} 💕`);
        }

        // ── Send to DM ──
        await client.sendMessage(sender, messageContent, { quoted: fakevCard });

        await client.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('[ViewOnce] Error:', error);
        await context.reply(`❌ Error: ${error.message || error}`);
        await client.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================
// 🌸 AUTO VIEW ONCE (Without Prefix)
// ============================================
mishu({
  'on': "body"
}, async (client, mek, m, {
  from,
  body,
  isOwner,
  isCreator,
  reply,
  sender,
  isReply,
  quoted,
  quotedMessage,
  repliedType
}) => {
  try {
    if (!isOwner && !isCreator) return;

    const messageText = body?.trim()?.toLowerCase() || '';
    const hasExactKeywordOnly = positiveKeywords.some(keyword => 
      messageText === keyword.toLowerCase()
    );
    
    if (!hasExactKeywordOnly) return;

    await handleViewOnce(client, mek, m, { 
        from, reply, quoted, isReply, repliedType, sender 
    });

  } catch (error) {
    console.error("🌸 View Once Auto Error:", error);
  }
});

// ============================================
// 👑 VV COMMAND
// ============================================
mishu({
  pattern: "vv",
  alias: ["vv3", "viewonce", "getvv", "savemedia"],
  react: "👑",
  desc: "🌸 Retrieve view once messages (Owner Only)",
  category: "owner",
  filename: __filename
}, async (client, mek, m, {
  from,
  isOwner,
  isCreator,
  reply,
  sender,
  isReply,
  quoted,
  quotedMessage,
  repliedType
}) => {
  try {
    if (!isOwner && !isCreator) {
      return reply(`🌸 Only my Queen can use this! 👸💖`);
    }

    if (!isReply) {
      const helpMsg = `
╭═══✿══════════════╗
│  ✿ 𝗩𝗜𝗘𝗪 𝗢𝗡𝗖𝗘 𝗛𝗘𝗟𝗣 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👑 Reply to a view once
│  ✿ 📸 Image, Video, Audio
│  ✿ 💖 Auto-save to DM
╰═══✿══════════════╝

🌸 Example:
.vv (reply to view once)

💖 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 🌸
      `;
      return reply(helpMsg);
    }

    await handleViewOnce(client, mek, m, { 
        from, reply, quoted, isReply, repliedType, sender 
    });

  } catch (error) {
    console.error("🌸 VV Error:", error);
    reply(`🌸 Error: ${error.message} 💕`);
  }
});

// ============================================
// 🎀 VV2 - SEND TO DM
// ============================================
mishu({
  pattern: "vv2",
  alias: ["sendvv", "dmvv", "saveto"],
  react: "💕",
  desc: "🌸 Send view once to DM (Owner Only)",
  category: "owner",
  filename: __filename
}, async (client, mek, m, {
  from,
  isOwner,
  isCreator,
  reply,
  sender,
  isReply,
  quoted,
  quotedMessage,
  repliedType
}) => {
  try {
    if (!isOwner && !isCreator) {
      return reply(`🌸 Only my Queen can use this! 👸💖`);
    }

    if (!isReply) {
      return reply(`🌸 Reply to a view once message to send to DM! 💕`);
    }

    await handleViewOnce(client, mek, m, { 
        from, reply, quoted, isReply, repliedType, sender 
    });

  } catch (error) {
    console.error("🌸 VV2 Error:", error);
    reply(`🌸 Error: ${error.message} 💕`);
  }
});

// ============================================
// 👑 VV KEYWORDS LIST
// ============================================
mishu({
  pattern: "vvkeywords",
  alias: ["vvlist", "viewkeywords"],
  react: "📋",
  desc: "🌸 Show view once keywords (Owner Only)",
  category: "owner",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isOwner,
  isCreator,
  reply
}) => {
  try {
    if (!isOwner && !isCreator) {
      return reply(`🌸 Only my Queen can use this! 👸💖`);
    }

    const keywordsList = positiveKeywords.join(', ');

    const msg = `
╭═══✿══════════════╗
│  ✿ 𝗩𝗜𝗘𝗪 𝗢𝗡𝗖𝗘 𝗞𝗘𝗬𝗪𝗢𝗥𝗗𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 📋 Total: ${positiveKeywords.length} keywords
│  ✿ ━━━━━━━━━━━━━━━✿
│  ✿ ${keywordsList}
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖

📌 Usage:
• Reply to view once with keyword
• .vv (reply to view once)
• .vv2 (send to DM)
      `;

    reply(msg);

  } catch (error) {
    console.error("🌸 VV Keywords Error:", error);
    reply(`🌸 Error: ${error.message} 💕`);
  }
});

// ============================================
// 🌸 ADD KEYWORD
// ============================================
mishu({
  pattern: "addkeyword",
  alias: ["addvv", "newkeyword"],
  react: "➕",
  desc: "🌸 Add new view once keyword (Owner Only)",
  category: "owner",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isOwner,
  isCreator,
  reply,
  text
}) => {
  try {
    if (!isOwner && !isCreator) {
      return reply(`🌸 Only my Queen can use this! 👸💖`);
    }

    if (!text) {
      return reply(`🌸 Please provide a keyword to add!\nExample: .addkeyword beautiful 💕`);
    }

    const newKeyword = text.trim().toLowerCase();
    
    if (positiveKeywords.includes(newKeyword)) {
      return reply(`🌸 Keyword "${newKeyword}" already exists! 💕`);
    }

    positiveKeywords.push(newKeyword);
    
    reply(`✅ "${newKeyword}" added! Total: ${positiveKeywords.length} keywords`);

  } catch (error) {
    console.error("🌸 Add Keyword Error:", error);
    reply(`🌸 Error: ${error.message} 💕`);
  }
});

// ============================================
// 🎀 REMOVE KEYWORD
// ============================================
mishu({
  pattern: "removekeyword",
  alias: ["removevv", "delvv", "deletekeyword"],
  react: "➖",
  desc: "🌸 Remove view once keyword (Owner Only)",
  category: "owner",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isOwner,
  isCreator,
  reply,
  text
}) => {
  try {
    if (!isOwner && !isCreator) {
      return reply(`🌸 Only my Queen can use this! 👸💖`);
    }

    if (!text) {
      return reply(`🌸 Please provide a keyword to remove!\nExample: .removekeyword beautiful 💕`);
    }

    const keywordToRemove = text.trim().toLowerCase();
    const index = positiveKeywords.indexOf(keywordToRemove);
    
    if (index === -1) {
      return reply(`🌸 Keyword "${keywordToRemove}" not found! 💕`);
    }

    positiveKeywords.splice(index, 1);
    
    reply(`❌ "${keywordToRemove}" removed! Total: ${positiveKeywords.length} keywords`);

  } catch (error) {
    console.error("🌸 Remove Keyword Error:", error);
    reply(`🌸 Error: ${error.message} 💕`);
  }
});

console.log('🌸 MEER_xD - View Once plugin loaded! 💖');
