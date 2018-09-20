<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left">
        <el-form-item style="margin-bottom: 10px">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          size="medium" :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="伴随次数" style="margin-bottom: 10px">
          <el-row>
            <el-input v-model="query.age1" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
            <span>~</span>
            <el-input v-model="query.age2" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
          </el-row>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="faceList" class="center-block" v-loading="listLoading" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="deviceId" label="人员图像" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="imei" label="年龄" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="imsi" label="性别" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="tmsi" label="IMSI" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="uptime" label="伴随次数" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
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
  export default {
    data() {
      return {
        listLoading: false,
        query: {page: 1, size: 10},
        faceList: [],
        qTime: '',
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
      //获取IMSI告警列表
      getData() {

      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';
        this.getData();
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
        if (column.property === 'taskStatus') {
          return row.taskStatus === "WAIT" ? '等待中' : row.taskStatus === "FINISH" ? '已完成' : row.taskStatus === "FAILE" ? '失败' : row.taskStatus === "EXECUTION" ? '进行中' : '--';
        } else if (column.property === 'followType') {
          return row.followType === "IMSI" ? 'IMSI' : row.followType === "FACE" ? '图像' : row.followType === "MAC" ? 'MAC' : '--';
        } else if (column.property === 'status') {
          return row.status === 'UNHANDLED' ? '未处理' : row.status === 'EXECUTION' ? '进行中' : row.status === 'HANDLED' ? '已结案' : '--';
        } else if (column.property === 'followCount') {
          return row.followCount === 0 ? 0 : row.followCount;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
    }
  }
</script>
<style scoped></style>
