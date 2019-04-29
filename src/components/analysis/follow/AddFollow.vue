<template>
  <div>
    <section class="content">
      <el-form ref="followTask" :model="followTask" label-position="right" label-width="120px" :rules="rules">
        <h5 class="add-label" style="margin:10px 0">任务基本信息</h5>
        <div class="add-appdiv" style="padding: 20px 0">
          <el-form-item label="任务名称" align="left" prop="taskName">
            <el-input v-model="followTask.taskName" placeholder="请输入任务名称" style="width: 400px" :maxlength=30></el-input>
          </el-form-item>
          <!--<el-form-item label="任务类型" align="left" prop="followType">-->
          <!--<el-radio-group v-model="followTask.followType">-->
          <!--<el-radio label="IMSI">IMSI</el-radio>-->
          <!--<el-radio label="FACE">人脸</el-radio>-->
          <!--<el-radio label="MAC">MAC</el-radio>-->
          <!--</el-radio-group>-->
          <!--</el-form-item>-->
          <el-form-item label="关联案件" align="left" style="margin:0" prop="caseId">
            <el-select v-model="followTask.caseId" placeholder="选择案件" filterable clearable>
              <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <h5 class="add-label" style="margin:10px 0">设置伴随条件</h5>
        <div class="add-appdiv" style="padding: 20px 0">
          <el-form-item label="分析对象" align="left" prop="followTarget">
            <el-input v-model="followTask.followTarget" placeholder="输入IMSI"
                      style="width: 400px" :maxlength=15 v-if="followTask.followType == 'IMSI'"></el-input>
            <img :src="imgUrl" v-if="imgUrl && followTask.followType == 'FACE'"
                 style="max-width: 90px;max-height:90px;border-radius: 6px">
            <el-button type="primary" v-if="followTask.followType == 'FACE'"
                       @click="runTranslation=true;query={page: 1, size: 10};getData()">选择档案人员
            </el-button>
          </el-form-item>
          <el-form-item label="出现设备" align="left">
            <el-select v-model="followTask.deviceId" placeholder="请选择设备" size="medium"
                       v-if="followTask.followType == 'FACE'" multiple collapse-tags>
              <el-option v-for="item in cameras" :key="item.cameraCode" :label="item.name" :value="item.cameraCode">
              </el-option>
            </el-select>
            <el-select v-model="followTask.deviceId" placeholder="请选择设备" size="medium" v-else multiple
                       collapse-tags :filter-method="pinyinMatch" filterable clearable>
              <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceName"
                         :value="item.deviceId">
              </el-option>
            </el-select>
            <el-button type="primary" size="medium" style="margin-left: 10px" @click="showDialog()">选择
            </el-button>
            <el-button type="primary" size="medium" @click="selectDevice()" style="margin-left: 10px">地图选择</el-button>
          </el-form-item>
          <el-form-item label="日期范围" align="left" required>
            <el-tooltip effect="dark" content="日期范围不能超过7天" placement="bottom">
              <el-date-picker v-model="qTime" type="daterange" range-separator="至"
                              start-placeholder="开始日期" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate" @change="handleChange">
              </el-date-picker>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="伴随时间间隔" align="left" prop="interval" style="margin: 0">
            <el-tooltip class="item" effect="dark" placement="bottom">
              <div slot="content">伴随时间间隔是指，在采集IMSI的时间点,<br/>前后n秒内采集的其它IMSI，都可视为伴随IMSI</div>
              <el-input v-model.number="followTask.interval" placeholder="请输入时间间隔" type="number"
                        style="width: 400px" :maxlength=5>
                <template slot="append">秒</template>
              </el-input>
            </el-tooltip>
          </el-form-item>
        </div>
        <el-form-item align="left" style="text-align: left">
          <el-button type="primary" @click="createFollowTask()">{{taskId.length>0?'确认修改':'确认创建'}}</el-button>
        </el-form-item>
      </el-form>
      <!--档案列表-->
      <el-dialog title="选择档案人员" :visible.sync="runTranslation" center>
        <div class="block">
          <el-table :data="vipList" v-loading="listLoading" class="center-block" stripe
                    highlight-current-row @current-change="handleCurrentChange">
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="人员编号" prop="personCode" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="人员图像" prop="faceUrl" min-width="150"
                             max-width="250" :formatter="formatterAddress">
              <template slot-scope="scope">
                <div style="height: 90px;line-height:90px">
                  <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath" :onerror="img404"
                       style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="left" label="关联IMSI[置信度]" prop="imsiList" min-width="220" max-width="250">
              <template slot-scope="scope">
                <div v-for="item in scope.row.imsiList">
                  <span>{{item.imsi}}<span
                    style="color:#000;font-weight: bold">[{{(item.weight/10).toFixed(1)}}%]</span></span>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="left" label="姓名" prop="name" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="手机号" prop="mobilePhone" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="身份证号" prop="idCard" min-width="170"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="建档时间" prop="createTime" min-width="170"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
          </el-table>
          <div class="block" style="margin-top: 20px" align="right">
            <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                           :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                           layout="total, sizes, prev, pager, next, jumper"></el-pagination>
          </div>
        </div>
      </el-dialog>
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
        <el-form :inline="true" :model="queryDevice" align="left" style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-input placeholder="设备标识/ID" v-model="queryDevice.deviceName" :maxlength="30" size="medium"></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryDevice.deviceType" placeholder="全部类型" size="medium" filterable clearable>
              <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryDevice.deviceForm" placeholder="全部形态" size="medium" filterable clearable>
              <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryDevice.placeId" placeholder="场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" @click.stop="queryDevice.page=1;getData1()" size="medium">搜索</el-button>
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
            @size-change="handleSizeChange1" @current-change="pageChange1" :current-page.sync="queryDevice.page"
            background
            :page-sizes="[10, 15, 20, 30]" :page-size="queryDevice.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="countDevice"></el-pagination>
        </div>
        <div class="block" style="margin-top: 20px">
          <el-button type="primary" @click="confirmChoose()" :disabled="sels.length == 0">确认选择</el-button>
        </div>
      </el-dialog>
      <!--选择设备-->
      <el-dialog title="选择设备" :visible.sync="dialogCamera" width="80%">
        <el-form :inline="true" :model="queryDevice" align="left" style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryDevice.cameraCode" placeholder="相机编码" size="medium" :maxlength=30></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryDevice.placeId" placeholder="场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="queryDevice.page=1;getData2()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData1()">重置</el-button>
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
          <el-pagination @size-change="handleSizeChange1" @current-change="pageChange1"
                         :current-page.sync="queryDevice.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="queryDevice.size" :total="countDevice" background
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
  import DeviceBmap from '../DeviceBmap';
  import {noSValidator} from "../../../assets/js/api";
  import {formatDate, getAreaLable, encryData, decryData} from "../../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      let noValidator = (rule, value, callback) => {
        if (!/[0-9]{15}$/.test(value)) {
          callback(new Error("请输入正确的IMSI"));
        } else {
          callback();
        }
      };
      return {
        runTranslation: false,
        listLoading: false,
        mapVisible: false,
        query: {page: 1, size: 10},
        taskId: this.$route.query.id || '',
        followTask: {followType: "IMSI", interval: 120},
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        cases: [],
        tasks: [{value: "IMSI", label: "IMSI"}],
        qTime: '', deviceList: [], deviceListCopy: [], imgUrl: '', returnData: {},
        deviceData: '',
        count: 0,
        vipList: [],
        cameras: [],
        rules: {
          caseId: [{required: true, message: '请选择案件', trigger: 'blur'}],
          followTarget: [
            {required: true, message: '请输入IMSI', trigger: 'blur'},
            {validator: noValidator, trigger: "change,blur"}
          ],
          followType: [{required: true, message: '请选择任务类型', trigger: 'blur'}],
          interval: [{required: true, message: '请输入时间间隔', trigger: 'blur'}],
          taskName: [{required: true, message: '请输入任务名称', trigger: 'blur'}]
        },
        dialogDevice: false,
        dialogCamera: false,
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        areaList: [],
        device1: [],
        cameras1: [],
        queryDevice: {page: 1, size: 10},
        countDevice: 0,
        deviceTypes: [],
        places: [],
        deviceForms: [],
        sels: [],
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        }
      }
    },
    methods: {
      //首字母搜索
      pinyinMatch(val) {
        if (val) {
          var result = [];
          this.deviceListCopy.forEach((item) => {
            var m = PinyinMatch.match(item.deviceName, val);
            if (m) {
              result.push(item);
            }
          });
          this.deviceList = result;
        } else {
          this.deviceList = this.deviceListCopy;
        }
      },
      //获取伴随详情
      getTaskDetail() {
        this.$post('/follow/get/' + this.taskId, {}).then((data) => {
          this.qTime = [data.data.startDate * 1000, data.data.endDate * 1000];
          this.followTask = data.data;
        }).catch((err) => {
        });
      },
      handleChange(val) {
        if (val && val.length == 2) {
          let bol = ((val[1] - val[0]) > 60 * 60 * 24 * 7 * 1000);
          if (bol) {
            this.$message.error('日期范围不能超过7天');
            return;
          }
        }
      },
      //地图选择设备，显示dialog
      selectDevice() {
        let param = {deviceType: this.followTask.followType, dataType: 'data1'};
        console.log(param);
        this.deviceData = JSON.stringify(param);
        this.mapVisible = true;
        // this.$refs.map.clearArea();
      },
      //地图选择设备
      setDeviceList() {
        if (this.returnData.dataType == 'data1') {
          this.followTask.deviceId = this.returnData.deviceList;
        }
        this.mapVisible = false;
      },
      //获得地图选择的设备
      getDeviceList(data) {
        this.returnData = data;
        // console.log(data);
      },
      //获取档案列表
      getData() {
        this.listLoading = true;
        this.$post('person/query', this.query).then((data) => {
          this.vipList = data.data;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.vipList = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      handleCurrentChange(val) {
        this.followTask.followTarget = val.faceId;
        this.imgUrl = val.faceUrl;
        this.runTranslation = false;
      },
      //创建伴随任务
      createFollowTask() {
        this.$refs['followTask'].validate((valid) => {
          if (valid) {
            if (!this.qTime || this.qTime.length === 0) {
              this.$message.error('请选择日期');
              return;
            }
            this.followTask.startDate = Math.round(this.qTime[0] / 1000);
            this.followTask.endDate = Math.round(this.qTime[1] / 1000);
            let bol = ((this.followTask.endDate - this.followTask.startDate) > 60 * 60 * 24 * 7);
            if (bol) {
              this.$message.error('日期范围不能超过7天');
              return;
            }

            this.followTask.caseName = this.getCaseName();
            if (this.taskId.length > 0) {
              this.$post("/follow/update", this.followTask, "修改成功").then((data) => {
                if ("000000" === data.code)
                  this.$router.go(-1);
              }).catch((err) => {
              });
            } else {
              this.followTask.createBy = JSON.parse(decryData(sessionStorage.getItem("user"))).realName;
              this.$post("follow/add", this.followTask, "创建成功").then((data) => {
                if ("000000" === data.code)
                  this.$router.go(-1);
              }).catch((err) => {
              });
            }
          }
        })
      },
      //获取案件名称
      getCaseName() {
        for (let item of this.cases) {
          if (item.id === this.followTask.caseId) {
            return item.caseName;
          }
        }
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
          this.deviceListCopy = Object.assign([], this.deviceList);
        }).catch((err) => {
          this.deviceList = [];
          this.deviceListCopy = [];
        });
      },
      //获取案件列表
      getCases() {
        this.$post('case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'age') {
          return row.age >= 0 ? row.age : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'status') {
          return row.status === 0 ? '正常' : row.status === 1 ? '故障' : row.status === 2 ? '已下线' : '--';
        } else if (column.property === 'areaCode') {
          return row.areaCode ? getAreaLable(row.areaCode) : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //设备当前页全选
      selsChange(sels) {
        this.sels = sels;
        console.log(sels);
      },
      confirmChoose() {
        if (this.followTask.followType == 'IMSI') {
          let arr = [];
          this.sels.forEach((item) => {
            arr.push(item.deviceId)
          });
          this.followTask.deviceId = arr;
        } else {
          let arr = [];
          this.sels.forEach((item) => {
            arr.push(item.cameraCode)
          });
          this.followTask.deviceId = arr;
        }
        this.dialogCamera = false;
        this.dialogDevice = false;
      },
      showDialog(val) {
        this.dataType = val;
        this.queryDevice = {page: 1, size: 10};
        this.sels = [];
        this.areaList = [];
        if (this.followTask.followType == 'IMSI') {
          this.getData1();
          this.dialogDevice = true;
        } else {
          this.getData2();
          this.dialogCamera = true;
        }
      },
      //获取设备列表
      getData1() {
        if (this.queryDevice.deviceName) {
          if (noSValidator(this.queryDevice.deviceName)) {
            this.$message.error('请输入正确的设备标识/ID');
            return;
          }
        }
        this.listLoading = true;
        this.$post("device/query", this.queryDevice).then((data) => {
          this.device1 = data.data.list;
          this.countDevice = data.data.count;
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
      getData2() {
        if (this.queryDevice.cameraCode) {
          if (noSValidator(this.queryDevice.cameraCode)) {
            this.$message.error('请输入正确的相机编码');
            return;
          }
        }
        this.listLoading = true;

        this.$post("camera/query", this.queryDevice).then((data) => {
          this.cameras1 = data.data.list;
          this.countDevice = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.cameras1 = [];
          this.$message.error(err);
        });
      },
      pageChange1(index) {
        this.queryDevice.page = index;
        if (this.followTask.followType == 'IMSI') {
          this.getData1();
        } else {
          this.getData2();
        }
      },
      handleSizeChange1(val) {
        this.queryDevice.size = val;
        if (this.followTask.followType == 'IMSI') {
          this.getData1();
        } else {
          this.getData2();
        }
      },
      //搜索设备列表
      clearData1() {
        this.queryDevice = {page: 1, size: 10};
        this.areaList = [];
        if (this.followTask.followType == 'IMSI') {
          this.getData1();
        } else {
          this.getData2();
        }
      },
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        this.queryDevice.provinceCode = '';
        this.queryDevice.cityCode = '';
        this.queryDevice.areaCode = '';
        if (value.length === 1) {
          this.queryDevice.provinceCode = value[0];
        } else if (value.length === 2) {
          this.queryDevice.cityCode = value[1];
        } else if (value.length === 3) {
          this.queryDevice.areaCode = value[2];
        } else if (value.length === 4) {
          this.queryDevice.areaCode = value[2];
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
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
      }
    },
    mounted() {
      this.taskId = this.$route.query.id || '';
      if (this.taskId.length > 0) {
        this.getTaskDetail();
      }
      this.getPlaces();
      this.getCases();
      this.getDevice();
      // this.getCameras();
    },
    components: {
      DeviceBmap
    }
  }
</script>
