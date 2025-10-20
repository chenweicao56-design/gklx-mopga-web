<template>
  <a-row>
    <a-button type="primary" @click="addBaseClass">添加字段</a-button>
  </a-row>
  <a-table
      size="small"
      bordered
      id="templateBaseClassTable"
      class="smart-margin-top10"
      :dataSource="baseClassList"
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
      <template v-if="column.dataIndex === 'columnName'">
        <a-input style="width: 100%" v-model:value="record.columnName" placeholder="字段名称"/>
      </template>
      <template v-if="column.dataIndex === 'columnType'">
        <a-auto-complete
            v-model:value="record.columnType"
            style="width: 100%"
            placeholder="字段类型"
            :filter-option="filterColumnTypeOptions"
            :options="columnTypeOptions"
        />
      </template>
      <template v-if="column.dataIndex === 'columnComment'">
        <a-input style="width: 100%" v-model:value="record.columnComment" placeholder="字段注释"/>
      </template>
      <template v-if="column.dataIndex === 'columnDefault'">
        <a-input style="width: 100%" v-model:value="record.columnDefault" placeholder="默认值"/>
      </template>
      <template v-if="column.dataIndex === 'isPk'">
        <a-checkbox v-model:checked="record.isPk"/>
      </template>
      <template v-if="column.dataIndex === 'isIncrement'">
        <a-checkbox v-model:checked="record.isIncrement"/>
      </template>
      <template v-if="column.dataIndex === 'isNull'">
        <a-checkbox v-model:checked="record.isNull"/>
      </template>
      <template v-if="column.dataIndex === 'isBase'">
        <a-checkbox v-model:checked="record.isBase"/>
      </template>
      <template v-if="column.dataIndex === 'operate'">
        <div class="smart-table-operate">
          <a-button type="link" @click="onDelete(index)" danger>删除</a-button>
        </div>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import Sortable from 'sortablejs';
import {computed, nextTick, ref} from 'vue';
import {templateColumnApi} from '/src/api/business/generate/template-column-item-api.js';
import {message, Modal} from "ant-design-vue";
import {SmartLoading} from "/src/components/framework/smart-loading/index.js";
import {smartSentry} from "/src/lib/smart-sentry.js";
import {useDictStore} from "/@/store/modules/system/dict.js";
import {templateMappingItemApi} from "/@/api/business/generate/template-mapping-item-api.js";

//------------------------ 全局数据 ---------------------
const baseClassList = ref([]);
const columnTypeOptions = ref([]);
const filterColumnTypeOptions = (input, option) => {
  return option.value.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};
//------------------------ 表格渲染 ---------------------

const columns = ref([
  {
    title: '拖拽',
    dataIndex: 'drag',
    width: 60,
  },
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
    width: 50
  },
  {
    title: '自增',
    dataIndex: 'isIncrement',
    ellipsis: true,
    width: 50
  },
  {
    title: '非空',
    dataIndex: 'isNull',
    ellipsis: true,
    width: 50
  },
  {
    title: '基类',
    dataIndex: 'isBase',
    ellipsis: true,
    width: 50
  },
  {
    title: '操作',
    dataIndex: 'operate',
    width: 60,
  },
]);
let templateId = 0;
let template = ref({});
//初始化设置数据
function show(t) {
  template.value = t;
  templateId = t.id;
  columnTypeOptions.value = useDictStore()
      .getDictData(t.databaseType.toUpperCase()+"_COLUMN_TYPE").map(item => ({
    value: item.dataValue,
    label: item.dataLabel
  }))
  templateColumnApi.queryPage({templateId: templateId, pageNum: 1, pageSize: 500}).then((res) => {
    baseClassList.value = res.data.list;
    nextTick(() => {
      initDrag();
    });
  })
}
function onClose() {
  baseClassList.value = [];
}

// -------------------  增加、删除 -------------------
function addBaseClass() {
  baseClassList.value.push({
    templateId: templateId,
    columnName: undefined,
    columnType: undefined,
    columnComment: undefined,
    defaultValue: undefined,
    isPk: false,
    isIncrement: false,
    isNull: true,
    isBase: true,
  });
}

function onDelete(index) {
  Modal.confirm({
    title: '提示',
    content: '确定要删除吗?',
    okText: '确认',
    okType: 'primary',
    onOk() {
      message.success("删除成功")
      templateColumnApi.delete(baseClassList.value[index].columnId).then(res => {
        show(template.value)
      })
    },
    cancelText: '取消',
    onCancel() {
    },
  });
}

//初始化拖拽
function initDrag() {
  let tbody = document.querySelector('#templateBaseClassTable tbody');
  Sortable.create(tbody, {
    animation: 300,
    dragClass: 'smart-ghost-class', //设置拖拽样式类名
    ghostClass: 'smart-ghost-class', //设置拖拽停靠样式类名
    chosenClass: 'smart-ghost-class', //设置选中样式类名
    handle: '.handle',
    onEnd: ({oldIndex, newIndex}) => {
      const oldRow = baseClassList.value.splice(oldIndex - 1, 1)[0];
      baseClassList.value.splice(newIndex - 1, 0, oldRow);
    },
  });
}

// -------------------  获取表单数据 -------------------

// 获取表单数据
async function onSubmit() {
  try {
    await save();
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

async function save() {
  SmartLoading.show();
  try {
    if (baseClassList.value.length === 0) {
      return message.error('请至少添加一个字段!');
    } else {
      for (let i = 0; i < baseClassList.value.length; i++) {
        baseClassList.value[i].sort = i + 1;
      }
    }
    await templateColumnApi.batchSaveOrUpdate(baseClassList.value);
    show(template.value);
    message.success('操作成功');
  } catch (err) {
    smartSentry.captureError(err);
  } finally {
    SmartLoading.hide();
  }
}


defineExpose({
  show,
  onSubmit,
  onClose
});
</script>

<style lang="less" scoped></style>
