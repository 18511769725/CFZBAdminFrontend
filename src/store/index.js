import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      userinfo: {
        // 定义初始化的state数据
        username: "",
        userid: "",
        email: "",
        level: "",
        avation: "",
        bcompanyid: "",
      },
      userlist: [], // 用户列表数据
      arrayDepartments: [
        {
          value: 0,
          label: "公司领导",
        },
        {
          value: 1,
          label: "产业招商事业部",
        },
        {
          value: 2,
          label: "品牌活动事业部",
        },
        {
          value: 3,
          label: "商务服务事业部",
        },
        {
          value: 4,
          label: "综合部",
        },
        {
          value: 5,
          label: "招商服务大厅项目",
        },
        {
          value: 6,
          label: "招商服务中心",
        },
      ],
      //uploadApi: "http://192.168.110.156:8080/uploadfile", // 上传文件接口地址
      uploadApi: "https://mvpme82.cloud/api/uploadfile", // 上传文件接口地址
      uploadImageApi: "https://mvpme82.cloud/api/uploadimage",
      getImgurlApi: "https://mvpme82.cloud/api/getimgurl",
      uploadVideoApi: "https://mvpme82.cloud/api/uploadvideo",
      //uploadApi: "http://localhost:8080/upload", // 上传项目文件接口地址
      //uploadApi: "http://localhost:8080/uploadfile", // 上传普通文件接口地址
    };
  },
  mutations: {
    // 定义mutation函数
    userLogin(state, curUserInfo) {
      state.userinfo = curUserInfo;
    },
    getUserList(state, userlist) {
      state.userlist = userlist;
    },
  },
  actions: {
    // 定义action函数
  },
});

export default store;
