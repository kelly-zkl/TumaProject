<template>
  <el-container class="main-container">
    <!--左侧菜单栏-->
    <el-aside :width="collapseWidth" v-bind:class="isCollapse ? 'content-aside-close' : 'content-aside'">
      <el-menu :default-active="$route.path" :collapse="isCollapse" unique-opened router mode="vertical"
               background-color="#333" text-color="#ccc" active-text-color="#59aaf4" @select="handleActive">
        <el-menu-item index="/imsiRecords">
          IMSI记录
        </el-menu-item>
        <el-menu-item index="/catchRecords">
          抓拍记录
        </el-menu-item>
        <el-menu-item index="/importPersons">
          重点人员
        </el-menu-item>
        <el-menu-item index="/normalPersons">
          普通人员
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!--main-->
    <el-main class="content-main">
      <div>
        <el-col :span="24" align="left">
          <span style="color: #999;font-size: 14px;vertical-align: middle;">当前位置：</span>
          <el-breadcrumb separator-class="el-icon-arrow-right" class="bread-bar">
            <el-breadcrumb-item v-for="item in $route.matched" v-if="item.name && item.path"
                                :key="item.name">{{ item.name}}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-col>
        <el-col :span="24" style="padding-top: 20px">
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </el-col>
      </div>
    </el-main>
  </el-container>
</template>
<script>
  export default {
    data() {
      return {
        isCollapse: false,
        collapseWidth: '200px',
      }
    },
    methods: {
      //菜单栏左侧缩小/放大功能
      isCollNav() {
        if (this.isCollapse) {
          this.isCollapse = false;
          this.collapseWidth = '60px';
        } else {
          this.isCollapse = true;
          this.collapseWidth = '200px';
        }
      },
      //菜单激活回调
      handleActive(index, indexPath) {
        sessionStorage.removeItem("deviceTab");
        sessionStorage.removeItem("query");
        sessionStorage.removeItem("activeName");
        sessionStorage.removeItem("cTime");
      },

    },
    mounted() {
      sessionStorage.setItem("index", 3);
    }
  }
</script>
<style scoped>
  .main-container {
    position: absolute;
    top: 60px;
    bottom: 0;
    left: 0;
    width: 100%;
  }
</style>
