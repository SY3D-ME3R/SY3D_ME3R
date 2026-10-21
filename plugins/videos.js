// ============================================
// 🌸 MEER_xD - VIDEO DOWNLOADER
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 📌 Multi-API video downloader with trim support
// ============================================

const { mishu } = require('../mishu');
const config = require('../config');
const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { fakevCard } = require('../lib/fakevCard');

// ============ FFMPEG PATH SET ============
ffmpeg.setFfmpegPath(ffmpegPath);

// ============ TEMP DIRECTORY ============
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// ============================================
// 🎀 GIRL STYLE FORMATTER
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

// ============ APIs (MULTIPLE FALLBACKS) ============
const APIS = {
    arslan: async (url, type) => {
        try {
            const endpoint = type === 'video' ? 'ytmp4' : 'ytmp3';
            const response = await axios.get(`https://arslan-apis-v2.vercel.app/download/${endpoint}`, {
                params: { url: url },
                timeout: 30000
            });
            if (response.data?.status === true && response.data?.result?.download?.url) {
                return {
                    success: true,
                    downloadUrl: response.data.result.download.url,
                    title: response.data.result.metadata?.title || '🌸 Media',
                    quality: response.data.result.metadata?.quality || (type === 'video' ? '360p' : '128kbps')
                };
            }
            return { success: false };
        } catch (e) {
            return { success: false };
        }
    },
    eliteProTech: async (url, type) => {
        try {
            const format = type === 'video' ? 'mp4' : 'mp3';
            const response = await axios.get(`https://eliteprotech-apis.zone.id/ytdown`, {
                params: { url: url, format: format },
                timeout: 30000
            });
            if (response.data?.success && response.data?.downloadURL) {
                return {
                    success: true,
                    downloadUrl: response.data.downloadURL,
                    title: response.data.title || '🌸 Media',
                    quality: type === 'video' ? '720p' : '320kbps'
                };
            }
            return { success: false };
        } catch (e) {
            return { success: false };
        }
    },
    gifted: async (url, type) => {
        try {
            const endpoint = type === 'video' ? 'ytmp4v2' : 'ytmp3v2';
            const response = await axios.get(`https://api.giftedtech.co.ke/api/download/${endpoint}`, {
                params: { apikey: 'gifted', url: url },
                timeout: 30000
            });
            if (response.data?.success && response.data?.result?.download_url) {
                return {
                    success: true,
                    downloadUrl: response.data.result.download_url,
                    title: response.data.result.title || '🌸 Media',
                    quality: response.data.result.quality || (type === 'video' ? '720p' : '320kbps')
                };
            }
            return { success: false };
        } catch (e) {
            return { success: false };
        }
    }
};

// ============ SEARCH VIDEO ============
async function searchVideo(query) {
    const search = await yts(query);
    if (!search.videos || search.videos.length === 0) throw new Error("🌸 No results found! 💕");
    return search.videos[0];
}

// ============ FFMPEG TRIM FUNCTION ============
async function trimVideo(inputPath, outputPath, start, duration) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(start)
            .setDuration(duration)
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', reject)
            .run();
    });
}

