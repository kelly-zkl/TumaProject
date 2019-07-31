<template>
  <div>
    <section class="content">
      <el-form ref="carTask" :model="carTask" label-position="right" label-width="120px" :rules="rules">
        <div class="add-appdiv" style="padding: 10px 0 20px 0;margin-bottom: 15px">
          <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">
            基本信息
          </div>
          <el-form-item label="任务名称" align="left" prop="taskName" style="margin-top: 20px">
            <el-input v-model="carTask.taskName" placeholder="请输入任务名称" style="width: 400px" :maxlength=30></el-input>
          </el-form-item>
          <el-form-item label="关联案件" align="left" style="margin:0" prop="caseId">
            <el-select v-model="carTask.caseId" placeholder="选择案件" filterable clearable>
              <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="add-appdiv" style="padding: 10px 0 20px 0;margin-bottom: 15px">
          <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">
            碰撞条件
          </div>
          <el-form-item label="分析类型" align="left" prop="atype" style="text-align: left;margin-top:20px">
            <el-radio-group v-model="carTask.atype">
              <el-radio label="imsi">以码找车</el-radio>
              <el-radio label="car">以车找码</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分析对象" align="left" prop="followTarget" style="text-align: left">
            <el-input placeholder="输入分析对象" v-model="carTask.followTarget" style="width:300px;margin-top: 0"
                      :maxlength=15>
            </el-input>
          </el-form-item>
          <el-form-item label="牌号种类" align="left" style="text-align: left" required
                        v-show="carTask.atype=='car'">
            <el-select v-model="carTask.carLicenseKind" placeholder="牌号种类" filterable clearable>
              <el-option v-for="item in carTypes" :key="item.label" :label="item.label" :value="item.label">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分析场所" align="left">
            <el-select v-model="carTask.placeList" placeholder="分析场所" filterable multiple clearable
                       collapse-tags style="width: 300px" :filter-method="pinyinMatch">
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
            <el-button type="primary" size="medium" style="margin-left: 5px" @click="showDialog()">选择</el-button>
            <el-button type="primary" size="medium" @click="showMap()" style="margin-left: 5px">地图选择</el-button>
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
          <el-form-item label="时段" align="left" required style="margin: 0">
            <el-tooltip class="item" effect="dark" content="开始时间" placement="bottom">
              <el-time-picker v-model="time2[0]" style="width:120px" value-format="HH:mm:ss"
                              placeholder="开始时间" size="medium">
              </el-time-picker>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="结束时间" placement="bottom">
              <el-time-picker v-model="time2[1]" style="width:120px" value-format="HH:mm:ss"
                              placeholder="结束时间" size="medium">
              </el-time-picker>
            </el-tooltip>
          </el-form-item>
          <el-form-item align="left" style="margin: 0">
            <span style="font-size:13px;color: #999">(时段非必选，默认为全天24小时)</span>
          </el-form-item>
          <el-form-item label="伴随时间间隔" align="left" prop="interval" style="margin: 0">
            <el-tooltip class="item" effect="dark" placement="bottom">
              <div slot="content">伴随时间间隔是指，在采集IMSI的时间点,<br/>前后n秒内采集的其它IMSI，都可视为伴随IMSI</div>
              <el-input v-model.number="carTask.interval" placeholder="请输入时间间隔" type="number"
                        style="width: 400px" :maxlength=5>
                <template slot="append">秒</template>
              </el-input>
            </el-tooltip>
          </el-form-item>
        </div>
        <el-form-item align="left" style="text-align: left">
          <el-button type="primary" @click="createCarTask()">{{taskNo.length>0?'确认修改':'确认创建'}}</el-button>
        </el-form-item>
      </el-form>
      <!--在地图上选择场所-->
      <div class="device">
        <el-dialog title="选择场所" :visible.sync="mapVisible" width="90%">
          <PlaceMap @getPlaceList="getPlaceList" ref="map"></PlaceMap>
          <div class="block" style="margin-top: 20px">
            <el-button @click="mapVisible = false">取消</el-button>
            <el-button type="primary" @click="setPlaceList">确定</el-button>
          </div>
        </el-dialog>
      </div>
      <!--选择场所-->
      <el-dialog title="选择场所" :visible.sync="dialogPlace" width="80%">
        <el-form :inline="true" :model="query" align="left" style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.placeName" placeholder="场所编码/名称" size="medium" :maxlength=30></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.placeType" placeholder="场所类型" size="medium">
              <el-option v-for="item in serviceTypes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="placeList1" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="场所编码" prop="placeCode" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="场所名称" prop="placeName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="场所类型" prop="placeType" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="所属组织" prop="groupName" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="地区" prop="areaCode" min-width="180"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="详细地址" prop="detailAddress" min-width="180"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
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
  import PlaceMap from '../PlaceMap';
  import {formatDate, getAreaLable, compareTime, encryData, decryData} from "../../../assets/js/util";
  import {numValid, carValid} from "../../../assets/js/api";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        listLoading: false,
        mapVisible: false,
        dialogPlace: false,
        query: {page: 1, size: 10},
        carTask: {atype: 'imsi', interval: 120},
        cases: [],
        qTime: '',
        time2: ['00:00:00', '23:59:59'],
        count: 0,
        taskNo: this.$route.query.no || '',
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        areaList: [], places: [], placesCopy: [], placeList: [], placeList1: [], sels: [],
        carTypes: [{value: 'small', label: '小型汽车'}, {value: 'veh', label: '大型汽车'}, {value: 'fe', label: '涉外车辆'},
          {value: 'police', label: '警用汽车'}, {value: 'sol', label: '军用汽车'}, {value: 'soach', label: '教练汽车'},
          {value: 'gov', label: '政法部门车辆'}],
        serviceTypes: [{value: '0', label: '网吧'}, {value: '1', label: '旅店宾馆类（住宿服务场所）'},
          {value: '2', label: '图书馆阅览室'}, {value: '3', label: '电脑培训中心类'}, {value: '4', label: '娱乐场所类'},
          {value: '5', label: '交通枢纽'}, {value: '6', label: '公共交通工具'}, {value: '7', label: '餐饮服务场所'},
          {value: '8', label: '金融服务场所'}, {value: 'A', label: '购物场所'}, {value: 'B', label: '公共服务场所'},
          {value: 'C', label: '文化服务场所'}, {value: 'D', label: '公共休闲场所'}, {value: '9', label: '其他'}],
        rules: {
          atype: [{required: true, message: '请选择类型', trigger: 'blur'}],
          caseId: [{required: true, message: '请选择案件', trigger: 'blur'}],
          followTarget: [{required: true, message: '请输入分析对象', trigger: 'blur'}],
          interval: [{required: true, message: '请输入时间间隔', trigger: 'blur'}],
          taskName: [{required: true, message: '请输入任务名称', trigger: 'blur'}]
        },
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
          this.placesCopy.forEach((item) => {
            var m = PinyinMatch.match(item.placeName, val);
            if (m) {
              result.push(item);
            }
          });
          this.places = result;
        } else {
          this.places = this.placesCopy;
        }
      },
      getTaskDetail() {
        this.$post('car/task/detail', {taskNo: this.taskNo}).then((data) => {
          this.carTask = data.data;
          if (!!this.carTask.placeList) {
            var places = [];
            this.carTask.placeList.forEach((item) => {
              places.push(item.placeId);
            });
          }
          this.carTask.placeList = places;
          this.qTime = [this.carTask.startDate * 1000, this.carTask.endDate * 1000];
          this.time2 = [this.carTask.repeatStartTime, this.carTask.repeatEndTime];
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
      showMap() {
        this.mapVisible = true;
        // this.$refs.map.clearArea();
      },
      //地图选择场所
      setPlaceList() {
        this.carTask.placeList = this.placeList;
        this.mapVisible = false;
      },
      //获得地图选择的场所
      getPlaceList(pos) {
        this.placeList = pos;
      },
      //创建伴随任务
      createCarTask() {
        this.$refs['carTask'].validate((valid) => {
          if (valid) {
            if (this.carTask.atype == 'imsi') {
              if (!numValid(this.carTask.followTarget)) {
                this.$message.error('请输入正确的IMSI');
                return;
              }
            } else {
              if (!carValid(this.carTask.followTarget)) {
                this.$message.error('请输入正确的车牌号');
                return;
              }
              if (!this.carTask.carLicenseKind) {
                this.$message.error('请选择牌号种类');
                return;
              }
            }
            if (!this.qTime || this.qTime.length === 0) {
              this.$message.error('请选择日期');
              return;
            }
            if (!this.time2 || this.time2.length == 0) {
              this.$message.error('请选择时段');
              return;
            } else if (!this.time2[0] || !this.time2[1]) {
              this.$message.error('请选择时段');
              return;
            } else if (!compareTime(this.time2[0], this.time2[1])) {
              this.$message.error('结束时间要大于开始时间');
              return;
            }

            this.carTask.startDate = Math.round(this.qTime[0] / 1000);
            this.carTask.endDate = Math.round(this.qTime[1] / 1000);
            this.carTask.repeatStartTime = this.time2[0];
            this.carTask.repeatEndTime = this.time2[1];
            let bol = ((this.carTask.endDate - this.carTask.startDate) > 60 * 60 * 24 * 7);
            if (bol) {
              this.$message.error('日期范围不能超过7天');
              return;
            }

            this.carTask.caseName = this.getCaseName();

            if (!!this.carTask.placeList) {
              var places = [];
              this.carTask.placeList.forEach((item) => {
                this.places.forEach((list) => {
                  if (item == list.id) {
                    places.push({placeId: list.id, placeName: list.placeName});
                  }
                });
              });
              this.carTask.placeList = places;
            }

            if (this.taskNo.length > 0) {
              this.$post("car/task/create", this.carTask, "修改成功").then((data) => {
                if ("000000" === data.code)
                  this.$router.go(-1);
              }).catch((err) => {
              });
            } else {
              this.carTask.groupId = JSON.parse(decryData(sessionStorage.getItem("user"))).groupId;
              this.carTask.creatorId = JSON.parse(decryData(sessionStorage.getItem("user"))).userId;
              this.carTask.creatorName = JSON.parse(decryData(sessionStorage.getItem("user"))).realName;
              this.$post("car/task/create", this.carTask, "创建成功").then((data) => {
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
          if (item.id === this.carTask.caseId) {
            return item.caseName;
          }
        }
      },
      //获取案件列表
      getCases() {
        this.$post('case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      showDialog() {
        this.query = {page: 1, size: 10};
        this.sels = [];
        this.areaList = [];
        this.getData();
        this.dialogPlace = true;
      },
      //设备当前页全选
      selsChange(sels) {
        this.sels = sels;
      },
      confirmChoose() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id)
        });
        this.carTask.placeList = arr;
        this.dialogPlace = false;
      },
      //获取场所列表
      getData() {
        this.listLoading = true;

        this.$post("place/query", this.query).then((data) => {
          this.placeList1 = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.placeList1 = [];
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.areaList = [];
        this.getData();
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'placeType') {
          for (let item of this.serviceTypes) {
            if (item.value === row.placeType) {
              return item.label;
            }
          }
        } else if (column.property === 'areaCode') {
          return row.areaCode ? getAreaLable(row.areaCode) : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
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
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
          this.placesCopy = Object.assign([], this.places);
        }).catch((err) => {
          this.places = [];
          this.placesCopy = [];
        });
      }
    },
    mounted() {
      this.taskNo = this.$route.query.no || '';
      this.getPlaces();
      this.getCases();
      if (this.taskNo.length > 0) {
        this.getTaskDetail();
      }
    },
    components: {
      PlaceMap
    }
  }
</script>
