<!--
  * 表术语编辑
  *
  * @Author:    gklx
  * @Date:      2025-09-06
  * @Copyright  1.0
-->
<template>
  <a-drawer
      title="编辑表术语"
      :width="800"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }">
      <a-form-item label="术语(JSON)" name="tableCommentTerm">
        <JsonEditor v-model="form.tableCommentTerm" placeholder="请输入JSON格式的术语" />
      </a-form-item>
      <a-form-item label="场景(JSON)" name="scenes">
        <JsonEditor v-model="form.scenes" placeholder="请输入JSON格式的场景" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import {reactive, ref, nextTick} from 'vue';
import {message} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {tableApi} from '/@/api/business/generate/table-api';
import {smartSentry} from '/@/lib/smart-sentry';
import JsonEditor from '/@/components/business/generate/JsonEditor.vue';

const emits = defineEmits(['reloadList']);

const visibleFlag = ref(false);
const formRef = ref();
const tableId = ref(null);

const formDefault = {
  id: undefined,
  tableId: undefined,
  databaseId: undefined,
  tableCommentTerm: undefined,
  scenes: undefined,
};

let form = reactive({...formDefault});

const rules = {};

function show(record) {
  tableId.value = record.tableId;
  Object.assign(form, formDefault);
  form.tableId = record.tableId;
  form.databaseId = record.databaseId;
  visibleFlag.value = true;
  nextTick(() => {
    loadDetail();
    formRef.value?.clearValidate();
  });
}

function onClose() {
  visibleFlag.value = false;
  Object.assign(form, formDefault);
}

function loadDetail() {
  if (!tableId.value) {
    return;
  }
  SmartLoading.show();
  tableApi.getTableTermDetail(tableId.value)
    .then((res) => {
      const data = res.data || {};
      form.id = data.id;
      if (data.tableId !== undefined && data.tableId !== null) {
        form.tableId = data.tableId;
      }
      if (data.databaseId !== undefined && data.databaseId !== null) {
        form.databaseId = data.databaseId;
      }
      form.tableCommentTerm = data.tableCommentTerm;
      form.scenes = data.scenes;
    })
    .catch((err) => {
      smartSentry.captureError(err);
    })
    .finally(() => {
      SmartLoading.hide();
    });
}

async function onSubmit() {
  try {
    await formRef.value.validateFields();
    save();
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

async function save() {
  SmartLoading.show();
  try {
    await tableApi.addOrUpdateTableTerm({
      id: form.id,
      tableId: form.tableId,
      databaseId: form.databaseId,
      tableCommentTerm: form.tableCommentTerm,
      scenes: form.scenes,
    });
    message.success('保存成功');
    emits('reloadList');
    onClose();
  } catch (err) {
    smartSentry.captureError(err);
    message.error('保存失败');
  } finally {
    SmartLoading.hide();
  }
}

defineExpose({
  show,
});
</script>
