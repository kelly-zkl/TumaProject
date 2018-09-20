<template>
  <div>
    <section>
      <el-form ref="approval" :model="approval" label-position="left" label-width="100px">
        <el-row>
          <el-col :span="6" align="left">
            <h5 class="add-label" style="margin-top: 0">进度</h5>
          </el-col>
          <el-col :span="18" align="right">
            <el-button type="primary" size="medium" v-show="show==1" @click="cancel()">撤销申请</el-button>
            <el-button type="primary" size="medium" v-show="show==2" @clcik="handlePass(0)">通过</el-button>
            <el-button type="primary" size="medium" v-show="show==2" @clcik="handlePass(1)">不通过</el-button>
            <el-button type="primary" size="medium" v-show="show==3" @click="updateStatus()">标记已读</el-button>
            <!--<el-button type="primary" size="medium" v-show="show==4">翻码返回</el-button>-->
            <el-button type="primary" size="medium" v-show="show==4" @click="showTranslation()">录入翻码</el-button>
          </el-col>
        </el-row>
        <div class="add-appdiv">
          <el-steps :active="active" finish-status="success" align-center>
            <el-step title="发起申请"></el-step>
            <el-step title="上级审核"></el-step>
            <el-step title="情指勤指挥中心审阅"></el-step>
            <el-step title="情指勤合成作战室审阅"></el-step>
            <el-step title="技侦翻码"></el-step>
            <el-step title="翻码返回"></el-step>
          </el-steps>
        </div>
        <h5 class="add-label" style="margin-top: 0">基本信息</h5>
        <div class="add-appdiv">
          <el-form-item label="业务类型" align="left" style="margin: 0">IMSI翻码</el-form-item>
          <el-form-item label="勤务等级" align="left" style="margin: 0">一级</el-form-item>
        </div>
        <h5 class="add-label" style="margin-top: 0">需要翻码的IMSI</h5>
        <div class="add-appdiv">
          <el-table :data="approval.imsiList" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="人员姓名" prop="taskName" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="身份证" prop="followType" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="所属名单" prop="followTarget" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="IMSI" prop="taskStatus" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="手机号码" prop="phone" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
          </el-table>
        </div>
        <h5 class="add-label" style="margin-top: 0">记录</h5>
        <div class="add-appdiv">
          <el-table :data="approval.records" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="操作" prop="taskName" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="操作人" prop="followType" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="操作人所属机构" prop="followTarget" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="操作时间" prop="taskStatus" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="备注信息" prop="taskStatus" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
          </el-table>
        </div>
      </el-form>
      <!--录入翻码-->
      <el-dialog title="录入翻码" :visible.sync="runTranslation" width="600px" center>
        <div class="block">
          <el-table :data="imsiList" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="人员姓名" prop="taskName"></el-table-column>
            <el-table-column align="left" label="身份证" prop="followType"></el-table-column>
            <el-table-column align="left" label="所属名单" prop="followTarget"></el-table-column>
            <el-table-column align="left" label="IMSI" prop="taskStatus"></el-table-column>
            <el-table-column align="left" label="手机号码" prop="phone">
              <template slot-scope="scope">
                <el-input v-model="scope.row.phone" size="medium" :maxlength=11
                          placeholder="手机号码"></el-input>
              </template>
            </el-table-column>
          </el-table>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button @click="runTranslation=false" size="medium">取消</el-button>
            <el-button type="primary" @click="handleTranslation()" size="medium">确定</el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        show: this.$route.query.type,
        approval: {imsiList: [{phone: ''}, {phone: ''}], records: []},
        imsiList: [],
        active: 1,
        runTranslation: false
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //获取翻码详情
      getDetail() {
      },
      //撤销
      cancel() {
        this.$confirm('确定要撤销翻码申请？', '提示', {type: 'warning'}).then(() => {
          let param = {operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: '申请人撤销'};
          this.$post('/workflow/translation/cancelapply/' + this.approval.recordId, param, "撤销成功").then((data) => {
            if ("000000" === data.code) {
              this.getDetail();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        })
      },
      //通过/不通过
      handlePass(status) {
        let msg = '通过';
        if (status == 1) {
          msg = '不通过';
        }
        this.$confirm('确定' + msg + '该翻码申请？', '提示', {type: 'warning'}).then(() => {
          let param = {result: status, operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: ''};
          this.$post('/workflow/translation/approve/' + this.approval.recordId, param, "操作成功").then((data) => {
            if ("000000" === data.code) {
              this.getDetail();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        })
      },
      //标记已读
      updateStatus() {
        this.$confirm('确认标记为已读?', '提示', {type: 'info'}).then(() => {
          let param = {};
          let ids = [this.approval.recordId];
          param = {ids: ids, operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: ''};
          this.$post('/workflow/translation/ccread', param, '操作成功').then((data) => {
            if ("000000" === data.code) {
              this.getDetail();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //翻码并返回
      showTranslation() {
        this.imsiList = Object.assign([], this.approval.imsiList);
        this.runTranslation = true;
      },
      handleTranslation() {
        let param = {operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: ''};
        let imsis = [];
        this.imsiList.forEach((item) => {
          if (item.phone && item.phone.length > 0) {
            let imsi = {imsi: item.imsi, phone: item.phone};
            imsis.push(imsi);
          }
        });
        this.runTranslation = false;
        if (imsis.length === 0) {
          return;
        }
        param.imsiList = imsis;
        //录入翻码
        this.$post('/workflow/translation/inputtranslate/' + this.approval.recordId, param, "操作成功").then((data) => {
          if ("000000" === data.code) {
            this.getDetail();
          }
        }).catch((err) => {
        });
        //翻码返回
        this.$post('/workflow/translation/finish/' + this.approval.recordId, param, "操作成功").then((data) => {
          if ("000000" === data.code) {
            this.getDetail();
          }
        }).catch((err) => {
        });
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
      this.show = this.$route.query.type;
    }
  }
</script>
