<template>
  <a-modal :title="form.id ? '编辑' : '添加'" :width="1200" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true">
    <!---------- 表格操作行 begin ----------->
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
      <a-tab-pane key="1" tab="模板">
        <a-form ref="codeFormRef" :model="form" :rules="rules" :label-col="{ span: 4 }">
          <a-row>
            <a-col :span="8">
              <a-form-item label="目标模版" name="targetTemplateCodeId" :label-col="{ span: 6 }">
                <a-input-search v-model:value="targetTemplateCodeId" placeholder="目标模版" enter-button @search="onSyncOtherCode" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="公共模板" name="commonTemplateId" :label-col="{ span: 6 }">
                <a-select v-model:value="form.commonTemplateId" style="width: 100%" :showSearch="true" :allowClear="true">
                  <a-select-option v-for="item in commonTemplateList" :key="item.id" :value="item.id">
                    {{ item.templateName }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="同步" name="commonTemplateId" :label-col="{ span: 6 }">
                <BooleanSelect v-model:value="form.isSync" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="文件类型" name="fileType">
                <DictSelect width="100%" v-model:value="form.fileType" :dict-code="DICT_CODE_ENUM.FILE_TYPE || 'FILE_TYPE'" placeholder="文件类型" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="文件名" name="fileName">
                <a-input v-model:value="form.fileName" placeholder="文件名" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="文件路径" name="filePath" :label-col="{ span: 2 }">
                <a-input v-model:value="form.filePath" placeholder="文件路径" />
              </a-form-item>
            </a-col>
            <a-col :span="24" >
              <a-form-item label="文件内容" name="content" :label-col="{ span: 2 }">
                <div style="height: 400px">
                  <CusCodeMirror ref="codeMirrorRef" v-if="activeKey == 1" v-model:model-value="form.content" />
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="2" tab="测试" force-render>
        <div style="height: 400px">
          <CusCodeMirror v-if="activeKey == 2" ref="testCodeMirrorRef" v-model:model-value="testCode" />
        </div>
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
  import { nextTick, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { templateCodeItemApi } from '/@/api/business/generate/template-code-item-api.js';
  import { smartSentry } from '/@/lib/smart-sentry';
  import DictSelect from '/@/components/support/dict-select/index.vue';
  import CusCodeMirror from '/@/components/business/generate/CusCodeMirror.vue';
  import { DICT_CODE_ENUM } from '/@/constants/support/dict-const.js';
  import { showForm } from '/@/utils/form-util.js';
  import _ from 'lodash';
  import { templateCommonApi } from '/@/api/business/generate/template-common-api.js';
  import BooleanSelect from '/@/components/framework/boolean-select/index.vue';
  // ------------------------ 事件 ------------------------
  const testCode = ref('');
  const activeKey = ref('1');
  const emits = defineEmits(['reloadList']);
  const diffMatchPatchRef = ref();
  const targetTemplateCodeId = ref('');
  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);
  const codeFormRef = ref();

  const formDefault = {
    id: undefined,
    templateId: undefined,
    fileType: undefined,
    fileName: undefined,
    filePath: undefined,
    content: undefined,
    commonTemplateId: undefined,
    isSync: undefined,
  };

  const rules = {
    fileType: [{ required: true, message: '文件类型 必填' }],
    fileName: [{ required: true, message: '文件名 必填' }],
    filePath: [{ required: true, message: '文件路径 必填' }],
    content: [{ required: true, message: '文件内容 必填' }],
    isSync: [{ required: true, message: '同步 必填' }],
  };

  const commonTemplateList = ref([]);
  let form = reactive({ ...formDefault });

  // 获取公共模板列表
  async function getCommonTemplateList() {
    const commonTemplate4Null = {
      id: 0,
      templateName: '暂无',
    };
    try {
      const res = await templateCommonApi.queryPage({ pageNum: 1, pageSize: 100 });
      if (res.data.list) {
        commonTemplateList.value = [commonTemplate4Null].concat(res.data.list);
      } else {
        commonTemplateList.value = [commonTemplate4Null];
      }
    } catch (err) {
      smartSentry.captureError(err);
      commonTemplateList.value = [commonTemplate4Null];
    }
  }

  async function show(rowData) {
    Object.assign(form, formDefault);
    targetTemplateCodeId.value = '';
    if (rowData && !_.isEmpty(rowData)) {
      form.id = rowData.id;
      form.templateId = rowData.templateId;
      form.fileType = rowData.fileType;
      form.fileName = rowData.fileName;
      form.filePath = rowData.filePath;
      form.content = rowData.content;
      form.commonTemplateId = rowData.commonTemplateId;
      form.isSync = rowData.isSync;
    }
    activeKey.value = '1';
    // 先加载公共模板列表，再显示弹窗
    await getCommonTemplateList();
    visibleFlag.value = true;
    nextTick(() => {
      codeFormRef.value?.clearValidate();
    });
  }

  function onClose() {
    showForm(form, undefined, formDefault);
    visibleFlag.value = false;
  }

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
        templateCodeItemApi.test(form).then((res) => {
          testCode.value = res.data;
          // diffMatchPatchRef.value.updateCode(form.content, testCode.value);
        });
      });
    }
  }

  function onSyncOtherCode() {
    if (targetTemplateCodeId.value) {
      Modal.confirm({
        title: '提示',
        content: '确定要同步吗?',
        okText: '确认',
        okType: 'primary',
        onOk() {
          templateCodeItemApi.getDetail(targetTemplateCodeId.value).then((res) => {
            form.content = res.data.content;
            targetTemplateCodeId.value = '';
          });
        },
        cancelText: '取消',
        onCancel() {},
      });
    }
  }

  defineExpose({
    show,
  });
</script>
<style scoped></style>
