/**
 * lib/functions.js
 * ----------------------------------------------------
 * Kumpulan fungsi bantu yang dipakai banyak command.
 * ----------------------------------------------------
 */

const axios = require("axios");

/** Format milidetik -> "1h 2m 3s" (untuk runtime/uptime) */
function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d} hari`);
  if (h > 0) parts.push(`${h} jam`);
  if (m > 0) parts.push(`${m} menit`);
  if (s > 0) parts.push(`${s} detik`);
  return parts.length ? parts.join(" ") : "0 detik";
}

/** Format ukuran byte -> "1.2 MB" */
function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/** Format angka tanggal -> "07 Juni 2026, 13:45 WIB" */
function formatDate(d = new Date(), timeZone = "Asia/Jakarta") {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone,
    }).format(d);
  } catch {
    return d.toString();
  }
}

/** Ambil buffer dari URL */
async function getBuffer(url, options = {}) {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      ...(options.headers || {}),
    },
    timeout: options.timeout || 60000,
    ...options,
  });
  return Buffer.from(res.data);
}

/** Ambil JSON dari URL */
async function fetchJson(url, options = {}) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      ...(options.headers || {}),
    },
    timeout: options.timeout || 60000,
    ...options,
  });
  return res.data;
}

/** Cek apakah string adalah URL valid */
function isUrl(text) {
  if (!text) return false;
  return /https?:\/\/[^\s$.?#].[^\s]*/gi.test(text);
}

/** Ambil semua URL di dalam teks */
function extractUrls(text) {
  if (!text) return [];
  return text.match(/https?:\/\/[^\s]+/gi) || [];
}

/** Buat angka acak antara min-max */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Delay sederhana */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Ubah jid menjadi nomor murni */
function toNumber(jid = "") {
  return jid.replace(/[^0-9]/g, "");
}

module.exports = {
  runtime,
  formatSize,
  formatDate,
  getBuffer,
  fetchJson,
  isUrl,
  extractUrls,
  randomInt,
  sleep,
  toNumber,
};
