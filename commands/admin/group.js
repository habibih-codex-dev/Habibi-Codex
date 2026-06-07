/**
 * commands/admin/group.js
 * Pengaturan grup: open/close, kick, promote, demote, tagall, hidetag.
 */
const setting = require("../../setting");

function getTargets(m, ctx) {
  let targets = [];
  if (m.mentionedJid && m.mentionedJid.length) targets = m.mentionedJid;
  else if (m.quoted) targets = [m.quoted.sender];
  else {
    const num = ctx.text.replace(/[^0-9]/g, "");
    if (num) targets = [num + "@s.whatsapp.net"];
  }
  return targets;
}

module.exports = [
  {
    command: ["open", "close", "group"],
    tags: "admin",
    group: true,
    admin: true,
    botAdmin: true,
    description: "Buka/tutup grup (open = semua, close = admin saja)",
    async run(m, ctx) {
      let action = ctx.command;
      if (action === "group") {
        const t = (ctx.text || "").toLowerCase();
        action = t === "open" ? "open" : t === "close" ? "close" : null;
        if (!action)
          return m.reply(`Format: *${ctx.usedPrefix}group open/close*`);
      }
      await ctx.conn.groupSettingUpdate(
        m.chat,
        action === "close" ? "announcement" : "not_announcement"
      );
      await m.reply(
        action === "close"
          ? "🔒 Grup *ditutup*. Hanya admin yang bisa kirim pesan."
          : "🔓 Grup *dibuka*. Semua anggota bisa kirim pesan."
      );
    },
  },
  {
    command: ["kick", "tendang"],
    tags: "admin",
    group: true,
    admin: true,
    botAdmin: true,
    description: "Mengeluarkan anggota dari grup",
    async run(m, ctx) {
      const targets = getTargets(m, ctx);
      if (!targets.length)
        return m.reply(`Format: *${ctx.usedPrefix}kick @tag* (atau reply)`);
      await ctx.conn.groupParticipantsUpdate(m.chat, targets, "remove");
      await m.reply(`✅ Berhasil mengeluarkan ${targets.length} anggota.`);
    },
  },
  {
    command: ["promote"],
    tags: "admin",
    group: true,
    admin: true,
    botAdmin: true,
    description: "Menjadikan anggota sebagai admin",
    async run(m, ctx) {
      const targets = getTargets(m, ctx);
      if (!targets.length) return m.reply(`Format: *${ctx.usedPrefix}promote @tag*`);
      await ctx.conn.groupParticipantsUpdate(m.chat, targets, "promote");
      await m.reply(`✅ ${targets.length} anggota dijadikan admin.`);
    },
  },
  {
    command: ["demote"],
    tags: "admin",
    group: true,
    admin: true,
    botAdmin: true,
    description: "Menurunkan admin menjadi anggota biasa",
    async run(m, ctx) {
      const targets = getTargets(m, ctx);
      if (!targets.length) return m.reply(`Format: *${ctx.usedPrefix}demote @tag*`);
      await ctx.conn.groupParticipantsUpdate(m.chat, targets, "demote");
      await m.reply(`✅ ${targets.length} admin diturunkan.`);
    },
  },
  {
    command: ["tagall", "everyone"],
    tags: "admin",
    group: true,
    admin: true,
    description: "Menandai semua anggota grup",
    async run(m, ctx) {
      const members = ctx.participants.map((p) => p.id);
      const note = ctx.text || "Tag All";
      let text = `📢 *${note}*\n\n`;
      for (const id of members) text += `▢ @${id.split("@")[0]}\n`;
      await ctx.conn.sendMessage(
        m.chat,
        { text, mentions: members },
        { quoted: m }
      );
    },
  },
  {
    command: ["hidetag", "h"],
    tags: "admin",
    group: true,
    admin: true,
    description: "Menandai semua anggota secara tersembunyi",
    async run(m, ctx) {
      const members = ctx.participants.map((p) => p.id);
      await ctx.conn.sendMessage(m.chat, {
        text: ctx.text || "",
        mentions: members,
      });
    },
  },
];
