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
