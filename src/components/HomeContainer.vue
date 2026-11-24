<template>
  <!-- 根据设备类型渲染对应组件 -->
  <PcHome v-if="!isMobile" />
  <MobileHome v-else />
</template>

<script setup>
import { onMounted, ref, onUnmounted } from "vue";
import PcHome from "./pc/Home.vue";
import MobileHome from "./mobile/MHome.vue";

const isMobile = ref(false);

// 初始化判断
const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkDevice();
  // 监听窗口 resize 事件，动态更新
  window.addEventListener("resize", checkDevice);
});

// 组件卸载时移除监听（避免内存泄漏）
onUnmounted(() => {
  window.removeEventListener("resize", checkDevice);
});
</script>
