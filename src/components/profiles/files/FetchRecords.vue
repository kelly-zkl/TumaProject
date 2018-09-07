<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="IMSI" name="imsi"></el-tab-pane>
            <el-tab-pane label="图像" name="face"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="6" align="right">
          <el-button type="primary" size="medium">导出数据</el-button>
        </el-col>
      </el-row>
      <div v-show="activeItem=='imsi'">
        <el-form :inline="true" :model="queryImsi" align="left" style="margin-top: 15px">
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" style="width: 180px" placeholder="场所" size="medium"
                         filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate" style="width: 360px">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input placeholder="设备名称/ID" v-model="queryImsi.deviceName" :maxlength="30"
                      style="width: 180px" size="medium"></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="getData1()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData1()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="imsiList" class="center-block" v-loading="listLoading1" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="deviceId" label="抓取时间" min-width="170" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="imei" label="抓取场所" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="imsi" label="设备标识" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="tmsi" label="设备ID" min-width="150" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoDetail1(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange1" @current-change="pageChange1" :current-page="queryImsi.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="queryImsi.size" :total="count1" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div v-show="activeItem=='face'">
        <el-form :inline="true" :model="query" align="left" style="margin-top: 15px">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="imgUrl" placeholder="输入相似度阈值" size="medium" style="width: 260px">
              <el-upload ref="upload" class="upload" slot="prepend" :action="uploadUrl" name="file"
                         :on-success="handleSuccess" :on-change="handleChange" size="medium"
                         :auto-upload="false" :show-file-list="false">
                <el-button type="primary" size="medium">上传头像图片</el-button>
              </el-upload>
            </el-input>
          </el-form-item>
          <el-form-item label="年龄" style="margin-bottom: 10px">
            <el-row>
              <el-input v-model="query.age1" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
              <span>~</span>
              <el-input v-model="query.age2" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
            </el-row>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                         v-model="areaList" style="width: 180px" placeholder="场所" size="medium"
                         filterable clearable>
            </el-cascader>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate" style="width: 360px">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input placeholder="设备名称/ID" v-model="query.deviceName" :maxlength="30"
                      style="width: 180px" size="medium"></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="imgRecords" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="现场图像" prop="taskName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="年龄" prop="followType" width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="followTarget" width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取场所" prop="taskStatus" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="caseName" width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="caseName" width="150"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import json from '../../../assets/city.json';
  import {globalValidImg, noSValidator, noValidator} from "../../../assets/js/api";

  export default {
    data() {
      return {
        activeItem: 'imsi',
        queryImsi: {page: 1, size: 10},
        query: {status: '', page: 1, size: 10},
        provinceList: json,
        props: {value: 'o', label: 'n', children: 'c'},
        caseTime: '',
        statuses: [{label: '全部', value: ''}, {label: '待处理', value: '1'}, {label: '处理中', value: '2'},
          {label: '已处理', value: '3'}, {label: '误报', value: '4'}],
        sexs: [{value: '0', label: '男'}, {value: '2', label: '女'}],
        areaList: [],
        count: 0,
        listLoading: false,
        imgRecords: [],
        uploadUrl: '',
        imgUrl: '',
        imsiList: [],
        count1: 0,
        listLoading1: false,
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
      handleType(val) {

      },
      /**imsi*/
      //获取imsi列表
      getData1() {

      },
      //清除查询条件
      clearData1() {
        this.queryImsi = {page: 1, size: 10};
        this.caseTime = '';
        this.getData();
      },
      pageChange1(index) {
        this.queryImsi.page = index;
        this.getData();
      },
      handleSizeChange1(val) {
        this.queryImsi.size = val;
        this.getData();
      },
      //查看图像详情
      gotoDetail1() {
        this.$router.push({path: '/imsiDetail'});
      },
      /**图像*/
      //查看图像详情
      gotoDetail() {
        this.$router.push({path: '/faceDetail'});
      },
      //批量导入设备的文件格式验证
      handleChange(file, fileList) {
        if (file.status === 'ready') {
          if (globalValidImg(file.raw, this.$message)) {
          }
        }
      },
      handleSuccess(res, file) {
        if (res.code === '000000') {
          if (res.data && res.data.length > 0) {

          } else {
            this.$message({type: 'success', message: res.msg});
            this.getData();
          }
        } else {
          this.$message.error(res.msg);
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
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
          this.query.areaCode = value[2];
        } else if (value.length === 3) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
          this.query.areaCode = value[2];
          this.query.streetCode = value[3];
        }
      },
      //获取图像告警列表
      getData() {

      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.caseTime = '';
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
        if (column.property === 'taskStatus') {
          return row.taskStatus === "WAIT" ? '等待中' : row.taskStatus === "FINISH" ? '已完成' : row.taskStatus === "FAILE" ? '失败' : row.taskStatus === "EXECUTION" ? '进行中' : '--';
        } else if (column.property === 'followType') {
          return row.followType === "IMSI" ? 'IMSI' : row.followType === "FACE" ? '图像' : row.followType === "MAC" ? 'MAC' : '--';
        } else if (column.property === 'status') {
          return row.status === 'UNHANDLED' ? '未处理' : row.status === 'EXECUTION' ? '进行中' : row.status === 'HANDLED' ? '已结案' : '--';
        } else if (column.property === 'followCount') {
          return row.followCount === 0 ? 0 : row.followCount;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
    }
  }
</script>
<style scoped></style>