// ============================================
// 🎬 MAIN VIDEO COMMAND
// ============================================
mishu({
    pattern: "video",
    alias: ["ytv", "video3", "video2", "video4"],
    desc: "🌸 Download YouTube video",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        if (!args.length) {
            const helpMsg = `
╭═══✿══════════════╗
│  ✿ 🎬 𝗩𝗜𝗗𝗘𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 📝 Usage: .video <name or link>
│  ✿ 🎬 Example: .video jutt gang
│  ✿ 🔗 By Link: .video https://youtu.be/xxxxx
│  ✿ ✂️ Trim: .video <link> trim 00:00:10 00:00:30
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖
            `;
            return reply(helpMsg);
        }

        let query = args.join(" ");
        let trimStart = null;
        let trimDuration = null;
        
        // Check for trim command
        if (args.includes("trim")) {
            const trimIndex = args.indexOf("trim");
            if (args.length > trimIndex + 2) {
                trimStart = args[trimIndex + 1];
                trimDuration = args[trimIndex + 2];
                query = args.slice(0, trimIndex).join(" ");
            }
        }

        await mishu.sendMessage(from, { react: { text: "🌸", key: mek.key } });

        // Get video URL and info
        let videoUrl, videoTitle, videoThumb, videoDuration, videoViews;
        
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            videoUrl = query;
            try {
                const videoId = videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/)?.[1];
                if (videoId) {
                    const search = await yts({ videoId });
                    if (search) {
                        videoTitle = search.title;
                        videoThumb = search.thumbnail;
                        videoDuration = search.timestamp;
                        videoViews = search.views;
                    }
                }
            } catch(e) {}
        } else {
            const searchResult = await searchVideo(query);
            videoUrl = searchResult.url;
            videoTitle = searchResult.title;
            videoThumb = searchResult.thumbnail;
            videoDuration = searchResult.timestamp;
            videoViews = searchResult.views;
        }

        if (!videoTitle) videoTitle = "🌸 Video";

        // ============ SEND THUMBNAIL WITH GIRL STYLE ============
        if (videoThumb) {
            const thumbnailCaption = girlBox('🎬 VIDEO INFO', [
                ['🎬', 'Title', videoTitle.substring(0, 60) + (videoTitle.length > 60 ? '...' : '')],
                ['⏱️', 'Duration', videoDuration || 'Unknown'],
                ['👁️', 'Views', videoViews || 'N/A'],
                ['⏳', 'Status', 'Processing...']
            ]);
            await mishu.sendMessage(from, {
                image: { url: videoThumb },
                caption: thumbnailCaption
            }, { quoted: fakevCard });
        }

        // Try APIs in order
        let result = null;
        for (const [name, apiFn] of Object.entries(APIS)) {
            try {
                console.log(`🌸 [VIDEO] Trying ${name}...`);
                result = await apiFn(videoUrl, 'video');
                if (result.success && result.downloadUrl) {
                    console.log(`🌸 [VIDEO] ✅ ${name} success`);
                    break;
                }
            } catch(e) {}
        }

        if (!result || !result.downloadUrl) throw new Error("🌸 All APIs failed! 💕");

        let finalVideoUrl = result.downloadUrl;
        let finalTitle = result.title || videoTitle;
        
        // If trim requested, download and process with ffmpeg
        if (trimStart && trimDuration) {
            await mishu.sendMessage(from, { react: { text: "✂️", key: mek.key } });
            
            const tempInput = path.join(tempDir, `input_${Date.now()}.mp4`);
            const tempOutput = path.join(tempDir, `output_${Date.now()}.mp4`);
            
            const writer = fs.createWriteStream(tempInput);
            const response = await axios({ url: finalVideoUrl, method: 'GET', responseType: 'stream' });
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            await trimVideo(tempInput, tempOutput, trimStart, trimDuration);
            
            const caption = girlBox('✂️ TRIMMED VIDEO', [
                ['🎬', 'Title', finalTitle.substring(0, 60) + (finalTitle.length > 60 ? '...' : '')],
                ['✂️', 'Trim', `${trimStart} to ${trimDuration}`],
                ['🎚️', 'Quality', result.quality || 'HD'],
                ['⏱️', 'Duration', videoDuration || 'Unknown'],
                ['✅', 'Status', 'Done!']
            ]);

            await mishu.sendMessage(from, {
                video: { url: tempOutput },
                mimetype: 'video/mp4',
                caption: caption
            }, { quoted: fakevCard });
            
            // Cleanup
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        } else {
            const caption = girlBox('🎬 VIDEO', [
                ['🎬', 'Title', finalTitle.substring(0, 60) + (finalTitle.length > 60 ? '...' : '')],
                ['🎚️', 'Quality', result.quality || 'HD'],
                ['⏱️', 'Duration', videoDuration || 'Unknown'],
                ['👁️', 'Views', videoViews || 'N/A'],
                ['✅', 'Status', 'Downloaded!']
            ]);

            await mishu.sendMessage(from, {
                video: { url: finalVideoUrl },
                mimetype: 'video/mp4',
                caption: caption
            }, { quoted: fakevCard });
        }

        await mishu.sendMessage(from, { react: { text: "💖", key: mek.key } });

    } catch (err) {
        console.error('🌸 Video Error:', err);
        const errorMsg = girlBox('❌ VIDEO ERROR', [
            ['❌', 'Error', err.message || 'Download failed'],
            ['🔄', 'Status', 'Please try again']
        ]);
        reply(errorMsg);
        await mishu.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

// ============================================
// 📄 VIDEO AS DOCUMENT
// ============================================
mishu({
    pattern: "videodoc",
    alias: ["vdoc", "docvideo"],
    desc: "🌸 Download video as document file",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        if (!args.length) {
            return reply(`🌸 Provide song name or link!\nExample: .vdoc Imagine Dragons Believer 💕`);
        }
        
        let query = args.join(" ");
        await mishu.sendMessage(from, { react: { text: "🌸", key: mek.key } });

        let videoUrl, videoTitle;
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            videoUrl = query;
        } else {
            const searchResult = await searchVideo(query);
            videoUrl = searchResult.url;
            videoTitle = searchResult.title;
        }

        let result = null;
        for (const [name, apiFn] of Object.entries(APIS)) {
            try {
                result = await apiFn(videoUrl, 'video');
                if (result.success && result.downloadUrl) break;
            } catch(e) {}
        }
        
        if (!result || !result.downloadUrl) throw new Error("🌸 Download failed! 💕");

        const finalTitle = result.title || videoTitle || '🌸 video';
        const safeFileName = finalTitle.replace(/[^\w\s-]/g, '').substring(0, 50);
        
        const { data: videoBuffer } = await axios.get(result.downloadUrl, { responseType: 'arraybuffer' });

        const caption = girlBox('📄 VIDEO DOCUMENT', [
            ['🎬', 'Title', finalTitle.substring(0, 60) + (finalTitle.length > 60 ? '...' : '')],
            ['🎚️', 'Quality', result.quality || 'HD'],
            ['✅', 'Status', 'Downloaded!']
        ]);
        
        await mishu.sendMessage(from, {
            document: Buffer.from(videoBuffer),
            mimetype: 'video/mp4',
            fileName: `${safeFileName}.mp4`,
            caption: caption
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: "💖", key: mek.key } });

    } catch (err) {
        console.error('🌸 Video Doc Error:', err);
        const errorMsg = girlBox('❌ DOC ERROR', [
            ['❌', 'Error', err.message || 'Download failed'],
            ['🔄', 'Status', 'Please try again']
        ]);
        reply(errorMsg);
        await mishu.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});

console.log('🌸 MEER_xD - Video plugin loaded! 💖');
