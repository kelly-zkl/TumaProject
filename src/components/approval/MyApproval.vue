<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="待审批" name="EXECUTION"></el-tab-pane>
            <el-tab-pane label="已审批" name="FINISH"></el-tab-pane>
            <el-tab-pane label="超时、撤销" name="CANCEL"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right" v-show="getButtonVial('workflow:translation:apply')">
          <el-button type="primary" size="medium" @click="addApply()">发起申请</el-button>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.recordId" size="medium" :maxlength=30 placeholder="编号"></el-input>
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
          <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="imsiList" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="编号" prop="recordId" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="业务类型" prop="followType" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="勤务等级" prop="staffLevel" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请人" prop="creatorName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请人所属组织" prop="creatorGroupName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="申请时间" prop="createTime" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" v-for="item in timeColumn" :key="item.prop"
                         :label="item.label" :prop="item.prop" :min-width="item.min"
                         :max-width="item.max" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="状态" prop="approveStatus" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="handlePass(scope.row,0)"
                       v-show="activeItem=='EXECUTION' && getButtonVial('workflow:translation:approve')">通过
            </el-button>
            <el-button type="text" @click="handlePass(scope.row,1)"
                       v-show="activeItem=='EXECUTION' && getButtonVial('workflow:translation:approve')">不通过
            </el-button>
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('workflow:translation:detail')">
              查看
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
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        activeItem: 'EXECUTION',
        imsiList: [],
        query: {page: 1, size: 10, approveStatus: 1},
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
        if (val.name === 'EXECUTION') {
          this.timeColumn = [];
          this.query.approveStatus = 1;
        } else {
          if (val.name === 'FINISH') {
            this.query.approveStatus = 0;
          } else {
            this.query.approveStatus = 2;
          }
          this.timeColumn = [{label: '当前节点', prop: 'currentNode', min: 150, max: 250},
            {label: '当前节点负责人', prop: 'currentNodeOperatorName', min: 150, max: 250}]
        }
        this.getData();
      },
      //通过/不通过
      handlePass(row, status) {
        let msg = '通过';
        if (status == 1) {
          msg = '不通过';
        }
        this.$confirm('确定' + msg + '该翻码申请？', '提示', {type: 'warning'}).then(() => {
          let param = {result: status, operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: ''};
          this.$post('/workflow/translation/approve/' + row.recordId, param, "操作成功").then((data) => {
            if ("000000" === data.code) {
              this.getData();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        })
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
        if (this.activeItem === 'EXECUTION') {
          this.$router.push({path: '/approvalDetail', query: {type: 2, recordId: row.recordId}})
        } else {
          this.$router.push({path: '/approvalDetail', query: {type: 0, recordId: row.recordId}})
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
          this.query.startTime = this.qTime[0] / 1000;
          this.query.endTime = this.qTime[1] / 1000;
        }
        if (this.activeItem === 'EXECUTION') {
          this.query.approveStatus = 1;
        } else if (this.activeItem === 'FINISH') {
          this.query.approveStatus = 0;
        } else {
          this.query.approveStatus = 2;
        }
        this.listLoading = true;
        this.$post('/workflow/translation/myapprove/' + JSON.parse(sessionStorage.getItem("user")).userId, this.query).then((data) => {
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
        if (column.property === 'createTime') {
          // return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          return row.createTime ? row.createTime : '--';
        } else if (column.property === 'followType') {
          return "IMSI翻码";
        } else if (column.property === 'approveStatus') {
          return row.approveStatus === 1 ? '待审批' : row.approveStatus === 0 ? '已审批' : row.approveStatus === 2 ? '超时/撤销' : '--';
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
