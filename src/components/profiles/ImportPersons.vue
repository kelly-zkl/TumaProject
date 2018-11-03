<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="24" align="left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('person:query')">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model.number="query.similarThreshold" placeholder="相似度阈值" size="medium"
                        style="width: 260px">
                <el-upload ref="upload" class="upload" slot="prepend" :action="uploadUrl" name="file"
                           :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                           :auto-upload="true" :show-file-list="false">
                  <el-button type="primary" size="medium">上传头像图片</el-button>
                </el-upload>
              </el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="人员编号" v-model="query.faceId" :maxlength="18"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="IMSI" v-model="query.imsi" :maxlength="15"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item label="年龄" style="margin-bottom: 10px">
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
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="手机号" v-model="query.mobilePhone" :maxlength="11"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="姓名" v-model="query.name" :maxlength="10"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="身份证号" v-model="query.idCard" :maxlength="18"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="isSearch = true;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-table :data="list10" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="人员编号" prop="faceId" min-width="180"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="人员图像" prop="faceUrl" min-width="130"
                         max-width="200" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                 @click="bigUrl=scope.row.faceUrl;runBigPic=true"
                 style="max-width: 90px;max-height:90px;border-radius: 6px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄" prop="age" min-width="60" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="60" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="IMSI[置信度]" prop="imsiList" min-width="220" max-width="250">
          <template slot-scope="scope">
            <div v-for="item in scope.row.imsiList">
              <span>{{item.imsi}}<span style="color:#000;font-weight: bold">[{{item.weight / 10}}%]</span></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="姓名" prop="name" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="手机号" prop="mobilePhone" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="身份证号" prop="idCard" min-width="170"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="建档时间" prop="createTime" min-width="170"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('archives:detail')">人员档案
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="page"
                       :page-size="10" :total="count" background layout="prev, pager, next"></el-pagination>
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
  import json from '../../assets/city.json';
  import {globalValidImg, doubleValid, mobileValidator, mobileValidator2} from "../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      return {
        query: {size: 100},
        provinceList: json,
        imgPath: require('../../assets/img/icon_people.png'),
        props: {value: 'o', label: 'n', children: 'c'},
        statuses: [{label: '全部', value: ''}, {label: '待处理', value: '1'}, {label: '处理中', value: '2'},
          {label: '已处理', value: '3'}, {label: '误报', value: '4'}],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
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
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        runBigPic: false,
        addPerson: {},
        bigUrl: '',
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
            this.query.similarThreshold = 60;
            this.$message({message: '头像上传成功', type: 'success'});
            this.getData();
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      gotoDetail(row) {
        sessionStorage.setItem("query", JSON.stringify(this.query));
        // sessionStorage.setItem("page", this.page);
        // let routeData = this.$router.resolve({path: '/personnelFiles', query: {faceId: row.faceId}});
        // window.open(routeData.href, '_blank');
        this.$router.push({path: '/personnelFiles', query: {faceId: row.faceId}});
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
        if ((Math.ceil(this.list.length / 10) - index) <= 5 && this.isFirst &&
          (this.list.length % 100 === 0 || this.list.length === this.couple)) {
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
      //清除查询条件
      clearData() {
        this.list10 = [];
        this.query = {size: 100};
        this.isSearch = true;
        delete this.query['faceUrl'];
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'age') {
          return row.age >= 0 ? row.age : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      let bol = JSON.parse(sessionStorage.getItem("query"));
      // let page = sessionStorage.getItem("page");
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
        delete this.query['pageTime'];
      }
      // if (page) {//对一个数进行上舍入。
      //   this.page = parseInt(page);
      //   this.query.size = Math.ceil(page / 10) * 100;
      // }
      this.getData();
    }
  }
</script>
<style scoped>
  .avatar {
    width: 150px;
    height: 150px;
    border: 1px dashed #ccc;
    border-radius: 6px;
  }
</style>
