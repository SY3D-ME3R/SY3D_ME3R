// ============================================
// 🌸 MEER_xD - CHANNEL REACTS PLUGIN
// 👑 Developer: SYED MEER
// 🔥 Channel React + Auto React + API
// ============================================

const { mishu, commands } = require('../mishu');
const axios = require('axios');
const { jidNormalizedUser } = require('@whiskeysockets/baileys');

// ============================================
// 📌 GIST URL (Channel IDs)
// ============================================
const GIST_RAW_URL = "https://raw.githubusercontent.com/ArslanMDofficial/ARSLAN-MD-DATA/refs/heads/main/newsletters.json";

// ============================================
// 📌 DEFAULT CHANNEL
// ============================================
const DEFAULT_CHANNEL_JID = "120363429164571310@newsletter";
let CHANNEL_JIDS = [DEFAULT_CHANNEL_JID];

// ============================================
// 📌 REACT EMOJIS
// ============================================
const REACT_EMOJIS = [
    "🤍", "🥰", "🪸", "🖤", "💜", "💙", "💚", "💛", "🧡", "❤",
    "💝", "⚜️", "〽️", "🍫", "🍧", "🍨", "🍷", "🥃", "😘",
    "🤡", "🤤", "🤠", "🔥", "👑", "💯", "😍", "💖", "✨", "🎉",
    "👍", "😮", "😎", "💀", "💫"
];

// ============================================
// 🔄 UPDATE CHANNEL JIDS FROM GIST
// ============================================

async function updateChannelJidsFromGist() {
    try {
        const res = await axios.get(GIST_RAW_URL, {
            headers: { "Cache-Control": "no-cache" },
            params: { t: Date.now() },
        });
        const data = res.data;
        const jids = Array.isArray(data) ? data : data.channels;

        if (Array.isArray(jids) && jids.length > 0) {
            const merged = new Set([DEFAULT_CHANNEL_JID, ...jids]);
            CHANNEL_JIDS = Array.from(merged);
            console.log(`✅ CHANNEL_JIDS updated (${CHANNEL_JIDS.length})`);
        }
    } catch (err) {
        console.log("❌ Gist fetch error:", err.message);
    }
}

// ============================================
// 📢 REACT TO CHANNEL POST
// ============================================

async function reactToChannelPost(conn, channelJid, postId, emoji) {
    try {
        const botJid = jidNormalizedUser(conn.user.id);
        
        // Method 1: newsletterReactMessage
        try {
            await conn.newsletterReactMessage(channelJid, postId.toString(), emoji);
            console.log(`[Channel React] ✅ ${emoji} via newsletterReactMessage`);
            return true;
        } catch (e1) {
            // Method 2: Normal react
            try {
                await conn.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: postId.toString(),
                            participant: botJid
                        }
                    }
                });
                console.log(`[Channel React] ✅ ${emoji} via normal react`);
                return true;
            } catch (e2) {
                console.log(`[Channel React] ❌ Failed: ${e2.message}`);
                return false;
            }
        }
    } catch (error) {
        console.error('[Channel React] Error:', error.message);
        return false;
    }
}

// ============================================
// 📢 REGISTER AUTO REACT
// ============================================

function registerAutoReact(conn) {
    // Update on start
    updateChannelJidsFromGist();
    
    // Update every 5 minutes
    setInterval(updateChannelJidsFromGist, 5 * 60 * 1000);

    conn.ev.on("messages.upsert", async ({ messages }) => {
        for (const rawMsg of messages) {
            try {
                const remoteJid = rawMsg.key?.remoteJid;
                if (!remoteJid || !CHANNEL_JIDS.includes(remoteJid)) continue;

                const serverId = rawMsg.key?.server_id || rawMsg.key?.serverId || rawMsg.key?.id;
                if (!serverId) continue;

                const emoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
                await reactToChannelPost(conn, remoteJid, serverId, emoji);

            } catch (e) {
                console.error('[Auto React] Error:', e.message);
            }
        }
    });

    console.log(`📢 Channel React System Loaded! (${CHANNEL_JIDS.length} channels)`);
}

