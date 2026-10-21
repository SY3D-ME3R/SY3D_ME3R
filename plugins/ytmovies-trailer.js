// ============================================
// 🌸 MEER_xD - MOVIE DOWNLOADER (API BASED)
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 🔧 NO PUPPETEER - Uses simple API
// ============================================

const axios = require('axios');
const { mishu } = require('../mishu');
const { fakevCard } = require('../lib/fakevCard');

// ============================================
// 🎀 WAIT FOR USER REPLY
// ============================================
function waitForReply(mishu, from, messageId, timeout = 60000) {
    return new Promise((resolve) => {
        const handler = async (msgData) => {
            try {
                const msg = msgData.messages[0];
                if (!msg || !msg.message) return;

                const sender = msg.key.remoteJid;
                if (sender !== from) return;

                const quoted = msg.message.extendedTextMessage?.contextInfo?.stanzaId;
                const isReply = quoted === messageId;

                const text = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || '';

                if (isReply || text) {
                    resolve(msg);
                    mishu.ev.off('messages.upsert', handler);
                }
            } catch (e) {
                console.error('🌸 waitForReply Error:', e);
            }
        };

        mishu.ev.on('messages.upsert', handler);

        setTimeout(() => {
            mishu.ev.off('messages.upsert', handler);
            resolve(null);
        }, timeout);
    });
}

// ============================================
// 🎬 MOVIE SEARCH (Using API)
// ============================================
mishu({
    pattern: "ytmovietrailer",
    alias: ["ytfilmtrailer", "ytmoviestrailer", "ytmt", "trailer", "youtubemoviestrailer"],
    desc: "🌸 Search and download movies as document",
    category: "media",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text, pushname }) => {
    try {
        if (!text) {
            return reply(`🌸 *Movie Downloader* 💖

╭═══✿══════════════╗
│  ✿ 🎬 𝗛𝗢𝗪 𝗧𝗢 𝗨𝗦𝗘 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 1️⃣ \`.movietrailer Avenger\`
│  ✿ 2️⃣ \`.filmtrailer 2026\`
│  ✿ ━━━━━━━━━━━━━━━✿
│  ✿ 📌 After results, reply:
│  ✿ ¹ - First Movie Trailer 
│  ✿ ² - Second Movie Trailer 
│  ✿ ━━━━━━━━━━━━━━━✿
│  ✿ 📌 Movie will be sent as *DOCUMENT*
╰═══✿══════════════╝

💖 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 🌸`);
        }

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        // 🔥 SEARCH MOVIES USING YTS (NO PUPPETEER)
        const yts = require('yt-search');
        const searchResults = await yts(text + ' movie trailer');

        if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
            return reply(`🌸 No movies found for *"${text}"*! 💕\n\nTry different keywords.`);
        }

        // 🔥 Show results (max 10)
        const movieList = searchResults.videos.slice(0, 10);
        let listText = `🌸 *Search Results for: ${text}*\n╭═══✿══════════════╗\n`;

        movieList.forEach((movie, index) => {
            const emoji = ['🌸', '💖', '✨', '🎀', '💕', '💝', '🌺', '🦋', '👑', '💗'][index] || '🎬';
            listText += `│  ✿ ${emoji} *${index + 1}.* ${movie.title}\n`;
            listText += `│  ✿    ⭐ ${movie.views || 'N/A'}\n`;
        });

        listText += `╰═══✿══════════════╝

🌸 Reply with a *number* (1-${Math.min(movieList.length, 10)}) to download as DOCUMENT!

💖 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 🌸`;

        const sentMsg = await mishu.sendMessage(from, {
            image: { url: 'https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png' },
            caption: listText
        }, { quoted: fakevCard });

        // 🔥 Wait for user reply
        const replyMsg = await waitForReply(mishu, from, sentMsg.key.id, 60000);

        if (!replyMsg) {
            return reply(`🌸 Timeout! Please search again. 💕`);
        }

        const replyText = replyMsg.message.conversation || 
                         replyMsg.message.extendedTextMessage?.text || '';
        const num = parseInt(replyText.trim());

        if (isNaN(num) || num < 1 || num > movieList.length) {
            return reply(`🌸 Invalid number! Please reply with 1-${movieList.length}. 💕`);
        }

        const selectedMovie = movieList[num - 1];

        await mishu.sendMessage(from, { react: { text: '💖', key: replyMsg.key } });

        // 🔥 DOWNLOAD VIDEO FROM YOUTUBE
        const BASE = 'https://arslan-apis-v2.vercel.app';
        const apiUrl = `${BASE}/download/ytmp4?url=${encodeURIComponent(selectedMovie.url)}`;
        
        const dlMsg = await mishu.sendMessage(from, {
            text: `╭═══✿══════════════╗
│  ✿ 📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🎬 ${selectedMovie.title.substring(0, 30)}...
│  ✿ ⏳ Processing...
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`
        }, { quoted: replyMsg });

        const { data } = await axios.get(apiUrl, { timeout: 60000 });

        const downloadUrl = data?.result?.download_url || 
                           data?.result?.downloadUrl || 
                           data?.result?.url || 
                           data?.url || 
                           data?.link || 
                           data?.result?.download?.url;

        if (!downloadUrl) {
            await mishu.sendMessage(from, { delete: dlMsg.key });
            return reply(`🌸 Could not retrieve download link! 💕`);
        }

        // 🔥 Download file
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'arraybuffer',
            timeout: 300000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        if (!response.data) {
            await mishu.sendMessage(from, { delete: dlMsg.key });
            return reply(`🌸 Failed to download movie! 💕`);
        }

        const fileBuffer = Buffer.from(response.data);
        const fileSize = (fileBuffer.length / 1024 / 1024).toFixed(2);
        const fileName = `${selectedMovie.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;

        await mishu.sendMessage(from, { delete: dlMsg.key });

        // 🔥 Send as DOCUMENT
        const docCaption = `╭═══✿══════════════╗
│  ✿ ✅ 𝗠𝗢𝗩𝗜𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🎬 ${selectedMovie.title.substring(0, 40)}
│  ✿ 💾 ${fileSize} MB
│  ✿ 📄 Sent as Document
│  ✿ 👑 By MEER_xD
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

        await mishu.sendMessage(from, {
            document: fileBuffer,
            mimetype: "video/mp4",
            fileName: fileName,
            caption: docCaption,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429164571310@newsletter',
                    newsletterName: '🌸 MEER_xD 🌸',
                    serverMessageId: 143
                }
            }
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: '💖', key: replyMsg.key } });

    } catch (err) {
        console.error('🌸 Movie Error:', err);
        
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            return reply("⏳ API timeout. Please try again later. 💕");
        }

        reply(`🌸 Movie download failed: ${err.message || 'Unknown error'} 💕`);
    }
});

console.log('🌸 MEER_xD - Movie Downloader (API Based) loaded! 💖');
