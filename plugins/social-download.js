// ============================================
// 🌸 DOWNLOAD COMMANDS - MEER_xD
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// ============================================

const { mishu } = require('../mishu');
const axios = require('axios');
const { fakevCard } = require('../lib/fakevCard');
const config = require('../config');

// ============================================
// 📌 API
// ============================================
const API_URL = 'https://arslan-apis.zone.id/download/mfire';

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
// 📘 FACEBOOK DOWNLOAD
// ============================================
mishu({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    desc: "🌸 Download Facebook video",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply(
                "🌸 Please provide a Facebook video link.\n\n" +
                "Example: .fb https://facebook.com/xxxx 💕"
            );
        }

        // Facebook URL check
        if (
            !q.includes("facebook.com") &&
            !q.includes("fb.watch")
        ) {
            return reply("🌸 Valid Facebook URL nahi hai 💕");
        }

        await mishu.sendMessage(from, {
            react: {
                text: "🌸",
                key: mek.key
            }
        });

        // New Facebook Downloader API
        const api =
            `https://arslan-apis-v2.vercel.app/download/fbdown?url=${encodeURIComponent(q)}`;

        const { data } = await axios.get(api, {
            timeout: 60000,
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        // API response check
        if (
            !data ||
            data.status !== true ||
            !data.result ||
            data.result.status !== true
        ) {
            return reply(
                "🌸 Facebook video fetching Error 💕"
            );
        }

        const result = data.result;
        const download = result.download || {};
        const metadata = result.metadata || {};

        // Prefer HD, fallback to SD, then 480p
        const videoUrl =
            download.hd ||
            download.sd ||
            download.p480 ||
            null;

        // No download URL
        if (!videoUrl) {
            return reply(
                "🌸 Facebook video ka download link nahi mila 💕"
            );
        }

        // Quality detect
        let quality = "SD";

        if (download.hd && videoUrl === download.hd) {
            quality = "720p HD";
        } else if (download.p480 && videoUrl === download.p480) {
            quality = "480p";
        } else if (download.sd && videoUrl === download.sd) {
            quality = "360p SD";
        }

        // Caption
        const caption =
            `🌸 *Facebook Video*\n\n` +
            `🎬 *Quality:* ${quality}\n` +
            `⏱ *Duration:* ${metadata.duration || "N/A"}\n\n` +
            `👑 *Powered by MEER_xD*`;

        // Send video
        await mishu.sendMessage(
            from,
            {
                video: {
                    url: videoUrl
                },
                mimetype: "video/mp4",
                caption: caption,

                contextInfo: {
                    externalAdReply: {
                        title:
                            metadata.title ||
                            "Facebook Video",

                        body:
                            "Facebook Downloader",

                        thumbnailUrl:
                            metadata.thumbnail ||
                            undefined,

                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            {
                quoted: fakevCard
            }
        );

        // Success reaction
        await mishu.sendMessage(from, {
            react: {
                text: "💖",
                key: mek.key
            }
        });

    } catch (err) {
        console.error(
            "🌸 FB-DL ERROR:",
            err.response?.data || err.message || err
        );

        return reply(
            "🌸 Error aagaya, thori dair baad try karo 💕"
        );
    }
});
// ============================================
// 📥 IGDL - MAIN DOWNLOADER
// ============================================
mishu({
    pattern: "igdl",
    alias: ["instagram", "insta", "ig"],
    desc: "🌸 Download Instagram videos/reels",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, q, reply }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) {
            return reply("🌸 Please provide/reply to an Instagram link 💕");
        }

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data.data?.length) {
            await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("🌸 Failed to fetch media. Invalid link or private content. 💕");
        }

        for (const item of response.data.data) {
            await mishu.sendMessage(from, {
                [item.type === 'video' ? 'video' : 'image']: { url: item.url },
                caption: `╭═══✿══════════════╗\n| 🌸 *Instagram Downloader*\n| ✿━━━━━━━━━━━━━━━✿\n| 👑 Powered by MEER_xD\n╰═══✿══════════════╝`
            }, { quoted: fakevCard });
        }

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 IGDL Error:', error);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("🌸 Download failed. Try again later. 💕");
    }
});

