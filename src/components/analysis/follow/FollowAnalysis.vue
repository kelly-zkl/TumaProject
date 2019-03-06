<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="19" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('follow:query')"
                   style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px">-->
            <!--<el-select v-model="query.followType" placeholder="全部类型" style="width: 120px"-->
            <!--size="medium" filterable clearable>-->
            <!--<el-option v-for="item in followTypes" :key="item.value" :label="item.label" :value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <!--</el-form-item>-->
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.taskStatus" placeholder="任务状态" style="width: 120px"
                         size="medium" filterable clearable>
                <el-option v-for="item in taskTypes" :key="item.value" :label="item.label" :value="item.value">
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
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="5" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="addFollowTask()"
                     v-show="getButtonVial('follow:add')">新建伴随任务
          </el-button>
          <el-button size="medium" @click="deleteTask()" :disabled="sels.length == 0"
                     v-show="getButtonVial('follow:delete')">删除
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="tasks" v-loading="listLoading" class="center-block" stripe
                @selection-change="selsChange" :height="tableHeight">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="taskName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务类型" prop="followType" min-width="100"
                         max-width="150" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="分析对象" prop="followTarget" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务状态" prop="taskStatus" min-width="100" max-width="150">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.taskStatus == 'FINISH'">已完成</span>
            <span style="color:#dd6161" v-show="scope.row.taskStatus == 'FAILE'">失败</span>
            <span style="color:#D76F31" v-show="scope.row.taskStatus == 'WAIT'">等待中</span>
            <span style="color:#6799FD" v-show="scope.row.taskStatus == 'EXECUTION'">分析中</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建日期" prop="createTime" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('follow:get')">查看</el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteTask()"
                       v-show="getButtonVial('follow:delete')">删除
            </el-button>
            <el-button type="text" @click="reAnalysis(scope.row.id)"
                       v-show="getButtonVial('follow:reanalysis') && scope.row.taskStatus == 'FAILE'">重新分析
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
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        tasks: [],
        qTime: "",
        query: {page: 1, size: 10},
        tableHeight: window.innerHeight - 232,
        followTypes: [{value: 'IMSI', label: 'IMSI'}, {value: 'FACE', label: '图像'}],//{value: 'MAC', label: 'MAC'}
        taskTypes: [{value: 'EXECUTION', label: '分析中'}, {value: 'FINISH', label: '已完成'},
          {value: 'WAIT', label: '等待中'}, {value: 'FAILE', label: '失败'}],
        sels: [],
        count: 0,
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
      //重新分析
      reAnalysis(id) {
        this.$post('/follow/reanalysis/' + id, {}, '操作成功').then((data) => {
          if ("000000" === data.code) {
            this.getData();
          }
        }).catch((err) => {
        });
      },
      //删除伴随任务
      deleteTask() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/follow/delete', arr, '删除成功').then((data) => {
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
      addFollowTask() {
        this.$post('/follow/query', {page: 1, size: 5, taskStatus: "EXECUTION"}).then((data) => {
          this.count = data.data.count;
          if (data.data.count < 5) {
            sessionStorage.setItem("query", JSON.stringify(this.query));
            this.$router.push({path: '/addFollow'});
          } else {
            this.$message.error('分析中的任务建议不超过5个。请待当前分析中的任务完成后，再创建新任务。');
            return;
          }
        }).catch((err) => {
        });
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      gotoDetail(task) {
        let routeData = this.$router.resolve({
          path: '/followResult',
          query: {taskId: task.id, followType: task.followType}
        });
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/followResult', query: {taskId: task.id, followType: task.followType}});
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
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }
        this.listLoading = true;
        this.$post('/follow/query', this.query).then((data) => {
          this.tasks = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.tasks = [];
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'taskStatus') {
          return row.taskStatus === "WAIT" ? '等待中' : row.taskStatus === "FINISH" ? '已完成' : row.taskStatus === "FAILE" ? '失败' : row.taskStatus === "EXECUTION" ? '分析中' : '--';
        } else if (column.property === 'followType') {
          return row.followType === "IMSI" ? 'IMSI' : row.followType === "FACE" ? '图像' : row.followType === "MAC" ? 'MAC' : '--';
        } else if (column.property === 'status') {
          return row.status === 'UNHANDLED' ? '未处理' : row.status === 'EXECUTION' ? '分析中' : row.status === 'HANDLED' ? '已结案' : '--';
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
      this.getData();
    }
  }
</script>
