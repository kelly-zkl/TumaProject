<template>
  <section class="content">
    <el-tabs v-model="activeItem" @tab-click="handleClick">
      <el-tab-pane :label="tab.name" v-for="tab in activeName" :key="tab.name" :name="tab.name"></el-tab-pane>
    </el-tabs>
    <el-form ref="opDeviceParameter" label-width="120px" label-position="left" :rules="rules"
             :model="opDeviceParameter">
      <div class="center-block add-appdiv" style="margin-top: 10px">
        <el-row>
          <el-col :span="11">
            <el-form-item label="band" prop="band" required align="left">
              <el-tooltip placement="bottom">
                <div slot="content">基站频段号 取值范围：<br/>GSM：900/1800<br/>FDD：1/3<br/>TDD：[38-41]</div>
                <el-select v-model="opDeviceParameter.band" placeholder="请选择" style="width: 100%" filterable>
                  <el-option v-for="item in bands" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="上行频点" required v-show="deviceForm=='CON_OUTDOOR_MOCRO'">
              <el-input v-model="opDeviceParameter.upFrequency" readonly></el-input>
            </el-form-item>
            <el-form-item label="下行频点" v-show="deviceForm=='CON_OUTDOOR_MOCRO'" prop="downFrequency">
              <el-input v-model="opDeviceParameter.downFrequency" @change="changeDown"></el-input>
            </el-form-item>
            <el-form-item label="mcc" prop="mcc" v-if="deviceForm=='CON_OUTDOOR_POLE'">
              <el-tooltip placement="bottom">
                <div slot="content">移动国家号：由三个十进制数组成，编码范围为十进制的000－999,中国-460</div>
                <el-input v-model="opDeviceParameter.mcc" :maxlength=3></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="mnc" prop="mnc" required v-if="deviceForm=='CON_OUTDOOR_POLE'">
              <el-tooltip placement="bottom">
                <div slot="content">移动网号：由二个十进制数组成，编码范围为十进制的00－99<br/>中国范围:
                  <br/>联通[1,6,9,10]<br/>移动[0,2,4,7,8]<br/>电信[3,11,12]
                </div>
                <el-select v-model="opDeviceParameter.mnc" placeholder="请选择" style="width: 100%" filterable>
                  <el-option v-for="item in mncs" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="同步模式" required align="left"
                          v-if="deviceForm=='CON_OUTDOOR_POLE' && (getActiveType() =='TDDLTE_4' || getActiveType() =='TDDLTE_5')">
              <el-select v-model="opDeviceParameter.syncMode" placeholder="同步模式" filterable style="width: 100%">
                <el-option v-for="item in syncModes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="帧偏移" prop="frameOffset"
                          v-if="getActiveType()=='M'||(getActiveType() =='TDDLTE_4' || getActiveType() =='TDDLTE_5')">
              <el-input v-model="opDeviceParameter.frameOffset" :maxlength=10></el-input>
            </el-form-item>

            <el-form-item label="重定向载波频点" v-show="deviceForm=='CON_OUTDOOR_MOCRO'">
              <el-input v-model.number="hopParam.redirectEarfcn" :maxlength=10></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-form-item label="pci" prop="pci" v-show="getActiveType() != 'GSM_1' || deviceForm=='CON_OUTDOOR_MOCRO'">
              <el-tooltip placement="bottom">
                <div slot="content">物理小区标识 取值范围：[0-504]</div>
                <el-input v-model="opDeviceParameter.pci" :maxlength=3></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="labelBcc" prop="bcc" v-show="deviceForm=='CON_OUTDOOR_POLE'">
              <el-tooltip placement="bottom">
                <div slot="content">频点号 取值范围：<br/>GSM：移动band900[1-94],band1800[512-562],联通band900[96-124],band1800[686-735]
                  <br/>FDD:band1[0-599],band3[1200-1949]
                  <br/>TDD：移动-38 [37750-38249],移动-39 [38250-38649],移动-40 [38650-39649],移动-41 [39650-41589]
                </div>
                <el-input v-model="opDeviceParameter.bcc" :maxlength=5 @change="changeBcc" @blur="changeBcc"></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="lac" prop="lac"
                          v-show="deviceForm=='CON_OUTDOOR_POLE' && (getActiveType() == 'GSM_1')">
              <el-tooltip placement="bottom">
                <div slot="content">位置区码 取值范围：[0001－FFFEH]，码组0000H和FFFFH不可以使用</div>
                <el-input v-model="opDeviceParameter.lac" :maxlength=4></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="tac" prop="tac"
                          v-show="(getActiveType() != 'GSM_1')|| deviceForm=='CON_OUTDOOR_MOCRO'">
              <el-tooltip placement="bottom">
                <div slot="content">跟踪区域码 取值范围：[0001－FFFEH]，码组0000H和FFFFH不可以使用</div>
                <el-input v-model="opDeviceParameter.tac" :maxlength=4></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="bandWidth" required v-show="deviceForm=='CON_OUTDOOR_MOCRO'" align="left">
              <el-select v-model="opDeviceParameter.bandWidth" placeholder="带宽BandWidth" filterable style="width: 100%">
                <el-option v-for="item in bandwidths" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="同步频点" prop="syncEarfcn"
                          v-if="deviceForm=='CON_OUTDOOR_POLE' && (getActiveType() =='TDDLTE_4' || getActiveType() =='TDDLTE_5')">
              <el-input v-model="opDeviceParameter.syncEarfcn" :maxlength=10></el-input>
            </el-form-item>
            <el-form-item label="plmn" align="left" v-show="deviceForm=='CON_OUTDOOR_MOCRO'">
              <el-radio-group v-model="hopParam.plmn" align="left">
                <el-radio-button :label="tab.type" v-for="tab in plmns" :key="tab.type">{{tab.name}}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="center-block add-appdiv">
        <el-row>
          <el-col :span="11">
            <el-form-item label="重复抓取时间" prop="tacPeriod" style="margin: 0">
              <el-row>
                <el-col :span="16" style="margin-right: 10px">
                  <el-input v-model="opDeviceParameter.tacPeriod" :maxlength=4 style="width: 100%"
                            :disable="!getButtonVial('set:repeatCatch')">
                    <template slot="append">秒</template>
                  </el-input>
                </el-col>
                <el-col :span="6" v-show="getButtonVial('set:repeatCatch') && deviceForm=='CON_OUTDOOR_POLE'">
                  <el-button type="primary" @click="setRepeatCatch">设置</el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="重复上报间隔" style="margin: 0;margin-top: 15px" prop="ccPeriod"
                          v-show="getButtonVial('set:ccPeriod') && deviceForm=='CON_OUTDOOR_POLE'">
              <el-row>
                <el-col :span="16" style="margin-right: 10px">
                  <el-input v-model="opDeviceParameter.ccPeriod" :maxlength=4 style="width: 100%"
                            :disable="!getButtonVial('set:ccPeriod')">
                    <template slot="append">分</template>
                  </el-input>
                </el-col>
                <el-col :span="6" v-show="getButtonVial('set:ccPeriod') && deviceForm=='CON_OUTDOOR_POLE'">
                  <el-button type="primary" @click="setCCPeriod">设置</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2" v-show="deviceForm=='CON_OUTDOOR_POLE'">
            <el-form-item label="功率等级" style="text-align: left;margin: 0" v-show="getButtonVial('set:paAtt')">
              <el-tooltip placement="bottom">
                <div slot="content">功率等级衰减值：<br/>6：0dB&#12288;&#12288;5：3dB&#12288;&#12288;&nbsp;&nbsp;4：6dB
                  <br/>3：9dB&#12288;&#12288;2：12dB&#12288;&#12288;1：15dB
                </div>
                <el-radio-group v-model="powerValue" @change="setPA">
                  <el-radio-button :label="0">6</el-radio-button>
                  <el-radio-button :label="3">5</el-radio-button>
                  <el-radio-button :label="6">4</el-radio-button>
                  <el-radio-button :label="9">3</el-radio-button>
                  <el-radio-button :label="12">2</el-radio-button>
                  <el-radio-button :label="15">1</el-radio-button>
                </el-radio-group>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="center-block add-appdiv" v-show="deviceForm=='CON_OUTDOOR_POLE'">
        <el-row>
          <el-col :span="11">
            <el-form-item label="无线电" style="margin: 0">
              <el-row>
                <el-col :span="12" align="left">{{wirelessSwitch ? "开启" : "关闭"}}
                </el-col>
                <el-col :span="4" align="left" v-show="getButtonVial('set:openWirless')">
                  <el-switch v-model="wirelessSwitch" active-color="#409EFF"
                             inactive-color="#C1C1C1" @change="setWirelessSwitch"></el-switch>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
          <el-col :span="11" :offset="2" style="margin: 0">
            <el-form-item label="功放">
              <el-row>
                <el-col :span="12" align="left">{{paSwitch ? "开启" : "关闭"}}
                </el-col>
                <el-col :span="4" align="left" v-show="getButtonVial('set:openPA')">
                  <el-switch v-model="paSwitch" active-color="#409EFF" inactive-color="#C1C1C1"
                             @change="setPASwitch"></el-switch>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <div class="add-appdiv" style="margin-bottom: 0" v-show="deviceForm=='CON_OUTDOOR_MOCRO'">
      <el-row>
        <el-col :span="2" align="left" :offset="1">
          <span style="font-size: 14px;color: #333;margin-right: 20px">跳频</span>
        </el-col>
        <el-col :span="2" align="left">
          <span style="font-size: 14px;color: #333;margin-right: 20px">
            {{hopParam.hopFrequencySwitch == 1 ? '已开启' : '已关闭'}}
          </span>
        </el-col>
        <el-col :span="3" align="left">
          <el-switch v-model="hopParam.hopFrequencySwitch" align="right" :active-value=1
                     :inactive-value=0></el-switch>
        </el-col>
        <el-col :span="8" align="left" :offset="1" v-show="hopParam.hopFrequencySwitch == 1">
          <span style="font-size: 14px;color: #333;margin-right: 20px">跳频周期</span>
          <el-input v-model.number="hopParam.switchtime" :maxlength=10
                    style="width: 200px"></el-input>
        </el-col>
      </el-row>
      <div v-for="(tab,indx) in hopParam.freqHopParamArray" :key="indx"
           v-show="hopParam.hopFrequencySwitch == 1" style="margin-top: 20px">
        <el-form :inline="true" align="left" label-width="80px">
          <el-form-item v-show="hopParam.freqHopParamArray.length > 1" style="margin: 0">
            <i class="el-icon-remove" @click="minusPlmn(indx)"
               style="color: #549FF6;font-size: 20px;text-align: center"></i>
          </el-form-item>
          <el-form-item label="上行频点" style="margin: 0">
            <el-input v-model.number="tab.upFrequency" :maxlength=10 readonly></el-input>
          </el-form-item>
          <el-form-item label="下行频点" style="margin: 0">
            <el-input v-model.number="tab.downFrequency" :maxlength=10 @change="changeTDown($event,indx)"
                      @blur="changeTDown($event,indx)"></el-input>
          </el-form-item>
          <el-form-item label="plmn" style="margin: 0">
            <el-radio-group v-model="tab.plmn">
              <el-radio-button :label="item.type" v-for="item in plmns" :key="item.type">{{item.name}}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="帧偏移" style="margin: 0" v-show="getActiveType() == 'M'">
            <el-input v-model.number="tab.frameOffset" :maxlength=10 @change="changeOffset"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <el-row style="margin-top: 20px"
              v-show="hopParam.hopFrequencySwitch==1&&hopParam.freqHopParamArray.length < 3">
        <el-col :span="5" align="left" style="margin-left: 80px">
          <el-button type="primary" icon="el-icon-plus" @click="plusPlmn()" size="medium">增加</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="block" style="margin-top: 30px">
      <el-button @click="updateParam" type="primary" v-show="getButtonVial('set:wirelessParam')">保存</el-button>
      <el-button type="primary" @click="setBaseParam()" v-show="getButtonVial('set:wirelessParam:send')">参数下发
      </el-button>
      <el-button type="primary" @click="queryParamCmd()"
                 v-show="getButtonVial('device:queryDeviceParameterCmd') && deviceForm=='CON_OUTDOOR_MOCRO'">
        查询设备参数
      </el-button>
    </div>
    <br/>
    <!--重启设备-->
    <div class="popu">
      <el-dialog title="" :visible.sync="runStartDevice" :width="dialogWidth">
        <section>
          <p style="font-size: 16px;padding: 0 30px 20px 30px;text-align: left">新的参数配置需要重启设备才能生效，是否立即重启设备？</p>
          <el-row>
            <el-col :span="12">
              <el-button @click="restartDevice" type="text" class="left">立即重启</el-button>
            </el-col>
            <el-col :span="12">
              <el-button @click="runStartDevice = false" type="text" class="right">稍后手动重启</el-button>
            </el-col>
          </el-row>
        </section>
      </el-dialog>
    </div>
  </section>
