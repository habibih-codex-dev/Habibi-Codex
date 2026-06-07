/**
 * commands/owner/backup.js
 * Backup database JSON menjadi file zip/json dan kirim ke chat.
 */
const fs = require("fs");
const path = require("path");
const setting = require("../../setting");

module.exports = {
  command: ["backup", "backupdb"],
  tags: "owner",
  owner: true,
  description: "Backup seluruh database & kirim sebagai file",
  async run(m, ctx) {
    await m.react(setting.reactProcess);
    try {
      // Pastikan semua data tersimpan dulu
      ctx.db.saveAllNow();

      const dbDir = path.join(__dirname, "..", "..", "database");
      const tmpDir = path.join(__dirname, "..", "..", "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      // Gabungkan semua file json menjadi satu objek backup
      const backup = {};
      for (const file of fs.readdirSync(dbDir)) {
        if (!file.endsWith(".json")) continue;
        const key = file.replace(".json", "");
        backup[key] = JSON.parse(fs.readFileSync(path.join(dbDir, file), "utf-8"));
      }

      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const outName = `backup-${stamp}.json`;
      const outPath = path.join(tmpDir, outName);
      fs.writeFileSync(outPath, JSON.stringify(backup, null, 2));

      await ctx.conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(outPath),
          fileName: outName,
          mimetype: "application/json",
          caption: `💾 *BACKUP DATABASE*\n${setting.botName}\n📅 ${new Date().toLocaleString("id-ID")}`,
        },
        { quoted: m }
      );

      // Bersihkan file sementara
      fs.unlinkSync(outPath);
      await m.react(setting.reactDone);
    } catch (e) {
      await m.react(setting.reactError);
      m.reply(`❌ Gagal backup database.\n> ${e.message}`);
    }
  },
};
