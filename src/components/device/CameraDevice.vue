<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="24" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.cameraCode" placeholder="相机编码" size="medium" :maxlength=30></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.cameraType" placeholder="相机分类" size="medium" clearable style="width: 110px">
                <el-option v-for="item in cameraTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
              <el-select v-model="query.placeId" placeholder="安装场所" size="medium" filterable clearable
                         :filter-method="pinyinMatch">
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
              <el-select v-model="query.status" placeholder="状态" size="medium" clearable style="width: 100px">
                <el-option v-for="item in cameraStatus" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-table :data="deviceList" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="相机编码" prop="cameraCode" min-width="120"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="相机分类" prop="cameraType" min-width="100"
                         max-width="150" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="安装地区" prop="areaCode" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="详细地址" prop="detailAddress" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="安装场所" prop="placeName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备标识" prop="name" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="相机状态" prop="status" min-width="80" max-width="100">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.status == 0">在线</span>
            <span style="color:#dd6161" v-show="scope.row.status == 1">故障</span>
            <span style="color:#999" v-show="scope.row.status == 2">离线</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="操作" min-width="110" max-width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="runningSetPlace=true;addPlace=scope.row"
                       v-show="getButtonVial('camera:set:place')">设置场所
            </el-button>
            <!--<el-button type="text" @click="gotoDetail(scope.row)">查看设备</el-button>-->
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top:10px;text-align: right" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--设置场所-->
      <el-dialog title="设置场所" :visible.sync="runningSetPlace" :width="dialogWidth" center>
        <div class="block">
          <el-form ref="addPlace" :model="addPlace" :label-position="labelPosition" :label-width="labelWidth">
            <el-form-item label="设备ID" prop="cameraCode">
              <el-input v-model="addPlace.cameraCode" auto-complete="off" readonly></el-input>
            </el-form-item>
            <el-form-item label="设备标识" prop="name">
              <el-input v-model="addPlace.name" auto-complete="off" readonly></el-input>
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
  import {noSValidator} from "../../assets/js/api";
  import {isPC, buttonValidator, getAreaLable} from "../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        dialogWidth: isPC() ? '40%' : '90%',
        labelWidth: isPC() ? '100px' : '80px',
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        labelPosition: 'right',
        runningSetPlace: false,
        activeItem: 'EXECUTION',
        addPlace: {},
        query: {page: 1, size: 10},
        props: {value: 'areaCode', label: 'areaName', children: 'subAreas'},
        cameraTypes: [{value: 0, label: '人脸相机'}, {value: 1, label: '车牌相机'}],
        cameraStatus: [{value: 0, label: '在线'}, {value: 1, label: '故障'}, {value: 2, label: '离线'}],
        provinceList: JSON.parse(localStorage.getItem("areas")),
        areaList: [],
        count: 0,
        listLoading: false,
        deviceList: [], places: [], placesCopy: [],
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //首字母搜索
      pinyinMatch(val) {
        if (val) {
          var result = [];
          this.placesCopy.forEach((item) => {
            var m = PinyinMatch.match(item.placeName, val);
            if (m) {
              result.push(item);
            }
          });
          this.places = result;
        } else {
          this.places = this.placesCopy;
        }
      },
      //设置场所
      placeAdd() {
        let param = {};
        if (!this.addPlace.placeId) {
          this.$message.error('请选择安装场所');
          return;
        }
        param.cameraCode = this.addPlace.cameraCode;
        param.placeName = this.getPlaceName(this.addPlace.placeId);
        param.placeId = this.addPlace.placeId;
        this.$post('/camera/set/place', param, '设置成功').then((data) => {
          this.runningSetPlace = false;
          this.getData();
        })
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
      gotoDetail(task) {
      },
      //获取相机设备列表
      getData() {
        if (this.query.cameraCode) {
          if (noSValidator(this.query.cameraCode)) {
            this.$message.error('请输入正确的相机编码');
            return;
          }
        }
        this.listLoading = true;

        this.$post("camera/query", this.query).then((data) => {
          this.deviceList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.deviceList = [];
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
      //获取场所列表
      getPlaces() {
        if (this.getButtonVial('place:query')) {
          this.$post("place/query", {page: 1, size: 999999}).then((data) => {
            this.places = data.data.list;
            this.placesCopy = Object.assign([], this.places);
          }).catch((err) => {
            this.places = [];
            this.placesCopy = [];
          });
        }
      },
      getPlaceName(id) {
        for (let item of this.places) {
          if (item.id === id) {
            return item.placeName;
          }
        }
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'cameraType') {
          return row.cameraType == 1 ? '车牌相机' : '人脸相机';
        } else if (column.property === 'areaCode') {
          return row.areaCode ? getAreaLable(row.areaCode) : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.getPlaces();
      this.getData();
    }
  }
</script>
<style>

</style>
