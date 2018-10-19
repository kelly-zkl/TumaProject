<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="导入服务器文件" name="person"></el-tab-pane>
            <el-tab-pane label="导入记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </section>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        activeItem: 'person'
      }
    },
    methods: {
      handleType(val) {

      }
    },
    mounted() {
    }
  }
</script>
<style></style>
