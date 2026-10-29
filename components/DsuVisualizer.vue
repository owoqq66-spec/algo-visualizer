<template>
  <div class="visualizer-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="config-section">
        <div class="inputs-wrapper">
          <div class="input-group">
            <label>節點 A:</label>
            <input v-model.number="nodeA" type="number" min="1" max="8" />
          </div>
          <div class="input-group">
            <label>節點 B (僅 Union):</label>
            <input v-model.number="nodeB" type="number" min="1" max="8" />
          </div>
        </div>
        
        <div class="options-wrapper">
          <label class="opt-label">
            <input type="checkbox" v-model="usePathCompression" /> 
            啟用 路徑壓縮 (Path Compression)
          </label>
          <label class="opt-label">
            <input type="checkbox" v-model="useUnionBySize" /> 
            啟用 按大小合併 (Union by Size)
          </label>
        </div>

        <div class="button-group" style="margin-top: 10px;">
          <button class="btn execute-btn" @click="generateUnion">放入 Union(A, B)</button>
          <button class="btn execute-btn-alt" @click="generateFind">放入 Find(A)</button>
        </div>
      </div>

      <div class="action-section">
        <div class="toggle-group">
          <button class="btn toggle-btn" :class="{ active: viewMode === 'visual' }" @click="viewMode = 'visual'">樹狀視覺化</button>
          <button class="btn toggle-btn" :class="{ active: viewMode === 'terminal' }" @click="viewMode = 'terminal'">除錯器模式 (Debugger)</button>
        </div>
        <div class="button-group">
          <button class="btn" @click="resetAll">清空重置</button>
          <button class="btn" @click="prevStep" :disabled="currentStepIndex <= 0">上一步</button>
          <button class="btn primary" @click="nextStep" :disabled="isFinished">下一步</button>
        </div>
      </div>
    </div>

    <!-- 模式 A：圖形視覺化 (動態樹狀畫布) -->
    <div v-show="viewMode === 'visual'" class="view-section visual-mode">
      <div class="canvas-wrapper" :style="{ height: canvasHeight + 'px' }">
        <svg width="600" :height="canvasHeight" class="dsu-svg">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"></polygon>
            </marker>
          </defs>
          
          <g v-for="i in 8" :key="'edge-'+i">
            <path 
              v-if="currentStep.parent[i] !== i"
              :d="calculatePath(nodes[i], nodes[currentStep.parent[i]])"
              marker-end="url(#arrowhead)"
              fill="transparent"
              stroke-width="2"
              class="smooth-path"
            ></path>
          </g>
        </svg>
        
        <div class="nodes-container">
          <div 
            v-for="i in 8" 
            :key="'node-'+i"
            class="dsu-node"
            :class="{ 'is-root': currentStep.parent[i] === i }"
            :style="{ left: nodes[i]?.x + 'px', top: nodes[i]?.y + 'px' }"
          >
            {{ i }}
            <span class="size-badge" v-if="currentStep.parent[i] === i && useUnionBySize">sz:{{ currentStep.size[i] }}</span>
          </div>

          <div 
            v-if="currentStep.tracer !== null"
            class="tracer-ring"
            :style="{ 
              left: nodes[currentStep.tracer]?.x + 'px', 
              top: nodes[currentStep.tracer]?.y + 'px' 
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 模式 B：除錯器模式 -->
    <div v-show="viewMode === 'terminal'" class="view-section debugger-layout">
      <div class="code-panel">
        <div 
          v-for="(line, idx) in dynamicCodeLines" 
          :key="idx" 
          class="code-line" 
          :class="{ 'active-line': currentStep.lineId === line.id }"
        >
          <span class="line-num">{{ idx + 1 }}</span>
          <pre>{{ line.text }}</pre>
        </div>
      </div>

      <div class="watch-panel">
        <div class="watch-header">記憶中的組長 (par 陣列)</div>
        <div class="array-watch">
          <div v-for="i in 8" :key="'par-'+i" class="array-cell">
            <div class="idx">{{ i }}</div>
            <div class="val">{{ currentStep.parent[i] }}</div>
          </div>
        </div>
        <div v-if="useUnionBySize">
          <div class="watch-header">群組大小 (sz 陣列，僅根節點有效)</div>
          <div class="array-watch">
            <div v-for="i in 8" :key="'sz-'+i" class="array-cell">
              <div class="idx">{{ i }}</div>
              <div class="val" :class="{'is-root-val': currentStep.parent[i] === i}">{{ currentStep.size[i] }}</div>
            </div>
          </div>
        </div>
        <div class="watch-header" style="margin-top: 1rem;">系統輸出</div>
        <div class="terminal-output">{{ currentStep.message }}</div>
      </div>
    </div>

    <!-- 狀態機日誌 -->
    <div class="status-box">
      <div class="step-counter">步驟: {{ currentStepIndex }} / {{ Math.max(0, history.length - 1) }}</div>
      <div class="step-log">{{ currentStep.message || '請在上方設定節點並點擊放入動作' }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const viewMode = ref('visual')
const nodeA = ref(1)
const nodeB = ref(2)

const usePathCompression = ref(true)
const useUnionBySize = ref(true)

const initialParent = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const initialSize = [0, 1, 1, 1, 1, 1, 1, 1, 1]
const history = ref([{ parent: [...initialParent], size: [...initialSize], tracer: null, lineId: '', message: '系統初始化，所有人都是自己的組長。' }])
const currentStepIndex = ref(0)

const currentStep = computed(() => history.value[currentStepIndex.value] || { parent: [...initialParent], size: [...initialSize], tracer: null, lineId: '', message: '' })
const isFinished = computed(() => currentStepIndex.value >= history.value.length - 1)

const maxDepth = computed(() => {
  const p = currentStep.value.parent;
  let max = 0;
  for (let i = 1; i <= 8; i++) {
    let depth = 0, curr = i, safe = 20;
    while (p[curr] !== curr && safe > 0) {
      depth++; curr = p[curr]; safe--;
    }
    if (depth > max) max = depth;
  }
  return max;
});

const canvasHeight = computed(() => Math.max(340, 120 + maxDepth.value * 75));

const dynamicCodeLines = computed(() => {
  const lines = [];
  lines.push({ id: 'f0', text: 'int finddsu(int a) {' });
  lines.push({ id: 'f1', text: '    if(par[a] == a) return a;' });
  
  if (usePathCompression.value) {
    lines.push({ id: 'f2', text: '    return par[a] = finddsu(par[a]); // 路徑壓縮' });
  } else {
    lines.push({ id: 'f2', text: '    return finddsu(par[a]);' });
  }
  lines.push({ id: 'f3', text: '}' });
  
  lines.push({ id: 'u0', text: 'void uniondsu(int a, int b) {' });
  lines.push({ id: 'u1', text: '    int A = finddsu(a), B = finddsu(b);' });
  lines.push({ id: 'u2', text: '    if(A == B) return;' });
  
  if (useUnionBySize.value) {
    lines.push({ id: 'u3', text: '    if(sz[B] > sz[A]) swap(A, B); // 按大小' });
    lines.push({ id: 'u4', text: '    par[B] = A;' });
    lines.push({ id: 'u5', text: '    sz[A] += sz[B];' });
  } else {
    lines.push({ id: 'u4', text: '    par[B] = A;' });
  }
  lines.push({ id: 'u6', text: '}' });
  return lines;
});

const nodes = computed(() => {
  const p = currentStep.value.parent;
  const pos = {};
  for (let i = 1; i <= 8; i++) {
    let depth = 0, curr = i, safe = 20;
    while (p[curr] !== curr && safe > 0) {
      depth++; curr = p[curr]; safe--;
    }
    pos[i] = { 
      x: 45 + (i - 1) * 70, 
      y: 40 + depth * 75    
    };
  }
  return pos;
});

function calculatePath(child, parent) {
  if(!child || !parent) return "";
  const dx = parent.x - child.x;
  const dy = parent.y - child.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const r = 22; 
  const targetX = parent.x - (dx / dist) * r;
  const targetY = parent.y - (dy / dist) * r;
  return `M ${child.x},${child.y} L ${targetX},${targetY}`;
}

function pushState(msg, p, s, tracerNode, lineId) {
  history.value.push({ parent: [...p], size: [...s], tracer: tracerNode, lineId: lineId, message: msg });
}

function clearFutureSteps() {
  if (currentStepIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, currentStepIndex.value + 1);
  }
}

