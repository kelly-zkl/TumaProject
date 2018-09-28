<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="布控中" name="EXECUTION"></el-tab-pane>
            <el-tab-pane label="已结束" name="FINISH"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="deleteTask()"
                     v-show="getButtonVial('disposition:delete')">删除
          </el-button>
          <el-button type="primary" size="medium"
                     v-show="activeItem == 'EXECUTION' && getButtonVial('disposition:batchUpdateStatus')"
                     :disabled="sels.length == 0" @click="finishTask()">结束布控
          </el-button>
          <el-button type="primary" size="medium" @click="addControl()" v-show="getButtonVial('disposition:add')">添加布控
          </el-button>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px"
               v-show="getButtonVial('disposition:query')">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.caseName" placeholder="案件名称" size="medium" style="width: 160px"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="布控场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
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
      <el-table :data="controlList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="布控编号" prop="taskName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="有效期" prop="startTime" min-width="250"
                         max-width="450" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="布控状态" prop="taskStatus" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="230">
          <template slot-scope="scope">
            <el-button type="text" @click="sels = [];sels.push(scope.row);finishTask()"
                       v-show="activeItem== 'EXECUTION' && getButtonVial('disposition:batchUpdateStatus')">结束布控
            </el-button>
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('disposition:get')">查看告警
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteTask()"
                       v-show="getButtonVial('disposition:delete')">删除
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
      return {
        activeItem: 'EXECUTION',
        query: {page: 1, size: 10},
        statuses: [{label: '进行中', value: 'EXECUTION'}, {label: '已结案', value: 'FINISH'}],
        areaList: [],
        count: 0,
        listLoading: false,
        places: [],
        controlList: [],
        sels: [],
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date().getTime();
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
      handleType(val) {
        this.getData();
      },
      //结束布控
      finishTask() {
        this.$confirm('确认结束布控?', '提示', {type: 'info'}).then(() => {
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
        this.$confirm('确认要删除该布控任务吗?', '提示', {type: 'info'}).then(() => {
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
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push('/addControl');
      },
      //跳转布控详情页
      gotoDetail(task) {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push({path: '/controlDetail', query: {taskId: task.id}});
      },
      //获取布控列表
      getData() {
        this.listLoading = true;
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
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'taskStatus') {
          return row.taskStatus === "WAIT" ? '等待中' : row.taskStatus === "FINISH" ? '已完成' : row.taskStatus === "FAILE" ? '失败' : row.taskStatus === "EXECUTION" ? '进行中' : '--';
        } else if (column.property === 'followType') {
          return row.followType === "IMSI" ? 'IMSI' : row.followType === "FACE" ? '图像' : row.followType === "MAC" ? 'MAC' : '--';
        } else if (column.property === 'startTime') {
          let start = row.startTime ? formatDate(new Date(row.startTime * 1000), 'yyyy-MM-dd') : '--';
          let end = row.endTime ? formatDate(new Date(row.endTime * 1000), 'yyyy-MM-dd') : '--';
          return start + " ~ " + end;
        } else if (column.property === 'followCount') {
          return row.followCount === 0 ? 0 : row.followCount;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //布控场所
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
      }
    },
    mounted() {
      this.getPlaces();
      this.getData();
    }
  }
</script>
<style>

</style>
