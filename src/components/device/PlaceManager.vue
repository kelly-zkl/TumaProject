<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('place:query')">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.placeName" placeholder="场所编码/名称" size="medium" :maxlength=30></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.placeType" placeholder="场所类型" size="medium">
                <el-option v-for="item in serviceTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                           v-model="areaList" placeholder="全部地区" size="medium" filterable clearable>
              </el-cascader>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right">
          <el-button type="primary" size="medium" @click="deletePlace()" :disabled="sels.length==0"
                     v-show="getButtonVial('place:delete')">删除
          </el-button>
          <el-button type="primary" size="medium" @click="addInfo()"
                     v-show="getButtonVial('place:add')">添加场所
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="placeList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="场所编码" prop="placeCode" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="场所名称" prop="placeName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="场所类型" prop="placeType" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="所属组织" prop="groupName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="地区" prop="areaCode" min-width="180"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="详细地址" prop="detailAddress" min-width="180"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="经纬度" prop="latitude" min-width="180"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="sels = [];sels.push(scope.row);deletePlace()"
                       v-show="getButtonVial('place:delete')">删除
            </el-button>
            <el-button type="text" @click="updateInfo(scope.row)" v-show="getButtonVial('place:update')">修改
            </el-button>
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('place:get')">查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--添加场所-->
      <el-dialog :title="addTitle" :visible.sync="runAddPlace" width="600px" center>
        <div class="block">
          <el-form ref="addPlace" :rules="rules" :model="addPlace" label-position="right" label-width="80px">
            <el-form-item label="场所编码" required>
              <el-row>
                <el-col :span="10" style="margin-right: 10px">
                  <el-input v-model="placeCode" readonly></el-input>
                </el-col>
                <el-col :span="10">
                  <el-tooltip placement="bottom">
                    <div slot="content">4位场所编码</div>
                    <el-input v-model="numberCode" :maxlength=4></el-input>
                  </el-tooltip>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item label="场所名称" prop="placeName">
              <el-input v-model="addPlace.placeName" auto-complete="off" :maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="场所类型" prop="placeType">
              <el-select v-model="addPlace.placeType" placeholder="请选择" style="width: 100%" filterable
                         @change="typeChange">
                <el-option v-for="item in serviceTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所属组织" align="left" prop="groupId">
              <el-select v-model="addPlace.groupId" placeholder="请选择组织" filterable style="width: 100%">
                <el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"
                           :value="item.groupId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所属地区" required>
              <el-cascader :options="provinceList" :props="props" change-on-select filterable @change="placeChange"
                           v-model="selectedOptions2" placeholder="省市县区" clearable style="width: 100%">
              </el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="detailAddress">
              <el-input v-model="addPlace.detailAddress" auto-complete="off" :maxlength="30"></el-input>
            </el-form-item>
            <el-form-item label="经纬度" required>
              <el-row :gutter="15" style="text-align: left">
                <el-col :span="9">
                  <el-input v-model="addPlace.longitude" readonly>
                    <template slot="prepend">经度</template>
                  </el-input>
                </el-col>
                <el-col :span="9">
                  <el-input v-model="addPlace.latitude" readonly>
                    <template slot="prepend">纬度</template>
                  </el-input>
                </el-col>
                <el-col :span="3">
                  <el-button type="primary" @click="selectAdd()">地图选址</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button @click="cancelSubmit()">取消</el-button>
            <el-button type="primary" @click="placeAdd(addTitle)">确定</el-button>
          </div>
        </div>
      </el-dialog>
      <!--选择安装地址--》地图-->
      <el-dialog title="" :visible.sync="mapVisible">
        <MapView @getLocation="getLocation" v-bind:formattedAddress="getAddress"></MapView>
        <div class="block" style="margin-top: 20px">
          <el-button @click="mapVisible = false">取消</el-button>
          <el-button type="primary" @click="setLocation">确定</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";
  import MapView from './deviceSet/BMap';
  import {numValid} from "../../assets/js/api";

  export default {
    data() {
      let idValidator = (rule, value, callback) => {
        if (!/[a-zA-Z0-9_]$/.test(value)) {
          callback(new Error("请输入正确的场所编码，由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      let devValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9_\u4e00-\u9fa5]$/.test(value)) {
          callback(new Error("请输入正确的场所名称，由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        addTitle: '新建场所',
        query: {page: 1, size: 10},
        provinceList: json,
        props: {value: 'o', label: 'n', children: 'c'},
        serviceTypes: [{value: '0', label: '网吧'}, {value: '1', label: '旅店宾馆类（住宿服务场所）'},
          {value: '2', label: '图书馆阅览室'}, {value: '3', label: '电脑培训中心类'}, {value: '4', label: '娱乐场所类'},
          {value: '5', label: '交通枢纽'}, {value: '6', label: '公共交通工具'}, {value: '7', label: '餐饮服务场所'},
          {value: '8', label: '金融服务场所'}, {value: 'A', label: '购物场所'}, {value: 'B', label: '公共服务场所'},
          {value: 'C', label: '文化服务场所'}, {value: 'D', label: '公共休闲场所'}, {value: '9', label: '其他'}],
        areaList: [],
        organizations: [],
        count: 0,
        listLoading: false,
        placeList: [],
        sels: [],
        runAddPlace: false,
        typeName: '',
        mapVisible: false,
        addPlace: {},
        position: {},
        getAddress: '',
        selectedOptions2: [],
        code: '',
        placeCode: '',
        numberCode: '',
        listLoading1: false,
        rules: {
          placeName: [
            {required: true, message: '请输入场所名称', trigger: 'blur', maxlength: 20},
            {validator: devValidator, trigger: "change,blur"}
          ],
          placeCode: [
            {required: true, message: '请输入场所编码', trigger: 'blur', maxlength: 30},
            {validator: idValidator, trigger: "change,blur"}
          ],
          groupId: [
            {required: true, message: '请选择所属组织', trigger: 'blur'}
          ],
          placeType: [
            {required: true, message: '请选择场所类型', trigger: 'blur'}
          ],
          detailAddress: [
            {required: true, message: '请输入详细地址', trigger: 'blur'}
          ]
        },
        runningPlaceType: false,
        placeTypeAdd: '',
        placeTypes: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      gotoDetail(row) {
        sessionStorage.setItem("qTime", JSON.stringify(this.areaList));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        // let routeData = this.$router.resolve({path: '/placeDetail', query: {id: row.id}});
        // window.open(routeData.href, '_blank');
        this.$router.push({path: '/placeDetail', query: {id: row.id}});
      },
      //场所类型
      showPlaceType() {
        this.placeTypeAdd = '';
        this.runningPlaceType = true;
        this.getPlaceType();
      },
      getPlaceType() {
        this.placeTypes = [];
        this.$post('/get/placeType', {}).then((data) => {
          if ("000000" === data.code) {
            if (data.data.value && data.data.value.length > 0) {
              this.placeTypes = data.data.value;
            }
          }
        }).catch((err) => {
          this.placeTypes = [];
        });
      },
      addPlaceType() {
        if (this.placeTypeAdd.length == 0) {
          this.$message.error('请输入场所类型');
          return;
        }
        this.$post('/add/placeType', {label: this.placeTypeAdd, value: '0'}, '添加成功').then((data) => {
          if ("000000" === data.code) {
            this.getPlaceType();
          }
        }).catch((err) => {
        });
      },
      deletePlaceType(row) {
        this.$confirm('确认删除该场所类型?', '提示', {type: 'info'}).then(() => {
          this.$post('/remove/placeType', {label: row.label, value: row.value}, '操作成功').then((data) => {
            if ("000000" === data.code) {
              this.getPlaceType();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //删除场所
      deletePlace() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该场所吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/place/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      addInfo() {
        this.addPlace = {};
        this.placeCode = '';
        this.numberCode = '';
        this.selectedOptions2 = [];
        this.code = '';
        this.runAddPlace = true;
        this.addTitle = '新建场所';
      },
      updateInfo(row) {
        this.addPlace = Object.assign({}, row);
        this.placeCode = row.placeCode.substring(0, 10);
        this.numberCode = row.placeCode.substring(row.placeCode.length - 4, row.placeCode.length);
        this.selectedOptions2 = this.getCode(row.areaCode);
        this.code = row.areaCode;
        this.runAddPlace = true;
        this.addTitle = '修改场所';
      },
      cancelSubmit() {
        this.runAddPlace = false;
        this.placeCode = '';
        this.numberCode = '';
        this.selectedOptions2 = [];
        this.code = '';
      },
      //添加场所
      placeAdd() {
        if (this.selectedOptions2.length === 0) {
          this.$message.error('请选择安装地址省市区');
          return;
        }
        if (this.numberCode.length !== 4 || !numValid(this.numberCode)) {
          this.$message.error('场所编码需手动输入4位数字');
          return;
        }

        this.getScode(this.selectedOptions2);
        this.addPlace.placeCode = this.placeCode + this.numberCode;
        let url = 'place/add';
        let msg = '添加成功';
        if (this.addTitle === '修改场所') {
          url = 'place/update';
          msg = '修改成功';
        }
        this.$refs['addPlace'].validate((valid) => {
          if (valid) {
            this.addPlace.groupName = this.getGroupName(this.addPlace.groupId);
            this.$post(url, this.addPlace, msg).then((data) => {
              this.runAddPlace = false;
              this.addPlace = {};
              this.placeCode = '';
              this.numberCode = '';
              this.selectedOptions2 = [];
              this.code = '';
              this.getData();
            })
          }
        });
      },
      //省市区
      getScode(value) {
        if (value.length === 1) {
          this.addPlace.provinceCode = value[0];
        } else if (value.length === 2) {
          this.addPlace.provinceCode = value[0];
          this.addPlace.cityCode = value[1];
        } else if (value.length === 3) {
          this.addPlace.provinceCode = value[0];
          this.addPlace.cityCode = value[1];
          this.addPlace.areaCode = value[2];
        }
      },
      //场所省市县变化
      placeChange(value) {
        this.selectedOptions2 = value;
        if (value.length === 1) {
          this.code = value[0];
        } else if (value.length === 2) {
          this.code = value[1];
        } else if (value.length === 3) {
          this.code = value[2];
        }
        if (this.addPlace.placeType) {
          this.placeCode = this.code + '8' + this.addPlace.placeType + '01';
        } else {
          this.placeCode = this.code + '801';
        }
      },
      //场所类型的选择
      typeChange(value) {
        //value为场所类型
        this.addPlace.placeType = value;
        if (value) {
          this.placeCode = this.code + '8' + this.addPlace.placeType + '01';
        } else {
          this.placeCode = this.code + '801';
        }
      },
      //地图选址，显示dialog
      selectAdd() {
        let param = {
          codes: this.selectedOptions2, address: this.addPlace.detailAddress ? this.addPlace.detailAddress : ''
        };
        console.log(param);
        this.getAddress = JSON.stringify(param);
        console.log(this.getAddress);
        this.mapVisible = true;
      },
      //地图选址完成设置经纬度
      setLocation() {
        this.addPlace.longitude = this.position.lng;
        this.addPlace.latitude = this.position.lat;
        this.addPlace.detailAddress = this.position.detailAddress;
        this.selectedOptions2 = this.getCode(this.position.code);
        this.mapVisible = false;
      },
      //获得地图选择的经纬度
      getLocation(pos) {
        this.position = pos;
//        console.log(pos);
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
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
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
          this.query.areaCode = value[2];
        }
      },
      //获取场所列表
      getData() {
        this.listLoading = true;

        this.$post("place/query", this.query).then((data) => {
          this.placeList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.placeList = [];
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.areaList = [];
        this.getData();
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'latitude') {
          return row.latitude && row.longitude ? row.latitude + ',' + row.longitude : '--';
        } else if (column.property === 'placeType') {
          for (let item of this.serviceTypes) {
            if (item.value === row.placeType) {
              return item.label;
            }
          }
        } else if (column.property === 'areaCode') {
          return row.areaCode ? this.getAreaLable(row.areaCode) : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //根据区域码找到对应的省市县编码
      getCode(code) {
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
      //获取组织列表
      getOrganizations() {
        this.$post('/manager/group/query', {
          page: 1, size: 9999, userId: JSON.parse(sessionStorage.getItem("user")).userId
        }).then((data) => {
          this.organizations = data.data.content;
        });
      },
      getGroupName(val) {
        for (let item of this.organizations) {
          if (item.groupId === val) {
            return item.groupName;
          }
        }
      }
    },
    mounted() {
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let time1 = JSON.parse(sessionStorage.getItem("qTime"));
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      if (time1) {
        this.areaList = time1;
      }
      this.getOrganizations();
      this.getData();
    },
    components: {
      MapView
    }
  }
</script>
<style>

</style>
