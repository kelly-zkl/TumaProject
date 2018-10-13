<template>
  <div>
    <section class="content">
      <el-form ref="collision" :model="collision">
        <h5 class="add-label" style="margin-top: 0">关联案件</h5>
        <div class="add-appdiv">
          <el-form-item label="设置案件" align="left" style="margin:0" prop="caseId">
            <el-select v-model="collision.caseId" placeholder="选择案件" filterable clearable>
              <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="add-appdiv" style="margin-top:30px">
          <el-form-item label="任务名称" align="left">
            <el-input v-model="collision.taskName" placeholder="请输入任务名称" style="width: 300px" :maxlength=20></el-input>
          </el-form-item>
          <el-form-item label="任务类型" align="left">
            <el-radio-group v-model="collisionType" @change="changeType">
              <el-radio label="IMSI">IMSI</el-radio>
              <!--<el-radio label="FACE">图像</el-radio>-->
              <!--<el-radio label="MAC">MAC</el-radio>-->
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <h5 class="add-label">设置碰撞条件</h5>
      <div class="center-block add-appdiv">
        <el-row :gutter="30">
          <el-col :span="11">
            <h6 style="background: #CCC;text-align: left;margin: 0;padding: 10px 20px">条件1</h6>
            <el-form label-position="right" label-width="80px" ref="param1" :model="param1"
                     style="margin: 0;background: #F2F2F2;padding: 10px;height: 200px">
              <el-form-item label="方式" align="left" style="margin: 0">
                <el-radio-group v-model="param1.dataFromMode" size="medium">
                  <el-radio-button label="QUERY">输入条件</el-radio-button>
                  <el-radio-button label="COLLISION_RESULT">选择历史任务</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="设备" align="left" style="margin: 10px 0 0 0" v-show="param1.dataFromMode == 'QUERY'">
                <el-select v-model="param1.deviceId" placeholder="请选择设备" size="medium"
                           v-if="collisionType == 'FACE'" multiple collapse-tags>
                  <el-option v-for="item in cameras" :key="item.cameraCode" :label="item.name" :value="item.cameraCode">
                  </el-option>
                </el-select>
                <el-select v-model="param1.deviceId" placeholder="请选择设备" size="medium" v-else multiple collapse-tags>
                  <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceName"
                             :value="item.deviceId">
                  </el-option>
                </el-select>
                <el-button type="primary" size="medium" @click="selectDevice('data1')" style="margin-left: 10px">地图选择
                </el-button>
              </el-form-item>
              <el-form-item label="日期" align="left" style="margin: 10px 0 0 0" v-show="param1.dataFromMode == 'QUERY'">
                <el-date-picker v-model="date1" type="datetimerange" range-separator="至" style="width: 300px"
                                value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期"
                                :default-time="['00:00:00', '23:59:59']" format="yyyy-MM-dd">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="时段" align="left" style="margin: 10px 0 0 0" v-show="param1.dataFromMode == 'QUERY'">
                <el-time-picker is-range v-model="time1" range-separator="至" start-placeholder="开始时间"
                                style="width: 300px" value-format="HH:mm:ss" end-placeholder="结束时间"
                                placeholder="选择时间范围">
                </el-time-picker>
              </el-form-item>
              <el-form-item label="任务" align="left" style="margin: 10px 0 0 0"
                            v-show="param1.dataFromMode == 'COLLISION_RESULT'">
                <el-select v-model="param1.collisionTaskId" placeholder="请选择任务" size="medium">
                  <el-option v-for="item in records" :key="item.id" :label="item.taskName" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="11" style="background: #fff">
            <h6 style="background: #CCC;text-align: left;margin: 0;padding: 10px 20px">条件2</h6>
            <el-form label-position="right" label-width="80px" ref="param2" :model="param2"
                     style="margin:0;background: #F2F2F2;padding: 10px;height: 200px">
              <el-form-item label="方式" align="left" style="margin: 0">
                <el-radio-group v-model="param2.dataFromMode" size="medium">
                  <el-radio-button label="QUERY">输入条件</el-radio-button>
                  <el-radio-button label="COLLISION_RESULT">选择历史任务</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="设备" align="left" style="margin: 10px 0 0 0" v-show="param2.dataFromMode == 'QUERY'">
                <el-select v-model="param2.deviceId" placeholder="请选择设备" size="medium"
                           v-if="collisionType == 'FACE'" multiple collapse-tags>
                  <el-option v-for="item in cameras" :key="item.cameraCode" :label="item.name" :value="item.cameraCode">
                  </el-option>
                </el-select>
                <el-select v-model="param2.deviceId" placeholder="请选择设备" size="medium" v-else multiple collapse-tags>
                  <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceName"
                             :value="item.deviceId">
                  </el-option>
                </el-select>
                <el-button type="primary" size="medium" @click="selectDevice('data2')" style="margin-left: 10px">地图选择
                </el-button>
              </el-form-item>
              <el-form-item label="日期" align="left" style="margin: 10px 0 0 0" v-show="param2.dataFromMode == 'QUERY'">
                <el-date-picker v-model="date2" type="datetimerange" range-separator="至" style="width: 300px"
                                value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期"
                                :default-time="['00:00:00', '23:59:59']" format="yyyy-MM-dd">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="时段" align="left" style="margin: 10px 0 0 0" v-show="param2.dataFromMode == 'QUERY'">
                <el-time-picker is-range v-model="time2" range-separator="至" start-placeholder="开始时间"
                                value-format="HH:mm:ss" end-placeholder="结束时间" placeholder="选择时间范围"
                                style="width: 300px">
                </el-time-picker>
              </el-form-item>
              <el-form-item label="任务" align="left" style="margin: 10px 0 0 0"
                            v-show="param2.dataFromMode == 'COLLISION_RESULT'">
                <el-select v-model="param2.collisionTaskId" placeholder="请选择任务" size="medium">
                  <el-option v-for="item in records" :key="item.id" :label="item.taskName" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-form style="margin-top: 10px">
          <el-form-item label="数据组合方式" align="left" style="margin: 0">
            <el-radio-group v-model="collision.collisionMode" size="medium">
              <el-radio-button label="INTERSECT">交集</el-radio-button>
              <el-radio-button label="UNION">并集</el-radio-button>
              <el-radio-button label="SUBTRACT">差集</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <div class="block" style="margin-top: 30px">
        <el-button type="primary" @click="createTask()">确认创建</el-button>
      </div>
      <!--在地图上选择设备-->
      <el-dialog title="选择设备" :visible.sync="mapVisible">
        <DeviceBmap @getDeviceList="getDeviceList" v-bind:deviceData="deviceData"></DeviceBmap>
        <div class="block" style="margin-top: 20px">
          <el-button @click="mapVisible = false">取消</el-button>
          <el-button type="primary" @click="setDeviceList">确定</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>

