/* Boy with vitiligo: rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet, y up is negative).
   Same child rig as the boy; curly hair, raglan tee, and depigmented patches on the face, hands, wrists and knees. */
(function () {
  'use strict';
  const C = {
    skin: '#b98060', patch: '#f1dbcc', ear: '#a2684b', hair: '#1f1714', curl: '#3b2b24', tee: '#a0e1ea', sleeve: '#0d7582',
    sleeveEdge: '#0a6570', star: '#ffffff', shorts: '#09545d', sock: '#ffffff', shoe: '#0d7582', sole: '#ffffff', blush: '#cf7d6a'
  };
  // curly hair in head space (origin at the head centre, eyes at y 2.6): a cap under curls over the crown, a curly fringe
  // and small curls at the sideburns; [x, y, radius]
  const CURLS = [];
  for (let i = 0; i <= 10; i++) {
    const a = (200 + i * 14) * Math.PI / 180;
    CURLS.push([Math.cos(a) * 17.0, Math.sin(a) * 16.4 - 1.6, 4.6]);
  }
  for (const [x, y] of [[-11.2, -7.6], [-6.8, -8.6], [-2.3, -7.8], [2.2, -8.7], [6.7, -7.7], [11.1, -8.5]]) CURLS.push([x, y, 3.3]);
  for (const sx of [-1, 1]) CURLS.push([sx * 16.6, -2.2, 2.9]);
  // vitiligo on the face: around the right eye and temple, and by the corner of the mouth; [x, y, rx, ry, rotation]
  const FACE_PATCHES = [[-8.8, 0.8, 5.4, 4.4, 0.3], [-12.6, -2.0, 3.8, 3.4, -0.2], [-5.6, 5.2, 3.0, 2.4, 0.4],
    [4.6, 11.6, 2.8, 2.0, 0.2], [6.6, 10.2, 1.8, 1.5, 0]];
  const TEE = [['M', -4.6, -52.8], ['C', -8.6, -53.0, -11.2, -51.2, -11.8, -47.2], ['C', -12.4, -41.0, -12.8, -33.0, -12.8, -27.8],
    ['C', -12.8, -25.8, -11.8, -24.8, -10.2, -24.8], ['L', 10.2, -24.8], ['C', 11.8, -24.8, 12.8, -25.8, 12.8, -27.8],
    ['C', 12.8, -33.0, 12.4, -41.0, 11.8, -47.2], ['C', 11.2, -51.2, 8.6, -53.0, 4.6, -52.8], ['Z']];
  const STAR = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.35 : 3.2;
    STAR.push([i ? 'L' : 'M', Math.cos(a) * r, -38.4 + Math.sin(a) * r]);
  }
  STAR.push(['Z']);

  const ARM = { L1: 11.0, L2: 10.6 };
  const SH = { L: { x: -10.6, y: -47.6 }, R: { x: 10.6, y: -47.6 } };

  window.AVATARS = window.AVATARS || {};
  window.AVATARS['boy-vitiligo'] = {
    name: 'Niño con vitiligo',
    fileName: 'nino-vitiligo-avatar.png',
    U: 8.4, shadowRx: 14,
    arm: ARM, leg: { L1: 7.8, L2: 7.4 },
    shoulders: SH,
    hips: { L: { x: -4.8, y: -19.0 }, R: { x: 4.8, y: -19.0 } },
    hipPivot: { x: 0, y: -19 }, neck: { x: 0, y: -53 }, headAbove: 17, headHandle: 27, leanHandle: { x: 0, y: -34 },
    defaults: {
      armL: { a1: -22, a2: 18 }, armR: { a1: 22, a2: -18 }, legL: { a1: -2, a2: 0 }, legR: { a1: 2, a2: 0 },
      vitiligo: true, blink: false, mouth: true, mask: false
    },
    keep: ['mask', 'vitiligo'],
    checks: [['vitiligo', 'Vitiligo'], ['blink', 'Ojos cerrados'], ['mouth', 'Boca abierta'], ['mask', 'Mascarilla']],
    presets: [
      ['De pie', {}],
      ['Saludar', { armR: { a1: 142, a2: 26 }, tilt: -4 }],
      ['Brazos arriba', { armL: { a1: -144, a2: -22 }, armR: { a1: 144, a2: 22 } }],
      ['Mostrar el brazo', { armL: { a1: -84, a2: -6 }, tilt: 4 }],
      ['Rascándose el brazo', ({ ik, limbGeom, H }) => {
        const armL = { a1: -6, a2: 58 };                                  // forearm across the belly
        const p = H.point(limbGeom(SH.L, armL, ARM.L1, ARM.L2), 0.82);   // the other hand scratches it
        return { armL, armR: ik(SH.R, { x: p.x + 1.0, y: p.y - 0.8 }, ARM.L1, ARM.L2, 1), mouth: false, tilt: -5 };
      }],
      ['Manos en la cintura', ({ ik }) => ({
        armL: ik(SH.L, { x: -13.6, y: -31.5 }, ARM.L1, ARM.L2, -1), armR: ik(SH.R, { x: 13.6, y: -31.5 }, ARM.L1, ARM.L2, 1)
      })],
      ['Caminar', { legL: { a1: -14, a2: 10 }, legR: { a1: 10, a2: -4 }, armL: { a1: -26, a2: 8 }, armR: { a1: 14, a2: -6 } }],
      ['Saltando de emoción', { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 14, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      const vit = pose.vitiligo === true ? 1 : Math.max(0, Math.min(1, +pose.vitiligo || 0));   // on/off, or 0–1 (repigmenting)
      const patches = fn => { if (!vit) return; ctx.save(); ctx.globalAlpha *= vit; fn(); ctx.restore(); };

      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // skin leg with a patch on the knee, white sock, sneaker
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(lg.S.x, lg.S.y); ctx.lineTo(lg.E.x, lg.E.y); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.strokeStyle = C.skin; ctx.lineWidth = 6.2; ctx.stroke();
        patches(() => {                                                        // irregular, a little different on each knee
          const k = side < 0 ? [[-0.5, 0.3, 2.3, 1.9, -0.3], [0.9, 1.6, 1.1, 0.9, 0]] : [[0.4, -0.2, 1.9, 2.2, 0.5], [-1.0, 1.5, 1.2, 0.8, 0.2]];
          for (const [x, y, rx, ry, rot] of k) H.ellipse(ctx, lg.E.x + x, lg.E.y + y, rx, ry, C.patch, rot);
        });
        ctx.beginPath(); ctx.moveTo(lg.E.x + (lg.W.x - lg.E.x) * 0.6, lg.E.y + (lg.W.y - lg.E.y) * 0.6); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.lineCap = 'butt'; ctx.strokeStyle = C.sock; ctx.lineWidth = 6.5; ctx.stroke();
        ctx.save(); ctx.translate(lg.W.x, lg.W.y); ctx.rotate(-lg.end * Math.PI / 180);
        H.ellipse(ctx, side * 0.9, 1.3, 4.8, 2.7, C.shoe);
        H.ellipse(ctx, side * 1.0, 3.2, 4.9, 0.95, C.sole);
        ctx.restore();
      }
      // shorts: overlapping pieces of one colour (as the boy's), so no pose can open a gap
      const toRoot = S.root.inverse().multiply(S.body);
      const fromBody = (x, y) => { const q = toRoot.transformPoint(new DOMPoint(x, y)); return { x: q.x, y: q.y }; };
      const wl = fromBody(-11.4, -27.2), wr = fromBody(11.4, -27.2), hl = fromBody(-11.9, -23.4), hr = fromBody(11.9, -23.4);
      ctx.fillStyle = C.shorts;
      ctx.beginPath();
      ctx.moveTo(wl.x, wl.y); ctx.lineTo(wr.x, wr.y);
      ctx.bezierCurveTo(hr.x, hr.y, 10.9, -20.6, 9.5, -18.6);
      ctx.quadraticCurveTo(4.8, -16.6, 0, -17.2);
      ctx.quadraticCurveTo(-4.8, -16.6, -9.5, -18.6);
      ctx.bezierCurveTo(-10.9, -20.6, hl.x, hl.y, wl.x, wl.y);
      ctx.closePath(); ctx.fill();
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {
        const dx = lg.E.x - lg.S.x, dy = lg.E.y - lg.S.y, len = Math.hypot(dx, dy);
        const ox = dy / len * side, oy = -dx / len * side;
        const r = 3.85, cx = lg.S.x + ox * 0.55, cy = lg.S.y + oy * 0.55;
        const hx = cx + dx * 0.55, hy = cy + dy * 0.55;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + ox * r, cy + oy * r); ctx.lineTo(hx + ox * r, hy + oy * r);
        ctx.lineTo(hx - ox * r, hy - oy * r); ctx.lineTo(cx - ox * r, cy - oy * r);
        ctx.closePath(); ctx.fill();
      }

      use(S.body);
      H.fill(ctx, TEE, C.tee);
      ctx.save(); H.path(ctx, TEE); ctx.clip();                               // raglan shoulders and a star on the chest
      for (const sx of [-1, 1]) {
        H.fill(ctx, [['M', sx * 4.2, -53.4], ['L', sx * 14, -53.4], ['L', sx * 14, -42.4], ['L', sx * 12.2, -42.4],
          ['C', sx * 9.6, -45.4, sx * 6.6, -49.4, sx * 4.2, -53.4], ['Z']], C.sleeve);
      }
      H.fill(ctx, STAR, C.star);
      ctx.restore();
      H.stroke(ctx, [['M', -4.6, -52.6], ['C', -3.2, -50.4, 3.2, -50.4, 4.6, -52.6]], C.sleeve, 1.5);   // crew neck
      H.ellipse(ctx, 0, -54.2, 2.5, 2.4, C.skin);                           // neck (shows when the head tilts)

      const wrist = ga => patches(() => {                                     // on the skin, under the sleeve
        const p = H.point(ga, 0.88), q = H.point(ga, 0.89), ang = Math.atan2(q.y - p.y, q.x - p.x);
        H.ellipse(ctx, p.x - Math.sin(ang) * 0.6, p.y + Math.cos(ang) * 0.6, 2.2, 1.6, C.patch, ang);
        const p2 = H.point(ga, 0.79);
        H.ellipse(ctx, p2.x + Math.sin(ang) * 0.9, p2.y - Math.cos(ang) * 0.9, 1.1, 0.9, C.patch, ang);
      });
      const armStyle = { w: 5.4, color: C.skin, hand: 3.2, handColor: C.skin, skin: wrist,
        cap: { to: 0.34, w: 7.3, color: C.sleeve, edge: C.sleeveEdge } };
      const drawArm = (ga, side) => {
        H.arm(ctx, ga, armStyle);
        patches(() => {                                                       // a patch on the back of the hand, kept inside it
          const ang = Math.atan2(ga.W.y - ga.Q.y, ga.W.x - ga.Q.x);
          ctx.beginPath(); ctx.arc(ga.W.x, ga.W.y, 3.2, 0, Math.PI * 2); ctx.clip();
          H.ellipse(ctx, ga.W.x + Math.cos(ang) * 1.5 + Math.sin(ang) * side * 0.8, ga.W.y + Math.sin(ang) * 1.5 - Math.cos(ang) * side * 0.8,
            2.4, 1.8, C.patch, ang);
        });
      };
      const raised = ga => ga.W.y < ga.S.y - 4;
      if (!raised(g.armL)) drawArm(g.armL, -1);
      if (!raised(g.armR)) drawArm(g.armR, 1);

      use(S.head);
      for (const sx of [-1, 1]) {                                            // ears peek out below the curls
        H.ellipse(ctx, sx * 17.8, 3.6, 2.7, 3.5, C.skin);
        H.ellipse(ctx, sx * 18.5, 3.8, 1.2, 2.0, C.ear);
      }
      H.ellipse(ctx, 0, 0, 18.2, 17.2, C.skin);
      patches(() => {                                                         // face patches, kept inside the face outline
        ctx.beginPath(); ctx.ellipse(0, 0, 18.2, 17.2, 0, 0, Math.PI * 2); ctx.clip();
        for (const [x, y, rx, ry, rot] of FACE_PATCHES) H.ellipse(ctx, x, y, rx, ry, C.patch, rot);
      });
      H.face(ctx, { eyeY: 2.6, eyeDX: 6.6, rx: 2.25, ry: 2.95, mouthY: 8.4, mouthW: 3.0, blush: C.blush, blink: pose.blink, open: pose.mouth });
      if (pose.mask) { ctx.save(); ctx.translate(0, 0.9); ctx.scale(1.07, 1.075); H.mask(ctx); ctx.restore(); }
      H.ellipse(ctx, 0, -12.5, 16.4, 7.4, C.hair);                            // curls
      for (const [x, y, r] of CURLS) H.ellipse(ctx, x, y, r, r, C.hair);
      for (const [x, y, r] of CURLS) H.stroke(ctx, [['M', x - r * 0.45, y + r * 0.15], ['C', x - r * 0.35, y - r * 0.45, x + r * 0.35, y - r * 0.45, x + r * 0.45, y + r * 0.05]], C.curl, 0.55);

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, -1);
      if (raised(g.armR)) drawArm(g.armR, 1);
    }
  };
})();
