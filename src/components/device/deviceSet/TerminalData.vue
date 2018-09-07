<template>
  <div>
    <section class="content">
      <el-form label-width="140px" label-position="left">
        <!--<el-row>-->
        <!--<el-col :span="24" style="text-align: left">-->
        <!--<h4>侦码数据<span style="font-size: 15px;color: #888;margin-left: 10px">设备ID：{{deviceId}}</span></h4>-->
        <!--</el-col>-->
        <!--</el-row>-->
        <h4 style="text-align: left;margin-top: 0" v-show="deviceForm === 'CON_OUTDOOR_POLE'">侦码设置</h4>
        <div class="center-block add-appdiv" v-show="deviceForm === 'CON_OUTDOOR_POLE'">
          <el-row style="margin-left: 20px">
            <el-col :span="11">
              <el-form-item label="侦码" style="margin: 0">
                <el-row>
                  <el-col :span="8" align="left">已开启</el-col>
                </el-row>
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="2">
              <el-form-item label="数据上报时间间隔" style="margin: 0" align="left"
                            v-show="getButtonVial('set:dataUploadPeriod')">
                <el-radio-group v-model="uploadPeriod" @change="setTerminateUploadPeriod">
                  <el-radio-button :label="3">3秒</el-radio-button>
                  <el-radio-button :label="6">6秒</el-radio-button>
                  <el-radio-button :label="10">10秒</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <h4 style="text-align: left;margin-top: 30px">侦码数据
        <span style="color: #666;font-size: 14px;margin-left: 10px">总数{{couple}}条</span>
      </h4>
      <el-row style="margin:0 0 10px 20px">
        <el-col :span="24" align="left">
          <el-input placeholder="终端imsi" v-model="query.imsi" :maxlength="30" size="medium"
                    style="width: 160px;margin-right: 10px;margin-top: 10px"></el-input>
          <el-input placeholder="网络类型" v-model="query.netType" :maxlength="10" size="medium"
                    style="width: 160px;margin-right: 10px;margin-top: 10px"></el-input>
          <el-select v-model="query.isp" placeholder="全部运营商" size="medium" filterable
                     style="width: 150px;margin-right: 10px;margin-top: 10px" clearable>
            <el-option v-for="item in options" :key="item.value" :label="item.label"
                       :value="item.value"></el-option>
          </el-select>
          <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" style="margin-top: 10px;margin-right: 10px"
                          value-format="timestamp" :picker-options="pickerBeginDate" size="medium"
                          :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
          <el-button type="primary" icon="search" style="margin-top: 10px"
                     @click="isSearch = true;getData();getCouple()" size="medium">搜索
          </el-button>
          <el-button style="margin-top: 10px" @click="clearData()" size="medium">清除</el-button>
        </el-col>
      </el-row>
      <el-table :data="list10" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="deviceId" label="设备ID" min-width="100" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="imei" label="IMEI" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="tmsi" label="TMSI" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="uptime" label="抓取时间" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="isp" label="运营商" max-width="150" min-width="100"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="netType" label="网络类型" max-width="150" min-width="100"></el-table-column>
        <el-table-column align="left" label="归属地" max-width="200" min-width="150" prop="regional"
                         :formatter="formatterAddress"></el-table-column>
      </el-table>

      <div class="block" style="margin-top: 20px">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
    </section>
  </div>
</template>

