// ============================================
// 🌸 MEER_xD - GROUP COMMANDS (FIXED)
// 👑 Developer: SYED MEER
// 💖 Girl Power Mode: ON
// 🔧 FIXED: Bot self-kick prevention
// ============================================

const { mishu } = require('../mishu');
const config = require('../settings');
const { sleep } = require('../lib/functions');
const { isUrl } = require('../lib/functions');

// ============================================
// 🔧 HELPER: GET TARGET USERS
// ============================================
function getTargetUsers(mek, m, mentionedJid) {
    let users = [];
    
    // 1. Check mentionedJid (direct from command)
    if (mentionedJid && mentionedJid.length > 0) {
        users = mentionedJid;
    }
    
    // 2. Check from message contextInfo (mentions in text)
    if (users.length === 0 && m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        users = m.message.extendedTextMessage.contextInfo.mentionedJid;
    }
    
    // 3. Check quoted message
    if (users.length === 0 && mek.quoted && mek.quoted.sender) {
        users = [mek.quoted.sender];
    }
    
    // 4. Check from quoted message in contextInfo
    if (users.length === 0 && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quotedSender = m.message.extendedTextMessage.contextInfo.participant;
        if (quotedSender) {
            users = [quotedSender];
        }
    }
    
    return users;
}

// ============================================
// 🚫 KICK COMMAND (FIXED - Bot Self-Kick Prevention)
// ============================================
mishu({
  pattern: "kick",
  alias: ["k", "remove"],
  desc: "🌸 Remove a user from the group",
  category: "group",
  react: "🌸",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isGroup,
  quoted,
  reply,
  mentionedJid,
  sender,
  isOwner,
  isCreator,
  isAdmins,
  isBotAdmins
}) => {
  try {
    if (!isGroup) return reply("🌸 This command only works in groups! 💕");
    if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
    if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

    let users = getTargetUsers(mek, m, mentionedJid);

    if (users.length === 0) {
      return reply("🌸 Please mention or quote a user to remove!\nExample: .kick @user 💕");
    }

    users = [...new Set(users.filter(user => user && user.includes('@')))];
    if (users.length === 0) return reply("🌸 Couldn't determine target user! 💕");

    // 🔧 FIX: Get bot JID and remove it from users array
    const botJid = mishu.user.id;
    const botNumber = botJid.split(':')[0].split('@')[0];
    
    // 🔧 FIX: Filter out bot's JID from users
    users = users.filter(user => {
        const userNumber = user.split('@')[0];
        return user !== botJid && userNumber !== botNumber;
    });

    // 🔧 FIX: Also filter out owner's JID if trying to remove owner
    const ownerNumber = config.OWNER_NUMBER || '923118456830';
    users = users.filter(user => {
        const userNumber = user.split('@')[0];
        return userNumber !== ownerNumber;
    });

    if (users.length === 0) {
      return reply("🌸 Cannot remove bot or owner! 💕");
    }

    if (users.includes(sender) && !isOwner && !isCreator) {
      return reply("🌸 You can't kick yourself! 💕");
    }

    try {
      await mishu.groupParticipantsUpdate(from, users, "remove");
      
      if (users.length === 1) {
        reply(`✅ Successfully removed @${users[0].split('@')[0]} from group.`, { mentions: users });
      } else {
        reply(`✅ Successfully removed ${users.length} users from group.`, { mentions: users });
      }
    } catch (kickError) {
      if (kickError.message.includes("not authorized") || kickError.message.includes("admin")) {
        reply("🌸 Bot needs to be admin to kick users! Use: .botadmin 👑💖");
      } else {
        reply(`🌸 Failed to kick: ${kickError.message} 💕`);
      }
    }

  } catch (err) {
    console.error("🌸 Kick Error:", err);
    reply(`🌸 Error: ${err.message} 💕`);
  }
});

