/* Woman (aesthetic dermatology): rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet,
   y up is negative). Adult proportions, a bit taller than Dra. Marcela; shoulder-length wavy hair with a side part.
   Skin options for before/after scenes, each on/off or 0–1: expression lines, melasma spots and luminous skin.
   Prop: a hand mirror in the right hand. */
(function () {
  'use strict';
  const C = {
    skin: '#d6a079', hair: '#3b2620', streak: '#6b4430', blouse: '#a0e1ea', blouseEdge: '#7fcfdb', trousers: '#09545d',
    shoe: '#2c3940', chain: '#c9a54a', pendant: '#14b5c9', lash: '#30201c', lip: '#c46a66', blush: '#e0917c',
    line: '#a36f50', spot: '#a8714f', frame: '#0d7582', glass: '#e8fafd'
  };
  // head space: origin at the head centre, eyes at y 2.6; an oval face with a soft chin
  const HEAD = [['M', 0, -17.4], ['C', 9.2, -17.4, 15.4, -11.0, 15.4, -1.6], ['C', 15.4, 7.0, 12.2, 13.0, 7.2, 15.8],
    ['C', 4.6, 17.2, -4.6, 17.2, -7.2, 15.8], ['C', -12.2, 13.0, -15.4, 7.0, -15.4, -1.6], ['C', -15.4, -11.0, -9.2, -17.4, 0, -17.4], ['Z']];
  // shoulder-length wavy hair: the back falls behind the face to the shoulders; the front sweeps from a side part
  const BACK = [['M', -16.8, -6.0], ['C', -18.4, -14.6, -11.6, -20.4, 0, -20.4], ['C', 11.6, -20.4, 18.4, -14.6, 16.8, -6.0],
    ['C', 16.2, 2.0, 19.2, 8.0, 18.4, 14.0], ['C', 17.8, 19.0, 14.6, 21.6, 11.2, 20.4], ['C', 9.6, 22.4, 6.2, 22.2, 5.2, 19.8],
    ['L', -5.2, 19.8], ['C', -6.2, 22.2, -9.6, 22.4, -11.2, 20.4], ['C', -14.6, 21.6, -17.8, 19.0, -18.4, 14.0],
    ['C', -19.2, 8.0, -16.2, 2.0, -16.8, -6.0], ['Z']];
  const FRONT = [['M', 4.6, -18.0], ['C', -4.0, -18.4, -13.2, -14.4, -15.2, -5.6], ['C', -16.2, 0, -15.6, 6.4, -14.0, 11.0],
    ['C', -13.0, 6.0, -12.2, 0.6, -10.4, -3.2], ['C', -8.2, -7.4, -3.2, -10.2, 4.6, -11.6], ['C', 9.8, -12.4, 13.6, -10.0, 15.0, -5.2],
    ['C', 15.8, -1.0, 15.6, 3.2, 15.0, 6.4], ['C', 16.6, 2.6, 17.2, -3.4, 16.2, -8.6], ['C', 14.8, -15.6, 10.6, -18.2, 4.6, -18.0], ['Z']];
  const WAVES = [[['M', -16.6, 4.0], ['C', -18.0, 8.4, -15.6, 12.0, -17.2, 16.6]], [['M', 16.8, 3.2], ['C', 18.2, 7.8, 15.8, 11.6, 17.4, 16.2]],
    [['M', 2.4, -17.2], ['C', -4.6, -15.8, -10.8, -12.0, -13.4, -5.0]], [['M', 8.8, -16.2], ['C', 12.8, -13.6, 15.0, -9.0, 15.4, -3.4]]];
  const BROWS = [[['M', -8.8, -2.4], ['C', -7.4, -3.8, -5.2, -4.0, -3.6, -3.0]], [['M', 8.8, -2.4], ['C', 7.4, -3.8, 5.2, -4.0, 3.6, -3.0]]];
  // expression lines: forehead, crow's feet, under the eyes and the folds beside the mouth
  const LINES = [
    [['M', -3.4, -8.2], ['C', -0.6, -8.9, 3.2, -8.9, 6.6, -8.0]], [['M', -2.6, -6.4], ['C', 0, -7.0, 3.0, -7.0, 5.8, -6.3]],
    [['M', 8.9, 1.2], ['L', 10.6, 0.4]], [['M', 9.2, 2.4], ['L', 11.0, 2.5]], [['M', 8.9, 3.6], ['L', 10.5, 4.5]],
    [['M', -8.9, 1.2], ['L', -10.6, 0.4]], [['M', -9.2, 2.4], ['L', -11.0, 2.5]], [['M', -8.9, 3.6], ['L', -10.5, 4.5]],
    [['M', 4.0, 5.9], ['C', 5.2, 6.6, 6.8, 6.6, 7.8, 5.8]], [['M', -4.0, 5.9], ['C', -5.2, 6.6, -6.8, 6.6, -7.8, 5.8]],
    [['M', 3.4, 5.0], ['C', 4.8, 6.6, 5.0, 8.6, 4.2, 10.4]], [['M', -3.4, 5.0], ['C', -4.8, 6.6, -5.0, 8.6, -4.2, 10.4]]
  ];
  // melasma: irregular patches on both cheekbones, the upper lip and the forehead; [x, y, rx, ry, rotation]
  const SPOTS = [[8.4, 5.2, 2.6, 1.8, 0.3], [10.2, 4.0, 1.6, 1.2, 0], [7.0, 6.4, 1.4, 1.0, 0.2], [-8.6, 5.0, 2.4, 1.7, -0.3],
    [-10.4, 3.8, 1.5, 1.1, 0], [-7.2, 6.6, 1.3, 1.0, -0.2], [0, 7.7, 2.1, 0.7, 0], [2.6, -6.2, 2.3, 1.1, 0.1]];
  const BLOUSE = [['M', -4.8, -59.4], ['C', -9.2, -59.6, -12.4, -57.6, -12.8, -53.2], ['C', -13.2, -47.0, -11.6, -39.6, -11.4, -35.0],
    ['C', -11.2, -31.6, -12.4, -29.0, -12.2, -27.6], ['C', -12.0, -26.8, -11.0, -26.4, -9.8, -26.4], ['L', 9.8, -26.4],
    ['C', 11.0, -26.4, 12.0, -26.8, 12.2, -27.6], ['C', 12.4, -29.0, 11.2, -31.6, 11.4, -35.0], ['C', 11.6, -39.6, 13.2, -47.0, 12.8, -53.2],
    ['C', 12.4, -57.6, 9.2, -59.6, 4.8, -59.4], ['Z']];

  const ARM = { L1: 12.2, L2: 11.6 };
  const SH = { L: { x: -11.6, y: -53.6 }, R: { x: 11.6, y: -53.6 } };

  window.AVATARS = window.AVATARS || {};
  window.AVATARS.woman = {
    name: 'Mujer',
    fileName: 'mujer-avatar.png',
    U: 7.9, shadowRx: 15,
    arm: ARM, leg: { L1: 10.5, L2: 10.1 },
    shoulders: SH,
    hips: { L: { x: -4.8, y: -24.4 }, R: { x: 4.8, y: -24.4 } },
    hipPivot: { x: 0, y: -24.4 }, neck: { x: 0, y: -58.8 }, headAbove: 15.2, headHandle: 28, leanHandle: { x: 0, y: -40 },
    defaults: {
      armL: { a1: -12, a2: 12 }, armR: { a1: 12, a2: -12 }, legL: { a1: -2, a2: 0 }, legR: { a1: 2, a2: 0 },
      lines: false, spots: false, glow: false, mirror: false, blink: false, mouth: false, mask: false
    },
    keep: ['mask', 'lines', 'spots', 'glow'],
    checks: [['lines', 'Líneas de expresión'], ['spots', 'Manchas (melasma)'], ['glow', 'Piel luminosa'], ['mirror', 'Espejo de mano'],
      ['blink', 'Ojos cerrados'], ['mouth', 'Boca abierta'], ['mask', 'Mascarilla']],
    presets: [
      ['De pie', {}],
      ['Saludar', { armR: { a1: 142, a2: 26 }, tilt: -4, mouth: true }],
      ['Con espejo', ({ ik }) => ({ armR: ik(SH.R, { x: 20.0, y: -63.0 }, ARM.L1, ARM.L2, 1), mirror: true, tilt: 4 })],   // held up beside the face
      ['Tocándose la mejilla', ({ ik }) => ({ armR: ik(SH.R, { x: 10.6, y: -69.6 }, ARM.L1, ARM.L2, 1), tilt: 6 })],
      ['Manos en la cintura', ({ ik }) => ({
        armL: ik(SH.L, { x: -13.6, y: -35.0 }, ARM.L1, ARM.L2, -1), armR: ik(SH.R, { x: 13.6, y: -35.0 }, ARM.L1, ARM.L2, 1)
      })],
      ['Caminar', { legL: { a1: -12, a2: 8 }, legR: { a1: 8, a2: -4 }, armL: { a1: -18, a2: 8 }, armR: { a1: 10, a2: -6 } }],
      ['Brazos arriba', { armL: { a1: -144, a2: -22 }, armR: { a1: 144, a2: 22 }, mouth: true }],
      ['Saltando de emoción', { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 12, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      const amount = v => (v === true ? 1 : Math.max(0, Math.min(1, +v || 0)));   // on/off, or 0–1 for before/after scenes
      const lines = amount(pose.lines), spots = amount(pose.spots), glow = amount(pose.glow);

      use(S.head);                                                            // hair that falls behind the shoulders
      H.fill(ctx, BACK, C.hair);

      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // tailored trousers down to the flats
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(lg.S.x, lg.S.y); ctx.lineTo(lg.E.x, lg.E.y); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.strokeStyle = C.trousers; ctx.lineWidth = 6.6; ctx.stroke();
        ctx.save(); ctx.translate(lg.W.x, lg.W.y); ctx.rotate(-lg.end * Math.PI / 180);
        H.ellipse(ctx, side * 0.8, 1.4, 4.6, 2.4, C.shoe);
        ctx.restore();
      }
      // seat of the trousers: the waistband turns with the torso (under the blouse); the legs' round tops cover the hips
      const toRoot = S.root.inverse().multiply(S.body);
      const fromBody = (x, y) => { const q = toRoot.transformPoint(new DOMPoint(x, y)); return { x: q.x, y: q.y }; };
      const wl = fromBody(-11.4, -29.0), wr = fromBody(11.4, -29.0), hl = fromBody(-12.2, -25.4), hr = fromBody(12.2, -25.4);
      ctx.fillStyle = C.trousers;
      ctx.beginPath();
      ctx.moveTo(wl.x, wl.y); ctx.lineTo(wr.x, wr.y);
      ctx.bezierCurveTo(hr.x, hr.y, 10.2, -23.8, 8.4, -22.6);
      ctx.quadraticCurveTo(4.4, -20.8, 0, -22.0);
      ctx.quadraticCurveTo(-4.4, -20.8, -8.4, -22.6);
      ctx.bezierCurveTo(-10.2, -23.8, hl.x, hl.y, wl.x, wl.y);
      ctx.closePath(); ctx.fill();

      use(S.body);
      H.fill(ctx, BLOUSE, C.blouse);
      H.fill(ctx, [['M', -4.8, -59.8], ['L', 0, -52.4], ['L', 4.8, -59.8], ['Z']], C.skin);   // V-neck
      H.stroke(ctx, [['M', -4.9, -59.6], ['L', 0, -52.2], ['L', 4.9, -59.6]], C.blouseEdge, 0.7);
      H.stroke(ctx, [['M', -3.4, -59.2], ['C', -2.4, -56.6, 2.4, -56.6, 3.4, -59.2]], C.chain, 0.35);   // fine necklace
      H.ellipse(ctx, 0, -56.9, 0.75, 0.75, C.pendant);
      H.ellipse(ctx, 0, -60.4, 3.0, 3.2, C.skin);                           // neck (shows when the head tilts)

      const armStyle = { w: 5.2, color: C.skin, hand: 3.1, handColor: C.skin, cap: { to: 0.34, w: 7.4, color: C.blouse, edge: C.blouseEdge } };
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
      H.fill(ctx, HEAD, C.skin);
      if (spots > 0) {                                                        // melasma under the features, inside the face
        ctx.save(); H.path(ctx, HEAD); ctx.clip(); ctx.globalAlpha *= 0.5 * spots;
        for (const [x, y, rx, ry, rot] of SPOTS) H.ellipse(ctx, x, y, rx, ry, C.spot, rot);
        ctx.restore();
      }
      if (lines > 0) { ctx.save(); ctx.globalAlpha *= 0.6 * lines; for (const l of LINES) H.stroke(ctx, l, C.line, 0.45); ctx.restore(); }
      H.face(ctx, { eyeY: 2.6, eyeDX: 5.8, rx: 2.1, ry: 2.7, mouthY: 9.6, mouthW: 2.7, blush: C.blush, blink: pose.blink, open: pose.mouth });
      if (!pose.mouth) H.ellipse(ctx, 0, 10.5, 1.9, 0.62, C.lip);           // soft lip colour under the smile line
      if (!pose.blink) {                                                      // lashes at the outer corners
        for (const sx of [-1, 1]) {
          H.stroke(ctx, [['M', sx * 7.5, 0.6], ['L', sx * 8.6, -0.3]], C.lash, 0.5);
          H.stroke(ctx, [['M', sx * 7.9, 1.4], ['L', sx * 9.1, 0.9]], C.lash, 0.5);
        }
      }
      for (const b of BROWS) H.stroke(ctx, b, C.hair, 0.8);
      if (glow > 0) {                                                         // luminous skin: soft light on cheekbones, forehead, chin
        ctx.save(); H.path(ctx, HEAD); ctx.clip();
        for (const [x, y, rx, ry, rot] of [[8.6, 3.4, 4.8, 2.2, -0.35], [-8.6, 3.4, 4.8, 2.2, 0.35], [2.0, -8.8, 3.6, 1.5, 0], [0, 13.6, 2.2, 1.1, 0]]) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(rx, ry);    // soft oval highlight along the cheekbone
          const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
          lg.addColorStop(0, 'rgba(255, 246, 236, ' + (0.38 * glow) + ')'); lg.addColorStop(1, 'rgba(255, 246, 236, 0)');
          ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
      if (pose.mask) { ctx.save(); ctx.translate(0, 1.2); ctx.scale(0.96, 1.0); H.mask(ctx); ctx.restore(); }
      H.fill(ctx, FRONT, C.hair);
      for (const w of WAVES) H.stroke(ctx, w, C.streak, 0.7);                   // waves and a few lighter strands

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, false);
      if (raised(g.armR)) drawArm(g.armR, pose.mirror);
    }
  };
})();
