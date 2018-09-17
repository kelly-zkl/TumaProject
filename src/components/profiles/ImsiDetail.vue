<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2">
        <el-col :span="8" align="left">
          <div style="font-size:14px;padding:10px 20px">IMSI记录信息</div>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;padding: 10px 30px;border-radius: 0 0 4px 4px">
        <el-form :model="imsiDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8">
              <el-form-item label="IMSI信息" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.imsi ? imsiDetail.imsi : '--'}}</span>
              </el-form-item>
              <el-form-item label="运营商" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">
                  {{imsiDetail.isp == 0 ? '移动' : imsiDetail.isp == 1 ? '联通' : imsiDetail.isp == 2 ? '电信' : '未知'}}
                </span>
              </el-form-item>
              <el-form-item label="归属地" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.regional ? imsiDetail.regional : '--'}}</span>
              </el-form-item>
              <el-form-item label="网络类型" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.netType ? imsiDetail.netType : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="抓取时间" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.timeStr ? imsiDetail.timeStr : '--'}}</span>
              </el-form-item>
              <el-form-item label="抓取地区" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.area ? imsiDetail.area : '--'}}</span>
              </el-form-item>
              <el-form-item label="抓取地点" align="left" style="margin: 0">
                <span
                  style="font-size: 15px;color:#000">{{imsiDetail.detailAddress ? imsiDetail.detailAddress : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="抓取场所" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.place ? imsiDetail.place : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备标识" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.deviceName ? imsiDetail.deviceName : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备ID" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.deviceId ? imsiDetail.deviceId : '--'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="关联人员" name="person"></el-tab-pane>
            <el-tab-pane label="侦码记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='person'" style="padding: 20px">
        <div class="face-main">
          <div class="face-item" v-for="item in persons" :key="item.id" v-show="persons.length >0">
            <img :src="item.fileUrl?item.fileUrl:imgPath"/>
            <el-form :model="item" align="left" label-width="60px" label-position="right"
                     style="position: absolute;top: 25px;left:180px">
              <el-form-item label="档案ID" style="margin:0">
                <span style="font-size: 15px;color:#000;margin-right: 20px">{{item.personId}}</span>
                <el-button type="text">查看人员</el-button>
              </el-form-item>
              <el-form-item label="IMSI" style="margin:0">
                <span style="font-size: 15px;color:#000">{{item.imsi}}</span>
              </el-form-item>
              <el-form-item label="手机号" style="margin:0">
                <span style="font-size: 15px;color:#000">{{item.phone}}</span>
              </el-form-item>
            </el-form>
          </div>
          <span v-show="persons.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
        </div>
      </div>
      <div v-show="activeItem=='list'">
        <el-row style="margin-top: 15px">
          <el-col :span="18" align="left">
            <el-form :inline="true" :model="query" align="left"
                     v-show="getButtonVial('common:imsi:listImsiRecordBySpecialImsi')">
              <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
                <el-select v-model="query.placeId" placeholder="选择场所" size="medium" filterable clearable>
                  <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                                start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                                :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                                :picker-options="pickerBeginDate">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="gotoPath()"
                       v-show="getButtonVial('place:query')">查看轨迹
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="imsiList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="catchTime" width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取场所" prop="placeName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="isp" label="运营商" max-width="150" min-width="100"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="netType" label="网络类型" max-width="150" min-width="100"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="归属地" max-width="200" min-width="150" prop="regional"
                           :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
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
        provinceList: json,
        imgPath: require('../../assets/img/icon_people.png'),
        id: this.$route.query.id || '',
        imsi: this.$route.query.imsi || '',
        caseTime: '',
        imsiDetail: {},
        imsiList: [],
        persons: [],
        places: [],
        query: {page: 1, size: 10},
        count: 0,
        statuses: [{label: '全部', value: ''}, {label: '待处理', value: '1'}, {label: '处理中', value: '2'},
          {label: '已处理', value: '3'}, {label: '误报', value: '4'}],
        sels: [],
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
      handleType(val) {
        if (this.activeItem === 'person') {
          this.getPersons();
        } else {
          this.getData();
        }
      },
      //获取imsi详情
      getImsiDetail() {
        this.$post('archives/getImsiRecordById/' + this.id, {}).then((data) => {
          this.imsiDetail = data.data;
          this.imsiDetail.timeStr = formatDate(new Date(this.imsiDetail.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          let code = (this.imsiDetail.areaCode ? this.imsiDetail.areaCode : this.imsiDetail.cityCode ? this.imsiDetail.cityCode : this.imsiDetail.provinceCode ? this.imsiDetail.provinceCode : 0);
          if (code != 0) {
            this.imsiDetail.area = this.getAreaLable(code);
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //根据imsi查找指定的对应人员
      getPersons() {
        this.$post('common/imsi/listFace/' + this.imsi, {}).then((data) => {
          this.persons = data.data;
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //查看轨迹
      gotoPath() {
        this.$router.push("/pathLine");
      },
      //全选
      selsChange(sels) {
        this.sels = sels;
      },
      getData() {
        if (!!this.caseTime) {
          this.query.startTime = this.caseTime[1] / 1000;
          this.query.endTime = this.caseTime[0] / 1000;
        }

        this.query.imsi = this.imsi;
        this.listLoading = true;
        this.$post('common/imsi/listImsiRecordBySpecialImsi', this.query).then((data) => {
          this.imsiList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.imsiList = [];
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.caseTime = '';
        this.getData();
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'catchTime') {
          return row.catchTime ? formatDate(new Date(row.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '未知';
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
        this.provinceList.forEach((province) => {
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
      this.getImsiDetail();
      this.getPersons();
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
    width: 43%;
    height: 132px;
    border: 1px #D7D7D7 solid;
    padding: 20px;
    margin-bottom: 30px;
    position: relative;
  }

  .face-item img {
    position: absolute;
    left: 20px;
    width: 130px;
    height: 130px;
    border: 1px #D7D7D7 dashed;
    border-radius: 8px;
    text-align: left;
  }

  .face-item:nth-child(odd) {
    margin-right: 30px;
  }
</style>
