(function(){
"use strict";

/* =========================================================
   1. KONFIGURATION
========================================================= */
const VIEW_W = 512, VIEW_H = 320;          // sichtbarer Ausschnitt (Weltpixel)
const WORLD_W = 1760, WORLD_H = 1180;      // große Karte
const COLLECT_TIME = 5;
const MAX_ALIVE = 70;                      // gleichzeitige Zombies (Performance)
const MAX_FUSE = 5;
const SAVE_KEY = "pixelSurvivors.save.v3";
const BEST_KEY = "pixelSurvivors.best.v2";
const SETTINGS_KEY = "pixelSurvivors.settings.v1";

const BASE = { moveSpeed: 108, maxHp: 100, magnet: 52 };

const SLOT_CAPS  = { weapon:4, armor:2, ring:3, shield:2, pet:2 };
const SLOT_NAMES = { weapon:"Waffe", armor:"Rüstung", ring:"Ring", shield:"Schild", pet:"Haustier" };
const SLOT_ORDER = ["weapon","armor","ring","shield","pet"];
const RARITY_NAMES = ["Gewöhnlich","Selten","Episch","Legendär"];

const STAT_INFO = {
  damage:   { n:"Schaden",       u:"%" },
  fireRate: { n:"Feuerrate",     u:"%" },
  range:    { n:"Reichweite",    u:"%" },
  moveSpeed:{ n:"Tempo",         u:"%" },
  maxHp:    { n:"Max. Leben",    u:"%" },
  armor:    { n:"Rüstung",       u:"%" },
  dodge:    { n:"Ausweichen",    u:"%" },
  crit:     { n:"Krit-Chance",   u:"%" },
  critDmg:  { n:"Krit-Schaden",  u:"%" },
  coins:    { n:"Coin-Bonus",    u:"%" },
  xp:       { n:"XP-Bonus",      u:"%" },
  magnet:   { n:"Magnet",        u:"%" },
  luck:     { n:"Glück",         u:"%" },
  lifesteal:{ n:"Lebensraub",    u:"%" },
  regen:    { n:"Regeneration",  u:" HP/s" },
};

/* ---------------- Items ---------------- */
const ITEM_LIST = [
  /* ============ WAFFEN – Gewöhnlich ============ */
  { id:"pistol", name:"Pistole", slot:"weapon", rarity:0, icon:"🔫", price:15, mods:{},
    weapon:{ damage:11, rate:2.3, range:155, projectiles:1, spread:0.03, pierce:0, speed:290, bw:3, bh:3, bc:"#fff7c9", sfx:"pistol" } },
  { id:"revolver", name:"Revolver", slot:"weapon", rarity:0, icon:"🔫", price:22, mods:{},
    weapon:{ damage:20, rate:1.15, range:175, projectiles:1, spread:0.02, pierce:1, speed:330, bw:4, bh:3, bc:"#ffe9a8", sfx:"pistol" } },
  { id:"nailgun", name:"Nagelpistole", slot:"weapon", rarity:0, icon:"🔩", price:20, mods:{},
    weapon:{ damage:6, rate:4.4, range:120, projectiles:1, spread:0.20, pierce:1, speed:300, bw:4, bh:2, bc:"#d3dae6", sfx:"nail" } },
  { id:"shortbow", name:"Kurzbogen", slot:"weapon", rarity:0, icon:"🏹", price:19, mods:{ range:5 },
    weapon:{ damage:16, rate:1.6, range:185, projectiles:1, spread:0.01, pierce:1, speed:340, bw:7, bh:2, bc:"#e2cfa4", sfx:"bow" } },
  { id:"uzi", name:"Uzi", slot:"weapon", rarity:0, icon:"💨", price:26, mods:{},
    weapon:{ damage:5, rate:6.0, range:112, projectiles:1, spread:0.24, pierce:0, speed:300, bw:3, bh:2, bc:"#cfe9ff", sfx:"smg" } },

  /* ============ WAFFEN – Selten ============ */
  { id:"smg", name:"MP-9", slot:"weapon", rarity:1, icon:"🔫", price:48, mods:{},
    weapon:{ damage:9.5, rate:5.6, range:135, projectiles:1, spread:0.16, pierce:0, speed:310, bw:3, bh:2, bc:"#cfe9ff", sfx:"smg" } },
  { id:"shotgun", name:"Schrotflinte", slot:"weapon", rarity:1, icon:"💥", price:52, mods:{},
    weapon:{ damage:9, rate:1.2, range:108, projectiles:5, spread:0.42, pierce:0, speed:265, bw:2, bh:2, bc:"#ffd9a0", sfx:"shotgun" } },
  { id:"crossbow", name:"Armbrust", slot:"weapon", rarity:1, icon:"🎯", price:50, mods:{ range:6 },
    weapon:{ damage:28, rate:1.0, range:200, projectiles:1, spread:0, pierce:2, speed:360, bw:8, bh:2, bc:"#e2cfa4", sfx:"bow" } },
  { id:"flamer", name:"Flammenwerfer", slot:"weapon", rarity:1, icon:"🔥", price:60, mods:{ moveSpeed:-5 }, desc:"Setzt Gegner in Brand.",
    weapon:{ damage:4, rate:13, range:88, projectiles:1, spread:0.34, pierce:2, speed:190, bw:4, bh:4, bc:"#ff9a3c", sfx:"flame",
             fx:{ burn:{ dps:11, dur:2.2 } }, trail:"fire" } },
  { id:"tesla", name:"Blitzstab", slot:"weapon", rarity:1, icon:"⚡", price:64, mods:{}, desc:"Schlägt auf 2 weitere Gegner über.",
    weapon:{ damage:13, rate:1.9, range:138, projectiles:1, spread:0.04, pierce:0, speed:420, bw:5, bh:3, bc:"#9fe0ff", sfx:"zap",
             fx:{ chain:{ jumps:2, range:64, mul:0.7 } } } },
  { id:"gpistol", name:"Granatpistole", slot:"weapon", rarity:1, icon:"💣", price:66, mods:{}, desc:"Explodiert beim Aufprall.",
    weapon:{ damage:15, rate:0.95, range:140, projectiles:1, spread:0.05, pierce:0, speed:210, bw:4, bh:4, bc:"#c8d34a", sfx:"launch",
             fx:{ explode:{ radius:34, damage:34 } } } },

  /* ============ WAFFEN – Episch ============ */
  { id:"sniper", name:"Scharfschützengewehr", slot:"weapon", rarity:2, icon:"🔭", price:104, mods:{ fireRate:-10 },
    weapon:{ damage:125, rate:0.62, range:305, projectiles:1, spread:0, pierce:3, speed:560, bw:10, bh:2, bc:"#9fe8ff", sfx:"sniper" } },
  { id:"launcher", name:"Granatwerfer", slot:"weapon", rarity:2, icon:"🚀", price:118, mods:{ moveSpeed:-8 }, desc:"Große Explosion mit Splash.",
    weapon:{ damage:34, rate:0.75, range:175, projectiles:1, spread:0.05, pierce:0, speed:205, bw:5, bh:5, bc:"#c8d34a", sfx:"launch",
             fx:{ explode:{ radius:48, damage:58 } } } },
  { id:"laser", name:"Laser-Karabiner", slot:"weapon", rarity:2, icon:"🔆", price:108, mods:{ maxHp:-8 },
    weapon:{ damage:24, rate:3.4, range:210, projectiles:1, spread:0.03, pierce:2, speed:480, bw:12, bh:2, bc:"#ff5df0", sfx:"laser", trail:"beam" } },
  { id:"rifle", name:"Sturmgewehr", slot:"weapon", rarity:2, icon:"🪖", price:112, mods:{},
    weapon:{ damage:15, rate:6.6, range:172, projectiles:1, spread:0.11, pierce:1, speed:400, bw:4, bh:2, bc:"#ffe08a", sfx:"rifle" } },
  { id:"frost", name:"Frostwerfer", slot:"weapon", rarity:2, icon:"❄️", price:106, mods:{ damage:-6 }, desc:"Verlangsamt getroffene Gegner stark.",
    weapon:{ damage:24, rate:3.1, range:160, projectiles:1, spread:0.10, pierce:1, speed:330, bw:4, bh:4, bc:"#a9ecff", sfx:"frost",
             fx:{ slow:{ amount:0.5, dur:2.4 } }, trail:"frost" } },
  { id:"acidgun", name:"Säurewerfer", slot:"weapon", rarity:2, icon:"🧪", price:110, mods:{}, desc:"Hinterlässt ätzende Pfützen.",
    weapon:{ damage:22, rate:2.3, range:155, projectiles:1, spread:0.08, pierce:0, speed:250, bw:5, bh:5, bc:"#9be04a", sfx:"acid",
             fx:{ pool:{ radius:36, dps:34, dur:4 } } } },
  { id:"seeker", name:"Suchraketen", slot:"weapon", rarity:2, icon:"🛩️", price:124, mods:{ fireRate:-8 }, desc:"Projektile verfolgen Gegner.",
    weapon:{ damage:18, rate:2.0, range:218, projectiles:2, spread:0.5, pierce:0, speed:230, bw:5, bh:3, bc:"#ffb0d8", sfx:"launch",
             fx:{ homing:3.6, explode:{ radius:28, damage:16 } }, trail:"smoke" } },

  /* ============ WAFFEN – Legendär ============ */
  { id:"plasma", name:"Plasma-Kanone", slot:"weapon", rarity:3, icon:"🔮", price:205, mods:{ moveSpeed:-12, maxHp:-10 },
    weapon:{ damage:32, rate:1.8, range:218, projectiles:3, spread:0.24, pierce:2, speed:340, bw:6, bh:6, bc:"#7ef7d0", sfx:"plasma", trail:"beam" } },
  { id:"railgun", name:"Railgun", slot:"weapon", rarity:3, icon:"🛰️", price:225, mods:{ fireRate:-20, moveSpeed:-10 }, desc:"Durchschlägt alles.",
    weapon:{ damage:240, rate:0.42, range:375, projectiles:1, spread:0, pierce:99, speed:820, bw:16, bh:3, bc:"#9fd4ff", sfx:"rail", trail:"beam" } },
  { id:"minigun", name:"Minigun", slot:"weapon", rarity:3, icon:"🌀", price:215, mods:{ moveSpeed:-22, armor:-10 },
    weapon:{ damage:13, rate:12.5, range:150, projectiles:1, spread:0.20, pierce:0, speed:360, bw:3, bh:2, bc:"#ffd166", sfx:"smg" } },
  { id:"blackhole", name:"Singularität", slot:"weapon", rarity:3, icon:"🕳️", price:240, mods:{ moveSpeed:-14, damage:-10 }, desc:"Reißt Gegner in einen Wirbel.",
    weapon:{ damage:60, rate:0.55, range:195, projectiles:1, spread:0, pierce:0, speed:170, bw:7, bh:7, bc:"#c08bff", sfx:"void",
             fx:{ vortex:{ radius:80, dur:2.6, dps:85, pull:150 } }, trail:"void" } },
  { id:"chainlight", name:"Kettenblitz", slot:"weapon", rarity:3, icon:"🌩️", price:230, mods:{ maxHp:-12 }, desc:"Springt auf bis zu 5 Gegner über.",
    weapon:{ damage:26, rate:2.4, range:190, projectiles:1, spread:0.02, pierce:0, speed:520, bw:6, bh:3, bc:"#bfeaff", sfx:"zap",
             fx:{ chain:{ jumps:4, range:80, mul:0.7 } } } },
  { id:"sunlance", name:"Sonnenlanze", slot:"weapon", rarity:3, icon:"☀️", price:235, mods:{ armor:-14 }, desc:"Brennende Lanze mit hoher Reichweite.",
    weapon:{ damage:62, rate:1.7, range:262, projectiles:1, spread:0, pierce:4, speed:600, bw:18, bh:3, bc:"#ffd66b", sfx:"sun",
             fx:{ burn:{ dps:24, dur:2.6 } }, trail:"beam" } },

  /* ============ RÜSTUNG ============ */
  { id:"leather", name:"Lederweste", slot:"armor", rarity:0, icon:"🦺", price:20, mods:{ maxHp:10 } },
  { id:"chain", name:"Kettenhemd", slot:"armor", rarity:0, icon:"⛓️", price:24, mods:{ armor:8 } },
  { id:"runnervest", name:"Läuferweste", slot:"armor", rarity:0, icon:"👕", price:22, mods:{ moveSpeed:9 } },
  { id:"plate", name:"Plattenpanzer", slot:"armor", rarity:1, icon:"🛡️", price:52, mods:{ armor:20, moveSpeed:-7 } },
  { id:"kevlar", name:"Kevlarweste", slot:"armor", rarity:1, icon:"🧥", price:56, mods:{ maxHp:18, armor:9, fireRate:-8 } },
  { id:"medcoat", name:"Sanitätsmantel", slot:"armor", rarity:1, icon:"🩹", price:58, mods:{ regen:1.2, maxHp:12, damage:-8 } },
  { id:"nano", name:"Nanoanzug", slot:"armor", rarity:2, icon:"🥼", price:108, mods:{ armor:26, moveSpeed:14, maxHp:-15 } },
  { id:"bonearmor", name:"Knochenrüstung", slot:"armor", rarity:2, icon:"🦴", price:102, mods:{ maxHp:32, armor:16, damage:-12 } },
  { id:"reactor", name:"Reaktorpanzer", slot:"armor", rarity:2, icon:"☢️", price:114, mods:{ damage:22, fireRate:14, armor:-12, maxHp:-10 } },
  { id:"titan", name:"Titanfestung", slot:"armor", rarity:3, icon:"🏰", price:205, mods:{ armor:52, maxHp:45, moveSpeed:-30, fireRate:-18 } },
  { id:"shadowcoat", name:"Schattenmantel", slot:"armor", rarity:3, icon:"🌑", price:196, mods:{ dodge:32, moveSpeed:26, maxHp:-32 } },
  { id:"vampcloak", name:"Vampirmantel", slot:"armor", rarity:3, icon:"🧛", price:210, mods:{ lifesteal:9, damage:24, maxHp:-26, armor:-16 } },

  /* ============ RINGE ============ */
  { id:"copperring", name:"Kupferring", slot:"ring", rarity:0, icon:"💍", price:18, mods:{ damage:7 } },
  { id:"silverring", name:"Silberring", slot:"ring", rarity:0, icon:"💍", price:18, mods:{ fireRate:8 } },
  { id:"huntring", name:"Jägerring", slot:"ring", rarity:0, icon:"💍", price:16, mods:{ range:11 } },
  { id:"ironring", name:"Eisenring", slot:"ring", rarity:0, icon:"💍", price:17, mods:{ armor:6 } },
  { id:"bloodring", name:"Blutring", slot:"ring", rarity:1, icon:"🩸", price:54, mods:{ damage:15, lifesteal:5, maxHp:-9 } },
  { id:"goldring", name:"Goldring", slot:"ring", rarity:1, icon:"🪙", price:46, mods:{ coins:28, damage:-6 } },
  { id:"crystalring", name:"Kristallring", slot:"ring", rarity:1, icon:"💎", price:50, mods:{ fireRate:19, range:-9 } },
  { id:"scholarring", name:"Gelehrtenring", slot:"ring", rarity:1, icon:"📘", price:48, mods:{ xp:30, damage:-7 } },
  { id:"ragering", name:"Ring der Wut", slot:"ring", rarity:2, icon:"😡", price:100, mods:{ damage:36, armor:-14, moveSpeed:-10 } },
  { id:"hunterring", name:"Ring des Jägers", slot:"ring", rarity:2, icon:"🎯", price:106, mods:{ crit:24, range:20, fireRate:-12 } },
  { id:"luckring", name:"Glücksring", slot:"ring", rarity:2, icon:"🍀", price:98, mods:{ luck:30, coins:18, damage:-10 } },
  { id:"stormring", name:"Sturmring", slot:"ring", rarity:2, icon:"🌪️", price:104, mods:{ fireRate:28, moveSpeed:16, maxHp:-14 } },
  { id:"demonring", name:"Dämonenring", slot:"ring", rarity:3, icon:"👹", price:192, mods:{ damage:62, critDmg:35, maxHp:-30, armor:-18 } },
  { id:"timering", name:"Zeitring", slot:"ring", rarity:3, icon:"⏳", price:196, mods:{ fireRate:46, moveSpeed:24, damage:-26 } },
  { id:"voidring", name:"Leerenring", slot:"ring", rarity:3, icon:"🔯", price:200, mods:{ crit:40, critDmg:60, dodge:-12, maxHp:-22 } },

  /* ============ SCHILDE ============ */
  { id:"woodshield", name:"Holzschild", slot:"shield", rarity:0, icon:"🪵", price:18, mods:{ armor:9 } },
  { id:"buckler", name:"Buckler", slot:"shield", rarity:0, icon:"🛡️", price:20, mods:{ dodge:7 } },
  { id:"towershield", name:"Turmschild", slot:"shield", rarity:1, icon:"🛡️", price:50, mods:{ armor:21, moveSpeed:-11 } },
  { id:"spikeshield", name:"Stachelschild", slot:"shield", rarity:1, icon:"🔱", price:52, mods:{ armor:13, damage:11, fireRate:-9 } },
  { id:"magnetshield", name:"Magnetschild", slot:"shield", rarity:1, icon:"🧲", price:46, mods:{ magnet:55, armor:8 } },
  { id:"energyshield", name:"Energieschild", slot:"shield", rarity:2, icon:"🔆", price:102, mods:{ dodge:26, armor:15, damage:-15 } },
  { id:"mirrorshield", name:"Spiegelschild", slot:"shield", rarity:2, icon:"🪞", price:106, mods:{ dodge:20, crit:14, maxHp:-12 } },
  { id:"bulwark", name:"Bollwerk", slot:"shield", rarity:3, icon:"🏯", price:194, mods:{ armor:46, maxHp:32, moveSpeed:-26, fireRate:-20 } },
  { id:"aegis", name:"Aegis", slot:"shield", rarity:3, icon:"✨", price:198, mods:{ dodge:34, armor:24, regen:1.6, damage:-24 } },

  /* ============ HAUSTIERE ============ */
  { id:"rat", name:"Ratte", slot:"pet", rarity:0, icon:"🐀", price:22, mods:{},
    pet:{ damage:6, rate:1.3, range:118, color:"#8a8f9c", dark:"#4d525f" } },
  { id:"crow", name:"Krähe", slot:"pet", rarity:0, icon:"🐦", price:24, mods:{},
    pet:{ damage:5, rate:2.0, range:130, color:"#4a4f63", dark:"#282b38" } },
  { id:"zombiepup", name:"Zombie-Welpe", slot:"pet", rarity:1, icon:"🐕", price:55, mods:{ xp:12, moveSpeed:-4 },
    pet:{ damage:10, rate:1.6, range:138, color:"#6aa05a", dark:"#33512b" } },
  { id:"spiderpet", name:"Giftspinne", slot:"pet", rarity:1, icon:"🕷️", price:58, mods:{}, desc:"Schüsse vergiften.",
    pet:{ damage:8, rate:1.8, range:132, color:"#7a4fae", dark:"#3d2559", fx:{ burn:{ dps:7, dur:2 } } } },
  { id:"drone", name:"Kampfdrohne", slot:"pet", rarity:2, icon:"🚁", price:112, mods:{ maxHp:-10 },
    pet:{ damage:18, rate:2.4, range:170, color:"#7fb6ff", dark:"#33517d" } },
  { id:"golem", name:"Mini-Golem", slot:"pet", rarity:2, icon:"🗿", price:106, mods:{ armor:14, moveSpeed:-12 },
    pet:{ damage:29, rate:0.95, range:148, color:"#9c8f7a", dark:"#544c3f" } },
  { id:"frostwisp", name:"Frostgeist", slot:"pet", rarity:2, icon:"🧊", price:110, mods:{}, desc:"Schüsse verlangsamen.",
    pet:{ damage:14, rate:1.9, range:156, color:"#8fd8f0", dark:"#3a6b80", fx:{ slow:{ amount:0.4, dur:1.8 } } } },
  { id:"hellhound", name:"Höllenhund", slot:"pet", rarity:3, icon:"🐺", price:202, mods:{ damage:16, armor:-24, maxHp:-16 }, desc:"Feurige Bisse.",
    pet:{ damage:40, rate:2.2, range:160, color:"#c94a2a", dark:"#6b2213", fx:{ burn:{ dps:16, dur:2 } } } },
  { id:"seraph", name:"Seraph", slot:"pet", rarity:3, icon:"😇", price:208, mods:{ regen:2.2, maxHp:20, damage:-18 },
    pet:{ damage:26, rate:2.6, range:180, color:"#ffe9a8", dark:"#a08b45" } },
];
const ITEM_DEFS = {};
ITEM_LIST.forEach(d => { ITEM_DEFS[d.id] = d; });
function DEF(id){ return ITEM_DEFS[id]; }

/* ---------------- Wert-Upgrades ---------------- */
const UPGRADES = [
  { key:"damage",      name:"Schaden",         icon:"⚔️", per:10,  unit:"%",      base:16, growth:1.26 },
  { key:"fireRate",    name:"Feuerrate",       icon:"🔥", per:8,   unit:"%",      base:18, growth:1.27 },
  { key:"range",       name:"Reichweite",      icon:"🎯", per:8,   unit:"%",      base:14, growth:1.23 },
  { key:"moveSpeed",   name:"Tempo",           icon:"🥾", per:6,   unit:"%",      base:16, growth:1.27 },
  { key:"maxHp",       name:"Max. Leben",      icon:"❤️", per:10,  unit:"%",      base:18, growth:1.27 },
  { key:"armor",       name:"Rüstung",         icon:"🛡️", per:5,   unit:"%",      base:20, growth:1.29 },
  { key:"crit",        name:"Krit-Chance",     icon:"✨", per:4,   unit:"%",      base:22, growth:1.31 },
  { key:"regen",       name:"Regeneration",    icon:"💚", per:0.3, unit:" HP/s",  base:24, growth:1.33 },
  { key:"magnet",      name:"Magnet",          icon:"🧲", per:18,  unit:"%",      base:14, growth:1.25 },
  { key:"projectiles", name:"Extra-Projektil", icon:"✳️", per:1,   unit:" Schuss",base:95, growth:2.0, max:3, special:true },
  { key:"pierceUp",    name:"Durchschlag",     icon:"🗡️", per:1,   unit:" Gegner",base:78, growth:2.0, max:3, special:true },
];
function upgradeCost(u, level){ return Math.round(u.base * Math.pow(u.growth, level)); }

/* =========================================================
   2. HILFSFUNKTIONEN
========================================================= */
const el = (id)=>document.getElementById(id);
function rand(a,b){ return a + Math.random()*(b-a); }
function randInt(a,b){ return Math.floor(rand(a,b+1)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function dist2(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }
function dist(ax,ay,bx,by){ return Math.sqrt(dist2(ax,ay,bx,by)); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function fmtNum(v, dec){ return (Math.round(v*Math.pow(10,dec||0))/Math.pow(10,dec||0)).toString().replace(".", ","); }

/* Fusions-Skalierung: +45% pro Stufe auf alle positiven Werte */
function fuseMul(lvl){ return 1 + 0.45*((lvl||1) - 1); }

/* Effektive Waffenwerte eines Items (inkl. Fusionsstufe) */
function weaponStats(def, lvl){
  const w = def.weapon, m = fuseMul(lvl);
  const out = { damage:w.damage*m, rate:w.rate, range:w.range, projectiles:w.projectiles,
                spread:w.spread, pierce:w.pierce, speed:w.speed, bw:w.bw, bh:w.bh, bc:w.bc,
                sfx:w.sfx, trail:w.trail, fx:null };
  if (w.fx){
    const f = {};
    if (w.fx.burn)   f.burn   = { dps:w.fx.burn.dps*m, dur:w.fx.burn.dur };
    if (w.fx.slow)   f.slow   = w.fx.slow;
    if (w.fx.chain)  f.chain  = { jumps:w.fx.chain.jumps + (lvl>2?1:0), range:w.fx.chain.range, mul:w.fx.chain.mul };
    if (w.fx.explode)f.explode= { radius:w.fx.explode.radius*(1+0.12*((lvl||1)-1)), damage:w.fx.explode.damage*m };
    if (w.fx.pool)   f.pool   = { radius:w.fx.pool.radius, dps:w.fx.pool.dps*m, dur:w.fx.pool.dur };
    if (w.fx.vortex) f.vortex = { radius:w.fx.vortex.radius, dur:w.fx.vortex.dur, dps:w.fx.vortex.dps*m, pull:w.fx.vortex.pull };
    if (w.fx.homing) f.homing = w.fx.homing;
    out.fx = f;
  }
  return out;
}
function petStats(def, lvl){
  const p = def.pet, m = fuseMul(lvl);
  return { damage:p.damage*m, rate:p.rate, range:p.range, color:p.color, dark:p.dark, fx:p.fx || null };
}
/* Positive Mods skalieren mit der Fusionsstufe, Nachteile bleiben gleich */
function itemMods(def, lvl){
  const m = fuseMul(lvl), out = {};
  for (const k in (def.mods||{})){
    const v = def.mods[k];
    out[k] = v > 0 ? v*m : v;
  }
  return out;
}

/* =========================================================
   3. PIXEL-SPRITES
========================================================= */
const PAL = {
  player:  { o:"#0d1420", h:"#3b2b1e", s:"#f0c08a", e:"#101018", j:"#3f8fd8", J:"#28619a", p:"#2b3550", b:"#1a1f30", m:"#8fa6c8" },
  walker:  { o:"#16240f", z:"#5f9f4e", e:"#ff4d4d", c:"#7b6a4a", p:"#3c4a2c", b:"#232b1c", s:"#4c7f3e", m:"#7f8a96", g:"#8ee06a" },
  runner:  { o:"#2a2609", z:"#d6cd54", e:"#ff4d4d", c:"#8a7f3a", p:"#4c4720", b:"#2a2712", s:"#b3aa46", m:"#7f8a96", g:"#fff08a" },
  brute:   { o:"#2a1109", z:"#a4573f", e:"#ffd35d", c:"#6a3a29", p:"#3d2118", b:"#241209", s:"#8b452f", m:"#7f8a96", g:"#ff9a6a" },
  spitter: { o:"#0d2418", z:"#4fae7c", e:"#c6ff4d", c:"#2f6b4a", p:"#1f4a33", b:"#12291d", s:"#3f8e63", m:"#9be04a", g:"#c6ff4d" },
  bomber:  { o:"#301402", z:"#c9722c", e:"#ffe14d", c:"#7d3f13", p:"#4a2609", b:"#2a1505", s:"#a85c22", m:"#ff6a2a", g:"#ff9a3c" },
  necro:   { o:"#180b28", z:"#9a7fc4", e:"#c08bff", c:"#3b2158", p:"#26123a", b:"#180b28", s:"#7b60a8", m:"#c08bff", g:"#c08bff" },
  armored: { o:"#131820", z:"#8f9aa8", e:"#ff4d4d", c:"#4a5464", p:"#2c3440", b:"#1a2029", s:"#6e7a8a", m:"#c2cddc", g:"#aab6c6" },
  wraith:  { o:"#0f2030", z:"#8fd8f0", e:"#ffffff", c:"#2f5a72", p:"#1d3b4c", b:"#0f2030", s:"#6fb8d8", m:"#bff0ff", g:"#bff0ff" },
  bossKol: { o:"#1d0a2c", z:"#8342b4", e:"#ff2d2d", c:"#5a2b7d", p:"#3a1b52", b:"#200f2e", s:"#6b3496", m:"#c08bff", g:"#d06bff" },
  bossNec: { o:"#0a1a12", z:"#3f9a68", e:"#c6ff4d", c:"#16402c", p:"#0d2a1c", b:"#071510", s:"#2f7a50", m:"#9be04a", g:"#8fffc0" },
  bossArt: { o:"#241503", z:"#b8813a", e:"#ff9a3c", c:"#4d3a18", p:"#33260f", b:"#1c1408", s:"#96682c", m:"#e0b45c", g:"#ffc94d" },
  bossHiv: { o:"#2a0410", z:"#c43a5a", e:"#ffd35d", c:"#6b1128", p:"#450a1a", b:"#2a0410", s:"#a02c48", m:"#ff7d9a", g:"#ff5468" },
};

const SPR_PLAYER_A = [
  "...oooo...", "..ohhhho..", "..hhhhhh..", "..hssssh..", "..hseseh..", "..ossso...",
  "...jjjj...", "..jjjjjj..", ".sjjjjjjs.", "..jjjjjj..", "..pppppp..", "..pp..pp..", "..bb..bb.."
];
const SPR_PLAYER_B = [
  "...oooo...", "..ohhhho..", "..hhhhhh..", "..hssssh..", "..hseseh..", "..ossso...",
  "...jjjj...", "..jjjjjj..", ".sjjjjjjs.", "..jjjjjj..", "..pppppp..", "...pppp...", ".bb....bb."
];
const SPR_Z_A = [
  "...oooo...", "..ozzzzo..", "..zzzzzz..", "..zeezez..", "..zzzzzz..", "..ozzzo...",
  "..cccccc..", ".scccccs..", "..cccccc..", "..cccccc..", "..pp..pp..", "..pp..pp..", ".bb....bb."
];
const SPR_Z_B = [
  "...oooo...", "..ozzzzo..", "..zzzzzz..", "..zeezez..", "..zzzzzz..", "..ozzzo...",
  "..cccccc..", "..scccccs.", "..cccccc..", "..cccccc..", "..pppppp..", "...pppp...", "..bb..bb.."
];
const SPR_BRUTE_A = [
  "...oo..oo...", "..ozzzzzzo..", "..zzzzzzzz..", "..zeezzzez..", "..zzzzzzzz..", "...zzzzzz...",
  "..cccccccc..", ".cccccccccc.", "scccccccccs.", ".cccccccccc.", "..cccccccc..", "..ppp..ppp..",
  "..ppp..ppp..", "..bbb..bbb..", ".bbb....bbb."
];
const SPR_BRUTE_B = [
  "...oo..oo...", "..ozzzzzzo..", "..zzzzzzzz..", "..zeezzzez..", "..zzzzzzzz..", "...zzzzzz...",
  "..cccccccc..", ".cccccccccc.", ".scccccccccs", ".cccccccccc.", "..cccccccc..", "..pppppppp..",
  "...pppppp...", "..bbb..bbb..", "..bbb..bbb.."
];
const SPR_SPIT_A = [
  "....ooo....", "...ozzzzo..", "..zzzzzzz..", "..zezzzez..", "..zggggzz..", "...ozzzo...",
  "..sccccc...", ".scccccss..", "..ccccccc..", "..ccccc....", "..pp.pp....", "..pp.pp....", ".bb...bb..."
];
const SPR_SPIT_B = [
  "....ooo....", "...ozzzzo..", "..zzzzzzz..", "..zezzzez..", "..zggggzz..", "...ozzzo...",
  "...ccccc.s.", "..scccccs..", "..ccccccc..", "...cccccc..", "...pp.pp...", "..pp..pp...", "..bb..bb..."
];
const SPR_BOMB_A = [
  "...oooo...", "..ozzzzo..", "..zeezez..", "..ozzzzo..", ".gccccccg.", "gcccggcccg",
  "gcccggcccg", ".gccccccg.", "..cccccc..", "..pp..pp..", "..bb..bb..", "..bb..bb..", "..........."
];
const SPR_BOMB_B = [
  "...oooo...", "..ozzzzo..", "..zeezez..", "..ozzzzo..", ".gccccccg.", "gccggggcg.",
  "gcggggccg.", ".gccccccg.", "..cccccc..", "..pppppp..", "...pppp...", "..bb..bb..", "..........."
];
const SPR_NECRO_A = [
  "...oooo...", "..occcco..", "..cceecc..", "..cccccc..", "..occcco..", ".cccccccc.",
  "mcccccccc.", ".cccccccc.", ".cccccccc.", ".cccccccc.", ".pppppppp.", ".pppppppp.", "..pppppp..",
  "..oo..oo..", ".........."
];
const SPR_NECRO_B = [
  "...oooo...", "..occcco..", "..cceecc..", "..cccccc..", "..occcco..", ".cccccccc.",
  ".ccccccccm", ".cccccccc.", ".cccccccc.", ".cccccccc.", ".pppppppp.", "..pppppp..", "..pppppp..",
  "..oo..oo..", ".........."
];
const SPR_PET_A = [ "..oooo..", ".oppppo.", ".pepepp.", ".pppppp.", "pppppppp", ".pppppp.", ".p.pp.p.", "..o..o.." ];
const SPR_PET_B = [ "........", "..oooo..", ".oppppo.", ".pepepp.", ".pppppp.", "pppppppp", ".pp..pp.", ".o....o." ];

/* --- Bosse --- */
const SPR_BOSSK_A = [
  "..oo......oo..", "..oho....oho..", "...ozzzzzzo...", "..ozzzzzzzzo..", "..zzeezzeezz..",
  "..zzzzzzzzzz..", "...ozzzzzzo...", "..cccccccccc..", ".cccccccccccc.", "scccccccccccs.",
  ".cccccccccccc.", "..cccccccccc..", "..pppp..pppp..", "..pppp..pppp..", "..pppp..pppp..", ".bbbb....bbbb."
];
const SPR_BOSSK_B = [
  "..oo......oo..", "..oho....oho..", "...ozzzzzzo...", "..ozzzzzzzzo..", "..zzeezzeezz..",
  "..zzzzzzzzzz..", "...ozzzzzzo...", "..cccccccccc..", ".cccccccccccc.", ".scccccccccccs",
  ".cccccccccccc.", "..cccccccccc..", "..pppppppppp..", "...pppppppp...", "..pppp..pppp..", "..bbbb..bbbb.."
];
const SPR_BOSSN_A = [
  ".....oooo.....", "....occcco....", "...cccccccc...", "...cceeeecc...", "...cccccccc...",
  "..mcccccccccm.", "..cccccccccc..", ".cccccccccccc.", ".cccccccccccc.", ".cccccccccccc.",
  "..cccccccccc..", "..pppppppppp..", "..pppppppppp..", "...pppppppp...", "....oo..oo....", ".............."
];
const SPR_BOSSN_B = [
  ".....oooo.....", "....occcco....", "...cccccccc...", "...cceeeecc...", "...cccccccc...",
  ".mcccccccccm..", "..cccccccccc..", ".cccccccccccc.", ".cccccccccccc.", ".cccccccccccc.",
  "..cccccccccc..", "..pppppppppp..", "...pppppppp...", "..pppppppppp..", "...oo....oo...", ".............."
];
const SPR_BOSSA_A = [
  "...mm....mm...", "..mmmm..mmmm..", "..mzzzzzzzzm..", "..zzeezzeezz..", "..zzzzzzzzzz..",
  "...mzzzzzzm...", ".mmcccccccmm..", "mmmcccccccmmm.", ".mmcccccccmm..", "..cccccccccc..",
  "..cccccccccc..", "..pppp..pppp..", "..pppp..pppp..", "..mmmm..mmmm..", ".mmmm....mmmm."
];
const SPR_BOSSA_B = [
  "...mm....mm...", "..mmmm..mmmm..", "..mzzzzzzzzm..", "..zzeezzeezz..", "..zzzzzzzzzz..",
  "...mzzzzzzm...", "..mmcccccccmm.", ".mmmcccccccmmm", "..mmcccccccmm.", "..cccccccccc..",
  "..cccccccccc..", "..pppppppppp..", "...pppppppp...", "..mmmm..mmmm..", "..mmmm..mmmm.."
];
const SPR_BOSSH_A = [
  "..o........o..", "..oo......oo..", "...ozzzzzzo...", "..zzeezzeezz..", "..zzzzzzzzzz..",
  "..gzzzzzzzzg..", ".gccccccccccg.", "gccccccccccccg", ".gccccccccccg.", "..gcccccccg...",
  "..cccccccccc..", "..pp.pppp.pp..", "..pp.pppp.pp..", "..oo......oo..", ".............."
];
const SPR_BOSSH_B = [
  "..o........o..", "..oo......oo..", "...ozzzzzzo...", "..zzeezzeezz..", "..zzzzzzzzzz..",
  "..gzzzzzzzzg..", ".gccccccccccg.", ".gccccccccccg.", "gccccccccccccg", "...gcccccccg..",
  "..cccccccccc..", "..pp.pppp.pp..", "...p.pppp.p...", "..oo......oo..", ".............."
];

function bakeSprite(rows, palette, whiteOut){
  let w = 0;
  for (const r of rows) w = Math.max(w, r.length);
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  for (let y=0;y<h;y++){
    const row = rows[y];
    for (let x=0;x<row.length;x++){
      const ch = row[x];
      if (ch === ".") continue;
      const col = whiteOut ? "#ffffff" : palette[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x,y,1,1);
    }
  }
  return c;
}
function makeSet(frames, palette){
  return { f: frames.map(r=>bakeSprite(r, palette, false)),
           w: frames.map(r=>bakeSprite(r, palette, true)),
           h: frames[0].length };
}

let SPRITES = null;
function buildSprites(){
  SPRITES = {
    player:  makeSet([SPR_PLAYER_A, SPR_PLAYER_B], PAL.player),
    walker:  makeSet([SPR_Z_A, SPR_Z_B], PAL.walker),
    runner:  makeSet([SPR_Z_A, SPR_Z_B], PAL.runner),
    armored: makeSet([SPR_Z_A, SPR_Z_B], PAL.armored),
    wraith:  makeSet([SPR_Z_A, SPR_Z_B], PAL.wraith),
    brute:   makeSet([SPR_BRUTE_A, SPR_BRUTE_B], PAL.brute),
    spitter: makeSet([SPR_SPIT_A, SPR_SPIT_B], PAL.spitter),
    bomber:  makeSet([SPR_BOMB_A, SPR_BOMB_B], PAL.bomber),
    necro:   makeSet([SPR_NECRO_A, SPR_NECRO_B], PAL.necro),
    bossKol: makeSet([SPR_BOSSK_A, SPR_BOSSK_B], PAL.bossKol),
    bossNec: makeSet([SPR_BOSSN_A, SPR_BOSSN_B], PAL.bossNec),
    bossArt: makeSet([SPR_BOSSA_A, SPR_BOSSA_B], PAL.bossArt),
    bossHiv: makeSet([SPR_BOSSH_A, SPR_BOSSH_B], PAL.bossHiv),
    pet:     makeSet([SPR_PET_A, SPR_PET_B], { o:"#101018", p:"#8a8f9c", e:"#ff4d4d" }),
  };
}

/* =========================================================
   4. CANVAS & WELT
========================================================= */
/* SS = interne Renderauflösung. Alle Spiellogik rechnet weiter in Weltpixeln,
   gezeichnet wird aber mit doppelter Pixeldichte — schärfere Kanten, saubere
   Schrift und feinere Effekte, besonders auf Retina-Displays. */
const SS = 2;
const canvas = el("world");
const ctx = canvas.getContext("2d");
canvas.width = VIEW_W * SS; canvas.height = VIEW_H * SS;
ctx.imageSmoothingEnabled = false;

const groundCv = document.createElement("canvas");
groundCv.width = WORLD_W * SS; groundCv.height = WORLD_H * SS;
const groundCtx = groundCv.getContext("2d");
groundCtx.imageSmoothingEnabled = false;

const decalCv = document.createElement("canvas");
decalCv.width = WORLD_W * SS; decalCv.height = WORLD_H * SS;
const decalCtx = decalCv.getContext("2d");
decalCtx.imageSmoothingEnabled = false;
decalCtx.setTransform(SS,0,0,SS,0,0);          // Decals in Weltkoordinaten zeichnen

const miniCv = el("miniMap");
const miniCtx = miniCv.getContext("2d");
const MINI_SX = miniCv.width / WORLD_W, MINI_SY = miniCv.height / WORLD_H;

const cam = { x:0, y:0 };
function camTargetX(){ return clamp(player.x - VIEW_W/2, 0, WORLD_W - VIEW_W); }
function camTargetY(){ return clamp(player.y - VIEW_H/2, 0, WORLD_H - VIEW_H); }
function onScreen(x, y, pad){
  const p = pad || 40;
  return x > cam.x - p && x < cam.x + VIEW_W + p && y > cam.y - p && y < cam.y + VIEW_H + p;
}

function buildGround(){
  const g = groundCtx;
  g.setTransform(1,0,0,1,0,0);
  g.clearRect(0,0,WORLD_W*SS,WORLD_H*SS);
  g.setTransform(SS,0,0,SS,0,0);          // ab hier in Weltkoordinaten, gerastert mit SS

  g.fillStyle = "#24351d";
  g.fillRect(0,0,WORLD_W,WORLD_H);

  // --- Biome: viele kleine Flecken statt weniger großer, das wirkt organischer ---
  const biomes = [
    { tones:["#2f4523","#27381c","#365030"], n:150, a:0.75, sz:[8,30] },   // saftiges Gras
    { tones:["#55472c","#4a3d25","#61512f"], n:90,  a:0.7,  sz:[8,26] },   // trockene Erde
    { tones:["#3d3d43","#34343a","#4a4950"], n:30,  a:0.55, sz:[7,22] },   // Asche
  ];
  for (const b of biomes){
    for (let i=0;i<b.n;i++){
      const cx = rand(0,WORLD_W), cy = rand(0,WORLD_H);
      g.globalAlpha = b.a;
      g.fillStyle = pick(b.tones);
      for (let k=0;k<18;k++){
        const w = rand(b.sz[0], b.sz[1]), h = rand(b.sz[0]*0.6, b.sz[1]*0.6);
        g.fillRect(Math.floor(cx + rand(-30,30)), Math.floor(cy + rand(-20,20)), Math.floor(w), Math.floor(h));
      }
      // Ausgefranster Rand — klassisches Pixel-Art-Dithering
      g.globalAlpha = b.a * 0.5;
      for (let k=0;k<30;k++){
        g.fillRect(Math.floor(cx + rand(-40,40)), Math.floor(cy + rand(-26,26)), 2, 2);
      }
      g.globalAlpha = 1;
    }
  }

  // --- Wege ---
  for (let i=0;i<12;i++){
    let x = rand(0,WORLD_W), y = rand(0,WORLD_H), a = rand(0,Math.PI*2);
    for (let k=0;k<80;k++){
      g.fillStyle = pick(["#6b5836","#5e4d2f","#77613b"]);
      g.fillRect(Math.floor(x), Math.floor(y), Math.floor(rand(9,20)), Math.floor(rand(6,12)));
      g.fillStyle = "rgba(40,32,18,.35)";
      g.fillRect(Math.floor(x), Math.floor(y)+Math.floor(rand(6,11)), Math.floor(rand(6,14)), 2);
      a += rand(-0.2,0.2);
      x += Math.cos(a)*rand(7,14); y += Math.sin(a)*rand(7,14);
      if (x<-20||x>WORLD_W+20||y<-20||y>WORLD_H+20) break;
    }
  }

  // --- Krater ---
  for (let i=0;i<24;i++){
    const cx = Math.floor(rand(30,WORLD_W-30)), cy = Math.floor(rand(30,WORLD_H-30)), r = rand(10,24);
    g.fillStyle = "#1e1a12";
    g.beginPath(); g.ellipse(cx, cy, r, r*0.6, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = "#3c3324";
    g.beginPath(); g.ellipse(cx, cy-1.5, r*0.74, r*0.42, 0, 0, Math.PI*2); g.fill();
    g.fillStyle = "rgba(255,240,200,.06)";
    g.beginPath(); g.ellipse(cx, cy-r*0.35, r*0.6, r*0.18, 0, 0, Math.PI*2); g.fill();
  }

  // --- Bewuchs: dichte Grasnarbe, erst durch die doppelte Auflösung fein genug ---
  for (let i=0;i<9000;i++){
    const x = rand(2,WORLD_W-3), y = rand(2,WORLD_H-3);
    g.fillStyle = pick(["#4e7233","#456628","#3a5623","#57803a"]);
    g.fillRect(x, y, 0.5, 2.5);
    g.fillRect(x+0.5, y+0.5, 0.5, 2);
    g.fillStyle = "rgba(190,230,150,.22)";
    g.fillRect(x, y, 0.5, 0.5);
  }
  for (let i=0;i<3000;i++){
    const x = Math.floor(rand(2,WORLD_W-4)), y = Math.floor(rand(2,WORLD_H-4));
    g.fillStyle = pick(["#3f5c28","#496b2e","#334a20"]);
    g.fillRect(x,y,1,2); g.fillRect(x+2,y+1,1,2); g.fillRect(x+1,y-1,1,2);
  }

  // --- Körnung: bricht die flachen Farbflächen auf ---
  for (let i=0;i<45000;i++){
    g.globalAlpha = rand(0.04, 0.12);
    g.fillStyle = Math.random() < 0.5 ? "#ffffff" : "#000000";
    g.fillRect(rand(0,WORLD_W), rand(0,WORLD_H), 0.5, 0.5);
  }
  g.globalAlpha = 1;

  // --- Steine & Schutt ---
  for (let i=0;i<520;i++){
    const x = Math.floor(rand(4,WORLD_W-6)), y = Math.floor(rand(4,WORLD_H-6));
    g.fillStyle = "#3b424b"; g.fillRect(x,y,3,2);
    g.fillStyle = "#5b6673"; g.fillRect(x,y,2,1);
    g.fillStyle = "#1e2228"; g.fillRect(x,y+2,3,1);
  }
  // --- Knochen & Schädel ---
  for (let i=0;i<110;i++){
    const x = Math.floor(rand(10,WORLD_W-12)), y = Math.floor(rand(10,WORLD_H-12));
    g.fillStyle = "#8b8474";
    if (Math.random() < 0.4){
      g.fillRect(x,y,4,3);
      g.fillStyle="#16150f"; g.fillRect(x+1,y+1,1,1); g.fillRect(x+3,y+1,1,1);
    } else {
      g.fillRect(x,y,5,1); g.fillRect(x-1,y-1,1,3); g.fillRect(x+5,y-1,1,3);
    }
  }
  // --- Grabsteine ---
  for (let i=0;i<40;i++){
    const x = Math.floor(rand(20,WORLD_W-24)), y = Math.floor(rand(20,WORLD_H-24));
    g.fillStyle = "rgba(0,0,0,.32)"; g.fillRect(x-1, y+8, 10, 3);
    g.fillStyle = "#4b5059"; g.fillRect(x, y, 7, 9);
    g.fillStyle = "#666e7a"; g.fillRect(x, y, 7, 2);
    g.fillStyle = "#2e323a"; g.fillRect(x+2, y+3, 3, 1); g.fillRect(x+3, y+2, 1, 3);
  }
  // --- Zaunreste ---
  for (let i=0;i<16;i++){
    const x = Math.floor(rand(20,WORLD_W-60)), y = Math.floor(rand(20,WORLD_H-20));
    const len = randInt(3,6);
    for (let k=0;k<len;k++){
      const px = x + k*8;
      g.fillStyle = "rgba(0,0,0,.28)"; g.fillRect(px, y+9, 4, 2);
      g.fillStyle = "#4a3c28"; g.fillRect(px, y, 2, 10);
      g.fillStyle = "#63512f"; g.fillRect(px, y, 1, 10);
    }
    g.fillStyle = "#4a3c28"; g.fillRect(x, y+2, len*8, 1); g.fillRect(x, y+6, len*8, 1);
  }
  // --- Alte Blutlachen ---
  for (let i=0;i<55;i++){
    const cx = Math.floor(rand(20,WORLD_W-20)), cy = Math.floor(rand(20,WORLD_H-20));
    g.globalAlpha = 0.34;
    for (let k=0;k<10;k++){
      g.fillStyle = pick(["#430d0d","#5a1111","#310909"]);
      g.fillRect(Math.floor(cx+rand(-9,9)), Math.floor(cy+rand(-6,6)), randInt(2,6), randInt(1,4));
    }
    g.globalAlpha = 1;
  }

  // --- Kartenrand ---
  g.strokeStyle = "rgba(255,84,104,.3)"; g.lineWidth = 3;
  g.strokeRect(2,2,WORLD_W-4,WORLD_H-4);
  g.fillStyle = "rgba(0,0,0,.45)";
  g.fillRect(0,0,WORLD_W,5); g.fillRect(0,WORLD_H-5,WORLD_W,5);
  g.fillRect(0,0,5,WORLD_H); g.fillRect(WORLD_W-5,0,5,WORLD_H);
  g.setTransform(1,0,0,1,0,0);
}

/* =========================================================
   5. AUDIO (prozedural, ohne Dateien)
========================================================= */
let actx = null, master = null, musicGain = null, soundOn = true;
try{
  const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  if (typeof s.sound === "boolean") soundOn = s.sound;
}catch(e){}

function ensureAudio(){
  if (!actx){
    try{
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = actx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 22; comp.ratio.value = 8;
      comp.attack.value = 0.003; comp.release.value = 0.2;
      master = actx.createGain(); master.gain.value = 0.85;
      musicGain = actx.createGain(); musicGain.gain.value = 0.55;
      master.connect(comp); musicGain.connect(master); comp.connect(actx.destination);
    }catch(e){ actx = null; }
  }
  if (actx && actx.state === "suspended") actx.resume();
}
function tone(o){
  if (!soundOn || !actx) return;
  const t0 = actx.currentTime + (o.delay || 0);
  const osc = actx.createOscillator(), gain = actx.createGain();
  osc.type = o.type || "square";
  osc.frequency.setValueAtTime(o.f, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + o.d);
  const v = o.v == null ? 0.14 : o.v;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(v, t0 + (o.atk || 0.006));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.d);
  let node = osc;
  if (o.filter){
    const flt = actx.createBiquadFilter();
    flt.type = o.filter; flt.frequency.value = o.ff || 900; flt.Q.value = o.q || 4;
    osc.connect(flt); node = flt;
  }
  node.connect(gain); gain.connect(o.bus || master);
  osc.start(t0); osc.stop(t0 + o.d + 0.03);
}
let noiseBuf = null;
function getNoiseBuf(){
  if (!noiseBuf && actx){
    const len = Math.floor(actx.sampleRate * 1.2);
    noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i=0;i<len;i++) d[i] = Math.random()*2-1;
  }
  return noiseBuf;
}
function noise(o){
  if (!soundOn || !actx) return;
  const t0 = actx.currentTime + (o.delay || 0);
  const src = actx.createBufferSource();
  src.buffer = getNoiseBuf();
  src.playbackRate.value = o.rate || 1;
  const flt = actx.createBiquadFilter();
  flt.type = o.type || "lowpass"; flt.frequency.setValueAtTime(o.ff || 1400, t0);
  if (o.ffTo) flt.frequency.exponentialRampToValueAtTime(Math.max(60, o.ffTo), t0 + o.d);
  flt.Q.value = o.q || 1;
  const gain = actx.createGain();
  gain.gain.setValueAtTime(o.v == null ? 0.12 : o.v, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.d);
  src.connect(flt); flt.connect(gain); gain.connect(o.bus || master);
  src.start(t0); src.stop(t0 + o.d + 0.03);
}
const rv = (a,b)=> a + Math.random()*(b-a);

const WEAPON_SFX = {
  pistol:  ()=>{ tone({f:rv(480,560), to:280, d:0.055, type:"square", v:0.05}); noise({d:0.05, v:0.05, ff:2600}); },
  smg:     ()=>{ tone({f:rv(600,700), to:400, d:0.03, type:"square", v:0.032}); noise({d:0.03, v:0.03, ff:3200}); },
  rifle:   ()=>{ tone({f:rv(420,500), to:230, d:0.05, type:"sawtooth", v:0.045}); noise({d:0.05, v:0.045, ff:2800, ffTo:900}); },
  nail:    ()=>{ tone({f:rv(900,1100), to:600, d:0.03, type:"square", v:0.03}); },
  shotgun: ()=>{ noise({d:0.18, v:0.13, ff:2400, ffTo:400}); tone({f:150, to:60, d:0.14, type:"sawtooth", v:0.07}); },
  bow:     ()=>{ tone({f:300, to:760, d:0.07, type:"triangle", v:0.055}); noise({d:0.05, v:0.03, ff:4000}); },
  sniper:  ()=>{ tone({f:1000, to:150, d:0.1, type:"sawtooth", v:0.08}); noise({d:0.16, v:0.07, ff:2200, ffTo:300}); },
  launch:  ()=>{ tone({f:200, to:80, d:0.14, type:"square", v:0.08}); noise({d:0.1, v:0.05, ff:1200}); },
  laser:   ()=>{ tone({f:1300, to:420, d:0.07, type:"sawtooth", v:0.05, filter:"bandpass", ff:1600, q:6}); },
  plasma:  ()=>{ tone({f:760, to:240, d:0.1, type:"triangle", v:0.06}); tone({f:380, to:120, d:0.12, type:"sine", v:0.05}); },
  rail:    ()=>{ tone({f:1700, to:220, d:0.14, type:"sawtooth", v:0.08}); noise({d:0.2, v:0.07, ff:3600, ffTo:400}); },
  flame:   ()=>{ noise({d:0.09, v:0.04, ff:900, ffTo:340, type:"lowpass"}); },
  zap:     ()=>{ tone({f:rv(1400,1800), to:500, d:0.07, type:"square", v:0.05}); noise({d:0.06, v:0.04, ff:5000, type:"highpass"}); },
  frost:   ()=>{ tone({f:rv(1100,1300), to:1700, d:0.08, type:"triangle", v:0.045}); noise({d:0.07, v:0.03, ff:6000, type:"highpass"}); },
  acid:    ()=>{ tone({f:260, to:90, d:0.1, type:"sawtooth", v:0.05, filter:"lowpass", ff:700}); },
  void:    ()=>{ tone({f:90, to:36, d:0.4, type:"sine", v:0.1}); tone({f:180, to:60, d:0.35, type:"triangle", v:0.05}); },
  sun:     ()=>{ tone({f:900, to:300, d:0.16, type:"sawtooth", v:0.07}); tone({f:1350, to:450, d:0.14, type:"triangle", v:0.04, delay:0.02}); },
};
const SFX = {
  hit:        ()=>{ tone({f:rv(130,175), to:70, d:0.05, type:"sawtooth", v:0.045}); },
  crit:       ()=>{ tone({f:1000, to:420, d:0.08, type:"square", v:0.07}); tone({f:1500, to:700, d:0.06, type:"triangle", v:0.04, delay:0.01}); },
  zombieDie:  ()=>{ tone({f:rv(85,110), to:38, d:0.14, type:"sawtooth", v:0.06}); noise({d:0.1, v:0.05, ff:800, ffTo:200}); },
  explode:    ()=>{ noise({d:0.42, v:0.2, ff:1400, ffTo:120}); tone({f:96, to:32, d:0.34, type:"sawtooth", v:0.11}); },
  bigExplode: ()=>{ noise({d:0.7, v:0.26, ff:1800, ffTo:80}); tone({f:70, to:26, d:0.6, type:"sine", v:0.16}); },
  coin:       ()=>{ tone({f:1050, to:1500, d:0.06, type:"square", v:0.045}); tone({f:1500, d:0.07, type:"triangle", v:0.03, delay:0.04}); },
  playerHurt: ()=>{ tone({f:180, to:70, d:0.18, type:"sawtooth", v:0.13}); noise({d:0.14, v:0.08, ff:700}); },
  dodge:      ()=>{ tone({f:700, to:1250, d:0.08, type:"triangle", v:0.055}); },
  buy:        ()=>{ tone({f:660, to:990, d:0.08, type:"square", v:0.07}); tone({f:990, to:1320, d:0.09, type:"square", v:0.06, delay:0.07}); },
  sell:       ()=>{ tone({f:440, to:250, d:0.1, type:"triangle", v:0.06}); },
  fuse:       ()=>{ tone({f:400, to:900, d:0.16, type:"triangle", v:0.08}); tone({f:800, to:1600, d:0.2, type:"square", v:0.06, delay:0.1});
                    tone({f:1200, to:2400, d:0.22, type:"triangle", v:0.05, delay:0.2}); noise({d:0.3, v:0.05, ff:6000, type:"highpass", delay:0.1}); },
  levelUp:    ()=>{ [523,659,784,1046].forEach((f,i)=>tone({f, d:0.16, type:"square", v:0.07, delay:i*0.075})); },
  wave:       ()=>{ tone({f:220, to:440, d:0.22, type:"triangle", v:0.1}); tone({f:330, to:550, d:0.24, type:"triangle", v:0.09, delay:0.14}); },
  bossRoar:   ()=>{ tone({f:150, to:45, d:0.9, type:"sawtooth", v:0.16, filter:"lowpass", ff:600});
                    tone({f:78, to:30, d:1.1, type:"square", v:0.12}); noise({d:0.8, v:0.1, ff:900, ffTo:150}); },
  charge:     ()=>{ tone({f:120, to:520, d:0.6, type:"sawtooth", v:0.08}); },
  spit:       ()=>{ tone({f:340, to:130, d:0.12, type:"sawtooth", v:0.05, filter:"lowpass", ff:900}); },
  summon:     ()=>{ tone({f:200, to:620, d:0.3, type:"triangle", v:0.07}); tone({f:400, to:1240, d:0.26, type:"sine", v:0.05, delay:0.05}); },
  mortar:     ()=>{ tone({f:700, to:200, d:0.5, type:"sine", v:0.05}); },
  slam:       ()=>{ noise({d:0.5, v:0.18, ff:900, ffTo:90}); tone({f:60, to:24, d:0.5, type:"sine", v:0.14}); },
  gameover:   ()=>{ [392,330,262,196].forEach((f,i)=>tone({f, d:0.4, type:"sawtooth", v:0.11, delay:i*0.16})); noise({d:0.9, v:0.08, ff:500}); },
};

/* --- Prozedurale Begleitmusik --- */
const SCALE = [0,3,5,7,10];
let musicT = 0, musicStep = 0;
function updateMusic(dt, intensity, boss){
  if (!soundOn || !actx) return;
  musicT -= dt;
  if (musicT > 0) return;
  const stepDur = boss ? 0.24 : 0.34 - Math.min(0.1, intensity*0.01);
  musicT = stepDur;
  musicStep = (musicStep + 1) % 16;
  const root = boss ? 41.2 : 49;                                    // E1 / G1
  if (musicStep % 4 === 0){
    tone({ f: root, d: stepDur*2.4, type:"triangle", v: boss ? 0.12 : 0.075, bus: musicGain, filter:"lowpass", ff:260 });
  }
  if (musicStep % 8 === 4){
    noise({ d:0.12, v:0.05, ff:5200, type:"highpass", bus: musicGain });
  }
  if (boss && musicStep % 2 === 0){
    tone({ f: root*2, d: stepDur*0.8, type:"square", v:0.035, bus: musicGain, filter:"lowpass", ff:600 });
  }
  if (musicStep % 4 === 2 && intensity > 3){
    const n = SCALE[Math.floor(Math.random()*SCALE.length)];
    tone({ f: root*4*Math.pow(2, n/12), d:0.2, type:"triangle", v:0.028, bus: musicGain });
  }
}

/* =========================================================
   6. SPIELSTAND & WERTE
========================================================= */
let run = null, S = null, uidCounter = 1;

function mkItem(defId, price, lvl){ return { uid: uidCounter++, defId, price, lvl: lvl || 1 }; }
function freshRun(){
  return {
    wave: 1, coins: 0, hp: BASE.maxHp, level: 1, xp: 0, kills: 0,
    upgrades: {},
    equipped: { weapon:[ mkItem("pistol", DEF("pistol").price) ], armor:[], ring:[], shield:[], pet:[] },
  };
}
function xpForLevel(level){ return Math.round(10 + level*7 + level*level*0.85); }

function computeStats(){
  const m = {};
  for (const k in STAT_INFO) m[k] = 0;
  for (const slot of SLOT_ORDER){
    for (const it of run.equipped[slot]){
      const def = DEF(it.defId);
      if (!def) continue;
      const mods = itemMods(def, it.lvl);
      for (const k in mods) m[k] = (m[k]||0) + mods[k];
    }
  }
  for (const u of UPGRADES){
    const lvl = run.upgrades[u.key] || 0;
    if (!lvl || u.special) continue;
    m[u.key] = (m[u.key]||0) + u.per*lvl;
  }
  return {
    mods: m,
    damageMul:   Math.max(0.1, 1 + m.damage/100),
    fireRateMul: Math.max(0.15, 1 + m.fireRate/100),
    rangeMul:    Math.max(0.3, 1 + m.range/100),
    moveSpeed:   BASE.moveSpeed * Math.max(0.25, 1 + m.moveSpeed/100),
    maxHp:       Math.max(20, Math.round(BASE.maxHp * (1 + m.maxHp/100))),
    armorRed:    clamp(m.armor,0,75)/100,
    dodge:       clamp(m.dodge,0,60)/100,
    crit:        clamp(m.crit,0,85)/100,
    critDmg:     2 + m.critDmg/100,
    coinMul:     Math.max(0.2, 1 + m.coins/100),
    xpMul:       Math.max(0.2, 1 + m.xp/100),
    magnet:      BASE.magnet * Math.max(0.3, 1 + m.magnet/100),
    luck:        m.luck,
    lifesteal:   Math.max(0, m.lifesteal)/100,
    regen:       Math.max(0, m.regen),
    extraProjectiles: run.upgrades.projectiles || 0,
    extraPierce:      run.upgrades.pierceUp || 0,
  };
}
function refreshStats(){
  S = computeStats();
  if (player){
    player.hp = Math.min(player.hp, S.maxHp);
    if (player.hp <= 0) player.hp = 1;
  }
  rebuildPets();
  updateWeaponBar();
}

/* ---------------- Fusion ---------------- */
function fusablePairs(){
  const out = [];
  for (const slot of SLOT_ORDER){
    const groups = {};
    for (const it of run.equipped[slot]){
      if ((it.lvl||1) >= MAX_FUSE) continue;
      const key = it.defId + "@" + (it.lvl||1);
      (groups[key] = groups[key] || []).push(it);
    }
    for (const key in groups){
      const g = groups[key];
      for (let i=0;i+1<g.length;i+=2) out.push({ slot, a:g[i], b:g[i+1] });
    }
  }
  return out;
}
function fuseItems(slot, uidA, uidB){
  const arr = run.equipped[slot];
  const ia = arr.findIndex(i=>i.uid===uidA), ib = arr.findIndex(i=>i.uid===uidB);
  if (ia < 0 || ib < 0) return null;
  const a = arr[ia], b = arr[ib];
  if (a.defId !== b.defId || (a.lvl||1) !== (b.lvl||1)) return null;
  const merged = mkItem(a.defId, a.price + b.price, (a.lvl||1) + 1);
  const keep = arr.filter(i => i.uid !== uidA && i.uid !== uidB);
  keep.push(merged);
  run.equipped[slot] = keep;
  refreshStats();
  saveGame();
  SFX.fuse();
  return merged;
}

/* ---------------- Speichern / Laden ---------------- */
function saveGame(){
  if (!run) return;
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v:3, wave:run.wave, coins:run.coins, hp:Math.round(run.hp),
      level:run.level, xp:run.xp, kills:run.kills||0, upgrades:run.upgrades,
      items: SLOT_ORDER.flatMap(s => run.equipped[s].map(i => ({ id:i.defId, p:i.price, l:i.lvl||1 }))),
      savedAt: Date.now()
    }));
  }catch(e){}
}
function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== 3 || typeof d.wave !== "number") return null;
    return d;
  }catch(e){ return null; }
}
function runFromSave(d){
  const eq = { weapon:[], armor:[], ring:[], shield:[], pet:[] };
  (d.items||[]).forEach(rec => {
    const def = DEF(rec.id);
    if (!def) return;
    if (eq[def.slot].length < SLOT_CAPS[def.slot])
      eq[def.slot].push(mkItem(rec.id, rec.p || def.price, clamp(rec.l||1, 1, MAX_FUSE)));
  });
  if (!eq.weapon.length) eq.weapon.push(mkItem("pistol", DEF("pistol").price));
  return {
    wave: Math.max(1, d.wave|0), coins: Math.max(0, d.coins|0), hp: d.hp || BASE.maxHp,
    level: Math.max(1, d.level|0), xp: Math.max(0, d.xp|0), kills: d.kills|0,
    upgrades: d.upgrades || {}, equipped: eq,
  };
}
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
function getBestWave(){ try{ return parseInt(localStorage.getItem(BEST_KEY)||"1",10) || 1; }catch(e){ return 1; } }
function setBestWave(w){ try{ if (w > getBestWave()) localStorage.setItem(BEST_KEY, String(w)); }catch(e){} }

