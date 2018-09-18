<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeName" @tab-click="handleClick" type="border-card">
            <el-tab-pane label="今日记录" name="first"></el-tab-pane>
            <el-tab-pane label="历史记录" name="second"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px;text-align: left">
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial(exportKey)">
          <el-input placeholder="设备ID" v-model="query.deviceName" :maxlength="30" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input placeholder="IMSI" v-model="query.imsi" :maxlength="300" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.regional" placeholder="输入归属地" size="medium" style="width: 160px"
                    :maxlength=20></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:queryg')">
          <el-select v-model="query.placeId" placeholder="选择场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeName == 'second'">
          <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          size="medium" :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" icon="search" @click="getData()" size="medium">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button @click="clearData()" size="medium">清除</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" class="center-block" v-loading="listLoading" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="telephone" label="手机号" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="deviceName" label="设备标识" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="place" label="抓取场所" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="catchTime" label="抓取时间" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="isp" label="运营商" max-width="150" min-width="100"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="netType" label="网络类型" max-width="150" min-width="100"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="归属地" max-width="200" min-width="150" prop="regional"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('archives:getImsiRecordById')">查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
    </section>
  </div>
</template>

<script>
  import {noValidator} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeName: 'first',
        cTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        count: 0,
        places: [],
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        exportKey: 'archives:get:listImsiToday',
        listLoading: false,
        query: {size: 5},
        intervalid: null,
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
      handleClick(tab, event) {
        this.clearData();
        this.exportKey = 'archives:get:listImsiToday';
        if (this.activeName === 'second') {
          this.exportKey = 'archives:get:listImsiHistory';
        }
      },
      //查看IMSI详情
      gotoDetail(row) {
        this.$router.push({path: '/imsiDetail', query: {id: row.id, imsi: row.imsi}});
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'catchTime') {
          return row.catchTime ? formatDate(new Date(row.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //历史数据
      getData() {
        if (this.query.deviceId) {
          if (noValidator(this.query.deviceId)) {
            this.$message.error('请输入正确的设备设备ID');
            return;
          }
        }
        if (this.query.imsi) {
          if (!/[0-9]$/.test(this.query.imsi)) {
            this.$message.error('请输入正确的imsi');
            return;
          }
        }
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startTime = this.cTime[0] / 1000;
          this.query.endTime = this.cTime[1] / 1000;
        }
        if (this.activeName === 'second') {
          this.getAllData();
        } else {
          this.getTodayData();
        }
      },
      //今天的数据
      getTodayData() {
        this.listLoading = false;
        this.$post("archives/get/listImsiToday", this.query).then((data) => {
          if (this.list.length >= 10) {
            this.list = [];
          }
          if (this.list.length === 0) {//
            data.data.forEach((item) => {
              if ((new Date().getTime() - item.catchTime) >= -120 * 1000 && (new Date().getTime() - item.catchTime) <= 120 * 1000) {//10s内的数据
                setTimeout(() => {
                  this.list.push(item);
                }, 1000);
              }
            });
          } else {//
            data.data.forEach((item) => {
              if ((new Date().getTime() - item.catchTime) >= -120 * 1000 && (new Date().getTime() - item.catchTime) <= 120 * 1000) {//10s内的数据
                for (let terminate of this.list) {
                  if (terminate.id === item.id) {
                    return;
                  }
                }
                setTimeout(() => {
                  this.list.push(item);
                }, 1000);
              }
            });
          }
        }).catch((err) => {
          this.list = [];
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
        this.$post("archives/get/listImsiHistory", this.query).then((data) => {
          if (this.query.pageTime && !this.isSearch) {
            this.list = this.list.concat(data.data);
          } else {
            this.list = data.data;
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
          this.query.pageTime = this.list[this.list.length - 1].catchTime / 1000;
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
        this.list = [];
        if (this.activeName === 'first') {
          this.query = {size: 5};
          this.isShow = false;
        } else {
          this.query = {size: 100};
          this.isSearch = true;
        }
        this.cTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];

        this.getData();
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
      let tab = sessionStorage.getItem("activeName");
      let time1 = sessionStorage.getItem("cTime");
      if (tab && bol) {
        this.activeName = tab;
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      if (time1) {
        this.cTime = time1.split(',');
      }
      this.getPlaces();
      this.getData();
      this.dataTask();
    }
  }
</script>
