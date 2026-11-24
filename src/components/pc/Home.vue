<template>
  <div class="home-wrapper">
    <div class="header-wrapper">
      <div class="system-title">朝阳企业服务平台</div>
      <div class="user-info-wrapper">
        <el-button link @click="handleExit" class="button-text-style"
          >欢迎 {{ store.state.userinfo.username }} 点击安全退出</el-button
        >
        <el-button
          link
          @click="showResetPasswordDialog"
          class="button-text-style"
          style="margin-right: 10px"
          >修改密码</el-button
        >
      </div>
    </div>
    <div class="body-wrapper">
      <div class="nav-wrapper">
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          class="el-menu-vertical-demo"
          :default-active="ActiveIndex"
          text-color="#fff"
          @select="handleSelect"
          style="height: 100%; padding-top: 15px"
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon>
                <location />
              </el-icon>
              <span>益企营商户端后台</span>
            </template>

            <el-menu-item index="1-1" path="/orders">订单管理</el-menu-item>
            <el-menu-item index="1-2" path="/products">产品管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      <div class="content-wrapper" :class="{ 'content-wrapper-bi': isBiRoute }">
        <router-view></router-view>
      </div>
    </div>
  </div>
  <!-- 修改密码模态窗口 -->
  <el-dialog
    v-model="state.resetPasswordDialog"
    width="500px"
    :show-close="true"
    @close="resetPasswordForm"
  >
    <div class="dialog-title-wrapper">
      <span role="heading" aria-level="2" class="el-dialog__title"
        >修改 {{ store.state.userinfo.username }} 的登录密码</span
      >
    </div>

    <el-form
      :model="state.resetPasswordFormData"
      status-icon
      label-width="120px"
    >
      <div class="line-wrapper" style="margin-top: 25px">
        <el-form-item
          label="当前密码"
          prop="strOriginalPassword"
          style="width: 90%"
        >
          <el-input
            v-model.trim="state.resetPasswordFormData.strOriginalPassword"
            placeholder="请输入当前密码"
            type="password"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper" style="margin-top: 15px">
        <el-form-item label="新密码" prop="strNewPassword" style="width: 90%">
          <el-input
            v-model.trim="state.resetPasswordFormData.strNewPassword"
            placeholder="请输入新密码"
            type="password"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper" style="margin-top: 15px">
        <el-form-item
          label="确认密码"
          prop="strNewPasswordConfirm"
          style="width: 90%"
        >
          <el-input
            v-model.trim="state.resetPasswordFormData.strNewPasswordConfirm"
            placeholder="请确认新密码"
            type="password"
          />
        </el-form-item>
      </div>
      <div class="line-wrapper-center" style="margin-top: 25px">
        <el-button
          type="primary"
          style="width: 120px"
          @click="handleResetPassword"
          >确认修改密码</el-button
        >
      </div>
    </el-form>
  </el-dialog>
</template>

<script lang="js" setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Paperclip,
  Setting,
} from "@element-plus/icons-vue";
import { ElButton, ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import store from "../../store";
import request from "../../utils/request";

const router = useRouter();
const route = useRoute();

const isBiRoute = computed(() => route.path === "/orders");

const ActiveIndex = ref("1-0");

const state = reactive({
  resetPasswordDialog: false, // 修改密码窗体显示控制
  resetPasswordFormData: {
    strOriginalPassword: "",
    strNewPassword: "",
    strNewPasswordConfirm: "",
    strUserId: "",
  },
  showOthers: 0,
  userlevel: store.state.userinfo.level,
  //isallen: 1,
});
// 导航点击跳转
const handleSelect = (key, keyPath) => {
  if (ActiveIndex.value === key) {
    return;
  }
  ActiveIndex.value = key;
  console.log("open", key, ActiveIndex, keyPath);
  switch (key) {
    case "1-1":
      router.push("/orders");
      return;
    case "1-2":
      router.push("/products");
      return;
    default:
      break;
  }
};
// 退出登录状态事件
const handleExit = () => {
  let tip_text = "确认要退出登录？";
  ElMessageBox.confirm(tip_text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      window.localStorage.removeItem("isLogin");
      window.localStorage.removeItem("username");
      window.localStorage.removeItem("userid");
      window.localStorage.removeItem("email");
      window.localStorage.removeItem("level");
      router.push("/login");
    })
    .catch(() => {});
};

