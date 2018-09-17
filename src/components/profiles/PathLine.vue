<template>
  <div>
    <section>
      <el-form :model="query" style="margin: 0;text-align: left" :inline="true">
        <el-form-item label="时间范围">
          <el-date-picker v-model="cTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="区域范围">
          <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                       v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      查看轨迹
      <div class="view-map" id="view-map"></div>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';

  export default {
    data() {
      return {
        query: {},
        props: {value: 'o', label: 'n', children: 'c'},
        provinceList: json,
        areaList: [],
        map: {},
        cTime: '',
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
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        this.query.provinceCode = '';
        this.query.cityCode = '';
        this.query.areaCode = '';
        if (value.length === 1) {
          this.query.provinceCode = value[0];
        } else if (value.length === 2) {
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.areaCode = value[2];
        } else if (value.length === 4) {
          this.query.areaCode = value[2];
        }
      },
      pathLine() {
        var sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
          scale: 0.6,//图标缩放大小
          strokeColor: '#fff',//设置矢量图标的线填充颜色
          strokeWeight: '2',//设置线宽
        });
        var icons = new BMap.IconSequence(sy, '10', '30');
        // 创建polyline对象
        var pois = [
          new BMap.Point(116.350658, 39.938285),
          new BMap.Point(116.386446, 39.939281),
          new BMap.Point(116.389034, 39.913828),
          new BMap.Point(116.442501, 39.914603)
        ];
        var polyline = new BMap.Polyline(pois, {
          enableEditing: false,//是否启用线编辑，默认为false
          enableClicking: true,//是否响应点击事件，默认为true
          icons: [icons],
          strokeWeight: '8',//折线的宽度，以像素为单位
          strokeOpacity: 1,//折线的透明度，取值范围0 - 1
          strokeColor: "#FF6600" //折线颜色#6699FF
        });
        this.map.addOverlay(polyline);
        for (var i = 0; i < pois.length; i++) {
          //创建小狐狸
          var pt = pois[i];
          var myIcon = new BMap.Icon("http://lbsyun.baidu.com/jsdemo/img/fox.gif", new BMap.Size(300, 157));
          var marker2 = new BMap.Marker(pt, {icon: myIcon});  // 创建标注
          this.map.addOverlay(marker2);
        }
      },
    },
    mounted() {
      let _this = this;
      this.map = new BMap.Map("view-map");
      this.map.enableScrollWheelZoom(true);
      var geolocation = new BMap.Geolocation();

      geolocation.getCurrentPosition(function (r) {
        console.log(r);
        _this.map.centerAndZoom(r.point, 16);
      }, {enableHighAccuracy: true});

      this.pathLine();
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
