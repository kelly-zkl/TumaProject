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
import {decryData} from "./assets/js/util.js";
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
  // localStorage.setItem("LoginStr", result.data.LoginStr);

  Vue.prototype.$User_Url = result.data.UserUrl;
  // Vue.prototype.LoginStr = result.data.LoginStr;
  axios.defaults.baseURL = result.data.ApiUrl;
}).catch((error) => {
  window.console.log(error)
});

axios.defaults.baseURL = localStorage.getItem("ApiUrl");
Vue.prototype.$User_Url = localStorage.getItem("UserUrl");
// Vue.prototype.LoginStr = localStorage.getItem("LoginStr");

Vue.prototype.LoginStr = "1,深圳前海中电慧安科技有限公司";

axios.defaults.baseURL = "http://192.168.31.228:8090/meerkat-web/";
Vue.prototype.$User_Url = "http://192.168.31.228:8090/manager-api";

//isLogin:"login"--登录弹框时长缩短  "multi"--图片查询中多次请求  "hide"--隐藏错误提示
Vue.prototype.$post = function (path, param, successMsg, failMsg, isLogin) {
  let config;
  if (sessionStorage.getItem("user")) {
    let userId = JSON.parse(decryData(sessionStorage.getItem("user"))).userId;
    if (userId) {
      if (!param) {
        param = {}
      }
      let stringify = JSON.stringify(param);
      let token = md5(stringify + userId + "key-hz-20180123").toString();
      config = {headers: {token: token, tokenId: userId}};
    }
  }

  if (path.indexOf('/manager/') === 0 || path.indexOf('/workflow/') === 0 || path.indexOf('/phoneSearch/') === 0) {
    path = Vue.prototype.$User_Url + path;
  }

  return axios.post(path, param, config).then((res) => {
    let data = res.data;
    if ("000000" === data.code) {
      if (successMsg !== undefined) {
        if (isLogin == "login") {
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
      if (isLogin == "multi" || isLogin == "login") {
        return data;
      }
    }
    if (failMsg !== undefined) {
      return Promise.reject(failMsg);
    }
    return Promise.reject(data.msg);
  }).catch((err) => {
    if (isLogin == "hide") return;
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
  let user = sessionStorage.getItem("user") ? JSON.parse(decryData(sessionStorage.getItem("user"))) : undefined;
  let login = localStorage.getItem('login');
  if (to.path === '/revTool') {
    next();
    return;
  }
  if (to.path === '/login' && from.path !== '/login' && from.path !== '/' && user && login) {//登录后不能返回到登录页
    next({path: from.path});
    return;
  }
  if ((!login || !user) && to.path !== '/login') {
    next({path: '/login'})
  } else {
    next()
  }
});
/* eslint-disable no-new */
new Vue({el: '#app', router, components: {App}, template: '<App/>'});
