/* Hero river: the Thu Bồn drawn on a <canvas> under the Old Town skyline.
   Layered sine-wave water, lantern reflections that warp with the waves, a lantern
   boat that bobs, rocks and leaves a wake, and hoa đăng drifting downstream.
   Also drives a gentle parallax on the skyline layers. Pauses when off screen. */
(function(){
  var canvas = document.querySelector('.hero-river');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var decor = canvas.closest('.hero-decor');
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.innerWidth < 640;
  var lights = [];
  try { lights = JSON.parse(canvas.getAttribute('data-lights') || '[]'); } catch(e){}

  var W = 0, H = 0, S = 1, dpr = 1;
  function resize(){
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = W / 1440;                       // skyline viewBox units -> pixels
  }

  function rand(a, b){ return a + Math.random() * (b - a); }
  var LANTERN = ['#E8A33D', '#D9603B', '#F6C46A', '#C8262C'];

  // ---------- hoa đăng ----------
  var flowers = [];
  function newFlower(anywhere){
    return {
      x: anywhere ? rand(0, W) : rand(-60, -20),
      lane: rand(0.38, 0.86),               // depth: higher = closer = bigger
      speed: rand(10, 22),
      phase: rand(0, 6.28),
      life: 0, max: rand(18, 34),
      color: LANTERN[(Math.random() * LANTERN.length) | 0]
    };
  }
  function initFlowers(){
    flowers = [];
    var n = small ? 5 : 10;
    for (var i = 0; i < n; i++){ var f = newFlower(true); f.life = rand(0, f.max * 0.7); flowers.push(f); }
  }

  // ---------- boat ----------
  var boat = { x: -120, base: 24, phase: 0, color: '#D9603B', wakeT: 0 };
  function newBoat(){ boat.x = -140 * Math.max(S, 0.6); boat.base = rand(16, 28); boat.phase = rand(0, 6.28); boat.color = LANTERN[(Math.random() * 4) | 0]; }

  var ripples = [];
  function ripple(x, y, max, a){ ripples.push({ x: x, y: y, r: 1, max: max, a: a }); }

  // ---------- drawing ----------
  function water(){
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2A5C78'); g.addColorStop(0.18, '#22476A'); g.addColorStop(0.6, '#1D2A4F'); g.addColorStop(1, '#1A1B33');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // soft bank shadow right under the houses
    var b = ctx.createLinearGradient(0, 0, 0, H * 0.22);
    b.addColorStop(0, 'rgba(10,10,28,.55)'); b.addColorStop(1, 'rgba(10,10,28,0)');
    ctx.fillStyle = b; ctx.fillRect(0, 0, W, H * 0.22);
  }

  function reflections(t){
    ctx.globalCompositeOperation = 'lighter';
    var rows = Math.max(8, Math.round(H / 6));
    for (var i = 0; i < lights.length; i++){
      var L = lights[i], x0 = L[0] * S, col = L[1], str = L[2];
      var flick = 0.82 + 0.12 * Math.sin(t * 2.1 + i * 1.7) + 0.06 * Math.sin(t * 5.3 + i);
      // warm haze right below the light
      var hg = ctx.createRadialGradient(x0, 2, 0, x0, 2, 26 * Math.max(S, 0.7));
      hg.addColorStop(0, hexA(col, 0.22 * str * flick)); hg.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = hg; ctx.fillRect(x0 - 30, 0, 60, 30);
      ctx.strokeStyle = col; ctx.lineCap = 'round';
      for (var r = 0; r < rows; r++){
        var p = r / rows, y = 4 + p * H * 0.92;
        var a = str * flick * Math.pow(1 - p, 1.5) * (0.55 + 0.45 * Math.sin(t * 2.4 + r * 1.3 + i));
        if (a < 0.03) continue;
        var w = (5 + p * 18 + Math.sin(t * 1.6 + r * 0.8 + i) * 4) * Math.max(S, 0.6);
        var off = Math.sin(y * 0.14 + t * 1.7 + i) * (1.5 + p * 7) + Math.sin(t * 0.6 + r * 0.45) * 1.5;
        ctx.globalAlpha = Math.min(a, 0.9);
        ctx.lineWidth = 1.2 + p * 1.6;
        ctx.beginPath(); ctx.moveTo(x0 + off - w / 2, y); ctx.lineTo(x0 + off + w / 2, y); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }

  function waves(t){
    var layers = [
      { y: 0.14, a: 1.4, k: 0.022, s: 0.9, k2: 0.051, s2: 1.3, alpha: 0.32, dash: [18, 26], speed: 22 },
      { y: 0.32, a: 2.2, k: 0.016, s: 0.6, k2: 0.043, s2: 0.9, alpha: 0.24, dash: [30, 40], speed: 15 },
      { y: 0.52, a: 3.0, k: 0.012, s: 0.45, k2: 0.031, s2: 0.7, alpha: 0.18, dash: [44, 56], speed: 10 },
      { y: 0.74, a: 3.6, k: 0.009, s: 0.32, k2: 0.024, s2: 0.5, alpha: 0.12, dash: [60, 70], speed: 7 }
    ];
    ctx.lineCap = 'round';
    for (var l = 0; l < layers.length; l++){
      var L = layers[l], base = L.y * H, step = small ? 10 : 6;
      ctx.beginPath();
      for (var x = -10; x <= W + 10; x += step){
        var y = base + L.a * Math.sin(x * L.k + t * L.s) + L.a * 0.5 * Math.sin(x * L.k2 - t * L.s2);
        x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.setLineDash(L.dash); ctx.lineDashOffset = -t * L.speed;
      ctx.strokeStyle = 'rgba(160,226,232,' + L.alpha + ')';
      ctx.lineWidth = 1 + l * 0.35;
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function drawRipples(dt){
    for (var i = ripples.length - 1; i >= 0; i--){
      var R = ripples[i];
      R.r += dt * 9; var k = 1 - R.r / R.max;
      if (k <= 0){ ripples.splice(i, 1); continue; }
      ctx.strokeStyle = 'rgba(190,235,240,' + (R.a * k).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(R.x, R.y, R.r, R.r * 0.28, 0, 0, 6.283); ctx.stroke();
    }
  }

  function drawFlower(f, t, dt){
    f.life += dt; f.x += f.speed * dt * Math.max(S, 0.6) * (0.6 + f.lane * 0.6);
    if (f.life > f.max || f.x > W + 40){ Object.assign(f, newFlower(false)); return; }
    var fade = Math.min(1, f.life / 3, (f.max - f.life) / 3);
    var k = (0.55 + f.lane * 0.75) * Math.max(S, 0.65) * Math.min(1, H / 80);   // smaller on a shallow river
    var x = f.x, y = f.lane * H + Math.sin(t * 1.3 + f.phase) * 1.4;
    var flick = 0.85 + 0.15 * Math.sin(t * 6 + f.phase);
    // glow and its reflection
    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(x, y - 4 * k, 0, x, y - 4 * k, 22 * k);
    g.addColorStop(0, hexA(f.color, 0.45 * fade * flick)); g.addColorStop(1, hexA(f.color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 4 * k, 22 * k, 0, 6.283); ctx.fill();
    ctx.fillStyle = hexA(f.color, 0.22 * fade);
    ctx.beginPath(); ctx.ellipse(x, y + 5 * k, 9 * k, 2.2 * k, 0, 0, 6.283); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // petals
    ctx.globalAlpha = fade;
    ctx.fillStyle = f.color;
    for (var p = -2; p <= 2; p++){
      ctx.beginPath();
      ctx.ellipse(x + p * 3.2 * k, y - 2 * k - (2 - Math.abs(p)) * 1.2 * k, 2.6 * k, 5 * k, p * 0.42, 0, 6.283);
      ctx.fill();
    }
    ctx.fillStyle = '#FFF4D6';
    ctx.beginPath(); ctx.arc(x, y - 7 * k, 1.6 * k, 0, 6.283); ctx.fill();
    ctx.globalAlpha = 1;
    if (Math.random() < dt * 0.25) ripple(x, y + 3 * k, 14 * k, 0.25 * fade);
  }

  function drawBoat(t, dt){
    var k = Math.min(Math.max(S, 0.62) * 1.05, H / 52);   // keep the canopy inside a shallow river
    boat.x += (boat.base + 7 * Math.sin(t * 0.17 + boat.phase) + 3 * Math.sin(t * 0.41)) * dt * k;
    if (boat.x > W + 160 * k) newBoat();
    var x = boat.x, y = H * 0.6 + Math.sin(t * 1.25 + boat.phase) * 1.6 * k;
    var rot = Math.sin(t * 0.95 + 0.6) * 0.045 + Math.sin(t * 1.9) * 0.015;

    // wake: two fading lines spreading out behind the stern, plus ripples
    ctx.lineCap = 'round';
    for (var s = 0; s < 2; s++){
      var dir = s ? 1 : -1;
      var grd = ctx.createLinearGradient(x - 40 * k, 0, x - 150 * k, 0);
      grd.addColorStop(0, 'rgba(200,240,245,.4)'); grd.addColorStop(1, 'rgba(200,240,245,0)');
      ctx.strokeStyle = grd; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x - 38 * k, y + 6 * k);
      for (var j = 1; j <= 8; j++){
        var px = x - 38 * k - j * 14 * k;
        ctx.lineTo(px, y + 6 * k + dir * j * 1.6 * k + Math.sin(t * 3 + j) * 0.8);
      }
      ctx.stroke();
    }
    boat.wakeT += dt;
    if (boat.wakeT > 0.35){ boat.wakeT = 0; ripple(x - 44 * k, y + 7 * k, 20 * k, 0.3); }

    // reflection of the boat, squashed and dim
    ctx.save(); ctx.translate(x, y + 9 * k); ctx.scale(1, -0.45); ctx.rotate(-rot); ctx.globalAlpha = 0.18;
    hull(k, '#0E0F24'); ctx.restore();

    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    hull(k, '#14152F');
    // canopy and posts
    ctx.strokeStyle = '#454A86'; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.moveTo(-18 * k, 0); ctx.lineTo(-18 * k, -16 * k); ctx.moveTo(18 * k, 0); ctx.lineTo(18 * k, -16 * k); ctx.stroke();
    ctx.fillStyle = '#2E3163'; ctx.strokeStyle = '#454A86'; ctx.lineWidth = 1.4 * k;
    ctx.beginPath(); ctx.moveTo(-26 * k, -15 * k); ctx.quadraticCurveTo(0, -30 * k, 26 * k, -15 * k); ctx.closePath(); ctx.fill(); ctx.stroke();
    // hanging lantern with a flickering glow
    var fl = 0.8 + 0.2 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(30 * k, -12 * k, 0, 30 * k, -12 * k, 30 * k);
    g.addColorStop(0, hexA(boat.color, 0.55 * fl)); g.addColorStop(1, hexA(boat.color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(30 * k, -12 * k, 30 * k, 0, 6.283); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#12132A'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30 * k, -24 * k); ctx.lineTo(30 * k, -18 * k); ctx.stroke();
    ctx.fillStyle = boat.color; ctx.beginPath(); ctx.ellipse(30 * k, -12 * k, 4.5 * k, 6 * k, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,170,.6)'; ctx.beginPath(); ctx.ellipse(30 * k, -11 * k, 2.4 * k, 3.6 * k, 0, 0, 6.283); ctx.fill();
    ctx.restore();
  }

  function hull(k, fill){
    ctx.fillStyle = fill; ctx.strokeStyle = '#454A86'; ctx.lineWidth = 1.4 * k;
    ctx.beginPath();
    ctx.moveTo(-44 * k, -2 * k);
    ctx.quadraticCurveTo(0, 14 * k, 44 * k, -4 * k);
    ctx.lineTo(36 * k, 8 * k); ctx.quadraticCurveTo(0, 14 * k, -38 * k, 8 * k); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  function hexA(hex, a){
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
  }

  // ---------- loop ----------
  var t = rand(0, 100), last = 0, running = false, visible = true, ambient = 0;
  function frame(now){
    if (!running) return;
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; t += dt;
    if (canvas.clientWidth !== W || canvas.clientHeight !== H) resize();
    ctx.clearRect(0, 0, W, H);
    water(); reflections(t); waves(t);
    ambient += dt;
    if (ambient > 0.7){ ambient = 0; ripple(rand(0, W), rand(0.2, 0.9) * H, rand(8, 16) * Math.max(S, 0.6), 0.18); }
    drawRipples(dt);
    var sorted = flowers.slice().sort(function(a, b){ return a.lane - b.lane; });
    var boatDrawn = false;
    for (var i = 0; i < sorted.length; i++){
      if (!boatDrawn && sorted[i].lane > 0.4){ drawBoat(t, dt); boatDrawn = true; }
      drawFlower(sorted[i], t, dt);
    }
    if (!boatDrawn) drawBoat(t, dt);
    requestAnimationFrame(frame);
  }
  function start(){ if (running || calm) return; running = true; last = 0; requestAnimationFrame(frame); }
  function stop(){ running = false; }

  resize(); initFlowers(); newBoat(); boat.x = W * 0.3;
  // paint one still frame right away, so the river is never blank (and stays still for reduced motion)
  function still(){ ctx.clearRect(0, 0, W, H); water(); reflections(t); waves(t); flowers.forEach(function(f){ drawFlower(f, t, 0); }); drawBoat(t, 0); }
  still();
  window.addEventListener('resize', function(){ small = window.innerWidth < 640; resize(); if (!running) still(); });
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; visible && !document.hidden ? start() : stop(); }).observe(canvas);
  } else start();
  document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : (visible && start()); });

  // ---------- parallax on the skyline layers ----------
  if (!decor || calm) return;
  var px = 0, tx = 0, sy = 0, pending = false;
  function apply(){
    pending = false;
    px += (tx - px) * 0.12;
    decor.style.setProperty('--px', px.toFixed(3));
    decor.style.setProperty('--sy', sy.toFixed(1));
    if (Math.abs(tx - px) > 0.002){ pending = true; requestAnimationFrame(apply); }
  }
  function kick(){ if (!pending){ pending = true; requestAnimationFrame(apply); } }
  window.addEventListener('scroll', function(){ sy = Math.min(window.scrollY, 1200); kick(); }, { passive: true });
  if (!small) window.addEventListener('pointermove', function(e){ tx = e.clientX / window.innerWidth - 0.5; kick(); }, { passive: true });
})();
