/**
 * Alexandria VR - the library room.
 * A panelled private library: a full wall of built-in bookcases with marble columns, a stone
 * fireplace, two arched windows with late-afternoon sun, a coffered ceiling with a fresco,
 * leather furniture, a chandelier and a gallery of famous library interiors.
 *
 * Budget (Quest 2): 5 punctual lights + 1 hemisphere, ONE shadow caster (the sun), static
 * geometry merged per material (about 20 draw calls), decorative books in one instanced mesh.
 * World layout: x -4..4, z -2.1..4.6, ceiling 4 m. The interactive bookcase is centred on the
 * back wall (shelf front at z = -1.525); index.html owns its shelves and hero books.
 */
(function () {
  'use strict';
  const THREE = window.THREE, K = window.AlexKit;
  const { lin, box, cyl, sph, lathe, rbox, frameGeo } = K;

  function build(opts) {
    const { scene, renderer } = opts;
    const vr = opts.quality === 'vr';
    const SH = opts.shelf;                                   // { width, depth, tiers[], z, heroX[] }
    const ROOM = { xMin: -4, xMax: 4, zMin: -2.1, zMax: 4.6, h: 4.0 };
    const WIN = [-0.6, 2.9];                                 // window centres (z) on the right wall
    const rnd = K.mulberry(20261110);
    const group = new THREE.Group(); group.name = 'library-room';
    scene.add(group);

    let api = null;
    const lib = K.createMaterials(renderer, () => { if (api) api.refreshEnvironment(); });
    const M = lib.M;
    M.marbleRed = { mat: new THREE.MeshStandardMaterial({ color: lin(0x143a2c), roughness: 0.14, metalness: 0, envMapIntensity: 1.0 }), tile: 1, cast: true };
    M.coffer = { mat: new THREE.MeshStandardMaterial({ map: K.cofferTexture(), roughness: 0.9, envMapIntensity: 0.3 }), keepUV: true, receive: false };
    M.ao = { mat: new THREE.MeshBasicMaterial({ color: 0x000000, map: K.blobShadowTexture(), transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }), keepUV: true, receive: false };
    const B = K.createBatcher(M);
    const add = B.add, at = B.at;
    const wpos = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(B.matrix());
    const placed = (mesh, x, y, z) => {                      // unique mesh placed in the current frame
      mesh.applyMatrix4(B.matrix().clone().multiply(B.T(x, y, z)));
      group.add(mesh); return mesh;
    };
    const glowTex = K.glowTexture();

    // ============================================================ lights
    const LIGHT_BASE = { ambient: 0.5, key: 1.0, reading: 0.7 };
    const LIGHT_READING = { ambient: 0.22, key: 0.35, reading: 1.5 };
    const ambientLight = new THREE.HemisphereLight(lin(0xffe2bd), lin(0x4a3220), LIGHT_BASE.ambient);
    const sun = new THREE.DirectionalLight(lin(0xffcf9a), 2.4);
    sun.position.set(9.5, 5.6, 1.7); sun.target.position.set(-1.0, 0, 1.1);
    sun.castShadow = true;
    sun.shadow.mapSize.set(vr ? 1024 : 2048, vr ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -6.5, right: 6.5, top: 5, bottom: -5, near: 0.5, far: 24 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
    const keySpotlight = new THREE.SpotLight(lin(0xffdfb0), LIGHT_BASE.key, 14, Math.PI / 3.1, 0.7, 1.1);
    keySpotlight.position.set(0, 3.75, 1.3); keySpotlight.target.position.set(0, 1.3, -1.7);
    const readingSpotlight = new THREE.SpotLight(lin(0xfff0d8), LIGHT_BASE.reading, 10, Math.PI / 4, 0.7, 1.0);
    readingSpotlight.position.set(0, 3.75, 2.3); readingSpotlight.target.position.set(0, 1.3, 0.3);
    const deskLampLight = new THREE.PointLight(lin(0xffb564), 0.9, 5.5, 2);
    deskLampLight.position.set(-2.1, 1.18, 1.0);
    const fireLight = new THREE.PointLight(lin(0xff7a2e), 1.5, 7, 2);
    fireLight.position.set(-3.35, 0.5, 1.0);
    scene.add(ambientLight, sun, sun.target, keySpotlight, keySpotlight.target, readingSpotlight, readingSpotlight.target, deskLampLight, fireLight);

    // ============================================================ shell: floor, ceiling, walls
    add('parquet', box(8.6, 0.1, 7.3), 0.15, -0.05, 1.25);
    add('plaster', box(8.6, 0.1, 7.3), 0.15, 4.05, 1.25);
    add('wall', box(8.6, 4, 0.1), 0.15, 2, 4.65);                       // front wall
    add('wall', box(0.1, 4, 6.7), -4.05, 2, 1.25);                      // left wall (behind joinery)
    add('woodDark', box(8.6, 4, 0.1), 0.15, 2, -2.15);                  // back wall (behind bookcases)
    {                                                                   // right wall with arched windows
      const s = new THREE.Shape();
      s.moveTo(-2.1, 0); s.lineTo(4.6, 0); s.lineTo(4.6, 4); s.lineTo(-2.1, 4); s.closePath();
      WIN.forEach((zc) => {
        const h = new THREE.Path();
        h.moveTo(zc - 0.65, 0.75); h.lineTo(zc - 0.65, 2.7); h.absarc(zc, 2.7, 0.65, Math.PI, 0, true); h.lineTo(zc + 0.65, 0.75); h.closePath();
        s.holes.push(h);
      });
      add('wall', new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false, curveSegments: 24 }), 4.3, 0, 0, -Math.PI / 2);
    }

    // Dado (low panelling), chair rail and skirting on the front and right walls
    function dado(len) {                                       // local: runs along x, faces +z
      add('wood', box(len, 0.72, 0.04), 0, 0.36, 0.02);
      add('woodDark', box(len, 0.05, 0.07), 0, 0.745, 0.035);
      add('woodDark', box(len, 0.14, 0.06), 0, 0.07, 0.03);
      const n = Math.round(len / 0.95), pw = len / n;
      for (let i = 0; i < n; i++) add('woodDark', frameGeo(pw - 0.3, 0.3, 0.035, 0.012, 0.008), -len / 2 + (i + 0.5) * pw, 0.44, 0.04);
    }
    function cornice(len) {                                    // plaster cornice with a gilt bead
      add('plaster', box(len, 0.2, 0.24), 0, 3.9, 0.12);
      add('plaster', box(len, 0.14, 0.13), 0, 3.74, 0.065);
      add('gilt', box(len, 0.022, 0.022), 0, 3.66, 0.03);
    }
    at(0, 0, 4.6, Math.PI, () => { dado(8); cornice(8); });
    at(4.0, 0, 1.25, -Math.PI / 2, () => { dado(6.7); cornice(6.7); });

    // Ceiling: beams, coffers with gilt rosettes, and a fresco over the chandelier
    [-1.35, 1.35].forEach((x) => { add('woodDark', box(0.26, 0.2, 6.7), x, 3.9, 1.25); add('gilt', box(0.05, 0.012, 6.7), x, 3.796, 1.25); });
    [0.05, 2.45].forEach((z) => { add('woodDark', box(8, 0.2, 0.26), 0, 3.9, z); add('gilt', box(8, 0.012, 0.05), 0, 3.796, z); });
    const cellX = [[-3.76, -1.48], [-1.22, 1.22], [1.48, 3.76]], cellZ = [[-1.42, -0.08], [0.18, 2.32], [2.58, 4.36]];
    cellX.forEach((cx, i) => cellZ.forEach((cz, j) => {
      if (i === 1 && j === 1) return;
      add('coffer', new THREE.PlaneGeometry(cx[1] - cx[0], cz[1] - cz[0]), (cx[0] + cx[1]) / 2, 3.996, (cz[0] + cz[1]) / 2, 0, Math.PI / 2);
    }));

    // ============================================================ decorative books (one instanced mesh)
    const atlas = K.spineAtlas();
    const CAP = 2600;
    const bookGeo = new THREE.BoxGeometry(1, 1, 1);
    {
      const uv = bookGeo.attributes.uv;                        // faces: +x -x +y -y +z -z, 4 verts each
      for (let i = 0; i < 24; i++) {
        const f = Math.floor(i / 4), u = uv.getX(i), v = uv.getY(i);
        if (f === 4) uv.setXY(i, 0.012 + u * 0.85, v);                        // spine
        else if (f === 2 || f === 3) uv.setXY(i, 0.9 + u * 0.08, 0.56 + v * 0.38); // page edges
        else uv.setXY(i, 0.9 + u * 0.08, 0.06 + v * 0.38);                    // boards
      }
    }
    const cellAttr = new THREE.InstancedBufferAttribute(new Float32Array(CAP), 1);
    bookGeo.setAttribute('aCell', cellAttr);
    const bookMat = new THREE.MeshStandardMaterial({ map: atlas.color, roughness: 0.6, metalness: 0, envMapIntensity: 0.45 });
    bookMat.onBeforeCompile = (sh) => {
      sh.vertexShader = 'attribute float aCell;\n' + sh.vertexShader.replace('#include <uv_vertex>',
        '#include <uv_vertex>\n  vUv.x = (vUv.x + aCell) / ' + atlas.cells.toFixed(1) + ';');
    };
    const books = new THREE.InstancedMesh(bookGeo, bookMat, CAP);
    books.frustumCulled = false; books.receiveShadow = true; books.name = 'decorative-books';
    let bookCount = 0;
    const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
    function putBook(x, y, z, th, h, d, rz = 0, ry = 0) {
      if (bookCount >= CAP) return;
      _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry, rz)), _s.set(th, h, d));
      books.setMatrixAt(bookCount, _m.premultiply(B.matrix()));
      cellAttr.setX(bookCount, Math.floor(rnd() * atlas.cells));
      bookCount++;
    }
    // A shelf run along local x in the current frame; spines face local +z
    function bookRow(x0, x1, y, zFront, maxH) {
      let x = x0 + rnd() * 0.01;
      while (x < x1 - 0.02) {
        const roll = rnd();
        if (roll < 0.035 && x1 - x > 0.4) {                    // a short flat stack
          const n = 2 + Math.floor(rnd() * 3), len = 0.2 + rnd() * 0.07;
          let yy = y;
          for (let k = 0; k < n; k++) { const t = 0.028 + rnd() * 0.03; putBook(x + len / 2 + 0.01, yy + t / 2, zFront - 0.1, t, len - k * 0.012, 0.17, Math.PI / 2); yy += t; }
          x += len + 0.03; continue;
        }
        if (roll < 0.06) { x += 0.04 + rnd() * 0.1; continue; } // a gap
        const th = 0.024 + rnd() * 0.036, h = maxH * (0.66 + rnd() * 0.33), d = 0.16 + rnd() * 0.05;
        if (x + th > x1) break;
        const lean = roll > 0.975 ? 0.16 : 0;
        putBook(x + th / 2 + lean * h * 0.45, y + h / 2 * Math.cos(lean), zFront - d / 2 - rnd() * 0.018, th, h, d, -lean);
        x += th + 0.0015 + lean * h * 0.9;
      }
    }

    // ============================================================ joinery
    const TOP = 3.45;                                          // top of the bookcases, below the entablature
    function entablature(len, proj) {                          // local: along x, back at z = 0
      add('wood', box(len, 0.1, proj), 0, TOP + 0.05, proj / 2);
      add('woodDark', box(len, 0.2, proj - 0.03), 0, TOP + 0.2, (proj - 0.03) / 2);
      add('gilt', box(len, 0.016, 0.016), 0, TOP + 0.108, proj);
      add('wood', box(len + 0.06, 0.06, proj + 0.05), 0, TOP + 0.33, (proj + 0.05) / 2);
      add('wood', box(len + 0.14, 0.09, proj + 0.1), 0, TOP + 0.405, (proj + 0.1) / 2);
      add('woodDark', box(len, 0.11, proj - 0.02), 0, TOP + 0.5, (proj - 0.02) / 2);
    }
    function cabinetDoors(w, front, y0, h) {                   // raised-panel doors with brass knobs
      const n = Math.max(1, Math.round(w / 0.62)), pw = w / n;
      for (let i = 0; i < n; i++) {
        const cx = -w / 2 + (i + 0.5) * pw;
        add('woodDark', frameGeo(pw - 0.2, h - 0.2, 0.04, 0.014, 0.01), cx, y0 + h / 2, front);
        add('brass', sph(0.016, 10, 8), cx + (i % 2 ? -1 : 1) * (pw / 2 - 0.05), y0 + h / 2 + 0.05, front + 0.03);
      }
    }
    // A bay of shelves filled with books. Local frame: along x, wall at z = 0, opens to +z.
    function bookBay(w, d) {
      add('wood', box(0.05, TOP, d), -w / 2 + 0.025, TOP / 2, d / 2);
      add('wood', box(0.05, TOP, d), w / 2 - 0.025, TOP / 2, d / 2);
      add('woodDark', box(w, 0.08, d + 0.07), 0, 0.04, (d + 0.07) / 2);
      add('wood', box(w - 0.1, 0.46, d + 0.03), 0, 0.31, (d + 0.03) / 2);
      cabinetDoors(w - 0.1, d + 0.03, 0.08, 0.46);
      add('wood', box(w, 0.04, d + 0.08), 0, 0.56, (d + 0.08) / 2);
      for (let k = 0; k < 7; k++) {
        const y = 0.58 + k * 0.41;
        if (k > 0) add('wood', box(w - 0.1, 0.03, d - 0.03), 0, y - 0.015, (d - 0.03) / 2);
        bookRow(-w / 2 + 0.06, w / 2 - 0.06, y, d - 0.035, 0.35);
      }
      add('wood', box(w, 0.07, 0.05), 0, TOP - 0.035, d - 0.025);
      entablature(w, d + 0.06);
    }

    // ---- back wall: central interactive bay, marble columns, two side bays
    at(0, 0, ROOM.zMin, 0, () => {
      const front = SH.z + SH.depth / 2 - ROOM.zMin;           // local z of the shelf front (0.575)
      const W = SH.width;
      add('wood', box(0.05, TOP, front), -W / 2 - 0.025, TOP / 2, front / 2);
      add('wood', box(0.05, TOP, front), W / 2 + 0.025, TOP / 2, front / 2);
      add('woodDark', box(W + 0.1, 0.08, front + 0.09), 0, 0.04, (front + 0.09) / 2);
      add('wood', box(W, 0.44, front + 0.05), 0, 0.3, (front + 0.05) / 2);
      cabinetDoors(W, front + 0.05, 0.08, 0.44);
      const tiers = SH.tiers.slice().sort((a, b) => a - b);   // 0.6, 1.4, 2.2
      add('wood', box(W + 0.1, 0.08, front + 0.1), 0, tiers[0] - 0.04, (front + 0.1) / 2);
      tiers.slice(1).concat([3.0]).forEach((y) => add('wood', box(W, 0.05, front - 0.02), 0, y - 0.025, (front - 0.02) / 2));
      [-0.735, 0, 0.735].forEach((x) => add('wood', box(0.03, TOP - tiers[0], front - 0.06), x, (TOP + tiers[0]) / 2, (front - 0.06) / 2));
      add('wood', box(W, 0.07, 0.05), 0, TOP - 0.035, front - 0.025);
      // filler books around the hero books
      const cells = [[-W / 2 + 0.02, -0.755], [-0.715, -0.02], [0.02, 0.715], [0.755, W / 2 - 0.02]];
      tiers.forEach((y) => cells.forEach(([a, b]) => {
        const hx = SH.heroX.find((h) => h > a && h < b);
        if (hx === undefined) { bookRow(a, b, y, front - 0.03, 0.42); return; }
        bookRow(a, hx - 0.2, y, front - 0.03, 0.42);
        bookRow(hx + 0.2, b, y, front - 0.03, 0.42);
      }));
      cells.forEach(([a, b]) => bookRow(a, b, 3.0, front - 0.05, 0.36));
      entablature(W + 0.7, front + 0.1);
      // gilt lettering on the frieze
      const letters = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 0.23),
        new THREE.MeshStandardMaterial({ map: K.friezeTexture('BIBLIOTHECA ALEXANDRINA'), transparent: true, alphaTest: 0.25, metalness: 1, roughness: 0.3, envMapIntensity: 1.3 }));
      placed(letters, 0, TOP + 0.2, front + 0.074);
      // polished marble columns on pedestals, gilt capitals
      [-1, 1].forEach((sgn) => at(sgn * (W / 2 + 0.2), 0, front + 0.13, 0, () => {
        add('wood', box(0.36, 0.58, 0.36), 0, 0.29, 0);
        add('woodDark', box(0.4, 0.07, 0.4), 0, 0.035, 0);
        add('woodDark', box(0.4, 0.05, 0.4), 0, 0.585, 0);
        add('marbleRed', lathe([[0.001, 0], [0.135, 0], [0.135, 0.03], [0.115, 0.05], [0.128, 0.085], [0.106, 0.115], [0.1, 0.15], [0.09, 2.5], [0.098, 2.52], [0.086, 2.56], [0.001, 2.56]], 28), 0, 0.61, 0);
        add('gilt', lathe([[0.001, 0], [0.088, 0], [0.104, 0.04], [0.092, 0.08], [0.128, 0.17], [0.165, 0.215], [0.165, 0.25], [0.001, 0.25]], 28), 0, 3.17, 0);
        add('gilt', box(0.37, 0.03, 0.37), 0, 3.435, 0);
        // entablature block above the column
        add('wood', box(0.42, 0.1, 0.4), 0, TOP + 0.05, 0);
        add('woodDark', box(0.39, 0.2, 0.37), 0, TOP + 0.2, 0);
        add('wood', box(0.5, 0.06, 0.48), 0, TOP + 0.33, 0);
        add('wood', box(0.58, 0.09, 0.56), 0, TOP + 0.405, 0);
        add('woodDark', box(0.4, 0.11, 0.38), 0, TOP + 0.5, 0);
        add('ao', new THREE.PlaneGeometry(0.75, 0.75), 0, 0.011, 0, 0, -Math.PI / 2);
      }));
    });
    at(-3.25, 0, ROOM.zMin, 0, () => bookBay(1.5, 0.38));
    at(3.25, 0, ROOM.zMin, 0, () => bookBay(1.5, 0.38));

    // library ladder against the right-hand bay, on a brass rail
    add('brass', cyl(0.014, 0.014, 1.46, 10), 3.25, 3.12, -1.66, 0, 0, Math.PI / 2);
    at(3.3, 0, -0.98, 0, () => {
      const a = 0.215;
      [-0.2, 0.2].forEach((x) => add('wood', box(0.045, 3.22, 0.07), x, 1.57, -0.335, 0, -a));
      for (let i = 1; i <= 9; i++) add('woodDark', cyl(0.016, 0.016, 0.4, 8), 0, i * 0.32 * Math.cos(a), -i * 0.32 * Math.sin(a), 0, 0, Math.PI / 2);
      add('ao', new THREE.PlaneGeometry(0.8, 0.5), 0, 0.011, 0, 0, -Math.PI / 2);
    });

    // ---- left wall: bookcase bays either side of the chimney breast
    at(-4, 0, -0.975, Math.PI / 2, () => bookBay(1.41, 0.38));
    at(-4, 0, 3.41, Math.PI / 2, () => bookBay(2.28, 0.38));

    // ============================================================ paintings
    const picLoader = lib.loader;
    function painting(file, w, h, light) {                     // local: hangs on the wall at z = 0
      const tex = picLoader.load('images/paintings/' + file + '.jpg');
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = lib.aniso;
      const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 0.14, roughness: 0.55, envMapIntensity: 0.35 });
      placed(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat), 0, 0, 0.022);
      add('gilt', frameGeo(w, h, 0.085, 0.03, 0.024), 0, 0, 0.005);
      add('woodDark', frameGeo(w + 0.19, h + 0.19, 0.02, 0.012, 0.008), 0, 0, 0.004);
      if (light) {
        add('brass', cyl(0.02, 0.02, w * 0.55, 12), 0, h / 2 + 0.2, 0.19, 0, 0, Math.PI / 2);
        add('brass', box(0.014, 0.014, 0.19), 0, h / 2 + 0.2, 0.095);
        add('brass', box(0.1, 0.05, 0.012), 0, h / 2 + 0.2, 0.006);
      }
    }
    // gallery on the front wall (viewer faces it when turning round)
    at(-1.25, 2.3, 4.6, Math.PI, () => painting('vienna-prunksaal', 1.9, 1.226, true));
    at(-2.95, 2.82, 4.6, Math.PI, () => painting('abbey-library-hall', 1.0, 0.75));
    at(-2.95, 1.83, 4.6, Math.PI, () => painting('melk-abbey-library', 1.0, 0.72));
    at(0.45, 2.82, 4.6, Math.PI, () => painting('george-peabody-library', 1.0, 0.75));
    at(0.45, 1.83, 4.6, Math.PI, () => painting('strahov-theological-hall', 1.0, 0.667));
    at(2.0, 3.19, 4.6, Math.PI, () => painting('boullee-bibliotheque-du-roi', 1.12, 0.71));
    at(4.0, 2.3, 1.15, -Math.PI / 2, () => painting('sainte-genevieve', 0.95, 0.633, true));
    at(3.42, 2.3, 4.6, Math.PI, () => painting('harewood-old-library', 0.66, 0.44));
    // ceiling fresco
    {
      const tex = picLoader.load('images/paintings/vienna-dome-fresco.jpg');
      tex.encoding = THREE.sRGBEncoding; tex.anisotropy = lib.aniso;
      const fres = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.725),
        new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 0.22, roughness: 0.9, envMapIntensity: 0.2 }));
      fres.rotation.x = Math.PI / 2; fres.position.set(0, 3.99, 1.25); group.add(fres);
      add('gilt', frameGeo(2.3, 1.725, 0.07, 0.025, 0.02), 0, 3.992, 1.25, 0, Math.PI / 2);
    }

    // ============================================================ chimney breast and fireplace
    const candles = [];                                        // world positions of candle flames
    at(-4, 0, 1.0, Math.PI / 2, () => {
      const D = 0.32;
      add('wood', box(0.75, TOP, D), -0.875, TOP / 2, D / 2);
      add('wood', box(0.75, TOP, D), 0.875, TOP / 2, D / 2);
      add('wood', box(1.0, TOP - 0.85, D), 0, (TOP + 0.85) / 2, D / 2);
      entablature(2.5, D + 0.06);
      add('soot', box(1.0, 0.85, 0.02), 0, 0.425, 0.03);
      add('soot', box(0.02, 0.85, D), -0.49, 0.425, D / 2);
      add('soot', box(0.02, 0.85, D), 0.49, 0.425, D / 2);
      add('soot', box(1.0, 0.02, D), 0, 0.01, D / 2);
      // limestone surround, mantel and hearth
      [-0.66, 0.66].forEach((x) => { add('stone', box(0.3, 0.85, 0.2), x, 0.425, D + 0.1); add('stone', box(0.34, 0.1, 0.24), x, 0.05, D + 0.12); });
      add('stone', box(1.62, 0.3, 0.2), 0, 1.0, D + 0.1);
      add('stone', box(1.74, 0.06, 0.27), 0, 1.18, D + 0.135);
      add('stone', box(1.92, 0.07, 0.38), 0, 1.245, D + 0.19);
      add('stone', box(2.1, 0.04, 0.8), 0, 0.02, D + 0.3);
      add('gilt', sph(0.07, 16, 10), 0, 1.0, D + 0.185);
      // fender, andirons, logs, embers
      add('brass', box(1.5, 0.05, 0.02), 0, 0.085, D + 0.62);
      [-0.75, 0.75].forEach((x) => add('brass', box(0.02, 0.05, 0.36), x, 0.085, D + 0.44));
      [-0.3, 0.3].forEach((x) => { add('iron', box(0.03, 0.2, 0.3), x, 0.12, 0.2); add('brass', sph(0.035, 10, 8), x, 0.27, 0.34); });
      add('ember', box(0.62, 0.035, 0.2), 0, 0.04, 0.19);
      add('woodDark', cyl(0.05, 0.055, 0.62, 10), 0, 0.11, 0.14, 0, 0, Math.PI / 2);
      add('woodDark', cyl(0.045, 0.05, 0.6, 10), 0.02, 0.11, 0.25, 0.12, 0, Math.PI / 2);
      add('woodDark', cyl(0.045, 0.045, 0.52, 10), -0.03, 0.2, 0.19, -0.25, 0, Math.PI / 2);
      // overmantel painting with panel moulding
      at(0, 2.42, D, 0, () => painting('library-of-congress-reading-room', 0.92, 1.412, true));
      add('woodDark', frameGeo(1.5, 1.95, 0.03, 0.012, 0.008), 0, 2.45, D);
      // mantel clock and candlesticks
      add('woodDark', box(0.24, 0.3, 0.12), 0, 1.43, D + 0.17);
      add('woodDark', box(0.3, 0.03, 0.15), 0, 1.295, D + 0.17);
      add('gilt', cyl(0.085, 0.085, 0.012, 24), 0, 1.46, D + 0.232, 0, Math.PI / 2);
      add('paper', cyl(0.07, 0.07, 0.014, 24), 0, 1.46, D + 0.235, 0, Math.PI / 2);
      add('gilt', sph(0.03, 10, 8), 0, 1.6, D + 0.17);
      [-0.62, 0.62].forEach((x) => {
        add('brass', lathe([[0.001, 0], [0.055, 0], [0.05, 0.012], [0.016, 0.03], [0.012, 0.12], [0.03, 0.14], [0.012, 0.16], [0.012, 0.2], [0.032, 0.215], [0.001, 0.215]], 14), x, 1.28, D + 0.19);
        add('wax', cyl(0.013, 0.013, 0.15, 8), x, 1.57, D + 0.19);
        candles.push(wpos(x, 1.675, D + 0.19));
      });
      add('ao', new THREE.PlaneGeometry(2.5, 1.2), 0, 0.045, D + 0.3, 0, -Math.PI / 2);
    });

    // animated fire (two crossed quads, procedural shader)
    const flameMats = [0, 1].map((i) => new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSeed: { value: i * 7.31 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        uniform float uTime; uniform float uSeed; varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y); }
        float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a*noise(p); p *= 2.03; a *= 0.5; } return s; }
        void main(){
          float x = (vUv.x - 0.5) * 2.0;
          float n = fbm(vec2(vUv.x*3.0 + uSeed, vUv.y*2.2 - uTime*1.7));
          float n2 = fbm(vec2(vUv.x*7.0 - uSeed, vUv.y*4.5 - uTime*2.9));
          float f = 1.0 - smoothstep(0.0, 1.0, abs(x)*(1.25 + vUv.y*1.7) + vUv.y*0.8 - n*0.6 - n2*0.22);
          f *= smoothstep(0.0, 0.07, vUv.y);
          vec3 col = mix(vec3(1.0, 0.22, 0.02), vec3(1.0, 0.72, 0.18), f);
          col = mix(col, vec3(1.0, 0.96, 0.78), smoothstep(0.62, 1.0, f));
          gl_FragColor = vec4(col * f * 1.5, f);
        }`
    }));
    flameMats.forEach((mat, i) => {
      const q = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.7), mat);
      q.position.set(-3.8, 0.4, 1.0); q.rotation.y = Math.PI / 2 + (i ? 0.7 : -0.5);
      q.renderOrder = 3; group.add(q);
    });
    const sprite = (x, y, z, size, hex, opacity) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: lin(hex), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity, fog: false }));
      s.position.set(x, y, z); s.scale.set(size, size, 1); s.renderOrder = 4; group.add(s); return s;
    };
    const fireGlow = sprite(-3.6, 0.38, 1.0, 2.2, 0xff7a2a, 0.5);

    // ============================================================ windows: frames, curtains, view, sun shafts
    const viewTex = K.windowView();
    const sunDir = new THREE.Vector3().subVectors(sun.target.position, sun.position).normalize();
    const shaftPos = [], shaftCol = [];
    WIN.forEach((zc) => {
      at(3.99, 0.75, zc, -Math.PI / 2, () => {                 // casing with an arched head
        const s = new THREE.Shape();
        s.moveTo(-0.76, 0); s.lineTo(-0.76, 1.95); s.absarc(0, 1.95, 0.76, Math.PI, 0, true); s.lineTo(0.76, 0);
        s.lineTo(0.65, 0); s.lineTo(0.65, 1.95); s.absarc(0, 1.95, 0.65, 0, Math.PI, false); s.lineTo(-0.65, 0); s.closePath();
        add('wood', new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 24 }), 0, 0, 0);
      });
      add('wood', box(0.36, 0.05, 1.62), 3.9, 0.735, zc);                       // sill
      add('woodDark', box(0.04, 2.6, 0.04), 4.14, 2.05, zc);                    // glazing bars
      [1.4, 2.05, 2.7].forEach((y) => add('woodDark', box(0.04, 0.04, 1.3), 4.14, y, zc));
      [-1, 1].forEach((k) => add('woodDark', box(0.035, 0.62, 0.035), 4.14, 2.92, zc + k * 0.22, 0, k * Math.PI / 4));
      const view = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.2), new THREE.MeshBasicMaterial({ map: viewTex, color: new THREE.Color(1.7, 1.6, 1.45), fog: false }));
      view.rotation.y = -Math.PI / 2; view.position.set(5.2, 2.1, zc); group.add(view);
      // velvet curtains, gathered at tie-backs
      [-1, 1].forEach((k) => {
        const g = new THREE.PlaneGeometry(0.5, 3.45, 22, 14), p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i) + 1.775;          // y in metres above the floor
          const gather = 1 - 0.5 * Math.exp(-Math.pow((y - 1.25) / 0.4, 2));
          const edge = k * 0.25;
          p.setX(i, edge + (x - edge) * gather * 0.66);
          p.setZ(i, 0.045 * Math.sin(x * 44 + k) * (0.6 + 0.4 * gather) + 0.02 * Math.sin(y * 3 + x * 9));
        }
        g.computeVertexNormals();
        add('velvet', g, 3.87, 1.775, zc + k * 0.88, -Math.PI / 2);
        add('brass', sph(0.03, 10, 8), 3.9, 1.27, zc + k * 1.08);
      });
      add('velvet', rbox(2.2, 0.26, 0.16, 0.03), 3.9, 3.5, zc, -Math.PI / 2);   // pelmet
      add('gilt', box(0.02, 0.02, 2.24), 3.81, 3.375, zc);
      // sun shaft: from the window opening down to its footprint on the floor
      const c = [[0.8, zc - 0.6], [0.8, zc + 0.6], [3.25, zc + 0.6], [3.25, zc - 0.6]].map(([y, z]) => new THREE.Vector3(4.0, y, z));
      const f = c.map((v) => v.clone().addScaledVector(sunDir, v.y / -sunDir.y));
      for (let i = 0; i < 4; i++) {
        const a = c[i], b = c[(i + 1) % 4], b2 = f[(i + 1) % 4], a2 = f[i];
        [a, b, b2, a, b2, a2].forEach((v) => {
          shaftPos.push(v.x, v.y, v.z);
          const near = (v === a || v === b) ? 1 : 0.0;
          shaftCol.push(0.02 * near, 0.015 * near, 0.008 * near);
        });
      }
    });
    {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(shaftPos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(shaftCol, 3));
      const shafts = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false }));
      shafts.renderOrder = 2; group.add(shafts);
    }
    // dust motes drifting in the light
    const DUST = vr ? 140 : 320;
    const dustGeo = new THREE.BufferGeometry(), dustP = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const zc = WIN[i % 2], y = 0.8 + rnd() * 2.45, s = rnd() * (y / -sunDir.y);
      dustP[i * 3] = 4.0 + sunDir.x * s + (rnd() - 0.5) * 0.3;
      dustP[i * 3 + 1] = y + sunDir.y * s;
      dustP[i * 3 + 2] = zc + (rnd() - 0.5) * 1.2 + sunDir.z * s;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustP, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowTex, color: lin(0xffe2b0), size: 0.028, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    dust.renderOrder = 2; group.add(dust);

    // ============================================================ door (front wall)
    at(2.0, 0, 4.6, Math.PI, () => {
      add('wood', frameGeo(1.5, 2.3, 0.13, 0.04, 0.015), 0, 1.15, 0.02);
      [-0.375, 0.375].forEach((x) => {
        add('woodDark', box(0.745, 2.29, 0.05), x, 1.145, 0.05);
        [[0.62, 0.84], [1.66, 0.94]].forEach(([y, h]) => add('wood', frameGeo(0.42, h - 0.16, 0.04, 0.014, 0.01), x, y, 0.075));
        add('brass', sph(0.032, 12, 10), x - Math.sign(x) * 0.31, 1.06, 0.12);
      });
      add('wood', box(1.96, 0.1, 0.16), 0, 2.5, 0.08);
      const tri = new THREE.Shape(); tri.moveTo(-0.98, 0); tri.lineTo(0.98, 0); tri.lineTo(0, 0.26); tri.closePath();
      add('wood', new THREE.ExtrudeGeometry(tri, { depth: 0.09, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 }), 0, 2.55, 0.02);
    });

    // ============================================================ furniture
    function buttons(cols, rows, w, h, y0, z, rx, mat = 'leather') {            // tufting buttons on a leather back
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        add(mat, sph(0.017, 8, 6), -w / 2 + (i + 0.5) * (w / cols), y0 + (j + 0.5) * (h / rows), z + (y0 + (j + 0.5) * (h / rows) - y0) * Math.tan(rx));
      }
    }
    function wingChair() {                                     // local +z is the front
      [[-0.27, 0.25], [0.27, 0.25], [-0.27, -0.27], [0.27, -0.27]].forEach(([x, z]) => add('woodDark', cyl(0.032, 0.02, 0.16, 10), x, 0.08, z));
      add('leatherGreen', rbox(0.74, 0.24, 0.7, 0.05), 0, 0.28, 0);
      add('leatherGreen', rbox(0.54, 0.15, 0.56, 0.06), 0, 0.47, 0.04);
      add('leatherGreen', rbox(0.62, 0.84, 0.17, 0.07), 0, 0.88, -0.3, 0, -0.14);
      buttons(3, 3, 0.44, 0.5, 0.62, -0.2, -0.14, 'leatherGreen');
      add('leatherGreen', cyl(0.085, 0.085, 0.6, 14), 0, 1.3, -0.36, 0, 0, Math.PI / 2);
      [-1, 1].forEach((k) => {
        add('leatherGreen', rbox(0.1, 0.52, 0.27, 0.045), k * 0.315, 1.0, -0.17, 0, -0.1);
        add('leatherGreen', rbox(0.15, 0.3, 0.6, 0.05), k * 0.335, 0.55, 0.0);
        add('leatherGreen', cyl(0.088, 0.088, 0.6, 14), k * 0.335, 0.7, 0.0, 0, Math.PI / 2);
        add('brass', cyl(0.03, 0.03, 0.008, 12), k * 0.335, 0.7, 0.303, 0, Math.PI / 2);
      });
      add('ao', new THREE.PlaneGeometry(1.15, 1.1), 0, 0.012, 0, 0, -Math.PI / 2);
    }
    at(-2.3, 0, 0.1, -0.935, wingChair);
    at(-2.3, 0, 1.9, -2.2, wingChair);

    // side table with a shaded lamp and a couple of books
    at(-2.1, 0, 1.0, 0, () => {
      add('wood', cyl(0.31, 0.31, 0.03, 28), 0, 0.585, 0);
      add('woodDark', lathe([[0.001, 0], [0.17, 0], [0.16, 0.02], [0.04, 0.06], [0.03, 0.3], [0.05, 0.36], [0.03, 0.42], [0.035, 0.56], [0.001, 0.56]], 16), 0, 0.01, 0);
      add('brass', lathe([[0.001, 0], [0.07, 0], [0.065, 0.015], [0.02, 0.04], [0.016, 0.16], [0.03, 0.19], [0.012, 0.22], [0.012, 0.4], [0.001, 0.4]], 14), 0.06, 0.6, -0.04);
      add('shade', new THREE.CylinderGeometry(0.09, 0.17, 0.2, 24, 1, true), 0.06, 1.06, -0.04);
      putBook(-0.12, 0.618, 0.08, 0.035, 0.24, 0.17, Math.PI / 2, 0.5);
      putBook(-0.115, 0.65, 0.085, 0.028, 0.22, 0.16, Math.PI / 2, 0.38);
      add('ao', new THREE.PlaneGeometry(0.9, 0.9), 0, 0.012, 0, 0, -Math.PI / 2);
    });
    const lampGlow = sprite(-2.04, 1.07, 0.96, 0.75, 0xffc47a, 0.55);

    // Chesterfield sofa under the gallery
    at(-1.25, 0, 4.07, Math.PI, () => {
      const w = 2.2;
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([a, b]) => add('woodDark', cyl(0.035, 0.024, 0.12, 10), a * (w / 2 - 0.1), 0.06, b * 0.33));
      add('leather', rbox(w, 0.3, 0.86, 0.05), 0, 0.27, 0);
      for (let i = -1; i <= 1; i++) add('leather', rbox(0.6, 0.14, 0.6, 0.055), i * 0.61, 0.47, 0.07);
      add('leather', rbox(w, 0.5, 0.2, 0.08), 0, 0.72, -0.33, 0, -0.1);
      add('leather', cyl(0.1, 0.1, w - 0.1, 14), 0, 0.96, -0.36, 0, 0, Math.PI / 2);
      buttons(8, 2, w - 0.5, 0.36, 0.56, -0.215, -0.1);
      [-1, 1].forEach((k) => {
        add('leather', rbox(0.2, 0.4, 0.86, 0.05), k * (w / 2 - 0.1), 0.52, 0);
        add('leather', cyl(0.115, 0.115, 0.86, 14), k * (w / 2 - 0.1), 0.74, 0, 0, Math.PI / 2);
      });
      add('ao', new THREE.PlaneGeometry(2.7, 1.3), 0, 0.012, 0, 0, -Math.PI / 2);
    });

    // partner desk between the windows, with a banker's lamp and an open book
    let bankerLamp = null;
    at(3.3, 0, 1.15, -Math.PI / 2, () => {
      bankerLamp = wpos(-0.5, 1.08, -0.1);
      add('wood', rbox(1.7, 0.05, 0.8, 0.012), 0, 0.765, 0);
      add('leatherGreen', box(1.3, 0.006, 0.52), 0, 0.793, 0);
      [-0.6, 0.6].forEach((x) => {
        add('wood', box(0.46, 0.72, 0.7), x, 0.38, 0);
        add('woodDark', box(0.5, 0.05, 0.74), x, 0.025, 0);
        for (let k = 0; k < 3; k++) {
          add('woodDark', frameGeo(0.3, 0.12, 0.035, 0.012, 0.008), x, 0.17 + k * 0.215, 0.35);
          add('brass', sph(0.014, 8, 6), x, 0.17 + k * 0.215, 0.375);
        }
      });
      add('woodDark', box(0.76, 0.5, 0.02), 0, 0.49, -0.3);
      // banker's lamp
      add('brass', box(0.18, 0.02, 0.11), -0.5, 0.8, -0.14);
      add('brass', cyl(0.009, 0.009, 0.3, 8), -0.5, 0.95, -0.17);
      add('glassGreen', cyl(0.05, 0.05, 0.27, 16), -0.5, 1.1, -0.13, 0, 0, Math.PI / 2);
      // open book, ink stand, closed books
      add('leather', box(0.37, 0.008, 0.26), 0.12, 0.8, 0.06, 0.15);
      [-1, 1].forEach((k) => add('paper', box(0.175, 0.016, 0.24), 0.12 + k * 0.088 * Math.cos(0.15), 0.812, 0.06 - k * 0.088 * Math.sin(0.15), 0.15, 0, -k * 0.07));
      add('brass', cyl(0.03, 0.035, 0.05, 12), 0.5, 0.82, -0.2);
      putBook(0.55, 0.812, 0.18, 0.035, 0.25, 0.18, Math.PI / 2, -0.3);
      putBook(0.55, 0.845, 0.18, 0.03, 0.23, 0.17, Math.PI / 2, -0.12);
      add('ao', new THREE.PlaneGeometry(2.1, 1.2), 0, 0.012, 0, 0, -Math.PI / 2);
    });
    sprite(bankerLamp.x, bankerLamp.y, bankerLamp.z, 0.5, 0x7dffb8, 0.3);

    // floor globe, catching the light from the second window
    at(3.1, 0, 2.98, 0, () => {
      for (let k = 0; k < 3; k++) {
        const a = k * Math.PI * 2 / 3;
        add('woodDark', cyl(0.018, 0.028, 0.8, 8), Math.sin(a) * 0.2, 0.39, Math.cos(a) * 0.2, 0, Math.cos(a) * 0.2, -Math.sin(a) * 0.2);
      }
      add('wood', new THREE.TorusGeometry(0.31, 0.022, 8, 40), 0, 0.8, 0, 0, Math.PI / 2);
      add('brass', new THREE.TorusGeometry(0.268, 0.008, 8, 40), 0, 0.82, 0);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.25, 40, 28), new THREE.MeshStandardMaterial({ map: K.globeTexture(), roughness: 0.42, envMapIntensity: 0.7 }));
      globe.rotation.set(0.4, 0.8, 0); globe.castShadow = true; globe.receiveShadow = true;
      placed(globe, 0, 0.82, 0);
      add('ao', new THREE.PlaneGeometry(0.9, 0.9), 0, 0.012, 0, 0, -Math.PI / 2);
    });

    // glazed urn on a stone pedestal in the front-right corner
    at(3.42, 0, 4.05, 0, () => {
      add('stone', lathe([[0.001, 0], [0.21, 0], [0.21, 0.06], [0.16, 0.1], [0.145, 0.86], [0.19, 0.92], [0.19, 0.98], [0.001, 0.98]], 24), 0, 0, 0);
      add('marbleRed', lathe([[0.001, 0], [0.07, 0], [0.075, 0.02], [0.045, 0.05], [0.05, 0.08], [0.12, 0.16], [0.165, 0.28], [0.17, 0.36], [0.14, 0.46], [0.075, 0.53], [0.06, 0.58], [0.085, 0.63], [0.085, 0.645], [0.001, 0.645]], 28), 0, 0.98, 0);
      add('gilt', new THREE.TorusGeometry(0.168, 0.008, 8, 36), 0, 1.33, 0, 0, Math.PI / 2);
      add('gilt', new THREE.TorusGeometry(0.062, 0.007, 8, 28), 0, 1.56, 0, 0, Math.PI / 2);
      add('gilt', new THREE.TorusGeometry(0.086, 0.007, 8, 28), 0, 1.62, 0, 0, Math.PI / 2);
      add('ao', new THREE.PlaneGeometry(0.8, 0.8), 0, 0.012, 0, 0, -Math.PI / 2);
    });

    // Persian rug
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.16),
      new THREE.MeshStandardMaterial({ map: K.persianRug(), roughness: 1, envMapIntensity: 0.15, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(-0.85, 0.006, 1.25); rug.receiveShadow = true; group.add(rug);

    // brass chandelier under the fresco
    at(0, 0, 1.25, 0, () => {
      add('gilt', cyl(0.13, 0.17, 0.04, 24), 0, 3.97, 0);
      add('brass', cyl(0.008, 0.008, 0.62, 8), 0, 3.66, 0);
      add('brass', lathe([[0.001, 0], [0.03, 0.01], [0.075, 0.08], [0.03, 0.15], [0.055, 0.23], [0.02, 0.31], [0.016, 0.42], [0.001, 0.42]], 16), 0, 2.94, 0);
      add('brass', sph(0.03, 12, 10), 0, 2.93, 0);
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.03, 3.06, 0), new THREE.Vector3(0.22, 2.98, 0), new THREE.Vector3(0.44, 3.0, 0), new THREE.Vector3(0.54, 3.1, 0)]);
      for (let k = 0; k < 8; k++) at(0, 0, 0, k * Math.PI / 4, () => {
        add('brass', new THREE.TubeGeometry(curve, 14, 0.009, 6, false), 0, 0, 0);
        add('brass', cyl(0.04, 0.02, 0.03, 12), 0.54, 3.115, 0);
        add('wax', cyl(0.012, 0.012, 0.1, 8), 0.54, 3.18, 0);
        candles.push(wpos(0.54, 3.25, 0));
      });
    });
    // candle flames: one Points object
    const candleGeo = new THREE.BufferGeometry();
    candleGeo.setAttribute('position', new THREE.Float32BufferAttribute(candles.reduce((a, v) => a.concat([v.x, v.y, v.z]), []), 3));
    const candleMat = new THREE.PointsMaterial({ map: glowTex, color: lin(0xffc880), size: 0.2, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const candlePts = new THREE.Points(candleGeo, candleMat); candlePts.renderOrder = 4; group.add(candlePts);

    // ============================================================ finish
    books.count = bookCount;
    books.instanceMatrix.needsUpdate = true; cellAttr.needsUpdate = true;
    group.add(books);
    const batches = B.flush(group);

    // Image-based lighting: capture the finished room once textures have loaded
    const pmrem = new THREE.PMREMGenerator(renderer);
    let envRT = null;
    function refreshEnvironment() {
      if (renderer.xr.isPresenting) return;
      // The capture target is RGBE-encoded, so blended and custom-shader objects (fire, glows,
      // sun shafts, dust, contact shadows) would corrupt it. Hide them for the capture.
      const hidden = [];
      scene.traverse((o) => {
        const m = o.material && (Array.isArray(o.material) ? o.material[0] : o.material);
        if (o.visible && m && (m.transparent || m.isShaderMaterial || o.isPoints || o.isSprite || o.isLine)) { o.visible = false; hidden.push(o); }
      });
      const background = scene.background;       // fromScene() clears it and does not restore it
      scene.background = null; scene.environment = null;
      scene.position.set(0, -1.7, -1.25); scene.updateMatrixWorld(true);
      const rt = pmrem.fromScene(scene, 0.035, 0.1, 40);
      scene.position.set(0, 0, 0); scene.updateMatrixWorld(true);
      hidden.forEach((o) => { o.visible = true; });
      scene.background = background;
      scene.environment = rt.texture;
      if (envRT) envRT.dispose();
      envRT = rt;
    }

    function animate(t) {
      flameMats.forEach((m) => { m.uniforms.uTime.value = t; });
      const flick = 1.0 + 0.2 * Math.sin(t * 11) + 0.13 * Math.sin(t * 23 + 1.3) + 0.08 * Math.sin(t * 41);
      fireLight.intensity = 1.5 * flick;
      fireGlow.material.opacity = 0.42 + 0.1 * flick;
      candleMat.size = 0.2 + 0.018 * Math.sin(t * 13) + 0.012 * Math.sin(t * 29 + 2.0);
      lampGlow.material.opacity = 0.55 + 0.02 * Math.sin(t * 3.1);
      dust.position.set(0.05 * Math.sin(t * 0.11), 0.06 * Math.sin(t * 0.17), 0.05 * Math.cos(t * 0.13));
    }

    api = {
      ROOM, group, batches, materials: M, bookCount,
      lights: { ambientLight, sun, keySpotlight, readingSpotlight, deskLampLight, fireLight },
      LIGHT_BASE, LIGHT_READING, animate, refreshEnvironment,
      camera: { min: new THREE.Vector3(-3.25, 0.4, -1.3), max: new THREE.Vector3(3.6, ROOM.h - 0.4, 4.15) },
      teleport: {
        bounds: { xMin: -3.2, xMax: 3.5, zMin: -0.95, zMax: 4.1 },
        circles: [{ x: -2.3, z: 0.1, r: 0.62 }, { x: -2.3, z: 1.9, r: 0.62 }, { x: -2.1, z: 1.0, r: 0.42 }, { x: 3.1, z: 2.98, r: 0.5 }, { x: 3.42, z: 4.05, r: 0.45 }],
        rects: [{ x0: -4.0, x1: -2.95, z0: -0.3, z1: 2.3 }, { x0: 2.75, x1: 4.0, z0: 0.2, z1: 2.1 }, { x0: -2.5, x1: 0.0, z0: 3.5, z1: 4.6 }, { x0: 2.7, x1: 3.9, z0: -1.75, z1: -0.75 }]
      }
    };
    return api;
  }

  window.AlexandriaRoom = { build };
})();
