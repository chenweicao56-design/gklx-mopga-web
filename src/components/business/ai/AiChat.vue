<template>
  <a-modal :open="visibleFlag" :width="isFullScreen ? '100%' : '1000px'" :footer="null" :closable="false" :wrapClassName="isFullScreen ? 'ai-chat-fullscreen' : ''" @cancel="onClose">
    <template #title>
      <div class="flex justify-between">
        <div>智能助理</div>
        <div class="flex">
          <div
            class="mr-4"
            @click="
              () => {
                isFullScreen = !isFullScreen;
              }
            "
          >
            <FullscreenOutlined v-if="isFullScreen" />
            <FullscreenExitOutlined v-else />
          </div>
          <div>
            <CloseOutlined @click="onClose"/>
          </div>
        </div>
      </div>
    </template>
    <div :class="['assistant-container', { 'assistant-container--fullscreen': isFullScreen }]">
      <div class="message-container" ref="chatContainer" @click="handleCodeCopy">
        <div v-for="(msg, index) in chatList" :key="index" :class="['message-item', msg.type]">
          <div class="message-content">
            <div class="message-text markdown-body" v-html=" mdConvert(msg.content)"></div>
          </div>
        </div>
        <div v-if="isLoading" class="message-item">
          <div class="message-content">
            <div class="loading-container">
              <Loading3QuartersOutlined />
              <span>正在生成回答...</span>
            </div>
          </div>
        </div>
      </div>
      <div class="input-container">
        <a-textarea
          v-model:value="chatQueryForm.query"
          :auto-size="{ minRows: 1, maxRows: 4 }"
          placeholder="问点啥吧"
          class="input-field"
          @keydown="onEnterKey"
        />

        <div class="input-toolbar">
          <div class="toolbar-left">
            <FileUpload
              ref="aiFileUploadRef"
              list-type="text"
              :maxUploadSize="5"
              buttonText=""
              @change="changeAttachment"
              :multiple="true"
              :folder="FILE_FOLDER_TYPE_ENUM.COMMON.value"
            />
          </div>

          <div class="toolbar-right">
            <a-button type="text" class="tool-btn" aria-label="语音" @click="toggleListening">
              <template #icon>
                <AudioOutlined v-if="!isListening" />
                <AudioMutedOutlined v-else />
              </template>
            </a-button>

            <a-button type="primary" shape="circle" class="send-btn" :disabled="isLoading" @click="sendQuestion">
              <template #icon>
                <ArrowUpOutlined />
              </template>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script setup lang="js">
  import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { fetchEventSource } from '@microsoft/fetch-event-source';
  import MarkdownIt from 'markdown-it';
  import markdownItHighlightjs from 'markdown-it-highlightjs';
  import { useUserStore } from '/@/store/modules/system/user';
  import { removeJsonMark } from '/@/utils/str-util';
  import FileUpload from '/@/components/support/file-upload/index.vue';
  import { FILE_FOLDER_TYPE_ENUM } from '/@/constants/support/file-const';
  import 'github-markdown-css/github-markdown.css';
  import 'highlight.js/styles/github.css';

  const emitter = inject('emitter');
  const aiFileUploadRef = ref();
  const chatContainer = ref(null);

  const isFullScreen = ref(false);
  const isLoading = ref(false);
  const visibleFlag = ref(false);

  const md = new MarkdownIt({
    html: true,        // 允许 HTML 标签
    linkify: true,     // 自动识别 URL 并转换为链接
    typographer: true, // 启用排版优化
  });

  md.use(markdownItHighlightjs);

  // Inject copy button into <pre> blocks
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const lang = token.info.trim();
    const highlighted = md.options.highlight
      ? md.options.highlight(token.content, lang, '') || md.utils.escapeHtml(token.content)
      : md.utils.escapeHtml(token.content);
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
    return `<pre class="code-block">
<div class="code-header flex justify-between"><div>${langLabel}</div>
<button class="code-copy-btn" data-code="${md.utils.escapeHtml(token.content)}"><span>复制</span></button>
</div>
<code class="hljs language-${lang}">${highlighted}</code></pre>`;
  };

  function handleCodeCopy(e) {
    const btn = e.target.closest('.code-copy-btn');
    if (!btn) return;
    const label = btn.querySelector('span');
    navigator.clipboard.writeText(btn.dataset.code).then(() => {
      label.textContent = '已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        label.textContent = '复制';
        btn.classList.remove('copied');
      }, 1500);
    });
  }

  function mdConvert(v) {
    return md.render(v);
  }

  function show(data) {
    visibleFlag.value = true;
    chatQueryForm.value.conversationId = Date.now();
    if (data) {
      chatQueryForm.value.agentAlias = data.agentAlias;
      chatQueryForm.value.data = JSON.parse(data.data);
    }
  }

  function onClose() {
    visibleFlag.value = false;
  }

  const chatList = ref([
    {
      content: '\n' +
        '```python\n' +
        'def hello():\n' +
        '    print("Hello, World!")\n' +
        '```',
      type: 'ai',
    },
  ]);

  let abortController = null;

  const chatQueryForm = ref({
    conversationId: new Date().getTime(),
    query: '',
    agentAlias: 'planAgent',
    data: {},
    files: [],
  });

  function onEnterKey(e) {
    if (e.key === 'Enter') {
      // 阻止默认行为：避免文本框中换行
      e.preventDefault();
      sendQuestion();
    }
  }

  function sendQuestion() {
    if (!chatQueryForm.value.query.trim() || isLoading.value) {
      return;
    }
    console.log('question:', chatQueryForm.value.query);
    chatList.value.push({
      content: chatQueryForm.value.query,
      type: 'user',
    });
    scrollToBottom();
    connect();
    // chatQueryForm.value.agentAlias = 'nanoAgentService';
    chatQueryForm.value.query = '';
    isLoading.value = true;
    aiFileUploadRef?.value.clear();
  }

  const connect = async () => {
    abortController = new AbortController();
    try {
      await fetchEventSource('http://127.0.0.1:1024/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + useUserStore().getToken,
        },
        body: JSON.stringify(chatQueryForm.value),
        signal: abortController.signal,
        onopen: async (response) => {
          if (!response.ok) {
            console.error('连接失败:', response.status);
          } else {
            console.log('SSE 连接成功');
            chatList.value.push({ type: 'ai', content: '' });
          }
        },

        onmessage: async (event) => {
          const data = JSON.parse(event.data);
          console.log('SSE 接收到消息:', data);
          let chat = chatList.value[chatList.value.length - 1];
          if (data.content) {
            chat.content = chat.content + data.content;
            chat.type = 'ai';
            scrollToBottom();
          }
          if (data.complete) {
            chatQueryForm.value.agentAlias = data.agentAlias;
            if (data.agentAlias === 'sqlGenerateAgentService') {
              emitter.emit('ai-listen', { agentAlias: 'sqlGenerateAgentService', data: removeJsonMark(chat.content) });
              onClose();
            } else {
            }
            console.log('result:', chat.content);
            isLoading.value = false;
            // const menuStr = data.menu;
            // if (menuStr) {
            //   let menu = JSON.parse(menuStr);
            //   await router.push({ path: menu.path });
            // }
            //
          }
        },
        onerror: (err) => {
          console.error('发生错误:', err);
          throw err;
        },
        onclose: () => {
          scrollToBottom();
          console.log('SSE 连接关闭');
        },
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
  const handleResult = (event) => {
    if (event.results && event.results.length > 0) {
      const result = event.results[event.results.length - 1][0].transcript;
      console.log('识别结果:', result);
      chatQueryForm.value.query += result;
    }
  };
  const handleError = (event) => {
    console.error('识别错误:', event.error);
    isListening.value = false;
    isProcessing.value = false;

    // 错误信息映射表
    const errorMap = {
      'not-allowed': '请允许麦克风权限后再试',
      'permission-denied': '麦克风权限已被拒绝',
      'no-speech': '未检测到语音输入',
      'audio-capture': '无法访问麦克风，请检查设备',
    };

    errorMsg.value = `识别失败: ${errorMap[event.error] || event.error}`;
  };

  const handleEnd = () => {
    console.log('语音识别已结束');
    isListening.value = false;
    isProcessing.value = false;
  };

  const stopRecognition = () => {
    if (recognition && isListening.value) {
      recognition.stop();
      isListening.value = false;
      isProcessing.value = false;
    }
  };

  const toggleListening = () => {
    if (isListening.value) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };
  const scrollToBottom = () => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      }
    });
  };
  watch(
    () => chatList.value.length, // 监听列表长度变化
    () => {
      scrollToBottom();
    },
    { immediate: true } // 初始化时执行一次
  );
  const changeAttachment = (data) => {
    if (data?.length > 0) {
      chatQueryForm.value.files = data.map((file) => file.fileKey);
    }
  };

  const handleAiEvent = (data) => {
    show(data);
  };

  onMounted(() => emitter.on('ai-send', handleAiEvent));

  onBeforeUnmount(() => {
    emitter.off('ai-send', handleAiEvent);
    abortController?.abort();
    if (recognition) {
      recognition.abort();
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition = null;
    }
  });

  defineExpose({
    show,
  });
