// ============================================
// 🌸 GET PP - MEER_xD (FIXED)
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 🔥 Reply System Working
// ============================================

const { mishu } = require('../mishu');
const { fakevCard } = require('../lib/fakevCard');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

mishu({
    pattern: "getpp",
    alias: ["dlpp", "profilepic", "getdp", "pp", "profile"],
    desc: "🌸 Get user profile picture",
    category: "general",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text, isGroup, sender, args, pushname, isReply, quoted, repliedType }) => {
    try {
        let target = null;
        let displayName = 'Unknown';
        let displayNumber = '';

        // ============================================
        // 🔥 FIXED: REPLY DETECTION
        // ============================================

        // ── Method 1: Check if reply to a message ──
        if (isReply && quoted) {
            const quotedMsg = quoted.msg || quoted;
            // Get sender from quoted message
            if (quotedMsg?.participant) {
                target = quotedMsg.participant;
            } else if (quotedMsg?.key?.participant) {
                target = quotedMsg.key.participant;
            } else if (quotedMsg?.sender) {
                target = quotedMsg.sender;
            }
            
            // Get name from quoted message
            if (quotedMsg?.pushName) {
                displayName = quotedMsg.pushName;
            } else if (quotedMsg?.notify) {
                displayName = quotedMsg.notify;
            }
        }

        // ── Method 2: Check if mentioned someone ──
        if (!target) {
            const mentionedJid = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (mentionedJid && mentionedJid.length > 0) {
                target = mentionedJid[0];
            }
        }

        // ── Method 3: Check if number provided in args ──
        if (!target && text) {
            const cleanText = text.trim().toLowerCase();
            
            if (cleanText === 'me') {
                target = sender;
            } else {
                const input = text.replace(/[^0-9]/g, '');
                if (input.length >= 10) {
                    target = `${input}@s.whatsapp.net`;
                    displayNumber = `+${input}`;
                } else {
                    return reply(`🌸 Invalid number. Use format: 923051234567 or +923051234567 💕`);
                }
            }
        }

        // ── Method 4: If no target, use sender ──
        if (!target) {
            target = sender;
        }

        // ── Get name ──
        try {
            const name = await mishu.getName(target);
            if (name && !name.startsWith('+') && name !== 'Unknown') {
                displayName = name;
            }
        } catch (e) {
            // Use fallback name
        }

        // ── Get number for display ──
        if (!displayNumber && target) {
            const num = target.split('@')[0];
            if (num && num.length >= 10) {
                displayNumber = `+${num}`;
            }
        }

        // ============================================
        // 🔥 GET PROFILE PICTURE
        // ============================================

        let ppUrl = null;
        try {
            ppUrl = await mishu.profilePictureUrl(target, 'image');
        } catch (e) {
            // Try with participant format
            try {
                const participantJid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
                ppUrl = await mishu.profilePictureUrl(participantJid, 'image');
            } catch (e2) {
                return reply(`🌸 No profile picture found for *${displayName}* ${displayNumber ? `(${displayNumber})` : ''} 💕`);
            }
        }

        // ============================================
        // 🔥 SEND PROFILE PICTURE
        // ============================================

        const caption = `
╭═══✿══════════════╗
│  ✿ 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗣𝗜𝗖𝗧𝗨𝗥𝗘 ✿
│  ✿━━━━━━━━━━━━━━━✿
${displayName && displayName !== 'Unknown' ? `│  ✿ 👤 *Name:* ${displayName}` : ''}
${displayNumber ? `│  ✿ 📱 *Number:* ${displayNumber}` : ''}
│  ✿ 👑 Saved by Queen
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

        // ── Send PP ──
        await mishu.sendMessage(from, {
            image: { url: ppUrl },
            caption: caption,
            contextInfo: {
                mentionedJid: [target],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429164571310@newsletter',
                    newsletterName: '🌸 MEER_xD 🌸',
                    serverMessageId: 143
                }
            }
        }, { quoted: fakevCard });

        // ── Reaction ──
        await mishu.sendMessage(from, {
            react: { text: '💖', key: mek.key }
        });

    } catch (err) {
        console.error('🌸 GetPP Error:', err);
        reply(`🌸 Failed to fetch profile picture.\nError: ${err.message || 'Unknown error'} 💕`);
    }
});

// ============================================
// 👑 GET ALL GROUP PPs (FIXED)
// ============================================
mishu({
    pattern: "allpp",
    alias: ["grouppp", "gpp", "allpic"],
    desc: "🌸 Get all group members profile pictures",
    category: "general",
    react: "👑",
    filename: __filename
},
async (mishu, mek, m, { from, reply, isGroup, groupName, participants, isOwner }) => {
    try {
        if (!isGroup) {
            return reply(`🌸 This command only works in groups! 💕`);
        }

        // ── Only owner can use ──
        if (!isOwner) {
            return reply(`🌸 Only owner can use this command! 👑`);
        }

        await mishu.sendMessage(from, {
            react: { text: "🌸", key: mek.key }
        });

        let ppList = '';
        let count = 0;
        const total = participants.length;

        for (const participant of participants) {
            try {
                const pp = await mishu.profilePictureUrl(participant, 'image');
                if (pp) {
                    const name = await mishu.getName(participant);
                    ppList += `👤 ${name || participant.split('@')[0]}\n📸 ${pp}\n\n`;
                    count++;
                }
            } catch (e) {
                // Skip if no PP
            }
        }

        if (count === 0) {
            return reply(`🌸 No profile pictures found in this group! 💕`);
        }

        const caption = `
╭═══✿══════════════╗
│  ✿ 𝗚𝗥𝗢𝗨𝗣 𝗣𝗥𝗢𝗙𝗜𝗟𝗘𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👥 ${groupName || 'Group'}
│  ✿ 📸 ${count}/${total} members
│  ✿ 👑 Saved by Queen
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

        const ppText = `🌸 GROUP PPs - ${groupName || 'Group'}\n\n${ppList}`;
        
        await mishu.sendMessage(from, {
            document: Buffer.from(ppText, 'utf-8'),
            mimetype: 'text/plain',
            fileName: `Group_PPs_${Date.now()}.txt`,
            caption: caption
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, {
            react: { text: "💖", key: mek.key }
        });

    } catch (err) {
        console.error('🌸 AllPP Error:', err);
        reply(`🌸 Error: ${err.message} 💕`);
    }
});

