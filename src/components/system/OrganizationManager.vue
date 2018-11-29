<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left" v-show="getButtonVial('manager:group:query')" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="margin-top: 0;text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="组织名称" v-model="query.groupName" :maxlength="20" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" icon="search" @click.stop="query.page=1;getOrganizations()" size="medium">搜索
              </el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button @click.stop="clearData()" size="medium">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" v-show="getButtonVial('manager:group:create')"
                     size="medium" @click="addOrganization()">创建公安机关
          </el-button>
          <el-button type="primary" v-show="getButtonVial('manager:group:create')"
                     size="medium" @click="addPolice()">创建派出所
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="organizations" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
        <el-table-column align="left" prop="groupName" label="组织名称" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="account" label="组织管理员" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="pgroupName" label="上级组织" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="remark" label="备注" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="createTime" label="创建时间" width="160"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click.stop="modifyOrganization(scope.row)"
                       v-show="getButtonVial('manager:group:update') && scope.row.groupId.length > 3
                                && groupId != scope.row.groupId">修改
            </el-button>
            <el-button @click="deleteOrganization(scope.row.groupId)" type="text"
                       v-show="getButtonVial('manager:group:delete:*') && scope.row.groupId.length > 3
                                && groupId != scope.row.groupId">删除
            </el-button>
            <el-button type="text" @click="deleteOrganization(scope.row)"
                       v-show="getButtonVial('manager:user:update') &&scope.row.groupId.length > 3
                                && groupId != scope.row.groupId">
              {{scope.row.locked == 0 ? '停用' : '启用'}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--创建/修改公安机关-->
      <el-dialog :title="addOrganizationTitle" :visible.sync="addOrganizationVisible" :width="dialogWidth">
        <el-form ref="group" :model="group" label-width="100px" labelPosition="right">
          <el-form-item label="公安机关名称" prop="groupName" align="left">
            <el-input v-model="group.groupName" placeholder="请输入公安机关名称" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="管辖区域" align="left">
            <el-select v-model="group.areas" placeholder="请选择用户" filterable multiple>
              <el-option v-for="item in users" :key="item.userId" :label="item.account" :value="item.userId"
                         v-show="item.groupAdmin != true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="组织管理员" align="left" required>
            <el-radio-group v-model="group.conditionType">
              <el-radio :label="0">注册新用户</el-radio>
              <el-radio :label="1">选择已注册的用户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="选择用户" align="left" v-show="group.conditionType==1">
            <el-select v-model="group.adminId" placeholder="请选择用户" filterable>
              <el-option v-for="item in users" :key="item.userId" :label="item.account" :value="item.userId"
                         v-show="item.groupAdmin != true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用户名" align="left" v-show="group.conditionType==0">
            <el-input v-model="group.account" placeholder="请输入用户名" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="密码" align="left" v-show="group.conditionType==0">
            <el-input v-model="group.password" placeholder="请输入密码" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="addOrganizationVisible = false" size="medium">取消</el-button>
          <el-button type="primary" @click="onSubmit('group',addOrganizationTitle)" size="medium">确认</el-button>
        </div>
      </el-dialog>
      <!--创建/修改派出所-->
      <el-dialog :title="addPoliceTitle" :visible.sync="addPoliceVisible" :width="dialogWidth">
        <el-form ref="police" :model="police" label-width="100px" labelPosition="right">
          <el-form-item label="派出所名称" prop="groupName" align="left">
            <el-input v-model="police.groupName" placeholder="请输入派出所名称" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="所属组织" align="left">
            <span>{{police.account}}</span>
          </el-form-item>
          <el-form-item label="组织管理员" align="left" required>
            <el-radio-group v-model="police.conditionType">
              <el-radio :label="0">注册新用户</el-radio>
              <el-radio :label="1">选择已注册的用户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="选择用户" align="left" v-show="police.conditionType==1">
            <el-select v-model="police.adminId" placeholder="请选择用户" filterable>
              <el-option v-for="item in users" :key="item.userId" :label="item.account" :value="item.userId"
                         v-show="item.groupAdmin != true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用户名" align="left" v-show="police.conditionType==0">
            <el-input v-model="police.account" placeholder="请输入用户名" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="密码" align="left" v-show="police.conditionType==0">
            <el-input v-model="police.password" placeholder="请输入密码" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="addPoliceVisible=false" size="medium">取消</el-button>
          <el-button type="primary" @click="savePolice()" size="medium">确认</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import md5 from 'js-md5';
  import {pswValidator, nameValidator, noValidator} from '../../assets/js/api';
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      let nickValidate = (rule, value, callback) => {
        if (value.length < 2) {
          callback(new Error('组织名称不能小于2位'));
        } else if (value.length > 20) {
          callback(new Error('组织名称不能大于20位'));
        } else if (!nameValidator(value)) {
          callback(new Error("请输入正确的用户名，由汉字、英文字母组成"));
        } else {
          callback();
        }
      };
      return {
        listLoading: false,
        isShow: true,
        addAdminVisible: false,
        tableHeight: window.innerHeight - 245,
        organizations: [],
        addPoliceTitle: '创建派出所',
        addPoliceVisible: false,
        dialogWidth: isPC ? '40%' : '90%',
        groupId: JSON.parse(sessionStorage.getItem("user")).groupId,
        query: {page: 1, size: 10, groupName: '', userId: JSON.parse(sessionStorage.getItem("user")).userId},
        count: 0,
        group: {areas: []},
        police: {},
        addOrganizationTitle: '创建公安机关',
        addOrganizationVisible: false,
        rules: {
          groupName: [
            {required: true, message: '请输入公安机关名称', trigger: 'blur'},
            {validator: nickValidate, trigger: "change,blur"},
          ]
        },
        setPsw: 'defaultPsw',
        users: [],
        groups: []
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      addPolice() {
        this.police = {};
        this.addPoliceTitle = '创建派出所';
        this.addPoliceVisible = true;
      },
      modifyPolice(row) {
        this.police = Object.assign({}, row);
        this.addPoliceTitle = '修改派出所';
        this.addPoliceVisible = true;
      },
      savePolice() {
        this.$refs['police'].validate((valid) => {
          if (valid) {
            let url = '/manager/group/create';
            let msg = '创建成功';
            if (this.addPoliceTitle == '修改派出所') {
              url = '/manager/group/update';
              msg = '修改成功';
            } else {
              this.police.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
            }
            if (!this.police.adminId) {
              this.$message.error('请选择组织管理员');
              return;
            }
            if (!this.police.pgroupId) {
              this.$message.error('请选择上级组织');
              return;
            }
            this.$post(url, this.police, msg).then((data) => {
              if ("000000" === data.code) {
                this.addPoliceVisible = false;
                this.getOrganizations();
                this.getAllGroups();
                this.getUserList();
              }
            });
          }
        });
      },
      //确认提交
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            let url = '/manager/group/create';
            let msg = '创建成功';
            if (title === '修改公安机关') {
              url = '/manager/group/update';
              msg = '修改成功';
            } else {
              this.group.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
            }
            if (!this.group.adminId) {
              this.$message.error('请选择组织管理员');
              return;
            }
            if (!this.group.pgroupId) {
              this.$message.error('请选择上级组织');
              return;
            }
            this.$post(url, this.group, msg).then((data) => {
              if ("000000" === data.code) {
                this.addOrganizationVisible = false;
                this.getOrganizations();
                this.getAllGroups();
                this.getUserList();
              }
            });
          }
        });
      },
      //创建组织
      addOrganization() {
        this.group = {areas: []};
        this.addOrganizationTitle = '创建公安机关';
        this.isShow = true;
        this.addOrganizationVisible = true;
      },
      //修改组织
      modifyOrganization(row) {
        this.group = Object.assign({}, row);
        this.addOrganizationTitle = '修改公安机关';
        this.isShow = false;
        this.addOrganizationVisible = true;
      },
      //删除组织
      deleteOrganization(id) {
        this.$confirm('删除组织将会清空该组织相关的用户、岗位及其子组织的所有数据，请谨慎操作！', '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('/manager/group/delete/' + id, {}, '删除成功').then((data) => {
            this.getOrganizations();
            this.getAllGroups();
            this.getUserList();
          });
        }).catch((err) => {
        });
      },
      //获取组织列表
      getOrganizations() {
        if (this.query.groupName) {
          if (!nameValidator(this.query.groupName)) {
            this.$message.error('请输入正确的组织名称，由汉字、英文组成');
            return;
          }
        }
        this.listLoading = true;
        this.$post('/manager/group/query', this.query).then((data) => {
          this.organizations = data.data.content;
          this.count = data.data.totalElements;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.organizations = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getOrganizations();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getOrganizations();
      },
      clearData() {
        this.query = {page: 1, size: 10, groupName: '', userId: JSON.parse(sessionStorage.getItem("user")).userId};
        this.getOrganizations();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
      },
      //获取用户列表
      getUserList() {
        this.$post("/manager/user/query", {
          page: 1, size: 9999, locked: 0,
          myGroupId: JSON.parse(sessionStorage.getItem("user")).groupId
        }).then((data) => {
          this.users = data.data.content;
        });
      },
      //获取全部组织列表
      getAllGroups() {
        this.$post('/manager/group/query', {
          page: 1, size: 9999,
          userId: JSON.parse(sessionStorage.getItem("user")).userId
        }).then((data) => {
          this.groups = data.data.content;
        }).catch((err) => {
          this.groups = [];
        });
      }
    },
    mounted() {
      this.getAllGroups();
      this.getUserList();
      this.getOrganizations();
    }
  }
</script>
