<template>
  <el-container class="home-container">
    <!--main-->
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
