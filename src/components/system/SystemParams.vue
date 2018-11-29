<template>
  <div>
    <section class="content dialog">
      <el-form :model="systemParam" style="margin: 0;padding: 0" labelPosition="right"
               label-width="140px" v-loading="listLoading">
        <!--<h5 class="add-label" style="margin-top: 0">系统名称</h5>-->
        <!--<div class="add-appdiv" style="padding: 30px 30px 15px 30px">-->
        <!--<el-form-item label="系统名称" align="left" style="text-align: left">-->
        <!--<el-input v-model="systemParam.sysName" placeholder="系统名称" style="width: 300px" :maxlength=15></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="系统LOGO" align="left" style="margin: 0;text-align: left">-->
        <!--<el-upload :action="uploadUrl" :show-file-list="false"-->
        <!--:on-success="handleChange" :before-upload="beforeAvatarUpload">-->
        <!--<img :src="systemParam.sysLogo?systemParam.sysLogo:imgPath" class="avatar">-->
        <!--</el-upload>-->
        <!--</el-form-item>-->
        <!--</div>-->
        <h5 class="add-label" style="margin-top: 0">地图定位坐标</h5>
        <div class="add-appdiv">
          <el-form-item label="定位城市" align="left" style="margin: 0;text-align: left">
            <el-tooltip effect="dark" content="系统所有地图都根据所选的城市来定位初始位置" placement="bottom">
              <el-cascader :options="provinceList" :props="props" change-on-select filterable @change="cityChange"
                           v-model="selectedOptions2" placeholder="省市县区" clearable style="width: 350px">
              </el-cascader>
            </el-tooltip>
          </el-form-item>
        </div>
        <h5 class="add-label" style="margin-top: 0">实时数据热力图</h5>
        <div class="add-appdiv">
          <el-form-item label="刷新频率" align="left" style="margin: 0;text-align: left" class="sys">
            <el-input v-model.number="systemParam.refreshTime" placeholder="10" style="width: 250px"
                      :maxlength=7 size="medium">
              <span slot="prepend">每 </span>
              <span slot="append">秒刷新一次</span>
            </el-input>
          </el-form-item>
          <el-form-item label="数据时间范围" align="left" style="margin-top:15px;text-align: left" class="sys">
            <el-input v-model.number="systemParam.limitTime" placeholder="30" style="width: 350px"
                      :maxlength=7 size="medium">
              <span slot="prepend">最近</span>
              <span slot="append">分钟的抓取IMSI数据生成</span>
            </el-input>
          </el-form-item>
          <el-form-item align="left" style="margin:10px 0 0 0;text-align: left;width: 450px"
                        v-for="(item,idx) in systemParam.heatRanges" :key="idx+''" :label="idx==0?'热力标识范围(条)':''">
            <el-tooltip effect="dark" content="在该范围内，将显示对应的色值" placement="right" :disabled="idx!=0">
              <el-row>
                <el-col :span="18" align="left" style="text-align: left">
                  <el-input-number v-model="item.start" controls-position="right"
                                   :min="idx>0?systemParam.heatRanges[idx-1].end + 1:0"
                                   :disabled="idx==0" :max="item.end-1" style="width: 100px"
                                   size="medium"></el-input-number>
                  <span>~<span v-show="!item.end" style="margin-left: 10px">以上</span></span>
                  <el-input-number v-model="item.end" controls-position="right" :min="item.start+1"
                                   style="width: 100px" size="medium" v-show="item.end"></el-input-number>
                </el-col>
                <el-col :span="6" align="left"
                        style="display:-webkit-box;display:-ms-flexbox;display:flex;height: 40px;align-items: center;text-align: left">
                  <el-color-picker v-model="item.color" size="small"
                                   :predefine="colorArr"></el-color-picker>
                  <i class="el-icon-remove" @click="minusColor(idx)" v-show="item.end && idx!=0"
                     style="color: #6699FF;font-size: 24px;text-align: center;margin-left: 10px"></i>
                  <i class="el-icon-circle-plus" @click="plusColor(idx)"
                     v-show="item.end && idx==systemParam.heatRanges.length-2 && systemParam.heatRanges.length<5"
                     style="color: #6699FF;font-size: 24px;text-align: center;margin-left: 10px"></i>
                </el-col>
              </el-row>
            </el-tooltip>
          </el-form-item>
        </div>
        <h5 class="add-label" style="margin-top: 0">图像搜索阈值</h5>
        <div class="add-appdiv">
          <el-form-item label="相似度阈值" align="left" style="margin: 0;text-align: left">
            <el-tooltip effect="dark" content="默认的图像搜索的相似度阈值" placement="bottom">
              <el-input v-model="systemParam.similarThreshold" placeholder="相似度阈值" style="width: 300px"></el-input>
            </el-tooltip>
          </el-form-item>
        </div>
        <el-form-item align="left" style="margin: 0;text-align: left" v-show="getButtonVial('sysparam:update')">
          <el-button type="primary" @click="saveSet()" size="medium" style="width: 100px">保存</el-button>
        </el-form-item>
      </el-form>
      <div id="allmap" style="width: 100px;height: 100px;display: none"></div>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import {globalValidImg, doubleValid, numValid} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        systemParam: {
          sysName: '', sysLogo: '', refreshTime: 10, limitTime: 30, similarThreshold: 60,
          heatRanges: [{start: 0, end: 500, color: '#0000FF'}, {start: 501, color: '#ff0000'}]
        },
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        imgPath: require('../../assets/img/icon_people.png'),
        provinceList: json,
        props: {value: 'o', label: 'n', children: 'c'},
        selectedOptions2: [],
        colorArr: ['#0000FF', '#007F0A', '#FDFE1F', '#FE4404', '#ff0000'],
        myGeo: null,
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //添加热力图范围
      plusColor(indx) {
        let item = this.systemParam.heatRanges[this.systemParam.heatRanges.length - 2];
        this.systemParam.heatRanges.splice(indx + 1, 0, {start: item.end + 1, end: item.end + 100, color: '#007F0A'});
        this.systemParam.heatRanges[this.systemParam.heatRanges.length - 1].start = (this.systemParam.heatRanges[this.systemParam.heatRanges.length - 2].end + 1);
      },
      //删除热力图范围
      minusColor(indx) {
        this.systemParam.heatRanges.splice(indx, 1);
        this.systemParam.heatRanges[this.systemParam.heatRanges.length - 1].start = (this.systemParam.heatRanges[this.systemParam.heatRanges.length - 2].end + 1);
      },
      //设置系统参数
      saveSet() {
        let param = [];
        // if (this.systemParam.sysName.length > 0) {//系统名称
        //   param.push({code: 'sys_name', name: '系统名称', value: this.systemParam.sysName});
        // } else {
        //   this.$message.error('请输入系统名称');
        //   return;
        // }
        // if (this.systemParam.sysLogo.length > 0) {//系统LOGO
        //   param.push({code: 'sys_logo', name: '系统LOGO', value: this.systemParam.sysLogo});
        // } else {
        //   this.$message.error('请上传系统LOGO');
        //   return;
        // }
        if (this.selectedOptions2.length > 0) {//定位城市
          let city = this.getAreaLable(this.selectedOptions2[this.selectedOptions2.length - 1]);
          // 将地址解析结果显示在地图上,并调整地图视野
          this.myGeo.getPoint(city, function (point) {
            if (point) {
              param.push({code: 'sys_map_location', name: '地图定位坐标', value: [point.lng, point.lat]});
            } else {
              param.push({code: 'sys_map_location', name: '地图定位坐标', value: [116.331398, 39.897445]});
            }
          });
          param.push({code: 'sys_map_code', name: '省市区编码', value: this.selectedOptions2});
        } else {
          this.$message.error('请选择定位的城市');
          return;
        }
        if (this.systemParam.refreshTime > 0) {//刷新时间
          if (!numValid(this.systemParam.refreshTime)) {
            this.$message.error('刷新时间请输入数字');
            return;
          }
          param.push({code: 'heatChart_refresh_freq', name: '热力图刷新间隔', value: this.systemParam.refreshTime});
        } else {
          this.$message.error('请输入正确的刷新时间');
          return;
        }
        if (this.systemParam.limitTime > 0) {//数据时间范围
          if (!numValid(this.systemParam.limitTime)) {
            this.$message.error('数据时间范围请输入数字');
            return;
          }
          param.push({code: 'heatChart_time_limit', name: '热力图时间范围', value: this.systemParam.limitTime});
        } else {
          this.$message.error('请输入正确的数据时间范围');
          return;
        }
        if (this.systemParam.heatRanges.length > 0) {//热力图档位范围

          param.push({code: 'heatChart_color_range', name: '热力图档位范围', value: this.systemParam.heatRanges});
        } else {
          this.$message.error('请输入热力图档位范围');
          return;
        }
        if (this.systemParam.similarThreshold > 0) {//图片搜索阈值
          if (!doubleValid(this.systemParam.similarThreshold)) {
            this.$message.error('相似度为0.1-99的数字');
            return;
          } else {
            if (this.systemParam.similarThreshold < 0.1 || this.systemParam.similarThreshold > 99) {
              this.$message.error('相似度为0.1-99的数字');
              return;
            }
          }
          param.push({code: 'image_search_threshold', name: '图片搜索阈值', value: this.systemParam.similarThreshold});
        } else {
          this.$message.error('请输入正确的图片搜索阈值');
          return;
        }
        this.listLoading = true;
        setTimeout(() => {
          if (param.length == 6) {
            this.setSystem(param);
          }
        }, 1000);
      },
      setSystem(param) {
        this.$post('sysparam/update', param, '保存成功').then((data) => {
          this.listLoading = false;
          this.getSystemDetail();
        }).catch((err) => {
          this.listLoading = false;
          this.$message.error(err);
        });
      },
      //获取系统参数配置
      getSystemDetail() {
        this.$post('sysparam/query', {}).then((data) => {
          if ("000000" === data.code) {
            if (data.data.length > 0) {
              data.data.forEach((item) => {
                if (item.code == 'sys_name') {
                  this.systemParam.sysName = item.value;
                }
                if (item.code == 'sys_logo') {
                  this.systemParam.sysLogo = item.value;
                }
                if (item.code == 'sys_map_code') {
                  this.selectedOptions2 = item.value;
                }
                if (item.code == 'sys_map_location') {
                  this.systemParam.localPoint = item.value;
                }
                if (item.code == 'heatChart_refresh_freq') {
                  this.systemParam.refreshTime = item.value;
                }
                if (item.code == 'heatChart_time_limit') {
                  this.systemParam.limitTime = item.value;
                }
                if (item.code == 'heatChart_color_range') {
                  this.systemParam.heatRanges = item.value;
                }
                if (item.code == 'image_search_threshold') {
                  this.systemParam.similarThreshold = item.value;
                }
                sessionStorage.setItem("system", JSON.stringify(this.systemParam));
                this.$emit('setSystem', 'sys');
              });
            }
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //图像个数变化
      handleChange(res, file) {
        if ('000000' === res.code) {
          this.systemParam.sysLogo = res.data.fileUrl;
        } else {
          this.$message.error(res.msg);
        }
      },
      beforeAvatarUpload(file) {
        if (globalValidImg(file, this.$message)) {
        }
        return globalValidImg(file, this.$message);
      },
      //场所省市县变化
      cityChange(value) {
        this.selectedOptions2 = value;
      },
      //获得省市县
      getAreaLable(code) {
        let lable = '';
        this.provinceList.forEach((province) => {
          if (province.c) {
            province.c.forEach((city) => {
              if (city.c) {//省级+市级+县级
                city.c.forEach((country) => {
                  if (code === province.o) {
                    lable = province.n;
                    return;
                  }
                  if (code === city.o) {
                    lable = province.n + city.n;
                    return;
                  }
                  if (code === country.o) {
                    lable = province.n + city.n + country.n;
                    return;
                  }
                })
              } else {//省级+市级
                if (code === province.o) {
                  lable = province.n;
                  return;
                }
                if (code === city.o) {
                  lable = province.n + city.n;
                  return;
                }
              }
            })
          } else {//只包含省级
            if (code === province.o) {
              lable = province.n;
              return;
            }
          }
        });
        return lable;
      }
    },
    mounted() {
      // 百度地图API功能
      var map = new BMap.Map("allmap");
      var point = new BMap.Point(116.331398, 39.897445);
      map.centerAndZoom(point, 12);
      // 创建地址解析器实例
      this.myGeo = new BMap.Geocoder();
      this.getSystemDetail();
    }
  }
</script>
<style scoped>
  .avatar {
    max-width: 150px;
    max-height: 150px;
    border: 1px dashed #ccc;
    border-radius: 6px;
  }
</style>
