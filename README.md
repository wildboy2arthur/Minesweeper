# 網頁版踩地雷遊戲

這是一個使用HTML5、CSS3和JavaScript開發的網頁版踩地雷遊戲，支援桌面和手機設備。

## 遊戲特點

- 三種難度級別：初級(9x9, 10雷)、中級(16x16, 40雷)和高級(30x16, 99雷)
- 響應式設計，適配不同螢幕尺寸
- 支援滑鼠操作和觸控操作
- 計時系統和地雷計數
- 音效效果

## 如何遊玩

### 桌面設備

- 左鍵點擊：揭開格子
- 右鍵點擊：標記或取消標記地雷

### 手機設備

- 單指點擊：揭開格子
- 長按：標記或取消標記地雷

## 遊戲規則

1. 遊戲開始時，所有格子都是隱藏的
2. 點擊格子揭開它，如果是地雷則遊戲結束
3. 如果揭開的格子不是地雷，會顯示周圍8個格子中的地雷數量
4. 如果揭開的格子周圍沒有地雷，會自動揭開周圍的格子
5. 標記你認為有地雷的格子
6. 揭開所有非地雷格子即獲勝

## 如何運行

只需在瀏覽器中打開`index.html`文件即可開始遊戲。

## 技術細節

- 使用HTML5構建遊戲界面
- 使用CSS3實現響應式設計和動畫效果
- 使用原生JavaScript實現遊戲邏輯
- 不依賴任何外部庫或框架

## 兼容性

支援所有現代瀏覽器，包括：

- Chrome
- Firefox
- Safari
- Edge
- 移動設備瀏覽器