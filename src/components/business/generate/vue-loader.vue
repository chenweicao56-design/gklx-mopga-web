<template>
  <!-- 使用 ref 配合 key 来强制重新加载 -->
  <component :is="dynamicComponent" :key="code" />
</template>

<script setup>
import { defineAsyncComponent, shallowRef, watch } from 'vue';
import { loadModule } from 'vue3-sfc-loader';

const props = defineProps({
  code: {
    type: String,
    required: true
  }
});

// 使用 shallowRef 存储组件，避免深层响应式开销
const dynamicComponent = shallowRef(null);

// 定义加载函数
const loadComponent = async () => {
  dynamicComponent.value = defineAsyncComponent(async () => {
    try {
      return await loadModule('inline-component.vue', {
        getFile: () => props.code,
        addStyle: (styleStr) => {
          const style = document.createElement('style');
          style.textContent = styleStr;
          document.head.appendChild(style);
        },
        moduleCache: {
          vue: await import('vue'),
        },
      });
    } catch (error) {
      console.error('组件加载失败:', error);
      return {
        template: '<div style="color: red; padding: 20px;">组件加载失败</div>'
      };
    }
  });
};

// 初始化加载
loadComponent();

// 监听 code 变化，重新加载组件
watch(() => props.code, () => {
  loadComponent();
});
</script>