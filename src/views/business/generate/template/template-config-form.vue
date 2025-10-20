<template>
  <a-drawer
      title="模板配置"
      style=""
      :open="visibleFlag"
      :width="1200"
      :footerStyle="{ textAlign: 'right' }"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-tabs v-model:activeKey="activeKey" @change="onTabChange">
      <a-tab-pane key="1" :forceRender="true">

        <template #tab>
          <span>
            1.基础信息
          </span>
          <a-tooltip placement="bottom">
            <template #title>基础信息</template>
            <QuestionCircleOutlined/>
          </a-tooltip>
        </template>
        <TemplateEdit ref="templateEditRef"/>
      </a-tab-pane>

      <a-tab-pane key="2" :forceRender="true">
        <template #tab>
          <span>
            2.字段映射
          </span>
        </template>
        <TemplateConfigMapping ref="templateConfigMappingRef"/>
      </a-tab-pane>

      <a-tab-pane key="3" :forceRender="true">
        <template #tab>
          <span>
            3.字段信息
          </span>
        </template>
        <TemplateConfigColumn ref="templateConfigColumnRef"/>
      </a-tab-pane>

      <a-tab-pane key="4" :forceRender="true">
        <template #tab>
          <span>
            4.模板信息
          </span>
        </template>
        <TemplateCode ref="templateCodeRef"/>
      </a-tab-pane>
    </a-tabs>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="save">保存</a-button>
      </a-space>
    </template>

  </a-drawer>
</template>

<script setup>
import {nextTick, ref} from 'vue';
import {SmartLoading} from '/src/components/framework/smart-loading';
import {smartSentry} from '/src/lib/smart-sentry';
import {message} from 'ant-design-vue';
import TemplateEdit from './components/template-edit.vue';
import TemplateConfigColumn from './components/template-config-column.vue';
import TemplateConfigMapping from './components/template-config-mapping.vue';
import TemplateCode from './components/template-code.vue';
// ------------------ 组件------------------
const templateEditRef = ref();
const templateConfigColumnRef = ref();
const templateConfigMappingRef = ref();
const templateCodeRef = ref();

// ------------------ 显示，关闭 ------------------
// 显示
const visibleFlag = ref(false);

const template = ref({});

function showModal(t) {
  template.value = t;
  activeKey.value = '1';
  visibleFlag.value = true;
  nextTick(() => {
    onTabChange()
  });
}

// 关闭
function onClose() {
  templateEditRef.value.onClose();
  templateConfigColumnRef.value.onClose();
  templateConfigMappingRef.value.onClose();
  templateCodeRef.value.onClose();
  visibleFlag.value = false;
}

// ------------------ 标签页 ------------------
const activeKey = ref('1');

// ------------------ 提交表单 ------------------
const emits = defineEmits(['reloadList']);

async function save() {
  SmartLoading.show();
  try {
    if (activeKey.value === '1') {
      templateEditRef.value.onSubmit();
    } else if (activeKey.value === '2') {
      templateConfigMappingRef.value.onSubmit();
    } else if (activeKey.value === '3') {
      templateConfigColumnRef.value.onSubmit();
    } else if (activeKey.value === '4') {
      templateCodeRef.value.onSubmit();
    }
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

function onTabChange() {
  if (activeKey.value === '1') {
    templateEditRef.value.show(template.value);
  } else if (activeKey.value === '2') {
    templateConfigMappingRef.value.show(template.value);
  } else if (activeKey.value === '3') {
    templateConfigColumnRef.value.show(template.value);
  } else {
    templateCodeRef.value.show(template.value);
  }
}

defineExpose({
  showModal,
});

</script>

<style lang="less" scoped>
.visible-list {
  display: flex;
  flex-wrap: wrap;

  .visible-item {
    padding-top: 8px;
  }
}
</style>
