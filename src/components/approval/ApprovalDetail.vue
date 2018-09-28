<template>
  <div>
    <section>
      <el-form ref="approval" :model="approval" label-position="left" label-width="100px">
        <el-row>
          <el-col :span="6" align="left">
            <h5 class="add-label" style="margin-top: 0">进度</h5>
          </el-col>
          <el-col :span="18" align="right">
            <el-button type="primary" size="medium" @click="cancel()"
                       v-show="show==1&&approval.status==1&&getButtonVial('workflow:translation:cancelapply')">撤销申请
            </el-button>
            <el-button type="primary" size="medium" @click="applyPass(0)"
                       v-show="show==2&&approval.approveStatus==1&&getButtonVial('workflow:translation:approve')">通过
            </el-button>
            <el-button type="primary" size="medium" @click="applyPass(1)"
                       v-show="show==2&&approval.approveStatus==1&&getButtonVial('workflow:translation:approve')">不通过
            </el-button>
            <el-button type="primary" size="medium" @click="updateStatus()"
                       v-show="show==3&&approval.ccReadStatus==1&&getButtonVial('workflow:translation:ccread')">标记已读
            </el-button>
            <!--<el-button type="primary" size="medium" v-show="show==4">翻码返回</el-button>-->
            <el-button type="primary" size="medium" @click="showTranslation()"
                       v-show="show==4 && getButtonVial('workflow:translation:inputtranslate')">录入翻码
            </el-button>
          </el-col>
        </el-row>
        <div class="add-appdiv">
          <el-steps :active="active" finish-status="success" align-center>
            <el-step v-for="item in approval.nodes" :key="item.nodeName" :title="item.nodeName"
                     :description="item.remark"></el-step>
          </el-steps>
        </div>
        <h5 class="add-label" style="margin-top: 0">基本信息</h5>
        <div class="add-appdiv">
          <el-form-item label="业务类型" align="left" style="margin: 0">IMSI翻码</el-form-item>
          <el-form-item label="勤务等级" align="left" style="margin: 0">{{approval.staffLevel}}</el-form-item>
        </div>
        <h5 class="add-label" style="margin-top: 0">需要翻码的IMSI</h5>
        <div class="add-appdiv">
          <el-table :data="approval.imsiList" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="IMSI" prop="imsi" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="手机号码" prop="phone" :formatter="formatterAddress"></el-table-column>
          </el-table>
        </div>
        <h5 class="add-label" style="margin-top: 0">记录</h5>
        <div class="add-appdiv">
          <el-table :data="approval.logs" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="操作" prop="operateType" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="操作人" prop="operator" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="操作人所属机构" prop="group" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="操作时间" prop="operateTime" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="备注信息" prop="remark" min-width="150"
                             max-width="250" :formatter="formatterAddress"></el-table-column>
          </el-table>
        </div>
      </el-form>
      <!--录入翻码-->
      <el-dialog title="录入翻码" :visible.sync="runTranslation" width="900px" center>
        <div class="block">
          <el-table :data="translations" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
            <el-table-column align="left" label="人员姓名" prop="name" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="身份证" prop="idCard" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="所属名单" prop="blackClass"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="IMSI" prop="imsi" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="手机号码" prop="phone">
              <template slot-scope="scope">
                <el-input v-model="scope.row.phone" size="medium" :maxlength=11
                          placeholder="手机号码"></el-input>
              </template>
            </el-table-column>
          </el-table>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button @click="runTranslation=false" size="medium">取消</el-button>
            <el-button type="primary" @click="handleTranslation()" size="medium"
                       v-show="getButtonVial('workflow:translation:finish')">确定
            </el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";
  import {mobileValidator} from "../../assets/js/api";

  export default {
    data() {
      return {
        show: this.$route.query.type,
        recordId: this.$route.query.recordId || '',
        approval: {
          imsiList: [{name: 'dfvf', imsi: '153453', phone: ''}, {name: 'dfvf', imsi: '153453', phone: ''}],
          records: []
        },
        translations: [],
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
        this.$post('/workflow/translation/detail/' + this.recordId, {}).then((data) => {
          this.approval = data.data.record;
          data.data.record.nodes.forEach((item, index) => {
            if (item.nodeName === data.data.record.currentNode) {
              this.active = index
            }
          });
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //撤销
      cancel() {
        this.$confirm('确定要撤销翻码申请？', '提示', {type: 'warning'}).then(() => {
          let param = {operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: '申请人撤销'};
          this.$post('/workflow/translation/cancelapply/' + this.recordId, param, "撤销成功").then((data) => {
            if ("000000" === data.code) {
              this.getDetail();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        })
      },
      //通过/不通过
      applyPass(status) {
        let msg = '通过';
        if (status == 1) {
          msg = '不通过';
        }
        this.$confirm('确定' + msg + '该翻码申请？', '提示', {type: 'warning'}).then(() => {
          let param = {result: status, operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: ''};
          this.$post('/workflow/translation/approve/' + this.recordId, param, "操作成功").then((data) => {
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
          let ids = [this.recordId];
          let param = {ids: ids, operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: ''};
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
        this.translations = Object.assign([], this.approval.imsiList);
        this.runTranslation = true;
      },
      handleTranslation() {
        let param = {operator: JSON.parse(sessionStorage.getItem("user")).userId, remark: ''};
        let imsis = [];
        this.translations.forEach((item) => {
          if (item.phone && item.phone.length > 0) {
            if (!mobileValidator(item.phone)) {
              this.$message.error('请输入正确的手机号码');
              return;
            }
            let imsi = {imsi: item.imsi, phone: item.phone};
            imsis.push(imsi);
          }
        });
        if (imsis.length === 0) {
          return;
        }
        this.runTranslation = false;
        param.imsiList = imsis;
        //录入翻码
        this.$post('/workflow/translation/inputtranslate/' + this.recordId, param).then((data) => {
          if ("000000" === data.code) {
            //翻码返回
            this.$post('/workflow/translation/finish/' + this.recordId, param, "操作成功").then((data) => {
              if ("000000" === data.code) {
                this.getDetail();
              }
            }).catch((err) => {
            });
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
      this.getDetail();
    }
  }
</script>
