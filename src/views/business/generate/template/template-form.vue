<!--
  * 模板表
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-modal title="快速复制" :width="1000" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item label="模板名称" name="templateName">
        <a-input style="width: 100%" v-model:value="form.templateName" placeholder="模板名称" />
      </a-form-item>
      <a-form-item label="模板类型" name="templateType">
        <DictSelect width="100%" v-model:value="form.templateType" :dict-code="DICT_CODE_ENUM.TEMPLATE_TYPE" placeholder="模板类型" />
      </a-form-item>
      <a-form-item label="数据源类型" name="databaseType">
        <a-input style="width: 100%" v-model:value="form.databaseType" placeholder="数据源类型" />
      </a-form-item>
      <a-form-item label="语言类型" name="languageType">
        <a-input style="width: 100%" v-model:value="form.languageType" placeholder="语言类型" />
      </a-form-item>
      <a-form-item label="项目路径" name="projectPath">
        <a-input style="width: 100%" v-model:value="form.projectPath" placeholder="项目路径" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-input style="width: 100%" v-model:value="form.remark" placeholder="备注" />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup>
  import { nextTick, reactive, ref } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/src/components/framework/smart-loading';
  import { templateApi } from '/@/api/business/generate/template-api';
  import { smartSentry } from '/src/lib/smart-sentry';
  import { DICT_CODE_ENUM } from '/@/constants/support/dict-const.js';
  import DictSelect from '/@/components/support/dict-select/index.vue';

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      form.id = rowData.id;
      form.templateName = rowData.templateName;
      form.templateType = rowData.templateType;
      form.databaseType = rowData.databaseType;
      form.languageType = rowData.languageType;
      form.projectPath = rowData.projectPath;
      form.remark = rowData.remark;
      form.sort = rowData.sort;
    }
    visibleFlag.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    emits('reloadList');
    visibleFlag.value = false;
  }

  // ------------------------ 表单 ------------------------

  // 组件ref
  const formRef = ref();

  const formDefault = {
    id: undefined, //ID
    templateName: undefined, //模板名称
    templateType: undefined, //模板类型
    databaseType: undefined, //数据源类型
    languageType: undefined, //语言类型
    projectPath: undefined, //项目路径
    remark: undefined, //备注
    sort: undefined, //排序
  };

  let form = reactive({ ...formDefault });

  const rules = {
    id: [{ required: true, message: 'ID 必填' }],
    templateName: [{ required: true, message: '模板名称 必填' }],
    templateType: [{ required: true, message: '模板类型 必填' }],
    databaseType: [{ required: true, message: '数据源类型 必填' }],
    languageType: [{ required: true, message: '语言类型 必填' }],
  };

  // 点击确定，验证表单
  async function onSubmit() {
    try {
      await formRef.value.validateFields();
      await save();
    } catch (err) {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  // 新建、编辑API
  async function save() {
    SmartLoading.show();
    try {
      await templateApi.copy(form);
      message.success('操作成功');
      onClose();
    } catch (err) {
      smartSentry.captureError(err);
    } finally {
      SmartLoading.hide();
    }
  }

  defineExpose({
    show,
  });
</script>
