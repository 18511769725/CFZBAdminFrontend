<template>
  <view class="login-container">
    <!-- 主内容区 -->
    <view class="main-content">
      <view class="welcome-text">
        <text class="hello">Hello</text>
        <text class="welcome">欢迎加入我们</text>
      </view>

      <!-- 插画图片 -->
      <image
        class="login-illustration"
        src="/static/login-illustration.png"
        mode="widthFix"
      ></image>

      <!-- 一键授权登录按钮 -->
      <button
        class="auth-login-btn"
        @click="handleAuthLogin"
        open-type="getUserProfile"
      >
        一键授权登录
      </button>

      <!-- 品牌名称 -->
      <view class="brand-name">
        <text class="brand-cn">小程序名称</text>
        <text class="brand-en">补充说明或平台名称</text>
      </view>

      <!-- 协议勾选 -->
      <view class="agreement-check" @click="handleAgreementCheck">
        <!-- 圆形勾选框 -->
        <view
          class="check-box"
          :class="{ 'check-box-checked': state.checked === 1 }"
        >
          <view v-if="state.checked === 1" class="check-icon">✓</view>
        </view>
        <!-- 协议文字 -->
        <text class="agreement-text">我已阅读并同意 《用户注册协议》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
const state = reactive({
  checked: 0,
  userinfo: {},
});

const handleAgreementCheck = () => {
  state.checked = state.checked === 0 ? 1 : 0;
};

// 使用用户手机号查询数据库中用户信息
const getUserInfoByPhone = (phoneNumber) => {
  let payload = {
    phone: phoneNumber,
  };
  uni.request({
    url: "https://mvpme82.cloud/api/getuserinfobyphone", // 目标接口地址
    method: "POST", // 接口请求方式（默认POST，若接口要求GET可修改）
    header: { "Content-Type": "application/json" },
    data: payload,
    success: (res) => {
      state.loading = false;
      // 接口返回格式：retcode=200 为成功
      if (res.data?.retcode === "200") {
        // 获取数据成功：处理返回的数据
        state.userinfo = res.data.data;

        // /api/getuserinfobyphone接口在通过手机号查询用户信息时，
        // 若用户信息不存在则直接创新新的用户，status设置为0，表示用户被要求补充信息，跳转补充信息页，并将state.userinfo.phone参数值传给补充信息页/pages/moreinfo/moreinfo
        // 若用户信息存在，但status=-1，表示用户因填写的creditcode关联企业信息不对被打回，跳转补充信息页，并将state.userinfo.phone参数值传给补充信息页/pages/moreinfo/moreinfo
        // 若用户信息存在且status=1，表示用户信息完整，暂时还没有审核通过，登录页提示用户等待管理员审批确认
        // 若用户信息存在且status=2，表示用户信息完整且正常，直接进入主页面
        if (state.userinfo.status === 2) {
          // 将用户信息存储到本地缓存
          uni.setStorage({
            key: "userSession",
            data: state.userinfo,
          });
          // 进入主页面
          uni.switchTab({ url: "/pages/mainpage/mainpage" });
        } else if (
          state.userinfo.status === 0 ||
          state.userinfo.status === -1
        ) {
          // 进入补充信息页面，传递手机号参数
          uni.navigateTo({
            url: `/pages/moreinfo/moreinfo?phone=${state.userinfo.phone}`,
          });
        } else if (state.userinfo.status === 1) {
          // 将插画图片换成等待审批提示的图片
        }
      } else {
        // 获取数据失败：显示接口返回的错误信息（若无则用默认提示）
        state.errorMsg = res.str_err_code || "获取数据失败，请检查网络！";
      }
    },
    fail: (err) => {
      state.loading = false;
      // 网络错误处理（如接口不可达、超时等）
      state.errorMsg = "网络异常，无法连接登录接口";
    },
  });
};

onMounted(() => {
  // 可选：强制显示右上角分享按钮（部分场景需主动触发）
  uni.showShareMenu({
    withShareTicket: true, // 是否获取分享票据（如需统计分享群数可开启）
    menus: ["shareAppMessage", "shareTimeline"], // 显示「分享给好友」「分享到朋友圈」
  });

  uni.getStorage({
    key: "userSession",
    success: (res) => {
      state.userinfo = res.data;
      // 进入主页面
      uni.switchTab({ url: "/pages/mainpage/mainpage" });
    },
    fail: () => {
      // 调用微信手机号身份验证，获取用户手机号
      uni.getPhoneNumber({
        success: (phoneRes) => {
          console.log("获取手机号成功：", phoneRes);
        },
        fail: (err) => {
          console.error("获取手机号失败：", err);
        },
      });
    },
  });
});
</script>

<style scoped lang="scss">
/* 全局容器 */
.login-container {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  box-sizing: border-box;
  padding-bottom: 40rpx;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  position: relative;
}

.back-btn {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 32rpx;
  color: #333333;
}

.nav-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 36rpx;
  font-weight: 500;
  color: #333333;
}

/* 主内容区 */
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40rpx;
  margin-top: 40rpx;
}

/* 欢迎文本 */
.welcome-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 60rpx;
}

.hello {
  font-size: 48rpx;
  color: #c9a76f;
  font-weight: 400;
  margin-bottom: 20rpx;
}

.welcome {
  font-size: 40rpx;
  color: #c9a76f;
  font-weight: 500;
}

/* 插画图片 */
.login-illustration {
  width: 100%;
  max-width: 600rpx;
  margin-bottom: 80rpx;
}

/* 授权登录按钮 */
.auth-login-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background: linear-gradient(to right, #d4b47a, #c9a76f);
  border-radius: 50rpx;
  border: none;
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 500;
  margin-bottom: 80rpx;
}

/* 去除button默认样式 */
.auth-login-btn::after {
  border: none;
}

/* 品牌名称 */
.brand-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.brand-cn {
  font-size: 40rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.brand-en {
  font-size: 24rpx;
  color: #999999;
  letter-spacing: 4rpx;
}

/* 协议勾选区域 */
/* 协议勾选区域 */
.agreement-check {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  cursor: pointer; // 鼠标指针样式（小程序端也兼容）
}

/* 圆形勾选框基础样式 */
.check-box {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #dcdcdc;
  border-radius: 50%; // 圆形样式
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  transition: all 0.3s ease; // 过渡动画，提升体验
}

/* 勾选后金色背景样式 */
.check-box-checked {
  background-color: #c9a76f; // 金色（与页面现有金色风格统一）
  border-color: #c9a76f;
}

/* 勾选图标样式 */
.check-icon {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

/* 协议文字样式 */
.agreement-text {
  font-size: 28rpx;
  color: #666666;
  & span {
    color: #c9a76f; // 协议名称金色高亮，提升辨识度
  }
}
</style>
