<template>
  <div>
    <section class="content">
      <el-form :model="query" style="margin: 0" label-width="100px" label-position="left">
        <el-form-item align="left" label="侦码设备" style="margin:0 0 10px 20px">
          <span style="display: inline-block;margin-right: 20px;font-size: 14px">全部{{deviceImsi.count}}</span>
          <el-checkbox-group v-model="query.code" style="display: inline-block" @change="codeChange">
            <el-checkbox :label="true">在线{{deviceImsi.onlineCount}}</el-checkbox>
            <el-checkbox :label="false">离线{{deviceImsi.offlineCount}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item align="left" label="相机设备" style="margin:0 0 10px 20px">
          <span style="display: inline-block;margin-right: 20px;font-size: 14px">全部{{camera.count}}</span>
          <el-checkbox-group v-model="query.camera" style="display: inline-block" @change="cameraChange">
            <el-checkbox :label="true">在线{{camera.onlineCount}}</el-checkbox>
            <el-checkbox :label="false">离线{{camera.offlineCount}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
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
        });
      },
      deviceMap() {
        var app = {};

        let myChart = echarts.init(document.getElementById('view-map'));
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
            zoom: 11,
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
          var mapType1 = new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP]});
          var mapType2 = new BMap.MapTypeControl({anchor: BMAP_ANCHOR_TOP_LEFT});

          var overView = new BMap.OverviewMapControl();
          var overViewOpen = new BMap.OverviewMapControl({isOpen: true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT});
          bmap.addControl(mapType1);          //2D图，卫星图
          bmap.addControl(mapType2);          //左上角，默认地图控件
          bmap.addControl(overView);          //添加默认缩略地图控件
//          bmap.addControl(overViewOpen);
//          var myDrag = new BMapLib.RectangleZoom(bmap, {
//            followText: "拖拽鼠标进行操作"
//          });
//          myDrag.open();  //开启拉框放大
          //myDrag.close();  //关闭拉框放大
        }
      }
    },
    mounted() {
      this.getMapData();
      this.statusTask();
    }
  }
</script>
<style scoped>
  .view-map {
    position: absolute;
    left: 210px;
    right: 15px;
    bottom: 20px;
    top: 160px;
    color: #fff;
    font-size: 30px;
  }
</style>
