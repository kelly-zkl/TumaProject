<template>
  <section style="margin: 0;padding: 0;min-height: 568px">
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
                 v-bind:style="'width:100%;display: block;height:'+((tableHeight-40)*0.30>240?(tableHeight-300):(tableHeight-40)*0.70-20)+'px'"></div>
            <div style="padding: 10px 20px">
              <el-row style="margin: 0;padding: 0">
                <el-col :span="12" style="text-align: center">
                  <div id="camera"
                       v-bind:style="'width: 300px;max-height:240px;height:'+(tableHeight-40)*0.30+'px'"></div>
                </el-col>
                <el-col :span="12" style="text-align: center">
                  <div id="device"
                       v-bind:style="'width: 300px;max-height:240px;height:'+(tableHeight-40)*0.30+'px'"></div>
                </el-col>
              </el-row>
            </div>
          </div>
          <div v-show="activeItem== 'data'">
            <div style="display: block;width:100%;position: relative">
              <div id="dataheat" v-bind:style="'display: block;width:100%; height:'+(tableHeight-40)*0.70+'px'"></div>
              <div style="background: rgba(0, 0, 0, .6);height: 30px;position: absolute;bottom: 0;width: 100%">
                <el-row>
                  <el-col :span="8" align="left" style="text-align: left">
                    <span
                      class="heat-tip-text">根据最近{{systemParam.limitTime}}分钟的采集IMSI数量生成</span>
                  </el-col>
                  <el-col :span="16" align="right" class="heat-tip-color" style="text-align: right">
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
                <el-col :span="8" align="center"
                        v-bind:style="'display:-webkit-box;display:-ms-flexbox;display:flex;align-items: center;flex-direction:column;justify-content:center;height:'+((tableHeight-40)*0.30-20)+'px'">
                  <div class="num-text-tip">
                    <div style="display: block">
                      <div style="color: #fff;font-size: 14px">今日采集IMSI</div>
                      <div style="color: #fff;font-size: 20px;margin-top: 10px">{{addImsiCount}}<span
                        style="color: #fff;font-size: 14px">条</span></div>
                    </div>
                  </div>
                  <div class="num-text-tip" style="margin-top: 10px">
                    <div style="display: block">
                      <div style="color: #fff;font-size: 14px">今日采集人脸</div>
                      <div style="color: #fff;font-size: 20px;margin-top: 10px">{{addFaceCount}}<span
                        style="color: #fff;font-size: 14px">条</span></div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="16" align="center">
                  <div id="imsi" v-bind:style="'width: 500px;height:'+((tableHeight-40)*0.30-20)+'px'"></div>
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
                        v-bind:style="'height:'+(tableHeight*0.56-55)+'px'" @row-click="handleRow">
                <el-table-column align="left" label="人脸" style="align-content: center" min-width="90" max-width="200">
                  <template slot-scope="scope">
                    <div style="height: 80px;line-height:80px">
                      <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath" class="user-img" :onerror="img404"/>
                    </div>
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
  let echarts = require('echarts');
  import {formatDate, encryData, decryData, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'device',
        tableHeight: (window.innerHeight < 628 ? 628 : window.innerHeight) - 80,
        systemParam: {
          refreshTime: 10, limitTime: 30, similarThreshold: 60,
          localPoint: [116.331398, 39.897445], heatRanges: []
        },
        imgList: [],
        mapData: [],//设备实况数据
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
        catchData: {imsi: [], face: [], createTime: []},//近7天采集数据
        warning: {imsi: [], face: [], createTime: []},//近7天告警数据
        hotSpots: [],//热力图数据
        hotPoint: null,//热力图的中心点
        hotZoom: 12,//热力图的放大倍数
        heatMap: null,//热力图的地图
        heatmapOverlay: null,
        intervalid: null, intervalidMap: null,//定时器
        icon: require('../../assets/img/icon.png'),
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        markerClusterer: null, multLat: []
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
      clearInterval(this.intervalidMap);
      this.intervalid = null;
      this.intervalidMap = null;
      this.mapData = null;
      this.hotSpots = null;

      if (this.deviceMap) {
        this.deviceMap.clearOverlays();
        this.deviceMap.removeEventListener("zoomend", this.map);
        this.deviceMap.removeEventListener("dragend", this.map);
        this.deviceMap.removeEventListener("moving");
        this.deviceMap.removeEventListener("zoomend");
        this.markerClusterer.clearMarkers();
        this.markerClusterer = null;
        this.deviceMap = null;
      }

      if (this.heatMap) {
        this.heatMap.clearHotspots();
        this.heatMap.clearOverlays();
        this.heatMap.removeEventListener("zoomend", this.heatZoom);
        this.heatMap.removeEventListener("dragend", this.heatZoom);
        this.heatmapOverlay = null;
        this.heatMap = null;
      }
      let deviceChart = echarts.getInstanceByDom(document.getElementById('devicemap'));
      if (deviceChart) {
        echarts.dispose(deviceChart);
      }
      let cameraPieChart = echarts.getInstanceByDom(document.getElementById('camera'));
      if (cameraPieChart) {
        echarts.dispose(cameraPieChart);
      }
      let devicePieChart = echarts.getInstanceByDom(document.getElementById('device'));
      if (devicePieChart) {
        echarts.dispose(devicePieChart);
      }
      let catchLineChart = echarts.getInstanceByDom(document.getElementById('imsi'));
      if (catchLineChart) {
        echarts.dispose(catchLineChart);
      }
      let warningBarChart = echarts.getInstanceByDom(document.getElementById('warning'));
      if (warningBarChart) {
        echarts.dispose(warningBarChart);
      }
    },
    methods: {
      //定时刷新设备的在线状态
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            if (this.activeItem === 'data') {//热力图
              this.getHotSpot();
            }
            this.getWarningCount();
            this.getImsiList();
            this.getLineData();
          }, this.systemParam.refreshTime * 1000);
        }
      },
      statusMap() {
        if (!this.intervalidMap) {
          this.intervalidMap = setInterval(() => {
            if (this.activeItem === 'device') {
              this.getMapData();
            }
          }, 3 * 60 * 1000);
        }
      },
      //碰撞列表点击跳转档案详情页
      handleRow(row) {
        let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.faceId}});
        window.open(routeData.href, '_blank');
      },
      handleType(val) {
        this.activeItem = val;
        if (val === 'device') {//设备地图
          // this.getDeviceMap();
        } else {//热力图
          if (!this.heatMap) {
            this.initHeatMap();
          }
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
        this.heatMap.clearHotspots();//清空地图所有热区,添加新数据
        let colorRange = {};
        let total = this.systemParam.heatRanges[this.systemParam.heatRanges.length - 1].start;
        this.systemParam.heatRanges.forEach((item) => {
          if (item.end) {
            let ketStr = item.end / total;
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
        this.multLat = [];
        this.$post('/home/getAllDevice', {}).then((data) => {
          if (data.code === '000000') {
            let deviceImsi = data.data.imsiDeviceDistribute;
            let camera = data.data.cameraDeviceDistribute;

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
                this.mapData.push(param);
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
                this.mapData.push(param);
              }
            });
            this.getDeviceMap();
            this.getCamera();
            this.getDevice();
          }
        }).catch((err) => {
          this.mapData = [];
          this.multLat = [];
          this.devicePie = {
            device1: {count: 0, data: [{value: 0, name: '在线'}, {value: 0, name: '离线'}]},
            device2: {count: 0, data: [{value: 0, name: '在线'}, {value: 0, name: '离线'}]}
          };
          this.getDeviceMap();
          this.getCamera();
          this.getDevice();
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
      map() {//地图缩放、移动
        this.deviceMap.centerAndZoom(this.deviceMap.getCenter(), this.deviceMap.getZoom());
        this.mapPoint = this.deviceMap.getCenter();
        this.mapZoom = this.deviceMap.getZoom();
      },
      getDeviceMap() {
        let chart = echarts.getInstanceByDom(document.getElementById('devicemap'));
        if (!chart) {
          chart = echarts.init(document.getElementById('devicemap'));
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
          bmap: {roam: true},
          series: [
            {// 侦码设备不在线
              name: '数量',
              type: 'scatter',
              coordinateSystem: 'bmap',
              symbol: 'diamond',
              symbolSize: [24, 24],
              data: this.mapData.filter((item) => {
                return !item.onLine && item.type == '侦码设备';
              })
            },
            {// 相机设备不在线
              name: '数量',
              type: 'scatter',
              coordinateSystem: 'bmap',
              symbol: 'circle',
              symbolSize: [24, 24],
              data: this.mapData.filter((item) => {
                return !item.onLine && (item.type == '人脸相机' || item.type == '车牌相机');
              })
            },
            {
              name: 'Top 5',
              type: 'effectScatter',
              coordinateSystem: 'bmap',
              symbol: 'circle',
              symbolSize: [24, 24],
              data: this.mapData.filter((item) => {
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
              data: this.mapData.filter((item) => {
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
          this.deviceMap.setMaxZoom(19);
          this.deviceMap.setMapStyle({style: 'midnight'});

          this.deviceMap.addEventListener("zoomend", this.map);
          this.deviceMap.addEventListener("dragend", this.map);
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
      //相机--饼状图
      getCamera() {
        let chart = echarts.getInstanceByDom(document.getElementById('camera'));
        if (!chart) {
          chart = echarts.init(document.getElementById('camera'));
        }
        let option = {
          color: ['#25A4FE', '#F04864'],
          title: {
            text: '相机总数\n\n' + (this.devicePie.device2 ? this.devicePie.device2.count : 0),
            textStyle: {color: '#fff', fontSize: 12},
            top: 'center', left: 'center', bottom: 'center', right: 'center'
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
        chart.setOption(option);
      },
      //侦码设备--饼状图
      getDevice() {
        let chart = echarts.getInstanceByDom(document.getElementById('device'));
        if (!chart) {
          chart = echarts.init(document.getElementById('device'));
        }
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
        chart.setOption(option);
      },
      //图码采集数据--折线图
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
        let chart = echarts.getInstanceByDom(document.getElementById('imsi'));
        if (!chart) {
          chart = echarts.init(document.getElementById('imsi'));
        }
        let option = {
          textStyle: {color: '#CFCFD1'},
          title: {
            text: '近7天采集数量统计', textStyle: {color: '#999', fontSize: '14'}
          },
          grid: {left: 0, right: 0, bottom: 0, top: 30, containLabel: true},
          color: ['#3fa9f5', '#FFBF00'],
          tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
          legend: {textStyle: {color: '#999'}, data: ['IMSI', '人脸'], right: '20'},
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
            name: '人脸',
            type: 'line',//line -> 折线图  bar -> 柱状图
            data: (this.catchData.face ? this.catchData.face : [])
          }]
        };
        chart.setOption(option);
      },
      //今日告警图表
      getWarning() {
        let chart = echarts.getInstanceByDom(document.getElementById('warning'));
        if (!chart) {
          chart = echarts.init(document.getElementById('warning'));
        }
        let option = {
          textStyle: {color: '#CFCFD1'},
          title: {
            text: '近7天告警数量统计',
            textStyle: {color: '#999', fontSize: '14'}
          },
          grid: {left: 0, right: 0, bottom: 0, top: 30, containLabel: true},
          color: ['#3fa9f5', '#FFBF00'],
          tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
          legend: {textStyle: {color: '#999'}, data: ['IMSI', '人脸'], right: '20'},
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
            name: '人脸',
            type: 'bar',//line -> 折线图  bar -> 柱状图
            data: (this.warning.face ? this.warning.face : [])
          }]
        };
        chart.setOption(option);
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      heatZoom() {//热力图缩放、移动
        this.heatMap.centerAndZoom(this.heatMap.getCenter(), this.heatMap.getZoom());
        this.hotPoint = this.heatMap.getCenter();
        this.hotZoom = this.heatMap.getZoom();
      },
      //初始化热力地图
      initHeatMap() {
        this.$nextTick(() => {
          this.heatMap = new BMap.Map("dataheat", {minZoom: 5, maxZoom: 19});// 创建地图实例
          this.heatMap.setMapStyle({style: 'midnight'});
          this.heatMap.centerAndZoom(this.hotPoint, this.hotZoom);
          this.heatMap.enableScrollWheelZoom(true); // 允许滚轮缩放
          this.heatMap.enableDragging();

          this.heatMap.addEventListener("zoomend", this.heatZoom);
          this.heatMap.addEventListener("dragend", this.heatZoom);

          let colorRange = {};
          let total = this.systemParam.heatRanges[this.systemParam.heatRanges.length - 1].start;
          this.systemParam.heatRanges.forEach((item) => {
            if (item.end) {
              let ketStr = item.end / total;
              colorRange[ketStr] = item.color;
            }
          });
          if (!this.heatmapOverlay) {
            this.heatmapOverlay = new BMapLib.HeatmapOverlay({"radius": 20});
            this.heatMap.addOverlay(this.heatmapOverlay);
            this.heatmapOverlay.setOptions({gradient: colorRange});
            this.heatmapOverlay.show();//显示热力图
          }

          this.heatmapOverlay.setDataSet({data: [], max: total});
        });
      }
    },
    mounted() {
      let conPara = JSON.parse(decryData(sessionStorage.getItem("system")));
      if (conPara) {
        this.systemParam = conPara;
      }
      this.hotPoint = new BMap.Point(this.systemParam.localPoint[0], this.systemParam.localPoint[1]);
      this.mapPoint = new BMap.Point(this.systemParam.localPoint[0], this.systemParam.localPoint[1]);

      let arr = this.set7adyData([]);
      this.warning = this.getLast7Days(arr);
      this.catchData = this.getLast7Days(arr);
      // 初始化地图个表格
      this.getDeviceMap();
      this.getCamera();
      this.getDevice();
      this.getImsiFace();
      this.getWarning();
      // //获取概览数据
      this.getMapData();
      this.getWarningCount();
      this.getImsiList();
      this.getLineData();
      //定时请求数据==>10s请求一次
      this.statusTask();
      this.statusMap();//地图数据3分钟请求一次
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
    vertical-align: middle;
  }

  .heat-tip-content {
    display: inline-block;
    text-align: left;
    color: #fff;
    font-size: 12px;
    margin: 0 8px 0 2px;
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
    font-size: 12px;
    margin-left: 8px;
    line-height: 30px;
    height: 30px
  }

  .dot-heat {
    height: 10px;
    width: 10px;
    border-radius: 5px;
    display: inline-block;
  }

  .num-text-tip {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, .3);
    border-radius: 6px;
    text-align: center;
    width: 160px;
    padding: 15px 20px
  }
</style>
