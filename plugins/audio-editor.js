// ============================================
// 🌸 AUDIO EFFECTS - MEER_xD (FULLY FIXED)
// 👑 Developer: SYED MEER
// ============================================

const { fakevCard } = require('../lib/fakevCard');
const { mishu } = require('../mishu');
const audioEditor = require('../data/audioeditor');

async function handleAudioEffect(client, mek, m, { from, reply, effect, emoji, name }) {
    try {
        // ── FIXED: Multiple ways to check quoted ──
        const quotedMsg = mek.quoted || m?.quoted || mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return reply(`🌸 *${name} EFFECT*\n\nReply to an audio/video message with:\n\`.${effect}\``);
        }

        // ── FIXED: Get mtype ──
        let mtype = quotedMsg.type || quotedMsg.mtype || '';
        
        // Check if quoted message is audio or video
        const isAudio = mtype === 'audio' || 
                       quotedMsg?.msg?.mimetype?.includes('audio') ||
                       quotedMsg?.audioMessage ||
                       quotedMsg?.mimetype?.includes('audio');
        
        const isVideo = mtype === 'video' || 
                       quotedMsg?.msg?.mimetype?.includes('video') ||
                       quotedMsg?.videoMessage ||
                       quotedMsg?.mimetype?.includes('video');

        if (!isAudio && !isVideo) {
            return reply(`❌ Please reply to an *audio* or *video* message.\n\nUsage: reply to audio/video with \`.${effect}\``);
        }

        // ── Download ──
        let buffer;
        try {
            if (typeof quotedMsg.download === 'function') {
                buffer = await quotedMsg.download();
            } else if (mek.quoted && typeof mek.quoted.download === 'function') {
                buffer = await mek.quoted.download();
            } else {
                // Try to download from quotedMessage
                const qMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (qMsg) {
                    const msgType = qMsg.audioMessage ? 'audio' : 
                                   qMsg.videoMessage ? 'video' : null;
                    if (msgType) {
                        const stream = await downloadContentFromMessage(
                            qMsg.audioMessage || qMsg.videoMessage, 
                            msgType
                        );
                        let buf = Buffer.from([]);
                        for await (const chunk of stream) {
                            buf = Buffer.concat([buf, chunk]);
                        }
                        buffer = buf;
                    }
                }
            }
        } catch (e) {
            console.error('[Download] Error:', e.message);
            return reply(`❌ Failed to download media: ${e.message}`);
        }

        if (!buffer || buffer.length === 0) {
            return reply('❌ Failed to download media. Please try again.');
        }

        // ── Send processing reaction ──
        await client.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const ext = isVideo ? 'mp4' : 'mp3';
        const audio = await audioEditor[effect](buffer, ext);

        const caption = `
┏━━━━━━━━━━━━━━━━━━⊷
│  ✿ ${emoji} ${name} EFFECT ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ✅ Effect applied
│  ✿ 🎵 Audio processed
╰━━━━━━━━━━━━━━━━━━⊷

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
        `;

        await client.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            caption: caption,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429164571310@newsletter',
                    newsletterName: '💕⃝🕊️ MEER_xD 💕⃝🕊️',
                    serverMessageId: 143
                }
            }
        }, { quoted: fakevCard });

        await client.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error(`🌸 ${name} effect error:`, error);
        reply(`🌸 Failed to apply ${name} effect.\nError: ${error.message || 'Unknown'} 💕`);
        await client.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
}

// ============================================
// 🗣️ DEEP EFFECT
// ============================================
mishu({
    pattern: 'deep',
    alias: ['deeper', 'bassvoice'],
    desc: '🌸 Make audio sound deeper',
    category: 'audio',
    react: '🗣️',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'deep', emoji: '🗣️', name: 'Deep' });
});

// ── All other effects (same pattern) ──
mishu({
    pattern: 'smooth',
    alias: ['smoothvoice', 'soft'],
    desc: '🌸 Smooth out audio',
    category: 'audio',
    react: '🌀',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'smooth', emoji: '🌀', name: 'Smooth' });
});

mishu({
    pattern: 'fat',
    alias: ['bassy', 'heavybass'],
    desc: '🌸 Make audio sound fat/bassy',
    category: 'audio',
    react: '🍔',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'fat', emoji: '🍔', name: 'Fat Bass' });
});

mishu({
    pattern: 'tupai',
    alias: ['squirrel', 'chipmunk2'],
    desc: '🌸 Special tupai effect',
    category: 'audio',
    react: '🐿️',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'tupai', emoji: '🐿️', name: 'Tupai' });
});

