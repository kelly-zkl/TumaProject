<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2">
        <el-col :span="8" align="left" style="text-align: left">
          <div style="font-size:14px;padding:10px 20px">基本信息</div>
        </el-col>
        <el-col :span="4" :offset="12" align="center" style="text-align: center">
          <!--<el-button type="text" size="medium" @click="">查看修改记录</el-button>-->
          <el-button type="text" size="medium" @click="deletePerson()" v-show="getButtonVial('person:delKeyPerson')">
            删除
          </el-button>
          <el-button type="text" size="medium" @click="confirmModify()"
                     v-show="getButtonVial('keyPerson:update')">修改
          </el-button>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog"
           style="border-top: none;border-radius: 0 0 4px 4px;margin-bottom:0;padding: 20px 30px 0 0">
        <el-form :model="person" style="margin: 0;padding: 0" labelPosition="right" label-width="100px" :rules="rules"
                 ref="person">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="6" align="left" style="text-align: left">
              <el-form-item prop="faceUrl" style="margin: 0;text-align: left" class="vip-180">
                <!--<el-upload :action="uploadUrl" :show-file-list="false" drag-->
                <!--:on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">-->
                <img :src="person.faceUrl?person.faceUrl:imgPath" class="avatar" :onerror="img404">
                <!--</el-upload>-->
              </el-form-item>
              <!--<div style="color:#999;margin-left: 100px;margin-bottom: 20px;text-align: left">-->
              <!--请选择有人脸且五官较清晰的图片。<br/>-->
              <!--支持jpeg/jpg/png格式的图片，且不超过2M-->
              <!--</div>-->
            </el-col>
            <el-col :span="8" align="left" style="text-align: left" :offset="1">
              <el-form-item label="姓名" prop="name">
                <el-input placeholder="姓名" v-model="person.name" :maxlength="20"></el-input>
              </el-form-item>
              <el-form-item label="身份证号" prop="idCard" style="text-align: left">
                <el-input placeholder="身份证号" v-model="person.idCard" :maxlength="18"></el-input>
              </el-form-item>
              <el-form-item label="性别" style="text-align: left">
                <el-radio-group v-model="person.sex" size="medium">
                  <el-radio-button v-for="item in sexs" :key="item.value" :label="item.value">{{item.label}}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="年龄" style="text-align: left">
                <el-input-number v-model="person.age" controls-position="right" :min="1" :max="150"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8" align="left" style="text-align: left" :offset="1">
              <el-form-item label="所属名单" prop="blackClass" align="left" style="text-align: left">
                <span style="font-size: 15px;color:#000">{{person.blackClass ? person.blackClass : '--'}}</span>
              </el-form-item>
              <el-form-item label="手机号" style="text-align: left">
                <el-input placeholder="手机号" v-model="person.mobilePhone" :maxlength="11"></el-input>
              </el-form-item>
              <el-form-item label="备注" style="text-align: left">
                <el-input placeholder="备注" v-model="person.remark" :maxlength="200" type="textarea"
                          :autosize="{minRows:3,maxRows:5}"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row>
        <el-col :span="16" align="left" class="tab-card no" style="text-align: left;margin: 10px 0">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="疑似人员" name="person"></el-tab-pane>
            <!--<el-tab-pane label="疑似IMSI" name="imsi"></el-tab-pane>-->
          </el-tabs>
        </el-col>
      </el-row>
      <el-row v-loading="listLoading">
        <el-col :span="24">
          <div class="face-main">
            <div class="face-item gray-form" v-for="item in persons" :key="item.id" v-show="persons.length >0">
              <img :src="item.faceUrl?item.faceUrl:imgPath" :onerror="img404"/>
              <el-form :model="item" align="left" label-width="110px" label-position="right"
                       style="text-align: left" size="mini">
                <el-form-item label="档案ID" style="margin:0">
                  <span>{{item.faceId?item.faceId:'--'}}</span>
                  <el-button type="text" @click="gotoPerson(item)" v-if="item.faceId"
                             style="margin-left: 20px">查看详情
                  </el-button>
                </el-form-item>
                <el-form-item label="IMSI[置信度]" style="margin:0">
                  <div v-for="imsi in item.imsiList" style="height: 20px;line-height: 20px;margin:0">
                    <span style="font-size: 14px;margin:0">{{imsi.imsi+'['+(imsi.weight/10).toFixed(1)+'%]'}}</span>
                  </div>
                </el-form-item>
              </el-form>
            </div>
            <span v-show="persons.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>
