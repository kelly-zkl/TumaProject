<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2">
        <el-col :span="8" align="left">
          <div style="font-size:14px;padding:10px 20px">
            当前状态：{{imsiDetail.status==0?'待处理':imsiDetail.status==1?'处理中':imsiDetail.status==2?'已处理':imsiDetail.status==3?'误报':''}}
          </div>
        </el-col>
        <el-col :span="8" :offset="8" align="right" style="text-align: right" v-if="imsiDetail.status==0">
          <el-button type="primary" size="medium" @click=changeStatus(2)>已处理</el-button>
          <el-button type="primary" size="medium" @click=changeStatus(3)>误报</el-button>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;padding: 10px 30px;border-radius: 0 0 4px 4px">
        <el-form :model="imsiDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8">
              <el-form-item label="IMSI信息" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{imsiDetail.imsi ? imsiDetail.imsi : '566262'}}</span>
              </el-form-item>
              <el-form-item label="运营商" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">
                  {{imsiDetail.isp == 0 ? '移动' : imsiDetail.isp == 1 ? '联通' : imsiDetail.isp == 2 ? '电信' : '--'}}
                </span>
              </el-form-item>
              <el-form-item label="IMSI归属地" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{imsiDetail.regional ? imsiDetail.regional : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="告警时间" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{imsiDetail.timeStr ? imsiDetail.timeStr : '--'}}</span>
              </el-form-item>
              <el-form-item label="场所地区" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{imsiDetail.area ? imsiDetail.area : '--'}}</span>
              </el-form-item>
              <el-form-item label="场所地点" align="left" style="margin: 0;text-align: left">
                <span
                  style="font-size: 15px;color:#000">{{imsiDetail.detailAddress ? imsiDetail.detailAddress : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="告警场所" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{imsiDetail.placeName ? imsiDetail.placeName : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备标识" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{imsiDetail.deviceName ? imsiDetail.deviceName : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备ID" align="left" style="margin: 0;text-align: left">
                <span style="font-size: 15px;color:#000">{{imsiDetail.deviceId ? imsiDetail.deviceId : '--'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="关联人员" name="person"></el-tab-pane>
            <el-tab-pane label="侦码记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='person'" style="padding: 20px 0">
        <el-row v-loading="listLoading" style="margin: 0;padding: 0">
          <el-col :span="24" style="margin: 0;padding: 0">
            <div class="face-main">
              <div class="face-item" v-for="item in persons" :key="item.id" v-show="persons.length >0">
                <img :src="item.faceUrl?item.faceUrl:imgPath"/>
                <el-form :model="item" align="left" label-width="80px" label-position="right"
                         style="position: absolute;top: 15px;left:150px;text-align: left">
                  <el-form-item label="档案ID" style="margin:0">
                    <span
                      style="font-size: 15px;color:#000;margin-right: 20px">{{item.personId?item.personId:'--'}}</span>
                    <el-button type="text" @click="gotoPerson(item)" v-if="item.personId">查看人员</el-button>
                  </el-form-item>
                  <el-form-item label="关联次数" style="margin:0">
                    <span style="font-size: 15px;color:#000">{{item.fnIn<0?'--':item.fnIn}}</span>
                  </el-form-item>
                  <el-form-item label="置信度" style="margin:0">
                    <span style="font-size: 15px;color:#000">{{item.weight?item.weight/10+'%':'--'}}</span>
                  </el-form-item>
                </el-form>
              </div>
              <span v-show="persons.length==0" style="width:100%;color: #909399;font-size: 14px">暂无数据</span>
              <el-row style="width: 100%" v-if="persons.length>=num">
                <el-col :span="24" style="text-align: center" align="center">
                  <el-button type="text" @click="loadMore()">加载更多</el-button>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-show="activeItem=='list'">
        <el-row style="margin-top: 10px">
          <el-col :span="18" align="left" style="text-align: left">
            <el-form :inline="true" :model="query" align="left" style="text-align: left"
                     v-show="getButtonVial('common:imsi:listImsiRecordBySpecialImsi')">
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
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
          <el-col :span="6" align="right" style="text-align: right" v-show="getButtonVial('route:query')">
            <el-button type="primary" size="medium" @click="gotoPath()"
                       v-show="getButtonVial('warning:getImsiWarning')">查看轨迹
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="uptime" min-width="200"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取场所" prop="placeName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                         :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
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
        qTime: '',
        imsiDetail: {},
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
        num: 10,
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
      handleType(val, event) {
        if (this.activeItem === 'person') {
          this.getPersons();
          this.isSearch = false;
        } else {
          this.isSearch = true;
          this.getData();
        }
      },
      //关联人员加载更多
      loadMore() {
        this.num += 10;
        this.getPersons();
      },
      //进入人员档案
      gotoPerson(row) {
        if (row.personId) {
          // this.$router.push({path: '/personnelFiles', query: {faceId: row.personId}});
          let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.personId}});
          window.open(routeData.href, '_blank');
        }
      },
      changeStatus(status) {
        this.$post('warning/dealWithWarningById', {ids: [this.id], status: status}, "处理成功").then((data) => {
          this.getImsiDetail();
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //获取imsi详情
      getImsiDetail() {
        this.$post('warning/getImsiWarning/' + this.id, {}).then((data) => {
          this.imsiDetail = data.data;
          this.imsiDetail.timeStr = formatDate(new Date(this.imsiDetail.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          let code = (this.imsiDetail.areaCode ? this.imsiDetail.areaCode : this.imsiDetail.cityCode ? this.imsiDetail.cityCode : this.imsiDetail.provinceCode ? this.imsiDetail.provinceCode : 0);
          if (code != 0) {
            this.imsiDetail.area = this.getAreaLable(code);
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
        let imsis = [this.imsi];

        sessionStorage.setItem("pathImsi", JSON.stringify(imsis));
        sessionStorage.setItem("pathTime", JSON.stringify(this.qTime));
        // this.$router.push({path: '/pathLine', query: {imsi: 1}});
        let routeData = this.$router.resolve({path: '/pathLine', query: {imsi: 1}});
        window.open(routeData.href, '_blank');
      },
      //根据imsi查找指定的对应人员
      getPersons() {
        this.listLoading = true;
        this.$post('common/imsi/listFace', {imsi: this.imsi, num: this.num}).then((data) => {
          this.listLoading = false;
          if (data.data && data.data.length > 0) {
            this.persons = data.data;
          }
        }).catch((err) => {
          this.listLoading = false;
          this.$message.error(err);
        });
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
        this.query.imsi = this.imsi;
        this.$post('common/imsi/listImsiRecordBySpecialImsi', this.query).then((data) => {
          if (this.query.pageTime && !this.isSearch) {
            this.list = this.list.concat(data.data);
          } else {
            this.list = data.data ? data.data : [];
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
          this.list = [];
          this.list10 = [];
          this.listLoading = false;
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
        if (column.property === 'status') {
          return row.status === 0 ? '待处理' : row.taskStatus === 1 ? '处理中' : row.taskStatus === 2 ? '已处理' : row.taskStatus === 3 ? '误报' : '--';
        } else if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
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
