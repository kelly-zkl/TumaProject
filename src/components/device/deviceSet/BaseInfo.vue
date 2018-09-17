<template>
  <div>
    <section>
      <el-form label-width="120px" label-position="left" ref="deviceMonitor" :rules="rules" :model="deviceMonitor">
        <div class="content add-appdiv">
          <el-form-item label="设备编号（ID）" style="text-align: left">{{deviceMonitor.deviceId}}</el-form-item>
          <el-form-item label="设备名称" style="text-align: left" prop="deviceName">
            <el-input v-model="deviceMonitor.deviceName" placeholder="请输入设备名称" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item style="text-align: left" label="设备类型">
            <el-select v-model="deviceMonitor.deviceType" placeholder="请选择" style="width:250px" filterable>
              <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="text-align: left" label="设备形态">
            <el-select v-model="deviceMonitor.deviceForm" placeholder="请选择" style="width:250px" filterable>
              <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="安装地址" required>
            <el-row>
              <el-col :span="8" style="margin-right: 15px">
                <el-cascader expand-trigger="hover" :options="provinceList" v-model="selectedOptions2"
                             :props="props" @change="areaChange" style="width: 100%" filterable>
                </el-cascader>
              </el-col>
              <el-col :span="15">
                <el-input v-model="deviceMonitor.detailAddress" placeholder="请输入详细地址，例：某大厦x楼/某小区x房间号"
                          :maxlength=50></el-input>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="经纬度">
            <el-row>
              <el-col :span="10" style="margin-right: 15px">
                <el-input v-model="deviceMonitor.devicePos.longitude" readonly>
                  <template slot="prepend">经度</template>
                </el-input>
              </el-col>
              <el-col :span="10" style="margin-right: 15px">
                <el-input v-model="deviceMonitor.devicePos.latitude" readonly>
                  <template slot="prepend">纬度</template>
                </el-input>
              </el-col>
              <el-col :span="3">
                <el-button type="primary" @click="selectAdd()">地图选址</el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="高度（米）" prop="height">
            <el-input v-model="deviceMonitor.devicePos.height" placeholder="请输入高度" :maxlength=5
                      @change="checkHeight" @keypress.enter.native="keypre2()">
            </el-input>
          </el-form-item>
          <el-form-item style="text-align: left" label="场所类型" prop="serviceType">
            <el-select v-model="deviceMonitor.serviceType" placeholder="请选择" @change="typeChange"
                       style="width:250px" filterable>
              <el-option v-for="item in serviceTypes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="场所编码" required>
            <el-row>
              <el-col :span="10" style="margin-right: 10px">
                <el-input v-model="placeCode" readonly></el-input>
              </el-col>
              <el-col :span="10">
                <el-tooltip placement="bottom">
                  <div slot="content">4位场所编码</div>
                  <el-input v-model="numberCode" :maxlength=4></el-input>
                </el-tooltip>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="数据卡电话号码" prop="phoneNumber">
            <el-input v-model="deviceMonitor.phoneNumber" placeholder="请输入数据卡电话号码" :maxlength=11
                      @change="changePhone"></el-input>
          </el-form-item>
          <el-form-item label="MAC地址" prop="mac" style="text-align: left">
            {{deviceMonitor.mac ? deviceMonitor.mac : "未上报"}}
          </el-form-item>
          <el-form-item label="回传方式" prop="mac" style="text-align: left;margin: 0">
            {{deviceMonitor.backNet ? deviceMonitor.backNet === '3G' ? '3G' : '网线' : "未上报"}}
          </el-form-item>
        </div>
        <div class="center-block add-appdiv">
          <el-form-item label="远程隧道" v-show="getButtonVial('set:remoteSwitch:*')" align="left">
            <el-button type="primary" @click="tunnelVisible=true;getRemote()" size="medium">设置</el-button>
          </el-form-item>
          <el-form-item label="公钥" style="text-align: left;margin: 0">
            <span
              style="word-wrap:break-word;word-break:break-all;overflow:hidden">{{deviceMonitor.pubkey ? deviceMonitor.pubkey : '--'}}</span>
          </el-form-item>
          <el-form-item style="text-align: left">
            <el-button v-clipboard:copy="deviceMonitor.pubkey" v-clipboard:success="onCopy" size="medium"
                       v-show="deviceMonitor.pubkey" v-clipboard:error="onError" type="primary" plain>复制
            </el-button>
          </el-form-item>
          <el-form-item label="重置激活状态" v-show="getButtonVial('device:set:unactive')" style="text-align: left;margin: 0">
            <el-button @click="unActive()" size="medium" type="primary">重置
            </el-button>
          </el-form-item>
        </div>
        <div class="center-block add-appdiv">
          <el-form-item label="版本信息" style="text-align: left;margin: 0">
            <div v-if="deviceMonitor.deviceForm==='CON_OUTDOOR_POLE'">
              <el-row>
                <el-col :span="18">
                  <span v-if="!isDetail">{{versions.softVersion}}</span>
                  <span v-else
                        style="white-space: pre-wrap;overflow:hidden">{{versions.detailVersion}}</span>
                </el-col>
                <el-col :span="6">
                  <el-button size="medium" type="primary" @click="getVersions();isDetail=!isDetail"
                             v-show="getButtonVial('version:sendQueryVersion')">查看详细
                  </el-button>
                </el-col>
              </el-row>
              <!--<span v-show="versions.cliVersion">-->
              <!--{{'cliVersion：' + versions.cliVersion}}</span>-->
              <!--<br v-show="versions.cliVersion"/>-->
              <!--<span v-show="versions.ltedetectorVersion">-->
              <!--{{'ltedetectorVersion：' + versions.ltedetectorVersion}}</span>-->
              <!--<br v-show="versions.ltedetectorVersion"/>-->
              <!--<span v-show="versions.postdemoVersion">-->
              <!--{{'postdemoVersion：' + versions.postdemoVersion}}</span>-->
              <!--<br v-show="versions.postdemoVersion"/>-->
              <!--<span v-show="versions.ifAppVersion">-->
              <!--{{'ifAppVersion：' + versions.ifAppVersion}}</span>-->
              <!--<br v-show="versions.ifAppVersion"/>-->
              <!--<span v-show="versions.fddLtedemoVersion">-->
              <!--{{'fddLtedemoVersion：' + versions.fddLtedemoVersion}}</span>-->
              <!--<br v-show="versions.fddLtedemoVersion"/>-->
              <!--<span v-show="versions.fddLtecapVersion">-->
              <!--{{'fddLtecapVersion：' + versions.fddLtecapVersion}}</span>-->
              <!--<br v-show="versions.fddLtecapVersion"/>-->
              <!--<span v-show="versions.fddEnodebVersion">-->
              <!--{{'fddEnodebVersion：' + versions.fddEnodebVersion}}</span>-->
              <!--<br v-show="versions.fddEnodebVersion"/>-->
              <!--<span v-show="versions.tddLtedemoVersion">-->
              <!--{{'tddLtedemoVersion：' + versions.tddLtedemoVersion}}</span>-->
              <!--<br v-show="versions.tddLtedemoVersion"/>-->
              <!--<span v-show="versions.tddLtecapVersion">-->
              <!--{{'tddLtecapVersion：' + versions.tddLtecapVersion}}</span>-->
              <!--<br v-show="versions.tddLtecapVersion"/>-->
              <!--<span v-show="versions.tddEnodebVersion">-->
              <!--{{'tddEnodebVersion：' + versions.tddEnodebVersion}}</span>-->
              <!--<br v-show="versions.tddEnodebVersion"/>-->
              <!--<span v-show="versions.gsmDemoVersion">-->
              <!--{{'gsmDemoVersion：' + versions.gsmDemoVersion}}</span>-->
              <span
                v-show="!versions.cliVersion && !versions.ltedetectorVersion && !versions.postdemoVersion &&
                !versions.ifAppVersion && !versions.fddLtedemoVersion && !versions.fddLtecapVersion &&
                !versions.fddEnodebVersion && !versions.tddLtedemoVersion &&!versions.tddLtecapVersion &&
                !versions.tddEnodebVersion && !versions.gsmDemoVersion && !versions.detailVersion &&
                !versions.softVersion">未上报</span>
            </div>
            <div v-else>
              <span v-show="versions.deviceVersion">
                {{'deviceVersion：' + versions.deviceVersion}}</span>
              <br v-show="versions.deviceVersion"/>
              <span v-show="versions.softVersion">
                {{'softVersion：' + versions.softVersion}}</span>
              <span v-show="!versions.deviceVersion && !versions.softVersion">未上报</span>
            </div>
          </el-form-item>
        </div>
        <div class="center-block add-appdiv">
          <el-form-item label="所属组织" style="text-align: left;margin: 0">
            <el-select v-model="deviceMonitor.groupId" placeholder="请选择所属组织" filterable>
              <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div>
        <el-button type="primary" @click="updateBaseInfo" v-show="getButtonVial('device:modify:baseinfo')">保存
        </el-button>
        <el-button type="primary" @click="setBaseParam" v-show="getButtonVial('device:sendBaseInfo') &&
           deviceMonitor.deviceForm==='CON_OUTDOOR_POLE'">参数下发
        </el-button>
      </div>
    </section>
    <!--选择安装地址--》地图-->
    <el-dialog title="" :visible.sync="mapVisible" :width="dialogWidth">
      <MapView @getLocation="getLocation" v-bind:formattedAddress="getAddress"></MapView>
      <div class="block" style="margin-top: 20px">
        <el-button @click="mapVisible = false">取消</el-button>
        <el-button type="primary" @click="setLocation">确定</el-button>
      </div>
    </el-dialog>

    <!--远程隧道-->
    <el-dialog title="远程隧道设置" :visible.sync="tunnelVisible" :width="tunneldialogWidth">
      <el-form ref="tunnel" :rules="rules1" :model="tunnel" label-position="right" :label-width="labelWidth">
        <el-form-item label="用户名" align="left" prop="login_user">
          <el-input v-model="tunnel.login_user" :maxlength="30"></el-input>
        </el-form-item>
        <el-form-item label="服务器IP" prop="server_ip">
          <el-input v-model="tunnel.server_ip" :maxlength="15"></el-input>
        </el-form-item>
        <el-form-item label="服务器端口" prop="server_port">
          <el-input v-model="tunnel.server_port" :maxlength="15"></el-input>
        </el-form-item>
        <el-form-item label="远程隧道端口" prop="tunnel_port">
          <el-input v-model="tunnel.tunnel_port" :maxlength="15"></el-input>
        </el-form-item>
        <el-form-item label="远程隧道开关" align="left" required>
          <el-switch v-model="tunnel.tunnelSwitch" active-color="#59aaf4" inactive-color="#C1C1C1"
                     active-value="on" inactive-value="off" @change="changeSwitch"></el-switch>
        </el-form-item>
        <el-form-item label="重置公钥" align="left" required>
          <el-switch v-model="tunnel.sshKeyGenSwitch" active-color="#59aaf4" inactive-color="#C1C1C1"
                     active-value="on" inactive-value="off"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center" v-show="getButtonVial('device:get:remoteTunnel:*')">
        <el-button @click="tunnelVisible = false">取消</el-button>
        <el-button type="primary" @click="setRemoteSwitch()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import json from '../../../assets/city.json';
  import MapView from './BMap';
  import axios from "axios";
  import {ipValid, numValid, mobileValidator, noSValidator} from '../../../assets/js/api'
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    props: ['deviceId'],
    data() {
      let numValidator = (rule, value, callback) => {
        if (!numValid(value)) {
          callback(new Error("只能输入数字"));
        } else {
          callback();
        }
      };
      let ipValidator = (rule, value, callback) => {
        if (!ipValid(value)) {
          callback(new Error("请输入正确的IP"));
        } else {
          callback();
        }
      };
      let devValidator = (rule, value, callback) => {
        if (noSValidator(value)) {
          callback(new Error("请输入正确的设备名称，由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        dialogWidth: isPC() ? '50%' : '90%',
        tunneldialogWidth: isPC() ? '35%' : '90%',
        labelWidth: isPC() ? '120px' : '110px',
        props: {value: 'o', label: 'n', children: 'c'},
        selectedOptions2: [],
        position: {},
        getAddress: '',
        code: '',
        provinceList: json,
        mapVisible: false,
        isDetail: false,
        tunnelVisible: false,
        runningStatusVisible: false,
        tunnel: {tunnelSwitch: "off", sshKeyGenSwitch: "off"},
        deviceMonitor: {
          serviceType: '', versions: {cliVersion: '', softVersion: ''},
          devicePos: {height: '', longitude: '', latitude: ''}
        },
        rules: {
          serviceType: [{required: true, message: '请选择场所类型', trigger: 'blur'}],
          deviceName: [
            {required: true, message: '请输入设备名称', trigger: 'blur', maxlength: 20},
            {validator: devValidator, trigger: "change,blur"}
          ],
        },
        rules1: {
          server_ip: [{required: true, message: '请输入服务器IP', trigger: 'blur'},
            {validator: ipValidator, trigger: "change,blur"}],
          server_port: [{required: true, message: '请输入服务器端口', trigger: 'blur'},
            {validator: numValidator, trigger: "change,blur"}],
          tunnel_port: [{required: true, message: '请输入远程隧道端口', trigger: 'blur'},
            {validator: numValidator, trigger: "change,blur"}],
          login_user: [{required: true, message: '请输入用户名', trigger: 'blur'}]
        },
        deviceId1: this.deviceId,
        deviceForms: [],
        deviceTypes: [],
        groups: [],
        versions: {},
        placeCode: '',
        numberCode: '',
        serviceTypes: [{value: '0', label: '网吧'}, {value: '1', label: '旅店宾馆类（住宿服务场所）'},
          {value: '2', label: '图书馆阅览室'}, {value: '3', label: '电脑培训中心类'}, {value: '4', label: '娱乐场所类'},
          {value: '5', label: '交通枢纽'}, {value: '6', label: '公共交通工具'}, {value: '7', label: '餐饮服务场所'},
          {value: '8', label: '金融服务场所'}, {value: 'A', label: '购物场所'}, {value: 'B', label: '公共服务场所'},
          {value: 'C', label: '文化服务场所'}, {value: 'D', label: '公共休闲场所'}, {value: '9', label: '其他'}]
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
      this.getDeviceTypeAndForm();
      this.getBaseInfo();
    },
    methods: {
      //设备状态-->未激活
      unActive() {
        this.$confirm('确认修改设备状态为未激活？', '提示', {type: 'warning'}).then(() => {
          this.$post("/device/set/unactive/" + this.deviceMonitor.deviceId, {}, '命令下发成功').then((data) => {
          })
        }).catch(() => {
        });
      },
      //复制成功
      onCopy(val) {
        this.$message({message: '复制成功', type: 'success'});
      },
      //复制失败
      onError(val) {
        this.$message.error("复制失败");
      },
      changeSwitch(val) {
        console.log(val);
        console.log(this.tunnel.tunnelSwitch);
      },
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      changePhone(val) {
        let isVaild = true;
        if (val) {
          if (!mobileValidator(val)) {
            this.$message.error('请输入正确的号码');
            isVaild = false;
          }
        }
        return isVaild;
      },
      keypre2() {
        let event = arguments.callee.caller.arguments[0] || window.event;//消除浏览器差异
        return ((event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 46);
      },
      //只能输入小数点后2位--》高度
      checkHeight(value) {//^[0-9]+(\.[0-9]{1,3})?$
        let reg = /^[1-9][0-9]*\.\d{2}$|^[0]\.\d{1,2}$/g;
        if (value) {
          if (new RegExp(reg).test(value) === false) {
            value = value.replace(reg, "");
          }
        }
      },
      //地图选址，显示dialog
      selectAdd() {
        // if (!this.code) {
        //   this.$message.error('请选择省市区');
        //   return;
        // }
        // if (this.code) {
        //   if (this.deviceMonitor.detailAddress) {
        //     this.getAddress = this.getAreaLable(this.code) + this.deviceMonitor.detailAddress;
        //   } else {
        //     this.getAddress = this.getAreaLable(this.code);
        //   }
        // }
        this.getAddress = this.selectedOptions2;
        this.mapVisible = true;
      },
      //地图选址完成设置经纬度
      setLocation() {
        this.deviceMonitor.devicePos.longitude = this.position.lng;
        this.deviceMonitor.devicePos.latitude = this.position.lat;
        this.deviceMonitor.detailAddress = this.position.detailAddress;
        this.selectedOptions2 = this.getCode(this.position.code);
        this.mapVisible = false;
      },
      //获得地图选择的经纬度
      getLocation(pos) {
        this.position = pos;
//        console.log(pos);
      },
      //获取设备的基本信息
      getBaseInfo() {
        this.versionStr = '未上报';
        this.selectedOptions2 = [];
        this.$post("device/get/byDeviceId/" + this.deviceId1, {}).then((data) => {
            if (data.code === '000000') {
              if (data.data) {
                this.deviceMonitor = data.data;

                if (!data.data.devicePos) {
                  this.deviceMonitor.devicePos = {height: '', longitude: '', latitude: ''}
                }
                if (!data.data.versions) {
                  this.versions = {cliVersion: '', softVersion: ''}
                } else {
                  this.versions = data.data.versions;
                }

                //场所编码
                if (data.data.serviceCode) {
                  this.placeCode = data.data.serviceCode.substring(0, 10);
                  this.numberCode = data.data.serviceCode.substring(data.data.serviceCode.length - 4, data.data.serviceCode.length);
                }

                if (data.data.areaCode) {
                  this.selectedOptions2 = this.getCode(data.data.areaCode);
                  this.code = data.data.areaCode;
                } else if (data.data.cityCode) {
                  this.selectedOptions2 = this.getCode(data.data.cityCode);
                  this.code = data.data.cityCode;
                } else if (data.data.provinceCode) {
                  this.selectedOptions2 = this.getCode(data.data.provinceCode);
                  this.code = data.data.provinceCode;
                } else {
                  this.selectedOptions2 = [];
                  this.code = '';
                }
              }
            }
          }
        )
      },
      //获取远程隧道参数
      getRemote() {
        this.tunnel = {tunnelSwitch: "off", sshKeyGenSwitch: "off"};
        this.$post('/device/get/remoteTunnel/' + this.deviceId1, {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              if (!data.data.sshKeyGenSwitch) {
                data.data.sshKeyGenSwitch = 'off';
              }
              if (!data.data.tunnelSwitch) {
                data.data.tunnelSwitch = 'off';
              }
              this.tunnel = data.data;
            }
          }
        })
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then(
          (data) => {
            if (data.code === '000000' && data.data) {
              this.deviceTypes = data.data;
            }
          });

        this.$post('device/get/deviceForm').then(
          (data) => {
            if (data.code === '000000' && data.data) {
              this.deviceForms = data.data;
            }
          });
      },
      //根据区域码找到对应的省市县
      getCode(code) {
        json.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {
                city.c.forEach((country) => {
                  if (code === country.o) {
                    this.selectedOptions2 = [province.o, city.o, country.o];
                  }
                })
              } else {
                if (code === city.o) {
                  this.selectedOptions2 = [province.o, city.o];
                }
              }
            })
          } else {
            if (code === province.o) {
              this.selectedOptions2 = [province.o];
            }
          }
        });
        return this.selectedOptions2;
      },
      //设置远程隧道
      setRemoteSwitch() {
        this.$refs['tunnel'].validate((valid) => {
          if (valid) {
            this.$confirm('确认下发远程隧道参数？', '提示', {type: 'warning'}).then(() => {
              this.$post("/set/remoteSwitch/" + this.deviceMonitor.deviceId, this.tunnel, '设置成功').then((data) => {
                this.tunnelVisible = false;
              });
            }).catch(() => {
            });
          }
        })
      },
      //修改设备参数
      updateBaseInfo() {
        if (this.selectedOptions2.length === 0) {
          this.$message.error('请选择安装地址省市区');
          return;
        }
        if (!this.deviceMonitor.serviceType) {
          this.$message.error('请选择场所类型');
          return;
        }
        if (this.numberCode.length !== 4 || !numValid(this.numberCode)) {
          this.$message.error('场所编码需手动输入4位数字');
          return;
        }
        if (this.deviceMonitor.phoneNumber) {
          if (!this.changePhone(this.deviceMonitor.phoneNumber)) {
            return;
          }
        }
        this.getScode(this.selectedOptions2);
        this.deviceMonitor.serviceCode = this.placeCode + this.numberCode;
        this.$refs['deviceMonitor'].validate((valid) => {
          if (valid) {
            this.$post("device/modify/baseinfo", this.deviceMonitor, '修改成功').then((data) => {
              this.getBaseInfo();
            })
          }
        });
      },
      //省市区
      getScode(value) {
        if (value.length === 1) {
          this.deviceMonitor.provinceCode = value[0];
        } else if (value.length === 2) {
          this.deviceMonitor.provinceCode = value[0];
          this.deviceMonitor.cityCode = value[1];
        } else if (value.length === 3) {
          this.deviceMonitor.provinceCode = value[0];
          this.deviceMonitor.cityCode = value[1];
          this.deviceMonitor.areaCode = value[2];
        }
      },
      //省市县变化
      areaChange(value) {
        this.selectedOptions2 = value;
        if (value.length === 1) {
          this.code = value[0];
        } else if (value.length === 2) {
          this.code = value[1];
        } else if (value.length === 3) {
          this.code = value[2];
        }
        if (this.deviceMonitor.serviceType) {
          this.placeCode = this.code + '8' + this.deviceMonitor.serviceType + '01';
        } else {
          this.placeCode = this.code + '801';
        }
      },
      //场所类型的选择
      typeChange(value) {
        //value为场所类型
        this.deviceMonitor.serviceType = value;
        if (this.deviceMonitor.serviceType) {
          this.placeCode = this.code + '8' + this.deviceMonitor.serviceType + '01';
        } else {
          this.placeCode = this.code + '801';
        }
      },
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {//省级+市级+县级
                city.c.forEach((country) => {
                  if (code === country.o) {
                    lable = province.n + city.n + country.n;
                  }
                })
              } else {//省级+市级
                if (code === city.o) {
                  lable = province.n + city.n;
                }
              }
            })
          } else {//只包含省级
            if (code === province.o) {
              lable = province.n;
            }
          }
        });
        return lable;
      },
      //下发参数
      setBaseParam() {
        this.deviceMonitor.areaCodeVal = this.getAreaLable(this.deviceMonitor.areaCode);
        if (this.deviceMonitor.phoneNumber) {
          if (!this.changePhone(this.deviceMonitor.phoneNumber)) {
            return;
          }
        }
        this.$confirm('确认下发当前参数？', '提示', {type: 'warning'}).then(() => {
          this.$post("/device/sendBaseInfo", this.deviceMonitor, '命令下发成功').then((data) => {
          })
        }).catch(() => {
        });
      },
      //获取全部组织列表
      getAllGroups() {
        this.$post('/manager/group/query', {
          page: 1, size: 9999,
          userId: JSON.parse(sessionStorage.getItem("user")).userId
        }).then((data) => {
          this.groups = data.data.content;
        }).catch((err) => {
          this.groups = [];
        });
      },
      //获取版本信息
      getVersions() {
        this.$post('/version/sendQueryVersion/' + this.deviceId1 + '/' + this.$route.query.deviceForm, {}).then((data) => {
          this.getBaseInfo();
        }).catch((err) => {
        });
      }
    },
    mounted() {
      this.getAllGroups();
      this.getRemote();
      this.getBaseInfo();
    },
    components: {
      MapView
    }
  }
</script>

