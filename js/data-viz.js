/* ============================================================
   Data-Bereich
   - KPI-Zähler zählen beim Scroll-In hoch
   - Chart.js Balkendiagramm (Feature Importance) wächst beim
     Scroll-In aus dem Nullpunkt
   - Daten aus der IHK-Projektarbeit (§ 34a Prüfungserfolg)
   ============================================================ */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1) KPI-Zähler ---------- */
  function formatValue(val, decimals, prefix, suffix) {
    let num = decimals > 0
      ? val.toFixed(decimals).replace(".", ",")
      : Math.round(val).toString();
    return prefix + num + suffix;
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const valEl = el.querySelector(".kpi__value");

    if (reduced) {
      valEl.textContent = formatValue(target, decimals, prefix, suffix);
      return;
    }

    const duration = 1400;
    let startTs = null;
    function frame(ts) {
      if (startTs === null) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      // easeOutExpo
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      valEl.textContent = formatValue(target * eased, decimals, prefix, suffix);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const kpis = document.querySelectorAll(".kpi[data-count-to]");
  if (kpis.length) {
    const kpiObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    kpis.forEach((k) => kpiObs.observe(k));
  }

  /* ---------- 2) Feature-Importance-Chart ---------- */
  const canvas = document.getElementById("feature-chart");
  if (!canvas || typeof Chart === "undefined") return;

  // Skill-Vertrautheit (Selbsteinschätzung) — bei Bedarf anpassen
  const FEATURES = [
    { label: "Python", value: 90 },
    { label: "SQL", value: 85 },
    { label: "Pandas / NumPy", value: 88 },
    { label: "Power BI", value: 80 },
    { label: "Machine Learning", value: 75 },
    { label: "Excel", value: 85 },
  ];

  const ACCENT = "#5eead4";
  const MIST = "rgba(233, 236, 242, 0.7)";
  const GRID = "rgba(233, 236, 242, 0.06)";

  let chart = null;

  function buildChart() {
    if (chart) return;
    const ctx = canvas.getContext("2d");

    // Vertikaler Verlauf für die Balken
    const grad = ctx.createLinearGradient(0, 0, 600, 0);
    grad.addColorStop(0, "rgba(94, 234, 212, 0.35)");
    grad.addColorStop(1, "rgba(94, 234, 212, 0.95)");

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: FEATURES.map((f) => f.label),
        datasets: [
          {
            data: FEATURES.map((f) => f.value),
            backgroundColor: grad,
            hoverBackgroundColor: ACCENT,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: "flex",
            maxBarThickness: 26,
          },
        ],
      },
      options: {
        indexAxis: "y", // horizontale Balken
        responsive: true,
        maintainAspectRatio: false,
        animation: reduced
          ? false
          : { duration: 1400, easing: "easeOutQuart" },
        layout: { padding: { right: 16 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0e1016",
            borderColor: "rgba(94,234,212,0.3)",
            borderWidth: 1,
            titleColor: "#e9ecf2",
            bodyColor: ACCENT,
            padding: 10,
            displayColors: false,
            callbacks: { label: (c) => c.parsed.x + " % Vertrautheit" },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: { color: GRID, drawBorder: false },
            ticks: { color: MIST, font: { size: 11 }, callback: (v) => v + "%" },
          },
          y: {
            grid: { display: false, drawBorder: false },
            ticks: { color: "#e9ecf2", font: { size: 12, weight: "500" } },
          },
        },
      },
    });
  }

  // Chart erst bauen, wenn sichtbar (Animation startet dann)
  const chartObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          buildChart();
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  chartObs.observe(canvas);
})();
