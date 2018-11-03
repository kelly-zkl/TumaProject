<template>
  <div>
    <section class="content">
      <div id="device-map" style="width: 100%;height:550px"></div>
    </section>
  </div>
</template>
<script>
  import echarts from "echarts";

  export default {
    props: ['deviceData'],
    data() {
      return {
        myChart: null,
        bMap: null,
        point: null,
        ply: null,//多边形
        drawingManager: null,
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
        deviceList: [],
        deviceType: '',//设备类型-->相机：FACE 侦码：IMSI
        dataType: ''//数据类型-->条件1：data1  条件2：data2
      }
    },
    watch: {
      deviceData: function () {
        let param = JSON.parse(this.deviceData);
        this.deviceType = param.deviceType;
        this.dataType = param.dataType;
        this.getMapData();
      }
    },
    created() {
      let param = JSON.parse(this.deviceData);
      this.deviceType = param.deviceType;
      this.dataType = param.dataType;
      this.getMapData();
    },
    methods: {
      //设备地图
      getMapData() {
        this.mapData = [];
        this.$post('/home/getAllDevice', {}).then((data) => {
          if (data.code === '000000') {
            if (this.deviceType == 'IMSI' && data.data.imsiDeviceDistribute.deviceList.length > 0) {
              data.data.imsiDeviceDistribute.deviceList.forEach((item, idx) => {
                if (item.devicePos && item.devicePos.longitude && item.devicePos.latitude) {
                  let onLine = true;
                  if (item.lineStatus === "OFF") {
                    onLine = false;
                  }
                  let param = {
                    value: [item.devicePos.longitude, item.devicePos.latitude, 1], placeName: item.placeName,
                    deviceName: item.deviceName, deviceId: item.deviceId, type: '侦码设备', onLine: onLine
                  };
                  this.mapData.push(param);
                }
              });
            } else if (this.deviceType == 'FACE' && data.data.cameraDeviceDistribute.deviceList.length > 0) {
              data.data.cameraDeviceDistribute.deviceList.forEach((item, idx) => {
                let onLine = true;
                if (item.status === 2) {
                  onLine = false;
                }
                let param = {
                  value: [item.longitude, item.latitude, 1], deviceName: item.name, onLine: onLine,
                  deviceId: item.cameraCode, type: '相机设备', placeName: item.placeName
                };
                this.mapData.push(param);
              });
            }
            // console.log(this.mapData);
            this.deviceMap();
          }
        }).catch((err) => {
          this.mapData = [];
          this.deviceMap();
        });
      },
      deviceMap() {
        var _this = this;
        this.clearArea();
        if (this.bMap) {
          this.point = this.bMap.getCenter();
          this.zoom = this.bMap.getZoom();
        }
        if (!this.myChart) {
          var app = {};
          this.myChart = echarts.init(document.getElementById('device-map'));
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
        //添加鼠标绘制工具监听事件，用于获取绘制结果
        this.drawingManager.addEventListener('overlaycomplete', this.overlaycomplete);

        _this.bMap.addEventListener("zoomend", this.zoomEvent);
        // _this.bMap.addEventListener("click", this.showInfo);
        _this.bMap.addEventListener("dragend", this.zoomEvent);
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
      //添加鼠标绘制工具监听事件，用于获取绘制结果
      overlaycomplete(e) {
        this.clearArea();
        var path = e.overlay.getPath();//Array<Point> 返回多边型的点数组

        //生成多边形
        this.polygon(path);
        var num = 0;
        for (var k = 0; k < this.mapData.length; k++) {
          let isBol = this.InOrOutPolygon(this.mapData[k].value[0], this.mapData[k].value[1]);
          if (isBol) {
            this.deviceList.push(this.mapData[k].deviceId)
          }
          num = (isBol ? num + 1 : num);
        }
        var opts = {
          position: this.ply.getBounds().getCenter(),    // 指定文本标注所在的地理位置
          offset: new BMap.Size(0, 0)    //设置文本偏移量
        };
        var label = new BMap.Label("设备总量：" + num, opts);  // 创建文本标注对象
        label.setStyle({
          color: "#fff", backgroundColor: "black", border: 'none', fontSize: "12px", borderRadius: '3px',
          opacity: 0.8, lineHeight: "20px", fontFamily: "微软雅黑", padding: '0 5px'
        });
        this.bMap.addOverlay(label);
        this.$emit('getDeviceList', {dataType: this.dataType, deviceList: this.deviceList});
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
      },
      //清除选中区域
      clearArea() {
        if (this.bMap) {
          var allOverlay = this.bMap.getOverlays();
          for (var i = 0; i < allOverlay.length; i++) {
            if (allOverlay[i].toString().indexOf("Polygon") > 0 || allOverlay[i].toString().indexOf("Label") > 0
              || allOverlay[i].toString().indexOf("Circle") > 0) {//删除折线
              this.bMap.removeOverlay(allOverlay[i]);
            }
          }
        }
        this.deviceList = [];
      }
    },
    mounted() {
      this.deviceMap();
    }
  }
</script>
