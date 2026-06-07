/**
 * commands/ai/aichat.js
 * AI Chat (ChatGPT / endpoint gratis).
 */
const { aiChat } = require("../../lib/scraper");
const setting = require("../../setting");

module.exports = {
  command: ["ai", "gpt", "chatgpt", "tanya"],
  tags: "ai",
  limit: true,
  description: "Mengobrol dengan AI (ChatGPT)",
  async run(m, ctx) {
    const prompt = ctx.text.trim();
    if (!prompt) {
      return m.reply(
        `🤖 *AI CHAT*\n\nFormat: *${ctx.usedPrefix}ai <pertanyaan>*\nContoh: *${ctx.usedPrefix}ai buatkan caption singkat tentang kopi*`
      );
    }
    await m.react(setting.reactProcess);
    try {
      const answer = await aiChat(prompt);
      await m.reply(`🤖 *AI Habibi Official*\n\n${answer}`);
      await m.react(setting.reactDone);
    } catch (e) {
      await m.react(setting.reactError);
      m.reply(`❌ AI sedang sibuk / endpoint bermasalah.\n> ${e.message}`);
    }
  },
};
