const state = { characters: [], query: "", rarity: "all", path: "all", ascending: true, lang: localStorage.getItem("language") || "zh-Hant" };

const copy = {
  "zh-Hant": { title: "角色 ID 查詢", lede: "搜尋角色 ID、English name、中文名稱或命途。", placeholder: "例如：1502、Yao Guang、爻光、歡愉", all: "全部", fiveStars: "5 星", fourStars: "4 星", pathLabel: "命途", allPaths: "全部命途", traditionalChinese: "中文", rarity: "星級", ascending: "ID 由小到大 ↓", descending: "ID 由大到小 ↑", role: "角色", matching: "符合", noResults: "找不到符合的角色", tryAnother: "請更換 ID 或名稱關鍵字。", source: "資料來源：StarRailRes", loadError: "角色資料載入失敗", unavailable: "無法載入" },
  en: { title: "Character ID Lookup", lede: "Search by character ID, English name, Chinese name, or Path.", placeholder: "Example: 1502, Yao Guang, 爻光, Elation", all: "All", fiveStars: "5-Star", fourStars: "4-Star", pathLabel: "Path", allPaths: "All Paths", traditionalChinese: "Chinese", rarity: "Rarity", ascending: "ID: Low to High ↓", descending: "ID: High to Low ↑", role: "characters", matching: "Matching", noResults: "No matching characters", tryAnother: "Try another ID or name.", source: "Data source: StarRailRes", loadError: "Failed to load character data", unavailable: "Unavailable" }
};

const pathNames = { "毀滅": "Destruction", "巡獵": "The Hunt", "智識": "Erudition", "同諧": "Harmony", "虛無": "Nihility", "存護": "Preservation", "豐饒": "Abundance", "記憶": "Remembrance", "歡愉": "Elation" };
const pathIcons = { "毀滅": "Destruction", "巡獵": "Hunt", "智識": "Erudition", "同諧": "Harmony", "虛無": "Nihility", "存護": "Preservation", "豐饒": "Abundance", "記憶": "Remembrance", "歡愉": "Elation" };
let iconSources = {};

const searchInput = document.querySelector("#searchInput");
const rows = document.querySelector("#characterRows");
const count = document.querySelector("#resultCount");
const statusText = document.querySelector("#statusText");
const emptyState = document.querySelector("#emptyState");
const sortButton = document.querySelector("#sortButton");
const pathFilter = document.querySelector("#pathFilter");
const filterButtons = [...document.querySelectorAll(".filter")];
const languageButtons = [...document.querySelectorAll(".language-option")];
const dropdowns = new Map();

function enhanceDropdown(select) {
  const container = select.parentElement;
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "dropdown-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const menu = document.createElement("div");
  menu.id = `${select.id}-menu`;
  menu.className = "dropdown-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  trigger.setAttribute("aria-controls", menu.id);
  container.append(trigger, menu);
  select.hidden = true;
  const close = () => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); };
  const sync = () => {
    trigger.textContent = select.selectedOptions[0]?.textContent || "";
    trigger.setAttribute("aria-label", `${select.getAttribute("aria-label")}: ${trigger.textContent}`);
    menu.setAttribute("aria-label", select.getAttribute("aria-label"));
    menu.replaceChildren(...[...select.options].map(option => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "dropdown-option";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.value === select.value));
      const label = document.createElement("span");
      label.className = "dropdown-label";
      if (option.value !== "all" && pathIcons[option.value]) {
        const icon = document.createElement("span");
        icon.className = "symbol dropdown-symbol";
        icon.setAttribute("aria-hidden", "true");
        const source = iconSources[`path/${pathIcons[option.value]}`];
        icon.style.maskImage = `url("${source}")`;
        icon.style.webkitMaskImage = `url("${source}")`;
        label.append(icon);
      }
      label.append(document.createTextNode(option.textContent));
      item.append(label);
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        close();
        trigger.focus();
      });
      return item;
    }));
  };
  const open = () => {
    dropdowns.forEach(dropdown => dropdown.close());
    sync();
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    menu.querySelector('[aria-selected="true"]')?.focus();
  };
  trigger.addEventListener("click", () => menu.hidden ? open() : close());
  trigger.addEventListener("keydown", event => {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); open(); }
  });
  menu.addEventListener("keydown", event => {
    const items = [...menu.children];
    const index = items.indexOf(document.activeElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next].focus();
    }
    if (event.key === "Escape") { event.preventDefault(); close(); trigger.focus(); }
    if (event.key === "Tab") close();
  });
  container.addEventListener("focusout", event => { if (!container.contains(event.relatedTarget)) close(); });
  document.addEventListener("click", event => { if (!container.contains(event.target)) close(); });
  select.addEventListener("change", sync);
  dropdowns.set(select, { sync, close });
  sync();
}

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
  dropdowns.forEach(dropdown => { dropdown.close(); dropdown.sync(); });
}

function normalized(value) {
  return String(value).normalize("NFKC").toLocaleLowerCase("zh-Hant").trim();
}

function visibleCharacters() {
  const query = normalized(state.query);
  return state.characters
    .filter((character) => state.rarity === "all" || String(character.rarity) === state.rarity)
    .filter((character) => state.path === "all" || character.path === state.path)
    .filter((character) => !query || [character.id, character.english, character.chinese, character.path, pathNames[character.path]].some((value) => value != null && normalized(value).includes(query)))
    .sort((a, b) => state.ascending ? Number(a.id) - Number(b.id) : Number(b.id) - Number(a.id));
}

function render() {
  const visible = visibleCharacters();
  rows.replaceChildren(...visible.map((character) => {
    const row = document.createElement("tr");
    const cells = [
      ["id", character.id],
      ["zh", character.chinese],
      ["en", character.english],
      ["path", labelPath(character.path)],
      ["stars", "★".repeat(character.rarity)],
    ];
    cells.forEach(([className, value]) => {
      const cell = document.createElement("td");
      cell.className = className;
      cell.textContent = value;
      if (className === "path") {
        const badge = document.createElement("span");
        badge.className = "icon-label";
        const icon = document.createElement("img");
        const iconName = pathIcons[character.path];
        icon.src = iconSources[`${className}/${iconName}`];
        icon.alt = "";
        icon.width = 18;
        icon.height = 18;
        icon.addEventListener("error", () => { icon.hidden = true; }, { once: true });
        const symbol = document.createElement("span");
        symbol.className = "symbol";
        symbol.setAttribute("aria-hidden", "true");
        symbol.style.maskImage = `url("${icon.src}")`;
        symbol.style.webkitMaskImage = `url("${icon.src}")`;
        symbol.append(icon);
        badge.append(symbol, document.createTextNode(value));
        cell.replaceChildren(badge);
      }
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

Promise.all(["characters.json", "path-icons.json"].map(async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return response.json();
}))
  .then(([characters, ...iconSets]) => {
    iconSources = Object.assign({}, ...iconSets);
    state.characters = characters;
    const pathOrder = ["毀滅", "巡獵", "智識", "同諧", "虛無", "存護", "豐饒", "記憶", "歡愉"];
    const availablePaths = new Set(characters.map((character) => character.path));
    pathFilter.append(...pathOrder.filter((path) => availablePaths.has(path)).map((path) => {
      const option = document.createElement("option");
      option.value = path;
      option.textContent = path;
      return option;
    }));
    enhanceDropdown(pathFilter);
    applyLanguage();
    render();
  })
  .catch(() => { count.textContent = copy[state.lang].unavailable; statusText.textContent = copy[state.lang].loadError; });

applyLanguage();
