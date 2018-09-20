<template>
  <div>
    <div
      style="position: absolute;top: 82px;bottom: 20px;background: #21206C;border-radius: 6px;right: 40%;left: 1%">
      <el-row style="border-bottom: 3px #080652 solid;height: 60px;line-height: 60px">
        <el-col :span="24">
          <span v-bind:class="activeItem== 'device'?'map-tap-active':'map-tap'"
                @click="handleType('device')">设备分布实况</span>
          <span v-bind:class="activeItem== 'data'?'map-tap-active':'map-tap'" @click="handleType('data')">实时数据热力图</span>
        </el-col>
      </el-row>
      <div v-show="activeItem== 'device'">
        <div style="position: absolute;top: 63px;bottom: 28%;left: 0;right: 10px">
          <div id="devicemap" style="width:100%; height: 100%"></div>
        </div>
        <div style="position: absolute;top: 72%;bottom: 0;left: 0;right: 0;border-top: 3px #080652 solid">
          <el-row style="border-bottom: 1px #3D3D8D solid">
            <el-col :span="24" align="left">
              <span class="header-title" style=" height: 50px;line-height: 50px">设备实况</span>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <div id="camera" style="width: 300px;height: 180px"></div>
            </el-col>
            <el-col :span="12">
              <div id="device" style="width: 300px;height: 180px"></div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div v-show="activeItem== 'data'">
        <div style="position: absolute;top: 63px;bottom: 37%;left: 0;right: 0">
          <div id="dataheat" style="width:100%; height:100%;position: absolute;left: 0"></div>
        </div>
        <div style="position: absolute;top: 63%;bottom: 0;left: 0;right: 0;border-top: 3px #080652 solid">
          <el-row style="border-bottom: 1px #3D3D8D solid">
            <el-col :span="24" align="left">
              <span class="header-title" style=" height: 50px;line-height: 50px">图码抓取数据</span>
            </el-col>
          </el-row>
          <el-row style="position: absolute;left: 20px;right: 20px;top: 71px;bottom:20px">
            <el-col :span="8" align="center">
              <div
                style="background: #060450;border-radius: 4px;height: 60px;width: 160px; margin-top: 10px;padding: 20px">
                <div style="color: #fff;font-size: 14px">今日新增IMSI</div>
                <br/>
                <div style="color: #fff;font-size: 20px">{{addImsiCount}}<span
                  style="color: #fff;font-size: 14px">条</span></div>
              </div>
              <div
                style="background: #060450;border-radius: 4px;height: 60px;width: 160px;margin-top: 20px;padding: 20px">
                <div style="color: #fff;font-size: 14px">今日新增图像</div>
                <br/>
                <div style="color: #fff;font-size: 20px">{{addFaceCount}}<span
                  style="color: #fff;font-size: 14px">条</span></div>
              </div>
            </el-col>
            <el-col :span="16" align="center">
              <div id="imsi" style="width: 500px;height: 230px"></div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div style="position: absolute;top: 82px;bottom: 20px;right: 1%;left: 61%">
      <!--今日告警 柱状图-->
      <div style="background: #21206C;border-radius: 6px;position: absolute;top: 0;bottom: 50%;left: 0;right: 0">
        <el-row style="border-bottom: 1px #3D3D8D solid">
          <el-col :span="12" align="left">
            <span class="header-title">今日告警</span>
          </el-col>
          <el-col :span="12" align="right">
            <span class="header-content">{{warningCount}}</span>
            <span class="header-unit">次</span>
          </el-col>
        </el-row>
        <div id="warning" style="position: absolute;top: 71px;bottom: 20px;left: 20px;right:20px"></div>
      </div>
      <!--今日图码碰撞 列表-->
      <div style="background: #21206C;border-radius: 6px;position: absolute;top: 52%;bottom: 0;left: 0;right: 0">
        <el-row style="border-bottom: 1px #3D3D8D solid">
          <el-col :span="12" align="left">
            <span class="header-title">今日图码碰撞</span>
          </el-col>
          <el-col :span="12" align="right">
            <span class="header-content">{{collCount}}</span>
            <span class="header-unit">次</span>
          </el-col>
        </el-row>
        <div class="overview">
          <el-table :data="imgList" :header-cell-style="{background:'#100E5A'}" stripe>
            <el-table-column align="left" label="图像">
              <template slot-scope="scope">
                <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath" class="user-img"/>
              </template>
            </el-table-column>
            <el-table-column align="left" label="IMSI" prop="imsiList"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="置信度" prop="levl"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" label="碰撞时间" prop="upTime"
                             :formatter="formatterAddress"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import echarts from "echarts";
  import china from "echarts/map/js/china";
  import anhui from "echarts/map/js/province/anhui";
  import aomen from "echarts/map/js/province/aomen";
  import beijing from "echarts/map/js/province/beijing";
  import chongqing from "echarts/map/js/province/chongqing";
  import fujian from "echarts/map/js/province/fujian";
  import gansu from "echarts/map/js/province/gansu";
  import guangdong from "echarts/map/js/province/guangdong";
  import guangxi from "echarts/map/js/province/guangxi";
  import guizhou from "echarts/map/js/province/guizhou";
  import hainan from "echarts/map/js/province/hainan";
  import hebei from "echarts/map/js/province/hebei";
  import heilongjiang from "echarts/map/js/province/heilongjiang";
  import henan from "echarts/map/js/province/henan";
  import hubei from "echarts/map/js/province/hubei";
  import hunan from "echarts/map/js/province/hunan";
  import jiangsu from "echarts/map/js/province/jiangsu";
  import jiangxi from "echarts/map/js/province/jiangxi";
  import jilin from "echarts/map/js/province/jilin";
  import liaoning from "echarts/map/js/province/liaoning";
  import neimenggu from "echarts/map/js/province/neimenggu";
  import ningxia from "echarts/map/js/province/ningxia";
  import qinghai from "echarts/map/js/province/qinghai";
  import shandong from "echarts/map/js/province/shandong";
  import shanghai from "echarts/map/js/province/shanghai";
  import shanxi from "echarts/map/js/province/shanxi";
  import shanxi1 from "echarts/map/js/province/shanxi1";
  import sichuan from "echarts/map/js/province/sichuan";
  import taiwan from "echarts/map/js/province/taiwan";
  import tianjin from "echarts/map/js/province/tianjin";
  import xianggang from "echarts/map/js/province/xianggang";
  import xinjiang from "echarts/map/js/province/xinjiang";
  import xizang from "echarts/map/js/province/xizang";
  import yunnan from "echarts/map/js/province/yunnan";
  import zhejiang from "echarts/map/js/province/zhejiang";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'device',
        indx: 1,
        imgList: [],
        deviceImsi: {},
        camera: {},
        mapData: [],
        devicePie: {},
        warningCount: 0,
        addImsiCount: 0,
        addFaceCount: 0,
        collCount: 0,
        catchData: {},
        warning: {},
        hotSpots: [],
        isChina: true,
        intervalid: null,
        imgPath: require('../../assets/img/icon_people.png')
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
            this.getHotSpot();
            this.getMapData();
            this.getWarningCount();
            this.getImsiList();
            this.getLineData();
          }, 5000);
        }
      },
      handleType(val) {
        this.activeItem = val;
        if (val === 'device') {//设备地图
          this.getMapData();
        } else {//热力图
          this.getHotSpot();
        }
      },
      //从数据库获取一定数量的图码碰撞记录数据展示在首页上
      getImsiList() {
        this.$post('/home/getTodayCollideList', {num: 10}).then((data) => {
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
        this.$post('/home/getHotSpot', {num: 60}).then((data) => {
          if (data.code === '000000') {
            if (data.data.face && data.data.face.length > 0) {
              data.data.face.forEach((item, idx) => {
                let param = {value: [item.lon, item.lat, item.total]};
                this.hotSpots.push(param);
              });
            }
            if (data.data.imsi && data.data.imsi.length > 0) {
              data.data.imsi.forEach((item, idx) => {
                let param = {value: [item.lon, item.lat, item.total]};
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
        var app = {};

        let myChart = echarts.init(document.getElementById('dataheat'));
        let option = {
          animation: false,
          grid: {left: 0, right: 0, bottom: 0, top: 0, containLabel: true},
          bmap: {
            center: [116.404, 39.915],
            zoom: 11,
            roam: true
          },
          visualMap: {
            show: false,
            min: 0,       		// 值域最小值，必须参数
            max: 200,			// 值域最大值，必须参数
            calculable: true,	// 是否启用值域漫游
            inRange: {
              color: ['#50a3ba', '#75B755', '#eac736', '#d94e5d']
              // 指定数值从低到高时的颜色变化
            },
            textStyle: {
              color: '#fff'	// 值域控件的文本颜色
            },
            itemWidth: 0,
            itemHeight: 0,
            backgroundColor: 'rgba(0,0,0,0)'
          },
          series: [
            {
              name: '数量', // series名称
              type: 'heatmap',
              coordinateSystem: 'bmap',
              data: this.hotSpots
            }
          ]
        };
        myChart.setOption(option);
        if (!app.inNode) {
          // 添加百度地图插件
          // 添加百度地图插件
          var bmap = myChart.getModel().getComponent('bmap').getBMap();
          var mapType1 = new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]});
          var mapType2 = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});

          var overView = new BMap.OverviewMapControl();
          bmap.addControl(mapType1);          //2D图，卫星图
          bmap.addControl(mapType2);          //左上角，默认地图控件
          bmap.addControl(overView);          //添加默认缩略地图控件

          //定位l
          var point = new BMap.Point(116.331398, 39.897445);
          bmap.centerAndZoom(point, 12);

          function myFun(result) {
            var cityName = result.name;
            bmap.setCenter(cityName);
          }

          var myCity = new BMap.LocalCity();
          myCity.get(myFun);
        }
      },
      //设备地图
      getMapData() {
        this.$post('/home/getAllDevice', {}).then((data) => {
          if (data.code === '000000') {
            this.deviceImsi = data.data.imsiDeviceDistribute;
            this.camera = data.data.cameraDeviceDistribute;

            let device1 = {
              count: this.deviceImsi.count,
              data: [{value: this.deviceImsi.onlineCount, name: '在线'},
                {value: this.deviceImsi.offlineCount, name: '离线'}]
            };
            let device2 = {
              count: this.camera.count,
              data: [{value: this.camera.onlineCount, name: '在线'}, {value: this.camera.offlineCount, name: '离线'}]
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
                  deviceName: item.deviceName, deviceId: item.deviceId, type: '侦码设备', onLine: onLine
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
                deviceId: item.cameraCode, onLine: onLine, type: '相机设备'
              };
              this.mapData.push(param);
            });
            this.getDeviceMap();
            this.getCamera();
            this.getDevice();
          }
        }).catch((err) => {
          this.deviceImsi = {};
          this.camera = {};
          this.mapData = [];
          this.devicePie = {};
          this.getDeviceMap();
          this.getCamera();
          this.getDevice();
        });
      },
      getDeviceMap() {
        let _this = this;
        let myChart = echarts.init(document.getElementById('devicemap'));
        // myChart.clear();
        let option = {
          backgroundColor: "#21206C",
          tooltip: {
            trigger: 'item',
            show: true, //不显示提示标签
            formatter: function (params) {
              return '设备：' + params.data.deviceName + '<br/> ID：' + params.data.deviceId +
                '<br/> 类型：' + params.data.type + '<br/> 状态：' + (params.data.onLine ? "在线" : "离线");
            }, //提示标签格式
          },
          grid: {left: 0, right: 0, bottom: 0, containLabel: true},
          geo: {
            map: 'china',
            zoom: 1.25,
            selectedMode: 'single',
            silent: true,
            roam: true,
            label: {
              normal: {
                show: true,//显示省份标签
                textStyle: {color: "#6D6C98"}//省份标签字体颜色
              },
              emphasis: {//对应的鼠标悬浮效果
                show: true,
                textStyle: {color: "#fff"}
              }
            },
            itemStyle: {
              normal: {
                borderWidth: .5,//区域边框宽度
                borderColor: '#9BABFD',//区域边框颜色
                areaColor: "#222D73",//区域颜色
              },
              emphasis: {
                borderWidth: .5,
                borderColor: '#9BABFD',
                areaColor: "#100E5A",
              }
            }
          },
          series: [
            {
              name: '数量', // series名称
              type: 'scatter', // series图表类型
              coordinateSystem: 'geo', // series坐标系类型
              symbolSize: 15,
              itemStyle: {
                color: '#FF6600'
              },
              data: this.mapData
            },
            {
              name: 'Top 5',
              type: 'effectScatter',
              coordinateSystem: 'geo',
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
                color: '#29A75D',
                shadowBlur: 10,
                shadowColor: '#333'
              },
              zlevel: 1
            }
          ]
        };
        myChart.setOption(option);
        //下钻其实就是点击事件，切换脚本而已
        myChart.on('click', function (chinaParam) {
          var option1 = myChart.getOption();
          if (_this.isChina) {
            _this.isChina = false;
            option1.geo[0].map = chinaParam.name;
          } else {
            _this.isChina = true;
            option1.geo[0].map = 'china';
          }
          myChart.setOption(option1);
        });
      },
      //相机--饼状图
      getCamera() {
        let myChart = echarts.init(document.getElementById('camera'));
        // myChart.clear();
        let option = {
          color: ['#2CA85C', '#F04864'],
          title: {
            text: '相机总数\n\n' + (this.devicePie.device2 ? this.devicePie.device2.count : 0),
            textStyle: {color: '#fff', fontSize: '14'}, top: 'center', left: 'center', bottom: 'center', right: 'center'
          },
          tooltip: {trigger: 'item', formatter: "{a} <br/>{b}: {c} ({d}%)"},
          legend: {textStyle: {color: '#999'}, orient: 'vertical', x: 'right', data: ['在线', '离线']},
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
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      },
      //侦码设备--饼状图
      getDevice() {
        let myChart = echarts.init(document.getElementById('device'));
        // myChart.clear();
        let option = {
          color: ['#2CA85C', '#F04864'],
          title: {
            text: '侦码仪总数\n\n' + (this.devicePie.device1 ? this.devicePie.device1.count : 0),
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
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      },
      //图码抓取数据--折线图
      getLineData() {
        this.$post('/home/countLast7DayFaceImsi', {}).then((data) => {
          if (data.code === '000000') {
            this.catchData = {imsi: [], face: [], createTime: []};
            data.data.forEach((item, idx) => {
              this.catchData.imsi[idx] = item.imsi;
              this.catchData.face[idx] = item.face;
              this.catchData.createTime[idx] = formatDate(new Date(item.createTime), 'yyyy-MM-dd');
            });
            this.getImsiFace();
          }
        }).catch((err) => {
          this.catchData = {imsi: [], face: [], createTime: []};
          this.getImsiFace();
        });
        this.$post('/home/countLast7DayWarnings', {}).then((data) => {
          if (data.code === '000000') {
            this.warning = {imsi: [], face: [], createTime: []};
            data.data.forEach((item, idx) => {
              this.warning.imsi[idx] = item.imsi;
              this.warning.face[idx] = item.face;
              this.warning.createTime[idx] = formatDate(new Date(item.createTime), 'yyyy-MM-dd');
            });
            this.getWarning();
          }
        }).catch((err) => {
          this.warning = {imsi: [], face: [], createTime: []};
          this.getWarning();
        });
      },
      getImsiFace() {
        // 基于准备好的dom，初始化echarts实例
        let myChart = echarts.init(document.getElementById('imsi'));
        // myChart.clear();
        // 指定图表的配置项和数据
        let option = {
          textStyle: {color: '#6D6C98'},
          title: {
            text: '近7天抓取数量统计',
            textStyle: {color: '#999', fontSize: '14'}
          },
          grid: {left: 0, right: 0, bottom: 0, containLabel: true},
          color: ['#66CCFF', '#FFBF00'],
          tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
          legend: {textStyle: {color: '#999'}, data: ['IMSI', '图像'], right: '20'},
          xAxis: {
            data: this.catchData.createTime,
            axisLine: {show: true, lineStyle: {color: '#6D6C98'}}
          },
          yAxis: {
            axisLine: {show: true, lineStyle: {color: '#6D6C98'}},
            splitLine: {lineStyle: {color: ['#6D6C98'], type: 'dashed'}}
          },
          series: [{
            name: 'IMSI',
            type: 'line',//line -> 折线图  bar -> 柱状图
            data: this.catchData.imsi
          }, {
            name: '图像',
            type: 'line',//line -> 折线图  bar -> 柱状图
            data: this.catchData.face
          }]
        };
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      },
      //今日告警图表
      getWarning() {
        // 基于准备好的dom，初始化echarts实例
        let myChart = echarts.init(document.getElementById('warning'));
        // myChart.clear();
        // 指定图表的配置项和数据
        let option = {
          textStyle: {color: '#6D6C98'},
          title: {
            text: '近7天告警数量统计',
            textStyle: {color: '#999', fontSize: '14'}
          },
          grid: {left: 0, right: 0, bottom: 0, containLabel: true},
          color: ['#2FC25B', '#FFBF00'],
          tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
          legend: {textStyle: {color: '#999'}, data: ['IMSI', '图像'], right: '20'},
          xAxis: {
            data: this.warning.createTime,
            axisLine: {show: true, lineStyle: {color: '#6D6C98'}}
          },
          yAxis: {
            axisLine: {show: true, lineStyle: {color: '#6D6C98'}},
            splitLine: {lineStyle: {color: ['#6D6C98'], type: 'dashed'}}
          },
          series: [{
            name: 'IMSI',
            type: 'bar',//line -> 折线图  bar -> 柱状图
            data: this.warning.imsi
          }, {
            name: '图像',
            type: 'bar',//line -> 折线图  bar -> 柱状图
            data: this.warning.face
          }]
        };
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'imsiList') {
          let imsi = [];
          row.imsiList.forEach((item) => {
            imsi.push(item.imsi)
          });
          return imsi.join("，");
        } else if (column.property === 'levl') {
          let lev = [];
          row.imsiList.forEach((item) => {
            lev.push(item.weight)
          });
          return lev.join("，");
        } else if (column.property === 'upTime') {
          return row.upTime ? formatDate(new Date(row.upTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      sessionStorage.setItem("index", 1);
      this.getHotSpot();
      this.getMapData();
      this.getWarningCount();
      this.getImsiList();
      this.getLineData();
      // this.statusTask();
    }
  }
</script>
<style scoped>
  .map-tap {
    height: 50px;
    line-height: 50px;
    cursor: pointer;
    color: #5F5E91;
    font-size: 18px;
    margin: 0 15px;
    padding: 0 20px 10px 20px;
    border-bottom: 3px transparent solid;
  }

  .map-tap-active {
    height: 50px;
    line-height: 50px;
    cursor: pointer;
    color: #66CCFF;
    font-size: 18px;
    margin: 0 15px;
    padding: 0 20px 10px 20px;
    border-bottom: 3px #66CCFF solid;
  }

  .header-title {
    color: #fff;
    height: 60px;
    line-height: 60px;
    text-align: left;
    padding-left: 30px
  }

  .header-content {
    color: #fff;
    height: 60px;
    line-height: 60px;
    padding-right: 20px
  }

  .header-unit {
    color: #999;
    height: 60px;
    line-height: 60px;
    padding-right: 30px
  }

  .user-img {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    border: 1px dashed #999
  }
</style>
