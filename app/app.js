/* Leonida Field Guide — tracker logic: load trophies, save progress, filter, spoil, export. */
"use strict";

const STORAGE_KEY = "leonida-field-guide-v1";
const DATA_URL = "data/trophies.json";

const ROADMAP_PHASES = [
  {
    id: 0,
    title: "Phase 0 — Setup & early play",
    hours: "First hours",
    text: "Start these on day one. They cost nothing extra and save hours later.",
    trophyIds: [16, 28, 35, 42, 44],
  },
  {
    id: 1,
    title: "Phase 1 — Story progression",
    hours: "60–80 hours",
    text: "Play the five chapters. Story trophies pop as missions complete; partner and misc trophies happen along the way. Save manually at every chapter start.",
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 20, 21, 33, 34, 36, 37, 45, 46, 47, 48, 49, 50, 51],
  },
  {
    id: 2,
    title: "Phase 2 — Cleanup",
    hours: "About 100 hours",
    text: "Free-roam after the credits. Work the 100% checklist, the activities, the collectibles and the robberies — most of it counts toward A Long Road at the same time.",
    trophyIds: [15, 17, 18, 19, 25, 29, 30, 31, 32, 38, 39, 40, 41, 43, 52, 53, 54, 55],
  },
  {
    id: 3,
    title: "Phase 3 — Final checks",
    hours: "Last few hours",
    text: "Open Progress > Stats > 100% Completion and clear the last checklist lines, then the platinum pops.",
    trophyIds: [14, 1],
  },
];

let allTrophies = [];
let earnedIds = new Set();
let spoilerOn = true;
let currentView = "checklist";
let openGuideId = null;

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) earnedIds = new Set(saved.earned);
    if (typeof saved.spoiler === "boolean") spoilerOn = saved.spoiler;
  } catch (e) { /* corrupt save: start fresh */ }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      earned: Array.from(earnedIds).sort((a, b) => a - b),
      spoiler: spoilerOn,
    }));
  } catch (e) { /* storage unavailable: keep going in memory */ }
}

function trophyById(id) {
  return allTrophies.find((t) => t.id === id);
}

function isHiddenBySpoiler(trophy) {
  return spoilerOn && trophy.kind === "story" && !earnedIds.has(trophy.id);
}

function roadmapOrder(trophy) {
  const phase = ROADMAP_PHASES.find((p) => p.trophyIds.indexOf(trophy.id) >= 0);
  return (phase ? phase.id : 9) * 1000 + trophy.id;
}

function renderProgress() {
  const total = allTrophies.length;
  const earned = earnedIds.size;
  const big = document.getElementById("progressBig");
  big.textContent = earned + " / " + total + " earned";
  const fill = document.getElementById("progressFill");
  fill.style.width = total ? Math.round((earned / total) * 100) + "%" : "0%";
  const counts = document.getElementById("gradeCounts");
  counts.innerHTML = "";
  ["platinum", "gold", "silver", "bronze"].forEach((grade) => {
    const inGrade = allTrophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earnedIds.has(t.id)).length;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = "";
    const b = document.createElement("b");
    b.textContent = got + "/" + inGrade.length;
    chip.appendChild(b);
    chip.appendChild(document.createTextNode(" " + grade));
    counts.appendChild(chip);
  });
}

function renderNextUp() {
  const text = document.getElementById("nextUpText");
  const candidates = allTrophies
    .filter((t) => !earnedIds.has(t.id) && !isHiddenBySpoiler(t))
    .sort((a, b) => roadmapOrder(a) - roadmapOrder(b));
  if (!candidates.length) {
    text.textContent = "All 55 earned — Leonida Legend. The platinum is yours.";
    return;
  }
  const next = candidates[0];
  text.innerHTML = "";
  const strong = document.createElement("strong");
  strong.textContent = "#" + next.id + " " + next.name;
  text.appendChild(strong);
  const small = document.createElement("small");
  small.textContent = next.description + " — " + next.grade + " · " + next.kind;
  text.appendChild(small);
}

