// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import axios from "axios";
import VueAxios from "vue-axios";
import 'babel-polyfill';

// import 'element-ui/lib/theme-chalk/index.css';

import './assets/css/element-variables.scss'
import "./assets/css/font-awesome.min.css";
import './assets/css/el-custom.css'
import "./assets/js/util.js";
import "./assets/js/api.js";

let md5 = require("crypto-js/md5");
require('echarts/extension/bmap/bmap');

Vue.use(ElementUI);
Vue.use(VueAxios, axios);
Vue.use(router);

axios.defaults.withCredentials = true;
Vue.config.productionTip = true;

axios.get("serverconfig.json").then((result) => {
  localStorage.setItem("ApiUrl", result.data.ApiUrl);
  localStorage.setItem("UserUrl", result.data.UserUrl);

  Vue.prototype.$User_Url = result.data.UserUrl;
  axios.defaults.baseURL = result.data.ApiUrl;
}).catch((error) => {
  window.console.log(error)
});
axios.defaults.baseURL = localStorage.getItem("ApiUrl");
Vue.prototype.$User_Url = localStorage.getItem("UserUrl");

axios.defaults.baseURL = "http://192.168.31.244:8090/meerkat-web/";
Vue.prototype.$User_Url = "http://192.168.31.244:8090/manager-api";

Vue.prototype.$post = function (path, param, successMsg, failMsg, isLogin) {
  let config;
  if (sessionStorage.getItem("user")) {
    let userId = JSON.parse(sessionStorage.getItem("user")).userId;
    if (userId) {
      if (!param) {
        param = {}
      }
      let stringify = JSON.stringify(param);
      let token = md5(stringify + userId + "key-hz-20180123").toString();
      config = {headers: {token: token, tokenId: userId}};
    }
  }

  if (path.indexOf('/manager/') === 0 || path.indexOf('/workflow/') === 0) {
    path = Vue.prototype.$User_Url + path;
  }

  return axios.post(path, param, config).then((res) => {
    let data = res.data;
    if ("000000" === data.code) {
      if (successMsg !== undefined) {
        if (isLogin !== undefined) {
          this.$message({message: successMsg, type: 'success', duration: 1000});
        } else {
          this.$message({message: successMsg, type: 'success'});
        }
      }
      if (data === undefined) {
        data = {};
      }
      return data;
    } else {
      if (isLogin !== undefined) {
        return data;
      }
    }
    if (failMsg !== undefined) {
      return Promise.reject(failMsg);
    }

    return Promise.reject(data.msg);
  }).catch((err) => {
    if (err == "Error: Network Error") {
      this.$message.error("服务器开小差了，请重试");
    } else if (err == "Check Code incorret.") {
      this.$message.error("验证码错误");
    } else {
      this.$message.error(err);
    }
  });
};

Vue.use(VueAxios, axios);

router.beforeEach((to, from, next) => {
  let user = JSON.parse(sessionStorage.getItem('user'));
  let login = localStorage.getItem('login');
  if (to.path === '/login' && from !== '/login' && user && login) {//登录后不能返回到登录页
    return;
  }
  if ((!login || !user) && to.path !== '/login') {
    next({path: '/login'})
  } else {
    next()
  }
  if (to.path === '/platforms') {
    next()
  }
});
/* eslint-disable no-new */
new Vue({el: '#app', router, components: {App}, template: '<App/>'});
