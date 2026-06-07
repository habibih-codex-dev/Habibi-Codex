/**
 * commands/main/ping.js
 * Cek kecepatan respon bot.
 */
const os = require("os");
const { runtime, formatSize } = require("../../lib/functions");
const setting = require("../../setting");

module.exports = {
  command: ["ping", "speed", "p"],
  tags: "main",
  description: "Cek kecepatan & status server bot",
  async run(m, ctx) {
    const start = Date.now();
    await m.react("🏓");
    const latency = Date.now() - start;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const text =
      `🏓 *PONG!*\n\n` +
      `⚡ Kecepatan : *${latency} ms*\n` +
      `⏱️ Runtime   : ${runtime(process.uptime())}\n` +
      `🖥️ Platform  : ${os.platform()} (${os.arch()})\n` +
      `🧠 CPU       : ${os.cpus()[0]?.model || "-"}\n` +
      `📊 RAM       : ${formatSize(usedMem)} / ${formatSize(totalMem)}\n` +
      `\n${setting.footer}`;

    await m.reply(text);
  },
};
