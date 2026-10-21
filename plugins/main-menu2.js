// ============================================
// 🌸 MEER_xD FULL MENU
// 👑 Developer: SYED MEER
// 🔥 Gifted-btns + Whisky Baileys Carousel
// 💖 Public - Everyone Can Use
// ============================================

const { mishu, commands } = require('../mishu');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const { sendInteractiveMessage } = require('gifted-btns');
const config = require('../settings');
const axios = require('axios');
const moment = require('moment-timezone');

// ============================================
// 📌 HELPERS
// ============================================

function buildBizNodes(jid) {
    const isGroup = String(jid || '').endsWith('@g.us');
    const content = [
        {
            tag: 'interactive',
            attrs: { type: 'native_flow', v: '1' },
            content: [{ tag: 'native_flow', attrs: { v: '2', name: 'mixed' }, content: undefined }],
        },
    ];
    if (!isGroup) {
        content.push({ tag: 'bot', attrs: { biz_bot: '1' }, content: undefined });
    }
    return [{ tag: 'biz', attrs: {}, content }];
}

async function sendCarousel(sock, from, m, deps, headerText, cardsData) {
    const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = deps || {};
    if (!generateWAMessageFromContent || !proto?.Message?.InteractiveMessage) return false;
    const IM = proto.Message.InteractiveMessage;
    if (typeof IM.create !== 'function') return false;

    try {
        const cards = [];
        for (const card of cardsData) {
            let header = IM.Header.create({ title: ' ' });
            if (card.imageBuffer && prepareWAMessageMedia) {
                try {
                    const media = await prepareWAMessageMedia(
                        { image: card.imageBuffer },
                        { upload: sock.waUploadToServer }
                    );
                    if (media?.imageMessage) {
                        header = IM.Header.create({
                            title: ' ',
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage,
                        });
                    }
                } catch (_) {}
            }

            cards.push({
                body: IM.Body.create({ text: card.body }),
                header,
                nativeFlowMessage: IM.NativeFlowMessage.create({
                    buttons: (card.buttons || []).map((b) => ({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: b.text,
                            id: b.id,
                        }),
                    })),
                }),
            });
        }

        const interactiveMessage = IM.create({
            body: IM.Body.create({ text: headerText }),
            carouselMessage: IM.CarouselMessage.create({ cards, messageVersion: 1 }),
        });

        const msg = generateWAMessageFromContent(
            from,
            {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                },
                interactiveMessage,
            },
            { quoted: m, userJid: sock.user && sock.user.id }
        );

        if (!msg?.message) return false;

        await sock.relayMessage(from, msg.message, {
            messageId: msg.key && msg.key.id,
            additionalNodes: buildBizNodes(from),
        });
        return true;
    } catch (e) {
        console.error('[carousel]', e.message || e);
        return false;
    }
}

async function downloadBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
        return Buffer.from(response.data);
    } catch (e) {
        return null;
    }
}

