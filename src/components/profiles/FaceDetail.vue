<template>
  <div>
    <section class="content">
      <el-row style="background: #F2F2F2">
        <el-col :span="8" align="left">
          <div style="font-size:14px;padding:10px 20px">图像抓拍记录</div>
        </el-col>
      </el-row>
      <div class="add-appdiv dialog" style="border-top: none;border-radius: 0 0 4px 4px">
        <el-form :model="imsiDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
          <el-row style="margin: 0;padding: 0">
            <el-col :span="8" align="center">
              <img :src="imsiDetail.spotFileUrl?faceUrl+imsiDetail.spotFileUrl:'../../assets/img/icon_people.png'"
                   style="height: 240px;width: 240px;border: 1px #D7D7D7 dashed"/>
            </el-col>
            <el-col :span="8" align="left">
              <img :src="imsiDetail.fileUrl?faceUrl+imsiDetail.fileUrl:'../../assets/img/icon_people.png'"
                   style="height: 160px;width: 160px;border: 1px #D7D7D7 dashed"/>
              <el-form-item label="年龄" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.age ? imsiDetail.age : '--'}}</span>
              </el-form-item>
              <el-form-item label="性别" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.sex == 0 ? '男' : imsiDetail.sex == 1 ? '女' : '--'}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="告警时间" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.timeStr ? imsiDetail.timeStr : '--'}}</span>
              </el-form-item>
              <el-form-item label="告警地区" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.area ? imsiDetail.area : '--'}}</span>
              </el-form-item>
              <el-form-item label="告警地点" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.location ? imsiDetail.location : '--'}}</span>
              </el-form-item>
              <el-form-item label="告警场所" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.place ? imsiDetail.place : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备标识" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.deviceName ? imsiDetail.deviceName : '--'}}</span>
              </el-form-item>
              <el-form-item label="设备ID" align="left" style="margin: 0">
                <span style="font-size: 15px;color:#000">{{imsiDetail.deviceId ? imsiDetail.deviceId : '--'}}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="疑似人员" name="person"></el-tab-pane>
            <el-tab-pane label="所有记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div v-show="activeItem=='person'" style="padding: 20px">
        <div class="face-main">
          <div class="face-item" v-for="item in persons" :key="item.id">
            <img :src="item.fileUrl?faceUrl+item.fileUrl:'../../assets/img/icon_people.png'"/>
            <el-form :model="item" align="left" label-width="60px" label-position="right"
                     style="position: absolute;top: 25px;left:180px">
              <el-form-item label="档案ID" style="margin:0">
                <span style="font-size: 15px;color:#000;margin-right: 20px">{{item.personId}}</span>
                <el-button type="text">查看人员</el-button>
              </el-form-item>
              <el-form-item label="IMSI" style="margin:0">
                <span style="font-size: 15px;color:#000">{{item.imsi}}</span>
              </el-form-item>
              <el-form-item label="手机号" style="margin:0">
                <span style="font-size: 15px;color:#000">{{item.phone}}</span>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <div v-show="activeItem=='list'">
        <el-row style="margin-top: 15px">
          <el-col :span="18" align="left">
            <el-form :inline="true" :model="query" align="left">
              <el-form-item label="相似度" style="margin-bottom: 10px">
                <el-row>
                  <el-input v-model="query.age1" type="number" size="medium" style="width: 80px"
                            :maxlength=3></el-input>
                  <span>~</span>
                  <el-input v-model="query.age2" type="number" size="medium" style="width: 80px"
                            :maxlength=3></el-input>
                </el-row>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="query.status" placeholder="选择场所" size="medium" style="width: 200px">
                  <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">
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
                <el-button type="primary" size="medium" @click="getData()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="gotoPath()">查看轨迹</el-button>
          </el-col>
        </el-row>
        <el-table :data="faceList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="现场图像" prop="fileUrl" min-width="125"
                           max-width="250">
            <template slot-scope="scope">
              <img v-bind:src="faceUrl+scope.row.fileUrl" style="width: 90px;height:90px"/>
            </template>
          </el-table-column>
          <el-table-column align="left" label="相似度" prop="followTarget" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="年龄" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="性别" prop="taskName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="抓取时间" prop="followTarget" width="200"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="场所" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备标识" prop="taskStatus" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="设备ID" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160">
            <template slot-scope="scope">
              <el-button type="text" @click="">查看</el-button>
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
  import {formatDate, isPC} from "../../assets/js/util";

  export default {
    data() {
      return {
        listLoading: false,
        activeItem: 'person',
        caseTime: '',
        id: this.$route.query.id || '',
        faceId: this.$route.query.faceId || '',
        imsiDetail: {},
        faceList: [],
        persons: [],
        places: [],
        query: {page: 1, size: 10},
        count: 0,
        statuses: [{label: '全部', value: ''}, {label: '待处理', value: '1'}, {label: '处理中', value: '2'},
          {label: '已处理', value: '3'}, {label: '误报', value: '4'}],
        sels: [],
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
        if (this.activeItem === 'person') {
          this.getPersons();
        } else {
          this.getData();
        }
      },
      //获取imsi详情
      getFaceDetail() {
        this.$post('archives/getFaceRecordById/' + this.id, {}).then((data) => {
          this.imsiDetail = data.data;
          this.imsiDetail.timeStr = formatDate(new Date(this.imsiDetail.catchTime * 1000), 'yyyy-MM-dd hh:mm:ss');
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //根据人脸查找指定的对应人员
      getPersons() {
        this.$post('archives/listFaceByImageId/' + this.faceId, {}).then((data) => {
          this.persons = data.data;
        }).catch((err) => {
          this.$message.error(err);
        });
      },
      //查看轨迹
      gotoPath() {
        this.$router.push("/pathLine");
      },
      //全选
      selsChange(sels) {
        this.sels = sels;
      },
      getData() {
        if (!!this.caseTime) {
          this.query.startTime = this.caseTime[1];
          this.query.endTime = this.caseTime[0];
        }

        this.query.imsi = this.imsi;
        this.listLoading = true;
        this.$post('common/face/listFaceTrace', this.query).then((data) => {
          this.faceList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.faceList = [];
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
      this.getFaceDetail();
      this.getPersons();
      this.persons = [{id: '2312', imsi: '156456', phone: '12345678901'}, {
        id: '956',
        imsi: '156456',
        phone: '12345678901'
      },
        {id: '565', imsi: '2656', phone: '12345678901'}, {id: '26546', imsi: '156456', phone: '12345678901'}]
    }
  }
</script>
<style scoped>
  .face-main {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .face-item {
    width: 43%;
    height: 132px;
    border: 1px #D7D7D7 solid;
    padding: 20px;
    margin-bottom: 30px;
    position: relative;
  }

  .face-item img {
    position: absolute;
    left: 20px;
    width: 130px;
    height: 130px;
    border: 1px #D7D7D7 dashed;
    text-align: left;
  }

  .face-item:nth-child(odd) {
    margin-right: 30px;
  }
</style>