function generateFind() {
  clearFutureSteps();
  let p = [...currentStep.value.parent];
  let s = [...currentStep.value.size];
  let target = nodeA.value;
  
  const startIdx = history.value.length;
  simulateFindLogic(target, p, s, true);
  currentStepIndex.value = startIdx; 
}

function generateUnion() {
  clearFutureSteps();
  let p = [...currentStep.value.parent];
  let s = [...currentStep.value.size];
  let a = nodeA.value, b = nodeB.value;
  
  const startIdx = history.value.length;
  
  pushState(`呼叫 uniondsu(${a}, ${b})`, p, s, null, 'u0');
  
  pushState(`尋找 ${a} 的最高組長 A`, p, s, a, 'u1');
  let rootA = simulateFindLogic(a, p, s, false);
  
  pushState(`尋找 ${b} 的最高組長 B`, p, s, b, 'u1');
  let rootB = simulateFindLogic(b, p, s, false);
  
  pushState(`判斷兩者是否同組: A(${rootA}) == B(${rootB}) ?`, p, s, null, 'u2');
  if (rootA === rootB) {
    pushState(`最高老大相同，已經在同一組，提早結束。`, p, s, rootA, 'u2');
  } else {
    let leader = rootA, follower = rootB;
    
    if (useUnionBySize.value) {
      pushState(`比較群組大小：sz[B](${s[rootB]}) > sz[A](${s[rootA]}) ?`, p, s, null, 'u3');
      if (s[rootB] > s[rootA]) {
        leader = rootB;
        follower = rootA;
        pushState(`條件成立：sz[B] > sz[A]，交換 A, B (讓 ${leader} 當老大)`, p, s, leader, 'u3');
      } else {
        pushState(`條件不成立：sz[B] <= sz[A]，維持 A(${leader}) 當老大`, p, s, leader, 'u3');
      }
    }
    
    p[follower] = leader;
    pushState(`執行 par[B] = A，將 ${follower} 併入 ${leader}。`, p, s, leader, 'u4');
    
    // 【核心邏輯】：無論是否啟用優化，底層永遠計算 Size 確保無縫切換
    s[leader] += s[follower];
    
    if (useUnionBySize.value) {
      pushState(`執行 sz[A] += sz[B]，${leader} 總人數更新為 ${s[leader]}。合併完成！`, p, s, leader, 'u5');
    } else {
      pushState(`合併完成！`, p, s, leader, 'u6');
    }
  }
  
  currentStepIndex.value = startIdx; 
}

