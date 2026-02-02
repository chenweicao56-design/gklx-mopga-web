<template>
    <div v-if="message.type === 'user'" class="message-user">
      <div>
        <Text :text="message.content" :type="message.type"  class="bg-gray-200 rounded-xl"/>
        <div></div>
      </div>
    </div>
    <div v-else  class="message-ai">
      <Text :text="message.content"  :type="message.type" />
    </div>
</template>
<script setup>
  import Text from '/@/components/business/ai/text.vue';
  const props = defineProps({
    message: {
      type: Object,
      default: () => {},
    },
  });
</script>
<style scoped lang="less">
  .message-user {
    display: flex;
    justify-content: end;
  }
  .message-ai {
    display: flex;
    flex-direction: row;
    justify-content: start;
  }
</style>
