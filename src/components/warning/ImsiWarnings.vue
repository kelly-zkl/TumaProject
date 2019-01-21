<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="今日告警" name="T"></el-tab-pane>
            <el-tab-pane label="历史告警" name="H"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right" style="text-align: right" v-show="getButtonVial('warning:dealWithWarningById')">
          <el-button type="primary" size="medium" @click=changeStatus(2) :disabled="sels.length == 0">已处理</el-button>
          <el-button size="medium" @click=changeStatus(3) :disabled="sels.length == 0">误报</el-button>
        </el-col>
      </el-row>
      <div class="s-tip" v-show="showTip && getButtonVial('disposition:query')">
        <i class="el-icon-info" style="color: #1890FF;font-size: 15px;margin-right: 5px"></i>
        <span style="color: #343434">当前没有进行中的布控任务。
          <el-button type="text" style="margin: 0;padding: 0" @click="$router.push('/addControl')"
                     v-show="getButtonVial('disposition:add')">添加布控任务</el-button>
        </span>
        <el-button type="text" style="margin: 0;padding: 0;position: absolute;right: 10px"
                   icon="el-icon-close" @click="showTip=false;calcuHeight()"></el-button>
      </div>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 1100px"
               v-show="getButtonVial(exportKey)">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.imsi" placeholder="IMSI" size="medium" style="width: 160px"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.regional" placeholder="IMSI归属地" size="medium" style="width: 160px"
                    :maxlength=20></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.status" placeholder="告警状态" size="medium" style="width: 130px" clearable>
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='H'&&isMore">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" @change="handleChange"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='T'&&isMore">
          <el-time-picker is-range v-model="time1" range-separator="至" start-placeholder="开始时间"
                          style="width: 230px" value-format="HH:mm:ss" end-placeholder="结束时间"
                          placeholder="选择时间范围" @change="handleTime">
          </el-time-picker>
        </el-form-item>
      </el-form>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe
                @selection-change="selsChange" :height="tableHeight">
        <el-table-column type="selection" width="45" align="left" :selectable="checkboxInit"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警场所" prop="placeName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警时间" prop="createTime" min-width="170"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警状态" prop="status" min-width="100"
                         max-width="250" :formatter="formatterAddress">
          <template slot-scope="scope">
            <span style="color:#dd6161" v-show="scope.row.status == 0">待处理</span>
            <span style="color:#00C755" v-show="scope.row.status == 2">已处理</span>
            <span style="color:#999" v-show="scope.row.status == 3">误报</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('warning:getImsiWarning')">查看告警
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'T',
        query: {size: 100},
        listLoading: false,
        isMore: false,
        tableHeight: window.innerHeight - 280,
        statuses: [{label: '待处理', value: 0}, {label: '已处理', value: 2}, {label: '误报', value: 3}],
        exportKey: 'warning:get:listImsiToday',
        qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        count: 0,
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        places: [],
        showTip: false,
        sels: [],
        time1: ['00:00:00', '23:59:59'],
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
      showMore() {
        this.isMore = !this.isMore;
        this.calcuHeight();
      },
      //计算表格高度
      calcuHeight() {
        if (this.isMore) {
          this.tableHeight = window.innerHeight - 330;
          if (this.showTip) {
            this.tableHeight = window.innerHeight - 380
          }
        } else {
          this.tableHeight = window.innerHeight - 280;
          if (this.showTip) {
            this.tableHeight = window.innerHeight - 330
          }
        }
      },
      //是否有进行中的布控任务
      getTask() {
        if (this.getButtonVial('disposition:query')) {
          this.$post('disposition/query', {page: 1, size: 10, taskStatus: "EXECUTION"}).then((data) => {
            this.showTip = data.data.list.length == 0;
            this.calcuHeight();
          }).catch((err) => {
            this.showTip = false;
            this.calcuHeight();
          });
        }
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      checkboxInit(row, index) {
        if (row.status !== 0)
          return 0;//不可勾选
        else
          return 1;//可勾选
      },
      changeStatus(status) {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$prompt('确认已处理此告警？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '录入备注（非必填）',
          inputValidator: function (value) {
            let bol = true;
            if (value) {
              bol = (value.length <= 200)
            }
            return bol
          },
          inputErrorMessage: '请输入200字以内的备注'
        }).then(({value}) => {
          let param = {
            ids: arr, status: status, remark: value ? value : '',
            dealWithUser: JSON.parse(sessionStorage.getItem("user")).account
          };
          this.$post('warning/dealWithWarningById', param, "处理成功").then((data) => {
            this.$emit('getWarningCount');
            this.sels = [];
            this.getData();
          }).catch((err) => {
            this.$message.error(err);
          });
        }).catch(() => {
        });
      },
      handleChange(val) {
        if (!val || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
        // if (val && val.length == 2) {
        //   let bol = ((val[1] - val[0]) > 60 * 60 * 24 * 7 * 1000);
        //   if (bol) {
        //     this.$message.error('日期范围不能超过7天');
        //     return;
        //   }
        // }
        this.getData();
      },
      handleTime(val) {
        if (!val || val.length == 0) {
          this.time1 = ['00:00:00', '23:59:59'];
        }
        this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[0]).replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[1]).replace(/-/g, '/')).getTime()];
        this.getData();
      },
      handleType(val, ev) {
        this.isMore = false;
        this.clearData();
        this.getTask();

        if (this.activeItem === 'H') {
          this.exportKey = 'warning:get:listImsiHistory';
        } else {
          this.exportKey = 'warning:get:listImsiToday';
        }
      },
      gotoDetail(row) {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        let routeData = this.$router.resolve({path: '/imsiWarningDetail', query: {id: row.id, imsi: row.imsi}});
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/imsiWarningDetail', query: {id: row.id, imsi: row.imsi}});
      },
      //获取IMSI告警列表
      getData() {
        let url = 'warning/get/listImsiToday';
        if (this.activeItem === 'H') {
          url = 'warning/get/listImsiHistory';
        }

        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post(url, this.query).then((data) => {
          if (this.query.pageTime && !this.isSearch) {
            this.list = this.list.concat(data.data);
          } else {
            this.list = data.data ? data.data : [];
            this.page = 1;
            this.firstPage = 0
          }
          this.list10 = this.list;
          if (this.list.length - this.page * 10 >= 0) {
            this.list10 = this.list10.slice((this.page * 10 - 10), (this.page * 10));
          } else {
            this.list10 = this.list10.slice((this.page * 10 - 10), this.list.length);
          }
          this.count = this.list.length;
          if (this.list.length - this.firstPage === 100) {
            this.isFirst = false;
          } else {
            this.isFirst = true;
          }
          this.listLoading = false;
        }).catch((err) => {
          this.list = [];
          this.list10 = [];
          this.listLoading = false;
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst &&
          (this.list.length % 100 === 0 || this.list.length === this.couple)) {
          this.firstPage = this.list.length;
          this.query.pageTime = this.list[this.list.length - 1].createTime;
          this.getData();
        }
        this.list10 = this.list;
        if ((this.list.length - (index * 10)) >= 0) {
          this.list10 = this.list10.slice((index * 10 - 10), (index * 10));
        } else {
          this.list10 = this.list10.slice((index * 10 - 10), this.list.length);
        }
      },
      handleSizeChange(val) {
      },
      clearData() {
        this.list10 = [];
        this.isSearch = true;
        this.query = {size: 100};

        if (this.activeItem === 'H') {
          this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        } else {
          this.time1 = ['00:00:00', '23:59:59'];
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row.status === 0 ? '待处理' : row.status === 1 ? '处理中' : row.status === 2 ? '已处理' : row.status === 3 ? '误报' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //告警场所
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
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
        delete this.query['pageTime'];
      }
      if (time1) {
        this.qTime = time1;
      }
      this.getTask();
      this.getPlaces();
      this.getData();
    }
  }
</script>
<style scoped>
  .s-tip {
    color: #666;
    text-align: left;
    font-size: 13px;
    padding: 10px 20px;
    margin-top: 10px;
    background: #E6F7FF;
    border: 1px solid #91D5FF;
    border-radius: 4px;
    position: relative;
  }
</style>
