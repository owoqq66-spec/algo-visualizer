import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/algo-visualizer/',
  title: "演算法視覺化教材",
  description: "algo-visual",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首頁', link: '/' },
      { text: '二分搜尋', link: '/binary-search' },
      { text: '並查集', link: '/dsu' },
      { text: '開發日誌', link: '/dev-log' }
    ],

    sidebar: [
      {
      text: '搜尋與指標',
      items: [
        { text: '二分搜尋法 (Binary Search)', link: '/binary-search' }
      ]
    },
    {
      text: '進階資料結構',
      items: [
        { text: '並查集 (Disjoint Set Union)', link: '/dsu' }
      ]
    },
    {
      text: '專案紀錄',
      items: [
        { text: '人機協作與 AI Debug 日誌', link: '/dev-log' }
      ]
    }
  ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
