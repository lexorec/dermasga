/* Woman (aesthetic dermatology): rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet,
   y up is negative). Cute style like Dra. Marcela: round face, big eyes. Hair built like the doctor's (a back layer plus
   one front piece): a chestnut lob with caramel highlights, side-swept bangs and a clip. Wrap dress with cap sleeves and
   teal flats. Skin options for before/after scenes, each on/off or 0–1: expression lines, melasma spots and luminous skin.
   Prop: a hand mirror in the right hand. */
(function () {
  'use strict';
  const C = {
    skin: '#d6a079', hair: '#5a3526', highlight: '#8d5b3d', clip: '#14b5c9', clipEdge: '#0f97a8',
    dress: '#0d7582', dressEdge: '#0a6570', chain: '#c9a54a', pendant: '#a0e1ea', shoe: '#14b5c9', shoeEdge: '#0f97a8',
    lash: '#30201c', lip: '#d4777a', blush: '#eaa28c', line: '#b8835f', spot: '#a8714f', frame: '#0d7582', glass: '#e8fafd'
  };
  // head space: origin at the head centre, eyes at y 2.6; a round face
  const HEAD_RX = 17.2, HEAD_RY = 16.6;
  const faceClip = ctx => { ctx.beginPath(); ctx.ellipse(0, 0, HEAD_RX, HEAD_RY, 0, 0, Math.PI * 2); ctx.clip(); };
  // lob: the back falls to the collarbone with soft rounded ends ...
  const BACK = [['M', 0, -21.4], ['C', 12.4, -21.4, 20.6, -14.0, 20.4, -2.0], ['C', 20.2, 6.0, 22.0, 12.6, 21.2, 18.6],
    ['C', 20.6, 22.8, 17.2, 24.6, 14.2, 23.4], ['C', 12.4, 25.4, 8.8, 25.4, 7.4, 23.4], ['L', -7.4, 23.4],
    ['C', -8.8, 25.4, -12.4, 25.4, -14.2, 23.4], ['C', -17.2, 24.6, -20.6, 22.8, -21.2, 18.6], ['C', -22.0, 12.6, -20.2, 6.0, -20.4, -2.0],
    ['C', -20.6, -14.0, -12.4, -21.4, 0, -21.4], ['Z']];
  // ... and the front piece has the side-swept bangs (part on her left) and frames the face down to the jaw
  const FRONT = [['M', 17.3, -2], ['C', 17.6, -12, 11, -18.6, 4, -19.1], ['C', -6, -19.6, -16.2, -14, -17.5, -3],
    ['C', -17.9, 2, -17.3, 7, -16.5, 11.2], ['C', -14.9, 4.2, -12.6, -1.8, -9, -4.2], ['C', -5, -6.2, 0, -7.4, 4.2, -10.6],
    ['C', 7, -8.6, 10.6, -7, 13, -4], ['C', 14.2, 1, 14.7, 6, 15.7, 10.2], ['C', 16.7, 5, 17.2, 1.5, 17.3, -2], ['Z']];
  const HIGHLIGHTS = [[['M', 2.0, -17.4], ['C', -4.2, -16.2, -9.2, -13.0, -11.8, -8.4]], [['M', 8.8, -16.2], ['C', 10.8, -14.6, 12.2, -12.4, 13.0, -10.0]]];
  const BROWS = [[['M', -9.2, -2.2], ['C', -7.8, -3.4, -5.6, -3.6, -4.0, -2.8]], [['M', 9.2, -2.2], ['C', 7.8, -3.4, 5.6, -3.6, 4.0, -2.8]]];
  // expression lines, kept subtle: a faint forehead line (where the bangs leave the forehead clear), crow's feet,
  // a soft line under the eyes and short folds by the mouth
  const LINES = [
    [['M', 3.0, -6.2], ['C', 4.8, -6.7, 6.8, -6.7, 8.6, -6.2]],
    [['M', 9.7, 1.6], ['L', 11.1, 0.9]], [['M', 9.8, 3.2], ['L', 11.3, 3.6]],
    [['M', -9.7, 1.6], ['L', -11.1, 0.9]], [['M', -9.8, 3.2], ['L', -11.3, 3.6]],
    [['M', 4.8, 6.6], ['C', 5.8, 7.1, 7.0, 7.1, 7.8, 6.6]], [['M', -4.8, 6.6], ['C', -5.8, 7.1, -7.0, 7.1, -7.8, 6.6]],
    [['M', 3.9, 7.0], ['C', 4.8, 8.1, 4.9, 9.4, 4.4, 10.4]], [['M', -3.9, 7.0], ['C', -4.8, 8.1, -4.9, 9.4, -4.4, 10.4]]
  ];
  // melasma: irregular patches on both cheekbones, the upper lip and the forehead; [x, y, rx, ry, rotation]
  const SPOTS = [[9.0, 5.8, 2.7, 1.9, 0.3], [10.9, 4.5, 1.7, 1.2, 0], [7.5, 7.0, 1.4, 1.0, 0.2], [-9.2, 5.6, 2.5, 1.8, -0.3],
    [-11.1, 4.3, 1.6, 1.1, 0], [-7.7, 7.2, 1.3, 1.0, -0.2], [0, 8.4, 2.2, 0.7, 0], [6.4, -5.6, 2.0, 0.9, 0.1]];
  // wrap dress: covers the shoulders (cap sleeves on the arms), fitted to the waist, flared to just above the knee
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
        armL: ik(SH.L, { x: -11.8, y: -38.0 }, ARM.L1, ARM.L2, -1), armR: ik(SH.R, { x: 11.8, y: -38.0 }, ARM.L1, ARM.L2, 1)
      })],
      ['Caminar', { legL: { a1: -12, a2: 8 }, legR: { a1: 8, a2: -4 }, armL: { a1: -20, a2: 8 }, armR: { a1: 12, a2: -6 } }],
      ['Brazos arriba', { armL: { a1: -144, a2: -22 }, armR: { a1: 144, a2: 22 }, mouth: true }],
      ['Saltando de emoción', { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 12, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      const amount = v => (v === true ? 1 : Math.max(0, Math.min(1, +v || 0)));   // on/off, or 0–1 for before/after scenes
      const lines = amount(pose.lines), spots = amount(pose.spots), glow = amount(pose.glow);

      use(S.head);                                                            // back of the lob, behind the shoulders
      H.fill(ctx, BACK, C.hair);

      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // legs below the skirt, teal flats
        H.leg(ctx, lg, { w: 5.6, color: C.skin, shoe: { dx: side * 0.8, dy: 1.4, rx: 4.6, ry: 2.5, color: C.shoeEdge } });
        ctx.save(); ctx.translate(lg.W.x, lg.W.y); ctx.rotate(-lg.end * Math.PI / 180);
        H.ellipse(ctx, side * 0.8, 1.25, 4.25, 2.15, C.shoe);
        ctx.restore();
      }

      use(S.body);
      H.fill(ctx, DRESS, C.dress);
      H.fill(ctx, [['M', -4.8, -56.6], ['L', 0.8, -48.6], ['L', 4.8, -56.6], ['Z']], C.skin);                    // wrap V-neck
      H.stroke(ctx, [['M', 0.8, -48.6], ['C', 3.6, -44.6, 6.4, -41.6, 9.0, -39.6]], C.dressEdge, 0.6);      // wrap seam
      H.stroke(ctx, [['M', -10.2, -38.8], ['C', -3.4, -38.2, 3.4, -38.2, 10.2, -38.8]], C.dressEdge, 0.5);  // waist
      H.stroke(ctx, [['M', 9.2, -39.0], ['C', 10.4, -36.4, 10.2, -33.8, 9.4, -31.8]], C.dressEdge, 1.0);    // tie
      H.stroke(ctx, [['M', 9.8, -39.0], ['C', 11.8, -37.0, 12.4, -35.0, 12.2, -33.2]], C.dressEdge, 1.0);
      H.ellipse(ctx, 9.5, -39.3, 1.2, 0.95, C.dressEdge);
      H.stroke(ctx, [['M', -3.4, -56.2], ['C', -2.2, -53.0, 2.4, -53.0, 3.6, -56.2]], C.chain, 0.35);         // fine necklace
      H.ellipse(ctx, 0.2, -53.5, 0.75, 0.75, C.pendant);
      H.ellipse(ctx, 0, -57.4, 2.8, 3.0, C.skin);                           // neck (shows when the head tilts)

      const armStyle = { w: 5.2, color: C.skin, hand: 3.1, handColor: C.skin, cap: { to: 0.26, w: 7.8, color: C.dress, edge: C.dressEdge } };
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
      if (lines > 0) { ctx.save(); ctx.globalAlpha *= 0.4 * lines; for (const l of LINES) H.stroke(ctx, l, C.line, 0.35); ctx.restore(); }
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
        for (const [x, y, rx, ry, rot] of [[9.0, 4.0, 4.8, 2.2, -0.35], [-9.0, 4.0, 4.8, 2.2, 0.35], [6.0, -6.4, 2.8, 1.2, 0], [0, 13.2, 2.2, 1.1, 0]]) {
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
      for (const h of HIGHLIGHTS) H.stroke(ctx, h, C.highlight, 1.0);        // caramel highlights
      ctx.save(); ctx.translate(12.8, -11.6); ctx.rotate(0.95);              // clip on the side of the part
      ctx.beginPath(); ctx.roundRect(-3.0, -1.1, 6.0, 2.2, 1.1); ctx.fillStyle = C.clipEdge; ctx.fill();
      ctx.beginPath(); ctx.roundRect(-2.7, -0.85, 5.4, 1.7, 0.85); ctx.fillStyle = C.clip; ctx.fill();
      H.ellipse(ctx, -1.2, 0, 0.45, 0.45, '#ffffff');
      ctx.restore();

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, false);
      if (raised(g.armR)) drawArm(g.armR, pose.mirror);
    }
  };
})();
