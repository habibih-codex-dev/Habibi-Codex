/**
 * plugins/welcome.js
 * ----------------------------------------------------
 * Pesan sambutan (welcome) & perpisahan (goodbye).
 * Dipicu oleh event group-participants.update.
 * Aktif/matikan per grup lewat .welcome on / .goodbye on
 * ----------------------------------------------------
 */

const setting = require("../setting");

module.exports = {
  name: "welcome",
  async onGroupParticipantsUpdate(update, { conn, db }) {
    const { id, participants, action } = update;
    const group = db.initGroup(id);

    // Ambil nama grup (best effort)
    let subject = "grup ini";
    try {
      const meta = await conn.groupMetadata(id);
      subject = meta.subject || subject;
    } catch {}

    for (const jid of participants) {
      const tag = `@${jid.split("@")[0]}`;

      if (action === "add" && group.welcome) {
        const text =
          (group.textWelcome && group.textWelcome.trim()) ||
          `╭───「 *WELCOME* 」\n` +
            `│ 👋 Selamat datang ${tag}\n` +
            `│ 🏠 di *${subject}*\n` +
            `│ 📜 Baca deskripsi & patuhi aturan ya!\n` +
            `╰────────────────⊷`;
        await conn.sendMessage(id, {
          text: text.replace(/@user/gi, tag),
          mentions: [jid],
        });
      }

      if (action === "remove" && group.goodbye) {
        const text =
          (group.textGoodbye && group.textGoodbye.trim()) ||
          `🚪 Selamat tinggal ${tag}, semoga sukses selalu! 👋`;
        await conn.sendMessage(id, {
          text: text.replace(/@user/gi, tag),
          mentions: [jid],
        });
      }
    }
  },
};