/* =========================================================
   7. STEUERUNG
========================================================= */
const stageEl = el("stage");
const joyBase = el("joyBase"), joyKnob = el("joyKnob");
const input = { x:0, y:0 };
let joyId = null, joyBaseX = 0, joyBaseY = 0, joyCaptured = false;
const JOY_RADIUS = 56, JOY_DEAD = 0.12;

function localPos(clientX, clientY){
  const r = stageEl.getBoundingClientRect();
  return { x: clientX - r.left, y: clientY - r.top };
}
function placeJoy(x, y){
  joyBaseX = x; joyBaseY = y;
  joyBase.style.left = x+"px"; joyBase.style.top = y+"px";
  joyKnob.style.left = x+"px"; joyKnob.style.top = y+"px";
  joyBase.classList.add("on"); joyKnob.classList.add("on");
}
function joyStart(e){
  if (phase !== "wave" && phase !== "collect") return;
  if (paused) return;
  if (e.target.closest && e.target.closest(".overlay, .hudPanel, #collectBar, button")) return;
  ensureAudio();
  // Ein neuer Finger übernimmt immer die Steuerung — so kann der Joystick nie „belegt" hängen bleiben.
  if (joyId !== null && joyId !== e.pointerId) releaseJoystick();
  joyId = e.pointerId;
  const p = localPos(e.clientX, e.clientY);
  placeJoy(p.x, p.y);
  input.x = 0; input.y = 0;
  joyCaptured = false;
  try{ stageEl.setPointerCapture(e.pointerId); joyCaptured = true; }catch(err){}
  e.preventDefault();
}
function joyMove(e){
  if (e.pointerId !== joyId) return;
  // Maus/Stift ohne gedrückte Taste = Finger ist längst weg
  if (e.pointerType !== "touch" && e.buttons === 0){ releaseJoystick(); return; }
  const p = localPos(e.clientX, e.clientY);
  let dx = p.x - joyBaseX, dy = p.y - joyBaseY;
  const d = Math.hypot(dx,dy);
  if (d > JOY_RADIUS){
    // Basis nachziehen, statt am Rand zu kleben — fühlt sich beim langen Laufen viel besser an
    joyBaseX += dx * (1 - JOY_RADIUS/d);
    joyBaseY += dy * (1 - JOY_RADIUS/d);
    joyBase.style.left = joyBaseX+"px"; joyBase.style.top = joyBaseY+"px";
    dx = dx/d*JOY_RADIUS; dy = dy/d*JOY_RADIUS;
  }
  joyKnob.style.left = (joyBaseX+dx)+"px";
  joyKnob.style.top  = (joyBaseY+dy)+"px";
  const mag = Math.min(1, Math.hypot(dx,dy)/JOY_RADIUS);
  if (mag < JOY_DEAD){ input.x = 0; input.y = 0; }
  else {
    const norm = (mag - JOY_DEAD) / (1 - JOY_DEAD);
    const l = Math.hypot(dx,dy) || 1;
    input.x = (dx/l) * norm;
    input.y = (dy/l) * norm;
  }
  e.preventDefault();
}
function joyEnd(e){ if (e && e.pointerId !== joyId) return; releaseJoystick(); }
function releaseJoystick(){
  if (joyId !== null && joyCaptured){
    try{ stageEl.releasePointerCapture(joyId); }catch(err){}
  }
  joyId = null; joyCaptured = false;
  input.x = 0; input.y = 0;
  joyBase.classList.remove("on"); joyKnob.classList.remove("on");
}
/* Wachhund: prüft jeden Frame, ob der Steuerfinger überhaupt noch existiert.
   Fängt verlorene pointerup/pointercancel ab (iOS-Gesten, App-Wechsel, Anruf),
   die die Figur sonst endlos weiterlaufen lassen. */
