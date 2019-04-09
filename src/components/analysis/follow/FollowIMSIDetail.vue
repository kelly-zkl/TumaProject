<template>
  <div>
    <section class="content">
      <div class="add-appdiv" style="margin-bottom:15px">
        <el-row>
          <el-col :span="8" align="left" style="border-right: 1px #e5e5e5 solid">
            <span style="font-size: 14px;color: #999;margin-right: 20px">IMSI信息</span>
            <span style="font-size: 15px">{{imsi}}</span>
          </el-col>
          <el-col :span="8" align="left" style="border-right: 1px #e5e5e5 solid">
            <span style="font-size: 14px;color: #999;margin:auto 20px;font-size: 14px">运营商</span>
            <span style="font-size: 15px">{{isp === 0 ? '移动' : isp === 1 ? '联通' : isp === 2 ? '电信' : '--'}}</span>
          </el-col>
          <el-col :span="8" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px;font-size: 14px">IMSI归属地</span>
            <span style="font-size: 15px">{{regional?regional:'--'}}</span>
          </el-col>
        </el-row>
      </div>
      <el-row style="margin-bottom: 15px">
        <el-col :span="24" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="关联人员" name="person"></el-tab-pane>
            <el-tab-pane label="侦码记录" name="record"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'record'">
        <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('follow:queryRecord')"
                 style="text-align: left">
          <el-form-item style="margin-bottom: 10px">
            <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                            start-placeholder="采集时间" size="medium" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.regional" placeholder="IMSI归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="query.page=1;getList()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="源IMSI" prop="originalImsi" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="源时间" prop="originalUpTime" min-width="170"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随IMSI" prop="imsi" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="伴随时间" prop="upTime" min-width="170"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="运营商" prop="isp" min-width="80"
                           max-width="120" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="80"
                           max-width="120" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="125"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="deviceId" min-width="125"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="采集地点" prop="deviceName" min-width="125"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" v-show="activeItem == 'person'">
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
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'person',
        qTime: "",
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        taskId: this.$route.query.taskId || '',
        followType: this.$route.query.followType || '',
        imsi: this.$route.query.imsi || '',
        isp: this.$route.query.isp || '',
        regional: this.$route.query.regional || '',
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        records: [],
        query: {page: 1, size: 10},
        listLoading: false,
        count: 0,
        persons: [],
        num: 5,
        listLoading1: false,
        queryPerson: {imsi: this.imsi, size: 10000, page: 1}
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val) {
        if (this.activeItem === 'record') {//所有imsi记录
          this.getList();
        } else {//关联人员
          this.getPersons();
        }
      },
      //关联人员加载更多
      loadMore() {
        this.num += 5;
        this.getPersons();
      },
      //进入重点人员档案
      gotoVipPerson(row) {
        if (row.blackClassPerson.faceId && row.blackClassPerson.resourceId) {
          let routeData = this.$router.resolve({
            path: '/vipDetail',
            query: {faceId: row.blackClassPerson.faceId, resourceId: row.blackClassPerson.resourceId}
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
      //根据imsi查人脸
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
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.qTime = '';
        this.getList();
      },
      pageChange(index) {
        this.query.page = index;
        this.getList();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getList();
      },
      //imsi记录
      getList() {
        if (!!this.qTime) {
          this.query.startTime = Math.round(this.qTime[0] / 1000);
          this.query.endTime = Math.round(this.qTime[1] / 1000);
        } else {
          delete this.query['qTime'];
        }

        this.query.followTaskId = this.taskId;
        this.query.followType = this.followType;
        this.query.imsi = this.imsi;

        this.listLoading = true;
        this.$post('/follow/queryRecord', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {//0-男  1-女  2-未知
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'imsiList') {
          return row.imsiList ? row.imsiList.join("， ") : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'upTime') {
          return row.upTime ? formatDate(new Date(row.upTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'originalUpTime') {
          return row.originalUpTime ? formatDate(new Date(row.originalUpTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'confidenceLevel') {
          return row.confidenceLevel * 100 + '%';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "--";
        switch (isp) {
          case 0:
            moduleId = "CMCC";
            break;
          case 1:
            moduleId = "CMUC";
            break;
          case 2:
            moduleId = "CMTC";
            break;
          default:
            break;
        }
        return moduleId;
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.followType = this.$route.query.followType || '';
      this.imsi = this.$route.query.imsi || '';
      this.isp = this.$route.query.isp || '';
      this.regional = this.$route.query.regional || '';

      this.getPersons();
    }
  }
</script>
