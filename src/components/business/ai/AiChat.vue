<template>
  <a-modal :open="visibleFlag"
           width="1000px"
           :footer="null"
           @cancel="onClose"
           title="智能助理">
    <div class="ai-chat-container flex flex-col  p-4">
      <a-divider class="m-0"/>
      <div class="chat-content flex-1 overflow-y-auto my-4">
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
          <div>
            <a-button type="primary" shape="circle" size="small" @click="toggleListening">
              <template #icon>
                <AudioOutlined v-if="!isListening"/>
                <AudioMutedOutlined v-else/>
              </template>
            </a-button>
            <a-button class="ml-4" type="primary" shape="circle" size="small" @click="sendQuestion">
              <template #icon>
                <SmileOutlined/>
              </template>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>

</template>
<script setup lang="ts">
// 是否显示
import {nextTick, onBeforeUnmount, ref} from "vue";
import {fetchEventSource} from "@microsoft/fetch-event-source";


const visibleFlag = ref(false);

function handleOk() {

}

function show() {
  visibleFlag.value = true;
  nextTick(() => {

  });
}

// const startPosition = ref({x: 0, y: 0, offsetX: 0, offsetY: 0})
// const isMovedown = ref(false)
//
// function initDrag() {
//   const header = document.querySelector('.ant-modal-header')
//   if (header) {
//     header.addEventListener('mousedown', (e) => {
//       startPosition.value.x = e.pageX
//       startPosition.value.y = e.pageY
//       startPosition.value.offsetX = e.offsetX
//       startPosition.value.offsetY = e.offsetY
//       isMovedown.value = true
//     })
//   }
//
// }

function onClose() {
  visibleFlag.value = false;
}

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
        if (chatListTmp[chatListTmp.length - 1].type === "ai") {
          chatListTmp[chatListTmp.length - 1].content += data.content
        } else {
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

//
const isListening = ref(false);
const isProcessing = ref(false);
const errorMsg = ref('');
let recognition = null;
// 开始语音识别
const startRecognition = () => {
  // 防止重复启动
  if (isProcessing.value) return;

  isProcessing.value = true;
  errorMsg.value = '';

  // 检查浏览器支持
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    errorMsg.value = '您的浏览器不支持语音识别功能，请使用Chrome、Edge等现代浏览器';
    isProcessing.value = false;
    return;
  }

  // 检查安全环境
  // if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  //   errorMsg.value = '语音识别需要在HTTPS环境下使用（localhost除外）';
  //   isProcessing.value = false;
  //   return;
  // }

  // 创建识别实例
  recognition = new SpeechRecognition();

  // 配置识别参数
  recognition.lang = 'zh-CN';
  recognition.continuous = true; // 单次识别
  recognition.interimResults = false; // 不返回中间结果
  recognition.maxAlternatives = 1;

  // 绑定事件处理函数
  recognition.onresult = handleResult;
  recognition.onerror = handleError;
  recognition.onend = handleEnd;

  // 开始识别
  try {
    recognition.start();
    isListening.value = true;
    isProcessing.value = false;
    console.log('开始语音识别');
  } catch (err) {
    errorMsg.value = `启动识别失败: ${err.message}`;
    isListening.value = false;
    isProcessing.value = false;
    console.error('启动识别失败:', err);
  }
};
// 处理识别结果
const handleResult = (event) => {
  if (event.results && event.results.length > 0) {
    const result = event.results[event.results.length - 1][0].transcript;
    console.log('识别结果:', result);
    chatQueryForm.value.question += result;
  }
};
// 处理错误
const handleError = (event) => {
  console.error('识别错误:', event.error);
  isListening.value = false;
  isProcessing.value = false;

  // 错误信息映射表
  const errorMap = {
    'not-allowed': '请允许麦克风权限后再试',
    'permission-denied': '麦克风权限已被拒绝',
    'no-speech': '未检测到语音输入',
    'audio-capture': '无法访问麦克风，请检查设备'
  };

  errorMsg.value = `识别失败: ${errorMap[event.error] || event.error}`;
};

// 处理识别结束
const handleEnd = () => {
  console.log('语音识别已结束');
  isListening.value = false;
  isProcessing.value = false;
};

// 停止语音识别
const stopRecognition = () => {
  if (recognition && isListening.value) {
    recognition.stop();
    isListening.value = false;
    isProcessing.value = false;
  }
};

// 切换识别状态
const toggleListening = () => {
  if (isListening.value) {
    stopRecognition();
  } else {
    startRecognition();
  }
};
onBeforeUnmount(() => {
  if (recognition) {
    recognition.abort(); // 强制终止识别
    // 移除事件监听
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition = null;
  }
})

defineExpose({
  show,
});
</script>
<style scoped lang="less">
.ai-chat-container {
  height: 60vh;
}
</style>
