<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left">
          <el-form :inline="true" :model="query" align="left">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="输入名单名称" v-model="query.imsi" :maxlength="30"
                        style="width: 200px" size="medium"></el-input>
            </el-form-item>
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
                     :disabled="sels.length == 0" @click="deleteList()">删除
          </el-button>
          <el-button type="primary" size="medium" style="margin-bottom: 10px"
                     @click="runAddList=true;addList={}">新建名单
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="records" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" label="名单编号" prop="taskName" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="名单分类" prop="collisionType" min-width="125"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="名单名称" prop="createTime" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="备注" prop="caseName" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="人员数量" prop="caseName" min-width="120"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="350" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteList()">删除名单</el-button>
            <el-button type="text" @click="">编辑名单</el-button>
            <el-button type="text" @click="runningAddPerson=true;addPerson={}">添加人员</el-button>
            <el-button type="text" @click="">查看人员</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--新建名单-->
      <el-dialog title="新建名单" :visible.sync="runAddList" width="600px" center class="dialog">
        <el-form :model="addList" align="left" label-width="120px" label-position="right">
          <el-form-item label="分类" prop="sex">
            <el-select v-model="addList.listType" placeholder="选择分类">
              <el-option v-for="item in listTypes" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input placeholder="输入名称" v-model="addList.name" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input placeholder="备注" v-model="addList.phone" :maxlength="200" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button type="primary" @click="confirmAddList()">确认创建</el-button>
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
          <el-form-item label="年龄" prop="age">
            <el-input placeholder="输入年龄" v-model="addPerson.age" :maxlength="3" type="number"></el-input>
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
  export default {
    data() {
      return {
        listLoading: false,
        records: [],
        count: 0,
        query: {page: 1, size: 10},
        addList: {},
        runAddList: false,
        runningAddPerson: false,
        uploadUrl: '',
        addPerson: {},
        imageUrl: '',
        sels: [],
        sexs: [{value: '0', label: '男'}, {value: '2', label: '女'}],
        listTypes: [{value: '0', label: '重点人员'}, {value: '2', label: '普通人员'}],
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
      }
    },
    methods: {
      //创建名单
      confirmAddList() {

      },
      //全选
      selsChange(sels) {
        this.sels = sels;
      },
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
        if (globalValidImg(file.raw, this.$message)) {
        }
        return globalValidImg(file.raw, this.$message);
      },
      //删除任务
      deleteList() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该名单吗?', '提示', {type: 'info'}).then(() => {
//          this.$post('/collision/delete', arr, '删除成功').then((data) => {
//            if ("000000" === data.code) {
//              this.getData();
//              this.sels = [];
//            }
//          }).catch((err) => {
//          });
        }).catch(() => {
        });
      },
      //获取碰撞任务列表
      getData() {
        this.listLoading = true;
//        this.$post('/collision/query', this.query).then((data) => {
//          this.records = data.data.list;
//          this.count = data.data.count;
//          this.listLoading = false;
//        }).catch((err) => {
//          this.records = [];
//          this.listLoading = false;
//        });
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
      }
    },
    mounted() {
      this.records = [{}, {}]
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
