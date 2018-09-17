<template>
  <div class="login-bg">
    <section class="content" style="margin: 0">
      <el-col :span="24" class="main-header" align="left">
        <img src="../assets/img/login_logo.png">
      </el-col>
      <el-col :span="24" align="center">
        <el-form label-width="0" label-position="left" :model="account" class="login-input">
          <!--<el-form-item align="left" style="position: absolute;top: 0;left: 15px">-->
          <!--<el-button type="text" style="font-size: 16px" @click="changePlatform()">-->
          <!--<i class="fa fa-retweet" style="margin-right: 5px;font-size: 1.4em"></i>切换系统-->
          <!--</el-button>-->
          <!--</el-form-item>-->
          <el-form-item class="lan-no">
            <span style="font-size: 22px;color: #fefefe">登录后台</span>
          </el-form-item>
          <el-form-item class="login-box">
            <el-input placeholder="账号" v-model="account.loginId" :maxlength="18"
                      prefix-icon="fa fa-user"></el-input>
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
            <el-button type="primary" @click="login()" :loading="logining" style="width: 100%">登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24" class="main-footer">
        All Rights Reserved V3.0
      </el-col>
    </section>
  </div>
</template>

<script>
  import md5 from 'js-md5';

  export default {
    data() {
      return {
        logining: false,
        savePsw: false,
        account: {loginId: '', password: '', checkcode: ''},
        imgUrl: '',
        options: []
      }
    },
    methods: {
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
                user.psw = this.account.password;
              }
              localStorage.setItem("user", JSON.stringify(user));
              sessionStorage.setItem("user", JSON.stringify(data.data));
              this.getMenuTree();
              this.getButton();
            }
          } else {
            this.$message.error(data.msg);
            if (data.msg.indexOf("验证码") >= 0) {
              this.getUrl()
            }
          }
        });
        this.$router.push('/dataOverview');
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
        this.$post('/manager/permission/menuTree/' + JSON.parse(sessionStorage.getItem("user")).userId + '/2', {}).then((data) => {
          if (data.data) {
            sessionStorage.setItem("menu", JSON.stringify(data.data));
//            if (data.data[0].permissionUrl) {
//              this.$router.push(data.data[0].permissionUrl);
//            } else if (data.data[0].childs) {
//              this.$router.push(data.data[0].childs[0].permissionUrl);
//            }
            this.$router.push('/dataOverview');
          }
        });
      },
      //获取用户按钮权限
      getButton() {
        //菜单类型(1:目录,2:菜单,3:按钮)
        this.$post('/manager/permission/listByType/' + JSON.parse(sessionStorage.getItem("user")).userId + '/3', {}).then((data) => {
          sessionStorage.setItem("button", JSON.stringify(data.data));
        });
      }
    },
    mounted() {
      let bol = JSON.parse(localStorage.getItem("user"));
      if (bol && bol.save === true) {
        this.savePsw = true;
        this.account = {
          loginId: JSON.parse(localStorage.getItem("user")).acc,
          password: JSON.parse(localStorage.getItem("user")).psw
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
    margin-left: -8px;
    background: url("../assets/img/bg_login.jpg") no-repeat;
    background-size: cover;
  }

  @media screen and (min-width: 320px) and (max-width: 359px) {
    .main-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      color: #ccc;
      border-top: none;
      font-size: 14px;
      padding: 10px;
    }

    .main-header {
      position: absolute;
      top: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      border-top: none;
      padding: 5px 20px;
    }

    .login-input {
      position: absolute;
      width: 270px;
      height: 350px;
      line-height: 350px;
      background: rgba(0, 0, 0, 0.4);
      padding: 20px;
      border-radius: 3px;
      left: 50%;
      margin-left: -155px;
      top: 50%;
      margin-top: -190px;
    }
  }

  @media screen and (min-width: 360px) and (max-width: 411px) {
    .main-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      color: #ccc;
      border-top: none;
      font-size: 14px;
      padding: 20px;
    }

    .main-header {
      position: absolute;
      top: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      border-top: none;
      padding: 10px 20px;
    }

    .login-input {
      position: absolute;
      width: 300px;
      height: 350px;
      line-height: 350px;
      background: rgba(0, 0, 0, 0.4);
      padding: 20px;
      border-radius: 3px;
      left: 50%;
      margin-left: -170px;
      top: 50%;
      margin-top: -195px;
    }
  }

  @media screen and (min-width: 412px) and (max-width: 639px) {
    .main-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      color: #ccc;
      border-top: none;
      font-size: 14px;
      padding: 20px;
    }

    .main-header {
      position: absolute;
      top: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      border-top: none;
      padding: 10px 20px;
    }

    .login-input {
      position: absolute;
      width: 320px;
      height: 350px;
      line-height: 350px;
      background: rgba(0, 0, 0, 0.4);
      padding: 30px;
      border-radius: 3px;
      left: 50%;
      margin-left: -190px;
      top: 50%;
      margin-top: -205px;
    }
  }

  @media screen and (min-width: 640px) {
    .main-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      color: #ccc;
      border-top: none;
      font-size: 14px;
      padding: 25px;
    }

    .main-header {
      position: absolute;
      top: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      border-top: none;
      padding: 20px 40px;
    }

    .login-input {
      position: absolute;
      width: 330px;
      height: 350px;
      line-height: 350px;
      background: rgba(0, 0, 0, 0.4);
      padding: 30px 40px;
      border-radius: 3px;
      left: 50%;
      margin-left: -205px;
      top: 50%;
      margin-top: -205px;
    }
  }

  @media screen and (orientation: landscape) and (max-height: 639px) {
    .main-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      color: #ccc;
      border-top: none;
      font-size: 14px;
      padding: 10px;
    }

    .main-header {
      position: absolute;
      top: 0;
      width: 100%;
      margin: 0;
      background: rgba(0, 0, 0, 0.6);
      border-top: none;
      padding: 5px 30px;
    }

    .login-input {
      position: absolute;
      width: 300px;
      height: 250px;
      line-height: 250px;
      background: rgba(0, 0, 0, 0.4);
      padding: 20px;
      border-radius: 3px;
      left: 50%;
      margin-left: -170px;
      top: 50%;
      margin-top: -140px;
    }

    .lan-no {
      width: 0;
      height: 0;
      margin: 0;
      padding: 0;
      display: none;
    }

    .lan-margin {
      margin-bottom: 0;
    }
  }
</style>
