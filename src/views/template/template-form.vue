<!--
  *
  *
  * @Author:    gklx
  * @Date:
  * @Copyright  1.0
-->
<template>
  <a-drawer :title="title" :width="width" :open="visibleFlag" @close="onClose" :maskClosable="false" :destroyOnClose="true">
    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    width: {
      type: Number,
      default: 200,
    },
    title: {
      type: String,
      default: '',
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

  defineExpose({
    show,
  });
</script>
