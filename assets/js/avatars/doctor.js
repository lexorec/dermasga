/* Dra. Marcela: rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet, y up is negative). */
(function () {
  'use strict';
  const C = {
    ink: '#333333', teal200: '#a0e1ea', teal500: '#14b5c9', teal700: '#0d7582', teal800: '#09545d', white: '#ffffff',
    coatEdge: '#d4dfe2', coatFold: '#ecf1f2', skin: '#e5b896', hair: '#523426', blush: '#eaa28c'
  };
  const HAIR_BACK = [['M', 0, -19.4], ['C', 12.5, -19.8, 20.2, -12.4, 20.3, 0], ['C', 20.4, 9, 21.4, 18, 19.4, 24.4],
    ['C', 17.8, 28.8, 12.8, 29.2, 10.8, 25.4], ['L', -10.8, 25.4], ['C', -12.8, 29.2, -17.8, 28.8, -19.4, 24.4],
    ['C', -21.4, 18, -20.4, 9, -20.3, 0], ['C', -20.2, -12.4, -12.5, -19.8, 0, -19.4], ['Z']];
  const BANGS = [['M', -17.3, -2], ['C', -17.6, -12, -11, -18.6, -4, -19.1], ['C', 6, -19.6, 16.2, -14, 17.5, -3],
    ['C', 17.9, 2, 17.3, 7, 16.5, 11.2], ['C', 14.9, 4.2, 12.6, -1.8, 9, -4.2], ['C', 5, -6.2, 0, -7.4, -4.2, -10.6],
    ['C', -7, -8.6, -10.6, -7, -13, -4], ['C', -14.2, 1, -14.7, 6, -15.7, 10.2], ['C', -16.7, 5, -17.2, 1.5, -17.3, -2], ['Z']];
  const COAT = [['M', -5, -56.6], ['C', -9.2, -56.6, -11.8, -54.6, -12.3, -50], ['C', -13, -42, -14.3, -30, -14.5, -24.2],
    ['C', -14.6, -20.9, -12.9, -19.4, -10.7, -19.4], ['L', 10.7, -19.4], ['C', 12.9, -19.4, 14.6, -20.9, 14.5, -24.2],
    ['C', 14.3, -30, 13, -42, 12.3, -50], ['C', 11.8, -54.6, 9.2, -56.6, 5, -56.6], ['Z']];
  const VNECK = [['M', -4.4, -56.5], ['C', -3, -52.6, -1.4, -49.2, 0, -46.2], ['C', 1.4, -49.2, 3, -52.6, 4.4, -56.5], ['Z']];
  const STETH = [
    [['M', -4.6, -56.2], ['C', -2.4, -58.6, 2.4, -58.6, 4.6, -56.2]],
    [['M', -4.6, -56.2], ['C', -5.6, -52, -6, -48.2, -5.6, -44.4]],
    [['M', 4.6, -56.2], ['C', 5.2, -53.6, 5.4, -51.6, 5, -50]]
  ];

  window.AVATARS = window.AVATARS || {};
  window.AVATARS.doctor = {
    name: 'Dra. Marcela',
    fileName: 'dra-marcela-avatar.png',
    U: 8.4, shadowRx: 17,
    arm: { L1: 11, L2: 10.5 }, leg: { L1: 8.6, L2: 8.2 },
    shoulders: { L: { x: -11.2, y: -51.6 }, R: { x: 11.2, y: -51.6 } },
    hips: { L: { x: -4.3, y: -21 }, R: { x: 4.3, y: -21 } },
    hipPivot: { x: 0, y: -22 }, neck: { x: 0, y: -56 }, headAbove: 16, headHandle: 23.5, leanHandle: { x: 0, y: -38 },
    defaults: {
      armL: { a1: -16, a2: 8 }, armR: { a1: 16, a2: -8 }, legL: { a1: -1, a2: 0 }, legR: { a1: 1, a2: 0 },
      blink: false, mouth: false, lamp: false, mask: false
    },
    keep: ['mask'],
    checks: [['blink', 'Ojos cerrados'], ['mouth', 'Boca abierta'], ['lamp', 'Lámpara'], ['mask', 'Mascarilla']],
    presets: [
      ['De pie', {}],
      ['Saludar', { armR: { a1: 148, a2: 22 }, tilt: -3 }],
      ['Brazos arriba', { armL: { a1: -150, a2: -18 }, armR: { a1: 150, a2: 18 }, mouth: true }],
      ['Señalar', { armR: { a1: 104, a2: -8 }, tilt: -4 }],
      ['Lámpara', { armR: { a1: 64, a2: 40 }, lamp: true, lean: 6, tilt: 6 }],
      ['Manos en la cintura', { armL: { a1: -58, a2: 96 }, armR: { a1: 58, a2: -96 } }],
      ['Caminar', { legL: { a1: -16, a2: 10 }, legR: { a1: 12, a2: -4 }, armL: { a1: -24, a2: 6 }, armR: { a1: 12, a2: -6 } }],
      ['Saltando de emoción', { armL: { a1: -122, a2: -16 }, armR: { a1: 122, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 14, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {
        H.leg(ctx, lg, { w: 7.1, color: C.teal800, shoe: { dx: side * 1.0, dy: 1.7, rx: 5.2, ry: 2.8, color: C.ink } });
      }
      use(S.head); H.fill(ctx, HAIR_BACK, C.hair);

      use(S.body);
      H.path(ctx, COAT); ctx.lineWidth = 0.8; ctx.strokeStyle = C.coatEdge; ctx.stroke(); ctx.fillStyle = C.white; ctx.fill();
      H.ellipse(ctx, 0, -57.6, 2.6, 2.6, C.skin);                           // neck (shows when the head tilts)
      H.fill(ctx, VNECK, C.teal800);
      ctx.beginPath(); ctx.roundRect(5.8, -31.6, 5.2, 4.8, 1.4); ctx.fillStyle = C.coatFold; ctx.fill();
      for (const s of STETH) H.stroke(ctx, s, C.teal500, 0.95);
      H.ellipse(ctx, -5.6, -43.4, 1.9, 1.9, C.teal700);
      H.ellipse(ctx, 5, -49.4, 0.8, 0.8, C.ink);

      const armStyle = { w: 5.8, color: C.white, edge: C.coatEdge, cuff: C.coatFold, hand: 3.4, handColor: C.skin };
      const drawArm = (ga, lamp) => {
        const ang = H.arm(ctx, ga, armStyle);
        if (!lamp) return;
        ctx.save(); ctx.translate(ga.W.x, ga.W.y); ctx.rotate(ang);
        H.ellipse(ctx, 2.2, 0, 3.4, 1.6, C.teal700);
        H.ellipse(ctx, 4.8, 0, 1.2, 1.2, C.teal200);
        ctx.restore();
      };
      const raised = ga => ga.W.y < ga.S.y - 4;
      if (!raised(g.armL)) drawArm(g.armL, false);
      if (!raised(g.armR)) drawArm(g.armR, pose.lamp);

      use(S.head);
      H.ellipse(ctx, 0, 0, 17, 16, C.skin);
      H.face(ctx, { eyeY: 1.8, eyeDX: 6.1, rx: 1.95, ry: 2.6, mouthY: 7.8, mouthW: 2.4, blush: C.blush, blink: pose.blink, open: pose.mouth });
      if (pose.mask) H.mask(ctx);
      H.fill(ctx, BANGS, C.hair);

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, false);
      if (raised(g.armR)) drawArm(g.armR, pose.lamp);
    }
  };
})();