// ============================================
// 👑 PROMOTE COMMAND
// ============================================
mishu({
  pattern: "promote",
  alias: ["p", "giveadmin", "makeadmin"],
  desc: "🌸 Promote a user to admin",
  category: "group",
  react: "🌸",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isGroup,
  quoted,
  reply,
  mentionedJid,
  sender,
  isOwner,
  isCreator,
  isAdmins,
  isBotAdmins
}) => {
  try {
    if (!isGroup) return reply("🌸 This command only works in groups! 💕");
    if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
    if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

    let users = getTargetUsers(mek, m, mentionedJid);

    if (users.length === 0) {
      return reply("🌸 Please mention or quote a user to promote!\nExample: .promote @user 💕");
    }

    users = [...new Set(users.filter(user => user && user.includes('@')))];
    if (users.length === 0) return reply("🌸 Couldn't determine target user! 💕");

    try {
      await mishu.groupParticipantsUpdate(from, users, "promote");
      
      if (users.length === 1) {
        reply(`✅ Successfully promoted @${users[0].split('@')[0]} to admin.`, { mentions: users });
      } else {
        reply(`✅ Successfully promoted ${users.length} users to admin.`, { mentions: users });
      }
    } catch (promoteError) {
      if (promoteError.message.includes("not authorized") || promoteError.message.includes("admin")) {
        reply("🌸 Bot needs to be admin to promote users! Use: .botadmin 👑💖");
      } else if (promoteError.message.includes("already")) {
        reply("🌸 User is already an admin! 💕");
      } else {
        reply(`🌸 Failed to promote: ${promoteError.message} 💕`);
      }
    }

  } catch (err) {
    console.error("🌸 Promote Error:", err);
    reply(`🌸 Error: ${err.message} 💕`);
  }
});

// ============================================
// ⬇️ DEMOTE COMMAND
// ============================================
mishu({
  pattern: "demote",
  alias: ["d", "dismiss", "removeadmin"],
  desc: "🌸 Demote a group admin",
  category: "group",
  react: "🌸",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isGroup,
  quoted,
  reply,
  mentionedJid,
  sender,
  isOwner,
  isCreator,
  isAdmins,
  isBotAdmins
}) => {
  try {
    if (!isGroup) return reply("🌸 This command only works in groups! 💕");
    if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
    if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

    let users = getTargetUsers(mek, m, mentionedJid);

    if (users.length === 0) {
      return reply("🌸 Please mention or quote an admin to demote!\nExample: .demote @admin 💕");
    }

    users = [...new Set(users.filter(user => user && user.includes('@')))];
    if (users.length === 0) return reply("🌸 Couldn't determine target user! 💕");

    try {
      await mishu.groupParticipantsUpdate(from, users, "demote");
      
      if (users.length === 1) {
        reply(`✅ Successfully demoted @${users[0].split('@')[0]} from admin.`, { mentions: users });
      } else {
        reply(`✅ Successfully demoted ${users.length} admins.`, { mentions: users });
      }
    } catch (demoteError) {
      if (demoteError.message.includes("not authorized") || demoteError.message.includes("admin")) {
        reply("🌸 Bot needs to be admin to demote users! Use: .botadmin 👑💖");
      } else if (demoteError.message.includes("not admin")) {
        reply("🌸 User is not an admin! 💕");
      } else {
        reply(`🌸 Failed to demote: ${demoteError.message} 💕`);
      }
    }

  } catch (err) {
    console.error("🌸 Demote Error:", err);
    reply(`🌸 Error: ${err.message} 💕`);
  }
});

// ============================================
// 🤖 BOT ADMIN COMMAND
// ============================================
mishu({
  pattern: "botadmin",
  alias: ["makebotadmin", "giveadminbot", "adminbot"],
  desc: "🌸 Make bot admin in group",
  category: "group",
  react: "🌸",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isGroup,
  reply,
  isOwner,
  isCreator,
  isAdmins
}) => {
  try {
    if (!isGroup) return reply("🌸 This command only works in groups! 💕");
    if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");

    try {
      const groupMetadata = await mishu.groupMetadata(from);
      const botParticipant = groupMetadata.participants.find(p => p.id === mishu.user.id);
      if (botParticipant && botParticipant.admin) {
        return reply("✅ Bot is already admin in this group!");
      }
    } catch (e) {
      console.log("🌸 Could not fetch group metadata, trying to promote bot...");
    }

    try {
      await mishu.groupParticipantsUpdate(from, [mishu.user.id], "promote");
      reply(`✅ *Bot ko admin banaya gaya!*\n\n🌸 Ab aap use kar sakte hain:\n• .promote @user\n• .demote @admin\n• .kick @user\n• .add @user\n\n💖 Powered by MEER_xD`);
    } catch (err) {
      if (err.message.includes("not authorized")) {
        reply(`🌸 Bot ko admin nahi bana paaye.\n\n✳️ *Karan:* Aapke paas permission nahi hai bot ko admin banane ka.\n\n✳️ *Manual tarika:*\n1. Group settings mein jao\n2. "Group permissions" par click karo\n3. "Add members" mein jao\n4. Bot ko dhundo aur manually admin banao 💕`);
      } else {
        reply(`🌸 Failed to make bot admin: ${err.message} 💕`);
      }
    }

  } catch (err) {
    console.error("🌸 Bot Admin Error:", err);
    reply(`🌸 Error: ${err.message} 💕`);
  }
});

