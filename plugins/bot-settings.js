// ============================================
// 🌸 MEER_xD - BOT COMMANDS
// 👑 Settings + Group Management
// 💖 Girl Power Mode: ON
// ============================================

const { mishu } = require('../mishu');
const config = require('../settings');
const { sleep } = require('../lib/functions');

// ============================================
// 📌 VARIABLES
// ============================================
let antibotAction = "off";
let warnings = {};

// ============================================
// 🔧 PREFIX COMMAND
// ============================================
mishu({
    pattern: "prefix",
    alias: ["setprefix"],
    desc: "🌸 Change bot prefix",
    category: "settings",
    react: "🔧",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕\n\nOnly owner can use this command.");

    const newPrefix = args[0];
    if (!newPrefix) return reply("❌ Please provide a new prefix. Example: `.prefix !`");

    config.PREFIX = newPrefix;
    return reply(`✅ Prefix successfully changed to *${newPrefix}*`);
});

// ============================================
// 📌 MODE COMMAND
// ============================================
mishu({
    pattern: "mode",
    desc: "🌸 Set bot mode",
    category: "settings",
    react: "📌",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    if (!args[0]) {
        return reply(`📌 Current mode: *${config.MODE || 'public'}*\n\nUsage: .mode private/public/groups/inbox`);
    }

    const mode = args[0].toLowerCase();
    if (["private", "public", "groups", "inbox"].includes(mode)) {
        config.MODE = mode;
        return reply(`✅ Bot mode set to *${mode.toUpperCase()}*`);
    }
    return reply("❌ Invalid mode. Use: private, public, groups, inbox");
});

