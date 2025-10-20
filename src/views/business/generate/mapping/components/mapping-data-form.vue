<!--
  * 映射数据表
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-modal
      :title="form.id ? '编辑' : '添加'"
      :width="1000"
      :open="visibleFlag"
      @cancel="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >

    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" >
        <a-form-item label="数据库字段类型"  name="databaseFieldType">
          <a-input style="width: 100%" v-model:value="form.databaseFieldType" placeholder="数据库字段类型" />
        </a-form-item>
        <a-form-item label="JAVA字段类型"  name="javaFieldType">
          <a-input style="width: 100%" v-model:value="form.javaFieldType" placeholder="JAVA字段类型" />
        </a-form-item>
        <a-form-item label="前端字段类型"  name="frontFieldType">
          <a-input style="width: 100%" v-model:value="form.frontFieldType" placeholder="前端字段类型" />
        </a-form-item>
        <a-form-item label="前端组件"  name="frontComponent">
          <a-input style="width: 100%" v-model:value="form.frontComponent" placeholder="前端组件" />
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
  </a-modal>
</template>

<script setup>
  import { reactive, ref, nextTick } from 'vue';
  import _ from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/src/components/framework/smart-loading';
  import { mappingDataApi } from '/src/api/business/generate/mapping-data-api';
  import { smartSentry } from '/src/lib/smart-sentry';

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(rowData,mappingCode) {
    Object.assign(form, formDefault);
    form.mappingCode = mappingCode;
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
      mappingCode: undefined, //映射编码
      databaseFieldType: undefined, //数据库字段类型
      javaFieldType: undefined, //java字段类型
      frontFieldType: undefined, //前端字段类型
      frontComponent: undefined, //前端组件
      remark: undefined, //备注
      sort: undefined, //排序
  };

  let form = reactive({ ...formDefault });

  const rules = {
      id: [{ required: true, message: '主键 必填' }],
      mappingCode: [{ required: true, message: '映射编码 必填' }],
      databaseFieldType: [{ required: true, message: '数据库字段类型 必填' }],
      javaFieldType: [{ required: true, message: 'JAVA字段类型 必填' }],
      frontFieldType: [{ required: true, message: '前端字段类型 必填' }],
      frontComponent: [{ required: true, message: '前端组件 必填' }],
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
        await mappingDataApi.update(form);
      } else {
        await mappingDataApi.add(form);
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
