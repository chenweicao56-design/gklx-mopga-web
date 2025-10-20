<!--
  * 模板
  *
  * @Author:    gklx
  * @Date:      2025-09-05 14:10:43
  * @Copyright  gklx
-->
<template>
  <a-drawer
      :title="form.columnId ? '编辑' : '添加'"
      :width="1200"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-row>
        <a-col :span="12">
          <a-form-item label="字段名称" name="columnName">
            <a-input style="width: 100%" v-model:value="form.columnName" placeholder="字段名称"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字段类型" name="columnType">
            <a-input style="width: 100%" v-model:value="form.columnType" placeholder="字段类型"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字段注释" name="columnComment">
            <a-input style="width: 100%" v-model:value="form.columnComment" placeholder="字段注释"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否主键" name="isPk">
            <BooleanSelect v-model:value="form.isPk" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否自增" name="isIncrement">
            <BooleanSelect v-model:value="form.isIncrement" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否非空" name="isNull">
            <BooleanSelect v-model:value="form.isNull" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="默认值" name="columnDefault">
            <a-input style="width: 100%" v-model:value="form.columnDefault" placeholder="默认值"/>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="排序" name="sort">
            <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="排序"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字段名称" name="fieldName">
            <a-input style="width: 100%" v-model:value="form.fieldName" placeholder="字段名称"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字段注释" name="fieldComment">
            <a-input style="width: 100%" v-model:value="form.fieldComment" placeholder="字段注释"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字段类型" name="fieldType">
            <DictSelect width="100%" v-model:value="form.fieldType" :dict-code="DICT_CODE_ENUM.JAVA_FIELD_TYPE"
                        placeholder="字段类型"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="前端类型" name="jsType">
            <DictSelect width="100%" v-model:value="form.jsType" :dict-code="DICT_CODE_ENUM.FRONT_FIELD_TYPE"
                        placeholder="前端类型"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字典类型" name="dictType">
            <a-input style="width: 100%" v-model:value="form.dictType" placeholder="字典类型"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否必填" name="isRequired">
            <BooleanSelect v-model:value="form.isRequired" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否新增" name="isInsert">
            <BooleanSelect v-model:value="form.isInsert" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否修改" name="isUpdate">
            <BooleanSelect v-model:value="form.isUpdate" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="表格" name="isTable">
            <BooleanSelect v-model:value="form.isTable" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="前端组件" name="frontComponent">
            <DictSelect width="100%" v-model:value="form.frontComponent" :dict-code="'FRONT_COMPONENT'"
                        placeholder="前端组件"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否查询条件" name="isWhere">
            <BooleanSelect v-model:value="form.isWhere" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="查询类型" name="whereType">
            <DictSelect width="100%" v-model:value="form.whereType"
                        :dict-code="DICT_CODE_ENUM.WHERE_TYPE || 'WHERE_TYPE'" placeholder="查询类型"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否基类字段" name="isBase">
            <BooleanSelect v-model:value="form.isBase" style="width: 100%"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="枚举类型" name="enumType">
            <a-input style="width: 100%" v-model:value="form.enumType" placeholder="枚举类型"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="扩展字段" name="extendedData">
            <a-textarea style="width: 100%" v-model:value="form.extendedData" placeholder="扩展字段"/>
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
import {reactive, ref, nextTick} from 'vue';
import _, {cloneDeep} from 'lodash';
import {message} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {genTableColumnApi} from '/@/api/business/generate/gen-table-column-api';
import {smartSentry} from '/@/lib/smart-sentry';
import BooleanSelect from '/@/components/framework/boolean-select/index.vue';
import DictSelect from '/@/components/support/dict-select/index.vue';
import SmartEnumSelect from '/@/components/framework/smart-enum-select/index.vue';
import {DICT_CODE_ENUM} from '/@/constants/support/dict-const.js';

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
  columnId: undefined, //ID
  tableId: undefined, //表id
  databaseId: undefined, //数据源id
  columnName: undefined, //字段名称
  columnComment: undefined, //字段注释
  isPk: undefined, //是否主键（1是）
  isIncrement: undefined, //是否自增（1是）
  isNull: undefined, //是否为空（1是）
  columnDefault: undefined, //默认值
  columnType: undefined, //字段类型
  sort: undefined, //排序（越大越靠前）
  fieldName: undefined, //字段名称
  fieldComment: undefined, //字段注释
  fieldType: undefined, //字段类型
  jsType: undefined, //前端类型
  dictType: undefined, //字典类型
  isRequired: undefined, //是否必填（1是）
  isInsert: undefined, //是否新增
  isUpdate: undefined, //是否修改
  isTable: undefined, //是否修改
  frontComponent: undefined, //前端组件
  isWhere: undefined, //是否查询条件
  whereType: undefined, //查询类型
  extendedData: undefined, //扩展字段
  isBase: undefined, //是否基类字段
  enumType: undefined, //枚举类型
};

let form = reactive({...formDefault});

const rules = {
  tableId: [{required: true, message: '表id 必填'}],
  databaseId: [{required: true, message: '数据源id 必填'}],
  columnName: [{required: true, message: '字段名称 必填'}],
  columnComment: [{required: true, message: '字段注释 必填'}],
  isPk: [{required: true, message: '是否主键（1是） 必填'}],
  isIncrement: [{required: true, message: '是否自增（1是） 必填'}],
  isNull: [{required: true, message: '是否为空（1是） 必填'}],
  columnType: [{required: true, message: '字段类型 必填'}],
  sort: [{required: true, message: '排序（越大越靠前） 必填'}],
  fieldName: [{required: true, message: '字段名称 必填'}],
  fieldComment: [{required: true, message: '字段注释 必填'}],
  fieldType: [{required: true, message: '字段类型 必填'}],
  jsType: [{required: true, message: '前端类型 必填'}],
  isRequired: [{required: true, message: '是否必填（1是） 必填'}],
  isInsert: [{required: true, message: '是否新增 必填'}],
  isUpdate: [{required: true, message: '是否修改 必填'}],
  isTable: [{required: true, message: '是否表格 必填'}],
  frontComponent: [{required: true, message: '前端组件 必填'}],
  isWhere: [{required: true, message: '是否查询条件 必填'}],
  isBase: [{required: true, message: '是否基类字段 必填'}],
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
    if (form.columnId) {
      await genTableColumnApi.update(form);
    } else {
      await genTableColumnApi.add(form);
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
