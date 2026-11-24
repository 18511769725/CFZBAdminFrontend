<template>
  <div class="login-body">
    <div class="login-panel">
      <div class="login-title">登录朝阳企业服务平台</div>
      <el-form :model="formData" :rules="rules" ref="formDataRef">
        <el-form-item prop="username">
          <el-input
            placeholder="请输入账号"
            v-model="formData.username"
            size="large"
            type="text"
          >
            <template #prefix>
              <el-icon>
                <i-ep-user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            placeholder="请输入密码"
            v-model="formData.password"
            size="large"
            type="password"
            @keyup.enter.native="login()"
          >
            <template #prefix>
              <el-icon>
                <i-ep-lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="">
                    <div class="check-code-panel">
                        <el-input placeholder="请输入验证码" v-model="formData.checkCode" class="input-panel" />
                        <img src="checkCodeUrl" class="check-code">
                    </div>
                </el-form-item> -->
        <!-- <el-form-item label="">
                    <el-checkbox label="记住密码" name="type" />
                </el-form-item> -->
        <el-form-item label="">
          <div class="line-wrapper">
            <el-button
              type="primary"
              style="width: 100%; margin-top: 40px"
              @click="login()"
              size="large"
              >登录</el-button
            >
            <el-button
              type="primary"
              style="width: 100%; margin-top: 40px"
              @click="submit()"
              size="large"
              >注册</el-button
            >
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
// Element-Plus的依赖采用的是自动导入，所以这里无需显示的引入，其他地方的element-plus引用同理
import { ElMessage, ElMessageBox } from "element-plus";
import request from "../../utils/request"; //这里使用自行封装的axios，下文已给出，照搬后修改运行端口即可
import { useRouter } from "vue-router";
import store from "../../store";

// const checkCodeUrl = "api/checkCode?" + new Date().getTime();
//表单
const formDataRef = ref();
let formData = reactive({
  username: "",
  password: "",
});
const rules = {
  username: [
    {
      required: true,
      message: "请输入用户名",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
  ],
  // checkCode: [{
  //     required: true,
  //     message: "请输入验证码"
  // }],
};

const router = useRouter();

const login = () => {
  var form_obj = JSON.parse(JSON.stringify(formData));

  let payload = {
    username: form_obj.username,
    password: form_obj.password,
  };

  request.post("/user/blogin", form_obj).then((res) => {
    if (res && res.retcode === "200") {
      ElMessage({
        message: "登录成功",
        type: "success",
      });
      let tokenObj = { token: " isLogin", startTime: new Date().getTime() };
      window.localStorage.setItem("isLogin", JSON.stringify(tokenObj));
      localStorage.setItem(
        "username",
        JSON.parse(JSON.stringify(res.retBody.username)),
      );
      localStorage.setItem(
        "userid",
        JSON.parse(JSON.stringify(res.retBody.userid)),
      );
      localStorage.setItem(
        "email",
        JSON.parse(JSON.stringify(res.retBody.email)),
      );
      localStorage.setItem(
        "level",
        JSON.parse(JSON.stringify(res.retBody.level)),
      );
      localStorage.setItem(
        "bcompanyid",
        JSON.parse(JSON.stringify(res.retBody.bcompanyid)),
      );
      let objCurUserInfo = {
        username: JSON.parse(JSON.stringify(res.retBody.username)),
        userid: JSON.parse(JSON.stringify(res.retBody.userid)),
        email: JSON.parse(JSON.stringify(res.retBody.email)),
        level: JSON.parse(JSON.stringify(res.retBody.level)),
        bcompanyid: JSON.parse(JSON.stringify(res.retBody.bcompanyid)),
        avation: "",
      };
      store.commit("userLogin", objCurUserInfo);
      router.push("/orders");
    } else if (res.retcode === "400") {
      ElMessage.error("账号状态异常，请联系管理员！");
    } else {
      ElMessage.error("账号或密码错误！！！登录失败！！！");
    }
  });
};
const submit = () => {
  router.push("/submitaccount");
};
</script>

<style lang="scss" scoped>
.login-body {
  background: url("../../assets/bg2.jpg") no-repeat center center;
  height: 100%;
  width: 100%;
  background-size: cover;
  position: absolute;
  left: 0;
  top: 0;

  .login-panel {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;

    padding: 25px;
    width: 26%;
    min-width: 460px;
    height: 30%;
    min-height: 300px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 5%;
    box-shadow: 2px 2px 10px #ddd;

    .login-title {
      font-size: 22px;
      text-align: center;
      margin-bottom: 22px;
    }
  }
}

.line-wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
