const state = { characters: [], query: "", rarity: "all", ascending: true };

const searchInput = document.querySelector("#searchInput");
const rows = document.querySelector("#characterRows");
const count = document.querySelector("#resultCount");
const statusText = document.querySelector("#statusText");
const emptyState = document.querySelector("#emptyState");
const sortButton = document.querySelector("#sortButton");
const filterButtons = [...document.querySelectorAll(".filter")];

function normalized(value) {
  return String(value).normalize("NFKC").toLocaleLowerCase("zh-Hant").trim();
}

function visibleCharacters() {
  const query = normalized(state.query);
  return state.characters
    .filter((character) => state.rarity === "all" || String(character.rarity) === state.rarity)
    .filter((character) => !query || [character.id, character.english, character.chinese].some((value) => normalized(value).includes(query)))
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
      ["stars", "★".repeat(character.rarity)],
    ];
    cells.forEach(([className, value]) => {
      const cell = document.createElement("td");
      cell.className = className;
      cell.textContent = value;
      if (className === "stars") cell.setAttribute("aria-label", `${character.rarity} 星`);
      row.append(cell);
    });
    return row;
  }));
  count.textContent = `${visible.length} / ${state.characters.length}`;
  statusText.textContent = state.query ? `符合「${state.query}」` : "角色";
  emptyState.hidden = visible.length !== 0;
}

searchInput.addEventListener("input", (event) => { state.query = event.target.value; render(); });
sortButton.addEventListener("click", () => {
  state.ascending = !state.ascending;
  sortButton.textContent = state.ascending ? "ID 由小到大 ↓" : "ID 由大到小 ↑";
  render();
});
filterButtons.forEach((button) => button.addEventListener("click", () => {
  state.rarity = button.dataset.rarity;
  filterButtons.forEach((item) => item.classList.toggle("active", item === button));
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
  .then((characters) => { state.characters = characters; render(); })
  .catch((error) => { count.textContent = "無法載入"; statusText.textContent = error.message; });
