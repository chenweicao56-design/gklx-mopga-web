<script setup>
  import CodeMirror from 'vue-codemirror6';
  import { computed, ref, watch } from 'vue';
  import { java } from '@codemirror/lang-java';
  import { vue } from '@codemirror/lang-vue';
  import { markdown } from '@codemirror/lang-markdown';
  import { xml } from '@codemirror/lang-xml';
  import { basicSetup } from 'codemirror';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { message } from 'ant-design-vue';
  // import * as prettier from 'prettier';
  // import parserBabel from 'prettier/parser-babel';

  const emit = defineEmits(['update:modelValue', 'change']);
  const props = defineProps({
    code: {
      type: String,
      default: '',
    },
    lang: {
      type: String,
      default: 'java',
    },
    height: {
      type: String,
      default: '600px',
    },
  });
  const extensions = [basicSetup, oneDark];
  const form = ref({
    code: props.code,
    lang: props.lang,
    toolOnOff: false,
  });
  watch(
    () => props.code,
    (newVal) => {
      form.value.code = newVal;
    },{immediate: true}
  );
  const currentLang = computed(() => {
    if (form.value.lang === 'java') {
      return java();
    } else if (form.value.lang === 'vue') {
      return vue();
    } else if (form.value.lang === 'markdown') {
      return markdown();
    } else if (form.value.lang === 'xml') {
      return xml();
    }
    return vue();
  });
  function handleChange(e) {
    emit('update:code', form.value.code);
  }
  function copy() {
    let textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = form.value.code;
    textarea.select();
    document.execCommand('Copy');
    document.body.removeChild(textarea);
    message.success('复制成功');
  }
  // const formatWithPrettier = async () => {
  //   try {
  //     const originalCode = form.value.code;
  //
  //     form.value.code = await prettier.format(originalCode, {
  //       parser: 'babel',
  //       plugins: [parserBabel],
  //       semi: false,
  //       singleQuote: true,
  //     });
  //   } catch (error) {
  //     console.error('格式化出错:', error);
  //   }
  // };
  console.log('code-mirror');
</script>

<template>
  <div class="code-mirror-container">
    <code-mirror :style="{ height: props.height }" v-model="form.code" :lang="currentLang" :extensions="extensions" @change="handleChange" />

    <div class="code-mirror-tool">
      <a-button type="link" size="small" @click="copy">copy</a-button>
      <a-select class="ml-4" v-model:value="form.lang" size="small" style="width: 65px">
        <a-select-option value="java">Java</a-select-option>
        <a-select-option value="vue">Vue</a-select-option>
        <a-select-option value="markdown">MD</a-select-option>
        <a-select-option value="xml">XML</a-select-option>
      </a-select>
    </div>
  </div>
</template>

<style scoped>
  .code-mirror-container {
    position: relative;
  }
  .code-mirror-tool {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    display: flex;
  }
  :deep(.cm-editor) {
    height: 100%;
  }
</style>
