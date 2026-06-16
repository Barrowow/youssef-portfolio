/* ============================================================
   Haupt-Animationen (GSAP)
   - Hero: gestaffelter "Stagger"-Reveal beim Laden
   ============================================================ */
(function () {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReduced || typeof gsap === "undefined") return;

  // Sanfte, "high-end" Ease
  const EASE = "expo.out";

  // Initialzustände konsistent über GSAP setzen (überschreibt CSS sauber)
  gsap.set(".hero-headline .word", { yPercent: 110 });
  gsap.set([".hero-eyebrow", ".hero-sub", ".hero-actions"], { y: 24 });

  window.addEventListener("load", () => {
    const tl = gsap.timeline({
      defaults: { ease: EASE },
      delay: 0.15,
    });

    // 1) Eyebrow
    tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 });

    // 2) Headline-Wörter — Zeile für Zeile aus der Maske nach oben
    tl.to(
      ".hero-headline .word",
      {
        yPercent: 0, // aus der Maske (110%) nach oben in Position
        duration: 1.1,
        stagger: 0.12,
      },
      "-=0.4"
    );

    // 3) Subline
    tl.to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");

    // 4) Buttons
    tl.to(".hero-actions", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");

    // 5) Scroll-Indicator
    tl.to(".hero-scroll", { opacity: 1, duration: 0.6 }, "-=0.3");
  });
})();
