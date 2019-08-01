<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="padding: 0;margin: 0">
        <el-row style="margin: 0;padding: 0">
          <el-col :lg="8" :xl="6" :md="8" :sm="8" :xs="8" align="left" style="text-align: left;padding:15px 20px">
            <el-row>
              <el-col :span="21" align="left" style="text-align: left">
                <div style="font-size:12px;color:#999;overflow: hidden;white-space: nowrap;text-overflow: ellipsis">
                  <span style="text-align: left;font-size: 15px;color: #000;font-weight: bold">{{task.taskName?task.taskName:'--'}}</span>
                  {{'（编号：'+(task.taskNo?task.taskNo:'--')+'）'}}
                </div>
              </el-col>
              <el-col :span="3" align="right" style="text-align: right">
                <el-button type="text" style="margin-left:8px;padding:0" @click="runModifyTask=true"
                           v-show="getButtonVial('collision:update')">修改
                </el-button>
              </el-col>
            </el-row>
            <div style="text-align: left;font-size: 12px;color: #999;margin-top:5px">
              {{'案件：'+(task.caseName?task.caseName:'--')}}
            </div>
          </el-col>
          <el-col :lg="12" :xl="14" :md="12" :sm="12" :xs="12" align="left" :loading="listLoading"
                  style="text-align: left;border-left: 1px solid #D7D7D7;padding-left: 80px">
            <el-button type="text" @click="showSetParam(0)" v-show="getButtonVial('collision:addOrUpdateDataSource')"
                       style="border-right: 1px solid #D7D7D7;border-radius: 0;padding:0 20px 0 0">
              <img src="../../../assets/img/icon_data.svg" style="height: 28px;width: 28px">
              <div style="font-size: 12px;padding: 5px 0 0 0;margin: 0">数据源</div>
            </el-button>
            <el-button type="text" @click="addRelany('intersect')" style="padding: 0"
                       :disabled="selResults.length+selResources.length<2"
                       v-show="getButtonVial('collision:addOrUpdateAnalyseTask')">
              <img src="../../../assets/img/icon_intersect.svg" style="height: 28px;width: 28px">
              <div style="font-size: 12px;padding: 5px 0 0 0;margin: 0">交集</div>
            </el-button>
            <el-button type="text" @click="addRelany('union')" style="padding: 0"
                       :disabled="selResults.length+selResources.length<2"
                       v-show="getButtonVial('collision:addOrUpdateAnalyseTask')">
              <img src="../../../assets/img/icon_union.svg" style="height: 28px;width: 28px">
              <div style="font-size: 12px;padding: 5px 0 0 0;margin: 0">并集</div>
            </el-button>
            <el-button type="text" @click="showSubtract()" :disabled="selResults.length+selResources.length<2"
                       style="border-right: 1px solid #D7D7D7;border-radius: 0;padding:0 20px 0 0;"
                       v-show="getButtonVial('collision:addOrUpdateAnalyseTask')">
              <img src="../../../assets/img/icon_subtract.svg" style="height: 28px;width: 28px">
              <div style="font-size: 12px;padding: 5px 0 0 0;margin: 0">差集</div>
            </el-button>
            <el-button type="text" @click="copyTask()" style="padding: 0"
                       :disabled="selResults.length==0&&selResources.length==0"
                       v-show="getButtonVial('collision:copyDataSourceOrResult')">
              <img src="../../../assets/img/icon_copy.svg" style="height: 26px;width: 26px">
              <div style="font-size: 12px;padding: 5px 0 0 0;margin: 0">复制</div>
            </el-button>
            <el-button type="text" @click="deleteTask()"
                       v-show="getButtonVial('collision:deleteTaskOrDataSourceOrResult')"
                       :disabled="selResults.length==0&&selResources.length==0">
              <img src="../../../assets/img/icon_delete.svg" style="height: 26px;width: 26px">
              <div style="font-size: 12px;padding: 5px 0 0 0;margin: 0">删除</div>
            </el-button>
          </el-col>
          <el-col :lg="4" :xl="4" :md="4" :sm="4" :xs="4" align="right" style="text-align: right;padding: 10px 20px">
            <el-button type="text" style="color: #999" @click="runHelpDoc=true">
              <i class="fa fa-question-circle" style="margin-right:5px;color:#FFCC00;font-size:20px"></i>使用帮助
            </el-button>
          </el-col>
        </el-row>
        <el-row style="border-top: 1px solid #D7D7D7">
          <el-col :span="11" style="border-right: 1px solid #D7D7D7">
            <div class="title-head">数据源</div>
            <el-table :data="records" class="center-block" @selection-change="selDataChange" :height="tableHeight"
                      :row-key="getRowKey" ref="recordTable">
              <el-table-column type="selection" width="45" align="left" :reserve-selection="true"></el-table-column>
              <el-table-column align="left" label="数据源">
                <template slot-scope="scope">
                  <el-row>
                    <el-col :span="12" align="left" style="text-align: left">
                      <div style="font-size: 15px;color: #333;font-weight: bold">
                        {{scope.row.name?scope.row.name:'--'}}
                      </div>
                    </el-col>
                    <el-col :span="12" align="right" style="text-align: right">
                      <el-tooltip class="item" effect="dark" content="设立条件" placement="bottom">
                        <el-button type="text" class="fa fa-filter" @click="showSetParam(1,scope.row)"
                                   style="margin: 0;padding: 0;font-size: 20px"></el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="查看IMSI" placement="bottom">
                        <el-button type="text" class="fa fa-file-text-o fa-lg" style="margin: 0;padding: 0 10px"
                                   @click="dataId=scope.row.id;runImsiList = true"
                                   v-show="getButtonVial('collision:queryRecord')">
                        </el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="查看统计" placement="bottom">
                        <el-button type="text" class="fa fa-bar-chart fa-lg"
                                   :loading="scope.row.dataStatus=='WAIT'||scope.row.dataStatus=='EXECUTION'"
                                   style="margin: 0;padding: 0" @click="showImsi(scope.row.id,'source')"
                                   v-show="getButtonVial('collision:imsiRecord:statistics')"></el-button>
                      </el-tooltip>
                    </el-col>
                  </el-row>
                  <div class="data-content">{{scope.row.contentStr?scope.row.contentStr:'--'}}</div>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="13">
            <div class="title-head">交并分析结果</div>
            <el-table :data="results" class="center-block" @selection-change="selResultChange" stripe
                      :height="tableHeight" :row-key="getRowKey" ref="resultTable">
              <el-table-column type="selection" width="45" align="left" :reserve-selection="true"></el-table-column>
              <el-table-column align="left" prop="name" label="名称" :formatter="formatterAddress"
                               min-width="120"></el-table-column>
              <el-table-column align="left" prop="dataSource" label="数据源" :formatter="formatterAddress"
                               min-width="220"></el-table-column>
              <el-table-column align="left" prop="operator" label="分析方式" min-width="130">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.operator" style="width:80px" size="medium"
                             @change="handleModeChange($event,scope.row)"
                             :disabled="!getButtonVial('collision:addOrUpdateAnalyseTask')">
                    <el-option :label="param.label" :value="param.value" v-for="param in resultModes"
                               :key="param.value"></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column align="left" prop="status" label="状态" min-width="100">
                <template slot-scope="scope">
                  <span style="color:#00C755" v-show="scope.row.status == 'FINISH'">已完成</span>
                  <span style="color:#dd6161" v-show="scope.row.status == 'FAILE'">失败</span>
                  <span style="color:#FF9900" v-show="scope.row.status == 'WAIT'">等待中</span>
                  <span style="color:#6799FD" v-show="scope.row.status == 'EXECUTION'">分析中</span>
                  <span style="color:#999" v-show="scope.row.status == 'STOP'">终止</span>
                </template>
              </el-table-column>
              <el-table-column align="left" label="操作" min-width="110">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="查看分析结果" placement="bottom">
                    <el-button type="text" class="fa fa-list-alt fa-lg"
                               @click="sourceId=scope.row.id;runImsiResult = true"
                               v-show="getButtonVial('collision:getAnalyseResultList')&&scope.row.status=='FINISH'"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="查看统计结果" placement="bottom">
                    <el-button type="text" class="fa fa-bar-chart fa-lg" @click="showImsi(scope.row.id,'result')"
                               v-show="getButtonVial('collision:imsiRecord:statistics')&&scope.row.status=='FINISH'"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="终止分析" placement="bottom">
                    <el-button type="text" class="fa fa-stop-circle fa-lg" @click="stopAnalysis(scope.row.id)"
                               v-show="getButtonVial('collision:stopAnalysis')&&scope.row.status == 'EXECUTION'"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="重新分析" placement="bottom">
                    <el-button type="text" class="fa fa-repeat fa-lg" @click="reAnalysis(scope.row.id)"
                               v-show="getButtonVial('collision:reanalysis')&&(scope.row.status == 'STOP'||scope.row.status == 'FAILE')"></el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>
      <!--设立条件-->
      <el-dialog title="设立条件" width="800px" :visible.sync="runSetParam" :show-close="false"
                 :close-on-press-escape="false" :close-on-click-modal="false">
        <el-form :model="collision" label-position="right" label-width="150px">
          <el-form-item align="left" style="margin: 0 0 10px 0" label="数据源名称">
            <el-input v-model="collision.name" size="medium" :maxLength="10" placeholder="输入数据源名称"
                      style="width: 500px">
            </el-input>
          </el-form-item>
          <hr style="background-color: #D7D7D7;border: none;height: 1px;margin: 20px"/>
          <el-form-item align="left" style="margin:10px 0 0 0" label="日期范围">
            <div v-for="(item,idx) in collision.dscList" :key="idx+''" v-if="item.type=='qTime'"
                 style="margin-bottom: 5px">
              <el-date-picker v-model="item.qTime" type="daterange" range-separator="至" style="width: 250px"
                              value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期"
                              :default-time="['00:00:00', '23:59:59']" format="yyyy-MM-dd"
                              :picker-options="pickerBeginDate" size="medium">
              </el-date-picker>
              <el-tooltip class="item" effect="dark" content="开始时间" placement="bottom">
                <el-time-picker v-model="item.time[0]" style="width:120px" value-format="HH:mm:ss"
                                placeholder="开始时间" size="medium">
                </el-time-picker>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="结束时间" placement="bottom">
                <el-time-picker v-model="item.time[1]" style="width:120px" value-format="HH:mm:ss"
                                placeholder="结束时间" size="medium">
                </el-time-picker>
              </el-tooltip>
              <el-button type="text" size="medium" @click="deleteItem(idx)" v-if="idx>5">删除</el-button>
            </div>
          </el-form-item>
          <el-form-item align="left" style="margin: 0 0 10px 0">
            <el-button plain size="medium" icon="el-icon-plus" @click="addParam()">日期范围</el-button>
          </el-form-item>
          <hr style="background-color: #D7D7D7;border: none;height: 1px;margin: 20px"/>
          <el-form-item align="left" v-for="(item,idx) in collision.dscList" :key="idx+''" style="margin: 10px 0"
                        :label="item.type=='places'?'IMSI采集场所':item.type=='isps'?'IMSI运营商':item.type=='imsi'?'指定IMSI':'IMSI归属地'"
                        v-if="item.type!=='qTime'">
            <el-select v-model="item.places" size="medium" filterable multiple collapse-tags style="width:430px"
                       clearable v-if="item.type=='places'" placeholder="选择场所" :filter-method="pinyinMatch">
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
            <el-button type="primary" size="medium" @click="showMap(idx)" v-if="item.type=='places'">地图
            </el-button>
            <el-select v-model="item.isps" style="width:500px" size="medium" multiple collapse-tags
                       v-if="item.type=='isps'" placeholder="选择运营商">
              <el-option :label="param.label" :value="param.value" v-for="param in operators"
                         :key="param.value"></el-option>
            </el-select>
            <el-tooltip class="item" effect="dark" content="归属地格式应为XX省XX市，例：广东省深圳市" placement="bottom">
              <el-input v-model="item.regional" placeholder="可输入多个归属地，用逗号隔开" size="medium"
                        style="width: 500px" v-if="item.type=='regional'"></el-input>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="IMSI应为15位数字" placement="bottom">
              <el-input v-model="item.imsi" placeholder="可输入多个IMSI，用逗号隔开" size="medium"
                        style="width: 500px" v-if="item.type=='imsi'"></el-input>
            </el-tooltip>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button type="primary" @click="saveParam()" :loading="listLoading" size="medium"
                     v-show="getButtonVial('collision:addOrUpdateDataSource')">保存
          </el-button>
          <el-button @click="runSetParam=false" size="medium">取消</el-button>
        </div>
      </el-dialog>
      <!--IMSI记录-->
      <div class="device">
        <el-dialog title="IMSI记录" :visible.sync="runImsiList" width="96%">
          <imsiList ref="imsiList" v-bind:dataId="dataId"></imsiList>
        </el-dialog>
      </div>
      <!--分析结果-->
      <div class="device">
        <el-dialog title="分析结果" :visible.sync="runImsiResult" width="96%">
          <imsiResultList ref="imsiResultList" v-bind:sourceId="sourceId"></imsiResultList>
        </el-dialog>
      </div>
      <!--统计结果-->
      <div class="device">
        <el-dialog title="" :visible.sync="runResult" width="96%">
          <imsiCount ref="place" v-bind:sourceData="sourceData"></imsiCount>
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
      <!--修改任务-->
      <el-dialog title="修改任务" width="600px" :visible.sync="runModifyTask">
        <div class="block">
          <el-form label-width="100px" :model="task" label-position="right">
            <el-form-item label="任务名称" align="left" prop="taskName">
              <el-input v-model="task.taskName" placeholder="输入任务名称" style="width: 300px" :maxlength=12></el-input>
            </el-form-item>
            <el-form-item label="关联案件" align="left" style="margin:0" prop="caseId">
              <el-select v-model="task.caseId" placeholder="选择案件" filterable clearable>
                <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item align="left" style="margin:0">
              <el-button type="primary" style="margin-top:30px" @click="modifyTask()">确认</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
      <!--差集选择第一个-->
      <div class="device">
        <el-dialog title="标记差集分析的计算顺序" width="600px" :visible.sync="runSubtract">
          <div class="block">
            <div style="text-align: left;color: #999">差集分析方式：根据已选数据集，查询出在在第一组出现且在其他组未出现的IMSI。</div>
            <div style="text-align: left;font-size: 15px;color: #000;font-weight: bold;margin-top: 10px">
              请在下列已选定的数据集中，设定第一组。
            </div>
            <el-table :data="subArr" class="center-block" stripe>
              <el-table-column align="left" prop="name" label="数据源" :formatter="formatterAddress"></el-table-column>
              <el-table-column align="left" label="操作" min-width="80" max-width="100">
                <template slot-scope="scope">
                  <div v-show="scope.$index==0" style="color: #5daf34">第一组</div>
                  <el-button type="text" @click="moveTop(scope.$index)" v-show="scope.$index!=0">移至顶部</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="block" style="margin-top:10px">
              <el-button @click="runSubtract = false;subArr=[]" size="medium">取消</el-button>
              <el-button type="primary" @click="runSubtract = false;addRelany('subtract')" size="medium">确定</el-button>
            </div>
          </div>
        </el-dialog>
      </div>
      <!--使用帮助-->
      <div class="device">
        <el-dialog title="使用帮助" width="80%" :visible.sync="runHelpDoc">
          <helpDoc></helpDoc>
        </el-dialog>
      </div>
    </section>
  </div>
