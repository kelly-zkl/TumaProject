<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2">
        <el-col :span="8" align="left">
          <div style="font-size:14px;padding:10px 20px">
            当前状态：{{imsiDetail.status==0?'待处理':imsiDetail.status==1?'处理中':imsiDetail.status==2?'已处理':imsiDetail.status==3?'误报':''}}
          </div>
        </el-col>
        <el-col :span="8" :offset="8" align="right" style="text-align: right;padding-right: 15px">
          <el-button type="text" size="medium" @click="runDealDetail=true"
                     v-if="getButtonVial('warning:getSolvedWarningById')&&imsiDetail.status!=0">查看处理记录
          </el-button>
          <el-button type="primary" size="medium" @click=changeStatus(2)
                     v-if="getButtonVial('warning:dealWithWarningById')&&imsiDetail.status==0">已处理
          </el-button>
          <el-button size="medium" @click=changeStatus(3)
                     v-if="getButtonVial('warning:dealWithWarningById')&&imsiDetail.status==0">误报
          </el-button>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog gray-form"
           style="border-top: none;padding: 10px 30px;border-radius: 0 0 4px 4px;margin-bottom: 0">
        <el-form :model="imsiDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8">
              <el-form-item label="IMSI信息" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.imsi ? imsiDetail.imsi : '--'}}
              </el-form-item>
              <el-form-item label="运营商" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.isp == 0 ? '移动' : imsiDetail.isp == 1 ? '联通' : imsiDetail.isp == 2 ? '电信' : '--'}}
              </el-form-item>
              <el-form-item label="IMSI归属地" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.regional ? imsiDetail.regional : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="告警时间" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.timeStr ? imsiDetail.timeStr : '--'}}
              </el-form-item>
              <el-form-item label="场所地区" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.area ? imsiDetail.area : '--'}}
              </el-form-item>
              <el-form-item label="场所地点" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.detailAddress ? imsiDetail.detailAddress : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="告警场所" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.placeName ? imsiDetail.placeName : '--'}}
              </el-form-item>
              <el-form-item label="设备标识" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.deviceName ? imsiDetail.deviceName : '--'}}
              </el-form-item>
              <el-form-item label="设备ID" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.deviceId ? imsiDetail.deviceId : '--'}}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="add-appdiv dialog gray-form" style="padding: 10px 0;margin-top: 13px">
        <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">预警模型信息
        </div>
        <el-form :model="taskDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
          <el-row style="margin: 0;padding: 0 30px">
            <el-col :span="8">
              <el-form-item label="IMSI特征" align="left" style="margin: 0;text-align: left">
                {{imsiDetail.imsi ? imsiDetail.imsi : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="模型名称" align="left" style="margin: 0;text-align: left">
                <el-button type="text" @click="gotoControl()">{{taskDetail.taskName ? taskDetail.taskName : '--'}}
                </el-button>
              </el-form-item>
              <el-form-item label="关联案件" align="left" style="margin: 0;text-align: left">
                <el-button type="text" @click="gotoCase()">{{taskDetail.caseName ? taskDetail.caseName : '--'}}
                </el-button>
              </el-form-item>
              <el-form-item label="模型编号" align="left" style="margin: 0;text-align: left">
                {{taskDetail.taskNo ? taskDetail.taskNo : '--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="管控对象类型" align="left" style="margin: 0;text-align: left">
                {{taskDetail.dispositionType==0?'重点人员名单':taskDetail.dispositionType==1?'人脸|IMSI特征':'--'}}
              </el-form-item>
              <el-form-item label="有效期限" align="left" style="margin: 0;text-align: left">
                {{(taskDetail.startStr?taskDetail.startStr:'--')+' 至 '+(taskDetail.endStr?taskDetail.endStr:'--')}}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row>
        <el-col :span="16" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="关联人员" name="person"></el-tab-pane>
            <el-tab-pane label="侦码记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='person'" style="padding: 10px 0">
        <el-row v-loading="listLoading">
          <el-col :span="24">
            <div v-for="(item) in persons" :key="item.id" class="face2-item" v-show="persons.length>0">
              <el-row>
                <el-row style="background:#D9F7FF;padding: 10px 15px;border-radius: 6px 6px 0 0">
                  <el-col :span="12" align="left" style="text-align: left">
                    <span>疑似档案</span>
                    <el-button type="text" style="padding: 0;margin-left: 20px"
                               @click="gotoPerson(item)" v-if="item.personId">查看档案
                    </el-button>
                  </el-col>
                  <el-col :span="12" align="left" style="text-align: left;padding-left: 15px">
                    <span>疑似重点人员</span>
                    <el-button type="text" style="padding: 0;margin-left: 20px" v-if="item.blackClassPerson"
                               @click="gotoVipPerson(item)">查看重点人员
                    </el-button>
                  </el-col>
                </el-row>
                <el-col :span="12" style="border-right: 1px solid #D7D7D7">
                  <el-row>
                    <el-col :lg="5" :xl="3" align="left" style="text-align: left">
                      <img :src="item.faceUrl?item.faceUrl:imgPath" :onerror="img404"/>
                    </el-col>
                    <el-form :model="item" align="left" label-width="140px" label-position="right">
                      <el-col :lg="19" :xl="21" align="left" style="text-align: left">
                        <el-form-item label="IMSI伴随次数" style="margin:0;" align="left">{{item.fnIn}}</el-form-item>
                        <el-form-item label="IMSI置信度" style="margin:0" align="left">
                          {{item.weight?(item.weight/10).toFixed(1)+'%':'--'}}
                        </el-form-item>
                      </el-col>
                    </el-form>
                  </el-row>
                </el-col>
                <el-col :span="12">
                  <el-row v-if="item.blackClassPerson">
                    <el-form :model="item" align="left" label-width="100px" label-position="right">
                      <el-col :lg="5" :xl="3" align="left" style="text-align: left">
                        <img :src="item.blackClassPerson.faceUrl?item.blackClassPerson.faceUrl:imgPath"
                             :onerror="img404"/>
                      </el-col>
                      <el-col :lg="10" :xl="10" align="left" style="text-align: left">
                        <el-form-item label="姓名" style="margin:0;" align="left">
                          {{item.blackClassPerson.name?item.blackClassPerson.name:'--'}}
                        </el-form-item>
                        <el-form-item label="身份证" style="margin:0" align="left">
                          {{item.blackClassPerson.idCard?item.blackClassPerson.idCard:'--'}}
                        </el-form-item>
                        <el-form-item label="相似度" style="margin:0" align="left">
                          {{item.blackClassPerson.similarThreshold.toFixed(1)+'%'}}
                        </el-form-item>
                      </el-col>
                      <el-col :lg="9" :xl="11" align="right" style="text-align: right">
                        <el-form-item label="所属名单" style="margin:0" align="left">
                          {{item.blackClassPerson.blackClass?item.blackClassPerson.blackClass:'--'}}
                        </el-form-item>
                      </el-col>
                    </el-form>
                  </el-row>
                  <div v-else style="width:100%;color:#909399;font-size:14px;text-align:center;margin-top:20px">暂无数据
                  </div>
                </el-col>
              </el-row>
            </div>
            <div v-show="persons.length==0" style="width:100%;color: #909399;font-size: 14px;text-align: center">暂无数据
            </div>
            <el-row style="width: 100%" v-if="persons.length>=num">
              <el-col :span="24" style="text-align: center" align="center">
                <el-button type="text" @click="loadMore()">加载更多</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
      <div v-show="activeItem=='list'">
        <el-row style="margin-top: 10px">
          <el-col :span="18" align="left" style="text-align: left">
            <el-form :inline="true" :model="query" align="left" style="text-align: left"
                     v-show="getButtonVial('common:imsi:listImsiRecordBySpecialImsi')">
              <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('place:query')">
                <el-select v-model="query.placeId" placeholder="告警场所" size="medium" filterable clearable
                           :filter-method="pinyinMatch">
                  <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                                start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable
                                :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                                :picker-options="pickerBeginDate">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" align="right" style="text-align: right" v-show="getButtonVial('route:query')">
            <el-button type="primary" size="medium" @click="gotoPath()">查看轨迹
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" prop="imsi" label="IMSI" width="210"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="isp" label="运营商" width="150"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" prop="netType" label="网络类型" width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI归属地" prop="regional" width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="采集时间" prop="uptime" width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="采集场所" prop="placeName" width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="deviceName" width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" width="250"
                           :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                         :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
        </div>
      </div>
      <!--告警处理记录-->
      <el-dialog title="告警处理记录" width="750px" :visible.sync="runDealDetail">
        <div class="gray-form">
          <el-form label-width="100px" :model="dealDetail" label-position="right" style="margin: 0">
            <el-form-item label="处理时间" align="left" style="margin: 0">{{dealDetail.timeStr}}</el-form-item>
            <el-form-item label="处理人" align="left" style="margin: 0">{{dealDetail.dealWithUser}}</el-form-item>
            <el-form-item label="变更状态" align="left" style="margin: 0">
              {{dealDetail.status==0?'待处理':dealDetail.status==2?'已处理':dealDetail.status==3?'误报':'--'}}
            </el-form-item>
            <el-form-item label="备注" align="left" style="margin: 0">{{dealDetail.remark?dealDetail.remark:'--'}}
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator, getAreaLable, encryData, decryData} from "../../assets/js/util";
  import PinyinMatch from 'pinyin-match';

  export default {
    data() {
      return {
        listLoading: false,
        runDealDetail: false,
        activeItem: 'person',
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        id: this.$route.query.id || '',
        imsi: this.$route.query.imsi || '',
        taskId: this.$route.query.taskId || '',
        qTime: [new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 60 * 60 * 24 * 7 * 1000,
          new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        dealDetail: {},
        imsiDetail: {},
        taskDetail: {},
        imsiList: [],
        persons: [],
        places: [], placesCopy: [],
        query: {size: 100},
        count: 0,
        list: [],
        list10: [],
        isShow: false,
        isFirst: true,
        isSearch: false,
        firstPage: 0,
        page: 1,
        num: 5,
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
      handleType(val, event) {
        if (this.activeItem === 'person') {
          this.getPersons();
          this.isSearch = false;
        } else {
          this.isSearch = true;
          this.getData();
        }
      },
      //关联人员加载更多
      loadMore() {
        this.num += 5;
        this.getPersons();
      },
      //跳转布控详情页
      gotoControl() {
        if (this.taskDetail.id) {
          let routeData = this.$router.resolve({path: '/controlDetail', query: {taskId: this.taskDetail.id}});
          window.open(routeData.href, '_blank');
        }
      },
      //跳转案件详情页
      gotoCase() {
        if (this.taskDetail.caseId) {
          let routeData = this.$router.resolve({path: '/caseDetail', query: {caseId: this.taskDetail.caseId}});
          window.open(routeData.href, '_blank');
        }
      },
      //进入重点人员档案
      gotoVipPerson(row) {
        if (row.blackClassPerson.faceId) {
          let routeData = this.$router.resolve({
            path: '/vipDetail',
            query: {faceId: row.blackClassPerson.faceId, resourceId: row.blackClassPerson.faceId}
          });
          window.open(routeData.href, '_blank');
        }
      },
      //进入人员档案
      gotoPerson(row) {
        if (row.personId) {
          // this.$router.push({path: '/personnelFiles', query: {faceId: row.personId}});
          let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.personId}});
          window.open(routeData.href, '_blank');
        }
      },
      changeStatus(status) {
        this.$prompt('确认处理此告警？', '提示', {
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
            ids: [this.id], status: status, remark: value ? value : '',
            dealWithUser: JSON.parse(decryData(sessionStorage.getItem("user"))).account
          };
          this.$post('warning/dealWithWarningById', param, "处理成功").then((data) => {
            this.$emit('refreshData', 'warning');
            this.getImsiDetail();
          }).catch((err) => {
            this.$message.error(err);
          });
        }).catch(() => {
        });
      },
      //获取imsi详情
      getImsiDetail() {
        this.$post('warning/getImsiWarning/' + this.id, {}).then((data) => {
          this.imsiDetail = data.data;
          this.imsiDetail.timeStr = formatDate(new Date(this.imsiDetail.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          let code = (this.imsiDetail.areaCode ? this.imsiDetail.areaCode : this.imsiDetail.cityCode ? this.imsiDetail.cityCode : this.imsiDetail.provinceCode ? this.imsiDetail.provinceCode : 0);
          if (code != 0) {
            this.imsiDetail.area = getAreaLable(code);
          }
          if (data.data.status != 0) {
            this.getDealDetail();
          }
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //查看轨迹
      gotoPath() {
        if (!this.qTime || this.qTime.length === 0) {
          this.$message.error('请选择时间范围');
          return;
        }
        let imsis = [this.imsi];

        localStorage.setItem("pathImsi", JSON.stringify(imsis));
        localStorage.setItem("pathTime", JSON.stringify(this.qTime));
        // this.$router.push({path: '/pathLine', query: {imsi: 1}});
        let routeData = this.$router.resolve({path: '/pathLine', query: {imsi: 1}});
        window.open(routeData.href, '_blank');
      },
      //根据imsi查找指定的对应人员
      getPersons() {
        this.listLoading = true;
        this.persons = [];
        this.$post('common/imsi/listFace', {imsi: this.imsi, num: this.num}).then((data) => {
          this.listLoading = false;
          if (data.data && data.data.length > 0) {
            this.persons = data.data;
          }
        }).catch((err) => {
          this.persons = [];
          this.listLoading = false;
          this.$message.error(err);
        });
      },
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
        this.query.imsi = this.imsi;
        this.$post('common/imsi/listImsiRecordBySpecialImsi', this.query).then((data) => {
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
      pageChange(index) {
        this.page = index;
        if (!this.isFirst && this.list.length > this.firstPage) {
          this.isFirst = true;
        }
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst && (this.list.length % 100 === 0)) {
          this.firstPage = this.list.length;
          this.query.pageTime = this.list[this.list.length - 1].catchTime;
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
        this.qTime = '';

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'status') {
          return row.status === 0 ? '待处理' : row.taskStatus === 1 ? '处理中' : row.taskStatus === 2 ? '已处理' : row.taskStatus === 3 ? '误报' : '--';
        } else if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //布控信息
      getTaskDetail() {
        this.$post('disposition/get/' + this.taskId, {}).then((data) => {
          this.taskDetail = data.data;
          this.taskDetail.startStr = formatDate(new Date(this.taskDetail.startTime * 1000), 'yyyy-MM-dd');
          this.taskDetail.endStr = formatDate(new Date(this.taskDetail.endTime * 1000), 'yyyy-MM-dd');
        })
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
      //处理记录
      getDealDetail() {
        this.$post('warning/getSolvedWarningById/' + this.id, {}).then((data) => {
          this.dealDetail = data.data;
          this.dealDetail.timeStr = formatDate(new Date(data.data.dealWithTime * 1000), 'yyyy-MM-dd hh:mm:ss');
        }).catch((err) => {
        });
      }
    },
    mounted() {
      this.getPlaces();
      this.getTaskDetail();
      this.getImsiDetail();
      this.getPersons();
    }
  }
</script>