// ============================================
// ➕ ADD COMMAND
// ============================================
mishu({
  pattern: "add",
  alias: ["adduser", "addmember"],
  desc: "🌸 Add user to group",
  category: "group",
  react: "🌸",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isGroup,
  reply,
  isOwner,
  isCreator,
  isAdmins,
  isBotAdmins,
  args = [],
  mentionedJid,
  text,
  body
}) => {
  try {
    if (!isGroup) return reply("🌸 This command only works in groups! 💕");
    if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
    if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

    let users = getTargetUsers(mek, m, mentionedJid);

    if (users.length === 0 && text) {
      const textString = String(text || "").trim();
      const directNumbers = textString.match(/\d{10,15}/g);
      if (directNumbers) {
        users = directNumbers.map(num => {
          let cleanNum = num.replace(/\D/g, '');
          if (cleanNum.startsWith('3')) {
            cleanNum = '92' + cleanNum;
          }
          if (cleanNum.length >= 10) {
            return cleanNum + '@s.whatsapp.net';
          }
          return null;
        }).filter(Boolean);
      }
    }

    if (users.length === 0 && body) {
      const bodyString = String(body);
      const numbers = bodyString.match(/\d{10,15}/g);
      if (numbers) {
        users = numbers.map(num => {
          let cleanNum = num.replace(/\D/g, '');
          if (cleanNum.startsWith('3')) {
            cleanNum = '92' + cleanNum;
          }
          return cleanNum + '@s.whatsapp.net';
        }).filter(num => num.length >= 10);
      }
    }

    if (users.length === 0) {
      return reply(`🌸 Please mention users or provide phone numbers!\n\nExamples:\n• .add @user (mention someone)\n• .add 923001234567\n• .add 3001234567\n• .add @user1 @user2 💕`);
    }

    users = [...new Set(users)];
    const validUsers = users.filter(user => {
      const num = user.split('@')[0];
      return num.length >= 10 && num.length <= 16;
    });

    if (validUsers.length === 0) {
      return reply("🌸 Invalid phone numbers! Please provide valid 10-16 digit numbers. 💕");
    }

    try {
      await mishu.groupParticipantsUpdate(from, validUsers, "add");
      reply(`✅ ${validUsers.length} user(s) added to the group.\n\nAdded: ${validUsers.map(u => u.split('@')[0]).join(', ')}`);
    } catch (addError) {
      if (addError.message.includes("not authorized") || addError.message.includes("admin")) {
        reply("🌸 Bot needs to be admin to add users! Use: .botadmin 👑💖");
      } else if (addError.message.includes("not in contacts")) {
        reply("🌸 Some users are not in your contacts. Please add them to your WhatsApp contacts first. 💕");
      } else if (addError.message.includes("invite")) {
        reply("🌸 Cannot add users. Group may have restrictions or users have privacy settings. 💕");
      } else {
        reply(`🌸 Failed to add user: ${addError.message} 💕`);
      }
    }

  } catch (err) {
    console.error("🌸 Add Error:", err);
    reply(`🌸 Error: ${err.message || "Check the numbers and try again"} 💕`);
  }
});

// ============================================
// 📢 TAGALL COMMAND
// ============================================
mishu({
  pattern: "tagall",
  alias: ["gc_tagall", "mentionall"],
  desc: "🌸 Tag all members",
  category: "group",
  react: "🌸",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  participants,
  reply,
  isGroup,
  body,
  command
}) => {
  try {
    if (!isGroup) return reply("🌸 This command only works in groups! 💕");

    let message = body.slice(body.indexOf(command) + command.length).trim();
    if (!message) message = "🌸 Attention Everyone! 💖";

    let text = `📢 *TAG ALL*\n\n📝 Message: ${message}\n\n`;
    
    participants.forEach((member, i) => {
      text += `${i+1}. @${member.id.split('@')[0]}\n`;
    });
    
    text += `\n✅ Total: ${participants.length} members`;

    await mishu.sendMessage(from, {
      text: text,
      mentions: participants.map(p => p.id)
    }, { quoted: mek });

  } catch (err) {
    console.error("🌸 TagAll Error:", err);
    reply(`🌸 Error: ${err.message} 💕`);
  }
});

