<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2">
        <el-col :span="8" align="left" style="text-align: left">
          <div style="font-size:14px;padding:10px 20px">基本信息</div>
        </el-col>
        <el-col :span="4" :offset="12" align="center" style="text-align: center">
          <el-button type="text" size="medium" @click="deletePerson()" v-show="getButtonVial('person:delKeyPerson')">
            删除
          </el-button>
          <el-button type="text" size="medium" @click="runningModifyPerson=true">修改</el-button>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px">
        <el-form :model="person" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8" align="left" style="text-align: left">
              <img :src="person.faceUrl?person.faceUrl:imgPath"
                   style="height: 160px;width: 160px;border: 1px #D7D7D7 dashed;border-radius: 8px"/>
            </el-col>
            <el-col :span="8" align="left" style="text-align: left">
              <el-form-item label="姓名" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.name?person.name:'--'}}</span>
              </el-form-item>
              <el-form-item label="年龄" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.age<0?'未知':person.age}}</span>
              </el-form-item>
              <el-form-item label="性别" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.sex == 0 ? '男' : person.sex == 1 ? '女' : '未知'}}</span>
              </el-form-item>
              <el-form-item label="手机号" align="left" style="margin: 0;text-align: left">
                <span
                  style="font-size: 15px;color:#000">{{person.mobilePhone? person.mobilePhone: '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="身份证" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.idCard ? person.idCard : '--'}}</span>
              </el-form-item>
              <el-form-item label="所属名单" align="left" style="margin: 0;text-align: left">
                <span
                  style="font-size: 15px;color:#000">{{person.blackClass ? person.blackClass : '--'}}</span>
              </el-form-item>
              <el-form-item label="备注" align="left" style="margin: 0;text-align: left">
                <span
                  style="font-size: 15px;color:#000">{{person.remark ? person.remark : '--'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" type="border-card">
            <el-tab-pane label="疑似人员" name="person"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div style="padding: 20px 0">
        <el-row v-loading="listLoading">
          <el-col :span="24">
            <div class="face-main">
              <div class="face-item" v-for="item in persons" :key="item.id" v-show="persons.length >0">
                <img :src="item.faceUrl?item.faceUrl:imgPath"/>
                <el-form :model="item" align="left" label-width="80px" label-position="right"
                         style="position: absolute;top: 10px;left:150px;text-align: left">
                  <el-form-item label="档案ID" style="margin:0">
                    <span
                      style="font-size: 15px;color:#000;margin-right: 20px">{{item.personId?item.personId:'--'}}</span>
                    <el-button type="text" @click="gotoPerson(item)" v-if="item.personId">查看人员</el-button>
                  </el-form-item>
                  <el-form-item label="相似度" style="margin:0">
                    <span
                      style="font-size: 15px;color:#000">{{item.similarThreshold<0?'--':item.similarThreshold}}</span>
                  </el-form-item>
                </el-form>
              </div>
              <span v-show="persons.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
              <!--<el-row style="width: 100%" v-if="persons.length>=num">-->
              <!--<el-col :span="24" style="text-align: center" align="center">-->
              <!--<el-button type="text" @click="loadMore()">加载更多</el-button>-->
              <!--</el-col>-->
              <!--</el-row>-->
            </div>
          </el-col>
        </el-row>
      </div>
      <!--编辑人员信息-->
      <el-dialog title="修改人员信息" :visible.sync="runningModifyPerson" width="600px" center class="dialog">
        <el-form :model="modifyPerson" align="left" label-width="120px" label-position="right" :rules="rules"
                 ref="modifyPerson">
          <el-form-item label="对应头像" prop="faceUrl" style="margin: 0">
            <el-upload :action="uploadUrl" :show-file-list="false"
                       :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
              <img :src="modifyPerson.faceUrl?modifyPerson.faceUrl:imgPath" class="avatar">
            </el-upload>
          </el-form-item>
          <div style="color:#999;margin-left: 120px;margin-bottom: 20px">
            请选择有人脸且五官较清晰的图片。<br/>
            支持jpeg/jpg/png格式的图片，且不超过2M
          </div>
          <el-form-item label="姓名" prop="name">
            <el-input placeholder="输入姓名" v-model="modifyPerson.name" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard">
            <el-input placeholder="输入身份证号" v-model="modifyPerson.idCard" :maxlength="18"></el-input>
          </el-form-item>
          <el-form-item label="年龄">
            <el-input placeholder="输入年龄" v-model="modifyPerson.age" :maxlength="3" type="number"></el-input>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="modifyPerson.sex" placeholder="选择性别">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input placeholder="输入手机号" v-model="modifyPerson.mobilePhone" :maxlength="11"></el-input>
          </el-form-item>
          <!--<el-form-item label="所属名单" prop="pType">-->
          <!--<el-select v-model="modifyPerson.pType" placeholder="名单">-->
          <!--<el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--</el-form-item>-->
          <el-form-item label="备注">
            <el-input placeholder="备注" v-model="modifyPerson.remark" :maxlength="200" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="confirmModify()">确认添加</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {globalValidImg, nameValidator, numValid, mobileValidator, userCardValid} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'person',
        imgPath: require('../../assets/img/icon_people.png'),
        faceId: this.$route.query.faceId || '',
        sexs: [{value: '0', label: '男'}, {value: '2', label: '女'}],
        person: {},
        modifyPerson: {},
        listLoading: false,
        faceList: [],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        runningModifyPerson: false,
        persons: [],
        num: 10,
        rules: {
          faceUrl: [{required: true, message: '请选择头像', trigger: 'blur'}],
          // age: [{required: true, message: '请输入年龄', trigger: 'blur'}],
          // sex: [{required: true, message: '请选择性别', trigger: 'blur'}],
          name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
          // phone: [{required: true, message: '请输入手机号', trigger: 'blur'}],
          idCard: [{required: true, message: '请输入身份证号', trigger: 'blur'}],
          pType: [{required: true, message: '请选择所属名单', trigger: 'blur'}]
        },
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleAvatarSuccess(res, file) {
        this.modifyPerson.faceUrl = URL.createObjectURL(file.raw);
      },
      beforeAvatarUpload(file) {
        if (globalValidImg(file, this.$message)) {
        }
        return globalValidImg(file, this.$message);
      },
      //修改人员信息
      confirmModify() {
        if (this.modifyPerson.name) {
          if (!nameValidator(this.modifyPerson.name)) {
            this.$message.error('请输入由汉字、英文组成的姓名');
            return;
          }
        }
        if (this.modifyPerson.age) {
          if (!numValid(this.modifyPerson.age)) {
            this.$message.error('请输入正确的年龄');
            return;
          } else if (this.modifyPerson.age < 1 && this.modifyPerson.age > 150) {
            this.$message.error('请输入正确的年龄');
            return;
          }
        }
        if (this.modifyPerson.idCard) {
          if (!userCardValid(this.modifyPerson.idCard)) {
            this.$message.error('请输入正确的身份证号');
            return;
          }
        }
        if (this.modifyPerson.mobilePhone) {
          if (!mobileValidator(this.modifyPerson.mobilePhone)) {
            this.$message.error('请输入正确的手机号码');
            return;
          }
        }
        this.runningModifyPerson = false;
        this.$post("archives/updateDetails", this.modifyPerson, '修改成功').then(() => {
          this.getPersonDetail();
          this.runningModifyPerson = false;
        });
      },
      //关联人员加载更多
      loadMore() {
        this.num += 10;
        this.getPersons();
      },
      //根据imsi查找指定的对应人员
      getPersons() {
        this.listLoading = true;
        this.$post('common/listPersonByUrl', {type: "keyPerson", url: this.person.faceUrl},
          undefined, undefined, "login").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (data.data && data.data.length > 0) {
              this.persons = data.data;
            }
          } else if ("100000" === data.code) {//执行中
            setTimeout(() => {
              this.getPersons();
            }, 1000);
          } else {
            this.persons = [];
            this.listLoading = false;
            this.$message.error(data.msg);
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //进入人员档案
      gotoPerson(row) {
        if (row.personId) {
          // this.$router.push({path: '/personnelFiles', query: {faceId: row.personId}});
          let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.personId}});
          window.open(routeData.href, '_blank');
        }
      },
      //获取图像告警详情
      getPersonDetail() {
        this.$post('archives/detail', {faceId: this.faceId}).then((data) => {
          let row = data.data;
          this.person = data.data;
          this.modifyPerson = {
            faceUrl: row.faceUrl, name: row.name, idNumber: row.idNumber, faceId: row.faceId,
            age: row.age, sex: row.sex, mobilePhone: row.mobilePhone, remark: row.remark
          };
          this.getPersons();
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //删除人员
      deletePerson() {
        this.$confirm('确认要删除该人员吗?', '提示', {type: 'info'}).then(() => {
          this.$post('person/delKeyPerson', {faceIds: [this.faceId]}, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.$router.go(-1);
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
    },
    mounted() {
      this.getPersonDetail();
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
    width: -moz-calc(50% - 42px);
    width: -webkit-calc(50% - 42px);
    width: calc(50% - 42px);
    height: 122px;
    border: 1px #D7D7D7 solid;
    padding: 15px;
    margin-bottom: 20px;
    position: relative;
  }

  .face-item img {
    position: absolute;
    left: 15px;
    width: 120px;
    height: 120px;
    border: 1px #D7D7D7 dashed;
    border-radius: 8px;
    text-align: left;
  }

  .face-item:nth-child(odd) {
    margin-right: 20px;
  }

  .avatar {
    width: 150px;
    height: 150px;
    border: 1px dashed #ccc;
    border-radius: 6px;
  }
</style>
