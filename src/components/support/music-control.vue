<template>
  <div id="MusicControl" :class="{ 'collapsed': !isPlayerVisible }" ref="playerRef">
    <div class="control-bar">
      <button class="toggle-btn" @click="togglePlayer">
        <transition name="fade">
          <span v-if="isPlayerVisible">🎵</span>
          <span v-else>🎶</span>
        </transition>
      </button>

      <div class="player-content" v-show="isPlayerVisible">
        <div class="song-info">
          <div class="title">{{ currentMusic.name }}</div>
          <div class="artist">{{ currentMusic.artist || '未知艺术家' }}</div>
        </div>

        <div class="progress-container" @click="seekAudio">
          <div class="progress-bar" :style="{ width: progress + '%'}"></div>
          <div id="progress-fill" :style="{ left: progress + '%' }"></div>
          <div class="time-display">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>

        <div class="main-controls">
          <button class="playlist-btn" @click="togglePlaylist" title="播放列表">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor"
                    d="M15,4H5V6H15V4M15,14H5V16H15V14M5,9H19V11H5V9M5,19H19V21H5V19M15,4H5V6H15V4M15,14H5V16H15V14M5,9H19V11H5V9M5,19H19V21H5V19"/>
            </svg>
          </button>

          <button class="prev-btn" @click="handlePrev" title="上一首">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button class="play-btn" @click="toggleMusic">
            <transition name="scale">
              <svg v-if="isMusicPlaying" viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M14,19H18V5H14V19M6,19H10V5H6V19Z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="32" height="32">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
              </svg>
            </transition>
          </button>

          <button class="next-btn" @click="handleNext" title="下一首">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          <!-- 音量控制 -->
          <div class="volume-control" @mouseenter="showVolume = true" @mouseleave="showVolume = false">
            <button class="volume-btn" :title="isMuted ? '取消静音' : '静音'">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path v-if="isMuted" fill="currentColor"
                      d="M12 4L9.91 6.09 12 8.18M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.07c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.803 8.803 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71"/>
                <path v-else-if="volume <= 0.3" fill="currentColor" d="M7 9v6h4l5 5V4l-5 5H7Z"/>
                <path v-else fill="currentColor"
                      d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02M3 9v6h4l5 5V4L7 9H3Z"/>
              </svg>
            </button>
            <transition name="slide-down">
              <div class="volume-slider" v-show="showVolume">
                <input type="range" min="0" max="1" step="0.1" v-model.number="volume" @input="handleVolumeChange"
                       class="vertical-slider"/>
              </div>
            </transition>
          </div>
        </div>

        <transition name="slide">
          <div class="playlist" v-show="showPlaylist">
            <div v-for="(song, index) in musicList" :key="index" class="song-item"
                 :class="{ 'playing': currentIndex === index }" @click="playSong(index)">
              <div class="song-number">{{ index + 1 }}</div>
              <div class="song-details">
                <div class="song-title">{{ song.name }}</div>
                <div class="song-artist">{{ song.artist || '未知艺术家' }}</div>
              </div>
              <div class="song-duration">{{ song.duration || '3:30' }}</div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <audio ref="bgMusic" @timeupdate="updateProgress" @loadedmetadata="updateDuration" @ended="handleNext"
           :src="currentMusic.url"></audio>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onBeforeUnmount} from 'vue'

const isPlayerVisible = ref(false)
const showPlaylist = ref(false)
const isMusicPlaying = ref(false)
const currentIndex = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const isMuted = ref(false)
const showVolume = ref(false)

const bgMusic = ref(null)

const musicList = ref([
  {
    name: '关于小熊',
    artist: '蛋堡',
    duration: "5:16",
    url: '/music/关于小熊.mp3'
  },
  {
    name: '听妈妈的话',
    artist: '周杰伦',
    duration: '4:25',
    url: '/music/听妈妈的话.mp3'
  },
])

const currentMusic = computed(() => musicList.value[currentIndex.value])
const progress = computed(() => (currentTime.value / duration.value) * 100 || 0)

const toggleMusic = () => {
  if (isMusicPlaying.value) {
    bgMusic.value.pause()
  } else {
    bgMusic.value.play()
  }
  isMusicPlaying.value = !isMusicPlaying.value
}

const handlePrev = () => {
  currentIndex.value = (currentIndex.value - 1 + musicList.value.length) % musicList.value.length
  playCurrent()
}

const handleNext = () => {
  currentIndex.value = (currentIndex.value + 1) % musicList.value.length
  playCurrent()
}

