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
                <img :src="param.value" v-else style="max-height: 100px;border-radius: 6px"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <h5 class="add-label" style="margin-top: 0">搜索结果</h5>
      <div class="add-appdiv" style="padding:20px 15px">
        <el-row v-loading="listLoading" style="margin: 0;padding: 0" v-if="param.type=='imsi'">
          <el-col :span="24" style="margin: 0;padding: 0">
            <div class="face-main">
              <div class="face-item" v-for="item in searchResults" :key="item.id" v-show="searchResults.length >0"
                   style="height: 130px">
                <div class="face-img">
                  <img :src="item.faceUrl?item.faceUrl:imgPath" :onerror="img404"/>
                  <el-form :model="item" align="left" label-width="96px" label-position="right" size="small"
                           style="text-align: left">
                    <el-form-item label="IMSI置信度" style="margin:0" v-for="imsi in item.imsiList" :key="imsi.imsi"
                                  v-show="imsi.imsi==param.value">
                    <span
                      style="font-size:18px;color:#000;font-weight:bold">{{imsi.weight?(imsi.weight/10).toFixed(1)+'%':'--'}}</span>
                    </el-form-item>
                    <el-form-item label="年龄段" style="margin:0">
                    <span style="font-size: 15px;color:#000">
                      {{item.startAge>= 0?item.startAge==item.endAge?(item.startAge-3)+ '~'+(item.startAge+3):item.startAge+ '~'+ item.endAge:'--'}}
                    </span>
                    </el-form-item>
                    <el-form-item label="性别" style="margin:0">
                      <span style="font-size: 15px;color:#000">{{item.sex==0?'男':item.sex==1?'女':'--'}}</span>
                    </el-form-item>
                    <el-form-item label="档案ID" style="margin:0">
                      <el-button type="text" @click="gotoPerson(item)">{{item.faceId?item.faceId:'--'}}</el-button>
                    </el-form-item>
                  </el-form>
                </div>
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
                   style="height: 220px">
                <div class="face-img">
                  <img :src="item.faceUrl?item.faceUrl:imgPath" style="max-width: 140px;max-height: 140px"
                       :onerror="img404"/>
                  <el-form :model="item" align="left" label-width="0" size="mini"
                           style="text-align: left;margin-left: 20px">
                    <el-form-item style="margin:0">
                      <span style="font-size: 14px;margin: 0;color:#888">IMSI置信度</span>
                      <div v-for="imsi in item.imsiList" style="height: 20px;line-height: 20px;margin:0">
                      <span
                        style="font-size: 14px;margin: 0;color:#000">{{imsi.imsi+'['+(imsi.weight/10).toFixed(1)+'%]'}}</span>
                      </div>
                      <div v-bind:style="'height:'+(5-item.imsiList.length)*20+'px'"
                           v-show="item.imsiList.length<5"></div>
                    </el-form-item>
                    <el-form-item style="margin:0">
                      <span style="font-size: 14px;color:#888;margin-right: 10px">档案ID</span>
                      <el-button type="text" @click="gotoPerson(item)">{{item.faceId?item.faceId:'--'}}</el-button>
                    </el-form-item>
                  </el-form>
                </div>
                <el-row style="margin-top:10px;width:100%;margin-bottom: 5px">
                  <el-col :span="8" style="text-align: center">
                    <div style="font-size:18px;color:#000;font-weight:bold">
                      {{item.similarThreshold>0?item.similarThreshold.toFixed(1)+'%':'--'}}
                    </div>
                    <div style="font-size:14px;color:#888;margin-top:3px">人脸相似度</div>
                  </el-col>
                  <el-col :span="8" style="text-align: center">
                    <div style="font-size:14px;color:#000">{{item.sex==0?'男':item.sex==1?'女':'--'}}</div>
                    <div style="font-size:14px;color:#888;margin-top:3px">性别</div>
                  </el-col>
                  <el-col :span="8" style="text-align: center">
                    <div style="font-size:14px;color:#000">
                      {{item.startAge>= 0?item.startAge==item.endAge?(item.startAge-3)+
                      '~'+(item.startAge+3):item.startAge+ '~'+ item.endAge:'--'}}
                    </div>
                    <div style="font-size:14px;color:#888;margin-top:3px">年龄</div>
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
        num: 9,
        searchResults: [],
        imgPath: require('../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../assets/img/icon_people.png') + "'",
        query: {size: 100},
        listLoading: false,
        timeStamp: new Date().getTime()
      }
    },
    watch: {
      searchParam: function () {
        this.param = JSON.parse(this.searchParam);
        this.num = 9;
        this.searchResults = [];
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
        this.listLoading = true;
        let paramData = {};
        if (this.param.type == 'imsi') {
          paramData = {size: this.num, imsi: this.param.value}
        } else {
          paramData = {size: this.num, url: this.param.value + '?t=' + this.timeStamp}
        }
        this.$post('home/allSearch', paramData, undefined, undefined, "multi").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            this.searchResults = data.data ? data.data : [];
          } else if ("100000" === data.code) {//执行中
            setTimeout(() => {
              this.getData();
            }, 1000);
          } else {
            this.searchResults = [];
            this.listLoading = false;
            this.$message.error(data.msg);
          }
        }).catch((err) => {
          this.searchResults = [];
          this.listLoading = false;
          this.$message.error(err);
        });
      },
      //关联人员加载更多
      loadMore() {
        this.num += 9;
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
    border-radius: 6px;
    background: #fff;
    padding: 10px 15px;
    margin-bottom: 15px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .face-img {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .face-item img, .face-item .face-img img {
    max-width: 116px;
    max-height: 116px;
    border-radius: 6px;
    text-align: left;
  }

  .face-item:nth-child(3n+1), .face-item:nth-child(3n+2) {
    margin-right: 15px;
  }

  .face-item:nth-child(3n) {
    margin-right: 0;
  }
</style>
