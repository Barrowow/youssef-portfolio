/* ============================================================
   Kontakt-Overlay + Versand über Web3Forms
   ------------------------------------------------------------
   ► HIER ANPASSEN:
     WEB3FORMS_ACCESS_KEY = dein kostenloser Access-Key.
     Holen unter https://web3forms.com  → E-Mail (jose.fathi@gmail.com)
     eintragen → Key kommt per Mail. Funktioniert auf GitHub Pages,
     ohne Server. Mails landen bei jose.fathi@gmail.com.
   ============================================================ */
const WEB3FORMS_ACCESS_KEY = "fe816af5-76d5-4043-a0da-5076943e807e";

(function () {
  const overlay = document.getElementById("contact-overlay");
  const form = document.getElementById("contact-form");
  if (!overlay || !form) return;

  const statusEl = form.querySelector("[data-status]");
  const submitBtn = form.querySelector(".contact-submit");
  let lastFocused = null;

  /* ---------- Öffnen / Schließen ---------- */
  function open() {
    lastFocused = document.activeElement;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("no-scroll");
    setTimeout(() => form.querySelector("#cf-name")?.focus(), 60);
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("no-scroll");
    lastFocused?.focus();
  }

  document.querySelectorAll("[data-open-contact]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    })
  );
  document.querySelectorAll("[data-close-contact]").forEach((btn) =>
    btn.addEventListener("click", close)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });

  /* ---------- Status-Helfer ---------- */
  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = "contact-status" + (type ? " is-" + type : "");
  }

  /* ---------- Absenden ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    if (!data.name || !data.email || !data.message) {
      setStatus("Bitte fülle alle Felder aus.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setStatus("Bitte gib eine gültige E-Mail-Adresse ein.", "error");
      return;
    }
    if (WEB3FORMS_ACCESS_KEY === "DEIN-ACCESS-KEY") {
      setStatus("Formular noch nicht konfiguriert (Access-Key fehlt).", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Wird gesendet …", "pending");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "Neue Kontaktanfrage von " + data.name,
          from_name: "Portfolio Kontaktformular",
          name: data.name,
          email: data.email, // wird als Reply-To gesetzt
          message: data.message,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setStatus("Danke! Deine Nachricht wurde gesendet. ✓", "success");
        form.reset();
        setTimeout(close, 1800);
      } else {
        throw new Error(result.message || "Unbekannter Fehler");
      }
    } catch (err) {
      console.error(err);
      setStatus("Senden fehlgeschlagen. Bitte später erneut versuchen.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
