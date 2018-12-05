<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left">
          <el-form :inline="true" :model="query" align="left">
            <el-form-item style="margin-bottom: 10px">
              <el-upload ref="upload" class="upload img" :action="uploadUrl" name="file"
                         :on-success="handleSuccess" :before-upload="beforeAvatarUpload" size="medium"
                         :auto-upload="true" :show-file-list="false">
                <el-button size="medium" style="width: 100px">
              <span class="el-upload__text">
                <span v-if="!query.faceUrl">
                  <i class="fa fa-photo fa-lg"></i>上传头像
                </span>
                <img :src="query.faceUrl" v-if="query.faceUrl" style="height: 30px">
              </span>
                </el-button>
              </el-upload>
            </el-form-item>
            <el-form-item label="年龄段" style="margin-bottom: 10px">
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
              <el-input placeholder="输入IMSI" v-model="query.imsi" :maxlength="30"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="输入手机号" v-model="query.phone" :maxlength="30"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="输入姓名" v-model="query.name" :maxlength="30"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="输入身份证号" v-model="query.idNumber" :maxlength="30"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <!--<el-form-item style="margin-bottom: 10px">-->
            <!--<el-select v-model="query.value" placeholder="所属名单" size="medium" style="width: 150px">-->
            <!--<el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value">-->
            <!--</el-option>-->
            <!--</el-select>-->
            <!--</el-form-item>-->
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button size="medium" @click="clearData()">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right">
          <el-button type="primary" size="medium" style="margin-bottom: 10px"
                     @click="$router.push('/listManage')">名单管理
          </el-button>
          <el-button type="primary" size="medium" style="margin-bottom: 10px"
                     @click="runningAddPerson=true;addPerson={}">添加人员
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="normalList" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="人员编号" prop="personCode" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="人员图像" prop="faceUrl" min-width="150"
                         max-width="250" :formatter="formatterAddress">
          <template slot-scope="scope">
            <img v-bind:src="scope.row.faceUrl?faceUrl+scope.row.faceUrl:imgPath"
                 @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                 style="max-width: 90px;max-height:90px;border-radius: 6px"/>
          </template>
        </el-table-column>
        <el-table-column align="left" label="年龄段" prop="age" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="置信度" prop="imsiList" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="手机号" prop="phone" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="身份证号" prop="idCard" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="姓名" prop="name" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="所属名单" prop="blackPersonType" width="150"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)">人员档案</el-button>
          </template>
        </el-table-column>
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
      <!--添加人员-->
      <el-dialog title="名单录入" :visible.sync="runningAddPerson" width="600px" center class="dialog">
        <el-form :model="addPerson" align="left" label-width="120px" label-position="right" :rules="rules"
                 ref="addPerson">
          <el-form-item label="对应头像" prop="img" style="margin: 0">
            <el-upload :action="uploadUrl" :show-file-list="false"
                       :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <img src="../../assets/img/icon_people.png" class="avatar" v-else>
            </el-upload>
            <span style="color:#999">只能上传jpeg/jpg/png文件，且不超过2M</span>
          </el-form-item>
          <el-form-item label="年龄段" prop="age">
            <el-input placeholder="输入年龄段" v-model="addPerson.age" :maxlength="3" type="number"></el-input>
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <el-select v-model="addPerson.sex" placeholder="选择性别">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input placeholder="输入姓名" v-model="addPerson.name" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="IMSI" prop="imsi">
            <el-input placeholder="输入IMSI" v-model="addPerson.imsi" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input placeholder="输入手机号" v-model="addPerson.phone" :maxlength="11"></el-input>
          </el-form-item>
          <el-form-item label="身份证号" prop="idNumber">
            <el-input placeholder="输入身份证号" v-model="addPerson.idNumber" :maxlength="18"></el-input>
          </el-form-item>
          <el-form-item label="所属名单" prop="pType">
            <el-select v-model="addPerson.pType" placeholder="名单">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input placeholder="备注" v-model="addPerson.phone" :maxlength="200" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="confirmAdd()">确认添加</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import json from '../../assets/city.json';
  import {globalValidImg, noSValidator, noValidator} from "../../assets/js/api";

  export default {
    data() {
      return {
        runBigPic: false,
        bigUrl: '',
        query: {page: 1, size: 10},
        provinceList: json,
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        props: {value: 'o', label: 'n', children: 'c'},
        statuses: [{label: '全部', value: ''}, {label: '待处理', value: '1'}, {label: '处理中', value: '2'},
          {label: '已处理', value: '3'}, {label: '误报', value: '4'}],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        areaList: [],
        count: 0,
        listLoading: false,
        normalList: [],
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        imgUrl: '',
        runningAddPerson: false,
        addPerson: {},
        imageUrl: '',
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
      //添加名单
      confirmAdd() {
        this.$refs['addPerson'].validate((valid) => {
          if (valid) {
            this.runningAddPerson = false;
          }
        })
      },
      handleAvatarSuccess(res, file) {
        this.imageUrl1 = URL.createObjectURL(file.raw);
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
            this.getData();
            setTimeout(() => {
              this.getData();
            }, 7000);
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      gotoDetail(item) {
        this.$router.push({path: '/personnelFiles'});
      },
      //获取IMSI告警列表
      getData() {
        this.listLoading = true;
        this.$post('archives/listPerson', this.query).then((data) => {
          this.normalList = data.data.list;
          this.count = data.data.count;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.normalList = [];
          this.$message.error(err);
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        delete this.query['faceUrl'];
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
        if (column.property === 'sex') {
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'imsiList') {
          let imsi = [];
          row.imsiList.forEach((item) => {
            imsi.push(item.imsi)
          });
          return imsi.join("，");
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.getData();
      this.normalList = [{}, {}];
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
