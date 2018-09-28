<template>
  <div>
    <section class="content">
      <div class="bg-compare">
        <el-row>
          <el-col :span="8" align="right">
            <el-upload class="avatar-uploader" :action="uploadUrl" :show-file-list="false"
                       :on-success="handleAvatarSuccess1" :before-upload="beforeAvatarUpload1">
              <img :src="image1?image1:imageUrl1" class="avatar">
            </el-upload>
          </el-col>
          <el-col :span="8" align="center">
            <h2 style="height: 222px;margin: 0;line-height: 222px;color: #ff0000;font-size: 35px">{{similarity}}%</h2>
          </el-col>
          <el-col :span="8" align="left">
            <el-upload
              class="avatar-uploader" :action="uploadUrl" :show-file-list="false"
              :on-success="handleAvatarSuccess2" :before-upload="beforeAvatarUpload2">
              <img :src="image2?image2:imageUrl2" class="avatar">
            </el-upload>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>
<script>
  import {globalValidImg, noSValidator, noValidator} from "../../assets/js/api";
  import axios from "axios";

  export default {
    data() {
      return {
        uploadUrl: '',
        imageUrl1: require('../../assets/img/icon_people.png'),
        imageUrl2: require('../../assets/img/icon_people.png'),
        image1: '',
        image2: '',
        similarity: 0
      }
    },
    methods: {
      /**第一张头像*/
      handleAvatarSuccess1(res, file) {
        // console.log(res);
        // console.log(file);
      },
      beforeAvatarUpload1(file) {
        let _this = this;
        if (globalValidImg(file, this.$message)) {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function (e) {
            // 读取到的图片base64 数据编码 将此编码字符串传给后台即可
            _this.image1 = e.target.result;
            // console.log(_this.image1);
            _this.compareFace();
          };
        }
        return globalValidImg(file, this.$message);
      },
      /**第二张头像*/
      handleAvatarSuccess2(res, file) {
        // console.log(res);
        // console.log(file);
      },
      beforeAvatarUpload2(file) {
        let _this = this;
        if (globalValidImg(file, this.$message)) {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function (e) {
            // 读取到的图片base64 数据编码 将此编码字符串传给后台即可
            _this.image2 = e.target.result;
            // console.log(_this.image2);
            _this.compareFace();
          };
        }
        return globalValidImg(file, this.$message);
      },
      //对比2张图片
      compareFace() {
        let param = {};
        if (this.image1.length === 0 || this.image2.length === 0) {
          return;
        }
        let url1 = this.image1;
        let url2 = this.image2;
        url1 = url1.substring(url1.indexOf('base64,') + 7);
        url2 = url2.substring(url2.indexOf('base64,') + 7);
        param.imageA = url1;
        param.imageB = url2;
        axios.post("collision/facecompare", param).then((res) => {
          if (res.status == 200) {
            let data = JSON.parse(res.data);
            // console.log(data);
            if (data.similarity) {
              this.similarity = data.similarity;
            }
            if (data.errorcode) {
              this.$message.error(data.errormsg);
              this.similarity = 0;
            }
          } else {
            this.similarity = 0;
          }
        });
      }
    },
    mounted() {
    }
  }
</script>
<style scoped>
  .bg-compare {
    padding: 100px;
    position: absolute;
    top: 100px;
    right: 15px;
    left: 200px;
  }

  .avatar {
    width: 210px;
    height: 210px;
    margin: 5px;
    display: block;
  }
</style>
