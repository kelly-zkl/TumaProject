<template>
  <div>
    <section class="content">
      <div class="add-appdiv gray-form" style="margin-bottom: 15px;padding: 0">
        <el-row style="border-bottom:1px #D0CACF solid;margin: 0">
          <el-col :span="12" align="left" style="text-align: left">
            <div style="font-size:15px;padding:10px 20px;text-align:left">基本信息</div>
          </el-col>
          <el-col :span="12" align="right" style="text-align: right;padding-right: 30px">
            <!--<el-button type="text" @click="" style="margin-right: 20px">修改</el-button>-->
            <el-button type="text" @click="deleteCase()" size="medium" v-show="getButtonVial('case:delete')">删除
            </el-button>
          </el-col>
        </el-row>
        <el-row style="padding: 15px 0">
          <el-form :model="caseDetail" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
            <el-col :span="8" align="left" style="text-align: left">
              <el-form-item label="案件编号" align="left" style="margin: 0;text-align: left">
                {{caseDetail.caseNo?caseDetail.caseNo:'--'}}
              </el-form-item>
              <el-form-item label="案件名称" align="left" style="margin: 0;text-align: left">
                {{caseDetail.caseName?caseDetail.caseName:'--'}}
              </el-form-item>
              <el-form-item label="案件类型" align="left" style="margin: 0;text-align: left">
                {{caseDetail.caseType?caseDetail.caseType:'--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8" align="left" style="text-align: left">
              <el-form-item label="案发地点" align="left" style="margin: 0;text-align: left">
                {{caseDetail.address?caseDetail.address:'--'}}
              </el-form-item>
              <el-form-item label="案发时间" align="left" style="margin: 0;text-align: left">
                {{caseDetail.startStr + " - " + caseDetail.endStr}}
              </el-form-item>
              <el-form-item label="备注" align="left" style="margin: 0;text-align: left">
                {{caseDetail.remark?caseDetail.remark:'--'}}
              </el-form-item>
            </el-col>
            <el-col :span="8" align="left" style="text-align: left">
              <el-form-item label="案件状态" align="left" style="margin: 0;text-align: left">
                <span
                  v-bind:style="{fontSize:'15px',color:caseDetail.status=='EXECUTION'?'#6799FD':caseDetail.status =='HANDLED'?'#00C755':'#333'}">
                  {{caseDetail.status === "EXECUTION" ? "进行中" : caseDetail.status === "HANDLED" ? "已结案" : "--"}}</span>
              </el-form-item>
              <el-form-item label="创建时间" align="left" style="margin: 0;text-align: left">
                {{caseDetail.timeStr?caseDetail.timeStr:'--'}}
              </el-form-item>
              <el-form-item :label="caseDetail.status=='EXECUTION'?'更新时间':caseDetail.status=='HANDLED'?'结案时间':'--'"
                            align="left" style="margin: 0;text-align: left">
                {{caseDetail.fishStr?caseDetail.fishStr:'--'}}
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <h5 style="border-left: 3px #6699FF solid;text-align: left;font-size: 16px;padding-left: 10px;color:#343434">
        已关联任务</h5>
      <el-row style="margin-bottom: 15px">
        <el-col :span="24" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="交并任务" name="collision"></el-tab-pane>
            <el-tab-pane label="伴随任务" name="follow"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'collision'">
        <el-row>
          <el-col :span="18" v-show="getButtonVial('collision:query')" style="text-align: left">
            <el-form :inline="true" :model="queryCollision" align="left" style="text-align: left;width: 840px">
              <el-form-item style="margin-bottom: 10px">
                <el-input v-model="queryCollision.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                          :maxlength=20></el-input>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-date-picker v-model="date1" type="datetimerange" range-separator="至" size="medium"
                                :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                                start-placeholder="开始日期" end-placeholder="结束日期"
                                style="width:360px" :picker-options="pickerBeginDate">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" size="medium" @click="queryCollision.page=1;getCollisions()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" style="text-align: right">
            <el-button type="primary" size="medium" @click="cancelCollis()" :disabled="selsColl.length == 0"
                       v-show="getButtonVial('collision:cancelCase')">取消关联
            </el-button>
            <el-button size="medium" @click="deleteCoTask()" :disabled="selsColl.length == 0"
                       v-show="getButtonVial('collision:delete')">删除任务
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="collisions" v-loading="listLoading1" class="center-block" stripe
                  @selection-change="selsCollision">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="任务编号" prop="taskNo" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="任务名称" prop="taskName" min-width="150"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="创建用户" prop="createBy" min-width="120"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="创建日期" prop="createTime" min-width="170"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="关联案件" prop="caseName" min-width="100"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" min-width="125" max-width="250" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoCoDetail(scope.row.id)" v-show="getButtonVial('collision:get')">查看
              </el-button>
              <el-button type="text" @click="selsColl = [];selsColl.push(scope.row.id);deleteCoTask()"
                         v-show="getButtonVial('collision:delete')">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                         :current-page.sync="queryCollision.page" :page-sizes="[10, 15, 20, 30]"
                         :page-size="queryCollision.size" :total="count1" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" v-show="activeItem == 'follow'">
        <el-row>
          <el-col :span="18" v-show="getButtonVial('follow:query')" style="text-align: left">
            <el-form :inline="true" :model="queryFollow" align="left" style="text-align: left;width: 840px">
              <el-form-item style="margin-bottom: 10px">
                <el-input v-model="queryFollow.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                          :maxlength=20></el-input>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                                start-placeholder="创建时间" size="medium" end-placeholder="结束日期" clearable
                                :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                                :picker-options="pickerBeginDate">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="text" size="medium" @click="isMore=!isMore">{{isMore?'收起条件':'更多条件'}}</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" size="medium" @click="queryFollow.page=1;getFollows()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px" v-show="isMore">
                <el-select v-model="queryFollow.taskStatus" placeholder="任务状态" style="width: 150px"
                           size="medium" filterable clearable>
                  <el-option v-for="item in taskStatus" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6" style="text-align: right">
            <el-button type="primary" size="medium" @click="cancelFollow()" :disabled="selsFoll.length == 0"
                       v-show="getButtonVial('follow:cancelCase')">取消关联
            </el-button>
            <el-button size="medium" @click="deleteFoTask()" :disabled="selsFoll.length == 0"
                       v-show="getButtonVial('follow:delete')">删除任务
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="follows" v-loading="listLoading2" class="center-block" stripe @selection-change="selsFollow">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="任务名称" prop="taskName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="分析对象" prop="followTarget" min-width="170"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="任务状态" prop="taskStatus" min-width="150" max-width="250">
            <template slot-scope="scope">
              <span style="color:#00C755" v-show="scope.row.taskStatus == 'FINISH'">已完成</span>
              <span style="color:#dd6161" v-show="scope.row.taskStatus == 'FAILE'">失败</span>
              <span style="color:#D76F31" v-show="scope.row.taskStatus == 'WAIT'">等待中</span>
              <span style="color:#6799FD" v-show="scope.row.taskStatus == 'EXECUTION'">分析中</span>
            </template>
          </el-table-column>
          <el-table-column align="left" label="分析结果" prop="followCount" min-width="130"
                           max-width="200" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="创建日期" prop="createTime" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoFoDetail(scope.row)" v-show="getButtonVial('follow:get')">查看
              </el-button>
              <el-button type="text" @click="selsFoll = [];selsFoll.push(scope.row.id);deleteFoTask()"
                         v-show="getButtonVial('follow:delete')">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin: 20px 0" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                         :current-page.sync="queryFollow.page" :page-sizes="[10, 15, 20, 30]"
                         :page-size="queryFollow.size" :total="count2" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator, getAreaLable} from "../../../assets/js/util";

  export default {
    data() {
      return {
        isMore: false,
        caseId: this.$route.query.caseId || '',
        caseDetail: {},
        activeItem: "collision",
        qTime: "",
        date1: "",
        collisions: [],
        queryCollision: {page: 1, size: 10},
        listLoading1: false,
        count1: 0,
        conditionTypes: [{value: 0, label: '多条件碰撞'}, {value: 1, label: '单条件碰撞'}],
        taskStatus: [{value: 'FINISH', label: '已完成'}, {value: 'FAILE', label: '失败'},
          {value: 'WAIT', label: '等待中'}, {value: 'EXECUTION', label: '分析中'}],
        follows: [],
        queryFollow: {page: 1, size: 10},
        listLoading2: false,
        count2: 0,
        selsFoll: [],
        selsColl: [],
        pickerBeginDate: {
          disabledDate: (time) => {
            let beginDateVal = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " 23:59:59").replace(/-/g, '/')).getTime();
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
      handleType(val) {
        this.isMore = false;
        if (this.activeItem === "collision") {//碰撞任务
          this.getCollisions();
        } else {//伴随任务
          this.getFollows();
        }
      },
      //删除案件
      deleteCase() {
        this.$confirm('确认要删除该案件吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/case/delete', [this.caseId], '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.$router.go(-1);
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //全选  ==>  删除/结案
      selsCollision(sels) {
        this.selsColl = sels;
      },
      //跳转任务详情
      gotoCoDetail(id) {
        let routeData = this.$router.resolve({path: '/taskDetail', query: {taskId: id}});
        window.open(routeData.href, '_blank');
      },
      //删除碰撞任务
      deleteCoTask() {
        let arr = [];
        this.selsColl.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除碰撞任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getCollisions();
              this.selsColl = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //取消关联碰撞任务
      cancelCollis() {
        let arr = [];
        this.selsColl.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要取消关联该碰撞任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/cancelCase/' + this.caseId, arr, '取消关联成功').then((data) => {
            if ("000000" === data.code) {
              this.getCollisions();
              this.selsColl = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //全选  ==>  删除/结案
      selsFollow(sels) {
        this.selsFoll = sels;
      },
      gotoFoDetail(task) {
        this.$router.push({path: '/followResult', query: {taskId: task.id, followType: task.followType}});
      },
      //删除伴随任务
      deleteFoTask() {
        let arr = [];
        this.selsFoll.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要删除该伴随任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/follow/delete', arr, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.getFollows();
              this.selsFoll = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //取消关联伴随任务
      cancelFollow() {
        let arr = [];
        this.selsFoll.forEach((item) => {
          arr.push(item.id);
        });
        this.$confirm('确认要取消关联该伴随任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/follow/cancelCase/' + this.caseId, arr, '取消关联成功').then((data) => {
            if ("000000" === data.code) {
              this.getFollows();
              this.selsFoll = [];
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //清除查询条件
      clearData() {
        if (this.activeItem === "collision") {
          this.queryCollision = {page: 1, size: 10};
          this.date1 = '';
          this.getCollisions();
        } else {
          this.queryFollow = {page: 1, size: 10};
          this.date1 = '';
          this.getFollows();
        }
      },
      pageChange(index) {
        if (this.activeItem === "collision") {
          this.queryCollision.page = index;
          this.getCollisions();
        } else {
          this.queryFollow.page = index;
          this.getFollows();
        }
      },
      handleSizeChange(val) {
        if (this.activeItem === "collision") {
          this.queryCollision.size = val;
          this.getCollisions();
        } else {
          this.queryFollow.size = val;
          this.getFollows();
        }
      },
      //碰撞任务
      getCollisions() {
        if (!!this.date1) {
          this.queryCollision.startTime = this.date1[0] / 1000;
          this.queryCollision.endTime = this.date1[1] / 1000;
        } else {
          delete this.queryCollision['startTime'];
          delete this.queryCollision['endTime'];
        }
        this.queryCollision.caseId = this.caseId;

        this.listLoading1 = true;
        this.$post('/collision/query', this.queryCollision).then((data) => {
          this.collisions = data.data.list;
          this.count1 = data.data.count;
          this.listLoading1 = false;
        }).catch((err) => {
          this.collisions = [];
          this.count1 = 0;
          this.listLoading1 = false;
        });
      },
      //伴随任务
      getFollows() {
        if (!!this.qTime) {
          this.queryFollow.startTime = Math.round(this.qTime[0] / 1000);
          this.queryFollow.endTime = Math.round(this.qTime[1] / 1000);
        } else {
          delete this.queryFollow['endTime'];
          delete this.queryFollow['startTime'];
        }

        this.queryFollow.caseId = this.caseId;
        this.queryFollow.followType = "IMSI";

        this.listLoading2 = true;
        this.$post('/follow/query', this.queryFollow).then((data) => {
          this.follows = data.data.list;
          this.count2 = data.data.count;
          this.listLoading2 = false;
        }).catch((err) => {
          this.follows = [];
          this.count2 = 0;
          this.listLoading2 = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'collisionType') {
          return row.collisionType[0] ? row.collisionType[0] === 'IMSI' ? 'IMSI' : row.collisionType[0] === 'FACE' ? '图像' : row.collisionType[0] === 'MAC' ? '' : 'MAC' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'conditionType') {
          return row.conditionType == 0 ? '多条件碰撞' : row.conditionType == 1 ? '单条件碰撞' : '--';
        } else if (column.property === 'followCount') {
          return row.followCount === 0 ? 0 : row.followCount;
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      //获取案件详情
      getCaseDetail() {
        this.$post('/case/get/' + this.caseId, {}).then((data) => {
          this.caseDetail = data.data;
          this.caseDetail.address = getAreaLable(data.data.areaCode) + data.data.caseAddress;
          this.caseDetail.timeStr = formatDate(new Date(this.caseDetail.creatTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.caseDetail.fishStr = this.caseDetail.updateTime !== 0 ? formatDate(new Date(this.caseDetail.updateTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
          this.caseDetail.startStr = formatDate(new Date(this.caseDetail.caseTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.caseDetail.endStr = formatDate(new Date(this.caseDetail.caseToTime * 1000), 'yyyy-MM-dd hh:mm:ss');
        }).catch((err) => {
        });
      }
    },
    mounted() {
      this.caseId = this.$route.query.caseId || '';
      this.getCaseDetail();
      this.getCollisions();
    }
  }
</script>
