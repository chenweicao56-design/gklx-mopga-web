<!--
  *
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-modal :title="title" :width="width" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true">
    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup>
  import { onMounted, ref } from 'vue';

  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 1200,
    },
  });

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(rowData) {
    visibleFlag.value = true;
  }

  function onClose() {
    visibleFlag.value = false;
  }

  async function onSubmit() {}

  onMounted(() => {});

  defineExpose({
    show,
  });
</script>
