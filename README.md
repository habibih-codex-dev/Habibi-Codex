# 🤖 Habibi Official — WhatsApp Bot

Bot WhatsApp modern & premium berbasis **Node.js + Baileys** (`@whiskeysockets/baileys`).
Database **JSON**, struktur folder rapi, sistem **command + plugin** yang mudah dikembangkan.

> © Habibi Official • Premium WhatsApp Bot

---

## ✨ Fitur

| Kategori | Perintah (contoh) |
|---|---|
| **Menu** | `.menu`, `.allmenu`, `.ownermenu`, `.adminmenu` |
| **Info** | `.ping`, `.runtime`, `.profile`, `.daftar` |
| **Downloader** | `.tiktok`, `.ytmp3`, `.ytmp4`, `.yts`, `.ig` |
| **AI** | `.ai <pertanyaan>` |
| **Sticker** | `.sticker` (kirim/reply gambar atau video) |
| **Owner** | `.bc`, `.bcgc`, `.addprem`, `.delprem`, `.listprem`, `.backup`, `.self`, `.public`, `.autoread`, `.autotyping`, `.addlimit`, `.resetlimit`, `.reload`, `.ban`, `.unban` |
| **Admin Grup** | `.open`, `.close`, `.kick`, `.promote`, `.demote`, `.tagall`, `.hidetag` |
| **Fitur Grup** | `.antilink on/off`, `.antispam on/off`, `.welcome on/off`, `.goodbye on/off` |
| **Sistem** | Premium, Limit harian, Anti-Link, Anti-Spam, Welcome/Goodbye, Auto Read, Auto Typing, Backup DB |

---

## 📁 Struktur Folder

```
habibi-official-bot/
├── index.js              # Entry point: koneksi, pairing/QR, auto-reconnect
├── handler.js            # Otak bot: izin, limit, premium, eksekusi command
├── setting.js            # ⚙️ Pengaturan utama (owner, prefix, nama, dll)
├── config.js             # Alias ke setting.js + path project
├── package.json
├── .gitignore
│
├── lib/                  # Library inti
│   ├── database.js       # Database JSON (auto-save)
│   ├── functions.js      # Helper (runtime, fetch, format, dll)
│   ├── serialize.js      # Serialisasi pesan Baileys -> objek m
│   ├── loader.js         # Auto-load command & plugin (rekursif)
│   ├── menu.js           # Pembuat tampilan menu dinamis
│   ├── sticker.js        # Pembuat stiker (webp + metadata)
│   └── scraper.js        # Scraper TikTok/YouTube/Instagram + AI
│
├── commands/             # Semua perintah (dikelompokkan per kategori)
│   ├── main/             # menu, allmenu, ping, runtime, profile, daftar
│   ├── owner/            # broadcast, premium, backup, mode, limit, system
│   ├── admin/            # adminmenu, group, feature
│   ├── downloader/       # tiktok, youtube, instagram
│   ├── ai/               # aichat
│   └── sticker/          # sticker
│
├── plugins/              # Middleware/event (jalan otomatis tiap pesan)
│   ├── antilink.js
│   ├── antispam.js
│   ├── welcome.js        # welcome & goodbye (event grup)
│   └── autopresence.js   # auto typing
│
├── database/             # Data JSON
│   ├── users.json
│   ├── groups.json
│   ├── premium.json
│   └── settings.json
│
├── sessions/             # Sesi login WhatsApp (JANGAN dibagikan!)
└── tmp/                  # File sementara (backup, media, dll)
```

---

## 🔧 Prasyarat

- **Node.js v18 atau lebih baru** (disarankan v20/v22). Cek: `node -v`
- **FFmpeg** terpasang di sistem (untuk stiker dari video & beberapa media).
  - Windows: download dari ffmpeg.org lalu tambahkan ke PATH
  - Termux: `pkg install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
- Koneksi internet & 1 nomor WhatsApp aktif untuk bot.

---

## 📥 Cara Install

```bash
# 1. Masuk ke folder project
cd habibi-official-bot

# 2. Install dependencies
npm install
```

Lalu **edit `setting.js`** dan isi minimal:

```js
owner: ["62812xxxxxxx"],   // nomor kamu (tanpa +, tanpa spasi)
botNumber: "62812xxxxxxx", // nomor bot (untuk pairing code)
loginMethod: "pairing",     // "pairing" atau "qr"
```

---

## ▶️ Cara Menjalankan

### Login dengan PAIRING CODE (tanpa scan)
```bash
npm run pairing
# atau
node index.js --pairing
```
Bot akan menampilkan **kode 8 digit** seperti `ABCD-EFGH`.
Di HP: **WhatsApp ➜ Perangkat Tertaut ➜ Tautkan perangkat ➜ Tautkan dengan nomor telepon**, lalu masukkan kode tersebut.

### Login dengan QR CODE
```bash
npm run qr
# atau
node index.js --qr
```
Scan QR yang muncul di terminal: **WhatsApp ➜ Perangkat Tertaut ➜ Tautkan perangkat**.

### Menjalankan biasa (mengikuti `loginMethod` di setting.js)
```bash
npm start
```

> 💡 Agar tetap berjalan 24 jam, gunakan **PM2**:
> ```bash
> npm install -g pm2
> pm2 start index.js --name habibi-bot
> pm2 logs habibi-bot
> pm2 save
> ```

---

## 🆙 Cara Update

```bash
# Tarik perubahan terbaru (jika pakai git)
git pull

