// ============================================
// 🌸 AI MUSIC GENERATOR - MEER_xD
// 👑 Developer: SYED MEER
// 🔥 Generate AI Music from Prompt
// ============================================

const { mishu } = require('../mishu');
const { sendInteractiveMessage } = require('gifted-btns');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// ============================================
// 📌 API BASE URL
// ============================================
const API_BASE = 'https://apis.davidcyriltech.my.id/ai/music/generate';

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
// 🎵 AI MUSIC GENERATE COMMAND
// ============================================

mishu({
    pattern: "aimusic",
    alias: ["musicai", "aimusicgen", "aigen", "musicgen"],
    desc: "🌸 Generate AI music from prompt",
    category: "ai",
    react: "🎵",
    filename: __filename
}, async (mishu, mek, m, { from, text, reply, sender }) => {
    try {
        if (!text) {
            return reply(girlBox('🎵 AI MUSIC GENERATOR', [
                ['📌', 'Usage', '.aimusic <prompt>'],
                ['💖', 'Example', '.aimusic upbeat electronic music'],
                ['📌', 'Example 2', '.aimusic rock rap promo song'],
                ['🎵', 'Style', 'Any music style you want']
            ]));
        }

        // ── Loading Reaction ──
        await mishu.sendMessage(from, { react: { text: '🎵', key: mek.key } });

        // ── Build API URL ──
        const prompt = text.trim();
        const encodedPrompt = encodeURIComponent(prompt);
        const apiUrl = `${API_BASE}?prompt=${encodedPrompt}`;

        // ── Send waiting message ──
        const waitMsg = await reply(girlBox('🎵 GENERATING MUSIC', [
            ['🎶', 'Prompt', prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt],
            ['⏳', 'Status', 'Generating... Please wait!'],
            ['⏱️', 'Time', 'May take 30-60 seconds']
        ]));

        // ── API Call ──
        const response = await axios.get(apiUrl, { 
            timeout: 120000 // 2 minutes timeout
        });

        const data = response.data;

        if (!data.success || !data.data || data.data.length === 0) {
            return reply(`🌸 Failed to generate music! Please try again. 💕`);
        }

        // ── Get first music result ──
        const music = data.data[0];
        const downloadUrl = music.downloadUrl || music.streamUrl;

        if (!downloadUrl) {
            return reply(`🌸 No download URL found! 💕`);
        }

        // ── Download music ──
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `${music.title || 'ai_music'}.mp3`;
        const tempPath = path.join(tempDir, fileName);

        // ── Download file ──
        const writer = fs.createWriteStream(tempPath);
        const downloadResponse = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream',
            timeout: 60000
        });

        downloadResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const stats = fs.statSync(tempPath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        // ── Send music with buttons ──
        const caption = girlBox('🎵 AI MUSIC GENERATED', [
            ['🎶', 'Title', music.title || 'AI Music'],
            ['📦', 'Size', `${fileSizeKB} KB`],
            ['🎵', 'Format', 'MP3'],
            ['✅', 'Status', 'Generated Successfully!']
        ]);

        // ── Send with buttons ──
        await sendInteractiveMessage(mishu, from, {
            text: caption,
            footer: `💖 ${config.BOT_NAME || 'MEER_xD'}`,
            interactiveButtons: [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎵 Play Online',
                        url: arslanmd.xo.je
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📥 Download MP3',
                        url: arslanmd.xo.je
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔄 Generate Again',
                        id: `.aimusic ${prompt}`
                    })
                }
            ]
        });

        // ── Send audio file ──
        await mishu.sendMessage(from, {
            audio: fs.readFileSync(tempPath),
            mimetype: 'audio/mpeg',
            ptt: false,
            caption: `🎵 ${music.title || 'AI Music'}\n💖 Powered by MEER_xD`
        }, { quoted: mek });

        // ── Clean up ──
        try {
            fs.unlinkSync(tempPath);
        } catch (e) {}

        // ── Update wait message ──
        try {
            await mishu.sendMessage(from, {
                text: girlBox('🎵 MUSIC GENERATED', [
                    ['✅', 'Status', 'Complete!'],
                    ['🎶', 'Title', music.title || 'AI Music'],
                    ['📦', 'Size', `${fileSizeKB} KB`]
                ]),
                edit: waitMsg.key
            });
        } catch (e) {}

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 AIMusic Error:', error);
        
        if (error.code === 'ECONNABORTED') {
            reply(`🌸 Request timeout! Please try again. 💕`);
        } else if (error.response?.status === 429) {
            reply(`🌸 Too many requests! Please wait a moment. 💕`);
        } else {
            reply(`🌸 Error: ${error.message} 💕`);
        }
        
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

