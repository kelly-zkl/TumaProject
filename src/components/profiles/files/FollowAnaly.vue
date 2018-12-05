<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left" style="text-align: left">
        <el-form-item style="margin-bottom: 10px">
          <el-date-picker v-model="qTime" type="datetimerange" range-separator="至" start-placeholder="开始日期"
                          end-placeholder="结束日期" value-format="timestamp" :picker-options="pickerBeginDate"
                          size="medium" :default-time="['00:00:00', '23:59:59']">
          </el-date-picker>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px" v-show="getButtonVial('follow:add:forPerson')">
          <el-button type="primary" size="medium" @click="getAnaly()">分析</el-button>
        </el-form-item>
      </el-form>
      <el-row>
        <el-col :span="12" align="left" class="tab-card" style="margin: 10px 0">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="IMSI伴随结果" name="IMSI"></el-tab-pane>
            <el-tab-pane label="图像伴随结果" name="FACE"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" size="medium" @click="query.page=1;getData()">查询</el-button>
        </el-col>
      </el-row>
      <el-table :data="imsiList" class="center-block" v-loading="listLoading" stripe v-if="activeItem=='IMSI'">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="imsi" label="IMSI" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="isp" label="运营商" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="regional" label="IMSI归属地" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="followCount" label="伴随次数" min-width="150" max-width="250"></el-table-column>
      </el-table>
      <el-table :data="faceList" class="center-block" v-loading="listLoading" stripe v-if="activeItem=='FACE'">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="现场图像" prop="sceneUrl" min-width="150"
                         max-width="300" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.sceneUrl?scope.row.sceneUrl:imgPath" :onerror="img404"
                 @click="bigUrl=scope.row.sceneUrl;runBigPic=true" style="max-height:70px;border-radius: 6px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="人员图像" prop="faceUrl" min-width="150"
                         max-width="250" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                 @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                 style="max-width: 90px;max-height:90px;border-radius: 6px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" prop="age" label="年龄段" min-width="150" max-width="250"></el-table-column>
        <el-table-column align="left" prop="sex" label="性别" min-width="150" max-width="250"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="followCount" label="伴随次数" min-width="150" max-width="250"></el-table-column>
      </el-table>

      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
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
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        activeItem: 'IMSI',
        listLoading: false,
        runBigPic: false,
        bigUrl: '',
        query: {page: 1, size: 10},
        faceId: this.$route.query.faceId || '',
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'",
        imsiList: [],
        faceList: [],
        qTime: '',
        count: 0,
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
        this.query = {page: 1, size: 10, followType: this.activeItem};
        this.getData();
      },
      //伴随结果分析
      getAnaly() {
        if (this.qTime.length === 0) {
          this.$message.error('请选择时间段');
          return;
        }

        let param = {
          startDate: Math.round(this.qTime[0] / 1000), endDate: Math.round(this.qTime[1] / 1000),
          faceId: this.faceId
        };
        this.$post('follow/add/forPerson', param, "分析成功").then((data) => {
          if ('000000' === data.code) {
            this.getData();
          }
        }).catch((err) => {
        });
      },
      //获取IMSI告警列表
      getData() {
        this.query.faceId = this.faceId;
        this.query.followType = this.activeItem;

        this.listLoading = true;
        this.$post('follow/queryResult', this.query).then((data) => {
          if (this.activeItem === 'FACE') {
            this.faceList = data.data.list;
          } else {
            this.imsiList = data.data.list;
          }
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.imsiList = [];
          this.faceList = [];
          this.$message.error(err);
        });
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
        if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
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
