import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import router from "./router";
import axios from "axios";
import VueAxios from "vue-axios";
import store from "./store";
import Vant from "vant";
import "vant/lib/index.css";

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(store);
app.use(Vant);
app.use(VueAxios, axios);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
