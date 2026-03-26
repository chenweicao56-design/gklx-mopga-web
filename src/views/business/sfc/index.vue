<template>
  <div class="h-full flex flex-col">
    <div>
      <a-form ref="formRef" :rules="rules" class="smart-query-form">
        <a-row class="smart-query-form-row">
          <a-form-item label="接口地址" class="smart-query-form-item">
            <a-input style="width: 300px" v-model:value="form.genPluginUrl" placeholder="接口地址" />
          </a-form-item>
          <a-form-item label="组件名称" class="smart-query-form-item">
            <a-input style="width: 300px" v-model:value="form.componentName" placeholder="组件名称" />
          </a-form-item>
          <a-form-item label="同步位置" class="smart-query-form-item">
            <a-input style="width: 300px" v-model:value="form.syncLocation" placeholder="同步位置" />
          </a-form-item>

          <a-form-item class="smart-query-form-item">
            <a-button type="primary" @click="onSubmit">同步</a-button>
            <GifButton class="ml-4" @click="startAi" />
          </a-form-item>
        </a-row>
      </a-form>
    </div>
    <div style="flex: 1">
      <VueLoader :code="form.code" v-if="form.code" />
    </div>

    <div class="mt-4" style="overflow: auto; height: 500px">
      <CusCodeMirror ref="cusCodeMirrorRef" v-model:model-value="form.code" height="500px" />
    </div>
  </div>
</template>

<script setup>
  import VueLoader from '/src/components/business/generate/vue-loader.vue';
  import CusCodeMirror from '/@/components/business/generate/CusCodeMirror.vue';
  import { inject, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { generateApi } from '/@/api/business/generate/generate-api.js';

  const emitter = inject('emitter');
  const genPluginUrl = ref('http://127.0.0.1:1024');
  const formRef = ref();
  const tmp = `<template>
<div>1234</div>
<a-button type="primary">Primary Button</a-button>
<TestV1/>
<div>{{convertLowerCamel(test)}}</div>
</template>

<script setup>
import TestV1 from '/@/components/business/generate/test_v1.vue';
import { convertLowerCamel } from '/@/utils/str-util';
import {ref} from 'vue'
const test = ref("ello_world")
<\/script>

<style scoped lang="less">
<\/style>`;

  const formDefault = {
    code: tmp,
    componentName: undefined,
    syncLocation: undefined,
    genPluginUrl: 'http://127.0.0.1:1024',
  };

  const rules = {
    componentName: [{ required: true, message: '请输入 组件名称' }],
    syncLocation: [{ required: true, message: '请输入 同步位置' }],
  };

  let form = reactive({ ...formDefault });

  async function onSubmit() {
    try {
      await formRef.value.validateFields();
      syncSave();
    } catch (err) {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  function syncSave() {
    Modal.confirm({
      title: '提示',
      content: '确定要覆盖本地吗?',
      okText: '确认',
      okType: 'primary',
      onOk() {
        let files = [
          {
            filePath: form.syncLocation,
            fileContent: form.code,
          },
        ];
        generateApi.coverCode(genPluginUrl.value, files).then((res) => {
          message.success('保存成功');
        });
        // console.log(ft)
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  function startAi() {
    emitter.emit('ai-send', { agentAlias: 'vueGenerateAgentService', data: JSON.stringify(form) });
  }
</script>

<style scoped></style>
