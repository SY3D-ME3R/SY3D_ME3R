// ============================================
// 📦 lib/autoReactVote.js - FIXED VERSION
// 👑 Developer: SYED MEER
// 🔥 Auto React & Vote System - FULLY FIXED
// ============================================

const { delay, jidNormalizedUser } = require('@whiskeysockets/baileys');

// ============================================
// 📊 JOB STORAGE (for tracking)
// ============================================

const jobResults = new Map();

function storeJobResult(processId, result) {
    jobResults.set(processId, {
        ...result,
        timestamp: new Date().toISOString(),
        status: 'completed'
    });
    // Cleanup old jobs after 1 hour
    setTimeout(() => {
        jobResults.delete(processId);
    }, 3600000);
}

function getJobResult(processId) {
    return jobResults.get(processId);
}

// ============================================
// 🔥 FIXED: React to Channel
// ============================================

async function autoReactToChannel(activeSockets, channelId, postId, emojis = null, count = 0, adminNumber = null) {
    const startTime = Date.now();
    const processId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    try {
        // Get all connected users
        const allUsers = Array.from(activeSockets.keys());
        
        if (allUsers.length === 0) {
            return {
                status: false,
                message: 'No connected users available',
                processId,
                timestamp: new Date().toISOString()
            };
        }

        // Filter users (exclude admin if provided)
        let reactingUsers = allUsers;
        if (adminNumber) {
            reactingUsers = allUsers.filter(u => u !== adminNumber);
        }

        // If count specified, select random users
        let selectedUsers = reactingUsers;
        if (count && parseInt(count) > 0) {
            const reactCount = Math.min(parseInt(count), reactingUsers.length);
            const shuffled = reactingUsers.sort(() => 0.5 - Math.random());
            selectedUsers = shuffled.slice(0, reactCount);
        }

        if (selectedUsers.length === 0) {
            return {
                status: false,
                message: 'No users available to react',
                processId,
                channelId,
                postId,
                totalConnected: allUsers.length,
                reactingUsers: selectedUsers.length,
                timestamp: new Date().toISOString()
            };
        }

        // Prepare emoji list
        let emojiList = emojis || ['❤️', '🔥', '😍', '👑', '💯', '✨', '💖', '🎉', '⭐', '🌈'];
        if (typeof emojiList === 'string') {
            emojiList = emojiList.split(',').map(e => e.trim()).filter(Boolean);
        }

        // Prepare channel JID
        const channelJid = channelId.includes('@') ? channelId : `${channelId}@newsletter`;
        const fullPostId = postId.includes('_') ? postId : `${channelId}_${postId}`;

        console.log(`[AutoReact] 📨 Channel: ${channelJid}, Post: ${fullPostId}`);
        console.log(`[AutoReact] 👥 Users: ${selectedUsers.length}, Emojis: ${emojiList.length}`);

        // ============================================
        // 🔥 SEND REACTIONS
        // ============================================

        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const userNumber of selectedUsers) {
            try {
                const socket = activeSockets.get(userNumber);
                
                // 🔥 FIX: Check if socket exists and has user
                if (!socket) {
                    results.push({ number: userNumber, status: 'failed', error: 'Socket not found' });
                    failCount++;
                    continue;
                }

                // 🔥 FIX: Get user ID safely
                let userJid;
                try {
                    // Try to get from socket.user.id
                    if (socket.user && socket.user.id) {
                        userJid = jidNormalizedUser(socket.user.id);
                    } else if (socket.authState?.creds?.me?.id) {
                        userJid = jidNormalizedUser(socket.authState.creds.me.id);
                    } else {
                        // Fallback: create JID from number
                        userJid = jidNormalizedUser(`${userNumber}@s.whatsapp.net`);
                    }
                } catch (e) {
                    // Fallback: create JID from number
                    userJid = jidNormalizedUser(`${userNumber}@s.whatsapp.net`);
                }

                const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

                // 🔥 FIX: Try multiple methods to react
                let reacted = false;
                let lastError = null;

                // Method 1: newsletterReactMessage
                try {
                    if (typeof socket.newsletterReactMessage === 'function') {
                        await socket.newsletterReactMessage(channelJid, fullPostId.toString(), randomEmoji);
                        reacted = true;
                        console.log(`[AutoReact] ✅ ${userNumber} → ${randomEmoji} (method 1)`);
                    }
                } catch (e1) {
                    lastError = e1;
                }

                // Method 2: sendMessage with react
                if (!reacted) {
                    try {
                        await socket.sendMessage(channelJid, {
                            react: {
                                text: randomEmoji,
                                key: {
                                    remoteJid: channelJid,
                                    id: fullPostId.toString(),
                                    participant: userJid
                                }
                            }
                        });
                        reacted = true;
                        console.log(`[AutoReact] ✅ ${userNumber} → ${randomEmoji} (method 2)`);
                    } catch (e2) {
                        lastError = e2;
                    }
                }

                // Method 3: Try without participant
                if (!reacted) {
                    try {
                        await socket.sendMessage(channelJid, {
                            react: {
                                text: randomEmoji,
                                key: {
                                    remoteJid: channelJid,
                                    id: fullPostId.toString()
                                }
                            }
                        });
                        reacted = true;
                        console.log(`[AutoReact] ✅ ${userNumber} → ${randomEmoji} (method 3)`);
                    } catch (e3) {
                        lastError = e3;
                    }
                }

                if (reacted) {
                    results.push({ number: userNumber, status: 'success', emoji: randomEmoji });
                    successCount++;
                } else {
                    results.push({ 
                        number: userNumber, 
                        status: 'failed', 
                        error: lastError ? lastError.message : 'All methods failed' 
                    });
                    failCount++;
                }

                // Small delay between users
                await delay(300);

            } catch (error) {
                results.push({ 
                    number: userNumber, 
                    status: 'failed', 
                    error: error.message 
                });
                failCount++;
                console.log(`[AutoReact] ❌ ${userNumber} failed: ${error.message}`);
            }
        }

        const duration = Date.now() - startTime;
        const result = {
            status: successCount > 0,
            processId,
            channelId,
            postId,
            totalConnected: allUsers.length,
            reactingUsers: selectedUsers.length,
            successCount,
            failCount,
            results,
            timestamp: new Date().toISOString(),
            duration,
            message: `${successCount} reactions sent, ${failCount} failed in ${duration}ms`
        };

        // Store result for status check
        storeJobResult(processId, result);
        
        return result;

    } catch (error) {
        console.error('[AutoReact] Error:', error);
        const result = {
            status: false,
            processId,
            channelId,
            postId,
            error: error.message,
            timestamp: new Date().toISOString(),
            message: `Failed: ${error.message}`
        };
        storeJobResult(processId, result);
        return result;
    }
}

