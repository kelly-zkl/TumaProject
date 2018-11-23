<template>
  <div>
    <section class="content">
      <el-form ref="collision" :model="collision" label-position="left" label-width="100px" :rules="rules">
        <h5 class="add-label" style="margin-top: 0">任务基本信息</h5>
        <div class="add-appdiv">
          <el-form-item label="任务名称" align="left" prop="taskName">
            <el-input v-model="collision.taskName" placeholder="请输入任务名称" style="width: 300px" :maxlength=20></el-input>
          </el-form-item>
          <!--<el-form-item label="任务类型" align="left">-->
          <!--<el-radio-group v-model="collisionType" @change="changeType">-->
          <!--<el-radio label="IMSI">IMSI</el-radio>-->
          <!--<el-radio label="FACE">图像</el-radio>-->
          <!--<el-radio label="MAC">MAC</el-radio>-->
          <!--</el-radio-group>-->
          <!--</el-form-item>-->
          <el-form-item label="设置案件" align="left" style="margin:0" prop="caseId">
            <el-select v-model="collision.caseId" placeholder="选择案件" filterable clearable>
              <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="任务类型" align="left" style="margin:15px 0 0 0" prop="conditionType">
            <el-radio-group v-model="collision.conditionType">
              <el-radio :label="0">多条件碰撞</el-radio>
              <el-radio :label="1">单条件碰撞</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <h5 class="add-label">设置碰撞条件</h5>
      <div class="center-block add-appdiv">
        <el-row :gutter="20">
          <el-col :xl="10" :lg="11" :md="11" :sm="11" :xs="11">
            <h6 style="background: #CCC;text-align: left;margin: 0;padding: 10px 20px">条件1</h6>
            <el-form label-position="right" label-width="60px" ref="param1" :model="param1"
                     style="margin: 0;background: #F2F2F2;padding: 10px;height: 200px">
              <el-form-item label="方式" align="left" style="margin: 0">
                <el-radio-group v-model="param1.dataFromMode" size="medium">
                  <el-radio-button label="QUERY">输入条件</el-radio-button>
                  <el-radio-button label="COLLISION_RESULT" :disabled="collision.conditionType==1">选择历史任务
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="设备" align="left" style="margin: 10px 0 0 0" v-show="param1.dataFromMode == 'QUERY'">
                <el-select v-model="param1.deviceId" placeholder="请选择设备" size="medium"
                           v-if="collisionType == 'FACE'" multiple collapse-tags clearable>
                  <el-option v-for="item in cameras" :key="item.cameraCode" :label="item.name" :value="item.cameraCode">
                  </el-option>
                </el-select>
                <el-select v-model="param1.deviceId" placeholder="请选择设备" size="medium" v-else
                           multiple collapse-tags clearable>
                  <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceName"
                             :value="item.deviceId">
                  </el-option>
                </el-select>
                <el-button type="primary" size="medium" style="margin-left: 10px" @click="showDialog(1)">选择
                </el-button>
                <el-button type="primary" size="medium" @click="selectDevice('data1')">地图选择
                </el-button>
              </el-form-item>
              <el-form-item label="日期" align="left" required style="margin: 10px 0 0 0"
                            v-show="param1.dataFromMode == 'QUERY'">
                <el-tooltip effect="dark" content="日期范围不能超过7天" placement="bottom">
                  <el-date-picker v-model="date1" type="datetimerange" range-separator="至" style="width: 300px"
                                  value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期"
                                  :default-time="['00:00:00', '23:59:59']" format="yyyy-MM-dd"
                                  :picker-options="pickerBeginDate">
                  </el-date-picker>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="时段" align="left" style="margin: 10px 0 0 0" v-show="param1.dataFromMode == 'QUERY'">
                <el-time-picker is-range v-model="time1" range-separator="至" start-placeholder="开始时间"
                                style="width: 300px" value-format="HH:mm:ss" end-placeholder="结束时间"
                                placeholder="选择时间范围">
                </el-time-picker>
              </el-form-item>
              <el-form-item align="left" v-show="param1.dataFromMode == 'QUERY'">
                <span style="font-size:13px;color: #999">(时段非必选，默认为全天24小时)</span>
              </el-form-item>
              <el-form-item label="任务" align="left" style="margin: 10px 0 0 0"
                            v-show="param1.dataFromMode == 'COLLISION_RESULT'">
                <el-select v-model="param1.collisionTaskId" placeholder="请选择任务" size="medium">
                  <el-option v-for="item in records" :key="item.id" :label="item.taskName" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :lg="2" :xl="2" :md="2" :sm="2" :xs="2" v-show="collision.conditionType==0">
            <el-tooltip class="item" effect="dark" placement="bottom">
              <div slot="content">交集：条件1的记录与条件2的记录里都出现的IMSI<br/>
                并集：条件1的记录与条件2的记录里分别出现的IMSI<br/>差集：条件1的记录里出现，条件2的记录里未出现的IMSI
              </div>
              <el-radio-group v-model="collision.collisionMode" size="medium">
                <el-radio-button label="INTERSECT">交集</el-radio-button>
                <el-radio-button label="UNION">并集</el-radio-button>
                <el-radio-button label="SUBTRACT">差集</el-radio-button>
              </el-radio-group>
            </el-tooltip>
          </el-col>
          <el-col :xl="10" :lg="11" :md="2" :sm="2" :xs="2" style="background: #fff"
                  v-show="collision.conditionType==0">
            <h6 style="background: #CCC;text-align: left;margin: 0;padding: 10px 20px">条件2</h6>
            <el-form label-position="right" label-width="60px" ref="param2" :model="param2"
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
                <el-button type="primary" size="medium" style="margin-left: 10px" @click="showDialog(2)">选择
                </el-button>
                <el-button type="primary" size="medium" @click="selectDevice('data2')" style="margin-left: 10px">地图选择
                </el-button>
              </el-form-item>
              <el-form-item label="日期" align="left" required style="margin: 10px 0 0 0"
                            v-show="param2.dataFromMode == 'QUERY'">
                <el-tooltip effect="dark" content="日期范围不能超过7天" placement="bottom">
                  <el-date-picker v-model="date2" type="datetimerange" range-separator="至" style="width: 300px"
                                  value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期"
                                  :default-time="['00:00:00', '23:59:59']" format="yyyy-MM-dd"
                                  :picker-options="pickerBeginDate">
                  </el-date-picker>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="时段" align="left" style="margin: 10px 0 0 0" v-show="param2.dataFromMode == 'QUERY'">
                <el-time-picker is-range v-model="time2" range-separator="至" start-placeholder="开始时间"
                                value-format="HH:mm:ss" end-placeholder="结束时间" placeholder="选择时间范围"
                                style="width: 300px">
                </el-time-picker>
              </el-form-item>
              <el-form-item align="left" v-show="param2.dataFromMode == 'QUERY'">
                <span style="font-size:13px;color: #999">(时段非必选，默认为全天24小时)</span>
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
      </div>
      <div class="block" style="margin-top: 30px">
        <el-button type="primary" @click="createTask()">确认创建</el-button>
      </div>
      <!--在地图上选择设备-->
      <div class="device">
        <el-dialog title="选择设备" :visible.sync="mapVisible" width="90%">
          <DeviceBmap @getDeviceList="getDeviceList" v-bind:deviceData="deviceData" ref="map"></DeviceBmap>
          <div class="block" style="margin-top: 20px">
            <el-button @click="mapVisible = false">取消</el-button>
            <el-button type="primary" @click="setDeviceList">确定</el-button>
          </div>
        </el-dialog>
      </div>
      <!--选择设备-->
      <el-dialog title="选择设备" :visible.sync="dialogDevice" width="80%">
        <el-form :inline="true" :model="query" align="left" style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-input placeholder="设备标识/ID" v-model="query.deviceName" :maxlength="30" size="medium"></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.deviceType" placeholder="全部类型" size="medium" filterable clearable>
              <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.deviceForm" placeholder="全部形态" size="medium" filterable clearable>
              <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input placeholder="安装场所" v-model="query.placeName" :maxlength="30" size="medium"></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" @click.stop="query.page=1;getData()" size="medium">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button @click.stop="clearData()" size="medium">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table ref="deviceTable" :data="device1" v-loading="listLoading" class="center-block"
                  @selection-change="selsChange" stripe>
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备标识" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="placeName" label="安装场所" min-width="110" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceTypeVal" label="类型" min-width="110" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceFormVal" label="形态" min-width="125" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="detailAddress" label="位置" min-width="125" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px">
          <el-pagination
            @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page" background
            :page-sizes="[10, 15, 20, 30]" :page-size="query.size" layout="total, sizes, prev, pager, next, jumper"
            :total="count"></el-pagination>
        </div>
        <div class="block" style="margin-top: 20px">
          <el-button type="primary" @click="confirmChoose()" :disabled="sels.length == 0">确认选择</el-button>
        </div>
      </el-dialog>
      <!--选择设备-->
      <el-dialog title="选择设备" :visible.sync="dialogCamera" width="80%">
        <el-form :inline="true" :model="query" align="left" style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.cameraCode" placeholder="相机编码" size="medium" :maxlength=30></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input placeholder="安装场所" v-model="query.placeName" :maxlength="30" size="medium"></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="query.page=1;getData1()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="cameras1" v-loading="listLoading" class="center-block" @selection-change="selsChange" stripe>
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="相机编码" prop="cameraCode" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="name" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="相机状态" prop="status" width="100"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="安装地区" prop="areaCode" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="详细地址" prop="detailAddress" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="安装场所" prop="placeName" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
        <div class="block" style="margin-top: 20px">
          <el-button type="primary" @click="confirmChoose()" :disabled="sels.length == 0">确认选择</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>

