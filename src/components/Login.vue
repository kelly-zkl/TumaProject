<template>
  <div class="login-bg">
    <section class="content" style="margin: 0;padding: 0">
      <object classid="clsid:707C7D52-85A8-4584-8954-573EFCE77488" height="0"
              id="JITDSignOcx" width="0" codebase="./JITDSign.cab#version=2,0,24,19"></object>
      <el-col :span="24" class="main-header" align="left">
        <div style="display:-webkit-box;display:-ms-flexbox;display:flex;height: 50px;align-items: center">
          <img src="../assets/img/icon_logo.svg"
               style="display:inline-block;height: 32px;width: 32px;margin-right: 10px">
          <div style="display:inline-block;font-size: 24px;color: #22CEFC;text-align: center">图码联侦实战布控平台</div>
        </div>
      </el-col>
      <div class="login-input">
        <el-radio-group v-model="activeItem">
          <el-radio-button label="u">PKI登录</el-radio-button>
          <el-radio-button label="acc">账号密码登录</el-radio-button>
        </el-radio-group>
        <el-form label-width="0" label-position="left" :model="account" style="margin:30px 40px"
                 v-show="activeItem=='acc'">
          <el-form-item class="login-box">
            <el-input placeholder="账号" v-model="account.loginId" :maxlength="18" prefix-icon="fa fa-user"></el-input>
          </el-form-item>
          <el-form-item class="login-box">
            <el-input type="password" placeholder="密码" v-model="account.password" :maxlength="18"
                      prefix-icon="fa fa-lock"></el-input>
          </el-form-item>
          <el-form-item class="lan-margin">
            <el-row>
              <el-col :span="14" class="login-box">
                <el-input placeholder="验证码" v-model="account.checkcode" :maxlength="4"
                          @keyup.13.native="login()"></el-input>
              </el-col>
              <el-col :span="8" :offset="1">
                <img alt="验证码" style="cursor:pointer" title="看不清可单击图片刷新" v-on:click="refreshImg()" v-bind:src="imgUrl">
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item align="left" style="margin: 0">
            <el-checkbox v-model="savePsw" style="color: #999" @change="handleChange">记住密码</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="login()" :loading="logining" style="width: 100%">登录</el-button>
          </el-form-item>
        </el-form>
        <div v-show="activeItem=='u'" style="margin:40px">
          <div style="color:#C7CCD0;font-size:16px;height:165px;padding-top:60px;text-align:left;line-height: 30px">
            如果您的PKI已在图码平台登记，请插入PKI，然后点击“PKI登录”按钮
          </div>
          <el-button type="primary" @click="uLogin()" :loading="logining" style="width:100%">PKI登录</el-button>
        </div>
      </div>
      <el-col :span="24" class="main-footer">
        Copyright © {{dataStr}} 深圳前海中电慧安科技有限公司 系统版本{{version}}
      </el-col>
    </section>
  </div>
</template>

