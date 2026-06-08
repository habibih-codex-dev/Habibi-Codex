/**
 * plugins/antilink.js
 * ----------------------------------------------------
 * Middleware Anti-Link untuk grup.
 * Jika diaktifkan (.antilink on), pesan berisi link grup
 * WhatsApp dari non-admin akan dihapus & pengirim
 * diperingatkan / dikeluarkan setelah 3 peringatan.
 * ----------------------------------------------------
 */

const setting = require("../setting");

const LINK_REGEX = /(chat\.whatsapp\.com\/[A-Za-z0-9]+)|(https?:\/\/(wa\.me|t\.me|bit\.ly|linktr\.ee|youtu\.be|instagram\.com)\/?\S*)/i;

module.exports = {
  name: "antilink",
  priority: 10,
  async run(m, ctx) {
    if (!m.isGroup) return false;
    if (!ctx.groupData || !ctx.groupData.antilink) return false;
    if (ctx.isAdmin || ctx.isOwner) return false; // admin & owner bebas
    if (!ctx.isBotAdmin) return false; // bot harus admin untuk hapus/kick

    const body = m.body || "";
    if (!LINK_REGEX.test(body)) return false;

    // Hapus pesan
    try {
      await ctx.conn.sendMessage(m.chat, { delete: m.key });
    } catch {}

    // Tambah peringatan
    const u = ctx.db.initUser(m.sender);
    u.warn = (u.warn || 0) + 1;
    ctx.db.save("users");

    if (u.warn >= 3) {
      u.warn = 0;
      ctx.db.save("users");
      try {
        await ctx.conn.sendMessage(m.chat, {
          text: `🚫 @${m.sender.split("@")[0]} dikeluarkan karena mengirim link (3x peringatan).`,
          mentions: [m.sender],
        });
        await ctx.conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");
      } catch {}
    } else {
      await ctx.conn.sendMessage(m.chat, {
        text: `⚠️ *ANTI-LINK*\n@${m.sender.split("@")[0]}, dilarang mengirim link di grup ini!\nPeringatan: *${u.warn}/3*`,
        mentions: [m.sender],
      });
    }
    return true; // hentikan proses command
  },
};
