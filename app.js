const state = { characters: [], query: "", rarity: "all", path: "all", ascending: true, lang: localStorage.getItem("language") || "zh-Hant" };

const copy = {
  "zh-Hant": { title: "角色 ID 查詢", lede: "搜尋角色 ID、English name、繁體中文名稱或命途。", placeholder: "例如：1502、Yao Guang、爻光、歡愉", all: "全部", fiveStars: "5 星", fourStars: "4 星", pathLabel: "命途", allPaths: "全部命途", traditionalChinese: "繁體中文", rarity: "星級", ascending: "ID 由小到大 ↓", descending: "ID 由大到小 ↑", role: "角色", matching: "符合", noResults: "找不到符合的角色", tryAnother: "請更換 ID 或名稱關鍵字。", source: "資料來源：StarRailRes", loadError: "角色資料載入失敗", unavailable: "無法載入" },
  en: { title: "Character ID Lookup", lede: "Search by character ID, English name, Traditional Chinese name, or Path.", placeholder: "Example: 1502, Yao Guang, 爻光, Elation", all: "All", fiveStars: "5-Star", fourStars: "4-Star", pathLabel: "Path", allPaths: "All Paths", traditionalChinese: "Traditional Chinese", rarity: "Rarity", ascending: "ID: Low to High ↓", descending: "ID: High to Low ↑", role: "characters", matching: "Matching", noResults: "No matching characters", tryAnother: "Try another ID or name.", source: "Data source: StarRailRes", loadError: "Failed to load character data", unavailable: "Unavailable" }
};

const pathNames = { "毀滅": "Destruction", "巡獵": "The Hunt", "智識": "Erudition", "同諧": "Harmony", "虛無": "Nihility", "存護": "Preservation", "豐饒": "Abundance", "記憶": "Remembrance", "歡愉": "Elation" };

const searchInput = document.querySelector("#searchInput");
const rows = document.querySelector("#characterRows");
const count = document.querySelector("#resultCount");
const statusText = document.querySelector("#statusText");
const emptyState = document.querySelector("#emptyState");
const sortButton = document.querySelector("#sortButton");
const pathFilter = document.querySelector("#pathFilter");
const filterButtons = [...document.querySelectorAll(".filter")];
const languageButtons = [...document.querySelectorAll(".language-option")];

function labelPath(path) {
  return state.lang === "en" ? pathNames[path] || path : path;
}

function applyLanguage() {
  const text = copy[state.lang];
  document.documentElement.lang = state.lang;
  document.title = state.lang === "en" ? "StarRail Character ID Lookup" : "StarRail Character ID";
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = text[element.dataset.i18n]; });
  searchInput.placeholder = text.placeholder;
  pathFilter.setAttribute("aria-label", state.lang === "en" ? "Path filter" : "命途篩選");
  sortButton.setAttribute("aria-label", state.lang === "en" ? "Change ID sorting" : "切換 ID 排序");
  sortButton.textContent = state.ascending ? text.ascending : text.descending;
  [...pathFilter.options].forEach((option) => { option.textContent = option.value === "all" ? text.allPaths : labelPath(option.value); });
  languageButtons.forEach((button) => button.classList.toggle("active", button.dataset.lang === state.lang));
}

function normalized(value) {
  return String(value).normalize("NFKC").toLocaleLowerCase("zh-Hant").trim();
}

function visibleCharacters() {
  const query = normalized(state.query);
  return state.characters
    .filter((character) => state.rarity === "all" || String(character.rarity) === state.rarity)
    .filter((character) => state.path === "all" || character.path === state.path)
    .filter((character) => !query || [character.id, character.english, character.chinese, character.path, pathNames[character.path]].some((value) => normalized(value).includes(query)))
    .sort((a, b) => state.ascending ? Number(a.id) - Number(b.id) : Number(b.id) - Number(a.id));
}

function render() {
  const visible = visibleCharacters();
  rows.replaceChildren(...visible.map((character) => {
    const row = document.createElement("tr");
    const cells = [
      ["id", character.id],
      ["en", character.english],
      ["zh", character.chinese],
      ["path", labelPath(character.path)],
      ["stars", "★".repeat(character.rarity)],
    ];
    cells.forEach(([className, value]) => {
      const cell = document.createElement("td");
      cell.className = className;
      cell.textContent = value;
      if (className === "stars") cell.setAttribute("aria-label", state.lang === "en" ? `${character.rarity}-Star` : `${character.rarity} 星`);
      row.append(cell);
    });
    return row;
  }));
  count.textContent = `${visible.length} / ${state.characters.length}`;
  statusText.textContent = state.query ? `${copy[state.lang].matching} “${state.query}”` : copy[state.lang].role;
  emptyState.hidden = visible.length !== 0;
}

searchInput.addEventListener("input", (event) => { state.query = event.target.value; render(); });
sortButton.addEventListener("click", () => {
  state.ascending = !state.ascending;
  sortButton.textContent = state.ascending ? copy[state.lang].ascending : copy[state.lang].descending;
  render();
});
filterButtons.forEach((button) => button.addEventListener("click", () => {
  state.rarity = button.dataset.rarity;
  filterButtons.forEach((item) => item.classList.toggle("active", item === button));
  render();
}));
pathFilter.addEventListener("change", (event) => { state.path = event.target.value; render(); });
languageButtons.forEach((button) => button.addEventListener("click", () => {
  state.lang = button.dataset.lang;
  localStorage.setItem("language", state.lang);
  applyLanguage();
  render();
}));
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault(); searchInput.focus();
  }
  if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = ""; state.query = ""; render();
  }
});

fetch("characters.json")
  .then((response) => { if (!response.ok) throw new Error("角色資料載入失敗"); return response.json(); })
  .then((characters) => {
    state.characters = characters;
    const pathOrder = ["毀滅", "巡獵", "智識", "同諧", "虛無", "存護", "豐饒", "記憶", "歡愉"];
    const availablePaths = new Set(characters.map((character) => character.path));
    pathFilter.append(...pathOrder.filter((path) => availablePaths.has(path)).map((path) => {
      const option = document.createElement("option");
      option.value = path;
      option.textContent = path;
      return option;
    }));
    applyLanguage();
    render();
  })
  .catch(() => { count.textContent = copy[state.lang].unavailable; statusText.textContent = copy[state.lang].loadError; });

applyLanguage();
