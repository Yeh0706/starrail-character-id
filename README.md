# StarRail Character ID

## [開啟網站 / Open Website](https://yeh0706.github.io/starrail-character-id/)

中文說明如下；[English documentation](#english) is available below.

可搜尋的《崩壞：星穹鐵道》角色 ID、中英文名稱、命途與星級對照表。

## 功能

- 依角色 ID、英文名、中文名或命途即時搜尋
- 中文／English 介面切換，記住語言偏好
- 4 星／5 星篩選
- 九種命途篩選，附白色圖示的深色下拉選單
- 表格以小圖示與名稱顯示命途
- ID 升冪與降冪排序
- 響應式版面，支援手機與桌面瀏覽器
- `Ctrl+K`／`⌘K` 聚焦搜尋；搜尋框內按 `Esc` 清除關鍵字

## 使用方式

開啟上方網站即可使用，無須安裝或登入。輸入關鍵字，搭配星級與命途篩選；點擊排序按鈕可切換 ID 順序。手機上可左右滑動表格查看完整欄位。

## 更新資料

編輯 `characters.json`，加入或修改角色後提交；GitHub Pages 會使用最新版資料。

每筆角色資料包含 `id`、`english`、`chinese`、`rarity`（4 或 5）與 `path`（中文命途名稱）。命途圖示儲存在 `path-icons.json`。本網站使用靜態資料快照，不會自動同步上游更新。

資料來源：[Mar-7th/StarRailRes](https://github.com/Mar-7th/StarRailRes)。本專案為非官方社群工具。

遊戲相關圖像與素材之權利屬於 HoYoverse；使用上游資料與素材時，請遵循其授權條款。

## English

### [Open Website](https://yeh0706.github.io/starrail-character-id/)

A searchable Honkai: Star Rail character table with IDs, English and Chinese names, Paths, and rarities.

### Features

- Instant search by character ID, English name, Chinese name, or Path
- Chinese / English interface with a saved language preference
- 4-Star / 5-Star filters
- Nine Path filters in a dark dropdown with white icons
- Compact Path icons and labels in the table
- Ascending and descending ID sorting
- Responsive layout for desktop and mobile browsers
- `Ctrl+K` / `⌘K` to focus search; `Esc` in the search box to clear it

### Usage

Open the website above. No installation or login is required. Enter a keyword, combine rarity and Path filters, and use the sort button to change the ID order. On mobile, swipe the table horizontally to see all columns.

### Updating the data

Edit `characters.json` and commit your changes to update the GitHub Pages site. Each character uses `id`, `english`, `chinese`, `rarity` (4 or 5), and `path` (Chinese Path name). Path icons are stored in `path-icons.json`.

The website uses a static data snapshot and does not automatically sync upstream updates.

### Credits

Character data and icons: [Mar-7th/StarRailRes](https://github.com/Mar-7th/StarRailRes). This is an unofficial community tool. Game-related images and assets belong to HoYoverse. Please follow the upstream license terms when reusing data or assets.
