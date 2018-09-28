<template>
  <div>
    <section class="content">
      <el-row class="view-top">
        <el-col :span="24" style="text-align: right" align="right">
          <el-form :model="query" style="margin: 0" label-width="100px" label-position="right" :inline="true">
            <el-form-item align="left" label="侦码设备" style="margin:0 0 10px 20px">
              <span style="display: inline-block;margin-right: 20px;font-size: 14px">全部{{deviceImsi.count}}</span>
              <el-checkbox-group v-model="query.code" style="display: inline-block" @change="codeChange">
                <el-checkbox :label="true">在线{{deviceImsi.onlineCount}}</el-checkbox>
                <el-checkbox :label="false">离线{{deviceImsi.offlineCount}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item align="left" label="相机设备" style="margin:0 50px 10px 20px">
              <span style="display: inline-block;margin-right: 20px;font-size: 14px">全部{{camera.count}}</span>
              <el-checkbox-group v-model="query.camera" style="display: inline-block" @change="cameraChange">
                <el-checkbox :label="true">在线{{camera.onlineCount}}</el-checkbox>
                <el-checkbox :label="false">离线{{camera.offlineCount}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <div class="view-map" id="view-map"></div>
    </section>
  </div>
</template>
<script>
  import echarts from "echarts";

  export default {
    data() {
      return {
        query: {code: [true, false], camera: [true, false]},
        deviceImsi: {},
        icon: require('../../assets/img/icon.png'),
        camera: {},
        mapData: [],
        intervalid: null,
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
          }, 10000);
        }
      },
      //侦码设备
      codeChange(val) {
        this.getMapData();
      },
      //相机设备
      cameraChange(val) {
        this.getMapData();
      },
      //设备地图
      getMapData() {
        this.mapData = [];
        this.$post('/home/getAllDevice', {}).then((data) => {
          if (data.code === '000000') {
            this.deviceImsi = data.data.imsiDeviceDistribute;
            this.camera = data.data.cameraDeviceDistribute;

            data.data.imsiDeviceDistribute.deviceList.forEach((item, idx) => {
              if (item.devicePos && item.devicePos.longitude && item.devicePos.latitude) {
                let onLine = true;
                if (item.lineStatus === "OFF") {
                  onLine = false;
                }
                let param = {
                  name: item.city, value: [item.devicePos.longitude, item.devicePos.latitude, 1],
                  deviceName: item.deviceName, deviceId: item.deviceId, type: '侦码设备', onLine: onLine
                };
                if (this.query.code.length === 2) {
                  this.mapData.push(param);
                } else if (this.query.code.length === 1) {
                  if (onLine === this.query.code[0]) {
                    this.mapData.push(param);
                  }
                }
              }
            });
            data.data.cameraDeviceDistribute.deviceList.forEach((item, idx) => {
              let onLine = true;
              if (item.status === 2) {
                onLine = false;
              }
              let param = {
                name: item.name, value: [item.longitude, item.latitude, 1], deviceName: item.name,
                deviceId: item.cameraCode, onLine: onLine, type: '相机设备'
              };
              if (this.query.camera.length === 2) {
                this.mapData.push(param);
              } else if (this.query.camera.length === 1) {
                if (onLine === this.query.camera[0]) {
                  this.mapData.push(param);
                }
              }
            });

            this.deviceMap();
          }
        }).catch((err) => {
          this.mapData = [];
          this.deviceMap();
        });
      },
      deviceMap() {
        var app = {};

        let myChart = echarts.init(document.getElementById('view-map'));
        myChart.clear();
        let option = {
          animation: false,
          tooltip: {
            show: true, //不显示提示标签
            formatter: function (params) {
              return '设备：' + params.data.deviceName + '<br/> ID：' + params.data.deviceId +
                '<br/> 类型：' + params.data.type + '<br/> 状态：' + (params.data.onLine ? "在线" : "离线");
            }, //提示标签格式
            backgroundColor: "#070616",//提示标签背景颜色
            textStyle: {color: "#fff"} //提示标签字体颜色
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
              symbolSize: 15,
              itemStyle: {
                color: '#FF6600'
              },
              data: this.mapData
            },
            {
              name: 'Top 5',
              type: 'effectScatter',
              coordinateSystem: 'bmap',
              data: this.mapData.filter(function (item) {
                return item.onLine;
              }),
              symbolSize: 20,
              showEffectOn: 'render',
              rippleEffect: {
                brushType: 'stroke'
              },
              hoverAnimation: true,
              itemStyle: {
                color: '#81007F',
                shadowBlur: 10,
                shadowColor: '#333'
              },
              zlevel: 1
            }
          ]
        };
        myChart.setOption(option);
        if (!app.inNode) {
          // 添加百度地图插件
          var bmap = myChart.getModel().getComponent('bmap').getBMap();
          var mapType = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});

          bmap.addControl(mapType);          //左上角，默认地图控件

          //定位l
          var point = new BMap.Point(116.331398, 39.897445);
          bmap.centerAndZoom(point, 12);

          function myFun(result) {
            var cityName = result.name;
            bmap.setCenter(cityName);
          }

          var myCity = new BMap.LocalCity();
          myCity.get(myFun);

          var markers = [];
          for (var i = 0; i < this.mapData.length; i++) {
            var pt = new BMap.Point(this.mapData[i].value[0], this.mapData[i].value[1]);
            var myIcon = new BMap.Icon(this.icon, new BMap.Size(2, 3));
            markers.push(new BMap.Marker(pt, {icon: myIcon}));
          }
          //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
          // var markerClusterer = new BMapLib.MarkerClusterer(bmap, {markers: markers});
          // markers {Array} 要聚合的标记数组
          // girdSize {Number} 聚合计算时网格的像素大小，默认60
          // maxZoom {Number} 最大的聚合级别，大于该级别就不进行相应的聚合
          // minClusterSize {Number} 最小的聚合数量，小于该数量的不能成为一个聚合，默认为2
          // isAverangeCenter {Boolean} 聚合点的落脚位置是否是所有聚合在内点的平均值，默认为否，落脚在聚合内的第一个点
          // styles {Array} 自定义聚合后的图标风格，请参考TextIconOverlay类
          var overlays = [];
          var overlaycomplete = function (e) {
            overlays.push(e.overlay);
          };
          var styleOptions = {
            strokeColor: "red",    //边线颜色。
            fillColor: "red",      //填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight: 3,       //边线的宽度，以像素为单位。
            strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
            fillOpacity: 0.3,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'solid' //边线的样式，solid或dashed。
          };
          // //实例化鼠标绘制工具
          // var drawingManager = new BMapLib.DrawingManager(bmap, {
          //   isOpen: false, //是否开启绘制模式
          //   enableDrawingTool: true, //是否显示工具栏
          //   drawingToolOptions: {
          //     anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
          //     offset: new BMap.Size(5, 5), //偏离值
          //     drawingModes: [BMAP_DRAWING_CIRCLE, BMAP_DRAWING_POLYGON, BMAP_DRAWING_RECTANGLE],
          //     drawingType: BMAP_DRAWING_CIRCLE
          //   },
          //   circleOptions: styleOptions, //圆的样式
          //   polygonOptions: styleOptions, //多边形的样式
          //   rectangleOptions: styleOptions //矩形的样式
          // });
          // //添加鼠标绘制工具监听事件，用于获取绘制结果
          // drawingManager.addEventListener('overlaycomplete', overlaycomplete);
        }
      }
    },
    mounted() {
      this.getMapData();
      // this.statusTask();
    }
  }
</script>
<style scoped>
  .view-map {
    position: absolute;
    left: 200px;
    right: 15px;
    bottom: 20px;
    top: 40px;
    color: #fff;
    font-size: 30px;
  }

  .content .view-top {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
  }
</style>
