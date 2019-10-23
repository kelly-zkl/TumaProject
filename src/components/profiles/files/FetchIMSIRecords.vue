<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="queryImsi" align="left" style="text-align: left;width: 1200px">
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="queryImsi.imsi" placeholder="IMSI" size="medium" filterable clearable
                     @change="changeImsi">
            <el-option v-for="item in imsis" :key="item.imsi" :value="item.imsi"
                       :label="item.imsi+'['+(item.weightDes?item.weightDes:'--')+']'">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" @change="handleChange"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate" style="width: 360px">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="queryImsi.placeId" placeholder="场所" size="medium" filterable clearable
                     :filter-method="pinyinMatch">
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input placeholder="设备ID" v-model="queryImsi.deviceId" :maxlength="30"
                    style="width: 180px" size="medium"></el-input>
        </el-form-item>
        <!--<el-form-item style="margin-bottom: 10px">-->
        <!--<el-button type="text" size="medium" @click="isMore=!isMore">{{isMore?'收起条件':'更多条件'}}</el-button>-->
        <!--</el-form-item>-->
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="isSearch = true;getImsiData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearImsiData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list10" class="center-block" v-loading="listLoading" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="imsi" label="IMSI" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="isp" label="运营商" min-width="80"
                         max-width="120" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="netType" label="网络类型" min-width="120"
                         max-width="160" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="regional" label="IMSI归属地" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="placeName" label="采集场所" min-width="150"
                         max-width="220" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="uptime" label="采集时间" min-width="180"
                         max-width="220" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="120" max-width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoImsiDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin: 20px 0" align="right">
        <el-pagination @size-change="handleImsiSizeChange" @current-change="imsiPageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator} from "../../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        isMore: false,
        faceId: this.$route.query.faceId || '',
        queryImsi: {size: 100},
        qTime: [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        places: [], placesCopy: [], imsis: [], count: 0,
        listLoading: false, list: [], list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
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
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //首字母搜索
      pinyinMatch(val) {
        if (val) {
          var result = [];
          this.placesCopy.forEach((item) => {
            var m = PinyinMatch.match(item.placeName, val);
            if (m) {
              result.push(item);
            }
          });
          this.places = result;
        } else {
          this.places = this.placesCopy;
        }
      },
      handleChange(val) {
        if (val == null || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
      },
      /**imsi*/
      changeImsi(val) {
        this.isSearch = true;
        this.getImsiData();
      },
      //获取imsi列表
      getImsiData() {
        if (!!this.qTime) {
          this.queryImsi.startTime = Math.round(this.qTime[0] / 1000);
          this.queryImsi.endTime = Math.round(this.qTime[1] / 1000);
        }
        this.queryImsi.personId = this.faceId;
        this.listLoading = true;

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.queryImsi['pageTime'];
          this.isSearch = false;
        }
        this.$post('archives/get/listImsiHistory', this.queryImsi).then((data) => {
          if (this.queryImsi.pageTime && !this.isSearch) {
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
      //清除查询条件
      clearImsiData() {
        this.list10 = [];
        this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        this.queryImsi = {size: 100, imsi: this.imsis.length > 0 ? this.imsis[0].imsi : ''};
        this.isSearch = true;
        this.getImsiData();
      },
      imsiPageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst && (this.list.length % 100 === 0)) {
          this.firstPage = this.list.length;
          this.queryImsi.pageTime = this.list[this.list.length - 1].uptime;
          this.getImsiData();
        }
        this.list10 = this.list;
        if ((this.list.length - (index * 10)) >= 0) {
          this.list10 = this.list10.slice((index * 10 - 10), (index * 10));
        } else {
          this.list10 = this.list10.slice((index * 10 - 10), this.list.length);
        }
      },
      handleImsiSizeChange(val) {
      },
      //查看人脸详情
      gotoImsiDetail(row) {
        // this.$router.push({path: '/imsiDetail', query: {imsi: row.imsi}});
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: row.imsi}});
        window.open(routeData.href, '_blank');
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
      //告警场所
      getPlaces() {
        this.$post('person/imsiList', {faceId: this.faceId}).then((data) => {
          if ('000000' === data.code) {
            if (data.data && data.data.length > 0) {
              this.imsis = data.data;
              this.queryImsi = {size: 100, imsi: this.imsis.length > 0 ? this.imsis[0].imsi : ''};
            }
            this.clearImsiData();
          }
        });
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
