<template>
  <div>
    <section class="content">
      <div class="bg-compare">
        <el-row>
          <el-col :span="8" align="right">
            <el-upload class="avatar-uploader" :action="uploadUrl" :show-file-list="false"
                       :on-success="handleAvatarSuccess1" :before-upload="beforeAvatarUpload1">
              <img v-if="imageUrl1" :src="imageUrl1" class="avatar">
              <img src="../../assets/img/icon_people.png" class="avatar" v-else>
            </el-upload>
          </el-col>
          <el-col :span="8" align="center">
            <h2 style="height: 222px;margin: 0;line-height: 222px;color: #ff0000;font-size: 35px">85%</h2>
          </el-col>
          <el-col :span="8" align="left">
            <el-upload
              class="avatar-uploader" :action="uploadUrl" :show-file-list="false"
              :on-success="handleAvatarSuccess2" :before-upload="beforeAvatarUpload2">
              <img v-if="imageUrl2" :src="imageUrl2" class="avatar">
              <img src="../../assets/img/icon_people.png" class="avatar" v-else>
            </el-upload>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>
<script>
  import {globalValidImg, noSValidator, noValidator} from "../../assets/js/api";

  export default {
    data() {
      return {
        uploadUrl: '',
        imageUrl1: '',
        imageUrl2: ''
      }
    },
    methods: {
      /**第一张头像*/
      handleAvatarSuccess1(res, file) {
        this.imageUrl1 = URL.createObjectURL(file.raw);
      },
      beforeAvatarUpload1(file) {
        if (globalValidImg(file.raw, this.$message)) {
        }
        return globalValidImg(file.raw, this.$message);
      },
      /**第二张头像*/
      handleAvatarSuccess2(res, file) {
        this.imageUrl2 = URL.createObjectURL(file.raw);
      },
      beforeAvatarUpload2(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      }
    },
    mounted() {
    }
  }
</script>
<style scoped>
  .bg-compare {
    background: #F7F7F7;
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
