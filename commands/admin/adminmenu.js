/**
 * commands/admin/adminmenu.js
 * Menu khusus admin grup.
 */
const { buildMenu } = require("../../lib/menu");

module.exports = {
  command: ["adminmenu", "menuadmin"],
  tags: "admin",
  description: "Menampilkan menu khusus admin grup",
  async run(m, ctx) {
    const text = buildMenu(ctx, { tags: ["admin", "group"] });
    await m.reply(text);
  },
};
