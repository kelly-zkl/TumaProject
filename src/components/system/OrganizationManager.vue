<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="18" align="left" v-show="getButtonVial('manager:group:query')" style="text-align: left">
          <el-form :inline="true" :model="query" align="left" style="margin-top: 0;text-align: left">
            <el-form-item style="margin-bottom: 10px">
              <el-input placeholder="组织名称" v-model="query.groupName" :maxlength="20"
                        size="medium" style="width: 160px"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.relateAreas" multiple placeholder="管辖区域" collapse-tags filterable size="medium">
                <el-option v-for="item in provinceList" :key="item.areaCode" :label="item.areaName"
                           :value="item.areaCode">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.pgroupId" placeholder="所属组织" size="medium" filterable style="width: 170px">
                <el-option v-for="item in groups" :key="item.groupId" :label="item.groupName" :value="item.groupId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="text" size="medium" @click="showMore()">{{isMore?'收起条件':'更多条件'}}</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button type="primary" icon="search" @click.stop="query.page=1;getOrganizations()" size="medium">搜索
              </el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-button @click.stop="clearData()" size="medium">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px" v-show="isMore">
              <el-select v-model="query.type" placeholder="组织类型" size="medium" filterable style="width: 160px">
                <el-option label="公安机关" :value="0"></el-option>
                <el-option label="派出所" :value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="6" align="right" style="text-align: right">
          <el-button type="primary" v-show="getButtonVial('manager:group:create')&&groupState==0"
                     size="medium" @click="addOrganization()">创建公安机关
          </el-button>
          <el-button type="primary" v-show="getButtonVial('manager:group:create')&&groupState==1"
                     size="medium" @click="addPolice()">创建派出所
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="organizations" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
        <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
        <el-table-column align="left" prop="groupName" label="组织名称" min-width="130"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="type" label="组织类型" min-width="100"
                         max-width="150" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="areaCodes" label="管辖区域" min-width="180"
                         max-width="300" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="pgroupName" label="上级组织" min-width="130"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <!--<el-table-column align="left" prop="remark" label="备注" min-width="150"-->
        <!--max-width="300" :formatter="formatterAddress"></el-table-column>-->
        <el-table-column align="left" prop="createTime" label="创建时间" min-width="160"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" prop="account" label="组织管理员" min-width="130"
                         max-width="200" :formatter="formatterAddress"></el-table-column>
        <el-table-column align="left" label="操作" min-width="120" max-width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click.stop="modifyOrganization(scope.row)"
                       v-show="getButtonVial('manager:group:update') && scope.row.groupId.length > 3
                                && groupId != scope.row.groupId&&userId==scope.row.creatorId">修改
            </el-button>
            <el-button @click="deleteOrganization(scope.row.groupId)" type="text"
                       v-show="getButtonVial('manager:group:delete:*') && scope.row.groupId.length > 3
                                && groupId!=scope.row.groupId&&userId==scope.row.creatorId">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top:10px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--创建/修改公安机关-->
      <el-dialog :title="addOrganizationTitle" :visible.sync="addOrganizationVisible" :width="dialogWidth">
        <el-form ref="group" :model="group" label-width="120px" labelPosition="right" :rules="rules">
          <el-form-item label="公安机关名称" prop="groupName" align="left">
            <el-input v-model="group.groupName" placeholder="请输入公安机关名称" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="管辖区域" align="left" prop="areaCodes">
            <el-select v-model="group.areaCodes" multiple placeholder="请选择" collapse-tags filterable>
              <el-option v-for="item in provinceList" :key="item.areaCode" :label="item.areaName"
                         :value="item.areaCode">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="组织管理员" align="left" required>
            <el-radio-group v-model="group.isCreateAdmin" v-show="isShow">
              <el-radio :label="1">注册新用户</el-radio>
              <el-radio :label="0">选择已注册的用户</el-radio>
            </el-radio-group>
            <span v-show="!isShow">{{group.account?group.account:'--'}}</span>
          </el-form-item>
          <el-form-item label="选择用户" align="left" v-show="group.isCreateAdmin==0&&isShow">
            <el-select v-model="group.adminId" placeholder="请选择用户" filterable>
              <el-option v-for="item in users" :key="item.userId" :label="item.account" :value="item.userId"
                         v-show="item.groupAdmin != true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="账号" align="left" v-show="group.isCreateAdmin==1&&isShow">
            <el-input v-model="group.adminAccount" placeholder="6-16位英文字母、数字、下划线" :maxlength="16"
                      :minlength="6"></el-input>
          </el-form-item>
          <el-form-item label="密码" align="left" v-show="group.isCreateAdmin==1&&isShow">
            <el-input v-model="group.adminPsw" placeholder="6-16位英文字母、数字、下划线"
                      :maxlength="16" :minlength="6" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="addOrganizationVisible = false" size="medium">取消</el-button>
          <el-button type="primary" @click="onSubmit('group',addOrganizationTitle)" size="medium"
                     :disabled="listLoading">确认
          </el-button>
        </div>
      </el-dialog>
      <!--创建/修改派出所-->
      <el-dialog :title="addPoliceTitle" :visible.sync="addPoliceVisible" :width="dialogWidth">
        <el-form ref="police" :model="police" label-width="100px" labelPosition="right" :rules="rules1">
          <el-form-item label="派出所名称" prop="groupName" align="left">
            <el-input v-model="police.groupName" placeholder="请输入派出所名称" :maxlength="20" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="所属组织" align="left">
            <span>{{police.pgroupName?police.pgroupName:groupName}}</span>
          </el-form-item>
          <el-form-item label="组织管理员" align="left" required>
            <el-radio-group v-model="police.isCreateAdmin" v-show="isShow">
              <el-radio :label="1">注册新用户</el-radio>
              <el-radio :label="0">选择已注册的用户</el-radio>
            </el-radio-group>
            <span v-show="!isShow">{{police.account?police.account:'--'}}</span>
          </el-form-item>
          <el-form-item label="选择用户" align="left" v-show="police.isCreateAdmin==0&&isShow">
            <el-select v-model="police.adminId" placeholder="请选择用户" filterable>
              <el-option v-for="item in users" :key="item.userId" :label="item.account" :value="item.userId"
                         v-show="item.groupAdmin != true">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="账号" align="left" v-show="police.isCreateAdmin==1&&isShow">
            <el-input v-model="police.adminAccount" placeholder="6-16位英文字母、数字、下划线" :maxlength="16"
                      :minlength="6"></el-input>
          </el-form-item>
          <el-form-item label="密码" align="left" v-show="police.isCreateAdmin==1&&isShow">
            <el-input v-model="police.adminPsw" placeholder="6-16位英文字母、数字、下划线" :maxlength="16"
                      :minlength="6" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="addPoliceVisible=false" size="medium">取消</el-button>
          <el-button type="primary" @click="savePolice()" size="medium" :disabled="listLoading">确认</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import md5 from 'js-md5';
  import {pswValidator, nameValidator, noValidator} from '../../assets/js/api';
  import {isPC, buttonValidator, getAreaLable} from "../../assets/js/util";

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
        isMore: false,
        addAdminVisible: false,
        tableHeight: window.innerHeight - 232,
        provinceList: JSON.parse(localStorage.getItem("areas")),
        organizations: [],
        addPoliceTitle: '创建派出所',
        addPoliceVisible: false,
        dialogWidth: isPC ? '40%' : '90%',
        groupId: JSON.parse(sessionStorage.getItem("user")).groupId,
        userId: JSON.parse(sessionStorage.getItem("user")).userId,
        groupName: '--',
        query: {page: 1, size: 10, userId: JSON.parse(sessionStorage.getItem("user")).userId, relateAreas: []},
        count: 0,
        groupState: '',
        group: {areaCodes: [], isCreateAdmin: 0},
        police: {isCreateAdmin: 0},
        addOrganizationTitle: '创建公安机关',
        addOrganizationVisible: false,
        rules: {
          groupName: [
            {required: true, message: '请输入公安机关名称', trigger: 'blur'},
            {validator: nickValidate, trigger: "change,blur"}
          ],
          areaCodes: [{required: true, message: '请选择管辖区域', trigger: 'blur'}]
        },
        rules1: {
          groupName: [
            {required: true, message: '请输入派出所名称', trigger: 'blur'},
            {validator: nickValidate, trigger: "change,blur"}
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
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = window.innerHeight - 282
        } else {
          this.tableHeight = window.innerHeight - 232
        }
      },
      addPolice() {
        this.police = {isCreateAdmin: 0};
        this.addPoliceTitle = '创建派出所';
        this.listLoading = false;
        this.isShow = true;
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
              if (this.police.isCreateAdmin == 0) {//选择已有
                if (!this.police.adminId) {
                  this.$message.error('请选择组织管理员');
                  return;
                }
              } else {//新建管理员
                if (noValidator(this.police.adminAccount)) {
                  this.$message.error('请输入正确的账号');
                  return;
                }
                if (!pswValidator(this.police.adminPsw)) {
                  this.$message.error('请输入正确的密码');
                  return;
                }
                this.police.adminPsw = md5(this.police.adminPsw);
              }
              this.police.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
              this.police.pgroupId = this.groupId;
              this.police.type = 1;//0：公安机关，1：派出所
            }

            this.listLoading = true;
            this.$post(url, this.police, msg).then((data) => {
              if ("000000" === data.code) {
                this.listLoading = false;
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
              if (this.group.isCreateAdmin == 0) {//选择已有
                if (!this.group.adminId) {
                  this.$message.error('请选择组织管理员');
                  return;
                }
              } else {//新建管理员
                if (!this.group.adminAccount) {
                  this.$message.error('请输入账号');
                  return;
                }
                if (!(/^[A-Za-z0-9-_]+$/.test(this.group.adminAccount))) {
                  this.$message.error('请输入正确的账号');
                  return;
                }
                if (!this.group.adminPsw) {
                  this.$message.error('请输入密码');
                  return;
                }
                if (!pswValidator(this.group.adminPsw)) {
                  this.$message.error('请输入正确的密码');
                  return;
                }
                this.group.adminPsw = md5(this.group.adminPsw);
              }
              this.group.creatorId = JSON.parse(sessionStorage.getItem("user")).userId;
              this.group.pgroupId = this.groupId;
              this.group.type = 0;//0：公安机关，1：派出所
            }

            this.listLoading = true;
            this.$post(url, this.group, msg).then((data) => {
              if ("000000" === data.code) {
                this.listLoading = false;
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
        this.group = {areaCodes: [], isCreateAdmin: 0};
        this.addOrganizationTitle = '创建公安机关';
        this.isShow = true;
        this.listLoading = false;
        this.addOrganizationVisible = true;
      },
      //修改组织
      modifyOrganization(row) {
        this.listLoading = false;
        this.isShow = false;
        if (row.type == 0) {
          this.group = Object.assign({}, row);
          this.addOrganizationTitle = '修改公安机关';
          this.addOrganizationVisible = true;
        } else {
          this.police = Object.assign({}, row);
          this.addPoliceTitle = '修改派出所';
          this.addPoliceVisible = true;
        }
      },
      //删除组织
      deleteOrganization(id) {
        this.$confirm('删除组织将会清空该组织相关的用户、角色及其子组织的所有数据，请谨慎操作！', '提示', {
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
        this.query = {page: 1, size: 10, userId: JSON.parse(sessionStorage.getItem("user")).userId, relateAreas: []};
        this.getOrganizations();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property == 'type') {
          return row[column.property] == 0 ? '公安机关' : row[column.property] == 1 ? '派出所' : '--';
        } else if (column.property == 'areaCodes') {
          let arr = [];
          if (row.areaCodes) {
            row.areaCodes.forEach((item) => {
              arr.push(getAreaLable(item));
            });
          }
          let str = arr.length > 0 ? arr.join('、') : '--';
          return str.indexOf('、') == 0 ? str.substring(1, str.length) : str;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取当前用户的管辖区域
      getAreas() {
        this.$post("/manager/area/querysubs", {
          parentCodes: JSON.parse(sessionStorage.getItem("user")).authorizeAreaCodes
        }).then((data) => {
          this.provinceList = data.data;
        });
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
      getGroupName(groupId) {
        let str = '';
        this.groups.forEach((item) => {
          if (item.groupId == groupId) {
            str = item.groupName
          }
        });
        return str;
      },
      //获取全部组织列表
      getAllGroups() {
        this.$post('/manager/group/query', {
          page: 1, size: 9999,
          userId: JSON.parse(sessionStorage.getItem("user")).userId
        }).then((data) => {
          this.groups = data.data.content;
          this.groupName = this.getGroupName(JSON.parse(sessionStorage.getItem("user")).groupId);
        }).catch((err) => {
          this.groups = [];
        });
      }
    },
    mounted() {
      this.groupState = JSON.parse(sessionStorage.getItem("user")).newGroupState;
      this.getAllGroups();
      this.getUserList();
      this.getAreas();
      this.getOrganizations();
    }
  }
</script>
