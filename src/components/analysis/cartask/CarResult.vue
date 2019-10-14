<template>
  <div>
    <section class="content">
      <el-row style="margin-top: 10px">
        <el-col :span="18">
          <el-form :inline="true" :model="queryResult" align="left" v-show="getButtonVial('car:task:result:query')"
                   style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="queryResult.carLicense" placeholder="车牌" size="medium" style="width: 160px"
                        :maxlength=10></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="queryResult.carLicenseKind" placeholder="牌号种类" size="medium" clearable filterable>
                <el-option v-for="item in carTypes" :key="item.label" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="queryResult.carLicenseColor" placeholder="牌号颜色" size="medium" clearable filterable>
                <el-option v-for="item in carColors" :key="item.value" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="queryResult.page=1;getResult()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="exportData()" :disabled="count==0"
                     v-show="getButtonVial('car:task:result:export')">导出
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="results" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="100"></el-table-column>
        <el-table-column align="left" label="目标车牌" prop="carLicense" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="牌号种类" prop="carLicenseKind" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="牌号颜色" prop="carLicenseColor" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="命中场所数量" prop="placeCount" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="命中总次数" prop="followCount" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="置信度" prop="degree" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="120" max-width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoPath(scope.row)"
                       v-show="getButtonVial('car:task:analyse:query')">查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin:15px 0" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                       :current-page.sync="queryResult.page" :page-sizes="[10, 15, 20, 30]"
                       :page-size="queryResult.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--碰撞轨迹分析-->
      <div class="device">
        <el-dialog title="碰撞轨迹分析" :visible.sync="runPathLine" width="96%">
          <el-form :inline="true" :model="queryPath" align="left" style="text-align: left">
            <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
              <el-select v-model="queryPath.placeId" placeholder="场所" size="medium" filterable clearable
                         :filter-method="pinyinMatch">
                <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="queryPath.page=1;getPath()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearPath()">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="pathLines" v-loading="pathLoading" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="场所" prop="placeName" min-width="150" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="车辆采集图片" min-width="150" max-width="200">
              <template slot-scope="scope">
                <div style="height: 90px;line-height:90px">
                  <img v-bind:src="scope.row.sceneUrl?scope.row.sceneUrl:imgPath" :onerror="img404"
                       style="max-width: 90px;max-height:90px;border-radius:6px;vertical-align:middle;cursor: pointer"
                       onclick="javascript:window.open(this.src)"/>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="left" label="车辆采集时间" prop="carUptime" min-width="180" max-width="250"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="IMSI采集时间" prop="imsiUptime" min-width="180" max-width="250"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="采集间隔" prop="timeDifference" min-width="120" max-width="180"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="命中次序/次数" prop="number" min-width="150" max-width="200"
                             :formatter="formatterAddress"></el-table-column>
          </el-table>
          <div class="block" style="margin: 15px 0" align="right">
            <el-pagination @size-change="pathSizeChange" @current-change="pathPageChange"
                           :current-page.sync="queryPath.page" :page-sizes="[10, 15, 20, 30]"
                           :page-size="queryPath.size" :total="count1" background
                           layout="total, sizes, prev, pager, next, jumper"></el-pagination>
          </div>
        </el-dialog>
      </div>
    </section>
  </div>
</template>
<script>
  import {buttonValidator, formatDate, encryData, decryData} from "../../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        taskNo: this.$route.query.no || '',
        results: [],
        queryResult: {page: 1, size: 10},
        queryPath: {page: 1, size: 10},
        listLoading: false,
        pathLoading: false,
        runPathLine: false,
        count: 0, count1: 0,
        carLicense: '',
        records: [],
        pathLines: [],
        places: [], placesCopy: [],
        imgPath: require('../../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_img.svg') + "'",
        carTypes: [{value: 'small', label: '小型汽车'}, {value: 'veh', label: '大型汽车'},
          {value: 'fe', label: '使馆汽车'}, {value: 'police', label: '境外汽车'}, {value: 'sol', label: '外籍摩托车'},
          {value: 'soach', label: '外籍汽车'}, {value: 'other', label: '其他'}],
        carColors: [{value: 'blue', label: '蓝色'}, {value: 'yellow', label: '黄色'}, {value: 'green', label: '绿色'},
          {value: 'black', label: '黑色'}, {value: 'white', label: '白色'}]
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
      //伴随结果导出
      exportData() {
        let param = {};
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
        param = Object.assign({}, this.queryResult);
        param.page = 1;
        param.size = 100000;
        param.rtype = 'car';
        this.axios.post("/car/task/result/export", param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //查看
      gotoPath(row) {
        this.runPathLine = true;
        this.carLicense = row.carLicense;
        this.queryPath = {page: 1, size: 10};
        this.getPath();
      },
      clearPath() {
        this.queryPath = {page: 1, size: 10};
        this.getPath();
      },
      pathPageChange(index) {
        this.queryPath.page = index;
        this.getPath();
      },
      pathSizeChange(val) {
        this.queryPath.size = val;
        this.getPath();
      },
      getPath() {
        this.queryPath.ctaskId = this.taskNo;
        this.queryPath.carLicense = this.carLicense;
        this.pathLoading = true;
        this.$post('/car/task/analyse/query', this.queryPath).then((data) => {
          this.pathLines = data.data.list;
          this.count1 = data.data.count;
          this.pathLoading = false;
        }).catch((err) => {
          this.pathLines = [];
          this.count1 = 0;
          this.pathLoading = false;
        });
      },
      //清除查询条件
      clearData() {
        this.queryResult = {page: 1, size: 10};
        this.getResult();
      },
      pageChange(index) {
        this.queryResult.page = index;
        this.getResult();
      },
      handleSizeChange(val) {
        this.queryResult.size = val;
        this.getResult();
      },
      //分析结果
      getResult() {
        this.queryResult.ctaskId = this.taskNo;
        this.listLoading = true;
        this.$post('/car/task/result/query', this.queryResult).then((data) => {
          this.results = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.count = 0;
          this.results = [];
          this.listLoading = false;
        });
      },
      //场所
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
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'degree') {
          return (row.degree * 100).toFixed(1) + '%';
        } else if (column.property === 'number') {
          return '第' + (row.number == undefined ? '--' : row.number) + '次/共' + (row.sumNumber == undefined ? '--' : row.sumNumber) + '次';
        } else if (column.property === 'imsiUptime' || column.property === 'carUptime') {
          return row[column.property] ? formatDate(new Date(row[column.property] * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'timeDifference') {
          return row[column.property] == undefined ? '--' : row[column.property] + '秒';
        } else if (column.property === 'followCount' || column.property === 'placeCount') {
          return row[column.property] == undefined ? '--' : row[column.property];
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.taskNo = this.$route.query.no || '';
      this.getPlaces();
      this.getResult();
    }
  }
</script>
