<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="margin-bottom: 15px">
        <el-row>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px">任务名称</p>
            <p style="margin: 5px 20px 0 20px">{{task.taskName}}</p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px">任务类型</p>
            <p style="margin: 5px 20px 0 20px">
              {{task.followType == 'IMSI' ? 'IMSI' : task.followType == 'FACE' ? '图像' : 'MAC'}}</p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px">分析对象</p>
            <p style="margin: 5px 20px 0 20px">{{task.followTarget}}</p>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="text" @click="runTaskDetail = true">查看任务</el-button>
            <el-button type="text" @click="deleteTask()">删除任务</el-button>
          </el-col>
        </el-row>
      </div>
      <el-row style="margin-bottom: 15px">
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="分析结果" name="result"></el-tab-pane>
            <el-tab-pane label="所有记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="exportData()">导出数据</el-button>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'result'">
        <el-form :inline="true" :model="queryResult" align="left">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryResult.imsi" placeholder="输入IMSI" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryResult.isp" placeholder="选择运营商" style="width: 120px" size="medium" clearable>
              <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryResult.regional" placeholder="输入归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item label="伴随次数" style="margin-bottom: 10px">
            <el-input v-model="queryResult.count1" type="number" size="medium" style="width: 80px"
                      :maxlength=5></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="getResult()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="results" v-loading="listLoading1" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="归属地" prop="regional" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随次数" prop="followCount" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="置信度" prop="confidenceLevel" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="130">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImsi(scope.row)">查看IMSI</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="queryResult.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="queryResult.size" :total="count1" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" style="margin-left: 10px" v-show="activeItem == 'list'">
        <el-form :inline="true" :model="queryRecord" align="left">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryRecord.imsi" placeholder="输入IMSI" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryRecord.isp" placeholder="选择运营商" style="width: 120px" size="medium" clearable>
              <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                            start-placeholder="抓取时间" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="queryRecord.regional" placeholder="输入归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="getList()">搜索</el-button>
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
          <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="归属地" prop="regional" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取地点" prop="deviceName" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" min-width="125" max-width="250">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImsi(scope.row)">查看IMSI</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="queryRecord.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="queryRecord.size" :total="count2" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </section>
    <!--任务详情-->
    <el-dialog title="任务详情" :width="dialogWidth" :visible.sync="runTaskDetail">
      <div class="block gray-form">
        <el-form label-width="100px" :model="task" label-position="right" style="margin-right: 20px">
          <el-form-item label="任务名称" align="left" style="margin: 0">{{task.taskName}}</el-form-item>
          <el-form-item label="关联案件" align="left" style="margin: 0">{{task.caseName}}</el-form-item>
          <el-form-item label="创建时间" align="left" style="margin: 0">{{task.timeStr}}</el-form-item>
          <el-form-item label="任务类型" align="left" style="margin: 0">
            {{task.followType == 'IMSI' ? 'IMSI' : task.followType == 'FACE' ? '图像' : 'MAC'}}
          </el-form-item>
          <el-form-item label="分析对象" align="left" style="margin: 0">{{task.followTarget}}</el-form-item>
          <el-form-item label="日期" align="left" style="margin: 0">{{task.startStr + " - " + task.endStr}}</el-form-item>
          <el-form-item label="时间间隔" align="left" style="margin: 0">{{task.interval}}</el-form-item>
          <el-form-item label="伴随次数" align="left" style="margin: 0">
            {{task.followCount == 0 ? 0 : task.followCount}}
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {formatDate, isPC} from "../../../assets/js/util";

  export default {
    data() {
      return {
        task: {},
        taskId: this.$route.query.taskId || '',
        followType: this.$route.query.followType || '',
        dialogWidth: isPC() ? '35%' : '90%',
        runTaskDetail: false,
        activeItem: 'result',
        caseTime: "",
        results: [],
        queryResult: {page: 1, size: 10},
        listLoading1: false,
        count1: 0,
        records: [],
        queryRecord: {page: 1, size: 10},
        listLoading2: false,
        count2: 0,
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}]
      }
    },
    methods: {
      handleType(val) {
        if (this.activeItem === 'result') {//分析结果
          this.getResult();
        } else {//所有记录
          this.getList();
        }
      },
      //伴随结果导出
      exportData() {
        let param = {};
        let pathUrl = "";

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
        this.axios.post(pathUrl, param, {responseType: 'arraybuffer'}).then((res) => {
          let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
          let objectUrl = URL.createObjectURL(blob);
          window.location.href = objectUrl;
        }).catch(function (res) {
        });
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        this.$router.push({
          path: '/followIMSIDetail', query: {
            taskId: this.taskId, regional: imsi.regional,
            followType: this.followType, imsi: imsi.imsi, isp: imsi.isp,
          }
        });
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
          this.caseTime = '';
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
          this.listLoading1 = false;
        });
      },
      //所有记录
      getList() {
        if (!!this.caseTime) {
          this.queryRecord.endTime = this.caseTime[1] / 1000;
          this.queryRecord.startTime = this.caseTime[0] / 1000;
        } else {
          delete this.queryRecord['caseTime'];
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
          this.listLoading2 = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {//0-女  1-男  2-未知
          return row.sex === '0' ? '男' : row.sex === '2' ? '女' : '未知';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'upTime') {
          return row.upTime ? formatDate(new Date(row.upTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'originalUpTime') {
          return row.originalUpTime ? formatDate(new Date(row.originalUpTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'confidenceLevel') {
          return (row.confidenceLevel * 100).toFixed(2) + '%';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "未知";
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
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.startStr = formatDate(new Date(this.task.startDate * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.endStr = formatDate(new Date(this.task.endDate * 1000), 'yyyy-MM-dd hh:mm:ss');
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
