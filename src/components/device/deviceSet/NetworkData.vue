<template>
  <div>
    <section class="content">
      <el-form label-width="100px" label-position="left">
        <h4 style="text-align: left;margin-top: 0">扫频设置</h4>
        <div class="center-block add-appdiv">
          <el-row style="margin-left: 20px">
            <el-col :span="11" v-show="getButtonVial('device:sniffer')">
              <el-form-item label="手动扫频">
                <el-row>
                  <el-col :span="24" align="right" v-show="getButtonVial('device:sniffer')">
                    <el-button type="primary" size="medium" @click="startSweep">开始扫频</el-button>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item label="扫频模式" align="left">
                <el-select v-model="scanMode" placeholder="请选择" @change="changeMode" filterable>
                  <el-option v-for="item in activeName" :key="item.name" :label="item.name" :value="item.name">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="扫描策略" align="left">
                <el-radio-group v-model="scanType">
                  <el-radio :label="item.type" v-for="item in scanTypes" :key="item.type">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="扫描频点" align="left" v-show="scanType != 4">
                <el-tag :key="tag" v-for="tag in dynamicTags" closable hit
                        :disable-transitions="false" @close="handleClose(tag)">{{tag}}
                </el-tag>
                <el-input class="input-tag" v-show="inputVisible && dynamicTags.length<8" v-model="inputValue"
                          ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm"
                          @blur="handleInputConfirm">
                </el-input>
                <el-button v-show="!inputVisible && dynamicTags.length<8" class="button-tag" size="small"
                           @click="showInput" type="primary" icon="el-icon-plus">频点
                </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="1" style="border-left: 1px #D0CACF solid;padding-left: 40px"
                    v-show="getButtonVial('set:autoSnifferParam')">
              <el-form-item label="自动扫频" style="margin: 0">
                <el-row>
                  <el-col :span="8" align="left">{{enableSweepFrequency ? "开启" : "关闭"}}</el-col>
                  <el-col :span="8" align="left">
                    <el-switch v-model="enableSweepFrequency" active-color="#409EFF" inactive-color="#C1C1C1"
                               @change="setStatusSwitch" v-show="getButtonVial('set:autoSniffer')"></el-switch>
                  </el-col>
                  <el-col :span="8" align="right" v-show="getButtonVial('set:autoSnifferParam')">
                    <el-button type="primary" @click="setScanTime" size="medium">设置</el-button>
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item label="扫频模式" align="left" style="margin: 20px 0 0 15px">
                <el-select v-model="scanMode2" placeholder="请选择" @change="changeDay" filterable>
                  <el-option v-for="item in activeName" :key="item.name" :label="item.name" :value="item.name">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="选频模式" align="left" style="margin: 20px 0 0 15px">
                <el-select v-model="autoBccMode" placeholder="请选择" filterable>
                  <el-option v-for="item in autoBccModes" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="设置扫频时间" style="margin: 20px 0 0 15px" align="left">
                <el-time-select v-model="settime" :picker-options="{start: '00:00',step: '00:05',end: '23:59'}"
                                placeholder="选择时间">
                </el-time-select>
              </el-form-item>
              <el-form-item label="设置间隔周期" style="margin: 20px 0 0 15px" align="left">
                <el-row>
                  <el-col :span="16">
                    <el-input-number v-model="scanTime" :min="1" :maxlength=3 style="width: 95%"></el-input-number>
                  </el-col>
                  <el-col :span="2">天</el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <h4 style="text-align: left">扫频数据</h4>
      <el-tabs v-model="activeItem" @tab-click="handleClick" style="margin-left: 20px">
        <el-tab-pane :label="tab.name" v-for="tab in activeName" :key="tab.name" :name="tab.name"></el-tab-pane>
      </el-tabs>
      <el-table :data="networkData" v-loading="listLoading" stripe style="margin-bottom: 30px">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" v-for="item in defaultProps" :key="item.value" :formatter="formatterAddress"
                         :prop="item.value" :label="item.name" min-width="100" max-width="200"></el-table-column>
      </el-table>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        networkData: [],
        enableSweepFrequency: false,
        openEnableScan: false,
        clockEnableScan: false,
        listLoading: false,
        dynamicTags: [],
        inputVisible: false,
        inputValue: '',
        activeItem: "移动2G(GSM 0)",
        activeName: [{moduleID: 1, name: '移动2G(GSM 0)', type: 'GSM1'}, {moduleID: 2, name: '联通2G(GSM 1)', type: 'GSM2'},
          {moduleID: 3, name: '联通4G(FDD 0)', type: 'FDD0'}, {moduleID: 4, name: '电信4G(FDD 1)', type: 'FDD1'},
          {moduleID: 5, name: '移动4G(TDD 0)', type: 'TDD0'}, {moduleID: 6, name: '移动4G(TDD 1)', type: 'TDD1'}],
        query: {page: 1, size: 10},
        count: 0,
        deviceId: this.$route.query.deviceId || '',
        defaultProps: [{value: 'bcchNumber', name: '频点'}, {value: 'c1', name: 'c1'},
          {value: 'c2', name: 'c2'}, {value: 'rssi', name: 'rssi'}, {value: 'upTime', name: '上报时间'}],
        scanMode: '移动2G(GSM 0)',
        scanMode2: '移动2G(GSM 0)',
        autoBccMode: 10,
        autoBccModes: [{value: 10, label: '手动配置'}, {value: 2, label: '周围宏站选次弱'}, {value: 8, label: '宏站邻区选次弱'}],
        scanType: 3,
        scanTime: 1,
        settime: '10:00',
        scanTypes: [{name: '扫描当前频点与邻区', type: 3}, {name: '仅扫描当前频点', type: 0}, {name: '扫描全频段', type: 4}]
      }
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      //设置时间
      setScanTime() {
        let param = {};
        param.moduleId = this.getModuleID(this.scanMode2);
        param.autoBccMode = this.autoBccMode;
        param.runTime = this.settime + ":00";
        param.snifferCycle = this.scanTime;
        this.$post('set/autoSnifferParam/' + this.deviceId, param, '设置成功', '设置失败');
      },
      //开始扫频
      startSweep() {
        if (this.dynamicTags.length === 0 && this.scanType !== 4) {
          this.$message.error('请输入扫描频点');
          return;
        }
        let param = {};
        param.moduleId = this.getModuleID(this.scanMode);
        console.log(this.getNetwork(this.scanMode));
        if (this.getNetwork(this.scanMode) === 'GSM_1') {
          param.arfcnList = [];
          for (let item of this.dynamicTags) {
            param.arfcnList.push({arfcn: item});
          }
        } else {
          param.earfcnList = [];
          for (let item of this.dynamicTags) {
            param.earfcnList.push({earfcn: item});
          }
        }
        param.mode = this.scanType;
        this.$post('device/sniffer/' + this.deviceId, param, '设置成功');
      },
      //扫频模式改变 相应参数改变
      changeDay(val) {
        this.autoBccMode = 10;
        console.log(this.getNetwork(this.scanMode2));
        if (this.getNetwork(this.scanMode2) === "GSM_1") {
          this.autoBccModes = [{value: 10, label: '手动配置'}, {value: 2, label: '周围宏站选次弱'},
            {value: 8, label: '宏站邻区选次弱'}]
        } else {
          this.autoBccModes = [{value: 10, label: '手动配置'}, {value: 2, label: '自选频点'}]
        }
        this.getScanSwitch();
      },
      //扫频模式改变时=>改变扫描策略
      changeMode(val) {
        if (this.getNetwork(val) === 'GSM_1') {
          this.scanType = 3;
          this.scanTypes = [{name: '扫描当前频点与邻区', type: 3}, {name: '仅扫描当前频点', type: 0}, {name: '扫描全频段', type: 4}];
        } else {
          this.scanType = 1;
          this.scanTypes = [{name: '仅扫描当前频点', type: 1}, {name: '扫描邻区中的频点和当前频点', type: 0}];
        }
      },
      //删除标签
      handleClose(tag) {
        this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
      },
      //输入频点
      showInput() {
        this.inputVisible = true;
        this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      //输入框回车添加tag标签
      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          this.dynamicTags.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      handleClick(tab, event) {
        if (this.getNetwork(this.activeItem) === 'GSM_1') {//2G
          this.defaultProps = [{value: 'bcchNumber', name: '频点'}, {value: 'c1', name: 'c1'},
            {value: 'c2', name: 'c2'}, {value: 'rssi', name: 'rssi'}, {value: 'upTime', name: '上报时间'}];
        } else {
          this.defaultProps = [{value: 'earfcn', name: '频点'}, {value: 'pci', name: 'pci'},
            {value: 'band', name: 'band'}, {value: 'rsrp', name: 'rsrp'},
            {value: 'network', name: 'network'}, {value: 'frameOffset', name: '帧偏移'},
            {value: 'freqOffset', name: '频偏'}, {value: 'plmnID', name: 'plmnID'},
            {value: 'priority', name: '小区优先级'}, {value: 'upTime', name: '上报时间'}];//{value: 'ncellList', name: '邻区列表'}
        }
        this.networkData = [];
        this.getNetworkData();
      },
      getModuleID(modeleName) {
        for (let item of this.activeName) {
          if (modeleName === item.name) {
            return item.moduleID;
          }
        }
      },
      getNetwork(modeleName) {
        for (let item of this.activeName) {
          if (modeleName === item.name) {
            return item.type;
          }
        }
      },
      pageChange(index) {
        this.query.page = index;
        this.getNetworkData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getNetworkData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'upTime') {
          return row.upTime ? row.upTime !== 0 ? formatDate(new Date(row.upTime), 'yyyy-MM-dd hh:mm:ss') : '--' : '--';
        } else {
          return row[column.property];
//            ? row[column.property] : '--';
        }
      },
      //自动扫频设置
      setStatusSwitch(val) {
        this.$post('set/autoSniffer/' + this.deviceId + '/' + val + '/' + this.getModuleID(this.scanMode2), {}, '设置成功');
      },
      //扫频数据列表
      getNetworkData() {
        this.listLoading = true;
        this.$post('device/get/sniffer/' + this.deviceId, {}).then((data) => {
          setTimeout(() => {
            this.listLoading = false
          }, 500);
          if (data.code === '000000') {
            if (data.data) {
              data.data.forEach((item) => {//移动2G/联通2G数据一样
                if (this.getModuleID(this.activeItem) === item.moduleId || (this.getModuleID(this.activeItem) === 2 && item.moduleId === 1)) {
                  this.networkData.push(item);
                }
              });
            } else {
              this.networkData = [];
            }
          } else {
            this.networkData = [];
          }
        }).catch((err) => {
          this.listLoading = false;
          this.networkData = [];
          this.$message.error(err);
        });
      },
      //获取自动扫频按钮
      getScanSwitch() {
        this.$post('device/get/deviceParameter/' + this.deviceId, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              if (data.data.subModuleParam && data.data.subModuleParam.length > 0) {
                data.data.subModuleParam.forEach((item) => {
                  if (this.getModuleID(this.scanMode2) == item.moduleId) {
                    this.enableSweepFrequency = (item.autoSnifferSwitch == 1);
                    if (item.autoSnifferParam) {
                      this.settime = item.autoSnifferParam.runTime.substring(0, item.autoSnifferParam.runTime.length - 3);
                      this.scanTime = item.autoSnifferParam.snifferCycle;
                      this.autoBccMode = item.autoSnifferParam.autoBccMode;
                    }
                  }
                });
              }
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
                  this.scanMode = this.activeName[0].name;
                  this.scanMode2 = this.activeName[0].name;
                  if (this.getNetwork(this.scanMode2) === "GSM_1") {
                    this.autoBccModes = [{value: 10, label: '手动配置'}, {value: 2, label: '周围宏站选次弱'},
                      {value: 8, label: '宏站邻区选次弱'}]
                  } else {
                    this.autoBccModes = [{value: 10, label: '手动配置'}, {value: 2, label: '自选频点'}]
                  }
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
      this.getBaseInfo();
      this.getNetworkData();
      this.getScanSwitch();
    }
  }
</script>