// ============================================
// 🔍 ADMIN CHECK COMMAND
// ============================================
mishu({
  pattern: "admincheck",
  alias: ["checkadmin", "admintest"],
  desc: "🌸 Check admin status",
  category: "group",
  react: "🌸",
  filename: __filename
}, async (mishu, mek, m, {
  from,
  isGroup,
  reply,
  sender,
  isOwner,
  isCreator,
  isAdmins,
  isBotAdmins,
  participants
}) => {
  try {
    if (!isGroup) return reply("🌸 This command only works in groups! 💕");

    let message = `╭═══✿══════════════╗
│  ✿ 👑 𝗔𝗗𝗠𝗜𝗡 𝗦𝗧𝗔𝗧𝗨𝗦 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 👤 You: @${sender.split('@')[0]}
│  ✿ 👑 Queen: ${isCreator ? '✅ YES' : '❌ NO'}
│  ✿ 👥 Members: ${participants?.length || 'N/A'}
│  ✿ 🤖 Bot Admin: ${isBotAdmins ? '✅ YES' : '❌ NO'}
│  ✿ 👤 You Admin: ${isAdmins ? '✅ YES' : '❌ NO'}
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

    await mishu.sendMessage(from, {
      text: message,
      mentions: [sender]
    }, { quoted: mek });

  } catch (err) {
    console.error("🌸 Admin Check Error:", err);
    reply(`🌸 Error: ${err.message} 💕`);
  }
});

// ============================================
// 🚫 REMOVE NON-ADMIN MEMBERS
// ============================================
mishu({
    pattern: "removemembers",
    alias: ["kickall", "endgc", "endgroup"],
    desc: "🌸 Remove all non-admin members from the group",
    react: "🌸",
    category: "group",
    filename: __filename,
}, 
async (mishu, mek, m, {
    from,
    isGroup,
    isOwner,
    isCreator,
    isBotAdmins,
    groupMetadata,
    groupAdmins,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isOwner && !isCreator) return reply("🌸 Only my Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        const allParticipants = groupMetadata.participants || [];
        const nonAdminParticipants = allParticipants.filter(member => !groupAdmins.includes(member.id));

        if (nonAdminParticipants.length === 0) {
            return reply("🌸 No non-admin members to remove! 💕");
        }

        await reply(`🌸 Removing ${nonAdminParticipants.length} non-admin members...`);

        let removed = 0;
        for (let participant of nonAdminParticipants) {
            try {
                await mishu.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
                removed++;
            } catch (e) {
                console.error(`🌸 Failed to remove ${participant.id}:`, e);
            }
        }

        reply(`✅ Successfully removed ${removed} non-admin members!`);
    } catch (e) {
        console.error("🌸 Remove Members Error:", e);
        reply(`🌸 Error: ${e.message} 💕`);
    }
});

// ============================================
// 👑 REMOVE ADMINS (Excluding Bot & Owner)
// ============================================
mishu({
    pattern: "removeadmins",
    alias: ["kickadmins", "kickall3", "deladmins"],
    desc: "🌸 Remove all admins except bot and owner",
    react: "🌸",
    category: "group",
    filename: __filename,
}, 
async (mishu, mek, m, {
    from,
    isGroup,
    isOwner,
    isCreator,
    isBotAdmins,
    senderNumber,
    groupMetadata,
    groupAdmins,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isOwner && !isCreator) return reply("🌸 Only my Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        const botOwner = mishu.user.id.split(":")[0];
        const allParticipants = groupMetadata.participants || [];
        
        const adminParticipants = allParticipants.filter(member => 
            groupAdmins.includes(member.id) && 
            member.id !== mishu.user.id && 
            member.id !== `${botOwner}@s.whatsapp.net`
        );

        if (adminParticipants.length === 0) {
            return reply("🌸 No admins to remove! 💕");
        }

        await reply(`🌸 Removing ${adminParticipants.length} admins...`);

        let removed = 0;
        for (let participant of adminParticipants) {
            try {
                await mishu.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
                removed++;
            } catch (e) {
                console.error(`🌸 Failed to remove ${participant.id}:`, e);
            }
        }

        reply(`✅ Successfully removed ${removed} admins (excluding bot and owner)!`);
    } catch (e) {
        console.error("🌸 Remove Admins Error:", e);
        reply(`🌸 Error: ${e.message} 💕`);
    }
});

// ============================================
// 🎯 REMOVE ALL MEMBERS (Excluding Bot & Owner)
// ============================================
mishu({
    pattern: "removeall2",
    alias: ["kickall2", "endgc2", "endgroup2"],
    desc: "🌸 Remove all members excluding bot and owner",
    react: "🌸",
    category: "group",
    filename: __filename,
}, 
async (mishu, mek, m, {
    from,
    isGroup,
    isOwner,
    isCreator,
    isBotAdmins,
    senderNumber,
    groupMetadata,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isOwner && !isCreator) return reply("🌸 Only my Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        const botOwner = mishu.user.id.split(":")[0];
        const allParticipants = groupMetadata.participants || [];

        if (allParticipants.length === 0) {
            return reply("🌸 Group has no members! 💕");
        }

        const participantsToRemove = allParticipants.filter(
            participant => participant.id !== mishu.user.id && 
                          participant.id !== `${botOwner}@s.whatsapp.net`
        );

        if (participantsToRemove.length === 0) {
            return reply("🌸 No members to remove after excluding bot and owner! 💕");
        }

        await reply(`🌸 Removing ${participantsToRemove.length} members...`);

        let removed = 0;
        for (let participant of participantsToRemove) {
            try {
                await mishu.groupParticipantsUpdate(from, [participant.id], "remove");
                await sleep(2000);
                removed++;
            } catch (e) {
                console.error(`🌸 Failed to remove ${participant.id}:`, e);
            }
        }

        reply(`✅ Successfully removed ${removed} members (excluding bot and owner)!`);
    } catch (e) {
        console.error("🌸 Remove All Error:", e);
        reply(`🌸 Error: ${e.message} 💕`);
    }
});

// ============================================
// 🔄 REVOKE COMMAND
// ============================================
mishu({
    pattern: "revoke",
    alias: ["revokegrouplink", "resetglink", "revokelink"],
    desc: "🌸 Reset the group link",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        await mishu.groupRevokeInvite(from);
        reply(`✅ Group link has been reset successfully!`);

    } catch (err) {
        console.error("🌸 Revoke Error:", err);
        reply(`🌸 Error: ${err.message || "Failed to reset group link"} 💕`);
    }
});

// ============================================
// 🚫 OUT COMMAND (Country Kick)
// ============================================
mishu({
    pattern: "out",
    alias: ["ck", "countrykick"],
    desc: "🌸 Remove members with specific country code from group",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    q,
    isGroup,
    isBotAdmins,
    isOwner,
    isCreator,
    reply,
    groupMetadata
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isOwner && !isCreator) return reply("🌸 Only my Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        if (!q) return reply("🌸 Please provide a country code.\nExample: .out 92 💕");

        const countryCode = q.trim();
        if (!/^\d+$/.test(countryCode)) {
            return reply("🌸 Invalid country code! Please provide only numbers (e.g., 92 for +92 numbers) 💕");
        }

        const participants = groupMetadata.participants || [];
        const targets = participants.filter(
            participant => participant.id.startsWith(countryCode) && 
                         !participant.admin // Don't remove admins
        );

        if (targets.length === 0) {
            return reply(`🌸 No members found with country code +${countryCode} 💕`);
        }

        const jids = targets.map(p => p.id);
        await mishu.groupParticipantsUpdate(from, jids, "remove");
        
        reply(`✅ Successfully removed ${targets.length} members with country code +${countryCode}`);

    } catch (error) {
        console.error("🌸 Out Error:", error);
        reply(`🌸 Error: ${error.message} 💕`);
    }
});

// ============================================
// 🌸 NEW GROUP CREATE
// ============================================
mishu({
    pattern: "newgc",
    alias: ["creategroup", "makegc"],
    desc: "🌸 Create a new group and add participants",
    category: "group",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, {
    from,
    text,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isOwner && !isCreator) {
            return reply(`🌸 Only my Queen can use this! 👸💖`);
        }

        if (!text) {
            return reply(`🌸 Usage: .newgc group_name;number1,number2,...\n\nExample: .newgc My Group;923001234567,923001234568 💕`);
        }

        const [groupName, numbersString] = text.split(";");
        
        if (!groupName || !numbersString) {
            return reply(`🌸 Please provide group name and numbers!\n\nExample: .newgc My Group;923001234567,923001234568 💕`);
        }

        const participantNumbers = numbersString.split(",").map(number => `${number.trim()}@s.whatsapp.net`);

        // Create group
        const group = await mishu.groupCreate(groupName, participantNumbers);
        
        // Get invite link
        const inviteLink = await mishu.groupInviteCode(group.id);

        // Send welcome message
        await mishu.sendMessage(group.id, { 
            text: `🌸 Welcome to ${groupName}! 💖\n👑 Created by MEER_xD`
        });

        reply(`✅ Group created successfully!\n\n📛 *Name:* ${groupName}\n🔗 *Invite Link:* https://chat.whatsapp.com/${inviteLink}\n\n🌸 Welcome message sent to the group!`);

    } catch (e) {
        console.error("🌸 New GC Error:", e);
        reply(`🌸 Error: ${e.message} 💕`);
    }
});

