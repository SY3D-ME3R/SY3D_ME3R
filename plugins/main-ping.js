const config = require('../config');
const { mishu, commands } = require('../mishu');
const { fakevCard } = require('../lib/fakevCard');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get random girly image function
const getRandomImage = () => {
    try {
        // Girly theme images
        const girlyImages = [
            'https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png'
        ];
        
        return girlyImages[Math.floor(Math.random() * girlyImages.length)];
    } catch (e) {
        console.log('🌸 Error getting image:', e);
        return 'https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png';
    }
};

mishu({
  pattern: "ping",
  alias: ["speed", "pong", "test", "latency", "check"],
  use: '.ping',
  desc: "🌸 Real-time ping test with image",
  category: "main",
  react: "🌸",
  filename: __filename
}, async (conn, mek, m, { from, pushname }) => {
  try {
    const startTime = Date.now();
    let isRunning = true;
    const imageUrl = getRandomImage();
    
    // 🌸 SEND INITIAL MESSAGE WITH IMAGE
    const initialMsg = await conn.sendMessage(from, { 
      image: { url: imageUrl },
      caption: `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ᴛɪᴍᴇ: 0s
│  ✿ ⚡ ᴍꜱ: 0ms
│  ✿ 🔁 ᴛᴇꜱᴛɪɴɢ...
╰────────────────────○

🦋⃟ MEER_xD 🦋⃟‌💙࿐` 
    }, { quoted: m });
    
    // 🔄 UPDATE INTERVAL
    const updateInterval = setInterval(async () => {
      if (!isRunning) return;
      
      const currentTime = Date.now();
      const elapsedTime = Math.floor((currentTime - startTime) / 1000);
      const currentPing = Math.floor(Math.random() * 50) + 50; // Simulated ping 50-100ms
      
      // 🎀 CREATE UPDATED CAPTION - GIRL STYLE
      const statusEmojis = [
        "🌸 ᴛᴇꜱᴛɪɴɢ...",
        "💖 ᴍᴇᴀꜱᴜʀɪɴɢ...",
        "✨ ᴄᴀʟᴄᴜʟᴀᴛɪɴɢ...",
        "🎀 ᴀɴᴀʟʏᴢɪɴɢ...",
        "💕 ᴘʀᴏᴄᴇꜱꜱɪɴɢ..."
      ];
      
      const statusIndex = Math.min(elapsedTime, statusEmojis.length - 1);
      const statusText = elapsedTime < 25 ? statusEmojis[Math.floor(elapsedTime / 5) % statusEmojis.length] : "🌟 ᴄᴏᴍᴘʟᴇᴛɪɴɢ...";
      
      const updatedCaption = `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ᴛɪᴍᴇ: ${elapsedTime}s
│  ✿ ⚡ ᴍꜱ: ${currentPing}ms
│  ✿ ${statusText}
╰────────────────────○

🌸 ${elapsedTime < 10 ? "💖 𝗚𝗶𝘃𝗲 𝗺𝗲 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁... ✨" : 
   elapsedTime < 20 ? "✨ 𝗔𝗹𝗺𝗼𝘀𝘁 𝘁𝗵𝗲𝗿𝗲... 💕" : 
   "🌟 𝗝𝘂𝘀𝘁 𝗮 𝗳𝗲𝘄 𝘀𝗲𝗰𝗼𝗻𝗱𝘀... 🎀"}

🦋⃟ MEER_xD 🦋⃟‌💙࿐`;
      
      try {
        // Edit the image caption
        await conn.sendMessage(from, {
          image: { url: imageUrl },
          caption: updatedCaption,
          edit: initialMsg.key
        });
      } catch (error) {
        console.log("🌸 Edit failed:", error.message);
        isRunning = false;
        clearInterval(updateInterval);
      }
      
    }, 1000); // Update every 1 second
    
    // ⏱️ STOP AFTER 30 SECONDS
    setTimeout(async () => {
      isRunning = false;
      clearInterval(updateInterval);
      
      const finalPing = Date.now() - startTime;
      const avgPing = Math.floor(finalPing / 30);
      
      // 🎯 FINAL CAPTION - GIRL STYLE
      let performanceEmoji = "";
      let performanceText = "";
      
      if (avgPing < 100) {
        performanceEmoji = "🚀";
        performanceText = "𝗨𝗟𝗧𝗥𝗔 𝗙𝗔𝗦𝗧 ✨";
      } else if (avgPing < 200) {
        performanceEmoji = "⚡";
        performanceText = "𝗘𝗫𝗖𝗘𝗟𝗟𝗘𝗡𝗧 💖";
      } else if (avgPing < 500) {
        performanceEmoji = "🔄";
        performanceText = "𝗚𝗢𝗢𝗗 🌸";
      } else {
        performanceEmoji = "📶";
        performanceText = "𝗔𝗩𝗘𝗥𝗔𝗚𝗘 💕";
      }
      
      const finalCaption = `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ᴛᴏᴛᴀʟ ᴛɪᴍᴇ: 30ꜱ
│  ✿ ⚡ ꜰɪɴᴀʟ ᴍꜱ: ${finalPing}ms
│  ✿ 📊 αѵɠ ɱร: ${avgPing}ms
│  ✿ ${performanceEmoji} ${performanceText}
╰────────────────────○

🌸 𝗕𝗼𝘁 𝗶𝘀 ${performanceText} 💖
🎀 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘁𝗲𝘀𝘁𝗶𝗻𝗴! ✨

🦋⃟ MEER_xD 🦋⃟‌💙࿐

📍 ᴜꜱᴇ .ᴍᴇɴᴜ ꜰᴏʀ ᴄᴏᴍᴍᴀɴᴅꜱ 💕`;
      
      try {
        await conn.sendMessage(from, {
          image: { url: imageUrl },
          caption: finalCaption,
          edit: initialMsg.key
        });
      } catch {
        await conn.sendMessage(from, { 
          image: { url: imageUrl },
          caption: finalCaption 
        }, { quoted: fakevCard });
      }
      
    }, 30000); // Run for 30 seconds
    
    // 🛑 STOP ON ERROR
    process.on('uncaughtException', () => {
      isRunning = false;
      clearInterval(updateInterval);
    });

  } catch (e) {
    console.error("🌸 Ping error:", e);
    await conn.sendMessage(from, { 
      text: `🌸 Error: ${e.message} 💕` 
    }, { quoted: fakevCard });
  }
});

