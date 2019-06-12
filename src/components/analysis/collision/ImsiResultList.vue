<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('collision:getAnalyseResultList')"
                   style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.imsi" placeholder="IMSI" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.isp" placeholder="运营商" style="width: 120px" size="medium" clearable>
                <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.regional" placeholder="IMSI归属地" style="width: 160px" size="medium"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="isSearch = true;getData()"
                         :loading="listLoading">搜索
              </el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()" :loading="listLoading">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" size="medium" @click="gotoTurnIMSI()" :disabled="uLogin!='uLogin'||sels.length==0"
                     v-show="getButtonVial('workflow:translation:apply')">翻码
          </el-button>
          <el-button type="primary" size="medium" @click="exportData()" :disabled="count==0"
                     v-show="getButtonVial('collision:export:analyseResult')">导出
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="125"
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
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {buttonValidator, encryData, decryData} from "../../../assets/js/util";

  var fileDownload = require('js-file-download');
  let md5 = require("crypto-js/md5");

  export default {
    props: ['sourceId'],
    data() {
      return {
        listLoading: false,
        taskId: this.sourceId,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        query: {size: 100},
        count: 0,
        list: [], list10: [], sels: [],
        uLogin: localStorage.getItem('login'),
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}]
      }
    },
    watch: {
      sourceId: function () {
        this.taskId = this.sourceId;
        this.clearData();
      }
    },
    created() {
      this.taskId = this.sourceId;
      this.clearData();
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      /*翻码*/
      gotoTurnIMSI() {
        if (this.sels.length > 10) {
          this.$message.error('翻码最多支持10个IMSI');
          return;
        }
        var arr = [];
        this.sels.forEach((item) => {
          if (this.isSingle(item.imsi, arr)) {//翻码的IMSI不能重复
            arr.push(item.imsi);
          }
        });
        var param = {
          caseId: this.$parent.$parent.task.caseId,
          task: ['coll', this.$parent.$parent.task.id], imsi: arr
        };
        sessionStorage.setItem("apply", JSON.stringify(param));
        this.$router.push({path: '/approvalApply', query: {type: 'coll'}});
      },
      //判断IMSI是否重复,翻码的IMSI最多为10个
      isSingle(val, arr) {
        let bol = true;
        arr.forEach((item) => {
          if (val == item) {
            bol = false;
          }
        });
        return bol;
      },
      selsChange(sels) {
        this.sels = sels;
      },
      //交并结果导出
      exportData() {
        var param = Object.assign({}, this.query);
        param.size = 100000;
        delete param['pageImsi'];
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
        this.axios.post('/collision/export/analyseResult', param, config).then((res) => {
          let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
          let fileName = decodeURIComponent(fileStr);
          fileDownload(res.data, fileName);
        }).catch((res) => {
        });
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: imsi}});
        window.open(routeData.href, '_blank');
      },
      //清除查询条件
      clearData() {
        this.list10 = [];
        this.isSearch = true;
        this.query = {size: 100};
        this.getData();
      },
      //获取记录
      getData() {
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageImsi'];
          this.isSearch = false;
        }
        this.query.analyseTaskId = this.taskId;
        this.listLoading = true;
        this.$post('/collision/getAnalyseResultList', this.query).then((data) => {
          if (this.query.pageImsi && !this.isSearch) {
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
          this.count = 0;
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
          this.query.pageImsi = this.list[this.list.length - 1].imsi;
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
        if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "--";
        switch (isp) {
          case 0:
            moduleId = "CMCC";
            break;
          case 1:
            moduleId = "CMUC";
            break;
          case 2:
            moduleId = "CMTC";
            break;
          default:
            break;
        }
        return moduleId;
      }
    },
    mounted() {
      this.clearData();
    }
  }
</script>