<script>
  import {isNull} from "../../../assets/js/api";
  import DeviceBmap from '../DeviceBmap';

  export default {
    data() {
      return {
        mapVisible: false,
        collisionType: 'IMSI',
        collision: {taskName: '', collisionMode: "INTERSECT", caseId: ""},
        param1: {dataFromMode: "QUERY"},
        param2: {dataFromMode: "QUERY"},
        deviceList: [],
        cameras: [],
        records: [],
        cases: [],
        date1: '',
        time1: '',
        date2: '',
        time2: '',
        returnData: {},
        deviceData: '',
      }
    },
    methods: {
      //地图选择设备，显示dialog
      selectDevice(val) {
        let param = {deviceType: this.collisionType, dataType: val};
        console.log(param);
        this.deviceData = JSON.stringify(param);
        this.mapVisible = true;
      },
      //地图选择设备
      setDeviceList() {
        if (this.returnData.dataType == 'data1') {
          this.param1.deviceId = this.returnData.deviceList;
        } else {
          this.param2.deviceId = this.returnData.deviceList;
        }
        this.mapVisible = false;
      },
      //获得地图选择的设备
      getDeviceList(data) {
        this.returnData = data;
        // console.log(data);
      },
      changeType(val) {
        this.getTasks();
        if (val === 'IMSI') {
          this.getDevice();
        } else {
          this.getCameras();
        }
      },
      //创建碰撞任务
      createTask() {
        if (this.collision.caseId.length === 0) {
          this.$message.error('请选择关联案件');
          return;
        }
        if (this.collision.taskName.length === 0) {
          this.$message.error('请输入任务名称');
          return;
        }
        this.collision.collisionType = [this.collisionType];

        if (this.judgeParam1()) {
          if (this.param1.dataFromMode === 'QUERY') {
            this.param1.startDate = this.date1[0] / 1000;
            this.param1.endDate = this.date1[1] / 1000;
            this.param1.startTimeInterval = this.time1[0];
            this.param1.endTimeInterval = this.time1[1];
          }
        } else {
          this.$message.error('请完善任务1的条件信息');
          return;
        }

        if (this.judgeParam2()) {
          if (this.param2.dataFromMode === 'QUERY') {
            this.param2.startDate = this.date2[0] / 1000;
            this.param2.endDate = this.date2[1] / 1000;
            this.param2.startTimeInterval = this.time2[0];
            this.param2.endTimeInterval = this.time2[1];
          }
        } else {
          this.$message.error('请完善任务2的条件信息');
          return;
        }

        this.collision.param1 = this.param1;
        this.collision.param2 = this.param2;
        this.collision.caseName = this.getCaseName();
        console.log(this.collision);
        this.$post('/collision/add', this.collision, "创建成功").then((data) => {
          if ("000000" === data.code)
            this.$router.go(-1);
        }).catch((err) => {
        });
      },
      //判断条件1  任务1的条件
      judgeParam1() {
        let bol = true;
        if (this.param1.dataFromMode === 'QUERY') {
          if (isNull(this.date1) && isNull(this.time1) && isNull(this.param1.deviceId)) {
            bol = false;
          }
        } else {
          if (isNull(this.param1.collisionTaskId)) {
            this.$message.error('请选择条件1的历史任务');
            bol = false;
          }
        }
        return bol;
      },
      //任务2的条件判断
      judgeParam2() {
        let bol = true;
        if (this.param2.dataFromMode === 'QUERY') {
          if (isNull(this.date2) && isNull(this.time2) && isNull(this.param2.deviceId)) {
            bol = false;
          }
        } else {
          if (isNull(this.param2.collisionTaskId)) {
            this.$message.error('请选择条件2的历史任务');
            bol = false;
          }
        }
        return bol;
      },
      //获取全部相机设备
      getCameras() {
        this.$post('camera/query', {page: 1, size: 999999}).then((data) => {
          this.cameras = data.data.list;
        }).catch((err) => {
          this.cameras = [];
        });
      },
      //获取设备列表
      getDevice() {
        this.$post("device/query", {page: 1, size: 999999}).then((data) => {
          this.deviceList = data.data.list;
        }).catch((err) => {
          this.deviceList = [];
        });
      },
      //获取碰撞任务列表
      getTasks() {
        this.$post('/collision/query',
          {page: 1, size: 999999999, taskStatus: 'FINISH', ctype: this.collisionType}).then((data) => {
          this.records = data.data.list;
        }).catch((err) => {
          this.records = [];
        });
      },
      //获取案件列表
      getCases() {
        this.$post('/case/query', {page: 1, size: 999999}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      //获取案件名称
      getCaseName() {
        for (let item of this.cases) {
          if (item.id === this.collision.caseId) {
            return item.caseName;
          }
        }
      },
    },
    mounted() {
      this.getDevice();
      this.getCameras();
      this.getTasks();
      this.getCases();
    },
    components: {
      DeviceBmap
    }
  }
</script>
