/**
 * lib/serialize.js
 * ----------------------------------------------------
 * Mengubah objek pesan Baileys yang kompleks menjadi
 * objek "m" yang sederhana & konsisten untuk dipakai
 * di seluruh command/plugin.
 * ----------------------------------------------------
 */

const {
  getContentType,
  jidNormalizedUser,
  downloadMediaMessage,
} = require("@whiskeysockets/baileys");

/** Ambil teks dari berbagai tipe pesan */
function extractText(message) {
  if (!message) return "";
  const type = getContentType(message);
  if (!type) return "";
  const msg = message[type];

  if (type === "conversation") return message.conversation || "";
  if (type === "extendedTextMessage") return msg?.text || "";
  if (type === "imageMessage" || type === "videoMessage") return msg?.caption || "";
  if (type === "buttonsResponseMessage") return msg?.selectedButtonId || "";
  if (type === "listResponseMessage")
    return msg?.singleSelectReply?.selectedRowId || "";
  if (type === "templateButtonReplyMessage") return msg?.selectedId || "";
  if (type === "interactiveResponseMessage") {
    try {
      const params = JSON.parse(
        msg?.nativeFlowResponseMessage?.paramsJson || "{}"
      );
      return params.id || "";
    } catch {
      return "";
    }
  }
  if (typeof msg === "string") return msg;
  return "";
}

/**
 * Serialize sebuah pesan menjadi objek m yang nyaman.
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 * @param {object} msg - object dari messages.upsert
 */
async function serialize(conn, msg) {
  const m = {};
  if (!msg) return m;
  if (!msg.message) {
    m.message = null;
    return m;
  }

  m.key = msg.key;
  m.id = msg.key.id;
  m.chat = msg.key.remoteJid;
  m.fromMe = msg.key.fromMe;
  m.isGroup = m.chat?.endsWith("@g.us");
  m.sender = jidNormalizedUser(
    m.fromMe
      ? conn.user.id
      : m.isGroup
      ? msg.key.participant || msg.participant
      : m.chat
  );
  m.pushName = msg.pushName || "";
  m.messageTimestamp = msg.messageTimestamp;

  // Tipe & konten
  m.message = msg.message;
  m.mtype = getContentType(msg.message);
  m.msg = m.mtype ? msg.message[m.mtype] : null;
  m.body = extractText(msg.message);
  m.text = m.body;

  // Mentions
  m.mentionedJid = m.msg?.contextInfo?.mentionedJid || [];

  // Quoted / reply
  const ctx = m.msg?.contextInfo;
  if (ctx && ctx.quotedMessage) {
    const qtype = getContentType(ctx.quotedMessage);
    m.quoted = {
      key: {
        remoteJid: m.chat,
        fromMe: jidNormalizedUser(ctx.participant) === jidNormalizedUser(conn.user.id),
        id: ctx.stanzaId,
        participant: ctx.participant,
      },
      message: ctx.quotedMessage,
      sender: jidNormalizedUser(ctx.participant),
      mtype: qtype,
      msg: ctx.quotedMessage[qtype],
      text: extractText(ctx.quotedMessage),
      download: () =>
        downloadMediaMessage(
          { key: m.quoted.key, message: ctx.quotedMessage },
          "buffer",
          {},
          { reuploadRequest: conn.updateMediaMessage }
        ),
    };
  } else {
    m.quoted = null;
  }

  // Helper download media pesan ini sendiri
  m.download = () =>
    downloadMediaMessage(
      msg,
      "buffer",
      {},
      { reuploadRequest: conn.updateMediaMessage }
    );

  // Helper balas pesan
  m.reply = (text, options = {}) => {
    if (typeof text === "string") {
      return conn.sendMessage(
        m.chat,
        { text, ...options },
        { quoted: msg, ...options }
      );
    }
    return conn.sendMessage(m.chat, text, { quoted: msg, ...options });
  };

  // Helper reaksi emoji
  m.react = (emoji) =>
    conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });

  return m;
}

module.exports = { serialize, extractText };
