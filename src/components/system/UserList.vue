<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="4" style="padding-right: 10px;border-right: 1px solid #e5e5e5">
          <div v-bind:class="currentIdx==-1?'group-name active':'group-name'" @click="handleClick(-1)"
               :title="groupName+'（'+groupMem+'人）'">
            {{groupName+'（'+groupMem+'人）'}}
          </div>
          <div v-bind:style="'overflow-y:auto;height:'+leftHeight+'px'">
            <div class="group" style="color:#999;text-align:center;margin-top: 20px" v-show="departments.length==0">
              暂无部门
            </div>
            <div v-bind:class="currentIdx==idx?'depart-main active':'depart-main'" v-for="(tab,idx) in departments"
                 :key="tab.deptId" @click="handleClick(idx)" v-show="departments.length>0"
                 :title="currentIdx==idx?tab.deptName+'（'+depmMem+'人）':tab.deptName">
              <span class="depart-item">{{currentIdx==idx?tab.deptName+'（'+depmMem+'人）':tab.deptName}}</span>
              <i class="btn-delete el-icon-delete" @click.stop="deleteDepart(tab)"
                 v-show="getButtonVial('manager:dept:delete')"></i>
              <i class="btn-delete el-icon-edit" @click.stop="showDeptDialog(1,idx)"
                 v-show="getButtonVial('manager:dept:update')"></i>
            </div>
          </div>
          <el-button type="primary" icon="el-icon-plus" size="medium" style="width: 100%;margin-top: 10px"
                     @click="showDeptDialog(0)" v-show="getButtonVial('manager:dept:create')">创建部门
          </el-button>
        </el-col>
        <el-col :span="20" style="padding-left: 10px">
          <el-row>
            <el-col :span="20" align="left" style="text-align: left">
              <el-form :inline="true" :model="query" align="left" style="margin-top: 0;text-align: left;width: 900px">
                <el-form-item style="margin-bottom: 10px">
                  <el-input placeholder="账号/姓名" v-model="query.keyword" :maxlength="30"
                            style="width: 200px" size="medium"></el-input>
                </el-form-item>
                <el-form-item style="margin-bottom: 10px">
                  <el-select v-model="query.myGroupId" placeholder="全部公安机关" size="medium" filterable
                             @change="groupChange">
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
                  <el-button type="primary" icon="search" @click.stop="query.page=1;getUserList()" size="medium">搜索
                  </el-button>
                </el-form-item>
                <el-form-item style="margin-bottom: 10px">
                  <el-button @click.stop="clearData()" size="medium">重置</el-button>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="4" align="right" style="text-align: right">
              <el-button type="primary" @click="addInfo()" v-show="getButtonVial('manager:user:create')"
                         size="medium">创建用户
              </el-button>
            </el-col>
          </el-row>
          <el-table :data="users" v-loading="listLoading" class="center-block" stripe :height="tableHeight">
            <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
            <el-table-column align="left" prop="account" label="账号" width="150"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="realName" label="姓名" width="150"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="policeNum" label="身份证号"
                             width="170" :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="deptName" label="所属部门" width="150"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="groupName" label="所属公安机关" width="150"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="roleNameList" label="岗位" width="150"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="loginTime" label="过期时间" width="170"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="groupAdmin" label="用户类型" width="100"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="createTime" label="创建时间" width="180"
                             :formatter="formatterAddress"></el-table-column>
            <el-table-column align="left" prop="locked" label="状态" width="80">
              <template slot-scope="scope">
                <span style="color:#00C755" v-show="scope.row.locked == 0">正常</span>
                <span style="color:#999" v-show="scope.row.locked == 1">禁用</span>
              </template>
            </el-table-column>
            <el-table-column align="left" label="操作" width="120" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" style="margin-right: 10px" @click.stop="updateInfo(scope.row)"
                           v-show="getButtonVial('manager:user:update')&&user.userId!=scope.row.userId">修改
                </el-button>
                <el-button type="text" @click="userUse(scope.row)"
                           v-show="getButtonVial('manager:user:update') && scope.row.groupAdmin != true">
                  {{scope.row.locked == 0 ? '停用' : '启用'}}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="block" style="margin-top:10px" align="right">
            <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                           :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                           layout="total, sizes, prev, pager, next, jumper"></el-pagination>
          </div>
        </el-col>
      </el-row>
      <!--创建用户-->
      <el-dialog :title="addUserTitle" :visible.sync="addUserVisible" :width="dialogWidth">
        <el-form ref="admin" :model="admin" label-width="100px" :rules="rules" labelPosition="right">
          <el-form-item label="姓名" prop="realName" style="text-align: left">
            <el-input v-model="admin.realName" placeholder="请输入姓名" :maxlength="10" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="账号" prop="account" style="text-align: left">
            <el-input v-model="admin.account" placeholder="请输入账号" :maxlength="16" :minlength="6"></el-input>
          </el-form-item>
          <el-form-item label="密码" align="left" required style="text-align: left">
            <el-radio-group v-model="setPsw" @change="changePsw">
              <el-radio :label="'defaultPsw'">使用默认密码12345678</el-radio>
              <el-radio :label="'newPsw'">自定义</el-radio>
            </el-radio-group>
            <el-input v-show="setPsw =='newPsw'" type="password" v-model="admin.password"
                      placeholder="请输入6-16位密码" :maxlength="16" :minlength="6"></el-input>
          </el-form-item>
          <el-form-item label="过期时间" align="left" style="text-align:left">
            <el-date-picker v-model="admin.loginTime" type="datetime" placeholder="选择过期时间"
                            value-format="timestamp" :picker-options="pickerBeginDate" default-time="23:59:59">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="PKI登录" align="left" style="text-align:left">
            <el-checkbox v-model="admin.uLogin">开启PKI登录</el-checkbox>
          </el-form-item>
          <el-form-item label="身份证号" v-show="admin.uLogin==true" align="left" style="text-align: left">
            <el-input v-model="admin.policeNum" placeholder="登记身份证号，即可使用警员PKI登录" :maxlength="18"></el-input>
          </el-form-item>
          <!--<el-form-item label="所属公安机关" align="left" prop="groupId">-->
          <!--<el-select v-model="admin.groupId" placeholder="请选择公安机关" filterable>-->
          <!--<el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"-->
          <!--:value="item.groupId">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--</el-form-item>-->
          <el-form-item label="所属部门" align="left" prop="deptId" style="text-align: left">
            <el-select v-model="admin.deptId" placeholder="请选择部门" filterable>
              <el-option v-for="item in departments" :key="item.deptId" :label="item.deptName"
                         :value="item.deptId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设置岗位" align="left" required style="text-align: left">
            <el-select v-model="role" placeholder="请选择岗位" filterable>
              <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId"
                         v-show="item.roleId.length != 1">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="cancelSubmit()" size="medium">取消</el-button>
          <el-button type="primary" @click="onSubmit('admin',addUserTitle)" size="medium"
                     :disabled="listLoading">确认
          </el-button>
        </div>
      </el-dialog>
      <!--修改账号-->
      <el-dialog :title="addUserTitle" :visible.sync="modifyUserVisible" :width="dialogWidth">
        <el-form ref="admin" :model="admin" label-width="100px" :rules="rules" labelPosition="right">
          <el-form-item label="姓名" prop="realName" style="text-align: left">
            <el-input v-model="admin.realName" placeholder="请输入姓名" :maxlength="10" :minlength="2"></el-input>
          </el-form-item>
          <el-form-item label="账号" prop="loginId" align="left" style="text-align: left">
            <span>{{admin.account}}</span>
          </el-form-item>
          <el-form-item label="密码" style="text-align: left" align="left">
            <el-row>
              <el-col :span="8" align="left">**********</el-col>
              <el-col :span="16" align="right" v-show="getButtonVial('manager:user:updatePwdByAdmin')">
                <el-button type="text" v-show="user.userId === this.admin.creatorId"
                           @click="modifyPswVisible = true;modify = {adminPsw: '', newPsw: '', newPsw1: ''}">修改密码
                </el-button>
                <el-button type="text" @click="resetPswVisible = true;reset={adminPsw: ''}"
                           v-show="user.userId === this.admin.creatorId">重置
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="过期时间" align="left" style="text-align:left">
            <el-date-picker v-model="admin.loginTime" type="datetime" placeholder="选择过期时间"
                            value-format="timestamp" :picker-options="pickerBeginDate" default-time="23:59:59">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="PKI登录" align="left" style="text-align:left">
            <el-checkbox v-model="admin.uLogin">开启PKI登录</el-checkbox>
          </el-form-item>
          <el-form-item label="身份证号" v-show="admin.uLogin==true" align="left" style="text-align: left">
            <el-input v-model="admin.policeNum" placeholder="登记身份证号，即可使用警员PKI登录" :maxlength="18"></el-input>
          </el-form-item>
          <!--<el-form-item label="所属公安机关" align="left" prop="groupId">-->
          <!--<el-select v-model="admin.groupId" placeholder="请选择公安机关" v-if="admin.groupAdmin != true" filterable>-->
          <!--<el-option v-for="item in organizations" :key="item.groupId" :label="item.groupName"-->
          <!--:value="item.groupId">-->
          <!--</el-option>-->
          <!--</el-select>-->
          <!--<span v-else>{{admin.groupName}}</span>-->
          <!--</el-form-item>-->
          <el-form-item label="所属部门" align="left" prop="deptId" style="text-align: left">
            <el-select v-model="admin.deptId" placeholder="请选择部门" filterable v-if="admin.groupId==query.myGroupId">
              <el-option v-for="item in departments" :key="item.deptId" :label="item.deptName"
                         :value="item.deptId">
              </el-option>
            </el-select>
            <span v-else>{{admin.deptName}}</span>
          </el-form-item>
          <el-form-item label="设置岗位" align="left" required style="text-align: left">
            <el-select v-model="role" placeholder="请选择岗位" v-if="admin.groupAdmin != true" filterable>
              <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId"
                         v-show="item.roleId.length != 1">
              </el-option>
            </el-select>
            <span v-else>{{admin.roleNameList[0]}}</span>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="cancelSubmit()" size="medium">取消</el-button>
          <el-button type="primary" @click="onSubmit('admin',addUserTitle)" size="medium"
                     :disabled="listLoading">确认
          </el-button>
        </div>
      </el-dialog>
      <!--修改密码-->
      <el-dialog title="修改密码" :visible.sync="modifyPswVisible" :width="dialogWidth">
        <el-form ref="modify" :model="modify" label-width="100px" :rules="rules1" labelPosition="right">
          <el-form-item label="管理员密码" required align="left" style="text-align: left">
            <el-input v-model="modify.adminPsw" placeholder="请输入管理员密码" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPsw" align="left" style="text-align: left">
            <el-input v-model="modify.newPsw" placeholder="6-16位英文字母、数字、下划线"
                      :maxlength="16" :minlength="6" type="password"></el-input>
          </el-form-item>
          <el-form-item label="密码确认" prop="newPsw1" align="left" style="text-align: left">
            <el-input v-model="modify.newPsw1" placeholder="请再次输入新密码"
                      :maxlength="16" :minlength="6" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="modifyPswVisible = false" size="medium">取消</el-button>
          <el-button type="primary" @click="modifyPsw()" size="medium">确认修改</el-button>
        </div>
      </el-dialog>
      <!--重置密码-->
      <el-dialog title="重置密码" :visible.sync="resetPswVisible" :width="dialogWidth">
        <el-form ref="modify" :model="reset" label-width="100px" labelPosition="right">
          <el-form-item label="管理员密码" required align="left" style="text-align: left">
            <el-input v-model="reset.adminPsw" placeholder="请输入管理员密码" type="password"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="resetPswVisible = false" size="medium">取消</el-button>
          <el-button type="primary" @click="resetPsw()" size="medium">确认重置</el-button>
        </div>
      </el-dialog>
      <!--添加/修改部门-->
      <el-dialog :title="addDepart" :visible.sync="addDepartVisible" :width="dialogWidth">
        <el-form label-width="100px" labelPosition="right">
          <el-form-item label="部门名称" align="left" style="text-align: left">
            <el-input v-model="departObj.deptName" placeholder="请输入部门名称" :maxlength="10"></el-input>
          </el-form-item>
        </el-form>
        <div class="block" style="margin-top: 20px">
          <el-button @click="addDepartVisible=false" size="medium">取消</el-button>
          <el-button type="primary" @click="editDepart()" size="medium" :disabled="listLoading">
            {{addDepart=='创建部门'?'确认创建':'确认修改'}}
          </el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>

