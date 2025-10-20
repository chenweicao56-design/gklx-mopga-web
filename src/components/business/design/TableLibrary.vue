<script setup>

import {computed, ref} from "vue";

const props = defineProps({
  tables: {
    type: Array,
    default: () => [],
  },
  masterTableId: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['table-drag']);

function handleDragStart(table) {
  emits('table-drag', table);
}

const searchValue = ref('');
const filteredTables = computed(() => {
  return props.tables.filter(table => {
    return table.tableName.toLowerCase().includes(searchValue.value.toLowerCase()) || table.tableComment.includes(searchValue.value);
  });
});
</script>

<template>
  <div class="flex flex-col">
    <a-input v-model:value="searchValue" placeholder="search" allow-clear/>
    <div class="table-library bg-white  divide-y divide-x-0 divide-gray-100 divide-solid">
      <div v-for="table in filteredTables"
           :key="table.tableId"
           class="p-4"
           draggable="true"
           @dragstart="handleDragStart(table)">
        <div :class="[table.tableId.toString() === props.masterTableId ? 'text-red-500' : '']">{{ table.tableName }}</div>
        <div :class="[table.tableId.toString() === props.masterTableId ? 'text-red-300 mt-2 text-sm'  : 'text-gray-500 mt-2 text-sm']">{{ table.tableComment }}</div>
      </div>

    </div>
  </div>


</template>

<style scoped lang="less">
.table-library {
  width: 250px;
  height: 100%;
  overflow-y: auto;
}
</style>
