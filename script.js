const POINT_SCALE = { 1: 10, 2: 7, 3: 5, 4: 3, 5: 1 };

const HUNTER_LEVELS = [
  { level: "Leadline", minAge: "3+", statMin: "—", height: "Walk only", moveUp: "Open entry", notes: "Entry level. Walk only." },
  { level: "Crossrails Hunter", minAge: "3+", statMin: "5", height: "2' / 61cm", moveUp: "Open entry", notes: "Entry over-fences. No qualifications." },
  { level: "Starter Hunter / 2'6\"", minAge: "3+", statMin: "15", height: "2'6\" / 76cm", moveUp: "20 top-3 placings at Crossrails", notes: "" },
  { level: "Schooling Hunter / 2'9\"", minAge: "3+", statMin: "22", height: "2'9\" / 84cm", moveUp: "20 top-3 placings at Starter", notes: "" },
  { level: "Children's / Adult Hunter / 3'", minAge: "4+", statMin: "30", height: "2'12\" / 91cm", moveUp: "20 top-3 placings at Schooling", notes: "Max starting level." },
  { level: "Low Hunter / 3'3\" Qual. Only", minAge: "4+", statMin: "38", height: "3'3\" / 99cm", moveUp: "20 top-3 placings at Children's / Adult", notes: "" },
  { level: "Junior / Amateur-Owner Hunter / 3'6\" Qual. Only", minAge: "5+", statMin: "48", height: "3'6\" / 107cm", moveUp: "20 top-3 placings at Low Hunter", notes: "" },
  { level: "Performance Hunter / 3'9\" Qual. Only", minAge: "5+", statMin: "58", height: "3'9\" / 114cm", moveUp: "20 top-3 placings at Junior / Amateur", notes: "" },
  { level: "Open Hunter / 4' Qual. Only", minAge: "6+", statMin: "68", height: "4' / 122cm", moveUp: "20 top-3 placings at Performance", notes: "" },
  { level: "Regular / Conformation Hunter / 4' Qual. Only", minAge: "6+", statMin: "72", height: "4' / 122cm", moveUp: "20 top-3 placings at Open Hunter", notes: "Top national hunter divisions." }
];

const JUMPER_LEVELS = [
  { level: "Crossrails / 2'", minAge: "3+", statMin: "—", height: "2' / 61cm", moveUp: "Open entry", nextRequirement: 50, notes: "Open entry" },
  { level: "2'6\" / 0.76m", minAge: "3+", statMin: "15", height: "2'6\" / 76cm", moveUp: "50 pts from Crossrails", nextRequirement: 50, notes: "" },
  { level: "3' / 0.90m", minAge: "4+", statMin: "25", height: "2'11\" / 90cm", moveUp: "50 pts from 2'6\"", nextRequirement: 70, notes: "" },
  { level: "3'3\" / 1.0m", minAge: "4+", statMin: "32", height: "3'3\" / 100cm", moveUp: "70 pts from 3'", nextRequirement: 70, notes: "" },
  { level: "3'6\" / 1.10m", minAge: "5+", statMin: "40", height: "3'7\" / 110cm", moveUp: "70 pts from 3'3\"", nextRequirement: 70, notes: "Max starting level." },
  { level: "3'9\" / 1.15m Qual. Only", minAge: "5+", statMin: "40", height: "3'9\" / 115cm", moveUp: "70 pts from 3'6\"", nextRequirement: 70, notes: "" },
  { level: "3'11\" / 1.20m Qual. Only", minAge: "5+", statMin: "48", height: "3'11\" / 120cm", moveUp: "70 pts from 3'9\"", nextRequirement: 80, notes: "" },
  { level: "4' / 1.25m Qual. Only", minAge: "6+", statMin: "54", height: "4'1\" / 125cm", moveUp: "80 pts from 3'11\"", nextRequirement: 80, notes: "" },
  { level: "4'3\" / 1.30m Qual. Only", minAge: "6+", statMin: "60", height: "4'3\" / 130cm", moveUp: "80 pts from 4'", nextRequirement: 80, notes: "" },
  { level: "4'6\" / 1.40m Qual. Only", minAge: "7+", statMin: "68", height: "4'7\" / 140cm", moveUp: "80 pts from 4'3\"", nextRequirement: 80, notes: "" },
  { level: "4'9\" / 1.50m Qual. Only", minAge: "7+", statMin: "76", height: "4'11\" / 150cm", moveUp: "80 pts from 4'6\"", nextRequirement: 15, notes: "" },
  { level: "Grand Prix / 1.60m+ Qual. Only", minAge: "8+", statMin: "84", height: "5'3\" / 160cm", moveUp: "15 pts from 4'9\"", nextRequirement: null, notes: "Top national level." }
];

