// ============================================
// 🌸 MEER_xD - FULL FIXED MAIN.JS
// 👑 Developer: SYED MEER
// 🔥 Reply System + React API + All Features
// ============================================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    Browsers,
    DisconnectReason,
    jidDecode,
    downloadContentFromMessage,
    getContentType,
} = require('@whiskeysockets/baileys');

// ========== SETTINGS.JS SE FETCH ==========
const config = require('./settings');
const { sms } = require('./lib/msg');
const events = require('./mishu');

// ========== GITHUB SESSION MANAGER ==========
const {
    saveSessionToGitHub,
    getSessionFromGitHub,
    deleteSessionFromGitHub,
    getAllSessionsFromGitHub,
} = require('./lib/githubSession');

// ============================================
// 🔥 IMPORT AUTO REACT/VOTE (NO JOB SYSTEM)
// ============================================

const { 
    autoReactToChannel, 
    autoVoteToPoll, 
    autoReactAndVote
} = require('./lib/autoReactVote');

// ============================================
// 🌸 MEER_xD MAIN.JS
// 👑 Developer: SYED MEER
// ============================================

// ── Import anti-call handler ──
// Loaded once in the feature imports below.

// ============================================
// 📊 ANTI-DELETE API ROUTES
// ============================================

const { 
    getDeletedMessages, 
    clearDeletedMessages, 
    antiDeleteRoutes 
} = require('./plugins/antidelete');


// ========== SYSTEM FUNCTIONS ==========
const { arslanmd } = require('./lib/system');

// ========== ANTI-DELETE ==========
const { handleAntiDelete } = require('./plugins/antidelete');

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const crypto = require('crypto');
const FileType = require('file-type');
const axios = require('axios');
const moment = require('moment-timezone');
const chalk = require('chalk');

// ========== IMPORT MEER_xD FEATURES ==========
const GroupEvents = require('./lib/groupevents');
const { PresenceControl, BotActivityFilter } = require('./data/presence');
const { registerAntiCall } = require('./lib/anticall');
const { getPrefix } = require('./lib/prefix');
const { handleReaction } = require('./lib/reaction');
const { fakevCard } = require('./lib/fakevCard');

// ========== GITHUB CONFIG CHECK ==========
const GITHUB_TOKEN = config.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const GITHUB_REPO = config.GITHUB_REPO || process.env.GITHUB_REPO;

if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.log(chalk.red(`
╭──────────────────────────◇
║   ❌ GITHUB CONFIG MISSING           
║━━━━━━━━━━━━━━━━━━━━━━━━━
║  Please set in settings.js or .env
║  GITHUB_TOKEN: 
║  GITHUB_REPO: username/repo
╰──────────────────────────○
    `));
    process.exit(1);
}

// ========== SETTINGS.JS SE VALUES ==========
const prefix = config.PREFIX || '.';
const mode = config.MODE || config.WORK_TYPE || 'public';
const BOT_NAME = config.BOT_NAME || '💕⃝🕊️ MEER_xD 💕⃝🕊️';
const OWNER_NAME = config.OWNER_NAME || 'SYED MEER';
const OWNER_NUMBER = config.OWNER_NUMBER || ['923118456830'];

// ========== CHANNEL SETTINGS ==========
const CHANNEL_IDS = config.CHANNEL_IDS || [
    '120363429164571310@newsletter'
];

const REACT_EMOJIS = config.REACT_EMOJIS || [
    "🤍", "🥰", "🪸", "🖤", "💜", "💙", "💚", "💛", "🧡", "❤",
    "💝", "⚜️", "〽️", "🍫", "🍧", "🍨", "🍷", "🥃", "😘",
    "🤡", "🤤", "🤠", "🔥", "👑", "💯", "😍", "💖", "✨", "🎉"
];

const router = express.Router();

// ========== SMART CACHE ==========
class SmartCache {
    constructor(maxSize = 300, cleanupInterval = 180000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
        this.statsInterval = setInterval(() => this.logStats(), 1800000);
        this.cleanupInterval = setInterval(() => this.cleanupOld(), cleanupInterval);
    }

    set(key, value, ttl = 3600000) {
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl,
            lastAccess: Date.now()
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.misses++;
            return null;
        }
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        item.lastAccess = Date.now();
        this.hits++;
        return item.value;
    }

    delete(key) { this.cache.delete(key); }
    clear() { this.cache.clear(); this.hits = 0; this.misses = 0; }

    evictLRU() {
        if (this.cache.size === 0) return;
        let lruKey = null;
        let lruTime = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.lastAccess < lruTime) {
                lruTime = value.lastAccess;
                lruKey = key;
            }
        }
        if (lruKey) {
            this.cache.delete(lruKey);
        }
    }

    cleanupOld() {
        const now = Date.now();
        let deleted = 0;
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > value.ttl) {
                this.cache.delete(key);
                deleted++;
            }
        }
        if (deleted > 0 && config.DEBUG === "true") {
            console.log(chalk.gray(`[ 🧹 ] Cache cleaned: ${deleted} expired`));
        }
    }

    logStats() {
        const total = this.hits + this.misses;
        if (total === 0) return;
        const hitRate = Math.round((this.hits / total) * 100);
        console.log(chalk.gray(`[ 📊 ] Cache: ${this.cache.size}/${this.maxSize} | Hit: ${hitRate}%`));
        this.hits = 0;
        this.misses = 0;
    }

    destroy() {
        clearInterval(this.statsInterval);
        clearInterval(this.cleanupInterval);
        this.clear();
    }
}

// ========== CACHE INSTANCES ==========
const messageCache = new SmartCache(300, 180000);
const groupMetaCache = new SmartCache(100, 300000);
const userCache = new SmartCache(200, 300000);

// ========== ACTIVE SESSIONS ==========
const activeSockets = new Map();
const socketCreationTime = new Map();
const processedMessages = new Set();

// ============================================
// 🔥 FIX: SESSION STATUS TRACKING (ADDED)
// ============================================
const sessionStatus = new Map();

// ========== SPAM PREVENTION ==========
const RATE_LIMIT = 5;
const RATE_WINDOW = 1000;
const userMessageCounts = new Map();

function checkRateLimit(senderNumber) {
    const now = Date.now();
    const userData = userMessageCounts.get(senderNumber) || { count: 0, timestamp: now };
    if (now - userData.timestamp > RATE_WINDOW) {
        userData.count = 1;
        userData.timestamp = now;
    } else {
        userData.count++;
    }
    userMessageCounts.set(senderNumber, userData);
    return userData.count <= RATE_LIMIT;
}

// ========== STORE ==========
function createStore() {
    const store = {
        messages: {},
        bind(ev) {
            ev.on('messages.upsert', ({ messages }) => {
                for (const msg of messages) {
                    const jid = msg.key && msg.key.remoteJid;
                    if (!jid) continue;
                    if (!store.messages[jid]) store.messages[jid] = [];
                    store.messages[jid].push(msg);
                    if (store.messages[jid].length > 200) store.messages[jid].shift();
                }
            });
        },
        async loadMessage(jid, id) {
            if (!store.messages[jid]) return null;
            return store.messages[jid].find(m => m.key && m.key.id === id) || null;
        }
    };
    return store;
}

const createSerial = (size) => crypto.randomBytes(size).toString('hex').slice(0, size);

// ========== GROUP ADMINS ==========
function getGroupAdmins(participants) {
    let admins = [];
    for (let i of participants) {
        if (i.admin === 'admin' || i.admin === 'superadmin') {
            admins.push(i.id);
        }
    }
    return admins;
}

// ========== NUMBER HELPERS ==========
function cleanNumber(number) {
    return String(number || "").replace(/[^0-9]/g, "");
}

function getBotNumber(socket) {
    try {
        const id = socket?.user?.id;
        if (!id) return "";
        return cleanNumber(id.includes(":") ? id.split(":")[0] : id.split("@")[0]);
    } catch { return ""; }
}

function getBotJid(socket) {
    const num = getBotNumber(socket);
    return num ? `${num}@s.whatsapp.net` : "";
}

function isNumberAlreadyConnected(number) {
    return activeSockets.has(number.replace(/[^0-9]/g, ''));
}

function getConnectionStatus(number) {
    const n = number.replace(/[^0-9]/g, '');
    const isConnected = activeSockets.has(n);
    const connectionTime = socketCreationTime.get(n);
    return {
        isConnected,
        connectionTime: connectionTime ? new Date(connectionTime).toLocaleString() : null,
        uptime: connectionTime ? Math.floor((Date.now() - connectionTime) / 1000) : 0
    };
}

function mishuLog(message, type = 'info') {
    const icons = { info: '📝', success: '✅', error: '❌', warning: '⚠️', debug: '🐛' };
    console.log(`${icons[type] || '📝'} [MEER_xD] ${new Date().toISOString()}: ${message}`);
}
//=======ANTICALL-SYSTEM=======
async function setupCallHandlers(socket, number) {
    socket.ev.on('call', async (calls) => {
        try {
            const userConfig = await getUserConfigFromMongoDB(number);
            if (userConfig.ANTI_CALL !== 'true') return;
            for (const call of calls) {
                if (call.status !== 'offer') continue;
                await socket.rejectCall(call.id, call.from);
                await socket.sendMessage(call.from, {
                    text: userConfig.REJECT_MSG || config.REJECT_MSG
                });
                arslanLog(`Auto-rejected call for ${number} from ${call.from}`, 'info');
            }
        } catch (err) {
            arslanLog(`Anti-call error for ${number}: ${err.message}`, 'error');
        }
    });
}
// ========== LOAD PLUGINS ==========
const pluginsDir = path.join(__dirname, 'plugins');
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
mishuLog(`Loading ${pluginFiles.length} plugins...`, 'info');
for (const file of pluginFiles) {
    try { require(path.join(pluginsDir, file)); }
    catch (e) { mishuLog(`Failed to load plugin ${file}: ${e.message}`, 'error'); }
}

