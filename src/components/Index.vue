<template>
  <div>
    <el-container class="main-container">
      <el-header style="background: #060450;color:#fff" height="70px">
        <div style="display: flex;flex-direction: row;height: 70px;width: 100%">
          <div align="left" style="display: flex;height: 70px;align-items: center">
            <img src="../assets/img/icon_logo.png" style="display:inline-block;height: 34px;width: 34px">
            <div style="display:inline-block;font-size: 18px;;margin-left: 10px;letter-spacing:3px">
              图码联侦实战布控平台
            </div>
          </div>
          <div align="center" style="flex: 1;height: 70px;align-items: center;justify-content: center">
            <!--fa-th-large fa-tachometer-->
            <el-button v-for="item in menu" :key="item.permissionUrl"
                       v-bind:class="indx==item.orders?'item active':'item'"
                       @click="handleSelectItem(item)">
              <i :class="item.icon"
                 v-bind:style="item.orders<6?'font-size: 1.9em':item.orders>5?'font-size: 2.3em':'font-size: 2.1em'"></i>
              <span class="title" v-bind:style="item.orders<6?'margin-top: 6px':'margin-top: 2px'">{{item.name}}</span>
            </el-button>
          </div>
          <div align="right" style="display: flex;height: 70px;align-items: center">
            <!--<div class="item" style="text-align: center" @click="runMsg = true">-->
            <!--<i class="fa fa-bell-o fa-2x" style="padding-top: 20px;font-size: 1.8em"></i>-->
            <!--</div>-->
            <el-popover ref="modifyPsw" placement="bottom" width="200" trigger="click">
              <el-col :span="24">
                <el-button
                  style="width: 100%;border-radius: 0 0 0 4px;border: none;height: 45px"
                  type="text" @click="runModifyPsw = true;psw={}">修改密码
                </el-button>
              </el-col>
            </el-popover>
            <el-button class="item" style="text-align: center;width: auto" v-popover:modifyPsw>
              <i class="fa fa-user fa-2x" style="display: inline-block;padding-top: 0"></i>
              <span style="display: inline-block;padding-left: 5px">{{userName}}</span>
            </el-button>
            <!--<div class="item" style="text-align: center" @click="$router.push({path: '/platforms'})">-->
            <!--<i class="fa fa-retweet fa-2x" style="padding-top: 13px"></i>-->
            <!--</div>-->
            <div class="item" style="text-align: center" @click="loginOut()">
              <i class="fa fa-sign-out fa-2x" style="padding-top: 20px"></i>
            </div>
          </div>
        </div>
      </el-header>
      <el-main style="background: #060450;border-top: 3px #02023F solid;width: 100%;padding: 0;margin: 0">
        <el-col :span="24" style="padding: 0;margin: 0">
          <transition name="fade" mode="out-in">
            <router-view @handleSelectTab="handleSelectTab"></router-view>
          </transition>
        </el-col>
      </el-main>
    </el-container>
    <!--告警通知-->
    <div class="view-msg">
      <transition name="fade" mode="out-in" appear>
        <el-dialog fullscreen width="430px" :visible.sync="runMsg" :show-close="false">
          <div class="block">
            <div class="msg-title">
              <span>告警通知</span>
              <el-button class="btn" round plain size="small" @click="clearAll()">清空</el-button>
            </div>
            <div class="msg-item" v-for="item in [1,1,1,1,2]" @click="deleteMsg()">
              <span>嫌疑告警  08:23</span>
            </div>
          </div>
        </el-dialog>
      </transition>
    </div>
    <audio id='audio' :src='warning'></audio>
    <!--IMSI告警 :close-on-click-modal="false"-->
    <div class="warning">
      <transition name="fade" mode="out-in" appear>
        <el-dialog width="500px" :visible.sync="runImsiWarning" style="border-radius: 6px" top="70px" title="嫌疑告警">
          <el-form :model="imsiWarning" align="left" style="padding: 10px 50px;border-top: 1px #f2f2f2 solid"
                   label-width="100px" label-position="left">
            <el-form-item label="抓取IMSI" style="margin:0">
              <span style="font-size: 15px;color:#000">{{imsiWarning.imsi}}</span>
            </el-form-item>
            <el-form-item label="运营商" style="margin:0">
              <span style="font-size: 15px;color:#000">
                {{imsiWarning.isp == 0 ? '移动' : imsiWarning.isp == 1 ? '联通' : imsiWarning.isp == 2 ? '电信' : '--'}}
              </span>
            </el-form-item>
            <el-form-item label="告警时间" style="margin:0">
              <span style="font-size: 15px;color:#000">
                {{imsiWarning.timeStr ? imsiWarning.timeStr : '--'}}
              </span>
            </el-form-item>
            <el-form-item label="告警场所" style="margin:0">
              <span style="font-size: 15px;color:#000">{{imsiWarning.placeName?imsiWarning.placeName:'--'}}</span>
            </el-form-item>
            <el-form-item label="设备标识" style="margin:0">
              <span style="font-size: 15px;color:#000">{{imsiWarning.deviceName?imsiWarning.deviceName:'--'}}</span>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center">
            <!--<el-button type="warning" size="medium" @click="gotoImsiDetail">处理告警</el-button>-->
            <el-button type="primary" size="medium" @click="gotoImsiDetail()">查看人员信息</el-button>
          </div>
        </el-dialog>
      </transition>
    </div>
    <!--头像告警 :close-on-click-modal="false"-->
    <div class="warning">
      <transition name="fade" mode="out-in" appear>
        <el-dialog width="500px" :visible.sync="runFaceWarning" style="border-radius: 6px" top="70px" title="嫌疑告警">
          <div style="padding: 20px 20px 10px;text-align: left;position: relative;border-top: 1px #f2f2f2 solid">
            <img :src="faceWarning.faceUrl?faceWarning.faceUrl:imgPath">
            <el-form :model="faceWarning" align="left" label-width="80px" label-position="left"
                     style="display:inline-block;position: absolute;top: 20px">
              <el-form-item label="年龄" style="margin:0">
                <span style="font-size: 15px;color:#000">{{faceWarning.age<0?'--':faceWarning.age}}</span>
              </el-form-item>
              <el-form-item label="性别" style="margin:0">
                <span style="font-size: 15px;color:#000">
                  {{faceWarning.sex == 0 ? '男' : faceWarning.sex == 1 ? '女' : '--'}}
                </span>
              </el-form-item>
              <el-form-item label="告警时间" style="margin:0">
                <span style="font-size: 15px;color:#000">{{faceWarning.timeStr ? faceWarning.timeStr : '--'}}</span>
              </el-form-item>
              <el-form-item label="告警场所" style="margin:0">
                <span style="font-size: 15px;color:#000">{{faceWarning.placeName?faceWarning.placeName:'--'}}</span>
              </el-form-item>
              <el-form-item label="设备标识" style="margin:0">
                <span style="font-size: 15px;color:#000">{{faceWarning.deviceName?faceWarning.deviceName:'--'}}</span>
              </el-form-item>
            </el-form>
          </div>
          <div slot="footer" class="dialog-footer" align="center">
            <!--<el-button type="warning" size="medium" @click="gotoFaceDetail">处理告警</el-button>-->
            <el-button type="primary" size="medium" @click="gotoFaceDetail()">查看人员信息</el-button>
          </div>
        </el-dialog>
      </transition>
    </div>
    <!--修改密码-->
    <el-dialog title="修改密码" width="500px" :visible.sync="runModifyPsw">
      <div class="block">
        <el-form label-width="100px" :rules="rules" ref="psw" :model="psw">
          <el-form-item label="当前密码" prop="password">
            <el-input type="password" :maxlength="18" :minlength="6" placeholder="输入密码"
                      v-model="psw.password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="password1">
            <el-input type="password" v-model="psw.password1"
                      placeholder="请输入6-16位密码" :maxlength="18" :minlength="6"></el-input>
          </el-form-item>
          <el-form-item label="密码确认" prop="password2">
            <el-input type="password" v-model="psw.password2"
                      placeholder="请再次输入新密码" :maxlength="18" :minlength="6"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button @click="runModifyPsw = false">取消</el-button>
          <el-button type="primary" @click="modifyPsw('psw')">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import md5 from 'js-md5';
  import {pswValidator} from '../assets/js/api';
  import {formatDate, isPC, buttonValidator} from "../assets/js/util";

  export default {
    data() {
      let pswValidate = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码不能小于6位'));
        } else if (value.length > 18) {
          callback(new Error('密码不能大于18位'));
        } else if (!pswValidator(value)) {
          callback(new Error("密码由英文字母、数字以及~!@#$%^&*=+/-组成"));
        } else {
          callback();
        }
      };
      return {
        indx: 1,
        runMsg: false,
        runImsiWarning: false,
        runFaceWarning: false,
        runModifyPsw: false,
        warning: require('../assets/warning.mp3'),
        imgPath: require('../assets/img/icon_people.png'),
        userName: JSON.parse(sessionStorage.getItem("user")).realName || '',
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
        psw: {password: '', password1: '', password2: ''},
        imsiWarning: {id: ''},
        faceWarning: {id: ''},
        menu: [],
        intervalid: null,
        audio: null,
        rules: {
          password1: [
            {required: true, message: '请输入新密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"}
          ], password2: [
            {required: true, message: '请再次输入新密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"}
          ], password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
          ]
        }
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      this.audio = null;
      clearInterval(this.intervalid);
    },
    methods: {
      //IMSI/图像告警-->10s请求一次
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getImsiWarning();
            this.getFaceWarning();
          }, 10 * 1000);
        }
      },
      //页面变化-->导航栏选中状态变化
      handleSelectTab(val) {
        this.indx = val;
      },
      //上方导航栏点击切换页面
      handleSelectItem(item) {
        this.indx = item.orders;
        this.$router.push(item.permissionUrl);
        sessionStorage.removeItem("query");
        sessionStorage.removeItem("qTime");
        sessionStorage.removeItem("page");
        sessionStorage.removeItem("activeItem");
        sessionStorage.removeItem("secItem");
        sessionStorage.removeItem("pathTime");//轨迹
        sessionStorage.removeItem("pathImsi");
        sessionStorage.removeItem("pathFace");
      },
      getImsiWarning() {
        this.imsiWarning = JSON.parse(sessionStorage.getItem("imsi"));
        this.$post("warning/get/listImsiToday", {size: 1}).then((data) => {
          if (data.data && data.data.length > 0) {
            let imsi = data.data[0];
            // console.log(new Date().getTime() - imsi.createTime * 1000);
            if ((new Date().getTime() - imsi.createTime * 1000) >= -30 * 1000 && (new Date().getTime() - imsi.createTime * 1000) <= 30 * 1000) {//30s内的数据
              // console.log(this.imsiWarning.id);
              if (this.imsiWarning.id !== imsi.id) {
                // console.log(imsi.id);
                sessionStorage.setItem("imsi", JSON.stringify(imsi));
                this.audio.play();
                this.imsiWarning = imsi;
                this.imsiWarning.timeStr = formatDate(new Date(this.imsiWarning.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
                this.runFaceWarning = false;
                this.runImsiWarning = true;
                setTimeout(() => {
                  this.runImsiWarning = false;
                }, 5000);
              }
            }
          }
        });
      },
      getFaceWarning() {
        this.faceWarning = JSON.parse(sessionStorage.getItem("face"));
        this.$post("warning/get/listFaceToday", {size: 1}).then((data) => {
          if (data.data && data.data.length > 0) {
            let face = data.data[0];
            // console.log(new Date().getTime() - face.createTime * 1000);
            if ((new Date().getTime() - face.createTime * 1000) >= -30 * 1000 && (new Date().getTime() - face.createTime * 1000) <= 30 * 1000) {//30s内的数据
              // console.log(this.faceWarning.id);
              if (this.faceWarning.id !== face.id) {
                // console.log(face.id);
                sessionStorage.setItem("face", JSON.stringify(face));
                this.audio.play();
                this.faceWarning = face;
                this.faceWarning.timeStr = formatDate(new Date(this.faceWarning.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
                this.runImsiWarning = false;
                this.runFaceWarning = true;
                setTimeout(() => {
                  this.runFaceWarning = false;
                }, 5000);
              }
            }
          }
        });
      },
      gotoImsiDetail() {
        this.runImsiWarning = false;
        this.$router.push({path: '/imsiWarningDetail', query: {id: this.imsiWarning.id, imsi: this.imsiWarning.imsi}});
      },
      gotoFaceDetail() {
        this.runFaceWarning = false;
        this.$router.push({
          path: '/faceWarningDetail',
          query: {id: this.faceWarning.id, faceId: this.faceWarning.faceId}
        });
      },
      //退出
      loginOut() {
        this.$confirm('确认退出系统吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/manager/user/logout', {}, '退出成功').then((data) => {
            if ('000000' == data.code) {
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("button");
              sessionStorage.removeItem("menu");
              sessionStorage.removeItem("query");
              sessionStorage.removeItem("qTime");
              sessionStorage.removeItem("activeItem");
              sessionStorage.removeItem("index");
              sessionStorage.removeItem("face");
              sessionStorage.removeItem("imsi");
              this.$router.push("/login");
            }
          });
        }).catch(() => {
        });
      },
      //修改密码
      modifyPsw(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$post('/manager/user/updatePwdByOldPwd', {
              userId: this.userId,
              oldPwd: md5(this.psw.password),
              newPwd: md5(this.psw.password2)
            }, '修改成功');
            this.runModifyPsw = false;
          }
        });
      },
      /**删除告警通知*/
      deleteMsg() {
        this.$confirm('确定要删除该条告警通知?', '提示', {type: 'info'}).then(() => {
        }).catch(() => {
        });
      },
      /**
       * 清空告警通知
       */
      clearAll() {
        this.$confirm('确定要清除所有的告警通知?', '提示', {type: 'info'}).then(() => {
        }).catch(() => {
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
      this.getButton();

      this.indx = sessionStorage.getItem("index") ? sessionStorage.getItem("index") : 1;
      this.userName = JSON.parse(sessionStorage.getItem("user")).realName || '';

      this.userId = JSON.parse(sessionStorage.getItem("user")).userId;
      this.menu = JSON.parse(sessionStorage.getItem("menu")) || [];
      this.audio = document.getElementById('audio');

      this.statusTask();
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .warning img {
    height: 200px;
    width: 200px;
    display: inline-block;
    margin-right: 20px;
    border: 1px #ccc dashed;
    border-radius: 6px;
  }

  .msg-title {
    height: 60px;
    border-bottom: 1px #ddd solid;
    margin-bottom: 15px;
    background: #fff;
  }

  .msg-title span {
    height: 60px;
    line-height: 60px;
    font-size: 18px;
    color: #000;
  }

  .msg-title .btn {
    position: absolute;
    height: 30px;
    top: 15px;
    right: 20px;
    padding: 0 20px;
  }

  .msg-item {
    background: #fff;
    border-radius: 4px;
    padding: 20px 30px;
    margin: 0 15px 15px 15px;
  }

  .main-container {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    min-width: 1366px;
    margin-left: -8px;
  }

  .item {
    display: inline-block;
    cursor: pointer;
    width: 80px;
    height: 70px;
    padding: 0;
    margin: 0;
    color: #fff;
    background: transparent;
    font-size: 14px;
    vertical-align: middle;
    border: none;
    border-radius: 0;
  }

  .item.active {
    background: #46467C;
  }

  .item:hover, .item:active {
    background: #181663;
  }

  .title {
    display: block;
  }

  i {
    display: block;
    margin-top: 3px;
  }
</style>
