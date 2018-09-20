<template>
  <div>
    <section>
      <el-form ref="approval" :model="approval" label-position="left" label-width="100px" :rules="rules">
        <h5 class="add-label" style="margin-top: 0">业务申请</h5>
        <div class="add-appdiv">
          <el-form-item label="业务类型" align="left">IMSI翻码</el-form-item>
          <el-form-item label="勤务等级" align="left" style="margin: 0">
            <el-radio-group v-model="approval.staffLevel" size="medium">
              <el-radio-button v-for="item in levs" :label="item.value" :key="item.value">{{item.label}}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>
        <h5 class="add-label" style="margin-top: 0">需要翻码的IMSI</h5>
        <div class="add-appdiv">
          <el-form-item label="录入方式" align="left">
            <el-radio-group v-model="way" size="medium">
              <el-radio-button v-for="item in ways" :label="item.value" :key="item.value">{{item.label}}
              </el-radio-button>
            </el-radio-group>
            <span style="color: #fff;font-size: 14px;margin-left: 20px;background: #F60"
                  v-if="way == '2'">IMSI数量不要超过20个</span>
          </el-form-item>
          <el-form-item label="选择人员" align="left" style="margin: 0" v-if="way == '1'">
            <el-button type="primary" size="medium" icon="el-icon-plus">从名单中选择人员</el-button>
          </el-form-item>
          <el-form-item label="输入IMSI" align="left" style="margin: 0" v-if="way == '2'">
            <el-tag :key="tag" v-for="tag in dynamicTags" closable hit
                    :disable-transitions="false" @close="handleClose(tag)">{{tag}}
            </el-tag>
            <el-input class="input-tag" v-show="inputVisible && dynamicTags.length<20" v-model="inputValue"
                      ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm"
                      @blur="handleInputConfirm">
            </el-input>
            <el-button v-show="!inputVisible && dynamicTags.length<20" class="button-tag" size="small"
                       @click="showInput" type="primary" icon="el-icon-plus">IMSI
            </el-button>
          </el-form-item>
        </div>
        <h5 class="add-label" style="margin-top: 0">备注</h5>
        <div class="add-appdiv">
          <el-form-item label="备注" align="left" style="margin: 0">
            <el-input type="textarea" :rows="3" placeholder="请输入内容" v-model="approval.remark"></el-input>
          </el-form-item>
        </div>
        <h5 class="add-label" style="margin-top: 0">流程说明</h5>
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
      </el-form>
      <div class="block" style="margin-top: 30px">
        <el-button type="primary" @click="addApproval()">确认发起申请</el-button>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        approval: {staffLevel: '一级'},
        way: '2',
        active: 0,
        dynamicTags: [],
        inputVisible: false,
        inputValue: '',
        levs: [{value: '一级', label: '一级'}, {value: '二级', label: '二级'}, {value: '三级', label: '三级'}],
        ways: [{value: '2', label: '输入IMSI'}],//{value: '1', label: '选择人员'},
        rules: {}
      }
    },
    methods: {
      //删除标签
      handleClose(tag) {
        this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
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
          this.dynamicTags.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      addApproval() {
        if (this.dynamicTags.length === 0) {
          this.$message.error('请输入需要翻码的IMSI');
          return;
        }
        this.approval.applyImsiList = this.dynamicTags;
        this.approval.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
        this.$post('/workflow/translation/apply', this.approval, "申请成功").then((data) => {
          if ("000000" === data.code)
            this.$router.go(-1);
        }).catch((err) => {
        });
      }
    },
    mounted() {
    }
  }
</script>
