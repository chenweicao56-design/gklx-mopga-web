<script setup>
import ModelDesigner from "/@/components/business/design/model-designer";
import TableColumnFilterModel from "/@/components/business/design/TableColumnFilterModel.vue";
import {computed, nextTick, onMounted, ref} from "vue";
import {message} from "ant-design-vue";
import { useDictStore } from '/@/store/modules/system/dict.js';
const props = defineProps({
  dragTable: {
    type: Object,
    default: () => {
    },
  },
});
let model = ref(null)
let MD = null;

function init() {
  MD = new ModelDesigner('.stage',useDictStore().getDictData("WHERE_TYPE"))
  MD.createBackground()
  // MD.createPreview('.preview-stage', 200, 150)
  MD.on('change', () => {
    // 触发change事件，保存模型数据
  })
  // 绑定全局点击
  MD.on('stage:click', (e) => {
    // 关闭SQL查看，添加model.value判断，避免没有模型选中时报错
    if (e.target.nodeType === 'Stage' && model.value) {
      model.value.__visibleSQLPreviewWindow = false
    }
  })
  // 删除表事件
  MD.on('table:delete', ({table}) => {
    deleteTable(table)
  })
  // 绑定创建关联线事件
  MD.on('line:created', ({table, targetTable, field, targetField}) => {
    // 添加关联线
    if (model.value.__lineType === 'join') {
      addJoinLine({table, targetTable, field, targetField})
    }
    // 如果为聚合函数关联
    if (model.value.__lineType === 'aggregate') {
      addAggregateLine({table, targetTable, field, targetField})
    }
    // 刷新SQL
    // this.refreshSQL()
    // this.$emit('change')
  })
  // 绑定创建关联线失败事件
  MD.on('line:create:error', (err) => {
    message.error(err.message)
  })
  // 删除关联线事件
  MD.on('line:deleted', ({table, targetTable, field, targetField}) => {
    deleteLine({table, targetTable, field, targetField})
    // this.refreshSQL()
  })


}

function initModel() {
  nextTick(() => {
    // 重绘
    MD.redraw()
    // MD.redrawPreview()
    if (this.model == null) {
      // 刷新SQL
      // this.refreshSQL()
      return
    }
    // 添加表
    for (const table of this.model.tables) {
      MD.createTable(table, table.x, table.y)
    }
    // 添加JOIN线
    for (const join of this.model.joins) {
      for (const on of join.ons) {
        MD.createLine({
          lineType: 'join',
          field: on.field,
          targetField: on.targetField,
          table: on.table,
          targetTable: on.targetTable
        })
      }
    }
    // 添加聚合线
    for (const aggregate of this.model.aggregates) {
      MD.createLine({
        lineType: 'aggregate',
        field: aggregate.field,
        targetField: aggregate.targetField,
        table: aggregate.table,
        targetTable: aggregate.targetTable
      })
    }
    // 刷新SQL
    // this.refreshSQL()
  })
}
async function handleDrop(e) {
  let table = props.dragTable
  tableColumnFilterModelRef.value.show(table, e)
}



// 创建模型
function createModel(table) {
  const newModel = {
    // 模型名称
    name: table.tableName,
    // 备注
    comment: table.tableComment,
    // 模型设计的数据库表
    tables: [],
    // join关联关系
    joins: [],
    // 聚合关联关系
    aggregates: [],
  }

  // 拷贝模型，避免内存模型引用当前this.newModel
  const copyModel = JSON.parse(JSON.stringify(newModel))
  // copyModel.id = modelId
  // 补充关联线类型，默认为join
  copyModel.__lineType = 'join'
  // 补充是否展示SQL预览窗口
  copyModel.__visibleSQLPreviewWindow = false
  // model.values.unshift(copyModel)
  return copyModel
}

function createTable(table, e) {
  let tableX = 0
  let tableY = 0
  if (e) {
    MD.stage.setPointersPositions(e)
    const mousePos = MD.stage.getPointerPosition()
    tableX = mousePos.x - MD.TABLE_WIDTH / 2
    tableY = mousePos.y
  }


  // 创建新表对象
  const newTable = {
    // 增加设计器元素ID
    ...table,
    fields: table.fields.map(f => {
      return {
        ...f,
        visible: true,
        isVirtual: false
      }
    }),
    // 非虚拟表
    isVirtual: false,
    // 坐标
    x: tableX,
    y: tableY
  }
  // 如果模型为null，则根据表名创建模型
  if (model.value == null) {
    model.value = createModel(table)
  }
  // 添加到模型表中
  model.value.tables.push(newTable)
  // 创建表元素
  MD.createTable(newTable, tableX, tableY, true)
}

