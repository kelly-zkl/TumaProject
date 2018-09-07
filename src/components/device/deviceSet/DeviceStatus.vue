<template>
  <div>
    <section class="content">
      <el-form label-width="150px" label-position="left">
        <h4 style="text-align: left;margin-top: 0" v-show="deviceForm === 'CON_OUTDOOR_POLE'">状态上报设置</h4>
        <el-row style="margin-left: 20px" v-show="deviceForm === 'CON_OUTDOOR_POLE'">
          <el-col :span="24">
            <el-form-item label="实时运行状态上报" style="margin: 0">
              <el-row>
                <el-col :span="4" align="left">{{statusSwitch ? "开启" : "关闭"}}</el-col>
                <el-col :span="4" align="left" v-show="getButtonVial('set:statusSwitch')">
                  <el-switch v-model="statusSwitch" active-color="#409EFF" inactive-color="#C1C1C1"
                             @change="setStatusSwitch()" v-show="getButtonVial('set:statusSwitch')"></el-switch>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="上报时间间隔" style="text-align: left;margin: 15px 0 0 0"
                          v-show="getButtonVial('set:statusUpPeriod')">
              <el-radio-group v-model="statusUpPeriod" @change="timePeriod" size="medium">
                <el-radio-button :label="30">30秒</el-radio-button>
                <el-radio-button :label="60">60秒</el-radio-button>
                <el-radio-button :label="90">90秒</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" style="text-align: left">
            <h4>设备状态</h4>
          </el-col>
        </el-row>
        <div class="center-block add-appdiv" style="margin-left: 20px">
          <el-row>
            <el-col :span="6">
              <el-form-item label="设备温度" style="text-align: left"><span
                v-bind:class="deviceStatus.temperature > 80 ? 'text-red' : deviceStatus.temperature > 50 ? 'text-yellow' :'text-green'">
                {{deviceStatus.temperature != null ? deviceStatus.temperature : '--'}}°C</span>
              </el-form-item>
              <el-form-item label="cpu占用率" style="text-align: left"><span
                v-bind:class="deviceStatus.cpu > 0.8 ? 'text-red' : deviceStatus.cpu > 0.5 ? 'text-yellow' :'text-green'">
                {{deviceStatus.cpu != null ? (deviceStatus.cpu * 100).toFixed(2) : '--'}}%</span>
              </el-form-item>
              <el-form-item label="内存占用率" style="text-align: left;margin-bottom: 0"><span
                v-bind:class="deviceStatus.memory > 0.8 ? 'text-red' : deviceStatus.memory > 0.5 ? 'text-yellow' :'text-green'">
                {{deviceStatus.memory != null ? (deviceStatus.memory * 100).toFixed(2) : '--'}}%</span>
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="2">
              <el-form-item label="3G信号强度" style="text-align: left" v-show="deviceForm !== 'CON_OUTDOOR_POLE'">
                <span>{{deviceStatus.rssi3G != null ? deviceStatus.rssi3G : '--'}}dbm</span>
              </el-form-item>
              <el-form-item label="持续工作时间" style="text-align: left" v-show="deviceForm !== 'CON_OUTDOOR_POLE'">
                <span>{{deviceStatus.workDuration != null ? deviceStatus.workDuration : '--'}}秒</span>
              </el-form-item>
              <el-form-item label="侦码状态" style="text-align: left;margin-bottom: 0"
                            v-show="deviceForm !== 'CON_OUTDOOR_POLE'">
                <span>上报，{{deviceStatus.ccStatus}}/min(单路)</span>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-row>
          <el-col :span="24" style="text-align: left">
            <h4>子模块状态</h4>
          </el-col>
        </el-row>
        <div class="center-block add-appdiv" style="margin-left: 20px">
          <el-tabs v-model="activeItem" @tab-click="handleClick" type="card">
            <el-tab-pane :label="tab.name" v-for="tab in activeName" :key="tab.name" :name="tab.name"></el-tab-pane>
          </el-tabs>
          <el-row style="margin-top: 20px">
            <el-col :span="6">
              <el-form-item label="PA温度" style="text-align: left"><span
                v-bind:class="subModuleStatus.patemp > 80 ? 'text-red' : subModuleStatus.patemp > 50 ? 'text-yellow' :'text-green'">
                {{subModuleStatus.patemp != null ? subModuleStatus.patemp : '--'}}°C</span>
              </el-form-item>
              <el-form-item label="PA开关" style="text-align: left" v-show="deviceForm === 'CON_OUTDOOR_POLE'">
                <span>{{subModuleStatus.paSwitch === 1 ? "开启" : "关闭"}}</span>
              </el-form-item>
              <el-form-item label="驻波比" style="text-align: left" v-show="deviceForm === 'CON_OUTDOOR_POLE'">
                <span>{{subModuleStatus.swr != null ? subModuleStatus.swr : '--'}}</span>
              </el-form-item>
              <el-form-item label="抓取记录" style="text-align: left;margin-bottom: 0">
                <span>{{subModuleStatus.catchRecord != null ? subModuleStatus.catchRecord : '--'}}条</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="2">
              <el-form-item label="无线电开关" style="text-align: left" v-show="deviceForm === 'CON_OUTDOOR_POLE'">
                <span>{{subModuleStatus.wirelessSwitch === 1 ? "开启" : "关闭"}}</span>
              </el-form-item>
              <el-form-item label="输入功率" style="text-align: left" v-show="deviceForm === 'CON_OUTDOOR_POLE'">
                <span>{{subModuleStatus.inputPower != null ? subModuleStatus.inputPower : '--'}}&nbsp;dBm&nbsp;({{subModuleStatus.inputPowerX != null ? subModuleStatus.inputPowerX : '--'}}&nbsp;mW)</span>
              </el-form-item>
              <el-form-item label="输出功率" style="text-align: left">
                <span v-if="deviceForm === 'CON_OUTDOOR_POLE'">
                  {{subModuleStatus.outPower != null ? subModuleStatus.outPower : '--'}}&nbsp;dBm&nbsp;({{subModuleStatus.outPowerX != null ? subModuleStatus.outPowerX : '--'}}&nbsp;mW)
                </span>
                <span v-else>{{subModuleStatus.outPower != null ? subModuleStatus.outPower : '--'}}mW</span>
              </el-form-item>
              <el-form-item label="持续工作时间" style="text-align: left;margin-bottom: 0"
                            v-show="deviceForm !== 'CON_OUTDOOR_POLE'">
                <span>{{subModuleStatus.workDuration != null ? subModuleStatus.workDuration : '--'}}秒</span>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        deviceStatus: {},
        statusUpPeriod: 30,
        subModuleStatus: {paSwitch: 0, wirelessSwitch: 0},
        statusSwitch: true,
        activeItem: "移动2G(GSM 0)",
        activeName: [{moduleID: 1, name: '移动2G(GSM 0)', type: 'GSM1'}, {moduleID: 2, name: '联通2G(GSM 1)', type: 'GSM2'},
          {moduleID: 3, name: '联通4G(FDD 0)', type: 'FDD0'}, {moduleID: 4, name: '电信4G(FDD 1)', type: 'FDD1'},
          {moduleID: 5, name: '移动4G(TDD 0)', type: 'TDD0'}, {moduleID: 6, name: '移动4G(TDD 1)', type: 'TDD1'}],
        deviceId: this.$route.query.deviceId || '',
        deviceForm: this.$route.query.deviceForm || '',
        intervalid: null
      }
    },
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    computed: {
      temperatureStyle() {
        return {
          'text-green': this.deviceStatus.temperature < 50 ? true : false,
          'text-yellow': (this.deviceStatus.temperature > 50 && this.deviceStatus.temperature < 70) ? true : false,
          'text-red': this.deviceStatus.temperature > 70 ? true : false
        }
      }
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      //定时刷新
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getDeviceStatus();
            this.getStatusSwitch();
          }, 5000);
        }
      },
      handleClick(tab, event) {
        this.getSubStatus();
      },
      //关闭定时刷新
      dialogCloseHandle() {
        clearInterval(this.intervalid);
      },
      //上报时间间隔
      timePeriod(val) {
        this.$post("set/statusUpPeriod/", {deviceId: this.deviceId, statusUpPeriod: val}, '设置成功', '设置失败');
      },
      //子模块状态
      getSubStatus() {
        this.subModuleStatus = {paSwitch: 0, wirelessSwitch: 0};
        if (this.deviceStatus.subModuleStatus && this.deviceStatus.subModuleStatus.length > 0) {
          for (let item of this.deviceStatus.subModuleStatus) {
            if (item.moduleId == this.getModuleID()) {
              this.subModuleStatus = item;
            }
          }
        }
      },
      getModuleID() {
        for (let item of this.activeName) {
          if (this.activeItem === item.name) {
            return item.moduleID;
          }
        }
      },
      getStatusSwitch() {
        this.$post('device/get/deviceParameter/' + this.deviceId, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              this.statusSwitch = (data.data.statusSwitch == 1);
              this.statusUpPeriod = data.data.statusUpPeriod;
            }
          }
        });
      },
      //设置状态开关
      setStatusSwitch() {
        this.$post("set/statusSwitch/" + this.deviceId + '/' + this.statusSwitch, {}, '设置成功', '设置失败');
      },
      //设备状态
      getDeviceStatus() {
        this.$post('device/get/deviceStatus/' + this.deviceId).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              this.deviceStatus = data.data;
              this.deviceStatus.cpu = parseFloat(this.deviceStatus.cpu);
              this.deviceStatus.memory = parseFloat(this.deviceStatus.memory);
              this.getSubStatus();
            }
          }
        })
      },
      //获取设备的基本信息
      getBaseInfo() {
        this.$post("device/get/byDeviceId/" + this.deviceId, {}).then((data) => {
            if (data.code === '000000') {
              if (data.data) {
                if (data.data.deviceForm === 'CON_OUTDOOR_POLE') {//大站设备
                  this.activeName = [];
                  data.data.capabilityInfo.forEach((item) => {
                    let param = {moduleID: item.bts, name: item.name, type: item.network};
                    this.activeName.push(param);
                  });
                  this.activeItem = this.activeName[0].name;
                } else {//小站设备
                  this.activeName = [{moduleID: 0, name: '移动', type: 'M'}, {moduleID: 1, name: '联通', type: 'U'},
                    {moduleID: 2, name: '电信', type: 'T'}];
                  this.activeItem = '移动';
                }
              }
            }
          }
        )
      }
    },
    mounted() {
      let device = this.$emit('getDevice');
      this.deviceId = this.$route.query.deviceId || device.deviceId || '';
      this.deviceForm = this.$route.query.deviceForm || device.deviceForm || '';
      this.getBaseInfo();
      this.getDeviceStatus();
      this.getStatusSwitch();
      this.statusTask();
    }
  }
</script>
<style scoped>
  .text-green {
    color: #00aa00;
  }

  .text-yellow {
    color: #ff8a00;
  }

  .text-red {
    color: #ff0000;
  }
</style>

