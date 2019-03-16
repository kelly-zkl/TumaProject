<template>
  <div>
    <section class="content">
      <el-tabs v-model="activeItem" @tab-click="handleType">
        <el-tab-pane label="IMSI" name="imsi"></el-tab-pane>
        <el-tab-pane label="图像" name="face"></el-tab-pane>
      </el-tabs>
      <div v-show="activeItem=='imsi'">
        <el-form :inline="true" :model="queryImsi" align="left" style="margin-top: 10px;text-align: left;width: 1120px">
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="queryImsi.imsi" placeholder="IMSI" size="medium" filterable clearable>
              <el-option v-for="item in imsis" :key="item.imsi" :label="item.imsi+'['+item.weightDes+']'"
                         :value="item.imsi">
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
            <el-select v-model="queryImsi.placeId" placeholder="场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="text" size="medium" @click="isMore=!isMore">{{isMore?'收起条件':'更多条件'}}</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="isSearch = true;getImsiData()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearImsiData()">重置</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-show="isMore">
            <el-input placeholder="设备ID" v-model="queryImsi.deviceId" :maxlength="30"
                      style="width: 180px" size="medium"></el-input>
          </el-form-item>
        </el-form>
        <el-table :data="list10" class="center-block" v-loading="listLoading" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="isp" label="运营商" min-width="100"
                           max-width="120" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="regional" label="IMSI归属地" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="uptime" label="抓取时间" min-width="170" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="placeName" label="抓取场所" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备标识" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImsiDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleImsiSizeChange" @current-change="imsiPageChange" :current-page.sync="page"
                         :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
        </div>
      </div>
      <div v-show="activeItem=='face'">
        <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 1120px">
          <el-form-item style="margin-bottom: 10px">
            <el-upload ref="upload" class="upload img" :action="uploadUrl" name="file"
                       :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                       :auto-upload="true" :show-file-list="false">
              <el-button size="medium" style="width: 100px">
              <span class="el-upload__text">
                <span v-if="!query.faceUrl">
                  <i class="fa fa-photo fa-lg"></i>上传头像
                </span>
                <img :src="query.faceUrl" v-if="query.faceUrl" style="height: 30px">
              </span>
              </el-button>
            </el-upload>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" @change="handleChange"
                            start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate" style="width: 360px">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
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
          <el-form-item style="margin-bottom: 10px" v-show="isMore">
            <el-input placeholder="输入设备ID" v-model="query.deviceId" :maxlength="30"
                      style="width: 180px" size="medium"></el-input>
          </el-form-item>
          <el-form-item label="年龄段" style="margin-bottom: 10px" v-show="isMore">
            <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                             :max="query.endAge-1" style="width: 100px" size="medium"></el-input-number>
            <span>~</span>
            <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                             :max="200" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-show="isMore">
            <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="人员图像" prop="imageUrl" min-width="120" max-width="150">
            <template slot-scope="scope">
              <div style="height: 90px;line-height:90px">
                <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                     @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                     style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="left" label="年龄段" prop="age" min-width="80" max-width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="80" max-width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取场所" prop="placeName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="catchTime" min-width="170"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                         :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
        </div>
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
  import {globalValidImg, doubleValid, noValidator} from "../../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'imsi',
        runBigPic: false,
        isMore: false,
        bigUrl: '',
        faceId: this.$route.query.faceId || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        queryImsi: {size: 100},
        query: {size: 100},
        qTime: [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        places: [],
        imsis: [],
        count: 0,
        listLoading: false,
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        imgUrl: '',
        count1: 0,
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
      handleChange(val) {
        if (!val || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
      },
      handleType(val) {
        this.isMore = false;
        this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 30 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        this.isSearch = false;
        if (val.name === 'imsi') {
          this.queryImsi = {size: 100, imsi: this.imsis.length > 0 ? this.imsis[0].imsi : ''};
          this.getImsiData();
        } else {
          this.query = {size: 100};
          this.getData();
        }
      },
      /**imsi*/
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
      //查看图像详情
      gotoImsiDetail(row) {
        // this.$router.push({path: '/imsiDetail', query: {imsi: row.imsi}});
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: row.imsi}});
        window.open(routeData.href, '_blank');
      },
      /**图像*/
      //查看图像详情
      gotoDetail(row) {
        // this.$router.push({path: '/faceDetail', query: {id: row.id, imageId: row.imageId}});
        let routeData = this.$router.resolve({path: '/faceDetail', query: {id: row.id, imageId: row.imageId}});
        window.open(routeData.href, '_blank');
      },
      //选择图片的文件格式验证
      beforeAvatarUpload(file) {
        if (globalValidImg(file, this.$message)) {
        }
        return globalValidImg(file, this.$message);
      },
      handleSuccess(res, file) {
        if (res.code === '000000') {
          if (res.data) {
            this.query.faceUrl = res.data.fileUrl;
            let param = JSON.parse(sessionStorage.getItem("system")).similarThreshold;
            this.query.similarThreshold = param ? param : 60;
            this.$message({message: '头像上传成功', type: 'success'});
            this.isSearch = true;
            this.getData();
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      //获取图像告警列表
      getData() {
        if (this.query.faceUrl) {
          if (!this.query.similarThreshold) {
            this.$message.error('请输入相似度');
            return;
          }
        }
        if (this.query.similarThreshold) {
          if (!this.query.faceUrl) {
            this.$message.error('请上传头像');
            return;
          }
        }
        if (this.query.similarThreshold) {
          if (!doubleValid(this.query.similarThreshold)) {
            this.$message.error('相似度为0.1-99的数字');
            return;
          } else {
            if (this.query.similarThreshold < 0.1 || this.query.similarThreshold > 99) {
              this.$message.error('相似度为0.1-99的数字');
              return;
            }
          }
        }
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
        this.$post('person/queryFaceRecrod', this.query, undefined, undefined, "login").then((data) => {
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
        if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'catchTime') {
          return row.catchTime ? formatDate(new Date(row.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
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
        this.$post('archives/detail', {faceId: this.faceId, showFaceTraces: 1, showImsiDetail: 1}).then((data) => {
          if ('000000' === data.code) {
            if (data.data.imsiList && data.data.imsiList.length > 0) {
              this.imsis = data.data.imsiList;
              this.queryImsi = {size: 100, imsi: this.imsis.length > 0 ? this.imsis[0].imsi : ''};
            }
            this.getImsiData();
          }
        });
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
      }
    },
    mounted() {
      this.getPlaces();
    }
  }
</script>
<style scoped></style>