// ============================================
// 🎵 AI MUSIC WITH LYRICS COMMAND
// ============================================

mishu({
    pattern: "aimusiclyrics",
    alias: ["musiclyrics", "lyricsmusic", "songai"],
    desc: "🌸 Generate AI music with custom lyrics",
    category: "ai",
    react: "🎶",
    filename: __filename
}, async (mishu, mek, m, { from, text, reply, sender }) => {
    try {
        if (!text) {
            return reply(girlBox('🎶 AI MUSIC WITH LYRICS', [
                ['📌', 'Usage', '.aimusiclyrics <lyrics>'],
                ['💖', 'Example', '.aimusiclyrics Yo! This is my song...'],
                ['🎵', 'Style', 'Rock, Rap, Pop, Electronic']
            ]));
        }

        // ── Loading ──
        await mishu.sendMessage(from, { react: { text: '🎶', key: mek.key } });

        // ── Build prompt with style ──
        const lyrics = text.trim();
        const prompt = `🎵 AI Music Generation\n\nLyrics:\n${lyrics}\n\nStyle: Modern Pop with Beat`;
        const encodedPrompt = encodeURIComponent(prompt);
        const apiUrl = `${API_BASE}?prompt=${encodedPrompt}`;

        // ── Send waiting ──
        await reply(girlBox('🎶 GENERATING SONG', [
            ['📝', 'Lyrics', lyrics.length > 50 ? lyrics.substring(0, 50) + '...' : lyrics],
            ['⏳', 'Status', 'Generating music...']
        ]));

        // ── API Call ──
        const response = await axios.get(apiUrl, { timeout: 120000 });
        const data = response.data;

        if (!data.success || !data.data || data.data.length === 0) {
            return reply(`🌸 Failed to generate music! 💕`);
        }

        const music = data.data[0];
        const downloadUrl = music.downloadUrl || music.streamUrl;

        if (!downloadUrl) {
            return reply(`🌸 No download URL found! 💕`);
        }

        // ── Download ──
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `${music.title || 'ai_song'}.mp3`;
        const tempPath = path.join(tempDir, fileName);

        const writer = fs.createWriteStream(tempPath);
        const downloadResponse = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream',
            timeout: 60000
        });

        downloadResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const stats = fs.statSync(tempPath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        // ── Send ──
        await mishu.sendMessage(from, {
            audio: fs.readFileSync(tempPath),
            mimetype: 'audio/mpeg',
            ptt: false,
            caption: girlBox('🎶 SONG GENERATED', [
                ['🎵', 'Title', music.title || 'AI Song'],
                ['📝', 'Lyrics', lyrics.length > 100 ? lyrics.substring(0, 100) + '...' : lyrics],
                ['📦', 'Size', `${fileSizeKB} KB`]
            ])
        }, { quoted: mek });

        // ── Clean up ──
        try {
            fs.unlinkSync(tempPath);
        } catch (e) {}

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 AIMusicLyrics Error:', error);
        reply(`🌸 Error: ${error.message} 💕`);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

// ============================================
// 🎵 AI MUSIC STYLES LIST
// ============================================

mishu({
    pattern: "musicstyles",
    alias: ["aistyles", "musicgenres"],
    desc: "🌸 Show AI music styles",
    category: "ai",
    react: "🎼",
    filename: __filename
}, async (mishu, mek, m, { from, reply }) => {
    try {
        const styles = `
╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✌︎㋡━━━━━━━━━✌︎㋡
│ ✿ 🎸 Rock - Heavy beats
│ ✿ 🎤 Rap - Hip hop flow
│ ✿ 🎹 Pop - Catchy melodies
│ ✿ 🎧 Electronic - Synth vibes
│ ✿ 🎻 Classical - Orchestra
│ ✿ 🎷 Jazz - Smooth tunes
│ ✿ 🎵 Lo-fi - Chill beats
│ ✿ 🎶 Ambient - Relaxing
│ ✿ ━━━━━━━━━━━━━━━✿
│ ✿ 📌 *Usage Examples:*
│ ✿ .aimusic rock song
│ ✿ .aimusic rap beat
│ ✿ .aimusic lofi chill
│ ✿ .aimusiclyrics [lyrics]
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
        `;

        reply(styles);

    } catch (error) {
        console.error('🌸 MusicStyles Error:', error);
        reply(`🌸 Error: ${error.message} 💕`);
    }
});

console.log('🌸 AI MUSIC GENERATOR plugin loaded! 💖');
