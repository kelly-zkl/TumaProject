<template>
  <div>
    <section class="content">
      <div id="device-map" style="width: 100%;height:650px"></div>
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
        systemParam: {},
        styleOptions: {
          strokeColor: "#FF6600",    //边线颜色。
          fillColor: "#FF6600",      //填充颜色。当参数为空时，圆形将没有填充效果。
          strokeWeight: 3,       //边线的宽度，以像素为单位。
          strokeOpacity: 0.4,	   //边线透明度，取值范围0 - 1。
          fillOpacity: 0.15,      //填充的透明度，取值范围0 - 1。
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
        this.clearArea();
        this.getMapData();
      }
    },
    created() {
      let param = JSON.parse(this.deviceData);
      this.deviceType = param.deviceType;
      this.dataType = param.dataType;
      this.clearArea();
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
            bmap: {center: this.systemParam.localPoint, zoom: 14, roam: true},
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
            this.bMap.setMinZoom(5);
            this.bMap.setMaxZoom(18);
            var mapType = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});
            // this.bMap.addControl(mapType);
            //实例化鼠标绘制工具
            this.drawingManager = new BMapLib.DrawingManager(_this.bMap, {
              isOpen: false, //是否开启绘制模式
              enableDrawingTool: true, //是否显示工具栏
              drawingToolOptions: {
                anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
                offset: new BMap.Size(65, 5), //偏离值
                drawingModes: [BMAP_DRAWING_CIRCLE, BMAP_DRAWING_POLYGON, BMAP_DRAWING_RECTANGLE]
              },
              circleOptions: _this.styleOptions, //圆的样式
              polygonOptions: _this.styleOptions, //多边形的样式
              rectangleOptions: _this.styleOptions //矩形的样式
            });
            //添加鼠标绘制工具监听事件，用于获取绘制结果
            this.drawingManager.addEventListener('overlaycomplete', this.overlaycomplete);
            _this.bMap.addEventListener("zoomend", this.zoomEvent);
            // _this.bMap.addEventListener("click", this.showInfo);
            _this.bMap.addEventListener("dragend", this.zoomEvent);

            // 定义一个控件类,即function
            function DeleteControl() {
              // 默认停靠位置和偏移量
              this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
              this.defaultOffset = new BMap.Size(5, 5);
            }

            // 通过JavaScript的prototype属性继承于BMap.Control
            DeleteControl.prototype = new BMap.Control();

            // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
            // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
            DeleteControl.prototype.initialize = function (map) {
              // 创建一个DOM元素
              var div = document.createElement("div");
              // 设置样式
              div.className = "div-delete el-icon-delete";
              // 绑定事件,点击一次放大两级
              div.onclick = function (e) {
                _this.clearArea();
              };
              // 添加DOM元素到地图中
              _this.bMap.getContainer().appendChild(div);
              // 将DOM元素返回
              return div;
            };
            // 创建控件
            var myZoomCtrl = new DeleteControl();
            // 添加到地图当中
            this.bMap.addControl(myZoomCtrl);
          }
        } else {
          this.myChart.setOption({
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

        //IP定位l
        // if (!this.point) {
        //   var point = new BMap.Point(116.331398, 39.897445);
        //   this.bMap.centerAndZoom(point, this.zoom);
        //
        //   function myFun(result) {
        //     var cityName = result.name;
        //     _this.bMap.setCenter(cityName);
        //     _this.bMap.setZoom(_this.zoom);
        //     _this.point = _this.bMap.getCenter();
        //   }
        //
        //   var myCity = new BMap.LocalCity();
        //   myCity.get(myFun);
        // } else {
        this.bMap.centerAndZoom(this.point, this.zoom);
        // }
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
        this.drawingManager.close();
        // this.clearArea();
        var path = e.overlay.getPath();//Array<Point> 返回多边型的点数组

        //生成多边形
        this.polygon(path);
        var num = 0;
        for (var k = 0; k < this.mapData.length; k++) {
          let isBol = this.InOrOutPolygon(this.mapData[k].value[0], this.mapData[k].value[1]);
          if (isBol && !this.isHasDevice(this.mapData[k].deviceId)) {
            this.deviceList.push(this.mapData[k].deviceId)
          }
          num = (isBol ? num + 1 : num);
        }
        var opts = {
          position: this.ply.getBounds().getCenter(),    // 指定文本标注所在的地理位置
          offset: new BMap.Size(0, 0)    //设置文本偏移量
        };
        var label = new BMap.Label("设备数量：" + num, opts);  // 创建文本标注对象
        label.setStyle({
          color: "#fff", backgroundColor: "black", border: 'none', fontSize: "12px", borderRadius: '3px',
          opacity: 0.8, lineHeight: "20px", fontFamily: "微软雅黑", padding: '0 5px'
        });
        this.bMap.addOverlay(label);
        this.$emit('getDeviceList', {dataType: this.dataType, deviceList: this.deviceList});
      },
      //是否存在重复的deviceId
      isHasDevice(val) {
        var bol = false;
        if (this.deviceList.length > 0) {
          this.deviceList.forEach((item) => {
            if (val == item) {
              bol = true;
            }
          });
        }
        return bol;
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
      this.systemParam = JSON.parse(sessionStorage.getItem("system"));
      this.point = new BMap.Point(this.systemParam.localPoint[0], this.systemParam.localPoint[1]);
      this.deviceMap();
    }
  }
</script>
