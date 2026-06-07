/**
 * commands/main/menu.js
 * Menu utama — ringkas, menampilkan kategori penting.
 */
const { buildMenu } = require("../../lib/menu");
const setting = require("../../setting");

module.exports = {
  command: ["menu", "help", "start"],
  tags: "main",
  description: "Menampilkan menu utama bot",
  async run(m, ctx) {
    await m.react(setting.reactProcess);
    const text = buildMenu(ctx, {
      tags: ["main", "downloader", "ai", "tools", "sticker"],
    });

    const sent = await ctx.conn.sendMessage(
      m.chat,
      {
        text,
        contextInfo: {
          externalAdReply: {
            title: setting.botName,
            body: setting.footer,
            thumbnailUrl: setting.thumbnail,
            sourceUrl: "",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
    await m.react(setting.reactDone);
    return sent;
  },
};
