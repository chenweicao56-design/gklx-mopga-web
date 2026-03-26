<template>
  <div class="h-full flex flex-col">
    <a-form class="smart-query-form mb-4">
      <a-row class="smart-query-form-row">
        <a-form-item label="mode" class="smart-query-form-item">
          <a-select ref="select" v-model:value="form.mode" style="width: 120px" @change="handleModelChange">
            <a-select-option value="java">java</a-select-option>
            <a-select-option value="vue">vue</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item">
          <a-button type="primary" @click="fromatCode">
            <template #icon>
              <FormatPainterOutlined />
            </template>
            格式化
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>
    <div style="flex: 1" class="overflow-y-auto">
      <code-mirror v-model="form.code" :lang="currentLang" :extensions="extensions" @change="handleChange" />
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import CodeMirror from 'vue-codemirror6';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { basicSetup } from 'codemirror';
  import { java } from '@codemirror/lang-java';
  import { vue } from '@codemirror/lang-vue';
  import * as prettier from 'prettier/standalone';
  import parserHtml from 'prettier/plugins/html';
  import parserBabel from 'prettier/plugins/babel';
  import parserPostcss from 'prettier/plugins/postcss';
  import parserEstree from 'prettier/plugins/estree';

  // import javaParser from 'prettier-plugin-java'

  const emit = defineEmits(['update:modelValue', 'change']);

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      default: 'java',
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
  const form = ref({
    mode: props.mode,
    code: props.modelValue,
  });

  const extensions = [basicSetup, oneDark];

  function handleModelChange(e) {
    form.value.mode === e;
  }

  function handleChange(e) {
    emit('update:modelValue', form.value.code);
  }

  const fromatCode = async () => {
    try {
      // Prettier 3.x 支持 Vue 单文件组件格式化
      const formatted = await prettier.format(form.value.code, {
        parser: 'vue',
        plugins: [
          parserHtml, // 用于 template 部分
          parserBabel, // 用于 script 部分
          parserEstree, // ESTree 支持
          parserPostcss, // 用于 style 部分
        ],
        // 通用格式配置
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        quoteProps: 'as-needed',
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
        // Vue 特定配置
        vueIndentScriptAndStyle: true, // script 和 style 缩进
        htmlWhitespaceSensitivity: 'strict',
      });

      form.value.code = formatted;
    } catch (error) {
      console.error('Vue 格式化失败:', error);
      alert(`格式化错误: ${error.message}`);
    } finally {
      console.log('Vue 格式化完成');
    }
  };

  const currentLang = computed(() => {
    if (form.value.mode === 'java') {
      return java();
    } else if (form.value.mode === 'vue') {
      return vue();
    }
    return vue();
  });

  watch(
    () => props.modelValue,
    (newVal) => {
      form.value.code = newVal;
    }
  );
</script>
<style scoped>
  :deep(.cm-editor) {
    height: 600px;
  }
</style>
