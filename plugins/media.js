// ============================================
// 🌸 MEDIA COMMANDS - MEER_xD (FIXED)
// 👑 Developer: SYED MEER
// 🔥 Reply System Fixed - Audio Editor Style
// ============================================

const { mishu } = require('../mishu');
const converter = require('../data/converter');
const stickerConverter = require('../data/sticker-converter');
const { fakevCard } = require('../lib/fakevCard');

// ============================================
// 🎀 GIRL STYLE HELPERS
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
// 🖼️ STICKER TO IMAGE (FIXED)
// ============================================

mishu({
    pattern: 'photo',
    alias: ['sticker2img', 'stoimg', 'stickertoimage', 's2i'],
    desc: '🌸 Convert stickers to images',
    category: 'media',
    react: '🌸',
    filename: __filename
}, async (mishu, mek, m, { from, reply, isReply, quoted, quotedMessage, repliedType }) => {
    try {
        // ── FIXED: Check reply using isReply ──
        if (!isReply || !quoted) {
            return reply(`🌸 Reply to a sticker message!\nExample: .photo (reply to sticker) 💕`);
        }

        // ── Get quoted message ──
        const quotedMsg = quoted.msg || quoted;
        
        // ── Check if it's a sticker ──
        const isSticker = repliedType === 'sticker' || 
                          quotedMsg?.mimetype?.includes('webp') ||
                          quotedMsg?.stickerMessage;

        if (!isSticker) {
            return reply(`🌸 Only sticker messages can be converted! 💕`);
        }

        // ── Show processing ──
        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        // ── Download sticker ──
        let stickerBuffer = null;
        
        if (typeof quoted.download === 'function') {
            stickerBuffer = await quoted.download();
        } else if (mek.quoted && typeof mek.quoted.download === 'function') {
            stickerBuffer = await mek.quoted.download();
        }

        if (!stickerBuffer || stickerBuffer.length === 0) {
            return reply(`🌸 Failed to download sticker! 💕`);
        }

        // ── Convert sticker to image ──
        const imageBuffer = await stickerConverter.convertStickerToImage(stickerBuffer);

        if (!imageBuffer || imageBuffer.length === 0) {
            return reply(`🌸 Failed to convert sticker! 💕`);
        }

        // ── Send image ──
        await mishu.sendMessage(from, {
            image: imageBuffer,
            caption: girlBox('🖼️ STICKER CONVERTED', [
                ['✅', 'Status', 'Converted successfully'],
                ['👑', 'By', 'MEER_xD']
            ]),
            mimetype: 'image/png'
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 Sticker conversion error:', error);
        reply(`🌸 Failed to convert sticker: ${error.message} 💕`);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

// ============================================
// 🎵 TO MP3 (FIXED)
// ============================================

mishu({
    pattern: 'tomp3',
    alias: ['mp3', 'toaudio'],
    desc: '🌸 Convert media to audio (MP3)',
    category: 'media',
    react: '🌸',
    filename: __filename
}, async (mishu, mek, m, { from, reply, isReply, quoted, quotedMessage, repliedType }) => {
    try {
        // ── FIXED: Check reply using isReply ──
        if (!isReply || !quoted) {
            return reply(`🌸 Reply to a video/audio message!\nExample: .tomp3 (reply to video) 💕`);
        }

        // ── Get quoted message ──
        const quotedMsg = quoted.msg || quoted;
        
        // ── Check if it's video or audio ──
        const isVideo = repliedType === 'video' || 
                        quotedMsg?.mimetype?.includes('video') ||
                        quotedMsg?.videoMessage;

        const isAudio = repliedType === 'audio' || 
                        quotedMsg?.mimetype?.includes('audio') ||
                        quotedMsg?.audioMessage;

        if (!isVideo && !isAudio) {
            return reply(`🌸 Only video/audio messages can be converted! 💕`);
        }

        // ── Get duration ──
        const duration = quotedMsg?.seconds || quotedMsg?.videoMessage?.seconds || quotedMsg?.audioMessage?.seconds || 0;

        if (duration > 300) {
            return reply(`🌸 Media too long! Max 5 minutes allowed. 💕`);
        }

        // ── Show processing ──
        await mishu.sendMessage(from, { react: { text: '🎵', key: mek.key } });

        // ── Download media ──
        let buffer = null;
        
        if (typeof quoted.download === 'function') {
            buffer = await quoted.download();
        } else if (mek.quoted && typeof mek.quoted.download === 'function') {
            buffer = await mek.quoted.download();
        }

        if (!buffer || buffer.length === 0) {
            return reply(`🌸 Failed to download media! 💕`);
        }

        // ── Convert to audio ──
        const ext = isVideo ? 'mp4' : 'm4a';
        const audio = await converter.toAudio(buffer, ext);

        if (!audio || audio.length === 0) {
            return reply(`🌸 Failed to convert to audio! 💕`);
        }

        // ── Send audio ──
        await mishu.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            caption: girlBox('🎵 AUDIO CONVERTED', [
                ['✅', 'Status', 'MP3 ready'],
                ['⏱️', 'Duration', `${duration}s`],
                ['📁', 'Type', isVideo ? 'Video → Audio' : 'Audio → MP3']
            ])
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 MP3 Error:', error);
        reply(`🌸 Failed to convert audio: ${error.message} 💕`);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

// ============================================
// 🎙️ TO PTT (Voice Message) (FIXED)
// ============================================

mishu({
    pattern: 'toptt',
    alias: ['voice', 'ptt', 'tovoice'],
    desc: '🌸 Convert media to voice message',
    category: 'media',
    react: '🌸',
    filename: __filename
}, async (mishu, mek, m, { from, reply, isReply, quoted, quotedMessage, repliedType }) => {
    try {
        // ── FIXED: Check reply using isReply ──
        if (!isReply || !quoted) {
            return reply(`🌸 Reply to a video/audio message!\nExample: .toptt (reply to video) 💕`);
        }

        // ── Get quoted message ──
        const quotedMsg = quoted.msg || quoted;
        
        // ── Check if it's video or audio ──
        const isVideo = repliedType === 'video' || 
                        quotedMsg?.mimetype?.includes('video') ||
                        quotedMsg?.videoMessage;

        const isAudio = repliedType === 'audio' || 
                        quotedMsg?.mimetype?.includes('audio') ||
                        quotedMsg?.audioMessage;

        if (!isVideo && !isAudio) {
            return reply(`🌸 Only video/audio messages can be converted! 💕`);
        }

        // ── Get duration ──
        const duration = quotedMsg?.seconds || quotedMsg?.videoMessage?.seconds || quotedMsg?.audioMessage?.seconds || 0;

        if (duration > 60) {
            return reply(`🌸 Media too long! Max 1 minute for voice. 💕`);
        }

        // ── Show processing ──
        await mishu.sendMessage(from, { react: { text: '🎙️', key: mek.key } });

        // ── Download media ──
        let buffer = null;
        
        if (typeof quoted.download === 'function') {
            buffer = await quoted.download();
        } else if (mek.quoted && typeof mek.quoted.download === 'function') {
            buffer = await mek.quoted.download();
        }

        if (!buffer || buffer.length === 0) {
            return reply(`🌸 Failed to download media! 💕`);
        }

        // ── Convert to voice ──
        const ext = isVideo ? 'mp4' : 'm4a';
        const ptt = await converter.toPTT(buffer, ext);

        if (!ptt || ptt.length === 0) {
            return reply(`🌸 Failed to create voice message! 💕`);
        }

        // ── Send voice message ──
        await mishu.sendMessage(from, {
            audio: ptt,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            caption: girlBox('🎙️ VOICE MESSAGE', [
                ['✅', 'Status', 'Voice message ready'],
                ['⏱️', 'Duration', `${duration}s`],
                ['📁', 'Type', isVideo ? 'Video → Voice' : 'Audio → Voice']
            ])
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 PTT Error:', error);
        reply(`🌸 Failed to create voice message: ${error.message} 💕`);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

console.log('🌸 MEER_xD - Media plugins loaded! 💖');
