<template>
  <div>
    <section class="content">
      <div class="add-appdiv gray-form" style="margin-bottom: 15px;padding: 0">
        <el-row style="border-bottom:1px #D0CACF solid;margin: 0">
          <el-col :span="12" align="left" style="text-align: left">
            <div style="font-size:15px;padding:10px 20px;text-align:left">车码碰撞任务信息</div>
          </el-col>
          <el-col :span="12" align="right" style="text-align: right;padding-right: 30px">
            <el-button type="text" @click="" style="margin-right: 20px">修改</el-button>
            <el-button type="text" @click="deleteTask()" v-show="getButtonVial('follow:delete')">删除</el-button>
          </el-col>
        </el-row>
        <el-row style="padding: 15px 0">
          <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
            <el-col :span="6" align="left" style="text-align: left">
              <el-form-item label="任务编号" align="left" style="margin: 0;text-align: left">
                {{task.taskName}}
              </el-form-item>
              <el-form-item label="任务名称" align="left" style="margin: 0;text-align: left">
                {{task.taskName}}
              </el-form-item>
              <el-form-item label="分析状态" align="left" style="margin: 0;text-align: left">
                <span
                  v-bind:style="{fontSize:'15px',color:task.taskStatus=='EXECUTION'?'#00C755':task.taskStatus =='FINISH'?'#00C755':'#333'}">
                  {{task.taskStatus === "EXECUTION" ? "进行中" : task.taskStatus === "FINISH" ? "已结束" : "--"}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" align="left">
              <el-form-item label="分析车牌" align="left" style="margin: 0;text-align: left">
                {{task.followTarget}}
              </el-form-item>
              <el-form-item label="日期范围" align="left" style="margin: 0;text-align: left">
                {{task.startStr+'- '+ task.endStr}}
              </el-form-item>
              <el-form-item label="时间间隔" align="left" style="margin: 0;text-align: left">
                {{task.interval}}
              </el-form-item>
            </el-col>
            <el-col :span="6" align="left">
              <el-form-item label="分析场所" align="left" style="margin: 0;text-align: left">
                {{task.taskName}}
              </el-form-item>
            </el-col>
            <el-col :span="6" align="right">
              <el-form-item label="创建时间" align="left" style="margin: 0;text-align: left">
                {{task.timeStr}}
              </el-form-item>
              <el-form-item label="创建用户" align="left" style="margin: 0;text-align: left">
                {{task.taskName}}
              </el-form-item>
              <el-form-item label="关联案件" align="left" style="margin: 0;text-align: left">
                <el-button @click="gotoCaseDetail" type="text">{{task.caseName?task.caseName:'--'}}</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <h5 class="add-label" style="margin: 0">分析结果</h5>
      <el-row style="margin-top: 10px">
        <el-col :span="18">
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
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="getResult()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="exportData()"
                     v-show="getButtonVial('follow:export:analyze')">导出数据
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="results" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="伴随出现场所数量" prop="followCount" min-width="125"
                         max-width="250"></el-table-column>
        <el-table-column align="left" label="伴随抓取次数" prop="followCount" min-width="125"
                         max-width="250"></el-table-column>
        <el-table-column align="left" label="置信度" prop="confidenceLevel" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="130" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoImsi(scope.row)" v-show="getButtonVial('follow:queryRecord')">查看IMSI
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin: 20px 0" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                       :current-page.sync="queryResult.page" :page-sizes="[10, 15, 20, 30]"
                       :page-size="queryResult.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        task: {},
        taskId: this.$route.query.taskId || '',
        followType: this.$route.query.followType || '',
        dialogWidth: isPC() ? '35%' : '90%',
        activeItem: 'result',
        qTime: "",
        results: [],
        exportKey: 'follow:export:analyze',
        queryResult: {page: 1, size: 10},
        listLoading: false,
        count: 0,
        records: [],
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //跳转案件详情页
      gotoCaseDetail() {
        let routeData = this.$router.resolve({path: '/caseDetail', query: {caseId: this.task.caseId}});
        window.open(routeData.href, '_blank');
      },
      //伴随结果导出
      exportData() {
        let param = {};
        let config;
        if (sessionStorage.getItem("user")) {
          let userId = JSON.parse(sessionStorage.getItem("user")).userId;
          if (userId) {
            if (!param) {
              param = {}
            }
            let stringify = JSON.stringify(param);
            let token = md5(stringify + userId + "key-hz-20180123").toString();
            config = {headers: {token: token, tokenId: userId}, responseType: 'arraybuffer'};
          }
        }
        param = Object.assign({}, this.queryResult);
        param.page = 1;
        param.size = 100000;
        this.axios.post("/follow/export/analyze", param, config).then((res) => {
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
        this.queryResult = {page: 1, size: 10};
        this.getResult();
      },
      pageChange(index) {
        this.queryResult.page = index;
        this.getResult();
      },
      handleSizeChange(val) {
        this.queryResult.size = val;
        this.getResult();
      },
      //分析结果
      getResult() {
        this.queryResult.followTaskId = this.taskId;
        this.queryResult.followType = this.followType;

        this.listLoading = true;
        this.$post('/follow/queryResult', this.queryResult).then((data) => {
          this.results = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.results = [];
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'upTime') {
          return row.upTime ? formatDate(new Date(row.upTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'confidenceLevel') {
          return (row.confidenceLevel * 100).toFixed(2) + '%';
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
