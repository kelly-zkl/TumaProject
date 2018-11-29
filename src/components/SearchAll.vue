<template>
  <div>
    <section style="padding:0 20px">
      <h5 class="add-label" style="margin-top: 0">搜索条件</h5>
      <div class="add-appdiv dialog" style="padding: 15px 30px">
        <el-form :model="param" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="12" align="center">
              <el-form-item label="搜索类型" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{param.type=='imsi'?'以码搜图':'以图搜码'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12" align="left" style="text-align: left">
              <el-form-item label="搜索对象" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000" v-if="param.type=='imsi'">{{param.value}}</span>
                <img :src="param.value" v-else style="max-height: 100px;border: 1px #D7D7D7 dashed;border-radius: 8px"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <h5 class="add-label" style="margin-top: 0">搜索结果</h5>
      <div class="add-appdiv" style="padding: 20px">
        <el-row v-loading="listLoading" style="margin: 0;padding: 0" v-if="param.type=='imsi'">
          <el-col :span="24" style="margin: 0;padding: 0">
            <div class="face-main">
              <div class="face-item" v-for="item in searchResults" :key="item.id" v-show="searchResults.length >0"
                   style="height: 130px">
                <img :src="item.faceUrl?item.faceUrl:imgPath"/>
                <el-form :model="item" align="left" label-width="90px" label-position="right" size="medium"
                         style="position: absolute;top: 7px;left:160px;text-align: left">
                  <el-form-item label="IMSI置信度" style="margin:0">
                    <span
                      style="font-size:18px;color:#000;font-weight:bold">{{item.weight?item.weight/10+'%':'--'}}</span>
                  </el-form-item>
                  <el-form-item label="年龄段" style="margin:0">
                    <span style="font-size: 15px;color:#000">{{item.fnIn<0?'--':item.fnIn}}</span>
                  </el-form-item>
                  <el-form-item label="性别" style="margin:0">
                    <span style="font-size: 15px;color:#000">{{item.fnIn<0?'--':item.fnIn}}</span>
                  </el-form-item>
                  <el-form-item label="档案ID" style="margin:0">
                    <el-button type="text" @click="gotoPerson(item)" v-if="item.personId">
                      {{item.personId?item.personId:'--'}}
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              <span v-show="searchResults.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
              <el-row style="width: 100%" v-if="searchResults.length>=num">
                <el-col :span="24" style="text-align: center" align="center">
                  <el-button type="text" @click="loadMore()">加载更多</el-button>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
        <el-row v-loading="listLoading" style="margin: 0;padding: 0" v-else>
          <el-col :span="24" style="margin: 0;padding: 0">
            <div class="face-main">
              <div class="face-item" v-for="item in searchResults" :key="item.id" v-show="searchResults.length >0"
                   style="height: 190px">
                <img :src="item.faceUrl?item.faceUrl:imgPath" style="width: 140px;height: 140px"/>
                <el-form :model="item" align="left" label-width="0" size="mini"
                         style="position: absolute;top: 5px;left:170px;text-align: left">
                  <el-form-item style="margin:0">
                    <span style="font-size: 14px;margin: 0">IMSI置信度</span>
                    <div v-for="imsi in item.imsiList" style="height: 20px;line-height: 20px;margin:0">
                      <span
                        style="font-size: 14px;margin: 0;color:#000">{{imsi.imsi+'['+imsi.weight/10+'%]'}}</span>
                    </div>
                    <div v-bind:style="'height:'+(5-item.imsiList.length)*20+'px'"
                         v-show="item.imsiList.length<5"></div>
                  </el-form-item>
                  <el-form-item style="margin:0">
                    <span style="font-size: 14px;margin-right: 10px">档案ID</span>
                    <el-button type="text" @click="gotoPerson(item)" v-if="item.personId">
                      {{item.personId?item.personId:'--'}}
                    </el-button>
                  </el-form-item>
                </el-form>
                <el-row style="position: absolute;top: 170px;left:0;width: 100%">
                  <el-col :span="8" style="text-align: center">
                    <div
                      style="font-size:18px;color:#000;font-weight:bold">{{item.weight?item.weight/10+'%':'--'}}
                    </div>
                    <div style="font-size:14px;color:#999">人脸相似度</div>
                  </el-col>
                  <el-col :span="8" style="text-align: center">
                    <div style="font-size:14px;color:#000">{{item.weight?item.weight/10+'%':'--'}}</div>
                    <div style="font-size:14px;color:#999">性别</div>
                  </el-col>
                  <el-col :span="8" style="text-align: center">
                    <div style="font-size:14px;color:#000">{{item.weight?item.weight/10+'%':'--'}}</div>
                    <div style="font-size:14px;color:#999">年龄</div>
                  </el-col>
                </el-row>
              </div>
              <span v-show="searchResults.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
              <el-row style="width: 100%" v-if="searchResults.length>=num">
                <el-col :span="24" style="text-align: center" align="center">
                  <el-button type="text" @click="loadMore()">加载更多</el-button>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator} from "../assets/js/util";

  export default {
    props: ['searchParam'],
    data() {
      return {
        param: {},
        imsi: '',
        imageUrl: '',
        num: 10,
        searchResults: [{weight: 960, imsiList: [0]}, {weight: 960, imsiList: [0, 1]},
          {weight: 960, imsiList: [0, 1, 2]}, {weight: 960, imsiList: [0, 1, 2, 3]},
          {weight: 960, imsiList: [0, 1, 2, 3, 4]}],
        imgPath: require('../assets/img/icon_people.png'),
        query: {size: 100},
        listLoading: false,
      }
    },
    watch: {
      searchParam: function () {
        this.param = JSON.parse(this.searchParam);
        this.getData();
      }
    },
    created() {
      this.param = JSON.parse(this.searchParam);
      this.getData();
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      gotoPerson(row) {
        // sessionStorage.setItem("page", this.page);
        let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.faceId}});
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/personnelFiles', query: {faceId: row.faceId}});
      },
      getData() {
      },
      //关联人员加载更多
      loadMore() {
        this.num += 10;
        this.getData();
      }
    },
    mounted() {
      this.getData();
    }
  }
</script>
<style scoped>
  /*关联人员/疑似人员的css*/
  .face-main {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .face-item {
    width: -moz-calc((100% - 126px) / 3);
    width: -webkit-calc((100% - 126px) / 3);
    width: calc((100% - 126px) / 3);
    border: 1px #D7D7D7 solid;
    border-radius: 8px;
    background: #fff;
    padding: 15px;
    margin-bottom: 15px;
    position: relative;
  }

  .face-item img {
    position: absolute;
    left: 15px;
    width: 130px;
    height: 130px;
    border: 1px #D7D7D7 dashed;
    border-radius: 8px;
    text-align: left;
  }

  .face-item:nth-child(3n+1), .face-item:nth-child(3n+2) {
    margin-right: 15px;
  }

  .face-item:nth-child(3n) {
    margin-right: 0;
  }
</style>
