<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left" v-show="getButtonVial('collision:query')">
          <el-form :inline="true" :model="query" align="left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.ctype" placeholder="任务类型" style="width: 120px"
                         size="medium" filterable clearable>
                <el-option v-for="item in taskTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" size="medium"
                              :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                              start-placeholder="开始日期" end-placeholder="结束日期" style="width:360px">
              </el-date-picker>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.taskStatus" placeholder="全部状态" style="width: 120px"
                         size="medium" filterable clearable>
                <el-option v-for="item in taskStatus" :key="item.value" :label="item.label" :value="item.value">
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
          <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="deleteTask()"
                     v-show="getButtonVial('collision:delete')">删除
          </el-button>
          <el-button type="primary" size="medium" @click="gotoAdd()"
                     v-show="getButtonVial('collision:add')">新建碰撞任务
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="records" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="taskName" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务类型" prop="collisionType" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="创建日期" prop="createTime" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务状态" prop="taskStatus" min-width="125"
                         max-width="250" :formatter="formatterAddress">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.taskStatus == 'FINISH'">已完成</span>
            <span style="color:#dd6161" v-show="scope.row.taskStatus == 'FAILE'">任务失败</span>
            <span style="color:#D76F31" v-show="scope.row.taskStatus == 'WAIT'">等待中</span>
            <span style="color:#6799FD" v-show="scope.row.taskStatus == 'EXECUTION'">分析中</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="125" max-width="250">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row.id,scope.row.collisionType)"
                       v-show="getButtonVial('collision:get')">查看
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteTask()"
                       v-show="getButtonVial('collision:delete')">删除
            </el-button>
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
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {//,,
        records: [],
        listLoading: false,
        taskTypes: [{value: 'IMSI', label: 'IMSI'}, {value: 'FACE', label: '图像'}],//,{value: 'MAC', label: 'MAC'}
        taskStatus: [{value: 'FINISH', label: '已完成'}, {value: 'FAILE', label: '任务失败'},
          {value: 'WAIT', label: '等待中'}, {value: 'EXECUTION', label: '分析中'}],
        query: {page: 1, size: 10, taskName: "", ctype: "", taskStatus: ""},
        qTime: '',
        count: 0,
        sels: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //全选
      selsChange(sels) {
        this.sels = sels;
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10, taskName: "", ctype: "", taskStatus: ""};
        this.qTime = '';
        this.getData();
      },
      //跳转新建碰撞条件
      gotoAdd() {
        this.$router.push({path: '/addCollision'});
      },
      //跳转任务详情
      gotoDetail(id, collisionType) {
        this.$router.push({path: '/taskDetail', query: {taskId: id, collisionType: collisionType[0]}});
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
        if (column.property === 'collisionType') {
          return row.collisionType[0] ? row.collisionType[0] === 'IMSI' ? 'IMSI' : row.collisionType[0] === 'FACE' ? '图像' : row.collisionType[0] === 'MAC' ? '' : 'MAC' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'taskStatus') {
          return row.taskStatus === 'EXECUTION' ? "分析中" : row.taskStatus === 'FINISH' ? '已完成' : row.taskStatus === 'WAIT' ? '等待中' : row.taskStatus === 'FAILE' ? '任务失败' : '异常';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //删除任务
      deleteTask() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
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
      //获取碰撞任务列表
      getData() {
        if (!!this.qTime) {
          this.query.startTime = this.qTime[0] / 1000;
          this.query.endTime = this.qTime[1] / 1000;
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
          this.listLoading = false;
        });
      }
    },
    mounted() {
      this.getData();
    }
  }
</script>
