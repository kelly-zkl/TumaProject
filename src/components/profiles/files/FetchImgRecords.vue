<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 1200px">
        <el-form-item style="margin-bottom: 10px">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" @change="handleChange"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate" style="width: 360px">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable
                     :filter-method="pinyinMatch">
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <!--<el-form-item style="margin-bottom: 10px">-->
        <!--<el-input placeholder="输入设备ID" v-model="query.deviceId" :maxlength="30"-->
        <!--style="width: 180px" size="medium"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px">
            <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="text" size="medium" @click="isMore=!isMore">{{isMore?'收起条件':'更多条件'}}</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
        <el-form-item label="年龄段" style="margin-bottom: 10px" v-show="isMore">
          <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                           :max="query.endAge-1" style="width: 100px" size="medium"></el-input-number>
          <span>~</span>
          <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                           :max="200" style="width: 100px" size="medium"></el-input-number>
        </el-form-item>
      </el-form>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="center" label="人脸图像" prop="imageUrl" min-width="150" max-width="220">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:scope.row.imageUrl?scope.row.imageUrl:imgPath"
                   @click="bigUrl=scope.row.faceUrl?scope.row.faceUrl:scope.row.imageUrl;runBigPic=true"
                   :onerror="img404" style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄段" prop="age" min-width="80" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="80" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集场所" prop="placeName" min-width="150" max-width="200"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集时间" prop="catchTime" min-width="180" max-width="220"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)">查看大图</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin: 20px 0" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
      <!--查看大图-->
      <el-dialog title="查看大图" :visible.sync="runBigPic" width="500px" center>
        <div class="block">
          <el-row>
            <el-col :span="24" style="text-align: center" align="center">
              <img :src="bigUrl" style="max-width: 400px;max-height:400px;border-radius:8px;vertical-align:middle"/>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer" align="center" style="margin-top: 20px">
            <el-button type="primary" @click="runBigPic=false" size="medium">关闭</el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {globalValidImg, doubleValid} from "../../../assets/js/api";
  import {formatDate, buttonValidator, encryData, decryData} from "../../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        runBigPic: false, isMore: false, bigUrl: '', faceId: this.$route.query.faceId || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        query: {size: 100},
        qTime: [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        places: [], placesCopy: [], count: 0, listLoading: false,
        list: [], list10: [], isShow: false, isFirst: true,
        isSearch: false, firstPage: 0, page: 1,
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
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
          this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
      },
      //查看人脸详情
      gotoDetail(row) {
        // let routeData = this.$router.resolve({path: '/faceDetail', query: {id: row.id, imageId: row.imageId}});
        // window.open(routeData.href, '_blank');
        window.open(row.senceImageUrl ? row.senceImageUrl : row.imageUrl ? row.imageUrl ? row.faceUrl : row.faceUrl : this.imgPath, '_blank');
      },
      //获取人脸告警列表
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }
        this.query.personId = this.faceId;

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post('person/queryFaceRecrod', this.query, undefined, undefined, "multi").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
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
          } else if ("100000" === data.code) {//执行中
            setTimeout(() => {
              this.getData();
            }, 1000);
          } else {
            this.list = [];
            this.list10 = [];
            this.count = 0;
            this.listLoading = false;
            this.$message.error(data.msg);
          }
        });
      },
      //清除查询条件
      clearData() {
        this.list10 = [];
        this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        this.query = {size: 100};
        this.isSearch = true;
        delete this.query['imageUrl'];
        this.getData();
      },
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst && (this.list.length % 100 === 0)) {
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
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'catchTime' || column.property === 'createTime') {
          return row[column.property] ? formatDate(new Date(row[column.property] * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'age') {
          return row.age <= 0 ? '--' : (row.age - 3) + "~" + (row.age + 3);
        } else if (column.property === 'similarThreshold') {
          return row[column.property] <= 0 ? '--' : row[column.property];
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
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
    }
  }
</script>
