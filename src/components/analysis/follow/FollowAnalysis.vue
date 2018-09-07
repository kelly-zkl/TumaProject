<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left">
          <el-form :inline="true" :model="query" align="left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.followType" placeholder="全部类型" style="width: 120px"
                         size="medium" filterable clearable>
                <el-option v-for="item in followTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                              start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp">
              </el-date-picker>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.taskStatus" placeholder="任务状态" style="width: 120px"
                         size="medium" filterable clearable>
                <el-option v-for="item in taskTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right">
          <el-button type="primary" size="medium" @click="deleteTask()" :disabled="sels.length == 0">删除任务</el-button>
          <el-button type="primary" size="medium" @click="addFollowTask()">新建伴随任务</el-button>
        </el-col>
      </el-row>
      <el-table :data="tasks" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="taskName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务类型" prop="followType" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="分析对象" prop="followTarget" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务状态" prop="taskStatus" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)">查看</el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteTask()">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        listLoading: false,
        tasks: [],
        caseTime: "",
        query: {page: 1, size: 10},
        followTypes: [{value: 'IMSI', label: 'IMSI'}, {value: 'FACE', label: '图像'}],//{value: 'MAC', label: 'MAC'}
        taskTypes: [{value: 'EXECUTION', label: '进行中'}, {value: 'FINISH', label: '已完成'},
          {value: 'WAIT', label: '等待中'}, {value: 'FAILE', label: '失败'}],
        sels: [],
        count: 0
      }
    },
    methods: {
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
        this.$router.push({path: '/addFollow'})
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      gotoDetail(task) {
        this.$router.push({path: '/followResult', query: {taskId: task.id, followType: task.followType}});
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.caseTime = '';
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
        if (!!this.caseTime) {
          this.query.caseToTime = this.caseTime[1] / 1000;
          this.query.caseTime = this.caseTime[0] / 1000;
        } else {
          delete this.query['caseTime'];
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
          return row.taskStatus === "WAIT" ? '等待中' : row.taskStatus === "FINISH" ? '已完成' : row.taskStatus === "FAILE" ? '失败' : row.taskStatus === "EXECUTION" ? '进行中' : '--';
        } else if (column.property === 'followType') {
          return row.followType === "IMSI" ? 'IMSI' : row.followType === "FACE" ? '图像' : row.followType === "MAC" ? 'MAC' : '--';
        } else if (column.property === 'status') {
          return row.status === 'UNHANDLED' ? '未处理' : row.status === 'EXECUTION' ? '进行中' : row.status === 'HANDLED' ? '已结案' : '--';
        } else if (column.property === 'followCount') {
          return row.followCount === 0 ? 0 : row.followCount;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.getData();
    }
  }
</script>
