/* Young man with hair loss: rig, poses and drawing for the avatar editor (units: ~100 tall, origin between the feet, y up is negative).
   Adult proportions (a bit taller than Dra. Marcela); a hairline that goes from full (0) to receding temples (1), light stubble,
   polo shirt, jeans and sneakers. */
(function () {
  'use strict';
  const C = {
    skin: '#c89068', ear: '#b27a56', hair: '#2a1f1b', strand: '#433229', polo: '#0d7582', poloEdge: '#0a6570', collar: '#09545d',
    button: '#e8fafd', jeans: '#34495a', shoe: '#2c3940', sole: '#ffffff', blush: '#d99079'
  };
  const lerp = (a, b, k) => a + (b - a) * k;
  // head space: origin at the head centre, eyes at y 2.4; an adult face with a broader jaw and a skull tall enough to
  // stay under the hair when the hairline recedes
  const HEAD = [['M', 0, -19.2], ['C', 10.2, -19.2, 16.0, -11.4, 16.0, -1.4], ['C', 16.0, 6.4, 13.6, 12.6, 9.0, 15.6],
    ['C', 6.0, 17.4, -6.0, 17.4, -9.0, 15.6], ['C', -13.6, 12.6, -16.0, 6.4, -16.0, -1.4], ['C', -16.0, -11.4, -10.2, -19.2, 0, -19.2], ['Z']];
  // hair: crown and sides stay; the front hairline goes from FULL to RECEDED (temples up, a small tuft in the middle)
  const SIDES = [['M', -16.3, 1.0], ['C', -17.6, -6.0, -16.6, -14.0, -10.0, -18.2], ['C', -4.4, -21.0, 4.4, -21.0, 10.0, -18.2],
    ['C', 16.6, -14.0, 17.6, -6.0, 16.3, 1.0], ['C', 15.6, 2.2, 14.4, 2.0, 14.2, 0.6]];
  const FULL = [[14.0, -2.6, 13.2, -5.0, 12.0, -6.2], [9.4, -7.8, 6.6, -8.2, 4.0, -7.8], [1.4, -7.4, -1.4, -7.4, -4.0, -7.8],
    [-6.6, -8.2, -9.4, -7.8, -12.0, -6.2], [-13.2, -5.0, -14.0, -2.6, -14.2, 0.6]];
  const RECEDED = [[14.0, -3.6, 13.4, -8.4, 11.9, -10.8], [9.8, -15.4, 7.6, -16.8, 5.2, -16.2], [2.2, -12.2, -2.2, -12.2, -5.2, -16.2],
    [-7.6, -16.8, -9.8, -15.4, -11.9, -10.8], [-13.4, -8.4, -14.0, -3.6, -14.2, 0.6]];
  function hairPath(k) {
    const cmds = SIDES.slice();
    FULL.forEach((f, i) => cmds.push(['C'].concat(f.map((v, j) => lerp(v, RECEDED[i][j], k)))));
    cmds.push(['C', -14.4, 2.0, -15.6, 2.2, -16.3, 1.0], ['Z']);
    return cmds;
  }
  // light stubble over the jaw, chin and upper lip
  const STUBBLE = [['M', -15.2, 2.4], ['C', -15.0, 9.4, -12.6, 14.2, -8.2, 16.0], ['C', -4.4, 17.6, 4.4, 17.6, 8.2, 16.0],
    ['C', 12.6, 14.2, 15.0, 9.4, 15.2, 2.4], ['C', 13.4, 7.4, 10.6, 10.0, 6.6, 10.4], ['C', 4.2, 7.8, 1.6, 7.6, 0, 8.0],
    ['C', -1.6, 7.6, -4.2, 7.8, -6.6, 10.4], ['C', -10.6, 10.0, -13.4, 7.4, -15.2, 2.4], ['Z']];
  const BROWS = [[['M', -8.6, -2.2], ['C', -7.2, -3.0, -5.0, -3.0, -3.4, -2.4]], [['M', 8.6, -2.2], ['C', 7.2, -3.0, 5.0, -3.0, 3.4, -2.4]]];
  const TORSO = [['M', -5.6, -62.0], ['C', -10.4, -62.2, -13.8, -60.0, -14.2, -55.2], ['C', -14.6, -47.6, -14.8, -38.0, -14.6, -31.6],
    ['C', -14.5, -29.6, -13.4, -28.6, -11.8, -28.6], ['L', 11.8, -28.6], ['C', 13.4, -28.6, 14.5, -29.6, 14.6, -31.6],
    ['C', 14.8, -38.0, 14.6, -47.6, 14.2, -55.2], ['C', 13.8, -60.0, 10.4, -62.2, 5.6, -62.0], ['Z']];
  const COLLAR = [[['M', -6.2, -62.4], ['C', -4.8, -60.6, -2.8, -58.8, -1.0, -57.4], ['L', -3.6, -56.2], ['C', -5.2, -57.6, -6.6, -59.6, -7.6, -61.6], ['Z']],
    [['M', 6.2, -62.4], ['C', 4.8, -60.6, 2.8, -58.8, 1.0, -57.4], ['L', 3.6, -56.2], ['C', 5.2, -57.6, 6.6, -59.6, 7.6, -61.6], ['Z']]];

  const ARM = { L1: 12.8, L2: 12.2 };
  const SH = { L: { x: -12.6, y: -56.0 }, R: { x: 12.6, y: -56.0 } };

  window.AVATARS = window.AVATARS || {};
  window.AVATARS['man-balding'] = {
    name: 'Joven con caída del cabello',
    fileName: 'joven-caida-cabello-avatar.png',
    U: 7.8, shadowRx: 16,
    arm: ARM, leg: { L1: 10.8, L2: 10.4 },
    shoulders: SH,
    hips: { L: { x: -5.2, y: -25.2 }, R: { x: 5.2, y: -25.2 } },
    hipPivot: { x: 0, y: -25.2 }, neck: { x: 0, y: -61.2 }, headAbove: 15.4, headHandle: 27, leanHandle: { x: 0, y: -42 },
    defaults: {
      armL: { a1: -14, a2: 12 }, armR: { a1: 14, a2: -12 }, legL: { a1: -2, a2: 0 }, legR: { a1: 2, a2: 0 },
      hairloss: true, beard: true, blink: false, mouth: false, mask: false
    },
    keep: ['mask', 'hairloss', 'beard'],
    checks: [['hairloss', 'Entradas (caída del cabello)'], ['beard', 'Barba de pocos días'], ['blink', 'Ojos cerrados'],
      ['mouth', 'Boca abierta'], ['mask', 'Mascarilla']],
    presets: [
      ['De pie', {}],
      ['Saludar', { armR: { a1: 142, a2: 26 }, tilt: -4, mouth: true }],
      ['Rascándose la cabeza', ({ ik }) => ({ armR: ik(SH.R, { x: 15.4, y: -79.5 }, ARM.L1, ARM.L2, 1), tilt: 5 })],
      ['Brazos arriba', { armL: { a1: -144, a2: -22 }, armR: { a1: 144, a2: 22 }, mouth: true }],
      ['Mostrar el brazo', { armL: { a1: -84, a2: -6 }, tilt: 4 }],
      ['Manos en la cintura', ({ ik }) => ({
        armL: ik(SH.L, { x: -16.2, y: -38.0 }, ARM.L1, ARM.L2, -1), armR: ik(SH.R, { x: 16.2, y: -38.0 }, ARM.L1, ARM.L2, 1)
      })],
      ['Caminar', { legL: { a1: -14, a2: 10 }, legR: { a1: 10, a2: -4 }, armL: { a1: -20, a2: 8 }, armR: { a1: 12, a2: -6 } }],
      ['Saltando de emoción', { armL: { a1: -124, a2: -16 }, armR: { a1: 124, a2: 16 }, legL: { a1: -30, a2: 52 }, legR: { a1: 30, a2: -52 },
        lift: 14, tilt: -5, mouth: true }]
    ],
    draw({ ctx, pose, use, S, g, H }) {
      const loss = pose.hairloss === true ? 1 : Math.max(0, Math.min(1, +pose.hairloss || 0));   // 0 full hair … 1 receding
      const beard = pose.beard === true ? 1 : Math.max(0, Math.min(1, +pose.beard || 0));

      use(S.root);
      for (const [lg, side] of [[g.legL, -1], [g.legR, 1]]) {         // jeans down to the sneaker, turned with the shin
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(lg.S.x, lg.S.y); ctx.lineTo(lg.E.x, lg.E.y); ctx.lineTo(lg.W.x, lg.W.y);
        ctx.strokeStyle = C.jeans; ctx.lineWidth = 7.4; ctx.stroke();
        ctx.save(); ctx.translate(lg.W.x, lg.W.y); ctx.rotate(-lg.end * Math.PI / 180);
        H.ellipse(ctx, side * 1.1, 1.4, 5.6, 3.0, C.shoe);
        H.ellipse(ctx, side * 1.2, 3.5, 5.7, 1.0, C.sole);
        ctx.restore();
      }
      // seat of the jeans: the waistband turns with the torso (tucked under the polo); the legs' round tops cover the hips
      const toRoot = S.root.inverse().multiply(S.body);
      const fromBody = (x, y) => { const q = toRoot.transformPoint(new DOMPoint(x, y)); return { x: q.x, y: q.y }; };
      const wl = fromBody(-13.0, -31.4), wr = fromBody(13.0, -31.4), hl = fromBody(-13.6, -27.4), hr = fromBody(13.6, -27.4);
      ctx.fillStyle = C.jeans;
      ctx.beginPath();
      ctx.moveTo(wl.x, wl.y); ctx.lineTo(wr.x, wr.y);
      ctx.bezierCurveTo(hr.x, hr.y, 11.4, -26.0, 9.0, -24.2);
      ctx.quadraticCurveTo(4.8, -22.6, 0, -23.4);
      ctx.quadraticCurveTo(-4.8, -22.6, -9.0, -24.2);
      ctx.bezierCurveTo(-11.4, -26.0, hl.x, hl.y, wl.x, wl.y);
      ctx.closePath(); ctx.fill();

      use(S.body);
      H.fill(ctx, TORSO, C.polo);
      H.fill(ctx, [['M', -1.8, -62.4], ['L', 0, -58.2], ['L', 1.8, -62.4], ['Z']], C.skin);   // open collar
      for (const flap of COLLAR) H.fill(ctx, flap, C.collar);
      H.stroke(ctx, [['M', 0, -58.0], ['L', 0, -51.6]], C.poloEdge, 0.5);                    // placket with two buttons
      for (const y of [-55.6, -53.0]) H.ellipse(ctx, 0.9, y, 0.55, 0.55, C.button);
      H.ellipse(ctx, 0, -63.0, 3.4, 3.4, C.skin);                           // neck (shows when the head tilts)

      const armStyle = { w: 5.8, color: C.skin, hand: 3.4, handColor: C.skin, cap: { to: 0.33, w: 8.6, color: C.polo, edge: C.poloEdge } };
      const raised = ga => ga.W.y < ga.S.y - 4;
      if (!raised(g.armL)) H.arm(ctx, g.armL, armStyle);
      if (!raised(g.armR)) H.arm(ctx, g.armR, armStyle);

      use(S.head);
      for (const sx of [-1, 1]) {                                            // ears
        H.ellipse(ctx, sx * 15.8, 2.6, 2.6, 3.4, C.skin);
        H.ellipse(ctx, sx * 16.5, 2.8, 1.2, 2.0, C.ear);
      }
      H.fill(ctx, HEAD, C.skin);
      if (beard > 0) { ctx.save(); ctx.globalAlpha *= 0.15 * beard; H.fill(ctx, STUBBLE, C.hair); ctx.restore(); }
      H.face(ctx, { eyeY: 2.4, eyeDX: 5.8, rx: 1.9, ry: 2.4, mouthY: 9.4, mouthW: 2.6, blush: C.blush, blink: pose.blink, open: pose.mouth });
      for (const b of BROWS) H.stroke(ctx, b, C.hair, 1.15);
      if (pose.mask) { ctx.save(); ctx.translate(0, 0.9); H.mask(ctx); ctx.restore(); }
      const hair = hairPath(loss);
      H.fill(ctx, hair, C.hair);
      if (loss > 0) {                                                         // thinner on top: a little scalp shows through
        ctx.save(); H.path(ctx, hair); ctx.clip();
        const fade = ctx.createRadialGradient(0, -15.2, 0, 0, -15.2, 7.5);
        fade.addColorStop(0, 'rgba(200, 144, 104, ' + (0.45 * loss) + ')'); fade.addColorStop(1, 'rgba(200, 144, 104, 0)');
        ctx.fillStyle = fade; ctx.fillRect(-9, -24, 18, 18);
        ctx.restore();
      }
      ctx.save(); H.path(ctx, hair); ctx.clip();                              // fine combed-back strands, kept inside the hair
      for (const x of [-8.0, -4.4, -0.8, 2.8, 6.4]) {
        const y0 = lerp(-8.6, -14.6, loss) - Math.abs(x) * 0.16;
        H.stroke(ctx, [['M', x, y0], ['C', x * 0.96, y0 - 2.6, x * 0.84, -18.6, x * 0.74, -20.0]], C.strand, 0.4);
      }
      ctx.restore();

      use(S.body);                                                            // raised arms go in front of the hair
      if (raised(g.armL)) H.arm(ctx, g.armL, armStyle);
      if (raised(g.armR)) H.arm(ctx, g.armR, armStyle);
    }
  };
})();
