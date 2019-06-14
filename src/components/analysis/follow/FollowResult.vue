<template>
  <div>
    <section class="content">
      <div class="add-appdiv gray-form" style="margin-bottom: 15px;padding: 0">
        <el-row style="border-bottom:1px #D7D7D7 solid;margin: 0">
          <el-col :span="12" align="left" style="text-align: left">
            <div style="font-size:15px;padding:10px 20px;text-align:left">伴随分析任务信息</div>
          </el-col>
          <el-col :span="12" align="right" style="text-align: right;padding-right: 30px">
            <router-link :to="{path:'/addFollow',query:{id:task.id}}">
              <el-button type="text" style="margin-right: 20px" v-show="getButtonVial('follow:update')">修改</el-button>
            </router-link>
            <el-button type="text" @click="deleteTask()" v-show="getButtonVial('follow:delete')">删除</el-button>
          </el-col>
        </el-row>
        <el-row style="padding: 15px 0">
          <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
            <el-col :span="6" align="left" style="text-align: left">
              <el-form-item label="任务编号" align="left" style="margin: 0;text-align: left">
                {{task.taskNo?task.taskNo : '--'}}
              </el-form-item>
              <el-form-item label="任务名称" align="left" style="margin: 0;text-align: left">
                {{task.taskName?task.taskName:'--'}}
              </el-form-item>
              <el-form-item label="任务状态" align="left" style="margin: 0;text-align: left">
                <span
                  v-bind:style="{fontSize:'15px',color:task.taskStatus=='EXECUTION'?'#6699FF':task.taskStatus =='FINISH'?'#00C755':task.taskStatus=='FAILE'?'#dd6161':task.taskStatus =='WAIT'?'#FF9900':task.taskStatus =='STOP'?'#999':'#333'}">
                  {{task.taskStatus === "EXECUTION" ? "进行中" : task.taskStatus === "FINISH" ? "已完成" :task.taskStatus=='FAILE'?'失败':task.taskStatus =='WAIT'?'等待中':task.taskStatus =='STOP'?'终止': "--"}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" align="left">
              <el-form-item label="分析对象" align="left" style="margin: 0;text-align: left">
                {{'['+followType+']'+task.followTarget?task.followTarget:'--'}}
              </el-form-item>
              <el-form-item label="日期范围" align="left" style="margin: 0;text-align: left">
                {{(task.startStr?task.startStr:'--')+' 至 '+ (task.endStr?task.endStr:'--')}}
              </el-form-item>
              <!--<el-form-item label="时间范围" align="left" style="margin: 0;text-align: left">-->
              <!--{{(task.repeatStartTime?task.repeatStartTime:'&#45;&#45;')+' 至 '+ (task.repeatEndTime?task.repeatEndTime:'&#45;&#45;')}}-->
              <!--</el-form-item>-->
              <el-form-item label="时间间隔" align="left" style="margin: 0;text-align: left">
                {{task.interval==0?0:task.interval}}
              </el-form-item>
            </el-col>
            <el-col :span="6" align="left">
              <el-form-item label="设备ID" align="left" style="margin: 0;text-align: left">
                {{task.device?task.device:'--'}}
              </el-form-item>
            </el-col>
            <el-col :span="6" align="right">
              <el-form-item label="创建时间" align="left" style="margin: 0;text-align: left">
                {{task.timeStr?task.timeStr:'--'}}
              </el-form-item>
              <el-form-item label="创建用户" align="left" style="margin: 0;text-align: left">
                {{task.createBy?task.createBy: '--'}}
              </el-form-item>
              <el-form-item label="关联案件" align="left" style="margin: 0;text-align: left">
                <el-button @click="gotoCaseDetail" type="text">{{task.caseName?task.caseName:'--'}}</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <el-row style="margin-bottom: 15px">
        <el-col :span="16" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="分析结果" name="result"></el-tab-pane>
            <el-tab-pane label="所有记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="gotoTurnIMSI()" :disabled="sels.length==0||uLogin!='uLogin'"
                     v-show="getButtonVial('workflow:translation:apply')&&activeItem=='result'&&task.followType=='IMSI'">
            翻码
          </el-button>
          <el-button type="primary" size="medium" @click="exportData()" v-show="getButtonVial(exportKey)">导出
          </el-button>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'result' && task.followType == 'IMSI'">
        <el-form :inline="true" :model="queryResult" align="left" v-show="getButtonVial('follow:queryResult')"
                 style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryResult.imsi" placeholder="IMSI" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryResult.isp" placeholder="运营商" style="width: 120px" size="medium" clearable>
              <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryResult.regional" placeholder="IMSI归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item label="伴随次数" style="margin-bottom: 10px">
            <el-input-number v-model="queryResult.count1" controls-position="right" :min="1"
                             :max="99999" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="queryResult.page=1;getResult()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="results" v-loading="listLoading1" class="center-block" stripe @selection-change="selsChange">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随次数" prop="followCount" min-width="125"
                           max-width="250"></el-table-column>
          <el-table-column align="left" label="置信度" prop="confidenceLevel" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="130" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImsi(scope.row)"
                         v-show="getButtonVial('archives:getImsiRecordByImsi')">查看IMSI
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                         :current-page.sync="queryResult.page" :page-sizes="[10, 15, 20, 30]"
                         :page-size="queryResult.size" :total="count1" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" v-show="activeItem == 'list' && task.followType == 'IMSI'">
        <el-form :inline="true" :model="queryRecord" align="left" v-show="getButtonVial('follow:queryRecord')"
                 style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryRecord.imsi" placeholder="IMSI" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryRecord.isp" placeholder="运营商" style="width: 120px" size="medium" clearable>
              <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                            start-placeholder="采集时间" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryRecord.regional" placeholder="IMSI归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="queryRecord.page=1;getList()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading2" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="源IMSI" prop="originalImsi" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="源时间" prop="originalUpTime" width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随IMSI" prop="imsi" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随时间" prop="upTime" min-width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="运营商" prop="isp" min-width="100"
                           max-width="120" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="100"
                           max-width="120" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="采集地点" prop="deviceName" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" min-width="125" max-width="250" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImsi(scope.row)"
                         v-show="getButtonVial('archives:getImsiRecordByImsi')">查看IMSI
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                         :current-page.sync="queryRecord.page" :page-sizes="[10, 15, 20, 30]"
                         :page-size="queryRecord.size" :total="count2" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" v-show="activeItem == 'result' && task.followType == 'FACE'">
        <el-form :inline="true" :model="queryResult" align="left" v-show="getButtonVial('follow:queryResult')"
                 style="text-align: left">
          <el-form-item label="年龄段" style="margin-bottom: 10px">
            <el-input-number v-model="queryResult.startAge" controls-position="right" :min="1"
                             :max="queryResult.endAge-1" style="width: 100px" size="medium"></el-input-number>
            <span>~</span>
            <el-input-number v-model="queryResult.endAge" controls-position="right" :min="queryResult.startAge+1"
                             :max="200" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="queryResult.sex" placeholder="性别" style="width: 100px" size="medium" clearable>
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="伴随次数" style="margin-bottom: 10px">
            <el-input-number v-model="queryResult.count1" controls-position="right" :min="1"
                             :max="99999" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="queryResult.page=1;getResult()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="results" v-loading="listLoading1" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="人脸图像" prop="imsi" min-width="150"
                           max-width="300" :formatter="formatterAddress">
            <template slot-scope="scope">
              <div style="height: 90px;line-height:90px">
                <img v-bind:src="scope.row.userFacePicURL?scope.row.userFacePicURL:imgPath"
                     @click="bigUrl=scope.row.userFacePicURL;runBigPic=true" :onerror="img404"
                     style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="left" label="年龄段" prop="age" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随次数" prop="followCount" min-width="125"
                           max-width="250"></el-table-column>
          <!--<el-table-column align="left" label="操作" width="130">-->
          <!--<template slot-scope="scope">-->
          <!--<el-button type="text" @click="gotoImsi(scope.row)" v-show="getButtonVial('follow:queryRecord')">查看IMSI-->
          <!--</el-button>-->
          <!--</template>-->
          <!--</el-table-column>-->
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                         :current-page.sync="queryResult.page" :page-sizes="[10, 15, 20, 30]"
                         :page-size="queryResult.size" :total="count1" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" style="margin-left: 10px" v-show="activeItem == 'list' && task.followType == 'FACE'">
        <el-form :inline="true" :model="queryRecord" align="left" v-show="getButtonVial('follow:queryRecord')"
                 style="text-align: left">
          <el-form-item label="年龄段" style="margin-bottom: 10px">
            <el-row>
              <el-input v-model="queryRecord.startAge" type="number" size="medium" style="width: 80px"
                        :maxlength=3></el-input>
              <span>~</span>
              <el-input v-model="queryRecord.endAge" type="number" size="medium" style="width: 80px"
                        :maxlength=3></el-input>
            </el-row>
          </el-form-item>
          <el-form-item>
            <el-select v-model="queryRecord.sex" placeholder="性别" style="width: 100px" size="medium" clearable>
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                            start-placeholder="开始时间" size="medium" end-placeholder="结束时间" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="queryRecord.page=1;getList()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading2" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="人脸图像" prop="imsi" min-width="150"
                           max-width="300" :formatter="formatterAddress">
            <template slot-scope="scope">
              <div style="height: 90px;line-height:90px">
                <img v-bind:src="scope.row.userFacePicURL?scope.row.userFacePicURL:imgPath"
                     @click="bigUrl=scope.row.userFacePicURL;runBigPic=true" :onerror="img404"
                     style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="left" label="年龄段" prop="age" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="采集时间" prop="upTime" min-width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="采集场所" prop="deviceName" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <!--<el-table-column align="left" label="操作" min-width="125" max-width="250">-->
          <!--<template slot-scope="scope">-->
          <!--<el-button type="text" @click="gotoImsi(scope.row)" v-show="getButtonVial('follow:queryRecord')">查看IMSI-->
          <!--</el-button>-->
          <!--</template>-->
          <!--</el-table-column>-->
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                         :current-page.sync="queryRecord.page" :page-sizes="[10, 15, 20, 30]"
                         :page-size="queryRecord.size" :total="count2" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </section>
    <!--查看大图-->
    <el-dialog title="查看大图" :visible.sync="runBigPic" width="500px" center>
      <div class="block">
        <el-row>
          <el-col :span="24" style="text-align: center" align="center">
            <img :src="bigUrl" style="max-width: 400px;max-height:400px;border-radius:6px;vertical-align:middle"/>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer" align="center" style="margin-top: 20px">
          <el-button type="primary" @click="runBigPic=false" size="medium">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator, encryData, decryData} from "../../../assets/js/util";

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        task: {},
        runBigPic: false,
        bigUrl: '',
        uLogin: localStorage.getItem('login'),
        taskId: this.$route.query.taskId || '',
        followType: this.$route.query.followType || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        dialogWidth: isPC() ? '35%' : '90%',
        activeItem: 'result',
        qTime: "",
        results: [], sels: [],
        exportKey: 'follow:export:analyze',
        queryResult: {page: 1, size: 10},
        listLoading1: false,
        count1: 0,
        records: [],
        queryRecord: {page: 1, size: 10},
        listLoading2: false,
        count2: 0,
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        pickerBeginDate: {
          shortcuts: [{
            text: '最近6小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 6);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近12小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 12);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }],
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
      /*翻码*/
      gotoTurnIMSI() {
        if (this.sels.length > 10) {
          this.$message.error('翻码最多支持10个IMSI');
          return;
        }
        var arr = [];
        this.sels.forEach((item) => {
          if (this.isSingle(item.imsi, arr)) {
            arr.push(item.imsi);
          }
        });
        var param = {caseId: this.task.caseId, task: ['follow', this.taskId], imsi: arr};
        sessionStorage.setItem("apply", JSON.stringify(param));
        this.$router.push({path: '/approvalApply', query: {type: 'follow'}});
      },
      //是否重复
      isSingle(val, arr) {
        let bol = true;
        arr.forEach((item) => {
          if (val == item) {
            bol = false;
          }
        });
        return bol;
      },
      selsChange(sels) {
        this.sels = sels;
      },
      //跳转案件详情页
      gotoCaseDetail() {
        if (this.task.caseId) {
          let routeData = this.$router.resolve({path: '/caseDetail', query: {caseId: this.task.caseId}});
          window.open(routeData.href, '_blank');
        }
      },
      handleType(val) {
        if (this.activeItem === 'result') {//分析结果
          this.getResult();
          this.exportKey = 'follow:export:analyze';
        } else {//所有记录
          this.getList();
          this.exportKey = 'follow:export:record';
        }
      },
      //伴随结果导出
      exportData() {
        let param = {};
        let pathUrl = "";
        let config;
        if (sessionStorage.getItem("user")) {
          let userId = JSON.parse(decryData(sessionStorage.getItem("user"))).userId;
          if (userId) {
            if (!param) {
              param = {}
            }
            let stringify = JSON.stringify(param);
            let token = md5(stringify + userId + "key-hz-20180123").toString();
            config = {headers: {token: token, tokenId: userId}, responseType: 'arraybuffer'};
          }
        }

        if (this.activeItem === 'result') {//伴随结果导出
          param = Object.assign({}, this.queryResult);
          param.page = 1;
          param.size = 100000;
          pathUrl = "/follow/export/analyze";
        } else {//伴随结果记录
          param = Object.assign({}, this.queryRecord);
          param.page = 1;
          param.size = 100000;
          pathUrl = "/follow/export/record";
        }
        this.axios.post(pathUrl, param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: imsi.imsi}});
        window.open(routeData.href, '_blank');
      },
      //删除伴随任务
      deleteTask() {
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/follow/delete', [this.taskId], '删除成功').then((data) => {
            if ("000000" === data.code) {
              if ("000000" === data.code)
                this.$router.go(-1);
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //清除查询条件
      clearData() {
        if (this.activeItem === "result") {
          this.queryResult = {page: 1, size: 10};
          this.getResult();
        } else {
          this.queryRecord = {page: 1, size: 10};
          this.qTime = '';
          this.getList();
        }
      },
      pageChange(index) {
        if (this.activeItem === "result") {
          this.queryResult.page = index;
          this.getResult();
        } else {
          this.queryRecord.page = index;
          this.getList();
        }
      },
      handleSizeChange(val) {
        if (this.activeItem === "result") {
          this.queryResult.size = val;
          this.getResult();
        } else {
          this.queryRecord.size = val;
          this.getList();
        }
      },
      //分析结果
      getResult() {
        this.queryResult.followTaskId = this.taskId;
        this.queryResult.followType = this.followType;

        this.listLoading1 = true;
        this.$post('/follow/queryResult', this.queryResult).then((data) => {
          this.results = data.data.list;
          this.count1 = data.data.count;
          this.listLoading1 = false;
        }).catch((err) => {
          this.results = [];
          this.count1 = 0;
          this.listLoading1 = false;
        });
      },
      //所有记录
      getList() {
        if (!!this.qTime) {
          this.queryRecord.startTime = Math.round(this.qTime[0] / 1000);
          this.queryRecord.endTime = Math.round(this.qTime[1] / 1000);
        } else {
          delete this.queryRecord['qTime'];
        }

        this.queryRecord.followTaskId = this.taskId;
        this.queryRecord.followType = this.followType;

        this.listLoading2 = true;
        this.$post('/follow/queryRecord', this.queryRecord).then((data) => {
          this.records = data.data.list;
          this.count2 = data.data.count;
          this.listLoading2 = false;
        }).catch((err) => {
          this.records = [];
          this.count2 = 0;
          this.listLoading2 = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {//0为男，1为女
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'upTime') {
          return row.upTime ? formatDate(new Date(row.upTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'originalUpTime') {
          return row.originalUpTime ? formatDate(new Date(row.originalUpTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'confidenceLevel') {
          return (row.confidenceLevel * 100).toFixed(1) + '%';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
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
      },
      //获取伴随详情
      getTaskDetail() {
        this.$post('/follow/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.device = '--';
          if (this.task.deviceId && this.task.deviceId.length > 0) {
            this.task.device = this.task.deviceId.join("，");
          }
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.startStr = formatDate(new Date(this.task.startDate * 1000), 'yyyy-MM-dd');
          this.task.endStr = formatDate(new Date(this.task.endDate * 1000), 'yyyy-MM-dd');
        }).catch((err) => {
        });
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.followType = this.$route.query.followType || '';

      this.getTaskDetail();
      this.getResult();
    }
  }
</script>
