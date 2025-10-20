<template>
  <a-row>
    <a-button type="primary" @click="addMapping">添加映射</a-button>
  </a-row>
  <a-table
      size="small"
      bordered
      id="templateMappingTable"
      class="smart-margin-top10"
      :dataSource="mappingList"
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
      <template v-if="column.dataIndex === 'databaseColumnType'">
        <a-auto-complete
            v-model:value="record.databaseColumnType"
            style="width: 100%"
            placeholder="数据源字段类型"
            :filter-option="filterColumnTypeOptions"
            :options="columnTypeOptions"
        />
<!--        <DictSelect width="100%" v-model:value="record.databaseColumnType"-->
<!--                    :dict-code="databaseType" placeholder="数据源字段类型"/>-->
      </template>
      <template v-if="column.dataIndex === 'backColumnType'">
        <DictSelect width="100%" v-model:value="record.backColumnType"
                    :dict-code="DICT_CODE_ENUM.JAVA_FIELD_TYPE || 'JAVA_FIELD_TYPE'" placeholder="后端字段类型"/>
      </template>
      <template v-if="column.dataIndex === 'frontColumnType'">
        <DictSelect width="100%" v-model:value="record.frontColumnType"
                    :dict-code="DICT_CODE_ENUM.FRONT_FIELD_TYPE || 'FRONT_FIELD_TYPE '" placeholder="前端字段类型"/>
      </template>
      <template v-if="column.dataIndex === 'frontComponent'">
        <DictSelect width="100%" v-model:value="record.frontComponent"
                    :dict-code="DICT_CODE_ENUM.FRONT_COMPONENT" placeholder="前端组件"/>
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
import {nextTick, ref} from 'vue';
import {templateMappingItemApi} from '/src/api/business/generate/template-mapping-item-api.js';
import {message, Modal} from "ant-design-vue";
import {SmartLoading} from "/src/components/framework/smart-loading/index.js";
import {smartSentry} from "/src/lib/smart-sentry.js";
import {DICT_CODE_ENUM} from "/@/constants/support/dict-const.js";
import DictSelect from "/@/components/support/dict-select/index.vue";
import {useDictStore} from "/@/store/modules/system/dict.js";
//------------------------ 全局数据 ---------------------
const mappingList = ref([]);

//------------------------ 表格渲染 ---------------------

const columns = ref([
  {
    title: '拖拽',
    dataIndex: 'drag',
    width: 60,
  },
  {
    title: '数据源字段类型',
    dataIndex: 'databaseColumnType',
    ellipsis: true,
  },
  {
    title: '后端字段类型',
    dataIndex: 'backColumnType',
    ellipsis: true,
  },
  {
    title: '前端字段类型',
    dataIndex: 'frontColumnType',
    ellipsis: true,
  },
  {
    title: '前端组件',
    dataIndex: 'frontComponent',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'operate',
    width: 60,
  },
]);
let templateId = undefined;
let databaseType = ref("");
let template = ref({});

const columnTypeOptions = ref([]);
const filterColumnTypeOptions = (input, option) => {
  return option.value.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};

//初始化设置数据
function show(t) {
  template.value = t;
  templateId = t.id;
  columnTypeOptions.value = useDictStore()
      .getDictData(t.databaseType.toUpperCase()+"_COLUMN_TYPE").map(item => ({
        value: item.dataValue,
        label: item.dataLabel
      }))
  templateMappingItemApi.queryPage({templateId: templateId, pageNum: 1, pageSize: 500}).then((res) => {
    mappingList.value = res.data.list;
    nextTick(() => {
      initDrag();
    });
  })
}

function onClose() {
  databaseType.value = undefined;
  mappingList.value = [];
}


// -------------------  增加、删除 -------------------
function addMapping() {
  mappingList.value.push({
    "databaseColumnType": "",
    "backColumnType": "",
    "frontColumnType": "",
    "templateId": templateId,
  });
}

function onDelete(index) {
  mappingList.value[index].id
  Modal.confirm({
    title: '提示',
    content: '确定要删除吗?',
    okText: '确认',
    okType: 'primary',
    onOk() {
      message.success("删除成功")
      templateMappingItemApi.delete(mappingList.value[index].id).then(res => {
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
  let tbody = document.querySelector('#templateMappingTable tbody');
  Sortable.create(tbody, {
    animation: 300,
    dragClass: 'smart-ghost-class', //设置拖拽样式类名
    ghostClass: 'smart-ghost-class', //设置拖拽停靠样式类名
    chosenClass: 'smart-ghost-class', //设置选中样式类名
    handle: '.handle',
    onEnd: ({oldIndex, newIndex}) => {
      const oldRow = mappingList.value.splice(oldIndex - 1, 1)[0];
      mappingList.value.splice(newIndex - 1, 0, oldRow);
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
    if (mappingList.value.length === 0) {
      return message.error('请至少添加一个字段!');
    } else {
      for (let i = 0; i < mappingList.value.length; i++) {
        mappingList.value[i].sort = i + 1;
      }
    }
    console.log(mappingList.value);
    await templateMappingItemApi.batchSaveOrUpdate(mappingList.value);
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
