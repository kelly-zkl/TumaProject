<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="未读" name="UNREAD"></el-tab-pane>
            <el-tab-pane label="已读" name="READ"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="$router.push('/approvalApply')">发起申请</el-button>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px">
        <el-row>
          <el-col :span="18" align="left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.num" size="medium" :maxlength=30 placeholder="编号"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.lev" placeholder="勤务等级" size="medium" style="width: 150px">
                <el-option v-for="item in levs" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                              start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="primary" size="medium" v-show="activeItem == 'UNREAD'" :disabled="sels.length == 0"
                       @click="updateStatus()">标记已读
            </el-button>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="imsiList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="编号" prop="taskName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="业务类型" prop="followType" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="勤务等级" prop="followTarget" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请人" prop="followTarget" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请人所属组织" prop="followTarget" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请时间" prop="taskStatus" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="当前节点" prop="taskStatus" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="当前节点负责人" prop="caseName" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="状态" prop="caseName" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="sels = [];sels.push(scope.row);updateStatus()"
                       v-show="activeItem=='UNREAD'">标记已读
            </el-button>
            <el-button type="text" @click="gotoDetail(scope.row)">查看</el-button>
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
        activeItem: 'UNREAD',
        imsiList: [],
        query: {page: 1, size: 10},
        caseTime: '',
        count: 0,
        sels: [],
        levs: [{value: '1', label: '一级'}, {value: '2', label: '二级'}, {value: '3', label: '三级'}],
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
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      handleType(val) {
      },
      //标记已读
      updateStatus() {
        this.$confirm('确认标记为已读?', '提示', {type: 'info'}).then(() => {
//          let param = [];
//          this.sels.forEach((item) => {
//            let caseItem = {id: item.id, taskStatus: 'FINISH'};
//            param.push(caseItem);
//          });
//          this.$post('disposition/batchUpdateStatus', param, '操作成功').then((data) => {
//            if ("000000" === data.code) {
//              this.getData();
//              this.sels = [];
//            }
//          }).catch((err) => {
//          });
        }).catch(() => {
        });
      },
      gotoDetail(row) {
        if (this.activeItem === 'UNREAD') {
          this.$router.push({path: '/approvalDetail', query: {type: 3}})
        } else {
          this.$router.push({path: '/approvalDetail', query: {type: 0}})
        }
      },
      handleSizeChange(val) {
      },
      pageChange(val) {
      },
      getData() {
      },
      clearData() {
        this.query = {page: 1, size: 10};
        this.caseTime = '';
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
      this.imsiList = [{}, {}]
    }
  }
</script>