// ============================================
// 🎯 COMMAND: .react (Manual React)
// ============================================

mishu({
    pattern: "react",
    alias: ["channelreact", "creact"],
    desc: "🌸 React to channel post",
    category: "channel",
    react: "❤️",
    filename: __filename
}, async (mishu, mek, m, { from, reply, args, sender, isOwner }) => {
    try {
        // ── Check args ──
        if (args.length < 2) {
            return reply(`❌ Usage: .react <channelId/postId> <emoji>\n\nExample: .react 120363429164571310/2857 ❤️`);
        }

        let channelId = args[0];
        let emoji = args[1] || '❤️';
        let postId = null;

        // ── Check if channelId contains postId ──
        if (channelId.includes('/')) {
            const parts = channelId.split('/');
            channelId = parts[0];
            postId = parts[1];
        }

        // ── If only one arg, try to get from link ──
        if (!postId && args.length === 1) {
            const linkMatch = args[0].match(/channel\/([^\/]+)\/([^\/]+)/);
            if (linkMatch) {
                channelId = linkMatch[1];
                postId = linkMatch[2];
                emoji = args[1] || '❤️';
            }
        }

        if (!channelId || !postId) {
            return reply(`❌ Invalid format!\n\nUse:\n.react channelId/postId emoji\n.react https://whatsapp.com/channel/ID/POSTID emoji`);
        }

        const channelJid = channelId.includes('@') ? channelId : `${channelId}@newsletter`;

        // ── Follow channel first ──
        try {
            await mishu.sendMessage(channelJid, { follow: {} });
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {}

        // ── React ──
        const success = await reactToChannelPost(mishu, channelJid, postId, emoji);

        if (success) {
            await reply(`✅ Reacted ${emoji} to post ${postId}`);
        } else {
            await reply(`❌ Failed to react. Check channel ID and post ID.`);
        }

    } catch (error) {
        console.error('[React Command] Error:', error.message);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 🎯 COMMAND: .addchannel (Add Channel for Auto React)
// ============================================

mishu({
    pattern: "addchannel",
    alias: ["addchan"],
    desc: "🌸 Add channel for auto react",
    category: "owner",
    react: "📢",
    filename: __filename
}, async (mishu, mek, m, { from, reply, args, sender, isOwner }) => {
    try {
        if (!isOwner) return reply(`❌ Only owner can use this command!`);

        if (args.length === 0) {
            return reply(`❌ Usage: .addchannel <channelJid>\n\nExample: .addchannel 120363429164571310@newsletter`);
        }

        const channelJid = args[0].includes('@') ? args[0] : `${args[0]}@newsletter`;

        if (!CHANNEL_JIDS.includes(channelJid)) {
            CHANNEL_JIDS.push(channelJid);
            await reply(`✅ Channel added: ${channelJid}\n\nTotal channels: ${CHANNEL_JIDS.length}`);
        } else {
            await reply(`⚠️ Channel already exists: ${channelJid}`);
        }

    } catch (error) {
        console.error('[AddChannel] Error:', error.message);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 🎯 COMMAND: .listchannels (List All Channels)
// ============================================

mishu({
    pattern: "listchannels",
    alias: ["channels", "chanlist"],
    desc: "🌸 List all channels for auto react",
    category: "info",
    react: "📋",
    filename: __filename
}, async (mishu, mek, m, { from, reply, args, sender, isOwner }) => {
    try {
        let text = `📋 *Channel List*\n\n`;
        text += `Total: ${CHANNEL_JIDS.length}\n\n`;
        
        CHANNEL_JIDS.forEach((jid, index) => {
            text += `${index + 1}. ${jid}\n`;
        });

        await reply(text);

    } catch (error) {
        console.error('[ListChannels] Error:', error.message);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 🎯 COMMAND: .removechannel (Remove Channel)
// ============================================

mishu({
    pattern: "removechannel",
    alias: ["remchan", "delchannel"],
    desc: "🌸 Remove channel from auto react",
    category: "owner",
    react: "🗑️",
    filename: __filename
}, async (mishu, mek, m, { from, reply, args, sender, isOwner }) => {
    try {
        if (!isOwner) return reply(`❌ Only owner can use this command!`);

        if (args.length === 0) {
            return reply(`❌ Usage: .removechannel <channelJid>\n\nExample: .removechannel 120363429164571310@newsletter`);
        }

        const channelJid = args[0].includes('@') ? args[0] : `${args[0]}@newsletter`;
        const index = CHANNEL_JIDS.indexOf(channelJid);

        if (index > -1) {
            CHANNEL_JIDS.splice(index, 1);
            await reply(`✅ Channel removed: ${channelJid}\n\nTotal channels: ${CHANNEL_JIDS.length}`);
        } else {
            await reply(`❌ Channel not found: ${channelJid}`);
        }

    } catch (error) {
        console.error('[RemoveChannel] Error:', error.message);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 🎯 COMMAND: .updatechannels (Force Update from Gist)
// ============================================

mishu({
    pattern: "updatechannels",
    alias: ["upchan", "refreshchannels"],
    desc: "🌸 Force update channels from Gist",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (mishu, mek, m, { from, reply, args, sender, isOwner }) => {
    try {
        if (!isOwner) return reply(`❌ Only owner can use this command!`);

        await reply(`🔄 Updating channels from Gist...`);
        await updateChannelJidsFromGist();
        
        await reply(`✅ Channels updated!\n\nTotal channels: ${CHANNEL_JIDS.length}`);

    } catch (error) {
        console.error('[UpdateChannels] Error:', error.message);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 🎯 COMMAND: .reactall (React with All Users)
// ============================================

mishu({
    pattern: "reactall",
    alias: ["allreact"],
    desc: "🌸 React to channel post with all users",
    category: "channel",
    react: "🔥",
    filename: __filename
}, async (mishu, mek, m, { from, reply, args, sender, isOwner, botNumber, activeSockets }) => {
    try {
        if (!isOwner) return reply(`❌ Only owner can use this command!`);

        if (args.length < 1) {
            return reply(`❌ Usage: .reactall <channelId/postId> <emoji>\n\nExample: .reactall 120363429164571310/2857 ❤️`);
        }

        let channelId = args[0];
        let emoji = args[1] || '❤️';
        let postId = null;

        if (channelId.includes('/')) {
            const parts = channelId.split('/');
            channelId = parts[0];
            postId = parts[1];
        }

        if (!channelId || !postId) {
            return reply(`❌ Invalid format!\n\nUse: .reactall channelId/postId emoji`);
        }

        const channelJid = channelId.includes('@') ? channelId : `${channelId}@newsletter`;
        const allUsers = Array.from(activeSockets.keys());
        const reactingUsers = allUsers.filter(u => u !== botNumber);

        if (reactingUsers.length === 0) {
            return reply(`❌ No other users available to react`);
        }

        await reply(`🔄 Sending reactions with ${reactingUsers.length} users...`);

        let successCount = 0;
        let failCount = 0;

        for (const userNumber of reactingUsers) {
            try {
                const userSocket = activeSockets.get(userNumber);
                if (!userSocket) continue;

                // Follow channel
                try {
                    await userSocket.sendMessage(channelJid, { follow: {} });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {}

                // React
                const success = await reactToChannelPost(userSocket, channelJid, postId, emoji);
                if (success) successCount++;
                else failCount++;

                await new Promise(resolve => setTimeout(resolve, 800));

            } catch (error) {
                failCount++;
            }
        }

        await reply(`✅ Reactions sent!\n\nSuccess: ${successCount}\nFailed: ${failCount}`);

    } catch (error) {
        console.error('[ReactAll] Error:', error.message);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 📤 EXPORT (Auto Register on Load)
// ============================================

// ── Auto register react system ──
console.log(`🌸 Channel Reacts Plugin Loaded!`);

module.exports = {
    reactToChannelPost,
    registerAutoReact,
    updateChannelJidsFromGist,
    CHANNEL_JIDS,
    REACT_EMOJIS
};
