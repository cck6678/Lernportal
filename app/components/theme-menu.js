import themes from "../data/themes.json";

const STORAGE_KEY = "lernportal:theme";
const PLATFORM_KEY = "lernportal:platform_mac_ios";

function applyThemeById(id) {
  const t = themes.find((x) => x.id === id);
  if (!t) return;
  const [bg, fg, muted, accent] = t.palette;
  const root = document.documentElement;
  root.style.setProperty("--bg", bg);
  root.style.setProperty("--card", fg);
  root.style.setProperty("--text", muted || "#0f172a");
  // map muted to --muted and primary to accent
  root.style.setProperty("--muted", muted);
  root.style.setProperty("--primary", accent);
  root.setAttribute("data-theme", id);
}

function saveTheme(id) {
  localStorage.setItem(STORAGE_KEY, id);
}

function loadSavedTheme() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

function savePlatformPref(checked) {
  localStorage.setItem(PLATFORM_KEY, checked ? "1" : "0");
}
function loadPlatformPref() {
  return localStorage.getItem(PLATFORM_KEY) === "1";
}

function createButton() {
  const btn = document.createElement("button");
  btn.className = "theme-corner-button";
  btn.setAttribute("aria-label", "Design wechseln");
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
  btn.addEventListener("click", togglePopover);
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") togglePopover();
  });
  return btn;
}

let popover = null;
let open = false;

function buildPopover() {
  popover = document.createElement("div");
  popover.className = "theme-popover";
  popover.setAttribute("role", "dialog");

  const grid = document.createElement("div");
  grid.className = "theme-grid";

  themes.forEach((t) => {
    const tile = document.createElement("div");
    tile.className = "theme-tile";
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
    tile.appendChild(sw);
    tile.addEventListener("click", () => {
      applyThemeById(t.id);
      saveTheme(t.id);
      markSelected(t.id);
      closePopover();
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

function togglePopover() {
  if (open) return closePopover();
  openPopover();
}

function openPopover() {
  if (!popover) buildPopover();
  popover.style.display = "block";
  open = true;
  const saved = loadSavedTheme();
  if (saved) markSelected(saved);
}

function closePopover() {
  if (!popover) return;
  popover.style.display = "none";
  open = false;
}

function init() {
  // Create button
  const btn = createButton();
  document.body.appendChild(btn);
  // Build popover hidden
  buildPopover();
  popover.style.display = "none";

  // Apply saved theme
  const saved = loadSavedTheme();
  if (saved) applyThemeById(saved);
  const platform = loadPlatformPref();
  if (platform) document.body.classList.add("platform-mac-ios");
}

// Wait for DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else init();
