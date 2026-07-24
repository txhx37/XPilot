/* ============================================================
   XPilot — script.js
   ============================================================ */

/* ------------------------------------------------------------
   1. DOWNLOAD CONFIG  ←←← EDIT THIS ONE BLOCK ONLY
   ------------------------------------------------------------
   Point DOWNLOAD_URL at your installer file.

   Option A — file hosted next to the site:
     Put your file in a /downloads folder beside index.html, e.g.
       downloads/XPilot-Setup.exe
     then set:
       DOWNLOAD_URL: "downloads/XPilot-Setup.exe"

   Option B — file hosted elsewhere (recommended for ~1 GB files):
     Paste the direct file URL, e.g. a GitHub Release asset or
     Azure Blob / S3 link:
       DOWNLOAD_URL: "https://github.com/you/xpilot/releases/download/v1.0/XPilot-Setup.exe"

   FILE_NAME is the name the browser suggests when saving
   (only guaranteed for same-origin files — see notes).
   ------------------------------------------------------------ */
const DOWNLOAD_CONFIG = {
  DOWNLOAD_URL: "downloads/XPilot-Setup.exe",
  FILE_NAME: "XPilot-Setup.exe",
  FILE_SIZE_LABEL: "≈ 1 GB", // shown to the user before download starts
};

/* ------------------------------------------------------------
   2. Download handling
   All buttons with class .js-download trigger the download.
   ------------------------------------------------------------ */
function initDownloadButtons() {
  const buttons = document.querySelectorAll(".js-download");
  const status = document.getElementById("download-status");

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      startDownload(status);
    });
  });
}

function startDownload(statusEl) {
  const { DOWNLOAD_URL, FILE_NAME, FILE_SIZE_LABEL } = DOWNLOAD_CONFIG;

  if (!DOWNLOAD_URL) {
    if (statusEl) statusEl.textContent = "Download link not configured yet.";
    return;
  }

  // Create a temporary anchor and click it — works for large files
  // because the browser streams the download natively (no JS memory use).
  const a = document.createElement("a");
  a.href = DOWNLOAD_URL;
  a.download = FILE_NAME; // honoured for same-origin files
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();

  if (statusEl) {
    statusEl.textContent = `Your download has started (${FILE_SIZE_LABEL}). If it doesn't begin, check your browser's download bar.`;
  }
}

/* ------------------------------------------------------------
   3. Scroll reveal (fade-up)
   ------------------------------------------------------------ */
function initScrollReveal() {
  const els = document.querySelectorAll(".fade-up");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => obs.observe(el));
}

/* ------------------------------------------------------------
   4. Features track — arrow buttons + drag to scroll
   ------------------------------------------------------------ */
function initFeaturesTrack() {
  const track = document.getElementById("features-track");
  if (!track) return;

  const buttons = document.querySelectorAll(".scroll-btn");
  const CARD_STEP = 364; // card width + gap

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.dataset.dir);
      track.scrollBy({ left: dir * CARD_STEP, behavior: "smooth" });
    });
  });

  // Disable arrows at the ends
  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    buttons.forEach((btn) => {
      const dir = Number(btn.dataset.dir);
      btn.disabled =
        (dir === -1 && track.scrollLeft <= 2) ||
        (dir === 1 && track.scrollLeft >= maxScroll);
    });
  };
  track.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  updateArrows();

  // Drag to scroll (mouse)
  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX;
    startScroll = track.scrollLeft;
    track.classList.add("dragging");
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    track.classList.remove("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    track.scrollLeft = startScroll - (e.pageX - startX);
  });
}

/* ------------------------------------------------------------
   5. Navbar — active link highlighting + mobile menu
   ------------------------------------------------------------ */
function initNavbar() {
  // Active link on scroll
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links .nav-link");

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
  };

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionObs.observe(s));

  // Mobile menu toggle
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = !menu.hidden;
    menu.hidden = open;
    toggle.setAttribute("aria-expanded", String(!open));
  });

  // Close menu when a link is tapped
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ------------------------------------------------------------
   6. Misc — footer year, lucide icons
   ------------------------------------------------------------ */
function initMisc() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Render lucide icons (script loaded from CDN in index.html)
  if (window.lucide) window.lucide.createIcons();
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initMisc();
  initDownloadButtons();
  initScrollReveal();
  initFeaturesTrack();
  initNavbar();
});
