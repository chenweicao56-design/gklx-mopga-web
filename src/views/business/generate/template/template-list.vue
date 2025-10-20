<!--
  * 模板表
  *
  * @Author:    gklx
  * @Date:      2025-09-09 15:50:25
  * @Copyright  gklx
-->
<template>
  <!---------- 查询表单form begin ----------->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="模板名称" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.templateName" placeholder="模板名称"/>
      </a-form-item>
      <a-form-item label="数据源类型" class="smart-query-form-item">
        <DictSelect :dict-code="DICT_CODE_ENUM.DATABASE_TYPE || 'DATABASE_TYPE'" placeholder="数据源类型"
                    v-model:value="queryForm.databaseType" width="200px"/>
      </a-form-item>
      <a-form-item label="语言类型" class="smart-query-form-item">
        <DictSelect :dict-code="DICT_CODE_ENUM.LANGUAGE_TYPE || 'LANGUAGE_TYPE'" placeholder="语言类型"
                    v-model:value="queryForm.languageType" width="200px"/>
      </a-form-item>
      <a-form-item label="模板类型" class="smart-query-form-item">
        <DictSelect :dict-code="DICT_CODE_ENUM.TEMPLATE_TYPE || 'TEMPLATE_TYPE'" placeholder="模板类型"
                    v-model:value="queryForm.templateType" width="200px"/>
      </a-form-item>
      <a-form-item class="smart-query-form-item">
        <a-button type="primary" @click="onSearch">
          <template #icon>
            <SearchOutlined/>
          </template>
          查询
        </a-button>
        <a-button @click="resetQuery" class="smart-margin-left10">
          <template #icon>
            <ReloadOutlined/>
          </template>
          重置
        </a-button>
      </a-form-item>
    </a-row>
  </a-form>
  <!---------- 查询表单form end ----------->

  <a-card size="small" :bordered="false" :hoverable="true">
    <!---------- 表格操作行 begin ----------->
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="showForm" type="primary" size="small">
          <template #icon>
            <PlusOutlined/>
          </template>
          新建
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="null" :refresh="queryData"/>
      </div>
    </a-row>
    <!---------- 表格操作行 end ----------->

    <!---------- 表格 begin ----------->
    <a-table
        size="small"
        :scroll="{ y: 800 }"
        :dataSource="tableData"
        :columns="columns"
        rowKey="id"
        bordered
        :loading="tableLoading"
        :pagination="false"
    >
      <template #bodyCell="{ text, record, column }">

        <template v-if="column.dataIndex === 'templateType'">
          <DictLabel :dict-code="DICT_CODE_ENUM.TEMPLATE_TYPE || 'TEMPLATE_TYPE'" :data-value="text"/>
        </template>
        <template v-if="column.dataIndex === 'databaseType'">
          <DictLabel :dict-code="DICT_CODE_ENUM.DATABASE_TYPE || 'DATABASE_TYPE'" :data-value="text"/>
        </template>
        <template v-if="column.dataIndex === 'languageType'">
          <DictLabel :dict-code="DICT_CODE_ENUM.LANGUAGE_TYPE || 'LANGUAGE_TYPE'" :data-value="text"/>
        </template>

        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showForm(record)" type="link">编辑</a-button>
            <a-button @click="copyForm(record)" type="link">复制</a-button>
            <a-button @click="onDelete(record)" danger type="link">删除</a-button>
          </div>
        </template>
      </template>
    </a-table>
    <!---------- 表格 end ----------->

    <div class="smart-query-table-page">
      <a-pagination
          showSizeChanger
          showQuickJumper
          show-less-items
          :pageSizeOptions="PAGE_SIZE_OPTIONS"
          :defaultPageSize="queryForm.pageSize"
          v-model:current="queryForm.pageNum"
          v-model:pageSize="queryForm.pageSize"
          :total="total"
          @change="queryData"
          @showSizeChange="queryData"
          :show-total="(total) => `共${total}条`"
      />
    </div>

    <TemplateConfigForm ref="formRef" @reloadList="queryData"/>
    <TemplateForm ref="copyFormRef" @reloadList="queryData"/>

  </a-card>
</template>
<script setup>
import {reactive, ref, onMounted} from 'vue';
import {message, Modal} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {templateApi} from '/@/api/business/generate/template-api';
import {PAGE_SIZE_OPTIONS} from '/@/constants/common-const';
import {smartSentry} from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import DictSelect from '/@/components/support/dict-select/index.vue';
import {DICT_CODE_ENUM} from '/@/constants/support/dict-const.js';
import TemplateConfigForm from './template-config-form.vue';
import TemplateForm from './template-form.vue';
import DictLabel from '/@/components/support/dict-label/index.vue';

// ---------------------------- 表格列 ----------------------------

const columns = ref([
  {
    title: 'ID',
    dataIndex: 'id',
    ellipsis: true,
  },
  {
    title: '模板名称',
    dataIndex: 'templateName',
    ellipsis: true,
  },
  {
    title: '模板类型',
    dataIndex: 'templateType',
    ellipsis: true,
  },
  {
    title: '数据源类型',
    dataIndex: 'databaseType',
    ellipsis: true,
  },
  {
    title: '语言类型',
    dataIndex: 'languageType',
    ellipsis: true,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 250,
  },
]);

// ---------------------------- 查询数据表单和方法 ----------------------------

const queryFormState = {
  templateName: undefined, //模板名称
  databaseType: undefined, //数据源类型
  languageType: undefined, //语言类型
  templateType: undefined, //模板类型
  pageNum: 1,
  pageSize: 10,
};
// 查询表单form
const queryForm = reactive({...queryFormState});
// 表格加载loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 总数
const total = ref(0);

// 重置查询条件
function resetQuery() {
  let pageSize = queryForm.pageSize;
  Object.assign(queryForm, queryFormState);
  queryForm.pageSize = pageSize;
  queryData();
}

// 搜索
function onSearch() {
  queryForm.pageNum = 1;
  queryData();
}

// 查询数据
async function queryData() {
  tableLoading.value = true;
  try {
    let queryResult = await templateApi.queryPage(queryForm);
    tableData.value = queryResult.data.list;
    total.value = queryResult.data.total;
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    tableLoading.value = false;
  }
}

onMounted(queryData);

// ---------------------------- 添加/修改 ----------------------------
const formRef = ref();
const copyFormRef = ref();

function showForm(data) {
  formRef.value.showModal(data);
}
function copyForm(data) {
  copyFormRef.value.show(data);
}

// ---------------------------- 单个删除 ----------------------------
//确认删除
function onDelete(data) {
  Modal.confirm({
    title: '提示',
    content: '确定要删除选吗?',
    okText: '删除',
    okType: 'danger',
    onOk() {
      requestDelete(data);
    },
    cancelText: '取消',
    onCancel() {
    },
  });
}

//请求删除
async function requestDelete(data) {
  SmartLoading.show();
  try {
    await templateApi.delete(data.id);
    message.success('删除成功');
    await queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}
</script>
