// ============================================
// 🌸 LYRICS - MEER_xD
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 📌 Category: Music
// ============================================

const axios = require('axios');
const { mishu } = require('../mishu');
const { fakevCard } = require('../lib/fakevCard');

// API Base URL
const API_BASE = 'https://discardapi.dpdns.org/api/music/lyrics';

mishu({
    pattern: "lyrics",
    alias: ["lyric", "songlyrics", "getlyrics", "lirik", "songtext"],
    desc: "🌸 Get lyrics of a song with artist and image",
    category: "music",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text }) => {
    try {
        // Check if song name provided
        if (!text) {
            const helpMsg = `
╭═══✿══════════════╗
│  ✿ 𝗟𝗬𝗥𝗜𝗖𝗦 𝗙𝗜𝗡𝗗𝗘𝗥 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🎵 Find song lyrics
│  ✿ 👤 Artist & Image included
│  ✿ 💖 Fast & Accurate
╰═══✿══════════════╝

🌸 *Usage:*
• \`.lyrics song name\`

🎀 *Example:*
• \`.lyrics Blinding Lights\`
• \`.lyrics Pasoori\`

💖 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 🌸
            `;
            return reply(helpMsg);
        }

        // Send processing reaction
        await mishu.sendMessage(from, {
            react: { text: "🎵", key: mek.key }
        });

        // ✅ STEP 1: Fetch lyrics from API
        const apiUrl = `${API_BASE}?apikey=qasim&song=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        // Check if lyrics found
        const messageData = data?.result?.message;
        if (!messageData?.lyrics) {
            return reply(`🌸 Sorry, I couldn't find any lyrics for "${text}". 💕`);
        }

        const { artist, lyrics, image, title, url } = messageData;

        // ✅ STEP 2: Clean and format lyrics
        const maxChars = 4000;
        const lyricsOutput = lyrics.length > maxChars 
            ? `${lyrics.slice(0, maxChars - 3)}...` 
            : lyrics;

        // ✅ STEP 3: Create GIRL STYLE caption with details
        const caption = `
╭═══✿══════════════╗
│  ✿ ${title || 'Unknown Song'} ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👩‍🎤 *Artist:* ${artist || 'Unknown Artist'}
│  ✿ 🔗 *URL:* ${url || 'N/A'}
│  ✿ ━━━━━━━━━━━━━━━✿
│  ✿ ${lyricsOutput}
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖
        `.trim();

        // ✅ STEP 4: Send with image if available
        if (image) {
            await mishu.sendMessage(from, {
                image: { url: image },
                caption: caption,
                contextInfo: {
                    mentionedJid: [],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363429164571310@newsletter',
                        newsletterName: '🌸 MEER_xD 🌸',
                        serverMessageId: 143
                    }
                }
            }, { quoted: fakevCard });
        } else {
            // ✅ Send as text if no image
            await mishu.sendMessage(from, {
                text: caption,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363429164571310@newsletter',
                        newsletterName: '🌸 MEER_xD 🌸',
                        serverMessageId: 143
                    }
                }
            }, { quoted: fakevCard });
        }

        // Success reaction
        await mishu.sendMessage(from, {
            react: { text: "💖", key: mek.key }
        });

    } catch (err) {
        console.error('🌸 Lyrics Command Error:', err);
        
        let errorMsg = `🌸 An error occurred while fetching lyrics for "${text}". 💕`;
        
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            errorMsg = "⏳ API timeout. Please try again in a few seconds. 💕";
        } else if (err.response?.status === 404) {
            errorMsg = `🌸 Song "${text}" not found. Please check the spelling. 💕`;
        }
        
        reply(errorMsg);
        await mishu.sendMessage(from, {
            react: { text: "❌", key: mek.key }
        });
    }
});

// ============================================
// 🎀 LYRICS WITH QUICK REPLY
// ============================================
mishu({
    pattern: "lyricsshort",
    alias: ["lshort", "quicklyrics"],
    desc: "🌸 Get quick lyrics (short format)",
    category: "music",
    react: "🎀",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text }) => {
    try {
        if (!text) {
            return reply(`🌸 Please provide a song name!\nExample: .lyricsshort Pasoori 💕`);
        }

        await mishu.sendMessage(from, {
            react: { text: "🎵", key: mek.key }
        });

        const apiUrl = `${API_BASE}?apikey=qasim&song=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        const messageData = data?.result?.message;
        if (!messageData?.lyrics) {
            return reply(`🌸 No lyrics found for "${text}". 💕`);
        }

        const { artist, lyrics, image, title } = messageData;

        const maxChars = 2000;
        const lyricsOutput = lyrics.length > maxChars 
            ? `${lyrics.slice(0, maxChars - 3)}...` 
            : lyrics;

        const caption = `
🌸 *${title || 'Unknown Song'}*
👩‍🎤 ${artist || 'Unknown Artist'}

📝 ${lyricsOutput}

💖 Powered by MEER_xD
        `.trim();

        if (image) {
            await mishu.sendMessage(from, {
                image: { url: image },
                caption: caption
            }, { quoted: fakevCard });
        } else {
            await mishu.sendMessage(from, {
                text: caption
            }, { quoted: fakevCard });
        }

        await mishu.sendMessage(from, {
            react: { text: "💖", key: mek.key }
        });

    } catch (err) {
        console.error('🌸 Quick Lyrics Error:', err);
        reply(`🌸 Error: ${err.message || 'Unknown'} 💕`);
    }
});

// ============================================
// 👑 SAVE LYRICS AS DOCUMENT
// ============================================
mishu({
    pattern: "lyricsdoc",
    alias: ["lyrdoc", "savelyrics"],
    desc: "🌸 Save lyrics as text file",
    category: "music",
    react: "👑",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text }) => {
    try {
        if (!text) {
            return reply(`🌸 Please provide a song name!\nExample: .lyricsdoc Pasoori 💕`);
        }

        await mishu.sendMessage(from, {
            react: { text: "📄", key: mek.key }
        });

        const apiUrl = `${API_BASE}?apikey=qasim&song=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });

        const messageData = data?.result?.message;
        if (!messageData?.lyrics) {
            return reply(`🌸 No lyrics found for "${text}". 💕`);
        }

        const { artist, lyrics, title } = messageData;

        const docContent = `
🌸 LYRICS - ${title || 'Unknown Song'}
👩‍🎤 Artist: ${artist || 'Unknown Artist'}
📅 Date: ${new Date().toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━

${lyrics}

━━━━━━━━━━━━━━━━━━━━━━━━━━

💖 Powered by MEER_xD
👑 Developer: SYED MEER
        `.trim();

        const caption = `
╭═══✿══════════════╗
│  ✿ 𝗟𝗬𝗥𝗜𝗖𝗦 𝗦𝗔𝗩𝗘𝗗 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🎵 ${title || 'Unknown Song'}
│  ✿ 👩‍🎤 ${artist || 'Unknown Artist'}
│  ✿ 📄 Saved as document
│  ✿ 👑 By MEER_xD
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖
        `;

        await mishu.sendMessage(from, {
            document: Buffer.from(docContent, 'utf-8'),
            mimetype: 'text/plain',
            fileName: `Lyrics_${title || 'song'}_${Date.now()}.txt`,
            caption: caption,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429164571310@newsletter',
                    newsletterName: '🌸 MEER_xD 🌸',
                    serverMessageId: 143
                }
            }
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, {
            react: { text: "💖", key: mek.key }
        });

    } catch (err) {
        console.error('🌸 Lyrics Doc Error:', err);
        reply(`🌸 Error: ${err.message || 'Unknown'} 💕`);
    }
});
