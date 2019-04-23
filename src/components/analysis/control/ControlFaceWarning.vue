<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="19" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 920px">
            <el-form-item style="margin-bottom: 10px">
              <el-upload ref="upload" class="upload img" :action="uploadUrl" name="file" drag
                         :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                         :auto-upload="true" :show-file-list="false">
                <div v-if="!query.faceUrl" style="height:34px;vertical-align:middle;text-align: center">
                  <i class="fa fa-photo fa-lg"></i>上传头像
                </div>
                <el-row v-if="query.faceUrl" style="height:34px;padding:0;margin:0">
                  <el-col :span="12">
                    <img :src="query.faceUrl" style="height:34px;margin:0;padding:0">
                  </el-col>
                  <el-col :span="12">
                    <el-button type="text" style="margin-left:5px" @click.stop="clearImg()">清除</el-button>
                  </el-col>
                </el-row>
              </el-upload>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                              start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
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
              <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable>
                <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="年龄段" style="margin-bottom: 10px" v-show="isMore">
              <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                               :max="query.endAge-1" style="width: 100px" size="medium"></el-input-number>
              <span>~</span>
              <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                               :max="200" style="width: 100px" size="medium"></el-input-number>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px">
                <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="5" align="right" style="text-align: right;margin-top:10px"
                v-show="getButtonVial('warning:dealWithWarningById')">
          <el-button type="primary" size="medium" @click=changeStatus(2) :disabled="sels.length == 0">已处理</el-button>
          <el-button size="medium" @click=changeStatus(3) :disabled="sels.length == 0">误报</el-button>
        </el-col>
      </el-row>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left" :selectable="checkboxInit"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场人脸图像" prop="sceneUrl" min-width="150">
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
                         :formatter="formatterAddress">
          <template slot-scope="scope">
            <span style="color:#dd6161" v-show="scope.row.status == 0">待处理</span>
            <span style="color:#00C755" v-show="scope.row.status == 2">已处理</span>
            <span style="color:#999" v-show="scope.row.status == 3">误报</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="采集时间" prop="catchTime" min-width="170"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="管控对象" prop="faceUrl" min-width="150"
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
    </section>
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
  import {formatDate, buttonValidator} from "../../../assets/js/util";
  import {globalValidImg, doubleValid} from "../../../assets/js/api";

  export default {
    data() {
      return {
        places: [],
        isMore: false,
        runBigPic: false,
        bigUrl: '',
        taskId: this.$route.query.taskId || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        imgPath2: require('../../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        img2404: "this.onerror='';this.src='" + require('../../../assets/img/icon_img.svg') + "'",
        query: {size: 100},
        qTime: '',
        statuses: [{label: '待处理', value: 0}, {label: '已处理', value: 2}, {label: '误报', value: 3}],
        count: 0,
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        sels: [],
        listLoading: false,
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        pickerBeginDate: {
          shortcuts: [{
            text: '最近6小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 6);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近12小时',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 12);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              const start = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/'));
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }],
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
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      checkboxInit(row, index) {
        if (row.status !== 0)
          return 0;//不可勾选
        else
          return 1;//可勾选
      },
      changeStatus(status) {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$prompt('确认已处理此告警？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '录入备注（非必填）',
          inputValidator: function (value) {
            let bol = true;
            if (value) {
              bol = (value.length <= 200)
            }
            return bol
          },
          inputErrorMessage: '请输入200字以内的备注'
        }).then(({value}) => {
          let param = {
            ids: arr, status: status, remark: value ? value : '',
            dealWithUser: JSON.parse(sessionStorage.getItem("user")).account
          };
          this.$post('warning/dealWithWarningById', param, "处理成功").then((data) => {
            this.$emit('refreshData', 'warning');
            this.sels = [];
            this.getImgData();
          }).catch((err) => {
            this.$message.error(err);
          });
        }).catch(() => {
        });
      },
      /**
       * 人脸告警
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
      clearImg() {
        delete this.query['faceUrl'];
        delete this.query['similarThreshold'];
        this.isSearch = true;
        this.getImgData()
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
      /**
       * 告警详情
       */
      gotoDetail(task) {
        let routeData = this.$router.resolve({
          path: '/faceWarningDetail',
          query: {id: task.id, faceId: task.faceId, taskId: task.dispositionTaskId}
        });
        window.open(routeData.href, '_blank');
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
    }
  }
</script>