function trophyCard(trophy) {
  const earned = earnedIds.has(trophy.id);
  const hidden = isHiddenBySpoiler(trophy);
  const card = document.createElement("article");
  card.className = "trophy" + (earned ? " earned" : "");
  card.id = "trophy-" + trophy.id;

  const head = document.createElement("div");
  head.className = "trophy-head";
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = earned;
  box.setAttribute("aria-label", "Mark trophy " + trophy.id + " as earned");
  box.addEventListener("change", () => {
    if (box.checked) earnedIds.add(trophy.id); else earnedIds.delete(trophy.id);
    saveProgress();
    renderAll();
  });
  head.appendChild(box);

  const names = document.createElement("div");
  names.className = "names";
  const title = document.createElement("h3");
  const num = document.createElement("span");
  num.className = "num";
  num.textContent = "#" + trophy.id + " ";
  title.appendChild(num);
  title.appendChild(document.createTextNode(hidden ? "Hidden story trophy" : trophy.name));
  names.appendChild(title);
  const desc = document.createElement("p");
  desc.className = "desc";
  desc.textContent = hidden
    ? "Hidden until earned — turn spoilers off, or earn it, to reveal the name and description."
    : trophy.description;
  names.appendChild(desc);

  const badges = document.createElement("div");
  badges.className = "badges";
  const gradeBadge = document.createElement("span");
  gradeBadge.className = "badge " + trophy.grade;
  gradeBadge.textContent = trophy.grade;
  badges.appendChild(gradeBadge);
  const kindBadge = document.createElement("span");
  kindBadge.className = "badge kind-" + trophy.kind;
  kindBadge.textContent = trophy.kind;
  badges.appendChild(kindBadge);
  if (trophy.missable) {
    const miss = document.createElement("span");
    miss.className = "badge missable";
    miss.textContent = "Missable";
    badges.appendChild(miss);
  }
  if (trophy.checkBefore) {
    const check = document.createElement("span");
    check.className = "badge check";
    check.textContent = "Check before advancing";
    badges.appendChild(check);
  }
  names.appendChild(badges);
  head.appendChild(names);
  card.appendChild(head);

  if (!hidden) {
    const toggle = document.createElement("button");
    toggle.className = "guide-toggle";
    toggle.textContent = openGuideId === trophy.id ? "Hide guide" : "Show guide & sources";
    toggle.addEventListener("click", () => {
      openGuideId = openGuideId === trophy.id ? null : trophy.id;
      renderChecklist();
    });
    card.appendChild(toggle);
    if (openGuideId === trophy.id) {
      const body = document.createElement("div");
      body.className = "guide-body";
      const guide = document.createElement("p");
      guide.textContent = trophy.guide;
      body.appendChild(guide);
      if (trophy.checkBefore) {
        const warn = document.createElement("p");
        warn.className = "warn";
        warn.textContent = "Check before advancing: " + trophy.checkBefore;
        body.appendChild(warn);
      }
      const sources = document.createElement("p");
      sources.className = "sources";
      sources.appendChild(document.createTextNode("Sources: "));
      (trophy.sources || []).forEach((s) => {
        const link = document.createElement("a");
        link.href = s.url;
        link.textContent = s.name;
        link.target = "_blank";
        link.rel = "noopener";
        sources.appendChild(link);
      });
      body.appendChild(sources);
      card.appendChild(body);
    }
  }
  return card;
}

function applyFilters(list) {
  const query = document.getElementById("searchBox").value.trim().toLowerCase();
  const grade = document.getElementById("gradeFilter").value;
  const kind = document.getElementById("kindFilter").value;
  const earned = document.getElementById("earnedFilter").value;
  return list.filter((t) => {
    if (grade && t.grade !== grade) return false;
    if (kind && t.kind !== kind) return false;
    if (earned === "earned" && !earnedIds.has(t.id)) return false;
    if (earned === "unearned" && earnedIds.has(t.id)) return false;
    if (query) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (hay.indexOf(query) < 0) return false;
    }
    return true;
  });
}

function renderChecklist() {
  const list = document.getElementById("trophyList");
  list.innerHTML = "";
  const shown = applyFilters(allTrophies);
  if (!shown.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No trophies match these filters.";
    list.appendChild(empty);
    return;
  }
  shown.forEach((t) => list.appendChild(trophyCard(t)));
}

function renderRoadmap() {
  const list = document.getElementById("phaseList");
  list.innerHTML = "";
  ROADMAP_PHASES.forEach((phase) => {
    const box = document.createElement("div");
    box.className = "phase";
    const title = document.createElement("h3");
    const span = document.createElement("span");
    span.textContent = phase.title;
    title.appendChild(span);
    title.appendChild(document.createTextNode(" · " + phase.hours));
    box.appendChild(title);
    const text = document.createElement("p");
    text.textContent = phase.text;
    box.appendChild(text);
    const ul = document.createElement("ul");
    phase.trophyIds.forEach((id) => {
      const t = trophyById(id);
      if (!t) return;
      const li = document.createElement("li");
      const done = earnedIds.has(id);
      const label = isHiddenBySpoiler(t) ? "Hidden story trophy" : t.name;
      li.textContent = (done ? "✓ " : "○ ") + "#" + id + " " + label + " (" + t.grade + ")";
      ul.appendChild(li);
    });
    box.appendChild(ul);
    list.appendChild(box);
  });
}

