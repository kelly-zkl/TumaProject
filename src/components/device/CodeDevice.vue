<template>
  <div>
    <section class="content">
      <div class="center-block">
        <el-form :inline="true" :model="query" align="left">
          <el-row>
            <el-col :span="24" align="left">
              <el-form-item style="margin-bottom: 10px">
                <el-input placeholder="设备名称/ID" v-model="query.deviceName" :maxlength="30"
                          @change="changeDevice" size="medium"></el-input>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                             v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
                </el-cascader>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="query.deviceType" placeholder="全部类型" size="medium" filterable clearable>
                  <el-option v-for="item in deviceTypes" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="query.deviceForm" placeholder="全部形态" size="medium" filterable clearable>
                  <el-option v-for="item in deviceForms" :key="item.code" :label="item.name" :value="item.code">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-input placeholder="安装场所" v-model="query.placeName" :maxlength="30" size="medium"></el-input>
                <!--<el-select v-model="query.placeId" placeholder="安装场所" size="medium" filterable clearable>-->
                <!--<el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">-->
                <!--</el-option>-->
                <!--</el-select>-->
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" @click.stop="getData()" size="medium">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button @click.stop="clearData()" size="medium">清除</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-table :data="deviceList" v-loading="listLoading" class="center-block"
                  @selection-change="selsChange" stripe>
          <!--<el-table-column type="selection" width="45" align="left"></el-table-column>-->
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="设备ID" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceName" label="设备名称" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="placeName" label="安装场所" min-width="150" max-width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceTypeVal" label="类型" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="deviceFormVal" label="形态" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="detailAddress" label="位置" min-width="180" max-width="300"
                           :formatter="formatterAddress"></el-table-column>
          <!--<el-table-column align="left" prop="groupName" label="所属组织" min-width="125" max-width="200"-->
          <!--:formatter="formatterAddress"></el-table-column>-->
          <el-table-column align="left" prop="lineStatus" label="在线状态" min-width="100"
                           max-width="120"></el-table-column>
          <el-table-column align="left" label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="text" v-show="getButtonVial('set:restart')"
                         @click.stop="runningSetPlace=true;addPlace=scope.row">设置场所
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px">
          <el-pagination
            @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page" background
            :page-sizes="[10, 15, 20, 30]" :page-size="query.size" layout="total, sizes, prev, pager, next, jumper"
            :total="count"></el-pagination>
        </div>
      </div>
      <!--设置场所-->
      <el-dialog title="设置场所" :visible.sync="runningSetPlace" :width="dialogWidth" center>
        <div class="block">
          <el-form ref="addPlace" :model="addPlace" :label-position="labelPosition" :label-width="labelWidth">
            <el-form-item label="设备ID" prop="deviceId">
              <el-input v-model="addPlace.deviceId" auto-complete="off" readonly></el-input>
            </el-form-item>
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="addPlace.deviceName" auto-complete="off" readonly></el-input>
            </el-form-item>
            <el-form-item label="选择场所" prop="placeId">
              <el-select v-model="addPlace.placeId" placeholder="请选择" style="width: 100%" filterable>
                <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center" v-show="getButtonVial('device:add')">
            <el-button @click="runningSetPlace = false">取消</el-button>
            <el-button type="primary" @click="placeAdd()">确定</el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import axios from "axios";
  import {globalValidExcel, noSValidator, noValidator} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      let idValidator = (rule, value, callback) => {
        if (!/[a-zA-Z0-9_]$/.test(value)) {
          callback(new Error("请输入正确的设备id，由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      let devValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9_\u4e00-\u9fa5]$/.test(value)) {
          callback(new Error("请输入正确的设备名称，由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        props: {value: 'o', label: 'n', children: 'c'},
        lineStatus: '',
        areaList: [],
        provinceList: json,
        dialogWidth: isPC() ? '40%' : '90%',
        labelWidth: isPC() ? '100px' : '80px',
        listLoading: false,
        labelPosition: 'right',
        deviceList: [],
        query: {page: 1, size: 10, deviceForm: '', deviceType: '', deviceName: ''},
        count: 0,
        runningSetPlace: false,
        addPlace: {deviceId: '', deviceName: '', deviceForm: '', deviceType: ''},
        online: [{value: true, label: '在线'}, {value: false, label: '离线'}],
        places: [],
        sels: [],
        deviceForms: [],
        deviceTypes: [],
        groups: [],
        intervalid: null,
      }
    },
    //页面关闭时停止更新设备在线状态
    beforeDestroy() {
      clearInterval(this.intervalid);
    },
    methods: {
      getButtonVial(msg) {
//        return buttonValidator(msg);
        return true;
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
      //跳转到设备设置页面
      gotoSet(device) {
        clearInterval(this.intervalid);
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push({
          path: 'deviceSet',
          query: {deviceId: device.deviceId, deviceForm: device.deviceForm, groupId: device.groupId}
        });
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
      selsChange(sels) {
        this.sels = sels;
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
          this.$message.error('请输入正确的设备名称/ID');
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
            this.$message.error('请输入正确的设备名称/ID');
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
        this.query = {
          page: 1, size: 10, deviceForm: '', deviceType: '', deviceName: '',
          groupId: '1'
        };
        this.lineStatus = '';
        this.areaList = [];
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'groupId') {
          for (let item of this.groups) {
            if (item.groupId === row.groupId) {
              return item.groupName;
            }
          }
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取组织列表
      getOrganizations() {
        this.$post('/manager/group/query', {page: 1, size: 9999, userId: this.userId}).then((data) => {
          this.groups = data.data.content;
        });
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
      sessionStorage.removeItem("deviceTab");
      this.getPlaces();
//      this.getOrganizations();
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
