<!--
  * 数据源表
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

    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" >
      <a-row>
        <a-col :span="12">
          <a-form-item label="名称"  name="databaseName">
            <a-input style="width: 100%" v-model:value="form.databaseName" placeholder="名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="代码模板" name="templateId">
            <a-select v-model:value="form.templateId" style="width: 100%" :showSearch="true" :allowClear="true">
              <a-select-option v-for="item in templateDict" :key="item.dataValue" :value="item.dataValue">
                {{ item.dataLabel }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="数据源类型"  name="databaseType">
            <a-input style="width: 100%" v-model:value="form.databaseType" placeholder="类型" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="语言类型"  name="languageType">
            <a-input style="width: 100%" v-model:value="form.languageType" placeholder="语言类型" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="数据源地址"  name="url">
            <a-input style="width: 100%" v-model:value="form.url" placeholder="数据源地址" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="用户名"  name="userName">
            <a-input style="width: 100%" v-model:value="form.userName" placeholder="用户名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="密码"  name="password">
            <a-input style="width: 100%" v-model:value="form.password" placeholder="密码" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="超时时间"  name="timeout">
            <a-input-number style="width: 100%" v-model:value="form.timeout" placeholder="超时时间" />
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
          <a-form-item label="后端项目路径"  name="backendProjectPath">
            <a-input style="width: 100%" v-model:value="form.backendProjectPath" placeholder="后端项目路径" />
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
          <a-form-item label="前端项目路径"  name="frontProjectPath">
            <a-input style="width: 100%" v-model:value="form.frontProjectPath" placeholder="前端项目路径" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="版权"  name="copyright">
            <a-input style="width: 100%" v-model:value="form.copyright" placeholder="版权" />
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
          <a-form-item label="编辑组件"  name="editComponent">
            <DictSelect width="100%" v-model:value="form.editComponent"
                        :dict-code="DICT_CODE_ENUM.FRONT_EDIT_COMPONENT || 'FRONT_EDIT_COMPONENT'"
                        placeholder="编辑组件"/>          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="每行几个表单"  name="formCountLine">
            <a-input-number style="width: 100%" v-model:value="form.formCountLine" placeholder="每行几个表单" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="表扩展字段" name="tableExtendedData" :label-col="{ span: 3 }">
            <a-textarea style="width: 100%" v-model:value="form.tableExtendedData" placeholder="表扩展字段"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="字段扩展字段" name="columnExtendedData" :label-col="{ span: 3 }">
            <a-textarea style="width: 100%" v-model:value="form.columnExtendedData" placeholder="字段扩展字段"/>
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
import {reactive, ref, nextTick, onMounted} from 'vue';
import _ from 'lodash';
import {message} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {databaseApi} from '/@/api/business/generate/database-api';
import {templateApi} from '/@/api/business/generate/template-api.js';
import {smartSentry} from '/@/lib/smart-sentry';
import BooleanSelect from '/@/components/framework/boolean-select/index.vue';
import DictSelect from '/@/components/support/dict-select/index.vue';
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
  id: undefined, //ID
  databaseName: undefined, //名称
  databaseType: undefined, //类型
  languageType: undefined, //语言类型
  url: undefined, //数据源地址
  userName: undefined, //用户名
  password: undefined, //密码
  timeout: undefined, //超时时间
  backendAuthor: undefined, //后端作者
  backendDate: undefined, //后端日期
  backendProjectPath: undefined, //后端项目路径
  frontAuthor: undefined, //前端作者
  frontDate: undefined, //前端日期
  frontProjectPath: undefined, //前端项目路径
  copyright: undefined, //版权
  packageName: undefined, //包名
  moduleName: undefined, //模块名
  tableExtendedData: undefined, //表扩展字段
  columnExtendedData: undefined, //字段扩展字段
  isPhysicallyDeleted: undefined, //逻辑删除
  templateId: undefined, //模板id
  tablePrefix: undefined, //表前缀
  isPage: undefined, //是否分页（1是）
  isDetail: undefined, //是否详情（1是）
  isAdd: undefined, //是否增加（1是）
  isUpdate: undefined, //是否修改（1是）
  isDelete: undefined, //是否删除（1是）
  isBatchDelete: undefined, //是否批量删除（1是）
  editComponent: undefined, //编辑组件
  formCountLine: undefined, //每行几个表单
};

let form = reactive({ ...formDefault });

const rules = {
  databaseName: [{ required: true, message: '名称 必填' }],
  databaseType: [{ required: true, message: '类型 必填' }],
  languageType: [{ required: true, message: '语言类型 必填' }],
  templateId: [{required: true, message: '语言类型 必填'}],
  url: [{ required: true, message: '数据源地址 必填' }],
  userName: [{ required: true, message: '用户名 必填' }],
  password: [{ required: true, message: '密码 必填' }],
  timeout: [{ required: true, message: '超时时间 必填' }],
  backendAuthor: [{ required: true, message: '后端作者 必填' }],
  frontAuthor: [{ required: true, message: '前端作者 必填' }],
  copyright: [{ required: true, message: '版权 必填' }],
  packageName: [{ required: true, message: '包名 必填' }],
  moduleName: [{ required: true, message: '模块名 必填' }],
  isPhysicallyDeleted: [{ required: true, message: '逻辑删除 必填' }],
  isPage: [{ required: true, message: '是否分页（1是） 必填' }],
  isDetail: [{ required: true, message: '是否详情（1是） 必填' }],
  isAdd: [{ required: true, message: '是否增加（1是） 必填' }],
  isUpdate: [{ required: true, message: '是否修改（1是） 必填' }],
  isDelete: [{ required: true, message: '是否删除（1是） 必填' }],
  isBatchDelete: [{ required: true, message: '是否批量删除（1是） 必填' }],
  editComponent: [{ required: true, message: '编辑组件 必填' }],
  formCountLine: [{ required: true, message: '每行几个表单 必填' }],
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
      await databaseApi.update(form);
    } else {
      await databaseApi.add(form);
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

onMounted(() => {
  GetTemplates()
});
const templateDict = ref([])

function GetTemplates() {
  templateApi.queryPage({
    pageNum: 1,
    pageSize: 500,
  }).then(res => {
    let templateDictTmp = []
    if (res.data.list) {
      res.data.list.forEach(item => {
        templateDictTmp.push({"dataLabel": item.templateName, "dataValue": item.id})
      })
    }
    console.log(templateDictTmp)
    templateDict.value = templateDictTmp
  })
}

defineExpose({
  show,
});

</script>
