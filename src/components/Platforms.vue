<template>
  <div style="background: #060450;position: fixed;top: 0;right: 0;left: 0;bottom: 0;width: 100%;
    min-width: 1280px">
    <div class="header-main">WISEC</div>
    <section class="content">
      <el-row :gutter="50" style="margin-top: 100px">
        <el-col :span="8">
          <div class="plat-item">
            <img src="../assets/img/icon_people.png"/>
            <div class="item-title">图码联侦布控实战平台</div>
            <el-button type="primary" round style="width: 300px" @click="enterFace()">进入</el-button>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="plat-item">
            <img src="../assets/img/icon_people.png"/>
            <div class="item-title">相机设备管理后台</div>
            <el-button type="primary" round style="width: 300px" @click="enterCamera()">进入</el-button>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="plat-item">
            <img src="../assets/img/icon_people.png"/>
            <div class="item-title">侦码设备管理后台</div>
            <el-button type="primary" round style="width: 300px" @click="enterDevice()">进入</el-button>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {}
    },
    methods: {
      enterFace() {
        let bol = JSON.parse(sessionStorage.getItem("user"));
        if (bol) {
          this.$router.push('/dataOverview');
        } else {
          this.$router.push('/login');
        }
      },
      //相机设备平台
      enterCamera() {
        window.open("http://www.baidu.com");
      },
      //侦码设备平台
      enterDevice() {
        window.open("http://www.taobao.com");
      }
    },
    mounted() {
    }
  }
</script>
<style scoped>
  .header-main {
    height: 80px;
    line-height: 80px;
    width: 100%;
    background: #21206C;
    color: #fff;
    font-size: 24px;
    text-align: left;
    padding-left: 30px;
  }

  .plat-item {
    background: #21206C;
    height: 300px;
    border-radius: 6px;
    padding: 30px;
  }

  .plat-item img {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    border: 2px #fff solid;
    margin-top: 10px;
  }

  .item-title {
    color: #fff;
    font-size: 24px;
    margin: 20px 0 50px 0;
  }

  @media screen and (min-width: 320px) and (max-width: 1280px) {
    .content {
      padding: 80px;
    }
  }

  @media screen and (min-width: 1281px) {
    .content {
      padding: 100px;
    }
  }
</style>
