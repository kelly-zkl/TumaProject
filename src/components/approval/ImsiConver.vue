<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="待翻码" name="HANDLED"></el-tab-pane>
            <el-tab-pane label="已返回" name="FINISH"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right" v-show="getButtonVial('workflow:translation:apply')" style="text-align: right">
          <el-button type="primary" size="medium" @click="addApply()">发起申请</el-button>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.recordNo" size="medium" :maxlength=30 placeholder="编号"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.staffLevel" placeholder="勤务等级" size="medium" style="width: 150px" clearable>
            <el-option v-for="item in levs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="imsiList" v-loading="listLoading" class="center-block" stripe :max-height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="编号" prop="recordNo" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="业务类型" prop="followType" min-width="120"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="勤务等级" prop="staffLevel" min-width="110"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请人" prop="creatorName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请人所属组织" prop="creatorGroupName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请时间" prop="createTime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="当前节点" prop="currentNode" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="当前节点负责人" prop="currentNodeOperatorName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" v-for="item in timeColumn" :key="item.prop"
                         :label="item.label" :prop="item.prop" :min-width="item.min"
                         :max-width="item.max" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="状态" prop="status" min-width="120"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('workflow:translation:detail')">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        activeItem: 'HANDLED',
        imsiList: [],
        query: {page: 1, size: 10, finishStatus: 1},
        tableHeight: window.innerHeight - 280,
        qTime: '',
        count: 0,
        timeColumn: [],
        levs: [{value: '一级', label: '一级'}, {value: '二级', label: '二级'}, {value: '三级', label: '三级'}],
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
      handleType(val) {
        if (val.name === 'FINISH') {
          this.timeColumn = [{label: '返回时间', prop: 'finishTime', min: 170, max: 200}];
          this.query.finishStatus = 0;
        } else {
          this.timeColumn = [];
          this.query.finishStatus = 1;
        }
        this.getData();
      },
      //发起申请
      addApply() {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push('/approvalApply');
      },
      //翻码详情页
      gotoDetail(row) {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        if (this.activeItem === 'HANDLED') {
          let routeData = this.$router.resolve({path: '/approvalDetail', query: {type: 4, recordId: row.recordId}});
          window.open(routeData.href, '_blank');
          // this.$router.push({path: '/approvalDetail', query: {type: 4, recordId: row.recordId}});
        } else {
          let routeData = this.$router.resolve({path: '/approvalDetail', query: {type: 0, recordId: row.recordId}});
          window.open(routeData.href, '_blank');
          // this.$router.push({path: '/approvalDetail', query: {type: 0, recordId: row.recordId}});
        }
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      pageChange(val) {
        this.query.page = val;
        this.getData();
      },
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }
        if (this.activeItem === 'FINISH') {
          this.query.finishStatus = 0;
        } else {
          this.query.finishStatus = 1;
        }
        this.listLoading = true;
        this.$post('/workflow/translation/mytranslate/' + JSON.parse(sessionStorage.getItem("user")).userId, this.query).then((data) => {
          this.imsiList = data.data.records;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.imsiList = [];
          this.$message.error(err);
        });
      },
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'followType') {
          return "IMSI翻码";
        } else if (column.property === 'status') {
          return row.status == 0 ? '已完成' : row.status == 1 ? '待审批' : row.status == 2 ? '终止' : row.status == 3 ? '待翻码' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let tab = sessionStorage.getItem("activeItem");
      let time1 = JSON.parse(sessionStorage.getItem("qTime"));
      if (tab) {
        this.activeItem = tab;
      }
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      if (time1) {
        this.qTime = time1;
      }
      this.getData();
    }
  }
</script>