# Update dependencies
npm install

# Update Baileys ke versi terbaru saja
npm install @whiskeysockets/baileys@latest

# Restart bot
pm2 restart habibi-bot      # jika pakai PM2
```

Saat menambah/mengubah command tanpa restart, jalankan di chat:
```
.reload
```

---

## ➕ Cara Menambah Command Baru

Buat file baru di dalam `commands/<kategori>/namafile.js`:

```js
module.exports = {
  command: ["halo", "hi"],   // pemicu (alias juga boleh)
  tags: "main",              // kategori menu
  description: "Contoh command",
  // Opsi izin (semua opsional):
  // owner: true, admin: true, botAdmin: true, group: true,
  // private: true, premium: true, register: true, limit: true,
  async run(m, ctx) {
    await m.reply(`Halo ${m.pushName}! 👋`);
  },
};
```

Lalu ketik `.reload` di WhatsApp atau restart bot. Command otomatis terdaftar dan muncul di menu.

**Konteks (`ctx`) yang tersedia:** `conn, m, db, setting, args, text, command, usedPrefix, isOwner, isPremium, isGroup, isAdmin, isBotAdmin, groupMetadata, participants, groupData, user, settings, reply`.

---

## 🧩 Sistem Penting

- **Premium:** owner pakai `.addprem @user 30` (30 hari). User premium bebas limit & akses command `premium: true`.
- **Limit:** user gratis punya limit harian (`freeLimit` di setting.js), reset otomatis tiap hari. Command yang memakai limit ditandai `🎫`.
- **Mode Self/Public:** `.self` (hanya owner) / `.public` (semua orang).
- **Backup:** `.backup` mengirim seluruh database sebagai file `.json`.

---

## 🛠️ Troubleshooting (Error Umum)

| Masalah | Penyebab & Solusi |
|---|---|
| `Cannot find module '@whiskeysockets/baileys'` | Belum `npm install`. Jalankan `npm install`. |
| Stuck di "connecting" / sering disconnect | Sesi rusak. Hapus folder `sessions/` lalu login ulang. |
| `Connection closed (401 / loggedOut)` | Sesi logout. Hapus folder `sessions/` dan scan/pair ulang. |
| Pairing code tidak muncul | Pastikan `botNumber` di `setting.js` benar (format `62…`), folder `sessions/` kosong, jalankan `node index.js --pairing`. |
| QR tidak muncul | Jalankan dengan `--qr`, pastikan terminal mendukung. Pastikan `loginMethod` bukan memaksa pairing. |
| Stiker gagal / video error | **FFmpeg belum terpasang** atau tidak ada di PATH. Install FFmpeg. |
| Downloader (TikTok/YT/IG) gagal | Endpoint pihak ketiga bisa berubah/down. Ganti URL endpoint di `lib/scraper.js`. |
| AI tidak menjawab | Isi `openaiApiKey` di `setting.js` (paling stabil), atau ganti `freeAiEndpoint`. |
| `ECONNRESET` / timeout saat install | Masalah jaringan. Coba lagi, atau ganti registry npm. |
| Bot tidak membalas di grup | Pastikan tidak mode `self`, dan untuk fitur admin jadikan **bot sebagai admin grup**. |
| `Error: EADDRINUSE` / proses ganda | Sudah ada instance lain berjalan. Matikan dulu (`pm2 stop all`). |

**Reset total (mulai dari nol):**
```bash
rm -rf sessions node_modules
npm install
node index.js --pairing
```

---

## ⚠️ Catatan & Keamanan

- **JANGAN** membagikan / commit folder `sessions/` — berisi kredensial login WhatsApp kamu (sudah masuk `.gitignore`).
- Gunakan jeda saat broadcast (sudah diatur) agar nomor bot tidak diblokir WhatsApp.
- Endpoint downloader/AI adalah layanan pihak ketiga; ketersediaannya di luar kendali bot. Ganti di `lib/scraper.js` bila mati.
- Bot ini untuk tujuan edukasi & penggunaan pribadi. Patuhi Ketentuan Layanan WhatsApp.

---

## 📜 Lisensi

MIT © Habibi Official
