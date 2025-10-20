<template>
  <a-modal
      :title="form.id ? '编辑' : '添加'"
      :width="1200"
      :open="visibleFlag"
      @cancel="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <!---------- 表格操作行 begin ----------->
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
      <a-tab-pane key="1" tab="模板">
        <a-form ref="codeFormRef" :model="form" :rules="rules">
          <a-row>
            <a-col :span="11">
              <a-form-item label="文件类型" name="fileType">
                <DictSelect width="100%" v-model:value="form.fileType"
                            :dict-code="DICT_CODE_ENUM.FILE_TYPE || 'FILE_TYPE'" placeholder="文件类型"/>
              </a-form-item>
            </a-col>
            <a-col :span="11" :offset="2">
              <a-form-item label="文件名" name="fileName">
                <a-input v-model:value="form.fileName" placeholder="文件名"/>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="文件路径" name="filePath">
                <a-input v-model:value="form.filePath" placeholder="文件路径"/>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="文件内容" name="content">
                <CusCodeMirror ref="codeMirrorRef" v-model:model-value="form.content" :height="'500px'"/>
              </a-form-item>
            </a-col>
          </a-row>

        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="测试" force-render>
<!--        <CusDiffMatchPatch ref="diffMatchPatchRef" />-->
        <CusCodeMirror ref="testCodeMirrorRef" v-model:model-value="testCode" :height="'500px'"/>
      </a-tab-pane>
    </a-tabs>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup>
import {nextTick, reactive, ref} from 'vue';
import {message} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {templateCodeItemApi} from '/@/api/business/generate/template-code-item-api.js';
import {smartSentry} from '/@/lib/smart-sentry';
import DictSelect from '/@/components/support/dict-select/index.vue';
import CusCodeMirror from '/@/components/business/generate/CusCodeMirror.vue';
import {DICT_CODE_ENUM} from '/@/constants/support/dict-const.js';
import {showForm} from "/@/utils/form-util.js";
import _ from "lodash";
// ------------------------ 事件 ------------------------
const testCode = ref('');
const activeKey = ref("1");
const emits = defineEmits(['reloadList']);
const diffMatchPatchRef = ref();
// ------------------------ 显示与隐藏 ------------------------
// 是否显示
const visibleFlag = ref(false);
const codeFormRef = ref();

function show(rowData) {
  Object.assign(form, formDefault);
  if (rowData && !_.isEmpty(rowData)) {
    form.id = rowData.id;
    form.templateId = rowData.templateId;
    form.fileType = rowData.fileType;
    form.fileName = rowData.fileName;
    form.filePath = rowData.filePath;
    form.content = rowData.content;
  }
  activeKey.value = "1";
  visibleFlag.value = true;
  nextTick(() => {
    codeFormRef.value.clearValidate();
  });
}

function onClose() {
  showForm(form, undefined, formDefault)
  visibleFlag.value = false;
}

const formDefault = {
  id: undefined,
  templateId: undefined,
  fileType: undefined,
  fileName: undefined,
  filePath: undefined,
  content: undefined
};

const rules = {
  fileType: [{required: true, message: '文件类型 必填'}],
  fileName: [{required: true, message: '文件名 必填'}],
  filePath: [{required: true, message: '文件路径 必填'}],
  content: [{required: true, message: '文件内容 必填'}],
};
let form = reactive({...formDefault});


// 点击确定，验证表单
async function onSubmit() {
  try {
    await codeFormRef.value.validateFields();
    await save();
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

// 新建、编辑API
async function save() {
  SmartLoading.show();
  try {
    if (form.id) {
      await templateCodeItemApi.update(form);
    } else {
      await templateCodeItemApi.add(form);
    }
    message.success('操作成功');
    emits('reloadList');
    onClose();
  } catch (err) {
    smartSentry.captureError(err);
  } finally {
    SmartLoading.hide();
  }
}
function handleTabChange(key) {
  if (key === '2') {
    nextTick(() => {
      templateCodeItemApi.test(form).then(res => {
        testCode.value = res.data;
        // diffMatchPatchRef.value.updateCode(form.content, testCode.value);
      })
    });
  }
}
defineExpose({
  show,
});
</script>
<style scoped>

</style>
