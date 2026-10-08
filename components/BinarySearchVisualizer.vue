<template>
  <div class="visualizer-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="config-section">
        <div class="input-group">
          <label>自訂陣列 (自動排序):</label>
          <input 
            v-model="arrayInput" 
            type="text" 
            class="array-input"
            placeholder="例如: 9, 1, 7, 3, 5"
            @change="reset"
          />
        </div>
        <div class="input-group">
          <label>搜尋值 (Target):</label>
          <input v-model.number="target" type="number" class="target-input" @change="reset" />
        </div>
      </div>


      <div class="action-section">
        <div class="toggle-group">
          <button 
            class="btn toggle-btn" 
            :class="{ active: viewMode === 'visual' }" 
            @click="viewMode = 'visual'"
          >圖形視覺化</button>
          <button 
            class="btn toggle-btn" 
            :class="{ active: viewMode === 'terminal' }" 
            @click="viewMode = 'terminal'"
          >除錯器模式 (Debugger)</button>
        </div>
        <div class="button-group">
          <button class="btn" @click="reset">重置</button>
          <button class="btn" @click="prevStep" :disabled="currentStepIndex <= 0">上一步</button>
          <button class="btn primary" @click="nextStep" :disabled="isFinished">下一步</button>
        </div>
      </div>
    </div>


    <!-- 模式 A：圖形視覺化 -->
    <div v-show="viewMode === 'visual'" class="view-section">
      <div class="array-display">
        <div v-for="(val, idx) in parsedArray" :key="idx" class="cell-wrapper">
          <div class="pointer-container">
            <span v-if="currentStep.l === idx" class="pointer p-l">L</span>
            <span v-if="currentStep.mid === idx" class="pointer p-mid">Mid</span>
            <span v-if="currentStep.r === idx" class="pointer p-r">R</span>
          </div>
          <div 
            class="cell" 
            :class="{
              'out-of-range': idx < currentStep.l || idx > currentStep.r,
              'is-mid': idx === currentStep.mid,
              'is-found': isFinished && foundIndex === idx
            }"
          >
            {{ val }}
          </div>
          <div class="index-label">{{ idx }}</div>
        </div>
      </div>
    </div>


    <!-- 模式 B：除錯器模式 (Debugger) -->
    <div v-show="viewMode === 'terminal'" class="view-section debugger-layout">
      <!-- 左側：程式碼高亮區 -->
      <div class="code-panel">
        <div 
          v-for="(line, idx) in codeLines" 
          :key="idx"
          class="code-line"
          :class="{ 'active-line': currentStep.line === idx }"
        >
          <span class="line-num">{{ idx + 1 }}</span>
          <pre>{{ line }}</pre>
        </div>
      </div>
      
      <!-- 右側：變數監看與輸出區 -->
      <div class="watch-panel">
        <div class="watch-header">Variables (變數監看)</div>
        <div class="watch-item"><span>L:</span> {{ currentStep.l }}</div>
        <div class="watch-item"><span>R:</span> {{ currentStep.r }}</div>
        <div class="watch-item">
          <span>Mid:</span> {{ currentStep.mid !== null ? currentStep.mid : 'N/A' }} 
          <span v-if="currentStep.mid !== null" class="mid-val">(值: {{ parsedArray[currentStep.mid] }})</span>
        </div>
        <div class="watch-item"><span>Target:</span> {{ target }}</div>
        
        <div class="watch-header" style="margin-top: 1rem;">Output (執行輸出)</div>
        <div class="terminal-output">{{ currentStep.message }}</div>
      </div>
    </div>


    <!-- 當前步驟日誌 (固定於底部) -->
    <div class="status-box">
      <div class="step-counter">步驟: {{ currentStepIndex }} / {{ history.length - 1 }}</div>
      <div class="step-log">{{ currentStep.message }}</div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue'


const arrayInput = ref("9, 1, 7, 3, 5, 12, 8")
const target = ref(7)
const currentStepIndex = ref(0)
const history = ref([])
const viewMode = ref('terminal')


// 程式碼模板 (對應高亮行號 0~7)
const codeLines = [
  "int l = 0, r = n - 1;",
  "while (l <= r) {",
  "    int mid = l + (r - l) / 2;",
  "    if (arr[mid] == target) return mid;",
  "    if (arr[mid] < target) l = mid + 1;",
  "    else r = mid - 1;",
  "}",
  "return -1;"
]


// 解析並「強制排序」以確保單調性
const parsedArray = computed(() => {
  let arr = arrayInput.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n))
  return arr.sort((a, b) => a - b) // 外掛排序
})


