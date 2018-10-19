<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left" style="margin-top: 0">
        <el-row>
          <el-col :span="20" align="left" v-show="getButtonVial('manager:user:query')">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="账号/用户名" v-model="query.keyword" :maxlength="30"
                        style="width: 200px" size="medium"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.myGroupId" placeholder="全部组织" size="medium" filterable>
                <el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"
                           :value="item.groupId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.roleId" placeholder="全部岗位" size="medium" filterable clearable>
                <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" icon="search" @click.stop="query.page=1;getUserList" size="medium">搜索
              </el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button @click.stop="clearData" size="medium">重置</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="4" align="right">
            <el-form-item>
              <el-button type="primary" icon="el-icon-plus" @click="addInfo"
                         v-show="getButtonVial('manager:user:create')" size="medium">添加成员
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-table :data="users" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" prop="account" label="账号" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="realName" label="用户名" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="groupName" label="所属组织" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="roleNameList" label="角色" min-width="120"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="groupAdmin" label="用户类型" width="130"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="createTime" label="创建时间" width="170"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="locked" label="状态" width="80"
                         :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" style="margin-right: 10px" @click.stop="updateInfo(scope.row)"
                       v-show="getButtonVial('manager:user:update')">修改
            </el-button>
            <el-button type="text" @click="userUse(scope.row)"
                       v-show="getButtonVial('manager:user:update') && scope.row.groupAdmin != true">
              {{scope.row.locked == 0 ? '停用' : '启用'}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--添加成员-->
      <el-dialog :title="addUserTitle" :visible.sync="addUserVisible" :width="dialogWidth">
        <el-form ref="admin" :model="admin" label-width="100px" :rules="rules" labelPosition="right">
          <el-form-item label="账号" prop="account">
            <el-input v-model="admin.account" placeholder="请输入帐号" :maxlength="18" :minlength="6"></el-input>
          </el-form-item>
          <el-form-item label="密码" align="left" required>
            <el-radio-group v-model="setPsw" @change="changePsw">
              <el-radio :label="'defaultPsw'">使用默认密码12345678</el-radio>
              <el-radio :label="'newPsw'">自定义</el-radio>
            </el-radio-group>
            <el-input v-show="setPsw =='newPsw'" type="password" v-model="admin.password"
                      placeholder="请输入6-16位密码" :maxlength="18" :minlength="6"></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="realName">
            <el-input v-model="admin.realName" placeholder="请输入用户名" :maxlength="16" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="所属组织" align="left" prop="groupId">
            <el-select v-model="admin.groupId" placeholder="请选择组织" filterable>
              <el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"
                         :value="item.groupId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设置岗位" align="left" required>
            <el-select v-model="role" placeholder="请选择岗位" filterable>
              <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId"
                         v-show="item.roleId.length != 1">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="cancelSubmit()">取消</el-button>
          <el-button type="primary" @click="onSubmit('admin',addUserTitle)">确认</el-button>
        </div>
      </el-dialog>
      <!--修改账号-->
      <el-dialog :title="addUserTitle" :visible.sync="modifyUserVisible" :width="dialogWidth">
        <el-form ref="admin" :model="admin" label-width="100px" :rules="rules" labelPosition="right">
          <el-form-item label="账号" prop="loginId" align="left">
            <span>{{admin.account}}</span>
          </el-form-item>
          <el-form-item label="密码">
            <el-row>
              <el-col :span="8" align="left">**********</el-col>
              <el-col :span="16" align="right" v-show="getButtonVial('manager:user:updatePwdByAdmin')">
                <el-button type="text" v-show="userId === this.admin.creatorId"
                           @click="modifyPswVisible = true;modify = {adminPsw: '', newPsw: '', newPsw1: ''}">修改密码
                </el-button>
                <el-button type="text" @click="resetPswVisible = true;reset={adminPsw: ''}"
                           v-show="userId === this.admin.creatorId">重置
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="用户名" prop="realName">
            <el-input v-model="admin.realName" placeholder="请输入用户名" :maxlength="10" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="所属组织" align="left" prop="groupId">
            <el-select v-model="admin.groupId" placeholder="请选择组织" v-if="admin.groupAdmin != true" filterable>
              <el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"
                         :value="item.groupId">
              </el-option>
            </el-select>
            <span v-else>{{admin.groupName}}</span>
          </el-form-item>
          <el-form-item label="设置岗位" align="left" required>
            <el-select v-model="role" placeholder="请选择岗位" v-if="admin.groupAdmin != true" filterable>
              <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId"
                         v-show="item.roleId.length != 1">
              </el-option>
            </el-select>
            <span v-else>{{admin.roleNameList[0]}}</span>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="cancelSubmit()">取消</el-button>
          <el-button type="primary" @click="onSubmit('admin',addUserTitle)">确认</el-button>
        </div>
      </el-dialog>
      <!--修改密码-->
      <el-dialog title="修改密码" :visible.sync="modifyPswVisible" :width="dialogWidth">
        <el-form ref="modify" :model="modify" label-width="100px" :rules="rules1" labelPosition="right">
          <el-form-item label="管理员密码" required>
            <el-input v-model="modify.adminPsw" placeholder="请输入管理员密码" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPsw">
            <el-input v-model="modify.newPsw" placeholder="6-18位英文字母、数字、下划线"
                      :maxlength="18" :minlength="6" type="password"></el-input>
          </el-form-item>
          <el-form-item label="密码确认" prop="newPsw1">
            <el-input v-model="modify.newPsw1" placeholder="请再次输入新密码"
                      :maxlength="18" :minlength="6" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="modifyPswVisible = false">取消</el-button>
          <el-button type="primary" @click="modifyPsw">确认修改</el-button>
        </div>
      </el-dialog>
      <!--重置密码-->
      <el-dialog title="重置密码" :visible.sync="resetPswVisible" :width="dialogWidth">
        <el-form ref="modify" :model="reset" label-width="100px" labelPosition="right">
          <el-form-item label="管理员密码" required>
            <el-input v-model="reset.adminPsw" placeholder="请输入管理员密码" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="resetPswVisible = false">取消</el-button>
          <el-button type="primary" @click="resetPsw">确认重置</el-button>
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
      let nameValidate = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('帐号不能小于6位'));
        } else if (value.length > 18) {
          callback(new Error('帐号不能大于18位'));
        } else if (noValidator(value)) {
          callback(new Error("帐号由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      let nickValidate = (rule, value, callback) => {
        if (value.length < 2) {
          callback(new Error('用户名不能小于2位'));
        } else if (value.length > 16) {
          callback(new Error('用户名不能大于16位'));
        } else if (!nameValidator(value)) {
          callback(new Error("用户名由汉字、英文字母组成"));
        } else {
          callback();
        }
      };
      let pswValidate = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码不能小于6位'));
        } else if (value.length > 18) {
          callback(new Error('密码不能大于18位'));
        } else if (!pswValidator(value)) {
          callback(new Error("密码由英文字母、数字以及~!@#$%^&*=+/-组成"));
        } else {
          callback();
        }
      };
      return {
        listLoading: false,
        addUserVisible: false,
        modifyUserVisible: false,
        modifyPswVisible: false,
        resetPswVisible: false,
        addUserTitle: '添加成员',
        dialogWidth: isPC() ? '35%' : '90%',
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
        admin: {
          account: '', realName: '', password: '12345678', roleList: [],
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        },
        rules: {
          account: [
            {required: true, message: '请输入账号', trigger: 'blur'}, {validator: nameValidate, trigger: "change,blur"}],
          realName: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {validator: nickValidate, trigger: "change,blur"},
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"},
          ],
          groupId: [{required: true, message: '请选择组织', trigger: 'blur'}]
        },
        rules1: {
          newPsw: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"},
          ],
          newPsw1: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"},
          ]
        },
        count: 0,
        query: {page: 1, size: 10, myGroupId: JSON.parse(sessionStorage.getItem("user")).groupId},
        users: [],
        setPsw: 'defaultPsw',
        role: '',
        roles: [],
        organizations: [],
        modify: {adminPsw: '', newPsw: '', newPsw1: ''},
        reset: {adminPsw: ''}
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //是否默认密码
      changePsw(val) {
        if (val === 'newPsw') {//自定义密码
          this.admin.password = '';
        } else {//默认密码12345678
          this.admin.password = '12345678';
        }
      },
      addInfo() {
        this.admin = {
          account: '', realName: '', password: '12345678', roleList: [],
          groupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.setPsw = 'defaultPsw';
        this.role = '';
        this.addUserVisible = true;
        this.addUserTitle = '添加成员';
      },
      updateInfo(row) {
        this.admin = Object.assign({}, row);
        this.modifyUserVisible = true;
        this.addUserTitle = '修改成员';
        this.role = this.admin.roleList[0];
      },
      cancelSubmit() {
        this.role = '';
        this.addUserVisible = false;
        this.modifyUserVisible = false;
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column, cellValue) {
        if (column.property == 'locked') {
          return row[column.property] == 0 ? '正常' : row[column.property] == 1 ? '停用' : '--';
        } else if (column.property == 'roleNameList') {
          return row[column.property] ? row[column.property][0] : '--';
        } else if (column.property == 'groupAdmin') {
          return row[column.property] == true ? '管理员' : '普通';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //账号启用/停用
      userUse(user) {
        let param = {userId: user.userId};
        let msg = '确定要启用该成员？';
        if (user.locked == 0) {
          param.locked = 1;
          msg = '确定要停用该成员？'
        } else {
          param.locked = 0;
        }
        this.$confirm(msg, '提示', {type: 'warning'}).then(() => {
          this.$post('/manager/user/update', param, '操作成功').then((data) => {
            this.getUserList();
          });
        }).catch((err) => {
        });
      },
      //重置密码
      resetPsw() {
        if (!this.reset.adminPsw) {
          this.$message.error('请输入管理员密码');
          return;
        }
        this.$post("/manager/user/updatePwdByAdmin", {
          creatorId: this.admin.creatorId,
          userId: this.admin.userId,
          newPwd: md5('12345678'),
          createIdPwd: md5(this.reset.adminPsw)
        }, '密码重置成功！新密码为：12345678').then(() => {
          this.resetPswVisible = false;
        });
      },
      //修改密码
      modifyPsw() {
        this.$refs['modify'].validate((valid) => {
          if (valid) {
            if (this.modify.newPsw !== this.modify.newPsw1) {
              this.$message.error('2次密码输入不一致，请重新输入');
              return;
            }

            this.$post("/manager/user/updatePwdByAdmin", {
              creatorId: this.admin.creatorId, userId: this.admin.userId,
              newPwd: md5(this.modify.newPsw), createIdPwd: md5(this.modify.adminPsw)
            }, '密码修改成功').then(() => {
              this.modifyPswVisible = false
            });
          }
        });
      },
      getUserList() {
        this.listLoading = true;
        this.$post("/manager/user/query", this.query).then((data) => {
          this.users = data.data.content;
          this.count = data.data.totalElements;
          setTimeout(() => {
            this.listLoading = false
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.users = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getUserList();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getUserList();
      },
      clearData() {
        this.query = {page: 1, size: 10, myGroupId: JSON.parse(sessionStorage.getItem("user")).groupId};
        this.getUserList();
      },
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (!this.role) {
              this.$message.error('请选择岗位');
              return;
            }

            let url = '/manager/user/create';
            let msg = '添加成功';
            if (title === '修改成员') {
              url = '/manager/user/update';
              msg = '修改成功';
            } else {
              this.admin.creatorId = this.userId;
              this.admin.locked = 0;
              this.admin.password = md5(this.admin.password);
            }
            this.admin.roleList = [];
            this.admin.roleList.push(this.role);
            this.$post(url, this.admin, msg).then((data) => {
              if ("000000" === data.code) {
                this.addUserVisible = false;
                this.modifyUserVisible = false;
                this.getUserList();
              }
            });
          }
        })
      },
      //获取角色列表
      getRoles() {
        this.$post('/manager/role/query', {
          page: 1, size: 9999, state: 0, creatorGroupId: JSON.parse(sessionStorage.getItem("user")).groupId
        }).then((data) => {
          this.roles = data.data.content;
        })
      },
      //获取组织列表
      getOrganizations() {
        this.$post('/manager/group/query', {page: 1, size: 9999, userId: this.userId}).then((data) => {
          this.organizations = data.data.content;
        });
      }
    },
    mounted() {
      this.getOrganizations();
      this.getRoles();
      this.getUserList();
    }
  }
</script>