// ============================================
// 🔇 MUTE COMMAND
// ============================================
mishu({
    pattern: "mute",
    alias: ["close"],
    desc: "🌸 Mute the group (Only admins can send messages)",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        await mishu.groupSettingUpdate(from, "announcement");
        await mishu.sendMessage(from, { react: { text: '🔇', key: mek.key } });
        reply("🔇 Group muted! Only admins can send messages now.");

    } catch (e) {
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('not-authorized') || msg.includes('forbidden') || msg.includes('403')) {
            return reply("🌸 Make the bot an admin first, then try .mute again. 👑💖");
        }
        console.error("🌸 Mute Error:", e.message);
        reply(`🌸 Failed to mute: ${e.message} 💕`);
    }
});

// ============================================
// 🔊 UNMUTE COMMAND
// ============================================
mishu({
    pattern: "unmute",
    alias: ["open"],
    desc: "🌸 Unmute the group (Everyone can send messages)",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        await mishu.groupSettingUpdate(from, "not_announcement");
        await mishu.sendMessage(from, { react: { text: '🔊', key: mek.key } });
        reply("🔊 Group unmuted! Everyone can send messages now.");

    } catch (e) {
        const msg = (e.message || '').toLowerCase();
        if (msg.includes('not-authorized') || msg.includes('forbidden') || msg.includes('403')) {
            return reply("🌸 Make the bot an admin first, then try .unmute again. 👑💖");
        }
        console.error("🌸 Unmute Error:", e.message);
        reply(`🌸 Failed to unmute: ${e.message} 💕`);
    }
});

