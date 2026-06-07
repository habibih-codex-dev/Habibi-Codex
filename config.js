/**
 * config.js
 * ----------------------------------------------------
 * File ini merupakan jembatan (alias) ke setting.js.
 * Beberapa plugin/command mungkin meng-import "config"
 * dan sebagian lagi meng-import "setting". Keduanya
 * mengarah ke konfigurasi yang sama agar konsisten.
 * ----------------------------------------------------
 */

const setting = require("./setting");

// Re-export seluruh isi setting sebagai config
module.exports = {
  ...setting,
  // Path penting project (dipakai beberapa modul)
  paths: {
    database: "./database",
    sessions: "./sessions",
    commands: "./commands",
    plugins: "./plugins",
    tmp: "./tmp",
  },
};
