/**
 * lib/scraper.js
 * ----------------------------------------------------
 * Scraper downloader (TikTok, YouTube, Instagram) dan AI.
 *
 * CATATAN PENTING:
 * Endpoint pihak ketiga bisa berubah/ditutup sewaktu-waktu.
 * Semua fungsi dibungkus try/catch dan menyediakan fallback.
 * Jika sebuah endpoint mati, ganti URL-nya di sini saja.
 * ----------------------------------------------------
 */

const axios = require("axios");
const yts = require("yt-search");
const setting = require("../setting");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const http = axios.create({
  timeout: 60000,
  headers: { "User-Agent": UA },
});

/* ============== TIKTOK ============== */
// Menggunakan API publik tikwm.
async function tiktokDownload(url) {
  const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
  const { data } = await http.get(api);
  if (!data || data.code !== 0 || !data.data) {
    throw new Error("Gagal mengambil data TikTok. Pastikan link benar.");
  }
  const d = data.data;
  return {
    title: d.title || "TikTok Video",
    author: d.author?.nickname || d.author?.unique_id || "-",
    video: d.hdplay || d.play, // link video tanpa watermark
    music: d.music, // link audio
    cover: d.cover,
    duration: d.duration,
    images: d.images || [], // untuk postingan foto/slide
  };
}

/* ============== YOUTUBE ============== */
// Cari video berdasarkan keyword/URL
async function youtubeSearch(query) {
  const r = await yts(query);
  return r.videos.slice(0, 10);
}

// Ambil link download mp3/mp4 lewat API publik (fallback berlapis).
async function youtubeDownload(url, type = "mp4") {
  // Daftar endpoint fallback. Tambahkan/ubah sesuai kebutuhan.
  const endpoints = [
    `https://api.vreden.web.id/api/ytmp${type === "mp3" ? "3" : "4"}?url=${encodeURIComponent(url)}`,
    `https://api.dreaded.site/api/ytdl/${type === "mp3" ? "audio" : "video"}?url=${encodeURIComponent(url)}`,
  ];

  let lastErr;
  for (const api of endpoints) {
    try {
      const { data } = await http.get(api);
      // Normalisasi beberapa bentuk respon yang umum
      const result =
        data?.result?.download ||
        data?.result ||
        data?.data ||
        data;

      const dl =
        result?.url ||
        result?.download?.url ||
        result?.dl ||
        result?.download ||
        result?.link;

      const title =
        result?.title ||
        result?.metadata?.title ||
        data?.result?.title ||
        "YouTube Media";

      if (dl) {
        return { title, url: dl, type: type === "mp3" ? "audio" : "video" };
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    "Semua endpoint YouTube gagal. Ganti endpoint di lib/scraper.js. " +
      (lastErr?.message || "")
  );
}

/* ============== INSTAGRAM ============== */
async function instagramDownload(url) {
  const endpoints = [
    `https://api.vreden.web.id/api/igdownload?url=${encodeURIComponent(url)}`,
    `https://api.dreaded.site/api/instagram?url=${encodeURIComponent(url)}`,
  ];

  let lastErr;
  for (const api of endpoints) {
    try {
      const { data } = await http.get(api);
      let media = [];

      if (Array.isArray(data?.result)) {
        media = data.result
          .map((x) => x.url || x.download || x)
          .filter(Boolean);
      } else if (Array.isArray(data?.result?.url)) {
        media = data.result.url.map((x) => x.url || x).filter(Boolean);
      } else if (data?.result?.url) {
        media = [data.result.url];
      } else if (Array.isArray(data?.data)) {
        media = data.data.map((x) => x.url || x).filter(Boolean);
      } else if (data?.url) {
        media = [data.url];
      }

      if (media.length) return { media };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    "Semua endpoint Instagram gagal. Ganti endpoint di lib/scraper.js. " +
      (lastErr?.message || "")
  );
}

/* ============== AI CHAT ============== */
async function aiChat(prompt) {
  // 1) Jika ada OpenAI API key -> pakai itu (paling stabil)
  if (setting.openaiApiKey) {
    const { data } = await axios.post(
      `${setting.openaiBaseUrl}/chat/completions`,
      {
        model: setting.openaiModel,
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah asisten AI bernama Habibi Official. Jawab dengan ramah, jelas, dan berbahasa Indonesia bila user memakai bahasa Indonesia.",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${setting.openaiApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );
    return data?.choices?.[0]?.message?.content?.trim() || "(tidak ada jawaban)";
  }

  // 2) Fallback endpoint gratis
  const api = `${setting.freeAiEndpoint}${encodeURIComponent(prompt)}`;
  const { data } = await http.get(api);
  const answer =
    data?.result ||
    data?.message ||
    data?.response ||
    data?.data ||
    (typeof data === "string" ? data : null);
  if (!answer) throw new Error("AI tidak memberi jawaban. Coba lagi nanti.");
  return typeof answer === "string" ? answer.trim() : JSON.stringify(answer);
}

module.exports = {
  tiktokDownload,
  youtubeSearch,
  youtubeDownload,
  instagramDownload,
  aiChat,
};