function renderMissables() {
  const miss = document.getElementById("missList");
  miss.innerHTML = "";
  allTrophies.filter((t) => t.missable).forEach((t) => {
    const li = document.createElement("li");
    const b = document.createElement("b");
    b.textContent = "#" + t.id + " " + t.name + " — " + t.grade;
    li.appendChild(b);
    const p = document.createElement("p");
    p.textContent = t.guide;
    li.appendChild(p);
    miss.appendChild(li);
  });
  const check = document.getElementById("checkList");
  check.innerHTML = "";
  allTrophies.filter((t) => t.checkBefore && !t.missable).forEach((t) => {
    const li = document.createElement("li");
    const b = document.createElement("b");
    b.textContent = "#" + t.id + " " + (isHiddenBySpoiler(t) ? "Hidden story trophy" : t.name);
    li.appendChild(b);
    const p = document.createElement("p");
    p.textContent = t.checkBefore;
    li.appendChild(p);
    check.appendChild(li);
  });
}

function showView(view) {
  currentView = view;
  document.querySelectorAll("nav.tabs button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  ["checklist", "roadmap", "missables"].forEach((v) => {
    document.getElementById("view-" + v).hidden = v !== view;
  });
  document.getElementById("toolbar").style.display = view === "checklist" ? "" : "none";
}

function renderAll() {
  renderProgress();
  renderNextUp();
  renderChecklist();
  renderRoadmap();
  renderMissables();
}

function exportProgress() {
  const payload = JSON.stringify({
    guide: "Leonida Field Guide",
    exportedAt: new Date().toISOString(),
    earned: Array.from(earnedIds).sort((a, b) => a - b),
    spoiler: spoilerOn,
  }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leonida-field-guide-progress.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (Array.isArray(data.earned)) {
        earnedIds = new Set(data.earned.filter((id) => trophyById(id)));
        if (typeof data.spoiler === "boolean") spoilerOn = data.spoiler;
        document.getElementById("spoilerToggle").checked = spoilerOn;
        saveProgress();
        renderAll();
      }
    } catch (e) { /* invalid file: ignore */ }
  };
  reader.readAsText(file);
}

function parseDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  const earnedParam = params.get("earned");
  if (earnedParam) {
    earnedParam.split(",").forEach((part) => {
      const id = Number(part.trim());
      if (id >= 1 && id <= 55) earnedIds.add(id);
    });
    saveProgress();
  }
  const kind = params.get("kind");
  if (kind) {
    const select = document.getElementById("kindFilter");
    if (Array.from(select.options).some((o) => o.value === kind)) select.value = kind;
  }
  const view = params.get("view");
  if (view === "roadmap" || view === "missables") showView(view);
  const trophyParam = params.get("trophy");
  if (trophyParam) {
    const id = Number(trophyParam);
    if (id >= 1 && id <= 55) {
      openGuideId = id;
      showView("checklist");
      setTimeout(() => {
        const el = document.getElementById("trophy-" + id);
        if (el) el.scrollIntoView({ block: "start" });
      }, 100);
    }
  }
}

function wireControls() {
  document.querySelectorAll("nav.tabs button").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });
  ["searchBox", "gradeFilter", "kindFilter", "earnedFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderChecklist);
    document.getElementById(id).addEventListener("change", renderChecklist);
  });
  const spoiler = document.getElementById("spoilerToggle");
  spoiler.checked = spoilerOn;
  spoiler.addEventListener("change", () => {
    spoilerOn = spoiler.checked;
    saveProgress();
    renderAll();
  });
  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (event) => {
    importProgress(event.target.files[0]);
    event.target.value = "";
  });
}

function loadTrophies() {
  return fetch(DATA_URL)
    .then((response) => response.json())
    .then((data) => {
      allTrophies = data.trophies || data;
    });
}

loadProgress();
wireControls();
loadTrophies().then(() => {
  parseDeepLinks();
  renderAll();
});
