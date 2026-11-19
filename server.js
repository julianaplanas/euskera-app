const express = require("express");
const Database = require("better-sqlite3");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "app.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0, streak INTEGER NOT NULL DEFAULT 0, last_day TEXT,
    weak TEXT NOT NULL DEFAULT '[]', profile TEXT NOT NULL DEFAULT '{}', last_seen TEXT, lang TEXT NOT NULL DEFAULT 'es', open_duel INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS login_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, code_hash TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, used INTEGER NOT NULL DEFAULT 0, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS login_codes_email ON login_codes (email, created_at);
  CREATE INDEX IF NOT EXISTS login_codes_created ON login_codes (created_at);
  CREATE TABLE IF NOT EXISTS friends (user_id INTEGER NOT NULL, friend_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (user_id, friend_id));
  CREATE INDEX IF NOT EXISTS friends_friend ON friends (friend_id);
  CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT NOT NULL, meta TEXT, day TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
  CREATE INDEX IF NOT EXISTS events_day ON events (day, name);
  CREATE TABLE IF NOT EXISTS progress (user_id INTEGER NOT NULL, lesson_id TEXT NOT NULL, rounds INTEGER NOT NULL DEFAULT 0, best INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, lesson_id));
  CREATE TABLE IF NOT EXISTS grammar (user_id INTEGER NOT NULL, card_id TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, card_id));
  CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);
  CREATE TABLE IF NOT EXISTS rounds (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, lesson_id TEXT, ok INTEGER NOT NULL, total INTEGER NOT NULL, day TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
  CREATE INDEX IF NOT EXISTS rounds_day ON rounds (day);
  CREATE INDEX IF NOT EXISTS rounds_user_day ON rounds (user_id, day);
  CREATE TABLE IF NOT EXISTS items (
    user_id INTEGER NOT NULL, key TEXT NOT NULL, eu TEXT NOT NULL, es TEXT NOT NULL, lesson_id TEXT,
    interval REAL NOT NULL DEFAULT 0, ease REAL NOT NULL DEFAULT 2.3, due TEXT NOT NULL,
    reps INTEGER NOT NULL DEFAULT 0, lapses INTEGER NOT NULL DEFAULT 0, last TEXT,
    PRIMARY KEY (user_id, key)
  );
  CREATE INDEX IF NOT EXISTS items_user_due ON items (user_id, due);
  CREATE TABLE IF NOT EXISTS push_subs (
    endpoint TEXT PRIMARY KEY, user_id INTEGER NOT NULL, sub TEXT NOT NULL, daily INTEGER NOT NULL DEFAULT 1, challenges INTEGER NOT NULL DEFAULT 1,
    hour INTEGER NOT NULL DEFAULT 19, last_sent TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT, from_id INTEGER NOT NULL, to_id INTEGER NOT NULL, kind TEXT NOT NULL,
    payload TEXT NOT NULL, from_result TEXT, to_result TEXT, status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS challenges_to ON challenges (to_id, status);
`);

// Migraciones: añade columnas que falten en bases creadas con esquemas anteriores.
(function migrate() {
  const cols = () => db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!cols().includes("email")) {
    // Tabla de la época nombre+PIN: incompatible (salt/hash obligatorios). Se aparta y se crea la nueva.
    db.exec("ALTER TABLE users RENAME TO users_old_pin");
    db.exec(`CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0, streak INTEGER NOT NULL DEFAULT 0, last_day TEXT,
      weak TEXT NOT NULL DEFAULT '[]', profile TEXT NOT NULL DEFAULT '{}', last_seen TEXT, lang TEXT NOT NULL DEFAULT 'es',
      created_at TEXT NOT NULL DEFAULT (datetime('now')))`);
    console.log("Migración: tabla users antigua (PIN) apartada como users_old_pin.");
  }
  const want = { weak: "TEXT NOT NULL DEFAULT '[]'", profile: "TEXT NOT NULL DEFAULT '{}'", last_seen: "TEXT", lang: "TEXT NOT NULL DEFAULT 'es'", open_duel: "INTEGER NOT NULL DEFAULT 0",
    start_module: "INTEGER NOT NULL DEFAULT 1", skipped: "TEXT NOT NULL DEFAULT '[]'", premium_until: "TEXT", premium_src: "TEXT", stripe_customer: "TEXT", stripe_sub: "TEXT", stripe_status: "TEXT", stripe_cancel: "INTEGER NOT NULL DEFAULT 0", stripe_plan: "TEXT",
    sub_status: "TEXT", sub_cancel: "INTEGER NOT NULL DEFAULT 0", sub_plan: "TEXT", sub_store: "TEXT", sub_product: "TEXT",
    mail_opt: "INTEGER NOT NULL DEFAULT 1", welcome_sent: "INTEGER NOT NULL DEFAULT 0", nudge_last: "TEXT" }; // stripe_* ya no se usan (quedan vacías)
  db.exec(`CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS gift_codes (code TEXT PRIMARY KEY, days INTEGER NOT NULL, max_uses INTEGER NOT NULL DEFAULT 1, uses INTEGER NOT NULL DEFAULT 0, note TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT NOT NULL, concept TEXT NOT NULL, amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'EUR', recurring TEXT, note TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS gift_redemptions (code TEXT NOT NULL, user_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (code, user_id));`);
  if (!db.prepare("PRAGMA table_info(login_codes)").all().some(c => c.name === "ip")) { db.exec("ALTER TABLE login_codes ADD COLUMN ip TEXT"); db.exec("CREATE INDEX IF NOT EXISTS login_codes_ip ON login_codes (ip, created_at)"); console.log("Migración: columna login_codes.ip"); }
  for (const [c, def] of Object.entries(want)) if (!cols().includes(c)) { db.exec(`ALTER TABLE users ADD COLUMN ${c} ${def}`); console.log("Migración: columna users." + c); }
})();

const IS_PROD = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || process.env.NODE_ENV === "production");
// APP_SECRET firma los códigos de acceso y los enlaces de baja. En producción es obligatoria; sin ella el servidor no arranca.
// Si falta en producción se usa una aleatoria por arranque (los códigos en vuelo dejan de valer en cada despliegue) y se avisa en el log.
if (IS_PROD && !process.env.APP_SECRET) console.error("AVISO: APP_SECRET no está en Railway → Variables; se usa una clave aleatoria temporal. Pon una de 32 caracteres.");
else if (IS_PROD && process.env.APP_SECRET.length < 16) console.error("AVISO: APP_SECRET es corta; usa al menos 16 caracteres (mejor 32 aleatorios).");
if (IS_PROD && (!process.env.ADMIN_KEY || process.env.ADMIN_KEY.length < 12)) console.error("AVISO: ADMIN_KEY falta o es corta (mínimo recomendado 20 caracteres aleatorios).");
const SECRET = process.env.APP_SECRET || (IS_PROD ? crypto.randomBytes(32).toString("hex") : "dev-secret-change-me");
const hashCode = (email, code) => crypto.createHmac("sha256", SECRET).update(email + ":" + code).digest("hex");
const normEmail = (e) => String(e || "").trim().toLowerCase();
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 120;
const cleanName = (n) => String(n || "").trim().normalize("NFC").replace(/\s+/g, " ").slice(0, 30);
const displayName = (u) => u.name ? u.name[0].toUpperCase() + u.name.slice(1) : "?";
const cleanLang = (l) => l === "en" || l === "fr" ? l : "es";
function logEvent(userId, name, meta) { try { db.prepare("INSERT INTO events (user_id, name, meta, day) VALUES (?, ?, ?, ?)").run(userId || null, name, meta ? JSON.stringify(meta) : null, madridDay()); } catch (e) {} }
const norm = (s) => String(s || "").trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");
const madridDay = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86400000).toLocaleDateString("sv-SE", { timeZone: process.env.TZ_NAME || "Europe/Madrid" });
const addDays = (day, n) => new Date(new Date(day + "T12:00:00Z").getTime() + n * 86400000).toISOString().slice(0, 10);
const J = (s, d) => { try { return JSON.parse(s); } catch (e) { return d; } };

const app = express();
app.set("trust proxy", 1); // Railway pone la IP real en X-Forwarded-For
const compression = require("compression");
app.use(compression({ threshold: 1024 }));
// Cabeceras de seguridad básicas (sin dependencias): nada de iframes ajenos, sin adivinar tipos, HSTS cuando llega por https.
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff"); res.set("X-Frame-Options", "DENY"); res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  if (req.secure) res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
}); // gzip/brotli (brotli calidad 4 por defecto: rápido y ~70 % menos bytes)
// Correo entrante (kaixo@, revisor@…): Resend recibe el correo (registro MX) y avisa aquí; se reenvía íntegro a MAIL_FORWARD_TO.
app.post("/api/mail/inbound", express.raw({ type: "*/*", limit: "1mb" }), (req, res) => inboundMail(req, res));
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());
// Digital Asset Links: verifica que la app Android (TWA) pertenece a este sitio.
// ANDROID_PACKAGE = nombre del paquete; ANDROID_SHA256 = huellas SHA-256 separadas por coma
// (la de la clave de subida y la de Play App Signing).
app.get("/.well-known/assetlinks.json", (req, res) => {
  const pkg = process.env.ANDROID_PACKAGE || "eus.euskarapraktika.app";
  const prints = (process.env.ANDROID_SHA256 || "").split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
  res.type("application/json").json(prints.length ? [{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: prints }
  }] : []);
});
// La web pública es solo informativa: en www.euskarapraktika.eus los navegadores ven la landing; la app solo se sirve
// dentro de la app nativa (Capacitor añade "EuskaraPraktikaApp" al user-agent). Otros hosts (Railway) siguen sirviendo la app.
const LANDING_HOSTS = (process.env.LANDING_HOSTS || "euskarapraktika.eus,www.euskarapraktika.eus").split(",").map(s => s.trim()).filter(Boolean);
const isNativeApp = (req) => /EuskaraPraktikaApp/.test(req.get("user-agent") || "");
// Vista previa en el navegador (para probar sin móvil): /?app=1 deja una cookie de 90 días y a partir de ahí se sirve la app; /?app=0 la quita.
app.use((req, res, next) => {
  if (!LANDING_HOSTS.includes(req.hostname) || isNativeApp(req)) return next();
  if (req.query.app === "1") { res.cookie("ep_app", "1", { maxAge: 90 * 86400000, httpOnly: true, sameSite: "lax", secure: req.secure || IS_PROD }); return res.redirect("/"); }
  if (req.query.app === "0") { res.clearCookie("ep_app"); return res.redirect("/"); }
  if (req.cookies && req.cookies.ep_app === "1") return next();
  if (req.path === "/" || req.path === "/index.html") return res.sendFile(path.join(__dirname, "public", "landing.html"));
  next();
});
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

function auth(req, res, next) {
  const token = req.cookies.session;
  const row = token && db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(token);
  if (!row) return res.status(401).json({ error: "No has iniciado sesión." });
  req.user = db.prepare("SELECT * FROM users WHERE id = ?").get(row.user_id);
  if (!req.user) return res.status(401).json({ error: "Sesión inválida." });
  const today = madridDay();
  if (req.user.last_seen !== today) { db.prepare("UPDATE users SET last_seen = ? WHERE id = ?").run(today, req.user.id); req.user.last_seen = today; }
  next();
}
function setSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, userId);
  res.cookie("session", token, { httpOnly: true, sameSite: "lax", secure: !!(res.req && res.req.secure) || IS_PROD, maxAge: 365 * 86400000 });
}
function itemStats(userId) {
  const today = madridDay();
  const r = db.prepare(`SELECT COUNT(*) learned, SUM(CASE WHEN interval >= 7 THEN 1 ELSE 0 END) consolidated,
    SUM(CASE WHEN due <= ? THEN 1 ELSE 0 END) due FROM items WHERE user_id = ?`).get(today, userId);
  return { learned: r.learned || 0, consolidated: r.consolidated || 0, due: r.due || 0 };
}
function profile(user) {
  const today = madridDay(), yesterday = madridDay(-1);
  const streak = user.last_day === today || user.last_day === yesterday ? user.streak : 0;
  const lessons = {};
  for (const p of db.prepare("SELECT lesson_id, rounds, best FROM progress WHERE user_id = ?").all(user.id)) lessons[p.lesson_id] = { rounds: p.rounds, best: p.best };
  const gram = {};
  for (const g of db.prepare("SELECT card_id, done FROM grammar WHERE user_id = ?").all(user.id)) gram[g.card_id] = g.done;
  const pending = db.prepare("SELECT COUNT(*) n FROM challenges WHERE to_id = ? AND status = 'open' AND to_result IS NULL").get(user.id).n;
  return { id: user.id, name: user.name, email: user.email, lang: user.lang || "es", premium: premiumOf(user), freeModules: FREE_MODULES, startModule: freeWindow(user).from, skipped: J(user.skipped, []), billing: BILLING_ON, openDuel: !!user.open_duel, xp: user.xp, streak, practicedToday: user.last_day === today, lessons, gram, weak: J(user.weak, []), profile: J(user.profile, {}), items: itemStats(user.id), pendingChallenges: pending, today };
}

// ---------- notificaciones push (web-push, sin servicio externo) ----------
let webpush = null;
const PUSH_ON = !!(process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE);
if (PUSH_ON) { webpush = require("web-push"); webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:euskara@example.com", process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE); }
// ---------- push nativo (Firebase Cloud Messaging) para la app Android/iOS ----------
// FCM_SERVICE_ACCOUNT = contenido JSON de la cuenta de servicio de Firebase. Los tokens se guardan en push_subs con endpoint "fcm:<token>".
const FCM_SA = (() => { try { return process.env.FCM_SERVICE_ACCOUNT ? JSON.parse(process.env.FCM_SERVICE_ACCOUNT) : null; } catch (e) { console.error("FCM_SERVICE_ACCOUNT no es JSON válido"); return null; } })();
const FCM_ON = !!(FCM_SA && FCM_SA.client_email && FCM_SA.private_key && FCM_SA.project_id);
let fcmTok = { token: null, exp: 0 };
async function fcmAccessToken() {
  if (fcmTok.token && Date.now() < fcmTok.exp - 60000) return fcmTok.token;
  const now = Math.floor(Date.now() / 1000), b64 = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: FCM_SA.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), FCM_SA.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: unsigned + "." + sig }) });
  const d = await r.json(); if (!r.ok || !d.access_token) throw new Error("FCM auth " + r.status + " " + JSON.stringify(d).slice(0, 200));
  fcmTok = { token: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 }; return fcmTok.token;
}
async function fcmSend(token, payload) {
  const at = await fcmAccessToken();
  const message = { token, notification: { title: payload.title, body: payload.body }, data: { url: String(payload.url || "/"), tag: String(payload.tag || "") },
    android: { ttl: "43200s", collapse_key: payload.tag || undefined, notification: { icon: "ic_stat_notify", color: "#C1281E", tag: payload.tag || undefined, click_action: "eus.euskarapraktika.app.OPEN" } },
    apns: { payload: { aps: { sound: "default", "thread-id": payload.tag || "general" } } } };
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${FCM_SA.project_id}/messages:send`, { method: "POST", headers: { Authorization: "Bearer " + at, "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
  if (r.ok) return true;
  const d = await r.json().catch(() => ({})); const code = d.error && d.error.details && d.error.details.find(x => x.errorCode) ? d.error.details.find(x => x.errorCode).errorCode : (d.error && d.error.status);
  const err = new Error("FCM " + r.status + " " + code); err.gone = r.status === 404 || code === "UNREGISTERED" || code === "INVALID_ARGUMENT"; throw err;
}
async function sendPush(userId, payload, kind) {
  if (!PUSH_ON && !FCM_ON) return 0;
  const col = kind === "daily" ? "daily" : "challenges";
  const subs = db.prepare(`SELECT endpoint, sub FROM push_subs WHERE user_id = ? AND ${col} = 1`).all(userId);
  let n = 0;
  for (const row of subs) {
    const native = row.endpoint.startsWith("fcm:");
    try {
      if (native) { if (!FCM_ON) continue; await fcmSend(row.endpoint.slice(4), payload); n++; }
      else { if (!PUSH_ON) continue; await webpush.sendNotification(JSON.parse(row.sub), JSON.stringify(payload), { TTL: 60 * 60 * 12 }); n++; }
    } catch (e) {
      if (e.gone || e.statusCode === 404 || e.statusCode === 410) db.prepare("DELETE FROM push_subs WHERE endpoint = ?").run(row.endpoint);
      else console.error("push error", e.statusCode || e.message);
    }
  }
  return n;
}
app.get("/api/push/key", (req, res) => res.json({ enabled: PUSH_ON || FCM_ON, web: PUSH_ON, native: FCM_ON, key: process.env.VAPID_PUBLIC || null }));
app.get("/api/push/status", auth, (req, res) => {
  const rows = db.prepare("SELECT endpoint, daily, challenges, hour FROM push_subs WHERE user_id = ?").all(req.user.id);
  res.json({ enabled: PUSH_ON || FCM_ON, subs: rows });
});
app.post("/api/push/subscribe", auth, (req, res) => {
  const sub = req.body.sub; if (!sub || !sub.endpoint) return res.status(400).json({ error: "Suscripción inválida." });
  const daily = req.body.daily === false ? 0 : 1, challenges = req.body.challenges === false ? 0 : 1, hour = Math.max(6, Math.min(23, parseInt(req.body.hour) || 19));
  db.prepare(`INSERT INTO push_subs (endpoint, user_id, sub, daily, challenges, hour) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, sub = excluded.sub, daily = excluded.daily, challenges = excluded.challenges, hour = excluded.hour`).run(sub.endpoint, req.user.id, JSON.stringify(sub), daily, challenges, hour);
  logEvent(req.user.id, "push_on");
  res.json({ ok: true });
});
app.post("/api/push/unsubscribe", auth, (req, res) => { if (req.body.endpoint) db.prepare("DELETE FROM push_subs WHERE endpoint = ? AND user_id = ?").run(req.body.endpoint, req.user.id); res.json({ ok: true }); });
app.post("/api/push/test", auth, async (req, res) => { const n = await sendPush(req.user.id, { title: "Kaixo! 👋", body: "Así se verán los recordatorios. Ondo dago!", url: "/" }, "challenges"); res.json({ sent: n }); });
// Recordatorio diario: cada hora en punto, a quien tenga esa hora elegida, frases pendientes y no haya practicado hoy
async function dailyReminders() {
  if (!PUSH_ON && !FCM_ON) return;
  const today = madridDay();
  const hourNow = parseInt(new Date().toLocaleTimeString("en-GB", { timeZone: process.env.TZ_NAME || "Europe/Madrid", hour: "2-digit", hour12: false }));
  const rows = db.prepare("SELECT DISTINCT user_id FROM push_subs WHERE daily = 1 AND hour = ? AND (last_sent IS NULL OR last_sent < ?)").all(hourNow, today);
  for (const r of rows) {
    const u = db.prepare("SELECT * FROM users WHERE id = ?").get(r.user_id); if (!u || u.last_day === today) continue;
    const due = db.prepare("SELECT COUNT(*) n FROM items WHERE user_id = ? AND due <= ?").get(u.id, today).n;
    if (!due) continue;
    const name = displayName(u);
    const body = u.lang === "en" ? `${due} ${due === 1 ? "phrase" : "phrases"} to review today. Bost minutu · five minutes.` : u.lang === "fr" ? `${due} ${due === 1 ? "phrase" : "phrases"} à réviser aujourd'hui. Bost minutu · cinq minutes.` : `${due} ${due === 1 ? "frase" : "frases"} para repasar hoy. Bost minutu · cinco minutos.`;
    const n = await sendPush(u.id, { title: `Kaixo, ${name}!`, body, url: "/", tag: "daily" }, "daily");
    if (n) db.prepare("UPDATE push_subs SET last_sent = ? WHERE user_id = ? AND daily = 1").run(today, u.id);
  }
}
if (PUSH_ON || FCM_ON) { setInterval(() => { const m = new Date().getMinutes(); if (m === 0 || m === 1) dailyReminders().catch(e => console.error(e)); }, 60 * 1000); console.log(`Push activado (web: ${PUSH_ON ? "sí" : "no"}, app: ${FCM_ON ? "sí" : "no"}); recordatorios diarios en marcha.`); }
else console.log("Push desactivado (faltan VAPID_PUBLIC / VAPID_PRIVATE y FCM_SERVICE_ACCOUNT).");

// ---------- correo (Resend) ----------
const MAIL_ON = !!process.env.RESEND_API_KEY;
async function sendMail(to, subject, text, html) {
  if (!MAIL_ON) { console.log(`[mail desactivado] para ${to}: ${subject}\n${text}`); return false; }
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "Euskara Praktika <onboarding@resend.dev>", to: [to], subject, text, html }) });
  if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error("Resend " + r.status + " " + t.slice(0, 200)); }
  return true;
}


