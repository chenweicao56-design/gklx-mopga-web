<template>
  <div class="compareClass">
    <div ref="codeMirrorRef"></div>
  </div>
</template>

<script setup>
import {nextTick, ref} from 'vue';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/merge/merge.js';
import 'codemirror/addon/merge/merge.css';
import DiffMatchPatch from 'diff-match-patch';


// 初始化diff-match-patch
window.diff_match_patch = DiffMatchPatch;
window.DIFF_DELETE = -1;
window.DIFF_INSERT = 1;
window.DIFF_EQUAL = 0;

// 定义props
const props = defineProps({
  // currentCode: {
  //   type: String,
  //   default: '',
  // },
  // historyCode: {
  //   type: String,
  //   default: '',
  // },
});

// 定义emit事件
const emit = defineEmits(['getNewData', 'getDiff']);

// 状态管理
const codeMirrorRef = ref(null);
const hisCode = ref(null);
const currentCode = ref(null);
const historyCode = ref(null);

function updateCode(current, history) {
  currentCode.value = current;
  historyCode.value = history;
  initUI();
}

// 初始化对比视图
const initUI = () => {
  if (!codeMirrorRef.value) return;

  codeMirrorRef.value.innerHTML = '';

  hisCode.value = CodeMirror.MergeView(codeMirrorRef.value, {
    value: currentCode.value, // 当前内容
    orig: historyCode.value, // 历史版本
    origLeft: null,
    lineNumbers: true, // 显示行号
    indentUnit: 3, // 缩进
    mode: 'html', // 视图文件格式
    highlightDifferences: true, // 高亮差异
    styleActiveLine: true, // 选中行样式
    connect: 'align', // 对齐方式
    theme: 'darcula', // 主题样式
    readOnly: false, // 是否只读
  });
  nextTick(() => {
    // 获取差异数量
    const elements = document.getElementsByClassName('CodeMirror-merge-copy');
    emit('getDiff', elements.length);

    // 监听复制按钮点击事件
    const parentElement = document.getElementsByClassName('CodeMirror-merge-copybuttons-right');
    if (parentElement.length > 0) {
      parentElement[0].addEventListener('click', (event) => {
        if (event.target.classList.contains('CodeMirror-merge-copy')) {
          emit('getDiff', elements.length - 1);
        }
      });
    }
  });
};
defineExpose({
  updateCode,
});
</script>

<style lang="less">
.compareClass {
  overflow-y: auto;
  overflow-x: auto;

  .CodeMirror-merge {
    display: flex;
  }

  .CodeMirror-merge, .CodeMirror-merge .CodeMirror {
    height: 600px;
  }

  .CodeMirror-merge-2pane .CodeMirror-merge-pane {
    height: 100%;
  }

  // 差异区域样式
  .CodeMirror-merge-r-chunk,
  .CodeMirror-merge-l-chunk {
    background: rgba(30, 144, 255, 0.5);
  }

  .CodeMirror-merge-r-chunk-start,
  .CodeMirror-merge-l-chunk-start {
    border-top: 1px solid dodgerblue;
  }

  .CodeMirror-merge-r-chunk-end,
  .CodeMirror-merge-l-chunk-end {
    border-bottom: 1px solid dodgerblue;
  }

  .CodeMirror-merge-r-connect,
  .CodeMirror-merge-l-connect {
    fill: rgba(30, 144, 255, 0.5);
    stroke: rgba(30, 144, 255, 0.5);
    stroke-width: 1px;
  }
}
</style>
