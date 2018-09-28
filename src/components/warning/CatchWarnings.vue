<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="今日告警" name="T"></el-tab-pane>
            <el-tab-pane label="历史告警" name="H"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px;text-align: left">
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial(exportKey)">
          <el-input v-model.number="query.similarThreshold" placeholder="相似度阈值" size="medium" style="width: 260px">
            <el-upload ref="upload" class="upload" slot="prepend" :action="uploadUrl" name="file"
                       :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                       :auto-upload="true" :show-file-list="false">
              <el-button type="primary" size="medium">上传头像图片</el-button>
            </el-upload>
          </el-input>
        </el-form-item>
        <el-form-item label="年龄" style="margin-bottom: 10px">
          <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                           :max="query.endAge-1" style="width: 100px" size="medium"></el-input-number>
          <span>~</span>
          <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                           :max="200" style="width: 100px" size="medium"></el-input-number>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px">
            <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-if="activeItem=='H'">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <!--<el-form-item style="margin-bottom: 10px">-->
        <!--<el-select v-model="query.blackClassId" placeholder="人员名单" size="medium" style="width: 150px">-->
        <!--<el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">-->
        <!--</el-option>-->
        <!--</el-select>-->
        <!--</el-form-item>-->
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.status" placeholder="告警状态" size="medium" style="width: 130px">
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场图像" prop="sceneUrl" min-width="150"
                         max-width="300" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.sceneUrl?scope.row.sceneUrl:imgPath"
                 @click="bigUrl=scope.row.sceneUrl;runBigPic=true"
                 style="max-height:70px;border-radius: 6px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄" prop="age" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警场所" prop="placeName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警时间" prop="createTime" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警状态" prop="status" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="布控人员图像" prop="faceUrl" min-width="150"
                         max-width="250" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                 @click="bigUrl=scope.row.faceUrl;runBigPic=true"
                 style="max-width: 90px;max-height:90px;border-radius: 6px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="相似度" prop="similarThreshold" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <!--<el-table-column align="left" label="所属名单" prop="blackClass" min-width="150"-->
        <!--max-width="250" :formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('warning:getFaceWarning')">查看告警
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="page"
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
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";
  import {globalValidImg, doubleValid, noValidator} from "../../assets/js/api";

  export default {
    data() {
      return {
        runBigPic: false,
        bigUrl: '',
        activeItem: 'T',
        imgPath: require('../../assets/img/icon_people.png'),
        query: {size: 100},
        statuses: [{label: '待处理', value: 0}, {label: '已处理', value: 2}, {label: '误报', value: 3}],
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
        exportKey: 'warning:get:listFaceToday',
        places: [],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        imgUrl: '',
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date().getTime();
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
      handleType(val, ev) {
        this.clearData();

        if (this.activeItem === 'H') {
          this.exportKey = 'warning:get:listFaceHistory';
        } else {
          this.exportKey = 'warning:get:listFaceToday';
        }
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
            this.$message({message: '头像上传成功', type: 'success'});
            this.isSearch = true;
            this.getData();
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      gotoDetail(row) {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push({path: '/faceWarningDetail', query: {id: row.id, faceId: row.faceId}});
      },
      //获取图像告警列表
      getData() {
        let url = 'warning/get/listFaceToday';
        if (this.activeItem === 'H') {
          url = 'warning/get/listFaceHistory';
        }

        if (!!this.qTime) {
          this.query.startTime = this.qTime[0] / 1000;
          this.query.endTime = this.qTime[1] / 1000;
        }
        if (this.query.similarThreshold) {
          if (!doubleValid(this.query.similarThreshold)) {
            console.log('doubleValid');
            this.$message.error('相似度为0.1-99的数字');
            return;
          } else {
            if (this.query.similarThreshold < 0.1 || this.query.similarThreshold > 99) {
              console.log('< 0.1 || >99');
              this.$message.error('相似度为0.1-99的数字');
              return;
            }
          }
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
              this.list = data.data ? data.data : [];
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
            }, 5000);
          } else {
            this.list = [];
            this.list10 = [];
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
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst &&
          (this.list.length % 100 === 0 || this.list.length === this.couple)) {
          this.firstPage = this.list.length;
          this.query.pageTime = this.list[this.list.length - 1].createTime;
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
        if (this.activeItem === 'H') {
          this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        } else {
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row.status === 0 ? '待处理' : row.status === 1 ? '处理中' : row.status === 2 ? '已处理' : row.status === 3 ? '误报' : '--';
        } else if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '未知';
        } else if (column.property === 'age' || column.property === 'similarThreshold') {
          return row[column.property] < 0 ? '未知' : row[column.property];
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
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
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let tab = sessionStorage.getItem("activeItem");
      let time1 = JSON.parse(sessionStorage.getItem("qTime"));
      if (tab) {
        this.activeItem = tab;
      }
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      if (time1) {
        this.qTime = time1;
      }
      this.getPlaces();
      this.getData();
    }
  }
</script>
<style>

</style>