// ============================================
// ⌨️ AUTO TYPING
// ============================================
mishu({
    pattern: "autotyping",
    desc: "🌸 Enable/disable auto-typing",
    category: "settings",
    react: "⌨️",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .autotyping on/off");

    config.AUTO_TYPING = status === "on" ? "true" : "false";
    return reply(`✅ Auto typing ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 🟢 ALWAYS ONLINE
// ============================================
mishu({
    pattern: "alwaysonline",
    desc: "🌸 Enable/disable always online",
    category: "settings",
    react: "🟢",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply, from }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .alwaysonline on/off");

    config.ALWAYS_ONLINE = status === "on" ? "true" : "false";
    await mishu.sendPresenceUpdate(status === "on" ? "available" : "unavailable", from);
    return reply(`✅ Bot is now ${status === "on" ? "online" : "offline"}`);
});

// ============================================
// 🎙️ AUTO RECORDING
// ============================================
mishu({
    pattern: "autorecording",
    desc: "🌸 Enable/disable auto-recording",
    category: "settings",
    react: "🎙️",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply, from }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .autorecording on/off");

    config.AUTO_RECORDING = status === "on" ? "true" : "false";
    await mishu.sendPresenceUpdate(status === "on" ? "recording" : "available", from);
    return reply(`✅ Auto recording ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 👁️ AUTO SEEN
// ============================================
mishu({
    pattern: "autoseen",
    alias: ["autostatusview"],
    desc: "🌸 Enable/disable auto status view",
    category: "settings",
    react: "👁️",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .autoseen on/off");

    config.AUTO_STATUS_SEEN = status === "on" ? "true" : "false";
    return reply(`✅ Auto seen ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// ❤️ STATUS REACT
// ============================================
mishu({
    pattern: "statusreact",
    desc: "🌸 Enable/disable auto status reaction",
    category: "settings",
    react: "❤️",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .statusreact on/off");

    config.AUTO_STATUS_REACT = status === "on" ? "true" : "false";
    return reply(`✅ Status react ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 📖 AUTO READ
// ============================================
mishu({
    pattern: "readmessage",
    alias: ["autoread"],
    desc: "🌸 Enable/disable auto read",
    category: "settings",
    react: "📖",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .readmessage on/off");

    config.READ_MESSAGE = status === "on" ? "true" : "false";
    return reply(`✅ Auto read ${status === "on" ? "enabled" : "disabled"}`);
});
// ============================================
// 🎨 AUTO STICKER
// ============================================
mishu({
    pattern: "autosticker",
    desc: "🌸 Enable/disable auto-sticker",
    category: "settings",
    react: "🎨",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .autosticker on/off");

    config.AUTO_STICKER = status === "on" ? "true" : "false";
    return reply(`✅ Auto-sticker ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 💬 AUTO REPLY
// ============================================
mishu({
    pattern: "autoreply",
    desc: "🌸 Enable/disable auto-reply",
    category: "settings",
    react: "💬",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .autoreply on/off");

    config.AUTO_REPLY = status === "on" ? "true" : "false";
    return reply(`✅ Auto-reply ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 💖 HEART REACT
// ============================================
mishu({
    pattern: "heartreact",
    alias: ["heart"],
    desc: "🌸 Enable/disable heart react",
    category: "settings",
    react: "💖",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .heartreact on/off");

    config.HEART_REACT = status === "on" ? "true" : "false";
    return reply(`✅ Heart react ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 📢 STATUS REPLY
// ============================================
mishu({
    pattern: "statusreply",
    alias: ["autostatusreply"],
    desc: "🌸 Enable/disable status reply",
    category: "settings",
    react: "📢",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .statusreply on/off");

    config.AUTO_STATUS_REPLY = status === "on" ? "true" : "false";
    return reply(`✅ Status reply ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 🎙️ AUTO VOICE
// ============================================
mishu({
    pattern: "autovoice",
    desc: "🌸 Enable/disable auto voice",
    category: "settings",
    react: "🎙️",
    filename: __filename
}, async (mishu, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) return reply("🌸 Usage: .autovoice on/off");

    config.AUTO_VOICE = status === "on" ? "true" : "false";
    return reply(`✅ Auto voice ${status === "on" ? "enabled" : "disabled"}`);
});

// ============================================
// 🤖 ANTI BOT (Group)
// ============================================
mishu({
    pattern: "antibot",
    desc: "🌸 Anti-bot protection in groups",
    category: "group",
    react: "🤖",
    filename: __filename
}, async (mishu, mek, m, { args, reply }) => {
    const action = args[0]?.toLowerCase();
    if (!["off", "warn", "delete", "kick"].includes(action)) {
        return reply(`🌸 Current: ${antibotAction.toUpperCase()}\n\nUsage: .antibot off/warn/delete/kick`);
    }

    antibotAction = action;
    return reply(`✅ Antibot set to: ${action.toUpperCase()}`);
});

// ============================================
// 📢 BROADCAST
// ============================================
mishu({
    pattern: "broadcast",
    desc: "🌸 Send broadcast to all groups",
    category: "owner",
    react: "📢",
    filename: __filename
}, async (mishu, mek, m, { from, text, isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");
    if (!text) return reply("🌸 Usage: .broadcast <message>");

    try {
        const groups = await mishu.groupFetchAllParticipating();
        const ids = Object.keys(groups);

        reply(`📢 Sending to ${ids.length} groups...`);

        let sent = 0;
        for (const id of ids) {
            try {
                await mishu.sendMessage(id, { text });
                sent++;
                await sleep(1000);
            } catch (e) {}
        }

        return reply(`✅ Sent to ${sent}/${ids.length} groups!`);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// ============================================
// 📋 SETTINGS LIST
// ============================================
mishu({
    pattern: "settings",
    alias: ["cmdlist", "setlist"],
    desc: "🌸 List all settings",
    category: "settings",
    react: "📋",
    filename: __filename
}, async (mishu, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("🌸 *Access Denied!* 💕");

    const list = `
╭────────────────────◇
│  ✿ ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🔧 Prefix: ${config.PREFIX || '.'}
│  ✿ 📌 Mode: ${config.MODE || 'public'}
│  ✿ ⌨️ Auto Typing: ${config.AUTO_TYPING || 'off'}
│  ✿ 🟢 Always Online: ${config.ALWAYS_ONLINE || 'off'}
│  ✿ 🎙️ Auto Recording: ${config.AUTO_RECORDING || 'off'}
│  ✿ 👁️ Auto Seen: ${config.AUTO_STATUS_SEEN || 'off'}
│  ✿ ❤️ Status React: ${config.AUTO_STATUS_REACT || 'off'}
│  ✿ 📖 Auto Read: ${config.READ_MESSAGE || 'off'}
│  ✿ 🚫 Anti Bad Word: ${config.ANTI_BAD_WORD || 'off'}
│  ✿ 🎨 Auto Sticker: ${config.AUTO_STICKER || 'off'}
│  ✿ 💬 Auto Reply: ${config.AUTO_REPLY || 'off'}
│  ✿ ❤️ Auto React: ${config.AUTO_REACT || 'off'}
│  ✿ 💖 Heart React: ${config.HEART_REACT || 'off'}
│  ✿ 📢 Status Reply: ${config.AUTO_STATUS_REPLY || 'off'}
│  ✿ 🎙️ Auto Voice: ${config.AUTO_VOICE || 'off'}
│  ✿ 🚫 Anti Link: ${config.ANTI_LINK || 'off'}
│  ✿ 🤖 Anti Bot: ${antibotAction || 'off'}
╰────────────────────○

🌸 *To change: .<command> on/off*
> 🦋⃟ MEER_xD 🦋⃟‌💙࿐`;

    return reply(list);
});

console.log('🌸 MEER_xD - Bot Commands Loaded! 💖');
