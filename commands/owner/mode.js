/**
 * commands/owner/mode.js
 * Toggle mode bot: self/public, autoread, autotyping.
 */
const setting = require("../../setting");

function parseToggle(text) {
  const t = (text || "").toLowerCase().trim();
  if (["on", "aktif", "enable", "1"].includes(t)) return true;
  if (["off", "mati", "disable", "0"].includes(t)) return false;
  return null;
}

module.exports = [
  {
    command: ["self", "public", "mode"],
    tags: "owner",
    owner: true,
    description: "Atur mode bot (self/public)",
    async run(m, ctx) {
      const cmd = ctx.command;
      if (cmd === "self") ctx.settings.self = true;
      else if (cmd === "public") ctx.settings.self = false;
      else {
        const val = parseToggle(ctx.text);
        if (val === null)
          return m.reply(
            `🤖 Mode sekarang: *${ctx.settings.self ? "SELF" : "PUBLIC"}*\nGunakan *${ctx.usedPrefix}self* atau *${ctx.usedPrefix}public*.`
          );
        ctx.settings.self = val;
      }
      ctx.db.save("settings");
      await m.reply(
        `✅ Mode bot sekarang: *${ctx.settings.self ? "SELF (hanya owner)" : "PUBLIC (semua orang)"}*`
      );
    },
  },
  {
    command: ["autoread"],
    tags: "owner",
    owner: true,
    description: "Aktifkan/matikan auto read (centang biru)",
    async run(m, ctx) {
      const val = parseToggle(ctx.text);
      if (val === null)
        return m.reply(
          `👁️ Auto read: *${ctx.settings.autoread ? "ON" : "OFF"}*\nFormat: *${ctx.usedPrefix}autoread on/off*`
        );
      ctx.settings.autoread = val;
      ctx.db.save("settings");
      await m.reply(`✅ Auto read sekarang: *${val ? "ON" : "OFF"}*`);
    },
  },
  {
    command: ["autotyping"],
    tags: "owner",
    owner: true,
    description: "Aktifkan/matikan auto typing",
    async run(m, ctx) {
      const val = parseToggle(ctx.text);
      if (val === null)
        return m.reply(
          `⌨️ Auto typing: *${ctx.settings.autotyping ? "ON" : "OFF"}*\nFormat: *${ctx.usedPrefix}autotyping on/off*`
        );
      ctx.settings.autotyping = val;
      ctx.db.save("settings");
      await m.reply(`✅ Auto typing sekarang: *${val ? "ON" : "OFF"}*`);
    },
  },
];