<script>
  import md5 from 'js-md5';
  import {pswValidator, nameValidator, userCardValid} from '../../assets/js/api';
  import {buttonValidator, formatDate, decryData} from "../../assets/js/util";

  export default {
    data() {
      let nameValidate = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('账号不能小于6位'));
        } else if (value.length > 16) {
          callback(new Error('账号不能大于16位'));
        } else if (!(/^[A-Za-z0-9-_]+$/.test(value))) {
          callback(new Error("账号由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      let nickValidate = (rule, value, callback) => {
        if (value.length < 2) {
          callback(new Error('姓名不能小于2位'));
        } else if (value.length > 10) {
          callback(new Error('姓名不能大于10位'));
        } else if (!nameValidator(value)) {
          callback(new Error("姓名由汉字、英文字母组成"));
        } else {
          callback();
        }
      };
      let pswValidate = (rule, value, callback) => {
        if (value.length < 6) {
          callback(new Error('密码不能小于6位'));
        } else if (value.length > 16) {
          callback(new Error('密码不能大于16位'));
        } else if (!pswValidator(value)) {
          callback(new Error("密码由英文字母、数字以及~!@#$%^&*=+/-组成"));
        } else {
          callback();
        }
      };
      return {
        listLoading: false, addUserVisible: false, modifyUserVisible: false, modifyPswVisible: false,
        resetPswVisible: false, addDepartVisible: false, isMore: false,
        addUserTitle: '创建用户',
        addDepart: '创建部门',
        departObj: {deptName: ''},
        groupName: '', groupMem: 0, depmMem: 0,
        leftHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 222,
        tableHeight: (window.innerHeight < 600 ? 600 : window.innerHeight) - 232,
        dialogWidth: '580px',
        user: JSON.parse(decryData(sessionStorage.getItem("user"))),
        admin: {
          account: '', realName: '', password: '12345678', roleList: [], uLogin: false,
          groupId: JSON.parse(decryData(sessionStorage.getItem("user"))).groupId
        },
        rules: {
          account: [
            {required: true, message: '请输入账号', trigger: 'blur'}, {validator: nameValidate, trigger: "blur"}],
          realName: [
            {required: true, message: '请输入姓名', trigger: 'blur'},
            {validator: nickValidate, trigger: "change,blur"},
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {validator: pswValidate, trigger: "change,blur"},
          ],
          // groupId: [{required: true, message: '请选择公安机关', trigger: 'blur'}],
          deptId: [{required: true, message: '请选择部门', trigger: 'blur'}]
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
        query: {page: 1, size: 10, myGroupId: JSON.parse(decryData(sessionStorage.getItem("user"))).groupId},
        users: [], departments: [], setPsw: 'defaultPsw', role: '', roles: [], organizations: [],
        modify: {adminPsw: '', newPsw: '', newPsw1: ''},
        reset: {adminPsw: ''}, currentIdx: -1,
        pickerBeginDate: {
          shortcuts: [{
            text: '一周',
            onClick(picker) {
              const date = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }, {
            text: '一个月',
            onClick(picker) {
              const date = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 30);
              picker.$emit('pick', date);
            }
          }, {
            text: '三个月',
            onClick(picker) {
              const date = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/'));
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 90);
              picker.$emit('pick', date);
            }
          }],
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 00:00:00").replace(/-/g, '/')).getTime() - 10;
            if (beginDateVal) {
              return beginDateVal > time.getTime();
            }
          }
        }
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      showDeptDialog(val, indx) {
        if (val == 0) {//创建
          this.addDepart = '创建部门';
          this.departObj = {deptName: ''};
        } else {//修改
          this.addDepart = '修改部门';
          this.departObj = {deptName: this.departments[indx].deptName, deptId: this.departments[indx].deptId};
        }
        this.listLoading = false;
        this.addDepartVisible = true
      },
      //公安机关变化=》部门变化、用户变化
      groupChange(val) {
        this.currentIdx = -1;
        delete this.query['deptId'];
        this.getDepartments(val);
        this.groupName = this.getGroupName(val);
        this.getUserList();
        // this.handleClick(0);
      },
      //获取部门列表
      getDepartments(id) {
        let param = {groupId: id ? id : this.user.groupId};
        this.$post('/manager/dept/query', param).then((data) => {
          if ("000000" === data.code) {
            this.departments = data.data ? data.data : [];
            // if (this.departments.length > 0) {
            //   this.query.deptId = this.departments[0].deptId;
            //   this.getUserList();
            // }
          }
        })
      },
      //删除部门
      deleteDepart(item) {
        this.$confirm('确定要删除该部门吗？', '提示', {type: 'warning'}).then(() => {
          this.$post('/manager/dept/delete', {deptId: item.deptId}, '操作成功').then((data) => {
            this.currentIdx = -1;
            this.getDepartments(this.query.myGroupId);
          });
        }).catch((err) => {
        });
      },
      //修改部门
      editDepart() {
        if (this.departObj.deptName.length == 0) {
          this.$message.error('请输入部门名称');
          return;
        }
        let param = {};
        let url = '/manager/dept/create';
        let msg = '添加成功';
        if (this.addDepart === '修改部门') {
          url = '/manager/dept/update';
          msg = '修改成功';
          param = {deptId: this.departObj.deptId, deptName: this.departObj.deptName};
        } else {
          let groupId = this.query.myGroupId;
          let groupName = this.getGroupName(groupId);
          let creatorId = this.user.userId;
          param = {
            groupId: groupId, creatorId: creatorId,
            groupName: groupName, deptName: this.departObj.deptName, remark: ''
          };
        }
        this.listLoading = true;
        this.$post(url, param, msg).then((data) => {
          this.listLoading = false;
          this.addDepartVisible = false;
          this.getDepartments(this.query.myGroupId);
        });
      },
      handleClick(idx) {
        this.currentIdx = idx;
        if (idx < 0) {
          delete this.query['deptId'];
        } else {
          this.query.deptId = this.departments[idx].deptId;
        }
        this.getUserList();
      },
      showMore() {
        this.isMore = !this.isMore;
        if (this.isMore) {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 282
        } else {
          this.tableHeight = (window.innerHeight < 600 ? 600 : window.innerHeight) - 232
        }
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
        this.clearData();
        this.admin = {
          account: '', realName: '', password: '12345678', roleList: [], uLogin: false, groupId: this.user.groupId,
          loginTime: new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime() + 60 * 60 * 24 * 30 * 1000
        };
        this.setPsw = 'defaultPsw';
        this.role = '';
        this.listLoading = false;
        this.addUserVisible = true;
        this.addUserTitle = '创建用户';
      },
      updateInfo(row) {
        this.admin = Object.assign({}, row);
        this.listLoading = false;
        this.modifyUserVisible = true;
        this.addUserTitle = '修改用户';
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
        } else if (column.property == 'loginTime') {
          return row[column.property] == undefined ? '--' : formatDate(new Date(row.loginTime), 'yyyy-MM-dd hh:mm:ss');
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //账号启用/停用
      userUse(user) {
        let param = {userId: user.userId};
        let msg = '确定要启用该用户？';
        if (user.locked == 0) {
          param.locked = 1;
          msg = '确定要停用该用户？'
        } else {
          param.locked = 0;
          param.loginTime = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime() + 60 * 60 * 24 * 30 * 1000;
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
          if (this.currentIdx < 0) {
            this.groupMem = data.data.totalElements;
          } else {
            this.depmMem = data.data.totalElements;
          }
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
        this.query = {page: 1, size: 10, myGroupId: this.user.groupId};
        this.currentIdx = -1;
        this.groupName = this.getGroupName(this.user.groupId);
        this.getUserList();
        this.getDepartments(this.query.myGroupId);
      },
      onSubmit(formName, title) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.admin.loginTime == null || this.admin.loginTime.length == 0) {
              this.$message.error('请选择过期时间');
              return;
            }
            if (this.admin.uLogin && (!this.admin.policeNum || this.admin.policeNum.length == 0)) {
              this.$message.error('请输入身份证号');
              return;
            }
            if (this.admin.uLogin && !userCardValid(this.admin.policeNum)) {
              this.$message.error('请输入正确的身份证号');
              return;
            }
            if (!this.role) {
              this.$message.error('请选择岗位');
              return;
            }
            let url = '/manager/user/create';
            let msg = '添加成功';
            if (title === '修改用户') {
              url = '/manager/user/update';
              msg = '修改成功';
            } else {
              this.admin.creatorId = this.user.userId;
              this.admin.locked = 0;
              this.admin.password = md5(this.admin.password);
            }
            this.admin.roleList = [];
            this.admin.roleList.push(this.role);
            this.listLoading = true;
            this.$post(url, this.admin, msg).then((data) => {
              this.listLoading = false;
              if ("000000" === data.code) {
                this.addUserVisible = false;
                this.modifyUserVisible = false;
                this.getUserList();
              }
            });
          }
        })
      },
      getGroupName(groupId) {
        let str = '';
        this.organizations.forEach((item) => {
          if (item.groupId == groupId) {
            str = item.groupName
          }
        });
        return str;
      },
      //获取岗位列表
      getRoles() {
        if (this.getButtonVial('manager:role:query')) {
          this.$post('/manager/role/query', {
            page: 1, size: 9999, state: 0, creatorGroupId: this.user.groupId
          }).then((data) => {
            this.roles = data.data.content;
          })
        }
      },
      //获取公安机关列表
      getOrganizations() {
        if (this.getButtonVial('manager:group:query')) {
          this.$post('/manager/group/query', {page: 1, size: 9999, userId: this.user.userId}).then((data) => {
            this.organizations = data.data.content;
            this.groupName = this.getGroupName(this.user.groupId);
          });
        }
      }
    },
    mounted() {
      this.user = JSON.parse(decryData(sessionStorage.getItem("user")));
      this.getOrganizations();
      this.getRoles();
      this.getDepartments();
      this.getUserList();
    }
  }
