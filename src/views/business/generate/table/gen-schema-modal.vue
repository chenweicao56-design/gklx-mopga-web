<template>
  <a-modal
    title="Schema 预览"
    :open="visibleFlag"
    width="80%"
    @cancel="onClose"
    :maskClosable="false"
    :destroyOnClose="true"
  >
    <a-row justify="end" class="smart-margin-bottom10">
      <a-button type="primary" @click="copy()">复制</a-button>
    </a-row>
    <div style="height: 550px">
      <CusCodeMirror v-model:model-value="schemaContent" height="400px" mode="java" :editable="false" />
    </div>
  </a-modal>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { generateApi } from '/@/api/business/generate/generate-api';
import CusCodeMirror from '/@/components/business/generate/CusCodeMirror.vue';
import { message } from 'ant-design-vue';

const databaseId = ref(null);
const tableIds = ref([]);
const visibleFlag = ref(false);
const schemaContent = ref('');

function showModal(dbId, tIds) {
  databaseId.value = dbId;
  tableIds.value = tIds;
  visibleFlag.value = true;
  nextTick(() => {
    loadSchema();
  });
}

function onClose() {
  visibleFlag.value = false;
  schemaContent.value = '';
}

function loadSchema() {
  generateApi.generateSchema({
    databaseId: databaseId.value,
    tableIds: tableIds.value,
  }).then((res) => {
    schemaContent.value = res.data;
  }).catch((error) => {
    console.error('Schema 生成失败:', error);
    message.error('Schema 生成失败，请稍后重试');
  });
}


async function copy() {
  try {
    await navigator.clipboard.writeText(schemaContent.value);
    message.success('复制成功');
  } catch (err) {
    message.error('复制失败，请手动复制');
  }
}

defineExpose({
  showModal,
});
</script>
