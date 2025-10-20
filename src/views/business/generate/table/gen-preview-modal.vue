<template>
  <a-drawer
      title="代码预览"
      :open="visibleFlag"
      :width="1300"
      :footerStyle="{ textAlign: 'right' }"
      :bodyStyle="{ padding: '8px 24px' }"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-row justify="space-between" class="smart-margin-bottom10">
      <a-radio-group v-model:value="fileType" button-style="solid" @change="onChangeFileType">
        <a-radio-button v-for="item in fileTypes" :key="item.value" :value="item.value">{{
            item.label
          }}
        </a-radio-button>
      </a-radio-group>
      <div class="flex flex-row items-center">
        <a-button class="mr-3" type="primary"  @click="checkAll()">{{ buttonSelectChecked? '全选' : '取消' }}</a-button>
        <a-button class="mr-3" type="primary" @click="copy()">复制</a-button>
        <a-button class="mr-3" type="primary" :disabled="fileType.toUpperCase() !=='SQL'" @click="executeSql">执行</a-button>
        <a-button class="mr-3" type="primary" @click="contract()">对比</a-button>
        <a-input-search
            v-model:value="genPluginUrl"
            placeholder="覆盖的本地服务地址"
            enter-button="覆盖"
            size="large"
            @search="syncSave"
        />
      </div>
    </a-row>
    <a-tabs v-model:activeKey="fileKey" size="small" @change="onChangeTab">
      <a-tab-pane v-for="item in files" :key="item.fileName">
        <template #tab>
        <span>
          {{ item.fileName }}
        </span>
          <a-checkbox style="margin-left: 10px" v-model:checked="item.checked"/>
        </template>
      </a-tab-pane>
    </a-tabs>
    <div>
      <div></div>
      <!--      <CusDiffMatchPatch ref="cusDiffMatchPatchRef" />-->
      <CusCodeMirror ref="cusCodeMirrorRef" v-model:model-value="file.fileContent" height="700px"/>

    </div>
  </a-drawer>
</template>

<script setup>
import {nextTick, ref} from 'vue';
import {generateApi} from '/@/api/business/generate/generate-api';
import CusCodeMirror from '/@/components/business/generate/CusCodeMirror.vue';
import 'highlight.js/styles/github-dark.css';
import {message, Modal} from "ant-design-vue";

// ------------------ 显示，关闭 ------------------
const databaseId = ref(null);
const tableId = ref(null);
// 显示
const visibleFlag = ref(false);

function showModal(dbId, tId) {
  databaseId.value = dbId;
  tableId.value = tId;
  visibleFlag.value = true;
  nextTick(() => {
    preview()
  });
}

// 关闭
function onClose() {
  visibleFlag.value = false;
}


// ------------------ 标签页 ------------------
const genPluginUrl = ref("http://127.0.0.1:8000");
const fileType = ref("");
const fileTypes = ref({});
const files = ref([]);

function preview() {
  generateApi.preview(tableId.value).then((res) => {
        nextTick(() => {
          fileTypes.value = res.data;
          fileType.value = fileTypes.value[0].value;
          fileKey.value = fileTypes.value[0].files[0].fileName;
          files.value = fileTypes.value[0].files;
          file.value = fileTypes.value[0].files[0];
        });
      }
  )
}

function onChangeFileType(e) {
  fileType.value = e.target.value;
  let list = fileTypes.value;
  for (let i = 0; i < list.length; i++) {
    if (e.target.value === list[i].value) {
      files.value = list[i].files;
      return
    }
  }
}


// ------------------ 查询代码 ------------------

const fileKey = ref(null);
const file = ref({fileContent: ""});

function onChangeTab(tab) {
  file.value = tab;
  files.value.forEach((item) => {
    if (item.fileName === tab) {
      file.value = item;
    }
  })
}
const buttonSelectChecked = ref(true);
function checkAll() {
  buttonSelectChecked.value = !buttonSelectChecked.value;
  let ft = fileTypes.value.find((item) => {
    return item.value === fileType.value;
  })
  if (ft) {
    ft.files.forEach((item) => {

      item.checked = buttonSelectChecked.value;
    })
  }
}


function copy() {
  let textarea = document.createElement('textarea');
  document.body.appendChild(textarea);
  textarea.value = file.value.fileContent;
  textarea.select();
  document.execCommand('Copy');
  document.body.removeChild(textarea);
  message.success('复制成功');
}

function syncSave() {
  Modal.confirm({
    title: '提示',
    content: '确定要覆盖本地【】吗?',
    okText: '确认',
    okType: 'primary',
    onOk() {
      let ft =fileTypes.value.filter((item) => {
        return item.value === fileType.value;
      })
      // console.log(ft)
      generateApi.coverCode(genPluginUrl.value, ft).then((res) => {
        message.success('保存成功');
      })
    },
    cancelText: '取消',
    onCancel() {
    },
  });
}
function executeSql() {

}

defineExpose({
  showModal,
});
</script>

<style lang="less" scoped>
.preview-title {
  font-weight: 600;
  margin: 5px 0px;
}

.preview-block {
  font-size: 12px;
  padding: 10px 5px;
}

:deep(.hljs) {
  .hljs-ln-numbers {
    text-align: center;
    color: #ccc;
    border-right: 1px solid #ccc;
    vertical-align: top;
    padding-right: 5px !important;
  }

  .hljs-ln-code {
    padding-left: 5px !important;
  }
}
</style>
