/**
 * commands/owner/system.js
 * Utilitas sistem: reload command, ban/unban user, eval sederhana.
 */
const { loadCommands, loadPlugins } = require("../../lib/loader");
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
    command: ["reload", "refresh"],
    tags: "owner",
    owner: true,
    description: "Muat ulang semua command & plugin tanpa restart",
    async run(m, ctx) {
      const c = loadCommands();
      global.commandMap = c.map;
      global.commandList = c.list;
      global.plugins = loadPlugins();
      // ganti referensi map yang dipakai handler
      ctx.commandMap.clear();
      for (const [k, v] of c.map) ctx.commandMap.set(k, v);
      await m.reply(
        `🔄 Reload selesai.\n📦 ${c.list.length} command, ${global.plugins.length} plugin dimuat.`
      );
    },
  },
  {
    command: ["ban", "banuser"],
    tags: "owner",
    owner: true,
    description: "Ban user agar tidak bisa memakai bot",
    async run(m, ctx) {
      const target = getTarget(m, ctx);
      if (!target) return m.reply(`Format: *${ctx.usedPrefix}ban @tag/nomor*`);
      const u = ctx.db.initUser(target);
      u.banned = true;
      ctx.db.save("users");
      await m.reply(`🚫 User *${target.split("@")[0]}* telah dibanned.`);
    },
  },
  {
    command: ["unban", "unbanuser"],
    tags: "owner",
    owner: true,
    description: "Cabut ban user",
    async run(m, ctx) {
      const target = getTarget(m, ctx);
      if (!target) return m.reply(`Format: *${ctx.usedPrefix}unban @tag/nomor*`);
      const u = ctx.db.initUser(target);
      u.banned = false;
      ctx.db.save("users");
      await m.reply(`✅ Ban user *${target.split("@")[0]}* dicabut.`);
    },
  },
];
