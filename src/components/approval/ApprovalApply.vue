<template>
  <div>
    <section>
      <el-form ref="approval" :model="approval" label-position="left" label-width="100px" :rules="rules">
        <div class="add-appdiv" style="padding:10px 0 0 0;margin-bottom: 13px">
          <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">流程说明
          </div>
          <el-steps :active="active" finish-status="success" align-center style="margin: 50px 0">
            <el-step title="发起申请"></el-step>
            <el-step title="分局审批"></el-step>
            <el-step title="市局审批"></el-step>
            <el-step title="翻码"></el-step>
            <el-step title="翻码返回"></el-step>
          </el-steps>
        </div>
        <div class="add-appdiv" style="padding: 0;margin-bottom: 13px">
          <el-row>
            <el-col :span="12" style="border-right:1px solid #D7D7D7">
              <div style="font-size:15px;padding:10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">申请信息
              </div>
              <div style="margin:20px 30px 30px 30px">
                <el-form-item label="业务类型" align="left" style="margin:0 0 15px 0">
                  <el-radio-group v-model="approval.businessType" size="medium">
                    <el-radio-button label="imsi2p">IMSI翻手机号</el-radio-button>
                    <el-radio-button label="phone2i">手机号翻IMSI</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="勤务等级" align="left" style="margin:0 0 15px 0">
                  <el-radio-group v-model="approval.staffLevel" size="medium">
                    <el-radio-button v-for="item in levs" :label="item.value" :key="item.value">{{item.label}}
                    </el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="关联案件" align="left" style="margin:0 0 15px 0" prop="caseId">
                  <el-select v-model="approval.caseId" placeholder="选择案件" filterable clearable>
                    <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="侦查任务" align="left" style="margin:0 0 15px 0" prop="caseId">
                  <el-cascader placeholder="选择侦查任务" :options="tasks" filterable clearable
                               v-model="approval.task"></el-cascader>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="12" class="apply">
              <div style="font-size:15px;padding:10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">备注
              </div>
              <el-input type="textarea" :rows="11" placeholder="请输入备注信息" v-model="approval.remark"></el-input>
            </el-col>
          </el-row>
        </div>
        <div class="add-appdiv" style="padding: 0;margin-bottom: 13px">
          <div style="font-size:15px;padding:10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">
            {{approval.businessType=='imsi2p'?'需要翻码的IMSI':'需要翻码的手机号'}}
            <span style="color: #999;font-size: 13px">{{ '（'+approval.applyImsiList.length+'/10）'}}</span>
          </div>
          <div style="margin: 20px 30px">
            <el-form-item :label="approval.businessType=='imsi2p'?'输入IMSI':'输入手机号'" align="left" style="margin: 0">
              <el-tag :key="tag" v-for="tag in approval.applyImsiList" closable hit
                      :disable-transitions="false" @close="handleClose(tag)">{{tag}}
              </el-tag>
              <el-input class="input-tag" v-show="inputVisible && approval.applyImsiList.length<10" v-model="inputValue"
                        ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" :maxlength="15"
                        @blur="handleInputConfirm" style="width:140px">
              </el-input>
              <el-button v-show="!inputVisible && approval.applyImsiList.length<10" class="button-tag" size="small"
                         @click="showInput" type="primary" icon="el-icon-plus">增加
              </el-button>
            </el-form-item>
          </div>
        </div>
        <el-form-item align="left" style="margin-left: 40px">
          <el-button type="primary" @click="addApproval()">确认申请</el-button>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>
