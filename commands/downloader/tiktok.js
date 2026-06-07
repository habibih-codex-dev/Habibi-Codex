/**
 * commands/downloader/tiktok.js
 * Download video/foto TikTok tanpa watermark.
 */
const { tiktokDownload } = require("../../lib/scraper");
const { isUrl, getBuffer } = require("../../lib/functions");
const setting = require("../../setting");

module.exports = {
  command: ["tiktok", "tt", "ttdl"],
  tags: "downloader",
  limit: true,
  description: "Download video TikTok tanpa watermark",
  async run(m, ctx) {
    const url = ctx.text.trim();
    if (!url || !isUrl(url)) {
      return m.reply(
        `🎵 *TIKTOK DOWNLOADER*\n\nFormat: *${ctx.usedPrefix}tiktok <link>*\nContoh: *${ctx.usedPrefix}tiktok https://vt.tiktok.com/xxxx*`
      );
    }
    await m.react(setting.reactProcess);
    try {
      const data = await tiktokDownload(url);

      // Postingan berupa foto/slide
      if (data.images && data.images.length) {
        for (const img of data.images) {
          await ctx.conn.sendMessage(
            m.chat,
            { image: { url: img }, caption: `🎵 ${data.title}` },
            { quoted: m }
          );
        }
        await m.react(setting.reactDone);
        return;
      }

      const caption =
        `🎵 *TIKTOK DOWNLOADER*\n\n` +
        `📝 ${data.title}\n` +
        `👤 ${data.author}\n\n${setting.footer}`;

      await ctx.conn.sendMessage(
        m.chat,
        { video: { url: data.video }, caption },
        { quoted: m }
      );
      await m.react(setting.reactDone);
    } catch (e) {
      await m.react(setting.reactError);
      m.reply(`❌ Gagal download TikTok.\n> ${e.message}`);
    }
  },
};
