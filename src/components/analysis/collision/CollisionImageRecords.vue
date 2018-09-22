<template>
  <div>
    <section class="content">
      <div class="add-appdiv">
        <el-row>
          <el-col :span="8" align="left" style="border-right: 1px #e5e5e5 solid">
            <img v-bind:src="picUrl" style="max-width: 80%;border-radius: 8px"/>
          </el-col>
          <el-col :span="8" align="left">
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
      <!--<div align="left" class="tab-card">-->
      <!--<el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">-->
      <!--<el-tab-pane label="所有记录" name="imsi"></el-tab-pane>-->
      <!--<el-tab-pane label="关联身份" name="identity"></el-tab-pane>-->
      <!--</el-tabs>-->
      <!--</div>-->
      <h5 style="border-left: 3px #6699FF solid;text-align: left;font-size: 16px;padding-left: 10px;color:#343434">
        所有记录</h5>
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
        <el-table-column align="left" label="现场图像" prop="deviceId" min-width="125"
                         max-width="250">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.userFacePicURL" style="width: 90px;height:90px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄" prop="age" min-width="100"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="100"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="抓取时间" prop="createTime" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备名称" prop="deviceName" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备类型" min-width="125" max-width="250">
          <template slot-scope="scope">
            <span>相机设备</span>
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
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC} from "../../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        activeItem: "imsi",
        taskId: this.$route.query.taskId || '',
        collisionType: this.$route.query.collisionType || '',
        personID: this.$route.query.personID || '',
        picUrl: this.$route.query.picUrl || '',
        query: {page: 1, size: 10},
        qTime: '',
        task: {},
        records: [],
        count: 0
      }
    },
    methods: {
      //任务类型-->IMSI、图像、疑似人员
      handleType(tab, event) {

      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.query.collisionType = this.collisionType;
        this.query.collisionTaskId = this.taskId;
        this.query.personID = this.personID;
        this.qTime = '';
        this.getData();
      },
      //获取图像记录
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
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '未知';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
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
      this.picUrl = this.$route.query.picUrl || '';
      this.personID = this.$route.query.personID || '';

      this.query.collisionType = this.collisionType;
      this.query.collisionTaskId = this.taskId;
      this.query.personID = this.personID;

      this.taskDetail();
      this.getData();
    }
  }
</script>
