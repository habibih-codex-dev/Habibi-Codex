/**
 * commands/main/profile.js
 * Menampilkan profil & sisa limit pengguna.
 */
const { formatDate } = require("../../lib/functions");
const setting = require("../../setting");

module.exports = {
  command: ["profile", "me", "limit", "status"],
  tags: "main",
  description: "Melihat profil, status premium, dan sisa limit",
  async run(m, ctx) {
    const { user, isOwner, isPremium, db } = ctx;
    const limit = isOwner || isPremium ? "∞ (Unlimited)" : `${user.limit}`;
    const premiumInfo = isOwner
      ? "Owner 👑"
      : isPremium
      ? `Aktif 💎 (s/d ${formatDate(new Date(user.premiumExpired))})`
      : "Tidak aktif";

    await m.reply(
      `╭───「 *PROFIL KAMU* 」\n` +
        `│ 👤 Nama   : ${user.name || m.pushName}\n` +
        `│ 📱 Nomor  : ${m.sender.split("@")[0]}\n` +
        `│ 📝 Daftar : ${user.registered ? "Ya" : "Belum"}\n` +
        `│ 🎫 Limit  : ${limit}\n` +
        `│ 💎 Premium: ${premiumInfo}\n` +
        `│ ⚠️ Warn   : ${user.warn || 0}\n` +
        `╰────────────────⊷\n\n${setting.footer}`
    );
  },
};
