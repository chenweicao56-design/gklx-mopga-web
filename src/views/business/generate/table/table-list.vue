<!--
  * 表
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <!-- 查询表单区域 -->
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="关键字" class="smart-query-form-item">
        <a-input style="width: 300px" v-model:value="queryForm.keyword" placeholder="表名称/表注释" />
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button type="primary" @click="onSearch">
          <template #icon>
            <SearchOutlined />
          </template>
          查询
        </a-button>
        <a-button @click="resetQuery" class="smart-margin-left10">
          <template #icon>
            <ReloadOutlined />
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
        <a-button @click="handleCreateTable" type="primary" size="small">
          <template #icon>
            <PlusOutlined />
          </template>
          快速建表
        </a-button>
        <a-button @click="handleSyncTable" type="primary" size="small">
          <template #icon>
            <PlusOutlined />
          </template>
          导入表
        </a-button>
        <a-button @click="confirmBatchDelete" type="primary" danger size="small" :disabled="selectedRowKeyList.length === 0">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
      </div>

      <!-- 表格列配置 -->
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="null" :refresh="queryData" />
      </div>
    </a-row>

    <!-- 数据表格 -->
    <a-table
      size="small"
      :scroll="{ y: 800 }"
      :dataSource="tableData"
      :columns="columns"
      rowKey="tableId"
      bordered
      :loading="tableLoading"
      :pagination="false"
      :row-selection="{
        selectedRowKeys: selectedRowKeyList,
        onChange: onSelectChange,
      }"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'tableName'">
          <router-link :to="'/table/column/' + record.tableId">{{ text }}</router-link>
        </template>
        <template v-if="column.dataIndex === 'isPage'">
          <a-checkbox v-model:checked="record.isPage" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'isDetail'">
          <a-checkbox v-model:checked="record.isDetail" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'isAdd'">
          <a-checkbox v-model:checked="record.isAdd" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'isUpdate'">
          <a-checkbox v-model:checked="record.isUpdate" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'isDelete'">
          <a-checkbox v-model:checked="record.isDelete" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'isBatchDelete'">
          <a-checkbox v-model:checked="record.isBatchDelete" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'isImport'">
          <a-checkbox v-model:checked="record.isImport" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'isExport'">
          <a-checkbox v-model:checked="record.isExport" @change="(e) => handleChange(e, record)" />
        </template>
        <template v-if="column.dataIndex === 'actionCode'">
          <div class="smart-table-operate">
            <a-button @click="showPreview(record)" type="link">预览</a-button>
            <a-button @click="showJoin(record)" type="link">关联</a-button>
          </div>
        </template>
        <template v-if="column.dataIndex === 'actionSync'">
          <div class="smart-table-operate">
            <a-button @click="syncTable(record.tableName, true)" type="link">同步</a-button>
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
    <TableForm ref="formRef" @reloadList="queryData" />
    <TableCreate ref="tableCreateRef" @reloadList="queryData" />
    <TableDbListModal ref="tableDbListModalRef" :databaseId="databaseId" @finish="syncTable" />
    <GenPreviewModal ref="genPreviewModalRef" />
  </a-card>
</template>

<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import TableDbListModal from '/src/views/business/generate/table/table-db-list-modal.vue';
  import TableCreate from './table-create.vue';
  import GenPreviewModal from './gen-preview-modal.vue';
  import { tableApi } from '/@/api/business/generate/table-api';
  import { databaseApi } from '/@/api/business/generate/database-api.js';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { useRoute, useRouter } from 'vue-router';
  import { generateApi } from '/@/api/business/generate/generate-api.js';
  import TableForm from '/@/views/business/generate/table/table-form.vue';

  const route = useRoute();
  const databaseId = ref(parseInt(route.params.id));
  const database = ref({});
  const router = useRouter();
  // ========================== 表格列配置 ==========================
  const columns = ref([
    {
      title: 'ID',
      dataIndex: 'tableId',
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
      title: '增加',
      dataIndex: 'isAdd',
      ellipsis: true,
      width: 60,
    },
    {
      title: '修改',
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
      title: '导入',
      dataIndex: 'isImport',
      ellipsis: true,
      width: 60,
    },
    {
      title: '导出',
      dataIndex: 'isExport',
      ellipsis: true,
      width: 60,
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
      width: 90,
    },
  ]);

  // ========================== 查询相关 ==========================
  // 查询表单初始状态
  const queryFormState = {
    keyword: undefined, //表名称
    databaseId: databaseId.value, //表名称
    pageNum: 1,
    pageSize: 10,
  };
  // 响应式查询表单
  const queryForm = reactive({ ...queryFormState });
  // 表格加载状态
  const tableLoading = ref(false);
  // 表格数据源
  const tableData = ref([]);
  // 数据总数（分页用）
  const total = ref(0);

  // 重置查询条件
  function resetQuery() {
    const { pageSize } = queryForm;
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
      const queryResult = await tableApi.queryPage(queryForm);
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
  const genPreviewModalRef = ref();
  // 打开新增/编辑表单
  function showForm(record = {}) {
    formRef.value?.show(record);
  }
  function showPreview(data) {
    genPreviewModalRef.value.showModal(data.databaseId, data.tableId);
  }

  function showJoin(data) {
    router.push({
      path: '/table/join/' + data.tableId,
      query: {
        databaseId: databaseId.value,
      },
    });
  }

  function toColumn(data) {
    router.push('/table/column/' + data.tableId);
  }

  function handleBatchSync(data) {}

  function handleChange(e, record) {
    console.log(record);
    tableApi.update(record).then(() => {
      message.success('修改成功');
    });
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
      await tableApi.delete(record.tableId);
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
  // 选中的行ID列表
  const selectedRowKeyList = ref([]);

  // 行选择变更事件
  function onSelectChange(selectedRowKeys) {
    selectedRowKeyList.value = selectedRowKeys;
  }

  // 批量删除确认
  function confirmBatchDelete() {
    if (selectedRowKeyList.value.length === 0) {
      message.warning('请先选择要删除的数据');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeyList.value.length} 条数据吗？删除后不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: requestBatchDelete,
    });
  }

  // 批量删除请求
  async function requestBatchDelete() {
    SmartLoading.show();
    try {
      await tableApi.batchDelete(selectedRowKeyList.value);
      message.success('批量删除成功');
      selectedRowKeyList.value = []; // 清空选择
      queryData(); // 重新查询数据
    } catch (error) {
      smartSentry.captureError(error);
      message.error('批量删除失败，请稍后重试');
    } finally {
      SmartLoading.hide();
    }
  }

  // ========================== 页面初始化 ==========================
  // 页面挂载时执行初始查询
  // 快速建表
  const tableCreateRef = ref();

  function GetDatabaseById() {
    databaseApi.getDetail(databaseId.value).then((res) => {
      database.value = res.data;
    });
  }

  function handleCreateTable() {
    tableCreateRef.value.show(database.value);
  }
  onMounted(() => {
    queryData();
    GetDatabaseById();
  });
  const tableDbListModalRef = ref();
  function handleSyncTable() {
    tableDbListModalRef.value.show();
  }
  function syncTable(tableNames, containColumn) {
    generateApi.syncTable(databaseId.value, { containColumn: containColumn, tableNames: tableNames }).then(() => {
      message.success('同步成功');
      onSearch()
    });
  }
</script>
