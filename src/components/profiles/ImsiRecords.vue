<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleClick" type="border-card">
            <el-tab-pane label="今日记录" name="first"></el-tab-pane>
            <el-tab-pane label="所有记录" name="second"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-tooltip class="item" effect="dark" placement="bottom-end">
          <div slot="content">支持导出指定某一个IMSI的30天以内的记录,<br/>请在搜索栏设置完毕后再导出</div>
          <el-col :span="3" align="right" style="text-align: right" :offset="5"
                  v-show="activeItem=='second'&&getButtonVial('archives:export:record')">
            <el-button type="primary" size="medium" @click="confirmExport()" :disabled="!isExport">导出</el-button>
          </el-col>
        </el-tooltip>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px;text-align: left;width: 1100px">
        <el-form-item style="margin-bottom: 10px">
          <el-input placeholder="IMSI" v-model="query.imsi" :maxlength="300" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem == 'second'">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          size="medium" :default-time="['00:00:00', '23:59:59']" @change="handleChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='first'">
          <el-time-picker is-range v-model="time1" range-separator="至" start-placeholder="开始时间"
                          style="width: 230px" value-format="HH:mm:ss" end-placeholder="结束时间"
                          placeholder="选择时间范围" @change="handleTime" size="medium">
          </el-time-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial(exportKey)&&activeItem=='first'">
          <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" @click="isSearch = true;getData()" size="medium">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button @click="clearData()" size="medium">重置</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial(exportKey)&&isMore&&activeItem == 'second'">
          <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="isMore">
          <el-input v-model="query.regional" placeholder="IMSI归属地" size="medium" style="width: 160px"
                    :maxlength=20></el-input>
        </el-form-item>
      </el-form>
      <el-table :data="list10" class="center-block" v-loading="listLoading" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <!--<el-table-column align="left" prop="telephone" label="手机号" min-width="150" max-width="200"-->
        <!--:formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" prop="deviceName" label="设备标识" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="placeName" label="抓取场所" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="uptime" label="抓取时间" min-width="170" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="isp" label="运营商" max-width="150" min-width="100"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="netType" label="网络类型" max-width="150" min-width="100"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI归属地" max-width="200" min-width="150" prop="regional"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('archives:getImsiRecordByImsi')">查看详情
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
  import {numValid, noValidator} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        isMore: false,
        activeItem: 'first',
        tableHeight: window.innerHeight - 285,
        qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
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
        query: {size: 100},
        time1: ['00:00:00', '23:59:59'],
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        },
        isExport: true
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //导出数据
      confirmExport() {
        var param = Object.assign({}, this.query);
        if (!param.imsi) {
          this.$message.error('请输入IMSI');
          return;
        }
        if (!numValid(param.imsi) || param.imsi.length != 15) {
          this.$message.error('请输入15位正确的IMSI');
          return;
        }
        delete this.query['pageTime'];
        delete this.query['size'];
        let config;
        if (sessionStorage.getItem("user")) {
          let userId = JSON.parse(sessionStorage.getItem("user")).userId;
          if (userId) {
            let stringify = JSON.stringify(param);
            let token = md5(stringify + userId + "key-hz-20180123").toString();
            config = {headers: {token: token, tokenId: userId}, responseType: 'arraybuffer'};
          }
        }
        this.axios.post("archives/export/record", param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //更多条件
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = window.innerHeight - 335
        } else {
          this.tableHeight = window.innerHeight - 285
        }
      },
      handleChange(val) {
        if (!val || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
        let bol = ((val[1] - val[0]) > 60 * 60 * 24 * 30 * 1000);
        if (bol) {
          this.isExport = false;
        } else {
          this.isExport = true;
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
      handleClick(tab, event) {
        this.isMore = false;
        this.clearData();
        if (this.activeItem === 'second') {
          this.exportKey = 'archives:get:listImsiHistory';
        } else {
          this.exportKey = 'archives:get:listImsiToday';
        }
      },
      //查看IMSI详情
      gotoDetail(row) {
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: row.imsi, id: row.id}});
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/imsiDetail', query: {imsi: row.imsi, id: row.id}});
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //历史数据
      getData() {
        let url = 'archives/get/listImsiToday';
        if (this.activeItem === 'second') {
          url = 'archives/get/listImsiHistory';
        }

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
        if (this.qTime) {//时间戳的毫秒转化成秒
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
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst && (this.list.length % 100 === 0)) {
          this.firstPage = this.list.length;
          this.query.pageTime = this.list[this.list.length - 1].uptime;
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
        this.time1 = ['00:00:00', '23:59:59'];
        this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
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
      this.getPlaces();
      this.getData();
    }
  }
</script>
