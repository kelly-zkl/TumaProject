<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="margin-bottom: 15px">
        <el-row>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px">布控编号</p>
            <p style="margin: 5px 20px 0 20px">{{task.taskName}}</p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px">有效期</p>
            <p style="margin: 5px 20px 0 20px">{{task.startStr + "~" + task.endStr}}</p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 13px;color:#CCC;margin: 0 20px">布控状态</p>
            <p style="margin: 5px 20px 0 20px">
              {{task.taskStatus == 'EXECUTION' ? '进行中' : task.taskStatus == 'FINISH' ? '已结束' : '异常'}}
            </p>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="text" @click="runTaskDetail = true">查看任务</el-button>
            <el-button type="text" @click="deleteTask()" v-show="getButtonVial('disposition:delete')">删除任务</el-button>
          </el-col>
        </el-row>
      </div>
      <el-row style="margin-bottom: 15px">
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="IMSI告警" name="IMSI"></el-tab-pane>
            <el-tab-pane label="图像告警" name="FACE"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'IMSI'">
        <el-form :inline="true" :model="query" align="left" style="margin-top: 15px">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.caseName" placeholder="输入IMSI" size="medium" style="width: 160px"
                      :maxlength=30></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.caseType" placeholder="输入归属地" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
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
            <el-select v-model="query.value" placeholder="人员名单" size="medium" style="width: 150px">
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
        <el-table :data="warningList" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="抓取IMSI" prop="taskName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="归属地" prop="followType" width="150"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警场所" prop="followTarget" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="taskStatus" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警时间" prop="caseName" width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警状态" prop="caseName" width="150"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="所属名单" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoDetail(scope.row)">查看告警</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" v-show="activeItem == 'FACE'">
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
              <el-input v-model="query1.age1" type="number" size="medium" style="width: 80px"
                        :maxlength=3></el-input>
              <span>~</span>
              <el-input v-model="query1.age2" type="number" size="medium" style="width: 80px"
                        :maxlength=3></el-input>
            </el-row>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query1.sex" placeholder="性别" size="medium" style="width: 100px">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query1.placeId" placeholder="告警场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="caseTime1" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query1.value" placeholder="人员名单" size="medium" style="width: 150px">
              <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query1.status" placeholder="告警状态" size="medium" style="width: 130px">
              <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="getImgData()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearImgData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="imgList" v-loading="listLoading1" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="现场图像" prop="taskName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="年龄" prop="followType" width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="followTarget" width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警场所" prop="taskStatus" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="taskStatus" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警时间" prop="caseName" width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警状态" prop="caseName" width="150"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="布控人员图像" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="相似度" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="所属名单" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImgDetail(scope.row)">查看告警</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleImgSizeChange" @current-change="pageImgChange" :current-page="query1.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query1.size" :total="count1" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </section>
    <!--布控详情-->
    <el-dialog title="布控详情" :width="dialogWidth" :visible.sync="runTaskDetail">
      <div class="block gray-form">
        <el-form label-width="100px" :model="task" label-position="right" style="margin-right: 20px">
          <el-form-item label="布控编号" align="left" style="margin: 0">{{task.taskName}}</el-form-item>
          <el-form-item label="布控人员" align="left" style="margin: 0">
            <el-row :gutter="10">
              <el-col :span="6" v-for="item in task.featureList" :key="item.imageId">
                <img :src="item.imageUrl" style="width: 100%">
              </el-col>
            </el-row>
            <el-row style="margin-top: 15px" v-show="task.imsiList.length >0">
              <el-col :span="24">
                {{task.imsi}}
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="关联案件" align="left" style="margin: 0">{{task.caseName}}</el-form-item>
          <el-form-item label="创建时间" align="left" style="margin: 0">{{task.timeStr}}</el-form-item>
          <el-form-item label="布控状态" align="left" style="margin: 0">
            {{task.taskStatus == 'EXECUTION' ? '进行中' : task.taskStatus == 'FINISH' ? '已结束' : '异常'}}
          </el-form-item>
          <el-form-item label="结束时间" align="left" style="margin: 0" v-show="task.taskStatus == 'FINISH'">
            {{task.updateStr}}
          </el-form-item>
          <el-form-item label="有效期" align="left" style="margin: 0">{{task.startStr + "~" + task.endStr}}</el-form-item>
          <el-form-item label="重复周期" align="left" style="margin: 0">
            {{task.cycleType == 'EVERYDAY' ? "每天" : task.week}}
          </el-form-item>
          <el-form-item label="每日时段" align="left" style="margin: 0">
            {{task.intervalType == 'ALLDAY' ? '全天' : task.startTimeInterval + "~" + task.endTimeInterval}}
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";
  import {globalValidImg, noSValidator, noValidator} from "../../../assets/js/api";

  export default {
    data() {
      return {
        task: {},
        places: [],
        dialogWidth: isPC() ? '35%' : '90%',
        runTaskDetail: false,
        taskId: this.$route.query.taskId || '',
        activeItem: "IMSI",
        query: {status: '', page: 1, size: 10},
        caseTime: '',
        statuses: [{label: '全部', value: ''}, {label: '待处理', value: '1'}, {label: '处理中', value: '2'},
          {label: '已处理', value: '3'}, {label: '误报', value: '4'}],
        areaList: [],
        count: 0,
        listLoading: false,
        warningList: [],
        query1: {status: '', page: 1, size: 10},
        sexs: [{value: '0', label: '男'}, {value: '2', label: '女'}],
        areaList1: [],
        caseTime1: '',
        count1: 0,
        listLoading1: false,
        imgList: [],
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
      handleType(val) {
      },
      getTaskDetail() {
        this.$post('disposition/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.imsi = this.task.imsiList.join("，");
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.updateStr = formatDate(new Date(this.task.updateTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.startStr = formatDate(new Date(this.task.startTime * 1000), 'yyyy-MM-dd');
          this.task.endStr = formatDate(new Date(this.task.endTime * 1000), 'yyyy-MM-dd');
          if (this.task.cycleType === 'WEEKLY') {//每周
            this.task.week = this.getWeekStr(this.task.weekCycleDay);
          }
        }).catch((err) => {
        });
      },
      //转化重复周期
      getWeekStr(val) {
        let arr = [];
        for (let i = 0; i <= 6; i++) {
          if (val.charAt(i) == 1) {
            switch (i + 1) {
              case 1:
                arr.push("周一");
                break;
              case 2:
                arr.push("周二");
                break;
              case 3:
                arr.push("周三");
                break;
              case 4:
                arr.push("周四");
                break;
              case 5:
                arr.push("周五");
                break;
              case 6:
                arr.push("周六");
                break;
              case 7:
                arr.push("周日");
                break;
            }
          }
        }
        return arr.join("，");
      },
      //删除布控任务
      deleteTask() {
        this.$confirm('确认要删除该布控任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('disposition/delete', [this.taskId], '删除成功').then((data) => {
            if ("000000" === data.code) {
              if ("000000" === data.code)
                this.$router.go(-1);
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      /**
       * imsi告警
       * @param value
       */
      gotoDetail(task) {
        this.$router.push({path: '/imsiWarningDetail', query: {taskId: task.id, followType: task.followType}});
      },
      //获取IMSI告警列表
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
      },
      /**
       * 图像告警
       */
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
      gotoImgDetail(task) {
        this.$router.push({path: '/faceWarningDetail', query: {taskId: task.id, followType: task.followType}});
      },
      //获取IMSI告警列表
      getImgData() {

      },
      //清除查询条件
      clearImgData() {
        this.query1 = {page: 1, size: 10};
        this.caseTime1 = '';
        this.getImgData();
      },
      pageImgChange(index) {
        this.query1.page = index;
        this.getImgData();
      },
      handleImgSizeChange(val) {
        this.query1.size = val;
        this.getImgData();
      },
      //场所
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
      this.getTaskDetail();
    }
  }
</script>