// 删除线
function deleteLine({table, targetTable, field, targetField}) {
  // 查找对应join
  const joinIndex = model.value.joins.findIndex(join => {
    return (join.table.id === table.id || join.table.id === targetTable.id) && (join.targetTable.id === table.id || join.targetTable.id === targetTable.id)
  })
  // 删除join线
  if (joinIndex !== -1) {
    const join = model.value.joins[joinIndex]
    // 找到对应的on
    const onIndex = join.ons.findIndex(on => {
      return on.field.name === field.name && targetField.name === targetField.name
    })
    if (onIndex !== -1) {
      join.ons.splice(onIndex, 1)
    }
    // 如果没有了关联关系，则删除join
    if (join.ons.length === 0) {
      model.value.joins.splice(joinIndex, 1)
    }
  }
  // 删除聚合线
  const aggIndex = model.value.aggregates.findIndex(agg => {
    return agg.table.id === table.id &&
        agg.targetTable.id === targetTable.id &&
        agg.field.name === field.name &&
        agg.targetField.name === targetField.name
  })
  model.value.aggregates.splice(aggIndex, 1)
}

// 添加join关系
function addJoinLine({table, targetTable, field, targetField}) {
  // 查找JOIN关系是否已存在
  let join = model.value.joins.find(join =>
      (join.table.id === table.id || join.table.id === targetTable.id) &&
      (join.targetTable.id === table.id || join.targetTable.id === targetTable.id)
  )
  // 不存在JOIN关系，则添加JOIN关系
  if (join == null) {
    join = {
      table: table,
      targetTable: targetTable,
      joinType: 'LEFT JOIN',
      relation: 'ONE-TO-ONE',
      ons: []
    }
    model.value.joins.push(join)
  }
  // 添加ON条件
  join.ons.push({
    table,
    targetTable,
    field,
    targetField,
    relation: 'AND'
  })
}

function addAggregateLine({table, targetTable, field, targetField}) {
  let aggregate = model.value.aggregates.find(
      r => r.table.id === table.id &&
          r.targetTable.id === targetTable.id &&
          (r.field.name === field.name || targetField.name === targetField.name)
  )
  if (aggregate == null) {
    model.value.aggregates.push({
      table: table,
      targetTable: targetTable,
      field: field,
      targetField: targetField,
      function: 'COUNT'
    })
  }
}

const tableColumnFilterModelRef = ref()

function deleteTable(table) {
  const tableIndex = model.value.tables.findIndex(t => t.id === table.id)
  model.value.joins = model.value.joins.filter(join => {
    if (join.table.id === table.id) {
      return false
    }
    if (join.targetTable.id === table.id) {
      return false
    }
    return true
  })

  model.value.aggregates = model.value.aggregates.filter(agg => {
    if (agg.table.id === table.id) {
      return false
    }
    if (agg.targetTable.id === table.id) {
      return false
    }
    return true
  })
  MD.deleteTable(table)
  model.value.tables.splice(tableIndex, 1)
}

function handlePreview() {
  console.log('handlePreview',JSON.stringify(model.value))

  let tablesTmp =model.value.tables
  let joinsTmp = model.value.joins
  let sql = []
  sql.push('SELECT ')
  tablesTmp.forEach(table => {
    table.fields.forEach(field => {
      if (field.selectChecked) {
        sql.push(field.name + ', ')
      }
    })
  })
  sql[sql.length - 1] = sql[sql.length - 1].slice(0, -2)+' '
  sql.push('FROM ' + tablesTmp[0].name +" ")
  joinsTmp.forEach(join => {
    sql.push(join.joinType + ' ' + join.targetTable.name +'ON '
      + join.table.name + '.' + join.ons[0].field.name + '=' + join.targetTable.name + '.' + join.ons[0].targetField.name + ' ')
  })
}

onMounted(() => {
  nextTick(() => {
    init()
  })
})
</script>

<template>
  <div class="sql-design"
       @dragover.prevent
       @drop="handleDrop($event)">
    <div class="stage"></div>
    <div class="absolute bottom-8 right-8">
      <a-button type="primary" shape="circle" @click="handlePreview">
        <template #icon>
          <SearchOutlined/>
        </template>
      </a-button>
    </div>
    <TableColumnFilterModel ref="tableColumnFilterModelRef" @createTable="createTable"/>
  </div>
</template>

<style scoped>
.sql-design {
  overflow: auto;
}

</style>
