<template>
  <div>
    <section class="content">
      <el-form align="left" label-width="120px" label-position="left" style="margin: 20px 50px">
        <el-form-item label="时间范围">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="记录类型">
          <el-checkbox-group v-model="line">
            <el-checkbox label="imsi">IMSI</el-checkbox>
            <!--<el-checkbox label="face">图像</el-checkbox>-->
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
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        line: ['imsi'],//, 'face'
        qTime: [new Date((formatDate(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        }
      }
    },
    methods: {
      createLine() {
        if (this.qTime.length === 0) {
          this.$message.error('请选择时间范围');
          return;
        }
        if (this.line.length === 0) {
          this.$message.error('请选择记录类型');
          return;
        }
        let imsi = 0, face = 0;

        if (this.line.length === 2) {
          imsi = 1;
          face = 1;
        } else {
          this.line[0] == 'imsi' ? imsi = 1 : face = 1;
        }
        localStorage.setItem("pathTime", JSON.stringify(this.qTime));
        // this.$router.push({path: '/pathLine', query: {imsi: imsi, face: face}});
        let routeData = this.$router.resolve({path: '/pathLine', query: {imsi: imsi, face: face}});
        window.open(routeData.href, '_blank');
      }
    },
    mounted() {
    }
  }
</script>
<style scoped></style>
