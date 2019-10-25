<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('collision:queryRecord')"
                   style="text-align: left;width: 1000px;">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.imsi" placeholder="IMSI" size="medium" style="width: 160px"
                        :maxlength=50></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" size="medium"
                              :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                              start-placeholder="开始日期" end-placeholder="结束日期" style="width:360px"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
              <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable
                         style="width: 160px" :filter-method="pinyinMatch">
                <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="text" size="medium" @click="isMore=!isMore">{{isMore?'收起条件':'更多条件'}}</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="isSearch = true;getData()"
                         :loading="listLoading">搜索
              </el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()" :loading="listLoading">重置</el-button>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px" v-show="isMore">-->
            <!--<el-input v-model="query.deviceId" placeholder="设备ID" style="width: 160px" size="medium"-->
            <!--:maxlength=30></el-input>-->
            <!--</el-form-item>-->
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-input v-model="query.regional" placeholder="IMSI归属地" style="width: 160px" size="medium"
                        :maxlength=20></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="exportData()" :disabled="count==0"
                     v-show="getButtonVial('collision:export:dataSourceRecord')">导出
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="运营商" prop="isp" min-width="100"
                         max-width="120" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="网络类型" prop="netType" min-width="100"
                         max-width="120" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集场所" prop="placeName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集时间" prop="uptime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <!--<el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"-->
        <!--max-width="200" :formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="设备ID" prop="deviceId" min-width="150"-->
        <!--max-width="200" :formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" label="操作" min-width="110" max-width="130" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoImsi(scope.row.imsi)"
                       v-show="getButtonVial('archives:getImsiRecordByImsi')">查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin: 20px 0" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator, encryData, decryData} from "../../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    props: ['dataId'],
    data() {
      return {
        isMore: false, taskId: '', listLoading: false, qTime: '',
        list: [], list10: [], isFirst: true, isSearch: false,
        firstPage: 0, places: [], placesCopy: [], page: 1,
        query: {size: 100}, count: 0,
        pickerBeginDate: {
          shortcuts: [{
            text: '最近6小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 6);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近12小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 12);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }],
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        }
      }
    },
    watch: {
      dataId: function () {
        this.taskId = this.dataId.split('?')[0];
        this.getPlaces();
        this.clearData();
      }
    },
    created() {
      this.taskId = this.dataId.split('?')[0];
      this.getPlaces();
      this.clearData();
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //首字母搜索
      pinyinMatch(val) {
        if (val) {
          let result = [];
          this.placesCopy.forEach((item) => {
            let m = PinyinMatch.match(item.placeName, val);
            if (m) {
              result.push(item);
            }
          });
          this.places = result;
        } else {
          this.places = this.placesCopy;
        }
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: imsi}});
        window.open(routeData.href, '_blank');
      },
      //交并记录导出
      exportData() {
        let param = Object.assign({}, this.query);
        param.size = 100000;
        delete param['pageTime'];
        let config;
        if (sessionStorage.getItem("user")) {
          let userId = JSON.parse(decryData(sessionStorage.getItem("user"))).userId;
          if (userId) {
            if (!param) {
              param = {}
            }
            let stringify = JSON.stringify(param);
            let token = md5(stringify + userId + "key-hz-20180123").toString();
            config = {headers: {token: token, tokenId: userId}, responseType: 'arraybuffer'};
          }
        }
        this.axios.post('/collision/export/dataSourceRecord', param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //获取imsi记录
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        } else {
          delete this.query['startTime'];
          delete this.query['endTime'];
        }

        this.query.dataSourceId = this.taskId;

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post('/collision/queryRecord', this.query).then((data) => {
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
          this.count = 0;
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
        this.qTime = '';

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "--";
        switch (isp) {
          case 0:
            moduleId = "CMCC";
            break;
          case 1:
            moduleId = "CMUC";
            break;
          case 2:
            moduleId = "CMTC";
            break;
          default:
            break;
        }
        return moduleId;
      },
      //场所列表
      getPlaces() {
        if (this.getButtonVial('place:query')) {
          this.$post("place/query", {page: 1, size: 999999}).then((data) => {
            this.places = data.data.list;
            this.placesCopy = Object.assign([], this.places);
          }).catch((err) => {
            this.places = [];
            this.placesCopy = [];
          });
        }
      }
    },
    mounted() {
    }
  }
</script>
