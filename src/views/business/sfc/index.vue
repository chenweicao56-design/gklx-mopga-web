<template>
  <div style="height: 40%">
    <VueLoader :code="code" v-if="code"/>
  </div>

   <div class="mt-4" style="height: 60%; overflow: auto">
     <CusCodeMirror ref="cusCodeMirrorRef" v-model:model-value="code" height="700px" />
   </div>



</template>

<script setup>
import VueLoader from '/src/components/business/generate/vue-loader.vue';
import CusCodeMirror from '/@/components/business/generate/CusCodeMirror.vue';
import { ref } from 'vue';

const code = ref('');
  const testComponentStr = `
<template>
  <div class="remote-child">
    <h3>{{ title }}</h3>
    <p>计数器: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script setup>
import {ref} from 'vue';

const title = ref('远程子组件');
const count = ref(0);

const increment = () => {
  count.value++;
};

const decrement = () => {
  count.value--;
};
<\/script>

<style scoped>
.remote-child {
  padding: 20px;
  border: 1px solid #42b983;
  border-radius: 8px;
  background: #f9f9f9;
}
.remote-child h3 {
  color: #42b983;
  margin-bottom: 10px;
}
button {
  margin: 5px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
`;


</script>

<style scoped></style>
