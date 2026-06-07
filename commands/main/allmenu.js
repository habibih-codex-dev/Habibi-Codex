/**
 * commands/main/allmenu.js
 * Menampilkan SEMUA command dari seluruh kategori.
 */
const { buildMenu } = require("../../lib/menu");
const setting = require("../../setting");

module.exports = {
  command: ["allmenu", "menuall", "listmenu"],
  tags: "main",
  description: "Menampilkan seluruh command yang tersedia",
  async run(m, ctx) {
    await m.react(setting.reactProcess);
    const text = buildMenu(ctx); // tanpa filter = semua kategori
    await ctx.conn.sendMessage(
      m.chat,
      {
        text,
        contextInfo: {
          externalAdReply: {
            title: `${setting.botName} • All Menu`,
            body: setting.footer,
            thumbnailUrl: setting.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
    await m.react(setting.reactDone);
  },
};
