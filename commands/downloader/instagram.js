/**
 * commands/downloader/instagram.js
 * Download foto/video/reels Instagram.
 */
const { instagramDownload } = require("../../lib/scraper");
const { isUrl } = require("../../lib/functions");
const setting = require("../../setting");

module.exports = {
  command: ["instagram", "ig", "igdl", "reels"],
  tags: "downloader",
  limit: true,
  description: "Download foto/video/reels Instagram",
  async run(m, ctx) {
    const url = ctx.text.trim();
    if (!url || !isUrl(url)) {
      return m.reply(
        `📸 *INSTAGRAM DOWNLOADER*\n\nFormat: *${ctx.usedPrefix}ig <link>*\nContoh: *${ctx.usedPrefix}ig https://www.instagram.com/p/xxxx*`
      );
    }
    await m.react(setting.reactProcess);
    try {
      const { media } = await instagramDownload(url);
      if (!media || !media.length) throw new Error("Media tidak ditemukan.");

      for (const link of media) {
        const isVideo = /\.mp4|video/i.test(link);
        if (isVideo) {
          await ctx.conn.sendMessage(
            m.chat,
            { video: { url: link }, caption: `📸 ${setting.botName}` },
            { quoted: m }
          );
        } else {
          await ctx.conn.sendMessage(
            m.chat,
            { image: { url: link }, caption: `📸 ${setting.botName}` },
            { quoted: m }
          );
        }
      }
      await m.react(setting.reactDone);
    } catch (e) {
      await m.react(setting.reactError);
      m.reply(`❌ Gagal download Instagram.\n> ${e.message}`);
    }
  },
};