function formatTime(seconds) {
    if (!seconds) return 'N/A';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function formatBytes(bytes) {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
}

function getEmoji(category) {
    const emojis = {
        audio: '🎵', media: '🖼️', utility: '🛠️', group: '👥',
        owner: '👑', ai: '🤖', download: '📥', security: '🛡️',
        general: '📋', main: '🌸', menu: '📜', info: 'ℹ️',
        tools: '🔧', fun: '🎮', game: '🎯', nsfw: '🔞',
        settings: '⚙️', channel: '📢', sticker: '🎨', converter: '🔄',
        chatbot: '💬', image: '🖼️', video: '🎬', audio: '🎵'
    };
    return emojis[category?.toLowerCase()] || '📌';
}

function getCategoryIcon(category) {
    return getEmoji(category);
}

// ============================================
// 🌸 FULL MENU (Public)
// ============================================

mishu({
    pattern: "menu2",
    alias: ["help2", "cmds2", "commands2", "allmenu3", "m2"],
    desc: "🌸 Show full menu with tap to select + carousel",
    category: "main",
    react: "🌸",
    filename: __filename
}, async (sock, mek, m, { from, reply, pushname, isGroup }) => {
    try {
        // ── Loading ──
        await sock.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // ── Stats ──
        const totalCommands = commands ? commands.length : 0;
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        const prefix = config.PREFIX || '.';
        const botName = config.BOT_NAME || '🌸MEER_xD🌸';
        const ownerName = config.OWNER_NAME || 'SYED MEER';
        const pakTime = moment().tz('Asia/Karachi').format('hh:mm:ss A');
        const pakDate = moment().tz('Asia/Karachi').format('DD/MM/YYYY');

        // ── Get categories ──
        const categoryMap = new Map();
        for (const cmd of commands) {
            const cat = cmd.category || 'general';
            if (!categoryMap.has(cat)) {
                categoryMap.set(cat, []);
            }
            categoryMap.get(cat).push(cmd);
        }

        // ── Sort categories ──
        const sortedCategories = Array.from(categoryMap.keys()).sort();

        // ── Image URL ──
        const imageUrl = config.IMAGE_PATH || 'https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png';

        // ── Build Cards ──
        const cardsData = [];

        // ── Card 1: Bot Info ──
        cardsData.push({
            body: `🌸 *${botName}*\n\n👤 User: ${pushname || 'Guest'}\n👑 Owner: ${ownerName}\n📊 Commands: ${totalCommands}\n⏳ Uptime: ${formatTime(uptime)}\n💾 Memory: ${formatBytes(memory.heapUsed)}\n📌 Prefix: ${prefix}\n🕐 Time: ${pakTime}\n📅 Date: ${pakDate}`,
            imageBuffer: await downloadBuffer(imageUrl),
            buttons: [
                { text: '📜 Menu', id: `${prefix}menu` },
                { text: '🕐 Runtime', id: `${prefix}runtime` },
                { text: '👑 Owner', id: `${prefix}owner` },
                { text: '🏓 Ping', id: `${prefix}ping` }
            ]
        });

        // ── Category Cards ──
        for (const category of sortedCategories) {
            const cmds = categoryMap.get(category);
            const emoji = getCategoryIcon(category);
            const cmdList = cmds.slice(0, 6).map(c => `• ${prefix}${c.pattern}`).join('\n');
            const more = cmds.length > 6 ? `\n• ... and ${cmds.length - 6} more` : '';

            cardsData.push({
                body: `${emoji} *${category.toUpperCase()}*\n\n📋 *Commands:*\n${cmdList}${more}\n\n💖 Total: ${cmds.length} commands\n📌 Prefix: ${prefix}`,
                imageBuffer: await downloadBuffer(imageUrl),
                buttons: [
                    { text: `📌 ${category}`, id: `${prefix}${category}` },
                    { text: '📜 Full Menu', id: `${prefix}menu` },
                    { text: '🔄 Next', id: 'next' }
                ]
            });
        }

        // ── Header Text ──
        const headerText = `🌸 *${botName}*\n\n👋 Hello ${pushname || 'User'}!\n📊 Total: ${totalCommands} commands\n📌 Prefix: ${prefix}\n🕐 ${pakTime}\n\n💖 *Swipe & Tap!*`;

        // ── Try Carousel First ──
        const deps = {
            generateWAMessageFromContent,
            proto,
            prepareWAMessageMedia
        };

        const carouselSuccess = await sendCarousel(sock, from, mek, deps, headerText, cardsData);

        if (carouselSuccess) {
            await sock.sendMessage(from, { react: { text: '✅', key: mek.key } });
            return;
        }

        // ── Fallback 1: Gifted-btns Interactive Menu ──
        const categoryButtons = sortedCategories.map(cat => ({
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: `📌 Select Category`,
                sections: [{
                    title: '📋 CATEGORIES',
                    highlight_label: '🔍 SELECT',
                    rows: sortedCategories.map(cat => {
                        const cmds = categoryMap.get(cat);
                        return {
                            title: `${getCategoryIcon(cat)} ${cat.toUpperCase()}`,
                            description: `${cmds.length} commands available`,
                            id: `${prefix}${cat}`
                        };
                    })
                }]
            })
        }));

        // ── Quick Reply Buttons ──
        const quickButtons = [
            { text: '📜 Full Menu', id: `${prefix}menu` },
            { text: '🕐 Runtime', id: `${prefix}runtime` },
            { text: '👑 Owner', id: `${prefix}owner` },
            { text: '🏓 Ping', id: `${prefix}ping` }
        ];

        // ── Send Interactive Message ──
        await sendInteractiveMessage(sock, from, {
            text: `🌸 *${botName}*\n\n👋 Hello ${pushname || 'User'}!\n📊 Commands: ${totalCommands}\n📌 Prefix: ${prefix}\n🕐 ${pakTime}\n\n💖 Select a category or tap a button:`,
            footer: `💖 ${ownerName}`,
            interactiveButtons: [
                ...categoryButtons,
                ...quickButtons.map(b => ({
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: b.text,
                        id: b.id
                    })
                }))
            ]
        });

        await sock.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 Menu Error:', error);

        // ── Fallback 2: Simple Text Menu ──
        try {
            const totalCommands = commands ? commands.length : 0;
            const prefix = config.PREFIX || '.';
            const botName = config.BOT_NAME || '🌸MEER_xD🌸';
            const ownerName = config.OWNER_NAME || 'SYED MEER';

            // ── Get categories ──
            const categoryMap = new Map();
            for (const cmd of commands) {
                const cat = cmd.category || 'general';
                if (!categoryMap.has(cat)) {
                    categoryMap.set(cat, []);
                }
                categoryMap.get(cat).push(cmd);
            }

            let menuText = `🌸 *${botName}*\n\n👋 Hello ${pushname || 'User'}!\n📊 Commands: ${totalCommands}\n📌 Prefix: ${prefix}\n\n💖 *Categories:*\n\n`;

            for (const [category, cmds] of categoryMap) {
                const emoji = getCategoryIcon(category);
                menuText += `${emoji} *${category.toUpperCase()}* (${cmds.length})\n`;
                const cmdList = cmds.slice(0, 5).map(c => `  • ${prefix}${c.pattern}`).join('\n');
                menuText += `${cmdList}\n${cmds.length > 5 ? `  • ... and ${cmds.length - 5} more\n` : ''}\n`;
            }

            menuText += `\n💖 *Powered by ${ownerName}*`;

            await reply(menuText);
        } catch (fallbackError) {
            await reply(`🌸 Error loading menu: ${error.message} 💕`);
        }

        await sock.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});