function joyWatchdog(){
  if (joyId === null) return;
  if (document.hidden){ releaseJoystick(); return; }   // hasFocus() ist im iframe unzuverlässig
  if (joyCaptured && !stageEl.hasPointerCapture(joyId)) releaseJoystick();
}
stageEl.addEventListener("pointerdown", joyStart);
stageEl.addEventListener("pointermove", joyMove);
stageEl.addEventListener("pointerup", joyEnd);
stageEl.addEventListener("pointercancel", joyEnd);
stageEl.addEventListener("lostpointercapture", joyEnd);
/* Mehrfach abgesichert: Pointer-, Touch- und Fensterebene. Ein verlorenes Event
   auf einer Ebene wird von der nächsten aufgefangen. */
document.addEventListener("pointerup", joyEnd, true);
document.addEventListener("pointercancel", joyEnd, true);
window.addEventListener("pointerup", joyEnd);
window.addEventListener("pointercancel", joyEnd);
window.addEventListener("touchend", (e)=>{ if (!e.touches || e.touches.length === 0) releaseJoystick(); });
window.addEventListener("touchcancel", ()=> releaseJoystick());
window.addEventListener("blur", releaseJoystick);
window.addEventListener("pagehide", releaseJoystick);
document.addEventListener("visibilitychange", ()=>{ if (document.hidden) releaseJoystick(); });
stageEl.addEventListener("contextmenu", (e)=>e.preventDefault());

