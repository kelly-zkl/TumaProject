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
      <div style="padding-top: 5px;text-align: left" v-show="getButtonVial('deviceMap:search')">
        <el-autocomplete class="inline-input" v-model="queryParam" :fetch-suggestions="querySearch"
                         placeholder="场所名称/设备ID" @select="handleSelect" clearable>
          <el-select v-model="queryType" slot="prepend" placeholder="请选择" @change="handleChange">
            <el-option label="场所" value="place"></el-option>
            <el-option label="设备" value="device"></el-option>
          </el-select>
          <template slot-scope="{ item }">
            <div class="name" style="margin-bottom: 0">{{item.name}}</div>
            <div class="addr">{{item.detailAddress?item.detailAddress:'--'}}</div>
          </template>
        </el-autocomplete>
      </div>
    </section>
  </div>
</template>
<script>
  let echarts = require('echarts');
  import {buttonValidator, encryData, decryData} from "../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        query: {code: [true, false], camera: [true, false]},
        deviceImsi: {}, icon: require('../../assets/img/icon.png'),
        camera: {}, systemParam: {}, drawingManager: null, deviceMap: null,
        mapPoint: null, mapZoom: 12, ply: null,//多边形
        styleOptions: {
          strokeColor: "#FF6600",    //边线颜色。
          fillColor: "#FF6600",      //填充颜色。当参数为空时，圆形将没有填充效果。
          strokeWeight: 3,       //边线的宽度，以像素为单位。
          strokeOpacity: 0.4,	   //边线透明度，取值范围0 - 1。
          fillOpacity: 0.15,      //填充的透明度，取值范围0 - 1。
          strokeStyle: 'solid' //边线的样式，solid或dashed。
        },
        mapData: [], intervalid: null, markerClusterer: null, queryParam: '',
        queryType: 'place', results: [], multLat: [], resultCopy: []
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
      this.deviceMap.removeEventListener("zoomend", this.map);
      this.deviceMap.removeEventListener("dragend", this.map);
      this.drawingManager.removeEventListener('overlaycomplete', this.overlaycomplete);
      this.deviceMap.clearOverlays();
      this.markerClusterer.clearMarkers();
      this.intervalid = null;
      this.ply = null;
      this.drawingManager = null;
      this.markerClusterer = null;
      this.deviceMap = null;
      this.mapPoint = null;
      let chart = echarts.getInstanceByDom(document.getElementById('view-map'));
      if (chart) {
        echarts.dispose(chart);
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleChange(val) {
        this.queryParam = '';
        if (this.getButtonVial('deviceMap:search')) {
          this.$post("deviceMap/search", {type: this.queryType, content: this.queryParam}).then((data) => {
            this.results = data.data;
            this.resultCopy = Object.assign([], this.results);
          }).catch((err) => {
            this.results = [];
            this.resultCopy = [];
          });
        }
      },
      querySearch(queryString, cb) {
        if (this.queryParam.length > 0) {
          let result = [];
          this.resultCopy.forEach((item) => {
            let m = PinyinMatch.match(item.name, this.queryParam);
            if (m) {
              result.push(item);
            }
          });
          this.results = result;
          cb(this.results);
        } else {
          this.results = this.resultCopy;
          cb(this.results);
        }
      },
      handleSelect(item) {
        this.queryParam = item.name;
        if (item.longitude && item.latitude) {//场所、设备有经纬度时才可以定位
          this.mapZoom = 19;
          this.mapPoint = new BMap.Point(item.longitude, item.latitude);
          this.deviceMap.setZoom(this.mapZoom);
          this.deviceMap.panTo(this.mapPoint);
        }
      },
      //定时刷新设备的在线状态--3分钟刷新一次
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getMapData();
          }, 3 * 60 * 1000);
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
        this.multLat = [];
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
                let lat = [item.devicePos.longitude, item.devicePos.latitude, 1];
                let num = this.setLatLonap(item.devicePos.longitude, item.devicePos.latitude);
                if (num == 1) {
                  lat = [item.devicePos.longitude + 0.00015, item.devicePos.latitude, 1];
                } else if (num == 2) {
                  lat = [item.devicePos.longitude, item.devicePos.latitude + 0.00015, 1];
                } else if (num == 3) {
                  lat = [item.devicePos.longitude - 0.00015, item.devicePos.latitude, 1];
                } else if (num == 4) {
                  lat = [item.devicePos.longitude, item.devicePos.latitude - 0.00015, 1];
                } else if (num == 5) {
                  lat = [item.devicePos.longitude + 0.00015, item.devicePos.latitude + 0.00015, 1];
                } else if (num == 6) {
                  lat = [item.devicePos.longitude + 0.00015, item.devicePos.latitude - 0.00015, 1];
                } else if (num == 7) {
                  lat = [item.devicePos.longitude - 0.00015, item.devicePos.latitude + 0.00015, 1];
                } else if (num == 8) {
                  lat = [item.devicePos.longitude - 0.00015, item.devicePos.latitude - 0.00015, 1];
                }
                let param = {
                  value: lat, deviceName: item.deviceName, deviceId: item.deviceId,
                  type: '侦码设备', onLine: onLine, placeName: item.placeName
                };
                this.multLat.push({value: [item.devicePos.longitude, item.devicePos.latitude]});
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
              if (item.longitude && item.latitude) {
                let onLine = true;
                if (item.status !== 0) {
                  onLine = false;
                }
                let lat = [item.longitude, item.latitude, 1];
                let num = this.setLatLonap(item.longitude, item.latitude);
                if (num == 1) {
                  lat = [item.longitude + 0.00015, item.latitude, 1];
                } else if (num == 2) {
                  lat = [item.longitude, item.latitude + 0.00015, 1];
                } else if (num == 3) {
                  lat = [item.longitude - 0.00015, item.latitude, 1];
                } else if (num == 4) {
                  lat = [item.longitude, item.latitude - 0.00015, 1];
                } else if (num == 5) {
                  lat = [item.longitude + 0.00015, item.latitude + 0.00015, 1];
                } else if (num == 6) {
                  lat = [item.longitude + 0.00015, item.latitude - 0.00015, 1];
                } else if (num == 7) {
                  lat = [item.longitude - 0.00015, item.latitude + 0.00015, 1];
                } else if (num == 8) {
                  lat = [item.longitude - 0.00015, item.latitude - 0.00015, 1];
                }
                let param = {
                  value: lat, deviceName: item.name, deviceId: item.cameraCode, placeName: item.placeName,
                  onLine: onLine, type: item.cameraType == 1 ? '车牌相机' : '人脸相机'
                };
                this.multLat.push({value: [item.longitude, item.latitude]});
                if (this.query.camera.length === 2) {
                  this.mapData.push(param);
                } else if (this.query.camera.length === 1) {
                  if (onLine === this.query.camera[0]) {
                    this.mapData.push(param);
                  }
                }
              }
            });

            this.deviceMapData();
          }
        }).catch((err) => {
          this.mapData = [];
          this.multLat = [];
          this.deviceMapData();
        });
      },
      setLatLonap(x, y) {
        let a = 0;
        if (this.multLat.length > 0) {
          this.multLat.forEach((item) => {
            if (item.value[0] == x && item.value[1] == y) {
              a = a + 1;
            }
          });
        }
        return a;
      },
      deviceMapData() {
        let _this = this;
        let chart = echarts.getInstanceByDom(document.getElementById('view-map'));
        if (!chart) {
          chart = echarts.init(document.getElementById('view-map'));
        }
        let option = {
          animation: false,
          tooltip: {
            trigger: 'item',
            padding: [5, 10],
            show: true, //不显示提示标签
            formatter: function (params) {
              let res = '';
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
          bmap: {center: [this.mapPoint.lng, this.mapPoint.lat], zoom: this.mapZoom, roam: true},
          series: [
            {// 侦码设备不在线
              name: '数量',
              type: 'scatter',
              coordinateSystem: 'bmap',
              symbol: 'diamond',
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
              symbolSize: [24, 24],
              data: this.mapData.filter(function (item) {
                return !item.onLine && (item.type == '人脸相机' || item.type == '车牌相机');
              })
            },
            {
              name: 'Top 5',
              type: 'effectScatter',
              coordinateSystem: 'bmap',
              symbol: 'circle',
              symbolSize: [24, 24],
              data: this.mapData.filter(function (item) {
                return item.onLine && (item.type == '人脸相机' || item.type == '车牌相机');
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
        };
        chart.setOption(option);
        if (this.deviceMap) {
          this.mapPoint = this.deviceMap.getCenter();
          this.mapZoom = this.deviceMap.getZoom();
        } else {
          this.deviceMap = chart.getModel().getComponent('bmap').getBMap();
          this.deviceMap.enableScrollWheelZoom(true);
          this.deviceMap.enableDragging();
          this.deviceMap.setMinZoom(5);
          this.deviceMap.setMaxZoom(20);

          let bottom_right_control = new BMap.ScaleControl({
            anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
            offset: new BMap.Size(20, 10),
          });// 右下角，添加比例尺
          this.deviceMap.addControl(bottom_right_control);

          this.deviceMap.addEventListener("zoomend", this.map);
          this.deviceMap.addEventListener("dragend", this.map);

          let myDis = new BMapLib.DistanceTool(this.deviceMap);

          //测距工具
          function RulerControl() {
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
            this.defaultOffset = new BMap.Size(120, 10);
          }

          // 通过JavaScript的prototype属性继承于BMap.Control
          RulerControl.prototype = new BMap.Control();
          RulerControl.prototype.initialize = function (map) {
            // 创建一个DOM元素
            let div = document.createElement("div");
            // 设置样式
            div.className = "div-delete div-ruler";
            // 绑定事件,点击之后开始测距
            div.onclick = function (e) {
              myDis.open();
            };
            // 添加DOM元素到地图中
            _this.deviceMap.getContainer().appendChild(div);
            // 将DOM元素返回
            return div;
          };
          // 创建控件
          let myRulerControl = new RulerControl();
          // 添加到地图当中
          this.deviceMap.addControl(myRulerControl);

          //实例化鼠标绘制工具
          this.drawingManager = new BMapLib.DrawingManager(_this.deviceMap, {
            isOpen: false, //是否开启绘制模式
            enableDrawingTool: true, //是否显示工具栏
            drawingToolOptions: {
              anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
              offset: new BMap.Size(80, 5), //偏离值
              drawingModes: [BMAP_DRAWING_CIRCLE, BMAP_DRAWING_POLYGON, BMAP_DRAWING_RECTANGLE]
            },
            circleOptions: _this.styleOptions, //圆的样式
            polygonOptions: _this.styleOptions, //多边形的样式
            rectangleOptions: _this.styleOptions //矩形的样式
          });
          //添加鼠标绘制工具监听事件，用于获取绘制结果
          this.drawingManager.addEventListener('overlaycomplete', this.overlaycomplete);

          // 定义一个控件类,即function
          function DeleteControl() {
            // 默认停靠位置和偏移量
            this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
            this.defaultOffset = new BMap.Size(20, 5);
          }

          // 通过JavaScript的prototype属性继承于BMap.Control
          DeleteControl.prototype = new BMap.Control();

          // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
          // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
          DeleteControl.prototype.initialize = function (map) {
            // 创建一个DOM元素
            let div = document.createElement("div");
            // 设置样式
            div.className = "div-delete el-icon-delete";
            // 绑定事件,点击一次放大两级
            div.onclick = function (e) {
              _this.removePoly();
            };
            // 添加DOM元素到地图中
            _this.deviceMap.getContainer().appendChild(div);
            // 将DOM元素返回
            return div;
          };
          // 创建控件
          let myZoomCtrl = new DeleteControl();
          // 添加到地图当中
          this.deviceMap.addControl(myZoomCtrl);
        }
        this.deviceMap.centerAndZoom(this.mapPoint, this.mapZoom);

        this.getMarkNumber();
      },
      //点聚合功能
      getMarkNumber() {
        let markers = [];
        for (let i = 0; i < this.mapData.length; i++) {
          let pt = new BMap.Point(this.mapData[i].value[0], this.mapData[i].value[1]);
          let myIcon = new BMap.Icon(this.icon, new BMap.Size(1, 1));
          markers.push(new BMap.Marker(pt, {icon: myIcon}));
        }
        if (!this.markerClusterer) {
          this.markerClusterer = new BMapLib.MarkerClusterer(this.deviceMap, {
            markers: markers,
            gridSize: 40,
            maxZoom: 17
          });
        } else {
          this.markerClusterer.clearMarkers();
          this.markerClusterer.addMarkers(markers);
        }
      },
      map() {//缩放、移动
        this.deviceMap.centerAndZoom(this.deviceMap.getCenter(), this.deviceMap.getZoom());
        this.mapPoint = this.deviceMap.getCenter();
        this.mapZoom = this.deviceMap.getZoom();
      },
      //生成多边形
      polygon(path) {
        let pts = [];
        let pt;
        for (let j = 0; j < path.length; j++) {
          pt = new BMap.Point(path[j].lng, path[j].lat);
          pts.push(pt);
        }
        this.ply = new BMap.Polygon(pts, this.styleOptions);
        this.deviceMap.addOverlay(this.ply);
      },
      //判断点是否在多边形内
      /**
       * @return {boolean}
       */
      InOrOutPolygon(lng, lat) {
        let bol = false;
        let pt = new BMap.Point(lng, lat);
        let result = BMapLib.GeoUtils.isPointInPolygon(pt, this.ply);
        if (result) {//在内部，把该点显示在地图上
          bol = true;
        }
        return bol;
      },
      //删除多边形
      removePoly() {
        if (this.deviceMap) {
          let allOverlay = this.deviceMap.getOverlays();
          for (let i = 0; i < allOverlay.length; i++) {
            if (allOverlay[i].toString().indexOf("Polygon") > 0 || allOverlay[i].toString().indexOf("Label") > 0
              || allOverlay[i].toString().indexOf("Circle") > 0 || allOverlay[i].toString().indexOf("Marker") > 0
              || allOverlay[i].toString().indexOf("Polyline") > 0) {//删除折线
              this.deviceMap.removeOverlay(allOverlay[i]);
            }
          }
        }
      },
      //添加鼠标绘制工具监听事件，用于获取绘制结果
      overlaycomplete(e) {
        this.drawingManager.close();
        // this.removePoly();
        let path = e.overlay.getPath();//Array<Point> 返回多边型的点数组
        //生成多边形
        this.polygon(path);
        let num1 = 0, num2 = 0, num3 = 0, num4 = 0;
        for (let k = 0; k < this.mapData.length; k++) {
          let device = this.mapData[k];
          let isBol = this.InOrOutPolygon(device.value[0], device.value[1]);
          if (device.type == '侦码设备') {//侦码
            if (device.onLine) {//在线
              num1 = (isBol ? num1 + 1 : num1);
            } else {
              num2 = (isBol ? num2 + 1 : num2);
            }
          }
          if (device.type == '人脸相机' || device.type == '车牌相机') {//相机
            if (device.onLine) {//在线
              num3 = (isBol ? num3 + 1 : num3);
            } else {
              num4 = (isBol ? num4 + 1 : num4);
            }
          }
        }
        let opts = {
          position: this.ply.getBounds().getCenter(),    // 指定文本标注所在的地理位置
          offset: new BMap.Size(0, 0)    //设置文本偏移量
        };
        let str = "<span style='color: #fff;font-size: 12px;word-break:normal;white-space:pre-warp;word-wrap:break-word'>" +
          "侦码(" + (num1 + num2) + "):在线" + num1 + "、离线" + num2 + "<br/>相机(" + (num3 + num4) + "):在线" + num3 + "、离线" + num4 + "</span>";
        // let str = "侦码(" + (num1 + num2) + "):在线" + num1 + "、离线" + num2 + "，相机(" + (num3 + num4) + "):在线" + num3 + "、离线" + num4;
        let label = new BMap.Label(str, opts);  // 创建文本标注对象
        label.setStyle({
          color: "#fff", backgroundColor: "black", border: 'none', fontSize: "12px", borderRadius: '3px',
          opacity: 0.8, lineHeight: "20px", fontFamily: "微软雅黑", padding: '0 5px'
        });
        this.deviceMap.addOverlay(label);
      }
    },
    mounted() {
      this.systemParam = JSON.parse(decryData(sessionStorage.getItem("system")));
      this.mapPoint = new BMap.Point(this.systemParam.localPoint[0], this.systemParam.localPoint[1]);
      this.handleChange();
      this.deviceMapData();
      this.getMapData();
      this.statusTask();
    }
  }
</script>
<style scoped>
  .view-map {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 100px;
    color: #fff;
    font-size: 30px;
  }

  .content .view-top {
    position: absolute;
    top: 60px;
    right: 0;
    width: 100%;
  }

  .name {
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 14px;
    color: #343434;
    height: 22px;
    line-height: 22px;
    padding-top: 7px;
  }

  .addr {
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
    color: #999;
    height: 18px;
    line-height: 18px;
    padding-bottom: 7px;
  }
</style>