</script>
<style scoped>
  .group-name {
    height: 36px;
    line-height: 36px;
    text-align: left;
    padding-left: 6px;
    color: #6699ff;
    cursor: pointer;
    border-left: 3px solid #fff;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .group-name.active {
    border-left: 3px solid #6699ff;
  }

  .depart-main {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    border-left: 3px solid #fff;
    justify-content: center;
    align-items: center;
    height: 36px;
    line-height: 36px;
  }

  .depart-item {
    flex: 1 1 auto;
    cursor: pointer;
    height: 36px;
    line-height: 36px;
    text-align: left;
    padding-left: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: -moz-calc(100% - 80px);
    width: -webkit-calc(100% - 80px);
    width: calc(100% - 80px);
  }

  .depart-main.active {
    border-left: 3px solid #6699ff;
    color: #6699ff;
    -webkit-transition: -webkit-transform .3s cubic-bezier(.645, .045, .355, 1);
    transition: -webkit-transform .3s cubic-bezier(.645, .045, .355, 1);
    transition: transform .3s cubic-bezier(.645, .045, .355, 1);
    transition: transform .3s cubic-bezier(.645, .045, .355, 1), -webkit-transform .3s cubic-bezier(.645, .045, .355, 1);
  }

  .depart-main:focus, .depart-main:hover {
    color: #6699ff;
  }

  .depart-main .btn-delete {
    display: none;
  }

  .depart-main:focus > .btn-delete, .depart-main:hover > .btn-delete, .depart-main:active > .btn-delete {
    display: block;
    font-size: 16px;
    margin-right: 10px;
    color: #999;
    flex: 0 0 auto;
  }

  .btn-delete:focus, .btn-delete:hover, .btn-delete:active {
    color: #6699ff;
  }
</style>
