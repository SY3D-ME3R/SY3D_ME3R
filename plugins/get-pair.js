// ============================================
// 🌸 MEER_xD - PAIRING COMMAND
// 👑 Developer: SYED MEER
// 🔥 Working with your API + Image + Buttons
// ============================================

const { mishu, commands } = require('../mishu');
const axios = require("axios");
const { sendInteractiveMessage } = require('gifted-btns');
const { sleep } = require('../lib/functions');
const config = require('../config');

// ── Image URL ──
const PAIR_IMAGE = config.PAIR_IMAGE || 'https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png';

mishu({
    pattern: "pair",
    alias: ["getpair", "clonebot", "paircode"],
    desc: "🌸 Get WhatsApp pairing code with image + buttons",
    category: "tools",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, q, senderNumber, reply, isOwner }) => {
    try {
        let number = q
            ? q.replace(/[^0-9]/g, "")
            : senderNumber.replace(/[^0-9]/g, "");

        if (!number || number.length < 10 || number.length > 15) {
            return reply("🌸 Invalid number.\n\nExample:\n.pair 923001234567 💕");
        }

        // ═══════════════════════════════════════════
        // 🔥 CHECK IF ALREADY CONNECTED
        // ═══════════════════════════════════════════

        let isConnected = false;
        let connectionTime = null;
        let uptime = null;

        try {
            const statusRes = await axios.get(`https://mishu-md-mini-v2-server1-0e639b1a9594.herokuapp.com/pair-status?number=${number}`, {
                timeout: 10000
            });
            
            if (statusRes.data && statusRes.data.status === 'connected') {
                isConnected = true;
                connectionTime = statusRes.data.connectionTime || 'Unknown';
                uptime = statusRes.data.uptime || '0';
            }
        } catch (e) {
            console.log('[Pair] Status check error:', e.message);
        }

        // ═══════════════════════════════════════════
        // 🔥 IF ALREADY CONNECTED - SHOW DISCONNECT OPTION
        // ═══════════════════════════════════════════

        if (isConnected) {
            const connectedMsg = `╭────────────────────◇
│  ✅ 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗 ✅ 
│  ✿━━━━━━━━━━━━━━━✿
│ ♡⪼ 📱 Number: ${number}
│ ♡⪼ 🔗 Status: Connected
│ ♡⪼ ⏰ Since: ${connectionTime}
│ ♡⪼ ⏳ Uptime: ${uptime}s
│ ♡⪼ 💡 Use "Disconnect" to reset
╰────────────────────○

💖 *Tap "Disconnect" to remove this session and pair again*`;

            await mishu.sendMessage(from, {
                image: { url: PAIR_IMAGE },
                caption: connectedMsg,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: mek });

            await sleep(500);

            await sendInteractiveMessage(mishu, from, {
                text: `🔌 *Disconnect & Re-pair*`,
                footer: `💖 ${config.BOT_NAME || 'MEER_xD'}`,
                interactiveButtons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🔌 Disconnect',
                            url: `https://mishu-md-mini-v2-server1-0e639b1a9594.herokuapp.com/disconnect?number=${number}`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🔄 Force Pair',
                            id: `.pair ${number} force`
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Check Status',
                            url: `https://mishu-md-mini-v2-server1-0e639b1a9594.herokuapp.com/status?number=${number}`
                        })
                    }
                ]
            });

            return;
        }

        // ═══════════════════════════════════════════
        // 🔥 LIVE LOADING MESSAGES
        // ═══════════════════════════════════════════

        const loadingMessages = [
            "🌸 Initializing pairing request...",
            "💖 Connecting to WhatsApp servers...",
            "✨ Generating secure pairing code...",
            "🎀 Almost there...",
            "💕 Finalizing your pairing code..."
        ];

        // ── Send initial image + message ──
        const initialMsg = await mishu.sendMessage(from, {
            image: { url: PAIR_IMAGE },
            caption: `╭═══✿══════════════╗
│  ✿ 🌸 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗜𝗡 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦 🌸 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ${loadingMessages[0]}
│  ✿ 📱 Number: ${number}
│  ✿ 🔄 Please wait...
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 ${config.BOT_NAME || 'MEER_xD'} 💖`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // ── Update message every 2 seconds ──
        let currentIndex = 0;
        const updateInterval = setInterval(async () => {
            if (currentIndex < loadingMessages.length) {
                const updatedCaption = `╭═══✿══════════════╗
│  ✿ 🌸 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗜𝗡 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦 🌸 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ${loadingMessages[currentIndex]}
│  ✿ 📱 Number: ${number}
│  ✿ 🔄 Processing...
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 ${config.BOT_NAME || 'MEER_xD'} 💖`;

                try {
                    await mishu.sendMessage(from, {
                        image: { url: PAIR_IMAGE },
                        caption: updatedCaption,
                        edit: initialMsg.key,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    });
                } catch (e) {
                    clearInterval(updateInterval);
                }
                currentIndex++;
            }
        }, 2000);

        // ═══════════════════════════════════════════
        // 🔥 FETCH PAIRING CODE FROM API
        // ═══════════════════════════════════════════

        try {
            // ── Your Working API ──
            const apiUrl = `https://mishu-md-mini-v2-server1-0e639b1a9594.herokuapp.com/code?number=${number}`;
            console.log(`[Pair] Calling API: ${apiUrl}`);
            
            const res = await axios.get(apiUrl, { 
                timeout: 60000,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearInterval(updateInterval);

            // ── Check response ──
            console.log('[Pair] API Response:', JSON.stringify(res.data));

            // ── Extract code from your API format ──
            // Format: { code: "7NCAG929", status: "new_pairing" }
            let code = null;
            
            if (res.data.code) {
                code = res.data.code;
            }

            if (!code) {
                const errorCaption = `╭═══✿══════════════╗
│  ✿ ❌ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗙𝗔𝗜𝗟𝗘𝗗 ❌ ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ❌ ${res.data?.message || 'No code received from API'}
│  ✿ 📱 Number: ${number}
│  ✿ 🔄 Please try again later
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 ${config.BOT_NAME || 'MEER_xD'} 💖`;

                try {
                    await mishu.sendMessage(from, {
                        image: { url: PAIR_IMAGE },
                        caption: errorCaption,
                        edit: initialMsg.key,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    });
                } catch {
                    await reply(errorCaption);
                }
                return;
            }

            // ═══════════════════════════════════════════
            // 🎀 FINAL SUCCESS MESSAGE WITH IMAGE
            // ═══════════════════════════════════════════

            const finalCaption = `╭────────────────────◇
│  ✅ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬 ✅
│  ✿━━━━━━━━━━━━━━━✿
│ ♡⪼  🔑 Code: *${code}*
│ ♡⪼ 📱 Number: ${number}
│ ♡⪼ ✅ Ready to use!
╰────────────────────○

> 🦋⃟ MEER_xD 🦋⃟‌💙࿐`;

            try {
                await mishu.sendMessage(from, {
                    image: { url: PAIR_IMAGE },
                    caption: finalCaption,
                    edit: initialMsg.key,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });
            } catch {
                await mishu.sendMessage(from, {
                    image: { url: PAIR_IMAGE },
                    caption: finalCaption,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true
                    }
                }, { quoted: mek });
            }

            // ═══════════════════════════════════════════
            // 🎯 SEND BUTTONS WITH PAIRING CODE
            // ═══════════════════════════════════════════

            await sleep(1000);

            await sendInteractiveMessage(mishu, from, {
                text: `🔑 *WhatsApp Pairing Code*\n\n👉 *${code}*\n\n📌 *How To Use?*\n1️⃣ Open WhatsApp\n2️⃣ Go To Linked Devices\n3️⃣ Click "Link A Device"\n4️⃣ Select "Link With Ph Number"\n5️⃣ Enter The Code Above\n\n⚠️ Pairing code is valid for a limited time.`,
                footer: `💖 ${config.BOT_NAME || 'MEER_xD'}`,
                interactiveButtons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Copy Code',
                            copy_code: code
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🌐 Pair Website',
                            url: 'https://mishu-md-mini-production.up.railway.app'
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🌸 WhatsApp Channel',
                            url: 'https://whatsapp.com/channel/0029VarfjW04tRrmwfb8x306'
                        })
                    }
                ]
            });

        } catch (apiError) {
            clearInterval(updateInterval);
            
            console.error('[Pair] API Error:', apiError.message);
            
            const errorCaption = `╭═══✿══════════════╗
│  ✿ ❌ 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗙𝗔𝗜𝗟𝗘𝗗 ❌ ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ❌ ${apiError.response?.data?.message || apiError.message || 'API connection failed'}
│  ✿ 📱 Number: ${number}
│  ✿ 🔄 Please try again later
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 ${config.BOT_NAME || 'MEER_xD'} 💖`;

            try {
                await mishu.sendMessage(from, {
                    image: { url: PAIR_IMAGE },
                    caption: errorCaption,
                    edit: initialMsg.key,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });
            } catch {
                await reply(errorCaption);
            }
            return;
        }

    } catch (err) {
        console.error("🌸 Pair Error:", err);
        reply("🌸 Error: " + err.message);
    }
});
