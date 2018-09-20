<template>
  <div>
    <section class="content">
      <el-cascader :options="provinceList" :props="props" change-on-select filterable @change="placeChange"
                   v-model="selectedOptions2" placeholder="省市县区" clearable
                   style="position: absolute;top: 10px;left: 10px;width: 90%">
      </el-cascader>
      <div id="container" style="width: 100%;height:400px"></div>
    </section>
  </div>
</template>
<script>
  import json from '../../../assets/city.json';
  import axios from "axios";

  export default {
    props: ['formattedAddress'],
    data() {
      return {
        provinceList: json,
        props: {value: 'o', label: 'n', children: 'c'},
        selectedOptions2: [],
        position: {},
        map: {},
        geolocation: {},//定位
        geocoder: {},//地址（区域编码）与经纬度的转换
        marker: {},
        detailAddress: ''
      }
    },
    watch: {
      formattedAddress: function () {
        this.selectedOptions2 = this.formattedAddress;
        this.setCenter();
      }
    },
    created() {
      this.selectedOptions2 = this.formattedAddress;
    },
    methods: {
      //场所省市县变化
      placeChange(value) {
        this.selectedOptions2 = value;
        if (this.selectedOptions2.length > 0) {
          this.detailAddress = this.getAreaLable(this.selectedOptions2[this.selectedOptions2.length - 1]);
          this.position.detailAddress = this.detailAddress;
          this.position.code = this.selectedOptions2[this.selectedOptions2.length - 1];
          this.setCenter();
        }
      },
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
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
      //获得城市名称
      getCityName(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {//省级+市级+县级
                city.c.forEach((country) => {
                  if (code === country.o) {
                    lable = city.n;
                  }
                })
              } else {//省级+市级
                if (code === city.o) {
                  lable = city.n;
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
      //获取城市编码
      getCityCode(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {//省级+市级+县级
                city.c.forEach((country) => {
                  if (code === country.n) {
                    lable = country.o;
                  }
                })
              }
            })
          }
        });
        return lable;
      },
      //根据区域码找到对应的省市县编码
      getCode(code) {
        console.log(code);
        let arr = [];
        json.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {
                city.c.forEach((country) => {
                  if (code === country.o) {
                    arr = [province.o, city.o, country.o];
                  }
                })
              } else {
                if (code === city.o) {
                  arr = [province.o, city.o];
                }
              }
            })
          } else {
            if (code === province.o) {
              arr = [province.o];
            }
          }
        });
        return arr;
      },
      //设置地图的中心点
      setCenter() {
        let _this = this;
        let city = this.getCityName(this.selectedOptions2[this.selectedOptions2.length - 1]);
        this.geocoder.getPoint(this.detailAddress, function (point) {
          console.log(point);
          if (point) {
            _this.map.clearOverlays();
            _this.position.lng = point.lng;
            _this.position.lat = point.lat;
            _this.map.centerAndZoom(point, 14);
            _this.map.addOverlay(new BMap.Marker(point));
            _this.setLocation();
          } else {
            alert("您选择地址没有解析到结果!");
          }
        }, city);
      },
      //经纬度转换地址
      setLocation() {
        let _this = this;
        this.geocoder.getLocation(new BMap.Point(this.position.lng, this.position.lat), function (rs) {
          console.log(rs);
          _this.position.detailAddress = rs.addressComponents.street + rs.addressComponents.streetNumber;
          _this.position.code = _this.getCityCode(rs.addressComponents.district);
          _this.selectedOptions2 = _this.getCode(_this.position.code);
          console.log(_this.position);
          console.log(_this.selectedOptions2);
          _this.$emit('getLocation', _this.position);
        });
      }
    },
    mounted() {
      let _this = this;

      this.map = new BMap.Map("container");
      this.map.enableScrollWheelZoom(true);
      this.geocoder = new BMap.Geocoder();

      var point = new BMap.Point(116.331398, 39.897445);
      this.map.centerAndZoom(point, 12);

      function myFun(result) {
        var cityName = result.name;
        _this.map.setCenter(cityName);
      }

      var myCity = new BMap.LocalCity();
      myCity.get(myFun);

      this.geolocation = new BMap.Geolocation();
      this.geolocation.getCurrentPosition(function (r) {
        console.log(r);
        _this.map.clearOverlays();
        _this.map.addOverlay(new BMap.Marker(r.point));
        _this.position.lng = r.point.lng;
        _this.position.lat = r.point.lat;
        _this.setLocation();
      }, {enableHighAccuracy: true});

      this.map.addEventListener("click", function (e) {
        console.log(e);
        var pt = e.point;
        _this.position.lng = pt.lng;
        _this.position.lat = pt.lat;
        _this.position.detailAddress = '';
        _this.map.clearOverlays();  // 清除地图覆盖物
        _this.map.addOverlay(new BMap.Marker(pt));
        _this.setLocation();
      });
    }
  }
</script>
