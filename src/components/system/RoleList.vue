<template>
  <div>
    <section class="content">
      <el-form :inline="true" :model="query" align="left" style="margin-top: 0;text-align: left">
        <el-row>
          <el-col :span="20" align="left" style="text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="岗位名称" v-model="query.roleName" :maxlength="30" size="medium"
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
              <el-button type="primary" @click="addrole()" size="medium"
                         v-show="getButtonVial('manager:role:create')">创建岗位
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table :data="roles" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
        <el-table-column align="left" prop="roleName" label="岗位名称" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="remark" label="备注" min-width="150"
                         max-width="300" :formatter="formatterAddress" show-overflow-tooltip></el-table-column>
        <el-table-column align="left" prop="roleType" label="类型" min-width="150"
                         max-width="250" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="state" label="状态" min-width="150" max-width="250">
          <template slot-scope="scope">
            <span style="color:#00C755" v-show="scope.row.state == 0">正常</span>
            <span style="color:#999" v-show="scope.row.state == 1">禁用</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="操作" min-width="150" max-width="250" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="roleInfo(scope.row)">查看</el-button>
            <el-button v-show="getButtonVial('manager:role:update') && scope.row.roleId!=1"
                       type="text" @click="modifyrole(scope.row)">修改
            </el-button>
            <el-button @click="deleterole(scope.row.roleId)" type="text"
                       v-show="getButtonVial('manager:role:delete') && scope.row.roleType==1">删除
            </el-button>
            <el-button type="text" @click="userole(scope.row)"
                       v-show="getButtonVial('manager:role:update') && scope.row.roleType==1">
              {{scope.row.state == 0 ? '停用' : '启用'}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top:10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--添加/修改岗位-->
      <el-dialog :title="addroleTitle" :visible.sync="addroleVisible" :width="dialogWidth">
        <el-form ref="role" :model="role" :label-width="labelWidth" :rules="rules" labelPosition="right">
          <el-form-item label="岗位名称" prop="roleName" align="left" style="text-align: left">
            <el-input v-model="role.roleName" placeholder="请输入岗位名称" v-if="isShow" :maxlength="16"></el-input>
            <span v-else>{{role.roleName}}</span>
          </el-form-item>
          <el-form-item label="备注" align="left" style="text-align: left">
            <el-input v-model="role.remark" placeholder="备注信息" type="textarea" v-if="isShow" :maxlength="50"></el-input>
            <span v-else>{{role.remark}}</span>
          </el-form-item>
          <el-form-item label="功能权限" align="left" required style="text-align: left">
            <el-tree :data="permissions" show-checkbox node-key="permissionId" :props="defaultProps" ref="tree"
                     :default-expand-all="false" :default-checked-keys="role.permissions"></el-tree>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px" v-show="isShow">
          <el-button @click="cancelSubmit(addroleTitle)">取消</el-button>
          <el-button type="primary" @click="onSubmit('role',addroleTitle)" :disabled="listLoading">确认</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {pswValidator, nameValidator, noValidator} from '../../assets/js/api';
  import {formatDate, isPC, buttonValidator, encryData, decryData} from "../../assets/js/util";

  export default {
    data() {
      let nickValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9\u4e00-\u9fa5]{2,16}$/.test(value)) {
          callback(new Error("请输入正确的岗位名称，由2-16位汉字、数字、英文字母组成"));
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
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        user: JSON.parse(decryData(sessionStorage.getItem("user"))),
        query: {
          page: 1, size: 10, roleName: '', roleType: '', lastNode: true,
          creatorGroupId: JSON.parse(decryData(sessionStorage.getItem("user"))).groupId
        },
        count: 0,
        roleTypes: [{value: '', label: '全部类型'}, {value: 0, label: '通用'}, {value: 1, label: '自定义'}],
        roles: [],
        addroleTitle: '创建岗位',
        role: {},
        rules: {
          roleName: [
            {required: true, message: '请输入岗位名称', trigger: 'blur'}, {validator: nickValidator, trigger: "change,blur"}
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
      //创建岗位
      addrole() {
        this.role = {};
        this.addroleTitle = '创建岗位';
        this.isShow = true;
        this.listLoading = false;
        this.addroleVisible = true;
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys([]);
        });
      },
      //修改岗位
      modifyrole(row) {
        this.role = Object.assign({}, row);
        this.role.permissions = Object.assign([], this.role.permissions);
        this.getRolePermissions();
        this.addroleTitle = '修改岗位';
        this.isShow = true;
        this.listLoading = false;
        this.addroleVisible = true;
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(this.role.permissions);
        });
      },
      //查看岗位
      roleInfo(row) {
        this.role = Object.assign({}, row);
        this.role.permissions = Object.assign([], this.role.permissions);
        this.getRolePermissions();
        this.addroleTitle = '岗位信息';
        this.isShow = false;
        this.addroleVisible = true;
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(this.role.permissions);
        });
      },
      //取消
      cancelSubmit(title) {
        this.addroleVisible = false;
      },
      //确认提交
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.role.permissions = Object.assign([], this.$refs.tree.getCheckedKeys());
            if (this.role.permissions.length === 0) {
              this.$message.error('请选择功能权限');
              return;
            }
            let url = '/manager/role/create';
            let msg = '创建成功';
            if (title === '修改岗位') {
              url = '/manager/role/update';
              msg = '修改成功';
            } else {
              this.role.creatorId = this.user.userId;
              this.role.creatorGroupId = this.user.groupId;
              this.role.state = '0';
              this.role.roleType = 1;
            }
            this.getSavePermissions();
            this.listLoading = true;
            this.$post(url, this.role, msg).then((data) => {
              this.$nextTick(() => {
                this.$refs.tree.setCheckedKeys([]);
              });
              this.listLoading = false;
              this.addroleVisible = false;
              if ("000000" === data.code) {
                this.getRoles();
              } else {
                this.$message.error(data.msg);
              }
            });
          }
        });
      },
      //子菜单选中时，要把父菜单选上（在岗位权限中遍历有没有包含某个权限）
      getSavePermissions() {
        for (var i = 0; i < this.permissions.length; i++) {//目录
          var tree = this.permissions[i];
          if (tree.childs) {//目录有菜单
            for (var j = 0; j < tree.childs.length; j++) {//菜单
              var menu = tree.childs[j];
              if (menu.childs) {//菜单有按钮
                for (var z = 0; z < menu.childs.length; z++) {//按钮
                  var button = menu.childs[z];
                  for (var m = 0; m < this.role.permissions.length; m++) {//遍历岗位权限
                    var id = this.role.permissions[m];
                    if (button.permissionId == id) {//含有按钮权限,则加上父菜单id
                      if (this.mulitData(menu.permissionId)) {//去重加上菜单id
                        this.role.permissions.push(menu.permissionId);
                      }
                      if (this.mulitData(tree.permissionId)) {//去重加上目录id
                        this.role.permissions.push(tree.permissionId);
                      }
                      break;
                    }
                  }
                }
              } else {//菜单下没有按钮
                for (var n = 0; n < this.role.permissions.length; n++) {//遍历岗位权限
                  var sid = this.role.permissions[n];
                  if (menu.permissionId == sid) {//含有菜单权限,则加上父菜单id
                    if (this.mulitData(tree.permissionId)) {//去重加上目录id
                      this.role.permissions.push(tree.permissionId);
                    }
                    break;
                  }
                }
              }
            }
          }
        }
      },
      //子菜单没有选中时，把父菜单的id删掉（在岗位权限中遍历有没有包含某个权限）
      getRolePermissions() {
        for (var i = 0; i < this.permissions.length; i++) {//目录
          var tree = this.permissions[i];
          if (tree.childs) {//目录有菜单
            for (var j = 0; j < tree.childs.length; j++) {//菜单
              var menu = tree.childs[j];
              if (menu.childs) {//菜单有按钮
                for (var z = 0; z < menu.childs.length; z++) {//按钮
                  var button = menu.childs[z];
                  var isSelect = false;
                  for (var m = 0; m < this.role.permissions.length; m++) {//遍历岗位权限
                    var id = this.role.permissions[m];
                    if (button.permissionId == id) {//岗位包含该权限
                      isSelect = true;
                      break;
                    }
                  }
                  if (!isSelect) {//岗位不包含该权限，则删除父节点id
                    var mIdx = this.role.permissions.indexOf(menu.permissionId);
                    if (mIdx >= 0) {//删除菜单id
                      this.role.permissions.splice(mIdx, 1);
                    }
                    var bIdx = this.role.permissions.indexOf(tree.permissionId);
                    if (bIdx >= 0) {//删除目录id
                      this.role.permissions.splice(bIdx, 1);
                    }
                    break;
                  }
                }
              } else {//菜单下没有按钮
                var isSelect2 = false;
                for (var n = 0; n < this.role.permissions.length; n++) {//遍历岗位权限
                  var sid = this.role.permissions[n];
                  if (menu.permissionId == sid) {//岗位包含该权限
                    isSelect2 = true;
                    break;
                  }
                }
                if (!isSelect2) {//岗位不包含该权限，则删除父节点id
                  var tIdx = this.role.permissions.indexOf(tree.permissionId);
                  if (tIdx >= 0) {
                    this.role.permissions.splice(tIdx, 1);
                  }
                  break;
                }
              }
            }
          }
        }
      },
      //重复的id
      mulitData(permissionId) {
        var isMulti = true;
        this.role.permissions.forEach((id) => {
          if (permissionId == id) {
            isMulti = false;
          }
        });
        return isMulti;
      },
      //删除岗位
      deleterole(id) {
        this.$confirm('确定要删除该岗位？', '提示', {
          type: 'warning'
        }).then(() => {
          this.$post('/manager/role/delete/' + id, {}, '删除成功').then((data) => {
            this.getRoles();
          });
        }).catch((err) => {
        });
      },
      //启用/停用岗位
      userole(role) {
        let param = {roleId: role.roleId};
        let msg = '确定要启用该岗位？';
        if (role.state == 0) {
          param.state = 1;
          msg = '确定要停用该岗位？'
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
      //获取岗位列表
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
          page: 1, size: 10, roleName: '', roleType: '', lastNode: true, creatorGroupId: this.user.groupId
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
        this.$post('/manager/permission/menuTree/' + this.user.userId + '/3', {}).then((data) => {
          this.permissions = data.data;
        });
      }
    },
    mounted() {
      this.user = JSON.parse(decryData(sessionStorage.getItem("user")));
      this.getMenuTree();
      this.getRoles();
    }
  }
</script>
