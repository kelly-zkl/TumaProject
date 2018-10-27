<template>
  <div>
    <section class="content">
      <el-row>
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="进行中" name="EXECUTION"></el-tab-pane>
            <el-tab-pane label="已结案" name="HANDLED"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="showCaseType()">管理案件属性</el-button>
          <el-button type="primary" size="medium" @click="showCreate()"
                     v-show="getButtonVial('case:add')">创建新案件
          </el-button>
        </el-col>
      </el-row>
      <el-row style="padding-top: 15px">
        <el-col :span="18" align="left">
          <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('case:query')">
            <el-form-item style="margin-bottom: 10px">
              <el-input v-model="query.caseName" placeholder="案件编号/名称" size="medium" style="width: 160px"
                        :maxlength=20></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-select v-model="query.caseType" placeholder="案件类型" size="medium" filterable clearable>
                <el-option v-for="item in caseTypes" :key="item.idx" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-cascader :options="provinceList" :props="props" @change="areaChange" change-on-select
                           v-model="areaList" style="width: 180px" placeholder="案发地点" size="medium"
                           filterable clearable>
              </el-cascader>
            </el-form-item>
            <el-form-item style="margin-bottom: 10px">
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                              start-placeholder="案发开始日期" size="medium" end-placeholder="案发结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
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
          <el-button type="primary" size="medium"
                     v-show="query.status == 'EXECUTION' && getButtonVial('case:batchUpdateStatus')"
                     :disabled="sels.length == 0" @click="finishCase()">结案
          </el-button>
          <el-button type="primary" size="medium" :disabled="sels.length == 0" @click="deleteCase()"
                     v-show="getButtonVial('case:delete')">删除
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="caseList" v-loading="listLoading" class="center-block" stripe @selection-change="selsChange">
        <el-table-column type="selection" width="45" align="left"></el-table-column>
        <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
        <el-table-column align="left" v-for="item in defaultProps" :key="item.value" :formatter="formatterAddress"
                         :prop="item.value" :label="item.name" :min-width="item.min"
                         :max-width="item.max"></el-table-column>
        <el-table-column align="left" label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="sels = [];sels.push(scope.row);finishCase()"
                       v-show="scope.row.status=='EXECUTION' && getButtonVial('case:batchUpdateStatus')">结案
            </el-button>
            <el-button type="text" @click="gotoDetail(scope.row)" v-show="getButtonVial('case:get')">查看</el-button>
            <el-button type="text" @click="sels = [];sels.push(scope.row);deleteCase()"
                       v-show="getButtonVial('case:delete')">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 20px" align="right">
        <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="query.page"
                       :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                       layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
      <!--创建新案件-->
      <el-dialog title="创建新案件" :visible.sync="runningCreateCase" :width="dialogWidth" center>
        <div class="block">
          <el-form ref="createCase" :rules="rules" :model="createCase" label-position="right"
                   :label-width="labelWidth">
            <el-form-item label="案件编号" prop="caseNo">
              <el-input v-model="createCase.caseNo" auto-complete="off" :maxlength="30"></el-input>
            </el-form-item>
            <el-form-item label="案件名称" prop="caseName">
              <el-input v-model="createCase.caseName" auto-complete="off" :maxlength="20"></el-input>
            </el-form-item>
            <el-form-item label="案件类型" prop="caseType">
              <el-select v-model="createCase.caseType" placeholder="案件类型" filterable clearable style="width: 100%">
                <el-option v-for="item in caseTypes" :key="item.idx" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="案发时间" prop="startTime">
              <el-date-picker v-model="createCase.startTime" type="datetimerange" range-separator="至"
                              start-placeholder="案发开始日期" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate" style="width: 100%"></el-date-picker>
            </el-form-item>
            <el-form-item label="案发地点" prop="caseArea">
              <el-cascader :options="provinceList" :props="props" clearable
                           style="width: 100%" v-model="createCase.caseArea" placeholder="案发地点">
              </el-cascader>
            </el-form-item>
            <el-form-item prop="caseAddress">
              <el-input v-model="createCase.caseAddress" :maxlength="30" placeholder="详细地点"></el-input>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="createCase.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                        placeholder="请输入备注"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" align="center">
            <el-button @click="runningCreateCase = false">取消</el-button>
            <el-button type="primary" @click="createNewCase()">确认创建</el-button>
          </div>
        </div>
      </el-dialog>
      <!--管理案件属性-->
      <el-dialog title="案件属性管理" :visible.sync="runningCaseType" :width="dialogWidth" center>
        <div class="block">
          <el-input v-model="caseTypeAdd" placeholder="输入属性" style="width: 400px" :maxlength=20>
            <el-button slot="append" type="primary" @click="addCaseType()">添加</el-button>
          </el-input>
          <el-table :data="caseTypes" class="center-block" stripe>
            <el-table-column align="left" type="index" label="序号" width="120"></el-table-column>
            <el-table-column align="left" :formatter="formatterAddress" prop="label" label="属性"></el-table-column>
            <el-table-column align="left" label="操作" width="180" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" @click="deleteCaseType(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import json from '../../../assets/city.json';
  import {noSValidator, noValidator} from "../../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      let codeValidator = (rule, value, callback) => {
        if (noValidator(value)) {
          callback(new Error("由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      let nameValidator = (rule, value, callback) => {
        if (noSValidator(value)) {
          callback(new Error("由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        activeItem: 'EXECUTION',
        runningCreateCase: false,
        runningCaseType: false,
        listLoading: false,
        dialogWidth: '600px',
        labelWidth: isPC() ? '100px' : '80px',
        props: {value: 'o', label: 'n', children: 'c'},
        areaList: [],
        caseTypeAdd: '',
        provinceList: json,
        qTime: '',
        query: {page: 1, size: 10, status: 'EXECUTION'},
        caseTypes: [],
        count: 0,
        sels: [],
        caseList: [],
        caseArea: [],
        createCase: {startTime: []},
        defaultProps: [{value: 'caseNo', name: '案件编号', min: 150, max: 250},
          {value: 'caseName', name: '案件名称', min: 150, max: 250},
          {value: 'caseType', name: '案件类型', min: 150, max: 250},
          {value: 'caseTime', name: '案发时间', min: 350, max: 350},
          {value: 'caseAddress', name: '案发地点', min: 150, max: 250},
          {value: 'creatTime', name: '创建时间', min: 170, max: 170},
          {value: 'status', name: '案件状态', min: 120, max: 120}],
        rules: {
          caseNo: [
            {required: true, message: '请输入案件编号', trigger: 'blur', maxlength: 20},
            {validator: codeValidator, trigger: "change,blur"}
          ],
          caseName: [
            {required: true, message: '请输入案件名称', trigger: 'blur', maxlength: 30},
            {validator: nameValidator, trigger: "change,blur"}
          ],
          caseType: [{required: true, message: '请输入案件类型', trigger: 'blur'}],
          caseArea: [{required: true, message: '请选择案发地点', trigger: 'blur'}],
          startTime: [{required: true, message: '请选择案发时间', trigger: 'blur'}],
          caseAddress: [{required: true, message: '请输入详细地点', trigger: 'blur'}]
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
      //案件属性
      showCaseType() {
        this.caseTypeAdd = '';
        this.runningCaseType = true;
        this.getCaseType();
      },
      getCaseType() {
        this.caseTypes = [];
        this.$post('lookup/get/caseType', {}).then((data) => {
          if ("000000" === data.code) {
            if (data.data.items && data.data.items.length > 0) {
              data.data.items.forEach((item, idx) => {
                let label = {label: item.label, idx: idx};
                this.caseTypes.push(label);
              });
            }
          }
        }).catch((err) => {
        });
      },
      addCaseType() {
        if (this.caseTypeAdd.length == 0) {
          this.$message.error('请输入案件类型');
          return;
        }
        this.$post('lookup/add/caseType', {label: this.caseTypeAdd}, '添加成功').then((data) => {
          if ("000000" === data.code) {
            this.caseTypeAdd = '';
            this.getCaseType();
          }
        }).catch((err) => {
        });
      },
      deleteCaseType(row) {
        this.$confirm('确认删除该案件属性?', '提示', {type: 'info'}).then(() => {
          this.$post('lookup/remove/caseType', {label: row.label}, '操作成功').then((data) => {
            if ("000000" === data.code) {
              this.getCaseType();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //全选  ==>  删除/结案
      selsChange(sels) {
        this.sels = sels;
      },
      handleType(val) {
        if (val.name === 'EXECUTION') {
          this.defaultProps = [{value: 'caseNo', name: '案件编号', min: 150, max: 250},
            {value: 'caseName', name: '案件名称', min: 150, max: 250},
            {value: 'caseType', name: '案件类型', min: 150, max: 250},
            {value: 'caseTime', name: '案发时间', min: 350, max: 350},
            {value: 'caseAddress', name: '案发地点', min: 150, max: 250},
            {value: 'creatTime', name: '创建时间', min: 170, max: 170},
            {value: 'status', name: '案件状态', min: 120, max: 120}];
        } else {
          this.defaultProps = [{value: 'caseNo', name: '案件编号', min: 150, max: 250},
            {value: 'caseName', name: '案件名称', min: 150, max: 250},
            {value: 'caseType', name: '案件类型', min: 150, max: 250},
            {value: 'caseTime', name: '案发时间', min: 350, max: 350},
            {value: 'caseAddress', name: '案发地点', min: 150, max: 250},
            {value: 'creatTime', name: '创建时间', min: 170, max: 170},
            {value: 'status', name: '案件状态', min: 120, max: 120},
            {value: 'updateTime', name: '结案时间', min: 170, max: 170}];
        }
        this.getData();
      },
      gotoDetail(task) {
        sessionStorage.setItem("activeItem", this.activeItem);
        sessionStorage.setItem("qTime", JSON.stringify(this.qTime));
        sessionStorage.setItem("query", JSON.stringify(this.query));
        this.$router.push({path: '/caseDetail', query: {caseId: task.id}});
      },
      //创建新案件
      showCreate() {
        this.createCase = {startTime: []};
        this.runningCreateCase = true;
      },
      createNewCase() {
        this.$refs['createCase'].validate((valid) => {
          if (valid) {
            this.createCase.caseTime = Math.round(this.createCase.startTime[0] / 1000);
            this.createCase.caseToTime = Math.round(this.createCase.startTime[1] / 1000);

            this.createCase.provinceCode = this.createCase.caseArea[0];
            this.createCase.cityCode = this.createCase.caseArea[1];
            this.createCase.areaCode = this.createCase.caseArea[2];
            delete this.createCase['startTime'];
            delete this.createCase['caseArea'];

            this.$post("case/add", this.createCase, "创建成功").then((data) => {
              this.createCase = {startTime: []};
              this.runningCreateCase = false;
              this.getData();
            });
          }
        })
      },
      //结案
      finishCase() {
        this.$confirm('确认已结案?', '提示', {type: 'info'}).then(() => {
          var param = [];
          this.sels.forEach((item) => {
            var caseItem = {id: item.id, handlerBy: 'superAdmin', status: 'HANDLED'};
            param.push(caseItem);
          });
          this.$post('/case/batchUpdateStatus', param, '操作成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //删除案件
      deleteCase() {
        let arr = [];
        this.sels.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该案件吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/case/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getData();
              this.sels = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //省市县变化
      areaChange(value) {
        this.areaList = value;
        this.query.provinceCode = '';
        this.query.cityCode = '';
        this.query.areaCode = '';
        if (value.length === 1) {
          this.query.provinceCode = value[0];
        } else if (value.length === 2) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
        } else if (value.length === 3) {
          this.query.provinceCode = value[0];
          this.query.cityCode = value[1];
          this.query.areaCode = value[2];
        }
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.areaList = [];
        this.qTime = '';
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
      getData() {
        if (!!this.qTime) {
          this.query.caseTime = Math.round(this.qTime[0] / 1000);
          this.query.caseToTime = Math.round(this.qTime[1] / 1000);
        }
        this.query.status = this.activeItem;
        this.listLoading = true;
        this.$post('/case/query', this.query).then((data) => {
          this.caseList = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.caseList = [];
          this.listLoading = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'updateTime') {
          return row.updateTime ? formatDate(new Date(row.updateTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'creatTime') {
          return row.creatTime ? formatDate(new Date(row.creatTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'caseTime') {
          let start = row.caseTime ? formatDate(new Date(row.caseTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          let end = row.caseToTime ? formatDate(new Date(row.caseToTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          return start + " ~ " + end;
        } else if (column.property === 'status') {
          return row.status === 'UNHANDLED' ? '未处理' : row.status === 'EXECUTION' ? '进行中' : row.status === 'HANDLED' ? '已结案' : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      let bol = JSON.parse(sessionStorage.getItem("query"));
      let tab = sessionStorage.getItem("activeItem");
      let time1 = JSON.parse(sessionStorage.getItem("qTime"));
      if (tab) {
        this.activeItem = tab;
      }
      if (bol) {
        this.query = JSON.parse(sessionStorage.getItem("query"));
      }
      if (time1) {
        this.qTime = time1;
      }
      this.getCaseType();
      this.getData();
    }
  }
</script>
