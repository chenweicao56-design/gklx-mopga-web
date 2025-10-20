<template>
  <div class="live2d-container">
    <a-button type="primary" @click="speakFn">说话</a-button>
    <canvas ref="live2dRef" class="live2d" ></canvas>
  </div>

  <AIChat ref="aiChatRef" />
</template>
<script setup>
import * as PIXI from "pixi.js";
import {Live2DModel} from "pixi-live2d-display/cubism4"; // 只需要 Cubism 4
import audioFile from "/@/assets/sounds/haru_Info_04.wav";
import {onMounted, onUnmounted, ref} from "vue";
import AIChat from "/@/components/business/ai/AiChat.vue";
window.PIXI = PIXI;
let app = null;
let model = null;
let audioContext = null;
const live2dRef = ref(null);

const props = defineProps({
  modelPath: {
    type: String,
    default: '/live2d/Samples/Resources/Haru/Haru.model3.json'
  }
});
const aiChatRef = ref();
const init = async () => {
  audioContext = new AudioContext();
  // 创建PIXI实例
  app = new PIXI.Application({
    view: live2dRef.value,
    resizeTo: live2dRef.value,
    backgroundAlpha: 0,
  });
  model = await Live2DModel.from(props.modelPath, {
    autoInteract: true, // 关闭眼睛自动跟随功能
  });
  console.log(model.width, model.height);
  model.scale.set(0.1);
  model.y = 0;
  model.x = -24;
  model.on('hit', (hitAreaNames) => {
    if (hitAreaNames.includes('Head')) {
      aiChatRef.value.show();
    }
  });
  app.stage.addChild(model);




};

const speakFn = async () => {

  // 请求加载一个音频文件
  const response = await fetch(audioFile);
  // 将音频读取为原始的二进制数据缓冲区（ArrayBuffer）。音频本身是二进制格式，要先将其加载为 ArrayBuffer 才能进一步处理
  const audioData = await response.arrayBuffer();
  // 将 ArrayBuffer 格式的音频数据解码成 AudioBuffer 对象，可以直接用于播放或处理音频数据。
  const audioBuffer = await audioContext.decodeAudioData(audioData);
  // 创建一个音频源节点（AudioBufferSourceNode），该节点用于播放音频数据
  const source = audioContext.createBufferSource();
  // 创建一个音频分析节点。这个节点用于实时分析音频数据，提供诸如频谱分析、波形分析等功能
  const analyser = audioContext.createAnalyser();
  // 将之前解码得到的 audioBuffer（即音频数据）赋值给 source 节点的 buffer 属性。这样就将加载的音频文件与 source 节点绑定，准备播放。
  source.buffer = audioBuffer;
  //  将 音频分析节点 连接到音频上下文的最终目标（即扬声器）
  analyser.connect(audioContext.destination);
  // 音频分析节点 将能够分析通过音频源流动的音频数据，并提供频谱或其他音频信息。
  source.connect(analyser);

  // 监听音频播放完毕
  let requestId = null;
  source.onended = function () {
    cancelAnimationFrame(requestId); // 清除请求动画帧
    model.internalModel.coreModel.setParameterValueById("ParamMouthOpenY", 0); // 闭上嘴巴
  };
  /**
   * 启动音频源的播放，从头开始（这样的话，页面就能够听到声音了）
   * 接下来需要让人物嘴巴更新动弹，即有声音的同时，且能够说话
   * 即为：updateMouth函数
   * */
  source.start(0);

  /**
   * 这个 updateMouth 函数通过从 analyser 获取音频数据并计算音量，动态地更新一个模型的嘴巴张开程度。它的实现方式是每帧都更新一次，
   * 通过音频的音量强度来决定嘴巴的开合程度，从而实现与音频的实时互动。
   * */
  const updateMouth = () => {
    // analyser.frequencyBinCount 表示音频频谱的 bin（频率段）的数量。它是一个整数，表示从频率数据中可以获取多少个频率段的值
    // 使用 analyser 对象的 getByteFrequencyData 方法填充 dataArray 数组。
    // getByteFrequencyData 将音频的频率数据转化为 0-255 范围内的字节值，并存储在 dataArray 中。这个数据表示了音频信号在不同频率范围内的强度。
    // 该方法会将频谱分析的结果填充到 dataArray 数组中，每个元素代表一个频率段的音量强度。
    // 使用 reduce 方法计算 dataArray 数组的所有值的总和，并通过除以数组长度来求得平均值。这个平均值表示音频信号的总体“强度”或“音量”。
    // 这里的 a + b 累加所有音频频段的强度值，最终计算出一个平均值。
    // dataArray.length 是频率数据的总数，通常它等于 analyser.frequencyBinCount。
    // 将计算出的 volume 除以 50，以缩放它到一个合适的范围，得到一个表示“嘴巴张开程度”的值。volume 越大，mouthOpen 越大。
    // 使用 Math.min(1, volume / 50) 保证 mouthOpen 的值不会超过 1，也就是说嘴巴张开程度的最大值是 1。
    // 这意味着，如果音量足够大，mouthOpen 会接近 1，表示嘴巴完全张开；如果音量较小，mouthOpen 会接近 0，表示嘴巴几乎没张开。
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const mouthOpen = Math.min(1, volume / 50);

    // 通过调用 setParameterValueById 方法，将 mouthOpen 的值传递给 model 的内部模型（控制嘴巴大小张开幅度）
    model.internalModel.coreModel.setParameterValueById("ParamMouthOpenY", mouthOpen);
    requestId = requestAnimationFrame(updateMouth);
  };

  requestId = requestAnimationFrame(updateMouth);
};
onMounted(() => {
  init();
});
onUnmounted(() => {
  app = null
  model = null
})
</script>


<style scoped lang="less">
.live2d-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 0;
  z-index: 9999;
}
.live2d {
  width: 200px;
  height: 375px;
}
</style>
