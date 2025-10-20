<!--
  * 会话表
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
                        label="标题" 
                        class="smart-query-form-item"
                    >
                        <a-input 
                            style="width: 200px" 
                            v-model:value="queryForm.title" 
                            placeholder="标题" 
                        />
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
                    <a-button @click="showForm" type="primary" size="small">
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        新建
                    </a-button>

                    <a-button 
                        @click="confirmBatchDelete" 
                        type="primary" 
                        danger 
                        size="small" 
                        :disabled="selectedRowKeyList.length === 0"
                    >
                        <template #icon>
                            <DeleteOutlined />
                        </template>
                        批量删除
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
            :rowKey="id"
            bordered
            :loading="tableLoading"
            :pagination="false"
                :row-selection="{ 
                    selectedRowKeys: selectedRowKeyList, 
                    onChange: onSelectChange 
                }"
        >
            <template #bodyCell="{ text, record, column }">

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
        <ConversationForm 
            ref="formRef" 
            @reloadList="queryData"
        />
    </a-card>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
// 组件引入
import { SmartLoading } from '/@/components/framework/smart-loading';
import TableOperator from '/@/components/support/table-operator/index.vue';
import ConversationForm from '/@/views/generate/ConversationForm.vue';
// API引入
import { conversationApi } from '/@/api/generate/conversation-api';
// 常量引入
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
// 工具引入
import { smartSentry } from '/@/lib/smart-sentry';
// 图标引入（需确保已全局注册或单独引入）
// import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';

// ========================== 表格列配置 ==========================
const columns = ref([
            {
                title: '标题',
                dataIndex: 'title',
                ellipsis: true,
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
            title: undefined, // 标题
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
        const queryResult = await conversationApi.queryPage(queryForm);
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
            await conversationApi.delete(record.id);
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
            await conversationApi.batchDelete(selectedRowKeyList.value);
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
onMounted(queryData);
</script>