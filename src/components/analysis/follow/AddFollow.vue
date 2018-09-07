<template>
  <div>
    <section class="content">
      <el-form ref="followTask" :model="followTask" label-position="right" label-width="100px" :rules="rules">
        <h5 class="add-label" style="margin-top: 0">关联案件</h5>
        <div class="add-appdiv">
          <el-form-item label="设置案件" align="left" style="margin:0" prop="caseId">
            <el-select v-model="followTask.caseId" placeholder="选择案件" filterable clearable>
              <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <h5 class="add-label">设置伴随任务</h5>
        <div class="add-appdiv">
          <el-form-item label="任务名称" align="left" prop="taskName">
            <el-input v-model="followTask.taskName" placeholder="请输入任务名称" style="width: 400px" :maxlength=30></el-input>
          </el-form-item>
          <el-form-item label="任务类型" align="left" style="margin:0" prop="followType">
            <el-radio-group v-model="followTask.followType">
              <el-radio label="IMSI">IMSI</el-radio>
              <!--<el-radio label="FACE">图像</el-radio>-->
              <!--<el-radio label="MAC">MAC</el-radio>-->
            </el-radio-group>
          </el-form-item>
        </div>
        <h5 class="add-label">设置分析条件</h5>
        <div class="add-appdiv">
          <el-form-item label="分析对象" align="left" prop="followTarget">
            <el-input v-model="followTask.followTarget" placeholder="请输入分析对象"
                      style="width: 400px" :maxlength=50></el-input>
          </el-form-item>
          <el-form-item label="设备" align="left">
            <el-select v-model="followTask.deviceId" placeholder="请选择设备" multiple collapse-tags>
              <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceName"
                         :value="item.deviceId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期" align="left" prop="startDate">
            <el-date-picker v-model="followTask.startDate" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="时间间隔" align="left" prop="interval" style="margin: 0">
            <el-input v-model.number="followTask.interval" placeholder="请输入时间间隔" type="number"
                      style="width: 400px" :maxlength=5>
              <template slot="append">秒</template>
            </el-input>
          </el-form-item>
        </div>
      </el-form>
      <div class="block" style="margin-top: 30px">
        <el-button type="primary" @click="createFollowTask()">确认分析</el-button>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      let nameValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9_\u4e00-\u9fa5]$/.test(value)) {
          callback(new Error("由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      let noValidator = (rule, value, callback) => {
        if (!/[a-zA-Z0-9_]$/.test(value)) {
          callback(new Error("由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        followTask: {followType: "IMSI", interval: 120},
        cases: [],
        tasks: [{value: "IMSI", label: "IMSI"}],
        deviceList: [],
        rules: {
          caseId: [
            {required: true, message: '请选择案件', trigger: 'blur'}
          ],
          followTarget: [
            {required: true, message: '请输入分析对象', trigger: 'blur'},
            {validator: noValidator, trigger: "change,blur"}
          ],
          followType: [
            {required: true, message: '请选择任务类型', trigger: 'blur'}
          ],
          startDate: [
            {required: true, message: '请选择日期', trigger: 'blur'}
          ],
          interval: [
            {required: true, message: '请输入时间间隔', trigger: 'blur'}
          ],
          taskName: [
            {required: true, message: '请输入任务名称', trigger: 'blur'},
            {validator: nameValidator, trigger: "change,blur"}
          ]
        }
      }
    },
    methods: {
      //创建伴随任务
      createFollowTask() {
        this.$refs['followTask'].validate((valid) => {
          if (valid) {
            this.followTask.endDate = this.followTask.startDate[1] / 1000;
            this.followTask.startDate = this.followTask.startDate[0] / 1000;

            this.followTask.caseName = this.getCaseName();

            this.$post("follow/add", this.followTask, "创建成功").then((data) => {
              if ("000000" === data.code)
                this.$router.go(-1);
            });
          }
        })
      },
      //获取案件名称
      getCaseName() {
        for (let item of this.cases) {
          if (item.id === this.followTask.caseId) {
            return item.caseName;
          }
        }
      },
      //获取设备列表
      getDevice() {
        this.$post("device/query", {page: 1, size: 999999}).then((data) => {
          this.deviceList = data.data.list;
        }).catch((err) => {
          this.deviceList = [];
        });
      },
      //获取案件列表
      getCases() {
        this.$post('/case/query', {page: 1, size: 999999}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      }
    },
    mounted() {
      this.getCases();
      this.getDevice();
    }
  }
</script>
