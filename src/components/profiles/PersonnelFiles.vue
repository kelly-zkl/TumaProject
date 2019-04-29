<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2;font-size:14px;padding:10px;width: 100%;text-align: center">
        <el-col :span="11" style="text-align: left" align="left">
          <div style="font-size:14px;text-align: left;padding-left: 10px">档案详情</div>
        </el-col>
        <el-col :span="6" style="text-align: right;padding-right: 20px" align="right"
                v-show="getButtonVial('archives:updateDetails')">
          <el-button type="text" style="margin: 0;padding: 0" @click="clickModify()">修改</el-button>
        </el-col>
        <el-col :span="7" style="text-align: left" align="left">
          <div style="font-size:14px;text-align: left;padding-left: 20px">最后出现</div>
        </el-col>
      </el-row>
      <div class="add-appdiv gray-form"
           style="border-top: none;border-radius: 0 0 4px 4px;padding: 15px;margin-bottom: 15px">
        <el-row style="margin: 0;padding: 0">
          <el-form :model="userInfo" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
            <el-col :span="5" align="center" style="text-align: center">
              <img :src="userInfo.faceUrl?userInfo.faceUrl:imgPath" :onerror="img404"
                   style="max-height: 130px;max-width: 130px;border-radius: 6px"/>
            </el-col>
            <el-col :span="6" align="left" style="text-align: left">
              <el-form-item label="姓名" align="left" style="margin: 0">
                {{userInfo.name ? userInfo.name : '--'}}
              </el-form-item>
              <el-form-item label="性别" align="left" style="margin: 0">
                {{userInfo.sex==0 ? '男' : userInfo.sex==1 ?'女':'--'}}
              </el-form-item>
              <el-form-item label="年龄段" align="left" style="margin: 0">
                {{userInfo.startAge>=0?userInfo.startAge==userInfo.endAge?(userInfo.startAge - 3)+
                '~'+(userInfo.startAge + 3):userInfo.startAge+'~'+userInfo.endAge:'--'}}
              </el-form-item>
              <!--<el-form-item label="身份证" align="left" style="margin: 0">-->
              <!--<span style="font-size: 15px;color:#000">{{userInfo.idCard ? userInfo.idCard : '&#45;&#45;'}}</span>-->
              <!--</el-form-item>-->
            </el-col>
            <el-col :span="6" align="left" style="text-align: left">
              <el-form-item label="ID" align="left" style="margin: 0">
                {{userInfo.faceId ? userInfo.faceId : '--'}}
              </el-form-item>
              <el-form-item label="入库时间" align="left" style="margin: 0">
                {{userInfo.timeStr ? userInfo.timeStr : '--'}}
              </el-form-item>
              <!--<el-form-item label="是否优质" align="left" style="margin: 0">-->
              <!--<span style="font-size: 15px;color:#000">{{userInfo.quality==1 ? '是' : '否'}}</span>-->
              <!--</el-form-item>-->
              <el-form-item label="备注" align="left" style="margin: 0">
                {{userInfo.remark ? userInfo.remark : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="7" align="right" style="border-left: 1px solid #D7D7D7;text-align: right;padding-left: 20px">
              <el-form-item label="采集时间" align="left" style="margin: 0">
                {{userInfo.lastTimeStr ? userInfo.lastTimeStr : '--'}}
              </el-form-item>
              <el-form-item label="采集场所" align="left" style="margin: 0">
                {{userInfo.lastPlaceName ? userInfo.lastPlaceName : '--'}}
              </el-form-item>
              <el-form-item label="采集地址" align="left" style="margin: 0">
                {{userInfo.lastArea ? userInfo.lastArea : '--'}}
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <el-row>
        <el-col :span="24" align="left" class="tab-card no">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="关联特征" name="first" style="padding-top: 10px"></el-tab-pane>
            <el-tab-pane label="IMSI记录" name="second" style="padding-top: 10px">
              <FetchIMSIRecords ref="imsi"></FetchIMSIRecords>
            </el-tab-pane>
            <el-tab-pane label="人脸记录" name="three" style="padding-top: 10px">
              <FetchImgRecords ref="img"></FetchImgRecords>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='first'">
        <el-row style="background: #F2F2F2">
          <el-col :span="12">
            <div style="font-size:14px;padding:10px 20px">当前关联的IMSI信息</div>
          </el-col>
          <el-col :span="12">
            <div style="font-size:14px;padding:10px 20px">疑似重点人员</div>
          </el-col>
        </el-row>
        <div class="add-appdiv" style="border-top: none;border-radius: 0 0 4px 4px;padding:0;margin-bottom:0">
          <el-row>
            <el-col :span="12" style="border-right:1px solid #D7D7D7">
              <el-table :data="imsiList" class="center-block" :height="tableHeight">
                <el-table-column align="left" prop="imsi" label="IMSI" min-width="120" max-width="150"
                                 :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" prop="ispDes" label="运营商" min-width="60" max-width="100"
                                 :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" prop="regional" label="IMSI归属地" min-width="100"
                                 max-width="150" :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" prop="fnIn" label="关联次数" min-width="80" max-width="100"
                                 :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" prop="weightDes" label="置信度" min-width="60"
                                 max-width="100" :formatter="formatterAddress"></el-table-column>
                <el-table-column align="left" label="操作" min-width="60" max-width="100">
                  <template slot-scope="scope">
                    <el-button type="text" @click="gotoPathLine(scope)" v-show="getButtonVial('route:query')">轨迹
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :span="12" v-bind:style="{padding:'0 10px',height:tableHeight+'px',overflowY: 'auto'}">
              <div class="person-item gray-form" v-if="persons.length>0">
                <el-row v-for="(item) in persons" :key="item.imsi" v-show="persons.length >0" class="bo-line"
                        @click.native="gotoVipPerson(item)" style="cursor: pointer">
                  <el-form :model="item" align="left" label-width="120px" label-position="right">
                    <el-col :span="3" align="left" style="text-align: left">
                      <img :src="item.faceUrl?item.faceUrl:imgPath" :onerror="img404"/>
                    </el-col>
                    <el-col :span="11" align="left" style="text-align: left">
                      <el-form-item label="姓名" style="margin:0;" align="left">
                        {{item.name?item.name:'--'}}
                      </el-form-item>
                      <el-form-item label="身份证" style="margin:0" align="left">
                        {{item.idCard?item.idCard:'--'}}
                      </el-form-item>
                      <el-form-item label="相似度" style="margin:0" align="left">
                        {{item.similarThreshold.toFixed(1)+'%'}}
                      </el-form-item>
                    </el-col>
                    <el-col :span="10" align="right" style="text-align: right">
                      <el-form-item label="所属名单" style="margin:0" align="left">
                        <span>{{item.blackClass?item.blackClass:'--'}}</span>
                      </el-form-item>
                    </el-col>
                  </el-form>
                </el-row>
              </div>
              <div v-else style="width:100%;color:#909399;font-size:14px;text-align:center;margin-top:15px">暂无数据</div>
            </el-col>
          </el-row>
        </div>
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
  import FetchImgRecords from './files/FetchImgRecords.vue';
  import FetchIMSIRecords from './files/FetchIMSIRecords.vue';
  import {formatDate, buttonValidator, getAreaLable} from "../../assets/js/util";
  import {
    nameValidator, numValid, mobileValidator, userCardValid,
    telphoneValidator, isNull
  } from "../../assets/js/api";

  export default {
    components: {FetchIMSIRecords, FetchImgRecords},
    data() {
      return {
        tableHeight: window.innerHeight - 425,
        activeItem: 'first',
        runModifyPerson: false,
        person: {},
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        selectedOptions2: [],
        faceId: this.$route.query.faceId || '',
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
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
      //进入重点人员档案
      gotoVipPerson(row) {
        if (row.faceId && row.resourceId) {
          let routeData = this.$router.resolve({
            path: '/vipDetail',
            query: {faceId: row.faceId, resourceId: row.resourceId}
          });
          window.open(routeData.href, '_blank');
        }
      },
      handleType(val) {
        if (this.activeItem == 'first') {
          this.getUserData();
          this.getPersons();
        } else if (this.activeItem == 'second') {
          this.$refs.imsi.getPlaces();
        } else {
          this.$refs.img.getPlaces();
          this.$refs.img.clearData();
        }
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

            if (data.data.imsiList && data.data.imsiList.length > 0) {
              this.imsiList = data.data.imsiList;
              this.imsiList.forEach((item) => {
                imsis.push(item.imsi);
              });
            }
            localStorage.setItem("pathUrl", JSON.stringify(this.userInfo.faceUrl));
            console.log(imsis);
            localStorage.setItem("pathImsi", JSON.stringify(imsis));
            localStorage.setItem("pathFace", JSON.stringify(faces));

            this.userInfo.timeStr = formatDate(new Date(data.data.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
            this.userInfo.area = data.data.areaCode ? getAreaLable(data.data.areaCode) : '--';
            this.userInfo.lastTimeStr = formatDate(new Date(data.data.lastAppearTime * 1000), 'yyyy-MM-dd hh:mm:ss');
            this.userInfo.lastPlaceName = data.data.lastAppearPlace.placeName;
            var detail = data.data.lastAppearPlace.areaCode ? getAreaLable(data.data.lastAppearPlace.areaCode) : '--';
            this.userInfo.lastArea = data.data.lastAppearPlace.detailAddress ? detail + data.data.lastAppearPlace.detailAddress : detail;
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      getPersons() {
        this.$post('person/listDoubtfulKeyPerson', {faceId: this.faceId},
          undefined, undefined, "login").then((data) => {
          if ("000000" === data.code) {
            if (data.data) {
              this.persons = data.data ? data.data : [];
            }
          } else if ("100000" === data.code) {//执行中
            setTimeout(() => {
              this.getPersons();
            }, 1000);
          } else {
            this.persons = [];
            this.$message.error(data.msg);
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      gotoPathLine(scope) {
        var qTime = [new Date((formatDate(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        localStorage.setItem("pathTime", JSON.stringify(qTime));
        let routeData = this.$router.resolve({path: '/pathLine', query: {imsi: 1, face: 0, idx: scope.$index}});
        window.open(routeData.href, '_blank');
      },
      //根据区域码找到对应的省市县编码
      getCode(code) {
        let arr = [];
        this.provinceList.forEach((province) => {
          if (province.subAreas) {
            province.subAreas.forEach((city) => {
              if (city.subAreas) {
                city.subAreas.forEach((country) => {
                  if (code === country.areaCode) {
                    arr = [province.areaCode, city.areaCode, country.areaCode];
                  }
                })
              } else {
                if (code === city.areaCode) {
                  arr = [province.areaCode, city.areaCode];
                }
              }
            })
          } else {
            if (code === province.areaCode) {
              arr = [province.areaCode];
            }
          }
        });
        return arr;
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'fnIn') {
          return row.fnIn === 0 ? 0 : row.fnIn;
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.handleType();
    }
  }
</script>
<style scoped>
  .person-item {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .person-item img {
    max-width: 100px;
    max-height: 100px;
    border-radius: 5px;
    text-align: left;
    margin-top: 12px;
  }

  .bo-line {
    border-bottom: 1px solid #ebeef5
  }

  .bo-line:last-child {
    border-bottom: none;
  }
</style>
