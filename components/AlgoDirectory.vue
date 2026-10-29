<template>
  <div class="directory-container">
    <!-- 搜尋與過濾區 -->
    <div class="filter-section">
      <input 
        v-model="searchQuery" 
        type="text" 
        class="search-box" 
        placeholder="請輸入文本"
      />
      
      <div class="tags-container">
        <span 
          class="tag" 
          :class="{ active: activeCategory === '全部' }"
          @click="activeCategory = '全部'"
        >全部</span>
        <span 
          v-for="cat in categories" 
          :key="cat"
          class="tag" 
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >{{ cat }}</span>
      </div>
    </div>

    <!-- 演算法卡片區 -->
    <div class="cards-grid">
      <a 
        v-for="algo in filteredAlgos" 
        :key="algo.id" 
        :href="algo.link" 
        class="algo-card"
      >
        <div class="card-header">
          <span class="card-category">{{ algo.category }}</span>
          <h3>{{ algo.title }}</h3>
        </div>
        <p class="card-desc">{{ algo.desc }}</p>
        <div class="card-footer">前往學習 →</div>
      </a>
    </div>

    <div v-if="filteredAlgos.length === 0" class="no-result">
      很抱歉 我只是演算法視覺化教材 沒有辦法處理這件事情
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const activeCategory = ref('全部')

const categories = ['搜尋', '資料結構', '圖論', '動態規劃']

// 這裡是你所有的演算法清單，以後有新的就加在這裡！
const algos = [
  {
    id: 'bs',
    title: '二分搜尋法 (Binary Search)',
    category: '搜尋',
    link: '/algo-visualizer/binary-search.html',
    desc: '利用單調性在 O(log n) 時間內快速鎖定目標值，包含區間縮減與指標防溢位技巧。'
  },
  {
    id: 'dsu',
    title: '並查集 (DSU)',
    category: '資料結構',
    link: '/algo-visualizer/dsu.html',
    desc: '快速合併群體與查詢從屬關係，支援路徑壓縮 (Path Compression) 與按大小合併 (Union by Size)。'
  }
]

// 即時計算過濾結果
const filteredAlgos = computed(() => {
  return algos.filter(a => {
    const matchCategory = activeCategory.value === '全部' || a.category === activeCategory.value;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        a.desc.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCategory && matchSearch;
  });
})
</script>

<style scoped>
.directory-container { margin-top: 2rem; }
.filter-section { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; background: var(--vp-c-bg-soft); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--vp-c-divider); }
.search-box { width: 100%; padding: 0.8rem 1rem; font-size: 16px; border-radius: 8px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); transition: border-color 0.2s; }
.search-box:focus { outline: none; border-color: var(--vp-c-brand-1); }

.tags-container { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 13px; font-weight: bold; background: var(--vp-c-bg-mute); color: var(--vp-c-text-2); cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
.tag:hover { border-color: var(--vp-c-brand-1); }
.tag.active { background: var(--vp-c-brand-1); color: white; }

.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.algo-card { display: flex; flex-direction: column; padding: 1.5rem; background: var(--vp-c-bg-soft); border-radius: 12px; border: 1px solid var(--vp-c-divider); text-decoration: none !important; color: var(--vp-c-text-1) !important; transition: transform 0.2s, box-shadow 0.2s; }
.algo-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); border-color: var(--vp-c-brand-1); }
.card-header h3 { margin: 0.5rem 0; font-size: 1.2rem; border: none; padding: 0; }
.card-category { font-size: 12px; font-weight: bold; color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); padding: 0.2rem 0.6rem; border-radius: 4px; display: inline-block; }
.card-desc { font-size: 14px; color: var(--vp-c-text-2); margin-bottom: 1.5rem; flex-grow: 1; line-height: 1.5; }
.card-footer { font-size: 13px; font-weight: bold; color: var(--vp-c-brand-1); text-align: right; }

.no-result { text-align: center; padding: 3rem; color: var(--vp-c-text-2); background: var(--vp-c-bg-soft); border-radius: 12px; }
</style>


