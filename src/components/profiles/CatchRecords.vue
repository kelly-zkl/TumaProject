<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="今日记录" name="T"></el-tab-pane>
            <el-tab-pane label="所有记录" name="H"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 1100px">
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial(exportKey)">
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
        <el-form-item style="margin-bottom: 10px" v-show="activeItem == 'H'">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" @change="handleChange"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate" style="width: 360px">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='T'">
          <el-time-picker is-range v-model="time1" range-separator="至" start-placeholder="开始时间"
                          style="width: 230px" value-format="HH:mm:ss" end-placeholder="结束时间"
                          placeholder="选择时间范围" @change="handleTime" size="medium">
          </el-time-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input placeholder="设备ID" v-model="query.deviceId" :maxlength="30" size="medium"
                    style="width: 170px"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem == 'T'">
          <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable
                     style="width: 170px">
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem == 'H'&&isMore">
          <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年龄段" style="margin-bottom: 10px" v-show="isMore">
          <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                           :max="query.endAge-1" style="width: 100px" size="medium"></el-input-number>
          <span>~</span>
          <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                           :max="200" style="width: 100px" size="medium"></el-input-number>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="isMore">
          <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px" clearable>
            <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="人脸图像" prop="imageUrl" min-width="125" max-width="250">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.imageUrl?scope.row.imageUrl:imgPath"
                   @click="bigUrl=scope.row.imageUrl;runBigPic=true" :onerror="img404"
                   style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄段" prop="age" min-width="80" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="60" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集场所" prop="placeName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="采集时间" prop="catchTime" min-width="170"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备ID" prop="deviceId" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="110" max-width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('archives:getFaceRecordById')">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 10px" align="right">
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
  import {globalValidImg, doubleValid, noValidator} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        runBigPic: false,
        isMore: false,
        tableHeight: window.innerHeight - 280,
        bigUrl: '',
        activeItem: 'T',
        query: {size: 100},
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        count: 0,
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        listLoading: false,
        exportKey: 'archives:get:listFaceToday',
        places: [],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
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
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = window.innerHeight - 330
        } else {
          this.tableHeight = window.innerHeight - 280
        }
      },
      handleChange(val) {
        if (!val || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
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
      handleType(val) {
        this.isMore = false;
        this.clearData();

        if (this.activeItem === 'H') {
          this.exportKey = 'archives:get:listFaceHistory';
        } else {
          this.exportKey = 'archives:get:listFaceToday';
        }
      },
      //查看人脸详情
      gotoDetail(row) {
        let routeData = this.$router.resolve({path: '/faceDetail', query: {id: row.id, imageId: row.imageId}});
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/faceDetail', query: {id: row.id, imageId: row.imageId}});
      },
      //批量导入设备的文件格式验证
      beforeAvatarUpload(file) {
        if (globalValidImg(file, this.$message)) {
        }
        return globalValidImg(file, this.$message);
      },
      //批量导入设备的文件格式验证
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
      //获取IMSI告警列表
      getData() {
        let url = 'archives/get/listFaceToday';
        if (this.activeItem === 'H') {
          url = 'archives/get/listFaceHistory';
        }
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

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post(url, this.query, undefined, undefined, "login").then((data) => {
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
      clearData() {
        this.list10 = [];
        this.query = {size: 100};
        this.isSearch = true;
        delete this.query['faceUrl'];
        this.time1 = ['00:00:00', '23:59:59'];
        this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'catchTime') {
          return row.catchTime ? formatDate(new Date(row.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
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
<style>

</style>
