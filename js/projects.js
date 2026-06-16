/* ============================================================
   Projects / Bento-Grid — Live aus GitHub + manuelle Projekte
   ------------------------------------------------------------
   ► HIER ANPASSEN:
     1. GITHUB_USERNAME = dein GitHub-Benutzername
     2. REPOS           = öffentliche Repos (werden live geladen)
     3. MANUAL_PROJECTS = private / nicht-API-Projekte (manuell)
   ============================================================ */
const GITHUB_USERNAME = "Barrowow";

const REPOS = [
  "Datenanalyse",
  "Minimal-Honeypot",
];

// Private oder nicht über die API erreichbare Projekte:
const MANUAL_PROJECTS = [
  {
    name: "IHK-Projektarbeit · Datenanalyse",
    description:
      "Datengestütztes Frühwarnsystem zur Prognose des Prüfungserfolgs (§ 34a GewO): " +
      "ETL mit Pandas, Random-Forest-Klassifikation (scikit-learn), FastAPI-Scoring " +
      "und Power-BI-Dashboard. ROC-AUC 0,92.",
    language: "Python",
    url: "https://github.com/Barrowow/IHK-Projektarbeit-Datenanalyse",
    private: true,
    updatedLabel: "Jun 2026",
  },
];

/* ============================================================
   Ab hier: keine Anpassung nötig
   ============================================================ */
(function () {
  const grid = document.getElementById("bento-grid");
  const profileLink = document.getElementById("github-profile-link");
  if (!grid) return;

  if (profileLink) {
    profileLink.href = `https://github.com/${GITHUB_USERNAME}`;
  }

  // Farben pro Programmiersprache (häufigste — Rest = Accent)
  const LANG_COLORS = {
    Python: "#3776ab",
    "Jupyter Notebook": "#da5b0b",
    R: "#198ce7",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    SQL: "#e38c00",
    HTML: "#e34c26",
    CSS: "#563d7c",
    "C++": "#f34b7d",
    Java: "#b07219",
  };

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // GitHub-API-Objekt -> einheitliches Karten-Modell
  function fromGitHub(repo) {
    return {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      url: repo.html_url,
      private: false,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedLabel: new Date(repo.updated_at).toLocaleDateString("de-DE", {
        month: "short",
        year: "numeric",
      }),
    };
  }

  // Manuelles Projekt -> einheitliches Karten-Modell
  function fromManual(p) {
    return {
      name: p.name,
      description: p.description,
      language: p.language,
      url: p.url || null,
      private: !!p.private,
      stars: p.stars,
      forks: p.forks,
      updatedLabel: p.updatedLabel || "",
    };
  }

  // Bento: jede 3. Karte spannt 2 Spalten (rhythmischer Look)
  function spanClass(i) {
    return i % 3 === 0 ? "bento-card--wide" : "";
  }

  function cardHTML(p, i) {
    const lang = p.language || "Data";
    const langColor = LANG_COLORS[p.language] || "#5eead4";
    const desc = p.description || "Kein Beschreibungstext hinterlegt.";

    // Badge: privat vs. live
    const badge = p.private
      ? `<div class="bento-card__live bento-card__live--private" title="Privates Repository">
           <span class="bento-card__dot"></span> Privat
         </div>`
      : `<div class="bento-card__live" title="Live-Repository">
           <span class="bento-card__dot"></span> Live
         </div>`;

    // Stats nur zeigen, wenn vorhanden (private Repos haben keine)
    const stats =
      typeof p.stars === "number"
        ? `<span class="bento-card__stat">★ ${p.stars}</span>
           <span class="bento-card__stat">⑂ ${p.forks}</span>`
        : "";

    const openTag = p.url
      ? `<a href="${p.url}" target="_blank" rel="noopener" data-cursor="link" data-cursor-text="Öffnen ↗"`
      : `<div`;
    const closeTag = p.url ? "</a>" : "</div>";

    return `
      ${openTag} class="bento-card ${spanClass(i)}" style="--lang:${langColor}">
        <div class="bento-card__bg"></div>
        ${badge}

        <div class="bento-card__body">
          <h3 class="bento-card__title">${escapeHtml(p.name)}</h3>
          <p class="bento-card__desc">${escapeHtml(desc)}</p>
        </div>

        <div class="bento-card__meta">
          <span class="bento-card__lang">
            <span class="bento-card__lang-dot" style="background:${langColor}"></span>
            ${escapeHtml(lang)}
          </span>
          ${stats}
          <span class="bento-card__updated">${escapeHtml(p.updatedLabel)}</span>
        </div>
      ${closeTag}`;
  }

  function render(projects) {
    if (!projects.length) {
      grid.innerHTML =
        '<div class="bento-loading">Keine Projekte gefunden. Bitte Config in <code>js/projects.js</code> prüfen.</div>';
      return;
    }
    grid.innerHTML = projects.map(cardHTML).join("");
    animateIn();
  }

  // Karten beim Scroll-In gestaffelt einblenden (GSAP optional)
  function animateIn() {
    const cards = grid.querySelectorAll(".bento-card");
    if (typeof gsap === "undefined" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach((c) => (c.style.opacity = 1));
      return;
    }
    gsap.set(cards, { opacity: 0, y: 40 });
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = [...cards].indexOf(entry.target);
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "expo.out",
              delay: (idx % 3) * 0.08,
            });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => io.observe(c));
  }

  async function load() {
    const manual = MANUAL_PROJECTS.map(fromManual);

    if (GITHUB_USERNAME === "DEIN-GITHUB-USERNAME") {
      render(manual);
      return;
    }

    let githubProjects = [];
    try {
      if (REPOS.length > 0) {
        const results = await Promise.all(
          REPOS.map((name) =>
            fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        githubProjects = results.filter(Boolean).map(fromGitHub);
      } else {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
        );
        if (res.ok) {
          const data = await res.json();
          githubProjects = data.filter((r) => !r.fork).slice(0, 6).map(fromGitHub);
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Manuelle (private) Projekte zuerst, dann öffentliche GitHub-Repos
    render([...manual, ...githubProjects]);
  }

  load();
})();
