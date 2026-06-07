/**
 * =====================================================
 *  HABIBI OFFICIAL - PENGATURAN UTAMA BOT
 * =====================================================
 *  Ubah nilai di bawah ini sesuai kebutuhan kamu.
 *  Jangan menghapus tanda kutip / koma agar tidak error.
 * =====================================================
 */

const setting = {
  // ====== IDENTITAS BOT ======
  botName: "Habibi Official",
  ownerName: "Habibi",
  // Nomor owner (boleh lebih dari satu). Format: kode negara tanpa "+" dan tanpa spasi.
  // Contoh Indonesia: 62812xxxxxxx
  owner: ["6281234567890"],

  // ====== PREFIX / AWALAN PERINTAH ======
  // Bisa lebih dari satu. Contoh: ".", "!", "#"
  // Set "" (string kosong) di dalam array untuk mode tanpa prefix.
  prefix: [".", "!", "#", "/"],

  // ====== METODE LOGIN ======
  // "qr"      -> login pakai scan QR code
  // "pairing" -> login pakai kode 8 digit (tanpa scan)
  // Bisa juga di-override lewat argumen: node index.js --qr / --pairing
  loginMethod: "pairing",

  // Nomor bot untuk pairing code (WAJIB diisi jika loginMethod = "pairing")
  // Format sama seperti owner: 62812xxxxxxx
  botNumber: "6281234567890",

  // ====== MODE BOT ======
  // true  -> hanya owner yang bisa memakai bot (self mode)
  // false -> semua orang bisa memakai bot (public mode)
  selfMode: false,

  // ====== PESAN BAWAAN ======
  watermark: "© Habibi Official",
  footer: "Habibi Official • Premium WhatsApp Bot",
  thumbnail: "https://i.ibb.co/4pDNDk1/avatar.png", // gambar thumbnail menu

  // ====== SISTEM LIMIT ======
  // Limit harian untuk user biasa (non-premium). Akan reset otomatis tiap hari.
  freeLimit: 25,
  // Berapa limit yang ditambahkan saat user claim limit harian (opsional fitur).
  limitClaim: 25,

  // ====== API & SCRAPER ======
  // API key opsional untuk AI Chat (OpenAI compatible). Kosongkan jika pakai endpoint gratis.
  openaiApiKey: "",
  openaiBaseUrl: "https://api.openai.com/v1",
  openaiModel: "gpt-4o-mini",

  // Endpoint AI gratis (fallback) bila openaiApiKey kosong.
  // Default memakai endpoint sederhana yang kompatibel; ubah jika perlu.
  freeAiEndpoint: "https://api.dreaded.site/api/chatgpt?text=",

  // ====== TAMPILAN ======
  // Emoji reaksi saat bot memproses & selesai
  reactProcess: "⏳",
  reactDone: "✅",
  reactError: "❌",

  // ====== ZONA WAKTU ======
  timezone: "Asia/Jakarta",
};

module.exports = setting;