const keys = {};
window.addEventListener("keydown", (e)=>{
  keys[e.key.toLowerCase()] = true;
  if (e.key === " " || e.key.startsWith("Arrow")) e.preventDefault();
});
window.addEventListener("keyup", (e)=>{ keys[e.key.toLowerCase()] = false; });
function keyboardVector(){
  let x=0,y=0;
  if (keys["a"]||keys["arrowleft"]) x-=1;
  if (keys["d"]||keys["arrowright"]) x+=1;
  if (keys["w"]||keys["arrowup"]) y-=1;
  if (keys["s"]||keys["arrowdown"]) y+=1;
  if (x||y){ const m=Math.hypot(x,y); x/=m; y/=m; }
  return {x,y};
}

/* =========================================================
   8. ENTITÄTEN
========================================================= */
let player = null;
let zombies = [], bullets = [], ebullets = [], coinDrops = [], particles = [], floaters = [];
let booms = [], shocks = [], warns = [], pools = [], vortexes = [], pets = [], portals = [];
let shake = 0, hitFlash = 0, flashWhite = 0, hitStop = 0;

function resetEntities(){
  player = { x: WORLD_W/2, y: WORLD_H/2, r: 8, hp: run.hp, invuln:0, walkT:0, faceX:1, faceY:0, flash:0, dead:false, dustT:0 };
  zombies = []; bullets = []; ebullets = []; coinDrops = []; particles = []; floaters = [];
  booms = []; shocks = []; warns = []; pools = []; vortexes = []; pets = []; portals = [];
  cam.x = camTargetX(); cam.y = camTargetY();
  decalCtx.clearRect(0,0,WORLD_W,WORLD_H);
  rebuildPets();
}
const petSpriteCache = {};
function petSprites(color, dark){
  const key = color + "|" + dark;
  if (!petSpriteCache[key]) petSpriteCache[key] = makeSet([SPR_PET_A, SPR_PET_B], { o:dark, p:color, e:"#ff4d4d" });
  return petSpriteCache[key];
}
function rebuildPets(){
  if (!player) return;
  pets = run.equipped.pet.map((it, i) => {
    const def = DEF(it.defId);
    const ps = petStats(def, it.lvl);
    return { x: player.x - 16 - i*12, y: player.y + 10, timer:0, walkT: Math.random()*6,
             def, ps, color: ps.color, spr: petSprites(ps.color, ps.dark) };
  });
}

/* ---------------- Zombie-Typen ---------------- */
const Z_TYPES = {
  walker:  { name:"Wandler",   hp:1,    spd:1,    size:1,    dmg:1,   coin:[1,2], xp:3,  spr:"walker",  from:1,  w:100 },
  runner:  { name:"Renner",    hp:0.5,  spd:1.95, size:0.85, dmg:0.8, coin:[1,2], xp:4,  spr:"runner",  from:2,  w:46 },
  brute:   { name:"Brecher",   hp:3.4,  spd:0.62, size:1.45, dmg:1.8, coin:[3,5], xp:9,  spr:"brute",   from:4,  w:26 },
  spitter: { name:"Spucker",   hp:1.1,  spd:0.96, size:0.95, dmg:0.9, coin:[2,4], xp:7,  spr:"spitter", from:5,  w:26,
             ranged:{ range:205, keep:132, cd:2.1, speed:168, dmg:0.95, color:"#c6ff4d", r:4,
                      pool:{ radius:26, dps:11, dur:3 } } },
  bomber:  { name:"Sprengling",hp:0.95, spd:1.3,  size:1.0,  dmg:0.5, coin:[2,4], xp:7,  spr:"bomber",  from:7,  w:22,
             suicide:{ radius:48, dmg:2.0 } },
  armored: { name:"Panzerter", hp:2.6,  spd:0.92, size:1.08, dmg:1.2, coin:[3,5], xp:8,  spr:"armored", from:9,  w:24, dr:0.35 },
  necro:   { name:"Nekromant", hp:2.2,  spd:0.8,  size:1.05, dmg:0.8, coin:[4,7], xp:13, spr:"necro",   from:11, w:16,
             spawner:{ cd:4.3, count:2, kind:"walker", keep:200 } },
  wraith:  { name:"Schemen",   hp:0.85, spd:2.5,  size:0.9,  dmg:1.1, coin:[2,4], xp:9,  spr:"wraith",  from:14, w:18, ghost:true },
};

/* ---------------- Bosse ---------------- */
const BOSSES = [
  { key:"kolos", name:"DER KOLOSS", tag:"ANSTURM · SCHOCKWELLE", spr:"bossKol",
    hp:25, spd:0.55, size:2.5, dmg:3.0, coin:[30,46], xp:65,
    abilities:[ { type:"charge", cd:5.5 }, { type:"slam", cd:8.5 } ] },
  { key:"seuche", name:"SEUCHENMEISTER", tag:"BESCHWÖRER · NOVA", spr:"bossNec",
    hp:20, spd:0.72, size:2.2, dmg:2.2, coin:[30,46], xp:65, dr:0.15,
    abilities:[ { type:"summon", cd:5.0, count:4, kind:"walker" }, { type:"blink", cd:7.5 }, { type:"nova", cd:9 } ] },
  { key:"kanonier", name:"DER KANONIER", tag:"ARTILLERIE · MÖRSER", spr:"bossArt",
    hp:22, spd:0.6, size:2.3, dmg:2.4, coin:[30,46], xp:65, keep:118,
    abilities:[ { type:"volley", cd:4.2, count:12 }, { type:"mortar", cd:6.5, count:4 } ] },
  { key:"brutmutter", name:"DIE BRUTMUTTER", tag:"BRUT · SÄURE", spr:"bossHiv",
    hp:23, spd:0.68, size:2.4, dmg:2.6, coin:[30,46], xp:65,
    abilities:[ { type:"summon", cd:4.6, count:3, kind:"bomber" }, { type:"spray", cd:5.6, count:10 }, { type:"charge", cd:9.5 } ] },
];

function waveConfig(n){
  return {
    isBoss: n % 5 === 0,
    totalToSpawn: Math.round(10 + n*3.6),
    spawnInterval: Math.max(0.14, 0.90 - n*0.027),
    hpBase: 14 + n*4.6 + n*n*0.30,
    speedBase: 41 + Math.min(n*1.35, 54),
    dmgBase: 5.5 + n*0.62,
    coinMul: 1 + n*0.11,
    eliteChance: n >= 6 ? Math.min(0.05 + (n-6)*0.009, 0.20) : 0,
  };
}
function typeWeights(n){
  const out = [];
  for (const k in Z_TYPES){
    const t = Z_TYPES[k];
    if (n < t.from) continue;
    let w = t.w;
    if (k === "walker") w = Math.max(24, 100 - n*3);
    else w = t.w * Math.min(1, 0.4 + (n - t.from)*0.14);
    out.push([k, w]);
  }
  return out;
}
function pickZombieType(){
  const ws = typeWeights(run.wave);
  let total = 0; for (const w of ws) total += w[1];
  let r = Math.random()*total;
  for (const w of ws){ r -= w[1]; if (r <= 0) return w[0]; }
  return "walker";
}

function spawnPoint(){
  for (let tries=0; tries<20; tries++){
    const a = rand(0, Math.PI*2), d = rand(VIEW_W*0.62, VIEW_W*0.95);
    const x = clamp(player.x + Math.cos(a)*d, 14, WORLD_W-14);
    const y = clamp(player.y + Math.sin(a)*d, 14, WORLD_H-14);
    if (dist2(x,y,player.x,player.y) > (VIEW_W*0.45)*(VIEW_W*0.45)) return { x, y };
  }
  return { x: clamp(player.x + rand(-1,1)*VIEW_W*0.7, 14, WORLD_W-14),
           y: clamp(player.y + rand(-1,1)*VIEW_H*0.7, 14, WORLD_H-14) };
}

function spawnZombie(typeKey, opts){
  opts = opts || {};
  const cfg = waveConfig(run.wave);
  const t = Z_TYPES[typeKey] || Z_TYPES.walker;
  const p = opts.at || spawnPoint();
  const elite = opts.elite != null ? opts.elite : (Math.random() < cfg.eliteChance);
  const eHp = elite ? 2.4 : 1, eSize = elite ? 1.22 : 1;
  const hp = Math.round(cfg.hpBase * t.hp * eHp * (opts.hpMul || 1));
  const z = {
    x:p.x, y:p.y, kind:"zombie", type:typeKey, name:t.name, spr:t.spr,
    hp, maxHp:hp, elite,
    speed: cfg.speedBase * t.spd * rand(0.9,1.12),
    r: 8 * t.size * eSize,
    dmg: Math.max(2, Math.round(cfg.dmgBase * t.dmg)),
    coinVal: Math.max(1, Math.round(rand(t.coin[0], t.coin[1]) * cfg.coinMul * (elite?3:1))),
    xpVal: Math.round(t.xp * (1 + run.wave*0.08) * (elite?2.5:1)),
    dr: t.dr || 0,
    ghost: !!t.ghost,
    ranged: t.ranged || null, spawner: t.spawner || null, suicide: t.suicide || null,
    walkT: Math.random()*8, flash:0, spawnT:0.45, atkT: rand(0.6,1.8),
    burn:null, slowT:0, hurtT:0,
  };
  zombies.push(z);
  portals.push({ x:p.x, y:p.y, t:0.45, max:0.45, r: z.r*2, boss:false });
  return z;
}

function spawnBoss(index){
  const b = BOSSES[index % BOSSES.length];
  const cfg = waveConfig(run.wave);
  const tier = 1 + Math.floor((run.wave-1)/20)*0.35;
  const p = spawnPoint();
  const hp = Math.round(cfg.hpBase * b.hp * tier);
  const z = {
    x:p.x, y:p.y, kind:"boss", type:"boss", boss:b, name:b.name, spr:b.spr,
    hp, maxHp:hp, elite:false,
    speed: cfg.speedBase * b.spd,
    r: 8 * b.size,
    dmg: Math.max(4, Math.round(cfg.dmgBase * b.dmg)),
    coinVal: Math.round(rand(b.coin[0], b.coin[1]) * cfg.coinMul),
    xpVal: Math.round(b.xp * (1 + run.wave*0.08)),
    dr: b.dr || 0, keep: b.keep || 0,
    ranged:null, spawner:null, suicide:null, ghost:false,
    walkT:0, flash:0, spawnT:1.0, atkT:1.2, burn:null, slowT:0, hurtT:0,
    ai: { cds: b.abilities.map(a => rand(1.6, a.cd)), state:"idle", t:0, dashX:0, dashY:0, enraged:false },
  };
  zombies.push(z);
  portals.push({ x:p.x, y:p.y, t:1.0, max:1.0, r: z.r*2.4, boss:true });
  SFX.bossRoar();
  shake = Math.max(shake, 7);
  showAlert(b.name + " ERSCHEINT");
  return z;
}

/* =========================================================
   9. SPIELPHASEN
========================================================= */
let phase = "menu";
let paused = false, running = false, lastT = 0, autosaveT = 0;
let collectT = 0, pendingLevels = [], pendingBuy = null, wave = null;

function startWave(n){
  wave = waveConfig(n);
  wave.spawned = 0; wave.spawnTimer = 0.6;
  wave.bossSpawned = !wave.isBoss;
  wave.bossIndex = Math.floor((n/5 - 1)) % BOSSES.length;
  phase = "wave";
  zombies = []; bullets = []; ebullets = []; particles = []; booms = [];
  shocks = []; warns = []; pools = []; vortexes = []; portals = [];
  decalCtx.clearRect(0,0,WORLD_W,WORLD_H);
  showWaveBanner(n, wave.isBoss);
  SFX.wave();
}

function updateWaveSpawning(dt){
  if (phase !== "wave") return;
  if (!wave.bossSpawned){ spawnBoss(wave.bossIndex); wave.bossSpawned = true; }
  if (wave.spawned < wave.totalToSpawn){
    wave.spawnTimer -= dt;
    if (wave.spawnTimer <= 0 && zombies.length < MAX_ALIVE){
      const burst = run.wave > 6 ? (Math.random() < 0.45 ? 3 : 2) : 1;
      for (let i=0;i<burst && wave.spawned < wave.totalToSpawn && zombies.length < MAX_ALIVE;i++){
        spawnZombie(pickZombieType());
        wave.spawned++;
      }
      wave.spawnTimer = wave.spawnInterval;
    }
  }
  if (wave.spawned >= wave.totalToSpawn && zombies.length === 0) beginCollectPhase();
}

function beginCollectPhase(){
  phase = "collect";
  collectT = COLLECT_TIME;
  el("collectBar").classList.remove("hidden");
  saveGame();
}
function endCollectPhase(){
  el("collectBar").classList.add("hidden");
  coinDrops.forEach(c => { run.coins += c.val; });
  coinDrops = [];
  run.hp = player.hp = Math.min(S.maxHp, player.hp + S.maxHp*0.15);
  setBestWave(run.wave);
  saveGame();
  if (pendingLevels.length) showNextReward();
  else openShop();
}

