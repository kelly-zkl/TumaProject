<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="今日告警" name="T"></el-tab-pane>
            <el-tab-pane label="所有告警" name="H"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right" style="text-align: right" v-show="getButtonVial('warning:dealWithWarningById')">
          <el-button type="primary" size="medium" @click=changeStatus(2) :disabled="sels.length == 0">已处理</el-button>
          <el-button size="medium" @click=changeStatus(3) :disabled="sels.length == 0">误报</el-button>
        </el-col>
      </el-row>
      <div class="s-tip" v-show="showTip && getButtonVial('disposition:query')">
        <i class="el-icon-info" style="color: #1890FF;font-size: 15px;margin-right: 5px"></i>
        <span style="color: #343434">当前没有进行中的预警模型。
          <el-button type="text" style="margin: 0;padding: 0" @click="$router.push('/addControl')"
                     v-show="getButtonVial('disposition:add')">添加预警模型</el-button>
        </span>
        <el-button type="text" style="margin: 0;padding: 0;position: absolute;right: 10px"
                   icon="el-icon-close" @click="showTip=false;calcuHeight()"></el-button>
      </div>
      <el-form :inline="true" :model="query" align="left" style="margin-top: 10px;text-align: left;width: 1300px">
        <el-form-item style="margin-bottom: 10px;margin-right: 0" v-show="getButtonVial(exportKey)">
          <el-upload ref="upload" class="upload img" :action="uploadUrl" name="file" drag
                     :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                     :auto-upload="true" :show-file-list="false">
            <div v-if="!query.faceUrl"
                 style="height:34px;vertical-align:middle;text-align: center;font-size: 12px;line-height: 34px">
              <i class="fa fa-photo fa-lg" style="margin-right: 4px;font-size: 18px"></i>上传头像
            </div>
            <el-row v-if="query.faceUrl" style="height:34px;padding:0;margin:0">
              <el-col :span="12">
                <img :src="query.faceUrl" style="height:34px;margin:0;padding:0">
              </el-col>
              <el-col :span="12">
                <el-button type="text" style="height:34px;margin-left:5px" size="small" @click.stop="clearImg()">清除
                </el-button>
              </el-col>
            </el-row>
          </el-upload>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px;margin-left: -5px" class="upload">
          <el-tooltip class="item" effect="dark" content="相似度" placement="bottom">
            <el-input-number v-model="query.similarThreshold" controls-position="right" :min="50" placeholder="相似度"
                             :max="100" size="medium" style="width:86px" :precision="0"></el-input-number>
          </el-tooltip>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='H'">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" @change="handleChange"
                          start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                          :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                          :picker-options="pickerBeginDate">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='T'">
          <el-tooltip class="item" effect="dark" content="开始时间" placement="bottom">
            <el-time-picker v-model="time1[0]" style="width:120px" value-format="HH:mm:ss"
                            placeholder="开始时间" @change="handleTime($event,0)" size="medium">
            </el-time-picker>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="结束时间" placement="bottom">
            <el-time-picker v-model="time1[1]" style="width:120px" value-format="HH:mm:ss"
                            placeholder="结束时间" @change="handleTime($event,1)" size="medium">
            </el-time-picker>
          </el-tooltip>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
          <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable
                     style="width: 160px" :filter-method="pinyinMatch" @focus="pinyinChange">
            <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='T'&&getButtonVial('disposition:query')">
          <el-select v-model="query.dispositionTaskId" placeholder="预警模型" size="medium" style="width: 150px" clearable>
            <el-option v-for="item in controlList" :key="item.id" :label="item.taskName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" label="告警比对相似度">
          <el-tooltip class="item" effect="dark" content="告警比对相似度" placement="bottom">
            <el-input-number v-model="query.similar" controls-position="right" :min="50" placeholder="相似度"
                             :max="100" size="medium" style="width:100px" :precision="0"></el-input-number>
          </el-tooltip>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索
          </el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px">
          <el-button size="medium" @click="clearData()">重置</el-button>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="activeItem=='H'&&isMore&&getButtonVial('disposition:query')">
          <el-select v-model="query.dispositionTaskId" placeholder="预警模型" size="medium" style="width: 150px" clearable>
            <el-option v-for="item in controlList" :key="item.id" :label="item.taskName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="isMore">
          <el-select v-model="query.status" placeholder="告警状态" size="medium" style="width: 130px" clearable>
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
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
          <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px" clearable>
            <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe
                @selection-change="selsChange" :height="tableHeight">
        <el-table-column type="selection" width="45" align="left" :selectable="checkboxInit"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场人脸图像" prop="sceneUrl" min-width="120" max-width="180">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.sceneUrl?scope.row.sceneUrl:imgPath2"
                   @click="bigUrl=scope.row.sceneUrl;runBigPic=true" :onerror="img2404"
                   style="max-height:70px;border-radius: 4px;vertical-align:middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="管控对象" prop="faceUrl" min-width="120"
                         max-width="180" :formatter="formatterAddress">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                   @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                   style="max-width: 90px;max-height:90px;border-radius:6px;vertical-align:middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="比对相似度" prop="similarThreshold" min-width="90"
                         max-width="120" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="年龄段" prop="age" min-width="60" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="60" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警场所" prop="placeName" min-width="140"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警时间" prop="createTime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="告警状态" prop="status" min-width="80" max-width="120"
                         :formatter="formatterAddress">
          <template slot-scope="scope">
            <span style="color:#dd6161" v-show="scope.row.status == 0">待处理</span>
            <span style="color:#00C755" v-show="scope.row.status == 2">已处理</span>
            <span style="color:#999" v-show="scope.row.status == 3">误报</span>
          </template>
        </el-table-column>
        <!--<el-table-column align="left" label="采集时间" prop="catchTime" min-width="170"-->
        <!--max-width="200" :formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" label="预警模型名称" prop="taskName" min-width="140"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="关联案件" prop="caseName" min-width="140"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="110" max-width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)"
                       v-show="getButtonVial('warning:getFaceWarning')">查看告警
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
      </div>
      <!--查看大图-->
      <el-dialog title="查看大图" :visible.sync="runBigPic" width="500px" center>
        <div class="block">
          <el-row>
            <el-col :span="24" style="text-align: center" align="center">
              <img :src="bigUrl" style="max-width: 400px;max-height:400px;border-radius:6px;vertical-align:middle"/>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer" align="center" style="margin-top: 20px">
            <el-button type="primary" @click="runBigPic=false" size="medium">关闭</el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {formatDate, encryData, decryData, buttonValidator} from "../../assets/js/util";
  import {globalValidImg, doubleValid, noValidator} from "../../assets/js/api";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        runBigPic: false, isMore: false, bigUrl: '', activeItem: 'T',
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 280,
        imgPath: require('../../assets/img/icon_people.png'),
        imgPath2: require('../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        img2404: "this.onerror='';this.src='" + require('../../assets/img/icon_img.svg') + "'",
        query: {size: 100},
        statuses: [{label: '待处理', value: 0}, {label: '已处理', value: 2}, {label: '误报', value: 3}],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        count: 0, list: [], list10: [], isShow: false, isFirst: true, isSearch: false,
        firstPage: 0, page: 1, listLoading: false, exportKey: 'warning:get:listFaceToday',
        places: [], placesCopy: [], cases: [], controlList: [],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        imgUrl: '', showTip: false, sels: [], time1: ['00:00:00', '23:59:59'],
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
      pinyinChange() {
        this.places = this.placesCopy;
      },
      //首字母搜索
      pinyinMatch(val) {
        if (val) {
          let result = [];
          this.placesCopy.forEach((item) => {
            let m = PinyinMatch.match(item.placeName, val);
            if (m) {
              result.push(item);
            }
          });
          this.places = result;
        } else {
          this.places = this.placesCopy;
        }
      },
      clearImg() {
        delete this.query['faceUrl'];
        this.isSearch = true;
        this.getData()
      },
      showMore() {
        this.isMore = !this.isMore;
        this.calcuHeight();
      },
      calcuHeight() {
        if (this.isMore) {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 330;
          if (this.showTip) {
            this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 380
          }
        } else {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 280;
          if (this.showTip) {
            this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 330
          }
        }
      },
      //是否有进行中的预警模型
      getTask() {
        if (this.getButtonVial('disposition:query')) {
          this.$post('disposition/query', {page: 1, size: 10, taskStatus: "EXECUTION"}).then((data) => {
            this.showTip = data.data.list.length == 0;
            this.calcuHeight();
          }).catch((err) => {
            this.showTip = false;
          });
        }
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
            dealWithUser: JSON.parse(decryData(sessionStorage.getItem("user"))).account
          };
          this.$post('warning/dealWithWarningById', param, "处理成功").then((data) => {
            this.$emit('refreshData', 'warning');
            this.sels = [];
            this.getData();
          }).catch((err) => {
            this.$message.error(err);
          });
        }).catch(() => {
        });
      },
      handleChange(val) {
        if (!val || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 60 * 60 * 24 * 7 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
        this.getData();
      },
      handleTime(val, idx) {
        this.time1[idx] = val;
        if (!val || val.length == 0) {
          this.time1 = ['00:00:00', '23:59:59'];
        }
        this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[0]).replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[1]).replace(/-/g, '/')).getTime()];
        this.getData();
      },
      handleType(val, ev) {
        this.isMore = false;
        this.clearData();
        this.getTask();

        if (this.activeItem === 'H') {
          this.exportKey = 'warning:get:listFaceHistory';
        } else {
          this.exportKey = 'warning:get:listFaceToday';
        }
      },
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
            this.$message({message: '头像上传成功', type: 'success'});
            this.isSearch = true;
            this.getData();
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      gotoDetail(row) {
        let routeData = this.$router.resolve({
          path: '/faceWarningDetail',
          query: {id: row.id, faceId: row.faceId, taskId: row.dispositionTaskId}
        });
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/faceWarningDetail', query: {id: row.id, faceId: row.faceId}});
      },
      //获取人脸告警列表
      getData() {
        let url = 'warning/get/listFaceToday';
        if (this.activeItem === 'H') {
          url = 'warning/get/listFaceHistory';
        }
        if (this.query.faceUrl) {
          if (!this.query.similarThreshold) {
            this.$message.error('请输入相似度');
            return;
          }
        }
        if (this.qTime) {
          if (this.qTime.length < 2) {
            this.$message.error('请选择日期时间段');
            return;
          }
          if (this.qTime[0] >= this.qTime[1]) {
            this.$message.error('结束时间要大于开始时间');
            return;
          }
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
        this.$post(url, this.query, undefined, undefined, "multi").then((data) => {
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
      clearData() {
        this.list10 = [];
        this.query = {size: 100};
        this.isSearch = true;
        delete this.query['faceUrl'];
        let param = JSON.parse(decryData(sessionStorage.getItem("system"))).similarThreshold;

        if (this.activeItem === 'H') {
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 60 * 60 * 24 * 7 * 1000,
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        } else {
          this.time1 = ['00:00:00', '23:59:59'];
          this.qTime = [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[0]).replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + this.time1[1]).replace(/-/g, '/')).getTime()];
        }

        this.$nextTick(() => {
          this.query.similarThreshold = param ? parseInt(param) : 65;
          this.query.similar = param ? parseInt(param) : 65;
          this.getData();
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row.status === 0 ? '待处理' : row.status === 1 ? '处理中' : row.status === 2 ? '已处理' : row.status === 3 ? '误报' : '--';
        } else if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'age') {
          return row.age <= 0 ? '--' : (row.age - 3) + "~" + (row.age + 3);
        } else if (column.property === 'similarThreshold') {
          return row[column.property] < 0 ? '--' : row[column.property].toFixed(1) + '%';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'catchTime') {
          return row.catchTime ? formatDate(new Date(row.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //告警场所
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
      //预警模型
      getControl() {
        if (this.getButtonVial('disposition:query')) {
          this.$post('disposition/query', {size: 999999, page: 1}).then((data) => {
            this.controlList = data.data.list;
          }).catch((err) => {
            this.controlList = [];
          });
        }
      },
      //关联案件
      getCases() {
        if (this.getButtonVial('case:query')) {
          this.$post('case/query', {page: 1, size: 999999}).then((data) => {
            this.cases = data.data.list;
          }).catch((err) => {
            this.cases = [];
          });
        }
      }
    },
    mounted() {
      let param = JSON.parse(decryData(sessionStorage.getItem("system"))).similarThreshold;
      this.$nextTick(() => {
        this.query.similarThreshold = param ? parseInt(param) : 65;
        this.query.similar = param ? parseInt(param) : 65;
      });
      this.getTask();
      this.getControl();
      this.getCases();
      this.getPlaces();
      this.getData();
    }
  }
</script>
<style scoped>
  .s-tip {
    color: #666;
    text-align: left;
    font-size: 13px;
    padding: 10px 20px;
    margin-top: 10px;
    background: #E6F7FF;
    border: 1px solid #91D5FF;
    border-radius: 4px;
    position: relative;
  }
</style>
