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
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px;text-align: left;width: 1100px">
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
          <el-time-picker is-range v-model="time1" range-separator="至" start-placeholder="开始时间"
                          style="width: 230px" value-format="HH:mm:ss" end-placeholder="结束时间"
                          placeholder="选择时间范围" @change="handleTime" size="medium">
          </el-time-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable
                     style="width: 160px">
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='T'">
          <el-input placeholder="设备ID" v-model="query.cameraId" :maxlength="30" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='H'">
          <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" @click="isSearch = true;getData()" size="medium">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button @click="clearData()" size="medium">重置</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="isMore&&activeItem == 'H'">
          <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                    style="width: 160px"></el-input>
        </el-form-item>
      </el-form>
      <el-table :data="list10" class="center-block" v-loading="listLoading" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场图像" prop="sceneUrl" min-width="130" max-width="180">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.sceneUrl?scope.row.sceneUrl:imgPath2"
                   @click="bigUrl=scope.row.sceneUrl;runBigPic=true" :onerror="img2404"
                   style="height:70px;border-radius: 6px;vertical-align:middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" prop="carLicense" label="车牌号码" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="carLicenseKind" label="牌号种类" min-width="100" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="carLicenseColor" label="牌号颜色" max-width="100" min-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="placeName" label="抓取场所" min-width="130" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="catchTime" label="抓取时间" min-width="170" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="cameraName" label="设备标识" max-width="180" min-width="130"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备ID" max-width="180" min-width="130" prop="cameraId"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="110" max-width="150" fixed="right">
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

  export default {
    data() {
      return {
        runBigPic: false,
        isMore: false,
        bigUrl: '',
        activeItem: 'T',
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
        imgPath: require('../../assets/img/icon_people.png'),
        imgPath2: require('../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        img2404: "this.onerror='';this.src='" + require('../../assets/img/icon_img.svg') + "'",
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
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
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
        if (this.qTime) {//时间戳的毫秒转化成秒
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
