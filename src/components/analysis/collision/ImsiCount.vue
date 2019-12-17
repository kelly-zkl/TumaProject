<template>
  <div>
    <section class="content">
      <el-tabs v-model="activeItem" @tab-click="handleType" type="card">
        <el-tab-pane label="归属地" name="regional"></el-tab-pane>
        <!--<el-tab-pane label="采集辖区" name="areaCode"></el-tab-pane>-->
        <el-tab-pane label="采集场所" name="place"></el-tab-pane>
      </el-tabs>
      <el-row>
        <el-col :span="18" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('collision:imsiRecord:statistics')"
                   style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.imsi" placeholder="IMSI" style="width: 180px" size="medium"
                        :maxlength=15></el-input>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px" v-show="activeItem=='regional'">-->
            <!--<el-select v-model="query.isp" size="medium" placeholder="运营商" style="width: 120px">-->
            <!--<el-option :label="param.label" :value="param.value" v-for="param in operators"-->
            <!--:key="param.value"></el-option>-->
            <!--</el-select>-->
            <!--</el-form-item>-->
            <el-form-item style="margin-bottom: 10px" v-show="activeItem=='regional'">
              <el-input v-model="query.regional" placeholder="IMSI归属地" style="width: 180px" size="medium"
                        :maxlength=30></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="activeItem=='areaCode'">
              <el-cascader :options="provinceList" :props="props" @change="areaChange" filterable clearable
                           v-model="areaList" placeholder="全部地区" size="medium">
              </el-cascader>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="query.contentType=='place'&&getButtonVial('place:query')">
              <el-select v-model="query.placeId" placeholder="采集场所" size="medium" filterable clearable
                         :filter-method="pinyinMatch" @focus="pinyinChange">
                <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="exportData()" :disabled="count==0"
                     v-show="getButtonVial('collision:export:collisionStatistics')">导出
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="IMSI" prop="imsi" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="运营商" prop="isp" min-width="125" v-if="activeItem=='regional'"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="125" v-if="activeItem=='regional'"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集辖区" prop="areaCode" min-width="125" v-if="activeItem=='areaCode'"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集场所" prop="placeName" min-width="125" v-if="activeItem=='place'"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集次数" prop="count" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="130" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoImsi(scope.row.imsi)"
                       v-show="getButtonVial('archives:getImsiRecordByImsi')">查看IMSI
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
  import {buttonValidator, getAreaLable, encryData, decryData} from "../../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    props: ['sourceData'],
    data() {
      return {
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        areaList: [], taskId: '', targetType: '', listLoading: false, activeItem: 'regional',
        isFirst: true, isSearch: false, firstPage: 0, page: 1, query: {size: 100}, count: 0,
        list: [], list10: [], placesCopy: [], places: []
      }
    },
    watch: {
      sourceData: function () {
        let param = JSON.parse(this.sourceData);
        this.taskId = param.sourceId.split('?')[0];
        this.targetType = param.dataType;
        this.activeItem = 'regional';
        this.clearData();
      }
    },
    created() {
      let param = JSON.parse(this.sourceData);
      this.taskId = param.sourceId.split('?')[0];
      this.targetType = param.dataType;
      this.activeItem = 'regional';
      this.clearData();
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      pinyinChange() {
        this.places = this.placesCopy;
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
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        this.query.areaCode = value[value.length - 1];
      },
      //归属地、采集辖区、采集场所页签切换
      handleType(tab, event) {
        this.clearData();
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: imsi}});
        window.open(routeData.href, '_blank');
      },
      //清除查询条件
      clearData() {
        this.list10 = [];
        this.isSearch = true;
        this.query = {size: 100};
        this.areaList = [];
        if (this.activeItem == 'place') {
          this.getPlaces();
        }
        this.getData();
      },
      //交并统计导出
      exportData() {
        var param = Object.assign({}, this.query);
        param.size = 100000;
        delete param['pageCount'];
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
        this.axios.post('/collision/export/collisionStatistics', param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //获取归属地/辖区/场所的统计结果
      getData() {
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageCount'];
          this.isSearch = false;
        }
        this.query.targetType = this.targetType;
        this.query.targetId = this.taskId;
        this.query.contentType = this.activeItem;

        this.listLoading = true;
        this.$post('/collision/imsiRecord/statistics', this.query).then((data) => {
          if (this.query.pageCount && !this.isSearch) {
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
          this.query.pageCount = this.list[this.list.length - 1].count;
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
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'count') {
          return row.count == 0 ? 0 : row.count;
        } else if (column.property === 'areaCode') {
          return row.areaCode ? getAreaLable(row.areaCode) : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
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