mishu({
    pattern: 'blown',
    alias: ['blownout', 'distort'],
    desc: '🌸 Make audio sound blown out',
    category: 'audio',
    react: '💥',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'blown', emoji: '💥', name: 'Blown' });
});

mishu({
    pattern: 'radio',
    alias: ['oldradio', 'vintage'],
    desc: '🌸 Make audio sound like old radio',
    category: 'audio',
    react: '📻',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'radio', emoji: '📻', name: 'Radio' });
});

mishu({
    pattern: 'robot',
    alias: ['robotic', 'cyborg'],
    desc: '🌸 Make audio sound robotic',
    category: 'audio',
    react: '🤖',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'robot', emoji: '🤖', name: 'Robot' });
});

mishu({
    pattern: 'chipmunk',
    alias: ['highpitch', 'helium'],
    desc: '🌸 Make audio sound high-pitched',
    category: 'audio',
    react: '🐿️',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'chipmunk', emoji: '🐿️', name: 'Chipmunk' });
});

mishu({
    pattern: 'nightcore',
    alias: ['night', 'speedup'],
    desc: '🌸 Apply nightcore effect',
    category: 'audio',
    react: '🎶',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'nightcore', emoji: '🎶', name: 'Nightcore' });
});

mishu({
    pattern: 'earrape',
    alias: ['maxvolume', 'loud'],
    desc: '🌸 Max volume (use with caution)',
    category: 'audio',
    react: '📢',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'earrape', emoji: '📢', name: 'Earrape' });
});

mishu({
    pattern: 'bass',
    alias: ['bassboost', 'boost'],
    desc: '🌸 Add heavy bass boost to audio',
    category: 'audio',
    react: '🔊',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'bass', emoji: '🔊', name: 'Bass Boost' });
});

mishu({
    pattern: 'reverse',
    alias: ['backwards', 'rev'],
    desc: '🌸 Reverse audio',
    category: 'audio',
    react: '⏪',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'reverse', emoji: '⏪', name: 'Reverse' });
});

mishu({
    pattern: 'slow',
    alias: ['slowdown', 'slomo'],
    desc: '🌸 Slow down audio',
    category: 'audio',
    react: '🐌',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'slow', emoji: '🐌', name: 'Slow' });
});

mishu({
    pattern: 'fast',
    alias: ['speedup', 'faster'],
    desc: '🌸 Speed up audio',
    category: 'audio',
    react: '⚡',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'fast', emoji: '⚡', name: 'Fast' });
});

mishu({
    pattern: 'baby',
    alias: ['babyvoice', 'child'],
    desc: '🌸 Make audio sound like a baby',
    category: 'audio',
    react: '👶',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'baby', emoji: '👶', name: 'Baby' });
});

mishu({
    pattern: 'demon',
    alias: ['demonic', 'devil'],
    desc: '🌸 Make audio sound demonic',
    category: 'audio',
    react: '👹',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    await handleAudioEffect(client, mek, m, { from, reply, effect: 'demon', emoji: '👹', name: 'Demon' });
});

// ============================================
// 🎵 EFFECTS LIST COMMAND
// ============================================
mishu({
    pattern: 'audioeffects',
    alias: ['effects', 'audiofx', 'fxlist'],
    desc: '🌸 Show all audio effects',
    category: 'audio',
    react: '🎵',
    filename: __filename
}, async (client, mek, m, { from, reply }) => {
    const effectsList = `
╭────────────────────◇
│  ✿ 𝗔𝗨𝗗𝗜𝗢 𝗘𝗙𝗙𝗘𝗖𝗧𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🗣️ .deep - Deep Voice
│  ✿ 🌀 .smooth - Smooth
│  ✿ 🍔 .fat - Fat Bass
│  ✿ 🐿️ .tupai - Tupai
│  ✿ 💥 .blown - Blown Out
│  ✿ 📻 .radio - Old Radio
│  ✿ 🤖 .robot - Robotic
│  ✿ 🐿️ .chipmunk - High Pitch
│  ✿ 🎶 .nightcore - Nightcore
│  ✿ 📢 .earrape - Max Volume
│  ✿ 🔊 .bass - Bass Boost
│  ✿ ⏪ .reverse - Reverse
│  ✿ 🐌 .slow - Slow Down
│  ✿ ⚡ .fast - Speed Up
│  ✿ 👶 .baby - Baby Voice
│  ✿ 👹 .demon - Demonic
╰────────────────────○

🌸 *Usage:*
• Reply to audio/video: \`.effect\`

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
    `;
    reply(effectsList);
});
