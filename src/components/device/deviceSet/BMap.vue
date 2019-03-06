<template>
  <div>
    <section class="content">
      <!--<el-cascader :options="provinceList" :props="props" change-on-select filterable @change="placeChange"-->
      <!--v-model="selectedOptions2" placeholder="省市县区" clearable-->
      <!--style="position: absolute;top: 10px;left: 10px;width: 90%">-->
      <!--</el-cascader>-->
      <div id="container" style="width: 100%;height:600px"></div>
    </section>
  </div>
</template>
<script>

  export default {
    props: ['formattedAddress'],
    data() {
      return {
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        selectedOptions2: [],
        position: {},
        map: {},
        geolocation: {},//定位
        geocoder: {},//地址（区域编码）与经纬度的转换
        marker: {},
        systemParam: {},
        detailAddress: '',
        point: []
      }
    },
    watch: {
      formattedAddress: function () {
        let param = JSON.parse(this.formattedAddress);
        this.selectedOptions2 = param.codes;
        this.detailAddress = this.getAreaLable(this.selectedOptions2[this.selectedOptions2.length - 1]) + param.address;
        this.point = param.point;
        this.setCenter();
      }
    },
    created() {
      this.map = new BMap.Map("container", {minZoom: 5, maxZoom: 20});
      this.geocoder = new BMap.Geocoder();
      this.geolocation = new BMap.Geolocation();
      let param = JSON.parse(this.formattedAddress);
      this.selectedOptions2 = param.codes;
      this.detailAddress = this.getAreaLable(this.selectedOptions2[this.selectedOptions2.length - 1]) + param.address;
      this.point = param.point;
      this.setCenter();
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
          if (province.subAreas) {
            province.subAreas.forEach((city) => {
              if (city.subAreas) {//省级+市级+县级
                city.subAreas.forEach((country) => {
                  if (code === country.areaCode) {
                    lable = province.areaName + city.areaName + country.areaName;
                  }
                })
              } else {//省级+市级
                if (code === city.areaCode) {
                  lable = province.areaName + city.areaName;
                }
              }
            })
          } else {//只包含省级
            if (code === province.areaCode) {
              lable = province.areaName;
            }
          }
        });
        return lable;
      },
      //获得城市名称
      getCityName(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.subAreas) {
            province.subAreas.forEach((city) => {
              if (city.subAreas) {//省级+市级+县级
                city.subAreas.forEach((country) => {
                  if (code === country.areaCode) {
                    lable = city.areaName;
                  }
                })
              } else {//省级+市级
                if (code === city.areaCode) {
                  lable = city.areaName;
                }
              }
            })
          } else {//只包含省级
            if (code === province.areaCode) {
              lable = province.areaName;
            }
          }
        });
        return lable;
      },
      //获取城市编码
      getCityCode(cName, code, type) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.subAreas) {
            if (type == 0) {//省市县都有
              province.subAreas.forEach((city) => {
                if (city.subAreas) {//省级+市级+县级
                  if (city.areaName.indexOf(cName) >= 0) {
                    city.subAreas.forEach((country) => {
                      if (code === country.n) {
                        lable = country.areaCode;
                      }
                    })
                  }
                } else {
                  if (province.areaName.indexOf(cName) >= 0) {
                    if (code === city.areaName) {
                      lable = city.areaCode;
                    }
                  }
                }
              })
            } else {//只有省县，没有市
              province.subAreas.forEach((city) => {
                if (city.subAreas) {//省级+市级+县级
                  if (city.areaName.indexOf(cName) >= 0) {
                    city.subAreas.forEach((country) => {
                      if (province.areaName.indexOf(cName) >= 0) {
                        if (code === country.areaName) {
                          lable = country.areaCode;
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        });
        return lable;
      },
      //根据区域码找到对应的省市县编码
      getCode(code) {
        let arr = [];
        this.provinceList.forEach((province) => {
          if (province.subAreas) {
            province.subAreas.forEach((city) => {
              if (city.subAreas) {
                city.subAreas.forEach((country) => {
                  if (code === country.areaCode) {
                    arr = [province.areaCode, city.areaCode, country.areaCode];
                  }
                })
              } else {
                if (code === city.areaCode) {
                  arr = [province.areaCode, city.areaCode];
                }
              }
            })
          } else {
            if (code === province.areaCode) {
              arr = [province.areaCode];
            }
          }
        });
        return arr;
      },
      //设置地图的中心点
      setCenter() {
        let localPoint = this.systemParam.localPoint;
        if (this.point.length > 0) {
          localPoint = this.point;
        }
        var point = new BMap.Point(localPoint[0], localPoint[1]);
        this.map.centerAndZoom(point, 12);
        // let _this = this;
        // let city = this.getCityName(this.selectedOptions2[this.selectedOptions2.length - 1]);
        // this.geocoder.getPoint(this.detailAddress, function (point) {
        //   console.log(point);
        //   if (point) {
        //     _this.map.clearOverlays();
        //     _this.position.lng = point.lng;
        //     _this.position.lat = point.lat;
        //     _this.map.centerAndZoom(point, 12);
        //     _this.map.addOverlay(new BMap.Marker(point));
        //     _this.setLocation();
        //   } else {
        //     alert("您选择地址没有解析到结果!");
        //   }
        // }, city);
      },
      //经纬度转换地址
      setLocation() {
        let _this = this;
        this.geocoder.getLocation(new BMap.Point(this.position.lng, this.position.lat), function (rs) {
          console.log(rs);
          let address = JSON.parse(_this.formattedAddress).address;
          if (rs.addressComponents.street.length !== 0 || rs.addressComponents.streetNumber.length !== 0) {
            address = rs.addressComponents.street + rs.addressComponents.streetNumber;
          }
          _this.position.detailAddress = address;
          let cnmae = rs.addressComponents.city ? rs.addressComponents.city : rs.addressComponents.province;
          let type = rs.addressComponents.city ? 0 : 1;
          _this.position.code = _this.getCityCode(cnmae, rs.addressComponents.district, type);
          console.log(_this.position.code);
          _this.selectedOptions2 = _this.getCode(_this.position.code);
          console.log(_this.position);
          _this.$emit('getLocation', _this.position);
        });
      }
    },
    mounted() {
      let _this = this;
      this.systemParam = JSON.parse(sessionStorage.getItem("system"));

      this.map = new BMap.Map("container", {minZoom: 5, maxZoom: 20});
      this.map.enableScrollWheelZoom(true);
      this.geocoder = new BMap.Geocoder();
      var point = new BMap.Point(this.systemParam.localPoint[0], this.systemParam.localPoint[1]);
      this.map.centerAndZoom(point, 12);

      // if (this.selectedOptions2.length === 0) {
      //   var point = new BMap.Point(116.331398, 39.897445);
      //   this.map.centerAndZoom(point, 12);
      //
      //   function myFun(result) {
      //     var cityName = result.name;
      //     _this.map.setCenter(cityName);
      //   }
      //
      //   var myCity = new BMap.LocalCity();
      //   myCity.get(myFun);
      //   this.geolocation.getCurrentPosition(function (r) {
      //     console.log(r);
      //     _this.map.clearOverlays();
      //     _this.map.addOverlay(new BMap.Marker(r.point));
      //     _this.position.lng = r.point.lng;
      //     _this.position.lat = r.point.lat;
      //     _this.setLocation();
      //   }, {enableHighAccuracy: true});
      // }

      this.map.addEventListener("click", function (e) {
        console.log(e);
        var pt = e.point;
        _this.position.lng = pt.lng;
        _this.position.lat = pt.lat;
        _this.position.detailAddress = '';
        _this.map.clearOverlays();  // 清除地图覆盖物
        _this.map.addOverlay(new BMap.Marker(pt));
        _this.$emit('getLocation', _this.position);
        // _this.setLocation();
      });
    }
  }
</script>
