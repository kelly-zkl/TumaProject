<template>
  <div>
    <section class="content">
      <div class="add-appdiv">
        <el-row style="margin-bottom: 10px">
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin-right: 20px">案件名称</span>
            <span>{{caseDetail.caseName}}</span>
          </el-col>
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px">案发地点</span>
            <span>{{caseDetail.caseAddress}}</span>
          </el-col>
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px">创建时间</span>
            <span>{{caseDetail.timeStr}}</span>
          </el-col>
          <el-col :span="3">
            <el-button type="text" @click="deleteCase()" size="medium"
                       v-show="getButtonVial('case:delete')">删除案件
            </el-button>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 10px">
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin-right: 20px">案件编号</span>
            <span>{{caseDetail.caseNo}}</span>
          </el-col>
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px">案发时间</span>
            <span>{{caseDetail.startStr + " - " + caseDetail.endStr}}</span>
          </el-col>
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px;">案件状态</span>
            <span>{{caseDetail.status === "EXECUTION" ? "进行中" : caseDetail.status === "HANDLED" ? "已结案" : "--"}}</span>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin-right: 20px">案件类型</span>
            <span>{{caseDetail.caseType}}</span>
          </el-col>
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px">备注</span>
            <span>{{caseDetail.remark}}</span>
          </el-col>
          <el-col :span="7" align="left">
            <span style="font-size: 14px;color: #999;margin:auto 20px">
              {{caseDetail.status === "EXECUTION" ? "更新时间" : caseDetail.status === "HANDLED" ? "结案时间" : "--"}}
            </span>
            <span>{{caseDetail.fishStr}}</span>
          </el-col>
        </el-row>
      </div>
      <h5 style="border-left: 3px #6699FF solid;text-align: left;font-size: 16px;padding-left: 10px;color:#343434">
        已关联任务</h5>
      <el-row style="margin-bottom: 15px">
        <el-col :span="24" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="碰撞任务" name="collision"></el-tab-pane>
            <el-tab-pane label="伴随任务" name="follow"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'collision'">
        <el-row>
          <el-col :span="18" v-show="getButtonVial('collision:query')">
            <el-form :inline="true" :model="queryCollision" align="left">
              <el-form-item style="margin-bottom: 10px">
                <el-input v-model="queryCollision.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                          :maxlength=20></el-input>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="queryCollision.ctype" placeholder="任务类型" style="width: 120px"
                           size="medium" filterable clearable>
                  <el-option v-for="item in collisionTypes" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-date-picker v-model="date1" type="datetimerange" range-separator="至" size="medium"
                                :default-time="['00:00:00', '23:59:59']" clearable value-format="timestamp"
                                start-placeholder="开始日期" end-placeholder="结束日期"
                                style="width:360px" :picker-options="pickerBeginDate">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-select v-model="queryCollision.taskStatus" placeholder="全部状态" style="width: 120px"
                           size="medium" filterable clearable>
                  <el-option v-for="item in taskStatus" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button type="primary" size="medium" @click="getCollisions()">搜索</el-button>
              </el-form-item>
              <el-form-item style="margin-bottom: 10px">
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" size="medium" @click="cancelCollis()" :disabled="selsColl.length == 0"
                       v-show="getButtonVial('collision:cancelCase')">取消关联
            </el-button>
            <el-button type="primary" size="medium" @click="deleteCoTask()" :disabled="selsColl.length == 0"
                       v-show="getButtonVial('collision:delete')">删除任务
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="collisions" v-loading="listLoading1" class="center-block" stripe
                  @selection-change="selsCollision">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="任务名称" prop="taskName" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="任务类型" prop="collisionType" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="创建日期" prop="createTime" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="任务状态" prop="taskStatus" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" min-width="125" max-width="250">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoCoDetail(scope.row.id,scope.row.collisionType)"
                         v-show="getButtonVial('collision:get')">查看
              </el-button>
              <el-button type="text" @click="selsColl = [];selsColl.push(scope.row.id);deleteCoTask()"
                         v-show="getButtonVial('collision:delete')">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange"
                         :current-page="queryCollision.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="queryCollision.size" :total="count1" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <div class="content" v-show="activeItem == 'follow'">
        <el-row>
          <el-col :span="18" v-show="getButtonVial('follow:query')">
            <el-form :inline="true" :model="queryFollow" align="left">
              <el-form-item>
                <el-input v-model="queryFollow.taskName" placeholder="任务名称" size="medium" style="width: 160px"
                          :maxlength=20></el-input>
              </el-form-item>
              <el-date-picker v-model="qTime" type="datetimerange" range-separator="至"
                              start-placeholder="创建时间" size="medium" end-placeholder="结束日期" clearable
                              :default-time="['00:00:00', '23:59:59']" value-format="timestamp"
                              :picker-options="pickerBeginDate">
              </el-date-picker>
              <el-form-item>
                <el-select v-model="queryFollow.taskStatus" placeholder="任务状态" style="width: 120px"
                           size="medium" filterable clearable>
                  <el-option v-for="item in followTypes" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="medium" @click="getFollows()">搜索</el-button>
              </el-form-item>
              <el-form-item>
                <el-button size="medium" @click="clearData()">重置</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" size="medium" @click="cancelFollow()" :disabled="selsFoll.length == 0"
                       v-show="getButtonVial('follow:cancelCase')">取消关联
            </el-button>
            <el-button type="primary" size="medium" @click="deleteFoTask()" :disabled="selsFoll.length == 0"
                       v-show="getButtonVial('follow:delete')">删除任务
            </el-button>
          </el-col>
        </el-row>
        <el-table :data="follows" v-loading="listLoading2" class="center-block" stripe @selection-change="selsFollow">
          <el-table-column type="selection" width="45" align="left"></el-table-column>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="任务名称" prop="taskName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="任务类型" prop="followType" width="130"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="分析对象" prop="followTarget" width="170"
                           :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="任务状态" prop="taskStatus" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="分析结果" prop="followCount" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="关联案件" prop="caseName" min-width="150"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="160">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoFoDetail(scope.row)" v-show="getButtonVial('follow:get')">查看
              </el-button>
              <el-button type="text" @click="selsFoll = [];selsFoll.push(scope.row.id);deleteFoTask()"
                         v-show="getButtonVial('follow:delete')">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page="queryFollow.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="queryFollow.size" :total="count2" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";

  export default {
    data() {
      return {
        caseId: this.$route.query.caseId || '',
        caseDetail: {},
        activeItem: "collision",
        qTime: "",
        date1: "",
        collisions: [],
        queryCollision: {page: 1, size: 10},
        listLoading1: false,
        count1: 0,
        collisionTypes: [{value: 'IMSI', label: 'IMSI'}, {value: 'FACE', label: '图像'}],//,{value: 'MAC', label: 'MAC'}
        taskStatus: [{value: 'FINISH', label: '已完成'}, {value: 'FAILE', label: '任务失败'},
          {value: 'WAIT', label: '等待中'}, {value: 'EXECUTION', label: '分析中'}],
        follows: [],
        queryFollow: {page: 1, size: 10},
        listLoading2: false,
        count2: 0,
        followTypes: [{value: 'EXECUTION', label: '分析中'}, {value: 'FINISH', label: '已完成'},
          {value: 'WAIT', label: '等待中'}, {value: 'FAILE', label: '失败'}],
        selsFoll: [],
        selsColl: [],
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
      handleType(val) {
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
        sels.forEach((item) => {
          this.selsColl.push(item.id);
        });
      },
      //跳转任务详情
      gotoCoDetail(id, collisionType) {
        this.$router.push({path: '/taskDetail', query: {taskId: id, collisionType: collisionType[0]}});
      },
      //删除碰撞任务
      deleteCoTask() {
        this.$confirm('确认要删除碰撞任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/delete', this.selsColl, '删除成功').then((data) => {
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
        this.$confirm('确认要取消关联该碰撞任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/cancelCase/' + this.caseId, this.selsColl, '取消关联成功').then((data) => {
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
        sels.forEach((item) => {
          this.selsFoll.push(item.id);
        });
      },
      gotoFoDetail(task) {
        this.$router.push({path: '/followResult', query: {taskId: task.id, followType: task.followType}});
      },
      //删除伴随任务
      deleteFoTask() {
        this.$confirm('确认要删除该伴随任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/follow/delete', this.selsFoll, '删除成功').then((data) => {
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
        this.$confirm('确认要取消关联该伴随任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/follow/cancelCase/' + this.caseId, this.selsFoll, '取消关联成功').then((data) => {
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
          this.listLoading1 = false;
        });
      },
      //伴随任务
      getFollows() {
        if (!!this.qTime) {
          this.queryFollow.endTime = this.qTime[1] / 1000;
          this.queryFollow.startTime = this.qTime[0] / 1000;
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
          this.listLoading2 = false;
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'collisionType') {
          return row.collisionType[0] ? row.collisionType[0] === 'IMSI' ? 'IMSI' : row.collisionType[0] === 'FACE' ? '图像' : row.collisionType[0] === 'MAC' ? '' : 'MAC' : '--';
        } else if (column.property === 'createTime') {
          return row.createTime ? formatDate(new Date(row.createTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'taskStatus') {
          return row.taskStatus === 'EXECUTION' ? "分析中" : row.taskStatus === 'FINISH' ? '已完成' : row.taskStatus === 'WAIT' ? '等待中' : row.taskStatus === 'FAILE' ? '任务失败' : '异常';
        } else if (column.property === 'followType') {
          return row.followType === "IMSI" ? 'IMSI' : row.followType === "FACE" ? '图像' : row.followType === "MAC" ? 'MAC' : '--';
        } else if (column.property === 'status') {
          return row.status === 'UNHANDLED' ? '未处理' : row.status === 'EXECUTION' ? '进行中' : row.status === 'HANDLED' ? '已结案' : '--';
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
