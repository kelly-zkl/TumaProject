<template>
  <div>
    <section class="content">
      <el-row
        style="background: #F2F2F2;font-size:14px;padding:10px;width: 100%;text-align: center;border: 1px solid #D7D7D7">
        <el-col :span="16" style="text-align: left" align="left">
          <div style="font-size:14px;text-align: left;padding-left: 10px">档案详情</div>
        </el-col>
        <el-col :span="8" style="text-align: left" align="left">
          <div style="font-size:14px;text-align: left;padding-left: 20px">最后出现</div>
        </el-col>
      </el-row>
      <div class="add-appdiv gray-form"
           style="border-top: none;border-radius: 0 0 4px 4px;padding: 15px;margin-bottom: 15px">
        <el-row style="margin: 0;padding: 0">
          <el-form :model="carInfo" style="margin: 0;padding: 0" labelPosition="right" label-width="110px">
            <el-col :span="8" align="left" style="text-align: left">
              <el-form-item label="车牌号码" align="left" style="margin: 0">
                {{carInfo.carLicense ? carInfo.carLicense : '--'}}
              </el-form-item>
              <el-form-item label="车辆类型" align="left" style="margin: 0">
                {{carInfo.typeName}}
              </el-form-item>
              <el-form-item label="车辆品牌" align="left" style="margin: 0">
                {{carInfo.brand ? carInfo.brand : '--'}}
              </el-form-item>
              <el-form-item label="检验有校期" align="left" style="margin: 0">
                {{carInfo.verifyDate ? carInfo.verifyDate : '--'}}
              </el-form-item>
              <el-form-item label="发证机关" align="left" style="margin: 0">
                {{carInfo.carLicenseOffice ? carInfo.carLicenseOffice : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8" align="left" style="text-align: left;border-right: 1px solid #D7D7D7">
              <el-form-item label="机动车所有人" align="left" style="margin: 0">
                {{carInfo.possessor ? carInfo.possessor : '--'}}
              </el-form-item>
              <el-form-item label="证件类型" align="left" style="margin: 0">
                {{carInfo.papersType ? carInfo.papersType : '--'}}
              </el-form-item>
              <el-form-item label="证件号码" align="left" style="margin: 0">
                {{carInfo.papersCode ? carInfo.papersCode : '--'}}
              </el-form-item>
              <el-form-item label="住址" align="left" style="margin: 0">
                {{carInfo.possessorAddress ? carInfo.possessorAddress : '--'}}
              </el-form-item>
              <el-form-item label="一车一档ID" align="left" style="margin: 0">
                {{carInfo.carDocId ? carInfo.carDocId : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8" align="right" style="text-align: right;padding-left: 20px">
              <el-form-item label="采集时间" align="left" style="margin: 0">
                {{carInfo.lastTimeStr ? carInfo.lastTimeStr : '--'}}
              </el-form-item>
              <el-form-item label="采集场所" align="left" style="margin: 0">
                {{carInfo.lastPlaceName ? carInfo.lastPlaceName : '--'}}
              </el-form-item>
              <el-form-item label="采集地址" align="left" style="margin: 0">
                {{carInfo.lastArea ? carInfo.lastArea : '--'}}
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <el-row>
        <el-col :span="24" align="left" class="tab-card no">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="关联特征" name="imsi" style="padding-top: 10px"></el-tab-pane>
            <el-tab-pane label="过车记录" name="car" style="padding-top: 10px">
              <FetchCarRecords ref="car"></FetchCarRecords>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='imsi'">
        <el-table :data="imsiList" class="center-block">
          <el-table-column label="关联的IMSI信息">
            <el-table-column align="left" prop="imsi" label="IMSI" min-width="120" max-width="150"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="ispDes" label="运营商" min-width="60" max-width="100"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="regional" label="IMSI归属地" min-width="100"
                             max-width="150" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="relevancy" label="置信度" min-width="80"
                             max-width="100" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="操作" min-width="100" max-width="120">
              <template slot-scope="scope">
                <el-button type="text" @click="gotoPathLine(scope)" v-show="getButtonVial('route:query')">轨迹
                </el-button>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>
<script>
  import FetchCarRecords from './FetchCarRecords.vue';
  import {formatDate, buttonValidator, getAreaLable, decryData} from "../../assets/js/util";

  export default {
    components: {FetchCarRecords},
    data() {
      return {
        activeItem: 'imsi', bigUrl: '', selectedOptions2: [],
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        carId: this.$route.query.carId || '',
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        carInfo: {}, imsiList: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val) {
        if (this.activeItem == 'imsi') {
          this.getImsiList();
        } else if (this.activeItem == 'car') {
          this.$nextTick(() => {
            this.$refs.car.getPlaces();
            this.$refs.car.clearData();
          });
        }
      },
      //获取关联IMSI
      getImsiList() {
        this.$post('car/imsiList/' + this.carId, {}).then((data) => {
          if ("000000" === data.code) {
            let imsis = [];
            this.imsiList = data.data ? data.data : [];

            if (data.data && data.data.length > 0) {
              this.imsiList.forEach((item) => {
                imsis.push(item.imsi);
              });
            }
            localStorage.setItem("pathImsi", JSON.stringify(imsis));
          }
        }).catch((err) => {
          this.imsiList = [];
          this.$message.error(err);
        });
      },
      //档案详情
      getCarData() {
        this.$post('car/detail/' + this.carId, {}).then((data) => {
          if ('000000' === data.code) {
            this.carInfo = data.data;
            // localStorage.setItem("pathUrl", JSON.stringify(this.carInfo.faceUrl));
            let typeName = '--';
            for (let item of this.carTypes) {
              if (item.code == this.carInfo.type) {
                typeName = item.codeName;
                break;
              }
            }
            this.carInfo.typeName = typeName;
            this.carInfo.lastTimeStr = formatDate(new Date(data.data.lastCatchTime), 'yyyy-MM-dd hh:mm:ss');
            this.carInfo.verifyDate = formatDate(new Date(data.data.verifyEndDate), 'yyyy-MM-dd');
            this.carInfo.lastPlaceName = data.data.lastAppearPlace.placeName;
            let detail = data.data.lastAppearPlace.areaCode ? getAreaLable(data.data.lastAppearPlace.areaCode) : '--';
            this.carInfo.lastArea = data.data.lastAppearPlace.detailAddress ? detail + data.data.lastAppearPlace.detailAddress : detail;
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      gotoPathLine(scope) {
        let qTime = [new Date((formatDate(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        localStorage.setItem("pathTime", JSON.stringify(qTime));
        let query = {imsi: 1, car: 0, idx: scope.$index};
        let routeData = this.$router.resolve({path: '/pathLine', query: query});
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
        if (column.property === 'relevancy') {
          return row[column.property] < 0 ? '--' : (row[column.property] * 100).toFixed(1) + '%';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getCarType() {
        if (this.getButtonVial('car:book:liuzhou')) {
          this.$post('/car/book/liuzhou', {}).then((data) => {
            this.carTypes = data.data ? data.data : [];
          });
        }
        this.getCarData();
      }
    },
    mounted() {
      this.getCarType();
      this.handleType();
    }
  }
</script>
