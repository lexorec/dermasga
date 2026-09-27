/* Teenager with vitiligo: rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet, y up is negative).
   Teen proportions (longer legs and torso, a smaller, longer face with eyebrows); side-swept hair, raglan tee, bermuda
   shorts, and depigmented patches on the face, hands, wrists and knees. */
(function () {
  'use strict';
  const C = {
    skin: '#c68e66', patch: '#f3ddd0', ear: '#b27a56', hair: '#231a16', strand: '#3d2d26', tee: '#a0e1ea', sleeve: '#0d7582',
    sleeveEdge: '#0a6570', shorts: '#09545d', sock: '#ffffff', shoe: '#0d7582', sole: '#ffffff', blush: '#d9937c'
  };
  // head space: origin at the head centre, eyes at y 2.8. A slightly long face that narrows to the chin.
  const HEAD = [['M', 0, -17.0], ['C', 9.6, -17.0, 16.4, -10.4, 16.4, -1.2], ['C', 16.4, 7.4, 12.4, 14.2, 6.2, 16.6],
    ['C', 3.2, 17.6, -3.2, 17.6, -6.2, 16.6], ['C', -12.4, 14.2, -16.4, 7.4, -16.4, -1.2], ['C', -16.4, -10.4, -9.6, -17.0, 0, -17.0], ['Z']];
  // straight hair swept to one side: crown, short sideburns and a long lock that dips toward the right eyebrow
  const HAIR = [['M', -15.7, 1.2], ['C', -17.6, -5.8, -16.7, -14.2, -10.1, -18.6], ['C', -4.7, -22.4, 5.6, -22.6, 11.2, -18.4],
    ['C', 16.7, -14.6, 17.8, -6.0, 15.8, 1.2], ['C', 15.3, 2.4, 14.2, 2.2, 14.0, 0.8], ['C', 13.9, -2.6, 12.8, -5.6, 10.4, -7.4],
    ['C', 8.1, -9.2, 4.9, -9.0, 1.8, -7.6], ['C', -2.3, -5.8, -7.0, -4.2, -10.4, -3.9], ['C', -12.2, -3.6, -13.5, -2.0, -14.0, 0.8],
    ['C', -14.2, 2.2, -15.1, 2.4, -15.7, 1.2], ['Z']];
  const STRANDS = [[['M', 6.8, -18.0], ['C', 2.7, -14.8, -3.1, -10.6, -9.4, -5.6]],
    [['M', 2.9, -19.4], ['C', -1.6, -16.4, -7.2, -12.2, -12.4, -7.0]], [['M', 9.9, -15.8], ['C', 6.8, -13.0, 3.1, -10.4, -1.4, -8.2]]];
  const BROWS = [[['M', -8.4, -1.6], ['C', -7.2, -2.5, -5.2, -2.6, -3.7, -2.0]], [['M', 8.4, -1.6], ['C', 7.2, -2.5, 5.2, -2.6, 3.7, -2.0]]];
  // vitiligo on the face: around the right eye and temple, and by the corner of the mouth; [x, y, rx, ry, rotation]
  const FACE_PATCHES = [[-8.2, 1.4, 4.9, 4.0, 0.3], [-11.6, -1.4, 3.4, 3.0, -0.2], [-5.0, 5.6, 2.7, 2.1, 0.4],
    [4.0, 12.4, 2.6, 1.9, 0.2], [5.8, 11.0, 1.7, 1.4, 0]];
  const TEE = [['M', -5.2, -58.8], ['C', -9.6, -59.0, -12.6, -57.0, -13.0, -52.6], ['C', -13.4, -45.6, -13.6, -36.0, -13.4, -29.6],
    ['C', -13.3, -27.6, -12.2, -26.6, -10.6, -26.6], ['L', 10.6, -26.6], ['C', 12.2, -26.6, 13.3, -27.6, 13.4, -29.6],
    ['C', 13.6, -36.0, 13.4, -45.6, 13.0, -52.6], ['C', 12.6, -57.0, 9.6, -59.0, 5.2, -58.8], ['Z']];

  const ARM = { L1: 12.4, L2: 11.8 };
  const SH = { L: { x: -11.8, y: -53.4 }, R: { x: 11.8, y: -53.4 } };

  window.AVATARS = window.AVATARS || {};
  window.AVATARS['teen-vitiligo'] = {
    name: 'Adolescente con vitiligo',
    fileName: 'adolescente-vitiligo-avatar.png',
    U: 8.0, shadowRx: 15,
    arm: ARM, leg: { L1: 10.2, L2: 9.8 },
    shoulders: SH,
    hips: { L: { x: -5.0, y: -24.0 }, R: { x: 5.0, y: -24.0 } },
    hipPivot: { x: 0, y: -24 }, neck: { x: 0, y: -58.6 }, headAbove: 15.6, headHandle: 27, leanHandle: { x: 0, y: -40 },
    defaults: {
      armL: { a1: -16, a2: 14 }, armR: { a1: 16, a2: -14 }, legL: { a1: -2, a2: 0 }, legR: { a1: 2, a2: 0 },
      vitiligo: true, blink: false, mouth: false, mask: false
    },
    keep: ['mask', 'vitiligo'],
    checks: [['vitiligo', 'Vitiligo'], ['blink', 'Ojos cerrados'], ['mouth', 'Boca abierta'], ['mask', 'Mascarilla']],
    presets: [
      ['De pie', {}],
      ['Saludar', { armR: { a1: 142, a2: 26 }, tilt: -4, mouth: true }],
      ['Brazos arriba', { armL: { a1: -144, a2: -22 }, armR: { a1: 144, a2: 22 }, mouth: true }],
      ['Mostrar el brazo', { armL: { a1: -84, a2: -6 }, tilt: 4 }],
      ['Rascándose el brazo', ({ ik, limbGeom, H }) => {
        const armL = { a1: -6, a2: 58 };                                  // forearm across the belly
        const p = H.point(limbGeom(SH.L, armL, ARM.L1, ARM.L2), 0.82);   // the other hand scratches it
        return { armL, armR: ik(SH.R, { x: p.x + 1.0, y: p.y - 0.8 }, ARM.L1, ARM.L2, 1), tilt: -5 };
      }],
      ['Manos en la cintura', ({ ik }) => ({
        armL: ik(SH.L, { x: -15.0, y: -36.0 }, ARM.L1, ARM.L2, -1), armR: ik(SH.R, { x: 15.0, y: -36.0 }, ARM.L1, ARM.L2, 1)
      })],
      ['Caminar', { legL: { a1: -14, a2: 10 }, legR: { a1: 10, a2: -4 }, armL: { a1: -22, a2: 8 }, armR: { a1: 12, a2: -6 } }],
      ['Saltando de emoción', { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 14, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      const vit = pose.vitiligo === true ? 1 : Math.max(0, Math.min(1, +pose.vitiligo || 0));   // on/off, or 0–1 (repigmenting)
      const patches = fn => { if (!vit) return; ctx.save(); ctx.globalAlpha *= vit; fn(); ctx.restore(); };

      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // skin leg with a patch on the knee, ankle sock, sneaker
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(lg.S.x, lg.S.y); ctx.lineTo(lg.E.x, lg.E.y); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.strokeStyle = C.skin; ctx.lineWidth = 6.6; ctx.stroke();
        patches(() => {                                                        // irregular, a little different on each knee
          const k = side < 0 ? [[-0.5, 0.3, 2.4, 2.0, -0.3], [0.9, 1.7, 1.2, 0.9, 0]] : [[0.4, -0.2, 2.0, 2.3, 0.5], [-1.0, 1.6, 1.2, 0.8, 0.2]];
          for (const [x, y, rx, ry, rot] of k) H.ellipse(ctx, lg.E.x + x, lg.E.y + y, rx, ry, C.patch, rot);
        });
        ctx.beginPath(); ctx.moveTo(lg.E.x + (lg.W.x - lg.E.x) * 0.72, lg.E.y + (lg.W.y - lg.E.y) * 0.72); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.lineCap = 'butt'; ctx.strokeStyle = C.sock; ctx.lineWidth = 6.9; ctx.stroke();
        ctx.save(); ctx.translate(lg.W.x, lg.W.y); ctx.rotate(-lg.end * Math.PI / 180);
        H.ellipse(ctx, side * 1.0, 1.4, 5.3, 2.9, C.shoe);
        H.ellipse(ctx, side * 1.1, 3.4, 5.4, 1.0, C.sole);
        ctx.restore();
      }
      // bermuda shorts: overlapping pieces of one colour (as the boy's shorts), long enough to stop just above the knee
      const toRoot = S.root.inverse().multiply(S.body);
      const fromBody = (x, y) => { const q = toRoot.transformPoint(new DOMPoint(x, y)); return { x: q.x, y: q.y }; };
      const wl = fromBody(-12.2, -29.6), wr = fromBody(12.2, -29.6), hl = fromBody(-12.8, -25.8), hr = fromBody(12.8, -25.8);
      ctx.fillStyle = C.shorts;
      ctx.beginPath();
      ctx.moveTo(wl.x, wl.y); ctx.lineTo(wr.x, wr.y);
      ctx.bezierCurveTo(hr.x, hr.y, 11.8, -25.2, 10.3, -23.4);
      ctx.quadraticCurveTo(5.0, -21.4, 0, -22.2);
      ctx.quadraticCurveTo(-5.0, -21.4, -10.3, -23.4);
      ctx.bezierCurveTo(-11.8, -25.2, hl.x, hl.y, wl.x, wl.y);
      ctx.closePath(); ctx.fill();
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {
        const dx = lg.E.x - lg.S.x, dy = lg.E.y - lg.S.y, len = Math.hypot(dx, dy);
        const ox = dy / len * side, oy = -dx / len * side;
        const r = 4.3, cx = lg.S.x + ox * 0.6, cy = lg.S.y + oy * 0.6;
        const hx = cx + dx * 0.85, hy = cy + dy * 0.85;                      // hem at 85 % of the thigh
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + ox * r, cy + oy * r); ctx.lineTo(hx + ox * r, hy + oy * r);
        ctx.lineTo(hx - ox * r, hy - oy * r); ctx.lineTo(cx - ox * r, cy - oy * r);
        ctx.closePath(); ctx.fill();
      }

      use(S.body);
      H.fill(ctx, TEE, C.tee);
      ctx.save(); H.path(ctx, TEE); ctx.clip();                               // raglan shoulders
      for (const sx of [-1, 1]) {
        H.fill(ctx, [['M', sx * 4.6, -59.6], ['L', sx * 15, -59.6], ['L', sx * 15, -48.2], ['L', sx * 13.4, -48.2],
          ['C', sx * 10.6, -51.4, sx * 7.4, -55.6, sx * 4.6, -59.6], ['Z']], C.sleeve);
      }
      ctx.restore();
      H.stroke(ctx, [['M', -5.2, -58.6], ['C', -3.6, -56.2, 3.6, -56.2, 5.2, -58.6]], C.sleeve, 1.6);   // crew neck
      H.ellipse(ctx, 0, -60.0, 3.0, 3.2, C.skin);                           // neck (shows when the head tilts)

      const wrist = ga => patches(() => {                                     // on the skin, under the sleeve
        const p = H.point(ga, 0.88), q = H.point(ga, 0.89), ang = Math.atan2(q.y - p.y, q.x - p.x);
        H.ellipse(ctx, p.x - Math.sin(ang) * 0.6, p.y + Math.cos(ang) * 0.6, 2.3, 1.6, C.patch, ang);
        const p2 = H.point(ga, 0.79);
        H.ellipse(ctx, p2.x + Math.sin(ang) * 0.9, p2.y - Math.cos(ang) * 0.9, 1.2, 0.9, C.patch, ang);
      });
      const armStyle = { w: 5.6, color: C.skin, hand: 3.3, handColor: C.skin, skin: wrist,
        cap: { to: 0.36, w: 7.8, color: C.sleeve, edge: C.sleeveEdge } };
      const drawArm = (ga, side) => {
        H.arm(ctx, ga, armStyle);
        patches(() => {                                                       // a patch on the back of the hand, kept inside it
          const ang = Math.atan2(ga.W.y - ga.Q.y, ga.W.x - ga.Q.x);
          ctx.beginPath(); ctx.arc(ga.W.x, ga.W.y, 3.3, 0, Math.PI * 2); ctx.clip();
          H.ellipse(ctx, ga.W.x + Math.cos(ang) * 1.5 + Math.sin(ang) * side * 0.8, ga.W.y + Math.sin(ang) * 1.5 - Math.cos(ang) * side * 0.8,
            2.5, 1.8, C.patch, ang);
        });
      };
      const raised = ga => ga.W.y < ga.S.y - 4;
      if (!raised(g.armL)) drawArm(g.armL, -1);
      if (!raised(g.armR)) drawArm(g.armR, 1);

      use(S.head);
      for (const sx of [-1, 1]) {                                            // ears below the short sideburns
        H.ellipse(ctx, sx * 16.1, 3.0, 2.5, 3.3, C.skin);
        H.ellipse(ctx, sx * 16.8, 3.2, 1.1, 1.9, C.ear);
      }
      H.fill(ctx, HEAD, C.skin);
      patches(() => {                                                         // face patches, kept inside the face outline
        H.path(ctx, HEAD); ctx.clip();
        for (const [x, y, rx, ry, rot] of FACE_PATCHES) H.ellipse(ctx, x, y, rx, ry, C.patch, rot);
      });
      H.face(ctx, { eyeY: 2.8, eyeDX: 6.0, rx: 2.0, ry: 2.6, mouthY: 9.6, mouthW: 2.6, blush: C.blush, blink: pose.blink, open: pose.mouth });
      for (const b of BROWS) H.stroke(ctx, b, C.hair, 0.9);
      if (pose.mask) { ctx.save(); ctx.translate(0, 1.6); ctx.scale(0.98, 1.0); H.mask(ctx); ctx.restore(); }
      H.fill(ctx, HAIR, C.hair);
      for (const st of STRANDS) H.stroke(ctx, st, C.strand, 0.6);

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, -1);
      if (raised(g.armR)) drawArm(g.armR, 1);
    }
  };
})();