<script>
  import {isNull} from "../../../assets/js/api";
  import DeviceBmap from '../DeviceBmap';
  import json from '../../../assets/city.json';
  import {globalValidExcel, noSValidator, noValidator} from "../../../assets/js/api";

  export default {
    data() {
      return {
        dialogDevice: false,
        dialogCamera: false,
        props: {value: 'o', label: 'n', children: 'c'},
        areaList: [],
        provinceList: json,
        mapVisible: false,
        collisionType: 'IMSI',
        collision: {taskName: '', collisionMode: "INTERSECT", caseId: "", conditionType: 0},
        param1: {dataFromMode: "QUERY"},
        param2: {dataFromMode: "QUERY"},
        deviceList: [],
        cameras: [],
        records: [],
        cases: [],
        device1: [],
        cameras1: [],
        date1: '',
        time1: ['00:00:00', '23:59:59'],
        date2: '',
        time2: ['00:00:00', '23:59:59'],
        returnData: {},
        deviceData: '',
        listLoading: false,
        query: {page: 1, size: 10},
        count: 0,
        deviceTypes: [],
        places: [],
        deviceForms: [],
        sels: [],
        dataType: 1,
        rules: {
          caseId: [
            {required: true, message: '请选择案件', trigger: 'blur'}
          ],
          conditionType: [
            {required: true, message: '请选择任务类型', trigger: 'blur'}
          ],
          taskName: [
            {required: true, message: '请输入任务名称', trigger: 'blur'}
          ]
        },
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
    methods: {
      //地图选择设备，显示dialog
      selectDevice(val) {
        let param = {deviceType: this.collisionType, dataType: val};
        console.log(param);
        this.deviceData = JSON.stringify(param);
        this.mapVisible = true;
        // this.$refs.map.clearArea();
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
        if (this.collision.taskName.length === 0) {
          this.$message.error('请输入任务名称');
          return;
        }
        if (this.collision.caseId.length === 0) {
          this.$message.error('请选择关联案件');
          return;
        }
        this.collision.collisionType = [this.collisionType];

        if (this.judgeParam1()) {
          if (this.param1.dataFromMode === 'QUERY') {
            if (this.date1) {
              this.param1.startDate = this.date1[0] / 1000;
              this.param1.endDate = this.date1[1] / 1000;
              let bol = ((this.param1.endDate - this.param1.startDate) > 60 * 60 * 24 * 7);
              if (bol) {
                this.$message.error('条件1：日期范围不能超过7天');
                return;
              }
            }
            if (this.time1) {
              this.param1.startTimeInterval = this.time1[0];
              this.param1.endTimeInterval = this.time1[1];
            }
          }
        } else {
          this.$message.error('请完善任务1的条件信息');
          return;
        }

        if (this.collision.conditionType == 0) {//多条件碰撞
          if (this.judgeParam2()) {
            if (this.param2.dataFromMode === 'QUERY') {
              if (this.date2) {
                this.param2.startDate = this.date2[0] / 1000;
                this.param2.endDate = this.date2[1] / 1000;
                let bol = ((this.param2.endDate - this.param2.startDate) > 60 * 60 * 24 * 7);
                if (bol) {
                  this.$message.error('条件2：日期范围不能超过7天');
                  return;
                }
              }
              if (this.time2) {
                this.param2.startTimeInterval = this.time2[0];
                this.param2.endTimeInterval = this.time2[1];
              }
            }
          } else {
            this.$message.error('请完善任务2的条件信息');
            return;
          }
          this.collision.param2 = this.param2;
        } else {
          delete this.collision['collisionMode'];
        }

        this.collision.param1 = this.param1;
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
          if (!this.date1 || (isNull(this.time1) && isNull(this.param1.deviceId))) {
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
          if (!this.date2 || (isNull(this.time2) && isNull(this.param2.deviceId))) {
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
        this.$post('/case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
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
      //设备当前页全选
      selsChange(sels) {
        this.sels = sels;
        console.log(sels);
      },
      confirmChoose() {
        if (this.collisionType == 'IMSI') {
          let arr = [];
          this.sels.forEach((item) => {
            arr.push(item.deviceId)
          });
          if (this.dataType == 1) {
            this.param1.deviceId = arr;
          } else {
            this.param2.deviceId = arr;
          }
        } else {
          let arr = [];
          this.sels.forEach((item) => {
            arr.push(item.cameraCode)
          });
          if (this.dataType == 1) {
            this.param1.deviceId = arr;
          } else {
            this.param2.deviceId = arr;
          }
        }
        this.dialogCamera = false;
        this.dialogDevice = false;
      },
      showDialog(val) {
        this.dataType = val;
        this.query = {page: 1, size: 10};
        this.sels = [];
        this.areaList = [];
        if (this.collisionType == 'IMSI') {
          this.getData();
          this.dialogDevice = true;
        } else {
          this.getData1();
          this.dialogCamera = true;
        }
      },
      //获取设备列表
      getData() {
        if (this.query.deviceName) {
          if (noSValidator(this.query.deviceName)) {
            this.$message.error('请输入正确的设备标识/ID');
            return;
          }
        }
        this.listLoading = true;
        this.$post("device/query", this.query).then((data) => {
          this.device1 = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.device1 = [];
          this.$message.error(err);
        });
      },
      //获取相机设备列表
      getData1() {
        if (this.query.cameraCode) {
          if (noSValidator(this.query.cameraCode)) {
            this.$message.error('请输入正确的相机编码');
            return;
          }
        }
        this.listLoading = true;

        this.$post("camera/query", this.query).then((data) => {
          this.cameras1 = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.cameras1 = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        if (this.collisionType == 'IMSI') {
          this.getData();
        } else {
          this.getData1();
        }
      },
      handleSizeChange(val) {
        this.query.size = val;
        if (this.collisionType == 'IMSI') {
          this.getData();
        } else {
          this.getData1();
        }
      },
      //搜索设备列表
      clearData() {
        this.query = {page: 1, size: 10};
        this.areaList = [];
        if (this.collisionType == 'IMSI') {
          this.getData();
        } else {
          this.getData1();
        }
      },
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        this.query.provinceCode = '';
        this.query.cityCode = '';
        this.query.areaCode = '';
        if (value.length === 1) {
          this.query.provinceCode = value[0];
        } else if (value.length === 2) {
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.areaCode = value[2];
        } else if (value.length === 4) {
          this.query.areaCode = value[2];
        }
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceTypes = data.data;
          }
        });

        this.$post('device/get/deviceForm').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceForms = data.data;
          }
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row.status === 0 ? '正常' : row.status === 1 ? '故障' : row.status === 2 ? '已下线' : '--';
        } else if (column.property === 'areaCode') {
          return row.areaCode ? this.getAreaLable(row.areaCode) : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
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
    },
    mounted() {
      this.getDevice();
      this.getCameras();
      this.getDeviceTypeAndForm();
      this.getTasks();
      this.getCases();
    },
    components: {
      DeviceBmap
    }
  }
</script>