// ============================================
// 🔥 FIXED: Vote to Poll
// ============================================

async function autoVoteToPoll(activeSockets, pollId, option, count = 0, adminNumber = null) {
    const startTime = Date.now();
    const processId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    try {
        const allUsers = Array.from(activeSockets.keys());
        
        if (allUsers.length === 0) {
            return {
                status: false,
                message: 'No connected users available',
                processId,
                timestamp: new Date().toISOString()
            };
        }

        let votingUsers = allUsers;
        if (adminNumber) {
            votingUsers = allUsers.filter(u => u !== adminNumber);
        }

        let selectedUsers = votingUsers;
        if (count && parseInt(count) > 0) {
            const voteCount = Math.min(parseInt(count), votingUsers.length);
            const shuffled = votingUsers.sort(() => 0.5 - Math.random());
            selectedUsers = shuffled.slice(0, voteCount);
        }

        if (selectedUsers.length === 0) {
            return {
                status: false,
                message: 'No users available to vote',
                processId,
                pollId,
                totalConnected: allUsers.length,
                votingUsers: selectedUsers.length,
                timestamp: new Date().toISOString()
            };
        }

        // Parse poll ID
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

        console.log(`[AutoVote] 📨 Poll: ${pollJid}, Message: ${pollMessageId}, Option: ${option}`);

        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const userNumber of selectedUsers) {
            try {
                const socket = activeSockets.get(userNumber);
                
                if (!socket) {
                    results.push({ number: userNumber, status: 'failed', error: 'Socket not found' });
                    failCount++;
                    continue;
                }

                try {
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
                    console.log(`[AutoVote] ✅ ${userNumber} → Option ${option}`);
                } catch (error) {
                    results.push({ number: userNumber, status: 'failed', error: error.message });
                    failCount++;
                    console.log(`[AutoVote] ❌ ${userNumber} failed: ${error.message}`);
                }

                await delay(300);

            } catch (error) {
                results.push({ number: userNumber, status: 'failed', error: error.message });
                failCount++;
            }
        }

        const duration = Date.now() - startTime;
        const result = {
            status: successCount > 0,
            processId,
            pollId,
            option: parseInt(option),
            totalConnected: allUsers.length,
            votingUsers: selectedUsers.length,
            successCount,
            failCount,
            results,
            timestamp: new Date().toISOString(),
            duration,
            message: `${successCount} votes sent, ${failCount} failed in ${duration}ms`
        };

        storeJobResult(processId, result);
        return result;

    } catch (error) {
        console.error('[AutoVote] Error:', error);
        const result = {
            status: false,
            processId,
            pollId,
            error: error.message,
            timestamp: new Date().toISOString(),
            message: `Failed: ${error.message}`
        };
        storeJobResult(processId, result);
        return result;
    }
}

// ============================================
// 🔥 FIXED: Combined React + Vote
// ============================================

async function autoReactAndVote(activeSockets, reactLink, emojis, voteLink, option, count = 0, adminNumber = null) {
    const processId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    
    try {
        let reactResult = null;
        let voteResult = null;

        // Process reactions
        if (reactLink) {
            const linkMatch = reactLink.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (linkMatch) {
                const channelId = linkMatch[1];
                const postId = linkMatch[2];
                reactResult = await autoReactToChannel(activeSockets, channelId, postId, emojis, count, adminNumber);
            }
        }

        // Process votes
        if (voteLink && option !== undefined) {
            const linkMatch = voteLink.match(/(?:whatsapp\.com|wa\.me)\/channel\/([^\/?#]+)\/([^\/?#]+)/i);
            if (linkMatch) {
                const channelId = linkMatch[1];
                const postId = linkMatch[2];
                const pollId = `${channelId}_${postId}`;
                voteResult = await autoVoteToPoll(activeSockets, pollId, option, count, adminNumber);
            }
        }

        return {
            status: true,
            processId,
            reactions: reactResult,
            votes: voteResult,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('[AutoReactVote] Error:', error);
        return {
            status: false,
            processId,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// ============================================
// 📤 EXPORT
// ============================================

module.exports = {
    autoReactToChannel,
    autoVoteToPoll,
    autoReactAndVote,
    storeJobResult,
    getJobResult,
    jobResults
};
