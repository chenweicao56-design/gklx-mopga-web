<!--
  * 数据源表
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <!-- 查询表单区域 -->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item
          label="名称"
          class="smart-query-form-item"
      >
        <a-input
            style="width: 200px"
            v-model:value="queryForm.databaseName"
            placeholder="名称"
        />
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

  <!-- 表格卡片区域 -->
  <a-card size="small" :bordered="false" :hoverable="true">
    <!-- 表格操作栏（新增/批量删除） -->
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="showForm" type="primary" size="small">
          <template #icon>
            <PlusOutlined/>
          </template>
          新建
        </a-button>

      </div>

      <!-- 表格列配置 -->
      <div class="smart-table-setting-block">
        <TableOperator
            v-model="columns"
            :tableId="null"
            :refresh="queryData"
        />
      </div>
    </a-row>

    <!-- 数据表格 -->
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

        <template v-if="column.dataIndex === 'databaseName'">
          <router-link :to="'/table/'+record.id">{{ text }}</router-link>
        </template>

        <template v-if="column.dataIndex === 'databaseType'">
          <DictLabel :dict-code="DICT_CODE_ENUM.DATABASE_TYPE || 'DATABASE_TYPE'" :data-value="text"/>
        </template>
        <template v-if="column.dataIndex === 'languageType'">
          <DictLabel :dict-code="DICT_CODE_ENUM.LANGUAGE_TYPE || 'LANGUAGE_TYPE'" :data-value="text"/>
        </template>

        <template v-if="column.dataIndex === 'actionSync'">
          <div class="smart-table-operate">
            <a-button @click="handleSyncTable(record,false)" type="link">表同步</a-button>
          </div>
        </template>

        <!-- 操作列（编辑/删除） -->
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showForm(record)" type="link">编辑</a-button>
            <a-button @click="onDelete(record)" danger type="link">删除</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 分页控件 -->
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

    <!-- 新增/编辑表单弹窗 -->
    <DatabaseForm
        ref="formRef"
        @reloadList="queryData"
    />
  </a-card>
</template>

<script setup>
import {reactive, ref, onMounted} from 'vue';
import {message, Modal} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import TableOperator from '/@/components/support/table-operator/index.vue';
import DatabaseForm from '/@/views/business/generate/database/database-form.vue';
import {databaseApi} from '/@/api/business/generate/database-api';
import {PAGE_SIZE_OPTIONS} from '/@/constants/common-const';
import {smartSentry} from '/@/lib/smart-sentry';
import DictLabel from '/@/components/support/dict-label/index.vue';
import {DICT_CODE_ENUM} from '/@/constants/support/dict-const.js';
import {generateApi} from "/@/api/business/generate/generate-api.js";
import {useRouter} from "vue-router";
const router = useRouter();
// ========================== 表格列配置 ==========================
const columns = ref([
  {
    title: 'ID',
    dataIndex: 'id',
    ellipsis: true,
  },
  {
    title: '名称',
    dataIndex: 'databaseName',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'databaseType',
    ellipsis: true,
  },
  {
    title: '语言类型',
    dataIndex: 'languageType',
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'databaseStatus',
    ellipsis: true,
  },
  {
    title: '数据源地址',
    dataIndex: 'url',
    ellipsis: true,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    ellipsis: true,
  },
  {
    title: '同步',
    dataIndex: 'actionSync',
    fixed: 'right',
    width: 150,
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 90,
  },
]);

// ========================== 查询相关 ==========================
// 查询表单初始状态
const queryFormState = {
  databaseName: undefined, // 名称
  pageNum: 1, // 当前页码
  pageSize: 10, // 每页条数
};
// 响应式查询表单
const queryForm = reactive({...queryFormState});
// 表格加载状态
const tableLoading = ref(false);
// 表格数据源
const tableData = ref([]);
// 数据总数（分页用）
const total = ref(0);

// 重置查询条件
function resetQuery() {
  const {pageSize} = queryForm;
  Object.assign(queryForm, queryFormState);
  queryForm.pageSize = pageSize; // 保留每页条数
  queryData();
}

// 触发查询
function onSearch() {
  queryForm.pageNum = 1; // 重置为第一页
  queryData();
}

// 核心查询方法（分页查询）
async function queryData() {
  tableLoading.value = true;
  try {
    const queryResult = await databaseApi.queryPage(queryForm);
    tableData.value = queryResult.data.list;
    total.value = queryResult.data.total;
  } catch (error) {
    smartSentry.captureError(error);
    message.error('查询失败，请稍后重试');
  } finally {
    tableLoading.value = false;
  }
}

// 日期范围选择器变更事件（循环生成）

// ========================== 新增/编辑 ==========================
// 表单弹窗引用
const formRef = ref();

// 打开新增/编辑表单
function showForm(record = {}) {
  formRef.value?.show(record);
}

// ========================== 单个删除 ==========================
// 单个删除确认
function onDelete(record) {
  Modal.confirm({
    title: '删除确认',
    content: '确定要删除这条数据吗？删除后不可恢复！',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: () => requestDelete(record),
  });
}

// 单个删除请求
async function requestDelete(record) {
  SmartLoading.show();
  try {
    await databaseApi.delete(record.id);
    message.success('删除成功');
    queryData(); // 重新查询数据
  } catch (error) {
    smartSentry.captureError(error);
    message.error('删除失败，请稍后重试');
  } finally {
    SmartLoading.hide();
  }
}

// ========================== 批量删除 ==========================
function handleSyncTable(data, type) {
  generateApi.syncTable(data.id, type).then(() => {
    message.success('同步成功');
    router.push('/table/' + data.id)
  })
}

// ========================== 页面初始化 ==========================
// 页面挂载时执行初始查询
onMounted(queryData);
</script>
