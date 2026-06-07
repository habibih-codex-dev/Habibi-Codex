/**
 * lib/database.js
 * ----------------------------------------------------
 * Database sederhana berbasis file JSON.
 * - Menyimpan data users, groups, premium, settings.
 * - Auto-load saat start & auto-save (debounce) saat berubah.
 * - Mudah dikembangkan: tinggal tambah key baru di defaultData.
 * ----------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "..", "database");

// Pastikan folder database ada
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

/** Struktur default tiap file database */
const FILES = {
  users: {},
  groups: {},
  premium: {},
  settings: {
    self: false,
    autoread: false,
    autotyping: false,
    banned: [],
    startTime: Date.now(),
  },
};

class Database {
  constructor() {
    this.data = {};
    this._timers = {};
    this.load();
  }

  _file(name) {
    return path.join(DB_DIR, `${name}.json`);
  }

  /** Muat semua file database; buat jika belum ada */
  load() {
    for (const [name, def] of Object.entries(FILES)) {
      const file = this._file(name);
      try {
        if (fs.existsSync(file)) {
          const raw = fs.readFileSync(file, "utf-8").trim();
          this.data[name] = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(def));
        } else {
          this.data[name] = JSON.parse(JSON.stringify(def));
          this._writeNow(name);
        }
      } catch (e) {
        console.error(`[DB] Gagal load ${name}.json, memakai default. ${e.message}`);
        this.data[name] = JSON.parse(JSON.stringify(def));
      }
    }
    return this.data;
  }

  /** Tulis langsung satu file (sinkron) */
  _writeNow(name) {
    try {
      fs.writeFileSync(this._file(name), JSON.stringify(this.data[name], null, 2));
    } catch (e) {
      console.error(`[DB] Gagal menyimpan ${name}.json: ${e.message}`);
    }
  }

  /** Simpan dengan debounce agar tidak menulis terlalu sering */
  save(name) {
    const names = name ? [name] : Object.keys(FILES);
    for (const n of names) {
      clearTimeout(this._timers[n]);
      this._timers[n] = setTimeout(() => this._writeNow(n), 800);
    }
  }

  /** Simpan semua secara langsung (dipakai saat shutdown / backup) */
  saveAllNow() {
    for (const n of Object.keys(FILES)) this._writeNow(n);
  }

  // ---------- Helper USER ----------
  initUser(jid) {
    if (!this.data.users[jid]) {
      this.data.users[jid] = {
        name: "",
        limit: require("../setting").freeLimit,
        premium: false,
        premiumExpired: 0,
        banned: false,
        warn: 0,
        lastClaim: 0,
        registered: false,
        afk: -1,
        afkReason: "",
        lastSeen: Date.now(),
      };
      this.save("users");
    }
    return this.data.users[jid];
  }

  // ---------- Helper GROUP ----------
  initGroup(jid) {
    if (!this.data.groups[jid]) {
      this.data.groups[jid] = {
        welcome: false,
        goodbye: false,
        antilink: false,
        antispam: false,
        mute: false,
        textWelcome: "",
        textGoodbye: "",
      };
      this.save("groups");
    }
    return this.data.groups[jid];
  }

  // ---------- Helper PREMIUM ----------
  isPremium(jid) {
    const u = this.data.users[jid];
    if (!u) return false;
    if (u.premium && u.premiumExpired && Date.now() > u.premiumExpired) {
      // expired -> reset
      u.premium = false;
      u.premiumExpired = 0;
      this.save("users");
      return false;
    }
    return !!u.premium;
  }
}

module.exports = new Database();
