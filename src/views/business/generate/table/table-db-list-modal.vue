<!--
  *
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-modal :title="title" :width="width" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true">
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="名称" class="smart-query-form-item">
          <a-input style="width: 200px" v-model:value="queryForm.keyword" placeholder="名称" />
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

    <a-table
      size="small"
      :scroll="{ y: 800 }"
      :dataSource="tableData"
      :columns="columns"
      rowKey="tableName"
      bordered
      :loading="tableLoading"
      :pagination="false"
      :row-selection="{
        selectedRowKeys: selectedRowKeyList,
        onChange: onSelectChange,
      }"
    />
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
    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import { smartSentry } from '/@/lib/smart-sentry.js';
  import { generateApi } from '/@/api/business/generate/generate-api.js';
  import { message } from 'ant-design-vue';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const.js';
  import _ from 'lodash';

  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 1200,
    },
    databaseId: {
      type: Number,
      default: 0,
    },
  });

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['finish']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(rowData) {
    visibleFlag.value = true;
    queryData();
  }

  function onClose() {
    visibleFlag.value = false;
  }

  async function onSubmit() {
    if (_.isEmpty(selectedRowKeyList.value)) {
      return;
    }
    emits('finish', selectedRowKeyList.value.join(','), true);
    onClose();
  }

  onMounted(() => {});

  defineExpose({
    show,
  });
  //---------------------------form
  // 查询表单初始状态
  const queryFormState = {
    keyword: undefined, // 名称
    pageNum: 1, // 当前页码
    pageSize: 10, // 每页条数
  };
  // 响应式查询表单
  const queryForm = reactive({ ...queryFormState });
  // 表格加载状态
  const tableLoading = ref(false);
  // 表格数据源
  const tableData = ref([]);
  // 数据总数（分页用）
  const total = ref(0);
  // 触发查询
  function onSearch() {
    queryForm.pageNum = 1; // 重置为第一页
    queryData();
  }
  // 重置查询条件
  function resetQuery() {
    const { pageSize } = queryForm;
    Object.assign(queryForm, queryFormState);
    queryForm.pageSize = pageSize; // 保留每页条数
    queryData();
  }

  // 核心查询方法（分页查询）
  async function queryData() {
    tableLoading.value = true;
    try {
      const queryResult = await generateApi.dbList(props.databaseId, queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (error) {
      smartSentry.captureError(error);
      message.error('查询失败，请稍后重试');
    } finally {
      tableLoading.value = false;
    }
  }

  const columns = ref([
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
  ]);
  // 选中的行ID列表
  const selectedRowKeyList = ref([]);

  // 行选择变更事件
  function onSelectChange(selectedRowKeys) {
    selectedRowKeyList.value = selectedRowKeys;
  }
</script>
