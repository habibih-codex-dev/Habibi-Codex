/**
 * index.js  —  HABIBI OFFICIAL WHATSAPP BOT
 * ----------------------------------------------------
 * Titik masuk utama: membuat koneksi ke WhatsApp,
 * mendukung login via Pairing Code (8 digit) atau QR,
 * auto-reconnect, dan memuat command + plugin.
 * ----------------------------------------------------
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
} = require("@whiskeysockets/baileys");

const { Boom } = require("@hapi/boom");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");
const NodeCache = require("node-cache");

const setting = require("./setting");
const db = require("./lib/database");
const func = require("./lib/functions");
const { loadCommands, loadPlugins } = require("./lib/loader");
const { messageHandler } = require("./handler");

// Logger senyap (ubah level ke "info"/"debug" untuk debugging)
const logger = pino({ level: "silent" });

// Folder penting
const SESSION_DIR = path.join(__dirname, "sessions");
const TMP_DIR = path.join(__dirname, "tmp");
for (const d of [SESSION_DIR, TMP_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

// Tentukan metode login dari argumen / setting
const argv = process.argv.slice(2);
let usePairing = setting.loginMethod === "pairing";
if (argv.includes("--qr")) usePairing = false;
if (argv.includes("--pairing")) usePairing = true;

// Helper input terminal
function question(text) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(text, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// Cache & store command/plugin
const msgRetryCounterCache = new NodeCache();
let commandMap = new Map();
let commandList = [];
let plugins = [];

function reloadModules() {
  const c = loadCommands();
  commandMap = c.map;
  commandList = c.list;
  plugins = loadPlugins();
  // simpan ke global agar bisa diakses command (mis. menu, reload)
  global.commandMap = commandMap;
  global.commandList = commandList;
  global.plugins = plugins;
  console.log(
    `📦 Dimuat: ${commandList.length} command, ${plugins.length} plugin.`
  );
}

async function startBot() {
  reloadModules();

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion().catch(() => ({
    version: [2, 3000, 0],
    isLatest: false,
  }));
  console.log(`🔖 Baileys v${version.join(".")} (terbaru: ${isLatest})`);

  const conn = makeWASocket({
    version,
    logger,
    printQRInTerminal: !usePairing, // QR otomatis tampil bila bukan pairing
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.appropriate("Desktop"),
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    msgRetryCounterCache,
    getMessage: async () => ({ conversation: setting.botName }),
  });

  global.conn = conn;

  // ====== PAIRING CODE ======
  if (usePairing && !conn.authState.creds.registered) {
    let number = setting.botNumber;
    if (!number || number.includes("xxxx")) {
      number = await question(
        "📱 Masukkan nomor WhatsApp bot (contoh 62812xxxx): "
      );
    }
    number = func.toNumber(number);
    if (number) {
      setTimeout(async () => {
        try {
          const code = await conn.requestPairingCode(number);
          const pretty = code?.match(/.{1,4}/g)?.join("-") || code;
          console.log("\n==============================");
          console.log(`🔗 KODE PAIRING : ${pretty}`);
          console.log("==============================");
          console.log(
            "Buka WhatsApp > Perangkat Tertaut > Tautkan perangkat > Tautkan dengan nomor telepon, lalu masukkan kode di atas.\n"
          );
        } catch (e) {
          console.error("Gagal meminta pairing code:", e.message);
        }
      }, 3000);
    }
  }

  // ====== EVENT KONEKSI ======
  conn.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairing) {
      console.log("📷 Scan QR code di atas menggunakan WhatsApp kamu.");
    }

    if (connection === "open") {
      // Catat waktu start (dipakai command runtime)
      db.data.settings.startTime = Date.now();
      db.save("settings");
      console.log("\n✅ BOT TERHUBUNG — Habibi Official siap digunakan!");
      console.log(`👤 Login sebagai: ${conn.user?.id}`);
    }

    if (connection === "close") {
      const code =
        new Boom(lastDisconnect?.error)?.output?.statusCode ||
        lastDisconnect?.error?.output?.statusCode;
      const reason = DisconnectReason;
      console.log(`⚠️  Koneksi terputus. Kode: ${code}`);

      if (code === reason.loggedOut) {
        console.log(
          "❌ Sesi logout / tidak valid. Hapus folder 'sessions' lalu jalankan ulang."
        );
        return;
      }
      // Reconnect untuk error lainnya
      console.log("🔄 Menyambung ulang...");
      setTimeout(() => startBot(), 3000);
    }
  });

  conn.ev.on("creds.update", saveCreds);

  // ====== PESAN MASUK ======
  conn.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      // Auto-read (centang biru) bila diaktifkan
      if (db.data.settings.autoread) {
        try {
          await conn.readMessages([msg.key]);
        } catch {}
      }
      await messageHandler({ conn, msg, commandMap, plugins });
    }
  });

  // ====== EVENT GRUP (welcome / goodbye) ======
  conn.ev.on("group-participants.update", async (update) => {
    for (const plugin of plugins) {
      if (typeof plugin.onGroupParticipantsUpdate === "function") {
        try {
          await plugin.onGroupParticipantsUpdate(update, { conn, db, setting, func });
        } catch (e) {
          console.error(`[GROUP-EVENT ${plugin.name || "?"}]`, e.message);
        }
      }
    }
  });

  return conn;
}

// Tangani error agar bot tidak mati total
process.on("uncaughtException", (e) => console.error("[uncaughtException]", e));
process.on("unhandledRejection", (e) => console.error("[unhandledRejection]", e));

// Simpan database saat keluar
process.on("SIGINT", () => {
  console.log("\n💾 Menyimpan database sebelum keluar...");
  db.saveAllNow();
  process.exit(0);
});

console.log(`
╔══════════════════════════════════╗
║        HABIBI OFFICIAL BOT        ║
║     WhatsApp Bot • Node + Baileys ║
╚══════════════════════════════════╝
Metode login: ${usePairing ? "PAIRING CODE" : "QR CODE"}
`);

startBot();
