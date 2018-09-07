<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left">
        <el-form-item label="设备ID" style="margin-bottom: 10px">
          <el-input v-model="query.deviceId" placeholder="请输入设备ID" style="width: 160px" size="medium"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item label="年龄" style="margin-bottom: 10px">
          <el-input v-model.number="query.age1" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
          <span>~</span>
          <el-input v-model.number="query.age2" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
        </el-form-item>
        <el-form-item label="性别" style="margin-bottom: 10px">
          <el-select v-model="query.sex" placeholder="请选择" style="width: 100px" size="medium" clearable>
            <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" style="margin-bottom: 10px">
          <el-date-picker v-model="date1" type="datetimerange" range-separator="至" size="medium"
                          :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                          start-placeholder="开始日期" end-placeholder="结束日期" style="width:360px">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
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
            <img v-bind:src="faceUrl+scope.row.userFacePicURL" style="width: 90px;height:90px"/>
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
        <el-table-column align="left" label="操作" min-width="125" max-width="250">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoImage(faceUrl+scope.row.scensePicURL,scope.row.personID)">查看详情
            </el-button>
          </template>
        </el-table-column>
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
        activeType: "imsi",
        taskId: this.$route.query.taskId || '',
        collisionType: this.$route.query.collisionType || '',
        picUrl: this.$route.query.picUrl || '',
        query: {page: 1, size: 10},
        sexs: [{value: '0', label: '男'}, {value: '2', label: '女'}],
        date1: '',
        task: {},
        records: [],
        count: 0
      }
    },
    methods: {
      //任务类型-->IMSI、图像、疑似人员
      handleType(tab, event) {

      },
      //碰撞记录导出
      exportData() {
        var param = Object.assign({}, this.query);
        param.page = 1;
        param.size = 100000;
        this.axios.post('/collision/export/record', param, {responseType: 'arraybuffer'}).then((res) => {
          let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
          let objectUrl = URL.createObjectURL(blob);
          window.location.href = objectUrl;
        }).catch(function (res) {
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.date1 = '';
        this.getData();
      },
      //跳转图像记录页面
      gotoImage(pic, personID) {
        this.$router.push({
          path: '/imageRecords', query: {
            taskId: this.taskId, personID: personID,
            collisionType: this.collisionType, picUrl: pic
          }
        });
      },
      //获取图像记录
      getData() {
        if (!!this.date1) {
          this.query.startTime = this.date1[0] / 1000;
          this.query.endTime = this.date1[1] / 1000;
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
          return row.sex === '0' ? '男' : row.sex === '2' ? '女' : '未知';
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