function gainXp(amount){
  run.xp += amount;
  let leveled = false;
  while (run.xp >= xpForLevel(run.level)){
    run.xp -= xpForLevel(run.level);
    run.level++;
    pendingLevels.push(run.level);
    leveled = true;
  }
  if (leveled){
    SFX.levelUp();
    const pop = el("levelPop");
    pop.textContent = "LEVEL " + run.level + "!";
    pop.classList.remove("show"); void pop.offsetWidth; pop.classList.add("show");
    for (let i=0;i<22;i++){
      const a = rand(0,Math.PI*2), sp = rand(40,120);
      particles.push({ x:player.x, y:player.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
        life:rand(0.3,0.7), maxLife:0.7, color: pick(["#5bb2ff","#a9e0ff","#ffffff"]), size:2, glow:true });
    }
  }
}

/* =========================================================
   10. KAMPF – Spieler
========================================================= */
function nearestZombie(x, y, maxRange, exclude){
  let best = null, bestD = maxRange*maxRange;
  for (const z of zombies){
    if (z.spawnT > 0) continue;
    if (exclude && exclude.has(z)) continue;
    const d = dist2(x,y,z.x,z.y);
    if (d < bestD){ bestD = d; best = z; }
  }
  return best;
}

function spawnBullet(x, y, ang, w, dmg, crit, extraPierce, owner){
  bullets.push({
    x, y, px:x, py:y, ang,
    vx: Math.cos(ang)*w.speed, vy: Math.sin(ang)*w.speed, speed:w.speed,
    dmg, crit, life: (w.range * (owner === "pet" ? 1 : S.rangeMul)) / w.speed,
    pierce: (w.pierce||0) + (extraPierce||0),
    hit: new Set(), bw:w.bw, bh:w.bh, bc:w.bc, trail:w.trail || null,
    fx: w.fx || null, owner: owner || "player", t:0,
  });
}

function fireWeapon(it, def){
  const w = weaponStats(def, it.lvl);
  const range = w.range * S.rangeMul;
  const target = nearestZombie(player.x, player.y, range);
  if (!target) return false;
  const baseAng = Math.atan2(target.y - player.y, target.x - player.x);
  player.faceX = Math.cos(baseAng); player.faceY = Math.sin(baseAng);
  const count = w.projectiles + S.extraProjectiles;
  const spread = w.spread || 0;
  for (let i=0;i<count;i++){
    const offset = count > 1 ? (i - (count-1)/2) * (spread > 0 ? spread : 0.13) : 0;
    const jitter = spread > 0 ? rand(-spread,spread)*0.25 : 0;
    const crit = Math.random() < S.crit;
    const dmg = w.damage * S.damageMul * (crit ? S.critDmg : 1);
    spawnBullet(player.x + Math.cos(baseAng)*7, player.y + Math.sin(baseAng)*5,
                baseAng+offset+jitter, w, dmg, crit, S.extraPierce, "player");
  }
  // Mündungsfeuer + Licht
  const mx = player.x + Math.cos(baseAng)*10, my = player.y + Math.sin(baseAng)*7;
  booms.push({ x:mx, y:my, r:0, maxR:11, life:0.09, maxLife:0.09, color:w.bc, soft:true });
  for (let i=0;i<4;i++){
    particles.push({ x:mx, y:my,
      vx: Math.cos(baseAng)*rand(40,110)+rand(-24,24), vy: Math.sin(baseAng)*rand(40,110)+rand(-24,24),
      life:rand(0.05,0.14), maxLife:0.14, color: pick([w.bc,"#fff6c8","#ffffff"]), size:2, glow:true });
  }
  (WEAPON_SFX[w.sfx] || WEAPON_SFX.pistol)();
  return true;
}

function updateWeapons(dt){
  for (const it of run.equipped.weapon){
    const def = DEF(it.defId);
    if (!def || !def.weapon) continue;
    const w = def.weapon;
    it.timer = (it.timer || 0) - dt;
    it.cdMax = 1 / (w.rate * S.fireRateMul);
    if (it.timer > 0) continue;
    if (fireWeapon(it, def)) it.timer = it.cdMax;
    else it.timer = 0.08;
  }
}

function updatePets(dt){
  pets.forEach((p, i) => {
    const ang = Math.PI*2 * (i/Math.max(1,pets.length)) + performance.now()/1400;
    const tx = player.x + Math.cos(ang)*20, ty = player.y + Math.sin(ang)*13 + 6;
    p.x += (tx - p.x) * Math.min(1, dt*3.4);
    p.y += (ty - p.y) * Math.min(1, dt*3.4);
    p.walkT += dt*7;
    p.timer -= dt;
    if (p.timer <= 0){
      const z = nearestZombie(p.x, p.y, p.ps.range * S.rangeMul);
      if (z){
        const a = Math.atan2(z.y-p.y, z.x-p.x);
        const crit = Math.random() < S.crit;
        const dmg = p.ps.damage * S.damageMul * (crit ? S.critDmg : 1);
        spawnBullet(p.x, p.y, a, { speed:300, range:p.ps.range*S.rangeMul, pierce:0, bw:3, bh:3,
                                   bc:p.color, fx:p.ps.fx }, dmg, crit, 0, "pet");
        tone({ f:760, to:520, d:0.04, type:"triangle", v:0.03 });
        p.timer = 1 / (p.ps.rate * S.fireRateMul);
      } else p.timer = 0.15;
    }
  });
}

/* ---------------- Effekte auf Gegner ---------------- */
function applyFx(z, fx, srcX, srcY){
  if (!fx) return;
  if (fx.burn) z.burn = { dps: fx.burn.dps * S.damageMul, t: fx.burn.dur, tick: 0 };
  if (fx.slow){ z.slowT = Math.max(z.slowT || 0, fx.slow.dur); z.slowAmt = fx.slow.amount; }
  if (fx.pool) spawnPool(z.x, z.y, fx.pool.radius, fx.pool.dps * S.damageMul, fx.pool.dur, "#9be04a");
  if (fx.vortex) spawnVortex(z.x, z.y, fx.vortex.radius, fx.vortex.dps * S.damageMul, fx.vortex.dur, fx.vortex.pull);
}
function spawnPool(x, y, r, dps, dur, color, fromEnemy){
  pools.push({ x, y, r, dps, t:dur, max:dur, tick:0, color: color || "#9be04a", enemy: !!fromEnemy });
}
function spawnVortex(x, y, r, dps, dur, pull){
  vortexes.push({ x, y, r, dps, t:dur, max:dur, pull:pull||140, tick:0, spin:0 });
  tone({ f:70, to:28, d:0.5, type:"sine", v:0.09 });
}
function chainLightning(fromZ, dmg, cfg, hitSet){
  let src = fromZ, d = dmg;
  for (let j=0;j<cfg.jumps;j++){
    const next = nearestZombie(src.x, src.y, cfg.range, hitSet);
    if (!next) break;
    hitSet.add(next);
    d *= cfg.mul;
    arcs.push({ x1:src.x, y1:src.y, x2:next.x, y2:next.y, life:0.14, maxLife:0.14 });
    damageZombie(next, d, false, src.x, src.y);
    src = next;
  }
  WEAPON_SFX.zap();
}
let arcs = [];

function explode(x, y, radius, damage, color){
  booms.push({ x, y, r:4, maxR:radius, life:0.36, maxLife:0.36, color: color || "#ffb03a" });
  shake = Math.max(shake, 5);
  flashWhite = Math.max(flashWhite, 0.12);
  SFX.explode();
  for (const z of zombies){
    if (dist2(x,y,z.x,z.y) <= radius*radius) damageZombie(z, damage, false, x, y);
  }
  for (let i=0;i<20;i++){
    const a = rand(0,Math.PI*2), sp = rand(50,190);
    particles.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(0.2,0.55), maxLife:0.55,
      color: pick(["#ffb03a","#ff7043","#ffe08a","#8a8a8a"]), size:2, glow:true });
  }
  scorch(x, y, radius*0.55);
}
function scorch(x, y, r){
  decalCtx.globalAlpha = 0.4;
  decalCtx.fillStyle = "#151109";
  decalCtx.beginPath(); decalCtx.ellipse(x, y, r, r*0.6, 0, 0, Math.PI*2); decalCtx.fill();
  decalCtx.globalAlpha = 1;
}

function damageZombie(z, dmg, crit, fromX, fromY){
  if (z.hp <= 0) return;
  const real = dmg * (1 - (z.dr||0));
  z.hp -= real;
  z.flash = 0.075;
  z.hurtT = 0.12;
  if (S.lifesteal > 0 && player.hp > 0) player.hp = Math.min(S.maxHp, player.hp + real * S.lifesteal);
  if (onScreen(z.x, z.y)){
    if (floaters.length < 34 && (crit || floaters.length < 22))
      floaters.push({ x:z.x + rand(-4,4), y:z.y - z.r - 4, vy:-28, life:0.55, maxLife:0.55,
        text: Math.round(real), color: crit ? "#ffd35d" : "#ffffff", big: !!crit });
    for (let i=0;i<(crit?8:4);i++){
      const a = fromX!=null ? Math.atan2(z.y-fromY, z.x-fromX) + rand(-0.8,0.8) : rand(0,Math.PI*2);
      const sp = rand(30,95);
      particles.push({ x:z.x, y:z.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(0.15,0.35), maxLife:0.35,
        color: pick(["#8e1c1c","#c33","#6b1010"]), size:1 });
    }
  }
  if (crit) SFX.crit(); else if (Math.random() < 0.55) SFX.hit();
  if (z.hp <= 0) killZombie(z);
}

function killZombie(z){
  const idx = zombies.indexOf(z);
  if (idx >= 0) zombies.splice(idx,1); else return;
  run.kills = (run.kills||0) + 1;
  const isBoss = z.kind === "boss";
  if (isBoss){
    SFX.bigExplode(); shake = Math.max(shake, 10); flashWhite = 0.3; hitStop = 0.14;
    explode(z.x, z.y, 70, 0);
    showAlert("BOSS BESIEGT");
  } else SFX.zombieDie();

  const n = isBoss ? 46 : (z.elite ? 18 : 11);
  for (let i=0;i<n;i++){
    const a = rand(0,Math.PI*2), sp = rand(35,150);
    particles.push({ x:z.x, y:z.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(0.2,0.6), maxLife:0.6,
      color: pick(["#8e1c1c","#5f9f4e","#3f6b34","#c33"]), size:2 });
  }
  decalCtx.globalAlpha = 0.55;
  for (let i=0;i<(isBoss?26:7);i++){
    decalCtx.fillStyle = pick(["#4a0d0d","#5e1414","#380a0a"]);
    decalCtx.fillRect(Math.round(z.x + rand(-z.r,z.r)), Math.round(z.y + rand(-z.r*0.6,z.r*0.9)), randInt(1,3), randInt(1,2));
  }
  decalCtx.globalAlpha = 1;

  if (z.suicide) enemyExplode(z.x, z.y, z.suicide.radius, Math.round(z.dmg * z.suicide.dmg));

  const coinCount = isBoss ? 10 : (z.elite ? 4 : (z.coinVal > 3 ? 2 : 1));
  const per = Math.max(1, Math.round(z.coinVal * S.coinMul / coinCount));
  for (let i=0;i<coinCount;i++){
    coinDrops.push({ x:z.x, y:z.y, val:per, vx:rand(-45,45), vy:rand(-45,45), settle:0.32, t:Math.random()*6 });
  }
  gainXp(Math.max(1, Math.round(z.xpVal * S.xpMul)));
}

function updateBullets(dt){
  for (let i=bullets.length-1;i>=0;i--){
    const b = bullets[i];
    b.px = b.x; b.py = b.y; b.t += dt;
    if (b.fx && b.fx.homing){
      const tgt = nearestZombie(b.x, b.y, 150, b.hit);
      if (tgt){
        const want = Math.atan2(tgt.y-b.y, tgt.x-b.x);
        let diff = want - b.ang;
        while (diff > Math.PI) diff -= Math.PI*2;
        while (diff < -Math.PI) diff += Math.PI*2;
        b.ang += clamp(diff, -b.fx.homing*dt, b.fx.homing*dt);
        b.vx = Math.cos(b.ang)*b.speed; b.vy = Math.sin(b.ang)*b.speed;
      }
    }
    b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt;
    if (b.trail && Math.random() < 0.8){
      const col = b.trail === "fire" ? pick(["#ff9a3c","#ffd166","#ff5f2e"])
                : b.trail === "frost" ? pick(["#a9ecff","#dff6ff"])
                : b.trail === "void" ? pick(["#c08bff","#6a2fa0"])
                : b.trail === "smoke" ? pick(["#8a8a8a","#5c5c5c"]) : b.bc;
      particles.push({ x:b.x, y:b.y, vx:rand(-12,12), vy:rand(-12,12), life:rand(0.1,0.28),
        maxLife:0.28, color:col, size: b.trail==="beam"?2:1, glow: b.trail!=="smoke" });
    }
    let gone = b.life <= 0;
    if (!gone){
      for (const z of zombies){
        if (z.spawnT > 0 || b.hit.has(z)) continue;
        const rr = z.r + 3;
        if (dist2(b.x,b.y,z.x,z.y) <= rr*rr){
          b.hit.add(z);
          impactFx(b.x, b.y, b.bc);
          damageZombie(z, b.dmg, b.crit, b.px, b.py);
          if (b.fx){
            applyFx(z, b.fx, b.px, b.py);
            if (b.fx.explode) explode(b.x, b.y, b.fx.explode.radius, b.fx.explode.damage * S.damageMul, b.bc);
            if (b.fx.chain) chainLightning(z, b.dmg, b.fx.chain, b.hit);
          }
          if (b.fx && (b.fx.explode || b.fx.vortex)) gone = true;
          else if (b.pierce <= 0) gone = true;
          else b.pierce--;
          break;
        }
      }
    }
    if (gone || b.x<-30||b.x>WORLD_W+30||b.y<-30||b.y>WORLD_H+30 || b.life<=0){
      if (b.fx && b.life <= 0){
        if (b.fx.explode) explode(b.x, b.y, b.fx.explode.radius, b.fx.explode.damage * S.damageMul, b.bc);
        if (b.fx.vortex) spawnVortex(b.x, b.y, b.fx.vortex.radius, b.fx.vortex.dps * S.damageMul, b.fx.vortex.dur, b.fx.vortex.pull);
        if (b.fx.pool) spawnPool(b.x, b.y, b.fx.pool.radius, b.fx.pool.dps * S.damageMul, b.fx.pool.dur, "#9be04a");
      }
      bullets.splice(i,1);
    }
  }
}
function impactFx(x, y, color){
  if (!onScreen(x,y)) return;
  for (let i=0;i<3;i++){
    const a = rand(0,Math.PI*2), sp = rand(30,90);
    particles.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(0.06,0.16), maxLife:0.16,
      color: color || "#ffffff", size:1, glow:true });
  }
}

function updateAreas(dt){
  for (let i=pools.length-1;i>=0;i--){
    const p = pools[i];
    p.t -= dt; p.tick -= dt;
    if (p.tick <= 0){
      p.tick = 0.25;
      for (const z of zombies){
        if (z.spawnT > 0) continue;
        if (dist2(p.x,p.y,z.x,z.y) <= p.r*p.r) damageZombie(z, p.dps*0.25, false, p.x, p.y);
      }
    }
    if (Math.random() < 0.35) particles.push({ x:p.x+rand(-p.r,p.r), y:p.y+rand(-p.r*0.6,p.r*0.6),
      vx:0, vy:rand(-16,-4), life:0.5, maxLife:0.5, color:p.color, size:1, glow:true });
    if (p.t <= 0) pools.splice(i,1);
  }
  for (let i=vortexes.length-1;i>=0;i--){
    const v = vortexes[i];
    v.t -= dt; v.tick -= dt; v.spin += dt*7;
    for (const z of zombies){
      if (z.spawnT > 0 || z.kind === "boss") continue;
      const d = dist(v.x,v.y,z.x,z.y);
      if (d < v.r && d > 1){
        z.x += (v.x - z.x)/d * v.pull * dt;
        z.y += (v.y - z.y)/d * v.pull * dt;
      }
    }
    if (v.tick <= 0){
      v.tick = 0.25;
      for (const z of zombies){
        if (z.spawnT > 0) continue;
        if (dist2(v.x,v.y,z.x,z.y) <= v.r*v.r) damageZombie(z, v.dps*0.25, false, v.x, v.y);
      }
    }
    for (let k=0;k<2;k++){
      const a = rand(0,Math.PI*2), rr = rand(v.r*0.3, v.r);
      particles.push({ x:v.x+Math.cos(a)*rr, y:v.y+Math.sin(a)*rr*0.7,
        vx:(v.x-(v.x+Math.cos(a)*rr))*2.2, vy:(v.y-(v.y+Math.sin(a)*rr*0.7))*2.2,
        life:0.3, maxLife:0.3, color: pick(["#c08bff","#8a4fd0","#e0c0ff"]), size:1, glow:true });
    }
    if (v.t <= 0) vortexes.splice(i,1);
  }
  for (let i=arcs.length-1;i>=0;i--){ arcs[i].life -= dt; if (arcs[i].life<=0) arcs.splice(i,1); }
}

