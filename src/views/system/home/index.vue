<!--
  * 首页
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-09-12 22:34:00
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
  *
-->
<template>
  <!--  顶部用户信息-->
  <a-row>
    <HomeHeader />
  </a-row>
  <!--下方左右布局-->

</template>
<script setup>
import {computed} from 'vue';
import HomeHeader from './home-header.vue';
// import AdModal from './ad-modal.vue';

  // 业绩完成百分比
  const saleTargetPercent = computed(() => {
    return 75;
  });
</script>
<style lang="less" scoped>
  @import './index.less';
</style>
