<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" v-show="getButtonVial('collision:query')" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 840px">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" size="medium"
                              :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                              start-placeholder="开始日期" end-placeholder="结束日期"
                              style="width:360px" :picker-options="pickerBeginDate">
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
        <el-col :span="6" style="text-align: right">
          <el-button type="primary" size="medium" @click="cancelCollis()" :disabled="sels.length == 0"
                     v-show="getButtonVial('collision:cancelCase')">取消关联
          </el-button>
          <el-button size="medium" @click="deleteCoTask()" :disabled="sels.length == 0"
                     v-show="getButtonVial('collision:delete')">删除任务
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="collisions" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="taskName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建用户" prop="createBy" min-width="120"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建日期" prop="createTime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="125" max-width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoCoDetail(scope.row.id)" v-show="getButtonVial('collision:get')">查看
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row.id);deleteCoTask()"
                       v-show="getButtonVial('collision:delete')">删除
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
        collisions: [],
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
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      //跳转任务详情
      gotoCoDetail(id) {
        let routeData = this.$router.resolve({path: '/taskDetail', query: {taskId: id}});
        window.open(routeData.href, '_blank');
      },
      //删除交并任务
      deleteCoTask() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除交并任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //取消关联交并任务
      cancelCollis() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要取消关联该交并任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/cancelCase/' + this.caseId, arr, '取消关联成功').then((data) => {
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
      //交并任务
      getData() {
        if (!!this.qTime) {
          this.query.startTime = this.qTime[0] / 1000;
          this.query.endTime = this.qTime[1] / 1000;
        } else {
          delete this.query['startTime'];
          delete this.query['endTime'];
        }
        this.query.caseId = this.caseId;

        this.listLoading = true;
        this.$post('/collision/query', this.query).then((data) => {
          this.collisions = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.collisions = [];
          this.count = 0;
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'createTime') {
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
