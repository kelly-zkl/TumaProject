<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="待审批" name="EXECUTION"></el-tab-pane>
            <el-tab-pane label="已同意" name="FINISH"></el-tab-pane>
            <el-tab-pane label="终止" name="CANCEL"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right" v-show="getButtonVial('workflow:translation:apply')&& uLogin"
                style="text-align: right">
          <el-button type="primary" size="medium" @click="addApply()">发起申请</el-button>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 1200px">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.recordNo" size="medium" :maxlength=15 placeholder="编号"
                    style="width:150px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.staffLevel" placeholder="勤务等级" size="medium" style="width:110px" clearable>
            <el-option v-for="item in levs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.businessType" placeholder="业务类型" size="medium" style="width:150px" clearable>
            <el-option label="IMSI翻手机号" value="imsi2p"></el-option>
            <el-option label="手机号翻IMSI" value="phone2i"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
        <el-form-item align="left" style="margin-bottom: 10px" v-show="isMore">
          <el-select v-model="query.caseId" placeholder="关联案件" filterable clearable size="medium"
                     style="width:160px">
            <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item align="left" style="margin-bottom: 10px" v-show="isMore">
          <el-cascader placeholder="选择侦查任务" :options="tasks" filterable clearable
                       v-model="queryTask" style="width:200px" size="medium"></el-cascader>
        </el-form-item>
      </el-form>
      <el-table :data="imsiList" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="编号" prop="recordNo" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="业务类型" prop="businessType" min-width="100"
                         max-width="150" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="勤务等级" prop="staffLevel" min-width="100"
                         max-width="150" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="110"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="侦查任务" prop="spyTaskName" min-width="110"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请人" prop="creatorName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请时间" prop="createTime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="当前节点" prop="currentNode" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="当前节点负责人" prop="currentNodeOperatorName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" v-for="item in timeColumn" :key="item.prop"
                         :label="item.label" :prop="item.prop" :min-width="item.min"
                         :max-width="item.max" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="状态" prop="status" min-width="80" max-width="150">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.status == 0">已完成</span>
            <span style="color:#6799FD" v-show="scope.row.status == 2||scope.row.status == 3">待审批</span>
            <span style="color:#dd6161" v-show="scope.row.status ==1">终止</span>
            <span style="color:#6799FD" v-show="scope.row.status == 4">待翻码</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="操作" min-width="150" max-width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('workflow:translation:detail')">
              查看
            </el-button>
            <el-button type="text" @click="handlePass(scope.row,0)"
                       v-show="activeItem=='EXECUTION' && getButtonVial('workflow:translation:approve')">通过
            </el-button>
            <el-button type="text" @click="handlePass(scope.row,1)"
                       v-show="activeItem=='EXECUTION' && getButtonVial('workflow:translation:approve')">拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top:10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        isMore: false,
        listLoading: false,
        uLogin: false,
        activeItem: 'EXECUTION',
        imsiList: [],
        query: {page: 1, size: 10, approveStatus: 1},
        tableHeight: window.innerHeight - 280,
        qTime: '', count: 0,
        timeColumn: [], cases: [], queryTask: [],
        levs: [{value: '一级', label: '一级'}, {value: '二级', label: '二级'}, {value: '三级', label: '三级'}],
        tasks: [{value: 'coll', label: '交并分析', children: []}, {value: 'car', label: '车码碰撞', children: []},
          {value: 'follow', label: '伴随分析', children: []}],
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
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = window.innerHeight - 330
        } else {
          this.tableHeight = window.innerHeight - 280
        }
      },
      handleType(val) {
        this.isMore = false;
        if (val.name === 'EXECUTION') {
          this.timeColumn = [];
          this.query.approveStatus = 1;
        } else {
          if (val.name === 'FINISH') {
            this.query.approveStatus = 0;
          } else {
            this.query.approveStatus = 2;
            this.timeColumn = [{label: '终止时间', prop: 'suspendTime', min: 170, max: 200},
              {label: '终止原因', prop: 'suspendRemark', min: 120, max: 200}];
          }
        }
        this.getData();
      },
      //通过/不通过
      handlePass(row, status) {
        if (status == 1) {
          this.$prompt('确认拒绝此次翻码申请？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPlaceholder: '录入备注（非必填）',
            inputValidator: function (value) {
              let bol = true;
              if (value) {
                bol = (value.length <= 200)
              }
              return bol
            },
            inputErrorMessage: '请输入200字以内的备注'
          }).then(({value}) => {
            this.applyHttp(row.recordId, status, value ? value : '');
          }).catch(() => {
          })
        } else {
          this.applyHttp(row.recordId, status, '');
        }
      },
      applyHttp(recordId, status, remark) {
        let param = {operator: JSON.parse(sessionStorage.getItem("user")).userId, result: status, remark: remark};
        this.$post('/workflow/translation/approve/' + recordId, param, "操作成功").then((data) => {
          if ("000000" === data.code) {
            this.getData();
          }
        }).catch((err) => {
        });
      },
      //发起申请
      addApply() {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push('/approvalApply');
      },
      //翻码详情页
      gotoDetail(row) {
        if (this.activeItem === 'EXECUTION') {
          let routeData = this.$router.resolve({
            path: '/approvalDetail',
            query: {type: 2, recordId: row.recordId, business: row.businessType}
          });
          window.open(routeData.href, '_blank');
          // this.$router.push({path: '/approvalDetail', query: {type: 2, recordId: row.recordId}});
        } else {
          let routeData = this.$router.resolve({
            path: '/approvalDetail',
            query: {type: 0, recordId: row.recordId, business: row.businessType}
          });
          window.open(routeData.href, '_blank');
          // this.$router.push({path: '/approvalDetail', query: {type: 0, recordId: row.recordId}});
        }
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      pageChange(val) {
        this.query.page = val;
        this.getData();
      },
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }
        if (this.activeItem === 'EXECUTION') {
          this.query.approveStatus = 1;
        } else if (this.activeItem === 'FINISH') {
          this.query.approveStatus = 0;
        } else {
          this.query.approveStatus = 2;
        }
        if (this.queryTask) {
          this.query.taskId = this.queryTask[1];
        }
        this.listLoading = true;
        this.$post('/workflow/translation/myapprove/' + JSON.parse(sessionStorage.getItem("user")).userId, this.query).then((data) => {
          this.imsiList = data.data.records;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.imsiList = [];
          this.$message.error(err);
        });
      },
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';
        this.queryTask = [];
        this.getData();
      },
      //获取侦查任务列表
      getTasks() {
        this.$post('/collision/query', {page: 1, size: 999999}).then((data) => {
          var arr = [];
          data.data.list.forEach((item) => {
            arr.push({value: item.id, label: item.taskName})
          });
          this.tasks[0].children = arr;
        }).catch((err) => {
          this.tasks[0].children = [];
        });
        this.$post('/car/task/query', {page: 1, size: 999999}).then((data) => {
          var arr = [];
          data.data.list.forEach((item) => {
            arr.push({value: item.taskNo, label: item.taskName})
          });
          this.tasks[1].children = arr;
        }).catch((err) => {
          this.tasks[1].children = [];
        });
        this.$post('/follow/query', {page: 1, size: 999999}).then((data) => {
          var arr = [];
          data.data.list.forEach((item) => {
            arr.push({value: item.id, label: item.taskName})
          });
          this.tasks[2].children = arr;
        }).catch((err) => {
          this.tasks[2].children = [];
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
        if (column.property === 'createTime') {
          // return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          return row.createTime ? row.createTime : '--';
        } else if (column.property === 'businessType') {
          return row.businessType == 'imsi2p' ? "IMSI翻手机号" : '手机号翻IMSI'
        } else if (column.property === 'status') {
          return row.status == 0 ? '已完成' : row.status == 1 ? '待审批' : row.status == 2 ? '终止' : row.status == 3 ? '待翻码' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.uLogin = JSON.parse(sessionStorage.getItem("user")).uLogin;
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let tab = sessionStorage.getItem("activeItem");
      let time1 = JSON.parse(sessionStorage.getItem("qTime"));
      if (tab) {
        this.activeItem = tab;
      }
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      if (time1) {
        this.qTime = time1;
      }
      this.getCases();
      this.getTasks();
      this.getData();
    }
  }
</script>
