/* Anuncio en video «Dermatología pediátrica» para Instagram, TikTok y Facebook.
   Base: la animación «hero-pediatria» de assets/js/avatar-animations.js, cuadro por cuadro, con los textos del anuncio
   y la tarjeta final. Lo dibuja render.html y render.py lo convierte en MP4 (ver README.md de esta carpeta). */
(function () {
  'use strict';
  const SCENE = window.AvatarAnimations.list['hero-pediatria'];

  const C = {
    surface: '#f7f7f7', ink: '#333333', white: '#ffffff', mist: '#d0ecf0',
    teal500: '#14b5c9', teal700: '#0d7582', teal800: '#09545d', chipShadow: '#d2e8ec', wa: '#25d366'
  };
  const FONT = '"Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif';
  const WA = new Path2D('M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z');

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const easeOut = x => { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); };
  const backOut = x => { x = clamp(x, 0, 1); return 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2); };

  // smooth, monotone curve through [time, value] points (Fritsch–Carlson), used to slow the animation where text needs reading time
  function monotone(points) {
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]), n = points.length, d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { const s = 3 / Math.sqrt(h); m[i] = s * a * d[i]; m[i + 1] = s * b * d[i]; }
    }
    return x => {
      if (x >= xs[n - 1]) return ys[n - 1] + m[n - 1] * (x - xs[n - 1]);
      let i = 0; while (x > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], t = Math.max(0, x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (3 * t2 - 2 * t3) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
  }

  // ---------------- timeline (seconds of the ad) ----------------
  // ad time -> animation time: wave (0–1.8), arm shown (–3.5), lamp exam (–5.55), high five + jump (–8.1), goodbye wave (–10)
  const animTime = monotone([[0, 0], [2.2, 1.8], [4.9, 3.5], [7.6, 5.55], [10.4, 8.1], [13.6, 10.7]]);
  const END = 13.4;                 // end card opens here
  const DURATION = 17.2;
  const FOCUS = { x: 560, y: 620 }; // scene point the camera leans in on during the exam (the girl's forearm)
  const zoomAt = T => 1 + 0.1 * (ease(seg(T, 4.8, 6.0)) - ease(seg(T, 7.3, 8.3)));

  const CAPTIONS = [
    { t0: 0, t1: 2.3, eyebrow: 'DERMASGA · MACHALA', text: 'Dermatología\npediátrica', title: true },
    { t0: 2.3, t1: 4.95, eyebrow: '¿LE SUENA FAMILIAR?', text: '¿Manchas, granitos o\npicazón en la piel\nde su hijo?' },
    { t0: 4.95, t1: 7.65, eyebrow: 'CON CALMA Y SIN DOLOR', text: 'Revisamos su piel con\nluces especiales, sin\ninyecciones ni dolor' },
    { t0: 7.65, t1: 10.45, eyebrow: 'ATENCIÓN CERCANA', text: 'Para toda\nla familia' },
    { t0: 10.45, t1: 13.45, eyebrow: 'DESDE EL NACIMIENTO', text: 'Hasta la\nadolescencia' }
  ];
  // shown in this order, two per row, each row centred (long names paired with short ones)
  const CHIPS = ['Dermatitis atópica', 'Tiñas', 'Verrugas', 'Prúrigo por insectos', 'Dermatitis del pañal', 'Hemangiomas'];
  const CHIPS_IN = 10.75, CHIPS_OUT = 13.0;

  // ---------------- formats ----------------
  // scene: where the 1000×1000 animation goes (scale s, horizontal centre cx, feet line feetY).
  // Text stays inside each app's safe area: Instagram Reels ads keep the top 14 % and bottom 35 % clear;
  // TikTok covers more of the bottom and the right edge; the Facebook feed (4:5) has no overlays on the video.
  const FORMATS = {
    instagram: {
      label: 'Instagram Reels', w: 1080, h: 1920, cx: 540,
      scene: { s: 1.08, cx: 540, feetY: 1520 },
      type: { eyebrow: 32, text: 64, title: 96, eyebrowY: 292, textY: 342 },
      chips: { size: 36, rows: [575, 670, 765], shift: [0, -18, 14] },
      end: { scale: 1, top: 318, cx: 540 },
      cover: { tau: 7.35, scene: { s: 1.08, cx: 540, feetY: 1480 }, eyebrow: 34, eyebrowY: 330, title: 100, titleY: 384, url: 52, urlY: 1540 }
    },
    tiktok: {
      label: 'TikTok', w: 1080, h: 1920, cx: 520,
      scene: { s: 1.08, cx: 520, feetY: 1420 },
      type: { eyebrow: 32, text: 64, title: 96, eyebrowY: 250, textY: 300 },
      chips: { size: 34, rows: [522, 606, 690], shift: [0, -18, 14] },
      end: { scale: 1, top: 290, cx: 520 },
      cover: { tau: 7.35, scene: { s: 1.08, cx: 540, feetY: 1480 }, eyebrow: 34, eyebrowY: 330, title: 100, titleY: 384, url: 52, urlY: 1540 }
    },
    facebook: {
      label: 'Facebook', w: 1080, h: 1350, cx: 540,
      scene: { s: 0.94, cx: 540, feetY: 1285 },
      type: { eyebrow: 28, text: 56, title: 84, eyebrowY: 64, textY: 108 },
      chips: { size: 32, rows: [360, 448, 536], shift: [0, -18, 14] },
      end: { scale: 0.9, top: 287, cx: 540 },
      cover: { tau: 7.35, scene: { s: 0.9, cx: 540, feetY: 1215 }, eyebrow: 30, eyebrowY: 78, title: 88, titleY: 122, url: 46, urlY: 1262 }
    }
  };

  // ---------------- drawing ----------------
  function text(ctx, str, x, y, o) {
    ctx.save();
    ctx.font = `${o.weight} ${o.size}px ${FONT}`;
    ctx.fillStyle = o.color; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'top';
    const sp = (o.spacing || 0) * o.size;
    if (sp) ctx.letterSpacing = sp + 'px';
    str.split('\n').forEach((line, i) => ctx.fillText(line, x + sp / 2, y + i * o.size * 1.18));
    ctx.restore();
  }

  function drawScene(ctx, F, S, tau, zoom) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.surface; ctx.fillRect(0, 0, F.w, F.h);
    const x0 = S.cx - 500 * S.s, y0 = S.feetY - 900 * S.s;
    const fx = x0 + FOCUS.x * S.s, fy = y0 + FOCUS.y * S.s;
    SCENE.draw(ctx, new DOMMatrix().translate(fx, fy).scale(zoom).translate(-fx, -fy).translate(x0, y0).scale(S.s), tau);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function caption(ctx, F, cap, T, first) {
    if (T < cap.t0) return;
    const inK = first ? 1 : easeOut(seg(T, cap.t0, cap.t0 + 0.45));
    const a = inK * (1 - ease(seg(T, cap.t1 - 0.3, cap.t1)));
    if (a <= 0) return;
    const Y = F.type, dy = (1 - inK) * 26;
    ctx.save(); ctx.globalAlpha = a;
    text(ctx, cap.eyebrow, F.cx, Y.eyebrowY + dy, { size: Y.eyebrow, weight: 600, color: C.teal700, spacing: 0.28 });
    text(ctx, cap.text, F.cx, Y.textY + dy, { size: cap.title ? Y.title : Y.text, weight: 700, color: C.ink });
    ctx.restore();
  }

  const chipWidth = (ctx, label, size) => { ctx.font = `600 ${size}px ${FONT}`; return ctx.measureText(label).width + size * 1.4; };
  // centres of the chips: pairs side by side with a 24 px gap, each pair centred on the format's axis
  function chipSpots(ctx, F) {
    const G = F.chips, spots = [];
    for (let r = 0; r < G.rows.length; r++) {
      const a = chipWidth(ctx, CHIPS[2 * r], G.size), b = chipWidth(ctx, CHIPS[2 * r + 1], G.size);
      const left = F.cx + G.shift[r] - (a + 24 + b) / 2;
      spots.push([left + a / 2, G.rows[r]], [left + a + 24 + b / 2, G.rows[r]]);
    }
    return spots;
  }
  function chip(ctx, label, x, y, k, size) {
    if (k <= 0) return;
    ctx.save();
    const w = chipWidth(ctx, label, size), h = size * 2;
    ctx.translate(x, y); ctx.scale(backOut(k), backOut(k)); ctx.globalAlpha = clamp(k * 4, 0, 1);
    ctx.beginPath(); ctx.roundRect(-w / 2 + 4, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = C.chipShadow; ctx.fill();
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = C.white; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = C.teal500; ctx.stroke();
    ctx.fillStyle = C.teal800; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, size * 0.06);
    ctx.restore();
  }

  // end card: logo, name, WhatsApp pill and address on the brand teal
  const DOTS = [[150, 230, 30], [940, 300, 18], [900, 1560, 46], [140, 1400, 24], [560, 1790, 16], [1010, 980, 12], [70, 860, 14]];
  let LOGO = null;
  function endLine(ctx, str, x, y, size, weight, color, t, t0) {
    const k = easeOut(seg(t, t0, t0 + 0.45));
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; text(ctx, str, x, y + (1 - k) * 24, { size, weight, color }); ctx.restore(); }
    return y + size * 1.25;
  }
  function endCard(ctx, F, t) {
    const L = F.end, es = L.scale, cx = L.cx, vy = F.h / 1920;
    ctx.fillStyle = C.teal700; ctx.fillRect(0, 0, F.w, F.h);
    DOTS.forEach(([x, y, r], i) => {
      ctx.beginPath();
      ctx.arc(x + Math.sin(t * 0.7 + i) * 10, y * vy + Math.cos(t * 0.6 + i * 2) * 10, r, 0, Math.PI * 2);
      ctx.fillStyle = C.teal500; ctx.fill();
    });
    let y = L.top;
    const size = 280 * es, k = seg(t, 0.15, 0.6);
    if (k > 0 && LOGO) {
      ctx.save(); ctx.globalAlpha = easeOut(k);
      ctx.translate(cx, y + size / 2); ctx.scale(0.85 + 0.15 * backOut(k), 0.85 + 0.15 * backOut(k));
      ctx.beginPath(); ctx.roundRect(-size / 2, -size / 2, size, size, 42 * es); ctx.clip();
      ctx.drawImage(LOGO, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    y += size + 54 * es;
    y = endLine(ctx, 'Dra. Marcela Astudillo G.', cx, y, 58 * es, 700, C.white, t, 0.35);
    y = endLine(ctx, 'Dermatología pediátrica', cx, y + 2 * es, 42 * es, 600, C.mist, t, 0.5);
    y = endLine(ctx, 'Agende su cita por WhatsApp', cx, y + 46 * es, 44 * es, 600, C.white, t, 0.7);
    // WhatsApp pill with the number, then a soft pulse
    const pk = easeOut(seg(t, 0.85, 1.3));
    const ph = 116 * es, r = 44 * es, numSize = 54 * es;
    ctx.font = `700 ${numSize}px ${FONT}`;
    const pw = 14 * es + 2 * r + 24 * es + ctx.measureText('099 976 9176').width + 40 * es;
    const py = y + 18 * es;
    if (pk > 0) {
      const pulse = 1 + 0.035 * Math.pow(Math.sin(Math.max(0, t - 1.6) * 3), 2);
      ctx.save(); ctx.globalAlpha = pk;
      ctx.translate(cx, py + ph / 2 + (1 - pk) * 24); ctx.scale(pulse, pulse);
      ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = C.white; ctx.fill();
      const ix = -pw / 2 + 14 * es + r;
      ctx.beginPath(); ctx.arc(ix, 0, r, 0, Math.PI * 2); ctx.fillStyle = C.wa; ctx.fill();
      ctx.save(); ctx.translate(ix - r * 0.6, -r * 0.6); ctx.scale(r * 1.2 / 24, r * 1.2 / 24); ctx.fillStyle = C.white; ctx.fill(WA); ctx.restore();
      ctx.fillStyle = C.teal800; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('099 976 9176', ix + r + 24 * es, numSize * 0.06);
      ctx.restore();
    }
    y = py + ph + 44 * es;
    y = endLine(ctx, 'dermasga.com', cx, y, 60 * es, 700, C.white, t, 1.05);
    endLine(ctx, 'Machala · El Oro · Ecuador', cx, y + 2 * es, 36 * es, 500, C.mist, t, 1.2);
  }

  // ---------------- public ----------------
  function frame(ctx, fmt, T) {
    const F = FORMATS[fmt], S = F.scene;
    const reveal = ease(seg(T, END, END + 0.6));
    if (reveal < 1) {
      drawScene(ctx, F, S, animTime(T), zoomAt(T));
      const spots = chipSpots(ctx, F);
      CHIPS.forEach((label, i) => {
        const k = seg(T, CHIPS_IN + i * 0.26, CHIPS_IN + 0.45 + i * 0.26) * (1 - ease(seg(T, CHIPS_OUT, CHIPS_OUT + 0.4)));
        const [x, y] = spots[i];
        chip(ctx, label, x, y + Math.sin(T * 2 + i) * 5, k, F.chips.size);
      });
      CAPTIONS.forEach((cap, i) => caption(ctx, F, cap, T, i === 0));
    }
    if (reveal > 0) {                // the teal card opens as a circle from between the two characters
      const ox = S.cx - 500 * S.s + 515 * S.s, oy = S.feetY - 250 * S.s;
      ctx.save();
      ctx.beginPath(); ctx.arc(ox, oy, reveal * Math.hypot(F.w, F.h), 0, Math.PI * 2); ctx.clip();
      endCard(ctx, F, T - END);
      ctx.restore();
    }
  }

  function cover(ctx, fmt) {
    const F = FORMATS[fmt], K = F.cover, cx = K.scene.cx;
    drawScene(ctx, F, K.scene, K.tau, 1);
    text(ctx, 'DERMASGA · MACHALA', cx, K.eyebrowY, { size: K.eyebrow, weight: 600, color: C.teal700, spacing: 0.28 });
    text(ctx, 'Dermatología\npediátrica', cx, K.titleY, { size: K.title, weight: 700, color: C.ink });
    text(ctx, 'dermasga.com', cx, K.urlY, { size: K.url, weight: 700, color: C.teal700 });
  }

  function ready() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { LOGO = img; resolve(); };
      img.onerror = () => reject(new Error('No se pudo cargar /assets/img/mark.svg'));
      img.src = '/assets/img/mark.svg';
    });
  }

  window.ADS = window.ADS || {};
  window.ADS.pediatria = { formats: FORMATS, duration: DURATION, frame, cover, ready };
})();
