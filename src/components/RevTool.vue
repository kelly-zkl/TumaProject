<template>
  <div>
    <section>
      <el-form class="rev-form">
        <el-form-item style="margin-bottom: 10px">
          <el-input size="medium" placeholder="IMSI" :maxlength="15" style="width: 300px"
                    v-model="input_imsi" @change="imsiChange"></el-input>
          <el-button type="primary" size="medium" class="input-btn" :loading="imsiLoading"
                     @click="revImsi()">IMSI翻手机号
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="rev_phone">
          <pre>{{rev_phone}}</pre>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-input size="medium" placeholder="手机号码" :maxlength="11" style="width: 300px"
                    v-model="input_phone" @change="phoneChange"></el-input>
          <el-button type="primary" size="medium" class="input-btn" :loading="phoneLoading"
                     @click="revPhone()">手机号翻IMSI
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="rev_imsi">
          <pre>{{rev_imsi}}</pre>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>

<script>
  export default {
    data() {
      return {
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
  .rev-form {
    text-align: left;
    margin-left: calc(50% - 210px);
    margin-top: 10%
  }

  .input-btn {
    padding: 8px 12px;
    margin-left: 10px
  }
</style>
