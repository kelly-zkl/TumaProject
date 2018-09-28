<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="margin-bottom:15px">
        <el-row>
          <el-col :span="8" align="left" style="border-right: 1px #e5e5e5 solid">
            <span style="font-size: 14px;color: #999;margin-right: 20px">IMSI信息</span>
            <span style="font-size: 15px">{{imsi}}</span>
          </el-col>
          <el-col :span="8" align="left" style="border-right: 1px #e5e5e5 solid">
            <span style="font-size: 14px;color: #999;margin:auto 20px;font-size: 14px">运营商</span>
            <span style="font-size: 15px">{{isp === 0 ? '移动' : isp === 1 ? '联通' : isp === 2 ? '电信' : '未知'}}</span>
          </el-col>
          <el-col :span="8" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px;font-size: 14px">归属地</span>
            <span style="font-size: 15px">{{regional}}</span>
          </el-col>
        </el-row>
      </div>
      <el-row style="margin-bottom: 15px">
        <el-col :span="24" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="所有侦码记录" name="record"></el-tab-pane>
            <el-tab-pane label="关联人员" name="person"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'record'">
        <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('follow:queryRecord')">
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                            start-placeholder="抓取时间" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.regional" placeholder="归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="getList()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="源IMSI" prop="originalImsi" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="源时间" prop="originalUpTime" width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随IMSI" prop="imsi" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随时间" prop="upTime" min-width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="归属地" prop="regional" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取地点" prop="deviceName" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" style="margin-left: 10px" v-show="activeItem == 'person'">
        <el-table :data="persons" v-loading="listLoading1" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="人员图像" prop="deviceId" min-width="125" max-width="250">
            <template slot-scope="scope">
              <img v-bind:src="scope.row.faceImage" style="max-width: 90px;max-height:90px;border-radius: 6px"/>
            </template>
          </el-table-column>
          <el-table-column align="left" label="人员ID" prop="personId" min-width="100"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="姓名" prop="name" min-width="100"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="年龄" prop="age" min-width="100"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="100"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI" prop="imsiList" min-width="180"
                           max-width="350" :formatter="formatterAddress"></el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'record',
        qTime: "",
        taskId: this.$route.query.taskId || '',
        followType: this.$route.query.followType || '',
        imsi: this.$route.query.imsi || '',
        isp: this.$route.query.isp || '',
        regional: this.$route.query.regional || '',
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        records: [],
        query: {page: 1, size: 10},
        listLoading: false,
        count: 0,
        persons: [],
        listLoading1: false,
        queryPerson: {imsi: this.imsi, size: 10000, page: 1}
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val) {
        if (this.activeItem === 'record') {//所有imsi记录
          this.getList();
        } else {//关联人员
          this.getPerson();
        }
      },
      //根据imsi查人脸
      getPerson() {
        this.queryPerson.imsi = this.imsi;
        this.listLoading1 = true;
        this.$post('/terminate/queryArchives', this.queryPerson).then((data) => {
          this.persons = data.data;
          this.listLoading1 = false;
        }).catch((err) => {
          this.persons = [];
          this.listLoading1 = false;
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';
        this.getList();
      },
      pageChange(index) {
        this.query.page = index;
        this.getList();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getList();
      },
      //imsi记录
      getList() {
        if (!!this.qTime) {
          this.query.endTime = this.qTime[1] / 1000;
          this.query.startTime = this.qTime[0] / 1000;
        } else {
          delete this.query['qTime'];
        }

        this.query.followTaskId = this.taskId;
        this.query.followType = this.followType;
        this.query.imsi = this.imsi;

        this.listLoading = true;
        this.$post('/follow/queryRecord', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {//0-男  1-女  2-未知
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '未知';
        } else if (column.property === 'imsiList') {
          return row.imsiList ? row.imsiList.join("， ") : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'upTime') {
          return row.upTime ? formatDate(new Date(row.upTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'originalUpTime') {
          return row.originalUpTime ? formatDate(new Date(row.originalUpTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'confidenceLevel') {
          return row.confidenceLevel * 100 + '%';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "未知";
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
      this.taskId = this.$route.query.taskId || '';
      this.followType = this.$route.query.followType || '';
      this.imsi = this.$route.query.imsi || '';
      this.isp = this.$route.query.isp || '';
      this.regional = this.$route.query.regional || '';

      this.getList();
    }
  }
</script>
