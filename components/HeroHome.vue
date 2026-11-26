<template>
  <div class="custom-home-page">
    <div class="main-content">
      
      <!-- 上方區塊：左文字 + 右動畫 -->
      <div class="hero-top-section">
        <div class="hero-left-content">
          <h1 class="hero-title">
            <span class="gradient-text">演算法視覺化教材</span>
            <span class="sub-name">Algo Visualizer</span>
          </h1>
          <p class="tagline">“當你懶的思考演算法只想看動畫時”</p>
          
          <div class="hero-actions">
              <a :href="withBase('/algorithms')" class="btn-brand">該卷了</a>
              <a :href="withBase('/dev-log')" class="btn-alt">開發日誌</a>
          </div>
        </div>
        
        <div class="hero-right-content">
          <div class="playground-wrapper">
            <div class="playground-header">
              <span class="title">🎢 當前演算法: <span class="algo-name">{{ currentAlgo.name }}</span></span>
              <span class="hint">⚡ 自動展示中...</span>
            </div>

            <div class="bars-container">
              <div 
                v-for="(val, idx) in arr" 
                :key="idx" 
                class="bar"
                :class="{ 'active': activeIndices.includes(idx), 'sorted': sortedIndices.includes(idx) }"
                :style="{ height: `${val}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下方區塊：特色介紹 (等高、三欄對齊) -->
      <div class="features-bottom-section">
        <div class="feature-card">
          <div class="icon">🤝</div>
          <div class="feature-text">
            <h4>人機協作</h4>
            <p>人類寫文案 AI架網站，完美分工。</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="icon">🇹🇼</div>
          <div class="feature-text">
            <h4>中文版本的視覺化</h4>
            <p>我知道你不想看英文版本的視覺化對不對？</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="icon">🧠</div>
          <div class="feature-text">
            <h4>各位（應該）都能看懂演算法</h4>
            <p>（應該吧？我都寫這麼多了...</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { withBase } from 'vitepress'

const ARRAY_SIZE = 100
const MAX_VAL = 100
const arr = ref([])
const activeIndices = ref([])
const sortedIndices = ref([])

const stopFlag = ref(false)
const currentAlgoIndex = ref(0)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function shuffleArray() {
  activeIndices.value = []
  sortedIndices.value = []
  arr.value = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * MAX_VAL) + 5)
}

async function startAutoPlay() {
  while (!stopFlag.value) {
    shuffleArray();
    await sleep(600);
    if (stopFlag.value) break;

    try {
      await algos[currentAlgoIndex.value].fn();
      
      if (!stopFlag.value) {
        activeIndices.value = [];
        for (let i = 0; i < arr.value.length; i++) {
          if (stopFlag.value) break;
          sortedIndices.value.push(i);
          await sleep(3); 
        }
        await sleep(2500); 
      }
    } catch (e) {
      console.error(e);
    }
    
    if (!stopFlag.value) {
      currentAlgoIndex.value = (currentAlgoIndex.value + 1) % algos.length;
    }
  }
}

// 演算法實作庫
async function bubbleSort() {
  let n = arr.value.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (stopFlag.value) return;
      activeIndices.value = [j, j + 1];
      if (arr.value[j] > arr.value[j + 1]) {
        let temp = arr.value[j]; arr.value[j] = arr.value[j + 1]; arr.value[j + 1] = temp;
      }
      await sleep(1);
    }
    sortedIndices.value.push(n - i - 1);
  }
  sortedIndices.value.push(0);
}

async function selectionSort() {
  let n = arr.value.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (stopFlag.value) return;
      activeIndices.value = [minIdx, j];
      if (arr.value[j] < arr.value[minIdx]) minIdx = j;
      await sleep(1);
    }
    if (minIdx !== i) {
      let temp = arr.value[i]; arr.value[i] = arr.value[minIdx]; arr.value[minIdx] = temp;
    }
    sortedIndices.value.push(i);
  }
}

async function insertionSort() {
  let n = arr.value.length;
  for (let i = 1; i < n; i++) {
    let key = arr.value[i], j = i - 1;
    while (j >= 0 && arr.value[j] > key) {
      if (stopFlag.value) return;
      activeIndices.value = [j, j + 1];
      arr.value[j + 1] = arr.value[j];
      j = j - 1;
      await sleep(1);
    }
    arr.value[j + 1] = key;
  }
}

async function cocktailSort() {
  let n = arr.value.length;
  let swapped = true, start = 0, end = n - 1;
  while (swapped && !stopFlag.value) {
    swapped = false;
    for (let i = start; i < end; ++i) {
      if (stopFlag.value) return;
      activeIndices.value = [i, i + 1];
      if (arr.value[i] > arr.value[i + 1]) {
        let temp = arr.value[i]; arr.value[i] = arr.value[i + 1]; arr.value[i + 1] = temp;
        swapped = true;
      }
      await sleep(1);
    }
    if (!swapped) break;
    swapped = false; end--;
    for (let i = end - 1; i >= start; --i) {
      if (stopFlag.value) return;
      activeIndices.value = [i, i + 1];
      if (arr.value[i] > arr.value[i + 1]) {
        let temp = arr.value[i]; arr.value[i] = arr.value[i + 1]; arr.value[i + 1] = temp;
        swapped = true;
      }
      await sleep(1);
    }
    start++;
  }
}