// ============================================
// 🎀 SAVE PP COMMAND (FIXED)
// ============================================
mishu({
    pattern: "savepp",
    alias: ["savedp", "downloadpp"],
    desc: "🌸 Save profile picture to gallery",
    category: "general",
    react: "💕",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text, sender, isOwner, isCreator, isReply, quoted }) => {
    try {
        if (!isOwner && !isCreator) {
            return reply(`🌸 Only my Queen can use this! 👸💖`);
        }

        let target = sender;
        let displayName = 'Your';

        // ── Check if replying to someone ──
        if (isReply && quoted) {
            const quotedMsg = quoted.msg || quoted;
            if (quotedMsg?.participant) {
                target = quotedMsg.participant;
            } else if (quotedMsg?.key?.participant) {
                target = quotedMsg.key.participant;
            }
            
            if (quotedMsg?.pushName) {
                displayName = quotedMsg.pushName;
            } else if (quotedMsg?.notify) {
                displayName = quotedMsg.notify;
            }
        }

        // ── Get PP ──
        let ppUrl;
        try {
            ppUrl = await mishu.profilePictureUrl(target, 'image');
        } catch (e) {
            return reply(`🌸 No profile picture found! 💕`);
        }

        const caption = `
╭═══✿══════════════╗
│  ✿ 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 𝗦𝗔𝗩𝗘𝗗 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 💾 Saved to gallery
│  ✿ 👤 ${displayName}
│  ✿ 👑 By MEER_xD
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

        await mishu.sendMessage(from, {
            image: { url: ppUrl },
            caption: caption
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, {
            react: { text: "💖", key: mek.key }
        });

    } catch (err) {
        console.error('🌸 SavePP Error:', err);
        reply(`🌸 Error: ${err.message} 💕`);
    }
});

console.log('🌸 GET PP Plugin Loaded! 💖');
