/**
 * lib/loader.js
 * ----------------------------------------------------
 * Memuat semua file command (folder /commands) dan
 * plugin/middleware (folder /plugins) secara otomatis &
 * rekursif. Mendukung hot-reload (clear require cache).
 * ----------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const COMMANDS_DIR = path.join(__dirname, "..", "commands");
const PLUGINS_DIR = path.join(__dirname, "..", "plugins");

/** Ambil semua file .js secara rekursif */
function walk(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full));
    else if (entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

/** Muat seluruh command -> Map<commandName, module> */
function loadCommands() {
  const map = new Map();
  const list = [];
  for (const file of walk(COMMANDS_DIR)) {
    try {
      delete require.cache[require.resolve(file)];
      const mod = require(file);
      if (!mod) continue;
      // Sebuah file boleh mengekspor satu command (object) atau banyak (array)
      const mods = Array.isArray(mod) ? mod : [mod];
      for (const cmd of mods) {
        if (!cmd || !cmd.command) continue;
        cmd.__file = file;
        const names = [].concat(cmd.command, cmd.aliases || []);
        for (const name of names) map.set(String(name).toLowerCase(), cmd);
        list.push(cmd);
      }
    } catch (e) {
      console.error(`[LOADER] Error pada command ${path.basename(file)}: ${e.message}`);
    }
  }
  return { map, list };
}

/** Muat seluruh plugin/middleware -> array */
function loadPlugins() {
  const plugins = [];
  for (const file of walk(PLUGINS_DIR)) {
    try {
      delete require.cache[require.resolve(file)];
      const mod = require(file);
      if (!mod) continue;
      mod.__file = file;
      plugins.push(mod);
    } catch (e) {
      console.error(`[LOADER] Error pada plugin ${path.basename(file)}: ${e.message}`);
    }
  }
  // Urutkan berdasar priority (kecil = duluan)
  plugins.sort((a, b) => (a.priority || 100) - (b.priority || 100));
  return plugins;
}

module.exports = { loadCommands, loadPlugins, walk };
