/* Boy: rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet, y up is negative). */
(function () {
  'use strict';
  const C = {
    skin: '#d8a47e', ear: '#c98f69', hair: '#3a281f', tee: '#0d7582', teeEdge: '#0a6570', collar: '#09545d', stripe: '#ffffff',
    shorts: '#56656d', sock: '#ffffff', shoe: '#2c3940', sole: '#ffffff', spot: '#de6662', blush: '#e39a82'
  };
  // short hair in head space (origin at the head centre, eyes at y 2.6): crown, sideburns and a fringe of three locks
  const HAIR = [['M', -17.2, 1.6], ['C', -19.4, -4.2, -18.8, -13.0, -11.6, -18.0], ['C', -6.0, -21.6, 5.4, -21.8, 11.8, -18.2],
    ['C', 18.4, -14.2, 19.8, -5.6, 17.4, 1.6], ['C', 16.8, 2.8, 15.6, 2.6, 15.4, 1.2], ['C', 15.2, -2.2, 14.0, -5.2, 11.6, -6.6],
    ['C', 9.6, -4.6, 6.4, -4.4, 4.2, -6.6], ['C', 2.2, -4.2, -1.8, -4.4, -4.0, -7.0], ['C', -6.2, -4.6, -9.8, -4.4, -11.8, -6.4],
    ['C', -14.2, -5.0, -15.4, -2.4, -15.6, 1.2], ['C', -15.8, 2.6, -16.8, 2.8, -17.2, 1.6], ['Z']];
  const COWLICK = [['M', -1.6, -20.4], ['C', -1.2, -24.2, 2.4, -26.0, 5.6, -25.2], ['C', 3.6, -24.4, 2.2, -22.8, 2.2, -20.6], ['Z']];
  const TEE = [['M', -4.6, -52.8], ['C', -8.6, -53.0, -11.2, -51.2, -11.8, -47.2], ['C', -12.4, -41.0, -12.8, -33.0, -12.8, -27.8],
    ['C', -12.8, -25.8, -11.8, -24.8, -10.2, -24.8], ['L', 10.2, -24.8], ['C', 11.8, -24.8, 12.8, -25.8, 12.8, -27.8],
    ['C', 12.8, -33.0, 12.4, -41.0, 11.8, -47.2], ['C', 11.2, -51.2, 8.6, -53.0, 4.6, -52.8], ['Z']];
  const SEAT = [['M', -11.6, -28.6], ['L', 11.6, -28.6], ['C', 11.9, -25.2, 10.6, -21.2, 8.6, -18.4],
    ['C', 6.0, -17.4, 2.6, -17.6, 0, -18.8], ['C', -2.6, -17.6, -6.0, -17.4, -8.6, -18.4],
    ['C', -10.6, -21.2, -11.9, -25.2, -11.6, -28.6], ['Z']];

  const ARM = { L1: 11.0, L2: 10.6 };
  const SH = { L: { x: -10.6, y: -47.6 }, R: { x: 10.6, y: -47.6 } };

  window.AVATARS = window.AVATARS || {};
  window.AVATARS.boy = {
    name: 'Niño',
    fileName: 'nino-avatar.png',
    U: 8.4, shadowRx: 14,
    arm: ARM, leg: { L1: 7.8, L2: 7.4 },
    shoulders: SH,
    hips: { L: { x: -4.0, y: -19.0 }, R: { x: 4.0, y: -19.0 } },
    hipPivot: { x: 0, y: -19 }, neck: { x: 0, y: -53 }, headAbove: 17, headHandle: 26, leanHandle: { x: 0, y: -34 },
    defaults: {
      armL: { a1: -22, a2: 18 }, armR: { a1: 22, a2: -18 }, legL: { a1: -2, a2: 0 }, legR: { a1: 2, a2: 0 },
      blink: false, mouth: true, spots: false, mask: false
    },
    keep: ['mask', 'spots'],
    checks: [['blink', 'Ojos cerrados'], ['mouth', 'Boca abierta'], ['spots', 'Manchitas en la piel'], ['mask', 'Mascarilla']],
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
      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // skin leg, white sock, sneaker turned with the shin
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(lg.S.x, lg.S.y); ctx.lineTo(lg.E.x, lg.E.y); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.strokeStyle = C.skin; ctx.lineWidth = 6.2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lg.E.x + (lg.W.x - lg.E.x) * 0.6, lg.E.y + (lg.W.y - lg.E.y) * 0.6); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.lineCap = 'butt'; ctx.strokeStyle = C.sock; ctx.lineWidth = 6.5; ctx.stroke();
        ctx.save(); ctx.translate(lg.W.x, lg.W.y); ctx.rotate(-lg.end * Math.PI / 180);
        H.ellipse(ctx, side * 0.9, 1.3, 4.8, 2.7, C.shoe);
        H.ellipse(ctx, side * 1.0, 3.2, 4.9, 0.95, C.sole);
        ctx.restore();
      }
      for (const lg of [g.legL, g.legR]) {                                // shorts legs follow the thighs
        ctx.beginPath(); ctx.moveTo(lg.S.x, lg.S.y);
        ctx.lineTo(lg.S.x + (lg.E.x - lg.S.x) * 0.52, lg.S.y + (lg.E.y - lg.S.y) * 0.52);
        ctx.lineCap = 'butt'; ctx.strokeStyle = C.shorts; ctx.lineWidth = 8.6; ctx.stroke();
      }
      H.fill(ctx, SEAT, C.shorts);

      use(S.body);
      H.fill(ctx, TEE, C.tee);
      ctx.save(); H.path(ctx, TEE); ctx.clip();                               // two white stripes across the chest
      ctx.fillStyle = C.stripe; ctx.fillRect(-14, -41.8, 28, 2.4); ctx.fillRect(-14, -36.8, 28, 1.3);
      ctx.restore();
      H.stroke(ctx, [['M', -4.6, -52.6], ['C', -3.2, -50.4, 3.2, -50.4, 4.6, -52.6]], C.collar, 1.5);   // crew neck
      H.ellipse(ctx, 0, -54.2, 2.5, 2.4, C.skin);                           // neck (shows when the head tilts)

      const armStyle = { w: 5.4, color: C.skin, hand: 3.2, handColor: C.skin, cap: { to: 0.34, w: 7.3, color: C.tee, edge: C.teeEdge } };
      const drawArm = (ga, spots) => {
        H.arm(ctx, ga, armStyle);
        if (!spots) return;
        for (const [t, off] of [[0.5, 0.9], [0.62, -1.0], [0.74, 0.7], [0.86, -0.6]]) {
          const p = H.point(ga, t), q = H.point(ga, t + 0.01);
          const ang = Math.atan2(q.y - p.y, q.x - p.x);
          H.ellipse(ctx, p.x - Math.sin(ang) * off, p.y + Math.cos(ang) * off, 0.95, 0.95, C.spot);
        }
      };
      const raised = ga => ga.W.y < ga.S.y - 4;
      if (!raised(g.armL)) drawArm(g.armL, pose.spots);
      if (!raised(g.armR)) drawArm(g.armR, false);                         // drawn last so it can scratch the other arm

      use(S.head);
      for (const sx of [-1, 1]) {                                            // ears peek out beside the short hair
        H.ellipse(ctx, sx * 17.8, 3.6, 2.7, 3.5, C.skin);
        H.ellipse(ctx, sx * 18.5, 3.8, 1.2, 2.0, C.ear);
      }
      H.ellipse(ctx, 0, 0, 18.2, 17.2, C.skin);
      H.face(ctx, { eyeY: 2.6, eyeDX: 6.6, rx: 2.25, ry: 2.95, mouthY: 8.4, mouthW: 3.0, blush: C.blush, blink: pose.blink, open: pose.mouth });
      if (pose.spots) for (const [cx, cy] of [[-11.8, 0.6], [-10.2, 2.4], [-12.4, 3.4]]) H.ellipse(ctx, cx, cy, 0.95, 0.95, C.spot);
      if (pose.mask) { ctx.save(); ctx.translate(0, 0.9); ctx.scale(1.07, 1.075); H.mask(ctx); ctx.restore(); }
      H.fill(ctx, COWLICK, C.hair);
      H.fill(ctx, HAIR, C.hair);

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, pose.spots);
      if (raised(g.armR)) drawArm(g.armR, false);
    }
  };
})();
