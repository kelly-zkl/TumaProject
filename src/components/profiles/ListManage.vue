<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="20" align="left" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="text-align: left;width: 1080px">
            <el-form-item style="margin-bottom: 10px;margin-right: 0">
              <el-upload ref="upload" class="upload img" :action="uploadImgUrl" name="file" drag
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
                    <el-button type="text" style="height:34px;margin-left:5px" size="small" @click.stop="clearImg()">
                      清除
                    </el-button>
                  </el-col>
                </el-row>
              </el-upload>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px;margin-left: -5px" class="upload">
              <el-tooltip class="item" effect="dark" content="相似度" placement="bottom">
                <el-input-number v-model="query.similarThreshold" controls-position="right" :min="50" placeholder="相似度"
                                 :max="100" size="medium" style="width:88px" :precision="0"></el-input-number>
              </el-tooltip>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="姓名" v-model="query.name" :maxlength="20" style="width: 150px"
                        size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="身份证号" v-model="query.idCard" :maxlength="18"
                        style="width: 180px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.blackClassId" placeholder="所属名单" size="medium"
                         style="width: 150px" clearable filterable>
                <el-option v-for="item in listTypes" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.sex" placeholder="性别" size="medium" style="width: 80px" clearable>
                <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
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
            <el-form-item label="年龄段" style="margin-bottom: 10px" v-show="isMore">
              <el-input-number v-model="query.startAge" controls-position="right" :min="1"
                               :max="query.endAge-1" style="width: 90px" size="medium"></el-input-number>
              <span>~</span>
              <el-input-number v-model="query.endAge" controls-position="right" :min="query.startAge+1"
                               :max="200" style="width: 90px" size="medium"></el-input-number>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-input placeholder="手机号" v-model="query.mobilePhone" :maxlength="11"
                        style="width: 150px" size="medium"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" align="right" style="text-align: right">
          <!--<el-button type="primary" size="medium" style="margin-bottom: 10px" @click="showList()">管理名单</el-button>-->
          <el-button type="primary" size="medium" style="margin-bottom: 10px"
                     v-show="getButtonVial('person:importKeyPerson')"
                     @click="isUpload=false;importFile='';runningImports=true">批量导入
          </el-button>
          <el-button size="medium" style="margin-bottom: 10px" v-show="getButtonVial('person:delKeyPerson')"
                     :disabled="sels.length == 0" @click="deletePerson()">删除
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="list10" v-loading="listLoading" class="table-fixed" stripe
                @selection-change="selsChange" :height="tableHeight">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="人脸图像" prop="faceUrl" min-width="130"
                         max-width="200" :formatter="formatterAddress">
          <template slot-scope="scope">
            <div style="height: 90px;line-height:90px">
              <img v-bind:src="scope.row.faceUrl?scope.row.faceUrl:imgPath"
                   @click="bigUrl=scope.row.faceUrl;runBigPic=true" :onerror="img404"
                   style="max-width:90px;max-height:90px;border-radius:6px;vertical-align:middle"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="姓名" prop="name" min-width="100"
                         max-width="180" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="年龄" prop="age" min-width="60" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="性别" prop="sex" min-width="60" max-width="120"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="身份证号" prop="idCard" min-width="170"
                         max-width="220" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="手机号" prop="mobilePhone" min-width="150"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="所属名单" prop="blackClass" min-width="150"
                         max-width="200" :formatter="formatterAddress">
          <!--<template slot-scope="scope">-->
          <!--<div v-for="item in scope.row.imsiList">-->
          <!--<span>{{item.imsi}}</span>-->
          <!--</div>-->
          <!--</template>-->
        </el-table-column>
        <el-table-column align="left" label="疑似IMSI[置信度]" prop="imsiList" min-width="220" max-width="250">
          <template slot-scope="scope">
            <div v-for="item in scope.row.imsiWeightList" v-show="scope.row.imsiWeightList.length>0">
              <span
                v-bind:style="query.imsi&&query.imsi.length>0&&item.imsi.indexOf(query.imsi)>-1?'color:#ff0000':'color:#000'">{{item.imsi}}<span
                style="font-weight: bold">[{{(item.weight/10).toFixed(1)}}%]</span></span>
            </div>
            <span v-show="!scope.row.imsiWeightList||scope.row.imsiWeightList.length==0">{{'--'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="操作" min-width="150" max-width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('keyPerson:detail')">查看
            </el-button>
            <el-button type="text" @click="showModify(scope.row)" v-show="getButtonVial('keyPerson:update')">修改
            </el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deletePerson()"
                       v-show="getButtonVial('person:delKeyPerson')">删除
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
      <!--名单管理-->
      <el-dialog title="管理名单" :visible.sync="runAddList" width="600px" center class="dialog">
        <div class="block">
          <el-input v-model="addList" placeholder="输入名称，不可重复" style="width: 400px" :maxlength=20>
            <el-button slot="append" type="primary" @click="confirmAddList()">添加</el-button>
          </el-input>
          <el-table :data="listTypes" class="center-block" stripe>
            <el-table-column align="left" type="index" label="序号" width="120"></el-table-column>
            <el-table-column align="left" :formatter="formatterAddress" prop="label" label="名单名称"></el-table-column>
            <el-table-column align="left" :formatter="formatterAddress" prop="label" label="人员数量"></el-table-column>
            <el-table-column align="left" label="操作" width="180" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" @click="deleteList(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
      <!--修改人员信息-->
      <el-dialog title="修改人员信息" :visible.sync="runningModifyPerson" width="600px" center class="dialog">
        <el-form :model="modifyPerson" align="left" label-width="120px" label-position="right" :rules="rules"
                 ref="modifyPerson">
          <el-form-item label="对应头像" prop="faceUrl" style="margin: 0;text-align: left" class="vip-150">
            <!--<el-upload :action="uploadImgUrl" :show-file-list="false" drag-->
            <!--:on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">-->
            <img :src="modifyPerson.faceUrl?modifyPerson.faceUrl:imgPath" class="avatar" :onerror="img404">
            <!--</el-upload>-->
          </el-form-item>
          <!--<div style="color:#999;margin-left: 120px;margin-bottom: 20px;text-align: left">-->
          <!--请选择有人脸且五官较清晰的图片。<br/>-->
          <!--支持jpeg/jpg/png格式的图片，且不超过2M-->
          <!--</div>-->
          <el-form-item label="姓名" prop="name" style="text-align: left">
            <el-input placeholder="输入姓名" v-model="modifyPerson.name" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="身份证号" prop="idCard" style="text-align: left">
            <el-input placeholder="输入身份证号" v-model="modifyPerson.idCard" :maxlength="18"></el-input>
          </el-form-item>
          <el-form-item label="年龄" style="text-align: left">
            <el-input-number v-model="modifyPerson.age" controls-position="right" :min="1"
                             :max="150"></el-input-number>
          </el-form-item>
          <el-form-item label="性别" style="text-align: left">
            <el-select v-model="modifyPerson.sex" placeholder="选择性别">
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="手机号" style="text-align: left">
            <el-input placeholder="输入手机号" v-model="modifyPerson.mobilePhone" :maxlength="11"></el-input>
          </el-form-item>
          <el-form-item label="备注" style="text-align: left">
            <el-input placeholder="备注" v-model="modifyPerson.remark" :maxlength="200" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="confirmModify()">确认修改</el-button>
        </div>
      </el-dialog>
      <!--批量导入-->
      <el-dialog title="批量导入" :visible.sync="runningImports" width="600px" center>
        <div class="block">
          <el-input v-model="importFile" placeholder="请选择压缩文件" disabled v-show="!fileFlag">
            <el-upload ref="upload" class="upload" slot="append" :action="uploadFileUrl" name="file"
                       :on-success="handleImportSuccess" :on-change="handleChange" :on-progress="uploadFileProcess"
                       :auto-upload="false" :show-file-list="false">
              <el-button type="primary">选择文件</el-button>
            </el-upload>
          </el-input>
          <div style="color:#999;margin-top: 20px;font-weight: bold;text-align: left" v-show="!fileFlag">
            选择ZIP压缩文件，导入后，文件将自动解压。<br/>文件夹需要以名单名称来命名；<br/>
            人员图片请选择清晰的人头像照片；<br/>图片文件的命名规则以姓名（汉字）+身份证号（18位数字）
          </div>
          <div v-show="fileFlag" style="margin-bottom: 20px">文件名：{{importFile}}</div>
          <el-row>
            <el-col :span="24" style="text-align: center" align="center">
              <el-progress v-show="fileFlag" :percentage="fileUploadPercent" type="circle"></el-progress>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer" align="center" style="margin-top: 30px">
            <el-button type="primary" @click="importDevice" v-show="!fileFlag&&isUpload">确认导入
            </el-button>
            <el-button type="primary" @click="abortUpload" v-show="fileFlag&&fileUploadPercent!=100">取消导入</el-button>
          </div>
        </div>
      </el-dialog>
      <!--批量导入数量的结果-->
      <el-dialog title="批量导入" :visible.sync="runningImportNumber" width="600px" center>
        <span>已检测到人员 {{totalNum}} 个，导入成功 <span style="color: green">{{successNum}}</span> 个，失败 <span style="color: red">{{failNum}}</span> 个</span>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="runningImportResult = true" v-show="failNum>0">查看失败文件</el-button>
          <el-button type="primary" @click="runningImportNumber = false">关闭</el-button>
        </div>
      </el-dialog>
      <!--批量导入的结果-->
      <el-dialog title="批量导入" :visible.sync="runningImportResult" width="600px" center>
        <el-table :data="importList" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="left" prop="imageUrl" label="头像" min-width="100" max-width="250">
            <template slot-scope="scope">
              <div style="height: 90px;line-height:90px">
                <img v-bind:src="scope.row.imageUrl?scope.row.imageUrl:imgPath" :onerror="img404"
                     style="max-width: 90px;max-height:90px;border-radius: 6px;vertical-align: middle"/>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="left" prop="fileName" label="文件名称" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="导入结果" width="100">
            <template slot-scope="scope">
              <el-button type="text" style="color: #dd6161">导入失败</el-button>
            </template>
          </el-table-column>
          <el-table-column align="left" prop="reason" label="失败原因" min-width="100" max-width="250"
                           :formatter="formatterAddress"></el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="runningImportNumber=false;runningImportResult=false">关闭</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {
    globalValidImg, nameValidator, numValid, mobileValidator, doubleValid, mobileValidator2,
    userCardValid, globalValidZIP, isNull
  } from "../../assets/js/api";
  import {formatDate, buttonValidator, encryData, decryData} from "../../assets/js/util";

  export default {
    data() {
      return {
        bigUrl: '', isMore: false, runBigPic: false, runningImports: false,
        runningImportResult: false, runningImportNumber: false,
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        count: 0, list: [], list10: [], firstPage: 0, page: 1,
        isShow: false, isFirst: true, isSearch: false, listLoading: false,
        query: {size: 100, type: 1}, addList: '', listTypes: [],
        imgPath: require('../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../assets/img/icon_people.png') + "'",
        runAddList: false, runningModifyPerson: false,
        uploadFileUrl: this.axios.defaults.baseURL + 'person/importKeyPerson',
        uploadImgUrl: this.axios.defaults.baseURL + 'file/upload',
        modifyPerson: {}, importFile: '', importList: [],
        totalNum: 0, successNum: 0, failNum: 0, sels: [],
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        rules: {
          faceUrl: [{required: true, message: '请选择头像', trigger: 'blur'}],
          name: [{required: true, message: '请输入姓名', trigger: 'blur'}],
          idCard: [{required: true, message: '请输入身份证号', trigger: 'blur'}]
        },
        fileFlag: false, fileUploadPercent: 0, fileChoose: null, isUpload: false
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 282
        } else {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 232
        }
      },
      showModify(row) {
        let age = !isNull(row.age) ? row.age : 0;
        this.modifyPerson = {
          faceUrl: row.faceUrl, name: row.name, idCard: row.idCard, faceId: row.faceId, age: age,
          sex: row.sex, mobilePhone: row.mobilePhone, remark: row.remark
        };
        if (isNull(row.age)) {
          delete this.modifyPerson['age'];
        }
        this.runningModifyPerson = true
      },
      //取消上传
      abortUpload() {
        this.$refs.upload.abort(this.fileChoose);
        this.fileFlag = false;
        this.fileUploadPercent = 0;
      },
      //上传进度
      uploadFileProcess(event, file, fileList) {
        this.fileFlag = true;
        this.fileUploadPercent = parseInt(event.percent);
      },
      //批量导入设备的文件格式验证
      handleChange(file) {
        // console.log(file);
        this.fileChoose = file;
        this.importFile = file.name;
        if (file.status == 'ready') {
          if (globalValidZIP(file.raw, this.$message)) {
            this.isUpload = true;
            this.importFile = file.name;
          }
        }
      },
      handleImportSuccess(res, file) {
        // console.log(res);
        this.importList = [];
        this.importFile = file.name;
        if (res.code === '000000') {
          this.totalNum = res.data.totalNum;
          this.successNum = res.data.successNum;
          this.failNum = res.data.failNum;
          if (this.totalNum > 0) {
            this.$message({message: "导入成功", type: 'success'});
          }
          setTimeout(() => {
            this.runningImports = false;
            this.fileFlag = false;
            this.fileUploadPercent = 0;
          }, 1000);
          setTimeout(() => {
            this.runningImportNumber = true;
          }, 2000);

          if (res.data.failDetails && res.data.failDetails.length > 0) {
            this.importList = res.data.failDetails;
          }
          this.importPush();
        } else {
          this.$message.error(res.msg);
        }
      },
      importPush() {
        this.$post('person/flushToListCrond', {}, undefined, undefined, "multi").then((data) => {
          if ("000000" === data.code) {
            this.getData();
            this.getBlackTypes();
          } else if ("100000" === data.code) {//执行中
            setTimeout(() => {
              this.importPush();
            }, 5000);
          }
        });
      },
      //确认导入设备
      importDevice() {
        if (!this.importFile) {
          this.$message.error('请选择上传文件');
          return;
        }
        this.$refs.upload.submit();
      },
      gotoDetail(row) {
        let routeData = this.$router.resolve({
          path: '/vipDetail',
          query: {faceId: row.faceId, resourceId: row.faceId}
        });
        window.open(routeData.href, '_blank');
        // this.$router.push({path: '/vipDetail', query: {faceId: row.faceId}});
      },
      showList() {
        this.addList = '';
        this.runAddList = true;
        this.getList();
      },
      //创建名单
      confirmAddList() {
        if (this.addList.length == 0) {
          this.$message.error('请输入名单名称');
          return;
        }
        this.$post('lookup/add/caseType', {label: this.caseTypeAdd}, '添加成功').then((data) => {
          if ("000000" === data.code) {
            this.addList = '';
            this.getList();
          }
        }).catch((err) => {
        });
      },
      getList() {
        this.listTypes = [];
        this.$post('lookup/get/caseType', {}).then((data) => {
          if ("000000" === data.code) {
            if (data.data.items && data.data.items.length > 0) {
              this.listTypes = data.data;
            }
          }
        }).catch((err) => {
          this.listTypes = [];
        });
      },
      deleteList(row) {
        this.$confirm('确认删除该名单?', '提示', {type: 'info'}).then(() => {
          this.$post('lookup/remove/caseType', {label: row.label}, '操作成功').then((data) => {
            if ("000000" === data.code) {
              this.getList();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //全选
      selsChange(sels) {
        this.sels = sels;
      },
      //修改人员信息
      confirmModify() {
        if (this.modifyPerson.name) {
          this.modifyPerson.name = this.modifyPerson.name.replace(/\s+/g, "");
          if (!nameValidator(this.modifyPerson.name)) {
            this.$message.error('请输入由汉字、英文组成的姓名');
            return;
          }
        }
        if (this.modifyPerson.age) {
          if (!numValid(this.modifyPerson.age)) {
            this.$message.error('请输入正确的年龄');
            return;
          } else if (this.modifyPerson.age < 1 && this.modifyPerson.age > 150) {
            this.$message.error('请输入正确的年龄');
            return;
          }
        }
        if (this.modifyPerson.idCard) {
          if (!userCardValid(this.modifyPerson.idCard)) {
            this.$message.error('请输入正确的身份证号');
            return;
          }
        }
        if (this.modifyPerson.mobilePhone) {
          if (!mobileValidator(this.modifyPerson.mobilePhone)) {
            this.$message.error('请输入正确的手机号码');
            return;
          }
        }
        this.runningModifyPerson = false;
        this.$post("keyPerson/update", this.modifyPerson, '修改成功').then(() => {
          this.getData();
          this.runningModifyPerson = false;
        });
      },
      handleAvatarSuccess(res, file) {
        if (res.code === '000000') {
          if (res.data) {
            this.modifyPerson.faceUrl = res.data.fileUrl;
          }
        } else {
          this.$message.error(res.msg);
        }
      },
      beforeAvatarUpload(file) {
        if (globalValidImg(file, this.$message)) {
        }
        return globalValidImg(file, this.$message);
      },
      //头像搜索验证
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
      clearImg() {
        delete this.query['faceUrl'];
        this.isSearch = true;
        this.getData()
      },
      //删除人员
      deletePerson() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.faceId);
        });
        this.$confirm('确认要删除该人员吗?', '提示', {type: 'info'}).then(() => {
          this.$post('person/delKeyPerson', {faceIds: arr}, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getBlackTypes();
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //获取重点人员列表
      getData() {
        if (this.query.faceUrl) {
          if (!this.query.similarThreshold) {
            this.$message.error('请输入相似度');
            return;
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
          delete this.query['pageFaceId'];
          this.isSearch = false;
        }
        this.listLoading = true;
        this.$post('person/queryWithCommonPerson', this.query, undefined, undefined, "multi").then((data) => {
          if ("000000" === data.code) {
            this.listLoading = false;
            if (this.query.pageFaceId && !this.isSearch) {
              this.list = this.list.concat(data.data);
            } else {
              this.list = data.data;
              this.page = 1;
              this.firstPage = 0
            }
            this.list10 = this.list;
            if (this.list.length - this.page * 10 >= 0) {
              this.list10 = this.list.slice((this.page * 10 - 10), (this.page * 10));
            } else {
              this.list10 = this.list.slice((this.page * 10 - 10), this.list.length);
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
          this.query.pageFaceId = this.list[this.list.length - 1].faceId;
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
        this.query = {size: 100, type: 1};
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
        } else if (column.property === 'age') {
          return row.age > 0 ? row.age : '--';
        } else if (column.property === 'age') {
          return row.age >= 0 ? row.age : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getBlackTypes() {
        this.$post('archives/listBlackPersonType', {page: 1, size: 9999}).then((data) => {
          if ("000000" === data.code) {
            this.listTypes = data.data.list;
          }
        }).catch((err) => {
        });
      }
    },
    mounted() {
      if (this.$route.query.id) {
        this.query.blackClassId = this.$route.query.id || '';
      }
      let param = JSON.parse(decryData(sessionStorage.getItem("system"))).similarThreshold;
      this.$nextTick(() => {
        this.query.similarThreshold = param ? parseInt(param) : 65;
      });
      this.getBlackTypes();
      this.getData();
    }
  }
</script>
<style scoped>
  .avatar {
    max-width: 148px;
    max-height: 148px;
    border: 1px dashed #ccc;
    border-radius: 6px;
  }
</style>
