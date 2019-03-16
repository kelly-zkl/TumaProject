<template>
  <div>
    <section class="content">
      <el-row style="margin-bottom: 10px">
        <el-col :span="24" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="布控信息" name="TASK"></el-tab-pane>
            <el-tab-pane label="IMSI告警" name="IMSI">
              <imsiWarning ref="imsi"></imsiWarning>
            </el-tab-pane>
            <el-tab-pane label="图像告警" name="FACE">
              <faceWarning ref="face"></faceWarning>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content" v-show="activeItem == 'TASK'">
        <div class="add-appdiv" style="margin-bottom: 15px">
          <el-row>
            <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
              <p style="font-size: 14px;color: #999;margin: 0 20px">布控编号</p>
              <p style="font-size: 15px;margin: 5px 20px 0 20px">{{task.taskNo}}</p>
            </el-col>
            <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
              <p style="font-size: 14px;color: #999;margin: 0 20px">布控名称</p>
              <p style="font-size: 15px;margin: 5px 20px 0 20px">{{task.taskName}}</p>
            </el-col>
            <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
              <p style="font-size: 14px;color: #999;margin: 0 20px">有效期</p>
              <p style="font-size: 15px;margin: 5px 20px 0 20px">{{task.startStr + "~" + task.endStr}}</p>
            </el-col>
            <el-col :span="5" align="left" style="border-right: 1px #e5e5e5 solid">
              <p style="font-size: 14px;color: #999;margin: 0 20px">布控状态</p>
              <p style="font-size: 15px;margin: 5px 20px 0 20px">
                {{task.taskStatus == 'EXECUTION' ? '进行中' : task.taskStatus == 'FINISH' ? '已结束' : '异常'}}
              </p>
            </el-col>
            <el-col :span="4" align="right">
              <el-button type="text" @click="runTaskDetail = true">查看任务</el-button>
              <el-button type="text" @click="deleteTask()" v-show="getButtonVial('disposition:delete')">删除任务</el-button>
            </el-col>
          </el-row>
        </div>
        <div class="add-appdiv dialog" style="padding:10px 0 0 0;margin-bottom: 13px">
          <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D0CACF solid">任务信息
          </div>
          <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
            <el-row style="margin: 0;padding: 0">
              <el-col :span="8">
                <el-form-item label="布控对象" align="left" style="margin: 0;text-align: left">
                  <img :src="task.faceUrl?task.faceUrl:imgPath" :onerror="img404"
                       style="max-height: 110px;max-width: 110px;border-radius: 6px;border:1px #D0CACF solid;margin-top: 10px"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="add-appdiv dialog" style="padding:10px 0 0 0;margin-bottom: 13px">
          <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D0CACF solid">布控对象
          </div>
          <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
            <el-row style="margin: 0;padding: 0">
              <el-col :span="8">
                <el-form-item label="布控对象" align="left" style="margin: 0;text-align: left">
                  <img :src="task.faceUrl?task.faceUrl:imgPath" :onerror="img404"
                       style="max-height: 110px;max-width: 110px;border-radius: 6px;border:1px #D0CACF solid;margin-top: 10px"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="add-appdiv dialog" style="padding:10px 0 0 0;margin-bottom: 13px">
          <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D0CACF solid">布控场所
          </div>
          <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
            <el-row style="margin: 0;padding: 0">
              <el-col :span="8">
                <el-form-item label="布控对象" align="left" style="margin: 0;text-align: left">
                  <img :src="task.faceUrl?task.faceUrl:imgPath" :onerror="img404"
                       style="max-height: 110px;max-width: 110px;border-radius: 6px;border:1px #D0CACF solid;margin-top: 10px"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="add-appdiv dialog" style="padding:10px 0 0 0;margin-bottom: 13px">
          <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D0CACF solid">记录
          </div>
          <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
            <el-row style="margin: 0;padding: 0">
              <el-col :span="8">
                <el-form-item label="布控对象" align="left" style="margin: 0;text-align: left">
                  <img :src="task.faceUrl?task.faceUrl:imgPath" :onerror="img404"
                       style="max-height: 110px;max-width: 110px;border-radius: 6px;border:1px #D0CACF solid;margin-top: 10px"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </section>
    <!--布控详情-->
    <el-dialog title="布控详情" width="750px" :visible.sync="runTaskDetail">
      <div class="block gray-form">
        <el-form label-width="100px" :model="task" label-position="right">
          <el-form-item label="布控编号" align="left" style="margin: 0">{{task.taskNo}}</el-form-item>
          <el-form-item label="布控名称" align="left" style="margin: 0">{{task.taskName}}</el-form-item>
          <el-form-item label="布控人员" align="left" style="margin: 0" v-if="task.featureList || task.imsiList">
            <div class="img-main" v-if="task.featureList">
              <div class="img-item" v-for="item in task.featureList" :key="item.imageId">
                <img :src="item.imageUrl?item.imageUrl:imgPath" style="max-width: 100%;border-radius: 4px"
                     :onerror="img404"/>
              </div>
            </div>
            <el-row v-if="task.imsiList">
              <el-col :span="24">{{task.imsi}}</el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="布控名单" align="left" style="margin: 0" v-if="task.list">
            <el-row v-if="task.list">
              <el-col :span="24">{{task.list}}</el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="布控场所" align="left" style="margin: 0">
            <el-row v-if="task.placeName">
              <el-col :span="24">{{task.place}}</el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="关联案件" align="left" style="margin: 0">{{task.caseName}}</el-form-item>
          <el-form-item label="创建时间" align="left" style="margin: 0">{{task.timeStr}}</el-form-item>
          <el-form-item label="布控状态" align="left" style="margin: 0">
            {{task.taskStatus == 'EXECUTION' ? '进行中' : task.taskStatus == 'FINISH' ? '已结束' : '异常'}}
          </el-form-item>
          <el-form-item label="结束时间" align="left" style="margin: 0" v-show="task.taskStatus == 'FINISH'">
            {{task.updateStr}}
          </el-form-item>
          <el-form-item label="有效期" align="left" style="margin: 0">{{task.startStr + "~" + task.endStr}}</el-form-item>
          <el-form-item label="重复周期" align="left" style="margin: 0">
            {{task.cycleType == 'EVERYDAY' ? "每天" : task.week}}
          </el-form-item>
          <el-form-item label="每日时段" align="left" style="margin: 0">
            {{task.intervalType == 'ALLDAY' ? '全天' : task.startTimeInterval + "~" + task.endTimeInterval}}
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {formatDate, buttonValidator} from "../../../assets/js/util";
  import faceWarning from '../control/ControlFaceWarning';
  import imsiWarning from '../control/ControlIMSIWarning';

  export default {
    components: {
      faceWarning, imsiWarning
    },
    data() {
      return {
        task: {},
        runTaskDetail: false,
        taskId: this.$route.query.taskId || '',
        activeItem: "TASK",
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'"
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      handleType(val) {
        if (this.activeItem == 'TASK') {
          this.getTaskDetail();
        } else if (this.activeItem == 'IMSI') {
          this.$refs.imsi.getPlaces();
          this.$refs.imsi.clearData();
        } else {
          this.$refs.face.getPlaces();
          this.$refs.face.clearImgData();
        }
      },
      getTaskDetail() {
        this.$post('disposition/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.imsi = this.task.imsiList.join("，");
          this.task.place = this.task.placeName.join("，");
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.updateStr = formatDate(new Date(this.task.updateTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.startStr = formatDate(new Date(this.task.startTime * 1000), 'yyyy-MM-dd');
          this.task.endStr = formatDate(new Date(this.task.endTime * 1000), 'yyyy-MM-dd');
          if (this.task.cycleType === 'WEEKLY') {//每周
            this.task.week = this.getWeekStr(this.task.weekCycleDay);
          }
          if (this.task.blackClassList.length > 0) {
            var list = '';
            this.task.blackClassList.forEach((item) => {
              list += item.name + ',';
            });
            this.task.list = list.substring(0, list.length - 1);
          }
        }).catch((err) => {
        });
      },
      //转化重复周期
      getWeekStr(val) {
        let arr = [];
        for (let i = 0; i <= 6; i++) {
          if (val.charAt(i) == 1) {
            switch (i + 1) {
              case 1:
                arr.push("周一");
                break;
              case 2:
                arr.push("周二");
                break;
              case 3:
                arr.push("周三");
                break;
              case 4:
                arr.push("周四");
                break;
              case 5:
                arr.push("周五");
                break;
              case 6:
                arr.push("周六");
                break;
              case 7:
                arr.push("周日");
                break;
            }
          }
        }
        return arr.length > 0 ? arr.join("，") : '--';
      },
      //删除布控任务
      deleteTask() {
        this.$confirm('确认要删除该布控任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('disposition/delete', [this.taskId], '删除成功').then((data) => {
            if ("000000" === data.code) {
              if ("000000" === data.code)
                this.$router.go(-1);
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
    },
    mounted() {
      this.handleType();
    }
  }
</script>
<style scoped>
  .img-main {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .img-item {
    max-width: 100px;
    margin-right: 10px;
    /*margin-bottom: 10px;*/
    position: relative;
  }
</style>
