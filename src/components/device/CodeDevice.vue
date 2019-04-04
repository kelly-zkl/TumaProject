<template>
  <div>
    <section class="content">
      <div class="center-block">
        <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 1100px">
          <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('device:query')">
            <el-input placeholder="设备标识/ID" v-model="query.deviceName" :maxlength="30"
                      @change="changeDevice" size="medium"></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.placeId" placeholder="场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" @click.stop="query.page=1;getData()" size="medium">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button @click.stop="clearData()" size="medium">重置</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-show="isMore">
            <el-select v-model="query.deviceType" placeholder="全部类型" size="medium" filterable clearable>
              <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-show="isMore">
            <el-select v-model="query.deviceForm" placeholder="全部形态" size="medium" filterable clearable
                       style="width: 160px">
              <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-table :data="deviceList" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceTypeVal" label="类型" min-width="120" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceFormVal" label="形态" min-width="120" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="安装地区" prop="areaCode" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="detailAddress" label="详细地址" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="placeName" label="安装场所" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备标识" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="lineStatus" label="在线状态" min-width="100" max-width="120">
            <template slot-scope="scope">
              <span style="color:#00C755" v-show="scope.row.lineStatus == '在线'">在线</span>
              <span style="color:#999" v-show="scope.row.lineStatus != '在线'">{{scope.row.lineStatus}}</span>
            </template>
          </el-table-column>
          <el-table-column align="left" label="操作" min-width="110" max-width="150" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click.stop="runningSetPlace=true;addPlace=scope.row"
                         v-show="getButtonVial('device:set:place')">设置场所
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top:10px;text-align: right" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                         background :page-sizes="[10, 15, 20, 30]" :page-size="query.size"
                         layout="total, sizes, prev, pager, next, jumper" :total="count"></el-pagination>
        </div>
      </div>
      <!--设置场所-->
      <el-dialog title="设置场所" :visible.sync="runningSetPlace" :width="dialogWidth" center>
        <div class="block">
          <el-form ref="addPlace" :model="addPlace" :label-position="labelPosition" :label-width="labelWidth">
            <el-form-item label="设备ID" prop="deviceId">
              <el-input v-model="addPlace.deviceId" auto-complete="off" readonly></el-input>
            </el-form-item>
            <el-form-item label="设备标识" prop="deviceName">
              <el-input v-model="addPlace.deviceName" auto-complete="off" readonly></el-input>
            </el-form-item>
            <el-form-item label="选择场所" prop="placeId">
              <el-select v-model="addPlace.placeId" placeholder="请选择" style="width: 100%" filterable clearable>
                <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button @click="runningSetPlace = false">取消</el-button>
            <el-button type="primary" @click="placeAdd()">确定</el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import axios from "axios";
  import {noSValidator} from "../../assets/js/api";
  import {isPC, buttonValidator, getAreaLable} from "../../assets/js/util";

  export default {
    data() {
      return {
        isMore: false,
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        provinceList: JSON.parse(localStorage.getItem("areas")),
        lineStatus: '',
        areaList: [],
        tableHeight: window.innerHeight - 232,
        dialogWidth: isPC() ? '40%' : '90%',
        labelWidth: isPC() ? '100px' : '80px',
        listLoading: false,
        labelPosition: 'right',
        deviceList: [],
        query: {page: 1, size: 10},
        count: 0,
        runningSetPlace: false,
        addPlace: {deviceId: '', deviceName: '', deviceForm: '', deviceType: ''},
        online: [{value: true, label: '在线'}, {value: false, label: '离线'}],
        places: [],
        deviceForms: [],
        deviceTypes: [],
        intervalid: null,
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = window.innerHeight - 282
        } else {
          this.tableHeight = window.innerHeight - 232
        }
      },
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
      //获取设备类型和形态
      getDeviceTypeAndForm() {
        this.$post('device/get/deviceType').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceTypes = data.data;
          }
        });

        this.$post('device/get/deviceForm').then((data) => {
          if (data.code === '000000' && data.data) {
            this.deviceForms = data.data;
          }
        });
      },
      //定时刷新设备的在线状态
      statusTask() {
        if (!this.intervalid) {
          this.intervalid = setInterval(() => {
            this.getDeviceStatus();
          }, 5000);
        }
      },
      //获取设备的在线状态
      getDeviceStatus() {
        if (this.deviceList.length > 0) {
          let deviceIds = [];
          this.deviceList.forEach((device) => {
            deviceIds.push(device.deviceId);
          });
          axios.post("device/get/lineStatus", deviceIds).then((res) => {
            let data = res.data;
            if (res.status == 200) {
              this.deviceList.forEach((device) => {
                if (data[device.deviceId] == 0) {
                  this.$set(device, 'lineStatus', "离线");//在数组中增加属性
                } else if (data[device.deviceId] == 1) {
                  this.$set(device, 'lineStatus', "在线");//在数组中增加属性
                } else {
                  this.$set(device, 'lineStatus', "未知");//在数组中增加属性
                }
              });
            } else {
              this.deviceList.forEach((device) => {
                this.$set(device, 'lineStatus', "未知");//在数组中增加属性
              });
            }
          });
        }
      },
      changeDevice(val) {
        if (noSValidator(val)) {
          val = val.substr(0, val.length - 2);
          this.$message.error('请输入正确的设备标识/ID');
        }
      },
      //设置场所
      placeAdd() {
        let param = {};
        if (!this.addPlace.placeId) {
          this.$message.error('请选择安装场所');
          return;
        }
        param.deviceId = this.addPlace.deviceId;
        param.placeName = this.getPlaceName(this.addPlace.placeId);
        param.placeId = this.addPlace.placeId;
        this.$post('/device/set/place', param, '设置成功').then((data) => {
          this.runningSetPlace = false;
          this.getData();
        })
      },
      //获取设备列表
      getData() {
        if (this.query.deviceName) {
          if (noSValidator(this.query.deviceName)) {
            this.$message.error('请输入正确的设备标识/ID');
            return;
          }
        }
        this.listLoading = true;

        this.$post("device/query", this.query).then((data) => {
          this.deviceList = data.data.list;
          this.count = data.data.count;
          this.getDeviceStatus();
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.deviceList = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //搜索设备列表
      clearData() {
        this.query = {page: 1, size: 10};
        this.lineStatus = '';
        this.areaList = [];
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'areaCode') {
          return row.areaCode ? getAreaLable(row.areaCode) : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取场所列表
      getPlaceName(id) {
        for (let item of this.places) {
          if (item.id === id) {
            return item.placeName;
          }
        }
      },
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
      }
    },
    mounted() {
      this.getPlaces();
      this.getData();
      this.getDeviceTypeAndForm();
      this.statusTask();
    }
  }
</script>

<style scoped>
  a {
    color: #539FF8;
    margin-left: 10px;
    text-decoration: none;
  }
</style>