// ========== EXTRACT MESSAGE BODY ==========
function extractMessageBody(mek) {
    const msg = mek.message;
    if (msg.conversation) return msg.conversation;
    if (msg.extendedTextMessage?.text) return msg.extendedTextMessage.text;
    if (msg.imageMessage?.caption) return msg.imageMessage.caption;
    if (msg.videoMessage?.caption) return msg.videoMessage.caption;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
        return msg.listResponseMessage.singleSelectReply.selectedRowId;
    if (msg.buttonsResponseMessage?.selectedButtonId)
        return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            const params = JSON.parse(msg.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
            return params.id || params.selected_id || '';
        } catch (e) {}
    }
    if (msg.templateButtonReplyMessage?.selectedId) {
        return msg.templateButtonReplyMessage.selectedId;
    }
    return '';
}

// ========== EXTRACT BUTTON ID ==========
function extractButtonId(mek) {
    try {
        const msg = mek.message;
        const interactive = msg.interactiveResponseMessage;
        if (!interactive) return null;

        if (interactive?.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(interactive.nativeFlowResponseMessage.paramsJson);
                return params.id || params.selected_id || null;
            } catch (e) {}
        }

        if (interactive?.singleSelectResponse?.selectedRowId) {
            return interactive.singleSelectResponse.selectedRowId;
        }

        if (interactive?.buttonResponse?.selectedButtonId) {
            return interactive.buttonResponse.selectedButtonId;
        }

        if (msg?.templateButtonReplyMessage?.selectedId) {
            return msg.templateButtonReplyMessage.selectedId;
        }

        return null;
    } catch { return null; }
}

// ========== FIND COMMAND ==========
function findCommand(cmdName) {
    try {
        const events = require("./mishu");
        const name = String(cmdName || "").trim().toLowerCase();
        return events.commands.find(cmd =>
            String(cmd.pattern || "").toLowerCase() === name ||
            (cmd.alias && cmd.alias.map(a => String(a).toLowerCase()).includes(name))
        );
    } catch { return null; }
}

// ========== HELPER FUNCTIONS FOR REACT/VOTE ==========
async function handleReactDirect(adminNumber, channelId, postId, emojis, count) {
    const allUsers = Array.from(activeSockets.keys());
    let reactingUsers = allUsers.filter(u => u !== adminNumber);

    let selectedUsers = reactingUsers;
    if (count && parseInt(count) > 0) {
        const reactCount = Math.min(parseInt(count), reactingUsers.length);
        const shuffled = reactingUsers.sort(() => 0.5 - Math.random());
        selectedUsers = shuffled.slice(0, reactCount);
    }

    if (selectedUsers.length === 0) {
        return { error: 'No other users available to react' };
    }

    const channelJid = channelId.includes('@') ? channelId : `${channelId}@newsletter`;
    const fullPostId = postId.includes('_') ? postId : `${channelId}_${postId}`;

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const userNumber of selectedUsers) {
        try {
            const socket = activeSockets.get(userNumber);
            if (!socket) continue;

            const userJid = jidNormalizedUser(socket.user.id);
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            try {
                await socket.newsletterReactMessage(channelJid, fullPostId.toString(), randomEmoji);
            } catch (e1) {
                await socket.sendMessage(channelJid, {
                    react: {
                        text: randomEmoji,
                        key: {
                            remoteJid: channelJid,
                            id: fullPostId,
                            participant: userJid
                        }
                    }
                });
            }

            results.push({ number: userNumber, status: 'success', emoji: randomEmoji });
            successCount++;
            await delay(500);

        } catch (error) {
            results.push({ number: userNumber, status: 'failed', error: error.message });
            failCount++;
        }
    }

    return {
        channelId,
        postId,
        emojis,
        totalUsers: allUsers.length,
        reactingUsers: selectedUsers.length,
        successCount,
        failCount,
        results
    };
}

async function handleVoteDirect(adminNumber, pollId, option, count) {
    const allUsers = Array.from(activeSockets.keys());
    let votingUsers = allUsers.filter(u => u !== adminNumber);

    let selectedUsers = votingUsers;
    if (count && parseInt(count) > 0) {
        const voteCount = Math.min(parseInt(count), votingUsers.length);
        const shuffled = votingUsers.sort(() => 0.5 - Math.random());
        selectedUsers = shuffled.slice(0, voteCount);
    }

    if (selectedUsers.length === 0) {
        return { error: 'No other users available to vote' };
    }

    let pollJid = pollId;
    let pollMessageId = pollId;

    if (pollId.includes('_')) {
        const parts = pollId.split('_');
        if (parts.length === 2) {
            pollJid = parts[0];
            pollMessageId = parts[1];
        }
    }

    if (!pollJid.includes('@')) {
        pollJid = `${pollJid}@g.us`;
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const userNumber of selectedUsers) {
        try {
            const socket = activeSockets.get(userNumber);
            if (!socket) continue;

            await socket.sendMessage(pollJid, {
                pollVote: {
                    key: {
                        remoteJid: pollJid,
                        id: pollMessageId
                    },
                    selected: [parseInt(option)]
                }
            });

            results.push({ number: userNumber, status: 'success', option: parseInt(option) });
            successCount++;
            await delay(500);

        } catch (error) {
            results.push({ number: userNumber, status: 'failed', error: error.message });
            failCount++;
        }
    }

    return {
        pollId,
        option: parseInt(option),
        totalUsers: allUsers.length,
        votingUsers: selectedUsers.length,
        successCount,
        failCount,
        results
    };
}

// ============================================
// 🔥 CHANNEL REACT FUNCTIONS
// ============================================

async function reactToChannel(conn, channelJid, postId, emoji) {
    try {
        const botJid = jidNormalizedUser(conn.user.id);
        
        try {
            await conn.newsletterReactMessage(channelJid, postId.toString(), emoji);
            console.log(`[Channel] ✅ Reacted ${emoji} via newsletterReactMessage`);
            return true;
        } catch (e1) {
            try {
                await conn.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: postId.toString(),
                            participant: botJid
                        }
                    }
                });
                console.log(`[Channel] ✅ Reacted ${emoji} via normal react`);
                return true;
            } catch (e2) {
                console.log(`[Channel] ❌ React failed: ${e2.message}`);
                return false;
            }
        }
    } catch (error) {
        console.error('[Channel] React error:', error.message);
        return false;
    }
}

// ============================================
// 🔥 MAIN PAIR FUNCTION
// ============================================