function simulateFindLogic(x, p, s, isStandalone) {
  let curr = x;
  let path = [];
  
  pushState(`呼叫 finddsu(${curr})`, p, s, curr, 'f0');
  
  while (p[curr] !== curr) {
    pushState(`if (par[${curr}] == ${curr}) 不成立，繼續往上找`, p, s, curr, 'f1');
    path.push(curr);
    curr = p[curr];
    pushState(`滑動到父節點 ${curr} ...`, p, s, curr, 'f2');
  }
  
  pushState(`if (par[${curr}] == ${curr}) 成立！回傳 ${curr}`, p, s, curr, 'f1');
  
  if (path.length > 0) {
    if (usePathCompression.value) {
      for (let node of path) p[node] = curr;
      pushState(`✨ 觸發路徑壓縮！回溯將路徑上的節點全部直連到老大 ${curr}`, p, s, curr, 'f2');
    } else {
      pushState(`原路回溯，完成查詢。`, p, s, curr, 'f2');
    }
  }
  
  if (isStandalone) pushState(`Find(${x}) 執行結束，最終回傳 ${curr}。`, p, s, null, null);
  return curr;
}

function nextStep() { if (!isFinished.value) currentStepIndex.value++; }
function prevStep() { if (currentStepIndex.value > 0) currentStepIndex.value--; }
function resetAll() {
  history.value = [{ parent: [...initialParent], size: [...initialSize], tracer: null, lineId: '', message: '系統已清空重置。' }];
  currentStepIndex.value = 0;
}
</script>

