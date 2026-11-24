<template>
  <div class="use-pc-tip" @click="handleLogout">请在PC端查看</div>
</template>

<script setup>
import store from "../../store";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();

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
</script>

<style scoped>
.use-pc-tip {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
}
</style>
