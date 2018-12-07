<template>
  <section style="margin: 0;padding: 0">
    <div style="padding: 10px 15px 0 30px">
      <el-row :gutter="30" style="height: 100%">
        <el-col :span="15" v-bind:style="'background: #08163d;border-radius: 6px;padding: 0;height:'+tableHeight+'px'">
          <el-row style="height: 40px;line-height: 40px">
            <el-col :span="24">
            <span v-bind:class="activeItem== 'device'?'map-tap-active':'map-tap'"
                  @click="handleType('device')">设备分布实况</span>
              <span v-bind:class="activeItem== 'data'?'map-tap-active':'map-tap'"
                    @click="handleType('data')">实时数据热力图</span>
            </el-col>
          </el-row>
          <div v-show="activeItem== 'device'">
            <div id="devicemap"
                 v-bind:style="'width:100%;display: block;height:'+((tableHeight-40)*0.30>200?(tableHeight-240):(tableHeight-40)*0.70)+'px'"></div>
            <div style="padding: 10px 20px">
              <el-row style="margin: 0;padding: 0">
                <el-col :span="12" style="text-align: center">
                  <div id="camera"
                       v-bind:style="'width: 300px;max-height:200px;height:'+(tableHeight-40)*0.30+'px'"></div>
                </el-col>
                <el-col :span="12" style="text-align: center">
                  <div id="device"
                       v-bind:style="'width: 300px;max-height:200px;height:'+(tableHeight-40)*0.30+'px'"></div>
                </el-col>
              </el-row>
            </div>
          </div>
          <div v-show="activeItem== 'data'">
            <div style="display: block;width:100%;position: relative">
              <div id="dataheat" v-bind:style="'display: block;width:100%; height:'+(tableHeight-40)*0.70+'px'"></div>
              <div style="background: rgba(0, 0, 0, .6);height: 30px;position: absolute;bottom: 0;width: 100%">
                <el-row>
                  <el-col :span="7" align="left" style="text-align: left">
                    <span class="heat-tip-text">根据最近{{systemParam.limitTime}}分钟的抓取IMSI数量生成</span></el-col>
                  <el-col :span="17" align="right" class="heat-tip-color">
                    <div v-for="(item,idx) in systemParam.heatRanges" :key="idx">
                      <div class="dot-heat" v-bind:style='{backgroundColor:item.color?item.color:""}'></div>
                      <div class="heat-tip-content">{{item.end?item.start+'-'+item.end:item.start+'及以上'}}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
            <div style="display: block;padding: 10px 20px">
              <el-row style="padding: 0;margin: 0">
                <el-col :span="8" align="center" v-bind:style="'height:'+(tableHeight-40)*0.30+'px'">
                  <div
                    v-bind:style="'display:-webkit-box;display:-ms-flexbox;display:flex;align-items: center;justify-content: center;background: rgba(0,0,0,.3);border-radius: 6px;text-align: center;width: 160px;padding: 10px 20px;height:'+(((tableHeight-180)*0.30-20)/2)+'px'">
                    <div style="display: block">
                      <div style="color: #fff;font-size: 14px">今日抓取IMSI</div>
                      <div style="color: #fff;font-size: 20px;margin-top: 10px">{{addImsiCount}}<span
                        style="color: #fff;font-size: 14px">条</span></div>
                    </div>
                  </div>
                  <div
                    v-bind:style="'display:-webkit-box;display:-ms-flexbox;display:flex;align-items: center;justify-content: center;background: rgba(0,0,0,.3);border-radius: 6px;width: 160px; margin-top: 10px;padding: 10px 20px;height:'+(((tableHeight-180)*0.30-20)/2)+'px'">
                    <div style="display: block">
                      <div style="color: #fff;font-size: 14px">今日抓取图像</div>
                      <div style="color: #fff;font-size: 20px;margin-top: 10px">{{addFaceCount}}<span
                        style="color: #fff;font-size: 14px">条</span></div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="16" align="center">
                  <div id="imsi" v-bind:style="'width: 500px;height:'+((tableHeight-40)*0.30-10)+'px'"></div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
        <el-col :span="9" v-bind:style="'height:'+tableHeight+'px'">
          <!--今日告警 柱状图-->
          <div v-bind:style="'display: block;background: #08163d;border-radius: 6px;height: '+(tableHeight*0.44)+'px'">
            <el-row style="border-bottom: 1px #3D3D8D solid;height: 40px;line-height: 40px">
              <el-col :span="12" align="left">
                <span class="header-title">今日告警</span>
              </el-col>
              <el-col :span="12" align="right">
                <span class="header-content">{{warningCount}}</span>
                <span class="header-unit">次</span>
              </el-col>
            </el-row>
            <div id="warning" v-bind:style="'padding: 10px 20px;height:'+(tableHeight*0.44-60)+'px'"></div>
          </div>
          <!--今日图码碰撞 列表-->
          <div
            v-bind:style="'display: block;background: #08163d;border-radius: 6px;margin-top: 15px;height:'+(tableHeight*0.56-15)+'px'">
            <el-row style="border-bottom: 1px #3D3D8D solid;height: 40px;line-height: 40px">
              <el-col :span="12" align="left">
                <span class="header-title">今日图码碰撞</span>
              </el-col>
              <el-col :span="12" align="right">
                <span class="header-content">{{collCount}}</span>
                <span class="header-unit">次</span>
              </el-col>
            </el-row>
            <div class="overview" v-bind:style="'height:'+(tableHeight*0.56-55)+'px'">
              <el-table :data="imgList" :header-cell-style="{background:'#08163d'}" stripe
                        v-bind:style="'height:'+(tableHeight*0.56-55)+'px'">
                <el-table-column align="left" label="图像" style="align-content: center" min-width="90" max-width="200">
                  <template slot-scope="scope">
                    <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath" class="user-img" :onerror="img404"/>
                  </template>
                </el-table-column>
                <el-table-column align="left" label="关联IMSI" prop="imsiList" min-width="140" max-width="200">
                  <template slot-scope="scope">
                    <div v-for="item in scope.row.imsiList">
                      <span>{{item.imsi}}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="left" label="置信度" prop="imsiList" min-width="70" max-width="250">
                  <template slot-scope="scope">
                    <div v-for="item in scope.row.imsiList">
                      <span>{{(item.weight/10).toFixed(1) + '%'}}</span>
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
  </section>