const playCurrent = () => {
  if (isMusicPlaying.value) {
    const playPromise = bgMusic.value.play()

    if (playPromise !== undefined) {
      playPromise.then(() => {
        isMusicPlaying.value = true
      }).catch(error => {
        console.error('自动播放失败:', error)
        isMusicPlaying.value = false
      })
    }
  }
}

const playSong = (index) => {
  currentIndex.value = index
  isMusicPlaying.value = true
  bgMusic.value.play()
}

const updateProgress = (e) => {
  currentTime.value = e.target.currentTime
}

const updateDuration = () => {
  duration.value = bgMusic.value.duration
}

const seekAudio = (e) => {
  const rect = e.target.getBoundingClientRect()
  const pos = (e.clientX - rect.left) / rect.width
  bgMusic.value.currentTime = pos * duration.value
}

const handleVolumeChange = () => {
  bgMusic.value.volume = volume.value
  isMuted.value = volume.value === 0
}

const togglePlaylist = () => {
  showPlaylist.value = !showPlaylist.value
}

const togglePlayer = () => {
  isPlayerVisible.value = !isPlayerVisible.value
  showPlaylist.value = false
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  seconds = Math.floor(seconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 新增播放器DOM引用
const playerRef = ref(null)

// 新增点击外部检测逻辑
const handleClickOutside = (event) => {
  if (isPlayerVisible.value &&
      playerRef.value &&
      !playerRef.value.contains(event.target)) {
    isPlayerVisible.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="less">
:root {
  --primary-color: #6b46c1;
  --secondary-color: #4299e1;
  --text-color: #2d3748;
  --bg-color: rgba(255, 255, 255, 0.95);
}

#MusicControl {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 新增点击穿透 */
  pointer-events: none;
}

.control-bar {
  display: flex;
  gap: 12px;
  background: var(--bg-color);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 16px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  color: var(--text-color);
  transition: transform 0.2s ease;
}

.player-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 320px;
}

.song-info {
  text-align: center;
  padding-bottom: 12px;
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.artist {
  font-size: 0.9rem;
  color: #718096;
}

.progress-container {
  height: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  margin: 8px 0;
}

.progress-bar {
  position: relative;
  height: 100%;
  //background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  background-color: skyblue;
  border-radius: 2px;
  transition: width 0.1s linear;
}

#progress-fill {
  position: absolute;
  top: -2px;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background-color: rgb(8, 141, 223);
}

.time-display {
  font-size: 0.8rem;
  color: #718096;
  text-align: center;
  margin-top: 4px;
}

.main-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
}

button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.3);
}

.play-btn:hover {
  transform: scale(1.05);
}

.play-btn svg {
  color: white;
}

.volume-control {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-slider {
  position: absolute;
  bottom: 50px;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateX(-50%);
  background: var(--bg-color);
  padding: 12px 8px;
  border-radius: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.vertical-slider {
  -webkit-appearance: slider-vertical;
  writing-mode: bt-lr;
  width: 24px;
  height: 100px;
  padding: 0 8px;
}

.vertical-slider::-webkit-slider-runnable-track {
  width: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.vertical-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  border-radius: 50%;
  /* 计算合适的偏移量，使手柄中心与轨道中心对齐 */
  transform: translateX(6px);
  transition: transform 0.2s ease;
}

.playlist {
  max-height: 100px;
  width: 320px;
  margin-top: 16px;
  background: var(--bg-color);
  border-radius: 16px;
  padding: 12px;
  overflow: hidden;
  overflow-y: auto;
}

.song-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 300px;
  padding: 12px 30px 12px 20px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item.playing {
  background: rgba(66, 153, 225, 0.1);
  transform: scale(1.05);
}

.song-details {
  display: flex;
  justify-content: space-around;
  width: 60%;
}

.song-number {
  margin-right: 15px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

@media (max-width: 480px) {
  .player-content {
    width: 280px;
  }

  .volume-slider {
    right: -60px;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 定义滚动条整体样式 */
::-webkit-scrollbar {
  width: 6px;
  /* 垂直滚动条宽度 */
  height: 6px;
  /* 水平滚动条高度 */
}

/* 定义滚动条轨道样式 */
::-webkit-scrollbar-track {
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.3);
  /* 轨道背景颜色 */
}

/* 定义滚动条滑块样式 */
::-webkit-scrollbar-thumb {
  background: #888;
  /* 滑块背景颜色 */
  border-radius: 5px;
  /* 滑块圆角 */
}

/* 定义滑块悬停时的样式 */
::-webkit-scrollbar-thumb:hover {
  background: #151515;
  /* 悬停时滑块背景颜色 */
}
</style>
