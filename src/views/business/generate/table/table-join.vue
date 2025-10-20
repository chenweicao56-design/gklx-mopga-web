<!--
  * 表
  *
  * @Author:    gklx
  * @Date:      2025-09-05 13:54:04
  * @Copyright  gklx
-->
<template>
  <a-drawer
      title="多表关联"
      :width="1300"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-row>
        <a-col :span="12">
          <a-form-item label="表名称" name="tableName">
            <a-input disabled style="width: 100%" v-model:value="form.tableName" placeholder="表名称"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字段" name="tableComment">
            <a-select
                v-model:value="form.columnIds"
                mode="tags"
                style="width: 100%"
                placeholder="字段"
            >
              <a-select-option v-for="item in table.columns" :key="item.columnId" :value="item.columnId">
                {{ item.columnName + "(" + item.columnComment + ")" }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <a-row>
      <a-button type="primary" @click="addColumn">添加子表</a-button>
      <a-button class="ml-4" type="primary" @click="addColumn">模板字段</a-button>
    </a-row>
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
      <a-tab-pane key="1" tab="模板">
        <a-table
            size="small"
            bordered
            id="columnCreateTable"
            class="smart-margin-top10"
            :dataSource="form.joinTable"
            row-class-name="column-row"
            :columns="columns"
            rowKey="rowKey"
            :pagination="false"
        >
          <template #bodyCell="{ record, index, column }">

            <template v-if="column.dataIndex === 'drag'">
              <a-button type="text" class="handle" size="small" style="width: 100%; text-align: left">
                <template #icon>
                  <drag-outlined/>
                </template>
              </a-button>
            </template>
            <template v-if="column.dataIndex === 'childTableId'">
              <a-select
                  v-model:value="record.childTableId"
                  style="width: 100%"
                  placeholder="子表"
                  @change="handleChildTableIdChange(record)"
              >
                <a-select-option v-for="item in tables" :key="item.tableId" :value="item.tableId">
                  {{ item.tableName + "(" + item.tableComment + ")" }}
                </a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'selectColumns'">
              <a-select
                  v-model:value="record.selectColumns"
                  style="width: 100%"
                  mode="tags"
                  placeholder="子表"
              >
                <a-select-option v-for="item in record.columns" :key="item.columnId" :value="item.columnId">
                  {{ item.columnName + "(" + item.columnComment + ")" }}
                </a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <div class="smart-table-operate">
                <a-button @click="onDelete(index)" danger type="link">删除</a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="2" tab="预览" force-render>
        <CusCodeMirror ref="testCodeMirrorRef" v-model:model-value="previewCode" :height="'500px'"/>
      </a-tab-pane>
    </a-tabs>
    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit(true)">同步</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
<script setup>
import {computed, nextTick, onMounted, reactive, ref} from 'vue';
import {message} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {generateApi} from '/@/api/business/generate/generate-api';
import {tableApi} from '/@/api/business/generate/table-api';
import {smartSentry} from '/@/lib/smart-sentry';
//初始化拖拽
import Sortable from 'sortablejs';
import {useDictStore} from '/@/store/modules/system/dict.js';
import CusCodeMirror from "/@/components/business/generate/CusCodeMirror.vue";


const props = defineProps({
  databaseId: Number,
});
const tables = ref([]);

const previewCode = ref('');
const activeKey = ref("1");
const isBase = ref(true);
const isSync = ref(true);
const table = ref(null);
const columnTypeOptions = computed(() =>
    useDictStore()
        .getDictData("MYSQL_COLUMN_TYPE").map(item => ({
      value: item.dataValue,
      label: item.dataLabel
    }))
);
const filterColumnTypeOptions = (input, option) => {
  return option.value.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};
console.log("columnTypeOptions", columnTypeOptions.value)
// ------------------------ 事件 ------------------------

const emits = defineEmits(['reloadList']);

// ------------------------ 显示与隐藏 ------------------------
// 是否显示
const visibleFlag = ref(false);

function show(tableId) {
  tableApi.get(tableId).then(res => {
    table.value = res.data;
    Object.assign(form, formDefault);
    form.tableId = table.value.tableId;
    form.tableName = table.value.tableName;
    visibleFlag.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
      initDrag();
    });
  })

}

function onClose() {
  Object.assign(form, formDefault);
  visibleFlag.value = false;
}

// ------------------------ 表单 ------------------------

// 组件ref
const formRef = ref();

const formDefault = {
  columnIds: [],
  joinTable: [],
};

let form = reactive({...formDefault});

const rules = {};

// 点击确定，验证表单
async function onSubmit(isSync) {
  try {
    await formRef.value.validateFields();
    await save(isSync);
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

// 新建、编辑API
async function save(isSync) {
  SmartLoading.show();
  try {

    await generateApi.createTable(form, isBase.value, isSync.value)
    message.success('操作成功');
    // emits('reloadList');
    // onClose();
  } catch (err) {
    smartSentry.captureError(err);
  } finally {
    SmartLoading.hide();
  }
}

//
const columns = ref([
  {
    title: '拖拽',
    dataIndex: 'drag',
    width: 60,
  },
  {
    title: '子表',
    dataIndex: 'childTableId',
    ellipsis: true,
  },
  {
    title: 'select',
    dataIndex: 'selectColumns',
    ellipsis: true,
  },
  {
    title: 'on主表',
    dataIndex: 'onMasterColumns',
    ellipsis: true,
  },
  {
    title: 'on子表',
    dataIndex: 'onChildColumns',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 100,
  },
]);

function initDrag() {
  let tbody = document.querySelector('#columnCreateTable tbody');
  Sortable.create(tbody, {
    animation: 300,
    dragClass: 'smart-ghost-class', //设置拖拽样式类名
    ghostClass: 'smart-ghost-class', //设置拖拽停靠样式类名
    chosenClass: 'smart-ghost-class', //设置选中样式类名
    handle: '.handle',
    onEnd: ({oldIndex, newIndex}) => {
      const oldRow = form.joinTable.splice(oldIndex - 1, 1)[0];
      form.joinTable.splice(newIndex - 1, 0, oldRow);
    },
  });
}

function addColumn() {
  form.joinTable.push({
        tableId: null,
        selectColumns: [],
        onColumns: [],

      }
  );
}

//确认删除
function onDelete(index) {
  // 以这种方式删除 列表才会重新渲染
  const tempList = [...form.joinTable];
  tempList.splice(index, 1);
  form.joinTable = [];
  nextTick(() => {
    form.joinTable = tempList;
  });
}

function handleTabChange(key) {
  if (key === '2') {
    nextTick(() => {
      generateApi.createTablePreview(form, isBase.value)
          .then(res => {
            previewCode.value = res.data;
          })
    });
  }
}

function handleChildTableIdChange(record) {
  record.selectColumns = [];
  tableApi.get(record.childTableId).then(res => {
    nextTick(() => {
      record.columns = res.data.columns;
    })
  })
}
let MD = null
onMounted(() => {
  tableApi.queryPage(
      {
        databaseId: props.databaseId,
        pageNum: 1,
        pageSize: 500,
      }
  ).then(res => {
    tables.value = res.data.list;
  })

})


defineExpose({
  show,
});
</script>
