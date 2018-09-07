<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" name="query" ref="query" align="left">
        <el-form-item style="margin: 0">
          <el-radio-group v-model="query.status" @change="changeStatus">
            <el-radio-button label="SENDED">已发送</el-radio-button>
            <el-radio-button label="EXECUTION">进行中</el-radio-button>
            <el-radio-button label="FAILE">失败</el-radio-button>
            <el-radio-button label="FINISH">完成</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-table :data="tasks" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
        <el-table-column align="left" label="任务名称" prop="codeVal" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="发起时间" prop="msgTime" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="完成时间" prop="finishTime" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="任务状态" prop="status" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        deviceId: this.$route.query.deviceId || '',
        query: {page: 1, size: 10, status: 'SENDED', deviceId: this.$route.query.deviceId},
        listLoading: false,
        tasks: [],
        count: 0,
      }
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
      },
      //状态改变
      changeStatus(val) {
        this.getTask();
      },
      pageChange(index) {
        this.query.page = index;
        this.getTask();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getTask();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property == 'status') {
          return row.status === 'SENDED' ? '已发送' : row.status === 'FAILE' ? '失败' : row.status === 'EXECUTION' ?
            '进行中' : row.status === 'FINISH' ? '完成' : '--';
        } else if (column.property == 'msgTime') {
          return row.msgTime ? formatDate(new Date(row.msgTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property == 'finishTime') {
          return row.finishTime ? formatDate(new Date(row.finishTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取任务列表
      getTask() {
        this.listLoading = true;
        this.$post('/device/get/deviceMessage', this.query).then((data) => {
          this.tasks = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.tasks = [];
          this.$message.error(err);
        });
      }
    },
    mounted() {
      let device = this.$emit('getDevice');
      this.deviceId = this.$route.query.deviceId || device.deviceId || '';
      this.getTask();
    }
  }
</script>
