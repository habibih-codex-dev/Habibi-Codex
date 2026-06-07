/**
 * lib/sticker.js
 * ----------------------------------------------------
 * Membuat stiker (webp) dari gambar/video menggunakan
 * wa-sticker-formatter. Mendukung metadata (exif).
 * ----------------------------------------------------
 */

const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const setting = require("../setting");

/**
 * Buat buffer stiker dari buffer media.
 * @param {Buffer} buffer - buffer gambar/video
 * @param {object} opts - { pack, author, type }
 * @returns {Promise<Buffer>}
 */
async function createSticker(buffer, opts = {}) {
  const sticker = new Sticker(buffer, {
    pack: opts.pack || setting.botName,
    author: opts.author || setting.ownerName,
    type: opts.crop ? StickerTypes.CROP : StickerTypes.FULL,
    quality: opts.quality || 50,
    background: opts.background || "transparent",
  });
  return await sticker.toBuffer();
}

module.exports = { createSticker, StickerTypes };
