<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2;font-size:14px;padding: 10px 0;width: 100%;text-align: center">
        <el-col :span="18" style="text-align: center" align="center">
          <div style="font-size:14px;text-align: center">基本信息</div>
        </el-col>
        <el-col :span="6" style="text-align: right;padding-right: 20px" align="right"
                v-show="getButtonVial('archives:updateDetails')">
          <el-button type="text" style="margin: 0;padding: 0" @click="clickModify()">修改基本信息</el-button>
        </el-col>
      </el-row>
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
                <span style="font-size: 15px;color:#000">{{userInfo.sex==0 ? '男' : userInfo.sex==1 ?'女':'--'}}</span>
              </el-form-item>
              <el-form-item label="年龄段" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">
                  {{userInfo.startAge>=0?userInfo.startAge==userInfo.endAge?(userInfo.startAge - 3)+ '~'+(userInfo.startAge + 3):userInfo.startAge+'~'+userInfo.endAge:'--'}}
                </span>
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
              <!--<el-form-item label="所属名单" align="left" style="margin: 0">-->
              <!--<span style="font-size: 15px;color:#000">{{userInfo.blackClass ? userInfo.blackClass : '&#45;&#45;'}}</span>-->
              <!--</el-form-item>-->
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row style="background: #F2F2F2" v-if="persons.length>0 || imsiList.length>0">
        <el-col :span="12">
          <div style="font-size:14px;padding:10px 20px">最近抓拍</div>
        </el-col>
        <el-col :span="12">
          <div style="font-size:14px;padding:10px 20px">已关联的侦码信息</div>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px;padding:0"
           v-if="persons.length>0 || imsiList.length>0">
        <el-row>
          <el-col :span="12" style="border-right: 1px solid #D0CACF;padding: 10px 20px">
            <div class="person-main" v-if="persons.length>0">
              <div class="person-item" v-for="item in persons" :key="item.id">
                <img :src="item.faceUrl?item.faceUrl:imgPath" :onerror="img404">
                <div style="font-size:14px;height: 20px;line-height: 20px">{{item.timeStr}}</div>
              </div>
            </div>
            <div v-else style="width:100%;color: #909399;font-size: 14px;text-align: center">暂无数据</div>
          </el-col>
          <el-col :span="12" style="padding: 10px 20px">
            <div style="text-align: left" v-for="item in imsiList" :key="item.imsi" v-if="imsiList.length>0">
              <span @click="gotoDetail(item)" style="height: 32px;line-height: 32px;color: #343434;font-size: 14px">
                {{item.imsi}} {{'关联次数['+(item.fnIn>=0?item.fnIn:'--')+']'}}
                {{'置信度['+(item.weight>=0?(item.weight/10).toFixed(1):'--')+'%]'}}
              </span>
            </div>
            <div v-else style="width:100%;color: #909399;font-size: 14px;text-align: center">暂无数据</div>
          </el-col>
        </el-row>
      </div>
    </section>
    <!--修改基本信息-->
    <el-dialog title="修改基本信息" :visible.sync="runModifyPerson" width="650px" center>
      <div class="block">
        <el-form :model="person" label-position="right" label-width="100px">
          <el-form-item label="姓名">
            <el-input v-model="person.name" auto-complete="off" :maxlength="10" placeholder="输入姓名"></el-input>
          </el-form-item>
          <el-form-item label="年龄段">
            <el-input-number v-model="person.startAge" controls-position="right" :min="1"
                             :max="person.endAge-1" style="width: 100px"></el-input-number>
            <span>~</span>
            <el-input-number v-model="person.endAge" controls-position="right" :min="person.startAge+1"
                             :max="200" style="width: 100px"></el-input-number>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="person.sex" placeholder="选择性别" size="medium">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="身份证号">
            <el-input v-model="person.idCard" auto-complete="off" :maxlength="18" placeholder="输入身份证号"></el-input>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="person.mobilePhone" auto-complete="off" :maxlength="11" placeholder="输入手机号"></el-input>
          </el-form-item>
          <el-form-item label="座机">
            <el-input v-model="person.telephone" auto-complete="off" :maxlength="13"
                      placeholder="输入座机号,例：0123-12345678"></el-input>
          </el-form-item>
          <el-form-item label="所属辖区">
            <el-cascader :options="provinceList" :props="props" filterable clearable
                         v-model="selectedOptions2" placeholder="选择所属辖区">
            </el-cascader>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center" style="margin-top: 20px">
          <el-button @click="runModifyPerson=false">取消</el-button>
          <el-button type="primary" @click="saveInfo()">保存</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import json from '../../../assets/city.json';
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";
  import {
    nameValidator, numValid, mobileValidator, userCardValid,
    telphoneValidator, isNull
  } from "../../../assets/js/api";

  export default {
    data() {
      return {
        runModifyPerson: false,
        person: {},
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        selectedOptions2: [],
        faceId: this.$route.query.faceId || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        userInfo: {},
        imsiList: [],
        persons: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //查看IMSI详情
      gotoDetail(row) {
        // this.$router.push({path: '/imsiDetail', query: {imsi: row.imsi}});
        // let routeData = this.$router.resolve({path: '/imsiDetail', query: {imsi: row.imsi}});
        // window.open(routeData.href, '_blank');
      },
      clickModify() {
        let data = this.userInfo;
        var startAge = !isNull(data.startAge) ? data.startAge : 0;
        var endAge = !isNull(data.endAge) ? data.endAge : 0;
        if (!isNull(data.startAge) && !isNull(data.endAge)) {
          if (startAge == endAge) {
            endAge = startAge + 3;
            startAge = startAge - 3;
          }
        }
        this.person = {
          faceId: data.faceId, telephone: data.telephone ? data.telephone : '',
          sex: !isNull(data.sex) ? data.sex : '', name: data.name ? data.name : '',
          mobilePhone: data.mobilePhone ? data.mobilePhone : '', startAge: startAge,
          idCard: data.idCard ? data.idCard : '', endAge: endAge
        };
        this.selectedOptions2 = data.areaCode ? this.getCode(data.areaCode) : [];
        if (isNull(data.sex)) {
          delete this.person['sex'];
        }
        if (!data.name) {
          delete this.person['name'];
        }
        if (!data.mobilePhone) {
          delete this.person['mobilePhone'];
        }
        if (!data.idCard) {
          delete this.person['idCard'];
        }
        if (isNull(data.startAge)) {
          delete this.person['startAge'];
          delete this.person['endAge'];
        }
        if (!data.telephone) {
          delete this.person['telephone'];
        }

        this.runModifyPerson = true;
      },
      //保存修改信息
      saveInfo() {
        if (this.person.name) {
          if (!nameValidator(this.person.name)) {
            this.$message.error('请输入由汉字、英文组成的姓名');
            return;
          }
        }
        if (this.person.startAge) {
          if (!numValid(this.person.startAge)) {
            this.$message.error('请输入正确的年龄');
            return;
          } else if (this.person.startAge < 1 && this.person.startAge > 150) {
            this.$message.error('请输入正确的年龄');
            return;
          }
        }
        if (this.person.idCard) {
          if (!userCardValid(this.person.idCard)) {
            this.$message.error('请输入正确的身份证号');
            return;
          }
        }
        if (this.person.mobilePhone) {
          if (!mobileValidator(this.person.mobilePhone)) {
            this.$message.error('请输入正确的手机号码');
            return;
          }
        }
        if (this.person.telephone) {
          if (!telphoneValidator(this.person.telephone)) {
            this.$message.error('请输入正确的座机号');
            return;
          }
        }
        if (this.selectedOptions2.length > 0) {
          this.person.areaCode = this.selectedOptions2[this.selectedOptions2.length - 1];
        }
        this.$post("archives/updateDetails", this.person, '修改成功').then(() => {
          this.getUserData();
          this.runModifyPerson = false;
        });
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
            this.userInfo.area = data.data.areaCode ? this.getAreaLable(data.data.areaCode) : '--';

            localStorage.setItem("pathUrl", JSON.stringify(this.userInfo.faceUrl));
            localStorage.setItem("pathImsi", JSON.stringify(imsis));
            localStorage.setItem("pathFace", JSON.stringify(faces));
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        json.forEach((province) => {
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
      },
      //根据区域码找到对应的省市县编码
      getCode(code) {
        let arr = [];
        json.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {
                city.c.forEach((country) => {
                  if (code === country.o) {
                    arr = [province.o, city.o, country.o];
                  }
                })
              } else {
                if (code === city.o) {
                  arr = [province.o, city.o];
                }
              }
            })
          } else {
            if (code === province.o) {
              arr = [province.o];
            }
          }
        });
        return arr;
      }
    },
    mounted() {
      this.getUserData();
    }
  }
</script>
<style scoped>
  .person-main {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .person-item {
    width: -moz-calc((100% - 40px) / 3);
    width: -webkit-calc((100% - 40px) / 3);
    width: calc((100% - 40px) / 3);
    height: 162px;
    margin: 5px 0;
    text-align: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .person-item img {
    max-width: 130px;
    max-height: 130px;
    border: 1px #D7D7D7 dashed;
    border-radius: 6px;
    text-align: left;
  }

  .person-item:nth-child(3n+1) {
    margin-right: 20px;
  }

  .person-item:nth-child(3n+2) {
    margin-right: 20px;
  }
</style>
