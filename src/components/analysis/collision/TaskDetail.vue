<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="padding: 0;margin: 0">
        <el-row style="margin: 0;padding: 0">
          <el-col :span="8" align="left" style="text-align: left;border-right: 1px solid #D0CACF;padding:15px 20px">
            <el-input v-model="task.taskName" style="width: 250px" :maxlength=20></el-input>
            <el-button type="text" style="margin-left: 15px" @click="modifyTask()">修改</el-button>
          </el-col>
          <el-col :span="12" align="center"
                  style="text-align: center;">
            <el-button type="text" @click="showSetParam(0)">
              <i class="fa fa-database" style="font-size: 24px"></i>
              <div style="font-size: 12px;padding: 5px 0 0 0;margin: 0">数据源</div>
            </el-button>
            <el-button type="text">交集</el-button>
            <el-button type="text">并集</el-button>
            <el-button type="text">差集</el-button>
          </el-col>
          <el-col :span="4" align="right" style="text-align: right;border-left: 1px solid #D0CACF;padding:15px 20px">
            <el-button type="text" @click="">复制</el-button>
            <el-button type="text" @click="deleteTask()" v-show="getButtonVial('collision:delete')">删除</el-button>
          </el-col>
        </el-row>
        <el-row style="border-top: 1px solid #D0CACF">
          <el-col :span="12" style="border-right: 1px solid #D0CACF">
            <div class="title-head">数据源</div>
            <el-table :data="records" class="center-block" @selection-change="selsDataChange" :height="tableHeight">
              <el-table-column type="selection" width="45" align="left"></el-table-column>
              <el-table-column align="left" label="数据源">
                <template slot-scope="scope">
                  <el-row>
                    <el-col :span="12" align="left" style="text-align: left">
                      <div style="font-size: 15px;color: #333;font-weight: bold">
                        {{scope.row.name?scope.row.name:'--'}}
                      </div>
                    </el-col>
                    <el-col :span="12" align="right" style="text-align: right">
                      <el-button type="text" class="fa fa-filter" @click="showSetParam(1,scope.row)"
                                 style="margin: 0;padding: 0;font-size: 20px"></el-button>
                      <el-button type="text" class="fa fa-file-text-o fa-lg" @click="showImsi(0)"
                                 style="margin: 0;padding: 0 10px"></el-button>
                      <el-button type="text" class="fa fa-bar-chart fa-lg" style="margin: 0;padding: 0"
                                 @click="runResult=true"></el-button>
                    </el-col>
                  </el-row>
                  <div class="data-content">{{scope.row.contentStr?scope.row.contentStr:'--'}}</div>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="12">
            <div class="title-head">交并分析结果</div>
            <el-table :data="records" class="center-block" @selection-change="selsResultChange"
                      stripe :height="tableHeight">
              <el-table-column type="selection" width="45" align="left"></el-table-column>
              <el-table-column align="left" prop="imsi" label="数据源" :formatter="formatterAddress"
                               min-width="150" max-width="300"></el-table-column>
              <el-table-column align="left" prop="collisionMode" label="分析方式" min-width="80" max-width="100">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.type" style="width:80px" size="medium" placeholder=""
                             @change="handleModeChange($event,scope.row.id)">
                    <el-option :label="param.label" :value="param.value" v-for="param in resultModes"
                               :key="param.value"></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column align="left" prop="status" label="状态" min-width="80" max-width="100">
                <template slot-scope="scope">
                  <span style="color:#00C755" v-show="scope.row.status == 'FINISH'">已完成</span>
                  <span style="color:#dd6161" v-show="scope.row.status == 'FAILE'">失败</span>
                  <span style="color:#D76F31" v-show="scope.row.status == 'WAIT'">等待中</span>
                  <span style="color:#6799FD" v-show="scope.row.status == 'EXECUTION'">进行中</span>
                </template>
              </el-table-column>
              <el-table-column align="left" label="操作" min-width="80" max-width="100">
                <template slot-scope="scope">
                  <el-button type="text" class="fa fa-list-alt fa-lg" @click="showImsi(1)"></el-button>
                  <el-button type="text" class="fa fa-bar-chart fa-lg" @click="runResult=true"></el-button>
                  <el-button type="text" class="fa fa-stop-circle fa-lg"></el-button>
                  <el-button type="text" class="fa fa-repeat fa-lg"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>
      <!--设立条件-->
      <el-dialog title="设立条件" width="700px" :visible.sync="runSetParam" :show-close="false"
                 :close-on-press-escape="false" :close-on-click-modal="false">
        <el-form :model="collision" label-position="left" label-width="1px">
          <el-form-item align="left" style="margin: 0 0 10px 0">
            符合
            <el-radio-group v-model="collision.collType" size="medium">
              <el-radio-button label="and">全部(and)</el-radio-button>
              <el-radio-button label="or">任一(or)</el-radio-button>
            </el-radio-group>
            条件
          </el-form-item>
          <el-form-item align="left" v-for="(item,idx) in collision.condis" :key="idx+''" style="margin: 0 0 10px 0">
            <el-select v-model="item.type" style="width:160px" size="medium" @change="handleParamChange($event,idx)">
              <el-option :label="param.label" :value="param.value" v-for="param in conParams"
                         :key="param.value"></el-option>
            </el-select>
            <el-select v-model="item.feild" style="width:80px" size="medium">
              <el-option :label="param.label" :value="param.value" v-for="param in feilds"
                         :key="param.value"></el-option>
            </el-select>
            <el-date-picker v-model="item.qTime" type="daterange" range-separator="至" style="width: 250px"
                            value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期"
                            :default-time="['00:00:00', '23:59:59']" format="yyyy-MM-dd"
                            :picker-options="pickerBeginDate" size="medium" v-show="item.type=='qTime'">
            </el-date-picker>
            <el-time-picker is-range v-model="item.time" range-separator="至" start-placeholder="开始时间"
                            value-format="HH:mm:ss" end-placeholder="结束时间" placeholder="选择时间范围"
                            style="width: 230px" size="medium" v-show="item.type=='time'">
            </el-time-picker>
            <el-select v-model="item.places" size="medium" multiple collapse-tags style="width:230px"
                       v-show="item.type=='places'" placeholder="选择场所">
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
            <el-button type="primary" size="medium" @click="showMap(idx)" v-show="item.type=='places'">地图
            </el-button>
            <el-select v-model="item.isps" style="width:230px" size="medium" multiple collapse-tags
                       v-show="item.type=='isps'" placeholder="选择运营商">
              <el-option :label="param.label" :value="param.value" v-for="param in operators"
                         :key="param.value"></el-option>
            </el-select>
            <el-input v-model="item.imsi" :maxlength=15 placeholder="输入IMSI" size="medium"
                      style="width: 230px" v-show="item.type=='imsi'"></el-input>
            <el-input v-model="item.regional" :maxlength=20 placeholder="输入归属地" size="medium"
                      style="width: 230px" v-show="item.type=='regional'"></el-input>
            <el-button type="text" size="medium" @click="deleteItem(idx)"
                       v-show="collision.condis.length>1">删除
            </el-button>
          </el-form-item>
          <el-form-item align="left" style="margin: 0 0 10px 0">
            <el-button plain size="medium" icon="el-icon-plus" @click="addParam()">添加</el-button>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button type="primary" @click="saveParam()">保存</el-button>
          <el-button @click="runSetParam=false">取消</el-button>
        </div>
      </el-dialog>
      <!--IMSI记录-->
      <div class="device">
        <el-dialog :title="resultTitle" :visible.sync="runImsiList" width="96%">
          <imsiList ref="imsiList"></imsiList>
        </el-dialog>
      </div>
      <!--统计结果-->
      <div class="device">
        <el-dialog title="" :visible.sync="runResult" width="96%">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="card">
            <el-tab-pane label="归属地" name="regional">
              <regionalCount ref="regional"></regionalCount>
            </el-tab-pane>
            <el-tab-pane label="抓取辖区" name="area">
              <areaCount ref="area"></areaCount>
            </el-tab-pane>
            <el-tab-pane label="抓取场所" name="place">
              <placeCount ref="place"></placeCount>
            </el-tab-pane>
          </el-tabs>
        </el-dialog>
      </div>
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
    </section>
  </div>
