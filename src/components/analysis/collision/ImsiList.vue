<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left">
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.imsi" placeholder="请输入IMSI" size="medium" style="width: 160px"
                    :maxlength=50></el-input>
        </el-form-item>
        <el-form-item label="设备ID" style="margin-bottom: 10px">
          <el-input v-model="query.deviceId" placeholder="请输入设备ID" style="width: 160px" size="medium"
                    :maxlength=30></el-input>
        </el-form-item>
        <el-form-item label="时间范围" style="margin-bottom: 10px">
          <el-date-picker v-model="date1" type="datetimerange" range-separator="至" size="medium"
                          :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                          start-placeholder="开始日期" end-placeholder="结束日期" style="width:360px">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.isp" placeholder="选择运营商" style="width: 120px" size="medium" clearable>
            <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input v-model="query.regional" placeholder="请输入归属地" style="width: 160px" size="medium"
                    :maxlength=20></el-input>
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
        <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="归属地" prop="regional" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="抓取时间" prop="uptime" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备名称" prop="deviceName" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="130">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoImsi(scope.row.imsi)">查看详情</el-button>
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
        taskId: this.$route.query.taskId || '',
        collisionType: this.$route.query.collisionType || '',
        listLoading: false,
        date1: '',
        records: [],
        query: {page: 1, size: 10},
        count: 0,
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}]
      }
    },
    methods: {
      //跳转IMSI记录
      gotoImsi(imsi) {
        this.$router.push({
          path: '/imsiRecords', query: {
            taskId: this.taskId,
            collisionType: this.collisionType, imsi: imsi
          }
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.date1 = '';
        this.getData();
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
      //获取imsi记录
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
        if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
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
      this.collisionType = this.$route.query.collisionType || '';

      this.getData();
    }
  }
</script>
