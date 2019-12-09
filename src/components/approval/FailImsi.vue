<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="20" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 1000px">
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                              start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp" @change="handleDate"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.resultType" placeholder="翻码状态" size="medium" clearable style="width: 120px">
                <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" align="center" style="text-align: center">
          <el-button type="primary" size="medium" @click="confirmExport()"
                     v-show="getButtonVial('sync:threeParty:download')">导出
          </el-button>
        </el-col>
      </el-row>
      <el-table ref="table" :data="results" v-loading="listLoading" class="center-block" stripe
                :height="tableHeight" :max-height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="威慑ID" prop="deterrenceId" min-width="200" max-width="300"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="人脸" prop="url" min-width="200" max-width="300">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.url?scope.row.url:imgPath"
                   @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                   style="max-width: 90px;max-height:90px;border-radius:6px;vertical-align:middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="IMSI[置信度]" prop="imsiList" min-width="200" max-width="300">
          <template slot-scope="scope">
            <div v-for="item in scope.row.imsiList" v-show="scope.row.imsiList.length>0">
              <span>{{item?item:'--'}}</span>
            </div>
            <span v-show="!scope.row.imsiList||scope.row.imsiList.length==0">{{'--'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="手机号码" prop="phoneList" min-width="200" max-width="300">
          <template slot-scope="scope">
            <div v-for="item in scope.row.phoneList" v-show="scope.row.phoneList.length>0">
              <span>{{item?item:'--'}}</span>
            </div>
            <span v-show="!scope.row.phoneList||scope.row.phoneList.length==0">{{'--'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="翻码状态" prop="resultList" min-width="200" max-width="300">
          <template slot-scope="scope">
            <div v-for="item in scope.row.resultList" v-show="scope.row.resultList.length>0">
              <span v-bind:style="item=='失败'?'color:#ff0000':''">{{item?item:'--'}}</span>
            </div>
            <span v-show="!scope.row.resultList||scope.row.resultList.length==0">{{'--'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="推送时间" prop="sendTime" min-width="200" max-width="300"
                         :formatter="formatterAddress"></el-table-column>
      </el-table>
      <div class="block" style="margin-top:10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
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
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator, encryData, decryData} from "../../assets/js/util";

  let fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    data() {
      return {
        query: {size: 10, page: 1}, count: 0, results: [],
        bigUrl: '', runBigPic: false, listLoading: false,
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        statuses: [{value: 0, label: '失败'}, {value: 1, label: '成功'}],
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
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
      //导出数据
      confirmExport() {
        let param = Object.assign({}, this.query);
        let config;
        if (sessionStorage.getItem("user")) {
          let userId = JSON.parse(decryData(sessionStorage.getItem("user"))).userId;
          if (userId) {
            let stringify = JSON.stringify(param);
            let token = md5(stringify + userId + "key-hz-20180123").toString();
            config = {headers: {token: token, tokenId: userId}, responseType: 'arraybuffer'};
          }
        }
        this.axios.post("sync/threeParty/download", param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //选择时间段
      handleDate(val) {
        if (val == null || val.length == 0) {
          this.$message.error('请选择日期范围');
          return;
        }
        if (val[1] - val[0] > 60 * 60 * 24 * 1000 * 3) {
          this.$message.error('日期范围不能超过3天');
          return;
        }
        this.getData();
      },
      getData() {
        if (!!this.qTime) {
          this.query.beginTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
          if (this.query.endTime - this.query.beginTime > 60 * 60 * 24 * 3) {
            this.$message.error('日期范围不能超过3天');
            return;
          }
        } else {
          delete this.query['beginTime'];
          delete this.query['endTime'];
        }
        this.listLoading = true;
        this.$post('sync/threeParty/query', this.query).then((data) => {
          this.results = data.data ? data.data.list ? data.data.list : [] : [];
          this.count = data.data ? data.data.count ? data.data.count : 0 : 0;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.results = [];
          this.count = 0;
          this.$message.error(err);
        });
      },
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      pageChange(val) {
        this.query.page = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
      }
    },
    mounted() {
      this.getData();
    }
  }
</script>
