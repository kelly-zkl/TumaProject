<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('collision:imsiRecord:statistics')"
                   style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.imsi" placeholder="IMSI" style="width: 180px" size="medium"
                        :maxlength=15></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.placeId" placeholder="采集场所" size="medium" filterable clearable>
                <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="exportData()" :disabled="count==0"
                     v-show="getButtonVial('collision:export:collisionStatistics')">导出数据
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="IMSI" prop="imsi" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集场所" prop="placeName" min-width="125"
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
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" background :total="count"
                       layout="sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator} from "../../../assets/js/util";

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    props: ['sourceData'],
    data() {
      return {
        taskId: '',
        targetType: '',
        listLoading: false,
        query: {page: 1, size: 10},
        count: 0,
        records: [],
        places: []
      }
    },
    watch: {
      sourceData: function () {
        let param = JSON.parse(this.sourceData);
        this.taskId = param.sourceId;
        this.targetType = param.dataType;
        this.clearData();
      }
    },
    created() {
      let param = JSON.parse(this.sourceData);
      this.taskId = param.sourceId;
      this.targetType = param.dataType;
      this.clearData();
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: imsi}});
        window.open(routeData.href, '_blank');
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.getPlaces();
        this.getData();
      },
      //交并统计导出
      exportData() {
        var param = Object.assign({}, this.query);
        param.page = 1;
        param.size = 100000;
        let config;
        if (sessionStorage.getItem("user")) {
          let userId = JSON.parse(sessionStorage.getItem("user")).userId;
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
      //获取地区统计记录
      getData() {
        this.query.targetType = this.targetType;
        this.query.targetId = this.taskId;
        this.query.contentType = "place";//归属地regional、采集辖区areaCode、采集场所place

        this.listLoading = true;
        this.$post('/collision/imsiRecord/statistics', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.count = 0;
          this.listLoading = false;
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'count') {
          return row.count == 0 ? 0 : row.count;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
      }
    },
    mounted() {
    }
  }
</script>