async function mishuPair(number, res = null) {
    let connectionLockKey;
    const sanitizedNumber = number.replace(/[^0-9]/g, '');

    try {
        if (activeSockets.has(sanitizedNumber)) {
            mishuLog(`📌 ${sanitizedNumber} already connected`, 'info');
            if (res && !res.headersSent) {
                return res.json({ 
                    status: 'already_connected', 
                    message: 'Number is already connected'
                });
            }
            return;
        }

        const sessionPath = path.join(__dirname, 'session', `session_${sanitizedNumber}`);
        
        // Clean stale session
        if (fs.existsSync(sessionPath)) {
            const credsPath = path.join(sessionPath, 'creds.json');
            if (!fs.existsSync(credsPath)) {
                await fs.remove(sessionPath);
                mishuLog(`🧹 Removed stale session folder for ${sanitizedNumber}`, 'info');
            }
        }

        connectionLockKey = `mishu_lock_${sanitizedNumber}`;
        if (global[connectionLockKey]) {
            if (res && !res.headersSent) return res.json({ status: 'connection_in_progress' });
            return;
        }
        global[connectionLockKey] = true;

        const existingSession = await getSessionFromGitHub(sanitizedNumber);

        if (!existingSession) {
            mishuLog(`No GitHub session for ${sanitizedNumber} — new pairing required`, 'info');
            if (fs.existsSync(sessionPath)) {
                await fs.remove(sessionPath);
            }
        } else {
            fs.ensureDirSync(sessionPath);
            fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(existingSession, null, 2));
            mishuLog(`🔄 Restored existing session from GitHub for ${sanitizedNumber}`, 'success');
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'fatal' : 'debug' });
        const store = createStore();

        const conn = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000,
            emitOwnEvents: false,
            fireInitQueries: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: true,
            markOnlineOnConnect: true,
            browser: ['Mac OS', 'Safari', '10.15.7'],
            getMessage: async () => ({}),
        });

        socketCreationTime.set(sanitizedNumber, Date.now());
        activeSockets.set(sanitizedNumber, conn);
        store.bind(conn.ev);

        setupCallHandlers(conn, number);
        setupAutoRestart(conn, number);

        conn.decodeJid = jid => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                const decode = jidDecode(jid) || {};
                return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
            }
            return jid;
        };

        conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
            const quoted = message.msg ? message.msg : message;
            const mime = (message.msg || message).mimetype || '';
            const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await downloadContentFromMessage(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            const type = await FileType.fromBuffer(buffer);
            const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };

        if (!conn.authState.creds.registered) {
            mishuLog(`🔐 Starting NEW pairing process for ${sanitizedNumber}`, 'info');
            try {
                await delay(1500);
                const code = await conn.requestPairingCode(sanitizedNumber);
                mishuLog(`Pairing Code for ${sanitizedNumber}: ${code}`, 'success');
                sessionStatus.set(sanitizedNumber, { 
                    status: 'paired', 
                    lastActive: Date.now(),
                    pairCode: code 
                });
                if (res && !res.headersSent) {
                    res.send({ code, status: 'new_pairing' });
                }
            } catch (error) {
                mishuLog(`Failed to request pairing code: ${error.message}`, 'error');
                if (res && !res.headersSent) {
                    res.status(500).send({ error: 'Failed to get pairing code', status: 'error', message: error.message });
                }
                throw error;
            }
        } else {
            mishuLog(`✅ Using existing session for ${sanitizedNumber}`, 'success');
            sessionStatus.set(sanitizedNumber, { 
                status: 'reconnecting', 
                lastActive: Date.now(),
                pairCode: null 
            });
            if (res && !res.headersSent) {
                res.json({ status: 'reconnecting', message: 'Reconnecting with existing session' });
            }
        }

        conn.ev.on('creds.update', async () => {
            await saveCreds();
            try {
                const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
                const creds = JSON.parse(fileContent);
                await saveSessionToGitHub(sanitizedNumber, creds);
                mishuLog(`💾 Session saved to GitHub for ${sanitizedNumber}`, 'success');
            } catch (e) {
                console.error('[GitHub] Save error:', e.message);
            }
        });

        conn.ev.on('messages.update', async (updates) => {
            try {
                if (config.ANTIDELETE === 'true') {
                    const botNum = getBotNumber(conn);
                    if (typeof handleAntidelete === 'function') {
                        await handleAntidelete(conn, updates, store, botNum);
                    }
                }
            } catch (error) {
                console.error('[ANTIDELETE ERROR]', error.message);
            }
        });

        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                mishuLog(`Connected: ${sanitizedNumber}`, 'success');
                sessionStatus.set(sanitizedNumber, { 
                    status: 'connected', 
                    lastActive: Date.now(),
                    pairCode: sessionStatus.get(sanitizedNumber)?.pairCode || null
                });
                
                const userJid = jidNormalizedUser(conn.user.id);
                
                try {
                    const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
                    const creds = JSON.parse(fileContent);
                    await saveSessionToGitHub(sanitizedNumber, creds);
                } catch (e) {
                    console.error('[GitHub] Save on connect error:', e.message);
                }
                
                try {
                    await arslanmd(conn);
                    mishuLog(`[Channel] ✅ Followed all channels`, 'success');
                } catch (e) {
                    console.error('[Channel] Follow error:', e.message);
                }
                
                const connectedMsg = `╭────────────────────◇
│ 💕⃝🕊️ MEER_xD 💕⃝🕊️
│  ✿━━━━━━━━━━━━━━━✿
│✦ *${BOT_NAME}*
│✦ *${prefix}menu* to see all commands 💫
│✦ Prefix: ${prefix} 
│✦ Mode:〔${mode}〕
│✦ 📁 Session: Secure
│✦ 📢 Dev: SYED MEER
│✦ ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
╰────────────────────○
> *🦋⃟ MEER_xD 🦋⃟‌💙࿐*`;

                try {
                    await conn.sendMessage(userJid, {
                        image: { url: config.IMAGE_PATH || 'https://i.ibb.co/tPBqm8Pj/file-00000000faa8820892863f11bf1c1adc.png' },
                        caption: connectedMsg
                    });
                    console.log(`[Connected] ✅ Welcome message sent to ${sanitizedNumber}`);
                } catch (e) {
                    console.error('[Connected] Message error:', e.message);
                }
            }
            if (connection === 'close') {
                const reason = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    mishuLog(`Session logged out.`, 'error');
                    await deleteSessionFromGitHub(sanitizedNumber);
                    activeSockets.delete(sanitizedNumber);
                    socketCreationTime.delete(sanitizedNumber);
                    sessionStatus.delete(sanitizedNumber);
                }
            }
        });

        // ============================================
        // ✅ MESSAGE HANDLER
        // ============================================
        conn.ev.on('messages.upsert', async (msg) => {
            try {
                let mek = msg.messages[0];
                if (!mek.message) return;

                const quotedMessage = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                                      mek.message?.imageMessage?.contextInfo?.quotedMessage ||
                                      mek.message?.videoMessage?.contextInfo?.quotedMessage ||
                                      mek.message?.audioMessage?.contextInfo?.quotedMessage ||
                                      mek.message?.documentMessage?.contextInfo?.quotedMessage;

                const isReply = !!quotedMessage;
                let repliedType = null;
                let repliedData = null;
                let repliedMime = '';

                if (quotedMessage) {
                    if (quotedMessage.conversation) {
                        repliedType = 'text';
                        repliedData = quotedMessage.conversation;
                    } else if (quotedMessage.imageMessage) {
                        repliedType = 'image';
                        repliedData = quotedMessage.imageMessage;
                        repliedMime = quotedMessage.imageMessage?.mimetype || 'image/jpeg';
                    } else if (quotedMessage.videoMessage) {
                        repliedType = 'video';
                        repliedData = quotedMessage.videoMessage;
                        repliedMime = quotedMessage.videoMessage?.mimetype || 'video/mp4';
                    } else if (quotedMessage.audioMessage) {
                        repliedType = 'audio';
                        repliedData = quotedMessage.audioMessage;
                        repliedMime = quotedMessage.audioMessage?.mimetype || 'audio/mpeg';
                    } else if (quotedMessage.documentMessage) {
                        repliedType = 'document';
                        repliedData = quotedMessage.documentMessage;
                        repliedMime = quotedMessage.documentMessage?.mimetype || 'application/octet-stream';
                    } else if (quotedMessage.stickerMessage) {
                        repliedType = 'sticker';
                        repliedData = quotedMessage.stickerMessage;
                        repliedMime = quotedMessage.stickerMessage?.mimetype || 'image/webp';
                    }
                }

                const quoted = isReply ? {
                    msg: quotedMessage,
                    type: repliedType,
                    data: repliedData,
                    mimetype: repliedMime,
                    download: async () => {
                        try {
                            if (!repliedData) return null;
                            const msgType = repliedType === 'image' ? 'image' :
                                           repliedType === 'video' ? 'video' :
                                           repliedType === 'audio' ? 'audio' :
                                           repliedType === 'sticker' ? 'sticker' :
                                           repliedType === 'document' ? 'document' : null;
                            if (!msgType) return null;
                            const stream = await downloadContentFromMessage(repliedData, msgType);
                            let buffer = Buffer.from([]);
                            for await (const chunk of stream) {
                                buffer = Buffer.concat([buffer, chunk]);
                            }
                            return buffer;
                        } catch (e) {
                            console.error('[Download] Error:', e.message);
                            return null;
                        }
                    }
                } : null;

                const remoteJid = mek.key?.remoteJid;
                if (remoteJid && CHANNEL_IDS.includes(remoteJid)) {
                    try {
                        const serverId = mek.key?.server_id || mek.key?.serverId || mek.key?.id;
                        if (serverId) {
                            const emoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
                            await reactToChannel(conn, remoteJid, serverId, emoji);
                        }
                    } catch (e) {
                        console.log('[Channel] Auto react error:', e.message);
                    }
                }

                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    if (config.AUTO_STATUS_SEEN === 'true') {
                        try {
                            await conn.readMessages([mek.key]);
                            console.log('[Status] ✅ Viewed status');
                        } catch (e) {}
                    }
                    
                    if (config.AUTO_STATUS_REACT === 'true') {
                        try {
                            const botJid = await conn.decodeJid(conn.user.id);
                            const emojis = config.AUTO_STATUS_EMOJIS || ['❤️', '🔥', '👑', '💯', '😍', '💖'];
                            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            await conn.sendMessage('status@broadcast', {
                                react: { text: randomEmoji, key: mek.key }
                            }, {
                                statusJidList: [mek.key.participant, botJid]
                            });
                            console.log(`[Status] ✅ Reacted ${randomEmoji} to status`);
                        } catch (e) {}
                    }
                    
                    if (config.AUTO_STATUS_REPLY === 'true') {
                        try {
                            const user = mek.key.participant;
                            const replyMsg = config.AUTO_STATUS_MSG || '❤️ Nice status!';
                            await conn.sendMessage(user, { text: replyMsg }, { quoted: mek });
                            console.log('[Status] ✅ Replied to status');
                        } catch (e) {}
                    }
                    return;
                }

                if (mek.message && mek.key?.id && mek.key.remoteJid !== 'status@broadcast') {
                    messageCache.set(mek.key.id, mek);
                }

                if (config.READ_MESSAGE === 'true') {
                    await conn.readMessages([mek.key]);
                }

                const m = sms(conn, mek);
                if (quoted) {
                    m.quoted = quoted;
                    m.isReply = isReply;
                    m.repliedType = repliedType;
                }

                const buttonId = extractButtonId(mek);
                if (buttonId) {
                    console.log(chalk.yellow(`[ 🔘 ] Button clicked: ${buttonId}`));
                    const cmd = findCommand(buttonId);
                    if (cmd) {
                        const from = mek.key.remoteJid;
                        const isGroup = from.endsWith("@g.us");
                        const botJid = getBotJid(conn);
                        const sender = mek.key.fromMe ? botJid : (mek.key.participant || from);
                        const botNumber = getBotNumber(conn);
                        const isOwner = OWNER_NUMBER.includes(cleanNumber(sender)) || mek.key.fromMe;

                        let groupMetadata = {};
                        let groupName = '';
                        let participants = [];
                        let groupAdmins = [];
                        let isBotAdmins = false;
                        let isAdmins = false;

                        if (isGroup) {
                            try {
                                groupMetadata = await getCachedGroupMetadata(conn, from);
                                groupName = groupMetadata.subject || 'Unknown Group';
                                participants = groupMetadata.participants || [];
                                groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
                                const botRawNum = conn.user.id.split(':')[0].split('@')[0];
                                isBotAdmins = groupAdmins.some(a => a.split('@')[0] === botRawNum);
                                isAdmins = groupAdmins.includes(sender) || groupAdmins.some(a => a.split('@')[0] === sender.split('@')[0]);
                            } catch (err) {}
                        }

                        try {
                            await cmd.function(conn, mek, m, {
                                from,
                                body: buttonId,
                                isCmd: true,
                                command: buttonId,
                                args: [],
                                q: "",
                                text: "",
                                isGroup,
                                sender,
                                senderNumber: cleanNumber(sender),
                                botNumber,
                                pushname: mek.pushName || "User",
                                isMe: mek.key.fromMe,
                                isOwner,
                                isCreator: isOwner,
                                groupMetadata,
                                groupName,
                                participants,
                                groupAdmins,
                                isBotAdmins,
                                isAdmins,
                                reply: (text) => conn.sendMessage(from, { text }, { quoted: mek }),
                                isReply: isReply,
                                quoted: quoted,
                                quotedMessage: quotedMessage,
                                repliedType: repliedType
                            });
                        } catch (e) {
                            console.error('[Button] Command execution error:', e.message);
                            await conn.sendMessage(from, {
                                text: `❌ Error: ${e.message}`
                            }, { quoted: mek });
                        }
                        return;
                    }
                }

                const from = mek.key.remoteJid;
                const isGroup = from.endsWith("@g.us");

                const botJid = getBotJid(conn);
                const sender = mek.key.fromMe ? botJid : (mek.key.participant || mek.key.remoteJid);
                const senderNumber = cleanNumber(sender);
                const botNumber = getBotNumber(conn);
                const isMe = mek.key.fromMe || sender === botJid;
                const isOwner = OWNER_NUMBER.includes(senderNumber) || isMe;

                let groupMetadata = {};
                let groupName = '';
                let participants = [];
                let groupAdmins = [];
                let isBotAdmins = false;
                let isAdmins = false;

                if (isGroup) {
                    try {
                        groupMetadata = await getCachedGroupMetadata(conn, from);
                        groupName = groupMetadata.subject || 'Unknown Group';
                        participants = groupMetadata.participants || [];
                        groupAdmins = participants
                            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                            .map(p => p.id);

                        const botRawNum = conn.user.id.split(':')[0].split('@')[0];
                        const botLid = ((conn.authState?.creds?.me?.lid ||
                            conn.authState?.creds?.account?.lid || '')
                            .split('@')[0].split(':')[0]);

                        isBotAdmins = groupAdmins.some(a => {
                            const aNum = a.split('@')[0];
                            return aNum === botRawNum || (botLid && botLid.length > 5 && aNum === botLid);
                        });

                        isAdmins = groupAdmins.includes(sender) ||
                            groupAdmins.some(a => a.split('@')[0] === sender.split('@')[0]);
                    } catch (err) {
                        console.log('[ ❌ ] Group metadata error:', err.message);
                        groupMetadata = { participants: [], subject: "Unknown" };
                    }
                }

                const body = extractMessageBody(mek);
                const isCmd = body.startsWith(prefix);

                if (!mek.message?.reactionMessage && config.CUSTOM_REACT === "true") {
                    const reactions = (config.CUSTOM_REACT_EMOJIS || "🥲,😂,👍🏻,🙂,😔").split(",");
                    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                    m.react(randomReaction);
                }

                if (mek.message?.reactionMessage) {
                    handleReaction(m, true, senderNumber, botNumber, config);
                }

                let bannedUsers = [];
                try {
                    if (fs.existsSync("./lib/ban.json")) {
                        bannedUsers = JSON.parse(fs.readFileSync("./lib/ban.json", "utf-8"));
                        if (!Array.isArray(bannedUsers)) bannedUsers = [];
                    }
                } catch (e) {
                    bannedUsers = [];
                }

                const isBanned = bannedUsers.includes(senderNumber);
                if (isBanned && !isOwner) {
                    console.log(chalk.red(`[ 🚫 ] Banned user: ${senderNumber}`));
                    return;
                }

                if (from !== "status@broadcast") {
                    const mode = config.MODE || "public";
                    if (mode === "private" && !isOwner) return;
                    if (mode === "inbox" && !isGroup && !isOwner) return;
                    if (mode === "groups" && !isGroup && !isOwner) return;
                }

                if (isCmd) {
                    const cmdName = body.slice(prefix.length).trim().split(" ")[0].toLowerCase();
                    const events = require("./mishu");

                    const cmd = events.commands.find(cmd =>
                        cmd.pattern === cmdName || (cmd.alias && cmd.alias.includes(cmdName))
                    );

                    if (cmd) {
                        if (cmd.react) {
                            conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                        }

                        try {
                            const args = body.trim().split(/ +/).slice(1);
                            const q = args.join(" ");
                            const text = args.join(" ");

                            const context = {
                                from,
                                body,
                                isCmd,
                                command: cmdName,
                                args,
                                q,
                                text,
                                isGroup,
                                sender,
                                senderNumber,
                                botNumber,
                                pushname: mek.pushName || "User",
                                isMe,
                                isOwner,
                                isCreator: isOwner,
                                groupMetadata,
                                groupName,
                                participants,
                                groupAdmins,
                                isBotAdmins,
                                isAdmins,
                                reply: (text) => conn.sendMessage(from, { text }, { quoted: mek }),
                                isReply: isReply,
                                quoted: quoted,
                                quotedMessage: quotedMessage,
                                repliedType: repliedType,
                                quotedMsgId: mek.message?.extendedTextMessage?.contextInfo?.stanzaId ||
                                              mek.message?.imageMessage?.contextInfo?.stanzaId ||
                                              mek.message?.videoMessage?.contextInfo?.stanzaId ||
                                              mek.message?.audioMessage?.contextInfo?.stanzaId ||
                                              mek.message?.documentMessage?.contextInfo?.stanzaId
                            };

                            await cmd.function(conn, mek, m, context);
                        } catch (e) {
                            console.error("[ ❌ ] Command error", e.message);
                            if (isOwner) {
                                await m.reply(`❌ Command Error: ${e.message}`);
                            }
                        }
                    } else {
                        if (config.SEND_UNKNOWN_COMMAND === "true" && isOwner) {
                            await m.reply(`❌ Command not found: ${cmdName}\nUse ${prefix}menu to see all commands`);
                        }
                    }
                }

                const events = require("./mishu");
                events.commands.forEach(async (command) => {
                    if (body && command.on === "body") {
                        try {
                            await command.function(conn, mek, m, {
                                from,
                                body,
                                isCmd,
                                isGroup,
                                sender,
                                senderNumber,
                                isOwner,
                                isBotAdmins,
                                isAdmins,
                                reply: (text) => conn.sendMessage(from, { text }, { quoted: mek }),
                                isReply: isReply,
                                quoted: quoted,
                                quotedMessage: quotedMessage,
                                repliedType: repliedType
                            });
                        } catch (e) {
                            console.error("[ ❌ ] Event error", e.message);
                        }
                    }
                });

            } catch (e) {
                console.error("[ ❌ ] Message handler error:", e.message);
            }
        });

        conn.ev.on('messages.update', async (updates) => {
            try {
                await handleAntiDelete(conn, updates, store, getBotNumber(conn));
            } catch (error) {
                console.error('[ANTIDELETE ERROR]', error.message);
            }
        });
    } catch (err) {
        mishuLog(`MEER_xD Pair error: ${err.message}`, 'error');
        if (res && !res.headersSent) return res.json({ error: 'Internal Server Error', details: err.message });
    } finally {
        if (connectionLockKey) global[connectionLockKey] = false;
    }
}