// ============================================
// 🔒 LOCK COMMAND
// ============================================
mishu({
    pattern: "lockgc",
    alias: ["lock"],
    desc: "🌸 Lock the group (Prevents new members from joining)",
    category: "group",
    react: "🌸",
    filename: __filename
},           
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        await mishu.groupSettingUpdate(from, "locked");
        reply("🔒 Group has been locked. New members cannot join.");

    } catch (e) {
        console.error("🌸 Lock Error:", e);
        reply(`🌸 Failed to lock the group: ${e.message} 💕`);
    }
});

// ============================================
// 🔓 UNLOCK COMMAND
// ============================================
mishu({
    pattern: "unlockgc",
    alias: ["unlock"],
    desc: "🌸 Unlock the group (Allows new members)",
    category: "group",
    react: "🌸",
    filename: __filename
},           
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        await mishu.groupSettingUpdate(from, "unlocked");
        reply("🔓 Group has been unlocked. New members can now join.");

    } catch (e) {
        console.error("🌸 Unlock Error:", e);
        reply(`🌸 Failed to unlock the group: ${e.message} 💕`);
    }
});

// ============================================
// 🔗 INVITE COMMAND
// ============================================
mishu({
    pattern: "invite",
    alias: ["glink", "grouplink"],
    desc: "🌸 Get group invite link",
    category: "group",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This feature is only for groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        const inviteCode = await mishu.groupInviteCode(from);
        if (!inviteCode) return reply("🌸 Failed to retrieve the invite code! 💕");

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        return reply(`🔗 *Group Invite Link:*\n${inviteLink}`);

    } catch (error) {
        console.error("🌸 Invite Error:", error);
        reply(`🌸 Error: ${error.message || "Unknown error"} 💕`);
    }
});

// ============================================
// 👋 LEAVE COMMAND
// ============================================
mishu({
    pattern: "leave",
    alias: ["left", "leftgc", "leavegc"],
    desc: "🌸 Leave the group",
    category: "owner",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) {
            return reply("🌸 This command only works in groups! 💕");
        }

        if (!isOwner && !isCreator) {
            return reply(`🌸 Only my Queen can use this! 👸💖`);
        }

        await reply("👋 Leaving group...\n🌸 Goodbye everyone! 💖");
        await sleep(1500);
        await mishu.groupLeave(from);
        
    } catch (e) {
        console.error("🌸 Leave Error:", e);
        reply(`🌸 Error: ${e.message} 💕`);
    }
});

