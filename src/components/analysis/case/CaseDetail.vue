<template>
  <div>
    <section class="content">
      <div class="add-appdiv gray-form" style="margin-bottom: 15px;padding: 0">
        <el-row style="border-bottom:1px #D7D7D7 solid;margin: 0">
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
            <el-col :span="9" align="left" style="text-align: left">
              <el-form-item label="案发地点" align="left" style="margin: 0;text-align: left">
                <div class="text-overflow-s" :title="caseDetail.address?caseDetail.address:'--'">
                  {{caseDetail.address?caseDetail.address:'--'}}
                </div>
              </el-form-item>
              <el-form-item label="案发时间" align="left" style="margin: 0;text-align: left">
                {{(caseDetail.startStr?caseDetail.startStr:'--') + " 至 " + (caseDetail.endStr?caseDetail.endStr:'--')}}
              </el-form-item>
              <el-form-item label="备注" align="left" style="margin: 0;text-align: left">
                <div class="text-overflow-s" :title="caseDetail.remark?caseDetail.remark:'--'">
                  {{caseDetail.remark?caseDetail.remark:'--'}}
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="7" align="left" style="text-align: left">
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
      <el-row style="margin-bottom: 10px">
        <el-col :span="24" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="交并任务" name="collision"></el-tab-pane>
            <el-tab-pane label="伴随任务" name="follow"></el-tab-pane>
            <el-tab-pane label="车码碰撞" name="car"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <relateCollision ref="collision" v-show="activeItem == 'collision'"></relateCollision>
      <relateFollow ref="follow" v-show="activeItem == 'follow'"></relateFollow>
      <relateCar ref="car" v-show="activeItem == 'car'"></relateCar>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator, getAreaLable} from "../../../assets/js/util";
  import relateCar from '../case/RelateCar.vue';
  import relateCollision from '../case/RelateCollision.vue';
  import relateFollow from '../case/RelateFollow.vue';

  export default {
    components: {relateCar, relateCollision, relateFollow},
    data() {
      return {
        caseId: this.$route.query.caseId || '',
        caseDetail: {},
        activeItem: "collision",
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val) {
        if (this.activeItem == "collision") {//交并任务
          this.$nextTick(() => {
            this.$refs.collision.clearData();
          });
        } else if (this.activeItem == "follow") {//伴随任务
          this.$nextTick(() => {
            this.$refs.follow.clearData();
          });
        } else {
          this.$nextTick(() => {
            this.$refs.car.clearData();
          });
        }
      },
      //删除案件
      deleteCase() {
        this.$confirm('确认要删除该案件吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/case/delete', [this.caseId], '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.$router.replace("/caseList");
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
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
      this.handleType();
    }
  }
</script>
