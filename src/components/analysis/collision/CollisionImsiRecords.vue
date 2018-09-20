<template>
  <div>
    <section class="content">
      <div class="add-appdiv">
        <el-row>
          <el-col :span="8" align="left" style="border-right: 1px #e5e5e5 solid">
            <span style="color: #999;margin-right: 20px">IMSI信息</span>
            <span>{{imsi}}</span>
          </el-col>
          <el-col :span="8" align="left" style="border-right: 1px #e5e5e5 solid">
            <span style="color: #999;margin:auto 20px;font-size: 14px">条件1</span>
            <div v-for="(item,indx) in task.condition1" :key="indx" style="margin-left: 70px">
                <span
                  style="display:inline-block;width:90%;word-wrap:break-word;white-space:normal;margin-bottom: 10px">{{item}}</span>
            </div>
          </el-col>
          <el-col :span="8" align="left">
            <span style="color: #999;margin:auto 20px;font-size: 14px">条件2</span>
            <div v-for="(item,indx) in task.condition2" :key="indx" style="margin-left: 70px">
                <span
                  style="display:inline-block;width:90%;word-wrap:break-word;white-space:normal;margin-bottom: 10px">{{item}}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-row style="margin-bottom: 10px">
        <el-col :span="24" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="所有侦码记录" name="record"></el-tab-pane>
            <el-tab-pane label="关联人员" name="person"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <!--<h5 style="border-left: 3px #6699FF solid;text-align: left;font-size: 16px;padding-left: 10px;color:#343434">-->
      <!--所有记录</h5>-->
      <div class="content" style="margin-left: 10px" v-show="activeItem == 'record'">
        <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;margin-left: 30px">
          <el-form-item label="设备ID">
            <el-input v-model="query.deviceId" placeholder="请输入设备ID" style="width: 160px" size="medium"
                      :maxlength=30></el-input>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" size="medium"
                            :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                            start-placeholder="开始日期" end-placeholder="结束日期" style="width:360px">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading" class="center-block" stripe style="margin-left: 30px">
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="uptime" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备名称" prop="deviceName" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备类型" min-width="125" max-width="250">
            <template slot-scope="scope">
              <span>微热点</span>
            </template>
          </el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
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
              <img v-bind:src="faceUrl+scope.row.faceImage" style="width: 90px;height:90px"/>
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
  import {formatDate, isPC} from "../../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        activeItem: 'record',
        taskId: this.$route.query.taskId || '',
        imsi: this.$route.query.imsi || '',
        collisionType: this.$route.query.collisionType || '',
        query: {page: 1, size: 10},
        qTime: '',
        task: {},
        records: [],
        count: 0,
        persons: [],
        listLoading1: false,
        queryPerson: {imsi: this.imsi, size: 10000, page: 1}
      }
    },
    methods: {
      //任务类型-->IMSI、图像、疑似人员
      handleType(tab, event) {
        if (this.activeItem === 'record') {//所有imsi记录
          this.getData();
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
        this.query.collisionType = this.collisionType;
        this.query.collisionTaskId = this.taskId;
        this.query.imsi = this.imsi;
        this.getData();
      },
      //获取imsi记录
      getData() {
        if (!!this.qTime) {
          this.query.startTime = this.qTime[0] / 1000;
          this.query.endTime = this.qTime[1] / 1000;
        } else {
          delete this.query['startTime'];
          delete this.query['endTime'];
        }
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
        if (column.property === 'sex') {//0-女  1-男  2-未知
          return row.sex === 0 ? '男' : row.sex === 2 ? '女' : '未知';
        } else if (column.property === 'imsiList') {
          return row.imsiList ? row.imsiList.join("， ") : '--';
        } else if (column.property === 'pushStatus') {
          return row.pushStatus === 'NO_PUSH' ? '待推送' : row.pushStatus === 'PUSHED' ? '推送完成' : '推送失败';
        } else if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //任务详情
      taskDetail() {
        this.$post('/collision/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.condition1 = this.task.condition1.split("\r\n");
          this.task.condition2 = this.task.condition2.split("\r\n");
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss')
        }).catch((err) => {
        });
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.collisionType = this.$route.query.collisionType || '';
      this.imsi = this.$route.query.imsi || '';

      this.query.collisionType = this.collisionType;
      this.query.collisionTaskId = this.taskId;
      this.query.imsi = this.imsi;

      this.taskDetail();
      this.getData();
    }
  }
</script>
