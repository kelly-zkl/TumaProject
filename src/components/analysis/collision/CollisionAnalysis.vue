<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="19" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 920px">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" size="medium"
                              :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                              start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerBeginDate">
              </el-date-picker>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px">-->
            <!--<el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>-->
            <!--</el-form-item>-->
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px" v-show="isMore">-->
            <!--<el-input v-model="query.caseName" placeholder="案件名称" size="medium" style="width: 160px"-->
            <!--:maxlength=20></el-input>-->
            <!--</el-form-item>-->
          </el-form>
        </el-col>
        <el-col :span="5" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="showCreate(0)" v-show="getButtonVial('collision:add')">新建任务
          </el-button>
          <el-button size="medium" :disabled="sels.length == 0" @click="deleteTask()"
                     v-show="getButtonVial('collision:deleteTaskOrDataSourceOrResult')">删除
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="records" v-loading="listLoading" class="center-block" stripe
                @selection-change="selsChange" :height="tableHeight">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="taskName" min-width="150"
                         max-width="200" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="创建用户" prop="createBy" min-width="150"
                         max-width="200" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="创建日期" prop="createTime" min-width="170"
                         max-width="200" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="150"
                         max-width="200" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="操作" min-width="200" max-width="220" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row.id)" v-show="getButtonVial('collision:get')">查看
            </el-button>
            <el-button type="text" @click="showCreate(1,scope.row)" v-show="getButtonVial('collision:update')">修改
            </el-button>
            <el-button type="text" @click="copyTask(scope.row.id)" v-show="getButtonVial('collision:copy')">复制
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteTask()"
                       v-show="getButtonVial('collision:deleteTaskOrDataSourceOrResult')">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top:10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--创建任务-->
      <el-dialog :title="addTitle" width="600px" :visible.sync="runAddTask">
        <div class="block">
          <el-form label-width="100px" :model="addTask" label-position="right">
            <el-form-item label="任务名称" align="left" prop="taskName" style="text-align: left">
              <el-input v-model="addTask.taskName" placeholder="输入任务名称" style="width: 300px" :maxlength=12></el-input>
            </el-form-item>
            <el-form-item label="关联案件" align="left" style="margin:0;text-align: left" prop="caseId">
              <el-select v-model="addTask.caseId" placeholder="选择案件" filterable clearable>
                <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item align="left" style="margin:0">
              <el-button type="primary" style="margin-top:30px" @click="createTask()" :loading="listLoading">
                {{confirmText}}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
    </section>
  </div>
</template>

<script>
  import {formatDate, buttonValidator, encryData, decryData} from "../../../assets/js/util";

  export default {
    data() {
      return {
        records: [], listLoading: false, isMore: false,
        addTask: {taskName: '', caseId: ''}, cases: [],
        addTitle: '创建任务', confirmText: '确认创建并开始分析', runAddTask: false,
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        query: {page: 1, size: 10}, qTime: '', count: 0, sels: [],
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
      showCreate(val, item) {
        if (val == 0) {
          this.addTitle = '创建任务';
          this.confirmText = '确认创建并开始分析';
          this.addTask = {taskName: '', caseId: ''};
        } else {
          this.addTitle = '修改任务';
          this.confirmText = '确认修改并开始分析';
          this.addTask = item;
        }
        this.runAddTask = true
      },
      //创建任务
      createTask() {
        if (this.addTask.taskName.length === 0) {
          this.$message.error('请输入任务名称');
          return;
        }
        if (this.addTask.caseId.length === 0) {
          this.$message.error('请选择关联案件');
          return;
        }
        this.cases.forEach((item) => {
          if (item.id == this.addTask.caseId) {
            this.addTask.caseName = item.caseName;
          }
        });
        if (this.addTask.id) {
          this.listLoading = true;
          this.$post('/collision/update', this.addTask, "修改成功").then((data) => {
            this.listLoading = false;
            this.runAddTask = false;
            if ("000000" === data.code) {
              this.getData();
              setTimeout(() => {
                this.gotoDetail(this.addTask.id);
              }, 1000);
            }
          }).catch((err) => {
            this.listLoading = false;
            this.runAddTask = false;
          });
        } else {
          this.addTask.createBy = JSON.parse(decryData(sessionStorage.getItem("user"))).realName;
          this.listLoading = true;
          this.$post('/collision/add', this.addTask, "创建成功").then((data) => {
            this.listLoading = false;
            this.runAddTask = false;
            if ("000000" === data.code) {
              this.getData();
              setTimeout(() => {
                this.gotoDetail(data.data);
              }, 1000);
            }
          }).catch((err) => {
            this.listLoading = false;
            this.runAddTask = false;
          });
        }
      },
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 282
        } else {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 232
        }
      },
      //全选
      selsChange(sels) {
        this.sels = sels;
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';
        this.getData();
      },
      //跳转任务详情
      gotoDetail(id) {
        let routeData = this.$router.resolve({path: '/taskDetail', query: {taskId: id}});
        window.open(routeData.href, '_blank');
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
        if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取案件列表
      getCases() {
        this.$post('/case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      //复制成功
      copyTask(id) {
        this.$confirm('确认要复制该任务吗?', '提示', {type: 'info'}).then(() => {
          this.listLoading = true;
          this.$post('/collision/copy/' + id, {}, '复制成功').then((data) => {
            this.listLoading = false;
            if ("000000" === data.code) {
              this.getData();
            }
          }).catch((err) => {
            this.listLoading = false;
          });
        }).catch(() => {
        });
      },
      //删除任务
      deleteTask() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.listLoading = true;
          this.$post('/collision/deleteTaskOrDataSourceOrResult', {type: 'collisionTask', ids: arr},
            '删除成功').then((data) => {
            this.listLoading = false;
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
            this.listLoading = false;
          });
        }).catch(() => {
        });
      },
      //获取交并任务列表
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        } else {
          delete this.query['startTime'];
          delete this.query['endTime'];
        }
        this.listLoading = true;
        this.$post('/collision/query', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.count = 0;
          this.listLoading = false;
        });
      }
    },
    mounted() {
      this.getCases();
      let bol = JSON.parse(sessionStorage.getItem("query"));
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      this.getData();
    }
  }
</script>
