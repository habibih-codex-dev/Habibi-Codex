/**
 * plugins/antispam.js
 * ----------------------------------------------------
 * Middleware Anti-Spam berbasis rate limit.
 * Membatasi jumlah pesan/perintah per pengguna dalam
 * jendela waktu tertentu. Berlaku global (anti flooding bot)
 * dan ekstra ketat bila .antispam on di grup.
 * ----------------------------------------------------
 */

const setting = require("../setting");

// Penyimpanan sementara di memori
const hits = new Map(); // jid -> { count, first, blockedUntil }

const WINDOW_MS = 5000; // jendela 5 detik
const MAX_HITS = 6; // maksimal 6 pesan / 5 detik
const BLOCK_MS = 15000; // blokir 15 detik bila melebihi

module.exports = {
  name: "antispam",
  priority: 5,
  async run(m, ctx) {
    if (ctx.isOwner) return false; // owner bebas

    const now = Date.now();
    let rec = hits.get(m.sender);
    if (!rec) {
      rec = { count: 0, first: now, blockedUntil: 0 };
      hits.set(m.sender, rec);
    }

    // Sedang diblokir
    if (rec.blockedUntil > now) return true;

    // Reset jendela
    if (now - rec.first > WINDOW_MS) {
      rec.count = 0;
      rec.first = now;
    }
    rec.count++;

    // Batas grup lebih ketat bila antispam aktif
    const groupActive = m.isGroup && ctx.groupData && ctx.groupData.antispam;
    const limit = groupActive ? Math.ceil(MAX_HITS / 2) : MAX_HITS;

    if (rec.count > limit) {
      rec.blockedUntil = now + BLOCK_MS;
      try {
        await m.reply(
          `🛑 *ANTI-SPAM*\nKamu mengirim terlalu cepat. Tunggu ${Math.ceil(
            BLOCK_MS / 1000
          )} detik sebelum memakai bot lagi.`
        );
      } catch {}
      return true; // hentikan proses
    }
    return false;
  },
};
