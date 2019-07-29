<template>
  <section>
    <el-form :inline="true" :model="query" align="left" style="text-align: left">
      <el-form-item style="margin-bottom: 15px">
        <el-radio-group v-model="dateString" size="medium" @change="handleDateType">
          <el-radio-button v-for="item in dateTimes" :label="item.value" :key="item.value">{{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item style="margin-bottom: 15px">
        <el-date-picker v-model="durationDate" type="daterange" align="right" unlink-panels range-separator="至"
                        size="medium" start-placeholder="开始日期" end-placeholder="结束日期"
                        :picker-options="pickerOptions2" @change="handleDate" style="width: 250px"
                        value-format="yyyy-MM-dd" v-show="dateString == 'dur'">
        </el-date-picker>
      </el-form-item>
      <el-form-item style="margin-bottom: 15px;margin-left: 30px">
        <el-radio-group v-model="query.scope" size="medium" @change="handleDevice">
          <el-radio-button v-for="item in deviceTypes" :label="item.value" :key="item.value">{{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item style="margin-bottom: 15px">
        <el-select v-model="query.scopeId" placeholder="请选择设备ID" filterable v-show="query.scope == 2"
                   style="width: 180px" size="medium" @change="handleDevId">
          <el-option v-for="item in deviceList" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div id="main" v-bind:style="'width:100%;height:'+lineHeight+'px'"></div>
    <el-row>
      <el-col :span="24" align="left">
        <el-radio-group v-model="query.interval" size="medium" @change="handleTime">
          <el-radio-button v-for="item in timePeriods" :label="item.value" :key="item.value">{{item.label}}
          </el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
  </section>
</template>
<script>
  let echarts = require('echarts');
  import {formatDate} from "../../assets/js/util";

  export default {
    data() {
      return {
        deviceList: [],
        lineHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 230,
        dateTimes: [{label: '今天', value: formatDate(new Date(), 'yyyy-MM-dd')},
          {label: '昨天', value: formatDate(new Date((new Date().getTime() - 24 * 3600 * 1000)), 'yyyy-MM-dd')},
          {
            label: '最近一周',
            value: formatDate(new Date((new Date().getTime() - 24 * 3600 * 7 * 1000)), 'yyyy-MM-dd') +
              '~' + formatDate(new Date(), 'yyyy-MM-dd')
          },
          {label: '自定义', value: 'dur'}],
        dateString: formatDate(new Date(), 'yyyy-MM-dd'),
        query: {
          startTime: new Date(formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").getTime(),
          scope: 0, interval: 5, scopeId: '', endTime: new Date().getTime()
        },
        deviceTypes: [{label: '全部设备', value: 0}, {label: '指定设备', value: 2}],
        pickerOptions2: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        timePeriods: [{label: '5分钟', value: 5}, {label: '15分钟', value: 15}, {label: '1小时', value: 60}],
        durationDate: '',
        timeDur: '',
        chartTitle: formatDate(new Date(), 'yyyy-MM-dd'),
        startValue: 0,
        statistics: []//统计数据
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      let myChart = echarts.getInstanceByDom(document.getElementById('main'));
      if (myChart) {
        echarts.dispose(myChart);
      }
    },
    methods: {
      //网络获取统计数据
      getData() {
        let myChart = echarts.getInstanceByDom(document.getElementById('main'));
        if (!myChart) {
          myChart = echarts.init(document.getElementById('main'));
        }
        myChart.showLoading();
        this.$post("/analysis/terminate", this.query).then((data) => {
          this.statistics = data.data;
          if (this.statistics.length <= 100) {
            this.startValue = 0;
          } else {
            let a = parseInt((10000 / this.statistics.length));
            if (a <= 1) {
              this.startValue = 99;
            } else {
              this.startValue = 100 - parseInt((10000 / this.statistics.length));
            }
          }
          this.getChart();
        }).catch((err) => {
          this.statistics = [{time: '--', imsi: 0, face: 0, car: 0}];
          this.getChart();
        });
      },
      //获取折线统计图的数组
      getMapData(val) {
        let arr = [];
        this.statistics.forEach((item) => {
          arr.push(item[val]);
        });
        return arr;
      },
      /** 折线图表示例*/
      getChart() {
        let myChart = echarts.getInstanceByDom(document.getElementById('main'));
        if (!myChart) {
          myChart = echarts.init(document.getElementById('main'));
        }
        myChart.clear();
        // 指定图表的配置项和数据
        let option = {//backgroundColor: '#404a59',
          color: ['#2F4554', '#C23531', '#008000', '#FF8000', '#91c7ae', '#749f83'],
          title: {text: this.chartTitle, textStyle: {fontSize: 16}},
          grid: {left: 10, right: 10, top: 40, bottom: 50, containLabel: true},
          toolbox: {feature: {magicType: {type: ['line', 'bar']}, saveAsImage: {show: true}}},
          tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}, extraCssText: 'width: 170px;text-align:left'},
          legend: {data: ['IMSI', '人脸', '车牌'], right: 100, itemWidth: 30},
          xAxis: {data: this.getMapData('time')},
          yAxis: {
            type: 'value', name: '数据量（单位：条）', nameLocation: 'center', nameGap: '-20',
            axisLabel: {interval: 0, rotate: 30}
          },
          dataZoom: [{show: true, start: this.startValue, end: 100}, {type: 'slider'}, {type: 'inside'}],
          series: [//line -> 折线图  bar -> 柱状图solid  dashed  dotted lineStyle: {type: 'dotted', width: 4},
            {name: 'IMSI', type: 'line', smooth: true, symbol: 'roundRect', data: this.getMapData('imsi')},
            {name: '人脸', type: 'line', smooth: true, symbol: 'roundRect', data: this.getMapData('face')},
            {name: '车牌', type: 'line', smooth: true, symbol: 'roundRect', data: this.getMapData('car')}
          ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option, true);
        myChart.hideLoading();
      },
      //选择时间间隔
      handleTime(val) {
        this.query.interval = val;
        this.getData();
      },
      //选择日期
      handleDateType(val) {
        if (val.length > 10) {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15},
            {label: '1小时', value: 60}, {label: '1天', value: 1440}];
          this.query.startTime = new Date((formatDate(new Date((new Date().getTime() - 24 * 3600 * 7 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime();
          this.query.endTime = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
        } else {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15}, {label: '1小时', value: 60}];
          if (formatDate(new Date(), 'yyyy-MM-dd') === val) {
            this.query.startTime = new Date((val + " 00:00:00").replace(/-/g, '/')).getTime();
            this.query.endTime = new Date().getTime();
          } else {
            this.query.startTime = new Date((val + " 00:00:00").replace(/-/g, '/')).getTime();
            this.query.endTime = new Date((val + " 23:59:59").replace(/-/g, '/')).getTime();
          }
        }
        this.query.interval = 5;

        if (val !== 'dur') {
          this.chartTitle = val;
          this.durationDate = '';
          this.getData();
        }
      },
      //选择时间段
      handleDate(val) {
        if (new Date(val[1]).getTime() - new Date(val[0]).getTime() > 90 * 24 * 3600 * 1000) {
          this.$message.error('请选择1~90天的范围');
          return;
        }
        this.query.startTime = new Date((val[0] + " 00:00:00").replace(/-/g, '/')).getTime();
        this.query.endTime = new Date((val[1] + " 23:59:59").replace(/-/g, '/')).getTime();
        if (this.query.endTime - this.query.startTime > 24 * 3600 * 1000) {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15},
            {label: '1小时', value: 60}, {label: '1天', value: 1440}];
          this.chartTitle = val[0] + "~" + val[1];
        } else {
          this.timePeriods = [{label: '5分钟', value: 5}, {label: '15分钟', value: 15}, {label: '1小时', value: 60}];
          this.chartTitle = val[0];
        }
        this.query.interval = 5;
        this.getData();
      },
      //设备查询
      handleDevice(val) {
        this.query.scopeId = '';
        if (val === 0) {//全部设备
          this.getData();
        }
      },
      //指定设备查询
      handleDevId(val) {
        this.query.scopeId = val;
        this.getData();
      },
      //获取设备列表
      getDeviceList() {
        this.$post("device/query", {page: 1, size: 9999}).then((data) => {
          if (data.data.list && data.data.list.length > 0) {
            data.data.list.forEach((item) => {
              this.deviceList.push({id: item.deviceId, name: item.deviceName})
            });
          }
        });
        this.$post("camera/query", {page: 1, size: 9999}).then((data) => {
          if (data.data.list && data.data.list.length > 0) {
            data.data.list.forEach((item) => {
              this.deviceList.push({id: item.cameraCode, name: item.name})
            });
          }
        })
      }
    },
    mounted() {
      this.getDeviceList();
      this.getData();
    }
  }
</script>
