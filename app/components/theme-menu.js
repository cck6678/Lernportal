import themes from "../data/themes.json";

const STORAGE_KEY = "lernportal:theme";
const PLATFORM_KEY = "lernportal:platform_mac_ios";
const DEFAULT_THEME = "clean-mono-1";

function applyThemeById(id) {
  const t = themes.find((x) => x.id === id);
  if (!t) return;
  const [bg, fg, muted, accent] = t.palette;
  const root = document.documentElement;
  root.style.setProperty("--bg", bg);
  root.style.setProperty("--card", fg);
  // keep text high-contrast: prefer --text derived from fg
  root.style.setProperty("--text", getContrastingTextColor(fg));
  root.style.setProperty("--muted", muted || "#6b7280");
  root.style.setProperty("--primary", accent || "#3d7cfa");
  root.setAttribute("data-theme", id);
}

function getContrastingTextColor(bg) {
  // simple luminance-based contrast: return dark or light text
  try {
    const c = bg.replace('#','');
    const r = parseInt(c.substring(0,2),16);
    const g = parseInt(c.substring(2,4),16);
    const b = parseInt(c.substring(4,6),16);
    const lum = 0.2126*r + 0.7152*g + 0.0722*b;
    return lum > 180 ? '#0f172a' : '#ffffff';
  } catch (e) {
    return '#0f172a';
  }
}

function saveTheme(id) { localStorage.setItem(STORAGE_KEY, id); }
function loadSavedTheme() { return localStorage.getItem(STORAGE_KEY) || null; }
function savePlatformPref(checked) { localStorage.setItem(PLATFORM_KEY, checked ? "1" : "0"); }
function loadPlatformPref() { return localStorage.getItem(PLATFORM_KEY) === "1"; }

function createButton() {
  const btn = document.createElement("button");
  btn.className = "theme-corner-button";
  btn.setAttribute("aria-label", "Design wechseln");
  btn.setAttribute("title", "Design wechseln");
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
  btn.addEventListener("click", togglePopover);
  btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePopover(); } });
  return btn;
}

let popover = null;
let open = false;

function buildPopover() {
  popover = document.createElement("div");
  popover.className = "theme-popover";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-label", "Theme Auswahl");

  const grid = document.createElement("div");
  grid.className = "theme-grid";

  themes.forEach((t) => {
    const tile = document.createElement("button");
    tile.className = "theme-tile";
    tile.setAttribute('type','button');
    tile.setAttribute('aria-label', t.name);
    tile.title = t.name;

    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.display = "grid";
    sw.style.gridTemplateColumns = "25% 25% 25% 25%";
    sw.style.height = "100%";
    t.palette.forEach((c) => {
      const s = document.createElement("div");
      s.style.background = c;
      sw.appendChild(s);
    });

    const label = document.createElement('div');
    label.className = 'theme-tile-label';
    label.textContent = t.name;

    tile.appendChild(sw);
    tile.appendChild(label);

    tile.addEventListener("click", () => {
      applyThemeById(t.id);
      saveTheme(t.id);
      markSelected(t.id);
      closePopover();
    });

    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tile.click();
      }
    });

    grid.appendChild(tile);
  });

  const controls = document.createElement("div");
  controls.className = "theme-controls";
  const left = document.createElement("div");
  left.className = "left";

  const iosLabel = document.createElement("label");
  iosLabel.style.fontSize = "0.85rem";
  iosLabel.style.display = "inline-flex";
  iosLabel.style.alignItems = "center";
  iosLabel.style.gap = "0.4rem";

  const iosCb = document.createElement("input");
  iosCb.type = "checkbox";
  iosCb.checked = loadPlatformPref();
  iosCb.addEventListener("change", () => {
    document.body.classList.toggle("platform-mac-ios", iosCb.checked);
    savePlatformPref(iosCb.checked);
  });
  iosLabel.appendChild(iosCb);
  iosLabel.appendChild(document.createTextNode("iOS/macOS UI"));

  left.appendChild(iosLabel);

  const rightBtn = document.createElement("div");
  rightBtn.style.display = "flex";
  rightBtn.style.gap = "0.4rem";

  const resetBtn = document.createElement("button");
  resetBtn.className = "button secondary";
  resetBtn.textContent = "Reset";
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PLATFORM_KEY);
    location.reload();
  });

  rightBtn.appendChild(resetBtn);

  controls.appendChild(left);
  controls.appendChild(rightBtn);

  popover.appendChild(grid);
  popover.appendChild(controls);

  document.body.appendChild(popover);
}

function markSelected(id) {
  const tiles = document.querySelectorAll(".theme-tile");
  tiles.forEach((el, idx) => {
    const t = themes[idx];
    if (t && t.id === id) el.classList.add("selected"); else el.classList.remove("selected");
  });
}

function togglePopover() { if (open) return closePopover(); openPopover(); }
function openPopover() { if (!popover) buildPopover(); popover.style.display = "block"; open = true; const saved = loadSavedTheme(); if (saved) markSelected(saved); }
function closePopover() { if (!popover) return; popover.style.display = "none"; open = false; }

function init() {
  const btn = createButton();
  document.body.appendChild(btn);
  buildPopover();
  popover.style.display = "none";

  // Apply saved or default theme
  const saved = loadSavedTheme();
  const applyId = saved || DEFAULT_THEME;
  applyThemeById(applyId);
  markSelected(applyId);

  const platform = loadPlatformPref();
  if (platform) document.body.classList.add("platform-mac-ios");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else init();
