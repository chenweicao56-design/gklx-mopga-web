<!--
  * 表
  *
  * @Author:    gklx
  * @Date:      2025-09-05 13:54:04
  * @Copyright  gklx
-->
<template>
  <a-drawer
      title="快速建表"
      :width="1200"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-row>
        <a-col :span="12">
          <a-form-item label="表名称" name="tableName">
            <a-input style="width: 100%" v-model:value="form.tableName" placeholder="表名称"/>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="表注释" name="tableComment">
            <a-input style="width: 100%" v-model:value="form.tableComment" placeholder="表注释">
              <template #suffix>
                <div @click="handleTableCommentTrans">
                  <TranslationOutlined @click="handleTableCommentTrans"/>
                </div>
              </template>
            </a-input>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <a-row>
      <a-button type="primary" @click="addColumn">添加字段</a-button>
      <a-button class="ml-4" type="primary" @click="addTemplateColumn">模板字段</a-button>
    </a-row>
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
      <a-tab-pane key="1" tab="模板">
        <a-table
            size="small"
            bordered
            id="columnCreateTable"
            class="smart-margin-top10"
            :dataSource="form.columns"
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
              <a-input style="width: 100%" v-model:value="record.columnComment" placeholder="字段注释">
                <template #suffix>
                  <div @click="handleColumnCommentTrans(record)">
                    <TranslationOutlined @click="handleTableCommentTrans"/>
                  </div>
                </template>
              </a-input>
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
  <TemplateColumnModal ref="templateColumnModalRef" @close="handleTemplateColumnModalClose"/>
</template>
<script setup>
import {computed, nextTick, reactive, ref} from 'vue';
import {message} from 'ant-design-vue';
import {SmartLoading} from '/@/components/framework/smart-loading';
import {generateApi} from '/@/api/business/generate/generate-api';
import {translationApi} from '/@/api/business/generate/translation-api';
import {smartSentry} from '/@/lib/smart-sentry';
//初始化拖拽
import Sortable from 'sortablejs';
import {useDictStore} from '/@/store/modules/system/dict.js';
import CusCodeMirror from "/@/components/business/generate/CusCodeMirror.vue";
import TemplateColumnModal from "./template-column-modal.vue";

const templateColumnModalRef = ref()
const previewCode = ref('');
const activeKey = ref("1");
const isSync = ref(true);
const columnTypeOptions = ref([]);
const filterColumnTypeOptions = (input, option) => {
  return option.value.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};
console.log("columnTypeOptions", columnTypeOptions.value)
import {generateId} from '/@/utils/id-util';
// ------------------------ 事件 ------------------------

const emits = defineEmits(['reloadList']);

// ------------------------ 显示与隐藏 ------------------------
// 是否显示
const visibleFlag = ref(false);
const database = ref(undefined);

function show(d) {
  database.value = d;
  form.databaseId = d.id;
  visibleFlag.value = true;
  columnTypeOptions.value = useDictStore()
      .getDictData(d.databaseType.toUpperCase() + "_COLUMN_TYPE").map(item => ({
        value: item.dataValue,
        label: item.dataLabel
      }))
  nextTick(() => {
    formRef.value.clearValidate();
    initDrag();
  });
}

function onClose() {
  Object.assign(form, formDefault);
  activeKey.value = "1";
  form.columns = [];
  previewCode.value = '';
  visibleFlag.value = false;
}

// ------------------------ 表单 ------------------------

// 组件ref
const formRef = ref();

const formDefault = {
  databaseId: undefined,
  tableName: undefined,
  tableComment: undefined,
  columns: [],
};

let form = reactive({...formDefault});

const rules = {
  tableName: [{required: true, message: '请输入 表名称'}],
  tableComment: [{required: true, message: '请输入 表注释'}],
};

// 点击确定，验证表单
async function onSubmit() {
  try {
    await formRef.value.validateFields();
    await save();
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

// 新建、编辑API
async function save() {
  SmartLoading.show();
  try {

    await generateApi.createTable(form, isSync.value)
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
    onEnd: (event) => {
      // 拖拽结束后更新数据顺序
      const movedItem = form.columns.splice(event.oldIndex, 1)[0];
      form.columns.splice(event.newIndex, 0, movedItem);
    }
  });
}

function addColumn() {
  form.columns.push({
    columnName: undefined,
    columnType: undefined,
    columnComment: undefined,
    columnDefault: undefined,
    isPk: false,
    isIncrement: false,
    isNull: true,
    rowKey: generateId(),
  });
}


//确认删除
function onDelete(index) {
  // 以这种方式删除 列表才会重新渲染
  const tempList = [...form.columns];
  tempList.splice(index, 1);
  form.columns = [];
  nextTick(() => {
    form.columns = tempList;
  });
}

async function handleTabChange(key) {
  if (key === '2') {
    try {
      await formRef.value.validateFields();
      generateApi.createTablePreview(form)
          .then(res => {
            previewCode.value = res.data;
          })
    } catch (err) {
      activeKey.value = "1";
      previewCode.value = '';
      message.error('参数验证错误，请仔细填写表单数据!');
    }
  }
}

function handleTableCommentTrans() {
  if (form.tableComment) {
    translationApi.translation({content: form.tableComment, from: "zh", to: "en"}).then(res => {
      form.tableName = res.data.toLowerCase();
    })
  }

}

function handleColumnCommentTrans(record) {
  if (record.columnComment) {
    translationApi.translation({content: record.columnComment, from: "zh", to: "en"}).then(res => {
      record.columnName = res.data.toLowerCase();
    })
  }

}

function addTemplateColumn() {
  templateColumnModalRef.value.show(database.value.templateId);
}

function handleTemplateColumnModalClose(columns) {
  columns.forEach(column => {
    form.columns.push({
      columnName: column.columnName,
      columnType: column.columnType,
      columnComment: column.columnComment,
      columnDefault: column.columnDefault,
      isPk: column.isPk,
      isIncrement: column.isIncrement,
      isNull: column.isNull,
      rowKey: generateId(),
    });
  })
}

defineExpose({
  show,
});
</script>