// ---------- correos de bienvenida y de «te echamos de menos» ----------
// Bienvenida al completar el perfil; recordatorio por correo a los 3 y a los 10 días sin practicar (a las 18:00, hora de Madrid),
// con enlace para no recibir más. MAIL_NUDGES=0 los desactiva. Es independiente de los avisos push.
const APP_PUBLIC = () => (process.env.APP_URL || "https://www.euskarapraktika.eus").replace(/\/$/, "");
const unsubToken = (id) => crypto.createHmac("sha256", SECRET).update("unsub:" + id).digest("hex").slice(0, 32);
const unsubUrl = (id) => `${APP_PUBLIC()}/api/mail/unsub?u=${id}&t=${unsubToken(id)}`;
function mailHtml({ eyebrow = "Euskara Praktika", title, sub, paras, cta, unsub }) {
  const p = paras.map(x => `<p style="margin:0 0 12px;font-size:16px;line-height:1.5">${x}</p>`).join("");
  return `<div style="font-family:system-ui,sans-serif;max-width:460px;margin:auto;padding:28px;background:#FFF9EC;color:#141414"><p style="margin:0 0 6px;font-size:13px;letter-spacing:1px;text-transform:uppercase">${eyebrow}</p><h1 style="margin:0 0 18px;font-size:24px">${title}${sub ? `<br><span style="font-size:15px;font-weight:400;color:#5A5A5A">${sub}</span>` : ""}</h1>${p}${cta ? `<p style="margin:18px 0 0"><a href="${cta.url}" style="display:inline-block;background:#C1281E;color:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px">${cta.label}</a></p>` : ""}${unsub ? `<p style="margin:26px 0 0;font-size:12px;color:#8a8a8a">${unsub.text} <a href="${unsub.url}" style="color:#8a8a8a">${unsub.label}</a></p>` : ""}</div>`;
}
const MAIL_T = {
  es: { wsubj: "Ongi etorri! Así funciona Euskara Praktika", wtitle: "Ongi etorri", wsub: "Bienvenida/o al camino", w: ["Ya tienes tu sitio en el camino de Baiona a Maule. La idea es sencilla: <b>cinco minutos al día</b>. Cada frase nueva vuelve al día siguiente, a los tres días, a los siete… justo antes de que la olvides.", "Escribe las frases, no las elijas: es más lento al principio y mucho más firme después. Y si un día fallas, no pasa nada: vuelve mañana.", "Si activas los avisos en «Nire profila», la app te dirá cuándo toca repasar."], cta: "Abrir la app", nsubj3: "Zure esaldiak zain daude · tus frases te esperan", nsubj10: "Hamar egun · diez días sin verte", ntitle: "Kaixo", n3: (due) => [`Hace tres días que no practicas. ${due ? `Tienes <b>${due} ${due === 1 ? "frase" : "frases"}</b> para repasar: ` : ""}cinco minutos y vuelven a estar firmes.`, "No hace falta ponerse al día de golpe; con una ronda hoy, el repaso se reordena solo."], n10: (due) => ["Diez días sin euskera. Las frases no se han ido: están esperando, y la app las sacará en el orden justo cuando vuelvas.", "Una ronda hoy y mañana otra. Eso es todo."], ncta: "Practicar ahora", unsub: "Si no quieres recibir estos correos,", unsubl: "date de baja aquí", done: "Listo. No te enviaremos más correos de recordatorio (los códigos para entrar siguen llegando)." },
  en: { wsubj: "Ongi etorri! Here's how Euskara Praktika works", wtitle: "Ongi etorri", wsub: "Welcome to the road", w: ["You now have your place on the road from Baiona to Maule. The idea is simple: <b>five minutes a day</b>. Every new phrase comes back the next day, after three days, after seven… right before you'd forget it.", "Write the phrases, don't pick them: slower at first, much more solid later. And if you slip one day, no problem: come back tomorrow.", "Turn on reminders in «Nire profila» and the app will tell you when it's time to review."], cta: "Open the app", nsubj3: "Zure esaldiak zain daude · your phrases are waiting", nsubj10: "Hamar egun · ten days without you", ntitle: "Kaixo", n3: (due) => [`It's been three days. ${due ? `You have <b>${due} ${due === 1 ? "phrase" : "phrases"}</b> to review: ` : ""}five minutes and they're solid again.`, "No need to catch up all at once; one round today and the review reorders itself."], n10: (due) => ["Ten days without Basque. The phrases haven't gone anywhere: they're waiting, and the app will bring them back in the right order when you return.", "One round today, another tomorrow. That's all."], ncta: "Practise now", unsub: "If you don't want these emails,", unsubl: "unsubscribe here", done: "Done. We won't send you any more reminder emails (sign-in codes still arrive)." },
  fr: { wsubj: "Ongi etorri ! Voici comment marche Euskara Praktika", wtitle: "Ongi etorri", wsub: "Bienvenue sur le chemin", w: ["Tu as maintenant ta place sur le chemin de Baiona à Maule. L'idée est simple : <b>cinq minutes par jour</b>. Chaque nouvelle phrase revient le lendemain, au bout de trois jours, de sept… juste avant que tu ne l'oublies.", "Écris les phrases, ne les choisis pas : plus lent au début, bien plus solide ensuite. Et si tu te trompes un jour, pas grave : reviens demain.", "Active les rappels dans « Nire profila » et l'appli te dira quand c'est l'heure de réviser."], cta: "Ouvrir l'appli", nsubj3: "Zure esaldiak zain daude · tes phrases t'attendent", nsubj10: "Hamar egun · dix jours sans toi", ntitle: "Kaixo", n3: (due) => [`Ça fait trois jours. ${due ? `Tu as <b>${due} ${due === 1 ? "phrase" : "phrases"}</b> à réviser : ` : ""}cinq minutes et elles sont de nouveau acquises.`, "Pas besoin de tout rattraper d'un coup ; une série aujourd'hui et la révision se réorganise toute seule."], n10: (due) => ["Dix jours sans basque. Les phrases ne sont pas parties : elles attendent, et l'appli les ressortira dans le bon ordre quand tu reviendras.", "Une série aujourd'hui, une autre demain. C'est tout."], ncta: "Pratiquer maintenant", unsub: "Si tu ne veux plus recevoir ces e-mails,", unsubl: "désabonne-toi ici", done: "C'est fait. Nous ne t'enverrons plus d'e-mails de rappel (les codes de connexion continuent d'arriver)." }
};
const strip = (h) => h.replace(/<[^>]+>/g, "");
async function sendWelcome(u) {
  if (u.welcome_sent || process.env.MAIL_NUDGES === "0") return;
  db.prepare("UPDATE users SET welcome_sent = 1 WHERE id = ?").run(u.id);
  const T = MAIL_T[u.lang] || MAIL_T.es; const name = displayName(u);
  try { await sendMail(u.email, T.wsubj, `${T.wtitle}, ${name}!\n\n${T.w.map(strip).join("\n\n")}`, mailHtml({ title: `${T.wtitle}, ${name}!`, sub: T.wsub, paras: T.w, cta: { url: APP_PUBLIC(), label: T.cta }, unsub: { text: T.unsub, label: T.unsubl, url: unsubUrl(u.id) } })); logEvent(u.id, "mail_welcome"); }
  catch (e) { console.error("bienvenida:", e.message); }
}
async function mailNudges() {
  if (process.env.MAIL_NUDGES === "0") return 0; let sent = 0;
  const today = madridDay();
  for (const days of [3, 10]) {
    const day = madridDay(-days);
    const rows = db.prepare(`SELECT * FROM users WHERE mail_opt = 1 AND json_extract(profile, '$.gender') IS NOT NULL AND COALESCE(MAX(last_day, last_seen), substr(created_at, 1, 10)) = ? AND (nudge_last IS NULL OR nudge_last < ?)`).all(day, madridDay(-2));
    for (const u of rows) {
      const T = MAIL_T[u.lang] || MAIL_T.es; const due = db.prepare("SELECT COUNT(*) n FROM items WHERE user_id = ? AND due <= ?").get(u.id, today).n;
      const paras = days === 3 ? T.n3(due) : T.n10(due); const subj = days === 3 ? T.nsubj3 : T.nsubj10;
      db.prepare("UPDATE users SET nudge_last = ? WHERE id = ?").run(today, u.id);
      try { await sendMail(u.email, subj, `${T.ntitle}, ${displayName(u)}!\n\n${paras.map(strip).join("\n\n")}\n\n${T.unsub} ${unsubUrl(u.id)}`, mailHtml({ title: `${T.ntitle}, ${displayName(u)}!`, paras, cta: { url: APP_PUBLIC(), label: T.ncta }, unsub: { text: T.unsub, label: T.unsubl, url: unsubUrl(u.id) } })); logEvent(u.id, "mail_nudge", { days, due }); sent++; }
      catch (e) { console.error("recordatorio por correo:", e.message); }
    }
  }
  return sent;
}
if (MAIL_ON && process.env.MAIL_NUDGES !== "0") setInterval(() => { const d = new Date(); const h = parseInt(d.toLocaleTimeString("en-GB", { timeZone: process.env.TZ_NAME || "Europe/Madrid", hour: "2-digit", hour12: false })); if (h === 18 && d.getMinutes() === 5) mailNudges().catch(e => console.error(e)); }, 60 * 1000);
app.post("/api/admin/mail/nudges", admin, async (req, res) => { try { res.json({ sent: await mailNudges() }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get("/api/mail/unsub", (req, res) => {
  const id = +req.query.u, t = String(req.query.t || "");
  const u = id && db.prepare("SELECT id, lang FROM users WHERE id = ?").get(id);
  if (!u || t !== unsubToken(id)) return res.status(400).send("Enlace no válido.");
  db.prepare("UPDATE users SET mail_opt = 0 WHERE id = ?").run(id); logEvent(id, "mail_unsub");
  const T = MAIL_T[u.lang] || MAIL_T.es;
  res.send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Euskara Praktika</title>${mailHtml({ title: "Ados.", paras: [T.done] })}`);
});
// ---------- correo entrante (Resend Inbound → reenvío a tu buzón) ----------
//   RESEND_WEBHOOK_SECRET  secreto «whsec_…» del webhook email.received (firma Svix). MAIL_FORWARD_TO  dirección a la que reenviar.
// Se descarga el mensaje y sus adjuntos por la API de Resend y se reenvía desde MAIL_FROM con «Responder a» = remitente original.
const MAIL_FORWARD_TO = process.env.MAIL_FORWARD_TO || "";
function svixVerify(req, secret) {
  const id = req.get("svix-id"), ts = req.get("svix-timestamp"), sig = req.get("svix-signature"); if (!id || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - +ts) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const want = crypto.createHmac("sha256", key).update(`${id}.${ts}.`).update(req.body).digest("base64");
  return sig.split(" ").some(p => { const v = p.split(",")[1]; return v && v.length === want.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(want)); });
}
const rsHeaders = () => ({ Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" });
async function inboundMail(req, res) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !MAIL_ON || !MAIL_FORWARD_TO) return res.status(503).json({ error: "reenvío de correo sin configurar" });
  if (!svixVerify(req, secret)) return res.status(401).json({ error: "firma inválida" });
  let ev; try { ev = JSON.parse(req.body.toString("utf8")); } catch (e) { return res.status(400).end(); }
  if (ev.type !== "email.received") return res.json({ ok: true, ignored: ev.type });
  res.json({ ok: true }); // se responde ya; el reenvío sigue en segundo plano
  try {
    const id = ev.data.email_id;
    const mr = await fetch(`https://api.resend.com/emails/receiving/${id}`, { headers: rsHeaders() });
    let m = await mr.json().catch(() => ({})); let fail = "";
    if (!mr.ok) { fail = `No se pudo recuperar el contenido del mensaje (Resend ${mr.status}: ${m.message || m.name || "?"}). Si dice 'restricted' o 'forbidden', la clave RESEND_API_KEY necesita permiso «Full access».`; console.error("correo entrante:", fail); m = {}; }
    // Si el cuerpo viene como enlace (html_format/text_format distintos de inline), se descarga.
    for (const k of ["html", "text"]) { const f = m[k + "_format"]; if (m[k] && f && f !== "inline" && /^https?:\/\//.test(m[k])) { try { m[k] = await (await fetch(m[k])).text(); } catch (e) { console.error("cuerpo " + k + ":", e.message); } } }
    const attachments = [];
    if ((ev.data.attachments || []).length) {
      const list = await (await fetch(`https://api.resend.com/emails/receiving/${id}/attachments`, { headers: rsHeaders() })).json();
      for (const a of (list.data || [])) { try { const buf = Buffer.from(await (await fetch(a.download_url)).arrayBuffer()); if (buf.length <= 20e6) attachments.push({ filename: a.filename || "adjunto", content: buf.toString("base64"), content_type: a.content_type }); } catch (e) { console.error("adjunto:", e.message); } }
    }
    const to = (m.to || ev.data.to || []).join(", "), from = m.from || ev.data.from || "";
    const esc_ = s => String(s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    const head = `De: ${from}\nPara: ${to}\n\n`, headHtml = `<p style="color:#666;font:13px sans-serif;border-bottom:1px solid #ddd;padding-bottom:8px">De: ${esc_(from)}<br>Para: ${esc_(to)}</p>`;
    const body = { from: process.env.MAIL_FROM || "Euskara Praktika <onboarding@resend.dev>", to: [MAIL_FORWARD_TO], reply_to: from, subject: `[${(to.match(/[^<\s]+@/) || [""])[0].replace("@", "")}@] ${m.subject || ev.data.subject || "(sin asunto)"}`,
      text: head + (m.text || (m.html ? "" : fail || "(mensaje sin texto)")), html: headHtml + (m.html || `<pre style="white-space:pre-wrap">${esc_(m.text || fail || "(mensaje sin texto)")}</pre>`), attachments };
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: rsHeaders(), body: JSON.stringify(body) });
    if (!r.ok) console.error("reenvío de correo:", r.status, await r.text()); else console.log(`Correo reenviado: ${from} → ${to} (${attachments.length} adjuntos)`);
  } catch (e) { console.error("correo entrante:", e.message); }
}
// ---------- premium (suscripción de Google Play vía RevenueCat, o código de regalo) ----------
// Módulos gratuitos: los primeros FREE_MODULES (por defecto 1). El resto requiere premium activo.
const FREE_MODULES = +process.env.FREE_MODULES || 1;
const PLANS = { month: { months: 1, amount: 399 }, quarter: { months: 3, amount: 999 }, half: { months: 6, amount: 1999 }, life: { months: 0, amount: 4999 } }; // life = pago único (producto premium_lifetime en Play)
const FOREVER = "2099-12-31";
const LESSON_DATA = (() => { try { const w = {}; new Function("window", fs.readFileSync(path.join(__dirname, "public", "lessons.js"), "utf8"))(w); return w; } catch (e) { console.error("No se pudo leer lessons.js:", e.message); return { LESSONS: [], MODULES: [] }; } })();
const LESSON_MODULE = Object.fromEntries(LESSON_DATA.LESSONS.map(l => [l.id, l.module]));
const MODULE_BY_ID = Object.fromEntries(LESSON_DATA.MODULES.map(m => [m.id, m]));
// Módulos de temporada (p. ej. Gabonak): abiertos y gratis solo entre sus fechas (MM-DD, puede cruzar el año nuevo).
const seasonOpen = (mod, day = madridDay(), force = false) => { if (!mod || !mod.season || force || process.env.SEASON_ALL === "1") return true; const md = day.slice(5), { from, to } = mod.season; return from <= to ? (md >= from && md <= to) : (md >= from || md <= to); };
const setting = (k, v) => v === undefined ? (db.prepare("SELECT v FROM settings WHERE k = ?").get(k) || {}).v : db.prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(k, v);
function premiumOf(user) {
  const today = madridDay();
  const active = !!user.premium_until && user.premium_until >= today;
  return { active, until: user.premium_until || null, src: user.premium_src || null, status: user.sub_status || null, cancels: !!user.sub_cancel, plan: user.sub_plan || null, store: user.sub_store || null, managed: !!user.sub_product };
}
// Gratis = FREE_MODULES módulos a partir del módulo por el que el usuario empezó (start_module); el resto, premium.
const MODULE_COUNT = (() => { try { return Math.max(...LESSON_DATA.MODULES.filter(m => !m.season).map(m => m.id)); } catch (e) { return 16; } })();
const freeWindow = (user) => { const from = Math.max(1, Math.min(MODULE_COUNT, user.start_module || 1)); return { from, to: from + FREE_MODULES - 1 }; };
const lessonAllowed = (user, lessonId) => { const m = LESSON_MODULE[lessonId]; if (!m) return true; const mod = MODULE_BY_ID[m]; if (mod && mod.season) return seasonOpen(mod, madridDay(), !!user._preview); if (mod && mod.free) return true; const w = freeWindow(user); return (m >= w.from && m <= w.to) || premiumOf(user).active; };
function addPremiumDays(userId, days, src) {
  const u = db.prepare("SELECT premium_until FROM users WHERE id = ?").get(userId); const today = madridDay();
  const base = u && u.premium_until && u.premium_until > today ? new Date(u.premium_until + "T12:00:00Z") : new Date(today + "T12:00:00Z");
  const until = new Date(base.getTime() + days * 86400000).toISOString().slice(0, 10);
  db.prepare("UPDATE users SET premium_until = ?, premium_src = ? WHERE id = ?").run(until, src, userId);
  return until;
}
// Corrección puntual: el primer despliegue del candado dio 180 días de cortesía a las cuentas existentes; se retira (una sola vez)
// para que todo el mundo vea el candado tal cual. Los códigos canjeados a mano no se tocan.
(function undoGrandfather() {
  if (!setting("grandfather_done") || setting("grandfather_undone")) return;
  const n = db.prepare("UPDATE users SET premium_until = NULL, premium_src = NULL WHERE premium_src = 'gift' AND id NOT IN (SELECT user_id FROM gift_redemptions)").run().changes;
  setting("grandfather_undone", new Date().toISOString()); console.log(`Premium de cortesía retirado a ${n} cuentas`);
})();
if (!db.prepare("SELECT COUNT(*) n FROM expenses").get().n) db.prepare("INSERT INTO expenses (day, concept, amount, currency, note) VALUES (?, ?, ?, ?, ?)").run("2026-11-17", "Google Play Console (cuenta de desarrollador, pago único)", 25, "USD", "");
// Pagos: suscripción de Google Play (más adelante App Store) gestionada por RevenueCat.
//   REVENUECAT_PUBLIC_KEY   clave pública de la app Android (goog_…): la app la pide a /api/billing/config y configura el SDK.
//   REVENUECAT_SECRET_KEY   clave secreta (sk_…): el servidor consulta al suscriptor por la API REST para activar Premium de forma fiable.
//   REVENUECAT_WEBHOOK_SECRET  valor de la cabecera Authorization que RevenueCat manda en cada aviso a /api/billing/revenuecat.
// El usuario de RevenueCat es «ep_<id>», así cada compra queda ligada a la cuenta (y a la entitlement «premium»).
const RC_PUBLIC_KEY = process.env.REVENUECAT_PUBLIC_KEY || ""; // Android (goog_…)
const RC_PUBLIC_KEY_IOS = process.env.REVENUECAT_PUBLIC_KEY_IOS || ""; // iOS (appl_…)
const rcKeyFor = (req) => (/iPhone|iPad|iPod/.test(req.get("user-agent") || "") && RC_PUBLIC_KEY_IOS) || RC_PUBLIC_KEY || RC_PUBLIC_KEY_IOS || null;
const RC_SECRET_KEY = process.env.REVENUECAT_SECRET_KEY || "";
const RC_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || "";
const BILLING_ON = !!(RC_PUBLIC_KEY || RC_PUBLIC_KEY_IOS);
const ANDROID_PACKAGE = "eus.euskarapraktika.app", PLAY_PRODUCT = "premium";
const rcUserId = (uid) => "ep_" + uid;
const rcUid = (appUserId) => { const m = /^ep_(\d+)$/.exec(String(appUserId || "")); return m ? +m[1] : null; };
const planOfProduct = (pid) => { const p = String(pid || "").toLowerCase(); if (/life|betiko|forever/.test(p)) return "life"; for (const k of Object.keys(PLANS)) if (p.includes(k)) return k; return /year|annual/.test(p) ? "year" : null; };
const appUrl = (req) => (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
// Guarda el estado de la suscripción. until = fecha (YYYY-MM-DD) hasta la que la entitlement está pagada (o null si nunca la tuvo).
function applyEntitlement(userId, { until, product, store, cancels, billingIssue }) {
  const today = madridDay(); const active = !!until && until >= today;
  const status = !until ? null : billingIssue ? "past_due" : active ? "active" : "expired";
  const u = db.prepare("SELECT premium_until, premium_src FROM users WHERE id = ?").get(userId); if (!u) return;
  // Un código de regalo que llegue más lejos no se acorta; una suscripción caducada solo retira el premium que ella misma dio.
  let premiumUntil = u.premium_until, src = u.premium_src;
  if (active && (!u.premium_until || until >= u.premium_until || u.premium_src === "revenuecat")) { premiumUntil = until; src = "revenuecat"; }
  else if (!active && u.premium_src === "revenuecat") { premiumUntil = until || null; src = until ? "revenuecat" : null; }
  db.prepare("UPDATE users SET premium_until = ?, premium_src = ?, sub_status = ?, sub_cancel = ?, sub_plan = ?, sub_store = ?, sub_product = ? WHERE id = ?")
    .run(premiumUntil, src, status, cancels ? 1 : 0, planOfProduct(product), store || null, product || null, userId);
}
const msDay = (ms) => ms ? new Date(+ms).toISOString().slice(0, 10) : null;
const isoDay = (iso) => iso ? new Date(iso).toISOString().slice(0, 10) : null;
// Consulta al suscriptor en RevenueCat (fuente de verdad) y aplica la entitlement «premium».
async function rcSync(userId) {
  if (!RC_SECRET_KEY) return false;
  const r = await fetch("https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(rcUserId(userId)), { headers: { Authorization: "Bearer " + RC_SECRET_KEY, "Content-Type": "application/json" } });
  if (!r.ok) throw new Error("RevenueCat " + r.status);
  const sub = (await r.json()).subscriber || {}; const ent = (sub.entitlements || {}).premium;
  if (!ent) { applyEntitlement(userId, { until: null }); return true; }
  const s = (sub.subscriptions || {})[ent.product_identifier] || {};
  applyEntitlement(userId, { until: ent.expires_date ? isoDay(ent.expires_date) : FOREVER, product: ent.product_identifier, store: s.store || null, cancels: !!s.unsubscribe_detected_at, billingIssue: !!s.billing_issues_detected_at && isoDay(ent.expires_date) >= madridDay() });
  return true;
}
app.get("/api/billing/config", (req, res) => {
  res.json({ enabled: BILLING_ON, key: rcKeyFor(req), keys: { android: RC_PUBLIC_KEY || null, ios: RC_PUBLIC_KEY_IOS || null }, freeModules: FREE_MODULES, plans: Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, { months: p.months, amount: p.amount }])), android: { package: ANDROID_PACKAGE, product: PLAY_PRODUCT } });
});
app.get("/api/billing", auth, (req, res) => {
  res.json({ enabled: BILLING_ON, key: rcKeyFor(req), keys: { android: RC_PUBLIC_KEY || null, ios: RC_PUBLIC_KEY_IOS || null }, appUserId: rcUserId(req.user.id), freeModules: FREE_MODULES, plans: Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, { months: p.months, amount: p.amount }])), premium: premiumOf(req.user) });
});
// Tras comprar o restaurar en la app: refresca desde RevenueCat (si hay clave secreta) y devuelve el estado.
app.post("/api/billing/sync", auth, async (req, res) => {
  try { if (await rcSync(req.user.id)) logEvent(req.user.id, "billing_sync", {}); } catch (e) { console.error("RevenueCat sync:", e.message); }
  res.json(premiumOf(db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id)));
});
app.post("/api/billing/redeem", auth, (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const g = code && db.prepare("SELECT * FROM gift_codes WHERE code = ?").get(code);
  if (!g) return res.status(404).json({ error: "Ese código no existe." });
  if (g.uses >= g.max_uses) return res.status(410).json({ error: "Ese código ya se ha usado." });
  if (db.prepare("SELECT 1 FROM gift_redemptions WHERE code = ? AND user_id = ?").get(code, req.user.id)) return res.status(409).json({ error: "Ya has usado este código." });
  const until = db.transaction(() => { db.prepare("UPDATE gift_codes SET uses = uses + 1 WHERE code = ?").run(code); db.prepare("INSERT INTO gift_redemptions (code, user_id) VALUES (?, ?)").run(code, req.user.id); return addPremiumDays(req.user.id, g.days, "gift"); })();
  logEvent(req.user.id, "gift_redeemed", { code, days: g.days });
  res.json({ ok: true, until, premium: premiumOf(db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id)) });
});
// Eventos de producto que registra la app (lista cerrada). «paywall»: el usuario ha llegado a la pantalla de planes.
app.post("/api/event", auth, (req, res) => {
  const name = String(req.body.name || ""); if (!["paywall"].includes(name)) return res.status(400).json({ error: "evento desconocido" });
  const from = String((req.body.meta || {}).from || "").slice(0, 20);
  if (!db.prepare("SELECT 1 FROM events WHERE user_id = ? AND name = ? AND day = ? LIMIT 1").get(req.user.id, name, madridDay())) logEvent(req.user.id, name, { from });
  res.json({ ok: true });
});
// Webhook de RevenueCat (compra, renovación, cancelación, caducidad, problema de cobro, traspaso…).
// Se verifica la cabecera Authorization; con clave secreta se reconsulta al suscriptor, si no se aplica lo que trae el aviso.
app.post("/api/billing/revenuecat", async (req, res) => {
  if (!RC_WEBHOOK_SECRET) return res.status(503).json({ error: "REVENUECAT_WEBHOOK_SECRET sin configurar" });
  const h = String(req.headers.authorization || ""); const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  if (!same(h, RC_WEBHOOK_SECRET) && !same(h, "Bearer " + RC_WEBHOOK_SECRET)) return res.status(401).json({ error: "unauthorized" });
  const ev = (req.body && req.body.event) || {}; if (!ev.type) return res.status(400).json({ error: "sin evento" });
  const ids = new Set([ev.app_user_id, ev.original_app_user_id, ...(ev.aliases || []), ...(ev.transferred_to || []), ...(ev.transferred_from || [])].map(rcUid).filter(Boolean));
  if (ev.type === "TEST") { console.log("RevenueCat: evento de prueba recibido"); return res.json({ ok: true, test: true }); }
  for (const uid of ids) {
    try {
      if (!(await rcSync(uid))) {
        const gone = ["EXPIRATION"].includes(ev.type) || (ev.transferred_from || []).map(rcUid).includes(uid);
        const life = planOfProduct(ev.product_id) === "life" && !gone;
        applyEntitlement(uid, { until: life ? FOREVER : gone ? (msDay(ev.expiration_at_ms) || madridDay()) : msDay(ev.expiration_at_ms), product: ev.product_id, store: ev.store, cancels: ["CANCELLATION", "EXPIRATION"].includes(ev.type), billingIssue: ev.type === "BILLING_ISSUE" });
      }
      logEvent(uid, "billing_" + String(ev.type).toLowerCase(), { product: ev.product_id, store: ev.store, env: ev.environment });
    } catch (e) { console.error("RevenueCat webhook (" + uid + "):", e.message); }
  }
  res.json({ ok: true, users: [...ids] });
});
// ---------- cuentas: email + código de 6 cifras ----------
const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_MAX_EMAIL_DAY = +process.env.CODE_MAX_EMAIL_DAY || 5, CODE_MAX_IP_DAY = +process.env.CODE_MAX_IP_DAY || 20, CODE_MAX_GLOBAL_DAY = +process.env.CODE_MAX_GLOBAL_DAY || 95;
app.post("/api/auth/request", async (req, res) => {
  const email = normEmail(req.body.email);
  if (!validEmail(email)) return res.status(400).json({ error: "Escribe un correo válido." });
  const now = Date.now(), day = now - 86400 * 1000, ip = req.ip || "";
  db.prepare("DELETE FROM login_codes WHERE created_at < ?").run(now - 7 * 86400 * 1000);
  // Tres topes diarios para proteger la cuota de correo (Resend: 100/día en el plan gratuito):
  // por correo (un usuario real pide un código solo al entrar en un dispositivo nuevo), por IP (bots) y global.
  const cnt = (sql, ...a) => db.prepare(sql).get(...a).n;
  const L = cleanLang(req.body.lang), msg = (es, en, fr) => L === "en" ? en : L === "fr" ? fr : es;
  if (cnt("SELECT COUNT(*) n FROM login_codes WHERE email = ? AND created_at > ?", email, day) >= CODE_MAX_EMAIL_DAY)
    return res.status(429).json({ error: msg("Ya has pedido varios códigos hoy. Usa el último que recibiste (vale 10 minutos) o inténtalo mañana.", "You've already requested several codes today. Use the last one you received (valid 10 minutes) or try again tomorrow.", "Tu as déjà demandé plusieurs codes aujourd'hui. Utilise le dernier reçu (valable 10 minutes) ou réessaie demain.") });
  if (ip && cnt("SELECT COUNT(*) n FROM login_codes WHERE ip = ? AND created_at > ?", ip, day) >= CODE_MAX_IP_DAY)
    return res.status(429).json({ error: msg("Demasiadas peticiones desde esta conexión. Inténtalo más tarde.", "Too many requests from this connection. Try again later.", "Trop de demandes depuis cette connexion. Réessaie plus tard.") });
  if (cnt("SELECT COUNT(*) n FROM login_codes WHERE created_at > ?", day) >= CODE_MAX_GLOBAL_DAY) {
    logEvent(null, "code_quota", { ip });
    return res.status(503).json({ error: msg("Hoy no podemos enviar más códigos. Inténtalo mañana; si ya tienes la app abierta en otro dispositivo, sigue usándola ahí.", "We can't send more codes today. Try again tomorrow; if the app is open on another device, keep using it there.", "Nous ne pouvons plus envoyer de codes aujourd'hui. Réessaie demain ; si l'appli est ouverte sur un autre appareil, continue là-bas.") });
  }
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  db.prepare("UPDATE login_codes SET used = 1 WHERE email = ? AND used = 0").run(email);
  db.prepare("INSERT INTO login_codes (email, code_hash, expires_at, created_at, ip) VALUES (?, ?, ?, ?, ?)").run(email, hashCode(email, code), now + CODE_TTL_MS, now, ip);
  const existing = db.prepare("SELECT lang FROM users WHERE email = ?").get(email);
  const exists = !!existing;
  const lang = existing ? existing.lang : cleanLang(req.body.lang);
  const pretty = code.slice(0, 3) + " " + code.slice(3);
  const M = lang === "en"
    ? { subj: `${pretty} · zure kodea / your code`, sub: "Your code to sign in", valid: "Balio du 10 minutuz · Valid for 10 minutes.", ignore: "If you didn't request this code, just ignore this email." }
    : lang === "fr"
    ? { subj: `${pretty} · zure kodea / ton code`, sub: "Ton code pour te connecter", valid: "Balio du 10 minutuz · Valable 10 minutes.", ignore: "Si tu n'as pas demandé ce code, ignore cet e-mail." }
    : { subj: `${pretty} · zure kodea / tu código`, sub: "Tu código para entrar", valid: "Balio du 10 minutuz · Vale 10 minutos.", ignore: "Si no has pedido este código, ignora este correo." };
  try {
    const sent = await sendMail(email, M.subj,
      `Kaixo!\n\nZure kodea / ${M.sub}: ${pretty}\n\n${M.valid} ${M.ignore}`,
      `<div style="font-family:system-ui,sans-serif;max-width:420px;margin:auto;padding:24px;background:#FFF9EC;color:#141414"><p style="margin:0 0 6px;font-size:13px;letter-spacing:1px;text-transform:uppercase">Euskara Praktika</p><h1 style="margin:0 0 16px;font-size:22px">Zure kodea<br><span style="font-size:14px;font-weight:400;color:#5A5A5A">${M.sub}</span></h1><p style="font-size:40px;font-weight:700;letter-spacing:6px;background:#141414;color:#FFF9EC;padding:14px 18px;text-align:center;margin:0 0 16px">${pretty}</p><p style="font-size:14px;color:#5A5A5A;margin:0">${M.valid}<br>${M.ignore}</p></div>`);
    logEvent(null, "code_sent", { exists });
    res.json({ ok: true, exists, sent, ...(sent ? {} : { devCode: code }) });
  } catch (e) { console.error("mail error", e.message); res.status(502).json({ error: "No se pudo enviar el correo. Inténtalo en un momento." }); }
});
app.post("/api/auth/verify", (req, res) => {
  const email = normEmail(req.body.email), code = String(req.body.code || "").replace(/\D/g, "");
  if (!validEmail(email) || code.length !== 6) return res.status(400).json({ error: "Código de 6 cifras." });
  const row = db.prepare("SELECT * FROM login_codes WHERE email = ? AND used = 0 ORDER BY id DESC LIMIT 1").get(email);
  if (!row || row.expires_at < Date.now()) return res.status(400).json({ error: "El código ha caducado. Pide otro.", expired: true });
  if (row.attempts >= 5) return res.status(429).json({ error: "Demasiados intentos. Pide un código nuevo.", expired: true });
  if (!crypto.timingSafeEqual(Buffer.from(row.code_hash), Buffer.from(hashCode(email, code)))) {
    db.prepare("UPDATE login_codes SET attempts = attempts + 1 WHERE id = ?").run(row.id);
    return res.status(401).json({ error: `Código incorrecto (${4 - row.attempts} ${row.attempts === 3 ? "intento" : "intentos"} más).` });
  }
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email); let isNew = false;
  if (!user) {
    const name = cleanName(req.body.name);
    if (name.length < 2) return res.status(200).json({ needName: true });
    const info = db.prepare("INSERT INTO users (email, name, lang) VALUES (?, ?, ?)").run(email, name, cleanLang(req.body.lang));
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid); isNew = true;
    logEvent(user.id, "register");
  } else logEvent(user.id, "login");
  db.prepare("UPDATE login_codes SET used = 1 WHERE id = ?").run(row.id);
  setSession(res, user.id);
  res.json({ ...profile(user), isNew });
});
app.post("/api/logout", (req, res) => { if (req.cookies.session) db.prepare("DELETE FROM sessions WHERE token = ?").run(req.cookies.session); res.clearCookie("session"); res.json({ ok: true }); });
// En la vista previa web (cookie ep_app) o con SEASON_ALL=1, los módulos de temporada se ven siempre, para poder probarlos.
app.get("/api/me", auth, (req, res) => res.json({ ...profile(req.user), seasonAll: process.env.SEASON_ALL === "1" || !!(req.cookies && req.cookies.ep_app === "1") }));
app.post("/api/profile", auth, (req, res) => {
  const p = req.body || {};
  const clean = { gender: p.gender === "neska" || p.gender === "mutila" ? p.gender : null, age: Number.isInteger(p.age) && p.age > 0 && p.age < 120 ? p.age : null,
    nebak: Math.max(0, Math.min(9, p.nebak | 0)), ahizpak: Math.max(0, Math.min(9, p.ahizpak | 0)), town: String(p.town || "").slice(0, 40), origin: String(p.origin || "").slice(0, 40) };
  const name = cleanName(p.name); const lang = p.lang ? cleanLang(p.lang) : req.user.lang;
  const openDuel = typeof p.openDuel === "boolean" ? (p.openDuel ? 1 : 0) : req.user.open_duel;
  if (Number.isInteger(p.startModule) && p.startModule >= 1 && p.startModule <= MODULE_COUNT && p.startModule !== req.user.start_module) {
    const started = db.prepare("SELECT COUNT(*) n FROM items WHERE user_id = ? AND lesson_id IS NOT NULL AND lesson_id != 'me'").get(req.user.id).n;
    if (started) return res.status(409).json({ error: "El punto de partida solo se puede elegir antes de empezar las lecciones." });
    db.prepare("UPDATE users SET start_module = ? WHERE id = ?").run(p.startModule, req.user.id); logEvent(req.user.id, "start_module", { m: p.startModule });
  }
  db.prepare("UPDATE users SET profile = ?, lang = ?, open_duel = ?" + (name.length >= 2 ? ", name = ?" : "") + " WHERE id = ?").run(...(name.length >= 2 ? [JSON.stringify(clean), lang, openDuel, name, req.user.id] : [JSON.stringify(clean), lang, openDuel, req.user.id]));
  logEvent(req.user.id, "profile", { complete: !!clean.gender, lang });
  res.json({ ...clean, name: name.length >= 2 ? name : req.user.name, lang, openDuel: !!openDuel });
  if (clean.gender) sendWelcome(db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id));
});