const HUNTER_ADVANCEMENT_REQUIREMENT = 20;

function csvParse(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(current.trim());
      if (row.some(cell => cell !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current || row.length) {
    row.push(current.trim());
    if (row.some(cell => cell !== "")) rows.push(row);
  }
  return rows;
}

function toNumber(value) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getField(row, ...names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== "") return row[name];
    const foundKey = Object.keys(row).find(key => key.trim().toLowerCase() === String(name).trim().toLowerCase());
    if (foundKey && row[foundKey] !== "") return row[foundKey];
  }
  return "";
}

function normalizeDiscipline(value) {
  const raw = String(value || "").trim();
  if (/hunter/i.test(raw)) return "Hunter";
  if (/jumper|jumping/i.test(raw)) return "Jumper";
  return raw;
}

function parsePlace(value) {
  const raw = String(value || "").trim();
  if (!raw || /^(dnf|scr|wd|elim|eliminated|retired|n\/a)$/i.test(raw)) return 0;
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function normalizeRow(row) {
  // Supports the current Topline export format:
  // Species, Show, Date, Class, Discipline, Level Key, Level, Place, Score, Animal, Breed, Stable, Owner
  // Also keeps backward compatibility with the first hand-made CSV format.
  const placing = parsePlace(getField(row, "Place", "placing", "place"));
  const discipline = normalizeDiscipline(getField(row, "Discipline", "discipline"));
  const leaderboardPoints = toNumber(getField(row, "leaderboard_points", "Leaderboard Points")) || POINT_SCALE[placing] || 0;
  const exportedTopThree = getField(row, "top_three", "Top Three");
  const exportedQualification = getField(row, "qualification_points", "Qualification Points");

  return {
    species: getField(row, "Species", "species"),
    date: getField(row, "Date", "date"),
    show: getField(row, "Show", "show"),
    discipline,
    level_key: getField(row, "Level Key", "level_key", "levelKey"),
    level: getField(row, "Level", "level") || getField(row, "Level Key", "level_key", "levelKey"),
    class_name: getField(row, "Class", "class_name", "Class Name"),
    placing,
    score: getField(row, "Score", "score"),
    horse: getField(row, "Animal", "animal", "Horse", "horse"),
    breed: getField(row, "Breed", "breed"),
    owner: getField(row, "Owner", "owner"),
    stable: getField(row, "Stable", "stable"),
    leaderboard_points: leaderboardPoints,
    qualification_points: exportedQualification !== "" ? toNumber(exportedQualification) : (discipline === "Jumper" ? leaderboardPoints : 0),
    top_three: exportedTopThree !== "" ? toNumber(exportedTopThree) : (discipline === "Hunter" && placing >= 1 && placing <= 3 ? 1 : 0)
  };
}

async function loadResults() {
  try {
    const response = await fetch("results.csv", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load results.csv");
    const text = await response.text();
    const parsed = csvParse(text);
    const headers = parsed.shift().map(header => header.trim());
    return parsed
      .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])))
      .map(normalizeRow)
      .filter(row => row.horse && (!row.species || /horse|equine/i.test(row.species)));
  } catch (error) {
    console.error(error);
    return [];
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function sum(values) {
  return values.reduce((total, value) => total + toNumber(value), 0);
}

function groupRows(rows, keyFn) {
  const map = new Map();
  rows.forEach(row => {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  });
  return map;
}

function horseStandings(rows) {
  const grouped = groupRows(rows, row => row.horse);
  return [...grouped.entries()].map(([horse, horseRows]) => {
    const hunterPoints = sum(horseRows.filter(r => r.discipline === "Hunter").map(r => r.leaderboard_points));
    const jumperPoints = sum(horseRows.filter(r => r.discipline === "Jumper").map(r => r.leaderboard_points));
    return {
      horse,
      owner: mostCommon(horseRows.map(r => r.owner)),
      stable: mostCommon(horseRows.map(r => r.stable)),
      level: mostCommon(horseRows.map(r => r.level)),
      points: hunterPoints + jumperPoints,
      hunterPoints,
      jumperPoints,
      classes: horseRows.length
    };
  }).filter(row => row.horse).sort(rankSort);
}

function stableStandings(rows) {
  const grouped = groupRows(rows, row => `${row.stable}|||${row.owner}`);
  return [...grouped.entries()].map(([key, stableRows]) => {
    const [stable, owner] = key.split("|||");
    return {
      stable,
      owner,
      horses: unique(stableRows.map(r => r.horse)).length,
      hunterPoints: sum(stableRows.filter(r => r.discipline === "Hunter").map(r => r.leaderboard_points)),
      jumperPoints: sum(stableRows.filter(r => r.discipline === "Jumper").map(r => r.leaderboard_points)),
      points: sum(stableRows.map(r => r.leaderboard_points)),
      classes: stableRows.length
    };
  }).filter(row => row.stable || row.owner).sort(rankSort);
}

function mostCommon(values) {
  const counts = new Map();
  values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
}

function rankSort(a, b) {
  return b.points - a.points || String(a.horse || a.stable || a.owner).localeCompare(String(b.horse || b.stable || b.owner));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function rankRows(rows) {
  let lastPoints = null;
  let rank = 0;
  return rows.map((row, index) => {
    if (row.points !== lastPoints) rank = index + 1;
    lastPoints = row.points;
    return { ...row, rank };
  });
}

function renderTable(selector, headers, rows, rowRenderer) {
  const table = document.querySelector(selector);
  if (!table) return;
  const head = `<thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>`;
  const body = rows.length
    ? `<tbody>${rows.map(rowRenderer).join("")}</tbody>`
    : `<tbody><tr><td colspan="${headers.length}"><div class="empty-state">No matching results yet.</div></td></tr></tbody>`;
  table.innerHTML = head + body;
}

function renderHorseTable(selector, rows) {
  const ranked = rankRows(rows);
  renderTable(selector, ["Rank", "Horse", "Owner", "Stable", "Level / Division", "Points", "Hunter", "Jumper", "Classes"], ranked, row => `
    <tr>
      <td class="rank">${row.rank}</td>
      <td><strong>${escapeHtml(row.horse)}</strong></td>
      <td>${escapeHtml(row.owner)}</td>
      <td>${escapeHtml(row.stable)}</td>
      <td><span class="badge">${escapeHtml(row.level)}</span></td>
      <td><strong>${row.points}</strong></td>
      <td>${row.hunterPoints}</td>
      <td>${row.jumperPoints}</td>
      <td>${row.classes}</td>
    </tr>`);
}

function renderStableTable(selector, rows) {
  const ranked = rankRows(rows);
  renderTable(selector, ["Rank", "Stable", "Owner", "Horses", "Points", "Hunter", "Jumper", "Classes"], ranked, row => `
    <tr>
      <td class="rank">${row.rank}</td>
      <td><strong>${escapeHtml(row.stable)}</strong></td>
      <td>${escapeHtml(row.owner)}</td>
      <td>${row.horses}</td>
      <td><strong>${row.points}</strong></td>
      <td>${row.hunterPoints}</td>
      <td>${row.jumperPoints}</td>
      <td>${row.classes}</td>
    </tr>`);
}

function isGreenHunter(row) {
  return row.discipline === "Hunter" && /green hunter/i.test(row.level);
}

function isYoungJumper(row) {
  return row.discipline === "Jumper" && /(5-Year-Old|6-Year-Old|7-Year-Old|Young Horse)/i.test(row.level);
}

function nextHunterLevel(currentLevel) {
  const index = HUNTER_LEVELS.findIndex(item => item.level === currentLevel);
  return index >= 0 && index < HUNTER_LEVELS.length - 1 ? HUNTER_LEVELS[index + 1].level : null;
}

function nextJumperLevel(currentLevel) {
  const index = JUMPER_LEVELS.findIndex(item => item.level === currentLevel);
  return index >= 0 && index < JUMPER_LEVELS.length - 1 ? JUMPER_LEVELS[index + 1].level : null;
}

function moveUpRows(rows) {
  const grouped = groupRows(rows, row => `${row.horse}|||${row.discipline}|||${row.level}`);
  return [...grouped.entries()].map(([key, group]) => {
    const [horse, discipline, level] = key.split("|||");
    const owner = mostCommon(group.map(r => r.owner));
    const stable = mostCommon(group.map(r => r.stable));
    if (discipline === "Hunter") {
      const count = sum(group.map(r => r.top_three));
      const next = nextHunterLevel(level);
      const needed = Math.max(HUNTER_ADVANCEMENT_REQUIREMENT - count, 0);
      return { horse, discipline, level, owner, stable, earned: count, required: next ? HUNTER_ADVANCEMENT_REQUIREMENT : null, next, status: next ? (needed === 0 ? `Qualified for ${next}` : `${needed} top-3 placing${needed === 1 ? "" : "s"} needed`) : "Top level / no next level" };
    }
    if (discipline === "Jumper") {
      const earned = sum(group.map(r => r.qualification_points));
      const config = JUMPER_LEVELS.find(item => item.level === level);
      const required = config?.nextRequirement ?? null;
      const next = nextJumperLevel(level);
      const needed = required == null ? 0 : Math.max(required - earned, 0);
      return { horse, discipline, level, owner, stable, earned, required, next, status: required == null ? "Top level / no next level" : needed === 0 ? `Qualified for ${next}` : `${needed} qualification point${needed === 1 ? "" : "s"} needed` };
    }
    return null;
  }).filter(Boolean).sort((a, b) => a.discipline.localeCompare(b.discipline) || a.horse.localeCompare(b.horse));
}

function renderMoveUpTable(selector, rows) {
  renderTable(selector, ["Horse", "Discipline", "Current Level", "Owner", "Stable", "Earned", "Required", "Status"], rows, row => `
    <tr>
      <td><strong>${escapeHtml(row.horse)}</strong></td>
      <td>${escapeHtml(row.discipline)}</td>
      <td><span class="badge">${escapeHtml(row.level)}</span></td>
      <td>${escapeHtml(row.owner)}</td>
      <td>${escapeHtml(row.stable)}</td>
      <td>${row.earned}</td>
      <td>${row.required ?? "—"}</td>
      <td>${escapeHtml(row.status)}</td>
    </tr>`);
}

function setupTabs() {
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach(item => item.classList.toggle("active", item.dataset.tab === tab));
      document.querySelectorAll("[data-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab));
    });
  });
}

function setupMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (!button || !nav) return;
  button.addEventListener("click", () => nav.classList.toggle("open"));
}

function populateSelect(select, options, placeholder = "All") {
  if (!select) return;
  select.innerHTML = `<option value="all">${escapeHtml(placeholder)}</option>` + options.map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
}

function renderResultsPage(rows) {
  const table = document.querySelector("[data-results-table]");
  if (!table) return;
  const filters = {
    discipline: document.querySelector('[data-filter="discipline"]'),
    level: document.querySelector('[data-filter="level"]'),
    show: document.querySelector('[data-filter="show"]')
  };
  populateSelect(filters.discipline, unique(rows.map(r => r.discipline)));
  populateSelect(filters.level, unique(rows.map(r => r.level)));
  populateSelect(filters.show, unique(rows.map(r => r.show)));

  function applyFilters() {
    const filtered = rows.filter(row =>
      (filters.discipline.value === "all" || row.discipline === filters.discipline.value) &&
      (filters.level.value === "all" || row.level === filters.level.value) &&
      (filters.show.value === "all" || row.show === filters.show.value)
    ).sort((a, b) => b.date.localeCompare(a.date) || a.show.localeCompare(b.show) || a.level.localeCompare(b.level) || a.placing - b.placing);
    document.querySelector("[data-result-count]").textContent = `${filtered.length} result row${filtered.length === 1 ? "" : "s"}`;
    renderTable('[data-results-table]', ["Date", "Show", "Discipline", "Level", "Class", "Place", "Score", "Horse", "Breed", "Owner", "Stable", "Pts"], filtered, row => `
      <tr><td>${escapeHtml(row.date)}</td><td>${escapeHtml(row.show)}</td><td>${escapeHtml(row.discipline)}</td><td>${escapeHtml(row.level)}</td><td>${escapeHtml(row.class_name)}</td><td>${row.placing || "—"}</td><td>${escapeHtml(row.score || "—")}</td><td><strong>${escapeHtml(row.horse)}</strong></td><td>${escapeHtml(row.breed || "—")}</td><td>${escapeHtml(row.owner)}</td><td>${escapeHtml(row.stable)}</td><td><strong>${row.leaderboard_points}</strong></td></tr>
    `);
  }
  Object.values(filters).forEach(select => select?.addEventListener("change", applyFilters));
  document.querySelector("[data-reset-filters]")?.addEventListener("click", () => {
    Object.values(filters).forEach(select => { if (select) select.value = "all"; });
    applyFilters();
  });
  applyFilters();
}

