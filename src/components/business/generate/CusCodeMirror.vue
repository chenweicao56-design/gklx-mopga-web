<template>
  <div class="h-full flex flex-col">
    <a-form class="bg-black px-4">
      <a-row class="smart-query-form-row">
        <a-form-item label="" class="smart-query-form-item">
          <a-select size="small" ref="select" v-model:value="form.mode" style="width: 120px" @change="handleModelChange">
            <a-select-option value="java">java</a-select-option>
            <a-select-option value="vue">vue</a-select-option>
            <a-select-option value="markdown">markdown</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item  class="smart-query-form-item">
          <a-button type="primary" @click="formatCode" size="small">
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
  import { markdown } from '@codemirror/lang-markdown';
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
    }
  });
  const form = ref({
    mode: props.mode,
    code: props.modelValue,
  });

  const extensions = [basicSetup, oneDark];

  function handleModelChange(e) {
    form.value.mode = e;
  }

  function handleChange(e) {
    emit('update:modelValue', form.value.code);
  }

  const formatCode = async () => {
    try {
      let formatted;
      let parserName = form.value.mode;

      if (form.value.mode === 'vue') {
        formatted = await prettier.format(form.value.code, {
          parser: 'vue',
          plugins: [
            parserHtml,
            parserBabel,
            parserEstree,
            parserPostcss,
          ],
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          quoteProps: 'as-needed',
          trailingComma: 'es5',
          bracketSpacing: true,
          arrowParens: 'avoid',
          vueIndentScriptAndStyle: true,
          htmlWhitespaceSensitivity: 'strict',
        });
      } else if (form.value.mode === 'markdown') {
        formatted = await prettier.format(form.value.code, {
          parser: 'markdown',
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
          singleQuote: true,
          trailingComma: 'es5',
        });
      } else {
        return;
      }

      form.value.code = formatted;
    } catch (error) {
      console.error('格式化失败:', error);
      alert(`格式化错误: ${error.message}`);
    }
  };

  const currentLang = computed(() => {
    if (form.value.mode === 'java') {
      return java();
    } else if (form.value.mode === 'vue') {
      return vue();
    } else if (form.value.mode === 'markdown') {
      return markdown();
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
    height: 100%;
  }
</style>