// 清除修改密码窗体数据信息
const resetPasswordForm = () => {
  state.resetPasswordFormData.strOriginalPassword = "";
  state.resetPasswordFormData.strNewPassword = "";
  state.resetPasswordFormData.strNewPasswordConfirm = "";
  state.resetPasswordFormData.strUserId = "";
};

// 显示修改密码窗体
const showResetPasswordDialog = () => {
  state.resetPasswordFormData.strUserId = store.state.userinfo.userid;
  state.resetPasswordDialog = true;
};

// 提交修改密码数据
const handleResetPassword = () => {
  // 检查数据项
  if (!state.resetPasswordFormData.strOriginalPassword) {
    ElMessageBox.alert("请填写当前密码！", "修改密码错误", {
      confirmButtonText: "好的",
      type: "error",
    });
    return;
  }
  if (!state.resetPasswordFormData.strNewPassword) {
    ElMessageBox.alert("请填写新密码！", "修改密码错误", {
      confirmButtonText: "好的",
      type: "error",
    });
    return;
  }
  if (
    !state.resetPasswordFormData.strNewPasswordConfirm ||
    state.resetPasswordFormData.strNewPassword !==
      state.resetPasswordFormData.strNewPasswordConfirm
  ) {
    ElMessageBox.alert("新密码与确认密码不一致！", "修改密码错误", {
      confirmButtonText: "好的",
      type: "error",
    });
    return;
  }
  if (
    state.resetPasswordFormData.strOriginalPassword ===
    state.resetPasswordFormData.strNewPassword
  ) {
    ElMessageBox.alert("新密码与原密码一致，请更换新密码！", "修改密码错误", {
      confirmButtonText: "好的",
      type: "error",
    });
    return;
  }
  // 发起修改密码请求
  request.post("/user/bchangepass", state.resetPasswordFormData).then((res) => {
    if (res && res.retcode == "200") {
      ElMessageBox.alert("密码修改成功！", "修改密码成功", {
        confirmButtonText: "好的",
        type: "success",
      });
      resetPasswordForm();
      state.resetPasswordDialog = false;
    } else {
      let str_err_tip = "修改密码失败，请稍后重试！";
      if (res && res.str_err_code) {
        str_err_tip = res.str_err_code;
      }
      ElMessageBox.alert(str_err_tip, "修改密码错误", {
        confirmButtonText: "好的",
        type: "error",
      });
    }
  });
};

// 当组件被创建并且DOM已经生成之后,默认加载项目管理子页面
onMounted(() => {
  router.push("/orders");
  ActiveIndex.value = "1-1";
});
</script>

<style lang="scss" scoped>
.home-wrapper {
  height: 100%;
  width: 100%;
  background-size: cover;
  position: absolute;
  left: 0;
  top: 0;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.header-wrapper {
  height: 100px;
  width: 100%;
  background-color: #3f79e0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: url("../../assets/header_bg.jpg") no-repeat center center;
}
.system-title {
  width: 100%;
  height: 45px;
  margin-top: 15px;
  font-family: "Manrope, sans-serif";
  font-size: 35px;
  font-weight: 700;
  color: white;
}
.user-info-wrapper {
  width: 100%;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.button-text-style {
  font-family: "Manrope, sans-serif";
  font-size: 15px;
  font-weight: 700;
  color: white;
}
.el-button.is-link:hover {
  color: lightgray;
}
.body-wrapper {
  height: calc(100vh - 100px);
  width: 100%;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  overflow: hidden;
}
.nav-wrapper {
  height: 100%;
  width: 15%;
  max-width: 400px;
  background-color: "#545c64";
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.content-wrapper {
  height: 100%;
  width: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #9eb6e8 transparent;
}

.content-wrapper-bi {
  background:
    radial-gradient(circle at 90% 0%, #d5f2ff 0%, transparent 42%),
    radial-gradient(circle at 0% 100%, #dfe7ff 0%, transparent 50%),
    linear-gradient(180deg, #e9f2ff 0%, #f7f5ff 100%);
}

.content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #b9cbf0 0%, #8fa9de 100%);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #9eb6e8 0%, #6f90d5 100%);
  background-clip: content-box;
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
.line-wrapper-center {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
