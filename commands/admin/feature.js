/**
 * commands/admin/feature.js
 * Toggle fitur grup: antilink, antispam, welcome, goodbye.
 */
const setting = require("../../setting");

function parseToggle(text) {
  const t = (text || "").toLowerCase().trim();
  if (["on", "aktif", "enable", "1"].includes(t)) return true;
  if (["off", "mati", "disable", "0"].includes(t)) return false;
  return null;
}

function makeToggle(key, label, emoji) {
  return {
    command: [key],
    tags: "group",
    group: true,
    admin: true,
    description: `Aktif/matikan ${label}`,
    async run(m, ctx) {
      const val = parseToggle(ctx.text);
      if (val === null) {
        return m.reply(
          `${emoji} ${label}: *${ctx.groupData[key] ? "ON" : "OFF"}*\nFormat: *${ctx.usedPrefix}${key} on/off*`
        );
      }
      ctx.groupData[key] = val;
      ctx.db.save("groups");
      await m.reply(`${emoji} ${label} sekarang: *${val ? "ON" : "OFF"}*`);
    },
  };
}

module.exports = [
  makeToggle("antilink", "Anti Link", "🔗"),
  makeToggle("antispam", "Anti Spam", "🛡️"),
  makeToggle("welcome", "Welcome", "👋"),
  makeToggle("goodbye", "Goodbye", "🚪"),
];