// ============================================
// ➕ JOIN COMMAND
// ============================================
mishu({
    pattern: "join",
    alias: ["joinme", "f_join"],
    desc: "🌸 Join a group from invite link",
    category: "group",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, {
    from,
    quoted,
    q,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        // Only allow the creator/owner to use the command
        if (!isOwner && !isCreator) {
            return reply(`🌸 Only my Queen can use this! 👸💖`);
        }

        // If there's no input, check if the message is a reply with a link
        if (!q && !quoted) return reply("🌸 Please write the Group Link 🖇️\n\nExample: .join https://chat.whatsapp.com/xxxxx 💕");

        let groupLink;

        // If the message is a reply to a group invite link
        if (quoted && quoted.type === 'conversation' && isUrl(quoted.text)) {
            groupLink = quoted.text.split('https://chat.whatsapp.com/')[1];
        } else if (q && isUrl(q)) {
            // If the user provided the link in the command
            groupLink = q.split('https://chat.whatsapp.com/')[1];
        }

        if (!groupLink) return reply("🌸 Invalid Group Link 🖇️\n\nPlease provide a valid WhatsApp group invite link. 💕");

        // Accept the group invite
        await mishu.groupAcceptInvite(groupLink);
        await mishu.sendMessage(from, { 
            text: `🌸 Successfully Joined the group! 💖\n\n👑 Powered by MEER_xD`
        }, { quoted: mek });

    } catch (e) {
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.log("🌸 Join Error:", e);
        reply(`🌸 Error Occurred!\n\n${e.message || e} 💕`);
    }
});

// ============================================
// 📋 GROUP INFO
// ============================================
mishu({
    pattern: "ginfo",
    alias: ["groupinfo"],
    desc: "🌸 Get group information",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply,
    groupMetadata,
    participants
}) => {
    try {
        if (!isGroup) return reply(`🌸 This command only works in groups! 💕`);
        if (!isAdmins && !isOwner && !isCreator) return reply(`🌸 Only admins and Queen can use this! 👸💖`);
        if (!isBotAdmins) return reply(`🌸 I need admin rights to fetch group details! 💕`);

        let ppUrl;
        try {
            ppUrl = await mishu.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png';
        }

        const metadata = await mishu.groupMetadata(from);
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        const owner = metadata.owner || groupAdmins[0]?.id || "unknown";

        const gdata = `
╭═══✿══════════════╗
│  ✿ 👥 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢 ✿
│  ✿━━━━━━━━━━━━━━━✿
│  ✿ 📛 Name: ${metadata.subject}
│  ✿ 🆔 ID: ${metadata.id}
│  ✿ 👥 Members: ${metadata.size}
│  ✿ 👑 Creator: @${owner.split('@')[0]}
│  ✿ 📝 Desc: ${metadata.desc?.toString() || 'No description'}
│  ✿ ━━━━━━━━━━━━━━━✿
│  ✿ 👑 Admins (${groupAdmins.length}):
${groupAdmins.map(v => `│  ✿ 👤 @${v.id.split('@')[0]}`).join('\n')}
╰═══✿══════════════╝

🌸 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 MEER_xD 💖`;

        await mishu.sendMessage(from, {
            image: { url: ppUrl },
            caption: gdata,
            mentions: groupAdmins.map(v => v.id).concat([owner])
        }, { quoted: mek });

    } catch (e) {
        console.error("🌸 GInfo Error:", e);
        await mishu.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`🌸 Error: ${e.message || e} 💕`);
    }
});

// ============================================
// 📝 UPDATE GROUP NAME
// ============================================
mishu({
    pattern: "updategname",
    alias: ["upgname", "gname"],
    desc: "🌸 Change the group name",
    category: "group",
    react: "🌸",
    filename: __filename
},           
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    q,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");
        if (!q) return reply("🌸 Please provide a new group name! 💕");

        await mishu.groupUpdateSubject(from, q);
        reply(`✅ Group name has been updated to: *${q}*`);

    } catch (e) {
        console.error("🌸 Update Group Name Error:", e);
        reply(`🌸 Failed to update group name: ${e.message} 💕`);
    }
});

// ============================================
// 📜 UPDATE GROUP DESCRIPTION
// ============================================
mishu({
    pattern: "updategdesc",
    alias: ["upgdesc", "gdesc"],
    desc: "🌸 Change the group description",
    category: "group",
    react: "🌸",
    filename: __filename
},           
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    q,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");
        if (!q) return reply("🌸 Please provide a new group description! 💕");

        await mishu.groupUpdateDescription(from, q);
        reply("✅ Group description has been updated successfully!");

    } catch (e) {
        console.error("🌸 Update Group Description Error:", e);
        reply(`🌸 Failed to update group description: ${e.message} 💕`);
    }
});

