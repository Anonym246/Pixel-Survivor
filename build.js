#!/usr/bin/env node
/* Baut aus index.html + style.css + game.js eine einzelne, offline lauffähige
   HTML-Datei nach dist/pixel-survivors.html — praktisch zum Weitergeben oder
   Einbetten. Aufruf: node build.js */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const read = f => fs.readFileSync(path.join(root, f), "utf8");

const css = read("style.css");
const js  = read("game.js");
const out = read("index.html")
  .replace('<link rel="stylesheet" href="style.css">', "<style>\n" + css + "\n</style>")
  .replace('<script src="game.js"></script>', "<script>\n" + js + "\n</script>");

fs.mkdirSync(path.join(root, "dist"), { recursive: true });
const dest = path.join(root, "dist", "pixel-survivors.html");
fs.writeFileSync(dest, out);
console.log("geschrieben:", path.relative(root, dest), (out.length / 1024).toFixed(0) + " KB");
