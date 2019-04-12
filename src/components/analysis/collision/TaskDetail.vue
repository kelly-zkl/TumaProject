<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="padding: 0;margin: 0">
        <el-row style="margin: 0;padding: 0">
          <el-col :lg="8" :xl="6" align="left" style="text-align: left;padding:15px 20px">
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
          <el-col :lg="12" :xl="14" align="left" :loading="listLoading"
                  style="text-align: left;border-left: 1px solid #D0CACF;padding-left: 80px">
            <el-button type="text" @click="showSetParam(0)" v-show="getButtonVial('collision:addOrUpdateDataSource')"
                       style="border-right: 1px solid #D0CACF;border-radius: 0;padding:0 20px 0 0">
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
                       style="border-right: 1px solid #D0CACF;border-radius: 0;padding:0 20px 0 0;"
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
          <el-col :lg="4" :xl="4" align="right" style="text-align: right;padding: 10px 20px">
            <el-button type="text" style="color: #999" @click="runHelpDoc=true">
              <i class="fa fa-question-circle" style="margin-right:5px;color:#FFCC00;font-size:20px"></i>使用帮助
            </el-button>
          </el-col>
        </el-row>
        <el-row style="border-top: 1px solid #D0CACF">
          <el-col :span="11" style="border-right: 1px solid #D0CACF">
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
                        <el-button type="text" class="fa fa-file-text-o fa-lg" @click="showImsi(0,scope.row.id)"
                                   style="margin: 0;padding: 0 10px" :disabled="scope.row.status==0"
                                   v-show="getButtonVial('collision:queryRecord')"></el-button>
                      </el-tooltip>
                      <el-tooltip class="item" effect="dark" content="查看统计" placement="bottom">
                        <el-button type="text" class="fa fa-bar-chart fa-lg" style="margin: 0;padding: 0"
                                   @click="showImsi(2,scope.row.id,'source')" :disabled="scope.row.status==0"
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
                               min-width="80" max-width="120"></el-table-column>
              <el-table-column align="left" prop="dataSource" label="数据源" :formatter="formatterAddress"
                               min-width="120" max-width="180"></el-table-column>
              <el-table-column align="left" prop="operator" label="分析方式" min-width="80" max-width="100">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.operator" style="width:80px" size="medium"
                             @change="handleModeChange($event,scope.row)"
                             :disabled="!getButtonVial('collision:addOrUpdateAnalyseTask')">
                    <el-option :label="param.label" :value="param.value" v-for="param in resultModes"
                               :key="param.value"></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column align="left" prop="status" label="状态" min-width="70" max-width="90">
                <template slot-scope="scope">
                  <span style="color:#00C755" v-show="scope.row.status == 'FINISH'">已完成</span>
                  <span style="color:#dd6161" v-show="scope.row.status == 'FAILE'">失败</span>
                  <span style="color:#D76F31" v-show="scope.row.status == 'WAIT'">等待中</span>
                  <span style="color:#6799FD" v-show="scope.row.status == 'EXECUTION'">分析中</span>
                  <span style="color:#999" v-show="scope.row.status == 'STOP'">终止</span>
                </template>
              </el-table-column>
              <el-table-column align="left" label="操作" min-width="90" max-width="100">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="查看分析结果" placement="bottom">
                    <el-button type="text" class="fa fa-list-alt fa-lg" @click="showImsi(1,scope.row.id)"
                               v-show="getButtonVial('collision:getAnalyseResultList')&&scope.row.status=='FINISH'"></el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="查看统计结果" placement="bottom">
                    <el-button type="text" class="fa fa-bar-chart fa-lg" @click="showImsi(2,scope.row.id,'result')"
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
      <el-dialog title="设立条件" width="700px" :visible.sync="runSetParam" :show-close="false"
                 :close-on-press-escape="false" :close-on-click-modal="false">
        <el-form :model="collision" label-position="left" label-width="1px">
          <el-form-item align="left" style="margin: 0 0 10px 0">
            <span style="margin-right: 20px">数据源名称</span>
            <el-input v-model="collision.name" size="medium" :maxLength="10" placeholder="输入数据源名称"
                      style="width: 200px">
            </el-input>
          </el-form-item>
          <el-form-item align="left" style="margin: 0 0 10px 0">
            符合下列
            <el-radio-group v-model="collision.collType" size="medium">
              <el-radio-button label="and">全部(and)</el-radio-button>
              <el-radio-button label="or">任一(or)</el-radio-button>
            </el-radio-group>
            条件的数据集
          </el-form-item>
          <el-form-item align="left" v-for="(item,idx) in collision.dscList" :key="idx+''" style="margin: 0 0 10px 0">
            <el-select v-model="item.type" style="width:160px" size="medium" @change="handleParamChange($event,idx)">
              <el-option :label="param.label" :value="param.value" v-for="param in conParams"
                         :key="param.value"></el-option>
            </el-select>
            <el-select v-model="item.field" style="width:80px" size="medium">
              <el-option :label="param.label" :value="param.value" v-for="param in fields" :key="param.value"
                         :disabled="item.type=='qTime'&&param.value=='ne'"></el-option>
            </el-select>
            <el-date-picker v-model="item.qTime" type="daterange" range-separator="至" style="width: 250px"
                            value-format="timestamp" start-placeholder="开始日期" end-placeholder="结束日期"
                            :default-time="['00:00:00', '23:59:59']" format="yyyy-MM-dd"
                            :picker-options="pickerBeginDate" size="medium" v-show="item.type=='qTime'">
            </el-date-picker>
            <el-tooltip class="item" effect="dark" content="开始时间" placement="bottom">
              <el-time-picker v-model="item.time[0]" style="width:120px" value-format="HH:mm:ss"
                              placeholder="开始时间" size="medium" v-if="item.type=='time'">
              </el-time-picker>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="结束时间" placement="bottom">
              <el-time-picker v-model="item.time[1]" style="width:120px" value-format="HH:mm:ss"
                              placeholder="结束时间" size="medium" v-if="item.type=='time'">
              </el-time-picker>
            </el-tooltip>
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
                       v-show="collision.dscList.length>1">删除
            </el-button>
          </el-form-item>
          <el-form-item align="left" style="margin: 0 0 10px 0">
            <el-button plain size="medium" icon="el-icon-plus" @click="addParam()">添加</el-button>
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
          <imsiList ref="imsiList" v-bind:sourceId="sourceId"></imsiList>
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
          <el-tabs v-model="activeItem" @tab-click="handleType" type="card">
            <el-tab-pane label="归属地" name="regional">
              <regionalCount ref="regional" v-bind:sourceData="sourceData"></regionalCount>
            </el-tab-pane>
            <el-tab-pane label="采集辖区" name="area">
              <areaCount ref="area" v-bind:sourceData="sourceData"></areaCount>
            </el-tab-pane>
            <el-tab-pane label="采集场所" name="place">
              <placeCount ref="place" v-bind:sourceData="sourceData"></placeCount>
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
  import areaCount from '../collision/AreaCount.vue';
  import placeCount from '../collision/PlaceCount.vue';
  import regionalCount from '../collision/RegionalCount.vue';
  import imsiList from '../collision/ImsiList.vue';
  import imsiResultList from '../collision/ImsiResultList.vue';
  import helpDoc from '../collision/HelpDoc.vue';
  import PlaceMap from '../PlaceMap';

  export default {
    data() {
      return {
        dialogWidth: isPC() ? '35%' : '90%',
        taskId: this.$route.query.taskId || '',
        tableHeight: window.innerHeight - 235,
        collision: {
          collType: 'and', name: '数据源1', dscList: [{
            type: 'qTime', field: 'equal',
            qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
              new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()]
          }]
        },
        runHelpDoc: false,
        runSubtract: false,
        runModifyTask: false,
        runImsiList: false,
        runImsiResult: false,
        runResult: false,
        mapVisible: false,
        runSetParam: false,
        sourceId: '',
        sourceData: '',
        activeItem: 'regional',
        cases: [],
        records: [],
        results: [],
        places: [],
        placeList: [],
        selResources: [],
        selResults: [],
        subArr: [],
        listLoading: false,
        intervalid: null,
        nameModify: false,
        pIndx: 0,
        task: {},
        conParams: [{value: 'qTime', label: 'IMSI采集日期范围'}, {value: 'time', label: 'IMSI采集每日时段'},
          {value: 'places', label: 'IMSI采集场所'}, {value: 'isps', label: 'IMSI运营商'},
          {value: 'regional', label: 'IMSI归属地'}, {value: 'imsi', label: '指定IMSI'}],
        fields: [{value: 'equal', label: '等于'}, {value: 'ne', label: '排除'}],//小于lt，大于gt
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
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //定时刷新设备的在线状态
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
        if (val == 0) {
          this.collision = {
            collType: 'and', name: '数据源' + (this.records.length + 1), dscList: [{
              type: 'qTime', field: 'equal',
              qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
                new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()]
            }]
          };
        } else {
          var param = {name: data.name, collType: data.collType, id: data.id};
          var arr = [];
          data.dscList.forEach((item) => {
            if (item.type == 'qTime') {
              arr.push({type: item.type, field: item.field, qTime: [item.startDate * 1000, item.endDate * 1000]});
            } else if (item.type == 'time') {
              arr.push({type: item.type, field: item.field, time: [item.startTime, item.endTime]});
            } else {
              var par = {type: item.type, field: item.field};
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
        this.$refs.map.clearArea();
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
      //IMSI记录/分析结果页签展示
      showImsi(val, id, type) {
        this.sourceId = id;
        if (val == 0) {
          this.runImsiList = true;
        } else if (val == 1) {
          this.runImsiResult = true;
        } else {
          let param = {sourceId: id, dataType: type};
          this.sourceData = JSON.stringify(param);
          this.runResult = true;
          this.activeItem = 'regional';
          this.handleType();
        }
      },
      //条件选项择变化
      handleParamChange(val, idx) {
        if (val == 'qTime') {
          this.collision.dscList[idx][val] = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 30 * 60 * 60 * 24 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        } else if (val == 'time') {
          this.collision.dscList[idx][val] = ['00:00:00', '23:59:59'];
        } else if (val == 'isps' || val == 'places') {
          this.collision.dscList[idx][val] = [];
        } else {
          this.collision.dscList[idx][val] = '';
        }
      },
      //添加条件参数
      addParam() {
        var param = {
          type: 'qTime', field: 'equal',
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
      showSubtract() {
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
      addRelany(val) {
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
      //保存
      saveParam() {
        //判断条件是否为空
        var isBol = true;
        if (this.collision.name.length == 0) {
          this.$message.error('输入数据源名称');
          isBol = false;
        }
        this.collision.dscList.forEach((item) => {
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
          if (item.type == 'qTime') {
            if (!item.qTime || item.qTime.length == 0) {
              this.$message.error('请选择日期');
              isBol = false;
            }
          }
          if (item.type == 'time') {
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
          var param = {collType: this.collision.collType, taskId: this.taskId, name: this.collision.name};
          var arr = [];
          this.collision.dscList.forEach((item) => {
            if (item.type == 'qTime') {
              arr.push({
                type: item.type, field: item.field,
                startDate: item.qTime[0] / 1000, endDate: item.qTime[1] / 1000
              });
            } else if (item.type == 'time') {
              arr.push({
                type: item.type, field: item.field,
                startTime: item.time[0], endTime: item.time[1]
              });
            } else {
              var child = {type: item.type, field: item.field};
              child[item.type] = item[item.type];
              arr.push(child);
            }
          });
          param.dscList = arr;
          if (this.collision.id) {
            param.id = this.collision.id;
            this.$confirm('当前数据集正在参与交并分析任务，确认即按照本次筛选结果重新进行数据统计、交并分析等。确定按照新的筛选结果进行数据分析？',
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
      //归属地、采集辖区、采集场所页签切换
      handleType(tab, event) {
        if (this.activeItem == 'regional') {
          this.$refs.regional.clearData();
        } else if (this.activeItem == 'area') {
          this.$refs.area.clearData();
        } else {
          this.$refs.place.clearData();
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
      },
      //删除数据源/交并分析
      deleteTask() {
        let arr1 = [], arr2 = [];
        this.selResources.forEach((item) => {
          arr1.push(item.id);
        });
        this.selResults.forEach((item) => {
          arr2.push(item.id);
        });
        this.$confirm('确定要删除该数据源/任务吗?', '提示', {type: 'info'}).then(() => {
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
        }).catch((err) => {
          this.places = [];
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
              var dateStr = [], timeStr = [], placeStr = [], ispStr = [], reginStr = [], imsiStr = [];
              item.dscList.forEach((child) => {
                if (child.type == 'qTime') {
                  var qStr = (child.field == 'equal' ? '等于' : '排除') + formatDate(new Date(child.startDate * 1000), 'yyyy-MM-dd') + '至' + formatDate(new Date(child.endDate * 1000), 'yyyy-MM-dd');
                  dateStr.push(qStr);
                } else if (child.type == 'time') {
                  var tStr = (child.field == 'equal' ? '等于' : '排除') + child.startTime + '至' + child.endTime;
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
                  var pStr = (child.field == 'equal' ? '等于' : '排除') + pArr.join(',');
                  placeStr.push(pStr);
                } else if (child.type == 'isps') {
                  var ispArr = [];
                  child.isps.forEach((isp) => {
                    ispArr.push(isp == 0 ? '移动' : isp == 1 ? '联通' : isp == 2 ? '电信' : '未知');
                  });
                  var iStr = (child.field == 'equal' ? '等于' : '排除') + ispArr.join(",");
                  ispStr.push(iStr);
                } else if (child.type == 'regional') {
                  var rStr = (child.field == 'equal' ? '等于' : '排除') + child.regional;
                  reginStr.push(rStr);
                } else if (child.type == 'imsi') {
                  var iStr = (child.field == 'equal' ? '等于' : '排除') + child.imsi;
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
      areaCount, placeCount, regionalCount, imsiList, imsiResultList, PlaceMap, helpDoc
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
