/**
 * commands/owner/limit.js
 * Kelola limit pengguna (tambah / reset semua).
 */
const setting = require("../../setting");

function getTarget(m, ctx) {
  if (m.mentionedJid && m.mentionedJid.length) return m.mentionedJid[0];
  if (m.quoted) return m.quoted.sender;
  const num = (ctx.args[0] || "").replace(/[^0-9]/g, "");
  if (num) return num + "@s.whatsapp.net";
  return null;
}

module.exports = [
  {
    command: ["addlimit"],
    tags: "owner",
    owner: true,
    description: "Menambah limit user",
    async run(m, ctx) {
      const target = getTarget(m, ctx);
      if (!target)
        return m.reply(`Format: *${ctx.usedPrefix}addlimit @tag/nomor <jumlah>*`);
      const amount = parseInt(ctx.args.find((a) => /^\d+$/.test(a))) || 10;
      const u = ctx.db.initUser(target);
      u.limit = (u.limit || 0) + amount;
      ctx.db.save("users");
      await m.reply(
        `✅ Limit *${target.split("@")[0]}* +${amount}.\nTotal sekarang: ${u.limit}`
      );
    },
  },
  {
    command: ["resetlimit"],
    tags: "owner",
    owner: true,
    description: "Reset limit semua user ke nilai default",
    async run(m, ctx) {
      let n = 0;
      for (const jid of Object.keys(ctx.db.data.users)) {
        ctx.db.data.users[jid].limit = setting.freeLimit;
        n++;
      }
      ctx.db.save("users");
      await m.reply(`✅ Limit ${n} user di-reset ke ${setting.freeLimit}.`);
    },
  },
];
