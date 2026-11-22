// Correctores de euskera: /correctores
// Cada ficha (una frase única) se revisa UNA sola vez en total: al servirla se bloquea unos minutos
// para ese corrector y, al responder, pasa a "done" y no vuelve a salir para nadie.
const crypto = require("crypto");

const LOCK_MS = 10 * 60 * 1000;      // bloqueo mientras la tiene abierta
const FAST_MS = 1500;                // por debajo de esto se marca como "rápida" en /admin
const sha = s => crypto.createHash("sha256").update(String(s)).digest("hex");
const norm = s => String(s == null ? "" : s).trim().replace(/\s+/g, " ");
const key = (eu, es) => sha(norm(eu).toLowerCase() + "|" + norm(es).toLowerCase()).slice(0, 16);

module.exports = function mountReview({ app, db, admin, LESSON_DATA, setting, sendMail, mailHtml, SECRET, APP_PUBLIC, MAIL_ON, IS_PROD }) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS review_items (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    eu TEXT NOT NULL,
    es TEXT NOT NULL,
    ctx TEXT,
    module INTEGER,
    level TEXT,
    extra TEXT,
    seen INTEGER NOT NULL DEFAULT 1,
    ord INTEGER NOT NULL DEFAULT 0,
    present INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending',
    locked_by INTEGER,
    locked_until INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS review_pool ON review_items (status, locked_until, ord);
  CREATE INDEX IF NOT EXISTS review_mod ON review_items (module, status);

  CREATE TABLE IF NOT EXISTS reviewers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    code_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reviewer_sessions (token TEXT PRIMARY KEY, reviewer_id INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS review_verdicts (
    item_id TEXT PRIMARY KEY,
    reviewer_id INTEGER NOT NULL,
    verdict TEXT NOT NULL,
    fix_eu TEXT, fix_es TEXT, note TEXT,
    ms INTEGER,
    applied INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS review_verdicts_rev ON review_verdicts (reviewer_id);
  CREATE TABLE IF NOT EXISTS review_skips (item_id TEXT NOT NULL, reviewer_id INTEGER NOT NULL, PRIMARY KEY (item_id, reviewer_id));
  CREATE TABLE IF NOT EXISTS reviewer_payments (id INTEGER PRIMARY KEY AUTOINCREMENT, reviewer_id INTEGER NOT NULL, cents INTEGER NOT NULL, note TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
  `);

  {
    const icols = db.prepare("PRAGMA table_info(review_items)").all().map(c => c.name);
    if (!icols.includes("present")) { db.exec("ALTER TABLE review_items ADD COLUMN present INTEGER NOT NULL DEFAULT 1"); console.log("Correctores: columna review_items.present"); }
    if (!icols.includes("parts_hash")) { db.exec("ALTER TABLE review_items ADD COLUMN parts_hash TEXT"); console.log("Correctores: columna review_items.parts_hash"); }
  }
  // Datos de cobro del corrector: se piden la primera vez que entra.
  {
    const cols = db.prepare("PRAGMA table_info(reviewers)").all().map(c => c.name);
    const want = { payee: "TEXT", pay_method: "TEXT", pay_ref: "TEXT", onboarded: "INTEGER NOT NULL DEFAULT 0",
      billable: "INTEGER NOT NULL DEFAULT 1", tester: "INTEGER NOT NULL DEFAULT 0",
      mail_opt: "INTEGER NOT NULL DEFAULT 1", last_review: "TEXT", mail_last: "TEXT" };
    for (const [c, def] of Object.entries(want)) if (!cols.includes(c)) { db.exec(`ALTER TABLE reviewers ADD COLUMN ${c} ${def}`); console.log("Correctores: columna reviewers." + c); }
    // Antes había «no cobra» (billable = 0); ahora eso es un tester, que sí cobra en pantalla pero no cuenta.
    db.exec("UPDATE reviewers SET tester = 1, billable = 1 WHERE billable = 0");
  }

  // ---------- siembra: construye las fichas desde lessons.js (idempotente) ----------
  // Se relee lessons.js en cada siembra, para que «Actualizar fichas» recoja los cambios sin reiniciar.
  function freshData() {
    try {
      const fs = require("fs"), path = require("path");
      const w = {};
      new Function("window", fs.readFileSync(path.join(__dirname, "public", "lessons.js"), "utf8"))(w);
      if (w.LESSONS && w.LESSONS.length) return w;
    } catch (e) { console.error("Correctores: no se pudo releer lessons.js:", e.message); }
    return LESSON_DATA;
  }

  function buildItems() {
    const { MODULES = [], LESSONS = [], GRAMMAR = [], TRANSFORMS = {}, PARTS = {} } = freshData();
    const partsOf = eu => PARTS[norm(eu).toLowerCase()] || null;
    let lastLevel = "";
    const mod = {};
    for (const m of MODULES) {
      if (m.level) lastLevel = m.level;
      mod[m.id] = { ...m, level: m.season ? "" : (m.level || lastLevel) };
    }
    const lessonMod = Object.fromEntries(LESSONS.map(l => [l.id, l.module]));
    const out = new Map(); // id -> item (dedup por contenido)
    let n = 0;
    const add = (kind, eu, es, m, ctx, extra) => {
      eu = norm(eu); es = norm(es);
      if (!eu) return;
      const id = key(eu, es);
      const prev = out.get(id);
      if (prev) { prev.seen++; return; }
      const M = mod[m] || {};
      const parts = partsOf(eu);
      if (parts) extra = Object.assign({}, extra, { parts });
      out.set(id, { id, kind, eu, es, ctx, module: m || null, level: M.level || "",
        extra: extra ? JSON.stringify(extra) : null,
        parts_hash: parts ? sha(JSON.stringify(parts)).slice(0, 12) : null,
        seen: 1, ord: (m || 99) * 100000 + (n++) });
    };

    for (const L of LESSONS) {
      const ctx = `${L.eu} · ${L.title}`;
      (L.pairs || []).forEach(p => add("hiztegia", p[0], p[1], L.module, ctx));
      (L.sentences || []).forEach(p => add("esaldia", p[0], p[1], L.module, ctx, L.pattern ? { pattern: L.pattern } : null));
      (L.dialogue || []).forEach(p => add("elkarrizketa", p[1], p[2], L.module, ctx, { who: p[0] }));
      (L.tips || []).forEach(t => add("azalpena", t.t, t.b, L.module, ctx));
    }
    for (const g of GRAMMAR) {
      const m = lessonMod[(g.lessons || [])[0]];
      const ctx = `${g.eu} · ${g.title}`;
      ((g.table || {}).rows || []).forEach(r => add("gramatika", r[0], r[1], m, ctx));
      (g.examples || []).forEach(e => add("gramatika", e[0], e[1], m, ctx, g.summary ? { summary: g.summary } : null));
    }
    const srcMod = {};
    for (const L of LESSONS) {
      (L.pairs || []).forEach(p => { const k = norm(p[0]).toLowerCase(); if (srcMod[k] == null) srcMod[k] = L.module; });
      (L.sentences || []).forEach(p => { const k = norm(p[0]).toLowerCase(); if (srcMod[k] == null) srcMod[k] = L.module; });
    }
    for (const g of GRAMMAR) {
      const m = lessonMod[(g.lessons || [])[0]];
      (g.examples || []).forEach(e => { const k = norm(e[0]).toLowerCase(); if (srcMod[k] == null) srcMod[k] = m; });
      (g.drills || []).forEach(x => { const k = norm(x.from).toLowerCase(); if (srcMod[k] == null) srcMod[k] = m; });
    }
    for (const from of Object.keys(TRANSFORMS)) {
      const m = srcMod[norm(from).toLowerCase()] || null;
      for (const t of TRANSFORMS[from]) add("eraldaketa", t.to, t.es || "", m, from, { instr: t.i, from });
    }
    return [...out.values()];
  }

  // Siembra: las fichas que ya no están en lessons.js se marcan present = 0 y salen de la bolsa
  // (p. ej. una frase corregida: la vieja desaparece y la nueva entra como ficha nueva).
  function seed() {
    const items = buildItems();
    const ins = db.prepare(`INSERT INTO review_items (id, kind, eu, es, ctx, module, level, extra, seen, ord, present, parts_hash)
      VALUES (@id, @kind, @eu, @es, @ctx, @module, @level, @extra, @seen, @ord, 1, @parts_hash)
      ON CONFLICT(id) DO UPDATE SET seen = excluded.seen, ctx = excluded.ctx, module = excluded.module, level = excluded.level,
        extra = excluded.extra, present = 1, parts_hash = excluded.parts_hash`);
    // Una ficha ya revisada a la que se le añade (o se le cambia) la descomposición vuelve a la bolsa:
    // es la MISMA ficha, pero ahora tiene algo nuevo que mirar. No se crea una ficha aparte.
    const reopen = db.prepare(`UPDATE review_items SET status = 'pending', locked_by = NULL, locked_until = NULL
      WHERE id = ? AND status = 'done' AND IFNULL(parts_hash,'') <> IFNULL(?,'')`);
    const before = db.prepare("SELECT COUNT(*) c FROM review_items WHERE present = 1").get().c;
    let reopened = 0;
    db.transaction(() => {
      db.prepare("UPDATE review_items SET present = 0").run();
      items.forEach(i => { reopened += reopen.run(i.id, i.parts_hash).changes; ins.run(i); });
    })();
    const after = db.prepare("SELECT COUNT(*) c FROM review_items WHERE present = 1").get().c;
    const gone = db.prepare("SELECT COUNT(*) c FROM review_items WHERE present = 0").get().c;
    const added = db.prepare("SELECT COUNT(*) c FROM review_items WHERE present = 1 AND status = 'pending'").get().c;
    if (after !== before) console.log(`Correctores: ${after} fichas vivas (antes ${before}), ${gone} retiradas`);
    return { total: after, pending: added, gone, reopened, diff: after - before };
  }
  seed();

  const rate = () => (Number(setting("review_rate_cents")) || 2.5) / 100;

  // --- validación de los datos de cobro ---
  const cleanIban = s => String(s || "").replace(/[\s-]/g, "").toUpperCase();
  function validIban(s) {
    const v = cleanIban(s);
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v)) return false;
    const re = v.slice(4) + v.slice(0, 4);
    let rem = 0;
    for (const ch of re) {
      const part = /[0-9]/.test(ch) ? ch : String(ch.charCodeAt(0) - 55);
      for (const dch of part) rem = (rem * 10 + Number(dch)) % 97;
    }
    return rem === 1;
  }
  const cleanPhone = s => String(s || "").replace(/[\s-().]/g, "");
  const validPhone = s => /^\+?\d{9,15}$/.test(cleanPhone(s));
  const validEmail = s => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(String(s || "").trim());

  // Todos ven su dinero en pantalla, testers incluidos (para poder probar el flujo entero).
  // Lo que cambia es que el trabajo de un tester no cuenta en el coste real ni en la proyección.
  function earned(id) {
    const n = db.prepare("SELECT COUNT(*) n FROM review_verdicts WHERE reviewer_id = ?").get(id).n || 0;
    const paid = db.prepare("SELECT COALESCE(SUM(cents),0) c FROM reviewer_payments WHERE reviewer_id = ?").get(id).c || 0;
    const gross = Math.round(n * rate() * 100);
    return { n, gross: gross / 100, paid: paid / 100, owed: (gross - paid) / 100 };
  }

  // ---------- auth de corrector ----------
  const LOGIN_FAILS = new Map();
  function reviewer(req, res, next) {
    const t = req.cookies.rev;
    const row = t && db.prepare("SELECT reviewer_id FROM reviewer_sessions WHERE token = ?").get(t);
    if (!row) return res.status(401).json({ error: "Sartu zure kodearekin." });
    const r = db.prepare("SELECT * FROM reviewers WHERE id = ? AND active = 1").get(row.reviewer_id);
    if (!r) return res.status(401).json({ error: "Kode baliogabea." });
    req.reviewer = r;
    next();
  }

  app.post("/api/review/login", (req, res) => {
    const ip = req.ip || "?", now = Date.now();
    const f = LOGIN_FAILS.get(ip) || { n: 0, t: now };
    if (now - f.t > 3600000) { f.n = 0; f.t = now; }
    if (f.n >= 15) return res.status(429).json({ error: "Saiakera gehiegi. Saiatu ordubete barru." });
    const code = String((req.body && req.body.code) || "").trim();
    const r = code && db.prepare("SELECT * FROM reviewers WHERE code_hash = ? AND active = 1").get(sha(code));
    if (!r) { f.n++; LOGIN_FAILS.set(ip, f); return res.status(403).json({ error: "Kode baliogabea." }); }
    const token = crypto.randomBytes(32).toString("hex");
    db.prepare("INSERT INTO reviewer_sessions (token, reviewer_id) VALUES (?, ?)").run(token, r.id);
    res.cookie("rev", token, { httpOnly: true, sameSite: "lax", secure: !!(res.req && res.req.secure) || IS_PROD, maxAge: 180 * 86400000 });
    res.json({ ok: true, name: r.name });
  });
  app.post("/api/review/logout", (req, res) => {
    if (req.cookies.rev) db.prepare("DELETE FROM reviewer_sessions WHERE token = ?").run(req.cookies.rev);
    res.clearCookie("rev"); res.json({ ok: true });
  });

  // ---------- progreso ----------
  function myStats(id) {
    const v = db.prepare("SELECT COUNT(*) n, SUM(CASE WHEN verdict='fix' THEN 1 ELSE 0 END) fixes FROM review_verdicts WHERE reviewer_id = ?").get(id);
    const t = db.prepare("SELECT COUNT(*) total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) done FROM review_items WHERE present = 1").get();
    const n = v.n || 0, e = earned(id);
    return { done: n, fixes: v.fixes || 0, points: n, euros: e.gross, paid: e.paid, owed: e.owed, rate: rate(), total: t.total || 0, totalDone: t.done || 0 };
  }

  const pickSql = (byModule) => `SELECT * FROM review_items
    WHERE status = 'pending' AND present = 1
      AND (locked_until IS NULL OR locked_until < @now OR locked_by = @rev)
      AND id NOT IN (SELECT item_id FROM review_skips WHERE reviewer_id = @rev)
      ${byModule ? "AND module = @module" : ""}
    ORDER BY ord LIMIT 1`;

  function nextItem(revId, module) {
    const now = Date.now();
    const take = db.transaction(() => {
      const row = db.prepare(pickSql(!!module)).get({ now, rev: revId, module: module || null });
      if (!row) return null;
      db.prepare("UPDATE review_items SET locked_by = ?, locked_until = ? WHERE id = ?").run(revId, now + LOCK_MS, row.id);
      return row;
    });
    const row = take();
    if (!row) return null;
    return { id: row.id, kind: row.kind, eu: row.eu, es: row.es, ctx: row.ctx, module: row.module, level: row.level, extra: row.extra ? JSON.parse(row.extra) : null, seen: row.seen };
  }

  app.get("/api/review/me", reviewer, (req, res) => {
    const mods = db.prepare(`SELECT module, COUNT(*) total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) done
      FROM review_items WHERE module IS NOT NULL AND present = 1 GROUP BY module ORDER BY module`).all();
    const r = req.reviewer;
    res.json({
      name: r.name, ...myStats(r.id), modules: mods,
      onboarded: !!r.onboarded,
      profile: { email: r.email || "", payee: r.payee || "", pay_method: r.pay_method || "bizum", pay_ref: r.pay_ref || "" },
    });
  });

  // Datos de cobro: obligatorios antes de empezar.
  app.post("/api/review/profile", reviewer, (req, res) => {
    const b = req.body || {};
    const email = String(b.email || "").trim();
    const payee = String(b.payee || "").trim();
    const method = b.pay_method === "iban" ? "iban" : "bizum";
    const ref = String(b.pay_ref || "").trim();
    if (!validEmail(email)) return res.status(400).json({ error: "Helbide elektroniko baliogabea. · Correo no válido." });
    if (!payee) return res.status(400).json({ error: "Idatzi kontuaren titularra. · Falta el titular." });
    if (method === "iban" && !validIban(ref)) return res.status(400).json({ error: "IBAN baliogabea. Begiratu zenbakiak. · IBAN no válido: revisa los dígitos." });
    if (method === "bizum" && !validPhone(ref)) return res.status(400).json({ error: "Telefono baliogabea. · Teléfono no válido." });
    db.prepare("UPDATE reviewers SET email = ?, payee = ?, pay_method = ?, pay_ref = ?, onboarded = 1 WHERE id = ?")
      .run(email, payee, method, method === "iban" ? cleanIban(ref) : cleanPhone(ref), req.reviewer.id);
    res.json({ ok: true });
  });

  app.get("/api/review/next", reviewer, (req, res) => {
    if (!req.reviewer.onboarded) return res.json({ needsProfile: true, stats: myStats(req.reviewer.id) });
    const m = req.query.module ? +req.query.module : 0;
    res.json({ item: nextItem(req.reviewer.id, m), stats: myStats(req.reviewer.id) });
  });

  app.post("/api/review/verdict", reviewer, (req, res) => {
    if (!req.reviewer.onboarded) return res.status(403).json({ error: "Osatu zure kobratzeko datuak. · Completa tus datos de cobro." });
    const b = req.body || {};
    const id = String(b.id || "");
    const verdict = b.verdict === "fix" ? "fix" : "ok";
    const item = db.prepare("SELECT * FROM review_items WHERE id = ?").get(id);
    if (!item) return res.status(404).json({ error: "Ez dago." });
    if (item.status === "done") return res.json({ item: nextItem(req.reviewer.id, +b.module || 0), stats: myStats(req.reviewer.id), skipped: true });
    if (item.locked_by && item.locked_by !== req.reviewer.id && item.locked_until > Date.now())
      return res.json({ item: nextItem(req.reviewer.id, +b.module || 0), stats: myStats(req.reviewer.id), skipped: true });
    if (verdict === "fix" && !String(b.fix_eu || "").trim() && !String(b.fix_es || "").trim() && !String(b.note || "").trim())
      return res.status(400).json({ error: "Idatzi zuzenketa edo ohar bat." });
    db.transaction(() => {
      db.prepare(`INSERT INTO review_verdicts (item_id, reviewer_id, verdict, fix_eu, fix_es, note, ms)
        VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(item_id) DO NOTHING`)
        .run(id, req.reviewer.id, verdict, String(b.fix_eu || "").trim() || null, String(b.fix_es || "").trim() || null, String(b.note || "").trim() || null, Math.max(0, +b.ms || 0));
      db.prepare("UPDATE review_items SET status = 'done', locked_by = NULL, locked_until = NULL WHERE id = ?").run(id);
      db.prepare("UPDATE reviewers SET last_review = datetime('now') WHERE id = ?").run(req.reviewer.id);
    })();
    res.json({ item: nextItem(req.reviewer.id, +b.module || 0), stats: myStats(req.reviewer.id) });
  });

  app.post("/api/review/skip", reviewer, (req, res) => {
    const id = String((req.body && req.body.id) || "");
    if (id) db.transaction(() => {
      db.prepare("INSERT OR IGNORE INTO review_skips (item_id, reviewer_id) VALUES (?, ?)").run(id, req.reviewer.id);
      db.prepare("UPDATE review_items SET locked_by = NULL, locked_until = NULL WHERE id = ? AND locked_by = ?").run(id, req.reviewer.id);
    })();
    res.json({ item: nextItem(req.reviewer.id, +(req.body && req.body.module) || 0), stats: myStats(req.reviewer.id) });
  });

  // ---------- admin ----------
  app.get("/api/admin/review/stats", admin, (req, res) => {
    const t = db.prepare("SELECT COUNT(*) total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) done FROM review_items WHERE present = 1").get();
    const byKind = db.prepare("SELECT kind, COUNT(*) total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) done FROM review_items WHERE present = 1 GROUP BY kind ORDER BY kind").all();
    const byModule = db.prepare("SELECT module, COUNT(*) total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) done FROM review_items WHERE module IS NOT NULL AND present = 1 GROUP BY module ORDER BY module").all();
    const gone = db.prepare("SELECT COUNT(*) c FROM review_items WHERE present = 0").get().c;
    const billableDone = db.prepare("SELECT COUNT(*) c FROM review_verdicts v JOIN reviewers r ON r.id = v.reviewer_id WHERE r.tester = 0").get().c;
    const revs = db.prepare(`SELECT r.id, r.name, r.email, r.active, r.created_at, r.payee, r.pay_method, r.pay_ref, r.onboarded, r.tester, r.mail_opt, r.last_review,
        COUNT(v.item_id) n,
        SUM(CASE WHEN v.verdict='fix' THEN 1 ELSE 0 END) fixes,
        SUM(CASE WHEN v.ms > 0 AND v.ms < ? THEN 1 ELSE 0 END) fast
      FROM reviewers r LEFT JOIN review_verdicts v ON v.reviewer_id = r.id
      GROUP BY r.id ORDER BY n DESC, r.id`).all(FAST_MS);
    const r = rate();
    res.json({
      total: t.total || 0, done: t.done || 0, rate: r, fastMs: FAST_MS, gone,
      cost: +(billableDone * r).toFixed(2),
      projected: +((billableDone + Math.max(0, (t.total || 0) - (t.done || 0))) * r).toFixed(2),
      byKind, byModule,
      reviewers: revs.map(x => {
        const e = earned(x.id);
        return { ...x, n: x.n || 0, fixes: x.fixes || 0, fast: x.fast || 0, euros: e.gross, paid: e.paid, owed: e.owed };
      }),
    });
  });

  app.post("/api/admin/review/rate", admin, (req, res) => {
    const c = Math.max(0, Math.round((+(req.body && req.body.cents) || 0) * 100) / 100); // admite decimales (p. ej. 2,5 céntimos)
    setting("review_rate_cents", String(c));
    res.json({ ok: true, rate: c / 100 });
  });

  // Marcar como pagado: registra el importe que se le acaba de pagar (por defecto, todo lo pendiente).
  app.post("/api/admin/review/pay", admin, (req, res) => {
    const id = +(req.body && req.body.id);
    const r = db.prepare("SELECT id FROM reviewers WHERE id = ?").get(id);
    if (!r) return res.status(404).json({ error: "No existe." });
    const e = earned(id);
    const euros = req.body && req.body.euros != null ? +req.body.euros : e.owed;
    const cents = Math.round(euros * 100);
    if (!cents) return res.status(400).json({ error: "No hay nada pendiente." });
    db.prepare("INSERT INTO reviewer_payments (reviewer_id, cents, note) VALUES (?, ?, ?)")
      .run(id, cents, String((req.body && req.body.note) || "").trim() || null);
    res.json({ ok: true, ...earned(id) });
  });

  // Borrar las pruebas de un tester: sus respuestas vuelven a la bolsa como si no hubieran pasado.
  app.post("/api/admin/review/reset", admin, (req, res) => {
    const id = +(req.body && req.body.id);
    const r = db.prepare("SELECT id, tester FROM reviewers WHERE id = ?").get(id);
    if (!r) return res.status(404).json({ error: "No existe." });
    if (!r.tester) return res.status(400).json({ error: "Solo se pueden borrar las pruebas de un tester." });
    let freed = 0;
    db.transaction(() => {
      const ids = db.prepare("SELECT item_id FROM review_verdicts WHERE reviewer_id = ?").all(id).map(x => x.item_id);
      const back = db.prepare("UPDATE review_items SET status = 'pending', locked_by = NULL, locked_until = NULL WHERE id = ?");
      ids.forEach(i => { back.run(i); freed++; });
      db.prepare("DELETE FROM review_verdicts WHERE reviewer_id = ?").run(id);
      db.prepare("DELETE FROM review_skips WHERE reviewer_id = ?").run(id);
      db.prepare("DELETE FROM reviewer_payments WHERE reviewer_id = ?").run(id);
      db.prepare("UPDATE reviewers SET last_review = NULL, mail_last = NULL WHERE id = ?").run(id);
    })();
    res.json({ ok: true, freed });
  });

  app.get("/api/admin/review/payments", admin, (req, res) => res.json(
    db.prepare(`SELECT p.*, r.name FROM reviewer_payments p JOIN reviewers r ON r.id = p.reviewer_id ORDER BY p.created_at DESC LIMIT 200`).all()
  ));

  app.post("/api/admin/review/reviewers", admin, (req, res) => {
    const name = String((req.body && req.body.name) || "").trim();
    if (!name) return res.status(400).json({ error: "Falta el nombre." });
    const code = crypto.randomBytes(9).toString("base64url");
    const tester = req.body && req.body.tester ? 1 : 0; // el tester pasa por el mismo flujo, pero no cuenta y se puede borrar
    const r = db.prepare("INSERT INTO reviewers (name, email, code_hash, note, tester) VALUES (?, ?, ?, ?, ?)")
      .run(name, String((req.body && req.body.email) || "").trim() || null, sha(code), String((req.body && req.body.note) || "").trim() || null, tester);
    res.json({ ok: true, id: r.lastInsertRowid, name, code, tester }); // el código se muestra una sola vez
  });

  app.post("/api/admin/review/reviewers/toggle", admin, (req, res) => {
    const id = +(req.body && req.body.id);
    const r = db.prepare("SELECT active FROM reviewers WHERE id = ?").get(id);
    if (!r) return res.status(404).json({ error: "No existe." });
    db.prepare("UPDATE reviewers SET active = ? WHERE id = ?").run(r.active ? 0 : 1, id);
    if (r.active) db.prepare("DELETE FROM reviewer_sessions WHERE reviewer_id = ?").run(id);
    res.json({ ok: true, active: r.active ? 0 : 1 });
  });

  app.get("/api/admin/review/fixes", admin, (req, res) => {
    const only = req.query.applied === "1" ? 1 : 0;
    const rows = db.prepare(`SELECT v.item_id, v.verdict, v.fix_eu, v.fix_es, v.note, v.ms, v.applied, v.created_at,
        r.name reviewer, i.kind, i.eu, i.es, i.ctx, i.module, i.seen
      FROM review_verdicts v JOIN review_items i ON i.id = v.item_id JOIN reviewers r ON r.id = v.reviewer_id
      WHERE v.verdict = 'fix' AND v.applied = ? ORDER BY i.ord LIMIT 500`).all(only);
    res.json(rows);
  });

  app.post("/api/admin/review/fixes/applied", admin, (req, res) => {
    const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids.map(String) : [];
    const val = req.body && req.body.undo ? 0 : 1;
    const up = db.prepare("UPDATE review_verdicts SET applied = ? WHERE item_id = ?");
    db.transaction(() => ids.forEach(i => up.run(val, i)))();
    res.json({ ok: true, n: ids.length });
  });

  app.get("/api/admin/review/export", admin, (req, res) => {
    const rows = db.prepare(`SELECT v.*, i.kind, i.eu, i.es, i.ctx, i.module, i.seen, r.name reviewer
      FROM review_verdicts v JOIN review_items i ON i.id = v.item_id JOIN reviewers r ON r.id = v.reviewer_id ORDER BY i.ord`).all();
    res.setHeader("Content-Disposition", 'attachment; filename="correcciones.json"');
    res.json(rows);
  });

  app.post("/api/admin/review/reseed", admin, (req, res) => res.json(seed()));

  app.post("/api/admin/review/unlock", admin, (req, res) => {
    const r = db.prepare("UPDATE review_items SET locked_by = NULL, locked_until = NULL WHERE status = 'pending' AND locked_until IS NOT NULL").run();
    res.json({ ok: true, freed: r.changes });
  });

  // ---------- avisos por correo ----------
  // Dos motivos: han entrado fichas nuevas desde su última corrección, o llevan días sin entrar y queda trabajo.
  const INACTIVE_DAYS = 7, QUIET_DAYS = 7, NEW_QUIET_DAYS = 2;
  const revToken = id => require("crypto").createHmac("sha256", SECRET).update("rev-unsub:" + id).digest("hex").slice(0, 32);
  const revUnsubUrl = id => `${APP_PUBLIC()}/api/review/unsub?r=${id}&t=${revToken(id)}`;
  const daysSince = iso => iso ? (Date.now() - Date.parse(iso + "Z")) / 86400000 : Infinity;

  app.get("/api/review/unsub", (req, res) => {
    const id = +req.query.r;
    if (!id || req.query.t !== revToken(id)) return res.status(400).send("Esteka baliogabea.");
    db.prepare("UPDATE reviewers SET mail_opt = 0 WHERE id = ?").run(id);
    res.type("html").send(`<meta charset="utf-8"><div style="font:17px/1.6 system-ui;max-width:420px;margin:18vh auto;text-align:center;color:#161412">Ez dizugu gehiago idatziko.<br><span style="color:#6B675F">No te volveremos a escribir.</span></div>`);
  });

  async function reviewNudges() {
    if (!MAIL_ON) return 0;
    const pending = db.prepare("SELECT COUNT(*) c FROM review_items WHERE present = 1 AND status = 'pending'").get().c;
    if (!pending) return 0;
    const revs = db.prepare("SELECT * FROM reviewers WHERE active = 1 AND mail_opt = 1 AND email IS NOT NULL AND tester = 0").all();
    let sent = 0;
    for (const r of revs) {
      const quiet = daysSince(r.mail_last);
      const idle = daysSince(r.last_review);
      const fresh = r.last_review
        ? db.prepare("SELECT COUNT(*) c FROM review_items WHERE present = 1 AND status = 'pending' AND created_at > ?").get(r.last_review).c
        : 0;
      const reason = fresh > 0 && quiet >= NEW_QUIET_DAYS ? "new"
        : idle >= INACTIVE_DAYS && quiet >= QUIET_DAYS ? "idle" : null;
      if (!reason) continue;
      const money = (pending * rate()).toFixed(2).replace(".", ",");
      const title = reason === "new" ? "Fitxa berriak daude" : "Fitxak zain dituzu";
      const sub = reason === "new"
        ? `${fresh} fitxa berri gehitu dira. · Se han añadido ${fresh} fichas nuevas.`
        : `${pending} fitxa daude zain. · Quedan ${pending} fichas por revisar.`;
      const paras = [
        `Kaixo, ${r.name}!`,
        reason === "new"
          ? `Euskara Praktikan ${fresh} fitxa berri sartu dira zuzentzeko. Guztira ${pending} daude zain.`
          : `Azkenekoz sartu zinenetik denbora pasa da eta oraindik ${pending} fitxa daude zain.`,
        `Guztira ${money} € dira. Ez duzu dena batera egin behar: nahi dituzunak egin eta utzi.`,
      ];
      try {
        await sendMail(r.email, title + " · Euskara Praktika",
          paras.join("\n\n") + `\n\n${APP_PUBLIC()}/correctores`,
          mailHtml({ title, sub, paras, cta: { url: `${APP_PUBLIC()}/correctores`, label: "Zuzentzen hasi" },
            unsub: { text: "Ez baduzu abisurik nahi,", label: "kendu abisuak", url: revUnsubUrl(r.id) } }));
        db.prepare("UPDATE reviewers SET mail_last = datetime('now') WHERE id = ?").run(r.id);
        sent++;
      } catch (e) { console.error("Correctores: fallo al avisar a", r.email, e.message); }
    }
    if (sent) console.log(`Correctores: ${sent} avisos enviados`);
    return sent;
  }

  if (MAIL_ON && process.env.REVIEW_NUDGES !== "0") {
    setInterval(() => {
      const d = new Date();
      const h = parseInt(d.toLocaleTimeString("en-GB", { timeZone: process.env.TZ_NAME || "Europe/Madrid", hour: "2-digit", hour12: false }));
      if (h === 18 && d.getMinutes() === 20) reviewNudges().catch(e => console.error(e));
    }, 60 * 1000);
  }
  app.post("/api/admin/review/nudge", admin, async (req, res) => {
    try { res.json({ sent: await reviewNudges() }); } catch (e) { res.status(500).json({ error: e.message }); }
  });

  console.log("Correctores: /correctores activo");
};
