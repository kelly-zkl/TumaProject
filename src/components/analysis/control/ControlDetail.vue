<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="margin-bottom: 15px">
        <el-row>
          <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 14px;color: #999;margin: 0 20px">布控编号</p>
            <p style="font-size: 15px;margin: 5px 20px 0 20px">{{task.taskNo}}</p>
          </el-col>
          <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 14px;color: #999;margin: 0 20px">布控名称</p>
            <p style="font-size: 15px;margin: 5px 20px 0 20px">{{task.taskName}}</p>
          </el-col>
          <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 14px;color: #999;margin: 0 20px">有效期</p>
            <p style="font-size: 15px;margin: 5px 20px 0 20px">{{task.startStr + "~" + task.endStr}}</p>
          </el-col>
          <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 14px;color: #999;margin: 0 20px">布控状态</p>
            <p style="font-size: 15px;margin: 5px 20px 0 20px">
              {{task.taskStatus == 'EXECUTION' ? '进行中' : task.taskStatus == 'FINISH' ? '已结束' : '异常'}}
            </p>
          </el-col>
          <el-col :span="4" align="right">
            <el-button type="text" @click="runTaskDetail = true">查看任务</el-button>
            <el-button type="text" @click="deleteTask()" v-show="getButtonVial('disposition:delete')">删除任务</el-button>
          </el-col>
        </el-row>
      </div>
      <el-row style="margin-bottom: 15px">
        <el-col :span="16" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="IMSI告警" name="IMSI"></el-tab-pane>
            <el-tab-pane label="图像告警" name="FACE"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'IMSI'">
        <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 1120px">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.imsi" placeholder="IMSI" size="medium" style="width: 160px"
                      :maxlength=30></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.regional" placeholder="IMSI归属地" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-if="places">
            <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <!--<el-form-item style="margin-bottom: 10px">-->
          <!--<el-select v-model="query.value" placeholder="人员名单" size="medium" style="width: 150px">-->
          <!--<el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--</el-form-item>-->
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.status" placeholder="告警状态" size="medium" style="width: 130px">
              <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="text" size="medium" @click="isMore=!isMore">{{isMore?'收起条件':'更多条件'}}</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-show="isMore">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警场所" prop="placeName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警时间" prop="createTime" min-width="170"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警状态" prop="status" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoDetail(scope.row)"
                         v-show="getButtonVial('warning:getImsiWarning')">查看告警
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                         :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
        </div>
      </div>
      <div class="content" v-show="activeItem == 'FACE'">
        <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 1120px">
          <el-form-item style="margin-bottom: 10px">
            <el-upload ref="upload" class="upload img" :action="uploadUrl" name="file"
                       :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                       :auto-upload="true" :show-file-list="false">
              <el-button size="medium" style="width: 100px">
              <span class="el-upload__text">
                <span v-if="!query.faceUrl">
                  <i class="fa fa-photo fa-lg"></i>上传头像
                </span>
                <img :src="query.faceUrl" v-if="query.faceUrl" style="height: 30px">
              </span>
              </el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="年龄段" style="margin-bottom: 10px">
            <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                             :max="query.endAge-1" style="width: 100px" size="medium"></el-input-number>
            <span>~</span>
            <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                             :max="200" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-show="places.length !== 0">
            <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
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
            <el-button type="text" size="medium" @click="isMore=!isMore">{{isMore?'收起条件':'更多条件'}}</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="isSearch = true;getImgData()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearImgData()">重置</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px" v-show="isMore">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                            :picker-options="pickerBeginDate">
            </el-date-picker>
          </el-form-item>
          <!--<el-form-item style="margin-bottom: 10px">-->
          <!--<el-select v-model="query1.value" placeholder="人员名单" size="medium" style="width: 150px">-->
          <!--<el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--</el-form-item>-->
        </el-form>
        <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="现场图像" prop="sceneUrl" min-width="150">
            <template slot-scope="scope">
              <div style="height: 90px;line-height:90px">
                <img v-bind:src="scope.row.sceneUrl?scope.row.sceneUrl:imgPath2"
                     @click="bigUrl=scope.row.sceneUrl;runBigPic=true" :onerror="img2404"
                     style="height:70px;border-radius: 6px;vertical-align: middle"/>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="left" label="年龄段" prop="age" min-width="80" max-width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="60" max-width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警场所" prop="placeName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="deviceName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警时间" prop="createTime" min-width="170"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="告警状态" prop="status" min-width="80" max-width="120"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="catchTime" min-width="170"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="布控人员图像" prop="faceUrl" min-width="150"
                           max-width="250" :formatter="formatterAddress">
            <template slot-scope="scope">
              <div style="height: 90px;line-height:90px">
                <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                     @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                     style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="left" label="操作" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoDetail(scope.row)"
                         v-show="getButtonVial('warning:getFaceWarning')">查看告警
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleImgSizeChange" @current-change="pageImgChange" :current-page.sync="page"
                         :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
        </div>
      </div>
    </section>
    <!--布控详情-->
    <el-dialog title="布控详情" width="750px" :visible.sync="runTaskDetail">
      <div class="block gray-form">
        <el-form label-width="100px" :model="task" label-position="right">
          <el-form-item label="布控编号" align="left" style="margin: 0">{{task.taskNo}}</el-form-item>
          <el-form-item label="布控名称" align="left" style="margin: 0">{{task.taskName}}</el-form-item>
          <el-form-item label="布控人员" align="left" style="margin: 0" v-if="task.featureList || task.imsiList">
            <div class="img-main" v-if="task.featureList">
              <div class="img-item" v-for="item in task.featureList" :key="item.imageId">
                <img :src="item.imageUrl?item.imageUrl:imgPath" style="max-width: 100%;border-radius: 4px"
                     :onerror="img404"/>
              </div>
            </div>
            <el-row v-if="task.imsiList">
              <el-col :span="24">{{task.imsi}}</el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="布控名单" align="left" style="margin: 0" v-if="task.list">
            <el-row v-if="task.list">
              <el-col :span="24">{{task.list}}</el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="布控场所" align="left" style="margin: 0">
            <el-row v-if="task.placeName">
              <el-col :span="24">{{task.place}}</el-col>
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
    <!--查看大图-->
    <el-dialog title="查看大图" :visible.sync="runBigPic" width="500px" center>
      <div class="block">
        <el-row>
          <el-col :span="24" style="text-align: center" align="center">
            <img :src="bigUrl" style="max-width: 400px;max-height:400px;border-radius:8px;vertical-align:middle"/>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer" align="center" style="margin-top: 20px">
          <el-button type="primary" @click="runBigPic=false" size="medium">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";
  import {globalValidImg, doubleValid, noValidator} from "../../../assets/js/api";

  export default {
    data() {
      return {
        task: {},
        places: [],
        isMore: false,
        runBigPic: false,
        bigUrl: '',
        runTaskDetail: false,
        taskId: this.$route.query.taskId || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        imgPath2: require('../../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        img2404: "this.onerror='';this.src='" + require('../../../assets/img/icon_img.svg') + "'",
        activeItem: "IMSI",
        query: {size: 100},
        qTime: '',
        statuses: [{label: '待处理', value: 0}, {label: '已处理', value: 2}, {label: '误报', value: 3}],
        areaList: [],
        count: 0,
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        listLoading: false,
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
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
        this.isMore = false;
        this.list10 = [];
        this.isSearch = true;
        this.qTime = '';
        this.query = {size: 100};
        if (this.activeItem === 'IMSI') {
          this.getData();
        } else {
          this.getImgData();
        }
      },
      getTaskDetail() {
        this.$post('disposition/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.imsi = this.task.imsiList.join("，");
          this.task.place = this.task.placeName.join("，");
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.updateStr = formatDate(new Date(this.task.updateTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.startStr = formatDate(new Date(this.task.startTime * 1000), 'yyyy-MM-dd');
          this.task.endStr = formatDate(new Date(this.task.endTime * 1000), 'yyyy-MM-dd');
          if (this.task.cycleType === 'WEEKLY') {//每周
            this.task.week = this.getWeekStr(this.task.weekCycleDay);
          }
          if (this.task.blackClassList.length > 0) {
            var list = '';
            this.task.blackClassList.forEach((item) => {
              list += item.name + ',';
            });
            this.task.list = list.substring(0, list.length - 1);
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
        return arr.length > 0 ? arr.join("，") : '--';
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
        if (this.activeItem === 'IMSI') {
          // this.$router.push({path: '/imsiWarningDetail', query: {id: task.id, imsi: task.imsi}});
          let routeData = this.$router.resolve({path: '/imsiWarningDetail', query: {id: task.id, imsi: task.imsi}});
          window.open(routeData.href, '_blank');
        } else {
          // this.$router.push({path: '/faceWarningDetail', query: {id: task.id, faceId: task.faceId}});
          let routeData = this.$router.resolve({path: '/faceWarningDetail', query: {id: task.id, faceId: task.faceId}});
          window.open(routeData.href, '_blank');
        }
      },
      //获取IMSI告警列表
      getData() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.query.dispositionTaskId = this.taskId;
        this.$post('warning/get/listImsiWarningByDispositionTaskId', this.query).then((data) => {
          if (this.query.pageTime && !this.isSearch) {
            this.list = this.list.concat(data.data);
          } else {
            this.list = data.data ? data.data : [];
            this.page = 1;
            this.firstPage = 0
          }
          this.list10 = this.list;
          if (this.list.length - this.page * 10 >= 0) {
            this.list10 = this.list10.slice((this.page * 10 - 10), (this.page * 10));
          } else {
            this.list10 = this.list10.slice((this.page * 10 - 10), this.list.length);
          }
          this.count = this.list.length;
          if (this.list.length - this.firstPage === 100) {
            this.isFirst = false;
          } else {
            this.isFirst = true;
          }
          this.listLoading = false;
        }).catch((err) => {
          this.list = [];
          this.list10 = [];
          this.listLoading = false;
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.list10 = [];
        this.isSearch = true;
        this.query = {size: 100};
        this.qTime = '';

        this.getData();
      },
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst && (this.list.length % 100 === 0)) {
          this.firstPage = this.list.length;
          this.query.pageTime = this.list[this.list.length - 1].createTime;
          this.getData();
        }
        this.list10 = this.list;
        if ((this.list.length - (index * 10)) >= 0) {
          this.list10 = this.list10.slice((index * 10 - 10), (index * 10));
        } else {
          this.list10 = this.list10.slice((index * 10 - 10), this.list.length);
        }
      },
      handleSizeChange(val) {
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'status') {
          return row.status === 0 ? '待处理' : row.status === 1 ? '处理中' : row.status === 2 ? '已处理' : row.status === 3 ? '误报' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'catchTime') {
          return row.catchTime ? formatDate(new Date(row.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'age') {
          return row.age <= 0 ? '--' : (row.age - 3) + "~" + (row.age + 3);
        } else if (column.property === 'similarThreshold') {
          return row[column.property] <= 0 ? '--' : row[column.property];
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      /**
       * 图像告警
       */
      //批量导入设备的文件格式验证
      beforeAvatarUpload(file) {
        if (globalValidImg(file, this.$message)) {
        }
        return globalValidImg(file, this.$message);
      },
      //批量导入设备的文件格式验证
      handleSuccess(res, file) {
        if (res.code === '000000') {
          if (res.data) {
            this.query.faceUrl = res.data.fileUrl;
            let param = JSON.parse(sessionStorage.getItem("system")).similarThreshold;
            this.query.similarThreshold = param ? param : 60;
            this.$message({message: '头像上传成功', type: 'success'});
            this.isSearch = true;
            this.getImgData();
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      gotoImgDetail(task) {
        // this.$router.push({path: '/faceWarningDetail', query: {taskId: task.id, followType: task.followType}});
        let routeData = this.$router.resolve({
          path: '/faceWarningDetail',
          query: {taskId: task.id, followType: task.followType}
        });
        window.open(routeData.href, '_blank');
      },
      //获取图像告警列表
      getImgData() {
        if (this.query.faceUrl) {
          if (!this.query.similarThreshold) {
            this.$message.error('请输入相似度');
            return;
          }
        }
        if (this.query.similarThreshold) {
          if (!this.query.faceUrl) {
            this.$message.error('请上传头像');
            return;
          }
        }
        if (this.query.similarThreshold) {
          if (!doubleValid(this.query.similarThreshold)) {
            this.$message.error('相似度为0.1-99的数字');
            return;
          } else {
            if (this.query.similarThreshold < 0.1 || this.query.similarThreshold > 99) {
              this.$message.error('相似度为0.1-99的数字');
              return;
            }
          }
        }
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        }

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.query.dispositionTaskId = this.taskId;
        this.$post('warning/get/listFaceWarningByDispositionTaskId', this.query, undefined, undefined, "login").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (this.query.pageTime && !this.isSearch) {
              this.list = this.list.concat(data.data);
            } else {
              this.list = data.data ? data.data : [];
              this.page = 1;
              this.firstPage = 0
            }
            this.list10 = this.list;
            if (this.list.length - this.page * 10 >= 0) {
              this.list10 = this.list10.slice((this.page * 10 - 10), (this.page * 10));
            } else {
              this.list10 = this.list10.slice((this.page * 10 - 10), this.list.length);
            }
            this.count = this.list.length;
            if (this.list.length - this.firstPage === 100) {
              this.isFirst = false;
            } else {
              this.isFirst = true;
            }
          } else if ("100000" === data.code) {//执行中
            setTimeout(() => {
              this.getData();
            }, 1000);
          } else {
            this.list = [];
            this.list10 = [];
            this.count = 0;
            this.listLoading = false;
            this.$message.error(data.msg);
          }
        });
      },
      //清除查询条件
      clearImgData() {
        this.list10 = [];
        this.isSearch = true;
        this.qTime = '';
        this.query = {size: 100};
        delete this.query['faceUrl'];

        this.getImgData();
      },
      pageImgChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst && (this.list.length % 100 === 0)) {
          this.firstPage = this.list.length;
          this.query.pageTime = this.list[this.list.length - 1].createTime;
          this.getImgData();
        }
        this.list10 = this.list;
        if ((this.list.length - (index * 10)) >= 0) {
          this.list10 = this.list10.slice((index * 10 - 10), (index * 10));
        } else {
          this.list10 = this.list10.slice((index * 10 - 10), this.list.length);
        }
      },
      handleImgSizeChange(val) {
      },
      //场所
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          if (data.data.list && data.data.list.length > 0) {
            this.places = data.data.list;
          }
        }).catch((err) => {
          this.places = [];
        });
      }
    },
    mounted() {
      this.getPlaces();
      this.getTaskDetail();
      this.getData();
    }
  }
</script>
<style scoped>
  .img-main {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .img-item {
    max-width: 100px;
    margin-right: 10px;
    /*margin-bottom: 10px;*/
    position: relative;
  }
</style>
