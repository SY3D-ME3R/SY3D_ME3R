const axios = require('axios');
const yts = require('yt-search');
const { mishu } = require('../mishu');
const { fakevCard } = require('../lib/fakevCard');

// API Base URL
const BASE = 'https://apis.davidcyriltech.my.id';

mishu({
    pattern: "audio",
    alias: ["mp3", "song", "gana", "play", "ytmp3", "ytaudio", "playaudio", "music", "melody"],
    desc: "🌸 Download YouTube Audio as MP3",
    category: "download",
    react: "🎵",
    filename: __filename
},
async (mishu, mek, m, { from, reply, text, pushname }) => {
    try {
        if (!text) {
            return reply("🌸 Example:\n.audio pasoori\n.audio https://youtu.be/xxx");
        }

        let videoUrl, title, artist, duration, thumbnail, views;

        // Check if input is a YouTube URL
        const isUrl = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(text);

        if (isUrl) {
            videoUrl = text;
            
            try {
                const infoApi = `${BASE}/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
                const { data } = await axios.get(infoApi, { timeout: 15000 });
                
                title = data?.result?.metadata?.title || '🎵 Audio';
                artist = data?.result?.metadata?.channel || '🌸 Unknown Artist';
                duration = data?.result?.metadata?.duration || '';
                thumbnail = data?.result?.metadata?.thumbnail || 'https://i.ytimg.com/vi/default/hqdefault.jpg';
                views = data?.result?.metadata?.views || '';
            } catch (err) {
                const search = await yts(text);
                if (search?.videos?.length) {
                    const vid = search.videos[0];
                    title = vid.title;
                    artist = vid.author?.name || '🌸 Unknown Artist';
                    duration = vid.timestamp || '';
                    thumbnail = vid.thumbnail;
                    views = vid.views || '';
                }
            }
        } else {
            const search = await yts(text);
            if (!search.videos.length) {
                return reply("🌸 No audio found. Please try another song! 💕");
            }

            const vid = search.videos[0];
            videoUrl = vid.url;
            title = vid.title;
            artist = vid.author?.name || '🌸 Unknown Artist';
            duration = vid.timestamp || '';
            thumbnail = vid.thumbnail;
            views = vid.views || '';
        }

        // ✨ STEP 1: Send ONLY Thumbnail with Details (NO extra message)
        const caption = `
╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│ ♡⪼ 🎵 ${title.slice(0, 30)}${title.length > 30 ? '...' : ''}
│ ♡⪼ 👩‍🎤 ${artist}
│ ♡⪼ ⏱️ ${duration || 'Unknown'}
│ ♡⪼ 👁️ ${views || 'N/A'} views
│ ♡⪼ 📥 Processing...
╰────────────────────○
> 🦋⃟ MEER_xD 🦋⃟‌💙࿐
        `;

        // Send ONLY the thumbnail with caption - NO buttons, NO extra messages
        await mishu.sendMessage(from, {
            image: { url: thumbnail || 'https://files.catbox.moe/6a48t4.png' },
            caption: caption
        }, { quoted: fakevCard });

        // ✅ STEP 2: Download Audio via API
        const apiUrl = `${BASE}/download/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const { data } = await axios.get(apiUrl, { timeout: 60000 });

        const downloadUrl = data?.result?.download_url || 
                           data?.result?.downloadUrl || 
                           data?.result?.url || 
                           data?.url || 
                           data?.link || 
                           data?.result?.download?.url;

        if (!downloadUrl) {
            throw new Error('🌸 Could not retrieve download link. Please try again! 💕');
        }

        // ✅ STEP 3: Send ONLY Audio (NO caption, NO extra message)
        await mishu.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: fakevCard });

        // ❌ NO reply(), NO sendButtons(), NO extra messages!

    } catch (err) {
        console.error('🌸 Audio Error:', err);
        
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            return reply("⏳ API timeout. Please try again later. 💕");
        }

        // Only send error if something goes wrong
        reply(`🌸 Audio download failed: ${err.message || 'Unknown error'} 💕`);
    }
});
