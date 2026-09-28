/* Woman (aesthetic dermatology): rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet,
   y up is negative). Cute style like Dra. Marcela: round face, big eyes; hair pulled back into a top bun with a scrunchie
   (the face stays clear); sleeveless V-neck dress and white sneakers. Skin options for before/after scenes, each on/off
   or 0–1: expression lines, melasma spots and luminous skin. Prop: a hand mirror in the right hand. */
(function () {
  'use strict';
  const C = {
    skin: '#d6a079', ear: '#c48d67', hair: '#3b2620', shine: '#6b4430', scrunchie: '#14b5c9', scrunchieEdge: '#0f97a8',
    dress: '#0d7582', seam: '#0a6570', chain: '#c9a54a', pendant: '#a0e1ea', stud: '#ffffff', studEdge: '#d6e4e7',
    shoe: '#ffffff', shoeEdge: '#c9d6d9', sole: '#d6e4e7', lash: '#30201c', lip: '#d4777a', blush: '#eaa28c',
    line: '#b8835f', spot: '#a8714f', frame: '#0d7582', glass: '#e8fafd'
  };
  // head space: origin at the head centre, eyes at y 2.6; a round face
  const HEAD_RX = 17.2, HEAD_RY = 16.6;
  const faceClip = ctx => { ctx.beginPath(); ctx.ellipse(0, 0, HEAD_RX, HEAD_RY, 0, 0, Math.PI * 2); ctx.clip(); };
  // hair pulled back: a smooth cap with a rounded hairline, a bun on top and two soft wisps at the temples
  const CAP = [['M', -17.4, -2.0], ['C', -18.6, -11.4, -10.8, -18.4, 0, -18.4], ['C', 10.8, -18.4, 18.6, -11.4, 17.4, -2.0],
    ['C', 16.2, -1.4, 15.4, -3.2, 14.8, -5.0], ['C', 12.6, -9.6, 7.0, -11.6, 0, -11.6], ['C', -7.0, -11.6, -12.6, -9.6, -14.8, -5.0],
    ['C', -15.4, -3.2, -16.2, -1.4, -17.4, -2.0], ['Z']];
  const WISPS = [[['M', -13.8, -6.6], ['C', -15.6, -2.0, -15.2, 3.0, -13.4, 6.6]], [['M', 13.8, -6.6], ['C', 15.6, -2.0, 15.2, 3.0, 13.4, 6.6]]];
  const BROWS = [[['M', -9.2, -2.2], ['C', -7.8, -3.4, -5.6, -3.6, -4.0, -2.8]], [['M', 9.2, -2.2], ['C', 7.8, -3.4, 5.6, -3.6, 4.0, -2.8]]];
  // expression lines, kept subtle: a faint forehead line, crow's feet, a soft line under the eyes, short folds by the mouth
  const LINES = [
    [['M', -3.2, -6.4], ['C', -1.0, -6.9, 1.0, -6.9, 3.2, -6.4]],
    [['M', 9.7, 1.6], ['L', 11.1, 0.9]], [['M', 9.8, 3.2], ['L', 11.3, 3.6]],
    [['M', -9.7, 1.6], ['L', -11.1, 0.9]], [['M', -9.8, 3.2], ['L', -11.3, 3.6]],
    [['M', 4.8, 6.6], ['C', 5.8, 7.1, 7.0, 7.1, 7.8, 6.6]], [['M', -4.8, 6.6], ['C', -5.8, 7.1, -7.0, 7.1, -7.8, 6.6]],
    [['M', 3.9, 7.0], ['C', 4.8, 8.1, 4.9, 9.4, 4.4, 10.4]], [['M', -3.9, 7.0], ['C', -4.8, 8.1, -4.9, 9.4, -4.4, 10.4]]
  ];
  // melasma: irregular patches on both cheekbones, the upper lip and the forehead; [x, y, rx, ry, rotation]
  const SPOTS = [[9.0, 5.8, 2.7, 1.9, 0.3], [10.9, 4.5, 1.7, 1.2, 0], [7.5, 7.0, 1.4, 1.0, 0.2], [-9.2, 5.6, 2.5, 1.8, -0.3],
    [-11.1, 4.3, 1.6, 1.1, 0], [-7.7, 7.2, 1.3, 1.0, -0.2], [0, 8.4, 2.2, 0.7, 0], [1.4, -6.0, 2.2, 1.0, 0.1]];
  // bare shoulders under a sleeveless V-neck dress that flares from the waist to just above the knee
  const SHOULDERS = [['M', -5.0, -57.6], ['C', -9.2, -57.4, -12.0, -55.6, -12.2, -52.0], ['C', -12.3, -49.6, -11.2, -47.2, -10.2, -45.6],
    ['L', 10.2, -45.6], ['C', 11.2, -47.2, 12.3, -49.6, 12.2, -52.0], ['C', 12.0, -55.6, 9.2, -57.4, 5.0, -57.6], ['Z']];
  const DRESS = [['M', -4.2, -55.8], ['L', -7.8, -56.0], ['C', -8.6, -52.4, -9.8, -49.6, -10.6, -47.8], ['C', -10.9, -44.4, -10.2, -41.4, -9.6, -38.8],
    ['C', -12.0, -30.4, -14.6, -22.6, -15.0, -17.0], ['C', -15.1, -15.6, -14.2, -14.6, -12.8, -14.5], ['C', -8.6, -13.9, -4.2, -13.7, 0, -13.7],
    ['C', 4.2, -13.7, 8.6, -13.9, 12.8, -14.5], ['C', 14.2, -14.6, 15.1, -15.6, 15.0, -17.0], ['C', 14.6, -22.6, 12.0, -30.4, 9.6, -38.8],
    ['C', 10.2, -41.4, 10.9, -44.4, 10.6, -47.8], ['C', 9.8, -49.6, 8.6, -52.4, 7.8, -56.0], ['L', 4.2, -55.8], ['L', 0, -48.6], ['Z']];

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
    hipPivot: { x: 0, y: -23 }, neck: { x: 0, y: -56.6 }, headAbove: 16.4, headHandle: 34, leanHandle: { x: 0, y: -36 },
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

      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // legs below the skirt, white sneakers turned with the shin
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(lg.S.x, lg.S.y); ctx.lineTo(lg.E.x, lg.E.y); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.strokeStyle = C.skin; ctx.lineWidth = 5.6; ctx.stroke();
        ctx.save(); ctx.translate(lg.W.x, lg.W.y); ctx.rotate(-lg.end * Math.PI / 180);
        H.ellipse(ctx, side * 0.9, 1.3, 4.9, 2.7, C.shoeEdge);
        H.ellipse(ctx, side * 0.9, 1.1, 4.5, 2.35, C.shoe);
        H.ellipse(ctx, side * 1.0, 3.1, 4.8, 0.8, C.sole);
        ctx.restore();
      }

      use(S.body);
      H.fill(ctx, SHOULDERS, C.skin);
      H.fill(ctx, DRESS, C.dress);
      H.stroke(ctx, [['M', -9.6, -38.8], ['C', -3.2, -38.2, 3.2, -38.2, 9.6, -38.8]], C.seam, 0.6);   // waist seam
      H.stroke(ctx, [['M', -3.2, -56.4], ['C', -2.2, -53.4, 2.2, -53.4, 3.2, -56.4]], C.chain, 0.35);  // fine necklace
      H.ellipse(ctx, 0, -53.8, 0.75, 0.75, C.pendant);
      H.ellipse(ctx, 0, -57.4, 2.8, 3.0, C.skin);                           // neck (shows when the head tilts)

      const armStyle = { w: 5.2, color: C.skin, hand: 3.1, handColor: C.skin };
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
      for (const sx of [-1, 1]) {                                            // ears, visible with the hair up
        H.ellipse(ctx, sx * 16.6, 3.0, 2.4, 3.2, C.skin);
        H.ellipse(ctx, sx * 17.2, 3.2, 1.1, 1.9, C.ear);
      }
      H.ellipse(ctx, 0, 0, HEAD_RX, HEAD_RY, C.skin);
      for (const sx of [-1, 1]) { H.ellipse(ctx, sx * 16.9, 5.9, 0.95, 0.95, C.studEdge); H.ellipse(ctx, sx * 16.9, 5.8, 0.75, 0.75, C.stud); }
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
        for (const [x, y, rx, ry, rot] of [[9.0, 4.0, 4.8, 2.2, -0.35], [-9.0, 4.0, 4.8, 2.2, 0.35], [0, -6.4, 3.4, 1.5, 0], [0, 13.2, 2.2, 1.1, 0]]) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(rx, ry);
          const lg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
          lg.addColorStop(0, 'rgba(255, 246, 236, ' + (0.38 * glow) + ')'); lg.addColorStop(1, 'rgba(255, 246, 236, 0)');
          ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
      if (pose.mask) { ctx.save(); ctx.translate(0, 1.0); ctx.scale(1.04, 1.04); H.mask(ctx); ctx.restore(); }
      H.ellipse(ctx, 0, -21.0, 7.0, 6.6, C.hair);                             // top bun, then the smooth cap in front of its base
      H.stroke(ctx, [['M', -3.6, -21.2], ['C', -3.0, -25.0, 3.0, -25.2, 3.8, -21.8], ['C', 4.2, -19.4, 1.0, -19.0, -0.4, -20.6]], C.shine, 0.8);
      H.fill(ctx, CAP, C.hair);
      H.ellipse(ctx, 0, -18.4, 5.8, 2.0, C.scrunchieEdge);                    // scrunchie
      H.ellipse(ctx, 0, -18.6, 5.4, 1.7, C.scrunchie);
      for (const x of [-3.0, 0, 3.0]) H.stroke(ctx, [['M', x - 0.5, -19.6], ['L', x + 0.5, -17.6]], C.scrunchieEdge, 0.4);
      for (const w of WISPS) H.stroke(ctx, w, C.hair, 0.9);
      H.stroke(ctx, [['M', -10.4, -12.2], ['C', -8.4, -14.2, -5.6, -15.4, -2.6, -15.8]], C.shine, 0.9);   // shine on the crown

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) drawArm(g.armL, false);
      if (raised(g.armR)) drawArm(g.armR, pose.mirror);
    }
  };
})();
