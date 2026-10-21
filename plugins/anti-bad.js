// ============================================
// 🌸 ANTI-BAD WORD - MEER_xD (FIXED)
// 👑 Developer: SYED MEER
// 🔥 Simple Detection - No userConfig
// ============================================

const { mishu } = require('../mishu');
const config = require('../settings');

// ========== BAD WORDS LIST ==========
let BAD_WORDS = [
    'wtf', 'fuck', 'fucker', 'fucking', 'fucked', 'fck',
    'bitch', 'bastard', 'asshole', 'arse',
    'dick', 'pussy', 'cock', 'cunt', 'whore', 'slut',
    'nigga', 'nigger', 'rape', 'rapist', 'sex', 'xxx', 'porn',
    'nude', 'naked',
    'madarchod', 'mc', 'behenchod', 'bc', 'bsdk', 'bhosdike',
    'chutiya', 'chutiye', 'gandu', 'bhosdi', 'randi', 'haramzada',
    'harami', 'kaminay', 'kamina', 'gaand', 'lund', 'chut'
];

// ========== ANTI-BAD GROUPS (In-Memory) ==========
const antibadGroups = new Map();
const warnCooldown = new Map();
const COOLDOWN_MS = 30000;

// ========== GIRL BOX HELPER ==========
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
// 🛡️ BAD WORD DETECTOR (Simple & Working)
// ============================================

mishu({
    on: "body"
}, async (mishu, mek, m, {
    from, body, isGroup, isAdmins, isBotAdmins, sender, senderNumber
}) => {
    try {
        // ── Skip if not group ──
        if (!isGroup) return;
        
        // ── Skip if bot is not admin ──
        if (!isBotAdmins) return;
        
        // ── Skip if sender is admin ──
        if (isAdmins) return;
        
        // ── Skip if sender is bot ──
        if (mek.key?.fromMe) return;

        // ── Check if anti-bad is enabled for this group ──
        if (!antibadGroups.get(from)) return;

        // ── FIXED: Get body text ──
        const msgText = (body || '').toLowerCase().trim();
        if (!msgText) return;

        // ── Check for bad words ──
        let found = null;
        for (const word of BAD_WORDS) {
            if (msgText.includes(word)) {
                found = word;
                break;
            }
        }
        
        if (!found) return;

        // ── Get sender JID ──
        const senderJid = sender || mek.key?.participant || mek.key?.remoteJid;
        if (!senderJid) return;

        // ── Delete the message ──
        try {
            await mishu.sendMessage(from, { delete: mek.key });
            console.log(`[AntiBad] Deleted message from ${senderNumber || senderJid} (word: ${found})`);
        } catch (e) {
            console.error('[AntiBad] Delete error:', e.message);
        }

        // ── Cooldown check ──
        const coolKey = `${from}:${senderJid}`;
        const now = Date.now();
        const lastWarn = warnCooldown.get(coolKey) || 0;

        if (now - lastWarn < COOLDOWN_MS) {
            return; // Skip warning if cooldown active
        }

        warnCooldown.set(coolKey, now);

        // ── Send warning ──
        try {
            await mishu.sendMessage(from, {
                text: girlBox('🚫 ANTI-BAD WORD', [
                    ['🚫', 'Action', 'Bad Word Detected & Deleted'],
                    ['👤', 'User', `@${senderJid.split('@')[0]}`],
                    ['📝', 'Word', `*${found}*`],
                    ['⚠️', 'Note', 'Please avoid using bad words!']
                ]),
                mentions: [senderJid]
            });
        } catch (e) {
            console.error('[AntiBad] Warning error:', e.message);
        }

    } catch (err) {
        console.error('🌸 Anti-Bad Error:', err.message);
    }
});

// ============================================
// 👑 ANTI-BAD COMMAND
// ============================================

mishu({
    pattern: "antibad",
    alias: ["antibadword", "setantibad", "antib"],
    desc: "🌸 Toggle anti-bad word filter for this group",
    category: "group",
    react: "🌸",
    filename: __filename
}, async (mishu, mek, m, { from, args, reply, isAdmins, isOwner, isCreator }) => {
    try {
        if (!isAdmins && !isOwner && !isCreator) {
            return reply(`🌸 Only admins and Queen can use this! 👸💖`);
        }

        const sub = (args[0] || '').toLowerCase();

        // ── ON ──
        if (sub === 'on') {
            antibadGroups.set(from, true);
            return reply(girlBox('🌸 ANTI-BAD WORD', [
                ['✅', 'Status', 'ENABLED'],
                ['💡', 'Tip', 'Bad words will be deleted']
            ]));
        }

        // ── OFF ──
        if (sub === 'off') {
            antibadGroups.set(from, false);
            // Clear cooldowns for this group
            for (const key of warnCooldown.keys()) {
                if (key.startsWith(from + ':')) warnCooldown.delete(key);
            }
            return reply(girlBox('🌸 ANTI-BAD WORD', [
                ['❌', 'Status', 'DISABLED'],
                ['💡', 'Tip', 'Bad word filter is now OFF']
            ]));
        }

        // ── ADD WORD ──
        if (sub === 'add') {
            const word = args[1]?.toLowerCase();
            if (!word) return reply('🌸 Usage: .antibad add <word> 💕');
            if (BAD_WORDS.includes(word)) return reply(`🌸 "${word}" already in list! 💕`);
            BAD_WORDS.push(word);
            return reply(girlBox('🌸 WORD ADDED', [
                ['✅', 'Word', `*${word}*`],
                ['📋', 'Total', `${BAD_WORDS.length} bad words`]
            ]));
        }

        // ── REMOVE WORD ──
        if (sub === 'remove' || sub === 'del') {
            const word = args[1]?.toLowerCase();
            if (!word) return reply('🌸 Usage: .antibad remove <word> 💕');
            const idx = BAD_WORDS.indexOf(word);
            if (idx === -1) return reply(`🌸 "${word}" not in list! 💕`);
            BAD_WORDS.splice(idx, 1);
            return reply(girlBox('🌸 WORD REMOVED', [
                ['❌', 'Word', `*${word}*`],
                ['📋', 'Total', `${BAD_WORDS.length} words remain`]
            ]));
        }

        // ── LIST WORDS ──
        if (sub === 'list') {
            const list = BAD_WORDS.map((w, i) => `${i + 1}. ${w}`).join('\n');
            return reply(girlBox('🌸 BAD WORDS LIST', [
                ['📋', 'Total', `${BAD_WORDS.length} words`],
                ['📝', 'List', `\n${list}`]
            ]));
        }

        // ── DEFAULT: SHOW STATUS ──
        const isEnabled = antibadGroups.get(from) || false;
        return reply(girlBox('🌸 ANTI-BAD WORD', [
            ['📊', 'Status', isEnabled ? 'ENABLED' : 'DISABLED'],
            ['⏱️', 'Cooldown', '30 seconds per user'],
            ['📋', 'Words', `${BAD_WORDS.length} bad words`],
            ['🟢', 'ON', '.antibad on'],
            ['🔴', 'OFF', '.antibad off'],
            ['➕', 'Add', '.antibad add <word>'],
            ['➖', 'Remove', '.antibad remove <word>'],
            ['📋', 'List', '.antibad list']
        ]));

    } catch (err) {
        console.error('🌸 Anti-Bad Cmd Error:', err.message);
        reply(`🌸 Error: ${err.message || 'Unknown'} 💕`);
    }
});

console.log('🌸 ANTI-BAD plugin loaded! 💖');
