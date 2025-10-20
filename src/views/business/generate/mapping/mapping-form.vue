<!--
  * 映射表
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-drawer
      :title="form.id ? '编辑' : '添加'"
      :width="1000"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
          
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" >
        <a-form-item label="映射名称"  name="name">
          <a-input style="width: 100%" v-model:value="form.name" placeholder="映射名称" />
        </a-form-item>
        <a-form-item label="映射编码"  name="code">
          <a-input style="width: 100%" v-model:value="form.code" placeholder="映射编码" />
        </a-form-item>
        <a-form-item label="备注"  name="remark">
          <a-input style="width: 100%" v-model:value="form.remark" placeholder="备注" />
        </a-form-item>
        <a-form-item label="排序"  name="sort">
          <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="" />
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
  import { reactive, ref, nextTick } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { mappingApi } from '/@/api/business/generate/mapping-api';
  import { smartSentry } from '/@/lib/smart-sentry';

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
      name: undefined, //映射名称
      code: undefined, //映射编码
      remark: undefined, //备注
      sort: undefined, //排序
  };

  let form = reactive({ ...formDefault });

  const rules = {
      id: [{ required: true, message: '主键 必填' }],
      name: [{ required: true, message: '映射名称 必填' }],
      code: [{ required: true, message: '映射编码 必填' }],
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
        await mappingApi.update(form);
      } else {
        await mappingApi.add(form);
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