async function gnomeSort() {
  let index = 0, n = arr.value.length;
  while (index < n && !stopFlag.value) {
    activeIndices.value = [index];
    if (index === 0 || arr.value[index] >= arr.value[index - 1]) index++;
    else {
      let temp = arr.value[index]; arr.value[index] = arr.value[index - 1]; arr.value[index - 1] = temp;
      index--;
    }
    await sleep(1);
  }
}

async function oddEvenSort() {
  let isSorted = false, n = arr.value.length;
  while (!isSorted && !stopFlag.value) {
    isSorted = true;
    for (let i = 1; i <= n - 2; i += 2) {
      if (stopFlag.value) return;
      activeIndices.value = [i, i + 1];
      if (arr.value[i] > arr.value[i + 1]) {
        let temp = arr.value[i]; arr.value[i] = arr.value[i + 1]; arr.value[i + 1] = temp;
        isSorted = false;
      }
      await sleep(1);
    }
    for (let i = 0; i <= n - 2; i += 2) {
      if (stopFlag.value) return;
      activeIndices.value = [i, i + 1];
      if (arr.value[i] > arr.value[i + 1]) {
        let temp = arr.value[i]; arr.value[i] = arr.value[i + 1]; arr.value[i + 1] = temp;
        isSorted = false;
      }
      await sleep(1);
    }
  }
}

async function shellSort() {
  let n = arr.value.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = arr.value[i], j = i;
      while (j >= gap && arr.value[j - gap] > temp) {
        if (stopFlag.value) return;
        activeIndices.value = [j, j - gap];
        arr.value[j] = arr.value[j - gap];
        j -= gap;
        await sleep(2);
      }
      arr.value[j] = temp;
    }
  }
}

async function combSort() {
  let n = arr.value.length, gap = n, swapped = true;
  while (gap !== 1 || swapped) {
    gap = Math.floor(gap / 1.3);
    if (gap < 1) gap = 1;
    swapped = false;
    for (let i = 0; i < n - gap; i++) {
      if (stopFlag.value) return;
      activeIndices.value = [i, i + gap];
      if (arr.value[i] > arr.value[i + gap]) {
        let temp = arr.value[i]; arr.value[i] = arr.value[i + gap]; arr.value[i + gap] = temp;
        swapped = true;
      }
      await sleep(3);
    }
  }
}

async function quickSortWrapper() { await quickSort(0, arr.value.length - 1); }
async function quickSort(start, end) {
  if (start >= end || stopFlag.value) return;
  let index = await partition(start, end);
  if (stopFlag.value) return;
  await quickSort(start, index - 1);
  await quickSort(index + 1, end);
}
async function partition(start, end) {
  let pivotValue = arr.value[end], pivotIndex = start;
  for (let i = start; i < end; i++) {
    if (stopFlag.value) return pivotIndex;
    activeIndices.value = [i, pivotIndex, end];
    if (arr.value[i] < pivotValue) {
      let temp = arr.value[i]; arr.value[i] = arr.value[pivotIndex]; arr.value[pivotIndex] = temp;
      pivotIndex++;
    }
    await sleep(8);
  }
  let temp = arr.value[pivotIndex]; arr.value[pivotIndex] = arr.value[end]; arr.value[end] = temp;
  return pivotIndex;
}

async function mergeSortWrapper() { await mergeSort(0, arr.value.length - 1); }
async function mergeSort(l, r) {
  if (l >= r || stopFlag.value) return;
  let m = Math.floor((l + r) / 2);
  await mergeSort(l, m);
  await mergeSort(m + 1, r);
  await merge(l, m, r);
}
async function merge(l, m, r) {
  let temp = [], i = l, j = m + 1;
  while (i <= m && j <= r) {
    if (stopFlag.value) return;
    activeIndices.value = [i, j];
    await sleep(8);
    if (arr.value[i] <= arr.value[j]) temp.push(arr.value[i++]);
    else temp.push(arr.value[j++]);
  }
  while (i <= m) temp.push(arr.value[i++]);
  while (j <= r) temp.push(arr.value[j++]);
  for (let k = 0; k < temp.length; k++) {
    if (stopFlag.value) return;
    arr.value[l + k] = temp[k];
    activeIndices.value = [l + k];
    await sleep(8);
  }
}

