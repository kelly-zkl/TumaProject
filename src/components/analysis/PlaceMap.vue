<template>
  <div>
    <section class="content">
      <div id="place-map" style="width: 100%;height:550px"></div>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import echarts from "echarts";

  export default {
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
        placeData: [],
        placeList: [],
        serviceTypes: [{value: '0', label: '网吧'}, {value: '1', label: '旅店宾馆类（住宿服务场所）'},
          {value: '2', label: '图书馆阅览室'}, {value: '3', label: '电脑培训中心类'}, {value: '4', label: '娱乐场所类'},
          {value: '5', label: '交通枢纽'}, {value: '6', label: '公共交通工具'}, {value: '7', label: '餐饮服务场所'},
          {value: '8', label: '金融服务场所'}, {value: 'A', label: '购物场所'}, {value: 'B', label: '公共服务场所'},
          {value: 'C', label: '文化服务场所'}, {value: 'D', label: '公共休闲场所'}, {value: '9', label: '其他'}]
      }
    },
    methods: {
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        json.forEach((province) => {
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
      },
      //获取场所类型
      getPlaceType(val) {
        for (let item of this.serviceTypes) {
          if (item.value === val) {
            return item.label;
          }
        }
      },
      //场所地图
      getPlaceData() {
        this.placeData = [];
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          if (data.code === '000000') {
            data.data.list.forEach((item, idx) => {
              let code = item.areaCode ? item.areaCode : item.cityCode ? item.cityCode : item.provinceCode;
              let placeStr = this.getPlaceType(item.placeType);
              let placeArea = this.getAreaLable(code);
              let param = {
                placeName: item.placeName, value: [item.longitude, item.latitude, 1], placeCode: item.placeCode,
                placeStr: placeStr, placeArea: placeArea, detailAddress: item.detailAddress, id: item.id
              };
              this.placeData.push(param);
            });
            this.placeMap();
          }
        }).catch((err) => {
          this.placeData = [];
          this.placeMap();
        });
      },
      placeMap() {
        var _this = this;
        this.clearArea();
        if (this.bMap) {
          this.point = this.bMap.getCenter();
          this.zoom = this.bMap.getZoom();
        }
        if (!this.myChart) {
          var app = {};
          this.myChart = echarts.init(document.getElementById('place-map'));
          let option = {
            animation: false,
            tooltip: {
              trigger: 'item', padding: [5, 10], show: true, //不显示提示标签
              formatter: function (params) {
                var res = '';
                res += '场所名称：' + params.data.placeName + '<br>';
                res += '场所编码：' + params.data.placeCode + '<br>';
                res += '场所类型：' + params.data.placeStr + '<br>';
                res += '场所地区：' + params.data.placeArea + '<br>';
                res += '详细地址：' + params.data.detailAddress + '<br>';
                return res;
              }, //提示标签格式
              backgroundColor: "#070616",//提示标签背景颜色
              textStyle: {color: "#fff", align: 'left'} //提示标签字体颜色
            },
            grid: {left: 0, right: 0, bottom: 0, top: 0, containLabel: true},
            bmap: {center: [116.404, 39.915], zoom: 14, roam: true},
            series: [
              {
                name: '数量', type: 'scatter', symbol: 'pin', symbolSize: 30,
                itemStyle: {color: 'red'}, coordinateSystem: 'bmap', data: []
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
            series: [{name: '数量', type: 'scatter', coordinateSystem: 'bmap', data: this.placeData}]
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
        for (var k = 0; k < this.placeData.length; k++) {
          let isBol = this.InOrOutPolygon(this.placeData[k].value[0], this.placeData[k].value[1]);
          if (isBol) {
            this.placeList.push(this.placeData[k].id);
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
        this.$emit('getPlaceList', this.placeList);
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
        this.placeList = [];
      }
    },
    mounted() {
      this.placeMap();
      this.getPlaceData();
    }
  }
</script>
