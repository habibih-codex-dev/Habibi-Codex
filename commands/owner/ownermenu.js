/**
 * commands/owner/ownermenu.js
 * Menu khusus owner.
 */
const { buildMenu } = require("../../lib/menu");
const setting = require("../../setting");

module.exports = {
  command: ["ownermenu", "menuowner"],
  tags: "owner",
  owner: true,
  description: "Menampilkan menu khusus owner",
  async run(m, ctx) {
    const text = buildMenu(ctx, { tags: ["owner"] });
    await m.reply(text);
  },
};
