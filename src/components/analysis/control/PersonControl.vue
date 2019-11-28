<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="开启中" name="EXECUTION"></el-tab-pane>
            <el-tab-pane label="已关闭" name="FINISH"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right" style="text-align: right;margin-top: 10px">
          <el-button type="primary" size="medium" @click="addControl()" v-show="getButtonVial('disposition:add')">添加预警模型
          </el-button>
          <el-button-group>
            <el-button :disabled="sels.length == 0" @click="deleteTask()"
                       v-show="getButtonVial('disposition:delete')">删除
            </el-button>
            <el-button v-show="activeItem == 'EXECUTION' && getButtonVial('disposition:batchUpdateStatus')"
                       :disabled="sels.length == 0" @click="finishTask()">关闭预警
            </el-button>
          </el-button-group>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="text-align: left">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.taskName" placeholder="模型名称" size="medium" style="width: 160px"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.caseName" placeholder="案件名称" size="medium" style="width: 160px"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="controlList" v-loading="listLoading" class="center-block" stripe
                @selection-change="selsChange" :height="tableHeight">
        <el-table-column type="selection" width="45" align="left" :selectable="checkboxInit"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="预警模型名称" prop="taskName" min-width="150"
                         max-width="200" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="管控对象类型" prop="dispositionType" min-width="120"
                         max-width="160" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="有效期" prop="startTime" min-width="180"
                         max-width="250" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="预警状态" prop="taskStatus" min-width="100" max-width="150">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.taskStatus == 'FINISH'">已关闭</span>
            <span style="color:#6799FD" v-show="scope.row.taskStatus == 'EXECUTION'">开启中</span>
            <span style="color:#dd6161" v-show="scope.row.taskStatus == 'EXPIRE'">已过期</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="告警次数" prop="warningCounts" min-width="100"
                         max-width="150" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="150"
                         max-width="200" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" label="操作" min-width="150" max-width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('disposition:get')">查看
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);finishTask()"
                       v-show="activeItem== 'EXECUTION' && getButtonVial('disposition:batchUpdateStatus')&&scope.row.threeFlag!='QING_ZHI'">
              关闭预警
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteTask()"
                       v-show="getButtonVial('disposition:delete')&&scope.row.threeFlag!='QING_ZHI'">删除
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
        activeItem: 'EXECUTION',
        query: {page: 1, size: 10},
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 280,
        count: 0, intervalid: null,
        listLoading: false,
        controlList: [],
        sels: []
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
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getData('task');
          }, 10 * 1000);
        }
      },
      checkboxInit(row, index) {
        if (row.threeFlag == 'QING_ZHI')
          return 0;//不可勾选
        else
          return 1;//可勾选
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      handleType(val) {
        this.query.page = 1;
        this.getData();
      },
      //结束布控
      finishTask() {
        this.$confirm('确认关闭预警?', '提示', {type: 'info'}).then(() => {
          let param = [];
          this.sels.forEach((item) => {
            let caseItem = {id: item.id, taskStatus: 'FINISH'};
            param.push(caseItem);
          });
          this.$post('disposition/batchUpdateStatus', param, '操作成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //删除布控任务
      deleteTask() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该预警模型吗?', '提示', {type: 'info'}).then(() => {
          this.$post('disposition/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //跳转增加布控
      addControl() {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push('/addControl');
      },
      //跳转布控详情页
      gotoDetail(task) {
        let routeData = this.$router.resolve({path: '/controlDetail', query: {taskId: task.id}});
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/controlDetail', query: {taskId: task.id}});
      },
      //获取布控列表
      getData(val) {
        if (!val) {
          this.listLoading = true;
        }
        this.query.taskStatus = this.activeItem;
        this.$post('disposition/query', this.query).then((data) => {
          this.controlList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.controlList = [];
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.getData();
      },
      pageChange(index) {
        let _this = this;
        _this.query.page = index;
        _this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'dispositionType') {
          return row.dispositionType == 0 ? '重点人员名单' : row.dispositionType == 1 ? '人脸|IMSI特征' : '--';
        } else if (column.property === 'startTime') {
          let start = row.startTime ? formatDate(new Date(row.startTime * 1000), 'yyyy-MM-dd') : '--';
          let end = row.endTime ? formatDate(new Date(row.endTime * 1000), 'yyyy-MM-dd') : '--';
          return start + " 至 " + end;
        } else if (column.property === 'warningCounts') {
          return row[column.property] == undefined ? 0 : row[column.property];
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let tab = sessionStorage.getItem("activeItem");
      if (tab) {
        this.activeItem = tab;
      }
      if (bol) {
        let item = Object.assign({}, bol);
        this.query = Object.assign({}, bol);
        let page = item.page;
        this.pageChange(page);
      } else {
        this.getData();
        this.statusTask();
      }
    }
  }
</script>
<style>

</style>
