/* Girl (pediatric videos): rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet, y up is negative). */
(function () {
  'use strict';
  const C = {
    skin: '#c9926b', hair: '#2a1f1b', teal500: '#14b5c9', teeEdge: '#10a0b2', teal700: '#0d7582',
    spot: '#de6662', blush: '#d98671'
  };
  const HAIR_BACK = [['M', -18.9, 6.0], ['C', -20.1, -12.4, -11.2, -20.8, 0, -21.0], ['C', 11.2, -20.8, 20.1, -12.4, 18.9, 6.0],
    ['C', 18.6, 9.6, 16.6, 10.6, 15.6, 8.0], ['L', -15.6, 8.0], ['C', -16.6, 10.6, -18.6, 9.6, -18.9, 6.0], ['Z']];
  const BANGS = [['M', -18.4, -1.0], ['C', -18.8, -11.4, -11.2, -18.8, 0, -19.0], ['C', 11.2, -18.8, 18.8, -11.4, 18.4, -1.0],
    ['C', 18.1, 1.4, 17.3, 3.6, 16.2, 5.2], ['C', 15.6, 1.6, 15.0, -2.8, 13.6, -5.6], ['C', 11.4, -5.0, 9.2, -6.4, 7.0, -5.6],
    ['C', 4.8, -6.6, 2.4, -6.8, 0, -5.8], ['C', -2.4, -6.8, -4.8, -6.6, -7.0, -5.6], ['C', -9.2, -6.4, -11.4, -5.0, -13.6, -5.6],
    ['C', -15.0, -2.8, -15.6, 1.6, -16.2, 5.2], ['C', -17.3, 3.6, -18.1, 1.4, -18.4, -1.0], ['Z']];
  const DRESS = [['M', -4.4, -52.6], ['C', -8.2, -52.8, -10.8, -51.0, -11.2, -47.0], ['C', -12.0, -38.0, -14.6, -24.0, -15.0, -20.2],
    ['C', -15.1, -18.6, -14.0, -17.6, -12.6, -17.6], ['L', 12.6, -17.6], ['C', 14.0, -17.6, 15.1, -18.6, 15.0, -20.2],
    ['C', 14.6, -24.0, 12.0, -38.0, 11.2, -47.0], ['C', 10.8, -51.0, 8.2, -52.8, 4.4, -52.6], ['Z']];

  const ARM = { L1: 11.0, L2: 10.6 };
  const SH = { L: { x: -10.4, y: -47.6 }, R: { x: 10.4, y: -47.6 } };

  window.AVATARS = window.AVATARS || {};
  window.AVATARS.child = {
    name: 'Niña',
    fileName: 'nina-avatar.png',
    U: 8.4, shadowRx: 14,
    arm: ARM, leg: { L1: 7.8, L2: 7.4 },
    shoulders: SH,
    hips: { L: { x: -3.8, y: -19.0 }, R: { x: 3.8, y: -19.0 } },
    hipPivot: { x: 0, y: -19 }, neck: { x: 0, y: -53 }, headAbove: 17, headHandle: 25, leanHandle: { x: 0, y: -34 },
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
        armL: ik(SH.L, { x: -13.2, y: -33.5 }, ARM.L1, ARM.L2, -1), armR: ik(SH.R, { x: 13.2, y: -33.5 }, ARM.L1, ARM.L2, 1)
      })],
      ['Caminar', { legL: { a1: -14, a2: 10 }, legR: { a1: 10, a2: -4 }, armL: { a1: -26, a2: 8 }, armR: { a1: 14, a2: -6 } }],
      ['Saltando de emoción', { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 14, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {
        H.leg(ctx, lg, { w: 6.2, color: C.skin, shoe: { dx: side * 0.9, dy: 1.4, rx: 4.6, ry: 2.6, color: C.teal700 } });
      }
      use(S.head);                                                            // pigtails + back hair
      for (const sx of [-1, 1]) H.ellipse(ctx, sx * 22.4, 9.4, 5.0, 9.2, C.hair, sx * -0.32);
      H.fill(ctx, HAIR_BACK, C.hair);

      use(S.body);
      H.fill(ctx, DRESS, C.teal500);
      H.stroke(ctx, [['M', -11.6, -37.2], ['L', 11.6, -37.2]], C.teeEdge, 1.6);  // waistband
      H.ellipse(ctx, 0, -54.2, 2.5, 2.4, C.skin);                           // neck (shows when the head tilts)

      const armStyle = { w: 5.4, color: C.skin, hand: 3.2, handColor: C.skin, cap: { to: 0.32, w: 8.1, color: C.teal500, edge: C.teeEdge } };
      const spotsOn = ga => {                                                 // on the skin, so the sleeve covers any that reach it
        for (const [t, off] of [[0.5, 0.9], [0.62, -1.0], [0.74, 0.7], [0.86, -0.6]]) {
          const p = H.point(ga, t), q = H.point(ga, t + 0.01);
          const ang = Math.atan2(q.y - p.y, q.x - p.x);
          H.ellipse(ctx, p.x - Math.sin(ang) * off, p.y + Math.cos(ang) * off, 0.95, 0.95, C.spot);
        }
      };
      const drawArm = (ga, spots) => H.arm(ctx, ga, spots ? Object.assign({ skin: spotsOn }, armStyle) : armStyle);
      const raised = ga => ga.W.y < ga.S.y - 4;
      if (!raised(g.armL)) drawArm(g.armL, pose.spots);
      if (!raised(g.armR)) drawArm(g.armR, false);                         // drawn last so it can scratch the other arm

      use(S.head);
      H.ellipse(ctx, 0, 0, 18.2, 17.2, C.skin);
      H.face(ctx, { eyeY: 2.6, eyeDX: 6.6, rx: 2.25, ry: 2.95, mouthY: 8.4, mouthW: 3.0, blush: C.blush, blink: pose.blink, open: pose.mouth });
      if (pose.spots) for (const [cx, cy] of [[-11.8, 0.6], [-10.2, 2.4], [-12.4, 3.4]]) H.ellipse(ctx, cx, cy, 0.95, 0.95, C.spot);
      if (pose.mask) { ctx.save(); ctx.translate(0, 0.9); ctx.scale(1.07, 1.075); H.mask(ctx); ctx.restore(); }
      H.fill(ctx, BANGS, C.hair);
      for (const sx of [-1, 1]) H.ellipse(ctx, sx * 18.6, -0.6, 2.1, 2.1, C.teal700);   // hair ties

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, pose.spots);
      if (raised(g.armR)) drawArm(g.armR, false);
    }
  };
})();
