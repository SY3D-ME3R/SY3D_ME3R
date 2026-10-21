// ============================================
// 🌸 MEER_xD - LIST MENU WITH QUICK REPLY
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 📌 Using Gifted-btns quick_reply buttons
// ============================================

const { mishu } = require('../mishu');
const { sendButtons } = require('gifted-btns');

mishu({
    pattern: "listmenu",
    alias: ["list", "menulist", "lmenu", "interactive"],
    desc: "🌸 Interactive list menu with quick reply buttons",
    category: "main",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply, pushname }) => {
    try {
        // 🎀 Girl Style Welcome
        const welcomeText = `
╭═══✿══════════════╗
│  ✿ 🌸 MEER_xD 🌸 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👋 Hello ${pushname || 'Princess'}! 👸
│  ✿ 💖 Welcome to MEER_xD
│  ✿ 🎀 Click a button below to explore
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖
        `;

        // 🔥 SEND BUTTONS WITH QUICK REPLY
        await sendButtons(mishu, from, {
            title: "🌸 MEER_xD MENU 🌸",
            text: welcomeText,
            footer: "💖 Tap a button to explore commands",
            image: {
                url: "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png"
            },
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "📥 DOWNLOAD",
                        id: ".download-menu"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🎀 MEDIA TOOLS",
                        id: ".media-menu"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "👑 FUN & GAMES",
                        id: ".fun-menu"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🛡️ GROUP TOOLS",
                        id: ".group-menu"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "⚙️ UTILITY",
                        id: ".utility-menu"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🔒 OWNER",
                        id: ".owner-menu"
                    })
                }
            ]
        });

    } catch (error) {
        console.error("🌸 List Menu Error:", error);
        
        // 🔥 FALLBACK: Simple menu
        try {
            const fallbackMenu = `
╭═══✿══════════════╗
│  ✿ 🌸 MEER_xD 🌸 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 📋 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 📥 .download-menu - Download cmds
│  ✿ 🎀 .media-menu - Media tools
│  ✿ 👑 .fun-menu - Fun & games
│  ✿ 🛡️ .group-menu - Group tools
│  ✿ ⚙️ .utility-menu - Utility cmds
│  ✿ 🔒 .owner-menu - Owner cmds
╰═══✿══════════════╝

🌸 *Use .menu for full commands list*
💖 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 🌸
            `;
            await reply(fallbackMenu);
        } catch (fallbackError) {
            reply(`🌸 Error loading menu: ${error.message} 💕`);
        }
    }
});

// ============================================
// 📥 DOWNLOAD MENU
// ============================================
mishu({
    pattern: "download-menu",
    alias: ["dlmenu", "downloads"],
    desc: "🌸 Download commands menu",
    category: "menu",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply }) => {
    const menu = `
╭═══✿══════════════╗
│  ✿ 📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🎵 .audio - YouTube Audio
│  ✿ 🎬 .video - YouTube Video
│  ✿ 📸 .igdl - Instagram Media
│  ✿ 🎵 .spotify - Spotify Music
│  ✿ 📱 .apk - APK Download
│  ✿ 📦 .mediafire - MediaFire
│  ✿ 📘 .fb - Facebook Video
│  ✿ 🎵 .tiktok - TikTok Video
│  ✿ 📦 .gitclone - GitHub Repo
│  ✿ 🎧 .ringtone - Ringtone
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

    await sendButtons(mishu, from, {
        title: "🌸 DOWNLOAD MENU 🌸",
        text: menu,
        footer: "💖 Tap to go back",
        image: {
            url: "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png"
        },
        buttons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔙 BACK TO MAIN",
                    id: ".listmenu"
                })
            }
        ]
    });
});

// ============================================
// 🎀 MEDIA MENU
// ============================================
mishu({
    pattern: "media-menu",
    alias: ["mediamenu", "media"],
    desc: "🌸 Media tools menu",
    category: "menu",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply }) => {
    const menu = `
╭═══✿══════════════╗
│  ✿ 🎀 𝗠𝗘𝗗𝗜𝗔 𝗧𝗢𝗢𝗟𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🎨 .sticker - Sticker Maker
│  ✿ 📸 .photo - Sticker to Image
│  ✿ 🎵 .tomp3 - Video to MP3
│  ✿ 🎙️ .toptt - Video to Voice
│  ✿ 🎨 .togif - Video to GIF
│  ✿ 🖼️ .s2i - Sticker to Image
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

    await sendButtons(mishu, from, {
        title: "🌸 MEDIA TOOLS 🌸",
        text: menu,
        footer: "💖 Tap to go back",
        image: {
            url: "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png"
        },
        buttons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔙 BACK TO MAIN",
                    id: ".listmenu"
                })
            }
        ]
    });
});