// «Ya sé esto»: saltar un módulo (abre el siguiente sin meter sus frases en el repaso); se puede deshacer.
app.post("/api/skip", auth, (req, res) => {
  const m = +req.body.module; if (!Number.isInteger(m) || m < 1 || m > MODULE_COUNT) return res.status(400).json({ error: "Módulo desconocido." });
  const set = new Set(J(req.user.skipped, [])); req.body.skip === false ? set.delete(m) : set.add(m);
  const arr = [...set].sort((a, b) => a - b); db.prepare("UPDATE users SET skipped = ? WHERE id = ?").run(JSON.stringify(arr), req.user.id);
  logEvent(req.user.id, req.body.skip === false ? "unskip" : "skip", { m }); res.json({ skipped: arr });
});

// ---------- lagunak: a quién puedes retar y con quién te comparas ----------
const personView = (u) => { const pr = J(u.profile, {}); return { id: u.id, name: u.name, town: pr.town || "", consolidated: itemStats(u.id).consolidated, streak: u.streak, lastSeen: u.last_seen }; };
const circleIds = (me) => new Set(db.prepare("SELECT friend_id id FROM friends WHERE user_id = ? UNION SELECT user_id id FROM friends WHERE friend_id = ?").all(me, me).map(r => r.id));
app.get("/api/people", auth, (req, res) => {
  const q = cleanName(req.query.q).toLowerCase();
  if (q.length < 2) return res.json([]);
  const rows = db.prepare("SELECT * FROM users WHERE id != ? AND lower(name) LIKE ? ORDER BY last_seen DESC LIMIT 12").all(req.user.id, q + "%");
  const mine = new Set(db.prepare("SELECT friend_id FROM friends WHERE user_id = ?").all(req.user.id).map(r => r.friend_id));
  res.json(rows.map(u => ({ ...personView(u), added: mine.has(u.id) })));
});
app.get("/api/friends", auth, premium, (req, res) => {
  const out = db.prepare("SELECT friend_id id FROM friends WHERE user_id = ?").all(req.user.id).map(r => r.id);
  const inn = db.prepare("SELECT user_id id FROM friends WHERE friend_id = ?").all(req.user.id).map(r => r.id);
  const ids = [...new Set([...out, ...inn])];
  const O = new Set(out), I = new Set(inn);
  res.json(ids.map(id => db.prepare("SELECT * FROM users WHERE id = ?").get(id)).filter(Boolean).map(u => ({ ...personView(u), added: O.has(u.id), addedMe: I.has(u.id) })));
});
app.post("/api/friends", auth, premium, (req, res) => {
  const id = req.body.id | 0; const u = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
  if (!u || id === req.user.id) return res.status(400).json({ error: "Persona no encontrada." });
  db.prepare("INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)").run(req.user.id, id);
  logEvent(req.user.id, "friend_add");
  const tl0 = db.prepare("SELECT lang FROM users WHERE id = ?").get(id).lang; const tl = tl0 === "en";
  sendPush(id, tl ? { title: `${displayName(req.user)} added you`, body: "You can now challenge each other in Taldea.", url: "/#taldea", tag: "friend" } : tl0 === "fr" ? { title: `${displayName(req.user)} t'a ajouté·e`, body: "Vous pouvez maintenant vous défier dans Taldea.", url: "/#taldea", tag: "friend" } : { title: `${displayName(req.user)} te ha añadido`, body: "Ya podéis retaros en Taldea.", url: "/#taldea", tag: "friend" }, "challenges").catch(() => {});
  res.json({ ok: true });
});
app.post("/api/friends/remove", auth, premium, (req, res) => { db.prepare("DELETE FROM friends WHERE user_id = ? AND friend_id = ?").run(req.user.id, req.body.id | 0); res.json({ ok: true }); });

