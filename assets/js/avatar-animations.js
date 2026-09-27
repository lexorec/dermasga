/* DERMASGA animations built from the avatar characters (needs avatar-editor.js + avatars/doctor.js, avatars/child.js, avatars/boy.js).
   Usage: <canvas data-animation="hero-pediatria"></canvas>  then  AvatarAnimations.playAll().
   Several ids separated by spaces: one of them is picked at random on each page load (and plays on its own):
   <canvas data-animation="hero-pediatria hero-pediatria-nino"></canvas>
   Loops while visible, pauses off-screen or in a background tab, and shows a still frame with prefers-reduced-motion. */
(function () {
  'use strict';
  const E = window.AvatarEditor, AV = window.AVATARS;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const blinkAt = (t, period, offset) => ((t + offset) % period) < 0.12;
  const TEAL50 = '#e8fafd', TEAL200 = '#a0e1ea', TEAL500 = '#14b5c9', TEAL700 = '#0d7582';

  // pose helpers: numeric fields interpolate, flags switch halfway
  const JOINTS = ['armL', 'armR', 'legL', 'legR'];
  function mixPose(a, b, k) {
    const out = Object.assign({}, k < 0.5 ? a : b);
    for (const j of JOINTS) out[j] = { a1: lerp(a[j].a1, b[j].a1, k), a2: lerp(a[j].a2, b[j].a2, k) };
    for (const f of ['lean', 'tilt', 'lift']) out[f] = lerp(a[f], b[f], k);
    return out;
  }
  const withJoint = (pose, joint, v) => Object.assign({}, pose, { [joint]: v });
  function toLocal(M, p) { const q = M.inverse().transformPoint(new DOMPoint(p.x, p.y)); return { x: q.x, y: q.y }; }
  function toCanvas(M, p) { const q = M.transformPoint(new DOMPoint(p.x, p.y)); return { x: q.x, y: q.y }; }
  // matrices of a character standing at `place` (same as drawCharacter), to aim limbs before drawing
  function rootOf(pose, place) { return new DOMMatrix().translate(place.x, place.y - pose.lift * place.U).scale(place.U); }
  function bodyOf(cfg, pose, place) {
    const hp = cfg.hipPivot;
    return rootOf(pose, place).translate(hp.x, hp.y).rotate(pose.lean).translate(-hp.x, -hp.y);
  }

  function heart(c2d, x, y, s, color) {
    c2d.beginPath();
    c2d.moveTo(x, y + s * 0.35);
    c2d.bezierCurveTo(x - s * 1.1, y - s * 0.35, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
    c2d.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.35, x, y + s * 0.35);
    c2d.fillStyle = color; c2d.fill();
  }

  // ---------------- animations ----------------
  // Pediatric hero scene with the girl ('child') or the boy ('boy') as the patient: both use the same child rig
  function pediatricScene(kidKey, title, description) {
    return {
      title, description,
      duration: 10,
      size: [1000, 1000],
      still: 1.0,
      draw(c2d, base, t) {
        const DOC = AV.doctor, KID = AV[kidKey];
        const dPlace = { x: 350, y: 900, U: 7.4 }, kPlace = { x: 680, y: 900, U: 7.4 * 0.745 };

        // background: soft disc, a few drifting shapes, floor band
        c2d.setTransform(base);
        c2d.fillStyle = '#f7f7f7'; c2d.fillRect(0, 0, 1000, 1000);
        E.H.ellipse(c2d, 500, 560, 410, 410, TEAL50);
        const drift = (i, a) => Math.sin(t * Math.PI * 2 / 10 * (i % 2 ? 1 : 2) + i) * a;
        E.H.ellipse(c2d, 150 + drift(1, 8), 270 + drift(2, 10), 16, 16, TEAL500);
        E.H.ellipse(c2d, 880 + drift(3, 8), 330 + drift(4, 8), 11, 11, TEAL700);
        E.H.ellipse(c2d, 820 + drift(5, 6), 170 + drift(6, 8), 22, 22, '#d6d6d6');
        for (let gx = 0; gx < 4; gx++) for (let gy = 0; gy < 3; gy++) E.H.ellipse(c2d, 105 + gx * 16, 540 + gy * 16 + drift(7, 5), 3.4, 3.4, TEAL200);
        c2d.save(); c2d.translate(900 + drift(8, 6), 560 + drift(9, 6)); c2d.rotate(0.5 + t * Math.PI / 10);   // half a turn per loop: seamless
        c2d.beginPath(); c2d.roundRect(-26, -7, 52, 14, 7); c2d.fillStyle = TEAL200; c2d.fill(); c2d.restore();
        E.H.ellipse(c2d, 500, 905, 440, 24, '#e5eef0');

        // ---- child ----
        let kid = E.withDefaults(KID, { spots: true, mouth: true, blink: blinkAt(t, 2.7, 1.9) });
        const kidIdle = kid;
        const wave = Object.assign({}, kidIdle, { armR: { a1: 142, a2: 26 }, tilt: -4 });
        const show = Object.assign({}, kidIdle, { armL: { a1: -80, a2: -10 }, tilt: 5, mouth: false });
        const jump = Object.assign({}, kidIdle, { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 },
          legR: { a1: 30, a2: -52 }, lift: 14, tilt: -5 });
        if (t < 0.45) kid = mixPose(kidIdle, wave, ease(seg(t, 0, 0.45)));
        else if (t < 1.8) { kid = Object.assign({}, wave); kid.armR = { a1: 142, a2: 26 + Math.sin((t - 0.45) * 11) * 16 }; }
        else if (t < 2.4) kid = mixPose(wave, show, ease(seg(t, 1.8, 2.4)));
        else if (t < 5.3) { kid = Object.assign({}, show); kid.tilt = 5 + Math.sin(t * 2) * 1.5; }
        else if (t < 5.8) kid = mixPose(show, kidIdle, ease(seg(t, 5.3, 5.8)));
        else if (t < 6.9) {                                     // raise the near hand for the high five
          const meet = { x: 540, y: 585 };
          const reach = E.ik(KID.shoulders.L, toLocal(rootOf(kidIdle, kPlace), { x: meet.x + 16, y: meet.y + 4 }), KID.arm.L1, KID.arm.L2, -1);
          const up = seg(t, 5.8, 6.35) - seg(t, 6.55, 6.9);
          kid = withJoint(kidIdle, 'armL', { a1: lerp(kidIdle.armL.a1, reach.a1, ease(up)), a2: lerp(kidIdle.armL.a2, reach.a2, ease(up)) });
        } else if (t < 7.9) {                                   // jump for joy
          const k = Math.sin(seg(t, 6.9, 7.9) * Math.PI);
          kid = mixPose(kidIdle, jump, k);
          kid.lift = 14 * k;
        }
        kid.blink = blinkAt(t, 2.7, 1.9) && !(t > 6.9 && t < 7.9);

        // ---- doctor ----
        let doc = E.withDefaults(DOC, { blink: blinkAt(t, 3.1, 0.5) });
        const docIdle = doc;
        doc.tilt = Math.sin(t * Math.PI * 2 / 5) * 1.5;
        // aim at the girl's forearm (computed from where the girl actually is this frame)
        const kidBody = bodyOf(KID, kid, kPlace);
        const kidArm = E.limbGeom(KID.shoulders.L, kid.armL, KID.arm.L1, KID.arm.L2);
        const forearm = toCanvas(kidBody, E.H.point(kidArm, 0.72));
        if (t >= 1.9 && t < 5.7) {
          const k = ease(seg(t, 1.9, 2.7)) - ease(seg(t, 5.0, 5.7));
          const lean = 8 * k, sway = Math.sin((t - 2.7) * 2.4) * 10 * seg(t, 2.7, 3.0) * (1 - seg(t, 4.6, 5.0));
          const probe = Object.assign({}, docIdle, { lean });
          const target = toLocal(bodyOf(DOC, probe, dPlace), { x: forearm.x - 22 + sway, y: forearm.y - 70 });
          const r = E.ik(DOC.shoulders.R, target, DOC.arm.L1, DOC.arm.L2, 1);
          doc = Object.assign({}, docIdle, { lean, tilt: 7 * k, lamp: k > 0.35,
            armR: { a1: lerp(docIdle.armR.a1, r.a1, k), a2: lerp(docIdle.armR.a2, r.a2, k) } });
        } else if (t >= 5.8 && t < 6.9) {
          const meet = { x: 540, y: 585 };
          const r = E.ik(DOC.shoulders.R, toLocal(rootOf(docIdle, dPlace), { x: meet.x - 16, y: meet.y }), DOC.arm.L1, DOC.arm.L2, 1);
          const up = ease(seg(t, 5.8, 6.35) - seg(t, 6.55, 6.9));
          doc = withJoint(docIdle, 'armR', { a1: lerp(docIdle.armR.a1, r.a1, up), a2: lerp(docIdle.armR.a2, r.a2, up) });
          doc.tilt = 4 * up;
        } else if (t >= 8.2 && t < 9.8) {                       // wave goodbye with the outer arm
          const k = ease(seg(t, 8.2, 8.6)) - ease(seg(t, 9.4, 9.8));
          const w = Math.sin((t - 8.2) * 11) * 14 * seg(t, 8.5, 8.7);
          doc = withJoint(docIdle, 'armL', { a1: lerp(docIdle.armL.a1, -146, k), a2: lerp(docIdle.armL.a2, -24 + w, k) });
          doc.tilt = -4 * k;
        }
        doc.mouth = t > 6.3 && t < 7.9;
        doc.blink = blinkAt(t, 3.1, 0.5) && !doc.mouth;

        // ---- draw characters ----
        E.drawShadow(c2d, base, DOC, doc, dPlace);
        E.drawShadow(c2d, base, KID, kid, kPlace);
        const d = E.drawCharacter(c2d, base, DOC, doc, dPlace);
        E.drawCharacter(c2d, base, KID, kid, kPlace);

        // ---- effects ----
        c2d.setTransform(base);
        const glow = seg(t, 2.8, 3.1) * (1 - seg(t, 4.8, 5.1));
        if (glow > 0) {
          const g = d.g.armR;
          const ang = Math.atan2(g.W.y - g.Q.y, g.W.x - g.Q.x);
          const tip = toCanvas(d.M.body, { x: g.W.x + Math.cos(ang) * 4.8, y: g.W.y + Math.sin(ang) * 4.8 });
          const pulse = 0.78 + 0.22 * Math.sin(t * 7);
          c2d.save();
          c2d.globalAlpha = 0.5 * glow * pulse;
          c2d.beginPath();
          c2d.moveTo(tip.x - 6, tip.y); c2d.lineTo(tip.x + 6, tip.y);
          c2d.lineTo(forearm.x + 46, forearm.y + 6); c2d.lineTo(forearm.x - 46, forearm.y + 6); c2d.closePath();
          c2d.fillStyle = TEAL200; c2d.fill();
          c2d.globalAlpha = 0.35 * glow * pulse;
          E.H.ellipse(c2d, forearm.x, forearm.y + 4, 52, 26, TEAL500);
          c2d.restore();
        }
        const burst = seg(t, 6.3, 7.1);
        if (burst > 0 && burst < 1) {
          const cx = 540, cy = 575;
          c2d.save(); c2d.lineCap = 'round';
          for (let i = 0; i < 10; i++) {
            const a = i * Math.PI * 2 / 10, r0 = 36 + 80 * burst, r1 = 60 + 110 * burst;
            c2d.beginPath(); c2d.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c2d.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
            c2d.strokeStyle = [TEAL500, TEAL700, TEAL200][i % 3]; c2d.lineWidth = 10 * (1 - burst) + 2; c2d.stroke();
          }
          c2d.restore();
        }
        for (let i = 0; i < 3; i++) {                          // hearts rising from the child
          const k = seg(t, 6.8 + i * 0.35, 8.6 + i * 0.35);
          if (k <= 0 || k >= 1) continue;
          c2d.save(); c2d.globalAlpha = Math.sin(k * Math.PI);
          heart(c2d, 680 + (i - 1) * 70 + Math.sin(k * 6 + i) * 10, 420 - k * 190, 16 + i * 3, [TEAL500, TEAL700, TEAL200][i]);
          c2d.restore();
        }
      }
    };
  }

  const ANIMS = {
    'hero-pediatria': pediatricScene('child', 'Hero · Dermatología pediátrica',
      'La niña saluda, la Dra. Marcela revisa su brazo con la lámpara, chocan los cinco y la niña salta de alegría. Bucle de 10 s.'),
    'hero-pediatria-nino': pediatricScene('boy', 'Hero · Dermatología pediátrica (niño)',
      'El niño saluda, la Dra. Marcela revisa su brazo con la lámpara, chocan los cinco y el niño salta de alegría. Bucle de 10 s.')
  };

  // ---------------- player ----------------
  // ids: one animation, or several separated by spaces: one of them is picked at random on each page load
  function play(canvas, ids) {
    const list = String(ids).split(/[\s,]+/).map(id => ANIMS[id]).filter(Boolean);
    if (!list.length) return null;
    const A = list[Math.floor(Math.random() * list.length)];
    const ctx = canvas.getContext('2d');
    const [AW, AH] = A.size;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true, raf = 0, start = performance.now();
    function drawAt(t) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round((canvas.clientWidth || AW / 2) * dpr));
      if (canvas.width !== w) { canvas.width = w; canvas.height = Math.round(w * AH / AW); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      A.draw(ctx, new DOMMatrix([canvas.width / AW, 0, 0, canvas.width / AW, 0, 0]), t);
    }
    function frame(now) {
      raf = 0;
      drawAt(((now - start) / 1000) % A.duration);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!reduce && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
    if (reduce) { drawAt(A.still); window.addEventListener('resize', () => drawAt(A.still)); return { stop() {} }; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[entries.length - 1].isIntersecting; kick(); }, { threshold: 0.05 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', kick);
    kick();
    return { stop() { visible = false; if (raf) cancelAnimationFrame(raf); raf = 0; } };
  }

  function playAll(root = document) {
    for (const c of root.querySelectorAll('canvas[data-animation]')) play(c, c.dataset.animation);
  }

  window.AvatarAnimations = { play, playAll, list: ANIMS };
})();
