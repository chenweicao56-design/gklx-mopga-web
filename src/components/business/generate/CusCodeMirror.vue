<template>
  <div>
    <div class="mb-4">

      <a-form class="smart-query-form">
        <a-row class="smart-query-form-row">
          <a-form-item label="mode" class="smart-query-form-item">
            <a-select
              ref="select"
              v-model:value="toolForm.mode"
              style="width: 120px"
              @change="handleModelChange"
            >
              <a-select-option value="text/x-java">java</a-select-option>
              <a-select-option value="vue">vue</a-select-option>
            </a-select>
          </a-form-item>
        </a-row>
      </a-form>
    </div>
    <div ref="editorElement">
    </div>

  </div>
</template>

<script setup>
  import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
  import CodeMirror from 'codemirror';
  import 'codemirror/lib/codemirror.css';
  import 'codemirror/mode/clike/clike.js';
  import 'codemirror/theme/darcula.css';
  import 'codemirror/mode/vue/vue.js'


  // 引入代码折叠相关插件
  import 'codemirror/addon/fold/foldcode.js'
  import 'codemirror/addon/fold/foldgutter.js'
  import 'codemirror/addon/fold/foldgutter.css'
  import 'codemirror/addon/fold/xml-fold.js'
  import 'codemirror/addon/fold/brace-fold.js'    // 括号折叠
  import 'codemirror/addon/fold/indent-fold.js'   // 缩进折叠
  import 'codemirror/addon/fold/comment-fold.js'  // 注释折叠


  // ---------- 自动补全核心插件 ----------
  // 提示框核心样式和功能
  import 'codemirror/addon/hint/show-hint.js'
  import 'codemirror/addon/hint/show-hint.css'
  // HTML 自动补全规则（关键！）
  import 'codemirror/addon/hint/xml-hint.js'
  // 如果你还需要 CSS/JS 补全，可以引入：
  import 'codemirror/addon/hint/javascript-hint.js'
  import 'codemirror/addon/hint/css-hint.js'

  // 可选：让补全在输入时自动弹出
  import 'codemirror/addon/hint/anyword-hint.js'

  // 定义组件属性
  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      default: 'text/x-java',
    },
    editable: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: 'darcula',
    },
    height: {
      type: String,
      default: '400px', // 默认高度
    },
  });
  const toolForm = ref({
    mode: props.mode,
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
      mode: props.mode,
      theme: props.theme,
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 4,
      smartIndent: true,
      tabSize: 4,
      readOnly: !props.editable,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      autofocus: true,
      styleActiveLine: true,
      matchBrackets: true,
      extraKeys: {
        Tab: function (cm) {
          const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
          cm.replaceSelection(spaces);
        },
      },
    });
    editor.setSize(null, props.height);

    // 绑定内容变化事件
    editor.on('change', handleEditorChange);
  }


  function handleModelChange(e){
    if(editor){
      editor.setOption('mode', e);
    }
  }

  // 处理编辑器内容变化
  function handleEditorChange(cm) {
    const newValue = cm.getValue();
    emit('update:modelValue', newValue);
  }

  // 监听属性变化
  watch(
    () => props.modelValue,
    (newVal) => {
      if (editor && editor.getValue() !== newVal) {
        editor.setValue(newVal);
      }
    }
  );

  watch(
    () => props.editable,
    (newVal) => {
      if (editor) {
        editor.setOption('readOnly', !newVal);
      }
    }
  );

  watch(
    () => props.theme,
    (newVal) => {
      if (editor) {
        editor.setOption('theme', newVal);
      }
    }
  );

  watch(
    () => props.mode,
    (newVal) => {
      if (editor) {
        editor.setOption('mode', newVal);
        toolForm.value.mode = newVal;
      }
    }
  );


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