// ---------- repetición espaciada ----------
app.get("/api/items", auth, (req, res) => res.json(db.prepare("SELECT key, eu, es, lesson_id, interval, ease, due, reps, lapses, last FROM items WHERE user_id = ?").all(req.user.id)));
app.post("/api/items/introduce", auth, (req, res) => {
  const today = madridDay();
  const ins = db.prepare("INSERT OR IGNORE INTO items (user_id, key, eu, es, lesson_id, due) VALUES (?, ?, ?, ?, ?, ?)");
  const list = Array.isArray(req.body.items) ? req.body.items.slice(0, 200) : [];
  const tx = db.transaction(() => { for (const it of list) if (it && it.key && it.eu && it.es && lessonAllowed(Object.assign(req.user, { _preview: !!(req.cookies && req.cookies.ep_app === "1") }), it.lesson_id)) ins.run(req.user.id, String(it.key).slice(0, 120), String(it.eu).slice(0, 200), String(it.es).slice(0, 200), it.lesson_id ? String(it.lesson_id) : null, today); });
  tx();
  res.json(itemStats(req.user.id));
});
// grade: 0 fallo · 1 difícil (con ayuda) · 2 bien · 3 fácil
app.post("/api/review", auth, (req, res) => {
  const { key, grade, eu, es, lesson_id } = req.body;
  if (!key || ![0, 1, 2, 3].includes(grade)) return res.status(400).json({ error: "Revisión inválida." });
  const today = madridDay();
  let it = db.prepare("SELECT * FROM items WHERE user_id = ? AND key = ?").get(req.user.id, key);
  if (!it) { if (!eu || !es) return res.status(400).json({ error: "Ítem desconocido." }); it = { interval: 0, ease: 2.3, reps: 0, lapses: 0, eu, es, lesson_id: lesson_id || null }; }
  let { interval, ease, reps, lapses } = it;
  if (grade === 0) { lapses++; interval = 0; ease = Math.max(1.3, ease - 0.2); }
  else if (grade === 1) { interval = interval < 1 ? 1 : Math.max(1, Math.round(interval * 1.2)); ease = Math.max(1.3, ease - 0.05); }
  else if (grade === 2) { interval = interval < 1 ? 1 : interval < 3 ? 3 : Math.round(interval * ease); }
  else { interval = interval < 1 ? 2 : interval < 3 ? 5 : Math.round(interval * ease * 1.3); ease = Math.min(3, ease + 0.1); }
  reps++;
  const due = interval === 0 ? today : addDays(today, interval);
  db.prepare(`INSERT INTO items (user_id, key, eu, es, lesson_id, interval, ease, due, reps, lapses, last) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, key) DO UPDATE SET interval = excluded.interval, ease = excluded.ease, due = excluded.due, reps = excluded.reps, lapses = excluded.lapses, last = excluded.last`)
    .run(req.user.id, key, it.eu, it.es, it.lesson_id, interval, ease, due, reps, lapses, today);
  const gained = [0, 5, 10, 10][grade];
  if (gained) db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(gained, req.user.id);
  res.json({ key, interval, due, reps, lapses, gained, items: itemStats(req.user.id) });
});

