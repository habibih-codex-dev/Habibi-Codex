/**
 * commands/main/daftar.js
 * Registrasi pengguna (dipakai sistem limit/register).
 */
const setting = require("../../setting");

module.exports = {
  command: ["daftar", "register", "reg"],
  tags: "main",
  description: "Mendaftarkan diri agar bisa memakai fitur tertentu",
  async run(m, ctx) {
    const { user, db } = ctx;
    if (user.registered) {
      return m.reply(
        `✅ Kamu sudah terdaftar dengan nama *${user.name || m.pushName}*.`
      );
    }
    const name = ctx.text.trim();
    if (!name) {
      return m.reply(
        `📝 *PENDAFTARAN*\n\nFormat: *${ctx.usedPrefix}daftar nama*\nContoh: *${ctx.usedPrefix}daftar Habibi*`
      );
    }
    user.registered = true;
    user.name = name;
    user.regTime = Date.now();
    db.save("users");
    await m.reply(
      `✅ *Pendaftaran berhasil!*\n\n` +
        `👤 Nama  : ${name}\n` +
        `🎫 Limit : ${user.limit}\n` +
        `💎 Status: Free\n\n` +
        `Ketik *${ctx.usedPrefix}menu* untuk melihat fitur.`
    );
  },
};
