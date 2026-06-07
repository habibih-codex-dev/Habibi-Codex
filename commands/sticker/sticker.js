/**
 * commands/sticker/sticker.js
 * Membuat stiker dari gambar/video (atau reply media).
 */
const { createSticker } = require("../../lib/sticker");
const setting = require("../../setting");

module.exports = {
  command: ["sticker", "s", "stiker"],
  tags: "sticker",
  description: "Membuat stiker dari gambar/video (reply media juga bisa)",
  async run(m, ctx) {
    // Sumber media: pesan saat ini atau pesan yang di-reply
    const target = m.quoted && m.quoted.msg ? m.quoted : m;
    const mtype = target.mtype;
    const isImage = mtype === "imageMessage";
    const isVideo = mtype === "videoMessage";

    if (!isImage && !isVideo) {
      return m.reply(
        `🖼️ *STICKER MAKER*\n\nKirim/zoom gambar atau video lalu beri caption *${ctx.usedPrefix}sticker*,\natau *reply* media dengan *${ctx.usedPrefix}sticker*.`
      );
    }

    // Batasi durasi video agar tidak terlalu berat
    if (isVideo) {
      const seconds = target.msg?.seconds || 0;
      if (seconds > 10) {
        return m.reply("⚠️ Video terlalu panjang. Maksimal 10 detik untuk stiker.");
      }
    }

    await m.react(setting.reactProcess);
    try {
      const buffer = await target.download();
      const sticker = await createSticker(buffer, {
        pack: setting.botName,
        author: setting.ownerName,
      });
      await ctx.conn.sendMessage(m.chat, { sticker }, { quoted: m });
      await m.react(setting.reactDone);
    } catch (e) {
      await m.react(setting.reactError);
      m.reply(`❌ Gagal membuat stiker.\n> ${e.message}`);
    }
  },
};
