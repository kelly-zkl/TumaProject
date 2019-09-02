<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="20" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.keyWord" placeholder="任务名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.atype" placeholder="分析类型" size="medium" style="width: 120px">
                <el-option v-for="item in followTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                              start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate" style="width:360px">
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
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-input placeholder="分析对象" v-model="query.followTarget" style="width:180px"
                        :maxlength=15 size="medium">
              </el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-select v-model="query.status" placeholder="任务状态" style="width: 120px"
                         size="medium" filterable clearable>
                <el-option v-for="item in taskTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore&&getButtonVial('case:query')">
              <el-select v-model="query.caseId" placeholder="关联案件" size="medium" style="width: 150px" clearable>
                <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="addCarTask()" style="padding-left: 10px;padding-right: 10px"
                     v-show="getButtonVial('car:task:create')">新建车码碰撞
          </el-button>
          <el-button size="medium" @click="deleteTask()" :disabled="sels.length == 0"
                     v-show="getButtonVial('car:task:del')">删除
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="tasks" v-loading="listLoading" class="center-block" stripe
                @selection-change="selsChange" :height="tableHeight">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="taskName" min-width="130"
                         max-width="180" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="分析类型" prop="followType" min-width="120"
                         max-width="160" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="分析对象" prop="followTarget" min-width="180"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务状态" prop="status" min-width="100" max-width="130">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.status == 'finish'">已完成</span>
            <span style="color:#dd6161" v-show="scope.row.status == 'failed'">失败</span>
            <span style="color:#FF9900" v-show="scope.row.status == 'waiting'">等待中</span>
            <span style="color:#6799FD" v-show="scope.row.status == 'running'">分析中</span>
            <span style="color:#999" v-show="scope.row.status == 'killed'">终止</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="130"
                         max-width="180" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="分析结果" prop="resultNumber" min-width="100"
                         max-width="130" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建日期" prop="createTime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="180" max-width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('car:task:detail')">查看
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteTask()"
                       v-show="getButtonVial('car:task:del')">删除
            </el-button>
            <el-button type="text" @click="reAnalysis(scope.row.taskNo)"
                       v-show="getButtonVial('car:task:restart') && (scope.row.status == 'failed'||scope.row.status == 'killed')">
              重新分析
            </el-button>
            <el-button type="text" @click="stopAnalysis(scope.row.taskNo)"
                       v-show="getButtonVial('car:task:kill') && scope.row.status == 'running'">终止分析
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
  import {formatDate, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        isMore: false, listLoading: false, intervalid: null,
        tasks: [], cases: [], qTime: "", query: {page: 1, size: 10},
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        taskTypes: [{value: 'running', label: '分析中'}, {value: 'finish', label: '已完成'},
          {value: 'waiting', label: '等待中'}, {value: 'failed', label: '失败'}, {value: 'killed', label: '终止'}],
        followTypes: [{value: 'imsi', label: '以码找车'}, {value: 'car', label: '以车找码'}],
        sels: [], count: 0,
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
    //页面关闭时停止更新
    beforeDestroy() {
      clearInterval(this.intervalid);
      this.intervalid = null;
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //更多条件
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 282
        } else {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 232
        }
      },
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getData('task');
          }, 10 * 1000);
        }
      },
      //终止分析
      stopAnalysis(taskNo) {
        this.$post('/car/task/kill', {taskNo: taskNo}, '操作成功').then((data) => {
          if ("000000" === data.code) {
            this.getData();
          }
        }).catch((err) => {
        });
      },
      //重新分析
      reAnalysis(taskNo) {
        this.$post('/car/task/restart', {taskNo: taskNo}, '操作成功').then((data) => {
          if ("000000" === data.code) {
            this.getData();
          }
        }).catch((err) => {
        });
      },
      //删除碰撞任务
      deleteTask() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.taskNo);
        });
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/car/task/del', {taskNoList: arr}, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //新建伴随任务
      addCarTask() {
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push({path: '/addCarTask'});
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      gotoDetail(task) {
        let routeData = this.$router.resolve({path: '/carTaskDetail', query: {no: task.taskNo, atype: task.atype}});
        window.open(routeData.href, '_blank');
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';
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
      getData(val) {
        if (!!this.qTime) {
          this.query.createStartTime = Math.round(this.qTime[0] / 1000);
          this.query.createEndTime = Math.round(this.qTime[1] / 1000);
        }
        if (!val) {
          this.listLoading = true;
        }
        this.$post('/car/task/query', this.query).then((data) => {
          this.tasks = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.count = 0;
          this.tasks = [];
          this.listLoading = false;
        });
      },
      //关联案件
      getCases() {
        if (this.getButtonVial('case:query')) {
          this.$post('case/query', {page: 1, size: 999999}).then((data) => {
            this.cases = data.data.list;
          }).catch((err) => {
            this.cases = [];
          });
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'followTarget') {
          return '[' + (row.atype == 'imsi' ? 'IMSI' : '车牌') + ']' + row.followTarget;
        } else if (column.property === 'followType') {
          return row.atype == 'imsi' ? '以码找车' : row.atype == 'car' ? '以车找码' : '--';
        } else if (column.property === 'resultNumber') {
          return row.resultNumber == undefined ? '--' : row.resultNumber;
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      let bol = JSON.parse(sessionStorage.getItem("query"));
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      this.getCases();
      this.getData();
      this.statusTask();
    }
  }
</script>
