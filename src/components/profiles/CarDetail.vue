<template>
  <div>
    <section class="content">
      <div class="add-appdiv dialog gray-form" style="padding:10px 0 0 0">
        <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D0CACF solid">
          车牌采集记录
        </div>
        <el-form :model="carDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 20px 0">
            <el-col :span="8" align="center">
              <img :src="carDetail.sceneUrl?carDetail.sceneUrl:imgPath" :onerror="img404"
                   style="max-width: 90%;border-radius: 8px;max-height: 250px;cursor: pointer"
                   onclick="javascript:window.open(this.src)"/>
            </el-col>
            <el-col :span="8" align="left">
              <img :src="carDetail.sceneUrl?carDetail.sceneUrl:imgPath" :onerror="img404"
                   style="max-height:130px;max-width:130px;border-radius: 6px"/>
              <el-form-item label="车牌号码" align="left" style="margin: 0">
                {{carDetail.carLicense?carDetail.carLicense:'--'}}
              </el-form-item>
              <el-form-item label="牌号种类" align="left" style="margin: 0">
                {{carDetail.carLicenseKind?carDetail.carLicenseKind: '--'}}
              </el-form-item>
              <el-form-item label="牌号颜色" align="left" style="margin: 0">
                {{carDetail.carLicenseColor? carDetail.carLicenseColor : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="采集时间" align="left" style="margin: 0">
                {{carDetail.timeStr ? carDetail.timeStr : '--'}}
              </el-form-item>
              <el-form-item label="场所地区" align="left" style="margin: 0">
                {{carDetail.area ? carDetail.area : '--'}}
              </el-form-item>
              <el-form-item label="场所地点" align="left" style="margin: 0">
                {{carDetail.detailAddress ? carDetail.detailAddress : '--'}}
              </el-form-item>
              <el-form-item label="采集场所" align="left" style="margin: 0">
                {{carDetail.placeName ? carDetail.placeName : '--'}}
              </el-form-item>
              <el-form-item label="设备标识" align="left" style="margin: 0">
                {{carDetail.cameraName ? carDetail.cameraName : '--'}}
              </el-form-item>
              <el-form-item label="设备ID" align="left" style="margin: 0">
                {{carDetail.cameraId ? carDetail.cameraId : '--'}}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, getAreaLable} from "../../assets/js/util";

  export default {
    data() {
      return {
        imgPath: require('../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_img.svg') + "'",
        carId: this.$route.query.id || '',
        carDetail: {},
      }
    },
    methods: {
      //获取人脸详情
      getCarDetail() {
        this.$post('car/record/detail', {id: this.carId}).then((data) => {
          this.carDetail = data.data;
          this.carDetail.timeStr = formatDate(new Date(this.carDetail.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          let code = (this.carDetail.areaCode ? this.carDetail.areaCode : this.carDetail.cityCode ? this.carDetail.cityCode : this.carDetail.provinceCode ? this.carDetail.provinceCode : 0);
          this.carDetail.area = getAreaLable(code);
        }).catch((err) => {
          this.$message.error(err);
        });
      }
    },
    mounted() {
      this.getCarDetail();
    }
  }
</script>