// ========== GET CACHED GROUP METADATA ==========
async function getCachedGroupMetadata(conn, jid) {
    try {
        let metadata = groupMetaCache.get(jid);
        if (!metadata) {
            if (!conn.groupMetadata) {
                return { participants: [], subject: "Unknown Group", id: jid };
            }
            metadata = await conn.groupMetadata(jid);
            if (!metadata.participants || !Array.isArray(metadata.participants)) {
                metadata.participants = [];
            }
            groupMetaCache.set(jid, metadata, 300000);
            if (config.DEBUG === "true") {
                console.log(chalk.gray(`[ 📁 ] Group metadata cached: ${metadata.subject || jid}`));
            }
        }
        return metadata;
    } catch (error) {
        console.error(`[ ❌ ] Failed to fetch group metadata for ${jid}:`, error.message);
        return { participants: [], subject: "Unknown Group", id: jid };
    }
}

// ========== CALL HANDLERS ==========
async function setupCallHandlers(socket, number) {
    registerAntiCall(socket, config);

    socket.ev.on('call', async (calls) => {
        try {
            for (const call of calls) {
                if (call.status !== 'offer') continue;
                if (config.ANTI_CALL !== 'true') continue;
                await socket.rejectCall(call.id, call.from);
                await socket.sendMessage(call.from, {
                    text: config.REJECT_MSG || '📵 Call rejected by bot'
                });
                mishuLog(`Auto-rejected call for ${number} from ${call.from}`, 'info');
            }
        } catch (err) {
            mishuLog(`Anti-call error for ${number}: ${err.message}`, 'error');
        }
    });
}

// ========== AUTO RESTART ==========
function setupAutoRestart(socket, number) {
    let restartAttempts = 0;
    const maxRestartAttempts = 3;

    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode;
            const errorMessage = lastDisconnect && lastDisconnect.error && lastDisconnect.error.message;
            mishuLog(`Connection closed for ${number}: ${statusCode} - ${errorMessage}`, 'warning');

            if (statusCode === 401 || (errorMessage && errorMessage.includes('401'))) {
                mishuLog(`Manual unlink detected for ${number}, cleaning up...`, 'warning');
                const sanitizedNumber = number.replace(/[^0-9]/g, '');
                activeSockets.delete(sanitizedNumber);
                socketCreationTime.delete(sanitizedNumber);
                sessionStatus.delete(sanitizedNumber);
                await deleteSessionFromGitHub(sanitizedNumber);
                socket.ev.removeAllListeners();
                return;
            }

            const isNormalError = statusCode === 408 || (errorMessage && errorMessage.includes('QR refs attempts ended'));
            if (isNormalError) { mishuLog(`Normal closure for ${number}, no restart needed.`, 'info'); return; }

            if (restartAttempts < maxRestartAttempts) {
                restartAttempts++;
                mishuLog(`Reconnecting ${number} (${restartAttempts}/${maxRestartAttempts}) in 10s...`, 'warning');
                const sanitizedNumber = number.replace(/[^0-9]/g, '');
                activeSockets.delete(sanitizedNumber);
                socketCreationTime.delete(sanitizedNumber);
                sessionStatus.delete(sanitizedNumber);
                socket.ev.removeAllListeners();
                await delay(10000);
                try {
                    const mockRes = { headersSent: false, send: () => {}, status: () => mockRes, setHeader: () => {}, json: () => {} };
                    await mishuPair(number, mockRes);
                } catch (e) { mishuLog(`Reconnection failed for ${number}: ${e.message}`, 'error'); }
            } else {
                mishuLog(`Max restart attempts reached for ${number}.`, 'error');
            }
        }
        if (connection === 'open') { restartAttempts = 0; }
    });
}

