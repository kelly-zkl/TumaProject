<template>
  <el-container class="home-container">
    <!--main-->
    <el-main class="content-main">
      <div style="margin: 0;padding: 0">
        <div align="left" style="text-align: left;margin: 0;padding: 0">
          <span style="color: #999;font-size: 14px;vertical-align: middle;">当前位置：</span>
          <el-breadcrumb separator-class="el-icon-arrow-right" class="bread-bar">
            <el-breadcrumb-item v-for="item in $route.matched" v-if="item.name && item.path"
                                :key="item.name" :to="{ path: item.path}">{{ item.name}}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div style="margin:10px 0 0 0">
          <transition name="fade" mode="out-in">
            <router-view @refreshData="refreshData"></router-view>
          </transition>
        </div>
      </div>
    </el-main>
  </el-container>
</template>
<script>
  export default {
    data() {
      return {}
    },
    methods: {
      refreshData(sys, val) {
        this.$emit('refreshData', sys, val);
      }
    },
    mounted() {
    }
  }
</script>