function renderStandingsPage(rows) {
  if (!document.querySelector("[data-table='overall']")) return;
  const overall = horseStandings(rows);
  const hunter = horseStandings(rows.filter(r => r.discipline === "Hunter"));
  const jumper = horseStandings(rows.filter(r => r.discipline === "Jumper"));
  const green = horseStandings(rows.filter(isGreenHunter));
  const young = horseStandings(rows.filter(isYoungJumper));

  renderHorseTable('[data-table="overall"]', overall);
  renderHorseTable('[data-table="hunters"]', hunter);
  renderHorseTable('[data-table="jumpers"]', jumper);
  renderHorseTable('[data-table="green"]', green);
  renderHorseTable('[data-table="young"]', young);
  renderStableTable('[data-table="stable"]', stableStandings(rows));
  renderMoveUpTable('[data-table="moveup"]', moveUpRows(rows));

  const levelSelect = document.querySelector("[data-level-standings]");
  const levels = unique(rows.map(r => r.level));
  populateSelect(levelSelect, levels, "Choose level");
  if (levelSelect && levels.length) levelSelect.value = levels[0];
  function renderDivision() {
    const selected = levelSelect?.value === "all" ? levels[0] : levelSelect?.value;
    renderHorseTable('[data-table="division"]', horseStandings(rows.filter(r => r.level === selected)));
  }
  levelSelect?.addEventListener("change", renderDivision);
  renderDivision();

  const summary = document.querySelector("[data-standings-summary]");
  if (summary) {
    const cards = summary.querySelectorAll("strong");
    const values = [sum(rows.map(r => r.leaderboard_points)), rows.filter(r => r.discipline === "Hunter").length, rows.filter(r => r.discipline === "Jumper").length, unique(rows.map(r => r.stable)).length];
    cards.forEach((card, index) => card.textContent = values[index]);
  }
}