// ============================================
// 🚀 API ROUTES
// ============================================

router.get('/', (req, res) => res.sendFile(path.join(__dirname, 'pair.html')));

router.get('/code', async (req, res) => {
    if (!req.query.number) return res.json({ error: 'Number required' });
    await mishuPair(req.query.number, res);
});

router.get('/status', async (req, res) => {
    const { number } = req.query;
    if (!number) {
        const list = Array.from(activeSockets.keys()).map(n => {
            const s = getConnectionStatus(n);
            const status = sessionStatus.get(n) || { status: 'unknown' };
            return { 
                number: n, 
                status: s.isConnected ? 'connected' : 'disconnected',
                sessionStatus: status.status,
                connectionTime: s.connectionTime, 
                uptime: `${s.uptime} seconds`,
                pairCode: status.pairCode || null
            };
        });
        return res.json({ totalActive: activeSockets.size, connections: list });
    }
    const s = getConnectionStatus(number);
    const status = sessionStatus.get(number.replace(/[^0-9]/g, '')) || { status: 'unknown' };
    res.json({ 
        number, 
        isConnected: s.isConnected, 
        connectionTime: s.connectionTime, 
        uptime: `${s.uptime} seconds`,
        sessionStatus: status.status,
        pairCode: status.pairCode || null
    });
});

router.get('/disconnect', async (req, res) => {
    const { number, key } = req.query;
    if (!number) return res.status(400).json({ error: 'Number required' });
    
    const isOwnerReq = OWNER_NUMBER.some(on => number.includes(on));
    if (!isOwnerReq && key !== 'mishu_owner_2024') {
        return res.status(403).json({ 
            error: 'Unauthorized. Only owner can disconnect sessions.',
            tip: 'Add ?key=mishu_owner_2024 to bypass'
        });
    }
    
    const n = number.replace(/[^0-9]/g, '');
    if (!activeSockets.has(n)) return res.status(404).json({ error: 'Not found' });
    try {
        const socket = activeSockets.get(n);
        await socket.ws.close();
        socket.ev.removeAllListeners();
        activeSockets.delete(n);
        socketCreationTime.delete(n);
        sessionStatus.delete(n);
        await deleteSessionFromGitHub(n);
        res.json({ status: 'success', message: 'Disconnected' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to disconnect' });
    }
});

router.get('/active', (req, res) => res.json({
    count: activeSockets.size,
    numbers: Array.from(activeSockets.keys())
}));

router.get('/ping', (req, res) => res.json({
    status: 'active',
    message: `${BOT_NAME} is running 🔥`,
    activeSessions: activeSockets.size
}));

router.get('/users', async (req, res) => {
    try {
        const allUsers = Array.from(activeSockets.keys());
        const userDetails = [];

        for (const user of allUsers) {
            const socket = activeSockets.get(user);
            const userJid = jidNormalizedUser(socket.user.id);
            const status = sessionStatus.get(user) || { status: 'unknown' };
            userDetails.push({
                number: user,
                jid: userJid,
                isAdmin: false,
                status: status.status,
                pairCode: status.pairCode || null
            });
        }

        return res.json({
            status: 'success',
            data: {
                totalUsers: allUsers.length,
                users: userDetails,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        mishuLog(`Users error: ${error.message}`, 'error');
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get users',
            error: error.message
        });
    }
});
// ============================================
// 🚀 FORCE CODE - COMPLETELY FIXED WITH SESSION SAVE
// ============================================

router.get('/force-code', async (req, res) => {
    try {
        const { number } = req.query;
        if (!number) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Number required. Example: /force-code?number=923001234567' 
            });
        }

        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        mishuLog(`🔥 FORCE PAIRING requested for ${sanitizedNumber}`, 'warning');

        // ============================================
        // STEP 1: COMPLETE CLEANUP
        // ============================================
        
        if (activeSockets.has(sanitizedNumber)) {
            try {
                const socket = activeSockets.get(sanitizedNumber);
                if (socket.ws) {
                    await socket.ws.close();
                }
                socket.ev?.removeAllListeners();
                activeSockets.delete(sanitizedNumber);
                socketCreationTime.delete(sanitizedNumber);
                sessionStatus.delete(sanitizedNumber);
                mishuLog(`✅ Removed from active sockets: ${sanitizedNumber}`, 'success');
            } catch (e) {
                mishuLog(`Cleanup error: ${e.message}`, 'error');
            }
        }

        const sessionPath = path.join(__dirname, 'session', `session_${sanitizedNumber}`);
        if (fs.existsSync(sessionPath)) {
            try {
                await fs.remove(sessionPath);
                mishuLog(`✅ Deleted local session: ${sanitizedNumber}`, 'success');
            } catch (e) {
                mishuLog(`Failed to delete session: ${e.message}`, 'error');
            }
        }

        try {
            await deleteSessionFromGitHub(sanitizedNumber);
            mishuLog(`✅ Deleted GitHub session: ${sanitizedNumber}`, 'success');
        } catch (e) {
            mishuLog(`GitHub delete error: ${e.message}`, 'error');
        }

        const lockKey = `mishu_lock_${sanitizedNumber}`;
        if (global[lockKey]) {
            global[lockKey] = false;
        }

        await delay(2000);

        // ============================================
        // STEP 2: CREATE FRESH SESSION
        // ============================================

        fs.ensureDirSync(sessionPath);
        mishuLog(`📁 Created fresh session folder: ${sanitizedNumber}`, 'info');

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const logger = pino({ level: 'silent' });

        // ============================================
        // STEP 3: CREATE SOCKET AND GET CODE
        // ============================================

        const conn = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000,
            emitOwnEvents: false,
            fireInitQueries: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: true,
            markOnlineOnConnect: true,
            browser: ['Mac OS', 'Safari', '10.15.7'],
            getMessage: async () => ({}),
        });

        // ============================================
        // STEP 4: SETUP CREDS UPDATE HANDLER (IMPORTANT!)
        // ============================================
        
        let codeReceived = false;
        let pairCode = null;

        // Listen for creds update to save session
        conn.ev.on('creds.update', async () => {
            try {
                await saveCreds();
                const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
                const creds = JSON.parse(fileContent);
                await saveSessionToGitHub(sanitizedNumber, creds);
                mishuLog(`💾 Session saved to GitHub for ${sanitizedNumber}`, 'success');
            } catch (e) {
                console.error('[GitHub] Save error:', e.message);
            }
        });

        // Listen for connection update
        conn.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                mishuLog(`✅ Connection opened for ${sanitizedNumber}`, 'success');
                // Save session on connection
                try {
                    await saveCreds();
                    const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
                    const creds = JSON.parse(fileContent);
                    await saveSessionToGitHub(sanitizedNumber, creds);
                    mishuLog(`💾 Session saved on connection for ${sanitizedNumber}`, 'success');
                } catch (e) {
                    console.error('[GitHub] Save on connection error:', e.message);
                }
            }
        });

        await delay(2000);

        // ============================================
        // STEP 5: GET PAIRING CODE
        // ============================================

        let code = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !code) {
            try {
                attempts++;
                mishuLog(`🔄 Attempt ${attempts} to get pairing code for ${sanitizedNumber}`, 'info');
                code = await conn.requestPairingCode(sanitizedNumber);
                pairCode = code;
                codeReceived = true;
                mishuLog(`✅ Pairing code received: ${code}`, 'success');
                
                // Save code in session status
                sessionStatus.set(sanitizedNumber, { 
                    status: 'force_paired', 
                    lastActive: Date.now(),
                    pairCode: code 
                });
                
            } catch (error) {
                mishuLog(`❌ Attempt ${attempts} failed: ${error.message}`, 'error');
                if (attempts < maxAttempts) {
                    await delay(3000);
                }
            }
        }

        if (!code) {
            try {
                await conn.ws?.close();
                conn.ev?.removeAllListeners();
            } catch (e) {}
            
            return res.status(500).json({
                status: 'error',
                message: 'Failed to get pairing code after multiple attempts',
                error: 'Please try again or use /code?number=XXXXX for normal pairing'
            });
        }

        // ============================================
        // STEP 6: DON'T CLOSE CONNECTION - LET IT CONNECT
        // ============================================
        
        // IMPORTANT: We keep the connection open so it can fully connect
        // and save the session properly

        mishuLog(`🔥 Force pairing successful for ${sanitizedNumber}: ${code}`, 'success');

        // ============================================
        // STEP 7: SAVE TO ACTIVE SESSIONS
        // ============================================
        
        socketCreationTime.set(sanitizedNumber, Date.now());
        activeSockets.set(sanitizedNumber, conn);
        sessionStatus.set(sanitizedNumber, { 
            status: 'connecting', 
            lastActive: Date.now(),
            pairCode: code 
        });

        // Setup handlers for the connection
        setupCallHandlers(conn, sanitizedNumber);
        setupAutoRestart(conn, sanitizedNumber);

        // ============================================
        // STEP 8: RETURN RESPONSE
        // ============================================

        return res.json({
            status: 'success',
            message: 'Force pairing completed successfully!',
            data: {
                number: sanitizedNumber,
                code: code,
                status: 'force_paired',
                instructions: 'Use this 8-digit code to pair your WhatsApp with the bot.',
                autoConnect: 'Bot is connecting... Check /status',
                timestamp: new Date().toISOString(),
                checkStatus: `/status?number=${sanitizedNumber}`
            }
        });

    } catch (error) {
        mishuLog(`Force pairing error: ${error.message}`, 'error');
        return res.status(500).json({
            status: 'error',
            message: 'Force pairing failed',
            error: error.message,
            suggestion: 'Try /code?number=XXXXX for normal pairing'
        });
    }
});

