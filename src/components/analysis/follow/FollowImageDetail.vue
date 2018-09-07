<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="margin-top: 30px">
        <el-row>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px;">任务名称</p>
            <p style="margin: 5px 20px 0 20px">jghj</p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px;">任务编号</p>
            <p style="margin: 5px 20px 0 20px">hgjngh
            </p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px;">创建时间</p>
            <p style="margin: 5px 20px 0 20px">fghgyh</p>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="text" @click="">查看任务</el-button>
            <el-button type="text" @click="">删除任务</el-button>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        activeItem: 'result',
        caseTime: "",
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}]
      }
    },
    methods: {
      handleType(val) {

      }
    },
    mounted() {
    }
  }
</script>
