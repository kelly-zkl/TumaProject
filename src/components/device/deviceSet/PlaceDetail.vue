<template>
  <div>
    <section class="content">
      <h5 class="add-label" style="margin-top: 0">场所信息</h5>
      <div class="add-appdiv">
        <el-row>
          <el-col :span="12" align="left" style="text-align: left">
            <el-form :model="placeDetail" style="margin: 0;padding: 0" labelPosition="right"
                     label-width="100px">
              <el-form-item label="场所名称" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{placeDetail.placeName ? placeDetail.placeName : '--'}}</span>
              </el-form-item>
              <el-form-item label="场所编码" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{placeDetail.placeCode ? placeDetail.placeCode : '--'}}</span>
              </el-form-item>
              <el-form-item label="场所类型" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{placeDetail.placeTypeName ? placeDetail.placeTypeName : '--'}}</span>
              </el-form-item>
              <el-form-item label="地区" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{placeDetail.area ? placeDetail.area : '--'}}</span>
              </el-form-item>
              <el-form-item label="详细地址" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{placeDetail.placeName ? placeDetail.placeName : '--'}}</span>
              </el-form-item>
              <el-form-item label="经纬度" align="left" style="margin: 0">
                <span
                  style="font-size: 15px;color:#000">{{'[经]'+placeDetail.longitude+',[纬]' +placeDetail.latitude}}</span>
              </el-form-item>
              <el-form-item label="所属组织" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{placeDetail.groupName ? placeDetail.groupName : '--'}}</span>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12" align="left" style="text-align: left">
            <div style="width: 500px;height: 270px" id="placeMap"></div>
          </el-col>
        </el-row>
      </div>
      <h5 class="add-label" style="margin-top: 0">已安装设备</h5>
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="相机设备" name="camera"></el-tab-pane>
            <el-tab-pane label="侦码设备" name="device"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="center-block" v-show="activeItem=='camera'">
        <el-row>
          <el-col :span="24" align="left">
            <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('camera:query')">
              <el-form-item style="margin-bottom: 10px">
                <el-input v-model="query.cameraCode" placeholder="相机编码" size="medium" :maxlength=30></el-input>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                             v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
                </el-cascader>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" size="medium" @click="query.page=1;getCamera()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-table :data="cameraList" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="相机编码" prop="cameraCode" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="name" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="相机状态" prop="status" min-width="120"
                           max-width="150" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="安装地区" prop="areaCode" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="详细地址" prop="detailAddress" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="安装场所" prop="placeName" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="center-block" v-show="activeItem=='device'">
        <el-form :inline="true" :model="query" align="left">
          <el-row>
            <el-col :span="24" align="left">
              <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('device:query')">
                <el-input placeholder="设备名称/ID" v-model="query.deviceName" :maxlength="30"
                          @change="changeDevice" size="medium"></el-input>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                             v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
                </el-cascader>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="query.deviceType" placeholder="全部类型" size="medium" filterable clearable>
                  <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="query.deviceForm" placeholder="全部形态" size="medium" filterable clearable>
                  <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" @click.stop="query.page=1;getDevice()" size="medium">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button @click.stop="clearData()" size="medium">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-table :data="deviceList" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备标识" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="placeName" label="安装场所" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceTypeVal" label="类型" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceFormVal" label="形态" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="detailAddress" label="位置" min-width="180" max-width="300"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="lineStatus" label="在线状态" min-width="100"
                           max-width="120"></el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         background :page-sizes="[10, 15, 20, 30]" :page-size="query.size"
                         layout="total, sizes, prev, pager, next, jumper" :total="count"></el-pagination>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import json from '../../../assets/city.json';
  import axios from "axios";
  import {globalValidExcel, noSValidator, noValidator} from "../../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        placeId: this.$route.query.id || '',
        activeItem: 'camera',
        query: {page: 1, size: 10},
        placeDetail: {},
        provinceList: json,
        props: {value: 'o', label: 'n', children: 'c'},
        areaList: [],
        count: 0,
        listLoading: false,
        deviceList: [],
        cameraList: [],
        deviceForms: [],
        deviceTypes: [],
        intervalid: null,
        serviceTypes: [{value: '0', label: '网吧'}, {value: '1', label: '旅店宾馆类（住宿服务场所）'},
          {value: '2', label: '图书馆阅览室'}, {value: '3', label: '电脑培训中心类'}, {value: '4', label: '娱乐场所类'},
          {value: '5', label: '交通枢纽'}, {value: '6', label: '公共交通工具'}, {value: '7', label: '餐饮服务场所'},
          {value: '8', label: '金融服务场所'}, {value: 'A', label: '购物场所'}, {value: 'B', label: '公共服务场所'},
          {value: 'C', label: '文化服务场所'}, {value: 'D', label: '公共休闲场所'}, {value: '9', label: '其他'}]
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val) {
        this.query = {page: 1, size: 10};
        this.areaList = [];
        if (this.activeItem == 'camera') {
          this.getCamera();
        } else {
          this.getDevice();
          this.getDeviceStatus();
          this.statusTask();
        }
      },
      getPlaceDetail() {
        this.$post('place/get/' + this.placeId, {}).then((data) => {
          if ('000000' === data.code) {
            this.placeDetail = data.data;
            this.placeDetail.area = data.data.areaCode ? this.getAreaLable(data.data.areaCode) : '--';
            this.placeDetail.placeTypeName = this.getPlaceType(data.data.placeType);
            this.setPlaceMap();
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      setPlaceMap() {
        var map = new BMap.Map("placeMap");
        map.disableScrollWheelZoom();
        map.disableDragging();
        map.disableDoubleClickZoom();
        var point = new BMap.Point(this.placeDetail.longitude, this.placeDetail.latitude);
        map.centerAndZoom(point, 15);
        var marker = new BMap.Marker(point);
        map.addOverlay(marker);
        var content = '经度：' + this.placeDetail.longitude + '<br/>纬度：' + this.placeDetail.latitude;
        var infoWindow = new BMap.InfoWindow(content, {
          width: 220, height: 70, title: "坐标", offset: new BMap.Size(0, -10)
        });  // 创建信息窗口对象
        map.openInfoWindow(infoWindow, point); //开启信息窗口
        function openInfo(content, e) {
          map.openInfoWindow(infoWindow, point); //开启信息窗口
        }

        marker.addEventListener("click", function (e) {
            openInfo(content, e)
          }
        );
      },
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        this.query.provinceCode = '';
        this.query.cityCode = '';
        this.query.areaCode = '';
        if (value.length === 1) {
          this.query.provinceCode = value[0];
        } else if (value.length === 2) {
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.areaCode = value[2];
        } else if (value.length === 4) {
          this.query.areaCode = value[2];
        }
      },
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceTypes = data.data;
          }
        });

        this.$post('device/get/deviceForm').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceForms = data.data;
          }
        });
      },
      //定时刷新设备的在线状态
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getDeviceStatus();
          }, 5000);
        }
      },
      changeDevice(val) {
        if (noSValidator(val)) {
          val = val.substr(0, val.length - 2);
          this.$message.error('请输入正确的设备名称/ID');
        }
      },
      //获取设备的在线状态
      getDeviceStatus() {
        if (this.deviceList.length > 0) {
          let deviceIds = [];
          this.deviceList.forEach((device) => {
            deviceIds.push(device.deviceId);
          });
          axios.post("device/get/lineStatus", deviceIds).then((res) => {
            let data = res.data;
            if (res.status == 200) {
              this.deviceList.forEach((device) => {
                if (data[device.deviceId] == 0) {
                  this.$set(device, 'lineStatus', "离线");//在数组中增加属性
                } else if (data[device.deviceId] == 1) {
                  this.$set(device, 'lineStatus', "在线");//在数组中增加属性
                } else {
                  this.$set(device, 'lineStatus', "未知");//在数组中增加属性
                }
              });
            } else {
              this.deviceList.forEach((device) => {
                this.$set(device, 'lineStatus', "未知");//在数组中增加属性
              });
            }
          });
        }
      },
      //获取设备列表
      getDevice() {
        if (this.query.deviceName) {
          if (noSValidator(this.query.deviceName)) {
            this.$message.error('请输入正确的设备名称/ID');
            return;
          }
        }
        this.listLoading = true;
        this.query.placeId = this.placeId;
        this.$post("device/query", this.query).then((data) => {
          this.deviceList = data.data.list;
          this.count = data.data.count;
          this.getDeviceStatus();
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.deviceList = [];
          this.$message.error(err);
        });
      },
      //获取相机设备列表
      getCamera() {
        if (this.query.cameraCode) {
          if (noSValidator(this.query.cameraCode)) {
            this.$message.error('请输入正确的设备名称/ID');
            return;
          }
        }
        this.listLoading = true;
        this.query.placeId = this.placeId;
        this.$post("camera/query", this.query).then((data) => {
          this.cameraList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.cameraList = [];
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.areaList = [];
        if (this.activeItem == 'camera') {
          this.getCamera();
        } else {
          this.getDevice();
        }
      },
      pageChange(index) {
        this.query.page = index;
        if (this.activeItem == 'camera') {
          this.getCamera();
        } else {
          this.getDevice();
        }
      },
      handleSizeChange(val) {
        this.query.size = val;
        if (this.activeItem == 'camera') {
          this.getCamera();
        } else {
          this.getDevice();
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row.status === 0 ? '正常' : row.status === 1 ? '故障' : row.status === 2 ? '已下线' : '--';
        } else if (column.property === 'latitude') {
          return row.latitude && row.longitude ? row.latitude + ',' + row.longitude : '--';
        } else if (column.property === 'placeType') {
          return this.getPlaceType(row.placeType);
        } else if (column.property === 'areaCode') {
          return row.areaCode ? this.getAreaLable(row.areaCode) : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getPlaceType(val) {
        for (let item of this.serviceTypes) {
          if (item.value === val) {
            return item.label;
          }
        }
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
      this.getPlaceDetail();
      this.getDeviceTypeAndForm();
      this.getCamera();
    }
  }
</script>
