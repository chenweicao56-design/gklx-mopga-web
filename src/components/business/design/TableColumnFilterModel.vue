<!--
  * 数据源表
  *
  * @Author:    gklx
  * @Date:      2025-09-05 09:07:47
  * @Copyright  1
-->
<template>
  <a-modal
      title="字段筛选"
      :width="800"
      :open="visibleFlag"
      @cancel="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-transfer
        :data-source="mockData"
        :target-keys="targetKeys"
        :selected-keys="selectedKeys"
        :render="item => item.title"
        show-search
        :filter-option="filterOption"
        @change="handleChange"
        @selectChange="handleSelectChange"
        :list-style="{
      width: '500px',
      height: '600px',
    }"
    />

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup>
import {ref} from 'vue';
import {message} from 'ant-design-vue';
import {generateId} from '/@/utils/id-util';
// ------------------------ 事件 ------------------------

const emits = defineEmits(['createTable']);

// ------------------------ 显示与隐藏 ------------------------
// 是否显示
const visibleFlag = ref(false);
let table = null;
let event = null;

function show(t, e) {
  table = t;
  event = e
  let columns = t.columns;
  let mockDataTmp = [];
  for (let i = 0; i < columns.length; i++) {
    let column = columns[i];
    mockDataTmp.push({
      key: column.columnId.toString(),
      title: column.columnName + "(" + column.columnComment+")",
      columnName: column.columnName,
      columnComment: column.columnComment,
    });
  }
  mockData.value = mockDataTmp;
  visibleFlag.value = true;
}

function onClose() {
  visibleFlag.value = false;
}

// 点击确定，验证表单
async function onSubmit() {
  if (targetKeys.value.length === 0) {
    return message.error('请选择字段!');
  }
  let fields = table.columns
      .filter(column => targetKeys.value.includes(column.columnId.toString()))
      .map(column => ({
        id: column.columnId + generateId(),
        columnId: column.columnId,
        name: column.columnName,
        alias: column.columnComment,
        columnType: column.columnType,
        selectChecked: true,
        whereChecked: false,

      }));
  let tableTmp = {
    id: table.tableId + "-" + generateId(),
    tableId: table.tableId,
    name: table.tableName,
    alias: table.tableComment,
    type: table.tableType,
    fields: fields,
  }
  emits('createTable',tableTmp, event);
  onClose();
}


//
const targetKeys = ref([]);
const selectedKeys = ref([]);
const mockData = ref([])

const handleChange = (nextTargetKeys, direction, moveKeys) => {
  targetKeys.value = nextTargetKeys;
};
const handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
  selectedKeys.value = [...sourceSelectedKeys, ...targetSelectedKeys];
};
const filterOption = (inputValue, option) => {
  return option.columnName.indexOf(inputValue) > -1|| option.columnComment.indexOf(inputValue) > -1;
};


defineExpose({
  show,
});
</script>
