/**
 * plugins/autopresence.js
 * ----------------------------------------------------
 * Auto Typing: bila diaktifkan (.autotyping on), bot akan
 * menampilkan status "sedang mengetik" pada setiap chat masuk.
 *
 * Catatan: Auto Read (centang biru) ditangani di index.js
 * pada event messages.upsert berdasarkan settings.autoread.
 * ----------------------------------------------------
 */

module.exports = {
  name: "autopresence",
  priority: 1,
  async run(m, ctx) {
    if (ctx.settings.autotyping) {
      try {
        await ctx.conn.sendPresenceUpdate("composing", m.chat);
      } catch {}
    }
    return false; // jangan hentikan proses
  },
};
