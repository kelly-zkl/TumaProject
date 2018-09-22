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
              <el-radio label="FACE">图像</el-radio>
              <!--<el-radio label="MAC">MAC</el-radio>-->
            </el-radio-group>
          </el-form-item>
        </div>
        <h5 class="add-label">设置分析条件</h5>
        <div class="add-appdiv">
          <el-form-item label="分析对象" align="left" prop="followTarget">
            <el-input v-model="followTask.followTarget" placeholder="请输入分析对象"
                      style="width: 500px" :maxlength=50 v-if="followTask.followType == 'IMSI'"></el-input>
            <img :src="imgUrl" v-if="imgUrl && followTask.followType == 'FACE'"
                 style="max-width: 90px;max-height:90px;border-radius: 6px">
            <el-button type="primary" v-if="followTask.followType == 'FACE'"
                       @click="runTranslation=true;query={page: 1, size: 10};getData()">选择档案人员
            </el-button>
          </el-form-item>
          <el-form-item label="设备" align="left">
            <el-select v-model="followTask.deviceId" placeholder="请选择设备" size="medium"
                       v-if="followTask.followType == 'FACE'" multiple collapse-tags>
              <el-option v-for="item in cameras" :key="item.cameraCode" :label="item.name" :value="item.cameraCode">
              </el-option>
            </el-select>
            <el-select v-model="followTask.deviceId" placeholder="请选择设备" size="medium" v-else multiple collapse-tags>
              <el-option v-for="item in deviceList" :key="item.deviceId" :label="item.deviceName"
                         :value="item.deviceId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期" align="left" required>
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
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
      <!--档案列表-->
      <el-dialog title="录入翻码" :visible.sync="runTranslation" center>
        <div class="block">
          <el-table :data="vipList" v-loading="listLoading" class="center-block" stripe
                    highlight-current-row @current-change="handleCurrentChange">
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="人员编号" prop="personCode" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="人员图像" prop="faceUrl" min-width="150"
                             max-width="250" :formatter="formatterAddress">
              <template slot-scope="scope">
                <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                     style="max-width: 90px;max-height:90px;border-radius: 6px"/>
              </template>
            </el-table-column>
            <el-table-column align="left" label="年龄" prop="age" width="120"></el-table-column>
            <el-table-column align="left" label="性别" prop="sex" width="120"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="IMSI" prop="imsiList" min-width="200"
                             max-width="300" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="手机号" prop="phone" width="150"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="身份证" prop="idCard" width="170"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="姓名" prop="name" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="所属名单" prop="blackClass" width="150"
                             :formatter="formatterAddress"></el-table-column>
          </el-table>
          <div class="block" style="margin-top: 20px" align="right">
            <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                           :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                           layout="total, sizes, prev, pager, next, jumper"></el-pagination>
          </div>
        </div>
      </el-dialog>
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
        runTranslation: false,
        listLoading: false,
        query: {page: 1, size: 10},
        followTask: {followType: "IMSI", interval: 120},
        cases: [],
        tasks: [{value: "IMSI", label: "IMSI"}],
        qTime: '',
        deviceList: [],
        imgUrl: '',
        count: 0,
        vipList: [],
        cameras: [],
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
      //获取IMSI告警列表
      getData() {
        this.listLoading = true;
        this.$post('person/query', this.query).then((data) => {
          this.vipList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.vipList = [];
          this.$message.error(err);
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
      handleCurrentChange(val) {
        this.followTask.followTarget = val.faceId;
        this.imgUrl = val.faceUrl;
        this.runTranslation = false;
      },
      //创建伴随任务
      createFollowTask() {
        if (this.qTime.length === 0) {
          this.$message.error('请选择日期');
          return;
        }
        this.$refs['followTask'].validate((valid) => {
          if (valid) {
            this.followTask.startDate = this.qTime[0] / 1000;
            this.followTask.endDate = this.qTime[1] / 1000;

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
      //获取全部相机设备
      getCameras() {
        this.$post('camera/query', {page: 1, size: 999999}).then((data) => {
          this.cameras = data.data.list;
        }).catch((err) => {
          this.cameras = [];
        });
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
        this.$post('case/query', {page: 1, size: 999999}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'imsiList') {
          let imsi = [];
          row.imsiList.forEach((item) => {
            imsi.push(item.imsi + '[' + item.weight / 10 + '%]')
          });
          return imsi.join("，");
        } else if (column.property === 'startAge') {
          return row.startAge && row.endAge ? row.startAge + '~' + row.endAge : row.startAge ? row.startAge : row.endAge ? row.endAge : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.getCases();
      this.getDevice();
      this.getCameras();
    }
  }
</script>
