<template>
  <div class="ai-chat-container flex flex-col  p-4">
    <div class="chat-header basis-10 flex justify-between items-center">
      <strong>智能助理</strong>
      <strong class="help-doc-close">
        <close-outlined/>
      </strong>
    </div>
    <a-divider class="m-0"/>
    <div class="chat-content flex-1 overflow-y-auto">
      <div v-for="(item, index) in chatList" :key="index" class="mt-4">
        <div class="question w-full flex justify-end" v-if="item.type === 'user'">
          <div class="p-4 bg-slate-100 rounded-lg">{{ item.content }}</div>
        </div>
        <div class="answer  w-full flex justify-start" v-else>
          <div class="p-4 bg-slate-100 rounded-lg" v-html="item.content"></div>
        </div>
      </div>
    </div>
    <div class="chat-header basis-16">
      <a-textarea v-model:value="chatQueryForm.question" placeholder="问点啥把" :rows="3"/>
      <div class="flex mt-4 items-center justify-between w-full">
        <div>
          <a-select
              ref="select"
              size="small"
              v-model:value="mode"
              style="width: 120px"
          >
            <a-select-option value="shell">指令模式</a-select-option>
          </a-select>
        </div>
        <a-button type="primary" shape="circle" size="small" @click="sendQuestion">
          <template #icon>
            <SmileOutlined/>
          </template>
        </a-button>
      </div>


    </div>

  </div>
</template>
<script setup lang="ts">

import {onUnmounted, ref} from "vue";
import {fetchEventSource} from '@microsoft/fetch-event-source';

const chatList = ref([
  {
    content: "你是谁",
    type: "user"
  },
  {
    content: "你好，我是智能助理,你要问神马？你好，我是智能助理,你要问神马？你好，我是智能助理,你要问神马？",
    type: "ai"
  },
])
const mode = ref("shell")

const abortController = new AbortController();
const isTalking = ref(false)

const chatQueryForm = ref({
  conversationId: new Date().getTime(),
  question: "",
})

function sendQuestion() {

  chatList.value.push({
    content: chatQueryForm.value.question,
    type: "user"
  })
  connect()
}

const connect = async () => {
  try {
    await fetchEventSource('http://127.0.0.1:1024/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatQueryForm.value),
      signal: abortController.signal,
      onopen: async (response) => {
        if (!response.ok) {
          console.error('连接失败:', response.status);
        } else {
          console.log('SSE 连接成功');
        }
      },

      onmessage: async (event) => {
        const data = JSON.parse(event.data);
       let chatListTmp = chatList.value
        if(chatListTmp[chatListTmp.length-1].type === "ai"){
          chatListTmp[chatListTmp.length-1].content += data.content
        }else{
          chatListTmp.push(data)
        }
        chatList.value = chatListTmp

      },
      onerror: (err) => {
        console.error('发生错误:', err);
        throw err;
      }
    });
  } catch (err) {
    console.error('连接失败:', err);
  }
};
onUnmounted(() => {
  abortController.abort();
});

</script>


<style scoped lang="less">
.ai-chat-container {
  height: 800px;


}

</style>