/* =========================================================
   11. KAMPF – Gegner
========================================================= */
function hurtPlayer(amount, srcX, srcY, knock){
  if (player.invuln > 0 || player.hp <= 0) return;
  if (Math.random() < S.dodge){
    player.invuln = 0.4;
    floaters.push({ x:player.x, y:player.y-14, vy:-24, life:0.6, maxLife:0.6, text:"AUSWEICH", color:"#7fd7ff", big:false });
    SFX.dodge();
    return;
  }
  const taken = Math.max(1, Math.round(amount * (1 - S.armorRed)));
  player.hp -= taken;
  player.invuln = 0.62;
  player.flash = 0.25;
  hitFlash = 0.32;
  shake = Math.max(shake, 4 + Math.min(5, taken/8));
  SFX.playerHurt();
  floaters.push({ x:player.x, y:player.y-14, vy:-28, life:0.7, maxLife:0.7, text:"-"+taken, color:"#ff6b6b", big:true });
  for (let i=0;i<8;i++){
    const a = rand(0,Math.PI*2), sp = rand(30,90);
    particles.push({ x:player.x, y:player.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
      life:rand(0.15,0.4), maxLife:0.4, color: pick(["#ff5468","#8e1c1c"]), size:2 });
  }
  if (knock && srcX != null){
    const d = dist(player.x,player.y,srcX,srcY) || 1;
    player.x = clamp(player.x + (player.x-srcX)/d*knock, player.r, WORLD_W-player.r);
    player.y = clamp(player.y + (player.y-srcY)/d*knock, player.r, WORLD_H-player.r);
  }
}
function enemyExplode(x, y, radius, dmg){
  booms.push({ x, y, r:4, maxR:radius, life:0.4, maxLife:0.4, color:"#ff6a2a" });
  shake = Math.max(shake, 5);
  SFX.explode();
  scorch(x, y, radius*0.5);
  for (let i=0;i<22;i++){
    const a = rand(0,Math.PI*2), sp = rand(50,180);
    particles.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(0.2,0.55), maxLife:0.55,
      color: pick(["#ff9a3c","#ff5f2e","#ffe08a","#6a6a6a"]), size:2, glow:true });
  }
  if (dist2(x,y,player.x,player.y) <= radius*radius) hurtPlayer(dmg, x, y, 10);
}
function enemyShoot(z, ang, o){
  o = o || {};
  ebullets.push({
    x:z.x + Math.cos(ang)*z.r, y:z.y + Math.sin(ang)*z.r*0.7,
    vx:Math.cos(ang)*(o.speed||160), vy:Math.sin(ang)*(o.speed||160),
    dmg:o.dmg || z.dmg, r:o.r || 4, color:o.color || "#c6ff4d",
    life:o.life || 3.4, pool:o.pool || null, trail:o.trail !== false,
  });
}
function bossSummon(z, count, kind){
  SFX.summon();
  for (let i=0;i<count;i++){
    if (zombies.length >= MAX_ALIVE) break;
    const a = rand(0,Math.PI*2), d = rand(24, 52);
    const at = { x: clamp(z.x + Math.cos(a)*d, 12, WORLD_W-12), y: clamp(z.y + Math.sin(a)*d, 12, WORLD_H-12) };
    spawnZombie(kind, { at, elite:false, hpMul:0.75 });
  }
  for (let i=0;i<18;i++){
    const a = rand(0,Math.PI*2), sp = rand(30,110);
    particles.push({ x:z.x, y:z.y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(0.25,0.6), maxLife:0.6,
      color: pick(["#8fffc0","#4fae7c","#c6ff4d"]), size:2, glow:true });
  }
}
function bossAbility(z, ab){
  const ai = z.ai;
  const angToP = Math.atan2(player.y - z.y, player.x - z.x);
  switch(ab.type){
    case "charge":
      ai.state = "tele"; ai.t = 0.85; ai.pending = "charge";
      SFX.charge();
      break;
    case "slam":
      ai.state = "tele"; ai.t = 0.7; ai.pending = "slam";
      SFX.charge();
      break;
    case "summon":
      bossSummon(z, ab.count, ab.kind);
      break;
    case "blink": {
      const a = rand(0,Math.PI*2), d = rand(60, 100);
      for (let i=0;i<16;i++){
        const aa = rand(0,Math.PI*2), sp = rand(40,130);
        particles.push({ x:z.x, y:z.y, vx:Math.cos(aa)*sp, vy:Math.sin(aa)*sp, life:0.4, maxLife:0.4,
          color:"#8fffc0", size:2, glow:true });
      }
      z.x = clamp(player.x + Math.cos(a)*d, 16, WORLD_W-16);
      z.y = clamp(player.y + Math.sin(a)*d, 16, WORLD_H-16);
      tone({ f:900, to:200, d:0.2, type:"triangle", v:0.06 });
      break;
    }
    case "nova":
      SFX.summon();
      for (let i=0;i<16;i++)
        enemyShoot(z, (Math.PI*2*i)/16, { speed:120, dmg:Math.round(z.dmg*0.5), color:"#8fffc0", r:4 });
      break;
    case "volley":
      SFX.spit();
      for (let i=0;i<ab.count;i++){
        const a = angToP + (i - (ab.count-1)/2) * 0.14;
        enemyShoot(z, a, { speed:180, dmg:Math.round(z.dmg*0.42), color:"#ff9a3c", r:4 });
      }
      break;
    case "spray":
      SFX.spit();
      for (let i=0;i<ab.count;i++){
        const a = angToP + rand(-0.55, 0.55);
        enemyShoot(z, a, { speed:rand(120,180), dmg:Math.round(z.dmg*0.4), color:"#9be04a", r:5,
          pool:{ radius:30, dps:14, dur:3.4 } });
      }
      break;
    case "mortar":
      SFX.mortar();
      for (let i=0;i<ab.count;i++){
        warns.push({ x: clamp(player.x + rand(-70,70), 12, WORLD_W-12),
                     y: clamp(player.y + rand(-56,56), 12, WORLD_H-12),
                     r: 30, t: 1.35 + i*0.16, max: 1.35 + i*0.16, dmg: Math.round(z.dmg*0.9) });
      }
      break;
  }
}
function updateBossAI(z, dt){
  const ai = z.ai, b = z.boss;
  if (!ai.enraged && z.hp < z.maxHp*0.38){
    ai.enraged = true;
    z.speed *= 1.28;
    showAlert(b.name + " IST WÜTEND");
    SFX.bossRoar();
    shake = Math.max(shake, 6);
  }
  if (ai.state === "tele"){
    ai.t -= dt;
    if (ai.t <= 0){
      if (ai.pending === "charge"){
        const a = Math.atan2(player.y - z.y, player.x - z.x);
        ai.dashX = Math.cos(a); ai.dashY = Math.sin(a);
        ai.state = "dash"; ai.t = 0.9;
        SFX.slam();
      } else {
        shocks.push({ x:z.x, y:z.y, r:6, maxR:150, speed:230, dmg:Math.round(z.dmg*1.1), hit:false });
        shake = Math.max(shake, 8); SFX.slam(); flashWhite = Math.max(flashWhite, 0.14);
        ai.state = "idle";
      }
    }
    return "hold";
  }
  if (ai.state === "dash"){
    ai.t -= dt;
    const sp = z.speed * 3.6;
    z.x = clamp(z.x + ai.dashX*sp*dt, z.r, WORLD_W-z.r);
    z.y = clamp(z.y + ai.dashY*sp*dt, z.r, WORLD_H-z.r);
    if (Math.random() < 0.7) particles.push({ x:z.x+rand(-z.r,z.r), y:z.y+z.r*0.6, vx:rand(-20,20), vy:rand(-30,-6),
      life:0.3, maxLife:0.3, color: pick(["#6b6b6b","#8a7a5a"]), size:2 });
    if (dist2(z.x,z.y,player.x,player.y) < (z.r+player.r)*(z.r+player.r)) hurtPlayer(z.dmg*1.5, z.x, z.y, 16);
    if (ai.t <= 0){
      ai.state = "idle";
      shocks.push({ x:z.x, y:z.y, r:6, maxR:96, speed:220, dmg:Math.round(z.dmg*0.7), hit:false });
      SFX.slam(); shake = Math.max(shake, 6);
    }
    return "hold";
  }
  const mul = ai.enraged ? 0.68 : 1;
  for (let i=0;i<b.abilities.length;i++){
    ai.cds[i] -= dt;
    if (ai.cds[i] <= 0){
      ai.cds[i] = b.abilities[i].cd * mul * rand(0.85,1.15);
      bossAbility(z, b.abilities[i]);
      break;
    }
  }
  return null;
}

function updateZombies(dt){
  for (let i=zombies.length-1;i>=0;i--){
    const z = zombies[i];
    if (z.spawnT > 0){ z.spawnT -= dt; continue; }

    if (z.burn){
      z.burn.t -= dt; z.burn.tick -= dt;
      if (z.burn.tick <= 0){ z.burn.tick = 0.3; damageZombie(z, z.burn.dps*0.3, false, z.x, z.y); }
      if (Math.random() < 0.4) particles.push({ x:z.x+rand(-4,4), y:z.y+rand(-6,2), vx:rand(-8,8), vy:rand(-30,-12),
        life:0.35, maxLife:0.35, color: pick(["#ff9a3c","#ffd166","#ff5f2e"]), size:1, glow:true });
      if (z.burn.t <= 0) z.burn = null;
      if (z.hp <= 0) continue;
    }
    if (z.slowT > 0){
      z.slowT -= dt;
      if (Math.random() < 0.18) particles.push({ x:z.x+rand(-5,5), y:z.y+rand(-6,4), vx:0, vy:rand(-10,-2),
        life:0.4, maxLife:0.4, color:"#a9ecff", size:1, glow:true });
    }
    if (z.hurtT > 0) z.hurtT -= dt;
    if (z.flash > 0) z.flash -= dt;

    let hold = null;
    if (z.kind === "boss") hold = updateBossAI(z, dt);
    if (hold === "hold"){ z.walkT += dt*4; continue; }

    const spd = z.speed * (z.slowT > 0 ? (1 - (z.slowAmt||0.4)) : 1);
    let dx = player.x - z.x, dy = player.y - z.y;
    const d = Math.hypot(dx,dy) || 1;
    dx/=d; dy/=d;
    const aimX = dx, aimY = dy;

    // Fernkämpfer / Beschwörer halten Abstand
    const keep = z.ranged ? z.ranged.keep : (z.spawner ? z.spawner.keep : (z.keep || 0));
    let moveScale = 1;
    if (keep > 0){
      if (d < keep*0.8){ dx = -dx; dy = -dy; moveScale = 0.9; }
      else if (d < keep*1.15) moveScale = 0;
    }

    let sx=0, sy=0;
    if (!z.ghost){
      for (const o of zombies){
        if (o===z || o.spawnT>0 || o.ghost) continue;
        const dd2 = dist2(z.x,z.y,o.x,o.y);
        const minD = z.r + o.r + 3;
        if (dd2 < minD*minD && dd2 > 0.001){
          const dd = Math.sqrt(dd2);
          const push = z.kind === "boss" ? 0.25 : 1;
          sx += (z.x-o.x)/dd*push; sy += (z.y-o.y)/dd*push;
        }
      }
    }
    const mx = dx*moveScale + sx*0.65, my = dy*moveScale + sy*0.65;
    const ml = Math.hypot(mx,my);
    if (ml > 0.001){
      z.x = clamp(z.x + (mx/ml)*spd*dt, z.r*0.5, WORLD_W - z.r*0.5);
      z.y = clamp(z.y + (my/ml)*spd*dt, z.r*0.5, WORLD_H - z.r*0.5);
      z.walkT += dt * spd * 0.16;
    } else z.walkT += dt*3;

    // Angriffe
    z.atkT -= dt;
    if (z.ranged && d < z.ranged.range && z.atkT <= 0){
      z.atkT = z.ranged.cd * rand(0.85,1.15);
      SFX.spit();
      enemyShoot(z, Math.atan2(aimY, aimX), {
        speed: z.ranged.speed, dmg: Math.round(z.dmg * z.ranged.dmg),
        color: z.ranged.color, r: z.ranged.r, pool: z.ranged.pool });
    }
    if (z.spawner && z.atkT <= 0 && zombies.length < MAX_ALIVE){
      z.atkT = z.spawner.cd * rand(0.85,1.15);
      bossSummon(z, z.spawner.count, z.spawner.kind);
    }

    // Nahkampf / Selbstzerstörung
    if (d <= z.r + player.r + 1){
      if (z.suicide){
        killZombie(z);
        continue;
      }
      if (player.invuln <= 0) hurtPlayer(z.dmg, z.x, z.y, 8);
    }
  }
}

function updateEBullets(dt){
  for (let i=ebullets.length-1;i>=0;i--){
    const b = ebullets[i];
    b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt;
    if (b.trail && Math.random() < 0.5)
      particles.push({ x:b.x, y:b.y, vx:rand(-8,8), vy:rand(-8,8), life:0.2, maxLife:0.2, color:b.color, size:1, glow:true });
    const rr = b.r + player.r;
    let gone = b.life <= 0 || b.x<0||b.x>WORLD_W||b.y<0||b.y>WORLD_H;
    if (!gone && dist2(b.x,b.y,player.x,player.y) <= rr*rr){
      hurtPlayer(b.dmg, b.x, b.y, 4);
      gone = true;
    }
    if (gone){
      if (b.pool) spawnPool(b.x, b.y, b.pool.radius, b.pool.dps, b.pool.dur, "#9be04a", true);
      impactFx(b.x, b.y, b.color);
      ebullets.splice(i,1);
    }
  }
}
function updateHazards(dt){
  for (let i=warns.length-1;i>=0;i--){
    const w = warns[i];
    w.t -= dt;
    if (w.t <= 0){
      enemyExplode(w.x, w.y, w.r + 8, w.dmg);
      warns.splice(i,1);
    }
  }
  for (let i=shocks.length-1;i>=0;i--){
    const s = shocks[i];
    s.r += s.speed*dt;
    if (!s.hit){
      const d = dist(s.x,s.y,player.x,player.y);
      if (d > s.r-10 && d < s.r+10){ hurtPlayer(s.dmg, s.x, s.y, 14); s.hit = true; }
    }
    if (s.r >= s.maxR) shocks.splice(i,1);
  }
  // Säure-Pfützen schaden auch dem Spieler
  for (const p of pools){
    if (p.enemy && dist2(p.x,p.y,player.x,player.y) <= p.r*p.r && player.invuln <= 0){
      hurtPlayer(Math.max(1, Math.round(p.dps*0.5)), p.x, p.y, 0);
    }
  }
}

/* =========================================================
   12. COINS, EFFEKTE, SPIELER
========================================================= */
function updateCoins(dt){
  const magnet = phase === "collect" ? 4000 : S.magnet;
  for (let i=coinDrops.length-1;i>=0;i--){
    const c = coinDrops[i];
    c.t += dt;
    if (c.settle > 0){
      c.x += c.vx*dt; c.y += c.vy*dt; c.vx *= 0.88; c.vy *= 0.88; c.settle -= dt;
      c.x = clamp(c.x, 6, WORLD_W-6); c.y = clamp(c.y, 6, WORLD_H-6);
    }
    const d = dist(c.x, c.y, player.x, player.y);
    if (d < magnet){
      const pull = phase === "collect" ? 420 : 230;
      c.x += (player.x-c.x)/(d||1) * pull*dt;
      c.y += (player.y-c.y)/(d||1) * pull*dt;
    }
    if (d < player.r + 7){
      run.coins += c.val;
      SFX.coin();
      floaters.push({ x:c.x, y:c.y-4, vy:-32, life:0.55, maxLife:0.55, text:"+"+c.val, color:"#ffce54", big:false });
      for (let k=0;k<3;k++) particles.push({ x:c.x, y:c.y, vx:rand(-30,30), vy:rand(-50,-10),
        life:0.25, maxLife:0.25, color:"#ffe08a", size:1, glow:true });
      coinDrops.splice(i,1);
    }
  }
}

function updateEffects(dt){
  for (let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= 0.9; p.vy *= 0.9; p.life -= dt;
    if (p.life <= 0) particles.splice(i,1);
  }
  for (let i=floaters.length-1;i>=0;i--){
    const f = floaters[i];
    f.y += f.vy*dt; f.vy *= 0.92; f.life -= dt;
    if (f.life <= 0) floaters.splice(i,1);
  }
  for (let i=booms.length-1;i>=0;i--){
    const b = booms[i];
    b.life -= dt;
    b.r = b.maxR * (1 - Math.pow(b.life/b.maxLife, 1.6));
    if (b.life <= 0) booms.splice(i,1);
  }
  for (let i=portals.length-1;i>=0;i--){
    portals[i].t -= dt;
    if (portals[i].t <= 0) portals.splice(i,1);
  }
  // Umgebungspartikel (Asche)
  if (Math.random() < 0.5){
    particles.push({ x: cam.x + rand(0,VIEW_W), y: cam.y + rand(0,VIEW_H),
      vx: rand(-6,6), vy: rand(-14,-4), life: rand(1.2,2.4), maxLife:2.4,
      color: pick(["#5a5040","#6b5f4a","#3f3a30"]), size:1 });
  }
  if (shake > 0) shake = Math.max(0, shake - dt*24);
  if (hitFlash > 0) hitFlash -= dt;
  if (flashWhite > 0) flashWhite -= dt*1.6;
}

function updatePlayer(dt){
  const kb = keyboardVector();
  const ix = kb.x || input.x, iy = kb.y || input.y;
  const mag = Math.hypot(ix,iy);
  if (mag > 0.001){
    const sp = S.moveSpeed * Math.min(1, mag);
    player.x += (ix/mag)*sp*dt;
    player.y += (iy/mag)*sp*dt;
    player.walkT += dt * 9 * Math.min(1,mag);
    if (!nearestZombie(player.x, player.y, 420)){ player.faceX = ix/mag; player.faceY = iy/mag; }
    player.dustT -= dt;
    if (player.dustT <= 0){
      player.dustT = 0.1;
      particles.push({ x: player.x - (ix/mag)*4, y: player.y + player.r*0.75,
        vx: -(ix/mag)*rand(10,26), vy: rand(-14,-2), life:0.3, maxLife:0.3,
        color: pick(["#5a5342","#6b6350","#463f33"]), size:1 });
    }
  }
  player.x = clamp(player.x, player.r, WORLD_W - player.r);
  player.y = clamp(player.y, player.r, WORLD_H - player.r);
  if (player.invuln > 0) player.invuln -= dt;
  if (player.flash > 0) player.flash -= dt;
  if (S.regen > 0 && player.hp > 0 && player.hp < S.maxHp) player.hp = Math.min(S.maxHp, player.hp + S.regen*dt);
}

function updateCamera(dt){
  const tx = camTargetX(), ty = camTargetY();
  const k = Math.min(1, dt*7);
  cam.x += (tx - cam.x)*k;
  cam.y += (ty - cam.y)*k;
  cam.x = clamp(cam.x, 0, WORLD_W - VIEW_W);
  cam.y = clamp(cam.y, 0, WORLD_H - VIEW_H);
}

/* =========================================================
   13. HAUPTSCHLEIFE
========================================================= */
function frame(t){
  if (!running) return;
  requestAnimationFrame(frame);
  let dt = Math.min((t - lastT)/1000, 0.05) || 0;
  lastT = t;

  joyWatchdog();
  const active = !paused && (phase === "wave" || phase === "collect");
  if (active){
    if (hitStop > 0){ hitStop -= dt; dt *= 0.25; }
    updatePlayer(dt);
    updateWeapons(dt);
    updatePets(dt);
    updateWaveSpawning(dt);
    updateBullets(dt);
    updateEBullets(dt);
    updateZombies(dt);
    updateAreas(dt);
    updateHazards(dt);
    updateCoins(dt);
    updateEffects(dt);
    updateCamera(dt);
    updateMusic(dt, run.wave, wave && wave.isBoss);
    run.hp = player.hp;
    updateHud();

    if (phase === "collect"){
      collectT -= dt;
      el("collectText").innerHTML = "Coins einsammeln… <b>" + Math.max(0, collectT).toFixed(1) + "s</b>";
      if (collectT <= 0) endCollectPhase();
    }
    autosaveT += dt;
    if (autosaveT > 8){ autosaveT = 0; saveGame(); }
    if (player.hp <= 0){ onGameOver(); return; }
  } else if (!paused){
    updateEffects(dt);
  }
  draw();
}

