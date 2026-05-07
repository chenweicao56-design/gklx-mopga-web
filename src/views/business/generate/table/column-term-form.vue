<!--
  * 列术语编辑
  *
  * @Author:    gklx
  * @Date:      2025-09-06
  * @Copyright  1.0
-->
<template>
  <a-drawer
      title="编辑列术语"
      :width="800"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }">
      <a-form-item label="注释" name="columnCommentTerm">
        <a-textarea v-model:value="form.columnCommentTerm" placeholder="请输入注释" :rows="3" />
      </a-form-item>
      <a-form-item label="字典" name="dicts">
        <JsonEditor v-model="form.dicts" placeholder="请输入字典" />
      </a-form-item>
      <a-form-item label="外键" name="foreignKey">
        <JsonEditor v-model="form.foreignKey" placeholder="请输入外键" />
      </a-form-item>
      <a-form-item label="示例" name="example">
        <JsonEditor v-model="form.example" placeholder="请输入示例" />
      </a-form-item>
      <a-form-item label="术语" name="terms">
        <JsonEditor v-model="form.terms" placeholder="请输入术语" />
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
import {genTableColumnApi} from '/@/api/business/generate/gen-table-column-api';
import {smartSentry} from '/@/lib/smart-sentry';
import JsonEditor from '/@/components/business/generate/JsonEditor.vue';

const emits = defineEmits(['reloadList']);

const visibleFlag = ref(false);
const formRef = ref();
const columnId = ref(null);

const formDefault = {
  id: undefined,
  columnId: undefined,
  databaseId: undefined,
  tableId: undefined,
  columnCommentTerm: undefined,
  dicts: undefined,
  example: undefined,
  foreignKey: undefined,
  terms: undefined,
};

let form = reactive({...formDefault});

const rules = {};

function show(record) {
  columnId.value = record.columnId;
  Object.assign(form, formDefault);
  form.columnId = record.columnId;
  form.databaseId = record.databaseId;
  form.tableId = record.tableId;
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
  if (!columnId.value) {
    return;
  }
  SmartLoading.show();
  genTableColumnApi.getColumnTermDetail(columnId.value)
    .then((res) => {
      const data = res.data || {};
      form.id = data.id;
      if (data.columnId !== undefined && data.columnId !== null) {
        form.columnId = data.columnId;
      }
      if (data.databaseId !== undefined && data.databaseId !== null) {
        form.databaseId = data.databaseId;
      }
      form.columnCommentTerm = data.columnCommentTerm;
      form.dicts = data.dicts;
      form.example = data.example;
      form.foreignKey = data.foreignKey;
      form.terms = data.terms;
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
    await genTableColumnApi.addOrUpdateColumnTerm({
      id: form.id,
      columnId: form.columnId,
      databaseId: form.databaseId,
      tableId: form.tableId,
      columnCommentTerm: form.columnCommentTerm === "" ? null : form.columnCommentTerm,
      dicts: form.dicts === "" ? null : form.dicts,
      example: form.example === "" ? null : form.example,
      foreignKey: form.foreignKey === "" ? null : form.foreignKey,
      terms: form.terms === "" ? null : form.terms,
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
