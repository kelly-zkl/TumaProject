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
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAAC70lEQVRYhe1VPW9URxQ9d2bee2uvUaRIIFGZyEUKvOuAsPH6ORVV6AxWEilFUkRKh/AfCFIaaEisiA4KKCgosBuElCKN2fUudmEvdpSKgsqkiSKZXb83H3dShEfWZhf541mm4HRz586co/tJ3nscJcSRsn8QAEDl+dni8PikEuJrIhrotDvvXzLzo4n1RnXnG8qjCBvliRuhlNOBlENKyK4+lh2MdU3t7K3xtfqdXAQslScuKil/7QvCod2+Ye+RGF3Tzn1TWau/2LeAxeHxr44VCreVkMcyW2JMy3muWuZVx/wSAARRKZTyUyVlHMr/M66t3Wjp9Mt910Ag5RcZuWW3mRgzN9qsfdfLv16qDGrhbvaH4WVBhFCpk690em7fAhz7QmIMPPxz69yVsWeLj5fK8YwUdFmQiDtcW+x5lYC7o83qdKNU+T5SwWyoVBHIqQjrpcpgKOX9QhDGgqirD3uPttYPR5vV6XqpMsjeT8XrjdlcBNSGx69+3F/8JTtrZ+EcNxn+o0ipU1lnsPf4Z6s9E683ZjPfXAcRe49XaXKvrfWps6tPPju3Wv1kM0k+b+u0BgDdopPLIBJE83+3WyBgY2K98QAAlsrxjPM893r4TNZOn78uhDghiOY73+aSgp1YKsczxSj6ObXmeWrthcpa/UVP8bmzAyDCiCBCXxAOsfdT7/TNIlAvVQYjpX4n0K6nWi8IQciGTmLMtjsPvy0qb2qAvZ/ay0jdLQpBsNM0tGXMFIBZ4H1fx+z9W61j2cE6BgCESnVtrb2gZwQsu822Tu9xR5f8t8nMtTMrC3RmZYG2jP7tQOy9BLwmmrPM11Jr/8rsbZ3+Mdqs/ZSdjXM/JMa0DiKgawoEEfrD6Nstoy/2BcHxzD4QFU4vj8RPAfwJAJFSk4UgKOYuIBNRDKPjO+0DUWEMwNhBSLfx5PXRgQUQsGHZHTqhZQcCNt7wdu6C5ZH4R0ni0mEKcJ7nOgv5UJbRXvD+1MAHAUeFfwEdaFMKjfOTxgAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '侦码设备';
                })
              },
              {
                name: '数量', // series名称
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAABbElEQVRYhe2XsUoDQRCG/5ndu5zEtFpa2MaQgIQYDhEkRMTazicwiI1Yik9gZeUb+ATaiokShEjQUrBNq4Fcsre3VklhEpLLCQdyUw3sz/zf7sDsLhljEGdwrO4JQAKQAACQw+Ql794J4mrUgtoE95uvj3uhAQRx1bGsqP7wlAq1CTlbMj16avBhCbEiWWTm0TeyJZeZDxjUKbbrV5EAekp1+r6/O/D9SjqVupEsxjRPG1trAI4ki7xgdjOOsypZIDAGzVx5vdhu1BYGSEm56mv/zJZWZZJ5M1fed6R161hW+vcaE4GIloEIJ8BEWLLt40nmAEBEh5PMx+osCgAA08zDROxzIAH4vwBK669YAcpvzyffXu+62/fePaXG1nVgHCDiKJ4VxXajNszr2dKpLaQrmPIAYGDOAYCGr+JWYdv80WWEQuuB5tWPWqBN8BnZfYE6oxYorXe6fe8yKoAfBBdh9JR8TBKABCBugB8Ub2v9fEu1zgAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return !item.onLine && item.type == '相机设备';
                })
              },
              {
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAABbElEQVRYhe2XTUsCQRzGn5mdfXE1kQ5JFHjw0NUP4CEIMaJztz5BEl0kAkEFoUOHTp36Bn2C+iAdOgh6CTyEFq66ujv/DmWHVHSdYCH2ucz/8DDPb2aYN0ZECFM81PQIIAKIAACIaWFcZx9JiKJqh8zznsZXzcPAACREUdpx1XzwgRNoEGK5ZbE0p9+UhrFFurGxit+q7eRJ047BeMettG6VALjT7/Dh4ICNhgU/mbonXZ8NrO9mAJxK3ciREHlKbaZJ18GkD7ORybqVdmltAIrF0jR2y9KyC/PCzUbmSNrxB2nHZ9aVuAYwngAUZoC4Bj+RPJsXDgBg/GRe+G8pbcOF4QEU+jkQAfxfADZxP0IFGNVez0X37U577z3zgTNr8H0LUDyKl8mttEvT2qpuX0gzlocQOQBgJC+/2u9XsX6zR390GWFSfmEr+6cF87yWcvoa/fwsAR+7+6zXrasDTKqB/NHHJAKIAMIG+AS4SHJzF0ubAgAAAABJRU5ErkJggg==',
                symbolSize: [24, 24],
                data: this.mapData.filter(function (item) {
                  return item.onLine && item.type == '相机设备';
                })
              },
              {
                name: '数量',
                type: 'scatter',
                coordinateSystem: 'bmap',
                symbol: 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAACxAAAAsQHGLUmNAAAC7UlEQVRYhe1VPUxTURQ+59627/XPigkk1WqLHRyM0cGwgJOTbBWiJg46mLgZOxAjGkqxQRe1MW46yODgYFmMiYMbDG4wGEMMGCJaJEZJH699791373XA1ra0ptA2ZeDb7nnn3u/Led85B6WU0EmQjrLvCQAARysfU8cPDUiH4xIg8VV8EHwVOX9jjH+bqb6DrTChcu/IA6mow8KlRKXTWTMHGQNiGvNoGk/Nsa/PWyJASYUHpUt5wr2+aKN3UHAguj5LTOOykVhZ3rEANXHwot114Jl0uvzFGMnrOtr2DNpsDm22uhmkJ4SiHpMuV79Q1NJ9YhSyVMtd2LEHpEs5VyRHZmlU1zPmnS9X6wpOhsJoGA+F3z8kCQWhuoM0t3565ybkXCV5HVDKRbTMG+bd5bdKKhKXDseQpLS/LFNHzucQ8YU1ujSsTBy+JtyetFRVL0CLTKgmQ2GhqC+F19svCa2Zg4ID0bTX1ujSsJoMhUHwmJHMplsjIBG8yXqCj4tnYhqAjM2DEAHh9kSKnYGCg+PnWtxIZtOl3KbZy4CCg2P99xTVchHr1udT1u3FXsf6rzNUy80CANSqTmsGEaHTzrUsAGDWSH5/BQCgpCJx5Hbm7/AZUMeC94HSHiB0ukJ0O7ahkorEeSDwiBQKi6SQP2skVpbram85OwAA4klJKHCvLwqCx/6bWqyAmgyFhdvzXiI2PNXqglIoDh2S16sJK6ryzwOCx7YzUhuF8HirQ1GiazEASAPs9nWMgm9pHWQMkFkAACBVtWZrbQd1K4DM0mguN4WCVwgieT3BRhaQjSwg2dh41xR7PQEoOFBdz6DNElgo/Cgla9pHa3RponS2zOskr+u13mgUNX+BJBT4vn1XiL4xKLy+7mKcB/YfVyZ7P4CETwAA0u0ZEB7vFpc1LaAkwh/oro7bga4+AOhrhrQcHe+CMgGYRcbaTrjJgdnSuXwXuCaPjgGl59uqgPNMuZHbsoy2g93kgT0BncEfCtJGjwNio9cAAAAASUVORK5CYII=',
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
      //添加鼠标绘制工具监听事件，用于获取绘制结果
      overlaycomplete(e) {
        var allOverlay = this.bMap.getOverlays();
        for (var i = 0; i < allOverlay.length; i++) {
          if (allOverlay[i].toString().indexOf("Polygon") > 0 || allOverlay[i].toString().indexOf("Label") > 0
            || allOverlay[i].toString().indexOf("Circle") > 0) {//删除折线
            this.bMap.removeOverlay(allOverlay[i]);
          }
        }
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
