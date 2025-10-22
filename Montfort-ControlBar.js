// c-bar.js — Modern Glassmorphism Dock (Redesigned) + Pano Fetcher integration (default hidden)
(async function () {
  // ---- Guard: avoid double-injection ----
  const APP_ID = "dock-widget-root";
  if (document.getElementById(APP_ID)) return;

  // ---- Inject external assets (fonts + icons) ----
  function ensureLink(href, rel = "stylesheet") {
    const exists = [...document.querySelectorAll(`link[rel="${rel}"]`)].some(
      (l) => l.href.includes(href)
    );
    if (!exists) {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    }
  }
  ensureLink(
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  );
  ensureLink(
    "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
  );

  // ---- Inject CSS (modern glassmorphism) ----
  const css = `
* { 
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; 
  box-sizing: border-box;
}

/* Glassmorphism Dock Container */
#${APP_ID} .dock-container {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

#${APP_ID} .dock-panel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation: dock-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes dock-appear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modern Dock Items */
#${APP_ID} .dock-item {
  position: relative;
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  appearance: none;
  outline: none;
  box-shadow: 
    0 2px 12px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.04);
}

#${APP_ID} .dock-item:hover {
  transform: translateY(-6px) scale(1.15);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 12px 28px rgba(0, 0, 0, 0.12),
    0 4px 12px rgba(0, 0, 0, 0.06);
}

#${APP_ID} .dock-item.is-active {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(159, 28, 32, 0.3);
  box-shadow: 
    0 0 0 2px rgba(159, 28, 32, 0.1),
    0 8px 24px rgba(159, 28, 32, 0.15);
}

#${APP_ID} .dock-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Icon Styling */
#${APP_ID} .dock-icon {
  font-size: 1.4rem;
  color: #1a1a1a;
  transition: all 0.3s ease;
  opacity: 0.9;
}

#${APP_ID} .dock-item:hover .dock-icon {
  opacity: 1;
  transform: scale(1.1);
}

#${APP_ID} .dock-item.is-active .dock-icon {
  color: #9F1C20;
}

/* SVG Icon Styling */
#${APP_ID} .dock-icon-img {
  width: 22px;
  height: 22px;
  opacity: 0.9;
  transition: all 0.3s ease;
  filter: brightness(0);
}

#${APP_ID} .dock-item:hover .dock-icon-img {
  opacity: 1;
  transform: scale(1.1);
}

#${APP_ID} .dock-item.is-active .dock-icon-img {
  filter: brightness(0) sepia(1) saturate(5) hue-rotate(340deg);
}

/* Modern Label */
#${APP_ID} .dock-label {
  position: absolute;
  top: -3rem;
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

#${APP_ID} .dock-item:hover .dock-label {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Active State Indicator */
#${APP_ID} .dock-item.is-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #9F1C20;
  border-radius: 50%;
  opacity: 0;
  animation: active-pulse 2s infinite;
}

@keyframes active-pulse {
  0%, 100% { opacity: 0; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
}

/* Divider between functional groups */
#${APP_ID} .dock-divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0, 0, 0, 0.1) 50%, 
    transparent 100%);
  margin: 0 0.25rem;
}

/* Utility */
.hidden-by-dock { display: none !important; }

/* Mobile Responsive */
@media (max-width: 768px) {
  #${APP_ID} .dock-container {
    bottom: 1rem;
  }
  #${APP_ID} .dock-panel {
    padding: 0.5rem;
    border-radius: 1.25rem;
  }
  #${APP_ID} .dock-item {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
  #${APP_ID} .dock-icon {
    font-size: 1.3rem;
  }
}
`.trim();

  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-dock-widget", "true");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---- Inject Modern HTML Structure ----
  const root = document.createElement("div");
  root.id = APP_ID;
  root.innerHTML = `
    <div class="dock-container">
      <div class="dock-panel" role="toolbar" aria-label="Modern Dock Menu">
        <!-- Navigation Group -->
        <button class="dock-item" data-action="home" data-url="" aria-label="Home" title="Home">
          <i class="ri-home-5-line dock-icon" aria-hidden="true"></i>
          <span class="dock-label">Home</span>
        </button>

        <button class="dock-item" data-action="apps" aria-label="Apps" title="Apps" aria-pressed="false">
          <i class="ri-apps-2-line dock-icon" aria-hidden="true"></i>
          <span class="dock-label">Apps</span>
        </button>

        <!-- Tools Group -->
        <button class="dock-item" id="dock-searchToggle" aria-label="Search" title="Search" aria-pressed="false">
          <i class="ri-search-eye-line dock-icon" aria-hidden="true"></i>
          <span class="dock-label">Search</span>
        </button>

        <!-- Pano button (lazy loads FinalPano-Fetcher.js; default hidden) -->
        <button class="dock-item" data-action="panolist" aria-label="Panorama" title="Panorama" aria-pressed="false">
          <img src="https://uandi.media/Virtual-tour/Joy-University/Asset%201.svg" alt="" class="dock-icon-img" aria-hidden="true" />
          <span class="dock-label">Pano</span>
        </button>

        <!-- Controls Group -->
        <button class="dock-item" id="dock-muteToggle" aria-label="Mute" title="Mute">
          <i class="ri-volume-up-line dock-icon" aria-hidden="true"></i>
          <span class="dock-label">Mute</span>
        </button>

        <button class="dock-item" id="dock-fullscreenToggle" aria-label="Fullscreen" title="Fullscreen">
          <i class="ri-fullscreen-line dock-icon" aria-hidden="true"></i>
          <span class="dock-label">Fullscreen</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // Helper: element refs
  const appsBtn = root.querySelector('.dock-item[data-action="apps"]');
  const panoBtn = root.querySelector('.dock-item[data-action="panolist"]');

  // =====================================================
  // BACKGROUND MUSIC — Modernized with better error handling
  // =====================================================
  let bgMusic = document.getElementById("bgMusic");
  if (!bgMusic) {
    bgMusic = document.createElement("audio");
    bgMusic.id = "bgMusic";
    bgMusic.loop = true;
    bgMusic.autoplay = true;
    bgMusic.setAttribute("playsinline", "");
    bgMusic.volume = 0.7;

    const src = document.createElement("source");
    src.src = "chillout-7-1350.mp3";
    src.type = "audio/mpeg";
    bgMusic.appendChild(src);

    const fallbackText = document.createTextNode(
      "Your browser does not support background audio."
    );
    bgMusic.appendChild(fallbackText);

    document.body.appendChild(bgMusic);
  }

  const tryStart = async () => {
    try { await bgMusic.play(); } 
    catch { /* autoplay may be blocked until gesture */ }
  };
  tryStart();

  const kickstart = async () => {
    if (bgMusic.paused) {
      try { await bgMusic.play(); } catch {}
    }
    window.removeEventListener("pointerdown", kickstart, { capture: true });
    window.removeEventListener("keydown", kickstart, { capture: true });
  };
  window.addEventListener("pointerdown", kickstart, { once: true, capture: true });
  window.addEventListener("keydown", kickstart, { once: true, capture: true });

  // =====================================================
  // MODERN MUTE TOGGLE
  // =====================================================
  const muteToggle = root.querySelector("#dock-muteToggle");
  const muteIcon = muteToggle.querySelector(".dock-icon");
  const muteLabel = muteToggle.querySelector(".dock-label");

  function setMutedUI(muted) {
    muteToggle.classList.toggle("is-active", muted);
    if (muted) {
      muteIcon.className = "ri-volume-mute-line dock-icon";
      muteToggle.title = "Unmute";
      muteToggle.setAttribute("aria-label", "Unmute");
      muteLabel.textContent = "Unmute";
    } else {
      muteIcon.className = "ri-volume-up-line dock-icon";
      muteToggle.title = "Mute";
      muteToggle.setAttribute("aria-label", "Mute");
      muteLabel.textContent = "Mute";
    }
  }
  setMutedUI(!!bgMusic.muted);

  muteToggle.addEventListener("click", () => {
    bgMusic.muted = !bgMusic.muted;
    setMutedUI(bgMusic.muted);
    muteToggle.style.transform = "scale(0.95)";
    setTimeout(() => (muteToggle.style.transform = ""), 150);
  });
  bgMusic.addEventListener("volumechange", () => setMutedUI(bgMusic.muted));

  // =====================================================
  // ENHANCED SEARCH TOGGLE
  // =====================================================
  const SEARCH_SELECTORS = ["#container_search"];

  function ensureHiddenOnLoad(selectors) {
    const hideNow = () => {
      const nodes = selectors.flatMap((s) => [...document.querySelectorAll(s)]);
      nodes.forEach((el) => el.classList.add("hidden-by-dock"));
      return nodes.length > 0;
    };
    if (hideNow()) return;
    const mo = new MutationObserver(() => {
      if (hideNow()) mo.disconnect();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  function toggleBySelectors(selectors) {
    const nodes = selectors.flatMap((s) => [...document.querySelectorAll(s)]);
    if (!nodes.length) {
      console.warn("[Modern Dock] No elements matched selectors:", selectors);
      return false;
    }
    nodes.forEach((el) => {
      el.classList.toggle("hidden-by-dock");
      el.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    });
    return !nodes[0].classList.contains("hidden-by-dock");
  }

  function wireToggle(btn, selectors) {
    btn.addEventListener("click", () => {
      const visible = toggleBySelectors(selectors);
      btn.classList.toggle("is-active", visible);
      btn.setAttribute("aria-pressed", visible ? "true" : "false");
    });
  }

  ensureHiddenOnLoad(SEARCH_SELECTORS);
  wireToggle(root.querySelector("#dock-searchToggle"), SEARCH_SELECTORS);

  // =====================================================
  // MODERN FULLSCREEN
  // =====================================================
  const fullscreenToggle = root.querySelector("#dock-fullscreenToggle");
  const fullscreenIcon = fullscreenToggle.querySelector(".dock-icon");
  const fullscreenLabel = fullscreenToggle.querySelector(".dock-label");

  function inFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }
  function updateFsUI(active) {
    fullscreenToggle.classList.toggle("is-active", active);
    if (active) {
      fullscreenIcon.className = "ri-fullscreen-exit-line dock-icon";
      fullscreenLabel.textContent = "Exit Fullscreen";
      fullscreenToggle.title = "Exit Fullscreen";
    } else {
      fullscreenIcon.className = "ri-fullscreen-line dock-icon";
      fullscreenLabel.textContent = "Fullscreen";
      fullscreenToggle.title = "Fullscreen";
    }
  }
  async function enterFs() {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
    } catch (err) { console.warn("Fullscreen failed:", err); }
  }
  async function exitFs() {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
    } catch (err) { console.warn("Exit fullscreen failed:", err); }
  }
  fullscreenToggle.addEventListener("click", () => {
    inFullscreen() ? exitFs() : enterFs();
  });
  document.addEventListener("fullscreenchange", () => updateFsUI(inFullscreen()));
  document.addEventListener("webkitfullscreenchange", () => updateFsUI(inFullscreen()));

  // =====================================================
  // ENHANCED APPS MENU with modern loading states
  // =====================================================
  const FOR_ICONS_SRC = "./for-icons.js";
  const WIDGET_ID = "cards-widget-root";
  let appsOpen = false;
  let loadingApps = false;

  function hasWidget() {
    return !!document.getElementById(WIDGET_ID);
  }
  function setAppsBtnState(active) {
    appsOpen = !!active;
    appsBtn.classList.toggle("is-active", appsOpen);
    appsBtn.setAttribute("aria-pressed", appsOpen ? "true" : "false");
  }
  function attachWidgetHooks() {
    if (window.CARDS_WIDGET) {
      if (typeof window.CARDS_WIDGET.onOpen === "function") {
        window.CARDS_WIDGET.onOpen(() => setAppsBtnState(true));
      }
      if (typeof window.CARDS_WIDGET.onClose === "function") {
        window.CARDS_WIDGET.onClose(() => setAppsBtnState(false));
      }
    }
  }
  const appsMo = new MutationObserver(() => {
    if (!hasWidget() && appsOpen) setAppsBtnState(false);
  });
  appsMo.observe(document.documentElement, { childList: true, subtree: true });

  async function ensureForIconsLoaded() {
    if (window.CARDS_WIDGET || hasWidget()) return true;
    if (loadingApps) return false;

    loadingApps = true;
    appsBtn.style.opacity = "0.7";

    try {
      const alreadyTag = [...document.querySelectorAll("script[src]")].some(
        (s) => s.src.includes(FOR_ICONS_SRC)
      );
      if (!alreadyTag) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = FOR_ICONS_SRC;
          s.async = true;
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      await new Promise((r) => setTimeout(r, 100));
      attachWidgetHooks();
      return window.CARDS_WIDGET || hasWidget();
    } catch (err) {
      console.error("[Modern Dock] Failed to load apps:", err);
      return false;
    } finally {
      loadingApps = false;
      appsBtn.style.opacity = "1";
    }
  }

  async function toggleApps() {
    if (!appsOpen) {
      appsBtn.disabled = true;
      const ok = await ensureForIconsLoaded();
      appsBtn.disabled = false;
      if (!ok) return;

      if (window.CARDS_WIDGET?.toggle) window.CARDS_WIDGET.toggle();
      else document.getElementById(WIDGET_ID)?.classList.add("active");
      setAppsBtnState(true);
    } else {
      if (window.CARDS_WIDGET?.toggle) window.CARDS_WIDGET.toggle();
      else document.getElementById(WIDGET_ID)?.classList.remove("active");
      setAppsBtnState(false);
    }
  }
  appsBtn.addEventListener("click", toggleApps);

  // =====================================================
  // PANORAMA FETCHER — lazy-load + toggle (default hidden)
  // =====================================================
  const PANO_FETCHER_SRC = "./FinalPano-Fetcher.js"; // like FOR_ICONS default pattern
  let panoBusy = false;

  // Selectors that FinalPano-Fetcher.js creates
  const PANO_HEADER_SEL = ".pano-glass-header";
  const PANO_SIDEBAR_SEL = ".pano-glass-sidebar";

  function getPanoNodes() {
    const header = document.querySelector(PANO_HEADER_SEL);
    const sidebar = document.querySelector(PANO_SIDEBAR_SEL);
    return { header, sidebar };
  }
  function hasPanoDOM() {
    const { header, sidebar } = getPanoNodes();
    return !!(header || sidebar);
  }
  function isPanoVisible() {
    const { header, sidebar } = getPanoNodes();
    const any = [header, sidebar].filter(Boolean);
    if (!any.length) return false;
    return any.some((el) => el.style.display !== "none");
  }
 function setPanoDisplay(show) {
  const { header, sidebar } = getPanoNodes();
  const headVal = show ? "flex"  : "none";  // header is a flex row
  const sideVal = show ? "block" : "none";  // sidebar must remain block
  if (header)  header.style.display  = headVal;
  if (sidebar) sidebar.style.display = sideVal;
  panoBtn.classList.toggle("is-active", !!show);
  panoBtn.setAttribute("aria-pressed", show ? "true" : "false");
}


  async function loadPanoScript(forceReloadIfRemoved = false) {
    // If DOM exists, just ensure hidden and return true
    if (hasPanoDOM() && !forceReloadIfRemoved) return true;

    // If DOM was removed (user clicked ✕), reload script with cache-bust
    if (panoBusy) return false;
    panoBusy = true;
    panoBtn.style.opacity = "0.7";

    try {
      const srcUrl = forceReloadIfRemoved
        ? `${PANO_FETCHER_SRC}?v=${Date.now()}`
        : ( // if no DOM AND no tag yet, add; if tag exists but DOM gone, also add with cache-bust
          [...document.querySelectorAll("script[src]")].some((s) => s.src.includes(PANO_FETCHER_SRC))
            ? `${PANO_FETCHER_SRC}?v=${Date.now()}`
            : PANO_FETCHER_SRC
        );

      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = srcUrl;
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });

      // Give the script time to render its header + sidebar
      await new Promise((r) => setTimeout(r, 150));

      // Default hidden after load
      setPanoDisplay(false);
      return true;
    } catch (err) {
      console.error("[Modern Dock] Failed to load panorama fetcher:", err);
      return false;
    } finally {
      panoBusy = false;
      panoBtn.style.opacity = "1";
    }
  }

  async function ensurePanoLoaded() {
    if (hasPanoDOM()) return true;
    return loadPanoScript(true);
  }

  async function togglePano() {
    // If DOM absent (first use or user closed with ✕), (re)load then show
    if (!hasPanoDOM()) {
      panoBtn.disabled = true;
      const ok = await ensurePanoLoaded();
      panoBtn.disabled = false;
      if (!ok) return;
      setPanoDisplay(true);
      return;
    }
    // If present, just toggle visibility
    const shown = isPanoVisible();
    setPanoDisplay(!shown);
  }

  // Observe DOM to sync button state if user hits the ✕ (which removes nodes)
  const panoMo = new MutationObserver(() => {
    if (!hasPanoDOM()) {
      panoBtn.classList.remove("is-active");
      panoBtn.setAttribute("aria-pressed", "false");
      return;
    }
    const shown = isPanoVisible();
    panoBtn.classList.toggle("is-active", shown);
    panoBtn.setAttribute("aria-pressed", shown ? "true" : "false");
  });
  panoMo.observe(document.documentElement, { childList: true, subtree: true });

  // Wire Pano button
  panoBtn.addEventListener("click", () => {
    panoBtn.style.transform = "scale(0.95)";
    setTimeout(() => (panoBtn.style.transform = ""), 150);
    togglePano();
  });

  // =====================================================
  // ENHANCED TAG TOGGLING (kept for other buttons using data-tags)
  // =====================================================
  const tagVisibility = new Map();
  function setTagsVisible(tags, visible) {
    const arr = Array.isArray(tags) ? tags : [tags];
    if (typeof tour === "undefined" || !tour?.setComponentsVisibilityByTags) return;
    tour.setComponentsVisibilityByTags(arr, visible);
    arr.forEach((tag) => tagVisibility.set(tag, visible));
  }
  function toggleTags(tags) {
    const arr = Array.isArray(tags) ? tags : [tags];
    const anyVisible = arr.some((tag) => tagVisibility.get(tag) === true);
    setTagsVisible(arr, !anyVisible);
  }

  // Button actions (note: panolist handled above)
  root.querySelectorAll(".dock-item[data-action]").forEach((btn) => {
    const action = btn.getAttribute("data-action");
    if (action === "panolist") return; // handled separately

    btn.addEventListener("click", () => {
      const tagsAttr = btn.getAttribute("data-tags");
      const url = btn.getAttribute("data-url");

      btn.style.transform = "scale(0.95)";
      setTimeout(() => { btn.style.transform = ""; }, 150);

      switch (action) {
        case "home":
          if (url) window.open(url, "_blank");
          break;
        default:
          if (tagsAttr) {
            const tags = tagsAttr.split(",").map((s) => s.trim()).filter(Boolean);
            toggleTags(tags);
            btn.classList.toggle("is-active");
          }
          break;
      }
    });
  });

  // =====================================================
  // MODERN PUBLIC API
  // =====================================================
  window.MODERN_DOCK = {
    musicEl: () => bgMusic,
    toggleApps: () => toggleApps(),
    togglePano: () => togglePano(),
    show: () => (root.querySelector(".dock-panel").style.display = "flex"),
    hide: () => (root.querySelector(".dock-panel").style.display = "none"),
    destroy: () => {
      styleEl.remove();
      root.remove();
      appsMo.disconnect();
      panoMo.disconnect();
      delete window.MODERN_DOCK;
    },
  };

  console.log("🎯 Modern Glassmorphism Dock loaded successfully (+ Pano Fetcher, default hidden)");
})();