// ============================================
// 📥 IGDL4 - ALTERNATIVE API
// ============================================
mishu({
    pattern: "igdl4",
    alias: ["instagram4", "insta4", "ig4", "igvideo4"],
    desc: "🌸 Download Instagram videos (Alternative API)",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        const igUrl = args[0] || m.quoted?.text;
        if (!igUrl || !igUrl.includes("instagram.com")) {
            return reply('🌸 Please provide a valid Instagram URL.\nExample: .igdl4 https://instagram.com/... 💕');
        }

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const apiUrl = `https://bk9.fun/download/instagram?url=${encodeURIComponent(igUrl)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data?.BK9?.[0]?.url) {
            await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply('🌸 Unable to fetch the video. Try .igdl for primary download. 💕');
        }

        const videoUrl = response.data.BK9[0].url;
        const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        if (!videoResponse.data) {
            await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply('🌸 Failed to download the video. Please try again later. 💕');
        }

        const videoBuffer = Buffer.from(videoResponse.data, 'binary');

        await mishu.sendMessage(from, {
            video: videoBuffer,
            caption: `🌸 *Instagram Downloader*\n\n👑 Powered by MEER_xD`
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 IGDL4 Error:', error);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply('🌸 API failed. Try .igdl for primary download. 💕');
    }
});

// ============================================
// 📥 IGDL2 - API V5
// ============================================
mishu({
    pattern: "igdl2",
    alias: ["instagram2", "ig2", "instadl2"],
    desc: "🌸 Download Instagram videos (API v5)",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        const igUrl = args[0] || m.quoted?.text;
        if (!igUrl || !igUrl.includes("instagram.com")) {
            return reply('🌸 Please provide a valid Instagram URL.\n\nExample: .igdl2 https://instagram.com/reel/... 💕');
        }

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(igUrl)}`;
        const response = await axios.get(apiUrl);

        const data = response.data;

        if (!data.status || !data.result || !Array.isArray(data.result)) {
            return reply('🌸 Unable to fetch the video. Please check the URL and try again. 💕');
        }

        const videoUrl = data.result[0];
        if (!videoUrl) return reply("🌸 No video found in the response. 💕");

        const metadata = data.metadata || {};
        const author = metadata.author || "Unknown";
        const caption = metadata.caption ? metadata.caption.slice(0, 300) + "..." : "No caption provided.";
        const likes = metadata.like || 0;
        const comments = metadata.comment || 0;

        await reply('🌸 Uploading your video... Please wait 💕');

        await mishu.sendMessage(from, {
            video: { url: videoUrl },
            caption: `🌸 *Instagram Reel Downloader*\n👤 *Author:* ${author}\n💬 *Caption:* ${caption}\n❤️ *Likes:* ${likes} | 💭 *Comments:* ${comments}\n\n👑 Powered by MEER_xD`
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 IGDL2 Error:', error);
        reply('🌸 Failed to download the Instagram video. Please try again later. 💕');
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

// ============================================
// 📥 IG3 - SIMPLE DOWNLOADER
// ============================================
mishu({
    pattern: "ig3",
    alias: ["insta3", "instagram3"],
    desc: "🌸 Download Instagram video (Simple)",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("🌸 Please provide an Instagram video link. 💕");
        if (!q.includes("instagram.com")) return reply("🌸 Invalid Instagram link. 💕");

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        reply("🌸 Downloading video, please wait... 💕");

        const apiUrl = `https://rest-lily.vercel.app/api/downloader/igdl?url=${q}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data || !data.data[0]) return reply("🌸 Failed to fetch Instagram video. 💕");

        const { url } = data.data[0];

        await mishu.sendMessage(from, {
            video: { url: url },
            caption: `🌸 *Instagram Downloader*\n\n👑 Powered by MEER_xD`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: fakevCard });

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (e) {
        console.error("🌸 IG3 Error:", e);
        reply(`🌸 Error: ${e.message} 💕`);
    }
});
// ============================================
// 🎵 TIKTOK DOWNLOAD
// ============================================
mishu({
    pattern: "tiktok",
    alias: ["ttdl", "tiktokdl", "tt"],
    desc: "🌸 Download TikTok videos",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        const tiktokUrl = args[0] || m.quoted?.text;
        if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
            return reply('🌸 Please provide a valid TikTok video URL.\nExample: .tiktok https://tiktok.com/... 💕');
        }

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const apiUrl = `https://api.nexoracle.com/downloader/tiktok-nowm?apikey=free_key@maher_apis&url=${encodeURIComponent(tiktokUrl)}`;
        const response = await axios.get(apiUrl);

        if (!response.data || response.data.status !== 200 || !response.data.result) {
            return reply('🌸 Unable to fetch the video. Please check the URL and try again. 💕');
        }

        const { title, thumbnail, author, metrics, url } = response.data.result;

        await reply(`🌸 Downloading TikTok video by @${author.username}... Please wait 💕`);

        const videoResponse = await axios.get(url, { responseType: 'arraybuffer' });
        if (!videoResponse.data) {
            return reply('🌸 Failed to download the video. Please try again later. 💕');
        }

        const videoBuffer = Buffer.from(videoResponse.data, 'binary');

        await mishu.sendMessage(from, {
            video: videoBuffer,
            caption: `🌸 *TikTok Video*\n\n🔖 *Title*: ${title || "No title"}\n👤 *Author*: @${author.username} (${author.nickname})\n❤️ *Likes*: ${metrics.digg_count}\n💬 *Comments*: ${metrics.comment_count}\n🔁 *Shares*: ${metrics.share_count}\n📥 *Downloads*: ${metrics.download_count}\n\n👑 Powered by MEER_xD`,
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

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 TikTok Error:', error);
        reply('🌸 Unable to download the video. Please try again later. 💕');
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
// ============================================
// 📦 MEDIAFIRE2 - MAIN DOWNLOADER
// ============================================
mishu({
    pattern: "mediafire2",
    alias: ["mfire2", "mfdownload2"],
    desc: "🌸 Download files from MediaFire",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        const mediafireUrl = args[0] || m.quoted?.text;
        if (!mediafireUrl || !mediafireUrl.includes("mediafire.com")) {
            return reply('🌸 Please provide a valid MediaFire URL.\nExample: .mediafire2 https://mediafire.com/... 💕');
        }

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const apiUrl = `https://velyn.vercel.app/api/downloader/mediafire?url=${encodeURIComponent(mediafireUrl)}`;
        const response = await axios.get(apiUrl);

        if (!response.data || !response.data.status || !response.data.data) {
            return reply('🌸 Unable to fetch the file. Please check the URL and try again. 💕');
        }

        const { filename, size, mimetype, link } = response.data.data;

        await reply(`🌸 Downloading ${filename} (${size})... Please wait 💕`);

        const fileResponse = await axios.get(link, { responseType: 'arraybuffer' });
        if (!fileResponse.data) {
            return reply('🌸 Failed to download the file. Please try again later. 💕');
        }

        const fileBuffer = Buffer.from(fileResponse.data, 'binary');

        if (mimetype.startsWith('image')) {
            await mishu.sendMessage(from, {
                image: fileBuffer,
                caption: `🌸 *File Details*\n\n🔖 *Name*: ${filename}\n📏 *Size*: ${size}\n\n👑 Powered by MEER_xD`,
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
        } else if (mimetype.startsWith('video')) {
            await mishu.sendMessage(from, {
                video: fileBuffer,
                caption: `🌸 *File Details*\n\n🔖 *Name*: ${filename}\n📏 *Size*: ${size}\n\n👑 Powered by MEER_xD`,
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
        } else {
            await mishu.sendMessage(from, {
                document: fileBuffer,
                mimetype: mimetype,
                fileName: filename,
                caption: `🌸 *File Details*\n\n🔖 *Name*: ${filename}\n📏 *Size*: ${size}\n\n👑 Powered by MEER_xD`,
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
        }

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 MediaFire2 Error:', error);
        reply('🌸 Unable to download the file. Please try again later. 💕');
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
// ============================================
// 📥 MEDIAFIRE DOWNLOAD COMMAND
// ============================================
mishu({
    pattern: "mediafire",
    alias: ["mfire", "media"],
    desc: "🌸 Download files from MediaFire",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply('🌸 Please provide a MediaFire URL.\nExample: .mediafire https://www.mediafire.com/... 💕');
        }

        // ── Loading Reaction ──
        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        // ── API Call ──
        const apiUrl = `${API_URL}?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        // ── Check Response ──
        if (!response.data || !response.data.status) {
            return reply('🌸 Unable to fetch the file. Please try again later. 💕');
        }

        const { fileName, fileType, size, date, dl_link } = response.data.result;

        if (!dl_link) {
            return reply('🌸 No download link found. Please try again later. 💕');
        }

        // ── Downloading Message ──
        await reply(`🌸 Downloading ${fileName || 'file'}... 💕`);

        // ── Download File ──
        const fileResponse = await axios.get(dl_link, { responseType: 'arraybuffer' });
        if (!fileResponse.data) {
            return reply('🌸 Failed to download the file. Please try again later. 💕');
        }

        // ── Send to User ──
        await mishu.sendMessage(from, {
            document: fileResponse.data,
            mimetype: fileType || 'application/octet-stream',
            fileName: fileName || 'mediafire_file',
            caption: `🌸 *File Details*\n\n📂 *Name*: ${fileName || 'N/A'}\n📦 *Size*: ${size || 'N/A'}\n📅 *Upload Date*: ${date || 'N/A'}\n\n👑 Powered by MEER_xD`,
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

        // ── Send to Channel/Newsletter ──
        try {
            const channelText = `
╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│ 📥 *MediaFire Download*
│ 📄 *File:* ${fileName || 'N/A'}
│ 📦 *Size:* ${size || 'N/A'}
│ 📅 *Date:* ${date || 'N/A'}
│ 🔗 *Source:* ${q}
╰────────────────────○
> 🦋⃟ MEER_xD🦋⃟‌💙
            `.trim();

            await mishu.sendMessage('120363429164571310@newsletter', {
                text: channelText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });

            await mishu.sendMessage('120363429164571310@newsletter', {
                document: fileResponse.data,
                mimetype: fileType || 'application/octet-stream',
                fileName: fileName || 'mediafire_file',
                caption: `📥 ${fileName || 'N/A'} | ${size || 'N/A'}`
            });

            console.log('🌸 File sent to channel');
        } catch (channelError) {
            console.error('🌸 Channel send error:', channelError.message);
        }

        // ── Reaction ──
        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 MediaFire Error:', error);
        reply('🌸 Unable to download the file. Please try again later. 💕');
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
// ============================================
// 📦 APK DOWNLOAD
// ============================================
mishu({
    pattern: "apk",
    alias: ["modapk", "apkdownload"],
    desc: "🌸 Download APK files",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        const appName = args.join(" ");
        if (!appName) {
            return reply('🌸 Please provide an app name.\nExample: .apk whatsapp 💕');
        }

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const apiUrl = `https://api.nexoracle.com/downloader/apk`;
        const params = {
            apikey: 'free_key@maher_apis',
            q: appName,
        };

        const response = await axios.get(apiUrl, { params });

        if (!response.data || response.data.status !== 200 || !response.data.result) {
            return reply('🌸 Unable to find the APK. Please try again later. 💕');
        }

        const { name, lastup, package, size, icon, dllink } = response.data.result;

        await mishu.sendMessage(from, {
            image: { url: icon },
            caption: `🌸 Downloading ${name}... Please wait 💕`,
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

        const apkResponse = await axios.get(dllink, { responseType: 'arraybuffer' });
        if (!apkResponse.data) {
            return reply('🌸 Failed to download the APK. Please try again later. 💕');
        }

        const apkBuffer = Buffer.from(apkResponse.data, 'binary');

        const message = `🌸 *APK Details*\n\n🔖 *Name*: ${name}\n📅 *Last Update*: ${lastup}\n📦 *Package*: ${package}\n📏 *Size*: ${size}\n\n👑 Powered by MEER_xD`;

        await mishu.sendMessage(from, {
            document: apkBuffer,
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${name}.apk`,
            caption: message,
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

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 APK Error:', error);
        reply('🌸 Unable to fetch APK details. Please try again later. 💕');
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
mishu({
    pattern: "pindl",
    alias: ["pinterestdl", "pin", "pins", "pindownload"],
    desc: "🌸 Download media from Pinterest",
    category: "download",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply }) => {
    try {
        if (args.length < 1) {
            return reply('🌸 Please provide the Pinterest URL to download from. 💕');
        }

        const pinterestUrl = args[0];

        await mishu.sendMessage(from, { react: { text: '🌸', key: mek.key } });

        const response = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(pinterestUrl)}`);

        if (!response.data.success) {
            return reply('🌸 Failed to fetch data from Pinterest. 💕');
        }

        const media = response.data.result.media;
        const title = response.data.result.title || 'No title available';

        const videoUrl = media.find(item => item.type.includes('720p'))?.download_url || media[0]?.download_url;

        const desc = `🌸 *Pinterest Downloader*\n\n📝 *Title*: ${title}\n📸 *Type*: ${media[0]?.type || 'N/A'}\n\n👑 Powered by MEER_xD`;

        if (videoUrl) {
            await mishu.sendMessage(from, { video: { url: videoUrl }, caption: desc }, { quoted: fakevCard });
        } else {
            const imageUrl = media.find(item => item.type === 'Thumbnail')?.download_url;
            if (imageUrl) {
                await mishu.sendMessage(from, { image: { url: imageUrl }, caption: desc }, { quoted: fakevCard });
            } else {
                return reply('🌸 No media found to download. 💕');
            }
        }

        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (e) {
        console.error("🌸 Pinterest Error:", e);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`🌸 Error: ${e.message} 💕`);
    }
});

console.log('🌸 MEER_xD - Download plugins loaded! 💖');
