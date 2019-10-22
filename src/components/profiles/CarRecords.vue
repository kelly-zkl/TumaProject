<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleClick" type="border-card">
            <el-tab-pane label="今日记录" name="T"></el-tab-pane>
            <el-tab-pane label="所有记录" name="H"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top:15px;text-align:left;width:1300px">
        <el-form-item style="margin-bottom: 10px">
          <el-input placeholder="车牌号" v-model="query.carLicense" :maxlength="7" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem == 'H'">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          size="medium" :default-time="['00:00:00', '23:59:59']" @change="handleChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='T'">
          <el-tooltip class="item" effect="dark" content="开始时间" placement="bottom">
            <el-time-picker v-model="time1[0]" style="width:120px" value-format="HH:mm:ss"
                            placeholder="开始时间" @change="handleTime($event,0)" size="medium">
            </el-time-picker>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="结束时间" placement="bottom">
            <el-time-picker v-model="time1[1]" style="width:120px" value-format="HH:mm:ss"
                            placeholder="结束时间" @change="handleTime($event,1)" size="medium">
            </el-time-picker>
          </el-tooltip>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable
                     style="width: 160px" :filter-method="pinyinMatch">
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item style="margin-bottom: 10px">-->
        <!--<el-input placeholder="设备ID" v-model="query.cameraId" :maxlength="30" size="medium"-->
        <!--style="width: 160px"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" @click="isSearch = true;getData()" size="medium">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button @click="clearData()" size="medium">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list10" class="center-block" v-loading="listLoading" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场车牌图像" prop="sceneUrl" min-width="150" max-width="200">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.sceneUrl?scope.row.sceneUrl:imgPath"
                   @click="bigUrl=scope.row.sceneUrl;runBigPic=true" :onerror="img404"
                   style="max-height:70px;border-radius: 4px;vertical-align:middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" prop="carLicense" label="车牌号码" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="carLicenseKind" label="牌号种类" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="carLicenseColor" label="牌号颜色" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="placeName" label="采集场所" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="catchTime" label="采集时间" min-width="180" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <!--<el-table-column align="left" prop="cameraName" label="设备标识" max-width="180" min-width="130"-->
        <!--:formatter="formatterAddress"></el-table-column>-->
        <!--<el-table-column align="left" label="设备ID" max-width="180" min-width="130" prop="cameraId"-->
        <!--:formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" label="操作" min-width="130" max-width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('car:record:detail')">查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
    </section>
    <!--查看大图-->
    <el-dialog title="查看大图" :visible.sync="runBigPic" width="500px" center>
      <div class="block">
        <el-row>
          <el-col :span="24" style="text-align: center" align="center">
            <img :src="bigUrl" style="max-width: 400px;max-height:400px;border-radius:6px;vertical-align:middle"/>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer" align="center" style="margin-top: 20px">
          <el-button type="primary" @click="runBigPic=false" size="medium">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {numValid, noValidator} from "../../assets/js/api";
  import {formatDate, buttonValidator} from "../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        runBigPic: false,
        bigUrl: '',
        activeItem: 'T',
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 285,
        qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        count: 0, places: [], placesCopy: [], list: [], list10: [],
        isShow: false, isFirst: true, isSearch: false, firstPage: 0, page: 1,
        imgPath: require('../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_img.svg') + "'",
        listLoading: false,
        query: {size: 100},
        time1: ['00:00:00', '23:59:59'],
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
        if (!val || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 60 * 60 * 24 * 7 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
        this.getData();
      },
      handleTime(val, idx) {
        this.time1[idx] = val;
        if (!val || val.length == 0) {
          this.time1 = ['00:00:00', '23:59:59'];
        }
        this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[0]).replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[1]).replace(/-/g, '/')).getTime()];
        this.getData();
      },
      handleClick(tab, event) {
        this.clearData();
      },
      //查看IMSI详情
      gotoDetail(row) {
        let routeData = this.$router.resolve({path: '/carDetail', query: {id: row.id}});
        window.open(routeData.href, '_blank');
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'catchTime') {
          return row.catchTime ? formatDate(new Date(row.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
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
        if (this.qTime) {
          if (this.qTime.length < 2) {
            this.$message.error('请选择日期时间段');
            return;
          }
          if (this.qTime[0] >= this.qTime[1]) {
            this.$message.error('结束时间要大于开始时间');
            return;
          }
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageId'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post('car/record/query', this.query).then((data) => {
          if (this.query.pageId && !this.isSearch) {
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
          this.query.pageId = this.list[this.list.length - 1].id;
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
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 60 * 60 * 24 * 7 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        } else {
          this.time1 = ['00:00:00', '23:59:59'];
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[0]).replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[1]).replace(/-/g, '/')).getTime()];
        }

        this.getData();
      },
      //告警场所
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
      this.getPlaces();
      this.getData();
    }
  }
</script>