<script>
  import {numValid, mobileValidator} from "../../assets/js/api";

  export default {
    data() {
      return {
        approval: {businessType: 'imsi2p', staffLevel: '一级', applyImsiList: []},
        way: '2',
        active: 0,
        inputVisible: false,
        inputValue: '',
        cars: [], colls: [], follows: [],
        levs: [{value: '一级', label: '一级'}, {value: '二级', label: '二级'}, {value: '三级', label: '三级'}],
        tasks: [{value: 'coll', label: '交并分析', children: []}, {value: 'car', label: '车码碰撞', children: []},
          {value: 'follow', label: '伴随分析', children: []}],
        rules: {},
        cases: []
      }
    },
    methods: {
      //删除标签
      handleClose(tag) {
        this.approval.applyImsiList.splice(this.approval.applyImsiList.indexOf(tag), 1);
      },
      //输入频点
      showInput() {
        this.inputVisible = true;
        this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      //输入框回车添加tag标签
      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          if (this.approval.businessType == 'phone2i' && !mobileValidator(inputValue)) {
            this.$message.error('请输入正确的手机号');
            return;
          }
          if (this.approval.businessType == 'imsi2p' && (!numValid(inputValue) || inputValue.length != 15)) {
            this.$message.error('请输入15位正确的IMSI');
            return;
          }
          if (this.isMultiple(inputValue)) {
            this.approval.applyImsiList.push(inputValue);
          }
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      //是否重复
      isMultiple(val) {
        let bol = true;
        this.approval.applyImsiList.forEach((item) => {
          if (val == item) {
            this.$message.error(this.approval.businessType == 'imsi2p' ? '重复IMSI' : '重复手机号');
            bol = false;
          }
        });
        return bol;
      },
      addApproval() {
        if (this.approval.applyImsiList.length === 0) {
          this.$message.error('请输入需要翻码的IMSI');
          return;
        }
        if (this.approval.caseId) {
          this.approval.caseName = this.getCaseName();
        }
        if (this.approval.task) {
          this.approval.taskType = this.approval.task[0];
          this.approval.spyTaskId = this.approval.task[1];
          this.getTaskName(this.approval.task[0], this.approval.task[1]);
        }
        this.approval.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
        delete this.approval['task'];
        this.$post('/workflow/translation/apply', this.approval, "申请成功").then((data) => {
          sessionStorage.removeItem('apply');
          this.$router.go(-1);
        }).catch((err) => {
        });
      },
      //获取侦查任务列表
      getTasks() {
        this.$post('/collision/query', {page: 1, size: 999999}).then((data) => {
          this.colls = data.data.list ? data.data.list : [];
          var arr = [];
          data.data.list.forEach((item) => {
            arr.push({value: item.id, label: item.taskName})
          });
          this.tasks[0].children = arr;
        }).catch((err) => {
          this.tasks[0].children = [];
        });
        this.$post('/car/task/query', {page: 1, size: 999999}).then((data) => {
          this.cars = data.data.list ? data.data.list : [];
          var arr = [];
          data.data.list.forEach((item) => {
            arr.push({value: item.taskNo, label: item.taskName})
          });
          this.tasks[1].children = arr;
        }).catch((err) => {
          this.tasks[1].children = [];
        });
        this.$post('/follow/query', {page: 1, size: 999999}).then((data) => {
          this.follows = data.data.list ? data.data.list : [];
          var arr = [];
          data.data.list.forEach((item) => {
            arr.push({value: item.id, label: item.taskName})
          });
          this.tasks[2].children = arr;
        }).catch((err) => {
          this.tasks[2].children = [];
        });
      },
      //获取案件列表
      getCases() {
        this.$post('case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      //获取案件名称
      getCaseName() {
        for (let item of this.cases) {
          if (item.id === this.approval.caseId) {
            return item.caseName;
          }
        }
      },
      getTaskName(type, taskId) {
        if (type == 'car') {
          for (let item of this.cars) {
            if (item.taskNo === taskId) {
              this.approval.spyTaskName = item.taskName;
              this.approval.ttype = item.atype;
            }
          }
        } else if (type == 'follow') {
          for (let item of this.follows) {
            if (item.id === taskId) {
              this.approval.spyTaskName = item.taskName;
              this.approval.ttype = item.followType;
            }
          }
        } else {
          for (let item of this.colls) {
            if (item.id === taskId) {
              this.approval.spyTaskName = item.taskName;
              this.approval.ttype = 'coll';
            }
          }
        }
      }
    },
    mounted() {
      this.getCases();
      this.getTasks();
      if (this.$route.query.type) {
        var param = JSON.parse(sessionStorage.getItem('apply'));
        this.approval.businessType = 'imsi2p';
        this.approval.caseId = param.caseId;
        this.approval.task = param.task;
        this.approval.applyImsiList = param.imsi;
      }
    }
  }
</script>
