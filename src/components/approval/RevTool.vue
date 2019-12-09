<template>
  <div>
    <section class="content">
      <div v-bind:style="'height:'+tableHeight+'px'">
        <el-form>
          <el-row :gutter="30">
            <el-col :span="12">
              <el-form-item style="margin-bottom: 10px;text-align: left">
                <el-input size="medium" placeholder="IMSI" :maxlength="15" style="width: 300px"
                          v-model="input_imsi" @change="imsiChange"></el-input>
                <el-button type="primary" size="medium" class="input-btn" :loading="imsiLoading"
                           @click="revImsi()">IMSI翻手机号
                </el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px;text-align: left" v-show="rev_phone">
                <pre class="pre-content">{{rev_phone}}</pre>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item style="margin-bottom: 10px;text-align: left">
                <el-input size="medium" placeholder="手机号码" :maxlength="11" style="width: 300px"
                          v-model="input_phone" @change="phoneChange"></el-input>
                <el-button type="primary" size="medium" class="input-btn" :loading="phoneLoading"
                           @click="revPhone()">手机号翻IMSI
                </el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px;text-align: left" v-show="rev_imsi">
                <pre class="pre-content">{{rev_imsi}}</pre>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 142,
        input_imsi: '', input_phone: '',
        rev_imsi: '', rev_phone: '',
        imsiLoading: false, phoneLoading: false
      }
    },
    methods: {
      imsiChange() {
        this.rev_phone = '';
      },
      phoneChange() {
        this.rev_imsi = '';
      },
      //imsi转手机号
      revImsi() {
        if (this.input_imsi.length != 15) {
          this.$message.error('请输入15位的imsi');
          return;
        }
        this.imsiLoading = true;
        this.$post("/phoneSearch/imsi2Phone", {imsiOrPhone: this.input_imsi}).then((data) => {
          this.imsiLoading = false;
          this.rev_phone = JSON.stringify(data, null, 4);
        }).catch((err) => {
          this.rev_phone = '';
          this.imsiLoading = false;
        });
      },
      //手机号转imsi
      revPhone() {
        if (this.input_phone.length != 11) {
          this.$message.error('请输入11位的手机号');
          return;
        }
        this.phoneLoading = true;
        this.$post("/phoneSearch/phone2Imsi", {imsiOrPhone: this.input_phone}).then((data) => {
          this.phoneLoading = false;
          this.rev_imsi = JSON.stringify(data, null, 4);
        }).catch((err) => {
          this.rev_imsi = '';
          this.phoneLoading = false;
        })
      }
    },
    mounted() {
    }
  }
</script>

<style scoped>
  .input-btn {
    padding: 8px 12px;
    margin-left: 10px
  }

  .pre-content {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
  }
</style>
