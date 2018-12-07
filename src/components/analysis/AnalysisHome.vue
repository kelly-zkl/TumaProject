<template>
  <el-container class="home-container">
    <!--左侧菜单栏-->
    <el-aside :width="collapseWidth" v-bind:class="isCollapse ? 'content-aside-close' : 'content-aside'">
      <el-menu :default-active="$route.path" :collapse="isCollapse" unique-opened router mode="vertical"
               background-color="#f6f7fb" text-color="#333" active-text-color="#6699FF" @select="handleActive">
        <el-menu-item v-for="item in menu" :index="item.permissionUrl" :key="item.permissionUrl">
          {{item.name}}
        </el-menu-item>
      </el-menu>
    </el-aside>
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
        <div
          v-bind:style="$route.path =='/caseList'||$route.path =='/collisionAnalysis'||$route.path =='/followAnalysis'||$route.path =='/personControl'?'background: #fff;margin: 10px 0 0 0;padding: 10px':'margin: 10px 0 0 0'">
          <transition name="fade" mode="out-in">
            <router-view @getWarningCount="getWarningCount"></router-view>
          </transition>
        </div>
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
      getWarningCount() {
      },
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
        sessionStorage.removeItem("query");
        sessionStorage.removeItem("qTime");
        sessionStorage.removeItem("activeItem");
      }
    },
    mounted() {
      sessionStorage.setItem("index", 5);
      this.$emit('handleSelectTab', 5);
      let val = JSON.parse(sessionStorage.getItem("menu")) || [];
      if (val.length > 0) {
        val.forEach((item) => {
          if (item.orders == 5) {
            this.menu = item.childs;
          }
        });
      }
    }
  }
</script>