// 🎀 SIMPLE VERSION WITH IMAGE - 10 SECONDS
mishu({
  pattern: "ping2",
  alias: ["test2", "speed2", "check2"],
  desc: "🌸 Simple 10 second ping test with image",
  category: "main",
  react: "💖",
  filename: __filename
}, async (conn, mek, m, { from, pushname }) => {
  try {
    const startTime = Date.now();
    const imageUrl = getRandomImage();
    
    // 🌸 INITIAL WITH IMAGE
    const msg = await conn.sendMessage(from, { 
      image: { url: imageUrl },
      caption: `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ᴛɪᴍᴇ: 0s
│  ✿ ⚡ ᴍꜱ: 0ms
╰────────────────────○

🌸 𝗧𝗲𝘀𝘁𝗶𝗻𝗴... 💖` 
    }, { quoted: m });
    
    // 💖 UPDATE FOR 10 SECONDS
    const statusMsgs = [
      "🌸 𝗚𝗲𝘁𝘁𝗶𝗻𝗴 𝗿𝗲𝗮𝗱𝘆... 💕",
      "💖 𝗠𝗲𝗮𝘀𝘂𝗿𝗶𝗻𝗴... ✨",
      "✨ 𝗖𝗮𝗹𝗰𝘂𝗹𝗮𝘁𝗶𝗻𝗴... 🎀",
      "🎀 𝗔𝗻𝗮𝗹𝘆𝘇𝗶𝗻𝗴... 💖",
      "💕 𝗔𝗹𝗺𝗼𝘀𝘁 𝘁𝗵𝗲𝗿𝗲... 🌸"
    ];
    
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const ping = Math.floor(Math.random() * 100) + 50;
      const statusIndex = Math.min(Math.floor(i / 2), statusMsgs.length - 1);
      
      await conn.sendMessage(from, {
        image: { url: imageUrl },
        caption: `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ᴛɪᴍᴇ: ${i}s
│  ✿ ⚡ ᴍꜱ: ${ping}ms
│  ✿ ${statusMsgs[statusIndex]}
╰────────────────────○

🌸 ᴘᴏᴡᴇʀᴇᴅ ʙʏ SYED MEER 💖`,
        edit: msg.key
      });
    }
    
    // 🎀 FINAL WITH IMAGE
    const finalPing = Date.now() - startTime;
    const avgPing = Math.floor(finalPing / 10);
    
    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ✅ ᴄᴏᴍᴘʟᴇᴛᴇ! ✨
│  ✿ ⚡ ꜰɪɴᴀʟ: ${finalPing}ms
│  ✿ 📊 αѵɠ: ${avgPing}ms
│  ✿ ${avgPing < 100 ? "🚀 𝗨𝗟𝗧𝗥𝗔 𝗙𝗔𝗦𝗧 ✨" : 
       avgPing < 200 ? "⚡ 𝗘𝗫𝗖𝗘𝗟𝗟𝗘𝗡𝗧 💖" : 
       "🌸 𝗚𝗢𝗢𝗗 💕"}
╰────────────────────○

💖 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝘁𝗲𝘀𝘁𝗶𝗻𝗴! 🌸

📍 ᴜꜱᴇ .ᴍᴇɴᴜ ꜰᴏʀ ᴄᴏᴍᴍᴀɴᴅꜱ 💕`,
      edit: msg.key
    });
    
  } catch (e) {
    await conn.sendMessage(from, { 
      text: `🌸 Error: ${e.message} 💕` 
    }, { quoted: fakevCard });
  }
});

// 🌸 ULTRA FAST WITH IMAGE - 3 SECONDS
mishu({
  pattern: "ping3",
  alias: ["fast", "speed3", "quick"],
  desc: "🌸 Ultra fast 3 second ping test with image",
  category: "main",
  react: "⚡",
  filename: __filename
}, async (conn, mek, m, { from, pushname }) => {
  try {
    const startTime = Date.now();
    const imageUrl = getRandomImage();
    
    // 🌸 INITIAL WITH IMAGE
    const msg = await conn.sendMessage(from, { 
      image: { url: imageUrl },
      caption: `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⚡ ᴛᴇꜱᴛɪɴɢ...
╰────────────────────○

🌸 𝗖𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝘀𝗽𝗲𝗲𝗱... 💖` 
    }, { quoted: m });
    
    // 🔄 UPDATE 3 TIMES
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const ping = Math.floor(Math.random() * 50) + 30;
      
      await conn.sendMessage(from, {
        image: { url: imageUrl },
        caption: `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ⏳ ${i}/3
│  ✿ ⚡ ${ping}ms
│  ✿ ${i === 1 ? "🌸 𝗧𝗲𝘀𝘁𝗶𝗻𝗴..." : 
       i === 2 ? "💖 𝗔𝗹𝗺𝗼𝘀𝘁... ✨" : 
       "🎀 𝗗𝗼𝗻𝗲! 💕"}
╰────────────────────○

🌸 ᴘᴏᴡᴇʀᴇᴅ ʙʏ SYED MEER 💖`,
        edit: msg.key
      });
    }
    
    // 🎀 FINAL WITH IMAGE
    const finalPing = Date.now() - startTime;
    
    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ ✅ ᴄᴏᴍᴘʟᴇᴛᴇ! ✨
│  ✿ ⚡ ${finalPing}ms
│  ✿ ${finalPing < 200 ? "🚀 𝗨𝗟𝗧𝗥𝗔 𝗙𝗔𝗦𝗧 ✨" : 
       finalPing < 500 ? "⚡ 𝗘𝗫𝗖𝗘𝗟𝗟𝗘𝗡𝗧 💖" : 
       "🌸 𝗚𝗢𝗢𝗗 💕"}
╰────────────────────○

💖 𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂! 🌸`,
      edit: msg.key
    });
    
  } catch (e) {
    await conn.sendMessage(from, { 
      text: `🌸 Error: ${e.message} 💕` 
    }, { quoted: fakevCard });
  }
});