function renderHomeStats(rows) {
  const stats = document.querySelector("[data-home-stats]");
  if (!stats) return;
  const values = [rows.length, unique(rows.map(r => r.horse)).length, unique(rows.map(r => r.stable)).length];
  stats.querySelectorAll("dd").forEach((dd, index) => dd.textContent = values[index]);
}

function renderProgramTables() {
  const hunterTable = document.querySelector('[data-program="hunters"]');
  if (hunterTable) {
    renderTable('[data-program="hunters"]', ["Level", "Min Age", "Stat Min", "Height", "To Move Up", "Notes"], HUNTER_LEVELS, row => `<tr><td><strong>${escapeHtml(row.level)}</strong><br><span class="muted">Over Fences 1 • Over Fences 2 • Under Saddle</span></td><td>${row.minAge}</td><td>${row.statMin}</td><td>${escapeHtml(row.height)}</td><td>${escapeHtml(row.moveUp)}</td><td>${escapeHtml(row.notes)}</td></tr>`);
  }
  const jumperTable = document.querySelector('[data-program="jumpers"]');
  if (jumperTable) {
    renderTable('[data-program="jumpers"]', ["Level", "Min Age", "Stat Min", "Height", "To Move Up", "Notes"], JUMPER_LEVELS, row => `<tr><td><strong>${escapeHtml(row.level)}</strong><br><span class="muted">Round 1 • Round 2 • Jump-Off</span></td><td>${row.minAge}</td><td>${row.statMin}</td><td>${escapeHtml(row.height)}</td><td>${escapeHtml(row.moveUp)}</td><td>${escapeHtml(row.notes)}</td></tr>`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupMenu();
  setupTabs();
  renderProgramTables();
  const rows = await loadResults();
  renderHomeStats(rows);
  renderResultsPage(rows);
  renderStandingsPage(rows);
});
