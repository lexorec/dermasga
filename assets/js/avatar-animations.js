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

  // small calendar whose days fill in one by one: weeks go by while the treatment works
  function calendar(c2d, s, filled) {
    const x = -s / 2, y = -s / 2, r = s * 0.14;
    c2d.beginPath(); c2d.roundRect(x, y, s, s, r); c2d.fillStyle = '#ffffff'; c2d.fill();
    c2d.lineWidth = s * 0.035; c2d.strokeStyle = '#d6e4e7'; c2d.stroke();
    c2d.save(); c2d.beginPath(); c2d.roundRect(x, y, s, s, r); c2d.clip();
    c2d.fillStyle = TEAL500; c2d.fillRect(x, y, s, s * 0.26); c2d.restore();
    for (const rx of [x + s * 0.3, x + s * 0.7]) {
      c2d.beginPath(); c2d.roundRect(rx - s * 0.05, y - s * 0.1, s * 0.1, s * 0.22, s * 0.05); c2d.fillStyle = TEAL700; c2d.fill();
    }
    const gx = x + s * 0.12, gy = y + s * 0.36, cw = s * 0.76 / 4, ch = s * 0.54 / 3;
    for (let i = 0; i < 12; i++) {
      c2d.beginPath();
      c2d.roundRect(gx + (i % 4) * cw + s * 0.02, gy + Math.floor(i / 4) * ch + s * 0.02, cw - s * 0.04, ch - s * 0.04, s * 0.03);
      c2d.fillStyle = i < filled ? TEAL500 : '#e3eef0'; c2d.fill();
    }
  }
  // a small tube of cream held in the hand, nozzle forward
  function creamTube(c2d, x, y, ang, s) {
    c2d.save(); c2d.translate(x, y); c2d.rotate(ang);
    c2d.beginPath(); c2d.roundRect(-s * 0.2, -s * 0.28, s * 1.25, s * 0.56, s * 0.2); c2d.fillStyle = '#ffffff'; c2d.fill();
    c2d.lineWidth = s * 0.06; c2d.strokeStyle = '#d6e4e7'; c2d.stroke();
    c2d.fillStyle = TEAL200; c2d.fillRect(s * 0.15, -s * 0.12, s * 0.55, s * 0.24);
    c2d.beginPath(); c2d.roundRect(s * 1.02, -s * 0.18, s * 0.3, s * 0.36, s * 0.08); c2d.fillStyle = TEAL500; c2d.fill();
    c2d.restore();
  }
  function sparkle(c2d, x, y, s, color) {
    c2d.beginPath(); c2d.moveTo(x, y - s);
    c2d.quadraticCurveTo(x, y, x + s, y); c2d.quadraticCurveTo(x, y, x, y + s);
    c2d.quadraticCurveTo(x, y, x - s, y); c2d.quadraticCurveTo(x, y, x, y - s);
    c2d.fillStyle = color; c2d.fill();
  }

  // ---------------- animations ----------------
  /* Pediatric hero scene with the girl ('child') or the boy ('boy') as the patient (both use the same child rig):
     the child waves and shows the arm; Dra. Marcela checks the arm and the cheek with the exam lamp, then puts on cream;
     days go by on a small calendar while the spots fade; high five, jump for joy, goodbye. */
  const PED = 15.5;
  function pediatricScene(kidKey, title, description) {
    return {
      title, description,
      duration: PED,
      size: [1000, 1000],
      still: 1.0,
      draw(c2d, base, t) {
        const DOC = AV.doctor, KID = AV[kidKey];
        const dPlace = { x: 350, y: 900, U: 7.4 }, kPlace = { x: 680, y: 900, U: 7.4 * 0.745 };

        // background: soft disc, a few drifting shapes, floor band (all repeat exactly every loop)
        c2d.setTransform(base);
        c2d.fillStyle = '#f7f7f7'; c2d.fillRect(0, 0, 1000, 1000);
        E.H.ellipse(c2d, 500, 560, 410, 410, TEAL50);
        const drift = (i, a) => Math.sin(t * Math.PI * 2 / PED * (i % 2 ? 1 : 2) + i) * a;
        E.H.ellipse(c2d, 150 + drift(1, 8), 270 + drift(2, 10), 16, 16, TEAL500);
        E.H.ellipse(c2d, 880 + drift(3, 8), 330 + drift(4, 8), 11, 11, TEAL700);
        E.H.ellipse(c2d, 820 + drift(5, 6), 170 + drift(6, 8), 22, 22, '#d6d6d6');
        for (let gx = 0; gx < 4; gx++) for (let gy = 0; gy < 3; gy++) E.H.ellipse(c2d, 105 + gx * 16, 540 + gy * 16 + drift(7, 5), 3.4, 3.4, TEAL200);
        c2d.save(); c2d.translate(900 + drift(8, 6), 560 + drift(9, 6)); c2d.rotate(0.5 + t * Math.PI / PED);   // half a turn per loop
        c2d.beginPath(); c2d.roundRect(-26, -7, 52, 14, 7); c2d.fillStyle = TEAL200; c2d.fill(); c2d.restore();
        E.H.ellipse(c2d, 500, 905, 440, 24, '#e5eef0');

        // ---- child ----
        const fade = ease(seg(t, 8.5, 10.2));                                // the spots fade while the days go by
        let kid = E.withDefaults(KID, { spots: 1 - 0.88 * fade, mouth: true, blink: false });
        const kidIdle = kid;
        const wave = Object.assign({}, kidIdle, { armR: { a1: 142, a2: 26 }, tilt: -4 });
        const show = Object.assign({}, kidIdle, { armL: { a1: -80, a2: -10 }, tilt: 5, mouth: false });
        const jump = Object.assign({}, kidIdle, { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 },
          legR: { a1: 30, a2: -52 }, lift: 14, tilt: -5 });
        if (t < 0.45) kid = mixPose(kidIdle, wave, ease(seg(t, 0, 0.45)));
        else if (t < 1.8) { kid = Object.assign({}, wave); kid.armR = { a1: 142, a2: 26 + Math.sin((t - 0.45) * 11) * 16 }; }
        else if (t < 2.4) kid = mixPose(wave, show, ease(seg(t, 1.8, 2.4)));
        else if (t < 7.9) { kid = Object.assign({}, show); kid.tilt = 5 + Math.sin(t * 2) * 1.5; }
        else if (t < 8.4) kid = mixPose(show, kidIdle, ease(seg(t, 7.9, 8.4)));
        else if (t >= 10.9 && t < 12.0) {                                   // raise the near hand for the high five
          const meet = { x: 540, y: 585 };
          const reach = E.ik(KID.shoulders.L, toLocal(rootOf(kidIdle, kPlace), { x: meet.x + 16, y: meet.y + 4 }), KID.arm.L1, KID.arm.L2, -1);
          const up = seg(t, 10.9, 11.45) - seg(t, 11.65, 12.0);
          kid = withJoint(kidIdle, 'armL', { a1: lerp(kidIdle.armL.a1, reach.a1, ease(up)), a2: lerp(kidIdle.armL.a2, reach.a2, ease(up)) });
        } else if (t >= 12.0 && t < 13.0) {                                 // jump for joy
          const k = Math.sin(seg(t, 12.0, 13.0) * Math.PI);
          kid = mixPose(kidIdle, jump, k);
          kid.lift = 14 * k;
        }
        const lightOnFace = t > 4.85 && t < 5.75, dab = t > 7.3 && t < 7.7;  // eyes shut under the light; a giggle at the dab
        kid.blink = (blinkAt(t, 2.7, 1.9) || lightOnFace || dab) && !(t > 12.0 && t < 13.0);
        if (dab) kid.mouth = true;

        // ---- doctor ----
        let doc = E.withDefaults(DOC, { blink: blinkAt(t, 3.1, 0.5) });
        const docIdle = doc;
        doc.tilt = Math.sin(t * Math.PI * 2 / (PED / 3)) * 1.5;
        // aim at the child's forearm and cheek (from where the child actually is this frame)
        const kidBody = bodyOf(KID, kid, kPlace);
        const kidHead = kidBody.translate(KID.neck.x, KID.neck.y).rotate(kid.tilt).translate(0, -KID.headAbove);
        const kidArm = E.limbGeom(KID.shoulders.L, kid.armL, KID.arm.L1, KID.arm.L2);
        const forearm = toCanvas(kidBody, E.H.point(kidArm, 0.72));
        const fa0 = toCanvas(kidBody, E.H.point(kidArm, 0.6)), fa1 = toCanvas(kidBody, E.H.point(kidArm, 0.84));
        const armDir = Math.atan2(fa1.y - fa0.y, fa1.x - fa0.x);
        const cheek = toCanvas(kidHead, { x: -11.4, y: 2.1 });
        const mixPt = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
        if (t >= 1.9 && t < 8.1) {                                          // lamp on the arm, on the cheek, then cream
          const k = ease(seg(t, 1.9, 2.7)) - ease(seg(t, 7.6, 8.1));
          const sway = Math.sin((t - 2.7) * 2.4) * 10 * seg(t, 2.7, 3.0) * (1 - seg(t, 4.0, 4.3));
          const rub = Math.sin((t - 6.3) * 14) * 10 * seg(t, 6.3, 6.45) * (1 - seg(t, 6.95, 7.1));
          const onArm = { x: forearm.x - 22 + sway, y: forearm.y - 70 };
          const onCheek = { x: cheek.x - 50 + Math.sin((t - 4.8) * 3) * 5 * seg(t, 4.8, 5.0), y: cheek.y - 74 };   // from above, clear of the pigtails
          const onCream = { x: forearm.x + Math.cos(armDir) * rub, y: forearm.y - 16 + Math.sin(armDir) * rub };
          const onDab = { x: cheek.x - 24 + Math.sin(seg(t, 7.35, 7.6) * Math.PI) * 8, y: cheek.y - 4 };
          let target = onArm;
          if (t >= 4.3) target = mixPt(onArm, onCheek, ease(seg(t, 4.3, 4.8)));
          if (t >= 5.8) target = mixPt(onCheek, onCream, ease(seg(t, 5.8, 6.3)));
          if (t >= 7.1) target = mixPt(onCream, onDab, ease(seg(t, 7.1, 7.35)));
          const lean = 8 * k;
          const probe = Object.assign({}, docIdle, { lean });
          const r = E.ik(DOC.shoulders.R, toLocal(bodyOf(DOC, probe, dPlace), target), DOC.arm.L1, DOC.arm.L2, 1);
          doc = Object.assign({}, docIdle, { lean, tilt: 7 * k, lamp: k > 0.35 && t < 5.95,
            armR: { a1: lerp(docIdle.armR.a1, r.a1, k), a2: lerp(docIdle.armR.a2, r.a2, k) } });
        } else if (t >= 10.9 && t < 12.0) {
          const meet = { x: 540, y: 585 };
          const r = E.ik(DOC.shoulders.R, toLocal(rootOf(docIdle, dPlace), { x: meet.x - 16, y: meet.y }), DOC.arm.L1, DOC.arm.L2, 1);
          const up = ease(seg(t, 10.9, 11.45) - seg(t, 11.65, 12.0));
          doc = withJoint(docIdle, 'armR', { a1: lerp(docIdle.armR.a1, r.a1, up), a2: lerp(docIdle.armR.a2, r.a2, up) });
          doc.tilt = 4 * up;
        } else if (t >= 13.3 && t < 14.9) {                                 // wave goodbye with the outer arm
          const k = ease(seg(t, 13.3, 13.7)) - ease(seg(t, 14.5, 14.9));
          const w = Math.sin((t - 13.3) * 11) * 14 * seg(t, 13.6, 13.8);
          doc = withJoint(docIdle, 'armL', { a1: lerp(docIdle.armL.a1, -146, k), a2: lerp(docIdle.armL.a2, -24 + w, k) });
          doc.tilt = -4 * k;
        }
        doc.mouth = t > 11.4 && t < 13.0;
        doc.blink = blinkAt(t, 3.1, 0.5) && !doc.mouth;

        // ---- draw characters (while putting on cream, her hand goes in front of the child) ----
        const cream = seg(t, 6.35, 6.7) * (1 - seg(t, 8.4, 9.4)), creamFace = seg(t, 7.42, 7.55) * (1 - seg(t, 8.4, 9.4));
        const drawCream = () => {
          c2d.setTransform(base);
          if (cream > 0) {
            c2d.save(); c2d.globalAlpha = 0.85 * cream; c2d.translate(forearm.x, forearm.y); c2d.rotate(armDir);
            E.H.ellipse(c2d, 0, -2, 18 + 10 * cream, 9, '#ffffff'); c2d.restore();
          }
          if (creamFace > 0) { c2d.save(); c2d.globalAlpha = 0.85 * creamFace; E.H.ellipse(c2d, cheek.x + 2, cheek.y, 12, 9, '#ffffff'); c2d.restore(); }
        };
        E.drawShadow(c2d, base, DOC, doc, dPlace);
        E.drawShadow(c2d, base, KID, kid, kPlace);
        let d;
        if (t >= 5.8 && t < 8.1) { E.drawCharacter(c2d, base, KID, kid, kPlace); drawCream(); d = E.drawCharacter(c2d, base, DOC, doc, dPlace); }
        else { d = E.drawCharacter(c2d, base, DOC, doc, dPlace); E.drawCharacter(c2d, base, KID, kid, kPlace); drawCream(); }

        // ---- effects ----
        c2d.setTransform(base);
        const hand = d.g.armR, handAng = Math.atan2(hand.W.y - hand.Q.y, hand.W.x - hand.Q.x);
        const beam = (focus, w, rx, ry, glow) => {                          // exam light from the lamp tip onto the skin
          const tip = toCanvas(d.M.body, { x: hand.W.x + Math.cos(handAng) * 4.8, y: hand.W.y + Math.sin(handAng) * 4.8 });
          const dx = focus.x - tip.x, dy = focus.y - tip.y, len = Math.hypot(dx, dy) || 1, px = -dy / len, py = dx / len;
          const pulse = 0.78 + 0.22 * Math.sin(t * 7);
          c2d.save();
          c2d.globalAlpha = 0.5 * glow * pulse;
          c2d.beginPath();
          c2d.moveTo(tip.x + px * 6, tip.y + py * 6); c2d.lineTo(tip.x - px * 6, tip.y - py * 6);
          c2d.lineTo(focus.x - px * w, focus.y - py * w); c2d.lineTo(focus.x + px * w, focus.y + py * w); c2d.closePath();
          c2d.fillStyle = TEAL200; c2d.fill();
          c2d.globalAlpha = 0.35 * glow * pulse;
          E.H.ellipse(c2d, focus.x, focus.y + 4, rx, ry, TEAL500);
          c2d.restore();
        };
        const glowArm = seg(t, 2.8, 3.1) * (1 - seg(t, 4.0, 4.3)), glowFace = seg(t, 4.85, 5.1) * (1 - seg(t, 5.5, 5.75));
        if (glowArm > 0) beam(forearm, 46, 52, 26, glowArm);
        if (glowFace > 0) beam(cheek, 24, 30, 24, glowFace);
        const tube = seg(t, 5.95, 6.15) * (1 - seg(t, 7.75, 7.95));
        if (tube > 0) {
          const hp = toCanvas(d.M.body, hand.W), hq = toCanvas(d.M.body, hand.Q);
          creamTube(c2d, hp.x, hp.y, Math.atan2(hp.y - hq.y, hp.x - hq.x), 28 * tube);
        }
        for (let i = 0; i < 3; i++) {                                       // sparkles as the skin clears
          const k = seg(t, 9.3 + i * 0.3, 10.0 + i * 0.3);
          if (k <= 0 || k >= 1) continue;
          const at = [{ x: forearm.x - 30, y: forearm.y - 24 }, { x: cheek.x - 20, y: cheek.y - 22 }, { x: forearm.x + 24, y: forearm.y + 20 }][i];
          sparkle(c2d, at.x, at.y, 11 * Math.sin(k * Math.PI), i === 1 ? TEAL500 : TEAL200);
        }
        const cal = seg(t, 8.05, 8.35) * (1 - ease(seg(t, 10.6, 10.85)));
        if (cal > 0) {
          const sc = seg(t, 10.6, 10.85) > 0 ? cal : 1 + 2.7 * Math.pow(cal - 1, 3) + 1.7 * Math.pow(cal - 1, 2);   // pops in, shrinks out
          c2d.save(); c2d.translate(690, 290); c2d.scale(sc, sc);
          calendar(c2d, 96, Math.floor(12 * seg(t, 8.4, 10.2) + 1e-6));   // a day every 0.15 s
          c2d.restore();
        }
        const burst = seg(t, 11.4, 12.2);
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
        for (let i = 0; i < 3; i++) {                                       // hearts rising from the child
          const k = seg(t, 11.9 + i * 0.35, 13.7 + i * 0.35);
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
      'La niña saluda; la Dra. Marcela revisa su brazo y su mejilla con la lámpara y le pone crema; pasan los días, las manchitas se aclaran, chocan los cinco y la niña salta de alegría. Bucle de 15,5 s.'),
    'hero-pediatria-nino': pediatricScene('boy', 'Hero · Dermatología pediátrica (niño)',
      'El niño saluda; la Dra. Marcela revisa su brazo y su mejilla con la lámpara y le pone crema; pasan los días, las manchitas se aclaran, chocan los cinco y el niño salta de alegría. Bucle de 15,5 s.')
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
