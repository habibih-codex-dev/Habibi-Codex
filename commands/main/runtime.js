/**
 * commands/main/runtime.js
 * Menampilkan lama bot aktif (uptime).
 */
const { runtime } = require("../../lib/functions");
const setting = require("../../setting");

module.exports = {
  command: ["runtime", "uptime"],
  tags: "main",
  description: "Menampilkan lama waktu bot aktif",
  async run(m, ctx) {
    const botUptime = runtime(process.uptime());
    const since = runtime((Date.now() - (ctx.settings.startTime || Date.now())) / 1000);
    await m.reply(
      `⏱️ *RUNTIME BOT*\n\n` +
        `🤖 Proses aktif : ${botUptime}\n` +
        `📅 Sejak start  : ${since}\n\n` +
        `${setting.footer}`
    );
  },
};
