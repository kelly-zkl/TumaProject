<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="20" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 1080px">
            <el-form-item style="margin-bottom: 10px;margin-right: 0">
              <el-upload ref="upload" class="upload img" :action="uploadUrl" name="file" drag
                         :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                         :auto-upload="true" :show-file-list="false">
                <div v-if="!query.faceUrl"
                     style="height:34px;vertical-align:middle;text-align: center;font-size: 12px;line-height: 34px">
                  <i class="fa fa-photo fa-lg" style="margin-right: 4px;font-size: 18px"></i>上传头像
                </div>
                <el-row v-if="query.faceUrl" style="height:34px;padding:0;margin:0;line-height: 34px">
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
              <el-tooltip effect="dark" content="相似度" placement="bottom">
                <el-input-number v-model="query.similarThreshold" controls-position="right" :min="50" placeholder="相似度"
                                 :max="100" size="medium" style="width:88px" :precision="0"></el-input-number>
              </el-tooltip>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-if="isShow">
              <el-input placeholder="人员编号" v-model="query.faceId" :maxlength="32"
                        style="width: 170px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="IMSI" v-model="query.imsi" :maxlength="15"
                        style="width: 170px" size="medium"></el-input>
            </el-form-item>
            <el-form-item label="年龄段" style="margin-bottom: 10px">
              <el-input-number v-model="query.startAge" controls-position="right" :min="1" :precision="0"
                               :max="query.endAge-1" style="width: 90px" size="medium"></el-input-number>
              <span>~</span>
              <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                               :max="200" style="width: 90px" size="medium" :precision="0"></el-input-number>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 70px" clearable>
                <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px">-->
            <!--<el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>-->
            <!--</el-form-item>-->
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" align="right" style="text-align: right" v-show="getButtonVial('person:count')">
          <label class="el-form-item__label" style="font-size:16px"><span
            style="font-size:12px;color:#999">档案总数 </span>{{personCount}}<span
            style="font-size:12px;color:#999"> 个</span></label>
        </el-col>
      </el-row>
      <el-table ref="table" :data="list10" v-loading="listLoading" class="center-block" stripe
                :height="tableHeight" :max-height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="人员编号" prop="faceId" min-width="160" v-if="isShow"
                         max-width="220" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="人员图像" prop="faceUrl" min-width="110"
                         max-width="200" :formatter="formatterAddress">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                   @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                   style="max-width: 90px;max-height:90px;border-radius:6px;vertical-align:middle"/>
              <!--<div style="width: 40px;height: 40px;position: absolute;top: 0" v-show="scope.row.quality==1">-->
              <!--<div class="list-quality"></div>-->
              <!--<span-->
              <!--style="width:40px;height:40px;position:absolute;top:0;color:#fff;padding-left:5px">优</span>-->
              <!--</div>-->
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="关联IMSI[置信度]" prop="imsiList" min-width="180" max-width="240">
          <template slot-scope="scope">
            <div v-for="item in scope.row.imsiList" v-show="scope.row.imsiList.length>0">
              <span
                v-bind:style="query.imsi&&query.imsi.length>0&&item.imsi.indexOf(query.imsi)>-1?'color:#ff0000':'color:#000'">{{item.imsi}}<span
                style="font-weight: bold">[{{(item.weight/10).toFixed(1)}}%]</span></span>
            </div>
            <span v-show="!scope.row.imsiList||scope.row.imsiList.length==0">{{'--'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄段" prop="startAge" min-width="100" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="100" max-width="180"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="最近采集时间" prop="lastAppearTime" min-width="180"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="最近采集场所" prop="lastPlaceName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <!--<el-table-column align="left" label="碰撞时间" prop="uptime" min-width="170"-->
        <!--max-width="200" :formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" label="操作" min-width="130" max-width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('archives:detail')">查看人员档案
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
        imgPath: require('../../assets/img/icon_people.png'), isShow: false,
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        count: 0, personCount: 0, list: [], list10: [], isFirst: true,
        isSearch: false, firstPage: 0, page: 1, listLoading: false,
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        runBigPic: false, bigUrl: ''
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      clearImg() {
        delete this.query['faceUrl'];
        this.isSearch = true;
        this.getData()
      },
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 282
        } else {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 232
        }
      },
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
        let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.faceId}});
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/personnelFiles', query: {faceId: row.faceId}});
      },
      //获取档案人员列表
      getData() {
        if (this.query.faceUrl) {
          if (!this.query.similarThreshold) {
            this.$message.error('请输入相似度');
            return;
          }
        }

        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageId'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post('person/query', this.query, undefined, undefined, "multi").then((data) => {
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
          let item = this.list[this.list.length - 1];
          this.query.pageId = item.faceId;
          this.getData();
          this.getPersonNum();
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
        delete this.query['faceUrl'];
        let param = JSON.parse(decryData(sessionStorage.getItem("system"))).similarThreshold;

        this.$nextTick(() => {
          this.query.similarThreshold = param ? parseInt(param) : 65;
          this.getData();
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'startAge') {
          return row.startAge >= 0 ? row.startAge == row.endAge ? (row.startAge - 3) + '~' + (row.startAge + 3) : row.startAge + '~' + row.endAge : '--';
        } else if (column.property === 'uptime') {
          return row.uptime ? formatDate(new Date(row.uptime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'lastAppearTime') {
          return row.lastAppearTime ? formatDate(new Date(row.lastAppearTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getPersonNum() {
        if (this.getButtonVial('person:count')) {
          this.$post('/person/count', {}).then((data) => {
            this.personCount = data.data ? data.data : 0;
          });
        }
      }
    },
    mounted() {
      let param = JSON.parse(decryData(sessionStorage.getItem("system"))).similarThreshold;
      this.$nextTick(() => {
        this.query.similarThreshold = param ? parseInt(param) : 65;
      });
      let acc = JSON.parse(decryData(sessionStorage.getItem("user"))).account;
      this.isShow = (acc == 'superAdmin' ? true : false);
      this.getData();
      this.getPersonNum();
    }
  }
</script>
<style scoped>
  .list-quality {
    width: 0;
    height: 0;
    border-left: solid 40px rgba(0, 255, 0, 0.5);
    border-bottom: solid 40px transparent;
    /*background-color: rgba(0, 255, 0, 0.5);*/
    color: #fff;
    position: absolute;
    top: 0;
  }
</style>
