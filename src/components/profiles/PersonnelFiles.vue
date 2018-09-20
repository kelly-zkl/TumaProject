<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="24" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="人员信息" name="0" style="padding-top: 15px">
              <PersonInfo ref="personInfo"></PersonInfo>
            </el-tab-pane>
            <el-tab-pane label="伴随分析" name="1" style="padding-top: 15px">
              <FollowAnaly ref="followAnaly"></FollowAnaly>
            </el-tab-pane>
            <el-tab-pane label="抓取记录" name="2" style="padding-top: 15px">
              <FetchRecords ref="fetchRecords"></FetchRecords>
            </el-tab-pane>
            <el-tab-pane label="轨迹分析" name="3" style="padding-top: 15px" v-if="getButtonVial('route:query')">
              <PathAnalysis ref="pathAnalysis"></PathAnalysis>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </section>
  </div>
</template>
<script>

  import FetchRecords from './files/FetchRecords.vue';
  import FollowAnaly from './files/FollowAnaly.vue';
  import PathAnalysis from './files/PathAnalysis.vue';
  import PersonInfo from './files/PersonInfo.vue';
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: '0',
        faceId: this.$route.query.faceId || ''
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val) {

      }
    },
    mounted() {
    },
    components: {
      FetchRecords,
      FollowAnaly,
      PathAnalysis,
      PersonInfo
    }
  }
</script>
