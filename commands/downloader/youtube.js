/**
 * commands/downloader/youtube.js
 * Download audio (mp3) & video (mp4) YouTube + pencarian.
 */
const { youtubeDownload, youtubeSearch } = require("../../lib/scraper");
const { isUrl } = require("../../lib/functions");
const setting = require("../../setting");

async function resolveUrl(input) {
  if (isUrl(input)) return input;
  // bukan URL -> anggap keyword, ambil hasil teratas
  const results = await youtubeSearch(input);
  if (!results.length) throw new Error("Video tidak ditemukan.");
  return results[0].url;
}

module.exports = [
  {
    command: ["ytmp3", "yta", "ytaudio"],
    tags: "downloader",
    limit: true,
    description: "Download audio (mp3) dari YouTube",
    async run(m, ctx) {
      const input = ctx.text.trim();
      if (!input)
        return m.reply(
          `🎧 *YOUTUBE MP3*\n\nFormat: *${ctx.usedPrefix}ytmp3 <link/judul>*`
        );
      await m.react(setting.reactProcess);
      try {
        const url = await resolveUrl(input);
        const data = await youtubeDownload(url, "mp3");
        await ctx.conn.sendMessage(
          m.chat,
          {
            audio: { url: data.url },
            mimetype: "audio/mpeg",
            fileName: `${data.title}.mp3`,
          },
          { quoted: m }
        );
        await m.react(setting.reactDone);
      } catch (e) {
        await m.react(setting.reactError);
        m.reply(`❌ Gagal download audio.\n> ${e.message}`);
      }
    },
  },
  {
    command: ["ytmp4", "ytv", "ytvideo", "youtube", "yt"],
    tags: "downloader",
    limit: true,
    description: "Download video (mp4) dari YouTube",
    async run(m, ctx) {
      const input = ctx.text.trim();
      if (!input)
        return m.reply(
          `🎬 *YOUTUBE MP4*\n\nFormat: *${ctx.usedPrefix}ytmp4 <link/judul>*`
        );
      await m.react(setting.reactProcess);
      try {
        const url = await resolveUrl(input);
        const data = await youtubeDownload(url, "mp4");
        await ctx.conn.sendMessage(
          m.chat,
          {
            video: { url: data.url },
            caption: `🎬 ${data.title}\n\n${setting.footer}`,
          },
          { quoted: m }
        );
        await m.react(setting.reactDone);
      } catch (e) {
        await m.react(setting.reactError);
        m.reply(`❌ Gagal download video.\n> ${e.message}`);
      }
    },
  },
  {
    command: ["yts", "ytsearch"],
    tags: "downloader",
    description: "Mencari video di YouTube",
    async run(m, ctx) {
      const query = ctx.text.trim();
      if (!query)
        return m.reply(`🔎 Format: *${ctx.usedPrefix}yts <kata kunci>*`);
      await m.react(setting.reactProcess);
      try {
        const results = await youtubeSearch(query);
        let text = `🔎 *HASIL PENCARIAN YOUTUBE*\n\n`;
        results.slice(0, 6).forEach((v, i) => {
          text += `${i + 1}. *${v.title}*\n   ⏱️ ${v.timestamp} • 👁️ ${v.views}\n   🔗 ${v.url}\n\n`;
        });
        text += setting.footer;
        await m.reply(text);
        await m.react(setting.reactDone);
      } catch (e) {
        await m.react(setting.reactError);
        m.reply(`❌ Gagal mencari.\n> ${e.message}`);
      }
    },
  },
];
