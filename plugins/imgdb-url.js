// ============================================
// 📁 plugins/tourl.js - IMAGE TO URL (WITH CAPTION)
// 👑 Developer: SYED MEER
// 🔥 Reply System + Caption Support
// ============================================

const axios = require("axios");
const FormData = require('form-data');
const { mishu } = require("../mishu");
const { sendButtons } = require('gifted-btns');

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '8db492efc937a635b90680a9a860dc85';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

mishu({
    'pattern': "tourl",
    'alias': ["imgtourl", "imgurl", "url", "geturl", "upload"],
    'react': '🖼️',
    'desc': "Convert image to ImgBB URL with caption",
    'category': "utility",
    'use': ".tourl [reply to image] or .tourl <image url>",
    'filename': __filename
}, async (client, message, match, context) => {
    try {
        const { from, reply, quoted, isReply, repliedType } = context;

        const query = Array.isArray(match) ? match.join(' ').trim() : String(match || '').trim();

        // ============================================
        // 🔥 GET IMAGE CAPTION
        // ============================================

        let imageCaption = '';
        let imageBuffer = null;
        let imageUrl = null;
        let mimeType = '';
        let originalMessage = null;

        // ── Check if replied to a message ──
        if (isReply) {
            const quotedMsg = quoted?.msg || 
                              quoted || 
                              message?.quoted || 
                              message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (quotedMsg) {
                // ── Get caption from quoted message ──
                if (quotedMsg?.imageMessage?.caption) {
                    imageCaption = quotedMsg.imageMessage.caption;
                } else if (quotedMsg?.stickerMessage?.caption) {
                    imageCaption = quotedMsg.stickerMessage.caption;
                } else if (quotedMsg?.caption) {
                    imageCaption = quotedMsg.caption;
                } else if (quotedMsg?.conversation) {
                    imageCaption = quotedMsg.conversation;
                }

                // ── Get mimeType ──
                mimeType = quotedMsg?.mimetype || 
                           quotedMsg?.imageMessage?.mimetype || 
                           quotedMsg?.stickerMessage?.mimetype || 
                           '';

                // ── Download image ──
                try {
                    if (typeof quoted?.download === 'function') {
                        imageBuffer = await quoted.download();
                    } else if (typeof message?.quoted?.download === 'function') {
                        imageBuffer = await message.quoted.download();
                    }
                } catch (e) {
                    console.error('[tourl] Download error:', e.message);
                }

                // ── Store original message ──
                originalMessage = quotedMsg;
            }
        }

        // ── If query has URL ──
        if (!imageBuffer) {
            const urlMatch = query.match(/(https?:\/\/[^\s]+)/i);
            if (urlMatch) {
                imageUrl = urlMatch[0];
                // Try to get caption from query after URL
                const afterUrl = query.replace(urlMatch[0], '').trim();
                if (afterUrl) {
                    imageCaption = afterUrl;
                }
            }
        }

        // ── Try to get image from message directly ──
        if (!imageBuffer && !imageUrl) {
            const msg = message?.msg || message;
            if (msg?.imageMessage) {
                try {
                    const stream = await downloadContentFromMessage(msg.imageMessage, 'image');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    imageBuffer = buffer;
                    mimeType = msg.imageMessage.mimetype || 'image/jpeg';
                    imageCaption = msg.imageMessage.caption || '';
                    originalMessage = msg.imageMessage;
                } catch (e) {
                    console.error('[tourl] Direct image download error:', e.message);
                }
            } else if (msg?.stickerMessage) {
                try {
                    const stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    imageBuffer = buffer;
                    mimeType = 'image/webp';
                    imageCaption = msg.stickerMessage.caption || '';
                    originalMessage = msg.stickerMessage;
                } catch (e) {
                    console.error('[tourl] Direct sticker download error:', e.message);
                }
            }
        }

        // ── If no image found ──
        if (!imageBuffer && !imageUrl) {
            return reply("🍁 Please reply to an image/sticker or provide an image URL\n\n*Use:* .tourl [reply] or .tourl <url>");
        }

        // ── If replied message is not image ──
        if (isReply && mimeType && !mimeType.includes('image') && !mimeType.includes('sticker') && !imageUrl) {
            return reply("❌ Please reply to an image or sticker message.");
        }

        // ============================================
        // 🔥 UPLOAD TO IMGBB
        // ============================================

        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);

        if (imageBuffer) {
            formData.append('image', imageBuffer.toString('base64'));
        } else if (imageUrl) {
            formData.append('image', imageUrl);
        }
        formData.append('name', `upload_${Date.now()}`);

        const response = await axios.post(IMGBB_API_URL, formData, {
            headers: formData.getHeaders(),
            timeout: 60000
        });

        if (!response.data || !response.data.success) {
            throw response.data?.error?.message || "Upload failed";
        }

        const result = response.data.data;
        const resultUrl = result.url || result.display_url || result.image?.url;

        if (!resultUrl) {
            throw "No image URL in response";
        }

        // ============================================
        // 🔥 BUILD RESPONSE WITH CAPTION
        // ============================================

        // ── Get file name ──
        const fileName = originalMessage?.fileName || 
                         originalMessage?.imageMessage?.fileName || 
                         'image';

        // ── Build caption ──
        let captionText = `🖼️ *Image Uploaded Successfully*\n\n`;

        // ── Add original caption if exists ──
        if (imageCaption) {
            captionText += `📝 *Caption:* ${imageCaption}\n`;
        }

        // ── Add file details ──
        captionText += `📁 *File:* ${fileName}\n`;
        captionText += `📦 *Size:* ${formatBytes(result.size || 0)}\n`;
        captionText += `🔗 *URL:* ${resultUrl}\n\n`;
        captionText += `> *© Uploaded by MEER_xD 🍸*`;

        // ── Send with buttons ──
        await sendButtons(client, from, {
            title: '',
            text: captionText,
            buttons: [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 Copy URL',
                        copy_code: resultUrl
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🌐 Open Link',
                        url: resultUrl
                    })
                }
            ]
        });

    } catch (error) {
        console.error('[tourl] Error:', error);
        await context.reply(`❌ Error: ${error.message || error}`);
    }
});

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
