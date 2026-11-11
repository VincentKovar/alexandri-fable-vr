/**
 * Alexandria VR - scene toolkit.
 * Geometry batching (few draw calls), a PBR material library fed by CC0 texture maps in
 * /textures, and the generated textures (book spines, rug, window view, glow, globe...).
 * Plain script (no build step). Requires THREE r128 on window.
 */
(function () {
  'use strict';
  const THREE = window.THREE;

  const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvasTex(w, h, draw, opts = {}) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = opts.linear ? THREE.LinearEncoding : THREE.sRGBEncoding;
    if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    t.anisotropy = opts.aniso || 4;
    return t;
  }

  // ---------------------------------------------------------------- generated textures
  function glowTexture() {
    return canvasTex(128, 128, (g) => {
      const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      r.addColorStop(0, 'rgba(255,255,255,1)');
      r.addColorStop(0.25, 'rgba(255,240,210,0.55)');
      r.addColorStop(0.6, 'rgba(255,200,140,0.12)');
      r.addColorStop(1, 'rgba(255,180,120,0)');
      g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    });
  }

  function blobShadowTexture() {
    return canvasTex(128, 128, (g) => {
      const r = g.createRadialGradient(64, 64, 6, 64, 64, 64);
      r.addColorStop(0, 'rgba(255,255,255,1)');
      r.addColorStop(0.55, 'rgba(255,255,255,0.55)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    }, { linear: true });
  }

  // Book spine atlas: CELLS designs side by side. Each cell: spine (left 7/8) and a strip
  // (right 1/8) holding page-edge paper (upper half) and plain binding colour (lower half).
  const SPINE_CELLS = 32;
  function spineAtlas() {
    const CW = 64, CH = 512, W = CW * SPINE_CELLS;
    const rnd = mulberry(1851);
    const leathers = ['#5a1616', '#6b1f1a', '#3b0f12', '#16382a', '#1f4a36', '#12283f', '#1b3355',
      '#4a2f1a', '#6a4424', '#7a5a30', '#2a1a12', '#161616', '#8a6a44', '#c9b48a', '#3a2440', '#58301c'];
    const cells = [];
    const color = canvasTex(W, CH, (g) => {
      for (let i = 0; i < SPINE_CELLS; i++) {
        const x0 = i * CW, sw = 56;
        const base = leathers[Math.floor(rnd() * leathers.length)];
        const pale = base === '#c9b48a' || base === '#8a6a44';
        const gilt = pale ? '#5a3a12' : '#e2bd62';
        g.fillStyle = base; g.fillRect(x0, 0, CW, CH);
        // rounded spine shading
        const sh = g.createLinearGradient(x0, 0, x0 + sw, 0);
        sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(0.18, 'rgba(0,0,0,0.05)');
        sh.addColorStop(0.5, 'rgba(255,255,255,0.10)'); sh.addColorStop(0.82, 'rgba(0,0,0,0.08)');
        sh.addColorStop(1, 'rgba(0,0,0,0.6)');
        g.fillStyle = sh; g.fillRect(x0, 0, sw, CH);
        // leather mottling
        for (let k = 0; k < 260; k++) {
          g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,235,200'},${0.03 + rnd() * 0.05})`;
          g.fillRect(x0 + rnd() * sw, rnd() * CH, 1 + rnd() * 3, 1 + rnd() * 2);
        }
        const style = Math.floor(rnd() * 4);
        const bands = [];
        if (style < 3) {                         // raised bands
          const n = 4 + Math.floor(rnd() * 2);
          for (let b = 0; b < n; b++) bands.push(40 + (b + 0.5) * ((CH - 80) / n) + (b === 0 ? -14 : 0));
          bands.forEach((by) => {
            g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x0, by + 5, sw, 3);
            g.fillStyle = 'rgba(255,255,255,0.13)'; g.fillRect(x0, by - 4, sw, 3);
            g.fillStyle = gilt; g.fillRect(x0 + 3, by - 9, sw - 6, 1.5); g.fillRect(x0 + 3, by + 11, sw - 6, 1.5);
          });
        }
        // title label
        const ly = 70 + rnd() * 60, lh = 58 + rnd() * 26;
        if (rnd() < 0.7) {
          g.fillStyle = pale ? '#3b1612' : ['#1a1410', '#6b1f1a', '#123024', '#0f2038'][Math.floor(rnd() * 4)];
          g.fillRect(x0 + 5, ly, sw - 10, lh);
          g.strokeStyle = '#e2bd62'; g.lineWidth = 1.2; g.strokeRect(x0 + 7, ly + 2, sw - 14, lh - 4);
          g.fillStyle = '#e2bd62';
        } else { g.fillStyle = gilt; }
        const lines = 3 + Math.floor(rnd() * 3);
        for (let l = 0; l < lines; l++) {
          const lw = (sw - 22) * (0.5 + rnd() * 0.5);
          g.fillRect(x0 + sw / 2 - lw / 2, ly + 10 + l * ((lh - 18) / lines), lw, 2.4);
        }
        // gilt ornaments in the panels + head and tail lines
        g.fillStyle = gilt; g.strokeStyle = gilt; g.lineWidth = 1.2;
        for (let o = 0; o < 3; o++) {
          const oy = 220 + o * 88 + rnd() * 12, cx = x0 + sw / 2;
          if (style === 0) { g.beginPath(); g.moveTo(cx, oy - 9); g.lineTo(cx + 7, oy); g.lineTo(cx, oy + 9); g.lineTo(cx - 7, oy); g.closePath(); g.stroke(); }
          else if (style === 1) { g.beginPath(); g.arc(cx, oy, 6, 0, 6.3); g.stroke(); g.fillRect(cx - 1, oy - 1, 2, 2); }
          else if (style === 2) { g.fillRect(cx - 9, oy - 1, 18, 2); g.fillRect(cx - 1, oy - 9, 2, 18); }
        }
        g.fillRect(x0 + 2, 10, sw - 4, 3); g.fillRect(x0 + 2, CH - 14, sw - 4, 3);
        if (rnd() < 0.5) { g.fillRect(x0 + 2, 18, sw - 4, 1.5); g.fillRect(x0 + 2, CH - 20, sw - 4, 1.5); }
        // strip: paper edge (top half of the texture) and plain binding (bottom half)
        g.fillStyle = base; g.fillRect(x0 + sw, CH / 2, CW - sw, CH / 2);
        g.fillStyle = '#e4d6b4'; g.fillRect(x0 + sw, 0, CW - sw, CH / 2);
        g.fillStyle = 'rgba(120,90,50,0.25)';
        for (let p = 0; p < 40; p++) g.fillRect(x0 + sw, rnd() * CH / 2, CW - sw, 1);
        cells.push({ gilt });
      }
    }, { aniso: 8 });
    return { color, cells: SPINE_CELLS };
  }

  function persianRug() {
    return canvasTex(1024, 704, (g, W, H) => {
      const rnd = mulberry(77);
      const q = document.createElement('canvas'); q.width = W / 2; q.height = H / 2;
      const c = q.getContext('2d'), w = q.width, h = q.height;
      const navy = '#16233f', crimson = '#7a1a1c', cream = '#e6d5ac', gold = '#c49a3c', teal = '#2f5d5a', rose = '#b4534a';
      c.fillStyle = navy; c.fillRect(0, 0, w, h);
      // borders (drawn for the top-left quarter; mirrored four ways below)
      const band = (inset, width, col) => { c.fillStyle = col; c.fillRect(inset, inset, w - inset, width); c.fillRect(inset, inset, width, h - inset); };
      band(0, 10, cream); band(10, 46, crimson); band(56, 8, gold); band(64, 22, navy); band(86, 6, cream);
      c.fillStyle = crimson; c.fillRect(92, 92, w - 92, h - 92);
      const flower = (x, y, r, a, b) => {
        for (let k = 0; k < 8; k++) {
          const t = k * Math.PI / 4;
          c.fillStyle = a; c.beginPath(); c.ellipse(x + Math.cos(t) * r * 0.6, y + Math.sin(t) * r * 0.6, r * 0.42, r * 0.2, t, 0, 6.3); c.fill();
        }
        c.fillStyle = b; c.beginPath(); c.arc(x, y, r * 0.3, 0, 6.3); c.fill();
      };
      const diamond = (x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - ry); c.lineTo(x + rx, y); c.lineTo(x, y + ry); c.lineTo(x - rx, y); c.closePath(); c.fill(); };
      for (let x = 34; x < w; x += 46) { flower(x, 33, 15, cream, gold); diamond(x + 23, 33, 5, 9, teal); }
      for (let y = 79; y < h; y += 46) { flower(33, y, 15, cream, gold); diamond(33, y + 23, 9, 5, teal); }
      for (let x = 100; x < w; x += 22) diamond(x, 75, 6, 8, rose);
      for (let y = 100; y < h; y += 22) diamond(75, y, 8, 6, rose);
      // field: scattered vines and flowers
      for (let k = 0; k < 70; k++) {
        const x = 110 + rnd() * (w - 120), y = 110 + rnd() * (h - 120);
        if (rnd() < 0.5) flower(x, y, 7 + rnd() * 7, rnd() < 0.5 ? cream : gold, navy);
        else diamond(x, y, 4 + rnd() * 5, 6 + rnd() * 6, rnd() < 0.5 ? teal : navy);
      }
      // corner spandrel + central medallion (medallion centre is this quarter's bottom-right corner)
      c.fillStyle = navy; c.beginPath(); c.moveTo(92, 92); c.lineTo(250, 92); c.quadraticCurveTo(150, 150, 92, 230); c.closePath(); c.fill();
      flower(140, 140, 22, gold, cream);
      const med = (rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(w, h, rx, ry, 0, 0, 6.3); c.fill(); };
      med(250, 170, navy); med(232, 154, gold); med(224, 147, cream); med(206, 132, navy); med(150, 96, crimson); med(96, 60, gold); med(80, 48, navy); med(40, 24, cream);
      for (let k = 0; k < 14; k++) { const t = Math.PI + (k / 13) * Math.PI / 2; flower(w + Math.cos(t) * 178, h + Math.sin(t) * 114, 12, cream, crimson); }
      for (let k = 0; k < 9; k++) { const t = Math.PI + (k / 8) * Math.PI / 2; diamond(w + Math.cos(t) * 122, h + Math.sin(t) * 78, 5, 8, gold); }
      // mirror the quarter four ways
      g.drawImage(q, 0, 0);
      g.save(); g.translate(W, 0); g.scale(-1, 1); g.drawImage(q, 0, 0); g.restore();
      g.save(); g.translate(0, H); g.scale(1, -1); g.drawImage(q, 0, 0); g.restore();
      g.save(); g.translate(W, H); g.scale(-1, -1); g.drawImage(q, 0, 0); g.restore();
      // wool texture
      for (let k = 0; k < 26000; k++) {
        g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,240,210'},${rnd() * 0.07})`;
        g.fillRect(rnd() * W, rnd() * H, 2, 1);
      }
    }, { aniso: 8 });
  }

  // Golden-hour view seen through the windows
  function windowView() {
    return canvasTex(512, 768, (g, W, H) => {
      const rnd = mulberry(5);
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#7fa6cf'); sky.addColorStop(0.42, '#f1d9a6'); sky.addColorStop(0.62, '#ffe9b8'); sky.addColorStop(1, '#f6c98a');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      const sun = g.createRadialGradient(330, 330, 0, 330, 330, 300);
      sun.addColorStop(0, 'rgba(255,255,245,1)'); sun.addColorStop(0.2, 'rgba(255,240,200,0.7)'); sun.addColorStop(1, 'rgba(255,220,160,0)');
      g.fillStyle = sun; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 9; k++) {            // soft clouds
        g.fillStyle = `rgba(255,250,235,${0.25 + rnd() * 0.3})`;
        g.beginPath(); g.ellipse(rnd() * W, 60 + rnd() * 240, 60 + rnd() * 90, 10 + rnd() * 18, 0, 0, 6.3); g.fill();
      }
      const hills = [['#9fb0a2', 470, 40], ['#7c9478', 520, 55], ['#566f4d', 580, 45]];
      hills.forEach(([col, base, amp], i) => {
        g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(x * 0.012 + i * 2.1)) - 12 * Math.sin(x * 0.045 + i));
        g.lineTo(W, H); g.closePath(); g.fill();
      });
      for (let k = 0; k < 14; k++) {            // cypress and round trees in the garden
        const x = rnd() * W, y = 590 + rnd() * 60, s = 0.7 + rnd() * 0.9;
        g.fillStyle = rnd() < 0.5 ? '#2f4a2c' : '#3c5a34';
        g.beginPath();
        if (rnd() < 0.5) g.ellipse(x, y - 46 * s, 12 * s, 52 * s, 0, 0, 6.3); else g.ellipse(x, y - 22 * s, 30 * s, 26 * s, 0, 0, 6.3);
        g.fill();
      }
      g.fillStyle = '#4c6a3c'; g.fillRect(0, 640, W, H - 640);
      const haze = g.createLinearGradient(0, 430, 0, H);
      haze.addColorStop(0, 'rgba(255,225,170,0.45)'); haze.addColorStop(1, 'rgba(255,225,170,0.05)');
      g.fillStyle = haze; g.fillRect(0, 430, W, H - 430);
    });
  }

  // Gilt rosette on cream plaster, for the ceiling coffers
  function cofferTexture() {
    return canvasTex(512, 512, (g, W) => {
      g.fillStyle = '#e9dfc6'; g.fillRect(0, 0, W, W);
      const v = g.createRadialGradient(W / 2, W / 2, 60, W / 2, W / 2, 360);
      v.addColorStop(0, 'rgba(255,255,255,0.25)'); v.addColorStop(1, 'rgba(120,90,50,0.28)');
      g.fillStyle = v; g.fillRect(0, 0, W, W);
      g.strokeStyle = '#b48a34'; g.lineWidth = 7; g.strokeRect(34, 34, W - 68, W - 68);
      g.lineWidth = 2.5; g.strokeRect(50, 50, W - 100, W - 100);
      g.translate(W / 2, W / 2);
      for (let ring = 0; ring < 3; ring++) {
        const n = [16, 12, 8][ring], R = [150, 104, 60][ring];
        for (let k = 0; k < n; k++) {
          const t = (k / n) * Math.PI * 2 + ring * 0.2;
          g.fillStyle = ring === 1 ? '#8a6420' : '#c9a044';
          g.beginPath(); g.ellipse(Math.cos(t) * R * 0.62, Math.sin(t) * R * 0.62, R * 0.42, R * 0.15, t, 0, 6.3); g.fill();
        }
      }
      g.fillStyle = '#e8c96a'; g.beginPath(); g.arc(0, 0, 22, 0, 6.3); g.fill();
      for (let k = 0; k < 4; k++) {
        g.save(); g.rotate(k * Math.PI / 2); g.translate(190, 190); g.fillStyle = '#b48a34';
        for (let p = 0; p < 4; p++) { g.beginPath(); g.ellipse(0, 0, 22, 7, p * Math.PI / 4, 0, 6.3); g.fill(); }
        g.restore();
      }
    });
  }

  function globeTexture() {
    return canvasTex(1024, 512, (g, W, H) => {
      const rnd = mulberry(1492);
      g.fillStyle = '#b9a779'; g.fillRect(0, 0, W, H);
      for (let k = 0; k < 70; k++) {            // antique continents as clustered blobs
        const cx = rnd() * W, cy = 70 + rnd() * (H - 140);
        g.fillStyle = ['#7c6a3c', '#8d7a45', '#6f6a3e', '#94763f'][Math.floor(rnd() * 4)];
        for (let b = 0; b < 9; b++) { g.beginPath(); g.ellipse(cx + (rnd() - 0.5) * 120, cy + (rnd() - 0.5) * 70, 18 + rnd() * 46, 12 + rnd() * 30, rnd() * 3, 0, 6.3); g.fill(); }
      }
      g.strokeStyle = 'rgba(60,40,20,0.35)'; g.lineWidth = 1;
      for (let x = 0; x <= W; x += W / 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y <= H; y += H / 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.strokeStyle = 'rgba(120,30,20,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    });
  }

  function friezeTexture(text) {
    return canvasTex(2048, 128, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#e6c35e'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '600 62px "Cinzel", "Trajan Pro", Georgia, serif';
      g.fillText(text.split('').join(' '), W / 2, H / 2 + 4);
    });
  }

  // ---------------------------------------------------------------- geometry helpers
  // Box with softened edges (upholstery, cushions, table tops)
  function rbox(w, h, d, r) {
    r = Math.max(0.002, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
    const s = new THREE.Shape();
    const x = w / 2 - r, y = h / 2 - r;
    s.moveTo(-x, -y); s.lineTo(x, -y); s.lineTo(x, y); s.lineTo(-x, y); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 3, steps: 1 });
    g.translate(0, 0, -(d - 2 * r) / 2);
    return g;
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const sph = (r, ws = 16, hs = 12) => new THREE.SphereGeometry(r, ws, hs);
  const lathe = (pts, seg = 20) => new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p[0], p[1])), seg);
  // Flat rectangular frame (moulded) around an opening of w x h
  function frameGeo(w, h, t, depth, bevel) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 - t, -h / 2 - t); s.lineTo(w / 2 + t, -h / 2 - t); s.lineTo(w / 2 + t, h / 2 + t); s.lineTo(-w / 2 - t, h / 2 + t); s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-w / 2, -h / 2); hole.lineTo(-w / 2, h / 2); hole.lineTo(w / 2, h / 2); hole.lineTo(w / 2, -h / 2); hole.closePath();
    s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, steps: 1 });
  }

  // ---------------------------------------------------------------- batcher
  // Collects transformed geometry per material and merges it, so the whole room is a few
  // draw calls. UVs are projected in world space (metres) so textures tile at real scale.
  function createBatcher(materials) {
    const parts = {};
    const stack = [new THREE.Matrix4()];
    const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
    let seed = 1;
    function T(x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) {
      return new THREE.Matrix4().compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz, 'YXZ')), _s.set(1, 1, 1));
    }
    function at(x, y, z, ry, fn, rx = 0, rz = 0) {
      stack.push(stack[stack.length - 1].clone().multiply(T(x, y, z, ry, rx, rz)));
      fn(); stack.pop();
    }
    function projectUV(g, def) {
      g.computeBoundingBox();
      const sz = g.boundingBox.getSize(new THREE.Vector3());
      const pos = g.attributes.position, nor = g.attributes.normal;
      const uv = new Float32Array(pos.count * 2);
      const tile = def.tile || 1;
      const ou = def.jitter ? ((seed * 0.6180339) % 1) * 7 : 0, ov = def.jitter ? ((seed * 0.3819660) % 1) * 7 : 0;
      seed++;
      for (let i = 0; i < pos.count; i++) {
        const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
        let u, v, du, dv;
        if (ay >= ax && ay >= az) { u = pos.getX(i); v = pos.getZ(i); du = sz.x; dv = sz.z; }
        else if (ax >= az) { u = pos.getZ(i); v = pos.getY(i); du = sz.z; dv = sz.y; }
        else { u = pos.getX(i); v = pos.getY(i); du = sz.x; dv = sz.y; }
        if (def.grain && dv > du) { const t = u; u = v; v = t; }   // wood grain runs along the long side
        uv[i * 2] = u / tile + ou; uv[i * 2 + 1] = v / tile + ov;
      }
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    }
    function add(key, geo, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) {
      const def = materials[key];
      if (!def) throw new Error('Unknown material ' + key);
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      g.applyMatrix4(stack[stack.length - 1].clone().multiply(T(x, y, z, ry, rx, rz)));
      if (!def.keepUV) projectUV(g, def);
      (parts[key] = parts[key] || []).push(g);
      geo.dispose();
    }
    function flush(parent) {
      const out = {};
      Object.keys(parts).forEach((key) => {
        const list = parts[key];
        let n = 0; list.forEach((g) => { n += g.attributes.position.count; });
        const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
        let o = 0;
        list.forEach((g) => {
          P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); U.set(g.attributes.uv.array, o * 2);
          o += g.attributes.position.count; g.dispose();
        });
        const merged = new THREE.BufferGeometry();
        merged.setAttribute('position', new THREE.BufferAttribute(P, 3));
        merged.setAttribute('normal', new THREE.BufferAttribute(N, 3));
        merged.setAttribute('uv', new THREE.BufferAttribute(U, 2));
        const def = materials[key];
        const mesh = new THREE.Mesh(merged, def.mat);
        mesh.castShadow = !!def.cast; mesh.receiveShadow = def.receive !== false;
        mesh.matrixAutoUpdate = false; mesh.name = 'batch:' + key;
        parent.add(mesh); out[key] = mesh;
      });
      return out;
    }
    return { add, at, flush, T, matrix: () => stack[stack.length - 1] };
  }

  // ---------------------------------------------------------------- material library
  function createMaterials(renderer, onAllLoaded) {
    const manager = new THREE.LoadingManager(onAllLoaded);
    const loader = new THREE.TextureLoader(manager);
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const load = (file, srgb) => {
      const t = loader.load('textures/' + file);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
      t.encoding = srgb ? THREE.sRGBEncoding : THREE.LinearEncoding;
      return t;
    };
    const pbr = (name, o = {}) => new THREE.MeshStandardMaterial(Object.assign({
      map: load(name + '_diff.jpg', true), normalMap: load(name + '_nor.jpg', false),
      roughnessMap: o.noRough ? null : load(name + '_rough.jpg', false)
    }, o.props || {}));
    const std = (hex, rough, metal = 0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(hex), roughness: rough, metalness: metal }, extra));
    const woodNor = load('wood_nor.jpg', false), leatherNor = load('leather_nor.jpg', false), velvetNor = load('velvet_nor.jpg', false);
    const woodMat = pbr('wood', { props: { color: lin(0xaeb096), roughness: 0.62, envMapIntensity: 0.55 } });
    const M = {
      wood:      { mat: woodMat, tile: 1.15, grain: true, jitter: true, cast: true },
      woodDark:  { mat: new THREE.MeshStandardMaterial({ map: woodMat.map, normalMap: woodNor, roughnessMap: woodMat.roughnessMap, color: lin(0x5c5a48), roughness: 0.6, envMapIntensity: 0.5 }), tile: 1.15, grain: true, jitter: true, cast: true },
      parquet:   { mat: pbr('parquet', { props: { color: lin(0xe6d2bc), roughness: 0.55, envMapIntensity: 0.75 } }), tile: 1.7 },
      leather:   { mat: pbr('leather', { props: { color: lin(0xe8c8b8), roughness: 0.6, envMapIntensity: 0.8 } }), tile: 0.55, cast: true },
      leatherGreen: { mat: std(0x1f4f3b, 0.62, 0, { normalMap: leatherNor, roughnessMap: load('leather_rough.jpg', false), envMapIntensity: 0.85 }), tile: 0.5, cast: true },
      stone:     { mat: pbr('marble', { props: { color: lin(0xf2e9d8), roughness: 0.75, envMapIntensity: 0.4 } }), tile: 0.9, cast: true },
      wall:      { mat: new THREE.MeshStandardMaterial({ map: load('jacquard_diff.jpg', true), normalMap: load('jacquard_nor.jpg', false), color: lin(0xb89a92), roughness: 0.92, envMapIntensity: 0.25 }), tile: 0.42, cast: true },
      plaster:   { mat: std(0xe9dfc8, 0.9, 0, { envMapIntensity: 0.3 }), tile: 1, cast: true },
      velvet:    { mat: std(0x1e4a39, 0.95, 0, { normalMap: velvetNor, envMapIntensity: 0.15, side: THREE.DoubleSide }), tile: 0.35, cast: true },
      gilt:      { mat: std(0xd9ab4a, 0.3, 1, { envMapIntensity: 1.25 }), tile: 1, cast: true },
      brass:     { mat: std(0xc79a45, 0.24, 1, { envMapIntensity: 1.3 }), tile: 1, cast: true },
      iron:      { mat: std(0x1a1816, 0.55, 0.8, { envMapIntensity: 0.6 }), tile: 1, cast: true },
      soot:      { mat: std(0x15110e, 1, 0), tile: 1 },
      wax:       { mat: std(0xf0e6cf, 0.5, 0, { emissive: lin(0x3a2a14) }), tile: 1 },
      paper:     { mat: std(0xefe6cf, 0.85, 0), tile: 1, cast: true },
      shade:     { mat: std(0xf2ddb0, 0.8, 0, { emissive: lin(0xffc47a), emissiveIntensity: 0.9, side: THREE.DoubleSide }), tile: 1 },
      glassGreen: { mat: std(0x1f6a4a, 0.25, 0, { emissive: lin(0x2fa36c), emissiveIntensity: 0.55 }), tile: 1 },
      ember:     { mat: std(0x2a0e06, 1, 0, { emissive: lin(0xff5a14), emissiveIntensity: 1.4 }), tile: 1 }
    };
    return { M, manager, loader, aniso };
  }

  window.AlexKit = {
    lin, mulberry, canvasTex, glowTexture, blobShadowTexture, spineAtlas, SPINE_CELLS, persianRug, windowView,
    cofferTexture, globeTexture, friezeTexture, rbox, box, cyl, sph, lathe, frameGeo, createBatcher, createMaterials
  };
})();