/* =========================================================
   14. RENDERING
========================================================= */
function drawSprite(set, frameIdx, x, y, flip, white, scale, alpha){
  const spr = (white ? set.w : set.f)[frameIdx];
  const s = scale || 1;
  const w = spr.width*s, h = spr.height*s;
  const dx = Math.round(x - w/2), dy = Math.round(y - h*0.72);
  if (alpha != null) ctx.globalAlpha = alpha;
  if (flip){
    ctx.save();
    ctx.translate(dx + w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(spr, 0, 0, w, h);
    ctx.restore();
  } else ctx.drawImage(spr, dx, dy, w, h);
  if (alpha != null) ctx.globalAlpha = 1;
}
function shadow(x, y, r, a){
  const al = a == null ? 0.34 : a;
  ctx.save();
  ctx.translate(x, y + r*0.78);
  ctx.scale(1, 0.38);
  const g = ctx.createRadialGradient(0,0,r*0.2, 0,0, r*0.95);
  g.addColorStop(0, "rgba(0,0,0,"+al+")");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0,0,r*0.95,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
/* Vier-Phasen-Laufzyklus aus zwei Einzelbildern: das Auf und Ab zwischen den
   Bildern macht die Bewegung flüssiger, ohne zusätzliche Pixelarbeit. */
function walkBob(t){ return [0, -0.6, 0, 0.4][Math.floor(t*2) % 4]; }

const PLAYER_SCALE = 1.4;
function drawPlayer(){
  shadow(player.x, player.y, player.r);
  const frame = Math.floor(player.walkT) % 2;
  const blink = player.invuln > 0 && Math.floor(player.invuln*22) % 2 === 0;
  if (!blink) drawSprite(SPRITES.player, frame, player.x, player.y + walkBob(player.walkT),
                         player.faceX < 0, player.flash > 0, PLAYER_SCALE);
  const ang = Math.atan2(player.faceY, player.faceX);
  ctx.save();
  ctx.translate(Math.round(player.x), Math.round(player.y));
  ctx.rotate(ang);
  ctx.fillStyle = "#2b3242"; ctx.fillRect(3, -1, 9, 3);
  ctx.fillStyle = "#4a5568"; ctx.fillRect(3, -1, 9, 1);
  ctx.restore();
  if (run.equipped.shield.length){
    const t = performance.now()/620;
    for (let i=0;i<run.equipped.shield.length;i++){
      const a = t + i*Math.PI;
      const sx = player.x + Math.cos(a)*14, sy = player.y + Math.sin(a)*9;
      ctx.fillStyle = "#8fa6c8"; ctx.fillRect(Math.round(sx)-2, Math.round(sy)-3, 4, 6);
      ctx.fillStyle = "#c8d8f0"; ctx.fillRect(Math.round(sx)-2, Math.round(sy)-3, 4, 2);
    }
  }
}

function drawZombie(z){
  const set = SPRITES[z.spr] || SPRITES.walker;
  const frame = Math.floor(z.walkT) % 2;
  const scale = (2.3 * z.r) / set.h;
  if (z.spawnT > 0) return;
  shadow(z.x, z.y, z.r, z.ghost ? 0.16 : 0.32);
  if (z.elite){
    ctx.strokeStyle = "rgba(255,201,77,.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(z.x, z.y + z.r*0.75, z.r*1.1, z.r*0.45, 0, 0, Math.PI*2); ctx.stroke();
  }
  const alpha = z.ghost ? 0.68 : null;
  const by = z.y + walkBob(z.walkT);
  drawSprite(set, frame, z.x, by, player.x < z.x, false, scale, alpha);
  if (z.flash > 0){
    drawSprite(set, frame, z.x, by, player.x < z.x, true, scale, clamp(z.flash/0.09,0,1)*0.7);
  }
  if (z.burn){
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255,120,40,.18)";
    ctx.beginPath(); ctx.arc(z.x, z.y - z.r*0.3, z.r*1.2, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
  if (z.slowT > 0){
    ctx.fillStyle = "rgba(150,225,255,.18)";
    ctx.beginPath(); ctx.arc(z.x, z.y - z.r*0.3, z.r*1.1, 0, Math.PI*2); ctx.fill();
  }
  if (z.kind !== "boss" && z.hp < z.maxHp){
    const w = Math.max(11, z.r*2);
    const top = Math.round(z.y - z.r*1.95);
    ctx.fillStyle = "rgba(0,0,0,.6)";
    ctx.fillRect(Math.round(z.x-w/2)-1, top-1, w+2, 4);
    ctx.fillStyle = z.elite ? "#ffc94d" : "#ff5d7a";
    ctx.fillRect(Math.round(z.x-w/2), top, Math.round(w*clamp(z.hp/z.maxHp,0,1)), 2);
  }
  // Boss-Telegraph
  if (z.kind === "boss" && z.ai && z.ai.state === "tele"){
    const p = 1 - z.ai.t / (z.ai.pending === "charge" ? 0.85 : 0.7);
    ctx.globalCompositeOperation = "lighter";
    if (z.ai.pending === "charge"){
      const a = Math.atan2(player.y-z.y, player.x-z.x);
      ctx.strokeStyle = "rgba(255,84,104,"+(0.25+0.4*p)+")";
      ctx.lineWidth = 4 + p*4;
      ctx.beginPath(); ctx.moveTo(z.x, z.y); ctx.lineTo(z.x + Math.cos(a)*220, z.y + Math.sin(a)*220); ctx.stroke();
    } else {
      ctx.strokeStyle = "rgba(255,154,60,"+(0.3+0.5*p)+")";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(z.x, z.y, 20 + p*130, 0, Math.PI*2); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawPet(p){
  shadow(p.x, p.y, 5);
  const frame = Math.floor(p.walkT) % 2;
  const bob = Math.sin(p.walkT*1.4) * 0.9;
  drawSprite(p.spr, frame, p.x, p.y + bob, player.x < p.x, false, 1.35);
}

function drawGroundFx(){
  for (const p of pools){
    const a = clamp(p.t/p.max, 0, 1);
    ctx.globalAlpha = 0.32 * a + 0.12;
    ctx.fillStyle = p.enemy ? "#7fbf2a" : p.color;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r*0.62, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(190,255,110,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r*0.62, 0, 0, Math.PI*2); ctx.stroke();
  }
  for (const w of warns){
    const p = 1 - w.t/w.max;
    ctx.strokeStyle = "rgba(255,84,104,"+(0.35+0.5*p)+")"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r*0.62, 0, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = "rgba(255,84,104,"+(0.08+0.18*p)+")";
    ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r*p, w.r*0.62*p, 0, 0, Math.PI*2); ctx.fill();
  }
  for (const v of vortexes){
    const a = clamp(v.t/v.max, 0, 1);
    ctx.fillStyle = "rgba(28,6,48,"+(0.4*a)+")";
    ctx.beginPath(); ctx.ellipse(v.x, v.y, v.r, v.r*0.62, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    for (let k=0;k<3;k++){
      ctx.strokeStyle = "rgba(170,110,255,"+(0.13*a)+")";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(v.x, v.y, v.r*(0.4+k*0.24), v.r*0.62*(0.4+k*0.24), 0, v.spin+k, v.spin+k+2.1); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(12,0,22,"+(0.7*a)+")";
    ctx.beginPath(); ctx.ellipse(v.x, v.y, 9*a+3, (9*a+3)*0.7, 0, 0, Math.PI*2); ctx.fill();
  }
  for (const p of portals){
    const k = p.t/p.max;
    ctx.strokeStyle = p.boss ? "rgba(255,84,104,"+(0.7*k)+")" : "rgba(140,255,150,"+(0.5*k)+")";
    ctx.lineWidth = p.boss ? 3 : 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r*(1.1-k*0.5), p.r*0.6*(1.1-k*0.5), 0, 0, Math.PI*2); ctx.stroke();
  }
}

function drawBullets(){
  ctx.globalCompositeOperation = "lighter";
  for (const b of bullets){
    if (!onScreen(b.x, b.y, 24)) continue;
    ctx.strokeStyle = b.bc; ctx.globalAlpha = 0.3; ctx.lineWidth = Math.max(1, b.bh-1);
    ctx.beginPath(); ctx.moveTo(b.px, b.py); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(Math.round(b.x), Math.round(b.y));
    ctx.rotate(b.ang);
    ctx.fillStyle = b.bc;
    ctx.fillRect(-b.bw/2, -b.bh/2, b.bw, b.bh);
    if (b.crit){ ctx.fillStyle = "rgba(255,211,93,.55)"; ctx.fillRect(-b.bw/2-1, -b.bh/2-1, b.bw+2, b.bh+2); }
    ctx.restore();
  }
  ctx.globalCompositeOperation = "source-over";
  for (const b of ebullets){
    if (!onScreen(b.x, b.y, 24)) continue;
    ctx.fillStyle = "rgba(20,6,10,.85)";
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r+1.6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.beginPath(); ctx.arc(b.x-b.r*0.32, b.y-b.r*0.32, b.r*0.38, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalCompositeOperation = "lighter";
  for (const a of arcs){
    const k = a.life/a.maxLife;
    ctx.strokeStyle = "rgba(190,235,255,"+k+")"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x1, a.y1);
    const segs = 4;
    for (let i=1;i<segs;i++){
      const tt = i/segs;
      ctx.lineTo(a.x1 + (a.x2-a.x1)*tt + rand(-5,5), a.y1 + (a.y2-a.y1)*tt + rand(-5,5));
    }
    ctx.lineTo(a.x2, a.y2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawCoins(){
  for (const c of coinDrops){
    if (!onScreen(c.x, c.y, 16)) continue;
    const bob = Math.sin(c.t*4)*1.6;
    const w = Math.max(1, Math.round(5*Math.abs(Math.cos(c.t*3.2))));
    const x = Math.round(c.x), y = Math.round(c.y + bob);
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x - w/2 - 1, y - 3, w + 2, 8);
    ctx.fillStyle = "#8a5b12"; ctx.fillRect(x - w/2, y - 2, w, 6);
    ctx.fillStyle = "#ffce54"; ctx.fillRect(x - w/2, y - 3, w, 6);
    ctx.fillStyle = "#fff6d0"; ctx.fillRect(x - w/2, y - 3, Math.max(1, Math.round(w/2)), 2);
  }
}

function drawEffects(){
  ctx.globalCompositeOperation = "lighter";
  for (const b of booms){
    const a = clamp(b.life/b.maxLife, 0, 1);
    const col = b.color || "#ffb03a";
    if (b.soft){
      ctx.fillStyle = "rgba(255,240,190,"+(a*0.5)+")";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.maxR*(1.2-a*0.4), 0, Math.PI*2); ctx.fill();
    } else {
      ctx.strokeStyle = col; ctx.globalAlpha = a*0.9; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = a*0.3;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r*0.78, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  for (const s of shocks){
    ctx.strokeStyle = "rgba(255,190,120,.75)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r-3, 0, Math.PI*2); ctx.stroke();
  }
  for (const p of particles){
    if (!p.glow) continue;
    ctx.globalAlpha = clamp(p.life/p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    const s = p.size || 2;
    ctx.fillRect(Math.round(p.x)-s/2, Math.round(p.y)-s/2, s, s);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  for (const p of particles){
    if (p.glow) continue;
    ctx.globalAlpha = clamp(p.life/p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    const s = p.size || 2;
    ctx.fillRect(Math.round(p.x)-s/2, Math.round(p.y)-s/2, s, s);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
  for (const f of floaters){
    const a = clamp(f.life/f.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.font = (f.big ? "bold 10px " : "9px ") + "monospace";
    ctx.fillStyle = "#000";
    ctx.fillText(f.text, Math.round(f.x)+1, Math.round(f.y)+1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

const DBG = { ground:1, decal:1, groundFx:1, coins:1, entities:1, bullets:1, effects:1 };
function draw(){
  const cx = Math.round(cam.x), cy = Math.round(cam.y);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,VIEW_W*SS,VIEW_H*SS);

  let ox = 0, oy = 0;
  if (shake > 0.1){ ox = rand(-shake,shake); oy = rand(-shake,shake); }
  // Welt-Transform: Weltkoordinaten -> Gerätepixel (Faktor SS)
  ctx.setTransform(SS,0,0,SS, Math.round((-cx+ox)*SS), Math.round((-cy+oy)*SS));

  if (DBG.ground) ctx.drawImage(groundCv, cx*SS, cy*SS, VIEW_W*SS, VIEW_H*SS, cx, cy, VIEW_W, VIEW_H);
  if (DBG.decal) ctx.drawImage(decalCv,  cx*SS, cy*SS, VIEW_W*SS, VIEW_H*SS, cx, cy, VIEW_W, VIEW_H);
  if (DBG.groundFx) drawGroundFx();
  if (DBG.coins) drawCoins();

  const drawables = [];
  for (const z of zombies) if (onScreen(z.x, z.y, 40)) drawables.push({ e:z, k:0, y:z.y });
  for (const p of pets) drawables.push({ e:p, k:1, y:p.y });
  if (player && !player.dead) drawables.push({ e:player, k:2, y:player.y });
  drawables.sort((a,b)=>a.y-b.y);
  if (DBG.entities) for (const d of drawables){
    if (d.k === 0) drawZombie(d.e);
    else if (d.k === 1) drawPet(d.e);
    else drawPlayer();
  }

  if (DBG.bullets) drawBullets();
  if (DBG.effects) drawEffects();

  // Bildschirm-Overlays in Weltpixel-Maßstab, aber ohne Kameraversatz
  ctx.setTransform(SS,0,0,SS,0,0);
  if (flashWhite > 0){
    ctx.fillStyle = "rgba(255,245,220,"+clamp(flashWhite,0,0.3)+")";
    ctx.fillRect(0,0,VIEW_W,VIEW_H);
  }
  if (hitFlash > 0){
    ctx.fillStyle = "rgba(255,0,0,"+clamp(hitFlash*0.5,0,0.32)+")";
    ctx.fillRect(0,0,VIEW_W,VIEW_H);
  }
  if (phase === "collect"){
    ctx.fillStyle = "rgba(78,224,138,.05)";
    ctx.fillRect(0,0,VIEW_W,VIEW_H);
  }
  // Farbstimmung: wechselt alle fünf Wellen, Bosswellen kippen ins Rote
  const tint = waveTint();
  if (tint){ ctx.fillStyle = tint; ctx.fillRect(0,0,VIEW_W,VIEW_H); }
  // Vignette
  const vg = ctx.createRadialGradient(VIEW_W/2, VIEW_H/2, VIEW_H*0.36, VIEW_W/2, VIEW_H/2, VIEW_H*0.88);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,.30)");
  ctx.fillStyle = vg;
  ctx.fillRect(0,0,VIEW_W,VIEW_H);
  ctx.setTransform(1,0,0,1,0,0);
}

const TINTS = [
  null,                          // klarer Tag
  "rgba(70,60,120,.10)",         // Dämmerung
  "rgba(120,80,40,.09)",         // Staubsturm
  "rgba(30,60,90,.12)",          // Nacht
  "rgba(60,90,60,.08)",          // Nebel
];
function waveTint(){
  if (!run) return null;
  if (wave && wave.isBoss) return "rgba(120,20,30,.12)";
  return TINTS[Math.floor((run.wave-1)/5) % TINTS.length];
}

/* =========================================================
   15. HUD
========================================================= */
let hpGhostT = 0;
function updateHud(){
  const hpPct = clamp(player.hp/S.maxHp,0,1)*100;
  el("hpFill").style.width = hpPct + "%";
  const ghost = el("hpGhost");
  if (parseFloat(ghost.style.width||"100") < hpPct) ghost.style.width = hpPct + "%";
  else { hpGhostT -= 1/60; if (hpGhostT <= 0){ ghost.style.width = hpPct + "%"; } }
  if (parseFloat(ghost.style.width||"100") > hpPct + 0.5 && hpGhostT <= 0) hpGhostT = 0.35;
  el("hpNum").textContent = Math.max(0,Math.round(player.hp)) + " / " + S.maxHp;
  const need = xpForLevel(run.level);
  el("xpFill").style.width = clamp(run.xp/need,0,1)*100 + "%";
  el("xpText").textContent = run.xp + " / " + need + " XP";
  el("lvlInline").textContent = run.level;
  el("waveNum").textContent = run.wave;
  if (wave){
    const left = Math.max(0, wave.totalToSpawn - wave.spawned) + zombies.length;
    const done = clamp(1 - left / Math.max(1, wave.totalToSpawn), 0, 1);
    el("waveFill").style.width = (done*100) + "%";
    el("waveLeft").textContent = phase === "collect" ? "Welle geschafft" : left + " übrig";
  }
  el("lvlText").textContent = run.level;
  el("coinText").textContent = run.coins;

  const boss = zombies.find(z => z.kind === "boss");
  const wrap = el("bossWrap");
  if (boss){
    wrap.classList.remove("hidden");
    el("bossName").textContent = boss.name + (boss.ai && boss.ai.enraged ? " · WÜTEND" : "");
    el("bossTag").textContent = boss.boss.tag;
    el("bossFill").style.width = clamp(boss.hp/boss.maxHp,0,1)*100 + "%";
    el("bossGhost").style.width = clamp(boss.hp/boss.maxHp,0,1)*100 + "%";
  } else wrap.classList.add("hidden");

  for (const w of weaponBarEls){
    const it = w.item;
    const k = it.cdMax ? clamp(1 - (it.timer||0)/it.cdMax, 0, 1) : 1;
    w.cd.style.height = Math.round(k*100) + "%";
  }
  drawMiniMap();
}

function drawMiniMap(){
  const g = miniCtx, W = miniCv.width, H = miniCv.height;
  g.clearRect(0,0,W,H);
  g.fillStyle = "#12180f"; g.fillRect(0,0,W,H);
  g.fillStyle = "rgba(255,255,255,.05)";
  for (let i=0;i<W;i+=13) g.fillRect(i,0,1,H);
  for (let i=0;i<H;i+=13) g.fillRect(0,i,W,1);
  // Kamera-Ausschnitt
  g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 1;
  g.strokeRect(Math.round(cam.x*MINI_SX)+0.5, Math.round(cam.y*MINI_SY)+0.5,
               Math.round(VIEW_W*MINI_SX), Math.round(VIEW_H*MINI_SY));
  for (const c of coinDrops){ g.fillStyle = "#ffce54"; g.fillRect(c.x*MINI_SX, c.y*MINI_SY, 1, 1); }
  for (const z of zombies){
    if (z.kind === "boss"){ g.fillStyle = "#ff4d4d"; g.fillRect(z.x*MINI_SX-2, z.y*MINI_SY-2, 5, 5); }
    else if (z.elite){ g.fillStyle = "#ffc94d"; g.fillRect(z.x*MINI_SX-1, z.y*MINI_SY-1, 3, 3); }
    else { g.fillStyle = "#c9484f"; g.fillRect(z.x*MINI_SX-1, z.y*MINI_SY-1, 2, 2); }
  }
  g.fillStyle = "#4ee08a";
  g.fillRect(player.x*MINI_SX-2, player.y*MINI_SY-2, 4, 4);
  g.fillStyle = "#ffffff";
  g.fillRect(player.x*MINI_SX-1, player.y*MINI_SY-1, 2, 2);
}

let weaponBarEls = [];
function updateWeaponBar(){
  const bar = el("weaponBar");
  if (!bar) return;
  bar.innerHTML = "";
  weaponBarEls = [];
  run.equipped.weapon.forEach(it => {
    const def = DEF(it.defId);
    if (!def) return;
    const d = document.createElement("div");
    d.className = "wSlot hudPanel r" + def.rarity;
    d.innerHTML = `<span>${def.icon}</span><div class="cd"></div>` + ((it.lvl||1) > 1 ? `<span class="lv">+${(it.lvl||1)-1}</span>` : "");
    bar.appendChild(d);
    weaponBarEls.push({ item: it, cd: d.querySelector(".cd") });
  });
}

function showWaveBanner(n, isBoss){
  const b = el("waveBanner");
  b.querySelector(".big").textContent = "WELLE " + n;
  b.querySelector(".small").textContent = isBoss ? "BOSS-WELLE" : "ÜBERLEBE";
  b.classList.toggle("boss", !!isBoss);
  b.classList.remove("show"); void b.offsetWidth; b.classList.add("show");
}
function showAlert(text){
  const a = el("alertLine");
  a.textContent = text;
  a.classList.remove("show"); void a.offsetWidth; a.classList.add("show");
}

/* =========================================================
   16. ITEM-UI
========================================================= */
function modLines(def, lvl){
  const out = [];
  if (def.weapon){
    const w = weaponStats(def, lvl);
    let dps = w.damage * w.rate * w.projectiles;
    if (w.fx && w.fx.explode) dps += w.fx.explode.damage * w.rate;
    if (w.fx && w.fx.burn) dps += w.fx.burn.dps * 0.7;
    out.push({ t:"Schaden "+fmtNum(w.damage,1), c:"neutral" });
    out.push({ t:"Feuerrate "+fmtNum(w.rate,2)+"/s", c:"neutral" });
    out.push({ t:"Reichweite "+Math.round(w.range), c:"neutral" });
    if (w.projectiles > 1) out.push({ t:w.projectiles+" Projektile", c:"neutral" });
    if (w.pierce) out.push({ t:"Durchschlag "+(w.pierce>50?"∞":w.pierce), c:"neutral" });
    if (w.fx){
      if (w.fx.explode) out.push({ t:"💥 Explosion "+Math.round(w.fx.explode.damage), c:"spec" });
      if (w.fx.burn)    out.push({ t:"🔥 Brand "+Math.round(w.fx.burn.dps)+"/s ("+fmtNum(w.fx.burn.dur,1)+"s)", c:"spec" });
      if (w.fx.slow)    out.push({ t:"❄️ Verlangsamt "+Math.round(w.fx.slow.amount*100)+"%", c:"spec" });
      if (w.fx.chain)   out.push({ t:"⚡ Kette auf "+w.fx.chain.jumps, c:"spec" });
      if (w.fx.pool)    out.push({ t:"🧪 Pfütze "+Math.round(w.fx.pool.dps)+"/s", c:"spec" });
      if (w.fx.vortex)  out.push({ t:"🕳️ Wirbel "+Math.round(w.fx.vortex.dps)+"/s", c:"spec" });
      if (w.fx.homing)  out.push({ t:"🎯 Zielsuchend", c:"spec" });
    }
    out.push({ t:"≈ "+Math.round(dps)+" DPS", c:"pos" });
  }
  if (def.pet){
    const p = petStats(def, lvl);
    out.push({ t:"Begleiter "+fmtNum(p.damage,1)+" Schaden", c:"neutral" });
    out.push({ t:fmtNum(p.rate,2)+" Schuss/s", c:"neutral" });
    out.push({ t:"Reichweite "+p.range, c:"neutral" });
    if (p.fx && p.fx.burn) out.push({ t:"🔥 Gift/Brand "+Math.round(p.fx.burn.dps)+"/s", c:"spec" });
    if (p.fx && p.fx.slow) out.push({ t:"❄️ Verlangsamt", c:"spec" });
  }
  const mods = itemMods(def, lvl);
  for (const k in mods){
    const v = mods[k];
    if (!v) continue;
    const info = STAT_INFO[k];
    if (!info) continue;
    out.push({ t:(v>0?"+":"") + fmtNum(v,1) + info.u + " " + info.n, c: v>0 ? "pos" : "neg" });
  }
  return out;
}
function itemCardHTML(def, opts){
  opts = opts || {};
  const lvl = opts.lvl || 1;
  const lines = modLines(def, lvl).map(l => `<span class="mod ${l.c}">${l.t}</span>`).join("");
  return `
    <div class="card r${def.rarity} ${opts.sold?"sold":""}">
      <div class="cIcon">${def.icon}</div>
      <div class="cBody">
        <div class="cTop">
          <span class="cName">${def.name}</span>
          ${lvl>1 ? `<span class="lvlBadge">+${lvl-1}</span>` : ""}
          <span class="cMeta r${def.rarity}">${RARITY_NAMES[def.rarity]}</span>
          <span class="cSlot">· ${SLOT_NAMES[def.slot]}</span>
        </div>
        ${def.desc ? `<div class="cDesc">${def.desc}</div>` : ""}
        <div class="cStats">${lines}</div>
      </div>
      ${opts.action ? `<div class="cAction">${opts.action}</div>` : ""}
    </div>`;
}

/* =========================================================
   17. SHOP
========================================================= */
let offers = [], rerollCost = 8, shopTab = "offers";

function rollRarity(){
  const w = run.wave, luck = S ? S.luck : 0;
  const weights = [
    Math.max(8, 100 - w*5.5 - luck*0.45),
    28 + w*2.2 + luck*0.3,
    Math.max(0, w*1.7 - 3) + luck*0.32,
    Math.max(0, w*0.85 - 8) + luck*0.22,
  ];
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for (let i=0;i<weights.length;i++){ r -= weights[i]; if (r <= 0) return i; }
  return 0;
}
function priceFor(def){ return Math.max(5, Math.round(def.price * (1 + run.wave*0.045))); }
function rollOffers(count){
  const list = [], used = new Set();
  let guard = 0;
  // Mindestens zwei Waffen im Angebot, damit Fusionen möglich bleiben
  while (list.length < count && guard++ < 500){
    const wantWeapon = list.filter(o => DEF(o.defId).slot === "weapon").length < 2 && list.length < count-1;
    const rar = rollRarity();
    let pool = ITEM_LIST.filter(d => d.rarity === rar && !used.has(d.id) && (!wantWeapon || d.slot === "weapon"));
    if (!pool.length) pool = ITEM_LIST.filter(d => d.rarity === rar && !used.has(d.id));
    if (!pool.length) continue;
    const def = pick(pool);
    used.add(def.id);
    list.push({ defId: def.id, price: priceFor(def), sold:false });
  }
  // Kleine Chance auf ein Duplikat für sofortige Fusion
  if (list.length && Math.random() < 0.35){
    const src = pick(list.filter(o => !o.sold));
    if (src) list[randInt(0,list.length-1)] = { defId: src.defId, price: src.price, sold:false };
  }
  return list;
}

function slotFree(slot){ return run.equipped[slot].length < SLOT_CAPS[slot]; }
function sellValue(item){ return Math.max(1, Math.floor(item.price * 0.5)); }

function equipItem(defId, price, lvl){
  const def = DEF(defId);
  run.equipped[def.slot].push(mkItem(defId, price, lvl));
  refreshStats();
  saveGame();
}
function sellItem(slot, uid){
  const arr = run.equipped[slot];
  const idx = arr.findIndex(i => i.uid === uid);
  if (idx < 0) return 0;
  const val = sellValue(arr[idx]);
  arr.splice(idx,1);
  run.coins += val;
  refreshStats();
  saveGame();
  SFX.sell();
  return val;
}
function tryAcquire(defId, price, onDone){
  const def = DEF(defId);
  if (slotFree(def.slot)){
    equipItem(defId, price);
    if (onDone) onDone(true);
    return true;
  }
  pendingBuy = { defId, price, onDone };
  openReplace(def);
  return false;
}
function openReplace(def){
  const list = el("replaceList");
  el("replaceSub").textContent = `Alle ${SLOT_NAMES[def.slot]}-Slots sind belegt. Wähle ein Item, das ${def.name} weichen soll — es wird für 50% verkauft.`;
  list.innerHTML = run.equipped[def.slot].map(it => {
    const d = DEF(it.defId);
    return itemCardHTML(d, { lvl:it.lvl, action:`<button class="actBtn sell" data-uid="${it.uid}">Ersetzen<br>+🪙 ${sellValue(it)}</button>` });
  }).join("");
  list.querySelectorAll("button[data-uid]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const uid = parseInt(btn.dataset.uid,10);
      const def2 = DEF(pendingBuy.defId);
      sellItem(def2.slot, uid);
      equipItem(pendingBuy.defId, pendingBuy.price);
      SFX.buy();
      const cb = pendingBuy.onDone;
      pendingBuy = null;
      el("replaceOverlay").classList.add("hidden");
      if (cb) cb(true);
    });
  });
  el("replaceOverlay").classList.remove("hidden");
}
el("replaceCancel").addEventListener("click", ()=>{
  const cb = pendingBuy && pendingBuy.onDone;
  pendingBuy = null;
  el("replaceOverlay").classList.add("hidden");
  if (cb) cb(false);
});

function renderOffers(){
  const wrap = el("offerList");
  wrap.innerHTML = offers.map((o, i) => {
    const def = DEF(o.defId);
    const canPay = run.coins >= o.price;
    const action = o.sold
      ? `<button class="actBtn" disabled>Gekauft</button>`
      : `<button class="actBtn" data-buy="${i}" ${canPay?"":"disabled"}>🪙 ${o.price}</button>`;
    return itemCardHTML(def, { action, sold:o.sold });
  }).join("");
  wrap.querySelectorAll("button[data-buy]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const i = parseInt(btn.dataset.buy,10);
      const o = offers[i];
      if (!o || o.sold || run.coins < o.price) return;
      run.coins -= o.price;
      const ok = tryAcquire(o.defId, o.price, (done)=>{
        if (!done) run.coins += o.price; else o.sold = true;
        renderShop();
      });
      if (ok){ o.sold = true; SFX.buy(); renderShop(); }
    });
  });
  el("rerollBtn").textContent = `🎲 Neu würfeln (🪙 ${rerollCost})`;
  el("rerollBtn").disabled = run.coins < rerollCost;
}

function renderFuse(){
  const wrap = el("tab-fuse");
  const pairs = fusablePairs();
  el("fuseDot").classList.toggle("hidden", pairs.length === 0);
  if (!pairs.length){
    wrap.innerHTML = `<div class="emptySlot" style="padding:16px;">Keine Fusion möglich.<br><br>
      Besitze <b>zwei gleiche Items derselben Stufe</b> — dann kannst du sie hier zu einer stärkeren Version verschmelzen
      (+45% auf alle Vorteile, Nachteile bleiben gleich). Maximal Stufe +${MAX_FUSE-1}.</div>`;
    return;
  }
  wrap.innerHTML = `<div class="sectionTitle">MÖGLICHE FUSIONEN</div>` + pairs.map((p, i) => {
    const d = DEF(p.a.defId);
    const nextLvl = (p.a.lvl||1) + 1;
    return `
      <div class="fuseRow">
        <div class="fuseHead">
          <span>${d.icon}</span><span>2× ${d.name}${(p.a.lvl||1)>1?" +"+((p.a.lvl||1)-1):""}</span>
          <span class="to">→ +${nextLvl-1}</span>
        </div>
        ${itemCardHTML(d, { lvl: nextLvl, action:`<button class="actBtn fuse" data-fuse="${i}">⚗️ Fusion</button>` })}
      </div>`;
  }).join("");
  wrap.querySelectorAll("button[data-fuse]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const p = pairs[parseInt(btn.dataset.fuse,10)];
      if (!p) return;
      fuseItems(p.slot, p.a.uid, p.b.uid);
      renderShop();
      setTab("fuse");
    });
  });
}

function renderGear(){
  const wrap = el("tab-gear");
  let html = "";
  for (const slot of SLOT_ORDER){
    const arr = run.equipped[slot];
    html += `<div class="slotHead"><b>${SLOT_NAMES[slot]}</b><span>${arr.length} / ${SLOT_CAPS[slot]}</span></div>`;
    if (!arr.length) html += `<div class="emptySlot">Leer — kaufe ein Item im Shop</div>`;
    else html += arr.map(it => {
      const d = DEF(it.defId);
      return itemCardHTML(d, { lvl:it.lvl, action:`<button class="actBtn sell" data-sell="${slot}:${it.uid}">Verkaufen<br>🪙 ${sellValue(it)}</button>` });
    }).join("");
  }
  html += `<div class="sectionTitle" style="margin-top:14px;">DEINE WERTE</div><div class="statGrid">${statSummaryHTML()}</div>`;
  wrap.innerHTML = html;
  wrap.querySelectorAll("button[data-sell]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const [slot, uid] = btn.dataset.sell.split(":");
      sellItem(slot, parseInt(uid,10));
      renderShop();
    });
  });
}

function statSummaryHTML(){
  const rows = [
    ["Schaden", "x" + fmtNum(S.damageMul,2)],
    ["Feuerrate", "x" + fmtNum(S.fireRateMul,2)],
    ["Reichweite", "x" + fmtNum(S.rangeMul,2)],
    ["Tempo", Math.round(S.moveSpeed)],
    ["Max. Leben", S.maxHp],
    ["Rüstung", Math.round(S.armorRed*100) + "%"],
    ["Ausweichen", Math.round(S.dodge*100) + "%"],
    ["Krit-Chance", Math.round(S.crit*100) + "%"],
    ["Krit-Schaden", "x" + fmtNum(S.critDmg,2)],
    ["Regeneration", fmtNum(S.regen,1) + " HP/s"],
    ["Lebensraub", Math.round(S.lifesteal*100) + "%"],
    ["Coin-Bonus", "x" + fmtNum(S.coinMul,2)],
    ["XP-Bonus", "x" + fmtNum(S.xpMul,2)],
    ["Glück", Math.round(S.luck) + "%"],
    ["Kills", run.kills || 0],
    ["Extra-Schuss", "+" + (run.upgrades.projectiles||0)],
  ];
  return rows.map(r => `<div class="statRow"><span>${r[0]}</span><span>${r[1]}</span></div>`).join("");
}

function renderUpgrades(){
  const wrap = el("tab-upgrades");
  wrap.innerHTML = UPGRADES.map((u, i) => {
    const lvl = run.upgrades[u.key] || 0;
    const maxed = u.max != null && lvl >= u.max;
    const cost = maxed ? 0 : upgradeCost(u, lvl);
    const cur = u.special ? `aktuell +${lvl}` : `aktuell +${fmtNum(u.per*lvl,1)}${u.unit}`;
    const pips = Array.from({length: u.max != null ? u.max : 8},
      (_,k)=>`<div class="pip ${k<lvl?"on":""}"></div>`).join("");
    return `
      <div class="upRow">
        <div class="cIcon">${u.icon}</div>
        <div class="upInfo">
          <div class="upName">${u.name}</div>
          <div class="upDesc">+${fmtNum(u.per,1)}${u.unit} pro Stufe · ${cur}</div>
          <div class="upPips">${pips}</div>
        </div>
        <button class="actBtn" data-up="${i}" ${(maxed || run.coins < cost)?"disabled":""}>${maxed?"MAX":("🪙 "+cost)}</button>
      </div>`;
  }).join("");
  wrap.querySelectorAll("button[data-up]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const u = UPGRADES[parseInt(btn.dataset.up,10)];
      const lvl = run.upgrades[u.key] || 0;
      if (u.max != null && lvl >= u.max) return;
      const cost = upgradeCost(u, lvl);
      if (run.coins < cost) return;
      run.coins -= cost;
      run.upgrades[u.key] = lvl + 1;
      refreshStats();
      if (u.key === "maxHp") player.hp = Math.min(S.maxHp, player.hp + BASE.maxHp*u.per/100);
      SFX.buy();
      saveGame();
      renderShop();
    });
  });
}

function renderShop(){
  el("shopWaveDone").textContent = run.wave;
  el("shopCoinText").textContent = run.coins;
  renderOffers();
  renderFuse();
  renderGear();
  renderUpgrades();
}
function setTab(name){
  shopTab = name;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  ["offers","fuse","gear","upgrades"].forEach(n => el("tab-"+n).classList.toggle("hidden", n !== name));
}
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", ()=> setTab(t.dataset.tab)));
el("rerollBtn").addEventListener("click", ()=>{
  if (run.coins < rerollCost) return;
  run.coins -= rerollCost;
  rerollCost = Math.round(rerollCost * 1.5);
  offers = rollOffers(6);
  SFX.buy();
  renderShop();
});

function openShop(){
  phase = "shop";
  releaseJoystick();
  offers = rollOffers(6);
  rerollCost = 8 + run.wave;
  setTab("offers");
  renderShop();
  el("shopOverlay").classList.remove("hidden");
  saveGame();
}
el("nextWaveBtn").addEventListener("click", ()=>{
  el("shopOverlay").classList.add("hidden");
  run.wave += 1;
  run.hp = player.hp;
  saveGame();
  startWave(run.wave);
});

/* ---------------- Level-Belohnung ---------------- */
let currentReward = null;
function showNextReward(){
  const lvl = pendingLevels.shift();
  if (lvl == null){ openShop(); return; }
  phase = "reward";
  releaseJoystick();
  const rar = rollRarity();
  const pool = ITEM_LIST.filter(d => d.rarity === rar);
  const def = pick(pool.length ? pool : ITEM_LIST);
  currentReward = { level: lvl, defId: def.id, price: priceFor(def) };
  el("rewardLevel").textContent = lvl;
  el("rewardCard").innerHTML = itemCardHTML(def, {});
  const free = slotFree(def.slot);
  el("rewardTakeBtn").textContent = free ? "Nehmen" : "Nehmen (ersetzen)";
  el("rewardSellBtn").textContent = "Verkaufen 🪙 " + Math.max(1, Math.floor(currentReward.price*0.5));
  const dupe = run.equipped[def.slot].some(i => i.defId === def.id);
  el("rewardHint").textContent = free
    ? (dupe ? `Du besitzt dieses Item bereits — nehmen und im Shop fusionieren!` : `Freier ${SLOT_NAMES[def.slot]}-Slot vorhanden.`)
    : `Alle ${SLOT_NAMES[def.slot]}-Slots belegt — beim Nehmen wird ein Item ersetzt.`;
  el("rewardOverlay").classList.remove("hidden");
}
el("rewardTakeBtn").addEventListener("click", ()=>{
  if (!currentReward) return;
  const r = currentReward;
  const ok = tryAcquire(r.defId, r.price, ()=>{
    currentReward = null;
    el("rewardOverlay").classList.add("hidden");
    if (pendingLevels.length) showNextReward(); else openShop();
  });
  if (ok){
    SFX.buy();
    currentReward = null;
    el("rewardOverlay").classList.add("hidden");
    if (pendingLevels.length) showNextReward(); else openShop();
  }
});
el("rewardSellBtn").addEventListener("click", ()=>{
  if (!currentReward) return;
  run.coins += Math.max(1, Math.floor(currentReward.price*0.5));
  SFX.sell();
  currentReward = null;
  el("rewardOverlay").classList.add("hidden");
  saveGame();
  if (pendingLevels.length) showNextReward(); else openShop();
});
el("collectSkip").addEventListener("click", ()=>{ if (phase === "collect") endCollectPhase(); });

/* =========================================================
   18. SPIELABLAUF
========================================================= */
function showHud(show){ el("hud").classList.toggle("hidden", !show); }

function beginRun(saveData){
  run = saveData ? runFromSave(saveData) : freshRun();
  pendingLevels = [];
  buildGround();                 // jede Runde eine frisch generierte Karte
  S = computeStats();
  resetEntities();
  player.hp = clamp(run.hp > 0 ? run.hp : S.maxHp, 1, S.maxHp);
  refreshStats();
  ["startOverlay","gameoverOverlay","shopOverlay","rewardOverlay","replaceOverlay","pauseOverlay"]
    .forEach(id => el(id).classList.add("hidden"));
  showHud(true);
  updateHud();
  paused = false; running = true;
  startWave(run.wave);
  lastT = performance.now();
  requestAnimationFrame(frame);
}

function onGameOver(){
  running = false;
  phase = "gameover";
  player.dead = true;
  releaseJoystick();
  setBestWave(run.wave);
  clearSave();
  SFX.gameover();
  shake = 7;
  el("gameoverStats").innerHTML =
    `Welle erreicht: <b>${run.wave}</b> · Level <b>${run.level}</b> · Kills <b>${run.kills||0}</b><br>Beste Welle: <b>${getBestWave()}</b>`;
  showHud(false);
  el("collectBar").classList.add("hidden");
  el("gameoverOverlay").classList.remove("hidden");
  draw();
}

el("primaryBtn").addEventListener("click", ()=>{ ensureAudio(); beginRun(loadSave()); });
el("newGameBtn").addEventListener("click", ()=>{ ensureAudio(); clearSave(); beginRun(null); });
el("restartBtn").addEventListener("click", ()=>{ ensureAudio(); clearSave(); beginRun(null); });

el("pauseBtn").addEventListener("click", ()=>{
  if (phase !== "wave" && phase !== "collect") return;
  paused = true;
  releaseJoystick();
  el("pauseStats").innerHTML = statSummaryHTML();
  updateSoundBtn();
  el("pauseOverlay").classList.remove("hidden");
});
el("resumeBtn").addEventListener("click", ()=>{
  paused = false;
  el("pauseOverlay").classList.add("hidden");
  lastT = performance.now();
});
el("quitBtn").addEventListener("click", ()=>{
  saveGame();
  running = false; paused = false; phase = "menu";
  el("pauseOverlay").classList.add("hidden");
  el("collectBar").classList.add("hidden");
  showHud(false);
  initMenu();
});
function updateSoundBtn(){ el("soundBtn").textContent = soundOn ? "🔊 Sound" : "🔇 Stumm"; }
el("soundBtn").addEventListener("click", ()=>{
  soundOn = !soundOn;
  try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify({ sound: soundOn })); }catch(e){}
  updateSoundBtn();
  if (soundOn) ensureAudio();
});

