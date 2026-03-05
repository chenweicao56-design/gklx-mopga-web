<template>
  <img :src="gifUrl" alt="GIF Animation" />
</template>

<script setup>
  import { ref, watch } from 'vue';
  import loadingGif from '/@/assets/gif/ai.gif';

  const props = defineProps({
    gifSrc: {
      type: String,
      default: loadingGif,
    },
  });

  const gifUrl = ref(props.gifSrc);
  watch(
    () => props.gifSrc,
    (newVal) => {
      gifUrl.value = newVal;
    },
    { immediate: true }
  );
</script>
<style lang="less" scoped>
  img {
    height: 32px;
  }
</style>
