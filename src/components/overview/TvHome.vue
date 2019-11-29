<template>
  <el-container class="home-container" style="top: 0">
    <!--main-->
    <el-header style="background: #08163d;color:#fff;padding: 0 20px;text-align: left" height="60px">
      <el-row>
        <el-col :span="4" align="left" style="text-align: left">
          <el-button style="text-align:center;width:auto;padding:16px 0" type="text" @click="$router.go(-1)">
            <i class="fa fa-sign-out fa-rotate-180" style="font-size: 2em;color:#999"></i>
          </el-button>
        </el-col>
        <el-col :span="16" align="center" style="text-align: center">
          <img src="../../assets/img/icon_tv.svg" style="max-height: 60px">
        </el-col>
      </el-row>
    </el-header>
    <el-main class="content-main " style="background:#040d2e;width:100%;height:100%;padding:0;margin:0;overflow:hidden">
      <div style="margin: 0;padding: 0">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </div>
    </el-main>
  </el-container>
</template>
<script>
  export default {
    data() {
      return {}
    },
    methods: {},
    mounted() {
    }
  }
</script>