// 狀態機核心邏輯
function generateHistory() {
  const steps = []
  const arr = parsedArray.value
  const t = target.value
  let l = 0
  let r = arr.length - 1
  let found = -1


  const pushStep = (msg, lineIdx, m = null) => {
    steps.push({ l, r, mid: m, line: lineIdx, message: msg })
  }


  // 行號 0: 初始化
  pushStep(`宣告邊界：l = 0, r = ${r}`, 0)


  while (true) {
    // 行號 1: 判斷條件
    pushStep(`判斷迴圈條件：l(${l}) <= r(${r}) -> ${l <= r ? 'True' : 'False'}`, 1)
    if (l > r) break


    // 行號 2: 算 mid
    const mid = Math.floor(l + (r - l) / 2)
    const midVal = arr[mid]
    pushStep(`計算中點：mid = ${l} + (${r} - ${l}) / 2 = ${mid}`, 2, mid)


    // 行號 3: == target
    pushStep(`判斷 arr[${mid}] (${midVal}) == ${t} -> ${midVal === t ? 'True' : 'False'}`, 3, mid)
    if (midVal === t) {
      pushStep(`搜尋成功，回傳 index ${mid}`, 3, mid)
      found = mid
      break
    } 
    
    // 行號 4: < target
    pushStep(`判斷 arr[${mid}] (${midVal}) < ${t} -> ${midVal < t ? 'True' : 'False'}`, 4, mid)
    if (midVal < t) {
      pushStep(`更新左界：l = ${mid} + 1 = ${mid + 1}`, 4, mid)
      l = mid + 1
    } else {
      // 行號 5: > target
      pushStep(`更新右界：r = ${mid} - 1 = ${mid - 1}`, 5, mid)
      r = mid - 1
    }
  }


  if (found === -1) {
    // 行號 7: return -1
    pushStep(`迴圈結束且未找到目標，回傳 -1`, 7)
  }


  history.value = steps
  currentStepIndex.value = 0
}


const currentStep = computed(() => history.value[currentStepIndex.value] || { l: 0, r: 0, mid: null, line: 0, message: '' })
const isFinished = computed(() => currentStepIndex.value >= history.value.length - 1)
const foundIndex = computed(() => {
  const last = history.value[history.value.length - 1]
  return last && last.message.includes('成功') ? last.mid : -1
})


function nextStep() { if (!isFinished.value) currentStepIndex.value++ }
function prevStep() { if (currentStepIndex.value > 0) currentStepIndex.value-- }
function reset() { generateHistory() }


watch([arrayInput, target], () => reset(), { immediate: true })


onMounted(() => { reset() })
</script>


<style scoped>
.visualizer-container { margin: 1rem 0; padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg-soft); }
.control-panel { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.config-section { display: flex; gap: 1rem; flex-wrap: wrap; }
.action-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.input-group { display: flex; gap: 0.5rem; align-items: center; }
.array-input { width: 220px; }
.target-input { width: 70px; }
.input-group input { padding: 0.3rem 0.5rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.button-group, .toggle-group { display: flex; gap: 0.5rem; }
.btn { padding: 0.3rem 0.8rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); cursor: pointer; color: var(--vp-c-text-1); transition: all 0.2s; }
.btn:hover { border-color: var(--vp-c-brand-1); }
.btn.primary { background: var(--vp-c-brand-1); color: white; border-color: var(--vp-c-brand-1); }
.btn.primary:disabled { background: var(--vp-c-divider); border-color: var(--vp-c-divider); }
.toggle-btn.active { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); font-weight: bold; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }


/* 視圖區塊共同設定 */
.view-section { min-height: 200px; margin-bottom: 1rem; }


/* 圖形視覺化 CSS */
.array-display { display: flex; gap: 6px; overflow-x: auto; padding: 1rem 0; justify-content: center; }
.cell-wrapper { display: flex; flex-direction: column; align-items: center; width: 44px; }
.pointer-container { height: 20px; display: flex; gap: 2px; }
.pointer { font-size: 10px; font-weight: bold; padding: 1px 3px; border-radius: 3px; color: white; }
.p-l { background-color: #3b82f6; }
.p-mid { background-color: #ef4444; }
.p-r { background-color: #10b981; }
.cell { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--vp-c-brand-1); border-radius: 4px; font-weight: bold; background: var(--vp-c-bg); transition: all 0.2s; }
.cell.out-of-range { opacity: 0.2; border-color: #9ca3af; }
.cell.is-mid { background: #fee2e2; border-color: #ef4444; color: #b91c1c; }
.cell.is-found { background: #dcfce7; border-color: #16a34a; color: #15803d; }
.index-label { font-size: 12px; color: var(--vp-c-text-2); margin-top: 4px; }


/* Debugger 模式 CSS */
.debugger-layout { display: flex; gap: 1rem; background: #1e1e1e; border-radius: 6px; overflow: hidden; }
.code-panel { flex: 3; padding: 1rem 0; font-family: 'Courier New', Courier, monospace; font-size: 14px; background: #1e1e1e; border-right: 1px solid #333; }
.code-line { display: flex; padding: 2px 1rem; color: #d4d4d4; }
.code-line pre { margin: 0; font-family: inherit; }
.line-num { width: 20px; color: #858585; margin-right: 1rem; text-align: right; user-select: none; }
.active-line { background-color: #064e3b; border-left: 4px solid #10b981; }
.active-line pre { color: #a7f3d0; font-weight: bold; }


.watch-panel { flex: 2; padding: 1rem; background: #252526; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #cccccc; display: flex; flex-direction: column; }
.watch-header { font-weight: bold; color: #4ade80; margin-bottom: 0.5rem; border-bottom: 1px solid #444; padding-bottom: 2px; }
.watch-item { margin-bottom: 4px; }
.watch-item span { color: #9cdcfe; }
.mid-val { color: #ce9178; font-size: 0.9em; margin-left: 4px; }
.terminal-output { color: #dcdcaa; margin-top: 0.5rem; font-style: italic; }


/* 底部日誌 */
.status-box { padding: 0.8rem; background: var(--vp-c-bg); border-left: 4px solid var(--vp-c-brand-1); border-radius: 4px; }
.step-counter { font-size: 12px; color: var(--vp-c-text-2); margin-bottom: 4px; }
.step-log { font-size: 14px; font-weight: bold; }
</style>
