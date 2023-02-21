import Vue from "vue";
import { Store } from "vuex";
import App from "./App.vue";
import store from "./store";
//@ts-ignore
import VCalendar from "v-calendar";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

Vue.use(ElementUI);

Object.defineProperty(Vue.prototype, "store", {
   get() {
      return this.$store;
   },
});
Vue.use(VCalendar, {
   componentPrefix: "vc",
});
Vue.config.productionTip = false;

new Vue({
   store: store as any,
   render: (h) => h(App),
}).$mount("#app");
