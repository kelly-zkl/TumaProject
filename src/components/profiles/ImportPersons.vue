<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="21" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('person:query')"
                   style="text-align: left;width: 1100px">
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
              <el-input placeholder="人员编号" v-model="query.faceId" :maxlength="18"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="IMSI" v-model="query.imsi" :maxlength="15"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item label="年龄段" style="margin-bottom: 10px">
              <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                               :max="query.endAge-1" style="width: 100px" size="medium"></el-input-number>
              <span>~</span>
              <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                               :max="200" style="width: 100px" size="medium"></el-input-number>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 100px" clearable>
                <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-input placeholder="手机号" v-model="query.mobilePhone" :maxlength="11"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-input placeholder="姓名" v-model="query.name" :maxlength="10"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-input placeholder="身份证号" v-model="query.idCard" :maxlength="18"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px" v-show="isMore">-->
            <!--<el-date-picker v-model="qTime" type="datetimerange" range-separator="至" @change="handleChange"-->
            <!--start-placeholder="开始日期" size="medium" end-placeholder="结束日期" clearable-->
            <!--:default-time="['00:00:00', '23:59:59']" value-format="timestamp"-->
            <!--:picker-options="pickerBeginDate" style="width: 360px">-->
            <!--</el-date-picker>-->
            <!--</el-form-item>-->
          </el-form>
        </el-col>
        <el-col :span="3" align="left" style="text-align: left" v-show="getButtonVial('person:count')">
          <label class="el-form-item__label" style="font-size:16px">{{personCount}}<span
            style="font-size:12px;color:#999">个档案</span></label>
        </el-col>
      </el-row>
      <el-table ref="table" :data="list10" v-loading="listLoading" class="center-block" stripe
                :height="tableHeight" :max-height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="人员编号" prop="faceId" min-width="160"
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
            <div v-for="item in scope.row.imsiList">
              <span
                v-bind:style="query.imsi&&query.imsi.length>0&&item.imsi.indexOf(query.imsi)>-1?'color:#ff0000':'color:#000'">{{item.imsi}}<span
                style="font-weight: bold">[{{(item.weight/10).toFixed(1)}}%]</span></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄段" prop="startAge" min-width="60" max-width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="60" max-width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="最近采集时间" prop="lastAppearTime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="最近采集场所" prop="lastPlaceName" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="碰撞时间" prop="uptime" min-width="170"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="110" max-width="150" fixed="right">
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
  import {globalValidImg, doubleValid, mobileValidator, mobileValidator2} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        isMore: false,
        query: {size: 100},
        qTime: [new Date((formatDate(new Date((new Date().getTime() - 7 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date((new Date().getTime())), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()],
        tableHeight: window.innerHeight - 232,
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        statuses: [{label: '全部', value: ''}, {label: '待处理', value: '1'}, {label: '处理中', value: '2'},
          {label: '已处理', value: '3'}, {label: '误报', value: '4'}],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        areaList: [], count: 0, personCount: 0, list: [], list10: [], isShow: false, isFirst: true,
        isSearch: false, firstPage: 0, page: 1, listLoading: false,
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        runBigPic: false, addPerson: {}, bigUrl: '',
        rules: {
          img: [{required: true, message: '请选择头像', trigger: 'blur'}],
          age: [{required: true, message: '请输入年龄', trigger: 'blur'}],
          sex: [{required: true, message: '请选择性别', trigger: 'blur'}],
          name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
          imsi: [{required: true, message: '请输入imsi', trigger: 'blur'}],
          phone: [{required: true, message: '请输入手机号', trigger: 'blur'}],
          idNumber: [{required: true, message: '请输入身份证号', trigger: 'blur'}],
          pType: [{required: true, message: '请选择所属名单', trigger: 'blur'}]
        },
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
      clearImg() {
        delete this.query['faceUrl'];
        delete this.query['similarThreshold'];
        this.isSearch = true;
        this.getData()
      },
      handleChange(val) {
        if (!val || val.length == 0) {
          this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 7 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
            new Date((formatDate(new Date((new Date().getTime())), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        }
        // if (val && val.length == 2) {
        //   let bol = ((val[1] - val[0]) > 60 * 60 * 24 * 7 * 1000);
        //   if (bol) {
        //     this.$message.error('日期范围不能超过7天');
        //     return;
        //   }
        // }
        this.getData();
      },
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = window.innerHeight - 282
        } else {
          this.tableHeight = window.innerHeight - 232
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
            let param = JSON.parse(sessionStorage.getItem("system")).similarThreshold;
            this.query.similarThreshold = param ? param : 60;
            this.$message({message: '头像上传成功', type: 'success'});
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
        if (this.query.mobilePhone) {
          if (!mobileValidator2(this.query.mobilePhone)) {
            this.$message.error('请输入正确的手机号码');
            return;
          }
        }
        // if (!!this.qTime) {
        //   this.query.startUploadTime = Math.round(this.qTime[0] / 1000);
        //   this.query.endUploadTime = Math.round(this.qTime[1] / 1000);
        // }
        if (this.isSearch) {
          this.list = [];
          this.list10 = [];
          delete this.query['pageTime'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post('person/query', this.query, undefined, undefined, "login").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (this.query.pageTime && !this.isSearch) {
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
          this.query.pageTime = this.list[this.list.length - 1].uptime;
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
        this.qTime = [new Date((formatDate(new Date((new Date().getTime() - 7 * 24 * 3600 * 1000)), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime(),
          new Date((formatDate(new Date((new Date().getTime())), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime()];
        this.isSearch = true;
        delete this.query['faceUrl'];
        this.getData();
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
