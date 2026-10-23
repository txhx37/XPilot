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
  // Served as a .zip: Chrome's Safe Browsing blocks a bare unsigned .exe
  // download, but not a .zip. Users unzip and run XPilot-Setup.exe inside.
  DOWNLOAD_URL: "downloads/XPilot-Setup.zip",
  FILE_NAME: "XPilot-Setup.zip",
  FILE_SIZE_LABEL: "≈ 48 MB", // shown to the user before download starts
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
    statusEl.textContent = `Your download has started (${FILE_SIZE_LABEL}). Unzip it, then run XPilot-Setup.exe to install. If SmartScreen appears, click “More info → Run anyway”.`;
  }
}

/* ------------------------------------------------------------
   2b. Browser extension
   ------------------------------------------------------------
   CHROME_ZIP_URL  — the extension for Chrome, Edge and Brave, loaded with
                     Developer mode (no Chrome Web Store fee).
   FIREFOX_URL     — the Firefox Add-ons (AMO) listing once Mozilla has
                     signed it (free). Leave "" until then: the Firefox
                     button stays disabled with a "coming soon" note.
   ------------------------------------------------------------ */
const EXTENSION_CONFIG = {
  CHROME_ZIP_URL: "downloads/XPilot-Extension-Chrome.zip",
  CHROME_ZIP_NAME: "XPilot-Extension-Chrome.zip",
  FIREFOX_URL: "",
  FIREFOX_ANDROID_STORE: "https://play.google.com/store/apps/details?id=org.mozilla.firefox",
};

function detectDevice() {
  const ua = navigator.userAgent || "";
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const firefox = /Firefox\//i.test(ua) || /FxiOS/i.test(ua);
  return { android, ios, desktop: !android && !ios, firefox };
}

function initExtension() {
  const chromeBtn = document.querySelector('.js-ext[data-ext="chrome"]');
  const firefoxBtn = document.querySelector('.js-ext[data-ext="firefox"]');
  const note = document.getElementById("ext-note");
  const steps = document.getElementById("ext-steps");
  if (!chromeBtn || !firefoxBtn || !note) return;

  const device = detectDevice();
  const firefoxReady = Boolean(EXTENSION_CONFIG.FIREFOX_URL);
  const setNote = (html) => {
    note.innerHTML = html;
  };

  if (device.android) {
    // Chrome on Android cannot run extensions; Firefox for Android can.
    chromeBtn.disabled = true;
    if (!device.firefox) {
      firefoxBtn.disabled = true;
      setNote(
        `On Android, XPilot works in the <strong>Firefox</strong> browser. Open this page in Firefox for Android to add the extension. ` +
          `<a href="${EXTENSION_CONFIG.FIREFOX_ANDROID_STORE}" target="_blank" rel="noopener">Get Firefox for Android</a>`
      );
    } else if (!firefoxReady) {
      firefoxBtn.disabled = true;
      setNote("The Firefox version is coming soon — it is being reviewed by Mozilla.");
    } else {
      firefoxBtn.classList.replace("btn-ghost", "btn-primary");
      setNote("Tap <strong>Add to Firefox</strong>, then open XPilot from Firefox's menu → Extensions.");
    }
  } else if (device.ios) {
    chromeBtn.disabled = true;
    firefoxBtn.disabled = true;
    setNote("The XPilot extension isn't available on iPhone or iPad yet. Use it on a computer, or on Android in Firefox.");
  } else {
    if (!firefoxReady) firefoxBtn.disabled = true;
    if (device.firefox && firefoxReady) firefoxBtn.classList.replace("btn-ghost", "btn-primary");
    else if (!device.firefox) chromeBtn.classList.replace("btn-ghost", "btn-primary");
    if (device.firefox && !firefoxReady) {
      setNote("The Firefox version is coming soon — it is being reviewed by Mozilla. Chrome, Edge and Brave can use XPilot now.");
    }
  }

  chromeBtn.addEventListener("click", () => {
    if (chromeBtn.disabled) return;
    const a = document.createElement("a");
    a.href = EXTENSION_CONFIG.CHROME_ZIP_URL;
    a.download = EXTENSION_CONFIG.CHROME_ZIP_NAME;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setNote("Your download has started. Then follow these three steps:");
    if (steps) steps.hidden = false;
  });

  firefoxBtn.addEventListener("click", () => {
    if (firefoxBtn.disabled || !firefoxReady) return;
    window.open(EXTENSION_CONFIG.FIREFOX_URL, "_blank", "noopener");
  });
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
  initExtension();
  initScrollReveal();
  initFeaturesTrack();
  initNavbar();
});