<style scoped>
.visualizer-container { margin: 1rem 0; padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg-soft); }
.control-panel { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.config-section { display: flex; gap: 1rem; flex-wrap: wrap; align-items: stretch; padding: 1rem; background: var(--vp-c-bg); border-radius: 6px;}
.inputs-wrapper { display: flex; flex-direction: column; gap: 0.5rem; justify-content: center; }
.options-wrapper { display: flex; flex-direction: column; gap: 0.4rem; padding-left: 1rem; border-left: 1px solid var(--vp-c-divider); justify-content: center;}
.opt-label { font-size: 13px; color: var(--vp-c-text-1); display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-weight: bold;}
.action-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.input-group { display: flex; flex-direction: row; gap: 0.5rem; align-items: center;}
.input-group label { font-size: 13px; font-weight: bold; color: var(--vp-c-text-2); width: 120px;}
.input-group input { width: 70px; padding: 0.2rem 0.4rem; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.button-group, .toggle-group { display: flex; gap: 0.5rem; align-items: center;}
.btn { padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); cursor: pointer; color: var(--vp-c-text-1); transition: all 0.2s; }
.execute-btn { background: #3b82f6; color: white; border-color: #3b82f6; font-weight: bold; }
.execute-btn-alt { background: #10b981; color: white; border-color: #10b981; font-weight: bold; }
.btn.primary { background: var(--vp-c-brand-1); color: white; border-color: var(--vp-c-brand-1); }
.toggle-btn.active { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); font-weight: bold; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 視覺化模式 */
.view-section { min-height: 340px; margin-bottom: 1rem; position: relative; }
.visual-mode { background: #f8fafc; border-radius: 8px; border: 1px solid var(--vp-c-divider); overflow-x: auto; }
.dark .visual-mode { background: #1e293b; }
.canvas-wrapper { position: relative; width: 600px; margin: 0 auto; transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.dsu-svg { position: absolute; top: 0; left: 0; z-index: 1; transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.smooth-path { stroke: #94a3b8; transition: d 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

.nodes-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; }
.dsu-node { 
  position: absolute; width: 40px; height: 40px; margin: -20px 0 0 -20px; 
  background: white; border: 2px solid #3b82f6; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: bold; color: #1e293b; font-size: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 3;
  transition: top 0.6s cubic-bezier(0.4, 0, 0.2, 1); 
}
.dsu-node.is-root { background: #bfdbfe; border-color: #2563eb; }
.size-badge { position: absolute; bottom: -18px; font-size: 11px; background: #2563eb; color: white; padding: 1px 4px; border-radius: 4px; }

.tracer-ring {
  position: absolute; width: 52px; height: 52px; margin: -26px 0 0 -26px;
  border: 3px solid #ef4444; border-radius: 50%;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); z-index: 4;
}

/* 除錯器模式 */
.debugger-layout { display: flex; gap: 1rem; background: #1e1e1e; border-radius: 6px; overflow: hidden; height: 340px; }
.code-panel { flex: 3; padding: 1rem 0; font-family: 'Courier New', Courier, monospace; font-size: 13px; background: #1e1e1e; border-right: 1px solid #333; overflow-y: auto;}
.code-line { display: flex; padding: 2px 1rem; color: #d4d4d4; }
.code-line pre { margin: 0; font-family: inherit; }
.line-num { width: 24px; color: #858585; margin-right: 0.8rem; text-align: right; user-select: none; }
.active-line { background-color: #064e3b; border-left: 4px solid #10b981; }
.active-line pre { color: #a7f3d0; font-weight: bold; }

.watch-panel { flex: 2; padding: 1rem; background: #252526; font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #cccccc; display: flex; flex-direction: column; overflow-y: auto;}
.watch-header { font-weight: bold; color: #4ade80; margin-bottom: 0.5rem; border-bottom: 1px solid #444; padding-bottom: 2px; }
.array-watch { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 1rem; }
.array-cell { display: flex; flex-direction: column; align-items: center; width: 24px; }
.array-cell .idx { font-size: 10px; color: #888; }
.array-cell .val { width: 100%; text-align: center; background: #333; padding: 2px 0; border-radius: 2px; border: 1px solid #555; }
.is-root-val { color: #a3e635; font-weight: bold; border-color: #4ade80 !important; }
.terminal-output { color: #dcdcaa; font-style: italic; font-size: 13px; margin-top: 0.5rem; }

.status-box { padding: 0.8rem; background: var(--vp-c-bg); border-left: 4px solid var(--vp-c-brand-1); border-radius: 4px; }
.step-counter { font-size: 12px; color: var(--vp-c-text-2); margin-bottom: 4px; }
.step-log { font-size: 14px; font-weight: bold; }
</style>