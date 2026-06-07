/**
 * handler.js
 * ----------------------------------------------------
 * Otak utama bot:
 * - Serialize pesan masuk
 * - Jalankan plugin/middleware (antilink, antispam, autoread, dst)
 * - Cari & jalankan command yang cocok
 * - Cek izin: owner / admin / premium / limit / mode
 * ----------------------------------------------------
 */

const setting = require("./setting");
const db = require("./lib/database");
const { serialize } = require("./lib/serialize");
const func = require("./lib/functions");

/** Cek apakah jid termasuk owner */
function isOwnerJid(jid) {
  const num = func.toNumber(jid);
  return setting.owner.map(String).includes(num);
}

/**
 * @param {object} param0
 * @param {import('@whiskeysockets/baileys').WASocket} param0.conn
 * @param {Array} param0.commands
 * @param {Map} param0.commandMap
 * @param {Array} param0.plugins
 */
async function messageHandler({ conn, msg, commandMap, plugins }) {
  try {
    const m = await serialize(conn, msg);
    if (!m.message) return;
    if (m.key && m.key.remoteJid === "status@broadcast") return;

    // ---------- Data konteks ----------
    const user = db.initUser(m.sender);
    if (m.pushName && user.name !== m.pushName) {
      user.name = m.pushName;
      db.save("users");
    }
    user.lastSeen = Date.now();

    const isOwner = m.fromMe || isOwnerJid(m.sender);
    const isPremium = isOwner || db.isPremium(m.sender);
    const settings = db.data.settings;

    // Banned user (kecuali owner)
    if (user.banned && !isOwner) return;
    if ((settings.banned || []).includes(m.sender) && !isOwner) return;

    // ---------- Info grup ----------
    let groupMetadata = null;
    let participants = [];
    let isAdmin = false;
    let isBotAdmin = false;
    let groupData = null;

    if (m.isGroup) {
      groupData = db.initGroup(m.chat);
      try {
        groupMetadata = await conn.groupMetadata(m.chat);
        participants = groupMetadata.participants || [];
        const senderInfo = participants.find((p) => p.id === m.sender);
        const botInfo = participants.find(
          (p) => func.toNumber(p.id) === func.toNumber(conn.user.id)
        );
        isAdmin = !!senderInfo && ["admin", "superadmin"].includes(senderInfo.admin);
        isBotAdmin = !!botInfo && ["admin", "superadmin"].includes(botInfo.admin);
      } catch {}
    }

    // ---------- Parsing prefix & command ----------
    const body = m.body || "";
    const prefixes = setting.prefix.length ? setting.prefix : [""];
    let usedPrefix = prefixes.find((p) => (p === "" ? true : body.startsWith(p)));
    // Jika beberapa prefix cocok, pilih yang paling spesifik (non-kosong)
    const matched = prefixes.filter((p) => p !== "" && body.startsWith(p));
    if (matched.length) usedPrefix = matched[0];

    const hasPrefix = usedPrefix !== undefined;
    const withoutPrefix = hasPrefix && usedPrefix !== ""
      ? body.slice(usedPrefix.length)
      : body;
    const args = withoutPrefix.trim().split(/\s+/);
    const command = (args.shift() || "").toLowerCase();
    const text = args.join(" ");
    const q = text;

    // ---------- Konteks dikirim ke command & plugin ----------
    const ctx = {
      conn,
      m,
      db,
      setting,
      func,
      args,
      text,
      q,
      command,
      usedPrefix: usedPrefix || "",
      prefix: usedPrefix || "",
      isOwner,
      isPremium,
      isGroup: m.isGroup,
      isAdmin,
      isBotAdmin,
      groupMetadata,
      participants,
      groupData,
      user,
      settings,
      commandMap,
      reply: (t, o) => m.reply(t, o),
    };

    // ---------- Jalankan PLUGIN / MIDDLEWARE ----------
    // (antilink, antispam, autoread, autotyping, dll)
    for (const plugin of plugins) {
      if (typeof plugin.run !== "function") continue;
      try {
        const stop = await plugin.run(m, ctx);
        if (stop === true) return; // plugin meminta hentikan proses
      } catch (e) {
        console.error(`[PLUGIN ${plugin.name || "?"}]`, e.message);
      }
    }

    // ---------- Cari command ----------
    const usingPrefixMode = setting.prefix.length && !setting.prefix.includes("");
    if (usingPrefixMode && (!hasPrefix || usedPrefix === "")) return; // wajib prefix
    if (!command) return;

    const cmd = commandMap.get(command);
    if (!cmd) return;

    // ---------- Mode self ----------
    const selfMode = setting.selfMode || settings.self;
    if (selfMode && !isOwner) return;

    // ---------- Cek izin ----------
    if (cmd.owner && !isOwner) {
      return m.reply("🚫 Perintah ini khusus *Owner* bot.");
    }
    if (cmd.group && !m.isGroup) {
      return m.reply("🚫 Perintah ini hanya bisa dipakai di dalam *grup*.");
    }
    if (cmd.private && m.isGroup) {
      return m.reply("🚫 Perintah ini hanya bisa dipakai di *chat pribadi*.");
    }
    if (cmd.admin && m.isGroup && !isAdmin && !isOwner) {
      return m.reply("🚫 Perintah ini khusus *Admin Grup*.");
    }
    if (cmd.botAdmin && m.isGroup && !isBotAdmin) {
      return m.reply("🚫 Jadikan *bot sebagai admin* dulu untuk memakai perintah ini.");
    }
    if (cmd.premium && !isPremium) {
      return m.reply(
        "💎 Perintah ini khusus *Pengguna Premium*.\nHubungi owner untuk upgrade premium."
      );
    }
    if (cmd.register && !user.registered && !isOwner) {
      return m.reply(
        `📝 Kamu belum terdaftar.\nKetik *${ctx.usedPrefix}daftar nama* untuk mendaftar.`
      );
    }

    // ---------- Sistem LIMIT ----------
    // Reset limit harian
    resetDailyLimit(user);
    const useLimit = cmd.limit && !isOwner && !isPremium;
    if (useLimit) {
      const cost = typeof cmd.limit === "number" ? cmd.limit : 1;
      if ((user.limit || 0) < cost) {
        return m.reply(
          `⚠️ *Limit harian kamu habis!*\n\nLimit akan reset otomatis besok, atau upgrade ke *Premium* untuk akses tanpa limit.`
        );
      }
    }

    // ---------- Eksekusi command ----------
    if (settings.autotyping) {
      try {
        await conn.sendPresenceUpdate("composing", m.chat);
      } catch {}
    }

    try {
      await cmd.run(m, ctx);
      // Kurangi limit jika command memakai limit & sukses
      if (useLimit) {
        const cost = typeof cmd.limit === "number" ? cmd.limit : 1;
        user.limit = Math.max(0, (user.limit || 0) - cost);
        db.save("users");
      }
    } catch (e) {
      console.error(`[CMD ${command}]`, e);
      m.reply(
        `${setting.reactError} Terjadi error saat menjalankan *${command}*.\n\n> ${e.message}`
      );
    }
  } catch (err) {
    console.error("[HANDLER]", err);
  }
}

/** Reset limit user setiap pergantian hari */
function resetDailyLimit(user) {
  const now = new Date();
  const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  if (user._limitDay !== today) {
    user._limitDay = today;
    user.limit = setting.freeLimit;
    db.save("users");
  }
}

module.exports = { messageHandler, isOwnerJid };
