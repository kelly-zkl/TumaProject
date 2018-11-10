<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left" style="margin-top: 0;text-align: left">
        <el-row>
          <el-col :span="20" align="left" v-show="getButtonVial('manager:role:query')" style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="角色名称" v-model="query.roleName" :maxlength="30" size="medium"
                        style="width: 200px"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.roleType" placeholder="类型" size="medium" filterable
                         style="width: 160px" clearable>
                <el-option v-for="item in roleTypes" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" icon="search" @click.stop="query.page=1;getRoles()" size="medium">搜索</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button @click.stop="clearData()" size="medium">重置</el-button>
            </el-form-item>
          </el-col>
          <el-col :span="4" align="right" style="text-align: right">
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" icon="el-icon-plus" @click="addrole()" size="medium"
                         v-show="getButtonVial('manager:role:create')">创建角色
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="roles" v-loading="listLoading" class="center-block" stripe>
        <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
        <el-table-column align="left" prop="roleName" label="角色名称" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="remark" label="备注" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="roleType" label="类型" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="state" label="状态" min-width="150"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="roleInfo(scope.row)" v-show="getButtonVial('manager:role:detail:*')">查看
            </el-button>
            <el-button v-show="getButtonVial('manager:role:update') && scope.row.roleId!=1"
                       type="text" @click="modifyrole(scope.row)">修改
            </el-button>
            <el-button @click="deleterole(scope.row.roleId)" type="text"
                       v-show="getButtonVial('manager:role:delete:*') && scope.row.roleType==1">删除
            </el-button>
            <el-button type="text" @click="userole(scope.row)"
                       v-show="getButtonVial('manager:role:update') && scope.row.roleType==1">
              {{scope.row.state == 0 ? '停用' : '启用'}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--添加/修改角色-->
      <el-dialog :title="addroleTitle" :visible.sync="addroleVisible" :width="dialogWidth">
        <el-form ref="role" :model="role" :label-width="labelWidth" :rules="rules" labelPosition="right">
          <el-form-item label="角色名称" prop="roleName" align="left">
            <el-input v-model="role.roleName" placeholder="请输入角色名称" v-if="isShow" :maxlength="16"></el-input>
            <span v-else>{{role.roleName}}</span>
          </el-form-item>
          <el-form-item label="备注" align="left">
            <el-input v-model="role.remark" placeholder="备注信息" type="textarea" v-if="isShow" :maxlength="50"></el-input>
            <span v-else>{{role.remark}}</span>
          </el-form-item>
          <el-form-item label="功能权限" align="left" required>
            <el-tree :data="permissions" show-checkbox node-key="permissionId" :props="defaultProps" ref="tree"
                     default-expand-all check-strictly :default-checked-keys="role.permissions"></el-tree>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px" v-show="isShow">
          <el-button @click="cancelSubmit(addroleTitle)">取消</el-button>
          <el-button type="primary" @click="onSubmit('role',addroleTitle)">确认</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {pswValidator, nameValidator, noValidator} from '../../assets/js/api';
  import {formatDate, isPC, buttonValidator} from "../../assets/js/util";

  export default {
    data() {
      let nickValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9\u4e00-\u9fa5]{2,16}$/.test(value)) {
          callback(new Error("请输入正确的角色名称，由2-16位汉字、数字、英文字母组成"));
        } else {
          callback();
        }
      };
      return {
        listLoading: false,
        addroleVisible: false,
        isShow: false,
        dialogWidth: isPC() ? '40%' : '90%',
        labelWidth: isPC() ? '120px' : '80px',
        query: {
          page: 1, size: 10, roleName: '', roleType: '', lastNode: true,
          creatorGroupId: JSON.parse(sessionStorage.getItem("user")).groupId
        },
        count: 0,
        roleTypes: [{value: '', label: '全部类型'}, {value: 0, label: '通用'}, {value: 1, label: '自定义'}],
        roles: [],
        addroleTitle: '创建角色',
        role: {},
        rules: {
          roleName: [
            {required: true, message: '请输入角色名称', trigger: 'blur'}, {validator: nickValidator, trigger: "change,blur"}
          ]
        },
        permissions: [],
        defaultProps: {children: 'childs', label: 'name'}
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //创建角色
      addrole() {
        this.role = {};
        this.addroleTitle = '创建角色';
        this.isShow = true;
        this.addroleVisible = true;
        this.$refs.tree.setCheckedKeys([]);
      },
      //修改角色
      modifyrole(row) {
        this.role = Object.assign({}, row);
        this.addroleTitle = '修改角色';
        this.isShow = true;
        this.addroleVisible = true;
        this.$refs.tree.setCheckedKeys(this.role.permissions);
      },
      //查看角色
      roleInfo(row) {
        this.role = Object.assign({}, row);
        this.addroleTitle = '角色信息';
        this.isShow = false;
        this.addroleVisible = true;
        this.$refs.tree.setCheckedKeys(this.role.permissions);
      },
      //取消
      cancelSubmit(title) {
        this.addroleVisible = false;
      },
      //确认提交
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.role.permissions = this.$refs.tree.getCheckedKeys();
            if (this.role.permissions.length === 0) {
              this.$message.error('请选择功能权限');
              return;
            }
            let url = '/manager/role/create';
            let msg = '创建成功';
            if (title === '修改角色') {
              url = '/manager/role/update';
              msg = '修改成功';
            } else {
              this.role.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
              this.role.creatorGroupId = JSON.parse(sessionStorage.getItem("user")).groupId;
              this.role.state = '0';
              this.role.roleType = 1;
            }
            this.$post(url, this.role, msg).then((data) => {
              this.$refs.tree.setCheckedKeys([]);
              if ("000000" === data.code) {
                this.addroleVisible = false;
                this.getRoles();
              } else {
                this.$message.error(data.msg);
              }
            });
          }
        });
      },
      //删除角色
      deleterole(id) {
        this.$confirm('确定要删除该角色？', '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('/manager/role/delete/' + id, {}, '删除成功').then((data) => {
            this.getRoles();
          });
        }).catch((err) => {
        });
      },
      //启用/停用角色
      userole(role) {
        let param = {roleId: role.roleId};
        let msg = '确定要启用该角色？';
        if (role.state == 0) {
          param.state = 1;
          msg = '确定要停用该角色？'
        } else {
          param.state = 0;
        }
        this.$confirm(msg, '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('/manager/role/update', param, '操作成功').then((data) => {
            this.getRoles();
          });
        }).catch((err) => {
        });
      },
      //获取角色列表
      getRoles() {
        this.listLoading = true;
        this.$post('/manager/role/query', this.query).then((data) => {
          this.roles = data.data.content;
          this.count = data.data.totalElements;
          setTimeout(() => {
            this.listLoading = false;
          }, 500);
        }).catch((err) => {
          this.listLoading = false;
          this.roles = [];
          this.$message.error(err);
        });
      },
      pageChange(index) {
        this.query.page = index;
        this.getRoles();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getRoles();
      },
      clearData() {
        this.query = {
          page: 1, size: 10, roleName: '', roleType: '', lastNode: true,
          creatorGroupId: JSON.parse(sessionStorage.getItem("user")).groupId
        };
        this.getRoles();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property == 'state') {
          return row[column.property] == 0 ? '正常' : row[column.property] == 1 ? '禁用' : '--';
        } else if (column.property == 'roleType') {
          return row[column.property] == 0 ? '通用' : row[column.property] == 1 ? '自定义' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取菜单树
      getMenuTree() {
        this.$post('/manager/permission/menuTree/' + JSON.parse(sessionStorage.getItem("user")).userId + '/3', {}).then((data) => {
          this.permissions = data.data;
        });
      }
    },
    mounted() {
      this.getMenuTree();
      this.getRoles();
    }
  }
</script>