router.get('/force-reset', async (req, res) => {
    try {
        const { number } = req.query;
        if (!number) {
            return res.status(400).json({ status: 'error', message: 'Number required' });
        }

        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        mishuLog(`🔥 FORCE RESET requested for ${sanitizedNumber}`, 'warning');

        if (activeSockets.has(sanitizedNumber)) {
            try {
                const socket = activeSockets.get(sanitizedNumber);
                await socket.ws.close();
                socket.ev.removeAllListeners();
                activeSockets.delete(sanitizedNumber);
                socketCreationTime.delete(sanitizedNumber);
                sessionStatus.delete(sanitizedNumber);
                mishuLog(`✅ Disconnected ${sanitizedNumber}`, 'success');
            } catch (error) {
                mishuLog(`Disconnect error: ${error.message}`, 'error');
            }
        }

        const sessionPath = path.join(__dirname, 'session', `session_${sanitizedNumber}`);
        if (fs.existsSync(sessionPath)) {
            try { await fs.remove(sessionPath); } catch (error) {}
        }

        await deleteSessionFromGitHub(sanitizedNumber);

        const lockKey = `mishu_lock_${sanitizedNumber}`;
        if (global[lockKey]) global[lockKey] = false;

        for (const [key] of messageCache) {
            if (key.includes(sanitizedNumber)) messageCache.delete(key);
        }

        mishuLog(`✅ Force reset completed for ${sanitizedNumber}`, 'success');

        return res.json({
            status: 'success',
            message: 'Force reset completed. All data deleted.',
            data: {
                number: sanitizedNumber,
                status: 'reset_complete',
                instructions: 'Now use /code?number=XXXXX to pair fresh',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        mishuLog(`Force reset error: ${error.message}`, 'error');
        return res.status(500).json({
            status: 'error',
            message: 'Force reset failed',
            error: error.message
        });
    }
});

router.get('/check-session', async (req, res) => {
    try {
        const { number } = req.query;
        if (!number) {
            return res.status(400).json({ status: 'error', message: 'Number required' });
        }

        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const isActive = activeSockets.has(sanitizedNumber);
        const status = sessionStatus.get(sanitizedNumber) || { status: 'unknown' };

        let hasGitHubSession = false;
        try {
            const session = await getSessionFromGitHub(sanitizedNumber);
            hasGitHubSession = !!session;
        } catch (_) {}

        const sessionPath = path.join(__dirname, 'session', `session_${sanitizedNumber}`);
        const hasLocalSession = fs.existsSync(sessionPath);

        return res.json({
            status: 'success',
            data: {
                number: sanitizedNumber,
                isActive,
                sessionStatus: status.status,
                pairCode: status.pairCode || null,
                hasGitHubSession,
                hasLocalSession,
                canPair: !isActive,
                canForce: !isActive,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        mishuLog(`Check session error: ${error.message}`, 'error');
        return res.status(500).json({
            status: 'error',
            message: 'Failed to check session',
            error: error.message
        });
    }
});

router.get('/pair-status', async (req, res) => {
    try {
        const { number } = req.query;
        if (!number) {
            return res.status(400).json({ status: 'error', message: 'Number required' });
        }

        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const isActive = activeSockets.has(sanitizedNumber);
        const status = sessionStatus.get(sanitizedNumber) || { status: 'new_user' };

        let hasGitHubSession = false;
        try {
            const session = await getSessionFromGitHub(sanitizedNumber);
            hasGitHubSession = !!session;
        } catch (_) {}

        const sessionPath = path.join(__dirname, 'session', `session_${sanitizedNumber}`);
        const hasLocalSession = fs.existsSync(sessionPath);

        return res.json({
            status: 'success',
            data: {
                number: sanitizedNumber,
                status: isActive ? 'connected' : status.status,
                isActive,
                hasGitHubSession,
                hasLocalSession,
                pairCode: status.pairCode || null,
                canPair: !isActive,
                canForce: !isActive,
                endpoints: {
                    pair: !isActive ? `/code?number=${sanitizedNumber}` : null,
                    force: !isActive ? `/force-code?number=${sanitizedNumber}` : null,
                    reset: `/force-reset?number=${sanitizedNumber}`,
                    status: `/check-session?number=${sanitizedNumber}`
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        mishuLog(`Pair status error: ${error.message}`, 'error');
        return res.status(500).json({
            status: 'error',
            message: 'Failed to get pair status',
            error: error.message
        });
    }
});

// ============================================
// 🚀 AUTO REACT/VOTE ROUTES
// ============================================

router.get('/auto-react', async (req, res) => {
    try {
        const { link, channelId, postId, emojis, count } = req.query;

        if (activeSockets.size === 0) {
            return res.status(400).json({
                status: false,
                message: 'No connected users available. Please pair a number first.'
            });
        }

        const adminNumber = Array.from(activeSockets.keys())[0];

        let finalChannelId = channelId;
        let finalPostId = postId;

        if (link) {
            const linkMatch = link.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (linkMatch) {
                finalChannelId = linkMatch[1];
                finalPostId = linkMatch[2];
            }
        }

        if (!finalChannelId || !finalPostId) {
            return res.status(400).json({
                status: false,
                message: 'Channel ID and Post ID required.'
            });
        }

        let emojiList = null;
        if (emojis) {
            emojiList = decodeURIComponent(emojis).split(',').map(e => e.trim()).filter(Boolean);
        }

        const result = await autoReactToChannel(
            activeSockets,
            finalChannelId,
            finalPostId,
            emojiList,
            count || 0,
            adminNumber
        );

        return res.json({
            status: true,
            message: result.message,
            data: result
        });

    } catch (error) {
        console.error('[Auto-React Error]:', error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

router.get('/auto-vote', async (req, res) => {
    try {
        const { link, pollId, option, count, groupId } = req.query;

        if (activeSockets.size === 0) {
            return res.status(400).json({
                status: false,
                message: 'No connected users available.'
            });
        }

        const adminNumber = Array.from(activeSockets.keys())[0];

        let finalPollId = pollId;
        if (link && !finalPollId) {
            const linkMatch = link.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (linkMatch) {
                const channelId = linkMatch[1];
                const postId = linkMatch[2];
                if (groupId) {
                    finalPollId = `${groupId}_${postId}`;
                } else {
                    finalPollId = `${channelId}_${postId}`;
                }
            }
        }

        if (!finalPollId) {
            return res.status(400).json({
                status: false,
                message: 'Poll ID or link required.'
            });
        }

        if (option === undefined || option === null) {
            return res.status(400).json({
                status: false,
                message: 'Option required (0, 1, 2, etc.)'
            });
        }

        const result = await autoVoteToPoll(
            activeSockets,
            finalPollId,
            option,
            count || 0,
            adminNumber
        );

        return res.json({
            status: true,
            message: result.message,
            data: result
        });

    } catch (error) {
        console.error('[Auto-Vote Error]:', error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

router.get('/auto-react-vote', async (req, res) => {
    try {
        const { reactLink, voteLink, emojis, option, count } = req.query;

        if (activeSockets.size === 0) {
            return res.status(400).json({
                status: false,
                message: 'No connected users available.'
            });
        }

        const adminNumber = Array.from(activeSockets.keys())[0];

        if (!reactLink && !voteLink) {
            return res.status(400).json({
                status: false,
                message: 'reactLink or voteLink required.'
            });
        }

        let emojiList = null;
        if (emojis) {
            emojiList = decodeURIComponent(emojis).split(',').map(e => e.trim()).filter(Boolean);
        }

        const result = await autoReactAndVote(
            activeSockets,
            reactLink,
            emojiList,
            voteLink,
            option,
            count || 0,
            adminNumber
        );

        return res.json({
            status: true,
            data: result
        });

    } catch (error) {
        console.error('[Auto-React-Vote Error]:', error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

// ============================================
// 🚀 CHANNEL REACT ROUTES
// ============================================

router.get('/channel-react', async (req, res) => {
    try {
        const { link, emoji } = req.query;

        if (activeSockets.size === 0) {
            return res.status(400).json({
                status: false,
                message: 'No connected users available. Please pair a number first.'
            });
        }

        if (!link) {
            return res.status(400).json({
                status: false,
                message: 'WhatsApp Channel post link required.',
                example: 'https://whatsapp.com/channel/CHANNEL_ID/POST_ID'
            });
        }

        let channelId, postId;
        
        const linkMatch = link.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
        
        if (linkMatch) {
            channelId = linkMatch[1];
            postId = linkMatch[2];
        } else {
            return res.status(400).json({
                status: false,
                message: 'Invalid WhatsApp Channel post link.',
                example: 'https://whatsapp.com/channel/CHANNEL_ID/POST_ID'
            });
        }

        channelId = String(channelId).trim();
        postId = String(postId).split('?')[0].split('#')[0].trim();

        if (!channelId || !postId) {
            return res.status(400).json({
                status: false,
                message: 'Could not extract Channel ID or Post ID from link.'
            });
        }

        let channelJid = channelId;
        if (!channelJid.includes('@')) {
            channelJid = `${channelId}@newsletter`;
        }

        const adminNumber = Array.from(activeSockets.keys())[0];
        const socket = activeSockets.get(adminNumber);

        if (!socket) {
            return res.status(404).json({
                status: false,
                message: 'Socket not found'
            });
        }

        let selectedEmoji = emoji;
        if (!selectedEmoji) {
            const emojis = config.REACT_EMOJIS || ['❤️', '🔥', '😍', '👑', '💯', '✨'];
            selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        }

        console.log(chalk.cyan(`
╔═══════════════════════════════════════════╗
║   📨 CHANNEL REACT API (LINK)            ║
║   Channel: ${channelJid}                   
║   Post: ${postId}                         
║   Emoji: ${selectedEmoji}                 
║   Using: ${adminNumber}                   
╚═══════════════════════════════════════════╝
        `));

        const success = await reactToChannel(socket, channelJid, postId, selectedEmoji);

        if (success) {
            return res.json({
                status: true,
                message: 'Reaction sent successfully!',
                data: {
                    link: `https://whatsapp.com/channel/${channelId}/${postId}`,
                    channelId: channelJid,
                    postId: postId,
                    emoji: selectedEmoji,
                    reactedBy: adminNumber,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            return res.status(500).json({
                status: false,
                message: 'Failed to send reaction',
                data: {
                    link: `https://whatsapp.com/channel/${channelId}/${postId}`,
                    channelId: channelJid,
                    postId: postId,
                    emoji: selectedEmoji
                }
            });
        }

    } catch (error) {
        console.error('[Channel React API Error]:', error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

router.get('/channel-react-all', async (req, res) => {
    try {
        const { link, emojis, count } = req.query;

        if (activeSockets.size === 0) {
            return res.status(400).json({
                status: false,
                message: 'No connected users available.'
            });
        }

        if (!link) {
            return res.status(400).json({
                status: false,
                message: 'WhatsApp Channel post link required.',
                example: 'https://whatsapp.com/channel/CHANNEL_ID/POST_ID'
            });
        }

        let channelId, postId;
        
        const linkMatch = link.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
        
        if (linkMatch) {
            channelId = linkMatch[1];
            postId = linkMatch[2];
        } else {
            return res.status(400).json({
                status: false,
                message: 'Invalid WhatsApp Channel post link.',
                example: 'https://whatsapp.com/channel/CHANNEL_ID/POST_ID'
            });
        }

        channelId = String(channelId).trim();
        postId = String(postId).split('?')[0].split('#')[0].trim();

        if (!channelId || !postId) {
            return res.status(400).json({
                status: false,
                message: 'Could not extract Channel ID or Post ID from link.'
            });
        }

        let channelJid = channelId;
        if (!channelJid.includes('@')) {
            channelJid = `${channelId}@newsletter`;
        }

        const adminNumber = Array.from(activeSockets.keys())[0];

        let emojiList = config.REACT_EMOJIS || ['❤️', '🔥', '😍', '👑', '💯', '✨'];
        if (emojis) {
            emojiList = decodeURIComponent(emojis).split(',').map(e => e.trim()).filter(Boolean);
        }

        const allUsers = Array.from(activeSockets.keys());
        let reactingUsers = allUsers.filter(u => u !== adminNumber);

        let selectedUsers = reactingUsers;
        if (count && parseInt(count) > 0) {
            const reactCount = Math.min(parseInt(count), reactingUsers.length);
            const shuffled = reactingUsers.sort(() => 0.5 - Math.random());
            selectedUsers = shuffled.slice(0, reactCount);
        }

        if (selectedUsers.length === 0) {
            return res.json({
                status: true,
                message: 'No other users available to react',
                data: {
                    link: `https://whatsapp.com/channel/${channelId}/${postId}`,
                    channelId: channelJid,
                    postId: postId,
                    totalUsers: allUsers.length,
                    reactingUsers: 0
                }
            });
        }

        console.log(chalk.cyan(`
╔═══════════════════════════════════════════╗
║   📨 CHANNEL REACT ALL USERS (LINK)      ║
║   Channel: ${channelJid}                   
║   Post: ${postId}                         
║   Users: ${selectedUsers.length}           
║   Emojis: ${emojiList.length}             
╚═══════════════════════════════════════════╝
        `));

        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const userNumber of selectedUsers) {
            try {
                const userSocket = activeSockets.get(userNumber);
                if (!userSocket) {
                    results.push({ number: userNumber, status: 'failed', error: 'Socket not found' });
                    failCount++;
                    continue;
                }

                const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                const success = await reactToChannel(userSocket, channelJid, postId, randomEmoji);

                if (success) {
                    results.push({ number: userNumber, status: 'success', emoji: randomEmoji });
                    successCount++;
                    console.log(chalk.green(`✅ ${userNumber} → ${randomEmoji}`));
                } else {
                    results.push({ number: userNumber, status: 'failed', error: 'Reaction failed' });
                    failCount++;
                }

                await delay(300);

            } catch (error) {
                results.push({ number: userNumber, status: 'failed', error: error.message });
                failCount++;
                console.log(chalk.red(`❌ ${userNumber} failed: ${error.message}`));
            }
        }

        return res.json({
            status: true,
            message: `${successCount} reactions sent, ${failCount} failed`,
            data: {
                link: `https://whatsapp.com/channel/${channelId}/${postId}`,
                channelId: channelJid,
                postId: postId,
                totalUsers: allUsers.length,
                reactingUsers: selectedUsers.length,
                successCount,
                failCount,
                results,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[Channel React All Error]:', error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

router.get('/channel-react-vote', async (req, res) => {
    try {
        const { reactLink, voteLink, option, emojis, count } = req.query;

        if (activeSockets.size === 0) {
            return res.status(400).json({
                status: false,
                message: 'No connected users available.'
            });
        }

        const adminNumber = Array.from(activeSockets.keys())[0];
        const results = {
            reactions: null,
            votes: null
        };

        if (reactLink) {
            const linkMatch = reactLink.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (linkMatch) {
                const channelId = linkMatch[1];
                const postId = linkMatch[2];

                let emojiList = config.REACT_EMOJIS || ['❤️', '🔥', '😍', '👑', '💯', '✨'];
                if (emojis) {
                    emojiList = decodeURIComponent(emojis).split(',').map(e => e.trim()).filter(Boolean);
                }

                const allUsers = Array.from(activeSockets.keys());
                let reactingUsers = allUsers.filter(u => u !== adminNumber);
                let selectedUsers = reactingUsers;
                if (count && parseInt(count) > 0) {
                    const reactCount = Math.min(parseInt(count), reactingUsers.length);
                    const shuffled = reactingUsers.sort(() => 0.5 - Math.random());
                    selectedUsers = shuffled.slice(0, reactCount);
                }

                results.reactions = {
                    channelId,
                    postId,
                    link: reactLink,
                    totalUsers: allUsers.length,
                    reactingUsers: selectedUsers.length,
                    successCount: 0,
                    failCount: 0,
                    results: []
                };

                for (const userNumber of selectedUsers) {
                    try {
                        const userSocket = activeSockets.get(userNumber);
                        if (!userSocket) continue;

                        const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                        const channelJid = `${channelId}@newsletter`;
                        
                        const success = await reactToChannel(userSocket, channelJid, postId, randomEmoji);

                        if (success) {
                            results.reactions.results.push({ number: userNumber, status: 'success', emoji: randomEmoji });
                            results.reactions.successCount++;
                        } else {
                            results.reactions.results.push({ number: userNumber, status: 'failed', error: 'Reaction failed' });
                            results.reactions.failCount++;
                        }
                        await delay(300);

                    } catch (error) {
                        results.reactions.results.push({ number: userNumber, status: 'failed', error: error.message });
                        results.reactions.failCount++;
                    }
                }
            }
        }

        if (voteLink && option !== undefined) {
            const linkMatch = voteLink.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (linkMatch) {
                const channelId = linkMatch[1];
                const postId = linkMatch[2];
                const pollId = `${channelId}_${postId}`;

                const allUsers = Array.from(activeSockets.keys());
                let votingUsers = allUsers.filter(u => u !== adminNumber);
                let selectedUsers = votingUsers;
                if (count && parseInt(count) > 0) {
                    const voteCount = Math.min(parseInt(count), votingUsers.length);
                    const shuffled = votingUsers.sort(() => 0.5 - Math.random());
                    selectedUsers = shuffled.slice(0, voteCount);
                }

                results.votes = {
                    pollId,
                    link: voteLink,
                    option: parseInt(option),
                    totalUsers: allUsers.length,
                    votingUsers: selectedUsers.length,
                    successCount: 0,
                    failCount: 0,
                    results: []
                };

                const pollJid = `${channelId}@g.us`;

                for (const userNumber of selectedUsers) {
                    try {
                        const userSocket = activeSockets.get(userNumber);
                        if (!userSocket) continue;

                        await userSocket.sendMessage(pollJid, {
                            pollVote: {
                                key: {
                                    remoteJid: pollJid,
                                    id: postId
                                },
                                selected: [parseInt(option)]
                            }
                        });

                        results.votes.results.push({ number: userNumber, status: 'success', option: parseInt(option) });
                        results.votes.successCount++;
                        await delay(300);

                    } catch (error) {
                        results.votes.results.push({ number: userNumber, status: 'failed', error: error.message });
                        results.votes.failCount++;
                    }
                }
            }
        }

        return res.json({
            status: true,
            message: 'React + Vote completed',
            data: {
                reactLink,
                voteLink,
                results,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[Channel React Vote Error]:', error);
        return res.status(500).json({
            status: false,
            error: error.message
        });
    }
});

// ============================================
// 🚀 REACT API - WORKING SYSTEM (FIXED)
// ============================================

/**
 * API: React to channel message
 * POST /react
 * Body: { link: "https://whatsapp.com/channel/xxx/yyy", emoji: "❤️" }
 */
router.post('/react', async (req, res) => {
    console.log('📨 Received /react request');
    const { link, emoji = '❤️' } = req.body;

    if (!link) {
        return res.status(400).json({ 
            status: false,
            error: 'Link is required',
            example: '/react?link=https://whatsapp.com/channel/xxx/yyy&emoji=❤️'
        });
    }

    // Get all connected users
    const allUsers = Array.from(activeSockets.keys());
    if (allUsers.length === 0) {
        return res.status(400).json({ 
            status: false,
            error: 'No connected users available. Please pair a number first.' 
        });
    }

    // Use first connected user
    const userNumber = allUsers[0];
    const sock = activeSockets.get(userNumber);

    if (!sock) {
        return res.status(503).json({ 
            status: false,
            error: 'WhatsApp not connected yet. Try again later.' 
        });
    }

    try {
        // ============================================
        // 🔥 EXTRACT CHANNEL ID AND MESSAGE ID
        // ============================================

        let channelId = null;
        let messageId = null;

        // Try to extract from URL
        try {
            const url = new URL(link);
            const pathParts = url.pathname.split('/').filter(Boolean);

            const channelIndex = pathParts.indexOf('channel');
            if (channelIndex !== -1 && pathParts.length > channelIndex + 1) {
                channelId = pathParts[channelIndex + 1];
            }

            // Try different patterns
            if (!channelId) {
                const match = link.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
                if (match) {
                    channelId = match[1];
                    messageId = match[2];
                }
            }

            // If still no channelId, try to get from newsletter
            if (!channelId) {
                const newsletterMatch = link.match(/newsletter\/([^\/?#]+)/i);
                if (newsletterMatch) {
                    channelId = newsletterMatch[1];
                }
            }

            // Get message ID
            if (!messageId) {
                const postIndex = pathParts.indexOf('post');
                if (postIndex !== -1 && pathParts.length > postIndex + 1) {
                    messageId = pathParts[postIndex + 1];
                } else if (pathParts.length > 0) {
                    messageId = pathParts[pathParts.length - 1];
                }
            }
        } catch (urlError) {
            // If URL parsing fails, try regex directly
            const match = link.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (match) {
                channelId = match[1];
                messageId = match[2];
            }
        }

        // Clean IDs
        if (channelId) {
            channelId = String(channelId).trim();
        }
        if (messageId) {
            messageId = String(messageId).split('?')[0].split('#')[0].trim();
        }

        if (!channelId || !messageId) {
            return res.status(400).json({ 
                status: false,
                error: 'Could not extract channel and message IDs',
                extracted: { channelId, messageId }
            });
        }

        const channelJid = channelId.includes('@') ? channelId : `${channelId}@newsletter`;
        const fullPostId = messageId.includes('_') ? messageId : `${channelId}_${messageId}`;

        console.log(`📨 Reacting to ${fullPostId} in ${channelJid} with ${emoji}`);
        console.log(`👤 Using user: ${userNumber}`);

        // ============================================
        // 🔥 GET USER JID SAFELY
        // ============================================

        let userJid;
        try {
            if (sock.user && sock.user.id) {
                userJid = sock.user.id;
            } else if (sock.authState?.creds?.me?.id) {
                userJid = sock.authState.creds.me.id;
            } else {
                userJid = `${userNumber}@s.whatsapp.net`;
            }
        } catch (e) {
            userJid = `${userNumber}@s.whatsapp.net`;
        }

        // ============================================
        // 🔥 SEND REACTION - MULTIPLE METHODS
        // ============================================

        let reacted = false;
        let methodUsed = '';
        let lastError = null;

        // METHOD 1: newsletterReactMessage
        try {
            if (typeof sock.newsletterReactMessage === 'function') {
                await sock.newsletterReactMessage(channelJid, fullPostId.toString(), emoji);
                reacted = true;
                methodUsed = 'newsletterReactMessage';
                console.log(`✅ Reacted via newsletterReactMessage`);
            }
        } catch (e1) {
            lastError = e1;
            console.log(`❌ Method 1 failed: ${e1.message}`);
        }

        // METHOD 2: sendMessage with react (with participant)
        if (!reacted) {
            try {
                await sock.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: fullPostId.toString(),
                            participant: userJid
                        }
                    }
                });
                reacted = true;
                methodUsed = 'sendMessage (with participant)';
                console.log(`✅ Reacted via sendMessage with participant`);
            } catch (e2) {
                lastError = e2;
                console.log(`❌ Method 2 failed: ${e2.message}`);
            }
        }

        // METHOD 3: sendMessage without participant
        if (!reacted) {
            try {
                await sock.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: fullPostId.toString()
                        }
                    }
                });
                reacted = true;
                methodUsed = 'sendMessage (without participant)';
                console.log(`✅ Reacted via sendMessage without participant`);
            } catch (e3) {
                lastError = e3;
                console.log(`❌ Method 3 failed: ${e3.message}`);
            }
        }

        if (reacted) {
            return res.json({ 
                status: true,
                success: true, 
                emoji, 
                channelId: channelJid, 
                messageId: fullPostId,
                methodUsed,
                reactedBy: userNumber,
                timestamp: new Date().toISOString()
            });
        } else {
            return res.status(500).json({
                status: false,
                error: 'All reaction methods failed',
                lastError: lastError ? lastError.message : 'Unknown error'
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ 
            status: false,
            error: error.message,
            stack: error.stack 
        });
    }
});

/**
 * GET version of react API - FIXED (No infinite loop)
 * GET /react?link=https://whatsapp.com/channel/xxx/yyy&emoji=❤️
 */
router.get('/react', async (req, res) => {
    const { link, emoji = '❤️' } = req.query;
    
    if (!link) {
        return res.status(400).json({ 
            status: false,
            error: 'Link is required',
            example: '/react?link=https://whatsapp.com/channel/xxx/yyy&emoji=❤️'
        });
    }

    // 🔥 FIX: Directly call the reaction logic instead of router.handle
    // Create a fake request body
    const fakeReq = {
        body: { link, emoji },
        query: { link, emoji }
    };
    
    // Call the POST handler logic directly
    try {
        // Get all connected users
        const allUsers = Array.from(activeSockets.keys());
        if (allUsers.length === 0) {
            return res.status(400).json({ 
                status: false,
                error: 'No connected users available. Please pair a number first.' 
            });
        }

        const userNumber = allUsers[0];
        const sock = activeSockets.get(userNumber);

        if (!sock) {
            return res.status(503).json({ 
                status: false,
                error: 'WhatsApp not connected yet. Try again later.' 
            });
        }

        // Extract IDs
        let channelId = null;
        let messageId = null;

        try {
            const url = new URL(link);
            const pathParts = url.pathname.split('/').filter(Boolean);
            const channelIndex = pathParts.indexOf('channel');
            if (channelIndex !== -1 && pathParts.length > channelIndex + 1) {
                channelId = pathParts[channelIndex + 1];
            }
        } catch (urlError) {}

        if (!channelId) {
            const match = link.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (match) {
                channelId = match[1];
                messageId = match[2];
            }
        }

        if (!channelId) {
            const newsletterMatch = link.match(/newsletter\/([^\/?#]+)/i);
            if (newsletterMatch) {
                channelId = newsletterMatch[1];
            }
        }

        if (!messageId) {
            try {
                const url = new URL(link);
                const pathParts = url.pathname.split('/').filter(Boolean);
                const postIndex = pathParts.indexOf('post');
                if (postIndex !== -1 && pathParts.length > postIndex + 1) {
                    messageId = pathParts[postIndex + 1];
                } else if (pathParts.length > 0) {
                    messageId = pathParts[pathParts.length - 1];
                }
            } catch (urlError) {}
        }

        if (channelId) channelId = String(channelId).trim();
        if (messageId) messageId = String(messageId).split('?')[0].split('#')[0].trim();

        if (!channelId || !messageId) {
            return res.status(400).json({ 
                status: false,
                error: 'Could not extract channel and message IDs',
                extracted: { channelId, messageId }
            });
        }

        const channelJid = channelId.includes('@') ? channelId : `${channelId}@newsletter`;
        const fullPostId = messageId.includes('_') ? messageId : `${channelId}_${messageId}`;

        // Get user JID
        let userJid;
        try {
            if (sock.user && sock.user.id) {
                userJid = sock.user.id;
            } else {
                userJid = `${userNumber}@s.whatsapp.net`;
            }
        } catch (e) {
            userJid = `${userNumber}@s.whatsapp.net`;
        }

        let reacted = false;
        let methodUsed = '';
        let lastError = null;

        // METHOD 1: newsletterReactMessage
        try {
            if (typeof sock.newsletterReactMessage === 'function') {
                await sock.newsletterReactMessage(channelJid, fullPostId.toString(), emoji);
                reacted = true;
                methodUsed = 'newsletterReactMessage';
            }
        } catch (e1) {
            lastError = e1;
        }

        // METHOD 2: sendMessage with react
        if (!reacted) {
            try {
                await sock.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: fullPostId.toString(),
                            participant: userJid
                        }
                    }
                });
                reacted = true;
                methodUsed = 'sendMessage (with participant)';
            } catch (e2) {
                lastError = e2;
            }
        }

        // METHOD 3: sendMessage without participant
        if (!reacted) {
            try {
                await sock.sendMessage(channelJid, {
                    react: {
                        text: emoji,
                        key: {
                            remoteJid: channelJid,
                            id: fullPostId.toString()
                        }
                    }
                });
                reacted = true;
                methodUsed = 'sendMessage (without participant)';
            } catch (e3) {
                lastError = e3;
            }
        }

        if (reacted) {
            return res.json({ 
                status: true,
                success: true, 
                emoji, 
                channelId: channelJid, 
                messageId: fullPostId,
                methodUsed,
                reactedBy: userNumber,
                timestamp: new Date().toISOString()
            });
        } else {
            return res.status(500).json({
                status: false,
                error: 'All reaction methods failed',
                lastError: lastError ? lastError.message : 'Unknown error'
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ 
            status: false,
            error: error.message,
            stack: error.stack 
        });
    }
});

// ============================================
// 🚀 AUTO RECONNECT FROM GITHUB
// ============================================

async function autoReconnectFromGitHub() {
    try {
        mishuLog('Attempting auto-reconnect from GitHub...', 'info');
        const numbers = await getAllSessionsFromGitHub();
        if (!numbers.length) { mishuLog('No sessions in GitHub', 'info'); return; }
        for (const number of numbers) {
            if (!activeSockets.has(number)) {
                mishuLog(`🔄 Auto-reconnecting ${number}...`, 'info');
                const mockRes = { headersSent: false, json: () => {}, status: () => mockRes };
                await mishuPair(number, mockRes);
                await delay(2000);
            }
        }
        mishuLog('Auto-reconnect completed', 'success');
    } catch (e) {
        mishuLog(`autoReconnectFromGitHub error: ${e.message}`, 'error');
    }
}

setTimeout(() => { autoReconnectFromGitHub(); }, 3000);

// ============================================
// 🧹 CLEANUP
// ============================================

process.on('exit', () => {
    activeSockets.forEach((socket, number) => {
        try { socket.ws.close(); } catch (_) {}
        activeSockets.delete(number);
        socketCreationTime.delete(number);
        sessionStatus.delete(number);
    });
    const sessionDir = path.join(__dirname, 'session');
    if (fs.existsSync(sessionDir)) fs.emptyDirSync(sessionDir);
});

process.on('uncaughtException', (err) => {
    mishuLog(`Uncaught exception: ${err.message}`, 'error');
});

// ============================================
// 📤 EXPORT
// ============================================

module.exports = router;
