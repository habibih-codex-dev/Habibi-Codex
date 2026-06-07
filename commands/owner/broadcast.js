/**
 * commands/owner/broadcast.js
 * Kirim pesan siaran (broadcast) ke semua chat / semua grup.
 */
const { sleep } = require("../../lib/functions");
const setting = require("../../setting");

module.exports = [
  {
    command: ["broadcast", "bc"],
    tags: "owner",
    owner: true,
    description: "Broadcast pesan ke semua pengguna (chat pribadi)",
    async run(m, ctx) {
      const text = ctx.text.trim();
      if (!text) return m.reply(`📢 Format: *${ctx.usedPrefix}bc <pesan>*`);

      const targets = Object.keys(ctx.db.data.users).filter(
        (jid) => jid.endsWith("@s.whatsapp.net")
      );
      await m.reply(`📢 Memulai broadcast ke ${targets.length} pengguna...`);

      let ok = 0;
      for (const jid of targets) {
        try {
          await ctx.conn.sendMessage(jid, {
            text: `📢 *BROADCAST ${setting.botName}*\n\n${text}\n\n${setting.footer}`,
          });
          ok++;
          await sleep(1500); // jeda agar tidak dianggap spam
        } catch {}
      }
      await m.reply(`✅ Broadcast selesai. Terkirim ke ${ok}/${targets.length} pengguna.`);
    },
  },
  {
    command: ["broadcastgc", "bcgc"],
    tags: "owner",
    owner: true,
    description: "Broadcast pesan ke semua grup",
    async run(m, ctx) {
      const text = ctx.text.trim();
      if (!text) return m.reply(`📢 Format: *${ctx.usedPrefix}bcgc <pesan>*`);

      const groups = await ctx.conn.groupFetchAllParticipating();
      const ids = Object.keys(groups);
      await m.reply(`📢 Memulai broadcast ke ${ids.length} grup...`);

      let ok = 0;
      for (const jid of ids) {
        try {
          await ctx.conn.sendMessage(jid, {
            text: `📢 *BROADCAST ${setting.botName}*\n\n${text}\n\n${setting.footer}`,
          });
          ok++;
          await sleep(1500);
        } catch {}
      }
      await m.reply(`✅ Broadcast grup selesai. Terkirim ke ${ok}/${ids.length} grup.`);
    },
  },
];
