<template>
  <div>
    <section class="content">
      <div class="add-appdiv dialog" style="padding:10px 0 0 0">
        <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D0CACF solid">
          车牌抓取记录
        </div>
        <el-form :model="faceDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 10px 0">
            <el-col :span="8" align="center">
              <img :src="faceDetail.senceImageUrl?faceDetail.senceImageUrl:imgPath2" :onerror="img2404"
                   style="max-width: 90%;border-radius: 8px;max-height: 250px;cursor: pointer"
                   onclick="javascript:window.open(this.src)"/>
            </el-col>
            <el-col :span="8" align="left">
              <img :src="faceDetail.imageUrl?faceDetail.imageUrl:imgPath" :onerror="img404"
                   style="max-height:130px;max-width:130px;border-radius: 6px"/>
              <el-form-item label="车牌号码" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.age > 0 ? (faceDetail.age-3)+"~"+(faceDetail.age+3):'--'}}</span>
              </el-form-item>
              <el-form-item label="牌号种类" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.sex == 0 ? '男' : faceDetail.sex == 1 ? '女' : '--'}}</span>
              </el-form-item>
              <el-form-item label="牌号颜色" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.sex == 0 ? '男' : faceDetail.sex == 1 ? '女' : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="抓取时间" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.timeStr ? faceDetail.timeStr : '--'}}</span>
              </el-form-item>
              <el-form-item label="场所地区" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.area ? faceDetail.area : '--'}}</span>
              </el-form-item>
              <el-form-item label="场所地点" align="left" style="margin: 0">
                <span
                  style="font-size: 15px;color:#000">{{faceDetail.detailAddress ? faceDetail.detailAddress : '--'}}</span>
              </el-form-item>
              <el-form-item label="抓取场所" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.placeName ? faceDetail.placeName : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备标识" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.deviceName ? faceDetail.deviceName : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备ID" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.deviceId ? faceDetail.deviceId : '--'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        imgPath: require('../../assets/img/icon_people.png'),
        imgPath2: require('../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        img2404: "this.onerror='';this.src='" + require('../../assets/img/icon_img.svg') + "'",
        provinceList: JSON.parse(localStorage.getItem("areas")),
        id: this.$route.query.id || '',
        imageId: this.$route.query.imageId || '',
        faceDetail: {},
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //获取图像详情
      getFaceDetail() {
        this.$post('archives/getFaceRecordById/' + this.imageId, {}).then((data) => {
          this.faceDetail = data.data;
          this.faceDetail.timeStr = formatDate(new Date(this.faceDetail.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          let code = (this.faceDetail.areaCode ? this.faceDetail.areaCode : this.faceDetail.cityCode ? this.faceDetail.cityCode : this.faceDetail.provinceCode ? this.faceDetail.provinceCode : 0);
          this.faceDetail.area = this.getAreaLable(code);
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.subAreas) {
            province.subAreas.forEach((city) => {
              if (city.subAreas) {//省级+市级+县级
                city.subAreas.forEach((country) => {
                  if (code === country.areaCode) {
                    lable = province.areaName + city.areaName + country.areaName;
                  }
                })
              } else {//省级+市级
                if (code === city.areaCode) {
                  lable = province.areaName + city.areaName;
                }
              }
            })
          } else {//只包含省级
            if (code === province.areaCode) {
              lable = province.areaName;
            }
          }
        });
        return lable;
      }
    },
    mounted() {
      this.getFaceDetail();
    }
  }
</script>
