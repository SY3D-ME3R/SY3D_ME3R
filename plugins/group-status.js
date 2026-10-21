// ============================================
// 🌸 GROUP STATUS - MEER_xD
// 👑 Developer: SYED MEER
// 🔥 Post status updates to group story
// ============================================

const { PassThrough } = require("stream");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require('path');
const { mishu } = require('../mishu');
const config = require('../settings');

ffmpeg.setFfmpegPath(ffmpegStatic);

// ============================================
// 📁 TEMP DIRECTORY
// ============================================
const TEMP_DIR = path.join(__dirname, '../temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ============================================
// 🎨 CONSTANTS
// ============================================
const PURPLE_COLOR = "#9C27B0";

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

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐`;
}

// ============================================
// 🔧 HELPERS
// ============================================

function detectMediaType(message) {
    if (!message || typeof message !== "object") return null;
    if (message.imageMessage) return "image";
    if (message.videoMessage) return "video";
    if (message.audioMessage) return "audio";
    if (message.stickerMessage) return "sticker";
    return null;
}

function unwrapQuotedMessage(message) {
    let current = message;
    for (let i = 0; i < 4; i++) {
        const wrapper = current?.viewOnceMessageV2 ||
            current?.viewOnceMessage ||
            current?.viewOnceMessageV2Extension ||
            current?.documentWithCaptionMessage;
        if (!wrapper?.message) break;
        current = wrapper.message;
    }
    return current;
}

async function downloadMedia(message, type) {
    const mediaMessage = message[`${type}Message`];
    if (!mediaMessage) throw new Error(`Missing ${type} message payload.`);

    const stream = await downloadContentFromMessage(mediaMessage, type);
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

async function postGroupStatus(client, jid, content) {
    const statusSourceType = content.text
        ? "TEXT"
        : content.image
            ? "IMAGE"
            : content.video
                ? "VIDEO"
                : content.audio
                    ? "AUDIO"
                    : content.sticker
                        ? "IMAGE"
                        : "TEXT";

    return client.sendMessage(jid, {
        ...content,
        contextInfo: {
            ...(content.contextInfo || {}),
            isGroupStatus: true,
            statusSourceType,
            statusAttributions: [{ type: 10 }],
            statusAudienceMetadata: { audienceType: "CLOSE_FRIENDS" }
        }
    });
}

async function convertToVoiceNote(buffer) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough();
        const output = new PassThrough();
        const chunks = [];
        input.end(buffer);

        output.on("data", (chunk) => chunks.push(chunk));
        ffmpeg(input)
            .noVideo()
            .audioCodec("libopus")
            .format("ogg")
            .audioChannels(1)
            .audioFrequency(48000)
            .on("error", reject)
            .on("end", () => resolve(Buffer.concat(chunks)))
            .pipe(output);
    });
}

async function generateWaveform(buffer, bars = 64) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough();
        const chunks = [];
        input.end(buffer);

        ffmpeg(input)
            .audioChannels(1)
            .audioFrequency(16000)
            .format("s16le")
            .on("error", reject)
            .on("end", () => {
                const raw = Buffer.concat(chunks);
                const samples = Math.floor(raw.length / 2);
                if (!samples) return resolve(undefined);

                const amplitudes = [];
                for (let i = 0; i < samples; i++) {
                    amplitudes.push(Math.abs(raw.readInt16LE(i * 2)) / 32768);
                }

                const size = Math.floor(amplitudes.length / bars);
                if (!size) return resolve(undefined);
                const averages = Array.from({ length: bars }, (_, index) => {
                    const slice = amplitudes.slice(index * size, (index + 1) * size);
                    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
                });
                const max = Math.max(...averages);
                if (!max) return resolve(undefined);

                resolve(Buffer.from(averages.map((value) => Math.floor((value / max) * 100))).toString("base64"));
            })
            .pipe()
            .on("data", (chunk) => chunks.push(chunk));
    });
}

// ============================================
// 📌 GROUP STATUS COMMAND
// ============================================

mishu({
    pattern: "groupstatus",
    alias: ["gcstatus", "gs", "gstatus", "gstory"],
    desc: "🌸 Post a status update to the group story",
    category: "group",
    react: "📝",
    filename: __filename
}, async (mishu, mek, m, {
    from,
    reply,
    text,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    isReply,
    quoted,
    quotedMessage,
    repliedType,
    sender,
    senderNumber
}) => {
    try {
        // ── Group only ──
        if (!isGroup) {
            return reply(`🌸 This command only works in groups! 💕`);
        }

        // ── Admin only ──
        if (!isAdmins && !isOwner && !isCreator) {
            return reply(`🌸 Only admins and Queen can use this! 👸💖`);
        }

        // ── Bot must be admin ──
        if (!isBotAdmins) {
            return reply(`🌸 Please make me admin first! 💕`);
        }

        const caption = text || '';
        const isTextStatus = !isReply || !quoted;

        // ── TEXT STATUS ──
        if (isTextStatus) {
            if (!caption) {
                return reply(girlBox('📝 GROUP STATUS USAGE', [
                    ['📌', 'Reply to media', '.groupstatus [caption]'],
                    ['📌', 'Text status', '.groupstatus Your text here'],
                    ['💖', 'Supported', 'Image, Video, Audio, Sticker'],
                    ['👑', 'By', 'MEER_xD']
                ]));
            }

            await reply('⏳ Posting text group status...');

            try {
                await postGroupStatus(mishu, from, {
                    text: caption,
                    backgroundColor: PURPLE_COLOR
                });
                
                await mishu.sendMessage(from, { react: { text: '✅', key: mek.key } });
                return reply('✅ Text group story posted successfully.');
            } catch (error) {
                console.error('[GroupStatus] text error:', error);
                return reply(`❌ Failed to post text group story: ${error.message || error}`);
            }
        }

        // ── MEDIA STATUS ──
        const quotedMsg = quoted.msg || quoted;
        const mediaPayload = unwrapQuotedMessage(quotedMsg);
        const mediaType = detectMediaType(mediaPayload);

        if (!mediaType) {
            return reply(`❌ Unsupported quoted media. Reply to an image, video, audio, or sticker.`);
        }

        await reply(`⏳ Preparing ${mediaType} group status...`);

        try {
            const buffer = await downloadMedia(mediaPayload, mediaType);
            if (!buffer?.length) throw new Error("The quoted media could not be downloaded.");

            if (mediaType === "audio") {
                const voiceNote = await convertToVoiceNote(buffer);
                const waveform = await generateWaveform(buffer).catch(() => undefined);
                await postGroupStatus(mishu, from, {
                    audio: voiceNote,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true,
                    waveform
                });
            } else if (mediaType === "sticker") {
                await postGroupStatus(mishu, from, {
                    sticker: buffer
                });
            } else {
                await postGroupStatus(mishu, from, {
                    [mediaType]: buffer,
                    caption: caption || ''
                });
            }

            await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });
            return reply(`✅ ${mediaType[0].toUpperCase() + mediaType.slice(1)} group story posted successfully.`);

        } catch (error) {
            console.error(`[GroupStatus] ${mediaType} error:`, error);
            return reply(`❌ Failed to post ${mediaType} group story: ${error.message || error}`);
        }

    } catch (error) {
        console.error('🌸 GroupStatus Error:', error);
        reply(`🌸 Error: ${error.message} 💕`);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

console.log('🌸 GROUP STATUS plugin loaded! 💖');
