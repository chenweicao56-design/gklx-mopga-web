<!--
  * 公共模板
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-drawer
      :title="form.id ? '编辑' : '添加'"
      :width="1200"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" >
      <a-row>
        <a-col :span="8">
          <a-form-item label="文件类型"  name="fileType">
            <DictSelect width="100%" v-model:value="form.fileType" :dict-code="DICT_CODE_ENUM.FILE_TYPE" placeholder="文件类型"/>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="类别"  name="category">
            <DictSelect width="100%" v-model:value="form.category" :dict-code="DICT_CODE_ENUM.FILE_TYPE" placeholder="类别"/>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="排序"  name="sort">
            <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="排序" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="模板内容"  name="content" :label-col="{ span: 2 }">
            <CodeMirror ref="cusCodeMirrorRef" lang="java" :code="form.content" height="650px" />
          </a-form-item>
        </a-col>
      </a-row>
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
  import { reactive, ref, nextTick } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { templateCommonApi } from '/@/api/business/generate/template-common-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import DictSelect from '/@/components/support/dict-select/index.vue';
  import { DICT_CODE_ENUM } from '/@/constants/support/dict-const.js';
  import CodeMirror from '/@/components/business/generate/code-mirror/index.vue';
  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    // 使用字典时把下面这注释修改成自己的字典字段 有多个字典字段就复制多份同理修改 不然打开表单时不显示字典初始值
    // if (form.status && form.status.length > 0) {
    //   form.status = form.status.map((e) => e.valueCode);
    // }
    visibleFlag.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visibleFlag.value = false;
  }

  // ------------------------ 表单 ------------------------

  // 组件ref
  const formRef = ref();

  const formDefault = {
      id: undefined, //主键
      createUserId: undefined, //创建人
      createTime: undefined, //创建时间
      updateUserId: undefined, //更新人
      updateTime: undefined, //更新时间
      deletedFlag: undefined, //删除状态
      content: undefined, //模板内容
      fileType: undefined, //文件类型
      category: undefined, //类别
      sort: undefined, //排序
  };

  let form = reactive({ ...formDefault });

  const rules = {
      id: [{ required: true, message: '主键 必填' }],
      fileType: [{ required: true, message: '文件类型 必填' }],
  };

  // 点击确定，验证表单
  async function onSubmit() {
    try {
      await formRef.value.validateFields();
      save();
    } catch (err) {
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }

  // 新建、编辑API
  async function save() {
    SmartLoading.show();
    try {
      if (form.id) {
        await templateCommonApi.update(form);
      } else {
        await templateCommonApi.add(form);
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

  defineExpose({
    show,
  });
</script>
