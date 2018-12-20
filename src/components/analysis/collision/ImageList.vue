<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('collision:queryRecord')">
        <el-form-item label="设备ID" style="margin-bottom: 10px">
          <el-input v-model="query.deviceId" placeholder="设备ID" style="width: 160px" size="medium"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item label="年龄段" style="margin-bottom: 10px">
          <el-input-number v-model="query.age1" controls-position="right" :min="1"
                           :max="query.age2-1" style="width: 100px" size="medium"></el-input-number>
          <span>~</span>
          <el-input-number v-model="query.age2" controls-position="right" :min="query.age1+1"
                           :max="200" style="width: 100px" size="medium"></el-input-number>
        </el-form-item>
        <el-form-item label="性别" style="margin-bottom: 10px">
          <el-select v-model="query.sex" placeholder="请选择" style="width: 100px" size="medium" clearable>
            <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" style="margin-bottom: 10px">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" size="medium"
                          :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                          start-placeholder="开始日期" end-placeholder="结束日期" style="width:360px"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场图像" prop="deviceId" min-width="125"
                         max-width="250">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.userFacePicURL" @click="bigUrl=scope.row.userFacePicURL;runBigPic=true"
                   style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄段" prop="age" min-width="100"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="100"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="抓取时间" prop="createTime" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备标识" prop="deviceName" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备类型" min-width="125" max-width="250">
          <template slot-scope="scope">
            <span>相机设备</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="125" max-width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoImage(scope.row.scensePicURL,scope.row.personID)"
                       v-show="getButtonVial('collision:queryRecord')">查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin: 20px 0" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
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
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        listLoading: false,
        runBigPic: false,
        bigUrl: '',
        taskId: this.$route.query.taskId || '',
        collisionType: this.$route.query.collisionType || '',
        picUrl: this.$route.query.picUrl || '',
        query: {page: 1, size: 10},
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        qTime: '',
        task: {},
        records: [],
        count: 0,
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
      //任务类型-->IMSI、图像、疑似人员
      handleType(tab, event) {

      },
      //碰撞记录导出
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
        this.axios.post('/collision/export/record', param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';
        this.getData();
      },
      //跳转图像记录页面
      gotoImage(pic, personID) {
        // this.$router.push({
        //   path: '/collisionImageRecords', query: {
        //     taskId: this.taskId, personID: personID,
        //     collisionType: this.collisionType, picUrl: pic
        //   }
        // });
        let routeData = this.$router.resolve({
          path: '/collisionImageRecords', query: {
            taskId: this.taskId, personID: personID,
            collisionType: this.collisionType, picUrl: pic
          }
        });
        window.open(routeData.href, '_blank');
      },
      //获取图像记录
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        } else {
          delete this.query['startTime'];
          delete this.query['endTime'];
        }

        this.query.collisionType = this.collisionType;
        this.query.collisionTaskId = this.taskId;

        this.listLoading = true;
        this.$post('/collision/queryRecord', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
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
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.collisionType = this.$route.query.collisionType || '';
      this.picUrl = this.$route.query.picUrl || '';

      this.query.collisionType = this.collisionType;
      this.query.collisionTaskId = this.taskId;

      this.getData();
    }
  }
</script>
