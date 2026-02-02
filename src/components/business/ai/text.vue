<template>
  <div v-if="type === 'user'" class="markdown-content text-user" v-text="text"></div>
  <div v-else class="markdown-content" v-html="renderedMarkdown"></div>
</template>
<script setup>
  import { computed, ref } from 'vue';
  import MarkdownIt from 'markdown-it';

  const props = defineProps({
    text: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'user',
    },
  });

  const md = new MarkdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  });
  const renderedMarkdown = computed(() => {
    return md.render(props.text);
  });
</script>
<style scoped lang="less">
 .text-user{
   max-width: 400px
 }

 .markdown-content{
   display: block;
   padding:  8px 12px 8px 12px;
 }
</style>
