/* ============================================================
   Generatives Partikel-System — "Daten-Cluster"
   - Langsame Drift wie ein Datennetz
   - Verbindungslinien zwischen nahen Punkten (Konstellation)
   - Reagiert auf Mausbewegung (sanftes Anziehen / Parallax)
   - Performance: DPR-Cap, dichteabhängige Anzahl, Pause off-screen
   ============================================================ */
(function () {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ---- Konfiguration ----
  const ACCENT = "94, 234, 212"; // teal (rgb)
  const LINK_DIST = 130; // max. Distanz für Verbindungslinien
  const MOUSE_RADIUS = 180; // Einflussradius der Maus

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let rafId = null;

  const mouse = { x: -9999, y: -9999, active: false };

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap @2x
    // Fallback auf Viewport, falls Layout (Tailwind) noch nicht angewandt ist
    width = canvas.offsetWidth || window.innerWidth;
    height = canvas.offsetHeight || window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticles() {
    // Dichte an Fläche koppeln, aber deckeln (Performance)
    const target = Math.min(Math.floor((width * height) / 13000), 110);
    particles = Array.from({ length: target }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Drift
      p.x += p.vx;
      p.y += p.vy;

      // Wrap-around an den Rändern
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      // Maus-Interaktion: sanftes Anziehen
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.6;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Punkt zeichnen
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, 0.55)`;
      ctx.fill();

      // Verbindungslinien zu nahen Punkten
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // Highlight-Linie zur Maus (verstärkt den "Cluster"-Effekt)
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const alpha = (1 - dist / MOUSE_RADIUS) * 0.25;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (rafId == null && !prefersReduced) rafId = requestAnimationFrame(step);
  }
  function stop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ---- Events ----
  window.addEventListener(
    "mousemove",
    (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    },
    { passive: true }
  );
  window.addEventListener("mouseout", () => (mouse.active = false));

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      size();
      makeParticles();
    }, 150);
  });

  // Pause, wenn Tab nicht sichtbar (spart CPU/Akku)
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  // Nach vollständigem Laden (Tailwind/Fonts) Maße korrigieren
  window.addEventListener("load", () => {
    size();
    makeParticles();
  });

  // ---- Init ----
  size();
  makeParticles();
  if (prefersReduced) {
    // Statisches Einzelframe für Reduced-Motion-Nutzer
    step();
    stop();
  } else {
    start();
  }
})();
