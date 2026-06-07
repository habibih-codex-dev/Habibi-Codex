/**
 * lib/menu.js
 * ----------------------------------------------------
 * Membuat tampilan menu modern & premium secara dinamis
 * berdasarkan command yang terdaftar (dikelompokkan per tag).
 * ----------------------------------------------------
 */

const setting = require("../setting");
const func = require("./functions");

// Nama tampilan tiap kategori (tag)
const CATEGORY = {
  main: "ＭＥＮＵ ＵＴＡＭＡ",
  downloader: "ＤＯＷＮＬＯＡＤＥＲ",
  tools: "ＴＯＯＬＳ",
  ai: "ＡＲＴＩＦＩＣＩＡＬ ＩＮＴＥＬＬＩＧＥＮＣＥ",
  sticker: "ＳＴＩＣＫＥＲ",
  group: "ＧＲＯＵＰ",
  admin: "ＡＤＭＩＮ",
  owner: "ＯＷＮＥＲ",
  premium: "ＰＲＥＭＩＵＭ",
};

const ORDER = [
  "main",
  "downloader",
  "ai",
  "tools",
  "sticker",
  "group",
  "admin",
  "owner",
  "premium",
];

function header(ctx) {
  const { m, isPremium, isOwner, user, db, func: fn } = ctx;
  const uptime = func.runtime(process.uptime());
  const status = isOwner ? "Owner" : isPremium ? "Premium 💎" : "Free";
  const limit = isOwner || isPremium ? "∞ (Unlimited)" : `${user.limit}`;
  const totalUsers = Object.keys(db.data.users).length;

  return (
    `╭───「 *${setting.botName}* 」\n` +
    `│ 👋 Halo, *${m.pushName || "Kak"}*\n` +
    `│ 🪪 Status : ${status}\n` +
    `│ 🎫 Limit  : ${limit}\n` +
    `│ ⏱️ Runtime: ${uptime}\n` +
    `│ 👥 User   : ${totalUsers}\n` +
    `│ 🤖 Mode   : ${setting.selfMode || db.data.settings.self ? "Self" : "Public"}\n` +
    `╰────────────────⊷\n`
  );
}

/**
 * Bangun teks menu.
 * @param {object} ctx - konteks handler
 * @param {object} opts - { tags?: string[], compact?: boolean }
 */
function buildMenu(ctx, opts = {}) {
  const list = global.commandList || [];
  const prefix = ctx.usedPrefix || (setting.prefix[0] || "");
  const wantTags = opts.tags || null;

  // Kelompokkan command berdasarkan tag
  const grouped = {};
  for (const cmd of list) {
    if (cmd.hidden) continue;
    const tag = cmd.tags || "main";
    if (wantTags && !wantTags.includes(tag)) continue;
    if (!grouped[tag]) grouped[tag] = [];
    const names = [].concat(cmd.command);
    grouped[tag].push({ name: names[0], cmd });
  }

  let text = header(ctx);

  const tagsToShow = ORDER.filter((t) => grouped[t]);
  // tambahkan tag yang tidak ada di ORDER
  for (const t of Object.keys(grouped)) if (!tagsToShow.includes(t)) tagsToShow.push(t);

  for (const tag of tagsToShow) {
    const title = CATEGORY[tag] || tag.toUpperCase();
    text += `\n╭───「 *${title}* 」\n`;
    for (const { name, cmd } of grouped[tag]) {
      const badges = [];
      if (cmd.premium) badges.push("💎");
      if (cmd.limit) badges.push("🎫");
      if (cmd.owner) badges.push("👑");
      if (cmd.admin) badges.push("🛡️");
      const badge = badges.length ? " " + badges.join("") : "";
      text += `│ ◦ ${prefix}${name}${badge}\n`;
    }
    text += `╰────────────────⊷\n`;
  }

  text += `\n_Keterangan: 💎 premium • 🎫 pakai limit • 👑 owner • 🛡️ admin_\n`;
  text += `\n${setting.footer}`;
  return text;
}

module.exports = { buildMenu, CATEGORY, ORDER };
