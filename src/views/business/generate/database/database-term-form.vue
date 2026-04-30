<!--
  * 数据源术语编辑
  *
  * @Author:    gklx
  * @Date:      2025-09-06
  * @Copyright  1.0
-->
<template>
  <a-drawer
      title="编辑术语"
      :width="800"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }">
      <a-form-item label="数据源注释术语" name="databaseCommentTerm">
        <a-textarea v-model:value="form.databaseCommentTerm" placeholder="请输入数据源注释术语" :rows="3" />
      </a-form-item>
      <a-form-item label="术语(JSON)" name="terms">
        <JsonEditor v-model="form.terms" placeholder="请输入JSON格式的术语" />
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
import {databaseApi} from '/@/api/business/generate/database-api';
import {smartSentry} from '/@/lib/smart-sentry';
import JsonEditor from '/@/components/business/generate/JsonEditor.vue';

const emits = defineEmits(['reloadList']);

const visibleFlag = ref(false);
const formRef = ref();
const databaseId = ref(null);

const formDefault = {
  id: undefined,
  databaseId: undefined,
  terms: undefined,
  databaseCommentTerm: undefined,
};

let form = reactive({...formDefault});

const rules = {};

function show(id) {
  databaseId.value = id;
  Object.assign(form, formDefault);
  form.databaseId = id;
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
  if (!databaseId.value) {
    return;
  }
  SmartLoading.show();
  databaseApi.getDatabaseTermDetail(databaseId.value)
    .then((res) => {
      const data = res.data || {};
      form.id = data.id;
      form.terms = data.terms;
      form.databaseCommentTerm = data.databaseCommentTerm;
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
    await databaseApi.addOrUpdateDatabaseTerm({
      id: form.id,
      databaseId: form.databaseId,
      terms: form.terms,
      databaseCommentTerm: form.databaseCommentTerm,
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
