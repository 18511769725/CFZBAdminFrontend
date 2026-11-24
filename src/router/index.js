import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";
import { h } from "vue";
import store from "../store";
import { isMobile } from "../utils/device";

import HomeContainer from "../components/HomeContainer.vue";

const routes = [
  {
    path: "/",
    name: "首页",
    component: HomeContainer,
    children: [
      {
        path: "/mtopc",
        name: "到PC端查看",
        component: () => import("../components/mobile/MUsePC.vue"),
      },
      {
        path: "/orders",
        name: "订单管理",
        component: () => import("../components/pc/OrdersView.vue"),
      },
      {
        path: "/products",
        name: "产品管理",
        component: () => import("../components/pc/ProductsView.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "登录页",
    component: () => import("../components/pc/LoginView.vue"),
  },
  // 页面找不到404 路由
  {
    path: "/404",
    name: "NoPage 404",
    component: () => import("../views/404.vue"),
    hidden: true,
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/404",
    hidden: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 统一设备路由映射：在移动端访问PC路径、或在PC端访问移动路径时自动归一
const MOBILE_ROUTE_MAP = {
  "/login": "/mlogin",
  "/games": "/mgames",
  "/policy": "/mpolicy",
  "/biview": "/mbi",
};

const PC_ROUTE_MAP = {
  "/mlogin": "/login",
  "/mgames": "/games",
  "/mpolicy": "/policy",
  "/mbi": "/biview",
};

// 设置登录过期时间（一天）86400000
//let expire = 21600000;
let expire = 21600000;

//路由守卫
//全局守卫，登录拦截
//进行路由拦截：当没有登陆标识，直接打回登陆页面，如何避免退回到 登陆页呢？
router.beforeEach((to, from, next) => {
  let date = new Date().getTime();
  console.info("router.beforeEach", to.path);
  const isMobileDevice = isMobile();
  if (isMobileDevice && MOBILE_ROUTE_MAP[to.path]) {
    next(MOBILE_ROUTE_MAP[to.path]);
    return;
  }

  if (!isMobileDevice && PC_ROUTE_MAP[to.path]) {
    next(PC_ROUTE_MAP[to.path]);
    return;
  }
  // if (isMobileDevice && to.path !== "/mlogin") {
  //   next("/mlogin");
  //   return;
  // }
  // if (to.path === "/submitaccount") {
  //   console.log("submitaccount");
  //   next();
  //   return;
  // }
  //从本地缓存中获取保存的 token 信息
  const tokenObj = JSON.parse(window.localStorage.getItem("isLogin"));
  const username = window.localStorage.getItem("username");
  const userid = window.localStorage.getItem("userid");
  const email = window.localStorage.getItem("email");
  const level = window.localStorage.getItem("level");
  const bcompanyid = window.localStorage.getItem("bcompanyid");
  if (to.path === "/login" || to.path === "/mlogin") {
    next();
  } else {
    // 如果移动端用户级别为4，则自动跳到 /mtopc
    if (isMobileDevice && to.path !== "/mtopc") {
      next("/mtopc");
      return;
    }
    // 如果没有token，强制跳转到登录页面；如果有，则判断token时间是否过期
    if (!tokenObj || !tokenObj.token || !username || !userid) {
      if (isMobileDevice) {
        next("/mlogin");
      } else {
        next("/login");
      }
    } else {
      let date = new Date().getTime();
      //console.log(date);
      // 当前时间 - token中的登录时间 > 设置的过期时间，为过期；则清除token，并强制跳转至登录页
      // 反之为有效期，则放行
      if (date - tokenObj.startTime > expire) {
        window.localStorage.removeItem("isLogin");
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("userid");
        window.localStorage.removeItem("email");
        window.localStorage.removeItem("level");
        window.localStorage.removeItem("bcompanyid");

        if (isMobileDevice) {
          next("/mlogin");
        } else {
          next("/login");
        }
        ElMessage({
          message: h("p", null, [
            h("span", null, "登录状态过期"),
            h("i", { style: "color: teal" }, "请重新登录！"),
          ]),
        });
      } else {
        let objCurUserInfo = {
          username: username,
          userid: userid,
          email: email,
          level: level,
          avation: "",
          bcompanyid: bcompanyid,
        };
        store.commit("userLogin", objCurUserInfo);
        next();
      }
    }
  }
});

export default router;