<script>
  import {globalValidImg, nameValidator, numValid, mobileValidator, userCardValid, isNull} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'person',
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        faceId: this.$route.query.faceId || '',
        resourceId: this.$route.query.resourceId || '',
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        person: {},
        listLoading: false,
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        persons: [],
        timeStamp: new Date().getTime(),
        rules: {
          faceUrl: [{required: true, message: '请选择头像', trigger: 'blur'}],
          name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
          idCard: [{required: true, message: '请输入身份证号', trigger: 'blur'}],
          blackClass: [{required: true, message: '请选择所属名单', trigger: 'blur'}]
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val, eve) {
        this.getPersons();
      },
      handleAvatarSuccess(res, file) {
        if (res.code === '000000') {
          if (res.data) {
            this.person.faceUrl = res.data.fileUrl;
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      beforeAvatarUpload(file) {
        if (globalValidImg(file, this.$message)) {
        }
        return globalValidImg(file, this.$message);
      },
      //修改人员信息
      confirmModify() {
        this.$refs['person'].validate((valid) => {
          if (valid) {
            this.person.name = this.person.name.replace(/\s+/g, "");
            if (!nameValidator(this.person.name)) {
              this.$message.error('请输入由汉字、英文组成的姓名');
              return;
            }
            if (!userCardValid(this.person.idCard)) {
              this.$message.error('请输入正确的身份证号');
              return;
            }
            if (this.person.age) {
              if (!numValid(this.person.age)) {
                this.$message.error('请输入正确的年龄');
                return;
              } else if (this.person.age < 1 && this.person.age > 150) {
                this.$message.error('请输入正确的年龄');
                return;
              }
            }
            if (this.person.mobilePhone) {
              if (!mobileValidator(this.person.mobilePhone)) {
                this.$message.error('请输入正确的手机号码');
                return;
              }
            }
            this.$post("keyPerson/update", this.person, '修改成功').then(() => {
              this.getPersonDetail();
            });
          }
        });
      },
      //根据imsi查找指定的对应人员
      getPersons() {
        this.listLoading = true;
        this.$post('person/listSimilarityPerson', {
          size: 10000, faceUrl: this.person.faceUrl,
          resourceId: this.resourceId
        }, undefined, undefined, "multi").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (data.data) {
              this.persons = data.data ? data.data : [];
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
        if (row.faceId) {
          let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.faceId}});
          window.open(routeData.href, '_blank');
        }
      },
      //获取详情
      getPersonDetail() {
        this.$post('keyPerson/detail', {faceId: this.faceId}).then((data) => {
          let row = data.data;
          this.person = row;
          let age = !isNull(row.age) ? row.age : 0;
          this.person.age = age;
          if (isNull(row.age)) {
            delete this.person['age'];
          }
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
              this.$router.replace("/listManage")
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'weight') {
          return row.weight < 0 ? '--' : (row.weight / 10).toFixed(1) + '%';
        } else if (column.property === 'age' && column.property === 'fnIn') {
          return row[column.property] < 0 ? '--' : row[column.property];
        } else if (column.property === 'ispDes') {
          return row.ispDes == 0 ? '移动' : row.ispDes == 1 ? '联通' : row.ispDes == 2 ? '电信' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.getPersonDetail();
    }
  }
</script>
<style scoped>
  .avatar {
    max-width: 178px;
    max-height: 178px;
    border: 1px dashed #ccc;
    border-radius: 6px;
  }
</style>