<script>
  import md5 from 'js-md5';
  import {formatDate, encryData, decryData} from "../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'u',
        logining: false,
        savePsw: false,
        account: {loginId: '', password: '', checkcode: ''},
        imgUrl: '', version: '', dataStr: '',
        systemParam: {sysLogo: '../assets/img/icon_logo.svg'},
        options: []
      }
    },
    methods: {
      //U盾登录
      uLogin() {
        var Auth_Content = this.generateRandomNum();
        var temp_DSign_Result = '';
        var DSign_Subject = '';
        //控制证书为一个时，不弹出证书选择框
        JITDSignOcx.SetCertChooseType(1);
        JITDSignOcx.SetCert("SC", "", "", "", DSign_Subject, "");
        if (JITDSignOcx.GetErrorCode() != 0) {
          this.$message.error("错误码：" + JITDSignOcx.GetErrorCode() + "　错误信息：" + JITDSignOcx.GetErrorMessage(JITDSignOcx.GetErrorCode()));
          return false;
        } else {
          temp_DSign_Result = JITDSignOcx.DetachSignStr("", Auth_Content);
          if (JITDSignOcx.GetErrorCode() != 0) {
            this.$message.error("错误码：" + JITDSignOcx.GetErrorCode() + "　错误信息：" + JITDSignOcx.GetErrorMessage(JITDSignOcx.GetErrorCode()));
            return false;
          }
        }
        this.logining = true;
        this.$post("/manager/user/ulogin", {authContent: Auth_Content, dsignResult: temp_DSign_Result},
          "登录成功", undefined, "login").then((data) => {
          this.logining = false;
          if ("000000" === data.code) {
            if (data) {
              localStorage.setItem("login", 'uLogin');
              sessionStorage.setItem("user", encryData(JSON.stringify(data.data)));//用户信息
              sessionStorage.setItem("face", JSON.stringify({id: ''}));
              sessionStorage.setItem("imsi", JSON.stringify({id: ''}));
              localStorage.setItem("clickTime", new Date().getTime());
              this.getMenuTree();
              this.getButton();
              this.getAreas();
            }
          } else {
            this.$message.error(data.msg);
          }
        })
      },
      generateRandomNum() {
        /**************************
         * 第二步 服务端产生认证原文   *
         **************************/
        var num = "1234567890abcdefghijklmnopqrstopqrstuvwxyz";
        var size = 6;
        var auth = '';
        for (var i = 0; i < size; i++) {
          auth += num.charAt((parseInt((Math.random() * 10000)) % num.length));
        }
        return auth;
      },
      myBrowser() {
        var userAgent = navigator.userAgent;
        //取得浏览器的userAgent字符串
        if (userAgent.indexOf("Chrome") < 0) {
          this.$confirm('抱歉！您当前使用非Chrome浏览器，建议安装Chrome浏览器', '提示', {
            confirmButtonText: 'Chrome浏览器下载',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            var eleLink = document.createElement('a');
            eleLink.download = "../meerkat-h5/static/baidumapv2/images/Mario.png";
            eleLink.style.display = 'none';
            eleLink.href = "../meerkat-h5/static/baidumapv2/images/Mario.png";
            document.body.appendChild(eleLink);
            eleLink.click();
            document.body.removeChild(eleLink);
          }).catch(() => {
          });
        }
      },
      //切换登录系统
      changePlatform() {
        this.$router.push('/platforms');
      },
      //登录接口
      login() {
        if (!this.account.loginId || !this.account.password || !this.account.checkcode) {
          this.$message.error('请输入账号、密码或验证码');
          return;
        }
        this.logining = true;
        this.$post("/manager/user/login", {
          account: this.account.loginId, password: md5(this.account.password), checkCode: this.account.checkcode
        }, "登录成功", undefined, "login").then((data) => {
          this.logining = false;
          if ("000000" === data.code) {
            let user = {save: this.savePsw, acc: '', psw: ''};
            if (data) {
              if (this.savePsw === true) {
                user.acc = this.account.loginId;
                user.psw = encryData(this.account.password);
              }
              localStorage.setItem("user", JSON.stringify(user));//是否保存账号/密码
              localStorage.setItem("login", 'true');
              sessionStorage.setItem("user", encryData(JSON.stringify(data.data)));//用户信息
              sessionStorage.setItem("face", JSON.stringify({id: ''}));
              sessionStorage.setItem("imsi", JSON.stringify({id: ''}));
              localStorage.setItem("clickTime", new Date().getTime());
              this.getMenuTree();
              this.getButton();
              this.getAreas();
            }
          } else {
            this.$message.error(data.msg);
            if (data.msg.indexOf("验证码") >= 0) {
              this.getUrl()
            }
          }
        });
      },
      //获取验证码图片
      getUrl() {
        setTimeout(() => {
          this.imgUrl = this.$User_Url + "/manager/verify/getCheckImage?" + Math.random();
        }, 500);
      },
      //是否记住密码
      handleChange(val) {
        let bol = JSON.parse(localStorage.getItem("user"));
        if (bol && val === false) {
          JSON.parse(localStorage.getItem("user")).save = false;
          JSON.parse(localStorage.getItem("user")).acc = '';
          JSON.parse(localStorage.getItem("user")).psw = '';
        }
      },
      //更新验证码
      refreshImg() {
        this.imgUrl = this.$User_Url + "/manager/verify/getCheckImage?" + Math.random();
      },
      //获取用户菜单权限
      getMenuTree() {
        this.$post('/manager/permission/menuTree/' + JSON.parse(decryData(sessionStorage.getItem("user"))).userId + '/2', {}).then((data) => {
          if (data.data) {
            sessionStorage.setItem("menu", encryData(JSON.stringify(data.data)));
            if (data.data[0].permissionUrl) {
              this.$router.push(data.data[0].permissionUrl);
            } else if (data.data[0].childs) {
              this.$router.push(data.data[0].childs[0].permissionUrl);
            }
          }
        });
      },
      //获取用户按钮权限
      getButton() {
        //菜单类型(1:目录,2:菜单,3:按钮)
        this.$post('/manager/permission/listByType/' + JSON.parse(decryData(sessionStorage.getItem("user"))).userId + '/3', {}).then((data) => {
          sessionStorage.setItem("button", JSON.stringify(data.data));
        });
      },
      //获取地区的权限
      getAreas() {
        localStorage.setItem("areas", JSON.stringify([]));
        this.$post('/manager/area/query', {}).then((data) => {
          localStorage.setItem("areas", JSON.stringify(data.data ? data.data : []));
        });
      },
      //获取系统参数配置
      getSystemDetail() {
        this.$post('sysparam/query', {}).then((data) => {
          if ("000000" === data.code) {
            if (data.data.length > 0) {
              data.data.forEach((item) => {
                if (item.code == 'sys_name') {
                  this.systemParam.sysName = item.value;
                }
                if (item.code == 'sys_logo') {
                  this.systemParam.sysLogo = item.value;
                }
                if (item.code == 'sys_map_location') {
                  this.systemParam.localPoint = item.value;
                }
                if (item.code == 'heatChart_refresh_freq') {
                  this.systemParam.refreshTime = item.value;
                }
                if (item.code == 'heatChart_time_limit') {
                  this.systemParam.limitTime = item.value;
                }
                if (item.code == 'heatChart_color_range') {
                  this.systemParam.heatRanges = item.value;
                }
                if (item.code == 'image_search_threshold') {
                  this.systemParam.similarThreshold = item.value;
                }
              });
              sessionStorage.setItem("system", encryData(JSON.stringify(this.systemParam)));
            }
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      getVersion() {
        this.$post("version/get/platformVersion", {}).then((data) => {
          if (data.code === '000000') {
            this.version = data.data;
          }
        }).catch(() => {
        });
      }
    },
    mounted() {
      this.dataStr = formatDate(new Date(), 'yyyy');
      // this.myBrowser();
      this.getVersion();
      this.getSystemDetail();
      let bol = JSON.parse(localStorage.getItem("user"));
      if (bol && bol.save === true) {
        this.savePsw = true;
        this.account = {
          loginId: JSON.parse(localStorage.getItem("user")).acc,
          password: decryData(JSON.parse(localStorage.getItem("user")).psw)
        };
      } else {
        this.savePsw = false;
      }
      this.getUrl();
    }
  }
</script>
<style scoped>
  .login-bg {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    min-width: 1366px;
    margin-left: -8px;
    background: url("../assets/img/bg_login.svg") no-repeat;
    background-size: cover;
    -moz-background-size: cover;
    -webkit-background-size: cover;
    -o-background-size: cover;
    background-color: #08163d;
  }

  .main-header {
    position: absolute;
    top: 0;
    width: 100%;
    margin: 0;
    background: rgba(0, 0, 0, 0);
    border-top: none;
    padding: 10px 20px;
  }

  .main-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    margin: 0;
    background: rgba(0, 0, 0, 0);
    color: #ccc;
    border-top: none;
    font-size: 14px;
    padding: 25px;
  }

  .login-input {
    position: absolute;
    width: 380px;
    height: 400px;
    background: rgba(0, 8, 42, 0.6);
    border-radius: 4px;
    left: 75%;
    margin-left: -195px;
    top: 50%;
    margin-top: -210px;
  }
</style>