// ---------- rondas (día practicado, racha, lección) ----------
app.post("/api/round", auth, (req, res) => {
  const { lessonId, ok, total } = req.body;
  if (!Number.isInteger(ok) || !Number.isInteger(total) || total < 1 || ok < 0 || ok > total) return res.status(400).json({ error: "Resultado inválido." });
  const today = madridDay(), yesterday = madridDay(-1);
  const u = req.user; let streak = u.streak;
  if (u.last_day !== today) streak = u.last_day === yesterday ? u.streak + 1 : 1;
  db.transaction(() => {
    db.prepare("UPDATE users SET streak = ?, last_day = ? WHERE id = ?").run(streak, today, u.id);
    if (lessonId) db.prepare(`INSERT INTO progress (user_id, lesson_id, rounds, best) VALUES (?, ?, 1, ?) ON CONFLICT(user_id, lesson_id) DO UPDATE SET rounds = rounds + 1, best = MAX(best, excluded.best)`).run(u.id, lessonId, ok);
    db.prepare("INSERT INTO rounds (user_id, lesson_id, ok, total, day) VALUES (?, ?, ?, ?, ?)").run(u.id, lessonId || null, ok, total, today);
  })();
  logEvent(u.id, "round", { lessonId: lessonId || null, ok, total });
  res.json(profile(db.prepare("SELECT * FROM users WHERE id = ?").get(u.id)));
});
// Progreso en las fichas de gramática: transformaciones completadas por ficha (solo sube, nunca baja).
app.post("/api/gram", auth, (req, res) => {
  const cards = req.body && typeof req.body.cards === "object" && req.body.cards ? req.body.cards : {};
  const up = db.prepare("INSERT INTO grammar (user_id, card_id, done) VALUES (?, ?, ?) ON CONFLICT(user_id, card_id) DO UPDATE SET done = MAX(done, excluded.done)");
  let n = 0;
  db.transaction(() => { for (const [id, done] of Object.entries(cards)) { if (/^g-[a-z0-9-]{1,40}$/.test(id) && Number.isInteger(done) && done > 0 && done <= 50) { up.run(req.user.id, id, done); n++; } } })();
  const gram = {};
  for (const g of db.prepare("SELECT card_id, done FROM grammar WHERE user_id = ?").all(req.user.id)) gram[g.card_id] = g.done;
  res.json({ ok: true, saved: n, gram });
});
app.post("/api/weak", auth, (req, res) => {
  const weak = Array.isArray(req.body.weak) ? req.body.weak.filter(w => Array.isArray(w) && w.length === 2).slice(0, 200) : [];
  db.prepare("UPDATE users SET weak = ? WHERE id = ?").run(JSON.stringify(weak), req.user.id);
  res.json({ ok: true, weak });
});

