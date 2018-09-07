<template>
  <div>
    <section class="content">
      <el-tabs v-model="logSet.moduleId" @tab-click="handleClick">
        <el-tab-pane :label="tab.name" v-for="tab in activeName" :key="tab.moduleID" :name="tab.moduleID"></el-tab-pane>
      </el-tabs>
      <el-form ref="logSet" label-width="140px" label-position="left" :rules="rules" :model="logSet">
        <div class="add-appdiv">
          <el-form-item label="路径" align="left" style="margin: 0" prop="logPath">
            <el-radio-group v-model="logSet.logPath" align="left">
              <el-radio :label="0">tmpfs</el-radio>
              <el-radio :label="1">flash</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="压缩路径" align="left" style="margin: 0" prop="logPath">
            <el-radio-group v-model="logSet.oldDir" align="left">
              <el-radio :label="0">tmpfs</el-radio>
              <el-radio :label="1">flash</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <el-row>
          <el-col :span="24" style="text-align: left">
            <h4>模块等级</h4>
          </el-col>
        </el-row>
        <div class="add-appdiv">
          <el-row>
            <el-col :span="8">
              <el-form-item label="公共模块" align="left" prop="publicLevel">
                <el-select v-model="logSet.publicLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="告警模块" align="left" prop="alarmLevel">
                <el-select v-model="logSet.alarmLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="升级模块" align="left" prop="upgradeLevel">
                <el-select v-model="logSet.upgradeLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="参数配置模块" align="left" prop="paramLevel">
                <el-select v-model="logSet.paramLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="抓号模块" align="left" prop="imsiLevel">
                <el-select v-model="logSet.imsiLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="zlog 模块" align="left" prop="zlogLevel">
                <el-select v-model="logSet.zlogLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="3G 模块" align="left" prop="rilLevel">
                <el-select v-model="logSet.rilLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="wifi 探针模块" align="left" prop="wifiLevel">
                <el-select v-model="logSet.wifiLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="lmt模块" align="left" prop="lmtLevel">
                <el-select v-model="logSet.lmtLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="调试模块" align="left" prop="debugLevel">
                <el-select v-model="logSet.debugLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="网络通信模块" align="left" prop="networkLevel">
                <el-select v-model="logSet.networkLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="反向隧道模块" align="left" prop="tunnelLevel">
                <el-select v-model="logSet.tunnelLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="时间模块" align="left" prop="timeLevel">
                <el-select v-model="logSet.timeLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="子卡通信模块" align="left" prop="subcardLevel">
                <el-select v-model="logSet.subcardLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="软件加密模块" align="left" prop="encryptLevel">
                <el-select v-model="logSet.encryptLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="phy 模块" align="left" prop="phyLevel">
                <el-select v-model="logSet.phyLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="om 通信模块" align="left" prop="omCommLevel">
                <el-select v-model="logSet.omCommLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="enb_deamon通信" align="left" prop="enbCommLevel">
                <el-select v-model="logSet.enbCommLevel">
                  <el-option v-for="item in levels" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div class="block" style="margin-top: 30px">
        <el-button @click="saveParam()" type="primary" v-show="getButtonVial('set:log:sendParam')">下发</el-button>
        <el-button @click="queryParam()" type="primary">查询参数</el-button>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 0,
        deviceId: this.$route.query.deviceId || '',
        deviceForm: this.$route.query.deviceForm || '',
        activeName: [{moduleID: '0', name: '移动'}, {moduleID: '1', name: '联通'}, {moduleID: '2', name: '电信'}],
        logSet: {
          moduleId: '0', oldDir: 0, logPath: 0, publicLevel: 0, alarmLevel: 0, upgradeLevel: 0, paramLevel: 0,
          imsiLevel: 0, zlogLevel: 0, rilLevel: 0, wifiLevel: 0, lmtLevel: 0, debugLevel: 0, networkLevel: 0,
          tunnelLevel: 0, timeLevel: 0, subcardLevel: 0, encryptLevel: 0, phyLevel: 0, omCommLevel: 0,
          enbCommLevel: 0
        },
        params: {},
        levels: [{label: 'DEBUG', value: 0}, {label: 'INFO', value: 1}, {label: 'NOTICE', value: 2},
          {label: 'WARN', value: 3}, {label: 'ERROR', value: 4}, {label: 'FATAL', value: 5}],
        rules: {
          oldDir: [{required: true, message: '请选择压缩路径', trigger: 'blur'}],
          logPath: [{required: true, message: '请选择路径', trigger: 'blur'}],
          publicLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          alarmLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          upgradeLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          paramLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          imsiLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          zlogLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          rilLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          wifiLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          lmtLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          debugLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          networkLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          tunnelLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          timeLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          subcardLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          encryptLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          phyLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          omCommLevel: [{required: true, message: '请选择', trigger: 'blur'}],
          enbCommLevel: [{required: true, message: '请选择', trigger: 'blur'}]
        }
      }
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      handleClick(tab, event) {
        this.getModelParam();
      },
      //保存日志设置
      saveParam() {
        this.$refs['logSet'].validate((valid) => {
          if (valid) {
            this.logSet.deviceId = this.deviceId;
//            this.logSet.moduleId = parseInt(this.logSet.moduleId);
            this.$post('/set/log/sendParam/' + this.deviceForm, this.logSet, '保存成功', '保存失败');
          }
        });
      },
      //获取日志参数
      getModelParam() {
        this.$post('/set/log/getParam', {deviceId: this.deviceId, moduleId: this.logSet.moduleId}).then((data) => {
          this.logSet = data.data ? data.data : this.getDefault();
          this.logSet.moduleId = this.logSet.moduleId + '';
        }).catch((err) => {
          this.logSet = this.getDefault();
        });
      },
      //下发查询参数
      queryParam() {
        this.$post('/set/log/sendQueryParam/' + this.deviceForm, {
          deviceId: this.deviceId,
          moduleId: this.logSet.moduleId
        }).then((data) => {
          this.getModelParam();
        }).catch((err) => {
        });
      },
      getDefault() {
        let tab = this.logSet.moduleId;
        this.logSet = {
          oldDir: 0, logPath: 0, publicLevel: 0, alarmLevel: 0, upgradeLevel: 0, paramLevel: 0,
          imsiLevel: 0, zlogLevel: 0, rilLevel: 0, wifiLevel: 0, lmtLevel: 0, debugLevel: 0, networkLevel: 0,
          tunnelLevel: 0, timeLevel: 0, subcardLevel: 0, encryptLevel: 0, phyLevel: 0, omCommLevel: 0,
          enbCommLevel: 0, moduleId: tab
        };
        return this.logSet;
      }
    },

    mounted() {
      let device = this.$emit('getDevice');
      this.deviceId = this.$route.query.deviceId || device.deviceId || '';
      this.deviceForm = this.$route.query.deviceForm || device.deviceForm || '';
      this.getModelParam();
    }
  }
</script>
