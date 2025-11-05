<template>
  <div class="table-design-container">
    <TableLibrary :tables="tableList" :master-table-id="tableId" @table-drag="handleTableDrag"/>
    <SqlDesign ref="sqlDesignRef" :databaseId="databaseId" :table-list="tableList" :table-id="tableId" :master-table-id="tableId" style="flex: 1;width: 100px" :drag-table="dragTable"/>
  </div>

</template>
<script setup>

import {onMounted, ref} from "vue";

import TableLibrary from "/src/components/business/design/TableLibrary.vue";
import SqlDesign from "/src/components/business/design/SqlDesign.vue";
import {tableApi} from '/src/api/business/generate/table-api';
import {useRoute} from 'vue-router'

const tableList = ref([]);

const route = useRoute()
const tableId = ref(route.params.id);
const databaseId = ref(parseInt( route.query.databaseId));
const dragTable = ref(null)

onMounted(() => {
  GetTableList()
})
const sqlDesignRef = ref()

function GetTableList() {
  tableApi.all(databaseId.value).then(res => {
    tableList.value = res.data
  })
}

function handleTableDrag(table) {
  if (table.tableId.toString() === tableId.value.toString()) {
    table.tableType = "master"
  } else {
    table.tableType = "join"
  }
  dragTable.value = table
}

</script>

<style lang="less" scoped>
.table-design-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 100%;
}
</style>
