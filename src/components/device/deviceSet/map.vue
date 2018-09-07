<template>
  <div id="container" style="width: 100%;height:400px" tabindex="0"></div>
</template>
<script>
  export default {
    props: ['formattedAddress'],
    data() {
      return {
        position: {},
        map: {},
        geolocation: {},//定位
        geocoder: {},//地址（区域编码）与经纬度的转换
        marker: {},
        detailAddress: this.formattedAddress
      }
    },
    watch: {
      formattedAddress: function () {
        this.detailAddress = this.formattedAddress;
        this.getCenter();
      }
    },
    created() {
      this.detailAddress = this.formattedAddress;
    },
    methods: {
      setLocation() {
        let _this = this;
        this.geocoder.getAddress([this.position.lng, this.position.lat], function (status, result) {
//          console.log(result);
          if (status === 'complete' && result.info === 'OK') {
            //获得了有效的地址信息:即，result.regeocode.formattedAddress
            _this.position.detailAddress = result.regeocode.addressComponent.township +
              result.regeocode.addressComponent.street + result.regeocode.addressComponent.streetNumber;
            _this.position.code = result.regeocode.addressComponent.adcode;
          } else {
            //获取地址失败
            _this.position.detailAddress = '';
            _this.position.code = '';
          }
          _this.$emit('getLocation', _this.position);
        });
      },
      getCenter() {
        let _this = this;
        this.geocoder.getLocation(this.detailAddress, function (status, result) {
//          console.log(result);
          if (status === 'complete' && result.info === 'OK') {
            //获得了有效的地址信息:即，result.regeocode.formattedAddress
            _this.geocoderCallBack(result.geocodes);
          } else {
            //获取地址失败
          }
        });
      },
      //地理编码返回结果展示
      geocoderCallBack(data) {
        //地理编码结果数组
        this.map.setCenter(data[0].location);
        this.map.clearMap();  // 清除地图覆盖物

        this.marker = new AMap.Marker({
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
          position: data[0].location
        });
        this.marker.setMap(this.map);
        this.position.lng = data[0].location.lng;
        this.position.lat = data[0].location.lat;
        this.setLocation();
        this.map.setFitView();
      }
    },
    mounted() {
      let _this = this;
      //加载地图，调用浏览器定位服务
      this.map = new AMap.Map("container", {
        resizeEnable: true,
        rotateEnable: true,
        pitchEnable: true,
        zoom: 17,
        pitch: 80,
        rotation: -15,
        viewMode: '3D',//开启3D视图,默认为关闭
        buildingAnimation: true,//楼块出现是否带动画
        expandZoomRange: true,
        zooms: [3, 20],
        dragEnable: true
      });

      this.map.plugin(['AMap.Geolocation', 'AMap.ToolBar', 'AMap.Scale', 'AMap.Geocoder', "AMap.ControlBar"], function () {
        //定位
//        _this.geolocation = new AMap.Geolocation({
//          useNative: true,
//          enableHighAccuracy: true,//是否使用高精度定位，默认:true
//          timeout: 10000,          //超过10秒后停止定位，默认：无穷大
//          buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
//          zoomToAccuracy: true     //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
//        });
//        _this.map.addControl(_this.geolocation);
//        _this.geolocation.getCurrentPosition();
//        AMap.event.addListener(_this.geolocation, 'complete', onComplete);//返回定位信息
//        AMap.event.addListener(_this.geolocation, 'error', onError);      //返回定位出错信息
//        AMap.event.addListener(_this.geolocation, 'click', onComplete);      //定位按钮点击事件

        _this.map.addControl(new AMap.ControlBar());//3D地图的角度工具
        _this.map.addControl(new AMap.ToolBar());//地图缩放工具
        _this.map.addControl(new AMap.Scale());

        _this.geocoder = new AMap.Geocoder({
//          city: "340302", //城市，默认：“全国”
          radius: 1000, //范围，默认：500
          extensions: "all"//返回地址描述以及附近兴趣点和道路信息，默认"base"
        });
        //返回地理编码结果
        _this.map.addControl(_this.geocoder);
        _this.getCenter();
      });
      this.map.on('click', function (e) {
        _this.map.clearMap();  // 清除地图覆盖物
        _this.marker = new AMap.Marker({
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
          position: [e.lnglat.getLng(), e.lnglat.getLat()]
        });
        _this.marker.setMap(_this.map);

        _this.position.lng = e.lnglat.lng;
        _this.position.lat = e.lnglat.lat;
        _this.setLocation();
      });

      //解析定位结果
      function onComplete(data) {
        _this.map.clearMap();  // 清除地图覆盖物

        _this.marker = new AMap.Marker({
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
          position: [data.position.getLng(), data.position.getLat()]
        });
        _this.marker.setMap(_this.map);
        _this.position.lng = data.position.lng;
        _this.position.lat = data.position.lat;
        _this.setLocation();
      }

      //解析定位错误信息
      function onError(data) {
        _this.position = {};
        _this.setLocation();
      }
    }
  }
</script>
