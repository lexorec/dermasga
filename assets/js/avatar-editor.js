/* DERMASGA avatar pose editor: shared engine for the unlisted avatar pages (avatar.html, avatar-child.html).
   A character page calls AvatarEditor.mount({...}) with its rig (joints, limb lengths), defaults, quick poses
   and a draw() function; this file handles the canvas, dragging with IK, controls and image export. */
(function () {
  'use strict';

  const LW = 800, LH = 1000, OX = 400, OY = 930;
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm180 = a => { a = ((a + 180) % 360 + 360) % 360 - 180; return a === -180 ? 180 : a; };
  const dirOf = a => ({ x: Math.sin(rad(a)), y: Math.cos(rad(a)) });   // 0 = straight down, + turns toward +x
  const clone = o => JSON.parse(JSON.stringify(o));

  // Surgical mask sized for the doctor's head (head space: origin at the head center, eyes at y 1.8, chin at y 16)
  const MASK = [['M', -13.4, 6.0], ['C', -7.2, 4.4, 7.2, 4.4, 13.4, 6.0], ['C', 13.2, 8.8, 11.6, 11.8, 8.6, 13.4],
    ['C', 4.6, 15.6, -4.6, 15.6, -8.6, 13.4], ['C', -11.6, 11.8, -13.2, 8.8, -13.4, 6.0], ['Z']];
  const MASK_PLEATS = [
    [['M', -12.4, 8.6], ['C', -6, 7.8, 6, 7.8, 12.4, 8.6]],
    [['M', -10.9, 11.2], ['C', -5.4, 10.6, 5.4, 10.6, 10.9, 11.2]]
  ];

  // ---------- drawing helpers available to characters ----------
  const H = {
    path(ctx, cmds) {
      ctx.beginPath();
      for (const c of cmds) {
        if (c[0] === 'M') ctx.moveTo(c[1], c[2]);
        else if (c[0] === 'L') ctx.lineTo(c[1], c[2]);
        else if (c[0] === 'C') ctx.bezierCurveTo(c[1], c[2], c[3], c[4], c[5], c[6]);
        else if (c[0] === 'Z') ctx.closePath();
      }
    },
    fill(ctx, cmds, color) { H.path(ctx, cmds); ctx.fillStyle = color; ctx.fill(); },
    stroke(ctx, cmds, color, w) {
      H.path(ctx, cmds); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    },
    ellipse(ctx, x, y, rx, ry, color, rot = 0) {
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    },
    point(g, t) {                                 // point on a limb's curve (quadratic through the elbow)
      return {
        x: (1 - t) * (1 - t) * g.S.x + 2 * (1 - t) * t * g.Q.x + t * t * g.W.x,
        y: (1 - t) * (1 - t) * g.S.y + 2 * (1 - t) * t * g.Q.y + t * t * g.W.y
      };
    },
    polyline(ctx, g, t0, t1, n = 10) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) { const p = H.point(g, t0 + (t1 - t0) * i / n); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
    },
    /* Smooth arm through the elbow. o: { w, color, edge?, cuff?, cap?: { to, w, color, edge? }, hand, handColor }
       Returns the direction angle at the hand (radians), for props held in the hand. */
    arm(ctx, g, o) {
      const curve = () => { ctx.beginPath(); ctx.moveTo(g.S.x, g.S.y); ctx.quadraticCurveTo(g.Q.x, g.Q.y, g.W.x, g.W.y); };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (o.edge) { curve(); ctx.strokeStyle = o.edge; ctx.lineWidth = o.w * 1.12; ctx.stroke(); }
      curve(); ctx.strokeStyle = o.color; ctx.lineWidth = o.w; ctx.stroke();
      if (o.cuff) { H.polyline(ctx, g, 0.84, 1); ctx.strokeStyle = o.cuff; ctx.lineWidth = o.w; ctx.stroke(); }
      if (o.cap) {
        if (o.cap.edge) { H.polyline(ctx, g, 0, o.cap.to); ctx.strokeStyle = o.cap.edge; ctx.lineWidth = o.cap.w + 0.7; ctx.stroke(); }
        H.polyline(ctx, g, 0, o.cap.to); ctx.strokeStyle = o.cap.color; ctx.lineWidth = o.cap.w; ctx.stroke();
      }
      H.ellipse(ctx, g.W.x, g.W.y, o.hand, o.hand, o.handColor);
      return Math.atan2(g.W.y - g.Q.y, g.W.x - g.Q.x);
    },
    /* Leg as hip-knee-ankle with round joints; the shoe turns with the shin. o: { w, color, shoe: { dx, dy, rx, ry, color } } */
    leg(ctx, g, o) {
      ctx.beginPath(); ctx.moveTo(g.S.x, g.S.y); ctx.lineTo(g.E.x, g.E.y); ctx.lineTo(g.W.x, g.W.y);
      ctx.strokeStyle = o.color; ctx.lineWidth = o.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.save(); ctx.translate(g.W.x, g.W.y); ctx.rotate(-rad(g.end));
      H.ellipse(ctx, o.shoe.dx, o.shoe.dy, o.shoe.rx, o.shoe.ry, o.shoe.color);
      ctx.restore();
    },
    /* Cute face in head space. f: { eyeY, eyeDX, rx, ry, mouthY, mouthW, blush, blink, open } */
    face(ctx, f) {
      const EYE = '#30201c';
      for (const sx of [-1, 1]) {
        const ex = sx * f.eyeDX, ey = f.eyeY;
        if (f.blink) {
          H.stroke(ctx, [['M', ex - f.rx * 1.1, ey], ['C', ex - f.rx * 0.4, ey + f.ry * 0.55, ex + f.rx * 0.4, ey + f.ry * 0.55, ex + f.rx * 1.1, ey]], EYE, 0.55);
        } else {
          H.ellipse(ctx, ex, ey, f.rx, f.ry, EYE);
          H.ellipse(ctx, ex - f.rx * 0.32, ey - f.ry * 0.36, f.rx * 0.42, f.rx * 0.42, '#ffffff');
          H.ellipse(ctx, ex + f.rx * 0.36, ey + f.ry * 0.38, f.rx * 0.2, f.rx * 0.2, '#ffffff');
        }
        H.ellipse(ctx, sx * (f.eyeDX + f.rx + 2.2), ey + f.ry + 2.3, 2.6, 1.45, f.blush);
      }
      const my = f.mouthY, mw = f.mouthW;
      if (f.open) {
        H.fill(ctx, [['M', -mw, my], ['C', -mw * 0.8, my + mw * 1.25, mw * 0.8, my + mw * 1.25, mw, my], ['Z']], '#96343a');
        H.ellipse(ctx, 0, my + mw * 0.72, mw * 0.45, mw * 0.22, '#e87878');
      } else {
        H.stroke(ctx, [['M', -mw, my], ['C', -mw * 0.45, my + mw * 0.75, mw * 0.45, my + mw * 0.75, mw, my]], '#843a38', 0.7);
      }
    },
    mask(ctx) {
      for (const sx of [-1, 1]) {                 // ear loops, tucked under the hair
        H.stroke(ctx, [['M', sx * 13.2, 6.4], ['C', sx * 14.2, 6.0, sx * 15.0, 5.8, sx * 15.8, 5.7]], '#e3f4f7', 0.55);
        H.stroke(ctx, [['M', sx * 11.4, 11.6], ['C', sx * 13.0, 10.9, sx * 14.4, 9.9, sx * 15.6, 8.8]], '#e3f4f7', 0.55);
      }
      H.path(ctx, MASK); ctx.fillStyle = '#c9ecf2'; ctx.fill();
      ctx.lineWidth = 0.4; ctx.strokeStyle = '#a3dbe4'; ctx.stroke();
      for (const pl of MASK_PLEATS) H.stroke(ctx, pl, '#a3dbe4', 0.45);
    }
  };

  function limbGeom(S, a, L1, L2) {
    const d1 = dirOf(a.a1), d2 = dirOf(a.a1 + a.a2);
    const E = { x: S.x + d1.x * L1, y: S.y + d1.y * L1 };
    const W = { x: E.x + d2.x * L2, y: E.y + d2.y * L2 };
    return { S, E, W, Q: { x: 2 * E.x - 0.5 * (S.x + W.x), y: 2 * E.y - 0.5 * (S.y + W.y) }, end: a.a1 + a.a2 };
  }

  // two-bone IK; the elbow / knee bends outward (away from the body's center line)
  function ik(S, T, L1, L2, side) {
    const dx = T.x - S.x, dy = T.y - S.y;
    const d = clamp(Math.hypot(dx, dy), Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.01);
    const base = Math.atan2(dx, dy);
    const alpha = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const gamma = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    const sols = [{ a1: base + alpha, a2: -(Math.PI - gamma) }, { a1: base - alpha, a2: Math.PI - gamma }];
    const score = s => Math.sin(s.a1) * side;
    const best = score(sols[0]) >= score(sols[1]) ? sols[0] : sols[1];
    return { a1: Math.round(norm180(deg(best.a1))), a2: Math.round(deg(best.a2)) };
  }

  const SLIDERS = [
    ['arms', 'Brazo izquierdo (en pantalla) · hombro', 'armL.a1', -180, 180],
    ['arms', 'Brazo izquierdo (en pantalla) · codo', 'armL.a2', -160, 160],
    ['arms', 'Brazo derecho (en pantalla) · hombro', 'armR.a1', -180, 180],
    ['arms', 'Brazo derecho (en pantalla) · codo', 'armR.a2', -160, 160],
    ['legs', 'Pierna izquierda · cadera', 'legL.a1', -70, 70],
    ['legs', 'Pierna izquierda · rodilla', 'legL.a2', -100, 100],
    ['legs', 'Pierna derecha · cadera', 'legR.a1', -70, 70],
    ['legs', 'Pierna derecha · rodilla', 'legR.a2', -100, 100],
    ['body', 'Inclinación del cuerpo', 'lean', -25, 25],
    ['body', 'Inclinación de la cabeza', 'tilt', -35, 35],
    ['body', 'Altura del salto', 'lift', 0, 30, '']
  ];

  function makeRenderer(cfg) {
    const U = cfg.U;
    return function render(c2d, scale, opts, pose) {
      let base = new DOMMatrix([scale, 0, 0, scale, 0, 0]);
      if (opts.mirror) base = base.translate(LW, 0).scale(-1, 1);
      const floorM = new DOMMatrix().translate(OX, OY).scale(U);
      const root = new DOMMatrix().translate(OX, OY - pose.lift * U).scale(U);
      const hp = cfg.hipPivot, nk = cfg.neck;
      const body = root.translate(hp.x, hp.y).rotate(pose.lean).translate(-hp.x, -hp.y);
      const head = body.translate(nk.x, nk.y).rotate(pose.tilt).translate(0, -cfg.headAbove);   // origin at the head center
      const use = M => c2d.setTransform(base.multiply(M));

      c2d.setTransform(1, 0, 0, 1, 0, 0);
      c2d.clearRect(0, 0, c2d.canvas.width, c2d.canvas.height);
      c2d.setTransform(base);
      if (opts.bg === 'white' || opts.bg === 'surface' || opts.bg === 'scene') {
        c2d.fillStyle = opts.bg === 'white' ? '#ffffff' : '#f7f7f7';
        c2d.fillRect(-LW, -LH, LW * 3, LH * 3);
      }
      if (opts.bg === 'scene') {
        H.ellipse(c2d, LW / 2, 560, 380, 380, '#e8fafd');
        H.ellipse(c2d, LW / 2, OY + 6, 340, 22, '#e5eef0');
      }
      if (opts.bg === 'scene' || opts.shadow) {
        const k = clamp(1 - pose.lift / 45, 0.45, 1);
        use(floorM); H.ellipse(c2d, 0, -0.5, cfg.shadowRx * k, 2.6 * k, '#dbe9ec');
      }

      const g = {
        armL: limbGeom(cfg.shoulders.L, pose.armL, cfg.arm.L1, cfg.arm.L2),
        armR: limbGeom(cfg.shoulders.R, pose.armR, cfg.arm.L1, cfg.arm.L2),
        legL: limbGeom(cfg.hips.L, pose.legL, cfg.leg.L1, cfg.leg.L2),
        legR: limbGeom(cfg.hips.R, pose.legR, cfg.leg.L1, cfg.leg.L2)
      };
      cfg.draw({ ctx: c2d, pose, use, S: { root, body, head }, g, H });

      const toLogical = (M, p) => { const q = M.transformPoint(new DOMPoint(p.x, p.y)); return { x: q.x, y: q.y }; };
      const handles = [
        { id: 'handL', p: toLogical(body, g.armL.W) }, { id: 'handR', p: toLogical(body, g.armR.W) },
        { id: 'footL', p: toLogical(root, g.legL.W) }, { id: 'footR', p: toLogical(root, g.legR.W) },
        { id: 'head', p: toLogical(head, { x: 0, y: -cfg.headHandle }) }, { id: 'lean', p: toLogical(body, cfg.leanHandle) }
      ];
      if (opts.handles) {
        c2d.setTransform(base);
        for (const h of handles) {
          c2d.beginPath(); c2d.arc(h.p.x, h.p.y, 10, 0, Math.PI * 2);
          c2d.fillStyle = 'rgba(255,255,255,0.85)'; c2d.fill();
          c2d.lineWidth = 3; c2d.strokeStyle = h.id === 'head' || h.id === 'lean' ? '#0d7582' : '#14b5c9'; c2d.stroke();
        }
      }
      return { root, body, head, handles };
    };
  }

  const withDefaults = (cfg, extra) => Object.assign({ lean: 0, tilt: 0, lift: 0 }, clone(cfg.defaults), clone(extra || {}));

  // Static preview of a character (default pose unless one is given), e.g. for the avatars index
  function preview(canvas, cfg, opts = {}) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = opts.width || 320;
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssW * 1.25 * dpr);
    makeRenderer(cfg)(canvas.getContext('2d'), canvas.width / LW, { bg: opts.bg || 'scene', handles: false }, withDefaults(cfg, opts.pose));
  }

  function mount(cfg) {
    const $ = id => document.getElementById(id);
    const canvas = $('stage'), ctx = canvas.getContext('2d');
    const bgSel = $('bg'), sizeSel = $('size'), mirrorChk = $('mirror'), trimChk = $('trim'), handlesChk = $('handles');
    const renderPose = makeRenderer(cfg);
    const render = (c2d, scale, opts) => renderPose(c2d, scale, opts, pose);
    const DEFAULT = withDefaults(cfg);
    let pose = clone(DEFAULT), last = null;

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== LW * dpr) { canvas.width = LW * dpr; canvas.height = LH * dpr; }
      canvas.classList.toggle('checker', bgSel.value === 'transparent');
      last = render(ctx, dpr, { bg: bgSel.value, handles: handlesChk.checked, mirror: mirrorChk.checked });
    }

    // ---------- controls ----------
    const getv = key => key.split('.').reduce((o, k) => o[k], pose);
    const setv = (key, v) => { const ks = key.split('.'); const leaf = ks.pop(); ks.reduce((o, k) => o[k], pose)[leaf] = v; };
    const inputs = {};
    for (const [group, label, key, min, max, unit = '°'] of SLIDERS) {
      const wrap = document.createElement('label'); wrap.className = 'ctl';
      const id = 'r-' + key.replace('.', '-');
      wrap.innerHTML = `<span>${label}</span><output for="${id}"></output><input id="${id}" type="range" min="${min}" max="${max}" step="1">`;
      const inp = wrap.querySelector('input'), out = wrap.querySelector('output');
      inp.addEventListener('input', () => { setv(key, +inp.value); out.textContent = inp.value + unit; draw(); });
      inputs[key] = { inp, out, unit };
      $(group).appendChild(wrap);
    }
    for (const [key, label] of cfg.checks) {
      const l = document.createElement('label');
      l.innerHTML = `<input type="checkbox" id="c-${key}"> ${label}`;
      l.querySelector('input').addEventListener('change', e => { pose[key] = e.target.checked; draw(); });
      $('checks').appendChild(l);
    }
    function syncControls() {
      for (const key in inputs) { const v = Math.round(getv(key)); inputs[key].inp.value = v; inputs[key].out.textContent = v + inputs[key].unit; }
      for (const [key] of cfg.checks) $('c-' + key).checked = !!pose[key];
    }
    const tools = { ik, limbGeom, H, cfg };
    for (const [name, preset] of cfg.presets) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = name;
      b.addEventListener('click', () => {
        const keep = {};
        for (const k of cfg.keep || []) keep[k] = pose[k];
        const extra = typeof preset === 'function' ? preset(tools) : preset;
        pose = Object.assign(clone(DEFAULT), clone(extra), keep);
        syncControls(); draw();
      });
      $('presets').appendChild(b);
    }
    $('reset').addEventListener('click', () => { pose = clone(DEFAULT); syncControls(); draw(); });
    for (const el of [bgSel, mirrorChk, handlesChk]) el.addEventListener('change', draw);

    // ---------- dragging on the canvas ----------
    let drag = null;
    function logicalPoint(e) {
      const r = canvas.getBoundingClientRect();
      let x = (e.clientX - r.left) / r.width * LW;
      const y = (e.clientY - r.top) / r.height * LH;
      if (mirrorChk.checked) x = LW - x;
      return { x, y };
    }
    canvas.addEventListener('pointerdown', e => {
      if (!last) return;
      const p = logicalPoint(e);
      let best = null, bd = 34;
      for (const h of last.handles) { const d = Math.hypot(h.p.x - p.x, h.p.y - p.y); if (d < bd) { bd = d; best = h; } }
      if (!best) return;
      drag = best.id; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); e.preventDefault();
    });
    canvas.addEventListener('pointermove', e => {
      if (!drag || !last) return;
      const p = logicalPoint(e);
      const inv = M => { const q = M.inverse().transformPoint(new DOMPoint(p.x, p.y)); return { x: q.x, y: q.y }; };
      if (drag === 'handL') pose.armL = ik(cfg.shoulders.L, inv(last.body), cfg.arm.L1, cfg.arm.L2, -1);
      else if (drag === 'handR') pose.armR = ik(cfg.shoulders.R, inv(last.body), cfg.arm.L1, cfg.arm.L2, 1);
      else if (drag === 'footL') pose.legL = ik(cfg.hips.L, inv(last.root), cfg.leg.L1, cfg.leg.L2, -1);
      else if (drag === 'footR') pose.legR = ik(cfg.hips.R, inv(last.root), cfg.leg.L1, cfg.leg.L2, 1);
      else if (drag === 'head') {
        const pv = last.body.transformPoint(new DOMPoint(cfg.neck.x, cfg.neck.y));
        pose.tilt = Math.round(clamp(deg(Math.atan2(p.x - pv.x, pv.y - p.y)) - pose.lean, -35, 35));
      } else if (drag === 'lean') {
        const hp = last.root.transformPoint(new DOMPoint(cfg.hipPivot.x, cfg.hipPivot.y));
        pose.lean = Math.round(clamp(deg(Math.atan2(p.x - hp.x, hp.y - p.y)), -25, 25));
      }
      syncControls(); draw();
    });
    const endDrag = () => { drag = null; canvas.classList.remove('dragging'); };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    // ---------- export: download on computers, share sheet («Guardar imagen» -> Photos) on phones ----------
    function alphaBox(c) {
      const { width: w, height: h } = c;
      const data = c.getContext('2d').getImageData(0, 0, w, h).data;
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      return x1 < 0 ? null : { x0, y0, x1, y1 };
    }
    function exportCanvas() {
      const k = +sizeSel.value, opts = { bg: bgSel.value, handles: false, mirror: mirrorChk.checked };
      const full = document.createElement('canvas'); full.width = LW * k; full.height = LH * k;
      render(full.getContext('2d'), k, opts);
      if (!trimChk.checked) return full;
      const probe = document.createElement('canvas'); probe.width = full.width; probe.height = full.height;
      render(probe.getContext('2d'), k, { bg: 'transparent', handles: false, mirror: mirrorChk.checked, shadow: opts.bg === 'scene' });
      const box = alphaBox(probe);
      if (!box) return full;
      const pad = 24 * k;
      const x = Math.max(0, box.x0 - pad), y = Math.max(0, box.y0 - pad);
      const w = Math.min(full.width, box.x1 + pad) - x, h = Math.min(full.height, box.y1 + pad) - y;
      const out = document.createElement('canvas'); out.width = w; out.height = h;
      out.getContext('2d').drawImage(full, x, y, w, h, 0, 0, w, h);
      return out;
    }

    const overlay = document.createElement('div');
    overlay.className = 'overlay'; overlay.id = 'saveOverlay'; overlay.hidden = true;
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'saveTitle');
    overlay.innerHTML = '<div class="sheet"><p id="saveTitle"><strong>Mantenga presionada la imagen</strong> y elija «Agregar a Fotos» o «Guardar imagen».</p>' +
      '<img id="saveImg" alt="Avatar"><button type="button" id="saveClose">Cerrar</button></div>';
    document.body.appendChild(overlay);
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) { $('download').textContent = 'Guardar imagen'; $('saveHint').hidden = false; }
    function dataURLtoFile(url, name) {           // synchronous, so the share sheet still counts as a direct tap
      const bin = atob(url.split(',')[1]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new File([bytes], name, { type: 'image/png' });
    }
    function showSaveOverlay(url) { $('saveImg').src = url; overlay.hidden = false; $('saveClose').focus(); }
    $('saveClose').addEventListener('click', () => { overlay.hidden = true; $('download').focus(); });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.hidden = true; });
    $('download').addEventListener('click', () => {
      const url = exportCanvas().toDataURL('image/png');
      if (isTouch) {
        const file = dataURLtoFile(url, cfg.fileName);
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file] }).catch(err => { if (err && err.name !== 'AbortError') showSaveOverlay(url); });
        } else {
          showSaveOverlay(url);
        }
        return;
      }
      const a = document.createElement('a');
      a.href = url; a.download = cfg.fileName;
      document.body.appendChild(a); a.click(); a.remove();
    });

    window.addEventListener('resize', draw);
    syncControls();
    draw();
  }

  window.AvatarEditor = { mount, preview, H, ik, limbGeom };
})();
