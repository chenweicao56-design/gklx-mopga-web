<template>
  <a-row>
    <a-button type="primary" @click="addCode">添加模板</a-button>
  </a-row>
  <a-table
      size="small"
      bordered
      id="templateCodeTable"
      class="smart-margin-top10"
      :dataSource="codeList"
      row-class-name="column-row"
      :columns="columns"
      rowKey="id"
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

      <template v-if="column.dataIndex === 'operate'">
        <div class="smart-table-operate">
          <a-button type="link" @click="onEdit(record)">编辑</a-button>
          <a-button type="link" @click="onDelete(index)" danger>删除</a-button>
        </div>
      </template>
    </template>
  </a-table>
  <TemplateCodeItemForm ref="templateCodeItemForm" @reloadList="onFinish"/>

</template>

<script setup>
import Sortable from 'sortablejs';
import {nextTick, ref} from 'vue';
import {templateCodeItemApi} from '/src/api/business/generate/template-code-item-api.js';
import {message, Modal} from "ant-design-vue";
import {SmartLoading} from "/src/components/framework/smart-loading/index.js";
import {smartSentry} from "/src/lib/smart-sentry.js";
import TemplateCodeItemForm from "./template-code-item-form.vue";
import {templateColumnApi} from "/@/api/business/generate/template-column-item-api.js";
//------------------------ 全局数据 ---------------------
const codeList = ref([]);
//------------------------ 表格渲染 ---------------------

const columns = ref([
  {
    title: '拖拽',
    dataIndex: 'drag',
    width: 60,
  },
  {
    title: '文件类型',
    dataIndex: 'fileType',
  },
  {
    title: '文件名',
    dataIndex: 'fileName',
  },
  {
    title: '文件路径',
    dataIndex: 'filePath',
  },
  {
    title: '操作',
    dataIndex: 'operate',
    width: 120,
  },
]);
let templateId = 0;
const templateCodeItemForm = ref();
let template = ref({});
//初始化设置数据
function show(t) {
  template.value = t;
  templateId = t.id;
  templateCodeItemApi.queryPage({templateId: templateId, pageNum: 1, pageSize: 500}).then((res) => {
    codeList.value = res.data.list;
    nextTick(() => {
      initDrag();
    });
  })
}
function onClose() {
  codeList.value = [];
}


// -------------------  增加、删除 -------------------
function addCode() {
  templateCodeItemForm.value.show({templateId: templateId});
}

function onDelete(index) {
  codeList.value[index].id
  Modal.confirm({
    title: '提示',
    content: '确定要删除吗?',
    okText: '确认',
    okType: 'primary',
    onOk() {
      message.success("删除成功")
      templateCodeItemApi.delete(codeList.value[index].id).then(res => {
        show(template.value)
      })
    },
    cancelText: '取消',
    onCancel() {
    },
  });
}

function onEdit(record) {
  templateCodeItemForm.value.show(record);
}

function onFinish() {
   show(template.value)
}

//初始化拖拽
function initDrag() {
  let tbody = document.querySelector('#templateCodeTable tbody');
  Sortable.create(tbody, {
    animation: 300,
    dragClass: 'smart-ghost-class', //设置拖拽样式类名
    ghostClass: 'smart-ghost-class', //设置拖拽停靠样式类名
    chosenClass: 'smart-ghost-class', //设置选中样式类名
    handle: '.handle',
    onEnd: ({oldIndex, newIndex}) => {
      let list = [...codeList.value];
      if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;
      const [movedItem] = list.splice(oldIndex, 1);
      const insertIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
      list.splice(insertIndex, 0, movedItem);
      codeList.value = [...list];
      console.log(codeList.value)
    },
  });
}


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
    if (codeList.value.length === 0) {
      return message.error('请至少添加一个模板代码项!');
    } else {
      for (let i = 0; i < codeList.value.length; i++) {
        codeList.value[i].sort = i + 1;
      }
    }
    await templateCodeItemApi.batchSaveOrUpdate(codeList.value);
    show(template.value);
    message.success('操作成功');
  } catch (err) {
    smartSentry.captureError(err);
  } finally {
    SmartLoading.hide();
  }
}

// -------------------  获取表单数据 -------------------
defineExpose({
  show,
  onSubmit,
  onClose,
});
</script>

<style lang="less" scoped></style>