function initMenu(){
  phase = "menu";
  const save = loadSave();
  const best = getBestWave();
  if (save){
    el("primaryBtn").textContent = `Weiterspielen (Welle ${save.wave})`;
    el("newGameBtn").classList.remove("hidden");
  } else {
    el("primaryBtn").textContent = "Spiel starten";
    el("newGameBtn").classList.add("hidden");
  }
  if (best > 1){
    el("bestWaveLine").classList.remove("hidden");
    el("bestWaveNum").textContent = best;
  }
  el("startOverlay").classList.remove("hidden");
  drawIdle();
}
function drawIdle(){
  cam.x = WORLD_W/2 - VIEW_W/2; cam.y = WORLD_H/2 - VIEW_H/2;
  const cx = Math.round(cam.x), cy = Math.round(cam.y);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,VIEW_W*SS,VIEW_H*SS);
  ctx.setTransform(SS,0,0,SS, Math.round(-cx*SS), Math.round(-cy*SS));
  ctx.drawImage(groundCv, cx*SS, cy*SS, VIEW_W*SS, VIEW_H*SS, cx, cy, VIEW_W, VIEW_H);
  if (SPRITES){
    drawSprite(SPRITES.player, 0, cam.x+VIEW_W/2, cam.y+VIEW_H/2, false, false, PLAYER_SCALE);
    drawSprite(SPRITES.walker, 0, cam.x+VIEW_W/2-58, cam.y+VIEW_H/2+20, false, false, 1.4);
    drawSprite(SPRITES.brute, 1, cam.x+VIEW_W/2+68, cam.y+VIEW_H/2-16, true, false, 1.6);
  }
  ctx.setTransform(SS,0,0,SS,0,0);
  const vg = ctx.createRadialGradient(VIEW_W/2, VIEW_H/2, VIEW_H*0.35, VIEW_W/2, VIEW_H/2, VIEW_H*0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.5)");
  ctx.fillStyle = vg; ctx.fillRect(0,0,VIEW_W,VIEW_H);
  ctx.setTransform(1,0,0,1,0,0);
}

document.addEventListener("visibilitychange", ()=>{ if (document.hidden && running) saveGame(); });
window.addEventListener("pagehide", ()=>{ if (running) saveGame(); });
window.addEventListener("beforeunload", ()=>{ if (running) saveGame(); });

/* Debug-API für automatisierte Tests */
window.__ps = {
  get run(){ return run; },
  get phase(){ return phase; },
  get stats(){ return S; },
  get zombies(){ return zombies; },
  get ebullets(){ return ebullets; },
  get warns(){ return warns; },
  get shocks(){ return shocks; },
  get pools(){ return pools; },
  get cam(){ return cam; },
  get player(){ return player; },
  world: { W:WORLD_W, H:WORLD_H, VW:VIEW_W, VH:VIEW_H },
  dbg: DBG,
  coins(n){ run.coins += n; if (phase === "shop") renderShop(); },
  killAll(){ zombies.slice().forEach(z => killZombie(z)); },
  skipToShop(){ if (wave) wave.spawned = wave.totalToSpawn; this.killAll(); },
  levelUp(n){ gainXp(n || 999); },
  give(id, lvl){ if (slotFree(DEF(id).slot)) equipItem(id, DEF(id).price, lvl||1); },
  spawn(type, n){ for (let i=0;i<(n||1);i++) spawnZombie(type); },
  boss(i){ spawnBoss(i||0); },
  godMode(){ player.invuln = 99999; },
};

buildSprites();
buildGround();
initMenu();

})();
