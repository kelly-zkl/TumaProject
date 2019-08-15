<template>
  <div>
    <section class="content">
      <el-form ref="followTask" :model="followTask" label-position="right" label-width="120px" :rules="rules">
        <h5 class="add-label" style="margin:10px 0">任务基本信息</h5>
        <div class="add-appdiv" style="padding: 20px 0">
          <el-form-item label="任务名称" align="left" prop="taskName">
            <el-input v-model="followTask.taskName" placeholder="请输入任务名称" style="width: 400px" :maxlength=30></el-input>
          </el-form-item>
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
                      style="width: 400px" :maxlength=15></el-input>
          </el-form-item>
          <el-form-item label="分析场所" align="left">
            <el-select v-model="followTask.placeList" placeholder="分析场所" filterable multiple clearable
                       collapse-tags style="width: 350px" :filter-method="pinyinMatch">
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
          <el-form-item label="时间范围" align="left" required style="margin: 0">
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
        dialogPlace: false, listLoading: false, mapVisible: false,
        query: {page: 1, size: 10},
        taskId: this.$route.query.id || '',
        followTask: {followType: "IMSI", interval: 120},
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        time2: ['00:00:00', '23:59:59'], qTime: '', count: 0, cases: [],
        areaList: [], places: [], placesCopy: [], placeList: [], placeList1: [], sels: [],
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
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        serviceTypes: [{value: '0', label: '网吧'}, {value: '1', label: '旅店宾馆类（住宿服务场所）'},
          {value: '2', label: '图书馆阅览室'}, {value: '3', label: '电脑培训中心类'}, {value: '4', label: '娱乐场所类'},
          {value: '5', label: '交通枢纽'}, {value: '6', label: '公共交通工具'}, {value: '7', label: '餐饮服务场所'},
          {value: '8', label: '金融服务场所'}, {value: 'A', label: '购物场所'}, {value: 'B', label: '公共服务场所'},
          {value: 'C', label: '文化服务场所'}, {value: 'D', label: '公共休闲场所'}, {value: '9', label: '其他'}],
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
          let result = [];
          this.placesCopy.forEach((item) => {
            let m = PinyinMatch.match(item.placeName, val);
            if (m) {
              result.push(item);
            }
          });
          this.places = result;
        } else {
          this.places = this.placesCopy;
        }
      },
      //获取伴随详情
      getTaskDetail() {
        this.$post('/follow/get/' + this.taskId, {}).then((data) => {
          this.followTask = data.data;
          if (!!this.followTask.placeList) {
            let places = [];
            this.followTask.placeList.forEach((item) => {
              places.push(item.placeId);
            });
          }
          this.followTask.placeList = places;
          this.qTime = [this.followTask.startDate * 1000, this.followTask.endDate * 1000];
          this.time2 = [this.followTask.repeatStartTime, this.followTask.repeatEndTime];
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
        this.followTask.placeList = this.placeList;
        this.mapVisible = false;
      },
      //获得地图选择的场所
      getPlaceList(pos) {
        this.placeList = pos;
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
            this.followTask.repeatStartTime = this.time2[0];
            this.followTask.repeatEndTime = this.time2[1];

            this.followTask.caseName = this.getCaseName();

            if (!!this.followTask.placeList) {
              let places = [];
              this.followTask.placeList.forEach((item) => {
                this.places.forEach((list) => {
                  if (item == list.id) {
                    places.push({placeId: list.id, placeName: list.placeName});
                  }
                });
              });
              this.followTask.placeList = places;
            }
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
        this.followTask.placeList = arr;
        this.dialogPlace = false;
      },
      //获取案件列表
      getCases() {
        this.$post('case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        delete this.query['provinceCode'];
        delete this.query['cityCode'];
        delete this.query['areaCode'];
        if (value.length === 1) {
          this.query.provinceCode = value[0];
        } else if (value.length === 2) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
          this.query.areaCode = value[2];
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
      this.taskId = this.$route.query.id || '';
      if (this.taskId.length > 0) {
        this.getTaskDetail();
      }
      this.getPlaces();
      this.getCases();
    },
    components: {
      PlaceMap
    }
  }
</script>
