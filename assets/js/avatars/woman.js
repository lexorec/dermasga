/* Woman (aesthetic dermatology): rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet,
   y up is negative). Cute style like Dra. Marcela: round face, big eyes; high ponytail with a bow and curtain bangs;
   polka-dot A-line dress with a round collar. Skin options for before/after scenes, each on/off or 0–1: expression lines,
   melasma spots and luminous skin. Prop: a hand mirror in the right hand. */
(function () {
  'use strict';
  const C = {
    skin: '#d6a079', hair: '#3b2620', shine: '#6b4430', dress: '#6ecbd8', dressEdge: '#4fb6c5', dot: '#ffffff', collar: '#ffffff',
    collarEdge: '#c9ecf2', ribbon: '#0d7582', bow: '#14b5c9', shoe: '#0d7582', lash: '#30201c', lip: '#d4777a', blush: '#eaa28c',
    line: '#a36f50', spot: '#a8714f', frame: '#0d7582', glass: '#e8fafd'
  };
  // head space: origin at the head centre, eyes at y 2.6; a round face
  const HEAD_RX = 17.2, HEAD_RY = 16.6;
  const faceClip = ctx => { ctx.beginPath(); ctx.ellipse(0, 0, HEAD_RX, HEAD_RY, 0, 0, Math.PI * 2); ctx.clip(); };
  // high ponytail (behind the head): a round puff on top and the tail swinging down behind the right side
  const PUFF = [9.0, -17.4, 7.6, 6.2];
  const TAIL = [['M', 10.4, -19.0], ['C', 20.6, -16.8, 23.6, -4.4, 20.6, 8.8], ['C', 19.8, 12.6, 16.8, 13.8, 15.0, 11.8],
    ['C', 17.6, 3.8, 15.8, -7.0, 8.4, -12.6], ['Z']];
  // front hair: crown with curtain bangs parted in the middle, down to short sideburns
  const FRONT = [['M', -17.8, 2.0], ['C', -19.6, -8.4, -13.2, -18.6, 0, -18.8], ['C', 13.2, -18.6, 19.6, -8.4, 17.8, 2.0],
    ['C', 17.2, 3.4, 15.8, 3.2, 15.4, 1.6], ['C', 15.4, -3.4, 13.4, -7.4, 9.4, -8.4], ['C', 6.2, -9.2, 2.6, -8.0, 0.4, -11.4],
    ['C', -2.6, -8.0, -6.2, -9.2, -9.4, -8.4], ['C', -13.4, -7.4, -15.4, -3.4, -15.4, 1.6], ['C', -15.8, 3.2, -17.2, 3.4, -17.8, 2.0], ['Z']];
  // soft locks framing the face, from the temples to the jaw
  const LOCKS = [[['M', -15.8, -2.4], ['C', -17.6, 3.0, -17.0, 8.4, -14.4, 12.2], ['C', -15.6, 7.6, -15.4, 2.6, -13.8, -1.6], ['Z']],
    [['M', 15.8, -2.4], ['C', 17.6, 3.0, 17.0, 8.4, 14.4, 12.2], ['C', 15.6, 7.6, 15.4, 2.6, 13.8, -1.6], ['Z']]];
  const BROWS = [[['M', -9.2, -2.2], ['C', -7.8, -3.4, -5.6, -3.6, -4.0, -2.8]], [['M', 9.2, -2.2], ['C', 7.8, -3.4, 5.6, -3.6, 4.0, -2.8]]];
  // expression lines: forehead (between the bangs), crow's feet, under the eyes and the folds beside the mouth
  const LINES = [
    [['M', -3.6, -6.8], ['C', -1.2, -7.4, 1.2, -7.4, 3.6, -6.8]], [['M', -3.0, -5.2], ['C', -1.0, -5.7, 1.0, -5.7, 3.0, -5.2]],
    [['M', 9.6, 1.2], ['L', 11.3, 0.3]], [['M', 9.9, 2.6], ['L', 11.8, 2.7]], [['M', 9.6, 4.0], ['L', 11.2, 4.9]],
    [['M', -9.6, 1.2], ['L', -11.3, 0.3]], [['M', -9.9, 2.6], ['L', -11.8, 2.7]], [['M', -9.6, 4.0], ['L', -11.2, 4.9]],
    [['M', 4.4, 6.5], ['C', 5.6, 7.2, 7.4, 7.2, 8.4, 6.4]], [['M', -4.4, 6.5], ['C', -5.6, 7.2, -7.4, 7.2, -8.4, 6.4]],
    [['M', 3.6, 5.6], ['C', 5.0, 7.2, 5.2, 9.2, 4.4, 11.0]], [['M', -3.6, 5.6], ['C', -5.0, 7.2, -5.2, 9.2, -4.4, 11.0]]
  ];
  // melasma: irregular patches on both cheekbones, the upper lip and the forehead; [x, y, rx, ry, rotation]
  const SPOTS = [[9.0, 5.8, 2.7, 1.9, 0.3], [10.9, 4.5, 1.7, 1.2, 0], [7.5, 7.0, 1.4, 1.0, 0.2], [-9.2, 5.6, 2.5, 1.8, -0.3],
    [-11.1, 4.3, 1.6, 1.1, 0], [-7.7, 7.2, 1.3, 1.0, -0.2], [0, 8.4, 2.2, 0.7, 0], [1.4, -6.0, 2.2, 1.0, 0.1]];
  // A-line dress, knee length
  const DRESS = [['M', -4.8, -56.4], ['C', -8.8, -56.6, -11.4, -54.8, -11.8, -50.8], ['C', -12.2, -46.4, -11.0, -41.8, -10.2, -38.8],
    ['C', -12.6, -30.2, -15.2, -21.4, -15.6, -15.8], ['C', -15.7, -14.4, -14.8, -13.4, -13.4, -13.3], ['C', -9.0, -12.5, -4.4, -12.3, 0, -12.3],
    ['C', 4.4, -12.3, 9.0, -12.5, 13.4, -13.3], ['C', 14.8, -13.4, 15.7, -14.4, 15.6, -15.8], ['C', 15.2, -21.4, 12.6, -30.2, 10.2, -38.8],
    ['C', 11.0, -41.8, 12.2, -46.4, 11.8, -50.8], ['C', 11.4, -54.8, 8.8, -56.6, 4.8, -56.4], ['Z']];

  const ARM = { L1: 11.2, L2: 10.7 };
  const SH = { L: { x: -11.0, y: -52.0 }, R: { x: 11.0, y: -52.0 } };

  window.AVATARS = window.AVATARS || {};
  window.AVATARS.woman = {
    name: 'Mujer',
    fileName: 'mujer-avatar.png',
    U: 8.4, shadowRx: 15,
    arm: ARM, leg: { L1: 9.2, L2: 8.8 },
    shoulders: SH,
    hips: { L: { x: -4.2, y: -22.4 }, R: { x: 4.2, y: -22.4 } },
    hipPivot: { x: 0, y: -23 }, neck: { x: 0, y: -56.6 }, headAbove: 16.4, headHandle: 29, leanHandle: { x: 0, y: -36 },
    defaults: {
      armL: { a1: -16, a2: 14 }, armR: { a1: 16, a2: -14 }, legL: { a1: -2, a2: 0 }, legR: { a1: 2, a2: 0 },
      lines: false, spots: false, glow: false, mirror: false, blink: false, mouth: false, mask: false
    },
    keep: ['mask', 'lines', 'spots', 'glow'],
    checks: [['lines', 'Líneas de expresión'], ['spots', 'Manchas (melasma)'], ['glow', 'Piel luminosa'], ['mirror', 'Espejo de mano'],
      ['blink', 'Ojos cerrados'], ['mouth', 'Boca abierta'], ['mask', 'Mascarilla']],
    presets: [
      ['De pie', {}],
      ['Saludar', { armR: { a1: 142, a2: 26 }, tilt: -4, mouth: true }],
      ['Con espejo', ({ ik }) => ({ armR: ik(SH.R, { x: 20.6, y: -59.8 }, ARM.L1, ARM.L2, 1), mirror: true, tilt: 4 })],   // beside the face
      ['Tocándose la mejilla', ({ ik }) => ({ armR: ik(SH.R, { x: 11.2, y: -67.4 }, ARM.L1, ARM.L2, 1), tilt: 6 })],
      ['Manos en la cintura', ({ ik }) => ({
        armL: ik(SH.L, { x: -12.2, y: -38.0 }, ARM.L1, ARM.L2, -1), armR: ik(SH.R, { x: 12.2, y: -38.0 }, ARM.L1, ARM.L2, 1)
      })],
      ['Caminar', { legL: { a1: -12, a2: 8 }, legR: { a1: 8, a2: -4 }, armL: { a1: -20, a2: 8 }, armR: { a1: 12, a2: -6 } }],
      ['Brazos arriba', { armL: { a1: -144, a2: -22 }, armR: { a1: 144, a2: 22 }, mouth: true }],
      ['Saltando de emoción', { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 12, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      const amount = v => (v === true ? 1 : Math.max(0, Math.min(1, +v || 0)));   // on/off, or 0–1 for before/after scenes
      const lines = amount(pose.lines), spots = amount(pose.spots), glow = amount(pose.glow);

      use(S.head);                                                            // ponytail behind the head
      H.fill(ctx, TAIL, C.hair);
      H.ellipse(ctx, PUFF[0], PUFF[1], PUFF[2], PUFF[3], C.hair);

      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // legs below the skirt, flats
        H.leg(ctx, lg, { w: 5.6, color: C.skin, shoe: { dx: side * 0.8, dy: 1.3, rx: 4.4, ry: 2.4, color: C.shoe } });
      }

      use(S.body);
      H.fill(ctx, DRESS, C.dress);
      ctx.save(); H.path(ctx, DRESS); ctx.clip();                             // polka dots and the ribbon at the waist
      for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 9; col++) H.ellipse(ctx, -16 + col * 4 + (row % 2) * 2, -56 + row * 3.8, 0.55, 0.55, C.dot);
      }
      ctx.fillStyle = C.ribbon; ctx.fillRect(-14, -40.0, 28, 2.0);
      ctx.restore();
      H.ellipse(ctx, -2.4, -39.0, 1.9, 1.2, C.ribbon, 0.35); H.ellipse(ctx, 2.4, -39.0, 1.9, 1.2, C.ribbon, -0.35);   // little bow
      H.ellipse(ctx, 0, -39.0, 0.9, 0.9, C.bow);
      for (const sx of [-1, 1]) {                                             // round collar
        H.ellipse(ctx, sx * 2.9, -54.4, 3.2, 2.2, C.collarEdge, sx * 0.35);
        H.ellipse(ctx, sx * 2.9, -54.6, 2.9, 1.9, C.collar, sx * 0.35);
      }
      H.ellipse(ctx, 0, -57.4, 2.8, 3.0, C.skin);                           // neck (shows when the head tilts)

      const armStyle = { w: 5.2, color: C.skin, hand: 3.1, handColor: C.skin, cap: { to: 0.3, w: 8.6, color: C.dress, edge: C.dressEdge } };
      const drawArm = (ga, withMirror) => {
        H.arm(ctx, ga, armStyle);
        if (!withMirror) return;
        const ang = Math.atan2(ga.W.y - ga.Q.y, ga.W.x - ga.Q.x);             // hand mirror held by its handle
        ctx.save(); ctx.translate(ga.W.x, ga.W.y); ctx.rotate(ang);
        ctx.beginPath(); ctx.roundRect(-1.0, -0.8, 5.6, 1.6, 0.8); ctx.fillStyle = C.frame; ctx.fill();
        H.ellipse(ctx, 9.0, 0, 4.6, 3.6, C.frame);
        H.ellipse(ctx, 9.0, 0, 3.7, 2.8, C.glass);
        H.stroke(ctx, [['M', 7.4, -1.4], ['C', 8.2, -2.0, 9.4, -2.1, 10.2, -1.6]], '#ffffff', 0.5);
        ctx.restore();
        H.ellipse(ctx, ga.W.x, ga.W.y, 3.1, 3.1, C.skin);                    // fingers around the handle
      };
      const raised = ga => ga.W.y < ga.S.y - 4;
      if (!raised(g.armL)) drawArm(g.armL, false);
      if (!raised(g.armR)) drawArm(g.armR, pose.mirror);

      use(S.head);
      H.ellipse(ctx, 0, 0, HEAD_RX, HEAD_RY, C.skin);
      if (spots > 0) {                                                        // melasma under the features, inside the face
        ctx.save(); faceClip(ctx); ctx.globalAlpha *= 0.5 * spots;
        for (const [x, y, rx, ry, rot] of SPOTS) H.ellipse(ctx, x, y, rx, ry, C.spot, rot);
        ctx.restore();
      }
      if (lines > 0) { ctx.save(); ctx.globalAlpha *= 0.6 * lines; for (const l of LINES) H.stroke(ctx, l, C.line, 0.45); ctx.restore(); }
      H.face(ctx, { eyeY: 2.6, eyeDX: 6.4, rx: 2.35, ry: 3.0, mouthY: 9.2, mouthW: 3.0, blush: C.blush, blink: pose.blink, open: pose.mouth });
      if (!pose.mouth) H.ellipse(ctx, 0, 10.2, 2.0, 0.6, C.lip);            // soft lip colour under the smile line
      if (!pose.blink) {                                                      // curled lashes at the outer corners
        for (const sx of [-1, 1]) {
          H.stroke(ctx, [['M', sx * 8.2, 0.4], ['C', sx * 8.9, -0.2, sx * 9.3, -0.7, sx * 9.4, -1.4]], C.lash, 0.55);
          H.stroke(ctx, [['M', sx * 8.6, 1.4], ['C', sx * 9.4, 1.0, sx * 9.9, 0.6, sx * 10.2, -0.1]], C.lash, 0.55);
        }
      }
      for (const b of BROWS) H.stroke(ctx, b, C.hair, 0.8);
      if (glow > 0) {                                                         // luminous skin: soft light on cheekbones, forehead, chin
        ctx.save(); faceClip(ctx);
        for (const [x, y, rx, ry, rot] of [[9.0, 4.0, 4.8, 2.2, -0.35], [-9.0, 4.0, 4.8, 2.2, 0.35], [0, -6.2, 3.2, 1.4, 0], [0, 13.2, 2.2, 1.1, 0]]) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(rx, ry);
          const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
          lg.addColorStop(0, 'rgba(255, 246, 236, ' + (0.38 * glow) + ')'); lg.addColorStop(1, 'rgba(255, 246, 236, 0)');
          ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
      if (pose.mask) { ctx.save(); ctx.translate(0, 1.0); ctx.scale(1.04, 1.04); H.mask(ctx); ctx.restore(); }
      H.fill(ctx, FRONT, C.hair);
      for (const lock of LOCKS) H.fill(ctx, lock, C.hair);
      H.stroke(ctx, [['M', -11.4, -13.6], ['C', -9.0, -15.8, -6.0, -17.0, -3.4, -17.2]], C.shine, 1.1);   // shine on the hair
      H.stroke(ctx, [['M', 4.2, -16.8], ['C', 6.0, -16.4, 7.6, -15.6, 8.8, -14.6]], C.shine, 0.8);
      H.ellipse(ctx, 11.6, -20.0, 2.4, 1.5, C.bow, -0.5);                    // bow at the ponytail
      H.ellipse(ctx, 15.2, -21.4, 2.4, 1.5, C.bow, 0.3);
      H.ellipse(ctx, 13.4, -20.8, 1.0, 1.0, C.ribbon);

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, false);
      if (raised(g.armR)) drawArm(g.armR, pose.mirror);
    }
  };
})();
