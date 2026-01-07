<!--
  * 字典数据 弹窗
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2025-03-08 21:50:41
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <a-drawer :width="1200" :open="visible" :body-style="{ paddingBottom: '80px' }" title="映射值" @close="onClose">
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="关键字" class="smart-query-form-item">
          <a-input style="width: 300px" v-model:value="keywords" @change="search" placeholder="关键字" />
        </a-form-item>
        <a-form-item class="smart-query-form-item smart-margin-left10">
          <a-button type="primary" @click="queryData">
            <template #icon> <SearchOutlined /> </template>
            查询
          </a-button>
          <a-button @click="resetQuery" class="smart-margin-left10">
            <template #icon> <ReloadOutlined /> </template>
            重置
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>

    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="addOrUpdateData" type="primary" v-privilege="'support:dictData:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>

        <a-button
            @click="confirmBatchDelete"
            type="primary"
            danger
            :disabled="selectedRowKeyList.length === 0"
            v-privilege="'support:dictData:delete'"
        >
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
      </div>
      <div class="smart-table-setting-block"></div>
    </a-row>

    <a-table
        size="small"
        :dataSource="tableData"
        :columns="columns"
        rowKey="id"
        :pagination="false"
        :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }"
        bordered
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'action'">
          <a-button @click="addOrUpdateData(record)" type="link" v-privilege="'support:dictData:update'">编辑</a-button>
        </template>
      </template>
    </a-table>

    <div class="smart-query-table-page">共计 {{ tableData.length }} 条</div>
    <MappingDataForm ref="mappingDataFormRef" @reloadList="queryData" />
  </a-drawer>
</template>
<script setup>
import {ref} from 'vue';
import MappingDataForm from './mapping-data-form.vue';
import {mappingDataApi} from '/@/api/business/generate/mapping-data-api';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {message, Modal} from 'ant-design-vue';
import {smartSentry} from '/@/lib/smart-sentry';
import _ from 'lodash';

// 是否展示抽屉
const visible = ref(false);
const mappingId = ref(undefined);
const mappingCode = ref(undefined);

function showModal(id, code) {
  mappingId.value = id;
  mappingCode.value = code;
  visible.value = true;
  queryData();
}

function onClose() {
  visible.value = false;
  mappingId.value = undefined;
  mappingCode.value = undefined;
}

const columns = ref([
  {
    title: '数据库字段类型',
    dataIndex: 'databaseFieldType',
    ellipsis: true,
  },
  {
    title: 'JAVA字段类型',
    dataIndex: 'javaFieldType',
    ellipsis: true,
  },
  {
    title: '前端字段类型',
    dataIndex: 'frontFieldType',
    ellipsis: true,
  },
  {
    title: '前端组件',
    dataIndex: 'frontComponent',
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
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
    width: 90,
  },
]);

// ----------------------- 表格 查询 ------------------------
const keywords = ref(undefined);
const disabledFlag = ref(null);

const selectedRowKeyList = ref([]);
const tableLoading = ref(false);
const mappingDataList = ref([]);
const tableData = ref([]);

function onSelectChange(selectedRowKeys) {
  selectedRowKeyList.value = selectedRowKeys;
}

function search() {
  tableData.value = mappingDataList.value.filter((item) => {
    let keywordsFilterFlag = true;
    if (keywords.value) {
      keywordsFilterFlag =
          _.includes(item.dataValue.toLowerCase(), keywords.value.toLowerCase()) ||
          _.includes(item.dataLabel.toLowerCase(), keywords.value.toLowerCase()) ||
          _.includes(item.remark.toLowerCase(), keywords.value.toLowerCase());
    }
    let disabledFilterFlag = _.isNull(disabledFlag.value) ? true : item.disabledFlag === disabledFlag.value;
    return disabledFilterFlag && keywordsFilterFlag;
  });
}

function resetQuery() {
  keywords.value = null;
  disabledFlag.value = null;
  queryData();
}

async function queryData() {
  try {
    tableLoading.value = true;
    let responseData = await mappingDataApi.queryPage({
      pageNum: 1,
      pageSize: 500,
      mappingCode:mappingCode.value
    });
    mappingDataList.value = responseData.data.list;
    search();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    tableLoading.value = false;
  }
}



// ----------------------- 批量 删除 ------------------------

function confirmBatchDelete() {
  Modal.confirm({
    title: '提示',
    content: '确定要删除选中值吗?',
    okText: '删除',
    okType: 'danger',
    onOk() {
      batchDelete();
    },
    cancelText: '取消',
    onCancel() {},
  });
}

async function batchDelete() {
  try {
    SmartLoading.show();
    await mappingDataApi.batchDelete(selectedRowKeyList.value);
    message.success('删除成功');
    await queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

// ----------------------- 弹窗表单操作 ------------------------

const mappingDataFormRef = ref();
function addOrUpdateData(rowData) {
  mappingDataFormRef.value.show(rowData, mappingCode.value);
}

defineExpose({
  showModal,
});
</script>
