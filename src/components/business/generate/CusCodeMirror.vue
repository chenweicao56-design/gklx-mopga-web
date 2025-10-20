<template>
    <div ref="editorElement"></div>
</template>

<script setup>
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/theme/darcula.css';

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  editable: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'darcula'
  },
  height: {
    type: String,
    default: '400px' // 默认高度
  }
});

// 定义组件事件
const emit = defineEmits(['update:modelValue']);

// 组件状态
const editorElement = ref(null);
let editor = null;

// 初始化编辑器
function initEditor() {
  if (!editorElement.value) return;

  editor = CodeMirror(editorElement.value, {
    value: props.modelValue,
    mode: 'text/x-java',
    theme: props.theme,
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 4,
    smartIndent: true,
    tabSize: 4,
    readOnly: !props.editable,
    autofocus: true,
    styleActiveLine: true,
    matchBrackets: true,
    extraKeys: {
      'Tab': function (cm) {
        const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      }
    }
  });
  editor.setSize(null, props.height);

  // 绑定内容变化事件
  editor.on('change', handleEditorChange);
}

// 处理编辑器内容变化
function handleEditorChange(cm) {
  const newValue = cm.getValue();
  emit('update:modelValue', newValue);
}

// 监听属性变化
watch(() => props.modelValue, (newVal) => {
  if (editor && editor.getValue() !== newVal) {
    editor.setValue(newVal);
  }
});

watch(() => props.editable, (newVal) => {
  if (editor) {
    editor.setOption('readOnly', !newVal);
  }
});

watch(() => props.theme, (newVal) => {
  if (editor) {
    editor.setOption('theme', newVal);
  }
});


// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initEditor();
  });
});

onUnmounted(() => {
  if (editor) {
    // 安全销毁编辑器实例
    if (typeof editor.toTextArea === 'function') {
      editor.toTextArea();
    } else {
      editor.destroy && editor.destroy();
      const parent = editorElement.value;
      if (parent) {
        parent.innerHTML = '';
      }
    }
    editor = null;
  }
});
</script>
<style scoped>


</style>
