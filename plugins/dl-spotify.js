// ============================================
// 🌸 MEER_xD - SPOTIFY SONG DOWNLOADER
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 📌 Converted from your friend's bot
// ============================================

const { mishu } = require('../mishu');
const axios = require('axios');
const yts = require('yt-search');
const { fakevCard } = require('../lib/fakevCard');

// API Base URL
const DC_BASE = 'https://apis.davidcyriltech.my.id';

mishu({
    pattern: "spotify",
    alias: ["spoti", "spdl", "songsearch", "music"],
    desc: "🌸 Search and download a song as audio",
    category: "download",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text }) => {
    try {
        if (!text) {
            return reply("🌸 Example:\n.spotify Blinding Lights 💕");
        }

        // STEP 1: Search YouTube for the song
        const search = await yts(text + ' audio');
        if (!search.videos.length) {
            return reply(`🌸 No results found for: ${text} 💕`);
        }

        const vid = search.videos[0];
        const videoUrl = vid.url;
        const title = vid.title || text;
        const artist = vid.author?.name || '🌸 Unknown Artist';
        const duration = vid.timestamp || 'N/A';
        const thumbnail = vid.thumbnail || 'https://i.ytimg.com/vi/default/hqdefault.jpg';

        // STEP 2: Send Thumbnail with Details
        const caption = `
╭────────────────────◇
│  ❦ 🎵 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚 ❦
│  ㋡━━━━━━━━━━━━━━━㋡
│ ♡⪼  🎶 ${title}
│ ♡⪼  👩‍🎤 ${artist}
│ ♡⪼  ⏱️ ${duration}
│ ♡⪼. 📥 Processing...
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
        `;

        await mishu.sendMessage(from, {
            image: { url: thumbnail },
            caption: caption
        }, { quoted: fakevCard });

        // STEP 3: Download MP3 via API
        const apiUrl = `${DC_BASE}/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const { data } = await axios.get(apiUrl, { timeout: 35000 });

        const audioUrl = data?.result?.download_url || 
                        data?.result?.downloadUrl || 
                        data?.result?.url || 
                        data?.url || 
                        data?.link || 
                        data?.result?.download?.url;

        if (!audioUrl) {
            throw new Error('Could not retrieve download link');
        }

        // STEP 4: Send Audio
        await mishu.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: fakevCard });

    } catch (err) {
        console.error('🌸 Spotify Error:', err);
        
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            return reply("⏳ API timeout. Please try again. 💕");
        }

        reply(`🌸 Song download failed: ${err.message || 'Unknown error'} 💕`);
    }
});
