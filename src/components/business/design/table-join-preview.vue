<!--
  *
  *
  * @Author:    gklx
  * @Date:
  * @Copyright  1.0
-->
<template>
  <a-modal :title="title" :width="width" :open="visibleFlag" @cancel="onClose" :maskClosable="false" :destroyOnClose="true">
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item label="方法名称" class="smart-query-form-item">
          <a-input style="width: 200px" v-model:value="form.functionName" placeholder="请输入方法名称" />
        </a-form-item>

        <a-form-item class="smart-query-form-item">
          <a-button type="primary" @click="onSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
    <CusCodeMirror ref="cusCodeMirrorRef" v-model:model-value="code" height="700px" />
  </a-modal>
</template>

<script setup>
  import { reactive, ref } from 'vue';
  import CusCodeMirror from '/@/components/business/generate/CusCodeMirror.vue';
  import { generateApi } from '/@/api/business/generate/generate-api';

  const props = defineProps({
    width: {
      type: Number,
      default: 800,
    },
    title: {
      type: String,
      default: '',
    },
  });

  // ------------------------ 事件 ------------------------

  const emits = defineEmits(['reloadList']);

  // ------------------------ 显示与隐藏 ------------------------
  // 是否显示
  const visibleFlag = ref(false);

  function show(id, d) {
    Object.assign(form, formDefault);
    form.databaseId = id;
    let selects = [];
    let wheres = [];
    form.mainTableName = d.tables[0].name;
    form.mainTableAlias = d.tables[0].alias;
    d.tables.forEach((item) => {
      item.fields.forEach((field) => {
        if (field.selectChecked) {
          selects.push({
            tableName: item.name,
            tableAlias: item.alias,
            columnName: field.name,
            columnAlias: field.alias,
          });
        }
        if (field.whereChecked) {
          wheres.push({
            tableName: item.name,
            tableAlias: item.alias,
            columnName: field.name,
            columnAlias: field.alias,
            whereType: field.whereType,
          });
        }
      });
    });
    let froms = [];
    d.joins.forEach((item) => {
      let ons = [];
      item.ons.forEach((on) => {
        ons.push({
          tableName: on.table.name,
          tableAlias: on.table.alias,
          columnName: on.field.name,
          columnAlias: on.field.alias,
          targetTableName: on.targetTable.name,
          targetTableAlias: on.targetTable.alias,
          targetColumnName: on.targetField.name,
          targetColumnAlias: on.targetField.alias,
          type: on.relation,
        });
      });
      let from = {
        joinType: item.joinType,
        tableName: item.targetTable.name,
        tableAlias: item.targetTable.alias,
        ons: ons,
      };
      froms.push(from);
    });
    form.selects = selects;
    form.froms = froms;
    form.wheres = wheres;

    visibleFlag.value = true;
  }

  function onClose() {
    visibleFlag.value = false;
  }

  async function onSubmit() {}

  defineExpose({
    show,
  });
  //========================== 业务逻辑 ==========
  const formDefault = {
    databaseId: undefined,
    functionName: undefined,
    mainTableName: undefined,
    mainTableAlias: undefined,
    selects: undefined,
    froms: undefined,
    wheres: undefined,
    groupBys: undefined,
    limit: undefined,
  };

  let form = reactive({ ...formDefault });
  let cusCodeMirrorRef = ref();
  let code = ref('');
  function onSearch() {
    generateApi.generateMybatis(form).then((res) => {
      code.value = res.data;
    });
  }
</script>
