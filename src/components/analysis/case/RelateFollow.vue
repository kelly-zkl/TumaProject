<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="20" v-show="getButtonVial('follow:query')" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 1100px">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                              start-placeholder="创建时间" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.taskStatus" placeholder="任务状态" style="width: 150px"
                         size="medium" filterable clearable>
                <el-option v-for="item in taskStatus" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" style="text-align: right">
          <el-button type="primary" size="medium" @click="cancelFollow()" :disabled="sels.length == 0"
                     v-show="getButtonVial('follow:cancelCase')">取消关联
          </el-button>
          <el-button size="medium" @click="deleteFoTask()" :disabled="sels.length == 0"
                     v-show="getButtonVial('follow:delete')">删除任务
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="follows" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="taskName" min-width="130"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务类型" prop="followType" min-width="100"
                         max-width="150" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="分析对象" prop="followTarget" min-width="150"
                         max-width="180" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务状态" prop="taskStatus" min-width="100" max-width="120">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.taskStatus == 'FINISH'">已完成</span>
            <span style="color:#dd6161" v-show="scope.row.taskStatus == 'FAILE'">失败</span>
            <span style="color:#FF9900" v-show="scope.row.taskStatus == 'WAIT'">等待中</span>
            <span style="color:#6799FD" v-show="scope.row.taskStatus == 'EXECUTION'">分析中</span>
            <span style="color:#999" v-show="scope.row.taskStatus == 'STOP'">终止</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="分析结果" prop="followCount" min-width="130"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建日期" prop="createTime" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoFoDetail(scope.row)" v-show="getButtonVial('follow:get')">查看
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row.id);deleteFoTask()"
                       v-show="getButtonVial('follow:delete')">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin: 20px 0" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                       :current-page.sync="query.page" :page-sizes="[10, 15, 20, 30]"
                       :page-size="query.size" :total="count" background
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
        caseId: this.$route.query.caseId || '',
        qTime: "",
        taskStatus: [{value: 'FINISH', label: '已完成'}, {value: 'FAILE', label: '失败'},
          {value: 'WAIT', label: '等待中'}, {value: 'EXECUTION', label: '分析中'}],
        follows: [],
        query: {page: 1, size: 10},
        listLoading: false,
        count: 0,
        sels: [],
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
      //全选  ==>  删除
      selsChange(sels) {
        this.sels = sels;
      },
      gotoFoDetail(task) {
        this.$router.push({path: '/followResult', query: {taskId: task.id, followType: task.followType}});
      },
      //删除伴随任务
      deleteFoTask() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该伴随任务吗?', '提示', {type: 'info'}).then(() => {
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
      //取消关联伴随任务
      cancelFollow() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要取消关联该伴随任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/follow/cancelCase/' + this.caseId, arr, '取消关联成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
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
      //伴随任务
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        } else {
          delete this.query['endTime'];
          delete this.query['startTime'];
        }

        this.query.caseId = this.caseId;
        this.query.followType = "IMSI";

        this.listLoading = true;
        this.$post('/follow/query', this.query).then((data) => {
          this.follows = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.follows = [];
          this.count = 0;
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'followType') {
          return row.followType === "IMSI" ? 'IMSI' : row.followType === "FACE" ? '人脸' : row.followType === "MAC" ? 'MAC' : '--';
        } else if (column.property === 'followCount') {
          return row.followCount === 0 ? 0 : row.followCount;
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.caseId = this.$route.query.caseId || '';
    }
  }
</script>
