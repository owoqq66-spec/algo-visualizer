<template>
  <div class="playground-wrapper">
    <div class="playground-header">
      <span class="title">🎢 當前演算法: <span class="algo-name">{{ currentAlgo.name }}</span></span>
      <span class="hint">⚡ 自動展示中...</span>
    </div>

    <!-- 100 條柱狀圖視覺化 -->
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

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

// 核心輪播邏輯：無限循環展示
async function startAutoPlay() {
  while (!stopFlag.value) {
    shuffleArray();
    await sleep(600); // 洗牌後稍微停頓，讓視覺有喘息空間
    
    if (stopFlag.value) break;

    try {
      await algos[currentAlgoIndex.value].fn();
      
      if (!stopFlag.value) {
        // 排序完成，執行綠色掃描動畫
        activeIndices.value = [];
        for (let i = 0; i < arr.value.length; i++) {
          if (stopFlag.value) break;
          sortedIndices.value.push(i);
          await sleep(3); 
        }
        // 掃描完畢，停頓 2.5 秒讓使用者欣賞
        await sleep(2500); 
      }
    } catch (e) {
      console.error(e);
    }
    
    if (!stopFlag.value) {
      // 輪到下一個演算法
      currentAlgoIndex.value = (currentAlgoIndex.value + 1) % algos.length;
    }
  }
}

// === 11 種經典演算法庫 ===
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

onMounted(() => { 
  startAutoPlay(); 
})
onUnmounted(() => { 
  stopFlag.value = true; 
})
</script>

<style scoped>
.playground-wrapper { 
  width: 100%; 
  height: 320px; 
  background: var(--vp-c-bg-soft); 
  border: 1px solid var(--vp-c-divider); 
  border-radius: 14px; 
  display: flex; 
  flex-direction: column; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); 
  overflow: hidden;
}
.playground-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0.8rem 1.2rem;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--vp-c-divider); 
}
.dark .playground-header { background: rgba(255, 255, 255, 0.02); }
.title { font-weight: bold; font-size: 0.95rem; color: var(--vp-c-text-1); }
.algo-name { color: var(--vp-c-brand-1); font-weight: 900; }
.hint { font-size: 0.78rem; color: #10b981; font-weight: bold; font-style: italic; }

.bars-container { 
  display: flex; 
  align-items: flex-end; 
  justify-content: center; 
  flex-grow: 1;
  width: 100%; 
  gap: 1.5px; 
  padding: 1.5rem 1rem 0.5rem 1rem; 
  box-sizing: border-box;
}
.bar { 
  flex: 1;
  background-color: var(--vp-c-brand-soft); 
  border-radius: 2px 2px 0 0; 
  min-height: 2px;
}
.bar.active { background-color: #ef4444 !important; }
.bar.sorted { background-color: #10b981; }
</style>


