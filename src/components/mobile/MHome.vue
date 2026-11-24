<template>
  <div class="page-container">
    <div class="top-logout-zone" @dblclick="handleLogout"></div>
    <!-- <div class="top-bar">
      <div class="identity-card">
        <span class="identity-label">当前登录</span>
        <strong class="identity-name">{{ displayUsername || "未登录" }}</strong>
      </div>
      <el-button class="logout-btn" text @click="handleLogout"
        >退出登录</el-button
      >
    </div> -->
    <div class="body-wrapper">
      <router-view />
    </div>
    <!-- 底部导航栏 -->
    <!-- <van-tabbar route v-model="active">
      <van-tabbar-item replace to="/mgames" icon="home-o"
        >游戏版号</van-tabbar-item
      >
      <van-tabbar-item replace to="/mpolicy" icon="search"
        >产业政策</van-tabbar-item
      >
    </van-tabbar> -->
  </div>
</template>

<script setup>
import { computed } from "vue";
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import store from "../../store";

const router = useRouter();
const route = useRoute();

const displayUsername = computed(() => {
  return (
    store.state.userinfo.username ||
    window.localStorage.getItem("username") ||
    ""
  );
});

const handleLogout = () => {
  window.localStorage.removeItem("isLogin");
  window.localStorage.removeItem("username");
  window.localStorage.removeItem("userid");
  window.localStorage.removeItem("email");
  window.localStorage.removeItem("level");
  store.commit("userLogin", {
    username: "",
    userid: "",
    email: "",
    level: "",
    avation: "",
  });
  router.replace("/mlogin");
};

const userLevel = computed(() => Number(store.state.userinfo.level));

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  console.log("MHome mounted, userLevel=", userLevel.value);
  // 检查 store.state.userinfo.level 是否为 4，如果是则跳转到 /mtopc
  if (userLevel.value === 4) {
    console.log("跳转到/mtopc");
    router.replace("/mtopc");
  } else {
    // 默认跳转到 /mbi
    // if (route.path === "/") {
    //   router.replace("/mbi");
    // }
  }
});
</script>

<style scoped>
/* 全局样式 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%; /* 让html和body占满屏幕高度 */
}

/* 根容器（如 #app 或页面最外层div） */
.page-container {
  width: 100vw;
  height: 100vh; /* 占满视口高度 */
  width: 100vw;
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  overflow: hidden; /* 避免整体滚动 */
  background:
    radial-gradient(
      circle at 92% -8%,
      rgba(22, 119, 255, 0.16),
      transparent 40%
    ),
    radial-gradient(circle at 4% 24%, rgba(114, 46, 209, 0.1), transparent 34%),
    #f3f7ff;
}

.top-bar {
  padding: 10px 12px 4px;
  background: linear-gradient(
    180deg,
    rgba(243, 247, 255, 0.96),
    rgba(243, 247, 255, 0.7)
  );
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-sizing: border-box;
}

.identity-card {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(22, 119, 255, 0.1);
  box-shadow: 0 8px 20px rgba(17, 63, 130, 0.06);
}

.identity-label {
  flex: none;
  font-size: 11px;
  color: #6b7f9e;
  letter-spacing: 0.2px;
}

.identity-name {
  min-width: 0;
  font-size: 14px;
  color: #153764;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  color: #5f7190;
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid rgba(95, 113, 144, 0.16);
}

.logout-btn:hover,
.logout-btn:focus {
  color: #1d4f96;
  background: rgba(255, 255, 255, 0.84);
  border-color: rgba(29, 79, 150, 0.16);
}

.body-wrapper {
  flex: 1; /* 填充剩余高度 */
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: transparent;
  padding-bottom: 18px;
}

.top-logout-zone {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 10px;
  background: transparent;
  z-index: 999;
}
</style>
