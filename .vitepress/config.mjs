import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "演算法視覺化",
  description: "Algo Visualizer",
  themeConfig: {
    // 1. 頂部導航列 (Nav)
    nav: [
      { text: '首頁', link: '/' },
      { text: '演算法大廳', link: '/algorithms' },
      { text: '開發日誌', link: '/dev-log' }
    ],

    // 2. 左側側邊欄 (Sidebar) - 加入分類
    sidebar: [
      {
        text: '🔍 搜尋演算法',
        items: [
          { text: '二分搜尋法', link: '/binary-search' }
        ]
      },
      {
        text: '🧱 資料結構',
        items: [
          { text: '並查集 (DSU)', link: '/dsu' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/owoqq66-spec' }
    ]
  }
})


