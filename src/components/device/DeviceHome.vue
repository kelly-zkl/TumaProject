<template>
  <el-container class="main-container">
    <!--左侧菜单栏-->
    <el-aside :width="collapseWidth" v-bind:class="isCollapse ? 'content-aside-close' : 'content-aside'">
      <el-menu :default-active="$route.path" :collapse="isCollapse" unique-opened router mode="vertical"
               background-color="#fff" text-color="#333" active-text-color="#6699FF" @select="handleActive">
        <el-menu-item v-for="item in menu" :index="item.permissionUrl">
          {{item.name}}
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
        menu: []
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
      sessionStorage.setItem("index", 6);
      let val = JSON.parse(sessionStorage.getItem("menu")) || [];
      if (val.length > 0) {
        val.forEach((item) => {
          if (item.orders == 6) {
            this.menu = item.childs;
          }
        });
      }
    }
  }
</script>
<style scoped>
  .main-container {
    position: absolute;
    top: 70px;
    bottom: 0;
    left: 0;
    width: 100%;
  }
</style>
