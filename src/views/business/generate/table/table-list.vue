<!--
  * 表
  *
  * @Author:    gklx
  * @Date:      2025-09-05 13:54:04
  * @Copyright  gklx
-->
<template>
  <!---------- 查询表单form begin ----------->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="关键字" class="smart-query-form-item">
        <a-input style="width: 300px" v-model:value="queryForm.keyword" placeholder="表名称/表注释"/>
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
        <a-button @click="handleBatchSync" type="primary" size="small"
                  :disabled="selectedRowKeyList.length == 0">
          <template #icon>
            <PlusOutlined/>
          </template>
          批量同步
        </a-button>

        <a-button @click="confirmBatchDelete" type="primary" danger size="small"
                  :disabled="selectedRowKeyList.length == 0">
          <template #icon>
            <DeleteOutlined/>
          </template>
          批量删除
        </a-button>
        <a-button class="ml-16" @click="handleCreateTable" type="primary" size="small"
        >
          <template #icon>
            <PlusOutlined/>
          </template>
          快速建表
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
        rowKey="tableId"
        bordered
        :loading="tableLoading"
        :pagination="false"
        :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }"
    >
      <template #bodyCell="{ text, record, column }">

        <template v-if="column.dataIndex === 'tableName'">
          <router-link :to="'/table/column/'+record.tableId">{{ text }}</router-link>
        </template>
        <template v-if="column.dataIndex === 'isPage'">
          <a-checkbox v-model:checked="record.isPage" @change="(e)=>handleChange(e, record)"/>
        </template>
        <template v-if="column.dataIndex === 'isDetail'">
          <a-checkbox v-model:checked="record.isDetail" @change="(e)=>handleChange(e, record)"/>
        </template>
        <template v-if="column.dataIndex === 'isAdd'">
          <a-checkbox v-model:checked="record.isAdd" @change="(e)=>handleChange(e, record)"/>
        </template>
        <template v-if="column.dataIndex === 'isUpdate'">
          <a-checkbox v-model:checked="record.isUpdate" @change="(e)=>handleChange(e, record)"/>
        </template>
        <template v-if="column.dataIndex === 'isDelete'">
          <a-checkbox v-model:checked="record.isDelete" @change="(e)=>handleChange(e, record)"/>
        </template>
        <template v-if="column.dataIndex === 'isBatchDelete'">
          <a-checkbox v-model:checked="record.isBatchDelete" @change="(e)=>handleChange(e, record)"/>
        </template>
        <template v-if="column.dataIndex === 'actionCode'">
          <div class="smart-table-operate">
            <a-button @click="showPreview(record)" type="link">预览</a-button>
            <a-button @click="showJoin(record)" type="link">关联</a-button>
          </div>
        </template>
        <template v-if="column.dataIndex === 'actionSync'">
          <div class="smart-table-operate">
            <a-button @click="handleSync(record)" type="link">同步</a-button>
          </div>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showForm(record)" type="link">编辑</a-button>
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

    <TableForm ref="formRef" @reloadList="queryData"/>
    <TableCreate ref="tableCreateRef" @reloadList="queryData"/>
    <TableJoin ref="tableJoinRef" :databaseId="databaseId"/>
    <GenPreviewModal ref="genPreviewModalRef"/>

  </a-card>
</template>
<script setup>
import {onMounted, reactive, ref} from 'vue';
import {message, Modal} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {tableApi} from '/@/api/business/generate/table-api';
import {generateApi} from '/@/api/business/generate/generate-api.js';
import {PAGE_SIZE_OPTIONS} from '/@/constants/common-const';
import {smartSentry} from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import TableForm from './table-form.vue';
import TableCreate from './table-create.vue';
import TableJoin from './table-join.vue';
import GenPreviewModal from './gen-preview-modal.vue';
import {useRoute, useRouter} from 'vue-router'
import {databaseApi} from "/@/api/business/generate/database-api.js";

const route = useRoute()
const databaseId = ref(route.params.id);
const database = ref({});
const router = useRouter();
// ---------------------------- 表格列 ----------------------------

