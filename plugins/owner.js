// ============================================
// 👑 OWNER - MEER_xD
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 📌 Owner info + Developer commands
// ============================================

const { mishu } = require('../mishu');
const { sendInteractiveMessage } = require('gifted-btns');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const { runtime, sleep } = require('../lib/functions');

// ============================================
// 📌 DEVELOPER INFO
// ============================================
const DEV_INFO = {
    name: "SYED MEER",
    number: "+923118456830",
    channel: "https://whatsapp.com/channel/0029VarfjW04tRrmwfb8x306",
    group: "https://chat.whatsapp.com/KCGPeSBdN4d0E7qfQptONd",
    github: "https://github.com/SY3D-ME3R",
    website: "https://arslanmd.xo.je",
    repo: "https://github.com/SY3D-ME3R/SY3D_ME3R"
};

// ============================================
// 👑 OWNER / DEVELOPER INFO COMMAND
// ============================================
mishu({
    pattern: "owner",
    alias: ["creator", "dev", "developer", "about"],
    desc: "🌸 Get developer/owner information",
    category: "info",
    react: "👑",
    filename: __filename
}, async (mishu, mek, m, { from, reply }) => {
    try {
        const uptime = runtime(process.uptime());
        const botName = config.BOT_NAME || "🌸 MEER_xD 🌸";

        const text = `
╭═══✿══════════════╗
│  ✿ 👑 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🤖 Bot: ${botName}
│  ✿ 👤 Name: ${DEV_INFO.name}
│  ✿ 📱 Contact: ${DEV_INFO.number}
│  ✿ ⏳ Uptime: ${uptime}
╰═══✿══════════════╝

💖 *Contact Developer:*
wa.me/${DEV_INFO.number.replace(/\D/g, '')}

💖 *Join Channel:*
${DEV_INFO.channel}

💖 *Join Group:*
${DEV_INFO.group}

💖 *GitHub:*
${DEV_INFO.github}

💖 *Website:*
${DEV_INFO.website}

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖
        `.trim();

        // ── Send with Buttons ──
        await sendInteractiveMessage(mishu, from, {
            text: text,
            footer: `💖 ${botName}`,
            interactiveButtons: [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📱 CONTACT OWNER',
                        url: `https://wa.me/${DEV_INFO.number.replace(/\D/g, '')}`
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎀 CHANNEL',
                        url: DEV_INFO.channel
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '👥 GROUP',
                        url: DEV_INFO.group
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '💻 GITHUB',
                        url: DEV_INFO.github
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🌐 WEBSITE',
                        url: DEV_INFO.website
                    })
                }
            ]
        });

    } catch (error) {
        console.error('🌸 Owner Error:', error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// 👑 SHUTDOWN / RESTART COMMAND
// ============================================
mishu({
    pattern: "shutdown",
    alias: ["restart", "reboot"],
    desc: "👑 Restart the bot (Owner only)",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (mishu, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕\n\nOnly owner can use this command.");

    await reply("🔄 *Restarting bot...* Please wait! 💖");
    await sleep(2000);
    process.exit(0);
});
