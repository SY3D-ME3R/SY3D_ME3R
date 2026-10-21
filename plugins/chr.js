// ============================================
// 🌸 CHANNEL REACT - MEER_xD
// 👑 Developer: SYED MEER
// 🔥 React to WhatsApp channel posts
// ============================================

const { mishu } = require('../mishu');
const { girlBox, girlHelp, girlError, girlSuccess } = require('../lib/style');
const axios = require('axios');
const config = require('../settings');

// ============================================
// 📌 CHANNEL REACT COMMAND
// ============================================

mishu({
    pattern: "chr",
    alias: ["channelreacts", "creacts", "chreacts", "reactschannel"],
    desc: "🌸 React to WhatsApp channel posts",
    category: "tools",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, reply, args }) => {
    try {
        // ── Check args ──
        if (!args || args.length < 2) {
            return reply(girlHelp('🌸 Cʜᴀɴɴᴇʟ Rᴇᴀᴄᴛ', [
                ['📌', 'Usage', '.chr <channel_link> <emoji1,emoji2>'],
                ['💖', 'Example', '.chr https://whatsapp.com/channel/xxxx/137 👍,😍,❤️'],
                ['💖', 'Example 2', '.chr https://whatsapp.com/channel/xxxx/123 ❤️,😂,🔥'],
                ['📌', 'Options', 'count: all (default) or number'],
                ['👑', 'By', 'MEER_xD']
            ]));
        }

        // ── Extract link and emoji ──
        let link = null;
        let emoji = null;
        let count = 'all';

        for (const arg of args) {
            if (arg.includes('whatsapp.com/channel')) {
                link = arg;
            } else if (arg.includes(',') && !arg.includes('http')) {
                emoji = arg;
            } else if (arg.toLowerCase() === 'all' || !isNaN(arg)) {
                count = arg.toLowerCase();
            }
        }

        if (!emoji) {
            const lastArg = args[args.length - 1];
            if (lastArg.includes(',')) {
                emoji = lastArg;
            } else {
                return reply(girlHelp('❌ Eᴍᴏᴊɪ Rᴇǫᴜɪʀᴇᴅ', [
                    ['📌', 'Please provide', 'Emojis separated by comma'],
                    ['💖', 'Example', '👍,😍,❤️'],
                    ['👑', 'By', 'MEER_xD']
                ]));
            }
        }

        if (!link) {
            return reply(girlHelp('❌ Lɪɴᴋ Rᴇǫᴜɪʀᴇᴅ', [
                ['📌', 'Please provide', 'WhatsApp channel link'],
                ['💖', 'Example', 'https://whatsapp.com/channel/xxxx/123'],
                ['👑', 'By', 'MEER_xD']
            ]));
        }

        // ── Loading Reactions ──
        const loadEmojis = ['⏳', '🔄', '📤'];
        for (const e of loadEmojis) {
            await mishu.sendMessage(from, { react: { text: e, key: mek.key } }).catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        // ── Call API ──
        const encodedLink = encodeURIComponent(link);
        const encodedEmoji = encodeURIComponent(emoji);
        const apiUrl = `https://api.makluxnxx.my.id/v1/tools/whatsapp-react?link=${encodedLink}&emoji=${encodedEmoji}&count=${count}`;

        const response = await axios.get(apiUrl, { timeout: 30000 });
        const data = response.data;

        if (!data || data.status !== true) {
            throw new Error(data?.result?.message || 'API request failed');
        }

        const result = data.result;

        // ── Send response with new style ──
        const replyText = girlBox('📨 Cʜᴀɴɴᴇʟ Rᴇᴀᴄᴛɪᴏɴ', [
            ['🔗', 'Link', result.link || link],
            ['😊', 'Emojis', result.emoji || emoji],
            ['📊', 'Count', result.count || count],
            [result.status === 'queued' ? '⏳' : '✅', 'Status', result.status === 'queued' ? 'Qᴜᴇᴜᴇᴅ' : 'Cᴏᴍᴘʟᴇᴛᴇᴅ'],
            ['📝', 'Message', result.message || 'Success'],
            ['🎯', 'Target', result.target_count || 'N/A'],
            ['🆔', 'Job ID', result.job_id || 'N/A']
        ]);

        await reply(replyText);

        // ── Success reaction ──
        await mishu.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('[CHR] Error:', error.message);

        let errorMsg = error.message;
        if (error.code === 'ECONNABORTED') errorMsg = 'Request timed out. Please try again.';
        else if (error.response?.status === 404) errorMsg = 'API not found.';
        else if (error.response?.status === 429) errorMsg = 'Too many requests. Please wait.';

        reply(girlError(errorMsg));
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

console.log('🌸 CHANNEL REACT (CHR) plugin loaded! 💖');
