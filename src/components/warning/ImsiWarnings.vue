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
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px;text-align: left"
               v-show="getButtonVial(exportKey)">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.imsi" placeholder="输入IMSI" size="medium" style="width: 160px"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.regional" placeholder="输入归属地" size="medium" style="width: 160px"
                    :maxlength=20></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-if="activeItem=='H'">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <!--<el-form-item style="margin-bottom: 10px">-->
        <!--<el-select v-model="query.blackClassId" placeholder="人员名单" size="medium" style="width: 150px">-->
        <!--<el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.status" placeholder="告警状态" size="medium" style="width: 130px" clearable>
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="getData()" v-if="activeItem=='T'">搜索</el-button>
          <el-button type="primary" size="medium" @click="isSearch = true;getData()" v-if="activeItem=='H'">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="抓取IMSI" prop="imsi" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="归属地" prop="regional" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警场所" prop="placeName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警时间" prop="createTime" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警状态" prop="status" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="所属名单" prop="blackClass" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('warning:getImsiWarning')">查看告警
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right" v-if="activeItem == 'H'">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="page"
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
        query: {size: 5},
        listLoading: false,
        statuses: [{label: '待处理', value: 0}, {label: '处理中', value: 1},
          {label: '已处理', value: 2}, {label: '误报', value: 3}],
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
        intervalid: null,
        places: [],
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
    //页面关闭时停止刷新
    beforeDestroy() {
      clearInterval(this.intervalid);
      this.intervalid = null;
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //定时刷新侦码数据
      dataTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getTodayData();
          }, 2000);
        }
      },
      handleType(val, ev) {
        this.clearData();

        if (this.activeItem === 'H') {
          this.exportKey = 'warning:get:listImsiHistory';
          clearInterval(this.intervalid);
          this.intervalid = null;
        } else {
          this.exportKey = 'warning:get:listImsiToday';
          this.dataTask();
        }
      },
      gotoDetail(row) {
        this.$router.push({path: '/imsiWarningDetail', query: {id: row.id, imsi: row.imsi}});
      },
      //获取IMSI告警列表
      getData() {
        if (!!this.qTime) {
          this.query.startTime = this.qTime[0] / 1000;
          this.query.endTime = this.qTime[1] / 1000;
        }
        if (this.activeItem === 'H') {
          this.getAllData();
        } else {
          this.getTodayData();
        }
      },
      //今天的数据
      getTodayData() {
        this.listLoading = false;
        this.$post("warning/get/listImsiToday", this.query).then((data) => {
          if (this.list10.length >= 10) {
            this.list10 = [];
          }
          if (this.list10.length === 0) {//
            data.data.forEach((item) => {
              if ((new Date().getTime() - item.catchTime * 1000) >= -120 * 1000 && (new Date().getTime() - item.catchTime * 1000) <= 120 * 1000) {//10s内的数据
                setTimeout(() => {
                  this.list10.push(item);
                }, 1000);
              }
            });
          } else {//
            data.data.forEach((item) => {
              if ((new Date().getTime() - item.catchTime * 1000) >= -120 * 1000 && (new Date().getTime() - item.catchTime * 1000) <= 120 * 1000) {//10s内的数据
                for (let terminate of this.list10) {
                  if (terminate.id === item.id) {
                    return;
                  }
                }
                setTimeout(() => {
                  this.list10.push(item);
                }, 1000);
              }
            });
          }
        }).catch((err) => {
          this.list10 = [];
          this.listLoading = false;
          this.$message.error(err);
        });
      },
      //历史数据
      getAllData() {
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post("warning/get/listImsiHistory", this.query).then((data) => {
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
          this.query.pageTime = this.list[this.list.length - 1].catchTime;
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
        if (this.activeItem === 'T') {
          this.query = {size: 5};
          this.isShow = false;
        } else {
          this.query = {size: 100};
          this.isSearch = true;
        }
        this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];

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
      this.getPlaces();
      this.getData();
      this.dataTask();
    }
  }
</script>
<style>

</style>