</template>

<script>
  import {numValid} from "../../../assets/js/api";
  import {formatDate, isPC, buttonValidator, compareTime} from "../../../assets/js/util";
  import imsiCount from '../collision/ImsiCount.vue';
  import imsiList from '../collision/ImsiList.vue';
  import imsiResultList from '../collision/ImsiResultList.vue';
  import helpDoc from '../collision/HelpDoc.vue';
  import PlaceMap from '../PlaceMap';
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        dialogWidth: isPC() ? '35%' : '90%',
        taskId: this.$route.query.taskId || '',
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 235,
        collision: {
          name: '数据源1', dscList: [{
            type: 'qTime', time: ['00:00:00', '23:59:59'],
            qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
              new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
          }, {type: 'places', places: []}, {type: 'isps', isps: []}, {type: 'regional', regional: ''},
            {type: 'imsi', imsi: ''}]
        },
        runHelpDoc: false, runSubtract: false, runModifyTask: false, runImsiList: false,
        runImsiResult: false, runResult: false, mapVisible: false, runSetParam: false,
        sourceId: '', dataId: '', sourceData: '', selResults: [], subArr: [], pIndx: 0, task: {},
        cases: [], records: [], results: [], places: [], placesCopy: [], placeList: [], selResources: [],
        listLoading: false, intervalid: null, nameModify: false,
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        resultModes: [{value: 'intersect', label: '交集'}, {value: 'union', label: '并集'},
          {value: 'subtract', label: '差集'}],
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
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
      this.intervalid = null;
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
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
      //定时刷新数据源、分析任务列表
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getData();
            this.getParams();
          }, 10 * 1000);
        }
      },
      //终止分析
      stopAnalysis(id) {
        this.$confirm('当前任务还未分析完成，结果未生成，如果终止分析，将不可查看分析结果与数据统计。确定终止该分析进程?',
          '提示', {type: 'info'}).then(() => {
          this.$post('/collision/stopAnalysis/' + id, {}, "操作成功").then((data) => {
            if ("000000" === data.code) {
              this.getData()
            }
          }).catch((err) => {
          });
        })
      },
      //重新分析
      reAnalysis(id) {
        this.$post('/collision/reanalysis/' + id, {}, "操作成功").then((data) => {
          if ("000000" === data.code) {
            this.getData()
          }
        }).catch((err) => {
        });
      },
      //切换交并分析的分析方式
      handleModeChange(val, row) {
        var str = (val == 'intersect' ? '交集' : val == 'union' ? '并集' : val == 'subtract' ? '差集' : '--');
        this.$confirm('确定即按照' + str + '的分析方式重新分析当前任务?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/addOrUpdateAnalyseTask', row, "修改成功").then((data) => {
            if ("000000" === data.code) {
              this.getData()
            }
          }).catch((err) => {
          });
        }).catch((err) => {
          this.getData()
        });
      },
      //数据源展示条件
      showSetParam(val, data) {
        if (val == 0) {//添加数据源时，默认2个条件，且不可修改；日期和时间必选
          this.collision = {
            name: '数据源' + (this.records.length + 1),
            dscList: [{
              type: 'qTime', time: ['00:00:00', '23:59:59'],
              qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
                new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()]
            }, {type: 'places', places: []}, {type: 'isps', isps: []}, {type: 'regional', regional: ''},
              {type: 'imsi', imsi: ''}]
          };
        } else {//数据源列表里的条件展示
          var param = {name: data.name, id: data.id, hiveView: data.hiveView};
          var arr = [];
          data.dscList.forEach((item) => {
            if (item.type == 'qTime') {
              arr.push({
                type: item.type, qTime: [item.startDate * 1000, item.endDate * 1000],
                time: [item.startTime, item.endTime]
              });
            } else {
              var par = {type: item.type};
              par[item.type] = item[item.type];
              arr.push(par);
            }
          });
          param.dscList = arr;
          this.collision = param;
        }
        this.runSetParam = true;
      },
      //场所地图
      showMap(idx) {
        this.pIndx = idx;
        this.mapVisible = true;
        this.$nextTick(() => {
          this.$refs.map.clearArea();
        });
      },
      //地图选择场所
      setPlaceList() {
        this.collision.dscList[this.pIndx].places = this.placeList;
        this.mapVisible = false;
      },
      //获得地图选择的场所
      getPlaceList(pos) {
        this.placeList = pos;
      },
      //数据源/交并分析的统计页面展示
      showImsi(id, type) {
        let param = {sourceId: id, dataType: type};
        this.sourceData = JSON.stringify(param);
        this.runResult = true;
      },
      //添加条件参数
      addParam() {
        var param = {
          type: 'qTime', time: ['00:00:00', '23:59:59'],
          qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()]
        };
        this.collision.dscList.push(param);
      },
      deleteItem(idx) {
        this.collision.dscList.splice(idx, 1);
      },
      //修改任务名称
      modifyTask() {
        if (this.task.taskName.length === 0) {
          this.$message.error('请输入任务名称');
          return;
        }
        if (this.task.caseId.length === 0) {
          this.$message.error('请选择关联案件');
          return;
        }
        this.cases.forEach((item) => {
          if (item.id == this.task.caseId) {
            this.task.caseName = item.caseName;
          }
        });
        this.$post('/collision/update', this.task, "修改成功").then((data) => {
          if ("000000" === data.code) {
            this.runModifyTask = false;
            this.taskDetail()
          }
        }).catch((err) => {
        });
      },
      //创建交并分析
      getRowKey(row) {
        return row.id
      },
      selDataChange(sels) {
        this.selResources = sels;
      },
      selResultChange(sels) {
        this.selResults = sels;
      },
      //并集的时候需要选择第一个并的数据
      showSubtract() {
        if (this.judgeState()) return;
        this.subArr = [];
        this.selResources.forEach((item) => {
          this.subArr.push({id: item.id + '_source', name: item.name});
        });
        this.selResults.forEach((item) => {
          this.subArr.push({id: item.id + '_result', name: item.name});
        });
        this.runSubtract = true;
      },
      moveTop(index) {
        if (index != 0) {
          this.subArr.unshift(this.subArr.splice(index, 1)[0]);
        }
      },
      //判断数据源/分析任务是否是成功状态的
      judgeState() {
        let isFail = false;
        for (let m = 0; m < this.selResults.length; m++) {
          let status = this.selResults[m].status;
          if (status != 'FINISH') {
            isFail = true;
            break;
          }
        }
        if (isFail) {//交并差数据只能由成功的数据源、交并任务开始
          this.$message.error('请选择已完成的分析任务');
        }
        return isFail;
      },
      //判断数据源/分析任务是否是成功状态的
      addRelany(val) {
        if (this.judgeState()) return;
        let arr = [], str = [];
        if (val == 'subtract') {
          this.subArr.forEach((item) => {
            arr.push(item.id);
            str.push(item.name);
          });
        } else {
          this.selResources.forEach((item) => {
            arr.push(item.id + '_source');
            str.push(item.name);
          });
          this.selResults.forEach((item) => {
            arr.push(item.id + '_result');
            str.push(item.name);
          });
        }
        let param = {
          operator: val, dataSourceIds: arr, collisionTaskId: this.taskId,
          name: '交并' + (this.results.length + 1), dataSource: str.join(',')
        };
        this.listLoading = true;
        this.$post('/collision/addOrUpdateAnalyseTask', param, '创建成功').then((data) => {
          this.listLoading = false;
          if ("000000" === data.code) {
            this.subArr = [];
            this.$refs.recordTable.clearSelection();
            this.$refs.resultTable.clearSelection();
            this.getData();
          }
        }).catch((err) => {
          this.listLoading = false;
        });
      },
      //保存、修改数据源的条件
      saveParam() {
        //判断条件是否为空
        var isBol = true;
        if (this.collision.name.length == 0) {
          this.$message.error('输入数据源名称');
          isBol = false;
        }
        this.collision.dscList.forEach((item) => {
          if (item.type == 'regional' && item.regional.length > 0) {
            item.regional = item.regional.replace(",", "，");
          }
          if (item.type == 'imsi' && item.imsi.length > 0) {
            item.imsi = item.imsi.replace(",", "，");
            let imsiArr = item.imsi.split("，");
            imsiArr.forEach((imsi) => {
              if (!numValid(imsi) || imsi.length != 15) {
                this.$message.error('请输入15位正确的IMSI');
                isBol = false;
              }
            });
          }
          if (item.type == 'qTime') {
            if (!item.qTime || item.qTime.length == 0) {
              this.$message.error('请选择日期');
              isBol = false;
            }
            if (!item.time || item.time.length == 0) {
              this.$message.error('请选择时段');
              isBol = false;
            } else if (!item.time[0] || !item.time[1]) {
              this.$message.error('请选择时段');
              isBol = false;
            } else if (!compareTime(item.time[0], item.time[1])) {
              this.$message.error('结束时间要大于开始时间');
              isBol = false;
            }
          }
        });
        if (isBol) {//条件全部符合
          var param = {taskId: this.taskId, name: this.collision.name};
          var arr = [];
          this.collision.dscList.forEach((item) => {
            if (item.type == 'qTime') {
              arr.push({
                type: item.type, startTime: item.time[0], endTime: item.time[1],
                startDate: item.qTime[0] / 1000, endDate: item.qTime[1] / 1000
              });
            } else {
              var child = {type: item.type};
              child[item.type] = item[item.type];
              arr.push(child);
            }
          });
          param.dscList = arr;
          if (this.collision.id) {
            param.id = this.collision.id;
            param.hiveView = this.collision.hiveView;
            this.$confirm('确认即按照本次筛选结果重新进行数据统计/交并分析',
              '提示', {type: 'info'}).then(() => {
              this.listLoading = true;
              this.$post('/collision/addOrUpdateDataSource', param, "修改成功").then((data) => {
                this.listLoading = false;
                this.runSetParam = false;
                if ("000000" === data.code) {
                  this.nameModify = true;
                  this.getParams()
                }
              })
            })
          } else {
            this.listLoading = true;
            this.$post('/collision/addOrUpdateDataSource', param, "创建成功").then((data) => {
              this.listLoading = false;
              this.runSetParam = false;
              if ("000000" === data.code) {
                this.getParams()
              }
            })
          }
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
      },
      //删除、复制数据源/交并分析
      deleteTask() {
        let arr1 = [], arr2 = [];
        this.selResources.forEach((item) => {
          arr1.push(item.id);
        });
        this.selResults.forEach((item) => {
          arr2.push(item.id);
        });
        this.$confirm('确定要删除该数据源/交并分析吗?', '提示', {type: 'info'}).then(() => {
          if (arr1.length > 0) {
            this.listLoading = true;
            this.$post('/collision/deleteTaskOrDataSourceOrResult', {type: 'dataSource', ids: arr1},
              '数据源删除成功').then((data) => {
              this.listLoading = false;
              if ("000000" === data.code) {
                this.$refs.recordTable.clearSelection();
                this.getParams();
              }
            }).catch((err) => {
              this.listLoading = false;
            });
          }
          if (arr2.length > 0) {
            this.listLoading = true;
            this.$post('/collision/deleteTaskOrDataSourceOrResult', {type: 'analyseTask', ids: arr2},
              '交并分析删除成功').then((data) => {
              this.listLoading = false;
              if ("000000" === data.code) {
                this.$refs.resultTable.clearSelection();
                this.getData();
              }
            }).catch((err) => {
              this.listLoading = false;
            });
          }
        }).catch(() => {
        });
      },
      copyTask() {
        let arr1 = [], arr2 = [];
        this.selResources.forEach((item) => {
          arr1.push(item.id);
        });
        this.selResults.forEach((item) => {
          arr2.push(item.id);
        });
        if (arr1.length > 0) {
          this.listLoading = true;
          this.$post('/collision/copyDataSourceOrResult', {type: 'dataSource', ids: arr1}, '数据源复制成功').then((data) => {
            this.listLoading = false;
            if ("000000" === data.code) {
              this.$refs.recordTable.clearSelection();
              this.getParams();
            }
          }).catch((err) => {
            this.listLoading = false;
          });
        }
        if (arr2.length > 0) {
          this.listLoading = true;
          this.$post('/collision/copyDataSourceOrResult', {type: 'analyseTask', ids: arr2}, '交并分析复制成功').then((data) => {
            this.listLoading = false;
            if ("000000" === data.code) {
              this.$refs.resultTable.clearSelection();
              this.getData();
            }
          }).catch((err) => {
            this.listLoading = false;
          });
        }
      },
      //获取交并分析列表
      getData() {
        this.$post('/collision/getAnalyseTaskList/' + this.taskId, {}).then((data) => {
          if (this.nameModify) {
            data.data.forEach((item) => {
              let dataArr = [];
              item.dataSourceIds.forEach((sourceId) => {
                let id_s = sourceId.substr(0, sourceId.indexOf('_'));
                if (sourceId.indexOf('result') > 0) {
                  data.data.forEach((result) => {
                    if (result.id == id_s) {
                      dataArr.push(result.name)
                    }
                  });
                }
                if (sourceId.indexOf('source') > 0) {
                  this.records.forEach((records) => {
                    if (records.id == id_s) {
                      dataArr.push(records.name)
                    }
                  });
                }
              });
              item.dataSource = dataArr.join(',');
            });
          }

          this.results = data.data;
          this.nameModify = false;
        }).catch((err) => {
          this.results = [];
        });
      },
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
          this.placesCopy = Object.assign([], this.places);
        }).catch((err) => {
          this.places = [];
          this.placesCopy = [];
        });
      },
      //任务详情
      taskDetail() {
        this.$post('/collision/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
        }).catch((err) => {
        });
      },
      //获取数据源列表
      getParams() {
        this.$post('/collision/getDataSourceList/' + this.taskId, {}).then((data) => {
          if ("000000" === data.code) {
            data.data.forEach((item) => {
              var dateStr = [], placeStr = [], ispStr = [], reginStr = [], imsiStr = [];
              var contentStr = '';
              item.dscList.forEach((child) => {
                if (child.type == 'qTime') {
                  var qStr = formatDate(new Date(child.startDate * 1000), 'yyyy-MM-dd') + '至' + formatDate(new Date(child.endDate * 1000), 'yyyy-MM-dd') +
                    ' 时间:' + child.startTime + '至' + child.endTime;
                  dateStr.push(qStr);
                } else if (child.type == 'places') {
                  if (child.places.length > 0) {
                    var pArr = [];
                    this.places.forEach((p1) => {
                      child.places.forEach((p2) => {
                        if (p1.id == p2) {
                          pArr.push(p1.placeName);
                        }
                      })
                    });
                    var pStr = pArr.join(',');
                    placeStr.push(pStr);
                  }
                } else if (child.type == 'isps') {
                  if (child.isps.length > 0) {
                    var ispArr = [];
                    child.isps.forEach((isp) => {
                      ispArr.push(isp == 0 ? '移动' : isp == 1 ? '联通' : isp == 2 ? '电信' : '未知');
                    });
                    let iStr = ispArr.join(",");
                    ispStr.push(iStr);
                  }
                } else if (child.type == 'regional') {
                  if (child.regional.length > 0) {
                    let rStr = child.regional;
                    reginStr.push(rStr);
                  }
                } else if (child.type == 'imsi') {
                  if (child.imsi.length > 0) {
                    let iStr = child.imsi;
                    imsiStr.push(iStr);
                  }
                }
              });
              if (dateStr.length > 0) {
                contentStr += ' 日期:' + dateStr.join(',');
              }
              if (placeStr.length > 0) {
                contentStr += ' 场所:' + placeStr.join(',');
              }
              if (ispStr.length > 0) {
                contentStr += ' 运营商:' + ispStr.join(',');
              }
              if (reginStr.length > 0) {
                contentStr += ' 归属地:' + reginStr.join(',');
              }
              if (imsiStr.length > 0) {
                contentStr += ' IMSI:' + imsiStr.join(',');
              }
              item.contentStr = contentStr;
            });
            this.records = data.data;
          }
        });
      },
      //获取案件列表
      getCases() {
        this.$post('/case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';

      this.getCases();
      this.getPlaces();
      this.taskDetail();
      this.getData();
      this.getParams();
      this.statusTask();
    },
    components: {
      imsiCount, imsiList, imsiResultList, PlaceMap, helpDoc
    }
  }
</script>
<style scoped>
  .title-head {
    height: 36px;
    line-height: 36px;
    text-align: left;
    padding-left: 20px;
    border-bottom: 1px solid #D7D7D7;
  }

  .data-content {
    color: #888;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
</style>
