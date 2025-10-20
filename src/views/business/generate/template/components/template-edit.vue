<template>
  <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">

    <a-form-item label="模板名称" name="templateName">
      <a-input style="width: 100%" v-model:value="form.templateName" placeholder="模板名称"/>
    </a-form-item>
    <a-form-item label="模板类型" name="templateType">
      <DictSelect width="100%" v-model:value="form.templateType"
                  :dict-code="DICT_CODE_ENUM.TEMPLATE_TYPE || 'TEMPLATE_TYPE'" placeholder="模板类型"/>
    </a-form-item>
    <a-form-item label="数据源类型" name="databaseType">
      <DictSelect width="100%" v-model:value="form.databaseType"
                  :dict-code="DICT_CODE_ENUM.DATABASE_TYPE || 'DATABASE_TYPE'" placeholder="数据源类型"/>
    </a-form-item>
    <a-form-item label="语言类型" name="languageType">
      <DictSelect width="100%" v-model:value="form.languageType"
                  :dict-code="DICT_CODE_ENUM.LANGUAGE_TYPE || 'LANGUAGE_TYPE'" placeholder="语言类型"/>
    </a-form-item>
    <a-form-item label="项目路径" name="projectPath">
      <a-input style="width: 100%" v-model:value="form.projectPath" placeholder="项目路径"/>
    </a-form-item>
    <a-form-item label="备注" name="remark">
      <a-input style="width: 100%" v-model:value="form.remark" placeholder="备注"/>
    </a-form-item>
    <a-form-item label="排序" name="sort">
      <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="排序"/>
    </a-form-item>
  </a-form>

</template>

<script setup>
import {DICT_CODE_ENUM} from "/src/constants/support/dict-const.js";
import DictSelect from "/src/components/support/dict-select/index.vue";
import {nextTick, reactive, ref, watch} from "vue";
import _ from "lodash";
import {message} from "ant-design-vue";
import {SmartLoading} from "/src/components/framework/smart-loading/index.js";
import {templateApi} from "/src/api/business/generate/template-api.js";
import {smartSentry} from "/src/lib/smart-sentry.js";
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

let form = reactive({...formDefault});
const rules = {
  templateName: [{required: true, message: '模板名称 必填'}],
  templateType: [{required: true, message: '模板类型 必填'}],
  databaseType: [{required: true, message: '数据源类型 必填'}],
  languageType: [{required: true, message: '语言类型 必填'}],
};

//初始化设置数据
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
  nextTick(() => {
    formRef.value.clearValidate();
  });
}

function onClose() {
  Object.assign(form, formDefault);
}


async function onSubmit() {
  try {
    await formRef.value.validateFields();
    await save();
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

async function save() {
  SmartLoading.show();
  try {
    if (form.id) {
      await templateApi.update(form);
    } else {
      await templateApi.add(form);
    }
    message.success('操作成功');
  } catch (err) {
    smartSentry.captureError(err);
  } finally {
    SmartLoading.hide();
  }
}

defineExpose({
  show,
  onSubmit,
  onClose,
});

</script>

<style lang="less" scoped>

</style>