</script>
<style scoped lang="less">
  .ai-chat-container {
    height: 60vh;
  }

  .assistant-container {
    display: flex;
    flex-direction: column;
    height: 540px;
  }

  .assistant-container--fullscreen {
    height: 100%;
  }

  :global(.ai-chat-fullscreen .ant-modal) {
    max-height: 100vh;
    top: 12px;
    padding: 0 12px;
  }

  :global(.ai-chat-fullscreen .ant-modal-content) {
    height: calc(100vh - 24px);
    display: flex;
    flex-direction: column;
  }

  :global(.ai-chat-fullscreen .ant-modal-body) {
    flex: 1;
    overflow: hidden;
    padding: 0;
  }

  .message-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px 24px 16px;
  }

  .message-container::-webkit-scrollbar {
    width: 6px;
  }

  .message-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .message-container::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .message-container::-webkit-scrollbar-thumb:hover {
    background: var(--border-dark);
  }

  .message-item {
    display: flex;
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease;
    align-items: flex-start;
  }

  .message-item.user {
    justify-content: flex-end;
  }

  .message-item.ai {
    justify-content: flex-start;
  }

  .message-content {
    max-width: 85%;
    padding: 14px 16px;
    border-radius: 18px;
    line-height: 1.7;
    box-shadow: 0 8px 24px rgba(31, 35, 41, 0.06);
    position: relative;
  }

  .message-item.user .message-content {
    background: linear-gradient(135deg, #878c95, #70757f);
    color: white;
    border-top-right-radius: 6px;
  }
  .message-item.user .markdown-body{
    background: linear-gradient(135deg, #878c95, #70757f);
    color: white;
  }

  .message-item.ai .message-content {
    background: rgba(255, 255, 255, 0.96);
    color: #2f3339;
    border-bottom-left-radius: 6px;
    border: 1px solid #ece8e3;
  }

  .message-text {
    font-size: 14px;
  }

  .message-text pre.code-block {
    margin: 8px 0;
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #f6f8fa;
  }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: #eff1f3;
    border-bottom: 1px solid #d8dee4;
  }

  .code-lang {
    font-size: 12px;
    color: #656d76;
  }

  .code-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #656d76;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    transition: all 0.15s;
    line-height: 1;
  }

  .code-copy-btn:hover {
    background: #d0d7de;
    color: #24292f;
  }

  .code-copy-btn.copied {
    color: #1a7f37;
  }

  .message-text pre.code-block code {
    display: block;
    padding: 12px 16px;
    overflow-x: auto;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre;
    word-wrap: normal;
  }

  .message-text code:not(pre code) {
    padding: 2px 6px;
    border-radius: 4px;
    background: #eff1f3;
    font-size: 13px;
  }

  .loading-container {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
  }

  .loading-icon {
    animation: spin 1s linear infinite;
    color: var(--primary-color);
  }

  .input-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 18px 12px;
    margin: 0 20px 20px;
    background: #ffffff;
    border: 1px solid #ebe7e2;
    border-radius: 28px;
    box-shadow:
      0 8px 20px rgba(26, 28, 32, 0.06),
      0 1px 2px rgba(26, 28, 32, 0.04);
  }

  .input-field {
    width: 100%;
  }

  .input-container:deep(.ant-input) {
    box-shadow: none;
    border: none;
  }

  .input-container:deep(.ant-input:focus) {
    box-shadow: none;
    border: none;
  }

  .input-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
</style>
