<template>
  <div>
    <section class="content">
      <div style="background: #F2F2F2;font-size:14px;padding: 10px 0;width: 100%;text-align: center">基本信息</div>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px">
        <el-form :model="userInfo" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8">
              <el-form-item label="ID" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.faceId ? userInfo.faceId : '--'}}</span>
              </el-form-item>
              <el-form-item label="入库时间" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.timeStr ? userInfo.timeStr : '--'}}</span>
              </el-form-item>
              <el-form-item label="备注" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.remark ? userInfo.remark : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="姓名" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.name ? userInfo.name : '--'}}</span>
              </el-form-item>
              <el-form-item label="性别" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.sex==0 ? '男' : userInfo.sex==1 ?'女':'未知'}}</span>
              </el-form-item>
              <el-form-item label="年龄" align="left" style="margin: 0">
                <span
                  style="font-size: 15px;color:#000">{{userInfo.startAge==userInfo.endAge ? userInfo.startAge : userInfo.startAge+'~'+userInfo.endAge}}</span>
              </el-form-item>
              <el-form-item label="身份证" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.idCard ? userInfo.idCard : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="手机号" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.mobilePhone ? userInfo.mobilePhone : '--'}}</span>
              </el-form-item>
              <el-form-item label="座机" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.telephone ? userInfo.telephone : '--'}}</span>
              </el-form-item>
              <el-form-item label="所属辖区" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.area ? userInfo.area : '--'}}</span>
              </el-form-item>
              <el-form-item label="所属名单" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{userInfo.blackClass ? userInfo.blackClass : '--'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row style="background: #F2F2F2" v-if="persons.length>0 && imsiList.length>0">
        <el-col :span="12">
          <div style="font-size:14px;padding:10px 20px">最近抓拍</div>
        </el-col>
        <el-col :span="12">
          <div style="font-size:14px;padding:10px 20px">已关联的侦码信息</div>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px;padding:0"
           v-if="persons.length>0 && imsiList.length>0">
        <el-row>
          <el-col :span="12" style="border-right: 1px solid #D0CACF">
            <div class="face-main">
              <div class="face-item" v-for="item in persons" :key="item.id">
                <img :src="item.faceUrl?item.faceUrl:imgPath">
                <div style="font-size:14px;height: 30px;line-height: 30px">{{item.timeStr}}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <el-col :span="24" align="center" v-for="item in imsiList" :key="item.imsi">
              <el-button type="text" @click="gotoDetail(item)">
                {{item.imsi}} {{item.regional}} {{item.ispDes}} {{'['+item.weightDes+']'}}
              </el-button>
            </el-col>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>
<script>
  import json from '../../../assets/city.json';
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        provinceList: json,
        faceId: this.$route.query.faceId || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        userInfo: {},
        imsiList: [],
        persons: []
      }
    },
    methods: {
      //查看IMSI详情
      gotoDetail(row) {
        this.$router.push({path: '/imsiDetail', query: {imsi: row.imsi}});
      },
      getUserData() {
        this.$post('archives/detail', {faceId: this.faceId, showFaceTraces: 1, showImsiDetail: 1}).then((data) => {
          if ('000000' === data.code) {
            this.userInfo = data.data;
            let imsis = [], faces = [data.data.faceId];
            if (data.data.faceTraces && data.data.faceTraces.length > 0) {
              this.persons = data.data.faceTraces;
              this.persons.forEach((item) => {
                item.timeStr = formatDate(new Date(item.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
              })
            }

            if (data.data.imsiList && data.data.imsiList.length > 0) {
              this.imsiList = data.data.imsiList;
              this.imsiList.forEach((item) => {
                imsis.push(item.imsi);
              });
            }
            this.userInfo.timeStr = formatDate(new Date(data.data.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
            this.userInfo.area = this.getAreaLable(data.data.areaCode);

            sessionStorage.setItem("pathImsi", JSON.stringify(imsis));
            sessionStorage.setItem("pathFace", JSON.stringify(faces));
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {//省级+市级+县级
                city.c.forEach((country) => {
                  if (code === country.o) {
                    lable = province.n + city.n + country.n;
                  }
                })
              } else {//省级+市级
                if (code === city.o) {
                  lable = province.n + city.n;
                }
              }
            })
          } else {//只包含省级
            if (code === province.o) {
              lable = province.n;
            }
          }
        });
        return lable;
      }
    },
    mounted() {
      this.getUserData();
    }
  }
</script>
<style scoped>
  .face-main {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .face-item {
    width: 28%;
    height: 162px;
    margin-bottom: 20px;
    position: relative;
  }

  .face-item img {
    position: absolute;
    left: 20px;
    width: 130px;
    height: 130px;
    border: 1px #D7D7D7 dashed;
    border-radius: 6px;
    text-align: left;
  }

  .face-item div {
    position: absolute;
    left: 20px;
    top: 132px;
  }

  .face-item:nth-child(3n+1) {
    margin-right: 20px;
  }

  .face-item:nth-child(3n+2) {
    margin-right: 20px;
  }
</style>
