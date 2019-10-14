<template>
  <div>
    <section>
      <el-form :model="query" style="text-align: left" :inline="true">
        <el-form-item label="时间范围" style="margin-bottom:10px">
          <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          :default-time="['00:00:00', '23:59:59']" size="medium">
          </el-date-picker>
        </el-form-item>
        <!--<el-form-item label="轨迹模式" style="margin-bottom:10px">-->
        <!--<el-radio-group v-model="query.merge" size="medium" @change="handleChange">-->
        <!--<el-radio-button :label="false">记录轨迹</el-radio-button>-->
        <!--<el-radio-button :label="true">合并轨迹</el-radio-button>-->
        <!--</el-radio-group>-->
        <!--</el-form-item>-->
        <el-form-item style="margin-bottom:10px">
          <el-button @click="getData()" size="medium" type="primary">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom:10px">
          <el-button @click="luShu()" size="medium" type="primary" v-show="query.merge == false"
                     :icon="isPause?'fa fa-pause':'fa fa-play'">
            {{isPause?'暂停回放':'回放轨迹'}}
          </el-button>
        </el-form-item>
      </el-form>
      <el-row v-show="query.merge == false" style="margin: 0;padding: 0">
        <el-col style="text-align: left;margin: 0;padding: 0" align="left" :span="24">
          <el-radio-group v-model="choose.car" @change="handleCar" v-if="car == 1" style="margin: 0;padding: 0">
            <el-radio v-for="item in cars" :key="item" :label="item">{{item}}</el-radio>
          </el-radio-group>
          <el-radio-group v-model="choose.imsi" @change="handleImsi" style="margin: 0;padding: 0" v-if="imsi == 1">
            <el-radio v-for="item in imsis" :key="item" :label="item">{{item}}</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <div class="view-map" id="path"
           v-bind:style="query.merge == false&&(imsis.length>0||cars.length>0)?'top: 120px':'top: 70px'"></div>
      <div v-bind:class="isShow?'arrow-list':'arrow-none'" @click="handleArrow()"
           v-bind:style="query.merge == false&&(imsis.length>0||cars.length>0)?'top: 120px':'top: 70px'">
        <i v-bind:class="isShow?'fa fa-angle-double-right fa-3x':'fa fa-angle-double-left fa-3x'"></i>
      </div>
      <div v-bind:class="isShow?'view-list':'list-none'"
           v-bind:style="query.merge == false&&(imsis.length>0||cars.length>0)?'top: 120px':'top: 70px'">
        <div style="color: #999;font-size: 14px;margin-top: 15px">{{car == 1?'对应车辆':imsi == 1?'对应IMSI':'--'}}</div>
        <div style="color: #333;font-size: 14px">{{car == 1?choose.car:imsi == 1?choose.imsi:'--'}}</div>
        <div style="border-top: #6699FF 3px solid;margin-top: 15px">
          <div style="font-size: 14px;color: #333;text-align: center;padding: 10px">轨迹记录</div>
          <div v-for="(item,idx) in records">
            <div class="item-line" @click="clickMark(item,idx)">
              <div class="item-dot">
                <div :class="idx==clickIdx?'item-index click':'item-index'">{{idx+1}}</div>
              </div>
              <div style="display: inline-block;text-align: left">
                <div><span class="item-label">场所</span><span
                  class="item-content">{{item.placeName?item.placeName:'--'}}</span></div>
                <div><span class="item-label">次数</span><span
                  class="item-content">{{'第'+(item.time>0?item.time:'--')+'次/共'+(item.total>0?item.total:'--')+'次'}}</span>
                </div>
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
  import {formatDate, buttonValidator, encryData, decryData} from "../../assets/js/util";

  export default {
    data() {
      return {
        query: {merge: false}, pathUrl: '', map: {},
        imsi: this.$route.query.imsi || 0,
        car: this.$route.query.car || 0,
        icon1: require('../../assets/img/icon1.png'),
        icon2: require('../../assets/img/icon2.png'),
        cTime: [new Date((formatDate(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        pathLines: [], cars: [], imsis: [], isPause: false, records: [],
        routeList: [], walking: {}, isShow: true, isCenter: false, lushu: null,
        choose: {imsi: '', car: ''}, clickIdx: -1,
        pickerBeginDate: {
          shortcuts: [{
            text: '最近6小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 6);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近12小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 12);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }],
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
            if (beginDateVal) {
              return beginDateVal < time.getTime();
            }
          }
        }
      }
    },
    methods: {
      //点击列表时，对应的mark颜色变掉
      clickMark(item, idx) {
        this.clickIdx = idx;
        let allOverlay = this.map.getOverlays();
        for (let i = 0; i < allOverlay.length - 1; i++) {
          let mark = allOverlay[i];
          if (mark.getPosition().lng == item.lon && mark.getPosition().lat == item.lat) {
            let myIcon = new BMap.Icon(this.icon1, new BMap.Size(23, 25));
            mark.setIcon(myIcon);
            setTimeout(() => {
              let myIcon = new BMap.Icon(this.icon2, new BMap.Size(23, 25));
              mark.setIcon(myIcon);
              this.clickIdx = -1;
            }, 1500);
            return false;
          }
        }
      },
      //显示-隐藏列表
      handleArrow() {
        this.isShow = !this.isShow;
      },
      //切换模式
      handleChange(val) {
        this.map.clearOverlays();
        this.isCenter = false;
        this.getData();
      },
      //选择人脸轨迹
      handleCar(val) {
        this.choose.car = val;
        this.isPause = false;
        if (this.lushu) {
          this.lushu.stop();
        }
        this.imsiLine();
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
        let pathType = this.choose.imsi;
        if (this.car == 1) {
          pathType = this.choose.car;
        }
        this.pathLines.forEach((item) => {
          if (item.value == pathType) {
            let pois = [], marks = [];
            this.records = [];
            if (item.locs && item.locs.length > 0) {
              let point1 = null, point2 = null;
              for (let i = 0; i < item.locs.length; i++) {
                let recData = item.locs[i];
                if (i == 0 && !this.isCenter) {
                  this.isCenter = false;
                  let point = new BMap.Point(item.locs[i].lon, item.locs[i].lat);
                  this.map.centerAndZoom(point, 14);
                }
                recData.timeStr = formatDate(new Date(recData.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
                this.records.push(recData);
                point1 = item.locs[i];
                if (point1 && point2) {
                  if (point1.lat != point2.lat || point1.lon != point2.lon) {
                    pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
                  }
                  point2 = point1;
                } else {
                  pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
                }

                //地图上的mark点-->不重复的
                if (this.isSingle(item.locs[i], marks)) {
                  marks.push(item.locs[i]);
                }

                // if (i < item.locs.length - 1 && item.locs.length > 1) {
                //   point1 = new BMap.Point(item.locs[i].lon, item.locs[i].lat);
                //   point2 = new BMap.Point(item.locs[i + 1].lon, item.locs[i + 1].lat);
                //   if (point1.lat != point2.lat || point1.lng != point2.lng) {
                //     this.routeList.push({index: i + ''});
                //     this.walking.search({title: i + '', point: point1}, {title: i + '', point: point2});
                //   }
                // }
              }
              this.pathLine(marks, pois, 1);
              this.lushu = new BMapLib.LuShu(this.map, pois, {// 回放
                defaultContent: "",
                autoView: true,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                icon: new BMap.Icon(this.pathUrl ? this.pathUrl : '../meerkat-h5/static/baidumapv2/images/Mario.png', this.pathUrl ? new BMap.Size(32, 32) : new BMap.Size(52, 26),
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
      getData() {
        this.map.clearOverlays();
        this.isCenter = false;
        if (this.cTime) {//时间戳的毫秒转化成秒
          this.query.startTime = this.cTime[0] / 1000;
          this.query.endTime = this.cTime[1] / 1000;
        }
        this.$post('route/query', this.query).then((data) => {
          this.pathLines = data.data.routeList;
          let imsi = {locs: []}, car = {locs: []};
          this.pathLines.forEach((item) => {
            if (item.value == this.choose.imsi) {
              imsi = item;
            }
            if (item.value == this.choose.car) {
              car = item;
            }
          });
          if (imsi.locs.length == 0 && car.locs.length == 0) {
            this.setMapCenter();
          }
          if (this.query.merge) {//合并轨迹
            let item = this.pathLines[0];
            let pois = [];
            if (item.locs.length > 0) {
              for (let i = 0; i < item.locs.length; i++) {
                pois.push(new BMap.Point(item.locs[i].lon, item.locs[i].lat));
              }
              this.pathLine(pois, 1);
            }
          } else {
            this.imsiLine();
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //在地图上画轨迹图
      pathLine(marks, pois, type) {
        // 创建polyline对象
        let polyline = new BMap.Polyline(pois, {
          enableEditing: false,//是否启用线编辑，默认为false
          enableClicking: true,//是否响应点击事件，默认为true
          strokeWeight: '4',//折线的宽度，以像素为单位
          strokeOpacity: 1,//折线的透明度，取值范围0 - 1
          strokeColor: type == 0 ? "#FF6600" : '#6699FF' //折线颜色#6699FF#325EDA
        });
        for (let i = 0; i < marks.length; i++) {
          let pt = new BMap.Point(marks[i].lon, marks[i].lat);
          let myIcon = new BMap.Icon(this.icon2, new BMap.Size(23, 25));
          let marker2 = new BMap.Marker(pt, {icon: myIcon});
          let content = "<div style='width: 16px;height: 22px;line-height: 22px;text-align: center'>" + (marks[i].total > 0 ? marks[i].total : '--') + "</div>";
          let label = new BMap.Label(content);
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
          let cityName = result.name;
          _this.map.setCenter(cityName);
        }

        let myCity = new BMap.LocalCity();
        myCity.get(myFun);
      },
      //路线规划结果
      onSearchComplete(res) {
        let isDone = true;
        if (this.walking.getStatus() == 0) {
          let plan = res.getPlan(0);
          for (let j = 0; j < plan.getNumRoutes(); j++) {
            let route = plan.getRoute(j);
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
            let arrPois = [];
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
      },
      //是否重复  return true:未重复 false:重复
      isSingle(val, arr) {
        let bol = true;
        arr.forEach((item) => {
          if (val.lat == item.lat && val.lon == item.lon) {
            bol = false;
          }
        });
        return bol;
      }
    },
    mounted() {
      let _this = this;
      this.map = new BMap.Map("path", {minZoom: 5, maxZoom: 20});
      this.map.enableScrollWheelZoom(true);
      this.map.enableDragging();

      let systemParam = JSON.parse(decryData(sessionStorage.getItem("system")));
      let point = new BMap.Point(systemParam.localPoint[0], systemParam.localPoint[1]);
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
      this.car = this.$route.query.car || 0;
      let idx = this.$route.query.idx || 0;

      this.cTime = JSON.parse(localStorage.getItem("pathTime"));
      let pathImsi = JSON.parse(localStorage.getItem("pathImsi"));
      let pathCar = JSON.parse(localStorage.getItem("pathCar"));
      this.pathUrl = JSON.parse(localStorage.getItem("pathUrl"));
      if (pathImsi && this.imsi == 1) {
        this.query.imsis = pathImsi;
        this.imsis = pathImsi;
        if (pathImsi.length > 0) {
          this.choose.imsi = pathImsi[idx];
        }
      }
      if (pathCar && this.car == 1) {
        this.query.cars = pathCar;
        this.cars = pathCar;
        if (pathCar.length > 0) {
          this.choose.car = pathCar[idx];
        }
      }
      this.getData();
    }
  }
</script>
<style scoped lang="scss">
  .view-map {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 100px;
  }

  .view-list {
    position: absolute;
    right: 10px;
    bottom: 10px;
    top: 120px;
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
    right: 310px;
    top: 120px;
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
    top: 120px;
    padding: 0 15px;
    background: #ccc;
    color: #fff;
    -moz-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*firefox*/
    -webkit-box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*webkit*/
    box-shadow: -6px 6px 12px rgba(40, 40, 40, .5); /*opera或ie9*/
  }

  .item-line {
    padding: 5px 0;
    text-align: left;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 60px;
    align-items: center
  }

  .item-line:hover, .item-line:active, .item-line:focus {
    cursor: pointer;
    background: #eee;
    .item-index {
      background: #ff0000;
    }
    .item-index::after {
      border-color: #ff0000;
    }
  }

  .item-dot {
    display: inline-block;
    width: 24px;
    height: 100%;
    text-align: center;
    margin: 0 10px
  }

  .item-index {
    width: 18px;
    height: 18px;
    position: relative;
    line-height: 18px;
    border-radius: 9px;
    background: #6699FF;
    color: #fff;
    font-size: 12px;
    text-align: center
  }

  .click.item-index, .item-index:hover, .item-index:active, .item-index:focus {
    background: #ff0000;
  }

  .item-index::after {
    content: "";
    width: 0;
    height: 40px;
    border-left: 2px #6699FF dashed;
    position: absolute;
    top: 20px;
    left: 8px;
  }

  .click.item-index::after, .item-index:hover::after, .item-index:active::after, .item-index:focus::after {
    border-color: #ff0000;
  }
</style>
