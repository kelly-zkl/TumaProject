<template>
  <div style="padding:10px 20px 10px 30px">
    <el-row :gutter="30">
      <el-col :span="15" style="background: #21206C;border-radius: 6px;padding: 0">
        <el-row style="border-bottom: 3px #080652 solid;height: 60px;line-height: 60px">
          <el-col :span="24">
            <span v-bind:class="activeItem== 'device'?'map-tap-active':'map-tap'"
                  @click="handleType('device')">设备分布实况</span>
            <span v-bind:class="activeItem== 'data'?'map-tap-active':'map-tap'"
                  @click="handleType('data')">实时数据热力图</span>
          </el-col>
        </el-row>
        <div v-show="activeItem== 'device'">
          <div id="devicemap" style="width:100%;height: 551px;display: block"></div>
          <div style="border-top: 3px #080652 solid;padding-bottom: 10px;display: block">
            <el-row style="border-bottom: 1px #3D3D8D solid">
              <el-col :span="24" align="left">
                <span class="header-title" style=" height: 50px;line-height: 50px">设备实况</span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <div id="camera" style="width: 300px;height: 180px"></div>
              </el-col>
              <el-col :span="12">
                <div id="device" style="width: 300px;height: 180px"></div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div v-show="activeItem== 'data'">
          <div id="dataheat" style="display: block;width:100%; height: 501px"></div>
          <div style="display: block;border-top: 3px #080652 solid;padding-bottom: 10px">
            <el-row style="border-bottom: 1px #3D3D8D solid">
              <el-col :span="24" align="left">
                <span class="header-title" style=" height: 50px;line-height: 50px">图码抓取数据</span>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8" align="center">
                <div
                  style="background: #060450;border-radius: 6px;height: 60px;width: 160px; margin-top: 20px;padding: 15px 20px">
                  <div style="color: #fff;font-size: 14px">今日抓取IMSI</div>
                  <br/>
                  <div style="color: #fff;font-size: 20px">{{addImsiCount}}<span
                    style="color: #fff;font-size: 14px">条</span></div>
                </div>
                <div
                  style="background: #060450;border-radius: 6px;height: 60px;width: 160px;margin-top: 20px;padding: 15px 20px">
                  <div style="color: #fff;font-size: 14px">今日抓取图像</div>
                  <br/>
                  <div style="color: #fff;font-size: 20px">{{addFaceCount}}<span
                    style="color: #fff;font-size: 14px">条</span></div>
                </div>
              </el-col>
              <el-col :span="16" align="center">
                <div id="imsi" style="width: 500px;height: 230px"></div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
      <el-col :span="9">
        <!--今日告警 柱状图-->
        <div style="display: block;background: #21206C;border-radius: 6px;height: 400px">
          <el-row style="border-bottom: 1px #3D3D8D solid">
            <el-col :span="12" align="left">
              <span class="header-title">今日告警</span>
            </el-col>
            <el-col :span="12" align="right">
              <span class="header-content">{{warningCount}}</span>
              <span class="header-unit">次</span>
            </el-col>
          </el-row>
          <div id="warning" style="height: 300px;padding: 10px 20px"></div>
        </div>
        <!--今日图码碰撞 列表-->
        <div style="display: block;background: #21206C;border-radius: 6px;height: 440px;margin-top: 15px">
          <el-row style="border-bottom: 1px #3D3D8D solid">
            <el-col :span="12" align="left">
              <span class="header-title">今日图码碰撞</span>
            </el-col>
            <el-col :span="12" align="right">
              <span class="header-content">{{collCount}}</span>
              <span class="header-unit">次</span>
            </el-col>
          </el-row>
          <div class="overview">
            <el-table :data="imgList" :header-cell-style="{background:'#100E5A'}" stripe>
              <el-table-column align="left" label="图像" style="align-content: center" min-width="90" max-width="200">
                <template slot-scope="scope">
                  <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath" class="user-img"/>
                </template>
              </el-table-column>
              <el-table-column align="left" label="IMSI" prop="imsiList" min-width="140" max-width="200">
                <template slot-scope="scope">
                  <div v-for="item in scope.row.imsiList">
                    <span>{{item.imsi}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="left" label="置信度" prop="imsiList" min-width="70" max-width="250">
                <template slot-scope="scope">
                  <div v-for="item in scope.row.imsiList">
                    <span>{{item.weight / 10 + '%'}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="left" label="碰撞时间" prop="uptime" min-width="160" max-width="200"
                               :formatter="formatterAddress"></el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import echarts from "echarts";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'device',
        imgList: [],
        mapData: [],//设备实况数据
        deviceChart: null,//设备实况的eCharts
        deviceMap: null,//设备地图
        mapPoint: null,//设备实况地图的中心点
        mapZoom: 12,//设备实况地图的放大倍数
        devicePie: {//相机设备和侦码设备的饼状图数据
          device1: {count: 0, data: [{value: 0, name: '在线'}, {value: 0, name: '离线'}]},
          device2: {count: 0, data: [{value: 0, name: '在线'}, {value: 0, name: '离线'}]}
        },
        warningCount: 0,//告警次数
        addImsiCount: 0,//新增imsi数
        addFaceCount: 0,//新增头像数
        collCount: 0,//碰撞次数
        catchData: {imsi: [], face: [], createTime: []},//近7天抓取数据
        warning: {imsi: [], face: [], createTime: []},//近7天告警数据
        hotSpots: [],//热力图数据
        hotPoint: null,//热力图的中心点
        hotZoom: 12,//热力图的放大倍数
        heatMap: null,//热力图的地图
        heatmapOverlay: null,
        devicePieChart: null,//侦码设备饼状图
        cameraPieChart: null,//相机设备饼状图
        catchLineChart: null,//抓取数据折线图
        warningBarChart: null,//告警数据柱状图
        intervalid: null,//定时器
        icon: require('../../assets/img/icon.png'),
        imgPath: require('../../assets/img/icon_people.png'),
        geolocation: null,
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    methods: {
      //定时刷新设备的在线状态
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getMapData();
            this.getHotSpot();
            this.getWarningCount();
            this.getImsiList();
            this.getLineData();
          }, 20 * 1000);
        }
      },
      handleType(val) {
        this.activeItem = val;
        if (val === 'device') {//设备地图
          this.getMapData();
        } else {//热力图
          this.getHotSpot();
        }
      },
      //从数据库获取一定数量的图码碰撞记录数据展示在首页上
      getImsiList() {
        this.$post('/home/getTodayCollideList', {num: 5}).then((data) => {
          if ('000000' === data.code) {
            this.imgList = data.data;
          }
        }).catch((err) => {
          this.imgList = [];
        });
      },
      //获取今日告警次数
      getWarningCount() {
        //今日告警次数
        this.$post('/home/addTodayWarnings', {}).then((data) => {
          if (data.code === '000000') {
            this.warningCount = data.data;
          }
        }).catch((err) => {
          this.warningCount = 0;
        });
        //今日新增imsi、face
        this.$post('/home/addTodayFaceImsi', {}).then((data) => {
          if (data.code === '000000') {
            if (data.data) {
              this.addImsiCount = data.data.imsi;
              this.addFaceCount = data.data.face
            }
          }
        }).catch((err) => {
          this.addImsiCount = 0;
          this.addFaceCount = 0
        });
        //获取图码碰撞当天次数的总量
        this.$post('/home/countTodayCollide', {}).then((data) => {
          if (data.code === '000000') {
            this.collCount = data.data;
          }
        }).catch((err) => {
          this.collCount = 0
        });
      },
      //数据热力图
      getHotSpot() {
        this.hotSpots = [];
        this.$post('/home/getHotSpot', {}).then((data) => {//指定获取30分钟的数据
          if (data.code === '000000') {
            if (data.data && data.data.length > 0) {
              data.data.forEach((item, idx) => {
                let param = {lng: item.lon, lat: item.lat, count: item.total};
                this.hotSpots.push(param);
              });
            }
            this.getDataHeat();
          }
        }).catch((err) => {
          this.hotSpots = [];
          this.getDataHeat();
        });
      },
      getDataHeat() {
        var _this = this;
        if (!this.heatMap) {
          this.heatMap = new BMap.Map("dataheat");// 创建地图实例

          this.heatMap.enableScrollWheelZoom(); // 允许滚轮缩放
          var mapType = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});
          this.heatMap.setMapStyle({style: 'midnight'});
          this.heatMap.addControl(mapType);//左上角，默认地图控件
        } else {
          this.hotPoint = this.heatMap.getCenter();
          this.hotZoom = this.heatMap.getZoom();
        }

        if (!this.hotPoint) {
          var point = new BMap.Point(116.331398, 39.897445);
          this.heatMap.centerAndZoom(point, this.hotZoom);

          function myFun(result) {
            var cityName = result.name;
            _this.heatMap.setCenter(cityName);
            _this.heatMap.setZoom(_this.hotZoom);
            _this.hotPoint = _this.heatMap.getCenter();
          }

          var myCity = new BMap.LocalCity();
          myCity.get(myFun);
        } else {
          this.heatMap.centerAndZoom(this.hotPoint, this.hotZoom);
        }

        function zoom() {
          _this.heatMap.centerAndZoom(_this.heatMap.getCenter(), _this.heatMap.getZoom());
          _this.hotPoint = _this.heatMap.getCenter();
          _this.hotZoom = _this.heatMap.getZoom();
        }

        this.heatMap.addEventListener("zoomend", zoom);
        this.heatMap.addEventListener("dragend", zoom);

        this.heatMap.clearHotspots();//清空地图所有热区,添加新数据
        if (!this.heatmapOverlay) {
          this.heatmapOverlay = new BMapLib.HeatmapOverlay({"radius": 40});
          this.heatMap.addOverlay(this.heatmapOverlay);
          this.heatmapOverlay.setOptions({
            gradient: {
              0.125: "rgb(0,0,255)", 0.25: "rgb(0,255,0)", 0.5: "yellow", 1.0: "rgb(255,0,0)"
            }
          });
          this.heatmapOverlay.show();//显示热力图
        }

        this.heatmapOverlay.setDataSet({data: this.hotSpots, max: 4000});
      },
      //设备地图
      getMapData() {
        this.$post('/home/getAllDevice', {}).then((data) => {
          if (data.code === '000000') {
            var deviceImsi = data.data.imsiDeviceDistribute;
            var camera = data.data.cameraDeviceDistribute;

            let device1 = {
              count: deviceImsi.count,
              data: [{value: deviceImsi.onlineCount, name: '在线'},
                {value: deviceImsi.offlineCount, name: '离线'}]
            };
            let device2 = {
              count: camera.count,
              data: [{value: camera.onlineCount, name: '在线'}, {value: camera.offlineCount, name: '离线'}]
            };
            this.devicePie.device1 = device1;
            this.devicePie.device2 = device2;

            data.data.imsiDeviceDistribute.deviceList.forEach((item, idx) => {
              if (item.devicePos && item.devicePos.longitude && item.devicePos.latitude) {
                let onLine = true;
                if (item.lineStatus === "OFF") {
                  onLine = false;
                }
                let param = {
                  name: item.city, value: [item.devicePos.longitude, item.devicePos.latitude, 1],
                  deviceName: item.deviceName, deviceId: item.deviceId, type: '侦码设备', onLine: onLine,
                  placeName: item.placeName
                };
                this.mapData.push(param);
              }
            });
            data.data.cameraDeviceDistribute.deviceList.forEach((item, idx) => {
              let onLine = true;
              if (item.status === 2) {
                onLine = false;
              }
              let param = {
                name: item.name, value: [item.longitude, item.latitude, 1], deviceName: item.name,
                deviceId: item.cameraCode, onLine: onLine, type: '相机设备', placeName: item.placeName
              };
              this.mapData.push(param);
            });
            this.getDeviceMap();
            this.getCamera();
            this.getDevice();
          }
        }).catch((err) => {
          this.mapData = [];
          this.devicePie = {
            device1: {count: 0, data: [{value: 0, name: '在线'}, {value: 0, name: '离线'}]},
            device2: {count: 0, data: [{value: 0, name: '在线'}, {value: 0, name: '离线'}]}
          };
          this.getDeviceMap();
          this.getCamera();
          this.getDevice();
        });
      },
      getDeviceMap() {
        var _this = this;
        if (this.deviceMap) {
          this.mapPoint = this.deviceMap.getCenter();
          this.mapZoom = this.deviceMap.getZoom();
        }
        if (!this.deviceChart) {//deviceChart不存在，创建实例
          var app = {};
          this.deviceChart = echarts.init(document.getElementById('devicemap'));
          let option = {
            // backgroundColor: "#21206C",
            tooltip: {
              trigger: 'item',
              padding: [5, 10],
              show: true, //不显示提示标签
              formatter: function (params) {
                var res = '';
                res += '设备类型：' + params.data.type + '<br>';
                res += '设 备 ID ：' + params.data.deviceId + '<br>';
                res += '在线状态：' + (params.data.onLine ? "在线" : "离线") + '<br>';
                res += '安装场所：' + (params.data.placeName ? params.data.placeName : '--') + '<br>';
                res += '设备标识：' + params.data.deviceName + '<br>';
                return res;
              }, //提示标签格式
              backgroundColor: "#070616",//提示标签背景颜色
              textStyle: {color: "#fff", align: 'left'} //提示标签字体颜色
            },
            grid: {left: 0, right: 0, bottom: 0, top: 0, containLabel: true},
            bmap: {
              center: [116.404, 39.915],
              zoom: 12,
              roam: true
            },
            series: [
              {
                name: '数量', // series名称
                type: 'scatter',
                coordinateSystem: 'bmap',
                data: []
              }
            ]
          };
          this.deviceChart.setOption(option);
          if (!app.inNode) {
            this.deviceMap = this.deviceChart.getModel().getComponent('bmap').getBMap();
            var mapType = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});
            this.deviceMap.setMapStyle({style: 'midnight'});
            this.deviceMap.addControl(mapType);          //左上角，默认地图控件
          }
        } else {
          this.deviceChart.setOption({
            series: [
              {
                name: '数量', // series名称
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAADAUlEQVRYhe1XS08TURT+7p3pw7aALyCaYDGNj8QYTVuLPFy50h1K1MSFLkzcGfkDmrjRjUqMO13IwoULy8aYuHBDAAVKowvjg2CAxKAxWmkp05nOPceFDlRoDY8huPDb3TPnzvlyznfOyRXMjPWEXNfo/wkA0N382YdEtM0rxRkhECq1K8Jnm/nJ7qF038I7wg0RfmyK3djgFR1+XUZ8uijrY9oMo0ivjSLfjQyO3HeFwPjh2HGfR9yp8WuRpd5RxMia1D9r0dldQ+mJFRN4fyh6ui6k3/PposqxZQuUt4n7LJtfWYo/A4AmsT/glXt8umgNeOYll7doKmOoUyvWgF8Xx5zgps25bEElwy9GzlfyH01Ew4bONzdukCc1KRD0ym3f8iq+YgI2wZ8zCcQ8Zhb5UuPLkafjzbFOjyZO6lK0On7MyCvmV1KIBw0DqY6xptiFoFd2Bb0iCLgkwtFENBzwyofVPtmqyfIiVMT4YdDjhoFUx2giGlaE9r2pdJcrBN7Fo5d3bPLcds6zRYJl82vFqAl5ZaPTGYoYn6btzr2pdJfj6+ogUsT4OmN3Z2ZV4/a+1MGG/tTOr3n7SMZQ/QBQLjuuDCJNomcyU4QQmNoznH4EAOPNsc6i4uTv4dP2Nh69rkvUaRI9pXddKcFCjDfHOrcEtFszFo3NmHR011B6opLvmuwCARzQpECNX4soQvtffZ0MjCai4ZBPPpdCLHmqVYImAWfo5Ez64xsx/5GVOQ0oQvtyRupSUeVblOTItEHtALqAf30dK+JFrWPaDEv9KlvAI8q21nJQMQOmzbnvs6pb0XyXKGLkTLpa3zss6nuHxXSBnq0qeiUCihjZgkpaiq/mLf7i2DMGvdkxkLrmnI0iXcwWKL8aAmVLoEmBzQHt3HSBjlf7Za1j3xrU9k20xAbBeAsAIZ9sq/bLoOsESkjULrTXBvUEgMRqgpZi3btgjoAQmDLttX+kmDZDCEzNxS3dBZMt8Su6xIm1JGATkqVCXpNltBz8Oxr4T2C98BN+QlGAwvTMTwAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '侦码设备';
                })
              },
              {
                name: '数量', // series名称
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAABcUlEQVRYhe2Xu0oDQRSG/zMzya6uURA0jWDAwjYkMQQMIkiIiLWdT2AQG7EUn8DKyjfwCbQVxECMnSCKkMImamMSZXPZGaukyIVks4EFmb8aOIfzf3PhzAwppeCnmK/uGkADaAAAoj14X09cBzhlvRZsOupm6e5h2zVAgFM2ZHhfkGpdupqEGJ4yWN+282YKtmgICo2S/5KMpQXRLmMoR+6L554AKrYs1+py67ehMvPT/NIQ1JPzmowtA9g3BYsGOKUXLBE2BMGRCqVUfCWSL+bGBrCCFLabdGwZLNPPvJSK74QMfjVrMqs7xhmBCDOAhxXgjDA3xQ/6mQMAEfb6mXfL06kbZO5GvvcBDfB/AeyWqvgKsFp4PPyoti6+fpynal32xFsSJuCxFQ9TJF/MtcfPidiRFWRpwREFAKnUCQBQ+1Vc3lhTE7qMEL4tjNwgOo4NR5U8u49Rp7MFdlNuftbU2QQATt3kk/6YaAAN4DfAH3GdayPrcd34AAAAAElFTkSuQmCC',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '相机设备';
                })
              },
              {
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAABdklEQVRYhWP8//8/w0ACpgG1fdQBow4YdQADAwMLjOG6KWIHNyuTO6UGfv39b+duvxUeJDuAm5XJXYqHnVL7GZ59+UmSJ1gIK8ENHn36cVeAg0WMj42Flxj1RiuDbdiZGX1YmZleHgpc1U+RAx5//vnyxddfzm++/3ZVFeSazcvGjKHGZFWwPAMDQyw/O4sBFyuzjbYItzgvGzPDz7//GGzXhSofDlqdQ7YDxLhYxT/8+F0qxsXmis1y23WhXlI87KtkeNm50eXYmZkYmJkYeRgYKAgBdmYmBgV+zmxsljMwMDAwMzGGYbMcHVCUDXFZTgoY8HJg1AHD1wEffv75NKAOuBC+Lu/y6y9Tb7z7dvXZl58Y8j/+/ONgYKCwKCYEDgetzoGx9VYEFYhystpwsjAZMDAwMPz597+c5g5ABpci1k1gYGCYgC4Oj4Kvv/8+oIZFpJoDD4H3P/44XHv7tZFSB3z59beeFPWMox2TUQeMOmCgHQAA7cZmOlB3L2AAAAAASUVORK5CYII=',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return item.onLine && item.type == '相机设备';
                })
              },
              {
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAADJUlEQVRYhe1V20sUURj/5szszOyOu2pesOsaWxRlJbFEoUnUkxHZutsq9FAPQW+R/0BCL/VSSfRWD/mQtZvuGoQQYQQZFEWoYEGg3byGljq7zp4zc8700shqu+FlRB/6Pc35zfed78d3vgtnmiasJtCqRv8vAAAEOy/bHwlWKg5UzyMuJ53HBhvF1Hzyvq6ta74PZ0cRHmoNXStwOkL5ssPnFvmMNiqhMKHpPT9T+u3Xoda7tgg4HDt9PFcSbm3xyL6F+mDKYEjFr8Y1/cy7cNvXJQsof1hbV1ak3PGIgtviBlWc1AzWlSBGd9JgowAAIs/tKZQdOzySUFHodMz6/5ghIwOTqfCSayBPFqqt4NPEUAdVHHtxKnoum70/GvROaPr10lw5KPEIil3i+k+/NP+SBaQMJg8nMBjM7J/CxsWXtY86quLhBpeAgrKAKiw7ZkKSUNYtIO5eZ00kdLA1dL7YJTYVuRwKgE1F6I8GvYVOx/2NbqlC4jN3NqYMvkyl2jprIiF/NOglzAz01seabBGw92HtpcqNuTet87imQ4LQHp2x3BJFKrU6A1MGb0fVht76WJNla+sgwpTBh4lk88CkVtpx4kH5s5ORrX3jycMDk9orAIBM2bFlEImIi3cNTQECGOmuj0UAAKri4YYZncb+DJ/KsgeBq7KAikXExdN9bXmC+aiKhxu25ztvjCVJ/2iSHHsXbvuazXZFdgHiYJ/EI9jikX2EmYF/2c5mwB8NeksUsVNA3IKnWjaIPAJr6Awn8Jx/BjPnZGW2BggzA4sZqQvFhhxpPuX7puIAADQBrPV1jCn7q3VUQkElBgAAFDgdGVtrMcjqPU0MtX9Sa8aUzRE0lMCN7dUtXHt1C/dtGj9dVvRsAjBlMKjiWILQxh8z+pjFf55K9T2viVyxzr9S+oVBFSeXIyDjE0g8Al+e8+x3FR/f7JaKLH7nOtfuI+3hNwDwEQCgRBErN7klxXYBlohtec6i+fyuAuUAABxYTtB0rHoXoLSPEZXQFQ+oEgoIYMQ6z9kFRx/XXZZ5VLuSAlKUxdILeUWW0WKwdmrgv4DVwm+D61eTFNG8+QAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return item.onLine && item.type == '侦码设备';
                })
              }
            ]
          });
        }
        //IP定位
        if (!this.mapPoint) {
          var point = new BMap.Point(116.331398, 39.897445);
          this.deviceMap.centerAndZoom(point, this.mapZoom);

          function myFun(result) {
            var cityName = result.name;
            _this.deviceMap.setCenter(cityName);
            _this.deviceMap.setZoom(_this.mapZoom);
            _this.mapPoint = _this.deviceMap.getCenter();
          }

          var myCity = new BMap.LocalCity();
          myCity.get(myFun);
        } else {
          this.deviceMap.centerAndZoom(this.mapPoint, this.mapZoom);
        }

        function map() {
          _this.deviceMap.centerAndZoom(_this.deviceMap.getCenter(), _this.deviceMap.getZoom());
          _this.mapPoint = _this.deviceMap.getCenter();
          _this.mapZoom = _this.deviceMap.getZoom();
        }

        this.deviceMap.addEventListener("zoomend", map);
        this.deviceMap.addEventListener("dragend", map);
      },
      //相机--饼状图
      getCamera() {
        if (!this.cameraPieChart) {
          this.cameraPieChart = echarts.init(document.getElementById('camera'));
          let option = {
            color: ['#2CA85C', '#F04864'],
            title: {
              text: '相机总数\n\n' + (this.devicePie.device2 ? this.devicePie.device2.count : 0),
              textStyle: {color: '#fff', fontSize: '14'},
              top: 'center',
              left: 'center',
              bottom: 'center',
              right: 'center'
            },
            tooltip: {trigger: 'item', formatter: "{a} <br/>{b}: {c} ({d}%)"},
            legend: {
              textStyle: {color: '#999'}, orient: 'vertical', x: 'right', data: ['在线', '离线']
            },
            series: [
              {
                name: '相机设备',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                  normal: {show: true, position: 'outside'},
                  emphasis: {show: true, textStyle: {fontSize: '20', fontWeight: 'bold'}}
                },
                labelLine: {normal: {show: true}},
                data: (this.devicePie.device2 ? this.devicePie.device2.data : [])
              }
            ]
          };
          this.cameraPieChart.setOption(option);
        } else {
          this.cameraPieChart.setOption({
            title: {
              text: '相机总数\n\n' + (this.devicePie.device2 ? this.devicePie.device2.count : 0),
              textStyle: {color: '#fff', fontSize: '14'},
              top: 'center',
              left: 'center',
              bottom: 'center',
              right: 'center'
            },
            series: [
              {
                name: '相机设备',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                  normal: {show: true, position: 'outside'},
                  emphasis: {show: true, textStyle: {fontSize: '20', fontWeight: 'bold'}}
                },
                labelLine: {normal: {show: true}},
                data: (this.devicePie.device2 ? this.devicePie.device2.data : [])
              }
            ]
          });
        }
      },
      //侦码设备--饼状图
      getDevice() {
        if (!this.devicePieChart) {
          this.devicePieChart = echarts.init(document.getElementById('device'));
          let option = {
            color: ['#2CA85C', '#F04864'],
            title: {
              text: '侦码设备总数\n\n' + (this.devicePie.device1 ? this.devicePie.device1.count : 0),
              textStyle: {color: '#fff', fontSize: '14'},
              top: 'center', left: 'center', bottom: 'center', right: 'center'
            },
            tooltip: {trigger: 'item', formatter: "{a} <br/>{b}: {c} ({d}%)"},
            legend: {textStyle: {color: '#999'}, orient: 'vertical', x: 'right', data: ['在线', '离线']},
            series: [
              {
                name: '侦码设备',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                  normal: {show: true, position: 'outside'},
                  emphasis: {show: true, textStyle: {fontSize: '20', fontWeight: 'bold'}}
                },
                labelLine: {normal: {show: true}},
                data: (this.devicePie.device1 ? this.devicePie.device1.data : [])
              }
            ]
          };
          this.devicePieChart.setOption(option);
        } else {
          this.devicePieChart.setOption({
            title: {
              text: '侦码设备总数\n\n' + (this.devicePie.device1 ? this.devicePie.device1.count : 0)
            },
            series: [
              {
                name: '侦码设备',
                type: 'pie',
                data: (this.devicePie.device1 ? this.devicePie.device1.data : [])
              }
            ]
          });
        }
      },
      //图码抓取数据--折线图
      getLineData() {
        this.$post('/home/countLast7DayFaceImsi', {}).then((data) => {
          if (data.code === '000000') {
            this.catchData = {imsi: [], face: [], createTime: []};
            data.data.forEach((item, idx) => {
              this.catchData.imsi[idx] = item.imsi;
              this.catchData.face[idx] = item.face;
              this.catchData.createTime[idx] = formatDate(new Date(item.createTime * 1000), 'yyyy-MM-dd');
            });
            this.getImsiFace();
          }
        }).catch((err) => {
          this.catchData = {imsi: [], face: [], createTime: []};
          this.getImsiFace();
        });
        this.$post('/home/countLast7DayWarnings', {}).then((data) => {
          if (data.code === '000000') {
            this.warning = {imsi: [], face: [], createTime: []};
            data.data.forEach((item, idx) => {
              this.warning.imsi[idx] = item.imsi;
              this.warning.face[idx] = item.face;
              this.warning.createTime[idx] = formatDate(new Date(item.createTime * 1000), 'yyyy-MM-dd');
            });
            this.getWarning();
          }
        }).catch((err) => {
          this.warning = {imsi: [], face: [], createTime: []};
          this.getWarning();
        });
      },
      getImsiFace() {
        if (!this.catchLineChart) {
          this.catchLineChart = echarts.init(document.getElementById('imsi'));
          let option = {
            textStyle: {color: '#6D6C98'},
            title: {
              text: '近7天抓取数量统计',
              textStyle: {color: '#999', fontSize: '14'}
            },
            grid: {left: 0, right: 0, bottom: 0, containLabel: true},
            color: ['#3fa9f5', '#FFBF00'],
            tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
            legend: {textStyle: {color: '#999'}, data: ['IMSI', '图像'], right: '20'},
            xAxis: {
              data: (this.catchData.createTime ? this.catchData.createTime : []),
              axisLine: {show: true, lineStyle: {color: '#6D6C98'}}
            },
            yAxis: {
              axisLine: {show: true, lineStyle: {color: '#6D6C98'}},
              splitLine: {lineStyle: {color: ['#6D6C98'], type: 'dashed'}}
            },
            series: [{
              name: 'IMSI',
              type: 'line',//line -> 折线图  bar -> 柱状图
              data: (this.catchData.imsi ? this.catchData.imsi : [])
            }, {
              name: '图像',
              type: 'line',//line -> 折线图  bar -> 柱状图
              data: (this.catchData.face ? this.catchData.face : [])
            }]
          };
          this.catchLineChart.setOption(option);
        } else {
          this.catchLineChart.setOption({
            xAxis: {
              data: (this.catchData.createTime ? this.catchData.createTime : [])
            },
            series: [{
              name: 'IMSI',
              type: 'line',//line -> 折线图  bar -> 柱状图
              data: (this.catchData.imsi ? this.catchData.imsi : [])
            }, {
              name: '图像',
              type: 'line',//line -> 折线图  bar -> 柱状图
              data: (this.catchData.face ? this.catchData.face : [])
            }]
          });
        }
      },
      //今日告警图表
      getWarning() {
        if (!this.warningBarChart) {
          this.warningBarChart = echarts.init(document.getElementById('warning'));
          let option = {
            textStyle: {color: '#6D6C98'},
            title: {
              text: '近7天告警数量统计',
              textStyle: {color: '#999', fontSize: '14'}
            },
            grid: {left: 0, right: 0, bottom: 0, containLabel: true},
            color: ['#3fa9f5', '#FFBF00'],
            tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
            legend: {textStyle: {color: '#999'}, data: ['IMSI', '图像'], right: '20'},
            xAxis: {
              data: (this.warning.createTime ? this.warning.createTime : []),
              axisLine: {show: true, lineStyle: {color: '#6D6C98'}}
            },
            yAxis: {
              axisLine: {show: true, lineStyle: {color: '#6D6C98'}},
              splitLine: {lineStyle: {color: ['#6D6C98'], type: 'dashed'}}
            },
            series: [{
              name: 'IMSI',
              type: 'bar',//line -> 折线图  bar -> 柱状图
              data: (this.warning.imsi ? this.warning.imsi : [])
            }, {
              name: '图像',
              type: 'bar',//line -> 折线图  bar -> 柱状图
              data: (this.warning.face ? this.warning.face : [])
            }]
          };
          this.warningBarChart.setOption(option);
        } else {
          this.warningBarChart.setOption({
            xAxis: {
              data: (this.warning.createTime ? this.warning.createTime : [])
            },
            series: [{
              name: 'IMSI',
              type: 'bar',//line -> 折线图  bar -> 柱状图
              data: (this.warning.imsi ? this.warning.imsi : [])
            }, {
              name: '图像',
              type: 'bar',//line -> 折线图  bar -> 柱状图
              data: (this.warning.face ? this.warning.face : [])
            }]
          });
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      sessionStorage.setItem("index", 1);
      //初始化地图个表格
      this.getDeviceMap();
      this.getDataHeat();
      this.getCamera();
      this.getDevice();
      this.getImsiFace();
      this.getWarning();
      //获取概览数据
      this.getMapData();
      this.getHotSpot();
      this.getWarningCount();
      this.getImsiList();
      this.getLineData();
      //定时请求数据==>10s请求一次
      this.statusTask();
    }
  }
</script>
<style scoped>
  .map-tap {
    height: 50px;
    line-height: 50px;
    cursor: pointer;
    color: #5F5E91;
    font-size: 18px;
    margin: 0 15px;
    padding: 0 20px 10px 20px;
    border-bottom: 3px transparent solid;
  }

  .map-tap-active {
    height: 50px;
    line-height: 50px;
    cursor: pointer;
    color: #66CCFF;
    font-size: 18px;
    margin: 0 15px;
    padding: 0 20px 10px 20px;
    border-bottom: 3px #66CCFF solid;
  }

  .header-title {
    color: #fff;
    height: 60px;
    line-height: 60px;
    text-align: left;
    padding-left: 30px
  }

  .header-content {
    color: #fff;
    height: 60px;
    line-height: 60px;
    padding-right: 20px
  }

  .header-unit {
    color: #999;
    height: 60px;
    line-height: 60px;
    padding-right: 30px
  }

  .user-img {
    max-width: 80px;
    max-height: 80px;
    border-radius: 6px;
  }
</style>
