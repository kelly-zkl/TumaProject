<template>
  <div>
    <section class="content">
      <div style="background: #F2F2F2;font-size:14px;padding:10px 20px">基本信息</div>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px">
        <el-form :model="userInfo" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8">
              <el-form-item label="ID" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="入库时间" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="备注" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="姓名" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="性别" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="年龄" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="身份证" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="手机号" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="座机" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="所属辖区" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="所属名单" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.imsi ? userInfo.imsi : '566262'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row style="background: #F2F2F2">
        <el-col :span="12">
          <div style="font-size:14px;padding:10px 20px">最近抓拍</div>
        </el-col>
        <el-col :span="12">
          <div style="font-size:14px;padding:10px 20px">已关联的侦码信息</div>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px;padding:0">
        <el-row>
          <el-col :span="12" style="border-right: 1px solid #D0CACF">
            <div class="face-main">
              <div class="face-item" v-for="item in ['1','2','3','4']">
                <img src="../../../assets/img/icon_people.png">
                <div style="font-size:14px;height: 30px;line-height: 30px">2017-12-12 23:23:23</div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <el-col :span="24" align="center" v-for="item in ['1','2','3','4']">
              <el-button type="text" @click="$router.push('/imsiDetail')">12132315 广东深圳 电信 [60%]</el-button>
            </el-col>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        userInfo: {}
      }
    },
    methods: {},
    mounted() {
    }
  }
</script>
<style scoped>
  .face-main {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .face-item {
    width: 28%;
    height: 162px;
    margin-bottom: 20px;
    position: relative;
  }

  .face-item img {
    position: absolute;
    left: 20px;
    width: 130px;
    height: 130px;
    border: 1px #D7D7D7 dashed;
    text-align: left;
  }

  .face-item div {
    position: absolute;
    left: 20px;
    top: 132px;
  }

  .face-item:nth-child(3n+1) {
    margin-right: 20px;
  }

  .face-item:nth-child(3n+2) {
    margin-right: 20px;
  }
</style>
