<!--
  * 添加字段
  *
  * @Author:    gklx
  * @Date:      2025-09-05 09:07:47
  * @Copyright  1
-->
<template>
  <a-modal
      title="添加字段"
      :width="1000"
      :open="visibleFlag"
      @cancel="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="关键字" class="smart-query-form-item">
          <a-input style="width: 200px" v-model:value="queryForm.keyword" placeholder="字段名称/字段注释"/>
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
    <a-table
        size="small"
        bordered
        id="columnCreateTable"
        class="smart-margin-top10"
        :dataSource="tableData"
        row-class-name="column-row"
        :columns="columns"
        rowKey="columnId"
        :pagination="false"
        :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }"
    />
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
import {reactive, ref} from 'vue';
import {templateColumnApi} from "/@/api/business/generate/template-column-item-api.js";
import {smartSentry} from "/@/lib/smart-sentry.js";
import {PAGE_SIZE_OPTIONS} from "/@/constants/common-const.js";

//---------------------------- table ----------
const selectedRowKeyList = ref([]);
const columns = ref([
  {
    title: '字段名称',
    dataIndex: 'columnName',
    ellipsis: true,
  },
  {
    title: '字段类型',
    dataIndex: 'columnType',
    ellipsis: true,
  },
  {
    title: '字段注释',
    dataIndex: 'columnComment',
    ellipsis: true,
  },
  {
    title: '默认值',
    dataIndex: 'columnDefault',
    ellipsis: true,
  },
  {
    title: '主键',
    dataIndex: 'isPk',
    ellipsis: true,
    width: 50,
    customRender: (e) => {
      return e.value ? '是' : '否';
    },
  },
  {
    title: '自增',
    dataIndex: 'isIncrement',
    ellipsis: true,
    width: 50,
    customRender: (e) => {
      return e.value ? '是' : '否';
    },
  }
]);
const queryFormState = {
  keyword: undefined,
  templateId: undefined,
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

function onSelectChange(selectedRowKeys) {
  selectedRowKeyList.value = selectedRowKeys;
}


// 查询数据
async function queryData() {
  tableLoading.value = true;
  try {
    let queryResult = await templateColumnApi.queryPage(queryForm);
    tableData.value = queryResult.data.list;
    total.value = queryResult.data.total;
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    tableLoading.value = false;
  }
}


//---------------------------- modal ----------
const emits = defineEmits(['close']);
const visibleFlag = ref(false);


function show(id) {
  queryForm.templateId = id;
  queryData();
  visibleFlag.value = true;
}

function onClose() {
  visibleFlag.value = false;
  Object.assign(queryForm, queryFormState);
  selectedRowKeyList.value = [];
  tableData.value = [];
  total.value = 0;
}

async function onSubmit() {
  if (selectedRowKeyList.value.length > 0) {
    const selectedColumns = tableData.value.filter(item => {
      if (selectedRowKeyList.value.includes(item.columnId)) {
        return item;
      }
    })
    emits('close', selectedColumns);
    visibleFlag.value = false;
  }
}

defineExpose({
  show,
});
</script>
