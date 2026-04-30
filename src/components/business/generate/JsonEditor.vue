<!--
  * JSON编辑器组件
  *
  * @Author:    gklx
  * @Date:      2025-09-06
  * @Copyright  1.0
-->
<template>
  <div class="json-editor-wrapper">
    <div class="json-editor-toolbar mb-2">
      <a-button type="primary" size="small" @click="formatJson">格式化</a-button>
      <a-button size="small" @click="copyJson">复制</a-button>
      <a-button size="small" @click="clearJson">清空</a-button>
      <a-button size="small" @click="validateJson">验证</a-button>
    </div>
    <div class="json-editor-container">
      <textarea
          ref="textareaRef"
          v-model="localValue"
          class="json-editor-textarea"
          :placeholder="placeholder"
          @input="handleInput"
      ></textarea>
    </div>
    <div v-if="error" class="json-editor-error">
      <a-alert :message="error" type="error" show-icon />
    </div>
  </div>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';
import {message} from 'ant-design-vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '请输入JSON字符串',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const textareaRef = ref();
const localValue = ref('');
const error = ref('');

onMounted(() => {
  if (props.modelValue) {
    try {
      const parsed = JSON.parse(props.modelValue);
      localValue.value = JSON.stringify(parsed, null, 2);
    } catch {
      localValue.value = props.modelValue;
    }
  }
});

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== localValue.value) {
    try {
      const parsed = JSON.parse(newVal);
      localValue.value = JSON.stringify(parsed, null, 2);
    } catch {
      localValue.value = newVal;
    }
  }
});

function handleInput() {
  error.value = '';
  try {
    if (localValue.value.trim()) {
      JSON.parse(localValue.value);
    }
    emit('update:modelValue', localValue.value);
    emit('change', localValue.value);
  } catch (e) {
    error.value = 'JSON格式错误: ' + e.message;
  }
}

function formatJson() {
  try {
    if (localValue.value.trim()) {
      const parsed = JSON.parse(localValue.value);
      localValue.value = JSON.stringify(parsed, null, 2);
      handleInput();
    }
  } catch (e) {
    error.value = 'JSON格式错误: ' + e.message;
  }
}

function clearJson() {
  localValue.value = '';
  error.value = '';
  emit('update:modelValue', '');
  emit('change', '');
}

function validateJson() {
  try {
    if (localValue.value.trim()) {
      JSON.parse(localValue.value);
      error.value = '';
      alert('JSON格式正确');
    }
  } catch (e) {
    error.value = 'JSON格式错误: ' + e.message;
  }
}

async function copyJson() {
  try {
    if (!localValue.value.trim()) {
      message.warning('没有可复制的内容');
      return;
    }
    await navigator.clipboard.writeText(localValue.value);
    message.success('复制成功');
  } catch (err) {
    message.error('复制失败，请手动复制');
  }
}
</script>

<style scoped>
.json-editor-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.json-editor-toolbar {
  display: flex;
  gap: 8px;
}

.json-editor-container {
  flex: 1;
  min-height: 200px;
}

.json-editor-textarea {
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: none;
  background: #fafafa;
}

.json-editor-textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.json-editor-error {
  margin-top: 8px;
}
</style>