const columns = ref([
  {
    title: 'ID',
    dataIndex: 'tableId',
    width: 80,
    ellipsis: true,
  },
  {
    title: '表名称',
    dataIndex: 'tableName',
    ellipsis: true,
  },
  {
    title: '表注释',
    dataIndex: 'tableComment',
    ellipsis: true,
  },
  {
    title: '分页',
    dataIndex: 'isPage',
    ellipsis: true,
    width: 60,
  },
  {
    title: '详情',
    dataIndex: 'isDetail',
    ellipsis: true,
    width: 60,
  },
  {
    title: '新增',
    dataIndex: 'isAdd',
    ellipsis: true,
    width: 60,
  },
  {
    title: '编辑',
    dataIndex: 'isUpdate',
    ellipsis: true,
    width: 60,
  },
  {
    title: '删除',
    dataIndex: 'isDelete',
    ellipsis: true,
    width: 60,
  },
  {
    title: '批量删除',
    dataIndex: 'isBatchDelete',
    ellipsis: true,
    width: 80,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    ellipsis: true,
  },
  {
    title: '代码',
    dataIndex: 'actionCode',
    fixed: 'right',
    width: 100,
  },
  {
    title: '同步',
    dataIndex: 'actionSync',
    fixed: 'right',
    width: 100,
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 100,
  },
]);

// ---------------------------- 查询数据表单和方法 ----------------------------

const queryFormState = {
  keyword: undefined, //表名称
  databaseId: undefined, //表名称
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
  queryForm.databaseId = databaseId.value;
  try {
    let queryResult = await tableApi.queryPage(queryForm);
    tableData.value = queryResult.data.list;
    total.value = queryResult.data.total;
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    tableLoading.value = false;
  }
}




// ---------------------------- 添加/修改 ----------------------------
const formRef = ref();
const genPreviewModalRef = ref();
const tableJoinRef = ref();

function showForm(data) {
  formRef.value.show(data);
}

function showPreview(data) {
  genPreviewModalRef.value.showModal(data.databaseId, data.tableId);
}

function showJoin(data) {
  router.push({
    path: '/table/join/' + data.tableId,
    query: {
      databaseId: databaseId.value,
    }
  })
  // tableJoinRef.value.show(data.tableId);
}

function toColumn(data) {
  router.push('/table/column/' + data.tableId)
}

function handleSync(data) {
  generateApi.syncTableColumn(data.tableId).then(() => {
    message.success('同步成功');
    router.push('/table/column/' + data.tableId)
  })
}

function handleBatchSync(data) {
  generateApi.batchSyncTableColumn(selectedRowKeyList.value).then(() => {
    message.success('批量同步成功');
    selectedRowKeyList.value = []
  })
}

function handleChange(e,record) {
 console.log(record)
  tableApi.update(record).then(() => {
    message.success('修改成功');
  })
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
    await tableApi.delete(data.tableId);
    message.success('删除成功');
    queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

// ---------------------------- 批量删除 ----------------------------

// 选择表格行
const selectedRowKeyList = ref([]);

function onSelectChange(selectedRowKeys) {
  selectedRowKeyList.value = selectedRowKeys;
}

// 批量删除
function confirmBatchDelete() {
  Modal.confirm({
    title: '提示',
    content: '确定要批量删除这些数据吗?',
    okText: '删除',
    okType: 'danger',
    onOk() {
      requestBatchDelete();
    },
    cancelText: '取消',
    onCancel() {
    },
  });
}

//请求批量删除
async function requestBatchDelete() {
  try {
    SmartLoading.show();
    await tableApi.batchDelete(selectedRowKeyList.value);
    message.success('删除成功');
    queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

// 快速建表
const tableCreateRef = ref();

function GetDatabaseById(){
  databaseApi.getDetail(databaseId.value).then(res => {
     database.value = res.data;
  })
}

function handleCreateTable() {
  tableCreateRef.value.show(database.value);
}
onMounted(() => {
  queryData()
  GetDatabaseById()
})

</script>
