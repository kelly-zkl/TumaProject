<template>
  <div>
    <section>
      <el-form ref="approval" :model="approval" label-position="left" label-width="110px">
        <div class="add-appdiv" style="padding:0;margin-bottom: 13px">
          <el-row style="border-bottom:1px #D7D7D7 solid;padding:10px 20px">
            <el-col :span="6" align="left">
              <div style="font-size:15px;text-align:left;padding-top: 5px">当前进度</div>
            </el-col>
            <el-col :span="18" align="right">
              <el-button type="primary" size="mini" @click="cancel()"
                         v-show="show==1&&(approval.status==1||approval.status==3)&&getButtonVial('workflow:translation:cancelapply')">
                撤销申请
              </el-button>
              <el-button size="mini" @click="applyPass(1)"
                         v-show="show==2&&approval.status==1&&getButtonVial('workflow:translation:approve')">拒绝
              </el-button>
              <el-button type="primary" size="mini" @click="applyPass(0)"
                         v-show="show==2&&approval.status==1&&getButtonVial('workflow:translation:approve')">通过
              </el-button>
              <!--<el-button type="primary" size="medium" @click="showTranslation()"-->
              <!--v-show="show==4 &&approval.status==3&& getButtonVial('workflow:translation:inputtranslate')">录入翻码-->
              <!--</el-button>-->
            </el-col>
          </el-row>
          <el-steps :active="active" finish-status="success" align-center style="margin: 30px 0">
            <el-step v-for="item in approval.nodes" :key="item.nodeName" :title="item.nodeName"
                     :description="item.nodeOperatorName"></el-step>
          </el-steps>
        </div>
        <div class="add-appdiv" style="padding:0;margin-bottom: 13px">
          <div style="font-size:15px;padding:10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">申请信息
          </div>
          <el-row style="padding:20px 30px">
            <el-col :span="12" align="left" style="text-align: left">
              <el-form-item label="流程编号" align="left" style="margin: 0">{{approval.recordNo}}</el-form-item>
              <el-form-item label="业务类型" align="left" style="margin: 0">
                {{approval.businessType == 'imsi2p' ? "IMSI翻手机号" : '手机号翻IMSI'}}
              </el-form-item>
              <el-form-item label="勤务等级" align="left" style="margin: 0">{{approval.staffLevel}}</el-form-item>
            </el-col>
            <el-col :span="12" align="right" style="text-align: right">
              <el-form-item label="关联案件" align="left" style="margin: 0">
                <div class="btn-case" @click="gotoCaseDetail()" :title="approval.caseName?approval.caseName:'--'">
                  {{approval.caseName?approval.caseName:'--'}}
                </div>
              </el-form-item>
              <el-form-item label="侦查任务" align="left" style="margin: 0">
                <div class="btn-case" @click="gotoTaskDetail()" :title="approval.spyTaskName?approval.spyTaskName:'--'">
                  {{approval.spyTaskName?approval.spyTaskName:'--'}}
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="add-appdiv" style="padding:0;margin-bottom: 13px">
          <div style="font-size:15px;padding:10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">需要翻码的IMSI
          </div>
          <el-row v-if="business=='imsi2p'">
            <el-col :span="12" align="left" style="text-align: left;border-right:1px solid #D7D7D7">
              <el-table :data="imsiList1" class="center-block" stripe>
                <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
                <el-table-column align="left" label="IMSI" prop="imsi" :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" label="手机号" prop="phone" :formatter="formatterAddress"></el-table-column>
              </el-table>
            </el-col>
            <el-col :span="12" align="right" style="text-align: right" v-if="imsiList2.length>0">
              <el-table :data="imsiList2" class="center-block" stripe>
                <el-table-column align="center" type="index" label="序号" width="80" :index="6"></el-table-column>
                <el-table-column align="left" label="IMSI" prop="imsi" :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" label="手机号" prop="phone" :formatter="formatterAddress"></el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-row v-else>
            <el-col :span="12" align="left" style="text-align: left;border-right:1px solid #D7D7D7">
              <el-table :data="imsiList1" class="center-block" stripe>
                <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
                <el-table-column align="left" label="手机号" prop="phone" :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" label="IMSI" prop="imsi" :formatter="formatterAddress"></el-table-column>
              </el-table>
            </el-col>
            <el-col :span="12" align="right" style="text-align: right" v-if="imsiList2.length>0">
              <el-table :data="imsiList2" class="center-block" stripe>
                <el-table-column align="center" type="index" label="序号" width="80" :index="6"></el-table-column>
                <el-table-column align="left" label="手机号" prop="phone" :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" label="IMSI" prop="imsi" :formatter="formatterAddress"></el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </div>
        <div class="add-appdiv" style="padding:0;margin-bottom: 13px">
          <div style="font-size:15px;padding:10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">记录
          </div>
          <el-table :data="approval.logs" class="center-block" stripe>
            <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
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
  import {formatDate, encryData, decryData, buttonValidator} from "../../assets/js/util";
  import {mobileValidator} from "../../assets/js/api";

  export default {
    data() {
      return {
        show: this.$route.query.type,
        recordId: this.$route.query.recordId || '',
        business: this.$route.query.business || 'imsi2p',
        userId: JSON.parse(decryData(sessionStorage.getItem("user"))).userId,
        approval: {
          imsiList: [{name: 'dfvf', imsi: '153453', phone: ''}, {name: 'dfvf', imsi: '153453', phone: ''}],
          records: []
        },
        translations: [],
        imsiList1: [],
        imsiList2: [],
        active: 1,
        runTranslation: false
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //跳转布控详情页
      gotoTaskDetail() {
        if (this.approval.spyTaskId) {
          if (this.approval.taskType == 'car') {//车码碰撞
            let routeData = this.$router.resolve({
              path: '/carTaskDetail',
              query: {no: this.approval.spyTaskId, atype: this.approval.ttype}
            });
            window.open(routeData.href, '_blank');
          } else if (this.approval.taskType == 'follow') {//伴随分析
            let routeData = this.$router.resolve({
              path: '/followResult',
              query: {taskId: this.approval.spyTaskId, followType: this.approval.ttype}
            });
            window.open(routeData.href, '_blank');
          } else {//交并分析
            let routeData = this.$router.resolve({path: '/taskDetail', query: {taskId: this.approval.spyTaskId}});
            window.open(routeData.href, '_blank');
          }
        }
      },
      //跳转案件详情页
      gotoCaseDetail() {
        if (this.approval.caseId) {
          let routeData = this.$router.resolve({path: '/caseDetail', query: {caseId: this.approval.caseId}});
          window.open(routeData.href, '_blank');
        }
      },
      //获取翻码详情
      getDetail() {
        this.$post('/workflow/translation/detail/' + this.recordId, {userId: this.userId}).then((data) => {
          this.approval = data.data.record;
          data.data.record.nodes.forEach((item, index) => {
            if (item.nodeName === data.data.record.currentNode) {
              this.active = index;
              console.log(this.active);
              if (this.active == (data.data.record.nodes.length - 1)) {
                this.active = (this.active + 1);
              }
            }
          });
          if (this.approval.imsiList > 5) {
            this.imsiList1.push(this.approval.imsiList.slice(0, 5));
            this.imsiList2.push(this.approval.imsiList.slice(5, this.approval.imsiList.length));
          } else {
            this.imsiList1 = this.approval.imsiList;
            this.imsiList2 = [];
          }
          // if (this.show == 3 && this.approval.ccReadStatus == 1) {
          //   this.updateStatus();
          // }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //撤销
      cancel() {
        this.$prompt('确认撤销此次翻码申请？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '录入备注（非必填）',
          inputValidator: function (value) {
            let bol = true;
            if (value) {
              bol = (value.length <= 200)
            }
            return bol
          },
          inputErrorMessage: '请输入200字以内的备注'
        }).then(({value}) => {
          let param = {operator: this.userId, remark: value ? value : ''};
          this.$post('/workflow/translation/cancelapply/' + this.recordId, param, "操作成功").then((data) => {
            if ("000000" === data.code) {
              this.getDetail();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //通过/不通过
      applyPass(status) {
        if (status == 1) {
          this.$prompt('确认拒绝此次翻码申请？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPlaceholder: '录入备注（非必填）',
            inputValidator: function (value) {
              let bol = true;
              if (value) {
                bol = (value.length <= 200)
              }
              return bol
            },
            inputErrorMessage: '请输入200字以内的备注'
          }).then(({value}) => {
            this.applyHttp(status, value ? value : '');
          }).catch(() => {
          })
        } else {
          this.applyHttp(status, '');
        }
      },
      applyHttp(status, remark) {
        let param = {result: status, operator: this.userId, remark: remark};
        this.$post('/workflow/translation/approve/' + this.recordId, param, "操作成功").then((data) => {
          if ("000000" === data.code) {
            this.$emit('refreshData', 'turn');
            this.getDetail();
          }
        }).catch((err) => {
        });
      },
      //标记已读
      updateStatus() {
        // this.$confirm('确认标记为已读?', '提示', {type: 'info'}).then(() => {
        let ids = [this.recordId];
        let param = {ids: ids, operator: this.userId, remark: ''};
        this.$post('/workflow/translation/ccread', param).then((data) => {
          if ("000000" === data.code) {
            this.getDetail();
          }
        }).catch((err) => {
        });
        // }).catch(() => {
        // });
      },
      //翻码并返回
      showTranslation() {
        this.translations = Object.assign([], this.approval.imsiList);
        this.runTranslation = true;
      },
      handleTranslation() {
        let param = {operator: this.userId, remark: ''};
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
        return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
      }
    },
    mounted() {
      this.getDetail();
    }
  }
</script>
