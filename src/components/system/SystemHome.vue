<template>
  <el-container class="home-container">
    <!--左侧菜单栏-->
    <el-aside :width="collapseWidth" v-bind:class="isCollapse ? 'content-aside-close' : 'content-aside'">
      <el-menu :default-active="$route.path" :collapse="isCollapse" unique-opened router mode="vertical"
               background-color="#f6f7fb" text-color="#333" active-text-color="#6699FF" @select="handleActive">
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
                                :key="item.name" :to="{ path: item.path}">{{ item.name}}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-col>
        <el-col :span="24" style="padding-top: 15px">
          <transition name="fade" mode="out-in">
            <router-view @setSystem="setSystem"></router-view>
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
      setSystem() {
        this.$emit('handleSelectTab', null, 'sys');
      },
      //菜单激活回调
      handleActive(index, indexPath) {
        sessionStorage.removeItem("query");
        sessionStorage.removeItem("qTime");
        sessionStorage.removeItem("activeItem");
      }
    },
    mounted() {
      sessionStorage.setItem("index", 7);
      this.$emit('handleSelectTab', 7);
      let val = JSON.parse(sessionStorage.getItem("menu")) || [];
      if (val.length > 0) {
        val.forEach((item) => {
          if (item.orders == 7) {
            this.menu = item.childs;
          }
        });
      }
    }
  }
</script>
