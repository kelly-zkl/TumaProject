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
        myChart: null,
        drawingManager: null,
        bMap: null,
        point: null,
        ply: null,//多边形
        zoom: 12,
        styleOptions: {
          strokeColor: "#FF6600",    //边线颜色。
          fillColor: "#FF6600",      //填充颜色。当参数为空时，圆形将没有填充效果。
          strokeWeight: 3,       //边线的宽度，以像素为单位。
          strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
          fillOpacity: 0.3,      //填充的透明度，取值范围0 - 1。
          strokeStyle: 'solid' //边线的样式，solid或dashed。
        },
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
          }, 20 * 1000);
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
                  deviceName: item.deviceName, deviceId: item.deviceId, type: '侦码设备', onLine: onLine,
                  placeName: item.placeName
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
                deviceId: item.cameraCode, onLine: onLine, type: '相机设备', placeName: item.placeName
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
        var _this = this;
        if (this.bMap) {
          this.point = this.bMap.getCenter();
          this.zoom = this.bMap.getZoom();
        }
        if (!this.myChart) {
          var app = {};
          this.myChart = echarts.init(document.getElementById('view-map'));
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
              center: [116.404, 39.915],
              zoom: 14,
              roam: true
            },
            series: [
              {
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                data: []
              }
            ]
          };
          this.myChart.setOption(option);
          if (!app.inNode) {
            this.bMap = this.myChart.getModel().getComponent('bmap').getBMap();
            var mapType = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});
            this.bMap.addControl(mapType);
            //实例化鼠标绘制工具
            this.drawingManager = new BMapLib.DrawingManager(_this.bMap, {
              isOpen: false, //是否开启绘制模式
              enableDrawingTool: true, //是否显示工具栏
              drawingToolOptions: {
                anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
                offset: new BMap.Size(5, 5), //偏离值
                drawingModes: [BMAP_DRAWING_CIRCLE, BMAP_DRAWING_POLYGON, BMAP_DRAWING_RECTANGLE]
              },
              circleOptions: _this.styleOptions, //圆的样式
              polygonOptions: _this.styleOptions, //多边形的样式
              rectangleOptions: _this.styleOptions //矩形的样式
            });
          }
        } else {
          this.myChart.setOption({
            series: [
              {
                name: '数量', // series名称
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAUVBMVEUAAADyID/yID/yID/yID/yID/yID/yID/yID/yID/yID/////8yND1WG/91tz5kJ/zLkv+8vT5nqv95Oj6rLf3dIf0SmP4gpP2Znv7usT0PFfIwQAbAAAACnRSTlMAwGBQ8NAwIICQp9SBIgAAAPVJREFUOMuNk1mWgyAQRQtUQh6giGN6/wttonSHKTH3w+PHrYE6VfRCSIYDJgWVNB0iuoZSbgwZ7JaEtyhooyQcVfh/PN7QhPrtO6E9+0j7s5tWnn6wz07LAvuoAuMQiiTvd0ewMdvD/8xARyQQo9VkYIZht2uvFABBMhGWwe7TUWCzs88ASfkIVxUw50AJGUaNi//2QQChwvJUEAlllRVIBKdjfP+91i4SjKphvhRYEMZjhi4XGMlTGK2fzw8wZ4IkETJM9QyCqPvUQ0dE/JPAw8I4XfKwALtcuYul5d+uvTdqh8MvTy+Fp8fLqUTc/87/Hp3/LwNlIteKaJqgAAAAAElFTkSuQmCC',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '侦码设备';
                })
              },
              {
                name: '数量', // series名称
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAATlBMVEUAAADyID/yID/yID/yID/yID/yID/yID/yID/yID/yID/////1WG/8yND5kJ/+8vT0PFf91tz7usT6rLf3dIf2Znv0SmPzLkv5nqv4gpM24GbiAAAACnRSTlMAwGBQ8NAwIICQp9SBIgAAAL9JREFUOMvV01sSgyAMBdAEheL1gVof7f432o5SNIry3fPnzMVoSGhjLGPB1tBZprGjM5IejAN+iOM5TvLdSxSiVDiPC5mvn+NCvn4H4xL7Am0lzaKIRutKqdv6QWSAqjxCYMjKQFc5H6ia2o2wxDLwnJbA3C9PNZgQLdGUPoD/CHA0MJbhN228k+27d9+uwN61ehoAQ6Tv7kKv8/aqpUFMXWJgEiOXGFqVHvuQiC2OSq6epOTyKjozxW/9C0PBB43AIjcte3hMAAAAAElFTkSuQmCC',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '相机设备';
                })
              },
              {
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAATlBMVEUAAAANhCwNhCwNhCwNhCwNhCwNhCwNhCwNhCwNhCwNhCz///9Ko2HD4cuGwpbx+PMrk0bS6Ni02b6l0bBosntZq247m1QcjDmWyaN3uonzHorRAAAACnRSTlMAwGBQ8NAwIICQp9SBIgAAAL9JREFUOMvV01sSgyAMBdAEheL1gVof7f432o5SNIry3fPnzMVoSGhjLGPB1tBZprGjM5IejAN+iOM5TvLdSxSiVDiPC5mvn+NCvn4H4xL7Am0lzaKIRutKqdv6QWSAqjxCYMjKQFc5H6ia2o2wxDLwnJbA3C9PNZgQLdGUPoD/CHA0MJbhN228k+27d9+uwN61ehoAQ6Tv7kKv8/aqpUFMXWJgEiOXGFqVHvuQiC2OSq6epOTyKjozxW/9C0PBB43AIjcte3hMAAAAAElFTkSuQmCC',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return item.onLine && item.type == '相机设备';
                })
              },
              {
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAUVBMVEUAAAANhCwNhCwNhCwNhCwNhCwNhCwNhCwNhCwNhCwNhCz////D4ctKo2HS6NiGwpYcjDnx+POWyaPi8OWl0bBosns7m1R3uolZq2602b4rk0YbVFX3AAAACnRSTlMAwGBQ8NAwIICQp9SBIgAAAPVJREFUOMuNk1mWgyAQRQtUQh6giGN6/wttonSHKTH3w+PHrYE6VfRCSIYDJgWVNB0iuoZSbgwZ7JaEtyhooyQcVfh/PN7QhPrtO6E9+0j7s5tWnn6wz07LAvuoAuMQiiTvd0ewMdvD/8xARyQQo9VkYIZht2uvFABBMhGWwe7TUWCzs88ASfkIVxUw50AJGUaNi//2QQChwvJUEAlllRVIBKdjfP+91i4SjKphvhRYEMZjhi4XGMlTGK2fzw8wZ4IkETJM9QyCqPvUQ0dE/JPAw8I4XfKwALtcuYul5d+uvTdqh8MvTy+Fp8fLqUTc/87/Hp3/LwNlIteKaJqgAAAAAElFTkSuQmCC',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return item.onLine && item.type == '侦码设备';
                })
              }
            ]
          });
        }

        //IP定位l
        if (!this.point) {
          var point = new BMap.Point(116.331398, 39.897445);
          this.bMap.centerAndZoom(point, this.zoom);

          function myFun(result) {
            var cityName = result.name;
            _this.bMap.setCenter(cityName);
            _this.bMap.setZoom(_this.zoom);
            _this.point = _this.bMap.getCenter();
          }

          var myCity = new BMap.LocalCity();
          myCity.get(myFun);
        } else {
          this.bMap.centerAndZoom(this.point, this.zoom);
        }
        //点聚合
        // this.getMarkNumber();
        //添加鼠标绘制工具监听事件，用于获取绘制结果
        this.drawingManager.addEventListener('overlaycomplete', this.overlaycomplete);

        _this.bMap.addEventListener("zoomend", this.zoomEvent);
        // _this.bMap.addEventListener("click", this.showInfo);
        _this.bMap.addEventListener("dragend", this.zoomEvent);
      },
      //点聚合功能
      getMarkNumber() {
        var markers = [];
        for (var i = 0; i < this.mapData.length; i++) {
          var pt = new BMap.Point(this.mapData[i].value[0], this.mapData[i].value[1]);
          var myIcon = new BMap.Icon(this.icon, new BMap.Size(2, 3));
          markers.push(new BMap.Marker(pt, {icon: myIcon}));
        }
        //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
        var markerClusterer = new BMapLib.MarkerClusterer(this.bMap, {markers: markers});
        // markers {Array} 要聚合的标记数组
        // girdSize {Number} 聚合计算时网格的像素大小，默认60
        // maxZoom {Number} 最大的聚合级别，大于该级别就不进行相应的聚合
        // minClusterSize {Number} 最小的聚合数量，小于该数量的不能成为一个聚合，默认为2
        // isAverangeCenter {Boolean} 聚合点的落脚位置是否是所有聚合在内点的平均值，默认为否，落脚在聚合内的第一个点
        // styles {Array} 自定义聚合后的图标风格，请参考TextIconOverlay类
        //鼠标绘制完成回调方法,获取各个点的经纬度
      },
      //生成多边形
      polygon(path) {
        var pts = [];
        var pt;
        for (var j = 0; j < path.length; j++) {
          pt = new BMap.Point(path[j].lng, path[j].lat);
          pts.push(pt);
        }
        this.ply = new BMap.Polygon(pts, this.styleOptions);
        this.bMap.addOverlay(this.ply);
      },
      //判断点是否在多边形内
      /**
       * @return {boolean}
       */
      InOrOutPolygon(lng, lat) {
        let bol = false;
        var pt = new BMap.Point(lng, lat);
        var result = BMapLib.GeoUtils.isPointInPolygon(pt, this.ply);
        if (result) {//在内部，把该点显示在地图上
          bol = true;
        }
        return bol;
      },
      //删除多边形
      removePoly() {
        if (this.bMap) {
          var allOverlay = this.bMap.getOverlays();
          for (var i = 0; i < allOverlay.length; i++) {
            if (allOverlay[i].toString().indexOf("Polygon") > 0 || allOverlay[i].toString().indexOf("Label") > 0
              || allOverlay[i].toString().indexOf("Circle") > 0) {//删除折线
              this.bMap.removeOverlay(allOverlay[i]);
            }
          }
        }
      },
      //添加鼠标绘制工具监听事件，用于获取绘制结果
      overlaycomplete(e) {
        this.removePoly();
        var path = e.overlay.getPath();//Array<Point> 返回多边型的点数组
        //生成多边形
        this.polygon(path);
        var num1 = 0, num2 = 0, num3 = 0, num4 = 0;
        for (var k = 0; k < this.mapData.length; k++) {
          let device = this.mapData[k];
          let isBol = this.InOrOutPolygon(device.value[0], device.value[1]);
          if (device.type == '侦码设备') {//侦码
            if (device.onLine) {//在线
              num1 = (isBol ? num1 + 1 : num1);
            } else {
              num2 = (isBol ? num2 + 1 : num2);
            }
          }
          if (device.type == '相机设备') {//相机
            if (device.onLine) {//在线
              num3 = (isBol ? num3 + 1 : num3);
            } else {
              num4 = (isBol ? num4 + 1 : num4);
            }
          }
        }
        var opts = {
          position: this.ply.getBounds().getCenter(),    // 指定文本标注所在的地理位置
          offset: new BMap.Size(0, 0)    //设置文本偏移量
        };
        let str = "<span style='color: #fff;font-size: 12px;word-break:normal;white-space:pre-warp;word-wrap:break-word'>" +
          "侦码(" + (num1 + num2) + "):在线" + num1 + "、离线" + num2 + "<br/>相机(" + (num3 + num4) + "):在线" + num3 + "、离线" + num4 + "</span>";
        // let str = "侦码(" + (num1 + num2) + "):在线" + num1 + "、离线" + num2 + "，相机(" + (num3 + num4) + "):在线" + num3 + "、离线" + num4;
        var label = new BMap.Label(str, opts);  // 创建文本标注对象
        label.setStyle({
          color: "#fff", backgroundColor: "black", border: 'none', fontSize: "12px", borderRadius: '3px',
          opacity: 0.8, lineHeight: "20px", fontFamily: "微软雅黑", padding: '0 5px'
        });
        this.bMap.addOverlay(label);
      },
      //地图拖拽/放大之后的中心点和放大倍数
      zoomEvent() {
        this.point = this.bMap.getCenter();
        this.zoom = this.bMap.getZoom();
        this.bMap.centerAndZoom(this.bMap.getCenter(), this.bMap.getZoom());
      },
      //画圆，半径为1公里
      showInfo(e) {
        var circle = new BMap.Circle(e.point, 1000, this.styleOptions);
        this.bMap.addOverlay(circle);
      }
    },
    mounted() {
      this.deviceMap();
      this.getMapData();
      this.statusTask();
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
