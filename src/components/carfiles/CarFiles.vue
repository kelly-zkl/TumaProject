<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="20" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 1080px">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="车牌号" v-model="query.carLicense" :maxlength="32"
                        style="width: 150px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="IMSI" v-model="query.imsi" :maxlength="15"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.type" placeholder="车辆类型" size="medium" style="width:180px" filterable
                         clearable>
                <el-option v-for="item in carTypes" :key="item.code" :label="item.codeName"
                           :value="item.code"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="车辆品牌" v-model="query.brand" :maxlength="32"
                        style="width: 150px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" align="right" style="text-align: right" v-show="getButtonVial('car:count')">
          <label class="el-form-item__label" style="font-size:16px"><span
            style="font-size:12px;color:#999">档案总数 </span>{{carCount}}<span
            style="font-size:12px;color:#999"> 个</span></label>
        </el-col>
      </el-row>
      <el-table ref="table" :data="list10" v-loading="listLoading" class="center-block" stripe
                :height="tableHeight" :max-height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="车牌号" prop="carLicense" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="车辆类型" prop="type" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="车辆品牌" prop="brand" min-width="120" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="关联IMSI[置信度]" prop="imsiList" min-width="180" max-width="240">
          <template slot-scope="scope">
            <div v-for="item in scope.row.imsiList" v-show="scope.row.imsiList.length>0">
              <span
                v-bind:style="query.imsi&&query.imsi.length>0&&item.imsi.indexOf(query.imsi)>-1?'color:#ff0000':'color:#000'">{{item.imsi}}<span
                style="font-weight: bold">[{{(item.relevancy*100).toFixed(1)}}%]</span></span>
            </div>
            <span v-show="!scope.row.imsiList||scope.row.imsiList.length==0">{{'--'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="最近采集时间" prop="lastCatchTime" min-width="180"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="最近采集场所" prop="placeName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="130" max-width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('car:detail')">查看车辆档案
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
  import {globalValidImg} from "../../assets/js/api";
  import {formatDate, decryData, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        isMore: false, query: {size: 100},
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        count: 0, carCount: 0, list: [], list10: [], isFirst: true,
        isSearch: false, firstPage: 0, page: 1, listLoading: false,
        runBigPic: false, bigUrl: '', carTypes: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      gotoDetail(row) {
        let routeData = this.$router.resolve({path: '/cfd', query: {carId: row.id}});
        window.open(routeData.href, '_blank');
      },
      //获取档案人员列表
      getData() {
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageId'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post('/car/query', this.query, undefined, undefined, "multi").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (this.query.pageId && !this.isSearch) {
              this.list = this.list.concat(data.data);
            } else {
              this.list = data.data;
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
          this.query.pageId = this.list[this.list.length - 1].pageId;
          this.getData();
          this.getCarNum();
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
      //清除查询条件
      clearData() {
        this.list10 = [];
        this.query = {size: 100};
        this.isSearch = true;

        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'type') {
          let name = '--';
          for (let item of this.carTypes) {
            if (item.code == row.type) {
              name = item.codeName;
              break;
            }
          }
          return name;
        } else if (column.property === 'placeName') {
          return row.lastAppearPlace ? row.lastAppearPlace.placeName ? row.lastAppearPlace.placeName : '--' : '--';
        } else if (column.property === 'lastCatchTime') {
          return row.lastCatchTime ? formatDate(new Date(row.lastCatchTime), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getCarNum() {
        if (this.getButtonVial('car:count')) {
          this.$post('/car/count', {}).then((data) => {
            this.carCount = data.data ? data.data : 0;
          });
        }
      },
      getCarType() {
        if (this.getButtonVial('car:book:liuzhou')) {
          this.$post('/car/book/liuzhou', {}).then((data) => {
            this.carTypes = data.data ? data.data : [];
          });
        }
      }
    },
    mounted() {
      this.getCarType();
      this.getCarNum();
      this.getData();
    }
  }
</script>
