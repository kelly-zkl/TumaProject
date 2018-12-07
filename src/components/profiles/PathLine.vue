<template>
  <div>
    <section>
      <el-form :model="query" style="text-align: left" :inline="true">
        <el-form-item label="时间范围">
          <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          :default-time="['00:00:00', '23:59:59']" size="medium">
          </el-date-picker>
        </el-form-item>
        <!--<el-form-item label="轨迹模式">-->
        <!--<el-radio-group v-model="query.merge" size="medium" @change="handleChange">-->
        <!--<el-radio-button :label="false">记录轨迹</el-radio-button>-->
        <!--<el-radio-button :label="true">合并轨迹</el-radio-button>-->
        <!--</el-radio-group>-->
        <!--</el-form-item>-->
        <el-form-item>
          <el-button @click="getLineData()" size="medium" type="primary">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="luShu()" size="medium" type="primary" v-show="query.merge == false"
                     :icon="isPause?'fa fa-pause':'fa fa-play'">
            {{isPause?'暂停回放':'回放轨迹'}}
          </el-button>
        </el-form-item>
      </el-form>
      <el-row v-show="query.merge == false" style="margin: 0;padding: 0">
        <el-col style="text-align: left;margin: 0;padding: 0" align="left" :span="24">
          <!--<el-radio-group v-model="choose.face" @change="handleFace">-->
          <!--<el-radio v-for="item in faces" :key="item" :label="item">{{item}}</el-radio>-->
          <!--</el-radio-group>faces.length>0&&-->
          <el-radio-group v-model="choose.imsi" @change="handleImsi" style="margin: 0;padding: 0">
            <el-radio v-for="item in imsis" :key="item" :label="item">{{item}}</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <div class="view-map" id="path"
           v-bind:style="query.merge == false&&imsis.length>0?'top: 150px':'top: 100px'"></div>
      <div v-bind:class="isShow?'arrow-list':'arrow-none'" @click="handleArrow()">
        <i v-bind:class="isShow?'fa fa-angle-double-right fa-3x':'fa fa-angle-double-left fa-3x'"></i>
      </div>
      <div v-bind:class="isShow?'view-list':'list-none'"
           v-bind:style="query.merge == false&&imsis.length>0?'top: 150px':'top: 100px'">
        <div style="color: #999;font-size: 14px;margin-top: 15px">对应IMSI</div>
        <div style="color: #333;font-size: 14px">{{choose.imsi}}</div>
        <div style="border-top: #6699FF 3px solid;margin-top: 15px">
          <div style="font-size: 14px;color: #333;text-align: center;padding: 10px">侦码记录</div>
          <div v-for="(item,idx) in records">
            <div class="item-line"
                 style="text-align: left;display:-webkit-box;display:-ms-flexbox;display:flex;height: 60px;align-items: center">
              <div style="display: inline-block;width: 24px;height: 24px;text-align: center;margin: 0 10px">
                <div
                  style="width: 22px;height: 24px;line-height:24px;border-radius: 12px;background:#6699FF;color: #fff;font-size: 13px;text-align: center">
                  {{idx+1}}
                </div>
              </div>
              <div style="display: inline-block;text-align: left">
                <div><span class="item-label">IMSI</span><span class="item-content">{{choose.imsi}}</span></div>
                <div><span class="item-label">场所</span><span
                  class="item-content">{{item.placeName?item.placeName:'--'}}</span></div>
                <div><span class="item-label">时间</span><span class="item-content">{{item.timeStr}}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        query: {imsis: [], faceIds: [], merge: false},
        pathUrl: '',
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
        isPause: false,
        records: [],
        routeList: [],
        walking: {},
        isShow: true,
        isCenter: false,
        lushu: null,
        choose: {imsi: '', face: ''},//
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
    methods: {
      //显示-隐藏列表
      handleArrow() {
        this.isShow = !this.isShow;
      },
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
                  this.map.centerAndZoom(point, 14);
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
        this.isPause = false;
        if (this.lushu) {
          this.lushu.stop();
        }
        this.imsiLine();
      },
      imsiLine() {
        this.lushu = null;
        // this.walking.clearResults();
        this.routeList = [];
        this.map.clearOverlays();
        this.pathLines.forEach((item) => {
          if (item.value == this.choose.imsi) {
            var pois = [];
            this.records = [];
            if (item.locs && item.locs.length > 0) {
              var point1, point2;
              for (var i = 0; i < item.locs.length; i++) {
                let recData = item.locs[i];
                if (i == 0 && !this.isCenter) {
                  this.isCenter = false;
                  var point = new BMap.Point(item.locs[i].lon, item.locs[i].lat);
                  this.map.centerAndZoom(point, 14);
                }
                pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
                recData.timeStr = formatDate(new Date(recData.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
                this.records.push(recData);
                // if (i < item.locs.length - 1 && item.locs.length > 1) {
                //   point1 = new BMap.Point(item.locs[i].lon, item.locs[i].lat);
                //   point2 = new BMap.Point(item.locs[i + 1].lon, item.locs[i + 1].lat);
                //   if (point1.lat != point2.lat || point1.lng != point2.lng) {
                //     this.routeList.push({index: i + ''});
                //     this.walking.search({title: i + '', point: point1}, {title: i + '', point: point2});
                //   }
                // }
              }
              this.pathLine(pois, 1);
              this.lushu = new BMapLib.LuShu(this.map, pois, {// 回放
                defaultContent: "",
                autoView: true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                icon: new BMap.Icon(this.pathUrl ? this.pathUrl : 'http://lbsyun.baidu.com/jsdemo/img/Mario.png', this.pathUrl ? new BMap.Size(32, 32) : new BMap.Size(52, 26),
                  {
                    anchor: new BMap.Size(27, 13),
                    imageSize: this.pathUrl ? new BMap.Size(32, 32) : new BMap.Size(32, 32),
                  }),
                speed: 2000,//覆盖物移动速度，单位米/秒
                enableRotation: true,//是否设置marker随着道路的走向进行旋转
                landmarkPois: []
              });
            }
          }
        });
      },
      //获取数据
      getLineData() {
        this.map.clearOverlays();
        this.isCenter = false;
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startTime = this.cTime[0] / 1000;
          this.query.endTime = this.cTime[1] / 1000;
        }
        this.$post('route/query', this.query).then((data) => {
          this.pathLines = data.data.routeList;
          let imsi = {locs: []}, face = {locs: []};
          this.pathLines.forEach((item) => {
            if (item.value == this.choose.imsi) {
              imsi = item;
            }
            if (item.value == this.choose.face) {
              face = item;
            }
          });
          if (imsi.locs.length == 0 && face.locs.length == 0) {
            this.setMapCenter();
          }
          if (this.query.merge) {//合并轨迹
            let item = this.pathLines[0];
            var pois = [];
            if (item.locs.length > 0) {
              for (var i = 0; i < item.locs.length; i++) {
                pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
              }
              this.pathLine(pois, 1);
            }
          } else {
            // this.faceLine();
            this.imsiLine();
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      pathLine(point, type) {
        // 创建polyline对象
        var pois = point;
        var polyline = new BMap.Polyline(pois, {
          enableEditing: false,//是否启用线编辑，默认为false
          enableClicking: true,//是否响应点击事件，默认为true
          // icons: [icons],
          strokeWeight: '4',//折线的宽度，以像素为单位
          strokeOpacity: 1,//折线的透明度，取值范围0 - 1
          strokeColor: type == 0 ? "#FF6600" : '#6699FF' //折线颜色#6699FF#325EDA
        });
        for (var i = 0; i < pois.length; i++) {
          var pt = pois[i];
          // var myIcon = new BMap.Icon(type == 0 ? this.icon1 : this.icon2, new BMap.Size(23, 25));, {icon: myIcon}
          var marker2 = new BMap.Marker(pt);
          let content = "<div style='width: 16px;height: 22px;line-height: 22px;text-align: center'>" + (i + 1) + "</div>";
          var label = new BMap.Label(content);
          label.setStyle({
            background: 'none', color: '#fff', border: 'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
          });
          marker2.setLabel(label);//显示地理名称 a
          this.map.addOverlay(marker2);
        }
        this.map.addOverlay(polyline);
      },
      //设置地图中心点
      setMapCenter() {
        let _this = this;

        function myFun(result) {
          var cityName = result.name;
          _this.map.setCenter(cityName);
        }

        var myCity = new BMap.LocalCity();
        myCity.get(myFun);
      },
      //删除地图上的覆盖物
      deleteOverlay() {
        var allOverlay = this.map.getOverlays();
        for (var i = 0; i < allOverlay.length; i++) {
          if (allOverlay[i].toString().indexOf("Marker") > 0) {//删除标志点
            this.map.removeOverlay(allOverlay[i]);
          }
          if (allOverlay[i].toString().indexOf("Polyline") > 0) {//删除折线
            this.map.removeOverlay(allOverlay[i]);
          }
        }
      },
      //路线规划结果
      onSearchComplete(res) {
        var isDone = true;
        if (this.walking.getStatus() == 0) {
          var plan = res.getPlan(0);
          for (var j = 0; j < plan.getNumRoutes(); j++) {
            var route = plan.getRoute(j);
            this.map.addOverlay(new BMap.Polyline(route.getPath(), {strokeColor: '#5A56FA', strokeOpacity: 1}));
            this.map.setViewport(route.getPath());
            this.routeList.forEach((item) => {//按照路线规划的顺序来设置路书的点集合
              if (item.index == res.getStart().title) {
                item.value = route.getPath();
              }
              if (item.value == null) {
                isDone = false;
              }
            });
          }

          if (isDone) {
            var arrPois = [];
            this.routeList.forEach((item) => {
              arrPois = arrPois.concat(item.value);
            });
            this.lushu = new BMapLib.LuShu(this.map, arrPois, {// 回放
              defaultContent: "",
              autoView: true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
              icon: new BMap.Icon(this.pathUrl ? this.pathUrl : 'http://lbsyun.baidu.com/jsdemo/img/Mario.png', this.pathUrl ? new BMap.Size(32, 32) : new BMap.Size(52, 26),
                {
                  anchor: new BMap.Size(27, 13),
                  imageSize: this.pathUrl ? new BMap.Size(32, 32) : new BMap.Size(32, 32),
                }),
              speed: 2000,//覆盖物移动速度，单位米/秒
              enableRotation: true,//是否设置marker随着道路的走向进行旋转
              landmarkPois: []
            });
          }
        }
      },
      //轨迹回放/暂停
      luShu() {
        if (this.lushu) {
          this.isPause = !this.isPause;
          this.isPause ? this.lushu.start() : this.lushu.pause();
        }
      }
    },
    mounted() {
      let _this = this;
      this.map = new BMap.Map("path", {minZoom: 5, maxZoom: 18});
      this.map.enableScrollWheelZoom(true);
      this.map.enableDragging();

      var point = new BMap.Point(116.331398, 39.897445);
      this.map.centerAndZoom(point, 12);
      this.walking = new BMap.WalkingRoute(this.map, {
        renderOptions: {map: this.map, autoViewport: true},
        onSearchComplete: this.onSearchComplete,
        onMarkersSet: function (routes) {
          _this.map.removeOverlay(routes[0].marker); //删除起点
          _this.map.removeOverlay(routes[1].marker);//删除终点
        }
      });

      this.imsi = this.$route.query.imsi || 0;
      this.face = this.$route.query.face || 0;

      this.cTime = JSON.parse(localStorage.getItem("pathTime"));
      let pathImsi = JSON.parse(localStorage.getItem("pathImsi"));
      let pathFace = JSON.parse(localStorage.getItem("pathFace"));
      this.pathUrl = JSON.parse(localStorage.getItem("pathUrl"));
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
      this.getLineData();
    }
  }
</script>
<style scoped>
  .view-map {
    position: absolute;
    left: 200px;
    right: 15px;
    bottom: 10px;
    top: 100px;
  }

  .view-list {
    position: absolute;
    right: 15px;
    bottom: 20px;
    top: 100px;
    background: #fff;
    width: 300px;
    overflow-y: scroll;
    -moz-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*firefox*/
    -webkit-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*webkit*/
    box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*opera或ie9*/
  }

  .list-none {
    display: none;
  }

  .item-label {
    font-size: 13px;
    color: #888;
    margin-right: 10px;
  }

  .item-content {
    font-size: 13px;
    color: #333;
    margin-right: 10px;
    white-space: nowrap;
  }

  .arrow-list {
    position: absolute;
    right: 315px;
    top: 150px;
    background: #ccc;
    padding: 0 15px;
    color: #fff;
    -moz-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*firefox*/
    -webkit-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*webkit*/
    box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*opera或ie9*/
  }

  .arrow-none {
    position: absolute;
    right: 15px;
    top: 150px;
    padding: 0 15px;
    background: #ccc;
    color: #fff;
    -moz-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*firefox*/
    -webkit-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*webkit*/
    box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*opera或ie9*/
  }

  .item-line {
    padding: 5px 0;
  }

  .item-line:hover, .item-line:active, .item-line:focus {
    cursor: pointer;
    background: #eee;
  }
</style>