// ---------- multijugador ----------
const chView = (c, meId) => {
  const from = db.prepare("SELECT name FROM users WHERE id = ?").get(c.from_id), to = db.prepare("SELECT name FROM users WHERE id = ?").get(c.to_id);
  return { id: c.id, kind: c.kind, fromId: c.from_id, toId: c.to_id, from: from ? from.name : "?", to: to ? to.name : "?", mine: c.from_id === meId, forMe: c.to_id === meId, payload: J(c.payload, {}), fromResult: J(c.from_result, null), toResult: J(c.to_result, null), status: c.status, createdAt: c.created_at };
};
app.get("/api/challenges", auth, premium, (req, res) => {
  const rows = db.prepare("SELECT * FROM challenges WHERE from_id = ? OR to_id = ? ORDER BY id DESC LIMIT 40").all(req.user.id, req.user.id);
  res.json(rows.map(c => chView(c, req.user.id)));
});
app.post("/api/challenges", auth, premium, (req, res) => {
  const to = db.prepare("SELECT id FROM users WHERE id = ?").get(req.body.toId | 0);
  if (!to || to.id === req.user.id) return res.status(400).json({ error: "Elige a otra persona." });
  const kind = req.body.kind === "task" ? "task" : "duel";
  const toRow = db.prepare("SELECT open_duel FROM users WHERE id = ?").get(to.id);
  if (!circleIds(req.user.id).has(to.id) && !(kind === "duel" && toRow.open_duel)) return res.status(403).json({ error: "Solo puedes retar a gente de tu círculo o a quien esté disponible para retos." });
  const payload = req.body.payload && typeof req.body.payload === "object" ? req.body.payload : {};
  const info = db.prepare("INSERT INTO challenges (from_id, to_id, kind, payload, from_result) VALUES (?, ?, ?, ?, ?)").run(req.user.id, to.id, kind, JSON.stringify(payload), req.body.fromResult ? JSON.stringify(req.body.fromResult) : null);
  const from = displayName(req.user);
  logEvent(req.user.id, "challenge", { kind });
  const lg = db.prepare("SELECT lang FROM users WHERE id = ?").get(to.id).lang; const en = lg === "en", fr = lg === "fr";
  sendPush(to.id, kind === "task" ? (en ? { title: `${from} sent you a task`, body: "Confirm whether what they wrote is right. Taldea → History.", url: "/#taldea", tag: "challenge" } : fr ? { title: `${from} t'envoie une tâche`, body: "Confirme si ce qu'il/elle a écrit est juste. Taldea → Historia.", url: "/#taldea", tag: "challenge" } : { title: `${from} te manda una tarea`, body: "Confirma si lo que escribió está bien. Taldea → Historia.", url: "/#taldea", tag: "challenge" })
    : (en ? { title: `${from} challenges you! ⚔️`, body: payload.transform ? "6 transformations. Accept?" : "6 phrases, typed. Accept?", url: "/#taldea", tag: "challenge" } : fr ? { title: `${from} te défie ! ⚔️`, body: payload.transform ? "6 transformations. Tu acceptes ?" : "6 phrases à écrire. Tu acceptes ?", url: "/#taldea", tag: "challenge" } : { title: `${from} te reta! ⚔️`, body: payload.transform ? "6 transformaciones. ¿Aceptas?" : "6 frases escribiendo. ¿Aceptas?", url: "/#taldea", tag: "challenge" }), "challenges").catch(() => {});
  res.json(chView(db.prepare("SELECT * FROM challenges WHERE id = ?").get(info.lastInsertRowid), req.user.id));
});
// Reto a una persona al azar entre quienes se han marcado disponibles (activas en los últimos 21 días).
app.post("/api/challenges/random", auth, premium, (req, res) => {
  const since = madridDay(-21);
  const cands = db.prepare(`SELECT id FROM users WHERE open_duel = 1 AND id != ? AND last_seen >= ?
    AND id NOT IN (SELECT to_id FROM challenges WHERE from_id = ? AND status = 'open')`).all(req.user.id, since, req.user.id);
  if (!cands.length) return res.status(404).json({ error: "Ahora mismo no hay nadie disponible. Prueba más tarde o añade gente a tu círculo.", none: true });
  const to = cands[Math.floor(Math.random() * cands.length)];
  const payload = req.body.payload && typeof req.body.payload === "object" ? req.body.payload : {};
  const info = db.prepare("INSERT INTO challenges (from_id, to_id, kind, payload, from_result) VALUES (?, ?, 'duel', ?, ?)").run(req.user.id, to.id, JSON.stringify({ ...payload, random: true }), req.body.fromResult ? JSON.stringify(req.body.fromResult) : null);
  logEvent(req.user.id, "challenge", { kind: "duel", random: true });
  const from = displayName(req.user); const lg = db.prepare("SELECT lang FROM users WHERE id = ?").get(to.id).lang; const en = lg === "en", fr = lg === "fr";
  sendPush(to.id, en ? { title: `${from} challenges you! ⚔️`, body: payload.transform ? "6 transformations. Accept?" : "6 phrases, typed. Accept?", url: "/#taldea", tag: "challenge" } : fr ? { title: `${from} te défie ! ⚔️`, body: payload.transform ? "6 transformations. Tu acceptes ?" : "6 phrases à écrire. Tu acceptes ?", url: "/#taldea", tag: "challenge" } : { title: `${from} te reta! ⚔️`, body: payload.transform ? "6 transformaciones. ¿Aceptas?" : "6 frases escribiendo. ¿Aceptas?", url: "/#taldea", tag: "challenge" }, "challenges").catch(() => {});
  res.json(chView(db.prepare("SELECT * FROM challenges WHERE id = ?").get(info.lastInsertRowid), req.user.id));
});
app.get("/api/challenges/open-count", auth, (req, res) => res.json({ n: db.prepare("SELECT COUNT(*) n FROM users WHERE open_duel = 1 AND id != ? AND last_seen >= ?").get(req.user.id, madridDay(-21)).n }));
app.post("/api/challenges/:id/result", auth, premium, (req, res) => {
  const c = db.prepare("SELECT * FROM challenges WHERE id = ?").get(req.params.id);
  if (!c || (c.from_id !== req.user.id && c.to_id !== req.user.id)) return res.status(404).json({ error: "Reto no encontrado." });
  const col = c.from_id === req.user.id ? "from_result" : "to_result";
  const result = req.body.result && typeof req.body.result === "object" ? req.body.result : {};
  db.prepare(`UPDATE challenges SET ${col} = ? WHERE id = ?`).run(JSON.stringify(result), c.id);
  const c2 = db.prepare("SELECT * FROM challenges WHERE id = ?").get(c.id);
  if (c2.from_result && c2.to_result) {
    db.prepare("UPDATE challenges SET status = 'done' WHERE id = ?").run(c.id);
    const other = c.from_id === req.user.id ? c.to_id : c.from_id; const me = displayName(req.user);
    const a = J(c2.from_result, {}), b = J(c2.to_result, {});
    const lg = db.prepare("SELECT lang FROM users WHERE id = ?").get(other).lang; const en = lg === "en", fr = lg === "fr";
    const body = c.kind === "task" ? (b.ok ? (en ? `${me} confirms: correct ✓` : fr ? `${me} confirme : correct ✓` : `${me} confirma: correcto ✓`) : (en ? `${me} corrected it: ${b.fix || ""}` : fr ? `${me} l'a corrigé : ${b.fix || ""}` : `${me} lo ha corregido: ${b.fix || ""}`)) : (en ? `${me} has played: ${a.score}/${a.total} vs ${b.score}/${b.total}. See the score.` : fr ? `${me} a joué : ${a.score}/${a.total} vs ${b.score}/${b.total}. Regarde le score.` : `${me} ya ha jugado: ${a.score}/${a.total} vs ${b.score}/${b.total}. Mira el marcador.`);
    sendPush(other, { title: c.kind === "task" ? (en ? "Task reviewed" : fr ? "Tâche vérifiée" : "Tarea revisada") : "Erronka amaituta ⚔️", body, url: "/#taldea", tag: "challenge" }, "challenges").catch(() => {});
  }
  res.json(chView(db.prepare("SELECT * FROM challenges WHERE id = ?").get(c.id), req.user.id));
});

