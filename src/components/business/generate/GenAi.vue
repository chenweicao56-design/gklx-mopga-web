<template>
  <a-modal
      :open="visibleFlag"
      :title="title"
      :width="width"
      :mask-closable="false"
      :footer="null"
      @cancel="handleCancel"
      class="chat-modal"
  >
    <div class="chat-container">
      <!-- 聊天历史记录区域 -->
      <div class="chat-history" ref="chatHistory">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-content">
            <h3>欢迎使用AI助手</h3>
            <p>有什么问题可以问我，我会尽力为您解答</p>
          </div>
        </div>

        <!-- 消息列表 -->
        <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message-item', message.isUser ? 'user-message' : 'ai-message']"
            :data-index="index"
        >
          <div class="avatar">
            <a-avatar
                :icon="message.isUser ? UserOutlined : RobotOutlined"
                :size="message.isUser ? 'small' : 'small'"
            />
          </div>
          <div class="message-content">
            <div class="sender">{{ message.isUser ? '你' : 'AI助手' }}</div>
            <div class="content" v-html="formatMessage(message.content)"></div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-message">
          <a-spin size="small" />
          <span class="loading-text">AI正在思考中...</span>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <a-textarea
            v-model:value="inputMessage"
            placeholder="请输入您的问题..."
            :auto-size="{ minRows: 3, maxRows: 6 }"
            @keydown.enter.exact="handleSendMessage"
            @keydown.enter.shift="() => {}"
            class="message-input"
        />
        <div class="input-actions">
          <a-button
              type="text"
              icon="paper-clip"
              class="action-btn"
              @click="handleUpload"
          />
          <a-button
              type="text"
              icon="smile"
              class="action-btn"
              @click="handleEmoji"
          />
          <a-button
              type="primary"
              @click="handleSendMessage"
              :disabled="!inputMessage.trim() || isLoading"
              class="send-btn"
          >
            发送
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { UserOutlined, RobotOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 定义组件属性
const props = defineProps({
  title: {
    type: String,
    default: 'AI 聊天助手'
  },
  width: {
    type: Number,
    default: 900
  }
});

// 定义组件事件
const emit = defineEmits(['close']);

// 模态框可见性
const visible = ref(false);
// 输入的消息
const inputMessage = ref('');
// 消息列表
const messages = ref([]);
// 加载状态
const isLoading = ref(false);
// 聊天历史容器引用
const chatHistory = ref(null);

// 打开模态框
const openModal = () => {
  visible.value = true;
  // 重置聊天状态
  messages.value = [];
  inputMessage.value = '';
};

// 关闭模态框
const handleCancel = () => {
  visible.value = false;
  emit('close');
};

// 发送消息
const handleSendMessage = () => {
  const content = inputMessage.value.trim();
  if (!content) return;

  // 添加用户消息
  messages.value.push({ isUser: true, content });
  inputMessage.value = '';
  isLoading.value = true;

  // 模拟AI回复 - 实际项目中这里会调用API
  setTimeout(() => {
    // 模拟AI回复内容
    const aiResponses = [
      '您的问题很有深度。根据我的分析，这个问题可以从多个角度来看待。首先...',
      '我理解您的需求了。关于这个问题，我可以提供一些建议供您参考...',
      '感谢您的提问。经过分析，我认为最有效的解决方案是...',
      '这个问题很有趣！让我为您详细解释一下...',
      '您提出的观点很有见地。补充一点我的看法...'
    ];

    // 随机选择一个回复
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    messages.value.push({ isUser: false, content: randomResponse });
    isLoading.value = false;
  }, 1500);
};

// 处理上传
const handleUpload = () => {
  message.info('上传功能待实现');
};

// 处理表情
const handleEmoji = () => {
  message.info('表情功能待实现');
};

// 格式化消息内容（简单处理换行）
const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>');
};

// 监听消息变化，自动滚动到底部
watch([messages, isLoading], () => {
  nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight;
    }
  });
});

// 组件挂载时
onMounted(() => {
  // 可以在这里初始化聊天记录
});

// 暴露方法给父组件
defineExpose({
  openModal
});
</script>

<style scoped>
.chat-modal {
  --primary-color: #1677ff;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  gap: 16px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  scroll-behavior: smooth;
}

.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}

.welcome-content {
  text-align: center;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;
  max-width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  margin-right: 12px;
  margin-top: 4px;
}

.user-message .avatar {
  margin-right: 0;
  margin-left: 12px;
}

.message-content {
  max-width: 70%;
}

.user-message .message-content {
  text-align: right;
}

.sender {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  font-weight: 500;
}

.content {
  padding: 10px 14px;
  border-radius: 10px;
  line-height: 1.6;
  word-break: break-word;
}

.user-message .content {
  background-color: var(--primary-color);
  color: white;
}

.ai-message .content {
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #333;
}

.loading-message {
  display: flex;
  align-items: center;
  margin: 16px;
  color: #888;
  animation: fadeIn 0.3s ease;
}

.loading-text {
  margin-left: 8px;
  font-size: 14px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #888;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-input {
  border-radius: 8px;
  transition: all 0.2s;
}

.message-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-btn {
  color: #666;
  transition: color 0.2s;
}

.action-btn:hover {
  color: var(--primary-color);
}

.send-btn {
  border-radius: 6px;
  padding: 6px 20px;
  transition: all 0.2s;
}

.send-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.3);
}
</style>