</template>

<script>
  import {isNull, numValid} from "../../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";
  import areaCount from '../collision/AreaCount.vue';
  import placeCount from '../collision/PlaceCount.vue';
  import regionalCount from '../collision/RegionalCount.vue';
  import imsiList from '../collision/ImsiList.vue';
  import PlaceMap from '../PlaceMap';

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        dialogWidth: isPC() ? '35%' : '90%',
        taskId: this.$route.query.taskId || '',
        tableHeight: window.innerHeight - 240,
        collision: {
          collType: 'and', condis: [{
            type: 'qTime', feild: 'equal',
            qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
              new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()]
          }]
        },
        runImsiList: false,
        runResult: false,
        mapVisible: false,
        runSetParam: false,
        resultTitle: 'IMSI记录',
        collisionType: this.$route.query.collisionType || '',
        activeType: "IMSI",
        activeItem: 'first',
        imageItem: 'image',
        exportKey: 'collision:export:analyze',
        records: [],
        places: [],
        placeList: [],
        listLoading: false,
        query: {page: 1, size: 10},
        count: 0,
        pIndx: 0,
        task: {},
        conParams: [{value: 'qTime', label: 'IMSI抓取日期范围'}, {value: 'time', label: 'IMSI抓取每日时段'},
          {value: 'places', label: 'IMSI抓取场所'}, {value: 'isps', label: 'IMSI运营商'},
          {value: 'regional', label: 'IMSI归属地'}, {value: 'imsi', label: '指定IMSI'}],
        feilds: [{value: 'equal', label: '等于'}, {value: 'else', label: '排除'}],
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        resultModes: [{value: 'INTERSECT', label: '交集'}, {value: 'UNION', label: '并集'},
          {value: 'SUBTRACT', label: '差集'}],
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
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleModeChange(val, id) {
        console.log(val);
        console.log(id);
        var str = (val == 'INTERSECT' ? '交集' : val == 'UNION' ? '并集' : val == 'SUBTRACT' ? '差集' : '--');
        this.$confirm('确定即按照' + str + '的分析方式重新分析当前任务?',
          '提示', {type: 'info'}).then(() => {
          this.$post('/collision/update/' + id, {mode: val}, "修改成功").then((data) => {
            if ("000000" === data.code) {
              this.taskDetail()
            }
          }).catch((err) => {
          });
        }).catch((err) => {
          this.taskDetail()
        });
      },
      showSetParam(val, data) {
        if (val == 0) {
          this.collision = {
            collType: 'and', condis: [{
              type: 'qTime', feild: 'equal',
              qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
                new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()]
            }]
          };
        } else {
          var param = {name: data.name, collType: data.collType};
          var arr = [];
          data.condis.forEach((item) => {
            if (item.type == 'qTime') {
              arr.push({type: item.type, feild: item.feild, qTime: [startDate * 1000, endDate * 1000]});
            } else if (item.type == 'time') {
              arr.push({type: item.type, feild: item.feild, qTime: [startTime, endTime]});
            } else {
              var par = {type: item.type, feild: item.feild};
              par[item.type] = item[item.type];
              arr.push(par);
            }
          });
          param.condis = arr;
          this.collision = param;
        }
        this.runSetParam = true;
      },
      //场所地图
      showMap(idx) {
        this.pIndx = idx;
        this.mapVisible = true;
        this.$refs.map.clearArea();
      },
      //地图选择场所
      setPlaceList() {
        this.collision.condis[this.pIndx].places = this.placeList;
        this.mapVisible = false;
      },
      //获得地图选择的场所
      getPlaceList(pos) {
        this.placeList = pos;
      },
      showImsi(val) {
        if (val == 0) {
          this.resultTitle = 'IMSI记录';
        } else {
          this.resultTitle = '分析结果';
        }
        this.runImsiList = true
      },
      //条件选择变化
      handleParamChange(val, idx) {
        if (val == 'qTime') {
          this.collision.condis[idx].qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        } else if (val == 'time') {
          this.collision.condis[idx].time = ['00:00:00', '23:59:59'];
        } else if (val == 'isps' || val == 'places') {
          this.collision.condis[idx][val] = [];
        } else {
          this.collision.condis[idx][val] = '';
        }
      },
      //添加参数
      addParam() {
        var param = {
          type: 'qTime', feild: 'equal',
          qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()]
        };
        this.collision.condis.push(param);
      },
      deleteItem(idx) {
        this.collision.condis.splice(idx, 1);
      },
      //修改任务名称
      modifyTask() {
        if (this.task.taskName.length === 0) {
          this.$message.error('请输入任务名称');
          return;
        }
        this.$post('/collision/update', this.task, "修改成功").then((data) => {
          if ("000000" === data.code) {
            this.taskDetail()
          }
        }).catch((err) => {
        });
      },
      selsDataChange() {
      },
      selsResultChange() {

      },
      //保存
      saveParam() {
        //判断条件是否为空
        var isBol = true;
        this.collision.condis.forEach((item) => {
          if (!item[item.type] || item[item.type].length == 0) {
            this.$message.error('完善条件信息');
            isBol = false;
          }
          if (item.type == 'imsi') {
            if (!numValid(item.imsi) || item.imsi.length != 15) {
              this.$message.error('请输入15位正确的IMSI');
              isBol = false;
            }
          }
        });
        if (isBol) {//条件全部符合
          var param = {name: '数据' + (this.records.length + 1), collType: this.collision.collType};
          var arr = [];
          this.collision.condis.forEach((item) => {
            if (item.type == 'qTime') {
              arr.push({
                type: item.type, feild: item.feild,
                startDate: item.qTime[0] / 1000, endDate: item.qTime[1] / 1000
              });
            } else if (item.type == 'time') {
              arr.push({
                type: item.type, feild: item.feild,
                startTime: item.time[0], endTime: item.time[1]
              });
            } else {
              var child = {type: item.type, feild: item.feild};
              child[item.type] = item[item.type];
              arr.push(child);
            }
          });
          param.condis = arr;
          console.log(param);
          if (this.collision.id) {
            this.$confirm('当前数据集正在参与交并分析任务，确认即按照本次筛选结果重新进行数据统计、交并分析等。确定按照新的筛选结果进行数据分析？',
              '提示', {type: 'info'}).then(() => {
              this.$post('/collision/update', this.collision, "创建成功").then((data) => {
                if ("000000" === data.code) {
                  this.taskDetail()
                }
              })
            })
          } else {
            this.$post('/collision/update', this.collision, "修改成功").then((data) => {
              if ("000000" === data.code) {
                this.taskDetail()
              }
            })
          }
        }
      },
      //任务类型-->IMSI、图像、疑似人员
      handleType(tab, event) {
        if (tab.name == 'image' || tab.name == 'first') {
          this.exportKey = 'collision:export:analyze';
        } else if (tab.name == 'fourth' || tab.name == 'list') {
          this.exportKey = 'collision:export:record';
        } else {
          this.exportKey = 'collision:export:regional';
        }
      }
      ,
      //跳转IMSI记录
      gotoImsi(imsi) {
        let routeData = this.$router.resolve({
          path: '/collisionImsiRecords', query: {
            taskId: this.taskId,
            collisionType: this.collisionType, imsi: imsi
          }
        });
        window.open(routeData.href, '_blank');
      }
      ,
      pageChange(index) {
        this.query.page = index;
        this.getData();
      }
      ,
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      }
      ,
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {//0-男  1-女  2-未知
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'pushTime') {
          return row.pushTime ? formatDate(new Date(row.pushTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'imsiCount1' || column.property === 'imsiCount2' || column.property === 'faceCount1' || column.property === 'faceCount2') {
          return row[column.property];
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
      ,
      getNetType(isp) {
        let moduleId = "--";
        switch (isp) {
          case 0:
            moduleId = "CMCC";
            break;
          case 1:
            moduleId = "CMUC";
            break;
          case 2:
            moduleId = "CMTC";
            break;
          default:
            break;
        }
        return moduleId;
      }
      ,
      //删除任务
      deleteTask() {
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/delete', [this.taskId], '删除成功').then((data) => {
            if ("000000" === data.code)
              this.$router.go(-1);
          }).catch((err) => {
          });
        }).catch(() => {
        });
      }
      ,
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.query.collisionType = this.collisionType;
        this.query.collisionTaskId = this.taskId;
        this.getData();
      }
      ,
      //获取记录
      getData() {
        if (this.collisionType === 'FACE') {//人脸
          if (!isNull(this.query.age1) || !isNull(this.query.age2)) {
            if (isNull(this.query.age1) || isNull(this.query.age2)) {
              this.$message.error('请输入正确的年龄范围');
              return;
            } else {
              this.query.age1 = parseInt(this.query.age1);
              this.query.age2 = parseInt(this.query.age2);
              if (this.query.age1 >= this.query.age2) {
                this.$message.error('请输入正确的年龄范围');
                return;
              }
            }
          }
        }

        this.listLoading = true;
        this.$post('/collision/queryResult', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.listLoading = false;
        });
      }
      ,
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
      }
      ,
      //任务详情
      taskDetail() {
        this.$post('/collision/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.condition1 = this.task.condition1.split("\r\n");
          if (this.task.condition2) {
            this.task.condition2 = this.task.condition2.split("\r\n");
          }
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss')
        }).catch((err) => {
        });
      }
      ,
      //获取数据源列表
      getParams() {
        this.$post('/collision/get/' + this.taskId, {}).then((data) => {
          if ("000000" === data.code) {
            data.data.forEach((item) => {
              var dateStr = [], timeStr = [], placeStr = [], ispStr = [], reginStr = [], imsiStr = [];
              item.condis.forEach((child) => {
                if (child.type == 'qTime') {
                  var qStr = (child.feild == 'equal' ? '等于' : '排除') + formatDate(new Date(child.startDate * 1000), 'yyyy-MM-dd') + '至' + formatDate(new Date(child.endDate * 1000));
                  dateStr.push(qStr);
                } else if (child.type == 'time') {
                  var tStr = (child.feild == 'equal' ? '等于' : '排除') + child.startTime + '至' + child.endTime;
                  timeStr.push(tStr);
                } else if (child.type == 'places') {
                  var pArr = [];
                  this.places.forEach((p1) => {
                    child.places.forEach((p2) => {
                      if (p1.id == p2) {
                        pArr.push(p1.placeName);
                      }
                    })
                  });
                  var pStr = (child.feild == 'equal' ? '等于' : '排除') + pArr.join(',');
                  placeStr.push(pStr);
                } else if (child.type == 'isps') {
                  var ispArr = [];
                  child.isps.forEach((isp) => {
                    ispArr.push(isp == 0 ? '移动' : isp == 1 ? '联通' : isp == 2 ? '电信' : '未知');
                  });
                  var iStr = (child.feild == 'equal' ? '等于' : '排除') + ispArr.join(",");
                  ispStr.push(iStr);
                } else if (child.type == 'regional') {
                  var rStr = (child.feild == 'equal' ? '等于' : '排除') + child.regional;
                  reginStr.push(rStr);
                } else if (child.type == 'imsi') {
                  var iStr = (child.feild == 'equal' ? '等于' : '排除') + child.imsi;
                  imsiStr.push(iStr);
                }
              });
              var contentStr = '';
              if (dateStr.length > 0) {
                contentStr = ' 日期:' + dateStr.join(',');
              }
              if (timeStr.length > 0) {
                contentStr += ' 时间段:' + timeStr.join(',');
              }
              if (placeStr.length > 0) {
                contentStr = ' 场所:' + placeStr.join(',');
              }
              if (ispStr.length > 0) {
                contentStr += ' 运营商:' + ispStr.join(',');
              }
              if (reginStr.length > 0) {
                contentStr = ' 归属地:' + reginStr.join(',');
              }
              if (imsiStr.length > 0) {
                contentStr += ' IMSI:' + imsiStr.join(',');
              }
              item.contentStr = contentStr;
            });
          }
        });
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.collisionType = 'IMSI';

      this.activeType = this.collisionType;

      this.query.collisionType = this.collisionType;
      this.query.collisionTaskId = this.taskId;

      this.getPlaces();
      this.taskDetail();
      this.getData();
    },
    components: {
      areaCount, placeCount, regionalCount, imsiList, PlaceMap
    }
  }
</script>
<style scoped>
  .title-head {
    height: 36px;
    line-height: 36px;
    text-align: left;
    padding-left: 20px;
    border-bottom: 1px solid #D0CACF;
  }

  .data-content {
    color: #888;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
</style>