<script>
  import json from '../../../assets/city.json';
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        deviceId: this.$route.query.deviceId || '',
        deviceForm: this.$route.query.deviceForm || '',
        groupId: this.$route.query.groupId || '',
        dataUploadSwitch: false,
        criminalCodeSwitch: false,
        uploadPeriod: 6,
        count: 0,
        list: [],
        list10: [],
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        couple: 0,
        query: {
          size: 100, deviceId: this.deviceId, groupId: this.groupId, isp: '',
          netType: '', imsi: ''
        },
        cTime: '',
        ccPeriod: 10,
        terminalPA: 20,
        intervalid: null,
        options: [{value: '', label: '全部运营商'}, {value: '2', label: '电信'}, {value: '0', label: '移动'},
          {value: '1', label: '联通'}],
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date().getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        }
      }
    },
    //页面关闭时停止刷新
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      getData() {
        if (this.query.imsi) {
          if (!/[0-9]$/.test(this.query.imsi)) {
            this.$message.error('请输入正确的imsi');
            return;
          }
        }
        if (this.query.netType) {
          if (!/[a-zA-Z0-9]$/.test(this.query.netType)) {
            this.$message.error('请输入正确的网络类型');
            return;
          }
        }
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startUploadTime = this.cTime[0] / 1000;
          this.query.endUploadTime = this.cTime[1] / 1000;
        }
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          this.query.uptime = '';
          this.isSearch = false;
        }
        this.$post("/terminate/queryNoCount", this.query).then((data) => {
          if (this.query.uptime && !this.isSearch) {
            this.list = this.list.concat(data.data);
          } else {
            this.list = data.data;
            this.page = 1;
            this.firstPage = 0
          }
          this.list10 = this.list;
          if (this.list.length - this.page * 10 >= 0) {
            this.list10 = this.list10.slice((this.page * 10 - 10), (this.page * 10));
          } else {
            this.list10 = this.list10.slice((this.page * 10 - 10), this.list.length);
          }
          this.count = this.list.length;
          if (this.list.length - this.firstPage === 100) {
            this.isFirst = false;
          } else {
            this.isFirst = true;
          }
        }).catch((err) => {
          this.list = [];
          this.list10 = [];
          this.$message.error(err);
        });
      },
      clearData() {
        this.query = {
          size: 100, deviceId: this.deviceId, groupId: this.groupId, isp: '', netType: '', imsi: ''
        };
        this.cTime = '';
        this.cTime = '';
        this.isSearch = true;
        this.getData();
        this.getCouple();
      },
      //分页
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst &&
          (this.list.length % 100 === 0 || this.list.length === this.couple)) {
          this.firstPage = this.list.length;
          this.query.uptime = this.list[this.list.length - 1].uptime / 1000;
          this.getData();
          this.getCouple();
        }
        this.list10 = this.list;
        if ((this.list.length - (index * 10)) >= 0) {
          this.list10 = this.list10.slice((index * 10 - 10), (index * 10));
        } else {
          this.list10 = this.list10.slice((index * 10 - 10), this.list.length);
        }
      },
      handleSizeChange(val) {
//        this.query.size = val;
      },
      //查找侦码总数
      getCouple() {
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startUploadTime = this.cTime[0] / 1000;
          this.query.endUploadTime = this.cTime[1] / 1000;
        }
        let cQuery = {
          isp: this.query.isp, deviceId: this.deviceId, netType: this.query.netType,
          imsi: this.query.imsi, groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.$post('/terminate/findCount', cQuery).then((data) => {
          this.couple = data.data;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //数据上报开关
      setDataUploadSwitch(val) {
        this.$post("set/dataUpload/" + this.deviceId + '/' + this.dataUploadSwitch, {}, '设置成功');
      },
      //侦码开关
      setCriminalCodeSwitch() {
        this.$post("device/update/criminalCodeSwitch/" + this.deviceId + '/' + this.criminalCodeSwitch, {}, '设置成功');
      },
      //侦码数据上报时间
      setTerminateUploadPeriod() {
        this.$post("set/dataUploadPeriod/", {deviceId: this.deviceId, dataUpPeriod: this.uploadPeriod}, '设置成功');
      },
      //设置侦码间隔时间
      setCCPeriod() {
        this.$post("set/ccPeriod/", {deviceId: this.deviceId, ccPeriod: this.ccPeriod}, '设置成功');
      },
      getDeviceSwitch() {
        this.$post('device/get/deviceParameter/' + this.deviceId).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              this.dataUploadSwitch = (data.data.dataUpSwitch == 1);
              this.criminalCodeSwitch = data.data.ccSwitch;
              this.uploadPeriod = data.data.dataUpPeriod;
              this.ccPeriod = data.data.ccPeriod;
            }
          }
        })
      }
    },
    mounted() {
      let device = this.$emit('getDevice');
      this.deviceId = this.$route.query.deviceId || device.deviceId || '';
      this.deviceForm = this.$route.query.deviceForm || device.deviceForm || '';
      this.groupId = this.$route.query.groupId || device.groupId || '';
      this.query.deviceId = this.deviceId;
      this.query.groupId = this.groupId;
      this.getData();
      this.getDeviceSwitch();
      this.getCouple();
    }
  }
</script>
