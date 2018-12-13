<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2">
        <el-col :span="8" align="left">
          <div style="font-size:14px;padding:10px 20px">图像抓拍记录</div>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px">
        <el-form :model="faceDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8" align="center">
              <img :src="faceDetail.senceImageUrl?faceDetail.senceImageUrl:imgPath2" :onerror="img2404"
                   style="max-width: 90%;border: 1px #D7D7D7 dashed;border-radius: 10px;max-height: 250px"/>
            </el-col>
            <el-col :span="8" align="left">
              <img :src="faceDetail.imageUrl?faceDetail.imageUrl:imgPath" :onerror="img404"
                   style="max-height:160px;max-width:160px;border: 1px #D7D7D7 dashed;border-radius: 8px"/>
              <el-form-item label="年龄段" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{faceDetail.age > 0 ? (faceDetail.age-3)+"~"+(faceDetail.age+3):'--'}}</span>
              </el-form-item>
              <el-form-item label="性别" align="left" style="margin: 0">
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
      <el-row>
        <el-col :span="16" align="left" class="tab-card no">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="疑似人员" name="person"></el-tab-pane>
            <el-tab-pane label="疑似IMSI" name="imsi"></el-tab-pane>
            <!--<el-tab-pane label="所有记录" name="list"></el-tab-pane>-->
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='person'" style="padding: 10px 0">
        <el-row v-loading="listLoading">
          <el-col :span="24">
            <div class="face-main">
              <div class="face-item" v-for="item in persons" :key="item.id" v-show="persons.length >0">
                <img :src="item.faceUrl?item.faceUrl:imgPath" :onerror="img404"/>
                <el-form :model="item" align="left" label-width="80px" label-position="right"
                         style="text-align: left">
                  <el-form-item label="档案ID" style="margin:0">
                    <!--<span-->
                    <!--style="font-size: 14px;color:#000;margin-right: 20px">{{item.faceId?item.faceId:'&#45;&#45;'}}</span>-->
                    <el-button type="text" @click="gotoPerson(item)" v-if="item.faceId">
                      {{item.faceId?item.faceId:'--'}}
                    </el-button>
                  </el-form-item>
                  <el-form-item label="关联IMSI" style="margin:0">
                    <span
                      style="font-size: 14px;color:#000">{{item.imsiList.length>0?item.imsiList[0].imsi:'--'}}</span>
                  </el-form-item>
                  <el-form-item style="margin:0">
                    <span style="font-size: 14px;color:#000;margin-right: 20px">
                      {{'置信度['+(item.imsiList.length>0&&item.imsiList[0].weight>=0?item.imsiList[0].weight/10:'--')+'%]'}} {{'关联次数['+(item.imsiList.length>0&&item.imsiList[0].fnIn>=0?item.imsiList[0].fnIn:'--')+']'}}</span>
                  </el-form-item>
                </el-form>
              </div>
              <span v-show="persons.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-show="activeItem=='list'">
        <el-row style="margin-top: 10px">
          <el-col :span="18" align="left">
            <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('common:face:listFaceTrace')">
              <el-form-item label="相似度" style="margin-bottom: 10px">
                <el-row>
                  <el-input-number v-model="query.startSimilar" controls-position="right" :min="0.1" :step="0.1"
                                   :max="query.endSimilar-1" style="width: 100px" size="medium"></el-input-number>
                  <span>~</span>
                  <el-input-number v-model="query.endSimilar" controls-position="right" :min="query.startSimilar+1"
                                   :max="99" style="width: 100px" size="medium" :step="0.1"></el-input-number>
                </el-row>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:queryd')">
                <el-select v-model="query.placeId" placeholder="选择场所" size="medium" filterable clearable>
                  <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                                start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                                :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                                :picker-options="pickerBeginDate">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" align="right" v-show="getButtonVial('route:query')&&false">
            <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="gotoPath()"
                       v-show="getButtonVial('common:face:listFaceTrace')">查看轨迹
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="list10" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="人员图像" prop="fileUrl" min-width="125" max-width="250">
            <template slot-scope="scope">
              <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath" :onerror="img404"
                   style="width: 90px;height:90px;border-radius: 6px"/>
            </template>
          </el-table-column>
          <el-table-column align="left" label="相似度" prop="similarThreshold" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="年龄段" prop="age" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="followTarget" width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="场所" prop="placeName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <!--<el-table-column align="left" label="操作" width="160">-->
          <!--<template slot-scope="scope">-->
          <!--<el-button type="text" @click="">查看</el-button>-->
          <!--</template>-->
          <!--</el-table-column>-->
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                         :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
        </div>
      </div>
      <div v-show="activeItem=='imsi'" style="margin-top: 10px;margin-bottom: 20px">
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
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        activeItem: 'person',
        qTime: '',
        imgPath: require('../../assets/img/icon_people.png'),
        imgPath2: require('../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        img2404: "this.onerror='';this.src='" + require('../../assets/img/icon_img.svg') + "'",
        id: this.$route.query.id || '',
        tableHeight: window.innerHeight - 460,
        imageId: this.$route.query.imageId || '',
        faceDetail: {},
        imsiList: [],
        persons: [],
        places: [],
        query: {size: 100},
        count: 0,
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        loading: {},
        sels: [],
        timeStamp: new Date().getTime(),
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date().getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
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
        if (this.activeItem === 'list') {
          this.isSearch = true;
          this.getData();
        } else {
          this.getPersons();
          this.isSearch = false;
        }
      },
      //进入人员档案
      gotoPerson(row) {
        if (row.faceId) {
          // this.$router.push({path: '/personnelFiles', query: {faceId: row.faceId}});
          let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.faceId}});
          window.open(routeData.href, '_blank');
        }
      },
      //获取图像详情
      getFaceDetail() {
        this.$post('archives/getFaceRecordById/' + this.imageId, {}).then((data) => {
          this.faceDetail = data.data;
          this.faceDetail.timeStr = formatDate(new Date(this.faceDetail.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          let code = (this.faceDetail.areaCode ? this.faceDetail.areaCode : this.faceDetail.cityCode ? this.faceDetail.cityCode : this.faceDetail.provinceCode ? this.faceDetail.provinceCode : 0);
          this.faceDetail.area = this.getAreaLable(code);
          this.getPersons();
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //根据人脸查找指定的对应人员
      getPersons() {
        this.listLoading = true;
        this.$post('common/listPersonByUrl', {
            type: "face", url: this.faceDetail.imageUrl + '?t=' + this.timeStamp
          },
          undefined, undefined, "login").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (data.data) {
              this.persons = data.data.personBOList ? data.data.personBOList : [];
              this.imsiList = data.data.imsiWeightBOList ? data.data.imsiWeightBOList : [];
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
      //查看轨迹
      gotoPath() {
        if (!this.qTime || this.qTime.length === 0) {
          this.$message.error('请选择时间范围');
          return;
        }
        let faces = [];
        this.sels.forEach((item) => {
          // if (this.faceId != item.faceId) {
          faces.push(item.faceId);
          // }
        });
        localStorage.setItem("pathFace", JSON.stringify(faces));
        localStorage.setItem("pathTime", JSON.stringify(this.qTime));
        // this.$router.push({path: '/pathLine', query: {face: 1}});
        let routeData = this.$router.resolve({path: '/pathLine', query: {face: 1}});
        window.open(routeData.href, '_blank');
      },
      //全选
      selsChange(sels) {
        this.sels = sels;
      },
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }

        this.listLoading = true;
        this.$post('common/face/listFaceTrace', this.query).then((data) => {
          if (this.query.pageTime && !this.isSearch) {
            this.list = this.list.concat(data.data);
          } else {
            this.list = data.data;
            this.page = 1;
            this.firstPage = 0
          }
          this.list10 = this.list;
          if (this.list.length - this.page * 10 >= 0) {
            this.list10 = this.list10.slice((this.page * 10 - 10), (this.page * 10));
          } else {
            this.list10 = this.list10.slice((this.page * 10 - 10), this.list.length);
          }
          this.count = this.list.length;
          if (this.list.length - this.firstPage === 100) {
            this.isFirst = false;
          } else {
            this.isFirst = true;
          }
          this.listLoading = false;
        }).catch((err) => {
          this.listLoading = false;
          this.list = [];
          this.list10 = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst &&
          (this.list.length % 100 === 0 || this.list.length === this.couple)) {
          this.firstPage = this.list.length;
          this.query.pageTime = this.list[this.list.length - 1].catchTime;
          this.getData();
        }
        this.list10 = this.list;
        if ((this.list.length - (index * 10)) >= 0) {
          this.list10 = this.list10.slice((index * 10 - 10), (index * 10));
        } else {
          this.list10 = this.list10.slice((index * 10 - 10), this.list.length);
        }
      },
      handleSizeChange(val) {
      },
      clearData() {
        this.list10 = [];
        this.query = {size: 100};
        this.isSearch = true;
        this.qTime = '';

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'weight') {
          return row.weight < 0 ? '--' : (row.weight / 10).toFixed(1) + '%';
        } else if (column.property === 'age' && column.property === 'fnIn') {
          return row[column.property] < 0 ? '--' : row[column.property];
        } else if (column.property === 'ispDes') {
          return row.ispDes == 0 ? '移动' : row.ispDes == 1 ? '联通' : row.ispDes == 2 ? '电信' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //告警场所
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
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
      }
    },
    mounted() {
      this.getPlaces();
      this.getFaceDetail();
    }
  }
</script>
