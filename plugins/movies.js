// ============================================
// 🎬 MP4MOVIEZ - TAP TO SELECT WITH INTERACTIVE BUTTONS
// 👑 Developer: SYED MEER
// 🔥 FIXED: LIST RESPONSE HANDLER
// 💖 Search → Single Select → Details → Download
// ============================================

const { mishu, commands } = require('../mishu');
const { sendInteractiveMessage } = require('gifted-btns');
const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");
const sharp = require("sharp");
const config = require('../config');

// ============================================
// 📌 CONFIG
// ============================================
const BASE_URL = "https://www.mp4moviez.ad";
let isDownloading = false;

// ============================================
// 📌 HELPERS
// ============================================
async function getThumbnailBuffer(url) {
    if (!url) return null;
    try {
        const { data } = await axios.get(url, { responseType: "arraybuffer" });
        return await sharp(data).resize(300, 300).jpeg({ quality: 80 }).toBuffer();
    } catch {
        return null;
    }
}

// ============================================
// 🎬 MAIN COMMAND - WITH INTERACTIVE BUTTONS
// ============================================
mishu({
    pattern: "movie",
    alias: ["mp4moviez", "film", "moviez", "mp4m", "searchmovie", "movies"],
    desc: "🎬 Search and download movies from Mp4Moviez",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply, text, pushname }) => {
    const query = text.trim();
    if (!query) return reply("🔎 *Please provide a movie name!*\n\nExample: .movie Animal");

    try {
        // ── Reactions ──────────────────────────────────────────
        const reactions = ['⏳', '🔄', '🔍'];
        for (const emoji of reactions) {
            await mishu.sendMessage(from, { react: { text: emoji, key: mek.key } }).catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // ── 1. SEARCH PHASE ──
        const SEARCH_URL = `${BASE_URL}/search/${encodeURIComponent(query)}.html`;
        const { data } = await axios.get(SEARCH_URL, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);
        const results = [];

        $("body > div").each((i, el) => {
            const aTag = $(el).find("a").first();
            const href = aTag.attr("href");
            const title = aTag.find("div > div:nth-child(2)").text().trim();

            if (href && title) {
                results.push({
                    title: title,
                    link: new URL(href, BASE_URL).href
                });
            }
        });

        if (!results.length) {
            await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ No movies found. Please try different keywords.");
        }

        // ── 2. BUILD SEARCH SECTIONS ──
        const sections = [];
        const chunkSize = 5;
        for (let i = 0; i < Math.min(results.length, 15); i += chunkSize) {
            const chunk = results.slice(i, i + chunkSize);
            sections.push({
                title: `📽️ Movies ${i + 1}-${Math.min(i + chunkSize, results.length)}`,
                rows: chunk.map((movie, idx) => ({
                    title: movie.title.substring(0, 45) + (movie.title.length > 45 ? '...' : ''),
                    description: `🎬 Tap to select`,
                    id: `movie_${i + idx}`
                }))
            });
        }

        // ── 3. SEND SEARCH AS SINGLE SELECT ──
        const searchText = `🎬 *MP4MOVIEZ SEARCH*\n\n🔎 *Results for:* ${query.toUpperCase()}\n📌 *Found:* ${results.length} movies\n\n💖 *Tap to select a movie from the list*`;

        await sendInteractiveMessage(mishu, from, {
            text: searchText,
            footer: `🎬 ${results.length} movies found | 💖 MEER_xD`,
            interactiveButtons: [
                {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '📽️ ᴛᴀᴘ ᴛᴏ sᴇʟᴇᴄᴛ ᴍᴏᴠɪᴇ 🎬',
                        sections: sections
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔄 Search Again',
                        id: `${config.PREFIX || '.'}movie ${query}`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📜 Menu',
                        id: `${config.PREFIX || '.'}menu`
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '💖 GROUP',
                        url: config.GROUP_LINK || 'https://chat.whatsapp.com/IVh7TBHhueX64Gz4TAOdVM'
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎀 CHANNEL',
                        url: config.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VarfjW04tRrmwfb8x306'
                    })
                }
            ]
        });

        // ── 4. FIXED: LISTENER FOR MOVIE SELECTION ──
        const movieHandler = async (update) => {
            try {
                const incoming = update.messages?.[0];
                if (!incoming?.message || incoming.key.remoteJid !== from) return;

                const msg = incoming.message;
                let selectedIndex = null;

                // ── CHECK FOR LIST RESPONSE ──
                if (msg.listResponseMessage?.singleSelectReply?.selectedRowId) {
                    const id = msg.listResponseMessage.singleSelectReply.selectedRowId;
                    console.log('[Movies] Selected ID:', id);
                    if (id && id.startsWith('movie_')) {
                        selectedIndex = parseInt(id.replace('movie_', ''));
                    }
                }
                // ── CHECK FOR BUTTON RESPONSE ──
                else if (msg.buttonsResponseMessage?.selectedButtonId) {
                    const id = msg.buttonsResponseMessage.selectedButtonId;
                    console.log('[Movies] Button ID:', id);
                    if (id && id.startsWith('movie_')) {
                        selectedIndex = parseInt(id.replace('movie_', ''));
                    }
                }
                // ── CHECK FOR TEXT RESPONSE ──
                else if (msg.extendedTextMessage?.text) {
                    const text = msg.extendedTextMessage.text.trim();
                    console.log('[Movies] Text:', text);
                    if (text && text.startsWith('movie_')) {
                        selectedIndex = parseInt(text.replace('movie_', ''));
                    }
                }

                if (selectedIndex === null || !results[selectedIndex]) {
                    console.log('[Movies] Invalid selection:', selectedIndex);
                    return;
                }

                // Stop listener
                mishu.ev.off("messages.upsert", movieHandler);

                await mishu.sendMessage(from, { react: { text: "📑", key: incoming.key } });

                // ── 5. GET MOVIE DETAILS ──
                const selected = results[selectedIndex];
                const { data: html } = await axios.get(selected.link, {
                    headers: { "User-Agent": "Mozilla/5.0" }
                });

                const $$ = cheerio.load(html);
                const movie = { title: $$("h1").first().text().trim() };

                $$(".jatt, .jatt1").each((i, el) => {
                    const label = $$(el).find("b").text().replace(":", "").trim().toLowerCase();
                    const value = $$(el).find("div").last().text().trim().replace(/\s+/g, " ");

                    if (label.includes("movie name")) movie.movieName = value;
                    if (label.includes("genre")) movie.genre = value;
                    if (label.includes("rating")) movie.rating = value;
                    if (label.includes("release date")) movie.releaseDate = value;
                });

                const poster = $$(".posterss").attr("src");
                movie.poster = poster ? new URL(poster, selected.link).href : null;

                // ── 6. EXTRACT DOWNLOAD PAGE ──
                let secondPage = null;
                $$("body > div.mast > a").each((i, el) => {
                    const href = $$(el).attr("href");
                    if (href && href.includes(".html")) secondPage = new URL(href, selected.link).href;
                });

                const downloads = [];
                if (secondPage) {
                    const { data: page2 } = await axios.get(secondPage);
                    const $$$ = cheerio.load(page2);

                    $$$(".mast").each((i, el) => {
                        const a = $$$(el).find("a");
                        const href = a.attr("href");
                        if (!href || !href.includes("dl.php")) return;

                        const sizeMatch = $$$(el).text().match(/\[(.*?)\]/);
                        downloads.push({
                            title: a.text().trim(),
                            link: new URL(href, BASE_URL).href,
                            size: sizeMatch ? sizeMatch[1] : "Unknown"
                        });
                    });
                }

                if (!downloads.length) {
                    await mishu.sendMessage(from, { react: { text: '❌', key: incoming.key } });
                    return reply("❌ No download links found for this movie.");
                }

                // ── 7. BUILD DOWNLOAD SECTIONS ──
                const dlSections = [{
                    title: '📥 Dᴏᴡɴʟᴏᴀᴅ Oᴘᴛɪᴏɴs',
                    rows: downloads.slice(0, 10).map((d, i) => ({
                        title: `${d.title.substring(0, 40)}${d.title.length > 40 ? '...' : ''}`,
                        description: `📦 Size: ${d.size}`,
                        id: `dl_${i}`
                    }))
                }];

                // ── 8. BUILD DETAILS CAPTION ──
                const infoCap = `🎬 *${movie.title.toUpperCase()}*\n━━━━━━━━━━━━━━━━━━\n⭐ *Rating:* ${movie.rating || "N/A"}\n🎭 *Genre:* ${movie.genre || "N/A"}\n📅 *Release:* ${movie.releaseDate || "N/A"}\n\n📥 *Tap to select quality from the list*`;

                // ── 9. SEND MOVIE DETAILS WITH POSTER ──
                await mishu.sendMessage(from, {
                    image: { url: movie.poster || "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png" },
                    caption: infoCap,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: incoming });

                // ── 10. SEND DOWNLOAD AS SINGLE SELECT ──
                await sendInteractiveMessage(mishu, from, {
                    text: `🎬 *${movie.title}*\n\n📥 *Select quality to download:*`,
                    footer: `💖 ${downloads.length} qualities available`,
                    interactiveButtons: [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: '📥 Tᴀᴘ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ 🎬',
                                sections: dlSections
                            })
                        },
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🔍 Search Again',
                                id: `${config.PREFIX || '.'}movie`
                            })
                        },
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📜 Menu',
                                id: `${config.PREFIX || '.'}menu`
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '💖 GROUP',
                                url: config.GROUP_LINK || 'https://chat.whatsapp.com/IVh7TBHhueX64Gz4TAOdVM'
                            })
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🎀 CHANNEL',
                                url: config.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VarfjW04tRrmwfb8x306'
                            })
                        }
                    ]
                });

                // ── 11. FIXED: DOWNLOAD HANDLER ──
                const dlHandler = async (dlUpdate) => {
                    try {
                        const dlIncoming = dlUpdate.messages?.[0];
                        if (!dlIncoming?.message || dlIncoming.key.remoteJid !== from) return;

                        if (isDownloading) {
                            await mishu.sendMessage(from, { 
                                text: "⏳ Please wait, another download is active..."
                            }, { quoted: dlIncoming });
                            return;
                        }

                        const dlMsg = dlIncoming.message;
                        let dlIndex = null;

                        // ── CHECK FOR LIST RESPONSE ──
                        if (dlMsg.listResponseMessage?.singleSelectReply?.selectedRowId) {
                            const id = dlMsg.listResponseMessage.singleSelectReply.selectedRowId;
                            console.log('[Movies] Download ID:', id);
                            if (id && id.startsWith('dl_')) {
                                dlIndex = parseInt(id.replace('dl_', ''));
                            }
                        }
                        // ── CHECK FOR BUTTON RESPONSE ──
                        else if (dlMsg.buttonsResponseMessage?.selectedButtonId) {
                            const id = dlMsg.buttonsResponseMessage.selectedButtonId;
                            if (id && id.startsWith('dl_')) {
                                dlIndex = parseInt(id.replace('dl_', ''));
                            }
                        }
                        // ── CHECK FOR TEXT RESPONSE ──
                        else if (dlMsg.extendedTextMessage?.text) {
                            const text = dlMsg.extendedTextMessage.text.trim();
                            if (text && text.startsWith('dl_')) {
                                dlIndex = parseInt(text.replace('dl_', ''));
                            }
                        }

                        if (dlIndex === null || !downloads[dlIndex]) {
                            console.log('[Movies] Invalid download selection:', dlIndex);
                            return;
                        }

                        mishu.ev.off("messages.upsert", dlHandler);
                        isDownloading = true;

                        await mishu.sendMessage(from, { react: { text: "📥", key: dlIncoming.key } });

                        try {
                            const target = downloads[dlIndex];
                            const thumbnail = await getThumbnailBuffer(movie.poster);

                            await mishu.sendMessage(from, {
                                document: { url: target.link },
                                mimetype: "video/mp4",
                                fileName: `${movie.title || 'movie'}.mp4`,
                                jpegThumbnail: thumbnail,
                                caption: `✅ *${movie.title || 'Movie'}*\n📦 Size: ${target.size || 'Unknown'}\n\n💖 Powered by MEER_xD`,
                                contextInfo: {
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999,
                                    isForwarded: true
                                }
                            }, { quoted: dlIncoming });

                            await mishu.sendMessage(from, { react: { text: "✅", key: dlIncoming.key } });

                        } catch (e) {
                            console.error('🌸 Download Error:', e);
                            await mishu.sendMessage(from, {
                                text: `❌ Download failed. Please try again.\n\nError: ${e.message}`
                            }, { quoted: dlIncoming });
                        } finally {
                            isDownloading = false;
                        }
                    } catch (e) {
                        console.error('[Movies] DL Handler Error:', e);
                    }
                };

                mishu.ev.on("messages.upsert", dlHandler);
                setTimeout(() => mishu.ev.off("messages.upsert", dlHandler), 600000);

            } catch (e) {
                console.error('[Movies] Movie Handler Error:', e);
            }
        };

        mishu.ev.on("messages.upsert", movieHandler);
        setTimeout(() => mishu.ev.off("messages.upsert", movieHandler), 300000);

        // ── Final Reaction ──
        await mishu.sendMessage(from, { react: { text: "💖", key: mek.key } });

    } catch (err) {
        console.error('🌸 MP4Moviez Error:', err);
        await mishu.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error processing movie search.\n\n${err.message}`);
    }
});

console.log('🎬 MEER_xD - MP4Moviez Interactive Plugin Loaded! 💖');
