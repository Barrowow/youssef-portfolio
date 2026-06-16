/* ============================================================
   Youssef Fathi — Motion-Engine
   Preloader · Lenis Smooth Scroll · Custom Cursor · Magnetic
   Scroll-Reveals · Kinetic Marquee · Parallax · Navigation
   ============================================================ */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGSAP = typeof gsap !== "undefined";

  // Jahr im Footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (hasGSAP && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ============================================================
     1) LENIS — Smooth Scrolling (+ GSAP-Sync)
     ============================================================ */
  let lenis = null;
  if (typeof Lenis !== "undefined" && !reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // Anker-Links über Lenis scrollen
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.3 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ============================================================
     2) PRELOADER
     ============================================================ */
  function runPreloader(done) {
    const pre = document.getElementById("preloader");
    const num = document.getElementById("preloader-num");
    const fill = document.getElementById("preloader-fill");
    if (!pre) { done(); return; }

    if (reduced || !hasGSAP) {
      pre.style.display = "none";
      done();
      return;
    }

    document.documentElement.classList.add("is-loading");
    const counter = { v: 0 };
    const tl = gsap.timeline();
    tl.to(counter, {
      v: 100,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        const val = Math.round(counter.v);
        if (num) num.textContent = val;
        if (fill) fill.style.transform = "scaleX(" + counter.v / 100 + ")";
      },
    });
    tl.to(".preloader__inner, .preloader__count, .preloader__bar", {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: "power2.in",
    }, "+=0.15");
    tl.to(pre, {
      yPercent: -100,
      duration: 0.9,
      ease: "expo.inOut",
      onComplete: () => {
        pre.style.display = "none";
        document.documentElement.classList.remove("is-loading");
        done();
      },
    }, "-=0.1");
  }

  /* ============================================================
     3) HERO-Reveal (nach Preloader)
     ============================================================ */
  function revealHero() {
    if (reduced || !hasGSAP) {
      document.querySelectorAll(
        ".hero-eyebrow, .hero-sub, .hero-actions, .hero-scroll"
      ).forEach((el) => { el.style.opacity = "1"; el.style.transform = "none"; });
      document.querySelectorAll(".hero-headline .word").forEach((w) => (w.style.transform = "none"));
      return;
    }
    gsap.set(".hero-headline .word", { yPercent: 110 });
    gsap.set([".hero-eyebrow", ".hero-sub", ".hero-actions"], { y: 24, opacity: 0 });
    gsap.set(".hero-scroll", { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 })
      .to(".hero-headline .word", { yPercent: 0, duration: 1.1, stagger: 0.12 }, "-=0.4")
      .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to(".hero-actions", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
      .to(".hero-scroll", { opacity: 1, duration: 0.6 }, "-=0.3");
  }

  /* ============================================================
     4) SCROLL-REVEALS  [data-reveal]
     ============================================================ */
  function initReveals() {
    const items = gsap.utils.toArray("[data-reveal]");
    if (!items.length) return;
    if (reduced) { gsap.set(items, { opacity: 1, y: 0 }); return; }

    gsap.set(items, { opacity: 0, y: 42 });
    ScrollTrigger.batch(items, {
      start: "top 86%",
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.95, ease: "expo.out", stagger: 0.09, overwrite: true,
        }),
    });
  }

  /* ============================================================
     5) PARALLAX (Hero)
     ============================================================ */
  function initParallax() {
    if (reduced || !hasGSAP) return;
    // Hinweis: .hero-glow nutzt translate(-50%,-50%) zum Zentrieren —
    // daher hier KEIN Transform animieren (Konflikt). Nur den Inhalt parallaxen.
    gsap.to(".hero-inner", {
      yPercent: 16, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ============================================================
     6) KINETIC MARQUEE
     ============================================================ */
  function initMarquee() {
    const track = document.getElementById("marquee-track");
    if (!track || reduced) return;
    let x = 0, vel = 0;
    if (lenis) lenis.on("scroll", ({ velocity }) => (vel = velocity || 0));

    function loop() {
      const half = track.scrollWidth / 2 || 1;
      x -= 0.6 + Math.min(Math.abs(vel) * 0.6, 40);
      if (-x >= half) x += half;
      const skew = Math.max(-10, Math.min(10, -vel * 0.35));
      track.style.transform = "translateX(" + x + "px) skewX(" + skew + "deg)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ============================================================
     7) CUSTOM CURSOR + MAGNETIC
     ============================================================ */
  function initCursor() {
    if (!finePointer || reduced) return;
    const dot = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;
    document.documentElement.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
    }, { passive: true });

    function ring_loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(ring_loop);
    }
    requestAnimationFrame(ring_loop);

    document.querySelectorAll('a, button, [data-cursor="link"]').forEach((el) => {
      el.addEventListener("mouseenter", () => document.documentElement.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.documentElement.classList.remove("cursor-hover"));
    });
  }

  function initMagnetic() {
    if (!finePointer || reduced || !hasGSAP) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 0.4;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ============================================================
     8) NAVIGATION + Scroll-Fortschritt
     ============================================================ */
  function initNav() {
    const header = document.getElementById("site-header");
    const progress = document.getElementById("scroll-progress-fill");
    let lastY = 0;

    function onScroll(y) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? y / max : 0;
      if (progress) progress.style.transform = "scaleX(" + p + ")";
      if (header) {
        header.classList.toggle("scrolled", y > 60);
        header.classList.toggle("nav-hidden", y > lastY && y > 400);
      }
      lastY = y;
    }

    if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
    else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  }

  /* ============================================================
     Init
     ============================================================ */
  function init() {
    initCursor();
    initMagnetic();
    initMarquee();
    initNav();
    if (hasGSAP && typeof ScrollTrigger !== "undefined") {
      initReveals();
      initParallax();
    }
    // Layout nach dynamischen Inhalten (Projekte, Chart) neu berechnen
    window.addEventListener("load", () => {
      setTimeout(() => { if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh(); }, 400);
    });
  }

  // Start: Preloader → Hero-Reveal → Rest
  window.addEventListener("DOMContentLoaded", () => {
    init();
    runPreloader(revealHero);
  });
})();
