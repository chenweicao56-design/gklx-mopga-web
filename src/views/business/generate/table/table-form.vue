<!--
  * 表
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-drawer
      :title="form.tableId ? '编辑' : '添加'"
      :width="1200"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" >
      <a-row>
        <a-col :span="12">
          <a-form-item label="表名称"  name="tableName">
            <a-input style="width: 100%" v-model:value="form.tableName" placeholder="表名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="表注释"  name="tableComment">
            <a-input style="width: 100%" v-model:value="form.tableComment" placeholder="表注释" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="后端作者"  name="backendAuthor">
            <a-input style="width: 100%" v-model:value="form.backendAuthor" placeholder="后端作者" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="后端日期"  name="backendDate">
            <a-date-picker show-time valueFormat="YYYY-MM-DD HH:mm:ss" v-model:value="form.backendDate" style="width: 100%" placeholder="后端日期" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="版权"  name="copyright">
            <a-input style="width: 100%" v-model:value="form.copyright" placeholder="版权" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="前端作者"  name="frontAuthor">
            <a-input style="width: 100%" v-model:value="form.frontAuthor" placeholder="前端作者" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="前端日期"  name="frontDate">
            <a-date-picker show-time valueFormat="YYYY-MM-DD HH:mm:ss" v-model:value="form.frontDate" style="width: 100%" placeholder="前端日期" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="包名"  name="packageName">
            <a-input style="width: 100%" v-model:value="form.packageName" placeholder="包名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="模块名"  name="moduleName">
            <a-input style="width: 100%" v-model:value="form.moduleName" placeholder="模块名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="逻辑删除"  name="isPhysicallyDeleted">
            <BooleanSelect v-model:value="form.isPhysicallyDeleted" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="单词名"  name="wordName">
            <a-input style="width: 100%" v-model:value="form.wordName" placeholder="单词名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="表前缀"  name="tablePrefix">
            <a-input style="width: 100%" v-model:value="form.tablePrefix" placeholder="表前缀" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否分页"  name="isPage">
            <BooleanSelect v-model:value="form.isPage" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否详情"  name="isDetail">
            <BooleanSelect v-model:value="form.isDetail" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否增加"  name="isAdd">
            <BooleanSelect v-model:value="form.isAdd" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否修改"  name="isUpdate">
            <BooleanSelect v-model:value="form.isUpdate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否删除"  name="isDelete">
            <BooleanSelect v-model:value="form.isDelete" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否批量删除"  name="isBatchDelete">
            <BooleanSelect v-model:value="form.isBatchDelete" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否导入"  name="isImport">
            <BooleanSelect v-model:value="form.isImport" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否导出"  name="isExport">
            <BooleanSelect v-model:value="form.isExport" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否树"  name="isTree">
            <BooleanSelect v-model:value="form.isTree" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="权限"  name="permission">
            <a-input-number style="width: 100%" v-model:value="form.permission" placeholder="权限" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="编辑组件"  name="editComponent">
            <DictSelect width="100%" v-model:value="form.editComponent" :dict-code="DICT_CODE_ENUM.FRONT_EDIT_COMPONENT || 'FRONT_EDIT_COMPONENT'" placeholder="编辑组件"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="每行几个表单"  name="formCountLine">
            <a-input-number style="width: 100%" v-model:value="form.formCountLine" placeholder="每行几个表单" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="排序"  name="sort">
            <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="排序（越大越靠前）" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="扩展字段"  name="extendedData">
            <a-textarea style="width: 100%" v-model:value="form.extendedData" placeholder="扩展字段" />
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
  import _, {cloneDeep} from 'lodash';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { tableApi } from '/@/api/business/generate/table-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { DICT_CODE_ENUM } from '/@/constants/support/dict-const.js';
  import BooleanSelect from '/@/components/framework/boolean-select/index.vue';
  import DictSelect from "/@/components/support/dict-select/index.vue";
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
      tableId: undefined, //ID
      databaseId: undefined, //数据源Id
      tableName: undefined, //表名称
      tableComment: undefined, //表注释
      sort: undefined, //排序（越大越靠前）
      backendAuthor: undefined, //后端作者
      backendDate: undefined, //后端日期
      copyright: undefined, //版权
      frontAuthor: undefined, //前端作者
      frontDate: undefined, //前端日期
      packageName: undefined, //包名
      moduleName: undefined, //模块名
      isPhysicallyDeleted: undefined, //逻辑删除
      wordName: undefined, //单词名
      tablePrefix: undefined, //表前缀
      extendedData: undefined, //扩展字段
      isPage: undefined, //是否分页（1是）
      isDetail: undefined, //是否详情（1是）
      isAdd: undefined, //是否增加（1是）
      isUpdate: undefined, //是否修改（1是）
      isDelete: undefined, //是否删除（1是）
      isBatchDelete: undefined, //是否批量删除（1是）
      editComponent: undefined, //编辑组件
      formCountLine: undefined, //每行几个表单
      isTree: undefined, //是否是树
      isImport: undefined, //是否导入
      isExport: undefined, //是否导出
      subTableName: undefined, //子表名称
      permission: undefined, //权限（0没有）
  };

  let form = reactive({ ...formDefault });

  const rules = {
      databaseId: [{ required: true, message: '数据源Id 必填' }],
      tableName: [{ required: true, message: '表名称 必填' }],
      backendAuthor: [{ required: true, message: '后端作者 必填' }],
      backendDate: [{ required: true, message: '后端日期 必填' }],
      copyright: [{ required: true, message: '版权 必填' }],
      frontAuthor: [{ required: true, message: '前端作者 必填' }],
      frontDate: [{ required: true, message: '前端日期 必填' }],
      packageName: [{ required: true, message: '包名 必填' }],
      moduleName: [{ required: true, message: '模块名 必填' }],
      isPhysicallyDeleted: [{ required: true, message: '逻辑删除 必填' }],
      wordName: [{ required: true, message: '单词名 必填' }],
      isPage: [{ required: true, message: '是否分页（1是） 必填' }],
      isDetail: [{ required: true, message: '是否详情（1是） 必填' }],
      isAdd: [{ required: true, message: '是否增加（1是） 必填' }],
      isUpdate: [{ required: true, message: '是否修改（1是） 必填' }],
      isDelete: [{ required: true, message: '是否删除（1是） 必填' }],
      isBatchDelete: [{ required: true, message: '是否批量删除（1是） 必填' }],
      editComponent: [{ required: true, message: '编辑组件 必填' }],
      formCountLine: [{ required: true, message: '每行几个表单 必填' }],
      isTree: [{ required: true, message: '是否是树 必填' }],
      isImport: [{ required: true, message: '是否导入 必填' }],
      isExport: [{ required: true, message: '是否导出 必填' }],
      permission: [{ required: true, message: '权限必填' }],
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
      if (form.tableId) {
        await tableApi.update(form);
      } else {
        await tableApi.add(form);
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
