<template>
  <div>
    <section class="content">
      <h4 style="text-align: left;margin: 0 0 15px 0">设备设置 <span
        style="font-size: 15px;color: #888;margin-left: 10px">设备ID：{{deviceId}}</span></h4>
      <div class="center-block">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick" class="card-width">
          <el-tab-pane label="基本信息" name="first"
                       v-if="getButtonVial('device:baseinfo') || getButtonVial('device:sendBaseInfo')">
            <baseInfo v-bind:deviceId="deviceId" class="card-margin"></baseInfo>
          </el-tab-pane>
          <el-tab-pane label="载波信息" name="second"
                       v-if="getButtonVial('set:wirelessParam') || getButtonVial('set:wirelessParam:send')">
            <setParam v-bind:deviceId="deviceId" class="card-margin"></setParam>
          </el-tab-pane>
          <el-tab-pane label="设备状态" name="third" v-if="getButtonVial('device:get:deviceStatus')">
            <deviceStatus @getDevice="getDevice" class="card-margin"></deviceStatus>
          </el-tab-pane>
          <el-tab-pane label="侦码数据" name="fourth" v-if="getButtonVial('terminate:query')">
            <terminal @getDevice="getDevice" class="card-margin"></terminal>
          </el-tab-pane>
          <el-tab-pane label="扫频工具" name="fifth" v-if="deviceForm == 'CON_OUTDOOR_POLE' && (getButtonVial('device:get:sniffer') ||
                getButtonVial('device:sniffer') || getButtonVial('set:autoSnifferParam'))">
            <scanTool @getDevice="getDevice" class="card-margin"></scanTool>
          </el-tab-pane>
          <!--v-if="deviceForm == 'CON_OUTDOOR_MOCRO' && (getButtonVial('set:log:getParam') ||
                getButtonVial('set:log:sendParam'))"-->
          <el-tab-pane label="日志设置" name="seven" v-if="deviceForm == 'CON_OUTDOOR_MOCRO' && (getButtonVial('set:log:getParam') ||
                getButtonVial('set:log:sendParam'))">
            <LogSet @getDevice="getDevice" class="card-margin"></LogSet>
          </el-tab-pane>
          <el-tab-pane label="任务列表" name="sixth" v-if="getButtonVial('device:get:deviceMessage')">
            <taskList @getDevice="getDevice" class="card-margin"></taskList>
          </el-tab-pane>
        </el-tabs>
      </div>
    </section>
  </div>
</template>
<script>
  import baseInfo from './deviceSet/BaseInfo'
  import setParam from './deviceSet/SetParam'
  import deviceStatus from './deviceSet/DeviceStatus'
  import terminal from './deviceSet/TerminalData'
  import scanTool from './deviceSet/NetworkData'
  import taskList from './deviceSet/TaskList'
  import LogSet from "./deviceSet/LogSet.vue";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeName: 'first',
        deviceId: this.$route.query.deviceId || '',
        deviceForm: this.$route.query.deviceForm || '',
        groupId: this.$route.query.groupId || ''
      }
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      handleClick(tab, event) {//保存当前标签页的位置
        sessionStorage.setItem("deviceTab", this.activeName);
      },
      getDevice() {
        let device = {deviceId: this.deviceId, deviceForm: this.deviceForm, groupId: this.groupId};
        return device;
      }
    },
    mounted() {
      this.deviceId = this.$route.query.deviceId || '';
      this.deviceForm = this.$route.query.deviceForm || '';
      this.groupId = this.$route.query.groupId || '';
      let tab = sessionStorage.getItem("deviceTab");
      if (tab) {
        this.activeName = tab;
      }
    },
    components: {
      baseInfo,
      setParam,
      deviceStatus,
      terminal,
      scanTool,
      taskList,
      LogSet
    }
  }
</script>
<style scoped>
  @media screen and (min-width: 320px) and (max-width: 799px) {
    .card-width {
      width: 98%
    }

    .card-margin {
      margin-left: 0
    }
  }

  @media screen and (min-width: 800px) {
    .card-width {
      width: 90%
    }

    .card-margin {
      margin-left: 20px
    }
  }
</style>