</template>
<script>
  import echarts from "echarts";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'device',
        tableHeight: window.innerHeight - 100,
        systemParam: {refreshTime: 10, limitTime: 30, similarThreshold: 60, localPoint: [116.331398, 39.897445]},
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
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        markers: [],
        markerClusterer: null
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
            if (this.activeItem === 'device') {
              this.getMapData();
            } else {//热力图
              this.getHotSpot();
            }
            this.getWarningCount();
            this.getImsiList();
            this.getLineData();
          }, this.systemParam.refreshTime * 1000);
        }
      },
      handleType(val) {
        this.activeItem = val;
        if (val === 'device') {//设备地图
          this.getMapData();
        } else {//热力图
          // this.getDataHeat();
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
          this.heatMap = new BMap.Map("dataheat", {minZoom: 5, maxZoom: 18});// 创建地图实例

          this.heatMap.enableScrollWheelZoom(); // 允许滚轮缩放
          var mapType = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});
          // this.heatMap.setMapStyle({style: 'midnight'});
          // this.heatMap.addControl(mapType);//左上角，默认地图控件
        } else {
          this.hotPoint = this.heatMap.getCenter();
          this.hotZoom = this.heatMap.getZoom();
        }

        this.heatMap.centerAndZoom(this.hotPoint, this.hotZoom);

        function zoom() {
          _this.heatMap.centerAndZoom(_this.heatMap.getCenter(), _this.heatMap.getZoom());
          _this.hotPoint = _this.heatMap.getCenter();
          _this.hotZoom = _this.heatMap.getZoom();
        }

        this.heatMap.addEventListener("zoomend", zoom);
        this.heatMap.addEventListener("dragend", zoom);

        this.heatMap.clearHotspots();//清空地图所有热区,添加新数据
        var colorRange = {};
        var total = this.systemParam.heatRanges[this.systemParam.heatRanges.length - 1].start;
        this.systemParam.heatRanges.forEach((item) => {
          if (item.end) {
            var ketStr = item.end / total;
            colorRange[ketStr] = item.color;
          }
        });
        //0.125: "rgb(0,0,255)", 0.25: "rgb(0,255,0)", 0.5: "yellow", 1.0: "rgb(255,0,0)"
        if (!this.heatmapOverlay) {
          this.heatmapOverlay = new BMapLib.HeatmapOverlay({"radius": 20});
          this.heatMap.addOverlay(this.heatmapOverlay);
          this.heatmapOverlay.setOptions({gradient: colorRange});
          this.heatmapOverlay.show();//显示热力图
        }

        this.heatmapOverlay.setDataSet({data: this.hotSpots, max: total});
      },
      //设备地图
      getMapData() {
        this.mapData = [];
        this.$post('/home/getAllDevice', {}).then((data) => {
          if (data.code === '000000') {
            var deviceImsi = data.data.imsiDeviceDistribute;
            var camera = data.data.cameraDeviceDistribute;

            let device1 = {
              count: deviceImsi.count,
              data: [{value: deviceImsi.onlineCount, name: '在线'}, {value: deviceImsi.offlineCount, name: '离线'}]
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
            // console.log(this.mapData);
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
            animation: false,
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
              center: this.systemParam.localPoint,
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
            this.deviceMap.setMinZoom(5);
            this.deviceMap.setMaxZoom(18);
            var mapType = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});
            this.deviceMap.setMapStyle({style: 'midnight'});
            // this.deviceMap.addControl(mapType);          //左上角，默认地图控件
          }
        } else {
          this.deviceChart.setOption({
            series: [
              {// 侦码设备不在线
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'diamond',
                // symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAb1BMVEUAAAD2PzD2PzD8VzjwJif8VjnwJijwJyj+XTv5SzXzMSzuHyX2PjD9VznwJSf+Xjz5TTX+XzztHST////9VTfxJSb5RTL2Oi79zsv4Z1/8p6D7dWb+3dr/9PP8m5L+6Ob8ta37jID1Tkf9wrz7gXPpPPFCAAAAE3RSTlMAMCBgYPDw0MDAwMCAUFDQ0ICAt+xDQQAAASZJREFUOMt90gmSgjAQBdAOoiwiLkkaCPty/zNOAz1MJDAPS2Pl59NFAX/EO1SL8C3AdXkqy/Oy2/ZCtRN6YHlcleP6sOrVoct2Xp3gDo/7Xdd1joiWuFzzRzW5JJUpaB3xAKjI+tPXktWGx3htBaSbDzdl2Yy0GJV6AQi05bItsTRmGopKSkQUkCCq7cLeDFO73mDoOgokEOG3QrISZxHgTinrib4rDiDggb6nCHIgc9Fdiu3PGjC5jeav8tz8BnA54lhakBtOAwRiDtTLMzT7QAzJGqiRns+QZd0ukIDghva4QQAEWp/MoLUOAMD/L+ADibU2uWvMtI7XV+6mT9z41U/PAikw/3jfh016O+hPweLd9/t3D775gb0d+OASnzsf/gjY/ABgxEQcBSdUhwAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '侦码设备';
                })
              },
              {// 相机设备不在线
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'circle',
                // symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAaVBMVEUAAAD2PzD2PzD8VznwJif8VjnwJijwJyj+XTv5SzXzMSzuHyX2PjD9VznwJSf+Xjz5TTX+XzztHST////xJif9VTj5SDP1OC79zcv7eWf4amH8oZr/9fP5gHn+3tr5YFD9wr37tLH1TkfWZWL7AAAAE3RSTlMAMCBgYPDw0MDAwMCAUFDQ0ICAt+xDQQAAAPZJREFUOMu902mPgyAQgOEB8T56CDO1Xt3+/x+5dQKuKGa/9WljgvMqxkT4I26ZYdlNwFF0MRuXaDeWmdnJ5HZex+Ygrje3N0HRer05Udv947MglhzkvMDdEJczuX2AufMtU074Ma44D61vQucKIBC7dg9XAio/mLrBBl0/DSNWkPvBz5OD94tXD8wBg1v0rQ3w/4CInoeAXED0jaAIBp0LCqiCAb3H1/B5K1SBCAZsHokEQKqPgXZSAFBa9w/fqIl/Wiv4KPSpAhYyOZsnEljDK3IHcn/dgKV0kIJVE9glabxPr9zPSwk+lW7HqYIjcS/txXcBq1+0B0HMkpEZYwAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '相机设备';
                })
              },
              {
                name: 'Top 5',
                type: 'effectScatter',
                coordinateSystem: 'bmap',
                symbol: 'circle',
                // symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAe1BMVEUAAAAxukU1xlUvrjM0xlUvrjM1yVozwE0wtDsuqi4yukQ1xlUvrjI0xVQvrzQ2yVo0wE4xszsvqi42ylwuqS3///8zw1AwsTY1yVkurDAxtT4yu0XN7tBn0Hub3qRlym/z+/VTyGba895+0YXA6sWz5bpy0H9Aw1hLvlXy6H8mAAAAFXRSTlMAIGBg8PDAwMDAgFBQMDDQ0NDQgIDEW0VAAAAA/0lEQVQ4y6XT526DMBSG4Y+9yeTg2oEy0qT3f4UlZhRjo1bK4/yxzkuwEOBXdvGZ5F8y6OwDWznYUFk+2/Ct9TxxmcZNVn8/7ElbzF6uJyJGBsl0f1fu2OY3LHc8R/DamQXyAERtpXrS7HWMI7VNoepIyEV0BDKiqtiiRYZYDbqqmYKq7poHxQjU4KuVwfMudzcKIITQbyHqYgyE+Ffw+V7AOdcDPgec/x2ExuAxByFiY8C/+3szPBUeIzcGUttzngMnUzA7AXDKsr6p+nLmYBCWu8LxlfP25p4FKd0LUkycDyMHi9TTx16qfHrRdh5ZUDnn9fjsQJdfo+nia47FDw4MSkvLJ8uSAAAAAElFTkSuQmCC',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return item.onLine && item.type == '相机设备';
                }),
                showEffectOn: 'render',
                rippleEffect: {
                  brushType: 'stroke'
                },
                hoverAnimation: true,
                itemStyle: {
                  color: '#24A6FE',
                  shadowBlur: 10,
                  shadowColor: '#333'
                },
                zlevel: 1
              },
              {
                name: 'Top 5',
                type: 'effectScatter',
                coordinateSystem: 'bmap',
                symbol: 'diamond',
                // symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAY1BMVEUAAAA0xVMvrzQxukQxukUwtTw1xlUvrjM0xlUvrjM1xVQwrzQ1xlUvrjI2ylw0xlQxukT///8vrjLM7tBly3La892Z36Wm4a7z+/VWympCw1fm9+iA1o6z5ruN3Zxz04PA6cWJOXpkAAAAD3RSTlMAwMAwIIBgYPDw0NBQUIDlQOsSAAABIUlEQVQ4y42Ti5KDIAxFI2rVWktAFN/2/79yY8l2UXGnZ5ig5BKuCPBH/Izkm+gZw5nbXXrcb7AnieSBKPHzj1yeyB9eeRnk9pkvL+AaSX4lyJ2Pvb9hqRXRtP3m9NcAUnPd1Cmma9mG+36W2G3yYszyooeZ9oP2z2U51Go00rTtOvSNUjQQQ4o+Uzuso1tgsDMNpBBRlNRcQOwVY3AjAuQMBzSqWyk2LEDAANNEErwW0Co9MiywtQ/5b+raegKjQpgvBYIF3fsH2L1Ao4CUOkN5pP0ZEOdDhRRirjCGK8QA5X8eSgDIrgUaMyCE1rY+80KthTtyhb6g4KNfuVf0gqMCJtNBMvhQFYH6FXgk4pgXCezJSj9dZnAmTgVPTr3r/wPtpTZf/MVuJQAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return item.onLine && item.type == '侦码设备';
                }),
                showEffectOn: 'render',
                rippleEffect: {
                  brushType: 'stroke'
                },
                hoverAnimation: true,
                itemStyle: {
                  color: '#24A6FE',
                  shadowBlur: 10,
                  shadowColor: '#333'
                },
                zlevel: 1
              }
            ]
          });
        }
        this.deviceMap.centerAndZoom(this.mapPoint, this.mapZoom);

        function map() {
          _this.deviceMap.centerAndZoom(_this.deviceMap.getCenter(), _this.deviceMap.getZoom());
          _this.mapPoint = _this.deviceMap.getCenter();
          _this.mapZoom = _this.deviceMap.getZoom();
        }

        // var points = [];  // 添加海量点数据
        // for (var i = 0; i < this.mapData.length; i++) {
        //   points.push(new BMap.Point(this.mapData[i].value[0], this.mapData[i].value[1]));
        // }
        // var options = {
        //   size: BMAP_POINT_SIZE_BIG,
        //   shape: BMAP_POINT_SHAPE_STAR,
        //   color: '#d340c3'
        // };
        // var pointCollection = new BMap.PointCollection(points, options);
        // this.deviceMap.addOverlay(pointCollection);

        this.getMarkNumber();

        this.deviceMap.addEventListener("zoomend", map);
        this.deviceMap.addEventListener("dragend", map);
      },
      //点聚合功能
      getMarkNumber() {
        if (!this.markerClusterer) {
          // var _styles = [{url: this.imgPath, size: new BMap.Size(40, 40)}];, styles: _styles
          this.markerClusterer = new BMapLib.MarkerClusterer(this.deviceMap, {markers: this.markers});
        }
        this.markerClusterer.clearMarkers();
        this.markers = [];
        for (var i = 0; i < this.mapData.length; i++) {
          var pt = new BMap.Point(this.mapData[i].value[0], this.mapData[i].value[1]);
          var myIcon = new BMap.Icon(this.icon, new BMap.Size(1, 1));
          this.markers.push(new BMap.Marker(pt, {icon: myIcon}));
        }
        //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
        this.markerClusterer.addMarkers(this.markers);
        // markers {Array} 要聚合的标记数组
        // girdSize {Number} 聚合计算时网格的像素大小，默认60
        // maxZoom {Number} 最大的聚合级别，大于该级别就不进行相应的聚合
        // minClusterSize {Number} 最小的聚合数量，小于该数量的不能成为一个聚合，默认为2
        // isAverangeCenter {Boolean} 聚合点的落脚位置是否是所有聚合在内点的平均值，默认为否，落脚在聚合内的第一个点
        // styles {Array} 自定义聚合后的图标风格，请参考TextIconOverlay类
        //鼠标绘制完成回调方法,获取各个点的经纬度
      },
      //相机--饼状图
      getCamera() {
        if (!this.cameraPieChart) {
          this.cameraPieChart = echarts.init(document.getElementById('camera'));
          let option = {
            color: ['#25A4FE', '#F04864'],
            title: {
              text: '相机总数\n\n' + (this.devicePie.device2 ? this.devicePie.device2.count : 0),
              textStyle: {color: '#fff', fontSize: 12},
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
              textStyle: {color: '#fff', fontSize: 12},
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
            color: ['#25A4FE', '#F04864'],
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
            let arr = this.set7adyData(data.data);
            this.catchData = this.getLast7Days(arr);
            this.getImsiFace();
          }
        }).catch((err) => {
          this.catchData = {imsi: [], face: [], createTime: []};
          let arr = this.set7adyData([]);
          this.catchData = this.getLast7Days(arr);
          this.getImsiFace();
        });
        this.$post('/home/countLast7DayWarnings', {}).then((data) => {
          if (data.code === '000000') {
            this.warning = {imsi: [], face: [], createTime: []};
            let arr = this.set7adyData(data.data);
            this.warning = this.getLast7Days(arr);
            this.getWarning();
          }
        }).catch((err) => {
          this.warning = {imsi: [], face: [], createTime: []};
          let arr = this.set7adyData([]);
          this.warning = this.getLast7Days(arr);
          this.getWarning();
        });
      },
      //设置近7天的数据-->不满7个会自动添加到7个
      getLast7Days(arr) {
        let datas = {imsi: [], face: [], createTime: []};
        arr.forEach((item, idx) => {
          datas.imsi[idx] = item.imsi;
          datas.face[idx] = item.face;
          datas.createTime[idx] = formatDate(new Date(item.createTime * 1000), 'yy/MM/dd');
        });
        return datas;
      },
      set7adyData(val) {
        if (val.length == 0) {
          let item = {imsi: 0, face: 0, createTime: Math.round(new Date().getTime() / 1000)};
          val.push(item);
        }
        let max = 7 - val.length;
        if (max > 0) {
          for (let i = 0; i < max; i++) {
            let times = val[0].createTime - 24 * 60 * 60;
            let item = {imsi: 0, face: 0, createTime: times};
            val.unshift(item);
          }
        }
        return val;
      },
      getImsiFace() {
        if (!this.catchLineChart) {
          this.catchLineChart = echarts.init(document.getElementById('imsi'));
          let option = {
            textStyle: {color: '#CFCFD1'},
            title: {
              text: '近7天抓取数量统计',
              textStyle: {color: '#999', fontSize: '14'}
            },
            grid: {left: 0, right: 0, bottom: 0, top: 30, containLabel: true},
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
            textStyle: {color: '#CFCFD1'},
            title: {
              text: '近7天告警数量统计',
              textStyle: {color: '#999', fontSize: '14'}
            },
            grid: {left: 0, right: 0, bottom: 0, top: 30, containLabel: true},
            color: ['#3fa9f5', '#FFBF00'],
            tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
            legend: {textStyle: {color: '#999'}, data: ['IMSI', '图像'], right: '20'},
            xAxis: {
              data: (this.warning.createTime ? this.warning.createTime : []), axisLabel: {align: 'center'},
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
      this.systemParam = JSON.parse(sessionStorage.getItem("system"));
      this.hotPoint = new BMap.Point(this.systemParam.localPoint[0], this.systemParam.localPoint[1]);
      this.mapPoint = new BMap.Point(this.systemParam.localPoint[0], this.systemParam.localPoint[1]);

      let arr = this.set7adyData([]);
      this.warning = this.getLast7Days(arr);
      this.catchData = this.getLast7Days(arr);
      //初始化地图个表格
      this.getDeviceMap();
      this.getCamera();
      this.getDevice();
      this.getImsiFace();
      this.getWarning();
      //获取概览数据
      this.getMapData();
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
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    color: #fff;
    font-size: 16px;
    margin: 0 15px;
    padding: 0 20px 10px 20px;
    border-bottom: 3px transparent solid;
  }

  .map-tap-active {
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    color: #3FA8F3;
    font-size: 16px;
    margin: 0 15px;
    padding: 0 20px 10px 20px;
    border-bottom: 3px #3FA8F3 solid;
  }

  .header-title {
    color: #fff;
    height: 40px;
    line-height: 40px;
    text-align: left;
    padding-left: 30px
  }

  .header-content {
    color: #fff;
    height: 40px;
    line-height: 40px;
    padding-right: 20px
  }

  .header-unit {
    color: #999;
    height: 40px;
    line-height: 40px;
    padding-right: 30px
  }

  .user-img {
    max-width: 80px;
    max-height: 80px;
    border-radius: 6px;
  }

  .heat-tip-content {
    display: inline-block;
    text-align: left;
    color: #fff;
    font-size: 13px;
    margin: 0 10px 0 5px;
    line-height: 30px;
    height: 30px
  }

  .heat-tip-color {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    line-height: 30px;
    height: 30px;
    align-items: center;
    justify-content: flex-end
  }

  .heat-tip-text {
    text-align: left;
    color: #fff;
    font-size: 13px;
    margin-left: 15px;
    line-height: 30px;
    height: 30px
  }

  .dot-heat {
    height: 10px;
    width: 10px;
    border-radius: 5px;
    display: inline-block;
  }
</style>