// ============================================
// 👑 FUN MENU
// ============================================
mishu({
    pattern: "fun-menu",
    alias: ["funmenu", "games"],
    desc: "🌸 Fun & games menu",
    category: "menu",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply }) => {
    const menu = `
╭═══✿══════════════╗
│  ✿ 👑 𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🎮 .quiz - Quiz Game
│  ✿ 🎲 .guess - Guess Word
│  ✿ 🔮 .8ball - Magic 8 Ball
│  ✿ ❤️ .lovetest - Love Test
│  ✿ 🔄 .rps - Rock Paper Scissors
│  ✿ 😂 .joke - Random Joke
│  ✿ 😢 .cry - Cry Reaction
│  ✿ 🤗 .hug - Hug Reaction
│  ✿ 💋 .kiss - Kiss Reaction
│  ✿ ✊ .slap - Slap Reaction
│  ✿ 🎀 .emix - Emoji Mix
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

    await sendButtons(mishu, from, {
        title: "🌸 FUN & GAMES 🌸",
        text: menu,
        footer: "💖 Tap to go back",
        image: {
            url: "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png"
        },
        buttons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔙 BACK TO MAIN",
                    id: ".listmenu"
                })
            }
        ]
    });
});

// ============================================
// 🛡️ GROUP MENU
// ============================================
mishu({
    pattern: "group-menu",
    alias: ["groupmenu", "gmenu"],
    desc: "🌸 Group tools menu",
    category: "menu",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply }) => {
    const menu = `
╭═══✿══════════════╗
│  ✿ 🛡️ 𝗚𝗥𝗢𝗨𝗣 𝗧𝗢𝗢𝗟𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👥 .tagall - Tag All Members
│  ✿ 🔇 .hidetag - Hide Tag All
│  ✿ ➕ .add - Add User
│  ✿ 🚫 .kick - Kick User
│  ✿ 👑 .promote - Promote Admin
│  ✿ ⬇️ .demote - Demote Admin
│  ✿ 🔒 .lockgc - Lock Group
│  ✿ 🔓 .unlockgc - Unlock Group
│  ✿ 🔇 .mute - Mute Group
│  ✿ 🔊 .unmute - Unmute Group
│  ✿ 🔄 .revoke - Reset Group Link
│  ✿ 🔗 .invite - Get Group Link
│  ✿ 🚫 .antilink - Anti-Link
│  ✿ 🚫 .out - Country Kick
│  ✿ 📋 .requestlist - Join Requests
│  ✿ ✅ .acceptall - Accept All
│  ✿ ❌ .rejectall - Reject All
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

    await sendButtons(mishu, from, {
        title: "🌸 GROUP TOOLS 🌸",
        text: menu,
        footer: "💖 Tap to go back",
        image: {
            url: "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png"
        },
        buttons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔙 BACK TO MAIN",
                    id: ".listmenu"
                })
            }
        ]
    });
});

// ============================================
// ⚙️ UTILITY MENU
// ============================================
mishu({
    pattern: "utility-menu",
    alias: ["utility", "utilmenu"],
    desc: "🌸 Utility commands menu",
    category: "menu",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply }) => {
    const menu = `
╭═══✿══════════════╗
│  ✿ ⚙️ 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 𝗠𝗘𝗡𝗨 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏱️ .ping - Ping Test
│  ✿ 🌸 .alive - Bot Status
│  ✿ ⏳ .uptime - Bot Uptime
│  ✿ 📸 .getpp - Get Profile Pic
│  ✿ 🎵 .lyrics - Song Lyrics
│  ✿ 🌤️ .weather - Weather Info
│  ✿ 🆔 .jid - Get Chat JID
│  ✿ 💾 .ss - Status Saver
│  ✿ 👑 .vv - View Once Saver
│  ✿ 🔑 .pair - Pairing Code
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

    await sendButtons(mishu, from, {
        title: "🌸 UTILITY MENU 🌸",
        text: menu,
        footer: "💖 Tap to go back",
        image: {
            url: "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png"
        },
        buttons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔙 BACK TO MAIN",
                    id: ".listmenu"
                })
            }
        ]
    });
});

// ============================================
// 🔒 OWNER MENU
// ============================================
mishu({
    pattern: "owner-menu",
    alias: ["ownermenu", "omenu"],
    desc: "🌸 Owner commands menu",
    category: "menu",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, { from, reply }) => {
    const menu = `
╭═══✿══════════════╗
│  ✿ 🔒 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 🛡️ .antidelete - Anti-Delete
│  ✿ 🔗 .antilink - Anti-Link
│  ✿ 👑 .vv - View Once Saver
│  ✿ 🌸 .autoreact - Auto React
│  ✿ 🚫 .ban - Ban User
│  ✿ ✅ .unban - Unban User
│  ✿ 🚫 .block - Block User
│  ✿ 🔓 .unblock - Unblock User
│  ✿ 👋 .leave - Leave Group
│  ✿ 🎯 .pair - Get Pairing Code
│  ✿ 🚫 .removeadmins - Remove Admins
│  ✿ 🚫 .removemembers - Remove Members
│  ✿ 🚫 .removeall2 - Remove All
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

    await sendButtons(mishu, from, {
        title: "🌸 OWNER MENU 🌸",
        text: menu,
        footer: "💖 Tap to go back",
        image: {
            url: "https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png"
        },
        buttons: [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔙 BACK TO MAIN",
                    id: ".listmenu"
                })
            }
        ]
    });
});
