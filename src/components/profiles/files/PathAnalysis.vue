<template>
  <div>
    <section class="content">
      <el-form :model="pathLine" align="left" label-width="120px" label-position="left"
               style="margin: 20px 50px">
        <el-form-item label="时间范围">
          <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="选择记录">
          <el-checkbox-group v-model="pathLine.line">
            <el-checkbox label="imsi">IMSI</el-checkbox>
            <el-checkbox label="face">图像</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createLine()">生成轨迹</el-button>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        pathLine: {line: []},
        cTime: '',
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
      createLine() {
        this.$router.push("/pathLine")
      }
    },
    mounted() {
    }
  }
</script>
<style scoped></style>
