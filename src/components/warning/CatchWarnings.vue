<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="今日告警" name="T"></el-tab-pane>
            <el-tab-pane label="历史告警" name="H"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 15px">
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial(exportKey)">
          <el-input v-model="query.similarThreshold" placeholder="输入相似度阈值" size="medium" style="width: 260px">
            <el-upload ref="upload" class="upload" slot="prepend" :action="uploadUrl" name="file"
                       :on-success="handleSuccess" :on-change="handleChange" size="medium"
                       :auto-upload="false" :show-file-list="false">
              <el-button type="primary" size="medium">上传头像图片</el-button>
            </el-upload>
          </el-input>
        </el-form-item>
        <el-form-item label="年龄" style="margin-bottom: 10px">
          <el-row>
            <el-input v-model="query.startAge" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
            <span>~</span>
            <el-input v-model="query.endAge" type="number" size="medium" style="width: 80px" :maxlength=3></el-input>
          </el-row>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px">
            <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-date-picker v-model="caseTime" type="datetimerange" range-separator="至"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.blackClassId" placeholder="人员名单" size="medium" style="width: 150px">
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-select v-model="query.status" placeholder="告警状态" size="medium" style="width: 130px">
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="imgList" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场图像" prop="sceneUrl" min-width="150"
                         max-width="250" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.sceneUrl?faceUrl+scope.row.sceneUrl:imgPath" style="width: 90px;height:90px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄" prop="age" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警场所" prop="placeName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警时间" prop="createTime" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警状态" prop="status" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="布控人员图像" prop="faceUrl" min-width="150"
                         max-width="250" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.faceUrl?faceUrl+scope.row.faceUrl:imgPath" style="width: 90px;height:90px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="相似度" prop="similarThreshold" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="所属名单" prop="blackClass" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('warning:getFaceWarning')">查看告警
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";
  import {globalValidImg, noSValidator, noValidator} from "../../assets/js/api";

  export default {
    data() {
      return {
        activeItem: 'T',
        imgPath: require('../../assets/img/icon_people.png'),
        query: {page: 1, size: 10},
        caseTime: '',
        statuses: [{label: '待处理', value: 0}, {label: '处理中', value: 1},
          {label: '已处理', value: 2}, {label: '误报', value: 3}],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        count: 0,
        listLoading: false,
        exportKey: 'warning:get:listFaceToday',
        imgList: [],
        places: [],
        uploadUrl: '',
        imgUrl: '',
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
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val, ev) {
        this.clearData();
        this.exportKey = 'warning:get:listFaceToday';
        if (this.activeItem === 'H') {
          this.exportKey = 'warning:get:listFaceHistory';
        }
      },
      //批量导入设备的文件格式验证
      handleChange(file, fileList) {
        if (file.status == 'ready') {
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
      gotoDetail(row) {
        this.$router.push({path: '/faceWarningDetail', query: {id: row.id}});
      },
      //获取图像告警列表
      getData() {
        let url = 'warning/get/listFaceToday';
        if (this.activeItem === 'H') {
          url = 'warning/get/listFaceHistory';
        }
        if (!!this.caseTime) {
          this.query.startTime = this.caseTime[1];
          this.query.endTime = this.caseTime[0];
        }

        this.listLoading = true;
        this.$post(url, this.query).then((data) => {
          this.imgList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.imgList = [];
          this.$message.error(err);
        });
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
        if (column.property === 'status') {
          return row.status === 0 ? '待处理' : row.taskStatus === 1 ? '处理中' : row.taskStatus === 2 ? '已处理' : row.taskStatus === 3 ? '误报' : '--';
        } else if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //告警场所
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
      this.imgList = [{}, {}];
    }
  }
</script>
<style>

</style>
