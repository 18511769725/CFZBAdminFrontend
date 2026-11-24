import axios from "axios";

import { ElMessage } from "element-plus";

const getCurrentUserId = () => {
  try {
    const localUserId = window.localStorage.getItem("userid");
    if (localUserId && localUserId !== "undefined" && localUserId !== "null") {
      return localUserId;
    }
  } catch (error) {
    console.warn("读取 userid 失败:", error);
  }

  return "";
};

const request = axios.create({
  baseURL: "https://mvpme82.cloud/api",
  // baseURL: "http://49.232.246.200:8080", // 注意！！ 这里是全局统一加上了 '/api' 前缀，也就是说所有接口都会加上'/api'前缀在，页面里面写接口的时候就不要加 '/api'了，否则会出现2个'/api'，类似 '/api/api/user'这样的报错，切记！！！
  //baseURL: "http://localhost:8080/api",
  timeout: 50000,
});
// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
request.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json;charset=utf-8";
    config.headers["user"] = "mvpme82";
    config.headers["pass"] = "chaoqitong";

    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      config.headers["userid"] = currentUserId;
    }

    // config.headers['token'] = user.token;  // 设置请求头
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
  (response) => {
    let res = response.data;
    // 如果是返回的文件
    if (response.config.responseType === "blob") {
      return res;
    }
    // 兼容服务端返回的字符串数据
    if (typeof res === "string") {
      res = res ? JSON.parse(res) : res;
    }
    return res;
  },
  (error) => {
    console.log("" + error); // for debug
    return Promise.reject(error);
  },
);

export function download(url, params, filename) {
  return request
    .post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: "arraybuffer",
    })
    .then(async (res) => {
      let src = window.URL.createObjectURL(
        new Blob([res], {
          // 后台传递的文件类型 - 此处我是直接从后台获取的
          // 也可以根据文件类型添加
        }),
      );
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = src;
      // fileName 文件的名称
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((r) => {
      ElMessage.error("下载文件出现错误，请联系管理员！");
    });
}

export async function blobValidate(data) {
  try {
    const text = await data.text();
    JSON.parse(text);
    return false;
  } catch (error) {
    return true;
  }
}

export function tansParams(params) {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (
            value[key] !== null &&
            value !== "" &&
            typeof value[key] !== "undefined"
          ) {
            let params = propName + "[" + key + "]";
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}

export default request;
