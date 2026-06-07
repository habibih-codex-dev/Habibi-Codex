/**
 * commands/owner/premium.js
 * Kelola status premium pengguna.
 */
const { formatDate } = require("../../lib/functions");
const setting = require("../../setting");

/** Ambil target jid dari mention / reply / nomor di teks */
function getTarget(m, ctx) {
  if (m.mentionedJid && m.mentionedJid.length) return m.mentionedJid[0];
  if (m.quoted) return m.quoted.sender;
  const num = ctx.text.replace(/[^0-9]/g, "");
  if (num) return num + "@s.whatsapp.net";
  return null;
}

module.exports = [
  {
    command: ["addprem", "addpremium"],
    tags: "owner",
    owner: true,
    description: "Menjadikan user premium (default 30 hari)",
    async run(m, ctx) {
      const target = getTarget(m, ctx);
      if (!target)
        return m.reply(
          `💎 Format: *${ctx.usedPrefix}addprem @tag/nomor [hari]*\nContoh: *${ctx.usedPrefix}addprem 62812xxxx 30*`
        );
      const days = parseInt(ctx.args.find((a) => /^\d+$/.test(a))) || 30;
      const u = ctx.db.initUser(target);
      u.premium = true;
      u.premiumExpired = Date.now() + days * 24 * 60 * 60 * 1000;
      ctx.db.save("users");
      await m.reply(
        `✅ *Premium ditambahkan!*\n\n👤 ${target.split("@")[0]}\n⏳ ${days} hari\n📅 Berakhir: ${formatDate(new Date(u.premiumExpired))}`
      );
    },
  },
  {
    command: ["delprem", "delpremium"],
    tags: "owner",
    owner: true,
    description: "Mencabut status premium user",
    async run(m, ctx) {
      const target = getTarget(m, ctx);
      if (!target) return m.reply(`Format: *${ctx.usedPrefix}delprem @tag/nomor*`);
      const u = ctx.db.initUser(target);
      u.premium = false;
      u.premiumExpired = 0;
      ctx.db.save("users");
      await m.reply(`✅ Premium *${target.split("@")[0]}* dicabut.`);
    },
  },
  {
    command: ["listprem", "listpremium"],
    tags: "owner",
    owner: true,
    description: "Melihat daftar user premium",
    async run(m, ctx) {
      const list = Object.entries(ctx.db.data.users).filter(
        ([, u]) => u.premium && u.premiumExpired > Date.now()
      );
      if (!list.length) return m.reply("Belum ada user premium.");
      let text = `💎 *DAFTAR PREMIUM* (${list.length})\n\n`;
      list.forEach(([jid, u], i) => {
        text += `${i + 1}. ${jid.split("@")[0]} — s/d ${formatDate(new Date(u.premiumExpired))}\n`;
      });
      await m.reply(text + `\n${setting.footer}`);
    },
  },
];
