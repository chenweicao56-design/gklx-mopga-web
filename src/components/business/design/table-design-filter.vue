<!--
  *
  *
  * @Author:    gklx
  * @Date:      2025-09-06 18:37:07
  * @Copyright  1.0
-->
<template>
  <a-modal :title="title" :width="width" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true">
    <a-row class="flex flex-col" v-if="table">
      <div class="flex items-center">
        <a-checkbox v-model:checked="allChecked" @change="handleAllChecked" />
        <div class="ml-4">{{ table.tableName }}</div>
        <div class="mx-4">{{ table.tableComment }}</div>
        <a-input class="w-28" size="small" v-if="table.tableAlias" v-model:value="table.tableAlias" placeholder="别名" />
        <a-button v-else size="small" @click="handleTableAlias(table)">
          <template #icon><PlusOutlined /></template>
        </a-button>
      </div>
      <div class="h-96 overflow-auto pl-4 pt-2">
        <div class="flex items-center mb-2" v-for="column in table.columns" :key="column.columnId">
          <a-checkbox v-model:checked="column.selectChecked" />
          <div class="ml-4">{{ column.columnName }}</div>
          <div class="mx-4">{{ column.columnComment }}</div>
          <a-input class="w-28" size="small" v-if="column.columnAlias" v-model:value="column.columnAlias" placeholder="别名" />
          <a-button v-else size="small" @click="handleColumnAlias(column)">
            <template #icon><PlusOutlined /></template>
          </a-button>
        </div>
      </div>
    </a-row>
    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { generateId } from '/@/utils/id-util.js';

  const props = defineProps({
    title: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 600,
    },
  });

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(t, e) {
    table.value = JSON.parse(JSON.stringify(t));
    event = e;
    visibleFlag.value = true;
  }

  function onClose() {
    visibleFlag.value = false;
    table.value = null;
    allChecked.value = false;
  }

  async function onSubmit() {
    let fields = table.value.columns
      .filter((column) => column.selectChecked)
      .map((column) => ({
        id: column.columnId + generateId(),
        columnId: column.columnId,
        name: column.columnName,
        alias: column.columnAlias,
        columnType: column.columnType,
        selectChecked: true,
        whereChecked: false,
      }));

    let tableTmp = {
      id: table.value.tableId + '-' + generateId(),
      tableId: table.value.tableId,
      name: table.value.tableName,
      alias: table.value.tableAlias,
      type: table.value.tableType,
      fields: fields,
    };
    emits('createTable', tableTmp, event);
    onClose()
  }

  onMounted(() => {});

  defineExpose({
    show,
  });
  //----------
  let event = null;
  const table = ref(null);
  const allChecked = ref(false);
  function handleColumnAlias(column) {
    column.columnAlias = column.columnName;
  }
  function handleTableAlias(table) {
    table.tableAlias = table.tableName;
  }
  function handleAllChecked() {
    for (let i = 0; i < table.value.columns.length; i++) {
      table.value.columns[i].selectChecked = allChecked.value;
    }
  }
</script>
