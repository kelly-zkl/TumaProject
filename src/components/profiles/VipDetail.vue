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
                <span style="font-size: 15px;color:#000">{{person.age>0?person.age: '--'}}</span>
              </el-form-item>
              <el-form-item label="性别" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.sex == 0 ? '男' : person.sex == 1 ? '女' : '--'}}</span>
              </el-form-item>
              <el-form-item label="手机号" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.mobilePhone? person.mobilePhone: '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="身份证" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.idCard ? person.idCard : '--'}}</span>
              </el-form-item>
              <el-form-item label="所属名单" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.blackClass ? person.blackClass : '--'}}</span>
              </el-form-item>
              <el-form-item label="备注" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{person.remark ? person.remark : '--'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="疑似人员" name="person"></el-tab-pane>
            <el-tab-pane label="疑似IMSI" name="imsi"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='person'" style="padding: 10px 0">
        <el-row v-loading="listLoading">
          <el-col :span="24">
            <div class="face-main">
              <div class="face-item" v-for="item in persons" :key="item.id" v-show="persons.length >0">
                <img :src="item.faceUrl?item.faceUrl:imgPath"/>
                <el-form :model="item" align="left" label-width="80px" label-position="right"
                         style="position: absolute;top: 10px;left:150px;text-align: left">
                  <el-form-item label="档案ID" style="margin:0">
                    <!--<span-->
                    <!--style="font-size: 14px;color:#000;margin-right: 20px">{{item.faceId?item.faceId:'&#45;&#45;'}}</span>-->
                    <el-button type="text" @click="gotoPerson(item)" v-if="item.faceId">
                      {{item.faceId?item.faceId:'--'}}
                    </el-button>
                  </el-form-item>
                  <el-form-item label="关联IMSI" style="margin:0">
                    <span
                      style="font-size: 14px;color:#000">{{imsiList.length>0?imsiList[0].imsi:'--'}}</span>
                  </el-form-item>
                  <el-form-item style="margin:0">
                    <span style="font-size: 14px;color:#000;margin-right: 20px">
                      {{'置信度['+(imsiList.length>0&&imsiList[0].weight>=0?imsiList[0].weight/10:'--')+'%]'}} {{'关联次数['+(imsiList.length>0&&imsiList[0].fnIn>=0?imsiList[0].fnIn:'--')+']'}}</span>
                  </el-form-item>
                </el-form>
              </div>
              <span v-show="persons.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-show="activeItem=='imsi'" style="margin-top: 10px">
        <el-table :data="imsiList" class="center-block" v-loading="listLoading" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="ispDes" label="运营商" max-width="150" min-width="100"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI归属地" max-width="200" min-width="150" prop="regional"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="fnIn" label="关联次数" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="weight" label="置信度" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoIMSI(scope.row)"
                         v-show="getButtonVial('archives:getImsiRecordByImsi')">查看IMSI
              </el-button>
            </template>
          </el-table-column>
        </el-table>
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
            <el-input-number v-model="modifyPerson.age" controls-position="right" :min="1"
                             :max="150"></el-input-number>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="modifyPerson.sex" placeholder="选择性别">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input placeholder="输入手机号" v-model="modifyPerson.mobilePhone" :maxlength="11"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input placeholder="备注" v-model="modifyPerson.remark" :maxlength="200" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="confirmModify()">确认修改</el-button>
        </div>
      </el-dialog>
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
        faceId: this.$route.query.faceId || '',
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        person: {},
        modifyPerson: {},
        listLoading: false,
        faceList: [],
        imsiList: [],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        runningModifyPerson: false,
        persons: [],
        timeStamp: new Date().getTime(),
        rules: {
          faceUrl: [{required: true, message: '请选择头像', trigger: 'blur'}],
          // age: [{required: true, message: '请输入年龄', trigger: 'blur'}],
          // sex: [{required: true, message: '请选择性别', trigger: 'blur'}],
          name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
          // phone: [{required: true, message: '请输入手机号', trigger: 'blur'}],
          idCard: [{required: true, message: '请输入身份证号', trigger: 'blur'}],
          pType: [{required: true, message: '请选择所属名单', trigger: 'blur'}]
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //查看IMSI详情
      gotoIMSI(row) {
        // this.$router.push({path: '/imsiDetail', query: {imsi: row.imsi}});
        let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: row.imsi}});
        window.open(routeData.href, '_blank');
      },
      handleType(val, eve) {
        this.getPersons();
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
      //根据imsi查找指定的对应人员
      getPersons() {
        this.listLoading = true;
        this.$post('common/listPersonByUrl', {type: "keyPerson", url: this.person.faceUrl + '?t=' + this.timeStamp},
          undefined, undefined, "login").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (data.data && data.data.length > 0) {
              this.persons = data.data;
              this.imsiList = data.data[0].imsiWeightBOList;
            }
          } else if ("100000" === data.code) {//执行中
            setTimeout(() => {
              this.getPersons();
            }, 1000);
          } else {
            this.persons = [];
            this.imsiList = [];
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
          // this.$router.push({path: '/personnelFiles', query: {faceId: row.faceId}});
          let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.faceId}});
          window.open(routeData.href, '_blank');
        }
      },
      //获取图像告警详情
      getPersonDetail() {
        this.$post('archives/detail', {faceId: this.faceId}).then((data) => {
          let row = data.data;
          this.person = data.data;
          var age = !isNull(row.age) ? row.age : 0;
          this.modifyPerson = {
            faceUrl: row.faceUrl, name: row.name, idCard: row.idCard, faceId: row.faceId, age: age,
            sex: row.sex, mobilePhone: row.mobilePhone, remark: row.remark
          };
          if (isNull(row.age)) {
            delete this.modifyPerson['age'];
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
              this.$router.go(-1);
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
    width: 150px;
    height: 150px;
    border: 1px dashed #ccc;
    border-radius: 6px;
  }
</style>
