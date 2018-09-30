<template>
  <div>
    <section>
      <el-form :model="query" style="margin: 0;text-align: left" :inline="true">
        <el-form-item label="时间范围">
          <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          :default-time="['00:00:00', '23:59:59']" size="medium">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="轨迹模式">
          <el-radio-group v-model="query.merge" size="medium" @change="handleChange">
            <el-radio-button :label="false">记录轨迹</el-radio-button>
            <el-radio-button :label="true">合并轨迹</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button @click="runLineList=true" size="medium" type="primary" v-if="query.merge == false">轨迹回放</el-button>
        </el-form-item>
      </el-form>
      <el-row v-if="query.merge == false">
        <el-col style="text-align: left;" align="left" :span="24">
          <el-radio-group v-model="choose.face" @change="handleFace">
            <el-radio v-for="item in faces" :key="item" :label="item">{{item}}</el-radio>
          </el-radio-group>
          <el-radio-group v-model="choose.imsi" @change="handleImsi">
            <el-radio v-for="item in imsis" :key="item" :label="item">{{item}}</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <div class="view-map" id="path"
           v-bind:style="query.merge == false&&faces.length>0&&imsis.length>0?'top: 160px':'top: 100px'"></div>
    </section>
    <!--轨迹列表-->
    <el-dialog title="轨迹列表" :visible.sync="runLineList" width="500px" center>
      <div class="block">
        <el-row>
          <el-col :span="24" align="center" v-for="item in pathLines" :key="item.value"
                  style="text-align: center;border-bottom: 1px #ddd solid" @click.stop="luShu(item)">
            <el-form :model="item" align="left" label-width="80px" label-position="left">
              <el-form-item label="类型" style="margin:0">
                <span
                  style="font-size: 14px;color:#000">{{item.type=='imsi' ? 'IMSI':item.type=='image'?'图像': '合并'}}</span>
              </el-form-item>
              <el-form-item label="IMSI" style="margin:0" v-if="item.type=='imsi'">
                <span style="font-size: 14px;color:#000">{{item.value ? item.value : '--'}}</span>
              </el-form-item>
              <el-form-item label="人员ID" style="margin:0" v-if="item.type=='image'">
                <span style="font-size: 14px;color:#000">{{item.value ? item.value : '--'}}</span>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        runLineList: false,
        query: {imsis: [], faceIds: [], merge: false},
        map: {},
        imsi: this.$route.query.imsi || 0,
        face: this.$route.query.face || 0,
        icon1: require('../../assets/img/icon1.png'),
        icon2: require('../../assets/img/icon2.png'),
        cTime: [new Date((formatDate(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        pathLines: [],
        faces: [],
        imsis: [],
        isCenter: false,
        choose: {imsi: '', face: ''},
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date().getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        }
      }
    },
    //页面关闭时删除时间、imsi和图像的缓存
    beforeDestroy() {
      sessionStorage.removeItem("pathTime");
      sessionStorage.removeItem("pathImsi");
      sessionStorage.removeItem("pathFace");
    },
    methods: {
      //切换模式
      handleChange(val) {
        this.map.clearOverlays();
        this.isCenter = false;
        this.getLineData();
      },
      //选择人脸轨迹
      handleFace(val) {
        this.choose.face = val;
        this.faceLine();
      },
      faceLine() {
        this.pathLines.forEach((item) => {
          if (item.value == this.choose.face) {
            var pois = [];
            if (item.locs && item.locs.length > 0) {
              for (var i = 0; i < item.locs.length; i++) {
                if (i == 0 && !this.isCenter) {
                  this.isCenter = true;
                  var point = new BMap.Point(item.locs[i].lon, item.locs[i].lat);
                  this.map.centerAndZoom(point, 12);
                }
                pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
              }
              this.pathLine(pois, 0);
            }
          }
        });
      },
      //选择imsi轨迹
      handleImsi(val) {
        this.choose.imsi = val;
        this.imsiLine();
      },
      imsiLine() {
        this.pathLines.forEach((item) => {
          if (item.value == this.choose.imsi) {
            var pois = [];
            if (item.locs && item.locs.length > 0) {
              for (var i = 0; i < item.locs.length; i++) {
                if (i == 0 && !this.isCenter) {
                  this.isCenter = true;
                  var point = new BMap.Point(item.locs[i].lon, item.locs[i].lat);
                  this.map.centerAndZoom(point, 12);
                }
                pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
              }
              this.pathLine(pois, 1);
            }
          }
        });
      },
      //获取数据
      getLineData() {
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startTime = this.cTime[0] / 1000;
          this.query.endTime = this.cTime[1] / 1000;
        }
        this.$post('route/query', this.query).then((data) => {
          this.pathLines = data.data.routeList;
          if (this.query.merge) {//合并轨迹
            let item = this.pathLines[0];
            var pois = [];
            for (var i = 0; i < item.locs.length; i++) {
              pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
            }
            this.pathLine(pois, 1);
          } else {
            this.faceLine();
            this.imsiLine();
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      pathLine(point, type) {
        var sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
          scale: 0.6,//图标缩放大小
          strokeColor: '#fff',//设置矢量图标的线填充颜色
          strokeWeight: '1',//设置线宽
        });
        var icons = new BMap.IconSequence(sy, '10', '30');
        // 创建polyline对象
        var pois = point;
        var polyline = new BMap.Polyline(pois, {
          enableEditing: false,//是否启用线编辑，默认为false
          enableClicking: true,//是否响应点击事件，默认为true
          icons: [icons],
          strokeWeight: '6',//折线的宽度，以像素为单位
          strokeOpacity: 1,//折线的透明度，取值范围0 - 1
          strokeColor: type == 0 ? "#FF6600" : '#6699FF' //折线颜色#6699FF#325EDA
        });
        this.map.addOverlay(polyline);
        for (var i = 0; i < pois.length; i++) {
          var pt = pois[i];
          var myIcon = new BMap.Icon(type == 0 ? this.icon1 : this.icon2, new BMap.Size(23, 25));
          var marker2 = new BMap.Marker(pt, {icon: myIcon});
          var label = new BMap.Label(i + 1, {
            offset: new BMap.Size(5, 4)
          });
          label.setStyle({
            background: 'none', color: '#fff', border: 'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
          });
          marker2.setLabel(label);//显示地理名称 a
          this.map.addOverlay(marker2);
        }
      },
      //删除地图上的覆盖物
      deleteOverlay() {
        var allOverlay = map.getOverlays();
        for (var i = 0; i < allOverlay.length; i++) {
          if (allOverlay[i].toString().indexOf("Marker") > 0) {//删除标志点
            map.removeOverlay(allOverlay[i]);
          }
          if (allOverlay[i].toString().indexOf("Polyline") > 0) {//删除折线
            map.removeOverlay(allOverlay[i]);
          }
        }
      },
      //轨迹回放
      luShu(line) {
        this.runLineList = false;
        console.log(line);
        // this.deleteOverlay();
        var pois = [];
        var type = 1;
        if (line.type == 'imsi') {
          this.choose = {imsi: line.value, face: ''};
          type = 1;
        } else if (line.type == 'image') {
          this.choose = {imsi: '', face: line.value};
          type = 0;
        }

        for (var i = 0; i < line.locs.length; i++) {
          pois.push(new BMap.Point(line.locs[i].lon, line.locs[i].lat));
        }
        this.pathLine(pois, type);

        var lushu = new BMapLib.LuShu(this.map, pois, {// 回放
          defaultContent: "",//"从天安门到百度大厦"
          autoView: true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
          icon: new BMap.Icon('http://lbsyun.baidu.com/jsdemo/img/Mario.png', new BMap.Size(52, 26), {anchor: new BMap.Size(27, 13)}),
          speed: 500,
          enableRotation: true,//是否设置marker随着道路的走向进行旋转
          landmarkPois: [
            // {lng: 116.386446, lat: 39.939281, html: '加油站', pauseTime: 2},
            // {
            //   lng: 116.389034, lat: 39.913828,
            //   html: '高速公路收费<div><img src="http://map.baidu.com/img/logo-map.gif"/></div>',
            //   pauseTime: 3
            // },
            // {
            //   lng: 116.442501, lat: 39.914603,
            //   html: '肯德基早餐<div><img src="http://ishouji.baidu.com/resource/images/map/show_pic04.gif"/></div>',
            //   pauseTime: 2
            // }
          ],
        });

        lushu.start();
      }
    },
    mounted() {
      let _this = this;
      this.map = new BMap.Map("path");
      this.map.enableScrollWheelZoom(true);
      this.map.enableDragging();

      var point = new BMap.Point(116.331398, 39.897445);
      this.map.centerAndZoom(point, 12);

      function myFun(result) {
        var cityName = result.name;
        _this.map.setCenter(cityName);
      }

      var myCity = new BMap.LocalCity();
      myCity.get(myFun);

      // var geolocation = new BMap.Geolocation();
      // geolocation.getCurrentPosition(function (r) {
      //   console.log(r);
      //   _this.map.centerAndZoom(r.point, 14);
      // }, {enableHighAccuracy: true});

      this.imsi = this.$route.query.imsi || 0;
      this.face = this.$route.query.face || 0;

      this.cTime = JSON.parse(sessionStorage.getItem("pathTime"));
      let pathImsi = JSON.parse(sessionStorage.getItem("pathImsi"));
      let pathFace = JSON.parse(sessionStorage.getItem("pathFace"));
      if (pathImsi && this.imsi == 1) {
        this.query.imsis = pathImsi;
        this.imsis = pathImsi;
        if (pathImsi.length > 0) {
          this.choose.imsi = pathImsi[0];
        }
      }
      if (pathFace && this.face == 1) {
        this.query.faceIds = pathFace;
        this.faces = pathFace;
        if (pathFace.length > 0) {
          this.choose.face = pathFace[0];
        }
      }

      // var pois = [
      //   new BMap.Point(116.350658, 39.938285),
      //   new BMap.Point(116.386446, 39.939281),
      //   new BMap.Point(116.389034, 39.913828),
      //   new BMap.Point(116.442501, 39.914603)
      // ];
      // this.pathLine(pois, 1);
      this.getLineData();
    }
  }
</script>
<style scoped>
  .view-map {
    position: absolute;
    left: 200px;
    right: 15px;
    bottom: 20px;
    top: 100px;
    color: #fff;
    font-size: 30px;
  }
</style>