</template>
<script>
  import {numValid, intValid, hexValidator, mccValidator, pciValidator} from '../../../assets/js/api'
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    props: ['deviceId'],

    data() {
      return {
        runStartDevice: false,
        dialogWidth: isPC() ? '380px' : '300px',
        opDeviceParameter: {
          moduleID: 1, bts: 1, network: 'GSM_1', band: 1, bcc: 1, lac: 0, mcc: 460, mnc: 1, rssimin: 80, pci: 0,
          tac: 0, datatag: 'GSM1', tacPeriod: '0', bandWidth: 5, upFrequency: 0, downFrequency: 0, ccPeriod: '0'
        },
        wirelessSwitch: false, paSwitch: false, powerValue: 0,
        activeName: [
          {moduleID: 1, name: '移动2G(GSM 0)', type: 'GSM1'}, {moduleID: 2, name: '联通2G(GSM 1)', type: 'GSM2'},
          {moduleID: 3, name: '联通4G(FDD 0)', type: 'FDD0'}, {moduleID: 4, name: '电信4G(FDD 1)', type: 'FDD1'},
          {moduleID: 5, name: '移动4G(TDD 0)', type: 'TDD0'}, {moduleID: 6, name: '移动4G(TDD 1)', type: 'TDD1'}
        ],
        labelBcc: 'bcch',
        activeItem: '移动2G(GSM 0)',
        deviceForm: 'CON_OUTDOOR_POLE',//大站
        deviceId1: this.deviceId,
        bands: [{value: 38, label: 38}, {value: 39, label: 39}, {value: 40, label: 40}, {value: 41, label: 41}],
        bandwidths: [{value: 1, label: '3MHz'}, {value: 2, label: '5MHz'}, {value: 3, label: '10MHz'},
          {value: 4, label: '15MHz'}, {value: 5, label: '20MHz'}],
        mncs: [{value: 0, label: 0}, {value: 2, label: 2}, {value: 4, label: 4},
          {value: 7, label: 7}, {value: 8, label: 8}],
        rules: {},
        syncModes: [{value: 0, label: 'gps同步'}, {value: 1, label: '空口同步'}],
        plmns: [{type: '460.00', name: '460.00'}, {type: '460.01', name: '460.01'}, {type: '460.11', name: '460.11'}],
        hopParam: {
          switchtime: 5, redirectEarfcn: 37900, plmn: '460.00', hopFrequencySwitch: 0,
          freqHopParamArray: [{upFrequency: 0, downFrequency: 0, plmn: '460.00', frameOffset: 0}]
        },
        plmn: '460.00',
        down: 37900,
        up: 37900
      }
    },
    watch: {
      deviceId: function () {
        this.deviceId1 = this.deviceId;
        this.getBaseInfo();
      }
    },
    created() {
      this.deviceId1 = this.deviceId;
      this.getBaseInfo();
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      handleClick(tab, event) {
        if (this.getNetwork() === 'TDDLTE_4' || this.getNetwork() === 'TDDLTE_5') {//移动
          this.labelBcc = 'earfcn';
          this.bands = [{value: 38, label: 38}, {value: 39, label: 39}, {value: 40, label: 40}, {value: 41, label: 41}];
        } else if (this.getNetwork() === 'GSM_1') {//2G
          this.labelBcc = 'bcch';
          this.bands = [{value: 900, label: 900}, {value: 1800, label: 1800}];
        } else {//联通/电信4G
          this.labelBcc = 'earfcn';
          this.bands = [{value: 1, label: 1}, {value: 3, label: 3}];
        }
        if (this.getActiveType() === 'FDDLTE_3') {//电信
          this.mncs = [{value: 3, label: 3}, {value: 11, label: 11}, {value: 12, label: 12}];
        } else if (this.getActiveType() === 'FDDLTE_2' || (this.getActiveType() === 'GSM_1' && this.getmoduleID() === 2)) {//联通
          this.mncs = [{value: 1, label: 1}, {value: 6, label: 6}, {value: 9, label: 9}, {value: 10, label: 10}];
        } else {//移动
          this.mncs = [{value: 0, label: 0}, {value: 2, label: 2}, {value: 4, label: 4},
            {value: 7, label: 7}, {value: 8, label: 8}];
        }
        this.clear();
        this.getParam();

        this.opDeviceParameter.moduleID = this.getmoduleID();
        if (this.deviceForm === 'CON_OUTDOOR_POLE') {//大站设备
          this.opDeviceParameter.bts = this.opDeviceParameter.moduleID;
          if (this.getNetwork() === 'FDDLTE_2' || this.getNetwork() === 'FDDLTE_3') {
            this.opDeviceParameter.frameOffset = 0;
          }
        }
      },
      //查询设备参数
      queryParamCmd() {
        this.$post('device/queryDeviceParameterCmd/' + this.deviceId1, {}, '查询命令下发成功').then((data) => {
          this.getParam();
        });
      },
      //增加跳频
      plusPlmn() {
        this.hopParam.freqHopParamArray.push(
          {upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, frameOffset: 0});
      },
      //删除跳频
      minusPlmn(index) {
        this.hopParam.freqHopParamArray.splice(index, 1);
      },
      //下行频点变化
      changeTDown(val, idx) {
        if (val.length > 0) {
          if (this.getActiveType() === 'M') {//小站移动
            this.hopParam.freqHopParamArray[idx].upFrequency = (val ? parseInt(val) : 0);
          } else {//联通电信
            this.hopParam.freqHopParamArray[idx].upFrequency = (val ? parseInt(val) + 18000 : 18000);
          }
        }
      },
      changeOffset(val) {
        let isVaild = true;
        if (val) {
          if (!numValid(val)) {
            this.$message.error('请输入正确的帧偏移');
            isVaild = false;
          }
        }
        return isVaild;
      },
      //下行频点变化
      changeDown(val) {
        if (this.getActiveType() === 'M') {//移动
          this.opDeviceParameter.upFrequency = val ? parseInt(val) : 0;
        } else if (this.getActiveType() === 'T' || this.getActiveType() === 'U') {//联通电信
          this.opDeviceParameter.upFrequency = val ? parseInt(val) + 18000 : 18000;
        }
      },
      //bcc取值范围 GSM：移动[1-94][512-562],联通[96-124][686-735]FDD：[0-599][1200-1949]
      //TDD：移动-38 [37750-38249],移动-39 [38250-38649],移动-40 [38650-39649],移动-41 [39650-41589]
      changeBcc(val) {
        let isVaild = true;
        if (this.getNetwork() === 'GSM_1') {//移动/联通2G
          if (this.getmoduleID() === 1) {//移动2G
            if (this.opDeviceParameter.band === 900) {//[1-94]
              if (parseInt(val) < 1 || parseInt(val) > 94) {
                this.$message.error(this.labelBcc + '的范围为[1-94]');
                isVaild = false;
              }
            } else {//[512-562]
              if (parseInt(val) < 512 || parseInt(val) > 562) {
                this.$message.error(this.labelBcc + '的范围为[512-562]');
                isVaild = false;
              }
            }
          } else {//联通2G
            if (this.opDeviceParameter.band === 900) {//[96-124]
              if (parseInt(val) < 96 || parseInt(val) > 124) {
                this.$message.error(this.labelBcc + '的范围为[96-124]');
                isVaild = false;
              }
            } else {//[686-735]
              if (parseInt(val) < 686 || parseInt(val) > 735) {
                this.$message.error(this.labelBcc + '的范围为[686-735]');
                isVaild = false;
              }
            }
          }
        } else if (this.getNetwork() === 'FDDLTE_2' || this.getNetwork() === 'FDDLTE_3') {//联通/电信4G
          if (this.opDeviceParameter.band === 1) {//[0-599]
            if (parseInt(val) < 0 || parseInt(val) > 599) {
              this.$message.error(this.labelBcc + '的范围为[0-599]');
              isVaild = false;
            }
          } else {//[1200-1949]
            if (parseInt(val) < 1200 || parseInt(val) > 1949) {
              this.$message.error(this.labelBcc + '的范围为[1200-1949]');
              isVaild = false;
            }
          }
        } else {//移动4G
          if (this.opDeviceParameter.band === 38) {//[37750-38249]
            if (parseInt(val) < 37750 || parseInt(val) > 38249) {
              this.$message.error(this.labelBcc + '的范围为[37750-38249]');
              isVaild = false;
            }
          } else if (this.opDeviceParameter.band === 39) {//[38250-38649]
            if (parseInt(val) < 38250 || parseInt(val) > 38649) {
              this.$message.error(this.labelBcc + '的范围为[38250-38649]');
              isVaild = false;
            }
          } else if (this.opDeviceParameter.band === 40) {//[38650-39649]
            if (parseInt(val) < 38650 || parseInt(val) > 39649) {
              this.$message.error(this.labelBcc + '的范围为[38650-39649]');
              isVaild = false;
            }
          } else {//[39650-41589]
            if (parseInt(val) < 39650 || parseInt(val) > 41589) {
              this.$message.error(this.labelBcc + '的范围为[39650-41589]');
              isVaild = false;
            }
          }
        }
        return isVaild;
      },
      getNetwork() {
        if (this.deviceForm === 'CON_OUTDOOR_POLE') {//大站设备
          return this.getActiveType();
        } else {
          switch (this.getmoduleID()) {
            case 0:
              return "TDDLTE_4";
            case 1:
              return "FDDLTE_2";
            case 2:
              return "FDDLTE_3";
          }
        }
      },
      clear() {
        let numVal = (rule, value, callback) => {
          if (!numValid(value)) {
            callback(new Error("只能输入整数"));
          } else {
            callback();
          }
        };
        let intVal = (rule, value, callback) => {
          if (!intValid(value)) {
            callback(new Error("只能输入整数"));
          } else {
            callback();
          }
        };
        let hexValid = (rule, value, callback) => {
          if (!hexValidator(value)) {
            callback(new Error("只能输入0001－FFFE"));
          } else {
            callback();
          }
        };
        let mccValid = (rule, value, callback) => {
          if (!mccValidator(value)) {
            callback(new Error("请输入正确的mcc：000-999"));
          } else {
            callback();
          }
        };
        let pciValid = (rule, value, callback) => {
          if (!pciValidator(value)) {
            callback(new Error("请输入正确的pci：0-504"));
          } else if (parseInt(value) < 0 || parseInt(value) > 504) {
            callback(new Error("pci的范围是0-504"));
          } else {
            callback();
          }
        };
        if (this.deviceForm === 'CON_OUTDOOR_POLE') {
          if (this.getActiveType() === 'GSM_1') {//2G
            this.rules = {
              bcc: [{required: true, message: '请输入bcc', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}],
              lac: [
                {required: true, message: '请输入lac', trigger: "blur"}, {validator: hexValid, trigger: "change,blur"}],
              mcc: [
                {required: true, message: '请输入mcc', trigger: "blur"}, {validator: mccValid, trigger: "change,blur"}],
              tacPeriod: [{message: '请输入重复抓取时间', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}],
              ccPeriod: [{message: '请输入重复抓取时间', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}]
            };
          } else {//4G
            this.rules = {
              bcc: [{required: true, message: '请输入bcc', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}],
              mcc: [
                {required: true, message: '请输入mcc', trigger: "blur"}, {validator: mccValid, trigger: "change,blur"}],
              pci: [
                {required: true, message: '请输入pci', trigger: "blur"}, {validator: pciValid, trigger: "change,blur"}],
              tac: [
                {required: true, message: '请输入tac', trigger: "blur"}, {validator: hexValid, trigger: "change,blur"}],
              frameOffset: [{required: true, message: '请输入帧偏移', trigger: "blur"},
                {validator: intVal, trigger: "change,blur"}],
              syncEarfcn: [{required: true, message: '请输入同步频点', trigger: "blur"},
                {validator: numVal, trigger: "change,blur"}],
              tacPeriod: [{message: '请输入重复抓取时间', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}],
              ccPeriod: [{message: '请输入重复抓取时间', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}]
            };
          }
        } else {//小站
          this.rules = {
            downFrequency: [
              {required: true, message: '请输入下行频点', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}],
            pci: [{required: true, message: '请输入pci', trigger: "blur"}, {validator: pciValid, trigger: "change,blur"}],
            tac: [{required: true, message: '请输入tac', trigger: "blur"}, {validator: hexValid, trigger: "change,blur"}],
            tacPeriod: [{message: '请输入重复抓取时间', trigger: "blur"}, {validator: numVal, trigger: "change,blur"}]
          };
          if (this.getActiveType() === 'M') {
            this.rules = {
              downFrequency: [{required: true, message: '请输入下行频点', trigger: "blur"},
                {validator: numVal, trigger: "change,blur"}],
              pci: [{required: true, message: '请输入pci', trigger: "blur"},
                {validator: pciValid, trigger: "change,blur"}],
              tac: [{required: true, message: '请输入tac', trigger: "blur"},
                {validator: hexValid, trigger: "change,blur"}],
              tacPeriod: [{message: '请输入重复抓取时间', trigger: "blur"},
                {validator: numVal, trigger: "change,blur"}],
              frameOffset: [{required: true, message: '请输入帧偏移', trigger: "blur"},
                {validator: intVal, trigger: "change,blur"}]
            };
          }
        }
        //初始化
        if (this.deviceForm === 'CON_OUTDOOR_POLE') {//大站设备
          if (this.getActiveType() === 'GSM_1' && this.getmoduleID() === 1) {//移动2G
            this.opDeviceParameter = {
              moduleID: this.getmoduleID(), bts: this.getmoduleID(), network: this.getActiveType(), bcc: 1,
              band: this.getBand(), lac: 255, mcc: 460, mnc: 2, rssimin: 80, pci: 0, tac: 0,
              datatag: this.getActiveType(), tacPeriod: '0', ccPeriod: '0'
            };
          } else if (this.getActiveType() === 'GSM_1' && this.getmoduleID() === 2) {//联通2G
            this.opDeviceParameter = {
              moduleID: this.getmoduleID(), bts: this.getmoduleID(), network: this.getActiveType(),
              band: this.getBand(), bcc: 96, lac: 255, mcc: 460, mnc: 1, rssimin: 80, pci: 0, tac: 0,
              datatag: this.getActiveType(), tacPeriod: '0', ccPeriod: '0'
            };
          } else if (this.getActiveType() === 'FDDLTE_2') {//联通4G
            this.opDeviceParameter = {
              moduleID: this.getmoduleID(), bts: this.getmoduleID(), network: this.getActiveType(), bcc: 1200,
              band: this.getBand(), lac: 0, mcc: 460, mnc: 1, pci: 222, tac: 2, datatag: this.getActiveType(),
              frameOffset: 0, tacPeriod: '600', ccPeriod: '0', syncMode: 0, syncEarfcn: 0
            };
          } else if (this.getActiveType() === 'FDDLTE_3') {//电信4G
            this.opDeviceParameter = {
              moduleID: this.getmoduleID(), bts: this.getmoduleID(), network: this.getActiveType(), bcc: 1200, lac: 0,
              band: this.getBand(), mcc: 460, mnc: 11, pci: 223, tac: 3, datatag: this.getActiveType(),
              frameOffset: 0, tacPeriod: '600', ccPeriod: '0', syncMode: 0, syncEarfcn: 0
            };
          } else if (this.getActiveType() === 'TDDLTE_4') {//移动4G38/40
            this.opDeviceParameter = {
              moduleID: this.getmoduleID(), bts: this.getmoduleID(), network: this.getActiveType(), bcc: 37750, lac: 0,
              band: this.getBand(), mcc: 460, mnc: 0, pci: 214, tac: 4, datatag: this.getActiveType(), frameOffset: 0,
              tacPeriod: '600', ccPeriod: '0', syncMode: 0, syncEarfcn: 0
            };
          } else if (this.getActiveType() === 'TDDLTE_5') {//移动4G39
            this.opDeviceParameter = {
              moduleID: this.getmoduleID(), bts: this.getmoduleID(), network: this.getActiveType(), bcc: 38250, lac: 0,
              band: this.getBand(), mcc: 460, mnc: 0, pci: 215, tac: 5, datatag: this.getActiveType(), frameOffset: 0,
              tacPeriod: '600', ccPeriod: '0', syncMode: 0, syncEarfcn: 0
            };
          }
        } else {
          if (this.getActiveType() === 'M') {//移动4G38/40
            this.opDeviceParameter = {
              moduleID: 0, network: 'TDDLTE', band: 38, pci: 5, tac: 1, datatag: 'M', frameOffset: 0,
              tacPeriod: '180', bandWidth: 5, upFrequency: 37900, downFrequency: 37900
            };
          } else if (this.getActiveType() === 'U') {//联通4G
            this.opDeviceParameter = {
              moduleID: 1, network: 'FDDLTE', band: 3, pci: 6, tac: 1, datatag: 'U',
              tacPeriod: '180', bandWidth: 3, upFrequency: 19650, downFrequency: 1650
            };
          } else if (this.getActiveType() === 'T') {//电信4G
            this.opDeviceParameter = {
              moduleID: 2, network: 'FDDLTE', band: 1, pci: 7, tac: 1, datatag: 'T',
              tacPeriod: '180', bandWidth: 3, upFrequency: 18100, downFrequency: 100
            };
          }
        }
        this.defaultHopParam();
        this.powerValue = 0;
        this.wirelessSwitch = false;
        this.paSwitch = false;
      },
      //跳频默认参数
      defaultHopParam() {
        if (this.getActiveType() === 'M') {//移动4G38/40
          this.plmn = '460.00';
          this.down = 37900;
          this.up = 37900;
          this.hopParam = {
            switchtime: 5, redirectEarfcn: 37900, plmn: this.plmn, hopFrequencySwitch: 0,
            freqHopParamArray: [{upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, frameOffset: 0}]
          };
        } else if (this.getActiveType() === 'U') {//联通4G
          this.plmn = '460.01';
          this.down = 1650;
          this.up = 19650;
          this.hopParam = {
            switchtime: 5, redirectEarfcn: 1650, plmn: this.plmn, hopFrequencySwitch: 0,
            freqHopParamArray: [{upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, frameOffset: 0}]
          };
        } else if (this.getActiveType() === 'T') {//电信4G
          this.plmn = '460.11';
          this.down = 100;
          this.up = 18100;
          this.hopParam = {
            switchtime: 5, redirectEarfcn: 100, plmn: this.plmn, hopFrequencySwitch: 0,
            freqHopParamArray: [{upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, frameOffset: 0}]
          };
        } else {
          this.hopParam = {
            switchtime: 5, redirectEarfcn: 0, plmn: this.plmn, hopFrequencySwitch: 0,
            freqHopParamArray: [{upFrequency: 0, downFrequency: 0, plmn: '460.00', frameOffset: 0}]
          };
        }
      },
      getActiveType() {
        for (let item of this.activeName) {
          if (this.activeItem === item.name) {
            return item.type;
          }
        }
      },
      getmoduleID() {
        for (let item of this.activeName) {
          if (this.activeItem === item.name) {
            return item.moduleID;
          }
        }
      },
      getBand() {
        for (let item of this.activeName) {
          if (this.activeItem === item.name) {
            return parseInt(item.band);
          }
        }
      },
      //获取载波参数
      getParam() {
        this.$post('device/get/deviceParameter/' + this.deviceId1, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              if (data.data.subModuleParam && data.data.subModuleParam.length > 0) {
                data.data.subModuleParam.forEach((subModuleParam) => {
                  if (subModuleParam.moduleId == this.getmoduleID()) {
                    if (subModuleParam.wirelessParam) {
                      if (subModuleParam.wirelessParam.moduleID == this.getmoduleID()) {
                        this.opDeviceParameter = subModuleParam.wirelessParam;
                        this.opDeviceParameter.band = parseInt(subModuleParam.wirelessParam.band);
                      }
                    }
                    if (this.deviceForm === 'CON_OUTDOOR_POLE') {//大站
                      this.opDeviceParameter.tacPeriod = subModuleParam.tacPeriod + "";
                    } else {
                      this.opDeviceParameter.tacPeriod = this.opDeviceParameter.tacPeriod + "";
                    }
                    this.hopParam = this.opDeviceParameter.hopParam;
                    this.opDeviceParameter.syncEarfcn = this.opDeviceParameter.syncEarfcn + "";
                    this.opDeviceParameter.ccPeriod = subModuleParam.ccPeriod + "";
                    this.powerValue = subModuleParam.powerValue;
                    this.wirelessSwitch = (subModuleParam.wirelessSwitch == 1);
                    this.paSwitch = (subModuleParam.paSwitch == 1);
                  }
                });
              }
              if (!this.opDeviceParameter.hopParam || this.opDeviceParameter.hopParam == undefined ||
                this.opDeviceParameter.hopParam == null) {
                this.defaultHopParam();
              } else if (!this.opDeviceParameter.hopParam.freqHopParamArray || this.opDeviceParameter.hopParam.freqHopParamArray.length === 0) {
                let arrPra = {
                  switchtime: this.opDeviceParameter.hopParam.switchtime,
                  redirectEarfcn: this.opDeviceParameter.hopParam.redirectEarfcn,
                  plmn: this.opDeviceParameter.hopParam.plmn,
                  hopFrequencySwitch: this.opDeviceParameter.hopParam.hopFrequencySwitch,
                  freqHopParamArray: [{upFrequency: this.up, downFrequency: this.down, plmn: this.plmn, frameOffset: 0}]
                };
                this.hopParam = arrPra;
              }
            }
          }
        })
      },
      //设置无线电开关
      setWirelessSwitch(val) {
        let url = 'set/' + (val ? 'openWirless/' : 'closeWirless/') + this.deviceId1 + "/" + this.getmoduleID();
        this.$post(url, {}, '设置成功', '设置失败');
      },
      //设置功放开关
      setPASwitch(val) {
        let url = 'set/' + (val ? 'openPA/' : 'closePA/') + this.deviceId1 + "/" + this.getmoduleID();
        this.$post(url, {}, '设置成功', '设置失败');
      },
      //设置重复抓取时间
      setRepeatCatch() {
        if (!numValid(this.opDeviceParameter.tacPeriod)) {
          this.$message.error('重复抓取时间只能输入整数');
          return;
        }
        this.$post("set/repeatCatch", {
          deviceId: this.deviceId1,
          subModuleParam: [{tacPeriod: parseInt(this.opDeviceParameter.tacPeriod), moduleId: this.getmoduleID()}]
        }, '设置成功', '设置失败');
      },
      //设置重复抓取时间
      setCCPeriod() {
        if (!numValid(this.opDeviceParameter.ccPeriod)) {
          this.$message.error('重复上报间隔只能输入整数');
          return;
        }
        this.$post("set/ccPeriod", {
          deviceId: this.deviceId1,
          subModuleParam: [{ccPeriod: parseInt(this.opDeviceParameter.ccPeriod), moduleId: this.getmoduleID()}]
        }, '设置成功', '设置失败');
      },
      //设置PA
      setPA(val) {
        this.$post("set/paAtt/", {
          deviceId: this.deviceId1,
          subModuleParam: [{powerValue: val, moduleId: this.getmoduleID()}]
        }, '设置成功', '设置失败');
      },
      //下发参数
      setBaseParam() {
        let forName = 'opDeviceParameter';
        if (this.deviceForm === 'CON_OUTDOOR_MOCRO') {//小站
          this.$refs[forName].validate((valid) => {
            if (valid) {
              this.$confirm('确认下发当前参数？', '提示', {type: 'warning'}).then(() => {
                this.opDeviceParameter.hopParam = this.hopParam;
                if (this.getActiveType() !== 'M') {
                  if (this.opDeviceParameter.hopParam.freqHopParamArray && this.opDeviceParameter.hopParam.freqHopParamArray.length > 0) {
                    this.opDeviceParameter.hopParam.freqHopParamArray.forEach((item) => {
                      delete item['frameOffset'];
                    });
                  }
                }
                this.opDeviceParameter.tacPeriod = parseInt(this.opDeviceParameter.tacPeriod);
                delete this.opDeviceParameter['ccPeriod'];
                this.$post('set/wirelessParam/send/' + this.deviceId1 + '/' + this.deviceForm, this.opDeviceParameter,
                  '命令下发成功').then((data) => {
                  if (data.code === '000000') {
                    this.runStartDevice = true;
                  }
                  this.getParam();
                });
              }).catch(() => {
              });
            }
          });
        } else {//大站
          if (this.changeBcc(this.opDeviceParameter.bcc)) {
            this.$refs[forName].validate((valid) => {
              if (valid) {
                this.$confirm('确认下发当前参数？', '提示', {type: 'warning'}).then(() => {
                  this.opDeviceParameter.tacPeriod = parseInt(this.opDeviceParameter.tacPeriod);
                  this.opDeviceParameter.syncEarfcn = parseInt(this.opDeviceParameter.syncEarfcn);
                  delete this.opDeviceParameter['hopParam'];
                  delete this.opDeviceParameter['ccPeriod'];
                  this.$post('set/wirelessParam/send/' + this.deviceId1 + '/' + this.deviceForm, this.opDeviceParameter,
                    '命令下发成功').then((data) => {
                    if (data.code === '000000') {
                      this.runStartDevice = true;
                    }
                    this.getParam();
                  });
                }).catch(() => {
                });
              }
            });
          }
        }
      },
      //保存/更新参数
      updateParam() {
        let forName = 'opDeviceParameter';
        if (this.deviceForm === 'CON_OUTDOOR_MOCRO') {//小站
          this.$refs[forName].validate((valid) => {
            if (valid) {
              this.opDeviceParameter.hopParam = this.hopParam;
              if (this.getActiveType() !== 'M') {
                if (this.opDeviceParameter.hopParam.freqHopParamArray && this.opDeviceParameter.hopParam.freqHopParamArray.length > 0) {
                  this.opDeviceParameter.hopParam.freqHopParamArray.forEach((item) => {
                    delete item['frameOffset'];
                  });
                }
              }
              this.opDeviceParameter.tacPeriod = parseInt(this.opDeviceParameter.tacPeriod);
              delete this.opDeviceParameter['ccPeriod'];
              this.$post('set/wirelessParam/' + this.deviceId1 + '/' + this.deviceForm, this.opDeviceParameter,
                '修改成功').then((data) => {
                this.getParam();
              });
            }
          });
        } else {
          if (this.changeBcc(this.opDeviceParameter.bcc)) {
            this.$refs[forName].validate((valid) => {
              if (valid) {
                this.opDeviceParameter.tacPeriod = parseInt(this.opDeviceParameter.tacPeriod);
                this.opDeviceParameter.syncEarfcn = parseInt(this.opDeviceParameter.syncEarfcn);
                delete this.opDeviceParameter['ccPeriod'];
                delete this.opDeviceParameter['hopParam'];
                this.$post('set/wirelessParam/' + this.deviceId1 + '/' + this.deviceForm, this.opDeviceParameter,
                  '修改成功').then((data) => {
                  this.getParam();
                });
              }
            });
          }
        }
      },
      //获取设备的基本信息
      getBaseInfo() {
        this.$post("device/get/byDeviceId/" + this.deviceId1, {}).then((data) => {
            if (data.code === '000000') {
              if (data.data) {
                this.deviceForm = data.data.deviceForm;
                if (data.data.deviceForm === 'CON_OUTDOOR_POLE') {//大站设备
                  this.activeName = [];
                  data.data.capabilityInfo.forEach((item) => {
                    let param = {moduleID: item.bts, name: item.name, type: item.network, band: item.band};
                    this.activeName.push(param);
                  });
                  if (this.activeName[0].type.indexOf('GSM') === 0) {
                    this.bands = [{value: 900, label: 900}, {value: 1800, label: 1800}];
                  } else if (this.activeName[0].type.indexOf('TDD') === 0) {
                    this.bands = [{value: 38, label: 38}, {value: 39, label: 39},
                      {value: 40, label: 40}, {value: 41, label: 41}];
                  } else {
                    this.bands = [{value: 1, label: 1}, {value: 3, label: 3}];
                  }
                  this.clear();
                  this.getParam();
                  this.activeItem = this.activeName[0].name;
                  this.opDeviceParameter.moduleID = this.activeName[0].moduleID;
                } else {//小站设备
                  this.activeName = [{moduleID: 0, name: '移动', type: 'M'}, {moduleID: 1, name: '联通', type: 'U'},
                    {moduleID: 2, name: '电信', type: 'T'}];
                  this.clear();
                  this.getParam();
                  this.activeItem = '移动';
                  this.opDeviceParameter.moduleID = 0;
                }
              }
            }
          }
        )
      },
      //重启设备
      restartDevice() {
        this.$post('set/restart/' + this.deviceId1 + '/' + this.deviceForm, {}, "重启命令下发成功");
        this.runStartDevice = false;
      }
    },
    mounted() {
      this.getBaseInfo();
    }
  }
</script>