// ---------- admin (ADMIN_KEY en Railway) ----------
// Taldea (círculo, retos, ranking) es Premium.
function premium(req, res, next) { if (!premiumOf(req.user).active) return res.status(402).json({ error: "Taldea es parte de Premium.", premium: true }); next(); }
// Intentos fallidos de admin por IP: 20 por hora y después se bloquea esa IP una hora (contra fuerza bruta).
const ADMIN_FAILS = new Map();
function admin(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) return res.status(503).json({ error: "ADMIN_KEY no configurada." });
  const ip = req.ip || "?", now = Date.now(); const f = ADMIN_FAILS.get(ip) || { n: 0, t: now }; if (now - f.t > 3600000) { f.n = 0; f.t = now; }
  if (f.n >= 20) return res.status(429).json({ error: "Demasiados intentos. Vuelve a probar en una hora." });
  const given = String(req.get("x-admin-key") || req.query.key || (req.body && req.body.key) || "");
  if (!given || given.length !== key.length || !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(key))) { f.n++; f.t = f.t || now; ADMIN_FAILS.set(ip, f); if (f.n === 20) console.error(`Admin: IP ${ip} bloqueada una hora por intentos fallidos`); return res.status(403).json({ error: "Clave incorrecta." }); }
  next();
}
app.get("/api/admin/users", admin, (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const rows = q ? db.prepare("SELECT * FROM users WHERE lower(name) LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT 200").all("%" + q + "%", "%" + q + "%")
                 : db.prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT 200").all();
  res.json(rows.map(u => ({ id: u.id, name: u.name, email: u.email, xp: u.xp, streak: u.streak, last_day: u.last_day, last_seen: u.last_seen, created_at: u.created_at, profile: J(u.profile, {}), items: itemStats(u.id), premium: premiumOf(u) })));
});
function deleteUser(id) {
  // La suscripción de Google Play sigue viva en Google (se cancela desde Play); aquí solo se borran los datos del suscriptor en RevenueCat.
  if (RC_SECRET_KEY) fetch("https://api.revenuecat.com/v1/subscribers/" + encodeURIComponent(rcUserId(id)), { method: "DELETE", headers: { Authorization: "Bearer " + RC_SECRET_KEY } }).catch(e => console.error("RevenueCat: no se pudo borrar el suscriptor:", e.message));
  db.transaction(() => {
    for (const t of ["gift_redemptions"]) db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(id);
    for (const t of ["sessions", "progress", "grammar", "rounds", "items", "push_subs", "events"]) db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(id);
    db.prepare("DELETE FROM friends WHERE user_id = ? OR friend_id = ?").run(id, id);
    db.prepare("DELETE FROM challenges WHERE from_id = ? OR to_id = ?").run(id, id);
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
  })();
}
app.post("/api/admin/delete-user", admin, (req, res) => {
  const u = db.prepare("SELECT id FROM users WHERE id = ? OR email = ?").get(req.body.id | 0, normEmail(req.body.email));
  if (!u) return res.status(404).json({ error: "No existe ese usuario." });
  deleteUser(u.id);
  res.json({ ok: true });
});
// Borrado de cuenta por el propio usuario (requisito de Google Play / App Store): confirma escribiendo su email.
app.post("/api/account/delete", auth, (req, res) => {
  if (normEmail(req.body.email) !== req.user.email) return res.status(400).json({ error: "Escribe exactamente tu correo para confirmar." });
  logEvent(null, "account_deleted", { days: Math.round((Date.now() - new Date(req.user.created_at + "Z").getTime()) / 86400000) });
  deleteUser(req.user.id);
  res.clearCookie("session");
  res.json({ ok: true });
});
// Copia de seguridad de la base de datos (descarga un fichero SQLite consistente).
app.post("/api/admin/gift", admin, (req, res) => {
  const days = Math.max(1, Math.min(3650, +req.body.days || 30)), uses = Math.max(1, Math.min(10000, +req.body.uses || 1)), note = String(req.body.note || "").slice(0, 120);
  const code = (req.body.code ? String(req.body.code).toUpperCase().replace(/[^A-Z0-9-]/g, "") : "EP-" + crypto.randomBytes(3).toString("hex").toUpperCase()).slice(0, 24);
  try { db.prepare("INSERT INTO gift_codes (code, days, max_uses, note) VALUES (?, ?, ?, ?)").run(code, days, uses, note); } catch (e) { return res.status(409).json({ error: "Ese código ya existe." }); }
  res.json({ code, days, uses, note });
});
// Gastos del proyecto (para ver qué cuesta hacer la app)
app.get("/api/admin/expenses", admin, (req, res) => res.json(db.prepare("SELECT * FROM expenses ORDER BY day DESC, id DESC").all()));
app.post("/api/admin/expenses", admin, (req, res) => {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(req.body.day || "") ? req.body.day : madridDay(); const concept = String(req.body.concept || "").trim().slice(0, 120); const amount = +req.body.amount;
  if (!concept || !(amount > 0)) return res.status(400).json({ error: "Concepto e importe obligatorios." });
  const cur = ["EUR", "USD"].includes(String(req.body.currency).toUpperCase()) ? String(req.body.currency).toUpperCase() : "EUR";
  const rec = ["mensual", "anual"].includes(req.body.recurring) ? req.body.recurring : null;
  const r = db.prepare("INSERT INTO expenses (day, concept, amount, currency, recurring, note) VALUES (?, ?, ?, ?, ?, ?)").run(day, concept, amount, cur, rec, String(req.body.note || "").slice(0, 200));
  res.json({ id: r.lastInsertRowid });
});
app.post("/api/admin/expenses/update", admin, (req, res) => {
  const x = db.prepare("SELECT * FROM expenses WHERE id = ?").get(+req.body.id); if (!x) return res.status(404).json({ error: "No existe." });
  const day = /^\d{4}-\d{2}-\d{2}$/.test(req.body.day || "") ? req.body.day : x.day; const concept = String(req.body.concept ?? x.concept).trim().slice(0, 120) || x.concept;
  const amount = +req.body.amount > 0 ? +req.body.amount : x.amount; const cur = ["EUR", "USD"].includes(String(req.body.currency).toUpperCase()) ? String(req.body.currency).toUpperCase() : x.currency;
  const rec = ["mensual", "anual"].includes(req.body.recurring) ? req.body.recurring : null; const note = req.body.note === undefined ? x.note : String(req.body.note).slice(0, 200);
  db.prepare("UPDATE expenses SET day = ?, concept = ?, amount = ?, currency = ?, recurring = ?, note = ? WHERE id = ?").run(day, concept, amount, cur, rec, note, x.id); res.json({ ok: true });
});
app.post("/api/admin/expenses/delete", admin, (req, res) => { db.prepare("DELETE FROM expenses WHERE id = ?").run(+req.body.id); res.json({ ok: true }); });
app.get("/api/admin/gifts", admin, (req, res) => res.json(db.prepare("SELECT * FROM gift_codes ORDER BY created_at DESC LIMIT 200").all()));
app.post("/api/admin/grant", admin, (req, res) => {
  const u = db.prepare("SELECT id FROM users WHERE email = ?").get(normEmail(req.body.email)); if (!u) return res.status(404).json({ error: "No existe ese usuario." });
  const until = addPremiumDays(u.id, Math.max(1, Math.min(3650, +req.body.days || 30)), "gift"); logEvent(u.id, "premium_granted", { days: req.body.days }); res.json({ ok: true, until });
});
app.get("/api/admin/backup", admin, async (req, res) => {
  const tmp = path.join(path.dirname(DB_PATH), `backup-${madridDay()}.db`);
  try { fs.rmSync(tmp, { force: true }); await db.backup(tmp); res.download(tmp, `euskara-${madridDay()}.db`, () => fs.rmSync(tmp, { force: true })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
// ---------- copias de seguridad automáticas ----------
// Cada día (a partir de las 04:00, hora de Madrid) se guarda una copia comprimida de la base de datos en <volumen>/backups,
// y se conservan las últimas BACKUP_KEEP (14 por defecto). También al arrancar si hoy aún no hay copia. Se descargan desde /admin.
const BACKUP_DIR = path.join(path.dirname(DB_PATH), "backups"), BACKUP_KEEP = Math.max(1, +process.env.BACKUP_KEEP || 14);
const zlib = require("zlib");
async function runBackup(reason) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const day = madridDay(), tmp = path.join(BACKUP_DIR, `.tmp-${day}.db`), out = path.join(BACKUP_DIR, `euskara-${day}.db.gz`);
  fs.rmSync(tmp, { force: true }); await db.backup(tmp);
  await new Promise((ok, ko) => fs.createReadStream(tmp).pipe(zlib.createGzip({ level: 6 })).pipe(fs.createWriteStream(out + ".part")).on("finish", ok).on("error", ko));
  fs.renameSync(out + ".part", out); fs.rmSync(tmp, { force: true });
  const all = listBackups(); for (const b of all.slice(BACKUP_KEEP)) fs.rmSync(path.join(BACKUP_DIR, b.name), { force: true });
  setting("backup_last", day); console.log(`Copia de seguridad (${reason}): ${out} ${(fs.statSync(out).size / 1024).toFixed(0)} kB; se conservan ${Math.min(all.length, BACKUP_KEEP)}`);
  return out;
}
function listBackups() { try { return fs.readdirSync(BACKUP_DIR).filter(f => /^euskara-\d{4}-\d{2}-\d{2}\.db\.gz$/.test(f)).sort().reverse().map(name => ({ name, bytes: fs.statSync(path.join(BACKUP_DIR, name)).size })); } catch (e) { return []; } }
async function backupTick(reason) {
  const hour = parseInt(new Date().toLocaleTimeString("en-GB", { timeZone: process.env.TZ_NAME || "Europe/Madrid", hour: "2-digit", hour12: false }));
  if (setting("backup_last") === madridDay() || (hour < 4 && reason !== "arranque")) return;
  try { await runBackup(reason); } catch (e) { console.error("Copia de seguridad:", e.message); }
}
if (process.env.BACKUPS !== "0") { setTimeout(() => backupTick("arranque"), 20000); setInterval(() => backupTick("diaria"), 30 * 60000); }
app.get("/api/admin/backups", admin, (req, res) => res.json({ dir: BACKUP_DIR, keep: BACKUP_KEEP, last: setting("backup_last") || null, files: listBackups() }));
app.post("/api/admin/backups/run", admin, async (req, res) => { try { const f = await runBackup("manual"); res.json({ ok: true, file: path.basename(f), files: listBackups() }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get("/api/admin/backups/:name", admin, (req, res) => { const n = req.params.name; if (!/^euskara-\d{4}-\d{2}-\d{2}\.db\.gz$/.test(n)) return res.status(400).end(); res.download(path.join(BACKUP_DIR, n), n); });
// Métricas de producto: altas, activos, retención, embudo, lecciones y frases difíciles.
// ¿Está la base de datos en un volumen persistente? Se busca el punto de montaje más largo que contenga DB_PATH
// (en Railway el volumen es un montaje aparte; el disco del contenedor es "/" u overlay y se pierde en cada deploy).
function storageInfo() {
  const dir = path.resolve(path.dirname(DB_PATH)); let mount = "/", dev = "";
  try { for (const line of fs.readFileSync("/proc/mounts", "utf8").split("\n")) { const [d, mp] = line.split(" "); if (mp && (dir === mp || dir.startsWith(mp.replace(/\/$/, "") + "/")) && mp.length > mount.length) { mount = mp; dev = d; } } } catch (e) {}
  const onVolume = mount !== "/" && !/^overlay|^tmpfs/.test(dev);
  const sz = f => { try { return fs.statSync(f).size; } catch (e) { return 0; } };
  let audioFiles = 0, audioBytes = 0; try { for (const f of fs.readdirSync(AUDIO_DIR)) { audioFiles++; audioBytes += sz(path.join(AUDIO_DIR, f)); } } catch (e) {}
  let free = null, total = null; try { const st = fs.statfsSync(dir); free = st.bavail * st.bsize; total = st.blocks * st.bsize; } catch (e) {}
  return { dbPath: DB_PATH, mount, dev, onVolume, dbBytes: sz(DB_PATH) + sz(DB_PATH + "-wal"), audioFiles, audioBytes, free, total };
}
app.get("/api/admin/metrics", admin, (req, res) => {
  const today = madridDay();
  const days = Array.from({ length: 30 }, (_, i) => madridDay(i - 29));
  const n = (sql, ...a) => db.prepare(sql).get(...a).n;
  const map = (rows, k = "day") => Object.fromEntries(rows.map(r => [r[k], r.n]));
  const signups = map(db.prepare("SELECT substr(created_at,1,10) day, COUNT(*) n FROM users WHERE created_at >= ? GROUP BY day").all(days[0]));
  const active = map(db.prepare("SELECT day, COUNT(DISTINCT user_id) n FROM rounds WHERE day >= ? GROUP BY day").all(days[0]));
  const roundsPer = map(db.prepare("SELECT day, COUNT(*) n FROM rounds WHERE day >= ? GROUP BY day").all(days[0]));
  const seen = map(db.prepare("SELECT day, COUNT(DISTINCT user_id) n FROM events WHERE day >= ? AND user_id IS NOT NULL GROUP BY day").all(days[0]));
  const totals = {
    users: n("SELECT COUNT(*) n FROM users"),
    newToday: signups[today] || 0, new7: n("SELECT COUNT(*) n FROM users WHERE created_at >= ?", madridDay(-6)),
    dau: active[today] || 0,
    wau: n("SELECT COUNT(DISTINCT user_id) n FROM rounds WHERE day >= ?", madridDay(-6)),
    mau: n("SELECT COUNT(DISTINCT user_id) n FROM rounds WHERE day >= ?", madridDay(-29)),
    roundsToday: roundsPer[today] || 0,
    reviewsToday: n("SELECT COUNT(*) n FROM items WHERE last = ?", today),
    pushUsers: n("SELECT COUNT(DISTINCT user_id) n FROM push_subs"),
    withFriends: n("SELECT COUNT(DISTINCT user_id) n FROM friends"),
    deleted30: n("SELECT COUNT(*) n FROM events WHERE name = 'account_deleted' AND day >= ?", days[0]),
    en: n("SELECT COUNT(*) n FROM users WHERE lang = 'en'"),
    fr: n("SELECT COUNT(*) n FROM users WHERE lang = 'fr'"),
  };
  // Embudo sobre todos los registrados
  const funnel = {
    registered: totals.users,
    profile: n("SELECT COUNT(*) n FROM users WHERE json_extract(profile, '$.gender') IS NOT NULL"),
    firstRound: n("SELECT COUNT(DISTINCT user_id) n FROM rounds"),
    threeDays: n("SELECT COUNT(*) n FROM (SELECT user_id FROM rounds GROUP BY user_id HAVING COUNT(DISTINCT day) >= 3)"),
    secondWeek: n("SELECT COUNT(DISTINCT r.user_id) n FROM rounds r JOIN users u ON u.id = r.user_id WHERE r.day >= date(substr(u.created_at,1,10), '+7 days')"),
    firm10: n("SELECT COUNT(*) n FROM (SELECT user_id FROM items WHERE interval >= 7 GROUP BY user_id HAVING COUNT(*) >= 10)"),
  };
  // Retención: de quienes se registraron hace N+1..N+30 días, % que practicó el día N o después (D1, D7, D30)
  const ret = (d) => {
    const cohort = db.prepare("SELECT id, substr(created_at,1,10) d0 FROM users WHERE substr(created_at,1,10) <= ? AND substr(created_at,1,10) >= ?").all(madridDay(-d), madridDay(-d - 30));
    if (!cohort.length) return null;
    const q = db.prepare("SELECT 1 FROM rounds WHERE user_id = ? AND day >= date(?, ?) LIMIT 1");
    const kept = cohort.filter(u => q.get(u.id, u.d0, `+${d} days`)).length;
    return { n: cohort.length, pct: Math.round(kept / cohort.length * 100) };
  };
  const retention = { d1: ret(1), d7: ret(7), d30: ret(30) };
  const lessons = db.prepare("SELECT lesson_id, COUNT(*) rounds, COUNT(DISTINCT user_id) users, ROUND(100.0*SUM(ok)/SUM(total)) acc FROM rounds WHERE lesson_id IS NOT NULL GROUP BY lesson_id ORDER BY rounds DESC").all();
  const hardest = db.prepare("SELECT eu, es, SUM(lapses) lapses, COUNT(*) users, ROUND(AVG(interval),1) avgInterval FROM items WHERE reps >= 2 GROUP BY key HAVING COUNT(*) >= 2 ORDER BY 1.0*SUM(lapses)/COUNT(*) DESC, lapses DESC LIMIT 20").all();
  const towns = db.prepare("SELECT lower(json_extract(profile,'$.town')) town, COUNT(*) n FROM users WHERE json_extract(profile,'$.town') != '' GROUP BY town ORDER BY n DESC LIMIT 12").all();
  // Premium: cuántos pagan, cuántos ven los planes y qué parte convierte; ingresos brutos mensuales estimados (antes de la comisión de Google).
  const paywall = map(db.prepare("SELECT day, COUNT(DISTINCT user_id) n FROM events WHERE name = 'paywall' AND day >= ? GROUP BY day").all(days[0]));
  const purchases = map(db.prepare("SELECT day, COUNT(*) n FROM events WHERE name = 'billing_initial_purchase' AND day >= ? GROUP BY day").all(days[0]));
  const PLAN_EUR = { month: 3.99, quarter: 9.99 / 3, half: 19.99 / 6 };
  const paying = db.prepare("SELECT sub_plan, COUNT(*) n FROM users WHERE premium_until >= ? AND premium_src = 'revenuecat' GROUP BY sub_plan").all(today);
  const ev30 = (name) => n("SELECT COUNT(*) n FROM events WHERE name = ? AND day >= ?", name, days[0]);
  const paywallUsers30 = n("SELECT COUNT(DISTINCT user_id) n FROM events WHERE name = 'paywall' AND day >= ?", days[0]);
  const premium = {
    active: n("SELECT COUNT(*) n FROM users WHERE premium_until >= ?", today),
    paying: paying.reduce((a, r) => a + r.n, 0), gift: n("SELECT COUNT(*) n FROM users WHERE premium_until >= ? AND premium_src = 'gift'", today),
    cancelling: n("SELECT COUNT(*) n FROM users WHERE premium_until >= ? AND premium_src = 'revenuecat' AND sub_cancel = 1", today),
    pastDue: n("SELECT COUNT(*) n FROM users WHERE sub_status = 'past_due'"),
    plans: Object.fromEntries(paying.map(r => [r.sub_plan || "?", r.n])),
    mrr: Math.round(paying.reduce((a, r) => a + r.n * (PLAN_EUR[r.sub_plan] || 0), 0) * 100) / 100,
    paywallToday: paywall[today] || 0, paywallUsers30,
    purchases30: ev30("billing_initial_purchase"), renewals30: ev30("billing_renewal"), cancellations30: ev30("billing_cancellation"), expirations30: ev30("billing_expiration"), gifts30: ev30("gift_redeemed"),
    everPaid: n("SELECT COUNT(DISTINCT user_id) n FROM events WHERE name = 'billing_initial_purchase'"),
    everPaywall: n("SELECT COUNT(DISTINCT user_id) n FROM events WHERE name = 'paywall'"),
    byFrom: Object.fromEntries(db.prepare("SELECT COALESCE(json_extract(meta, '$.from'), '?') k, COUNT(*) n FROM events WHERE name = 'paywall' GROUP BY k").all().map(r => [r.k, r.n])),
  };
  res.json({ today, days, series: { signups: days.map(d => signups[d] || 0), active: days.map(d => active[d] || 0), rounds: days.map(d => roundsPer[d] || 0), seen: days.map(d => seen[d] || 0), paywall: days.map(d => paywall[d] || 0), purchases: days.map(d => purchases[d] || 0) }, totals, funnel, retention, premium, lessons, hardest, towns, mail: MAIL_ON, push: PUSH_ON, billing: BILLING_ON, storage: storageInfo() });
});

// ---------- estadísticas (ranking global top 20 + tu círculo) ----------
app.get("/api/stats", auth, (req, res) => {
  const today = madridDay(), yesterday = madridDay(-1);
  const days = Array.from({ length: 7 }, (_, i) => madridDay(i - 6));
  const me = req.user.id; const circle = circleIds(me);
  const weekRows = db.prepare("SELECT user_id, SUM(ok)*10 xp FROM rounds WHERE day >= ? GROUP BY user_id ORDER BY xp DESC").all(days[0]);
  const W = Object.fromEntries(weekRows.map(r => [r.user_id, r.xp]));
  const activeCount = weekRows.length; const myRank = weekRows.findIndex(r => r.user_id === me) + 1;
  const totalUsers = db.prepare("SELECT COUNT(*) n FROM users").get().n;
  const ids = [...new Set([...weekRows.slice(0, 20).map(r => r.user_id), me, ...circle])];
  const totals = Object.fromEntries(db.prepare(`SELECT user_id, COUNT(*) n, SUM(ok) ok, SUM(total) total FROM rounds WHERE user_id IN (${ids.map(() => "?").join(",")}) GROUP BY user_id`).all(...ids).map(r => [r.user_id, r]));
  const week = db.prepare(`SELECT user_id, day, SUM(ok)*10 xp FROM rounds WHERE day >= ? AND user_id IN (${ids.map(() => "?").join(",")}) GROUP BY user_id, day`).all(days[0], ...ids);
  const lessonsDone = Object.fromEntries(db.prepare(`SELECT user_id, COUNT(*) n FROM progress WHERE rounds >= 3 AND user_id IN (${ids.map(() => "?").join(",")}) GROUP BY user_id`).all(...ids).map(r => [r.user_id, r.n]));
  const users = ids.map(id => db.prepare("SELECT id, name, xp, streak, last_day FROM users WHERE id = ?").get(id)).filter(Boolean).map(u => {
    const t = totals[u.id] || { n: 0, ok: 0, total: 0 }; const it = itemStats(u.id);
    const perDay = days.map(d => { const w = week.find(x => x.user_id === u.id && x.day === d); return w ? w.xp : 0; });
    return { id: u.id, name: u.name, me: u.id === me, friend: circle.has(u.id), xp: u.xp, streak: u.last_day === today || u.last_day === yesterday ? u.streak : 0, rounds: t.n,
      accuracy: t.total ? Math.round(t.ok / t.total * 100) : 0, lessonsDone: lessonsDone[u.id] || 0, learned: it.learned, consolidated: it.consolidated,
      weekXp: W[u.id] || 0, perDay, practicedToday: u.last_day === today };
  });
  const xs = weekRows.map(r => r.xp).sort((a, b) => a - b); const median = xs.length ? xs[Math.floor(xs.length / 2)] : 0;
  const myDays = db.prepare("SELECT COUNT(DISTINCT day) n FROM rounds WHERE user_id = ? AND day >= ?").get(me, days[0]).n;
  const avgDays = db.prepare("SELECT AVG(n) a FROM (SELECT COUNT(DISTINCT day) n FROM rounds WHERE day >= ? GROUP BY user_id)").get(days[0]).a || 0;
  const firmRows = db.prepare("SELECT user_id, SUM(CASE WHEN interval >= 7 THEN 1 ELSE 0 END) f FROM items GROUP BY user_id").all().map(r => r.f).sort((a, b) => a - b);
  const myFirm = itemStats(me).consolidated; const firmPct = firmRows.length ? Math.round(firmRows.filter(f => f <= myFirm).length / firmRows.length * 100) : 100;
  res.json({ days, users, rank: { position: myRank || null, active: activeCount, total: totalUsers, median, myWeek: W[me] || 0, myDays, avgDays: Math.round(avgDays * 10) / 10, firmPct } });
});

// ---------- audio en euskera (generado una vez por frase y guardado en disco) ----------
const AUDIO_DIR = path.join(path.dirname(DB_PATH), "audio");
fs.mkdirSync(AUDIO_DIR, { recursive: true });
const VOICE = process.env.TTS_VOICE || "eu-ES-AinhoaNeural";
const ttsProvider = process.env.GOOGLE_TTS_KEY ? "google" : process.env.AZURE_TTS_KEY ? "azure" : "edge";
const GOOGLE_VOICE = process.env.GOOGLE_TTS_VOICE || "eu-ES-Standard-A";
async function synthGoogle(text) {
  const r = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize?key=" + encodeURIComponent(process.env.GOOGLE_TTS_KEY), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { text }, voice: { languageCode: "eu-ES", name: GOOGLE_VOICE }, audioConfig: { audioEncoding: "MP3", speakingRate: 0.9 } })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.audioContent) throw new Error("Google TTS " + r.status + " " + JSON.stringify(d.error || d).slice(0, 200));
  return Buffer.from(d.audioContent, "base64");
}
const ssml = (text) => `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="eu-ES"><voice name="${VOICE}"><prosody rate="-10%">${text.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]))}</prosody></voice></speak>`;
async function synthAzure(text) {
  const region = process.env.AZURE_TTS_REGION || "westeurope";
  const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, { method: "POST", headers: { "Ocp-Apim-Subscription-Key": process.env.AZURE_TTS_KEY, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "euskara-praktika" }, body: ssml(text) });
  if (!r.ok) throw new Error("Azure TTS " + r.status + " " + (await r.text()).slice(0, 200));
  return Buffer.from(await r.arrayBuffer());
}
let edgeTTS = null, edgeVoiceOk = null;
async function synthEdge(text) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
  if (!edgeTTS) {
    const t = new MsEdgeTTS();
    if (edgeVoiceOk === null) {
      try { const voices = await t.getVoices(); edgeVoiceOk = voices.some(v => v.ShortName === VOICE); console.log(`Edge TTS: voz ${VOICE} ${edgeVoiceOk ? "disponible" : "NO disponible"}; voces eu-ES: ${voices.filter(v => /^eu-/i.test(v.Locale || v.ShortName)).map(v => v.ShortName).join(", ") || "ninguna"}`); }
      catch (e) { console.log("Edge TTS: no se pudo listar voces:", e.message); }
    }
    if (edgeVoiceOk === false) throw new Error(`La voz ${VOICE} no existe en Edge TTS. Configura AZURE_TTS_KEY (vía oficial).`);
    await t.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    edgeTTS = t;
  }
  const chunks = [];
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Edge TTS: tiempo agotado")), 15000);
    try {
      const { audioStream } = edgeTTS.toStream(text, { rate: 0.9 });
      audioStream.on("data", d => chunks.push(d));
      audioStream.on("end", () => { clearTimeout(timer); resolve(); });
      audioStream.on("close", () => { clearTimeout(timer); resolve(); });
      audioStream.on("error", e => { clearTimeout(timer); reject(e); });
    } catch (e) { clearTimeout(timer); reject(e); }
  });
  if (!chunks.length) { try { edgeTTS.close(); } catch (e) {} edgeTTS = null; throw new Error("Edge TTS devolvió audio vacío"); }
  return Buffer.concat(chunks);
}
process.on("unhandledRejection", e => { console.error("TTS/promesa no manejada:", e && (e.message || e)); try { edgeTTS && edgeTTS.close(); } catch (x) {} edgeTTS = null; });
const inflight = new Map();
let ttsBroken = false;
app.get("/api/tts/status", (req, res) => res.json({ ok: !ttsBroken && ttsProvider !== "edge", provider: ttsProvider, voice: ttsProvider === "google" ? GOOGLE_VOICE : VOICE }));
app.get("/api/tts", async (req, res) => {
  const text = String(req.query.text || "").trim().slice(0, 200);
  if (!text) return res.status(400).end();
  const file = path.join(AUDIO_DIR, crypto.createHash("sha1").update((ttsProvider === "google" ? GOOGLE_VOICE : VOICE) + "|" + text).digest("hex") + ".mp3");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  if (fs.existsSync(file)) return res.sendFile(file);
  try {
    if (!inflight.has(file)) inflight.set(file, (ttsProvider === "google" ? synthGoogle(text) : ttsProvider === "azure" ? synthAzure(text) : synthEdge(text)).then(buf => { fs.writeFileSync(file, buf); return buf; }).finally(() => inflight.delete(file)));
    const buf = await inflight.get(file);
    ttsBroken = false; res.type("audio/mpeg").send(buf);
  } catch (e) { ttsBroken = true; console.error("TTS error:", e && (e.message || JSON.stringify(e))); res.status(503).json({ error: "Audio no disponible ahora mismo." }); }
});

app.listen(PORT, () => console.log(`Euskara praktika en http://localhost:${PORT} (db: ${DB_PATH})`));