async function heapSort() {
  let n = arr.value.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    if (stopFlag.value) return;
    await heapify(n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    if (stopFlag.value) return;
    let temp = arr.value[0]; arr.value[0] = arr.value[i]; arr.value[i] = temp;
    activeIndices.value = [0, i];
    await sleep(8);
    await heapify(i, 0);
  }
}
async function heapify(n, i) {
  if (stopFlag.value) return;
  let largest = i, l = 2 * i + 1, r = 2 * i + 2;
  if (l < n && arr.value[l] > arr.value[largest]) largest = l;
  if (r < n && arr.value[r] > arr.value[largest]) largest = r;
  if (largest !== i) {
    let temp = arr.value[i]; arr.value[i] = arr.value[largest]; arr.value[largest] = temp;
    activeIndices.value = [i, largest];
    await sleep(8);
    await heapify(n, largest);
  }
}

const algos = [
  { name: 'Quick Sort (快速排序)', fn: quickSortWrapper },
  { name: 'Merge Sort (合併排序)', fn: mergeSortWrapper },
  { name: 'Heap Sort (堆積排序)', fn: heapSort },
  { name: 'Shell Sort (希爾排序)', fn: shellSort },
  { name: 'Comb Sort (梳排序)', fn: combSort },
  { name: 'Insertion Sort (插入排序)', fn: insertionSort },
  { name: 'Selection Sort (選擇排序)', fn: selectionSort },
  { name: 'Bubble Sort (氣泡排序)', fn: bubbleSort },
  { name: 'Cocktail Shaker (雞尾酒排序)', fn: cocktailSort },
  { name: 'Gnome Sort (侏儒排序)', fn: gnomeSort },
  { name: 'Odd-Even Sort (奇偶排序)', fn: oddEvenSort }
]

const currentAlgo = computed(() => algos[currentAlgoIndex.value])

onMounted(() => { startAutoPlay() })
onUnmounted(() => { stopFlag.value = true })
</script>
<style scoped>
.custom-home-page {
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 16px 0;
  font-family: var(--vp-font-family);
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 38px;
}

.hero-top-section {
  display: grid;
  grid-template-columns: 1fr 1.18fr;
  align-items: center;
  gap: 48px;
  width: 100%;
}

.hero-left-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.hero-right-content {
  width: 100%;
  min-width: 0;
}

.hero-title {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  font-weight: 900;
  margin: 0 0 18px 0;
  border: none;
}

.gradient-text {
  font-size: clamp(2.8rem, 4.2vw, 4.2rem);
  white-space: nowrap;
  background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding-bottom: 4px;
}

.sub-name {
  font-size: clamp(2.1rem, 3.2vw, 3.2rem);
  color: var(--vp-c-text-1);
}

.tagline {
  font-size: clamp(1.15rem, 1.4vw, 1.45rem);
  color: var(--vp-c-text-2);
  margin: 0 0 32px 0;
  font-weight: 600;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.btn-brand, .btn-alt {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 14px 34px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1.15rem;
  text-decoration: none !important;
  transition: all 0.2s ease;
}

.btn-brand {
  background-color: var(--vp-c-brand-1);
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}
.btn-brand:hover {
  background-color: var(--vp-c-brand-2);
  transform: translateY(-2px);
}

.btn-alt {
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1) !important;
  border: 1px solid var(--vp-c-divider);
}
.btn-alt:hover {
  background-color: var(--vp-c-default-soft);
  transform: translateY(-2px);
}

.playground-wrapper {
  width: 100%;
  height: clamp(340px, 42vh, 430px);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.4rem;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--vp-c-divider);
  white-space: nowrap;
}
.dark .playground-header {
  background: rgba(255, 255, 255, 0.02);
}
.title {
  font-weight: bold;
  font-size: 1.08rem;
  color: var(--vp-c-text-1);
}
.algo-name {
  color: var(--vp-c-brand-1);
  font-weight: 900;
}
.hint {
  font-size: 0.95rem;
  color: #10b981;
  font-weight: bold;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
  gap: 2.5px;
  padding: 1.6rem 1.4rem 0.6rem 1.4rem;
  box-sizing: border-box;
}
.bar {
  flex: 1;
  background-color: var(--vp-c-brand-soft);
  border-radius: 3px 3px 0 0;
  min-height: 3px;
}
.bar.active {
  background-color: #ef4444 !important;
}
.bar.sorted {
  background-color: #10b981;
}

.features-bottom-section {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  width: 100%;
}

.feature-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 18px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  padding: 24px 26px;
  border-radius: 14px;
  height: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
}
.feature-card:hover {
  border-color: var(--vp-c-brand-soft);
  background: var(--vp-c-bg-mute);
  transform: translateY(-3px);
}

.feature-card .icon {
  font-size: 1.75rem;
  background: var(--vp-c-bg-mute);
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.feature-text {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.feature-card h4 {
  margin: 0 0 6px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.feature-card p {
  margin: 0;
  font-size: 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

@media (max-width: 960px) {
  .hero-top-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 28px;
  }
  .hero-left-content {
    align-items: center;
  }
  .features-bottom-section {
    grid-template-columns: 1fr;
  }
}
</style>