// ============================================
// 📌 QUICK MENU (Without Carousel)
// ============================================

mishu({
    pattern: "qmenu",
    alias: ["quickmenu", "q"],
    desc: "🌸 Quick menu with tap to select buttons",
    category: "menu",
    react: "🌸",
    filename: __filename
}, async (sock, mek, m, { from, reply, pushname }) => {
    try {
        const totalCommands = commands ? commands.length : 0;
        const prefix = config.PREFIX || '.';
        const botName = config.BOT_NAME || '🌸MEER_xD🌸';
        const ownerName = config.OWNER_NAME || 'SYED MEER';

        // ── Get categories ──
        const categoryMap = new Map();
        for (const cmd of commands) {
            const cat = cmd.category || 'general';
            if (!categoryMap.has(cat)) {
                categoryMap.set(cat, []);
            }
            categoryMap.get(cat).push(cmd);
        }

        const sortedCategories = Array.from(categoryMap.keys()).sort();

        // ── Build buttons ──
        const buttons = [];

        // ── Category selection ──
        buttons.push({
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: '📌 SELECT CATEGORY',
                sections: [{
                    title: '📋 CATEGORIES',
                    highlight_label: '🔍 SELECT',
                    rows: sortedCategories.map(cat => {
                        const cmds = categoryMap.get(cat);
                        return {
                            title: `${getCategoryIcon(cat)} ${cat.toUpperCase()}`,
                            description: `${cmds.length} commands available`,
                            id: `${prefix}${cat}`
                        };
                    })
                }]
            })
        });

        // ── Quick buttons ──
        const quickButtons = [
            { text: '📜 Full Menu', id: `${prefix}menu` },
            { text: '🕐 Runtime', id: `${prefix}runtime` },
            { text: '👑 Owner', id: `${prefix}owner` },
            { text: '🏓 Ping', id: `${prefix}ping` }
        ];

        for (const b of quickButtons) {
            buttons.push({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: b.text,
                    id: b.id
                })
            });
        }

        await sendInteractiveMessage(sock, from, {
            text: `🌸 *${botName}*\n\n👋 Hello ${pushname || 'User'}!\n📊 Commands: ${totalCommands}\n📌 Prefix: ${prefix}\n\n💖 Select a category or tap a button:`,
            footer: `💖 ${ownerName}`,
            interactiveButtons: buttons
        });

        await sock.sendMessage(from, { react: { text: '💖', key: mek.key } });

    } catch (error) {
        console.error('🌸 Quick Menu Error:', error);
        reply(`🌸 Error: ${error.message} 💕`);
    }
});

// ============================================
// 📌 CATEGORY COMMANDS (Auto-generated)
// ============================================

// ── Auto-generate category commands ──
const categoryMap = new Map();
for (const cmd of commands) {
    const cat = cmd.category || 'general';
    if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
    }
    categoryMap.get(cat).push(cmd);
}

for (const [category, cmds] of categoryMap) {
    const emoji = getCategoryIcon(category);
    const prefix = config.PREFIX || '.';
    const botName = config.BOT_NAME || '🌸MEER_xD🌸';

    // ── Skip if already has pattern ──
    const existing = commands.find(c => c.pattern === category);
    if (existing) continue;

    // ── Register category command ──
    mishu({
        pattern: category,
        alias: [`${category}menu`, `${category}cmd`],
        desc: `🌸 Show ${category} commands`,
        category: "menu",
        react: emoji,
        filename: __filename
    }, async (sock, mek, m, { from, reply }) => {
        try {
            const cmdList = cmds.map(c => `• ${prefix}${c.pattern} — ${c.desc || 'No description'}`).join('\n');

            const text = `${emoji} *${category.toUpperCase()} COMMANDS*\n\n📋 *Total: ${cmds.length} commands*\n\n${cmdList}\n\n💖 *Powered by ${botName}*`;

            await reply(text);
            await sock.sendMessage(from, { react: { text: emoji, key: mek.key } });
        } catch (error) {
            console.error(`🌸 ${category} Error:`, error);
            reply(`🌸 Error: ${error.message} 💕`);
        }
    });
}

console.log('🌸 FULL MENU plugin loaded! 💖');
console.log(`📌 Categories: ${categoryMap.size}`);
console.log(`📊 Total Commands: ${commands.length}`);