// ============================================
// 📋 REQUEST LIST
// ============================================
mishu({
    pattern: "requestlist",
    desc: "🌸 Shows pending group join requests",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        await mishu.sendMessage(from, { react: { text: '🌸', key: m.key } });

        if (!isGroup) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 This command can only be used in groups! 💕");
        }
        if (!isAdmins && !isOwner && !isCreator) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 Only admins and Queen can use this! 👸💖");
        }
        if (!isBotAdmins) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 Please make me admin first! 👑💖");
        }

        const requests = await mishu.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await mishu.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            return reply("🌸 No pending join requests! 💕");
        }

        let text = `🌸 *Pending Join Requests (${requests.length})*\n\n`;
        requests.forEach((user, i) => {
            text += `${i+1}. @${user.jid.split('@')[0]}\n`;
        });

        await mishu.sendMessage(from, { react: { text: '💖', key: m.key } });
        return reply(text, { mentions: requests.map(u => u.jid) });
    } catch (error) {
        console.error("🌸 Request List Error:", error);
        await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply("🌸 Failed to fetch join requests! 💕");
    }
});

// ============================================
// ✅ ACCEPT ALL
// ============================================
mishu({
    pattern: "acceptall",
    desc: "🌸 Accepts all pending group join requests",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        await mishu.sendMessage(from, { react: { text: '🌸', key: m.key } });

        if (!isGroup) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 This command can only be used in groups! 💕");
        }
        if (!isAdmins && !isOwner && !isCreator) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 Only admins and Queen can use this! 👸💖");
        }
        if (!isBotAdmins) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 Please make me admin first! 👑💖");
        }

        const requests = await mishu.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await mishu.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            return reply("🌸 No pending join requests to accept! 💕");
        }

        const jids = requests.map(u => u.jid);
        await mishu.groupRequestParticipantsUpdate(from, jids, "approve");
        
        await mishu.sendMessage(from, { react: { text: '💖', key: m.key } });
        return reply(`✅ Successfully accepted ${requests.length} join requests!`);
    } catch (error) {
        console.error("🌸 Accept All Error:", error);
        await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply("🌸 Failed to accept join requests! 💕");
    }
});

// ============================================
// ❌ REJECT ALL
// ============================================
mishu({
    pattern: "rejectall",
    desc: "🌸 Rejects all pending group join requests",
    category: "group",
    react: "🌸",
    filename: __filename
},
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        await mishu.sendMessage(from, { react: { text: '🌸', key: m.key } });

        if (!isGroup) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 This command can only be used in groups! 💕");
        }
        if (!isAdmins && !isOwner && !isCreator) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 Only admins and Queen can use this! 👸💖");
        }
        if (!isBotAdmins) {
            await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("🌸 Please make me admin first! 👑💖");
        }

        const requests = await mishu.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            await mishu.sendMessage(from, { react: { text: 'ℹ️', key: m.key } });
            return reply("🌸 No pending join requests to reject! 💕");
        }

        const jids = requests.map(u => u.jid);
        await mishu.groupRequestParticipantsUpdate(from, jids, "reject");
        
        await mishu.sendMessage(from, { react: { text: '💖', key: m.key } });
        return reply(`✅ Successfully rejected ${requests.length} join requests!`);
    } catch (error) {
        console.error("🌸 Reject All Error:", error);
        await mishu.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply("🌸 Failed to reject join requests! 💕");
    }
});

// ============================================
// 🔓 UNLOCK COMMAND (Added separately)
// ============================================
mishu({
    pattern: "unlockgc",
    alias: ["unlock"],
    desc: "🌸 Unlock the group (Allows new members)",
    category: "group",
    react: "🌸",
    filename: __filename
},           
async (mishu, mek, m, {
    from,
    isGroup,
    isAdmins,
    isBotAdmins,
    isOwner,
    isCreator,
    reply
}) => {
    try {
        if (!isGroup) return reply("🌸 This command only works in groups! 💕");
        if (!isAdmins && !isOwner && !isCreator) return reply("🌸 Only admins and Queen can use this! 👸💖");
        if (!isBotAdmins) return reply("🌸 Please make me admin first! 👑💖");

        await mishu.groupSettingUpdate(from, "unlocked");
        reply("🔓 Group has been unlocked. New members can now join.");

    } catch (e) {
        console.error("🌸 Unlock Error:", e);
        reply(`🌸 Failed to unlock the group: ${e.message} 💕`);
    }
});

console.log('🌸 MEER_xD - Group commands loaded! 💖');
